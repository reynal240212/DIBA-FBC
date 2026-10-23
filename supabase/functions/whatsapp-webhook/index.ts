import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Env vars (set in Supabase Dashboard): ──
// OPENWA_URL = https://openwa-diba.onrender.com
// OPENWA_KEY = diba-fbc-2026
// ───────────────────────────────────────────

const OPENWA_URL = Deno.env.get("OPENWA_URL") ?? "https://openwa-diba.onrender.com";
const OPENWA_KEY = Deno.env.get("OPENWA_KEY") ?? "";

Deno.serve(async (req: Request) => {
  // OpenWA sends POST with webhook events
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event = await req.json();

    // ── Only process incoming messages ──
    const eventType = event.event || event.type;
    if (eventType !== "message.received" && eventType !== "message") {
      return new Response("ignored", { status: 200 });
    }

    const msgData = event.data || event.message || event;
    const from = msgData.from || msgData.chatId || "";
    const body = msgData.body || msgData.text || "";
    const msgId = msgData.id || msgData._id || "";

    // ── Auto-detect and insert match announcements from official group or admin ──
    await processMatchAnnouncement(supabase, body, from);

    // Skip group messages and own messages for 1-to-1 auto-replies
    if (from.includes("@g.us") || msgData.fromMe || msgData.isMe) {
      return new Response("skipped", { status: 200 });
    }

    // Extract phone number from chatId (e.g., "573001234567@c.us" -> "573001234567")
    const phone = from.replace("@c.us", "").replace("@s.whatsapp.net", "").replace(/\D/g, "");
    if (!phone || phone.length < 10) {
      return new Response("invalid phone", { status: 200 });
    }

    console.log(`[webhook] Incoming: ${phone} -> "${body}"`);

    // ── 1. Find or create contact ──
    let contact = await findContactByPhone(supabase, phone);

    if (!contact) {
      // Auto-create contact from incoming message
      const { data: newContact } = await supabase
        .from("whatsapp_contacts")
        .insert({
          phone,
          name: msgData.notifyName || msgData.pushName || `Contacto ${phone.slice(-4)}`,
          role: "tutor",
          active: true,
        })
        .select()
        .single();
      contact = newContact;
    }

    // ── 2. Find or create conversation ──
    let conversation = await findConversation(supabase, contact?.id, phone);

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("whatsapp_conversations")
        .insert({
          contact_id: contact?.id,
          phone,
          status: "active",
        })
        .select()
        .single();
      conversation = newConv;
    }

    // ── 3. Save inbound message ──
    const { data: savedMsg } = await supabase
      .from("whatsapp_messages")
      .insert({
        conversation_id: conversation?.id,
        contact_id: contact?.id,
        direction: "inbound",
        message_type: "text",
        body,
        status: "delivered",
        metadata: { openwa_msg_id: msgId, raw: msgData },
      })
      .select()
      .single();

    // Update conversation timestamp
    await supabase
      .from("whatsapp_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation?.id);

    // ── 4. Attendance detection ──
    await processAttendance(supabase, phone, body, contact?.id);

    // ── 5. Auto-reply engine ──
    await processAutoReply(supabase, phone, body, contact?.id);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[webhook] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ══════════════════════════════════════════════════════════════
//  AUTO MATCH PARSER (GRUPO DEPORTIVO INTERNACIONAL & ADMIN)
// ══════════════════════════════════════════════════════════════
async function processMatchAnnouncement(supabase: any, rawBody: string, from: string) {
  if (!rawBody) return;
  const isOfficialSource =
    from.includes("120363141323973958") ||
    from.includes("3128051695") ||
    from.includes("3246656083");
  if (!isOfficialSource) return;

  const body = rawBody.trim();
  const lower = body.toLowerCase();
  const hasPartido = lower.includes("partido") || lower.includes("vs ") || lower.includes("convocados");
  const hasDetails = lower.includes("cancha") || lower.includes("hora") || lower.includes("lugar");
  if (!hasPartido || !hasDetails || body.length < 45) return;
  if (lower.startsWith("recuerden hoy") || lower.startsWith("les recuerdo")) return;

  const MESES: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };

  let rival = "Por definir";
  const vsMatch = body.match(/\bvs\.?\s+([^\n\r]+)/i);
  if (vsMatch) {
    const rClean = vsMatch[1].split(/hora|cancha|categoria|\$/i)[0].trim().toUpperCase();
    if (rClean) rival = rClean;
  }

  let cat = "2012";
  const catMatch = body.match(/categor[ií]as?\s*:?[\s]*([0-9\/\-\s]+)/i) || body.match(/\b(201[0-9](?:\/[0-9]{2,4})?)\b/i);
  if (catMatch) {
    cat = catMatch[1].replace(/\s+/g, "");
    if (cat === "2012/13" || cat === "2013/12") cat = "2012/2013";
    if (cat === "2014/15" || cat === "2015/14") cat = "2014/2015";
    if (cat === "2015/16" || cat === "2016/15") cat = "2015/2016";
  }

  let hora = "09:00 AM";
  const horaMatch = body.match(/hora\s*(?:en la cancha)?\s*:?[\s]*([0-9]{1,2}\s*[:; ]\s*[0-9]{2}(?:\s*(?:am|pm|a\s*m|p\s*m))?)/i);
  if (horaMatch) {
    hora = horaMatch[1].trim().toUpperCase().replace(";", ":").replace("A M", "AM").replace("P M", "PM").replace(/(\d{1,2})\s+(\d{2})/, "$1:$2").replace(/\s+/g, " ");
    if (!/AM|PM/.test(hora)) {
      const h = parseInt(hora.split(":")[0], 10);
      hora += h >= 6 && h <= 11 ? " AM" : " PM";
    }
  }

  let cancha = "La Bombonera";
  const canchaMatch = body.match(/(?:cancha|lugar|en la cancha)\s*:?[\s]*([^\n\r]+)/i);
  if (canchaMatch) {
    const cVal = canchaMatch[1].trim().replace(/\.$/, "");
    if (cVal.length > 2 && !/hora|partido|sabado|sábado|domingo|casa del profe/i.test(cVal)) {
      cancha = cVal.charAt(0).toUpperCase() + cVal.slice(1);
    }
  }

  const now = new Date();
  const year = 2026;
  let fechaIso = `${year}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T12:00:00+00:00`;
  const dateMatch = body.match(/(\d{1,2})\s+de\s+([a-zA-Z]+)/i);
  if (dateMatch) {
    const dia = String(Math.min(31, Math.max(1, parseInt(dateMatch[1], 10)))).padStart(2, "0");
    const mes = String(MESES[dateMatch[2].toLowerCase()] || 10).padStart(2, "0");
    fechaIso = `${year}-${mes}-${dia}T12:00:00+00:00`;
  }

  const datePrefix = fechaIso.split("T")[0];
  const { data: existing } = await supabase
    .from("partidos")
    .select("id, fecha, hora, categoria")
    .gte("fecha", `${datePrefix}T00:00:00`)
    .lte("fecha", `${datePrefix}T23:59:59`);

  const isDup = (existing || []).some(
    (ex: any) =>
      String(ex.categoria || "").trim() === cat &&
      String(ex.hora || "").trim().toUpperCase() === hora.toUpperCase()
  );
  if (isDup) return;

  let torneo = "Torneo Local - WhatsApp";
  const tMatch = body.match(/Torneo\s+([^\n\r]+)/i);
  if (tMatch) torneo = "Torneo " + tMatch[1].trim();

  await supabase.from("partidos").insert([
    {
      equipolocal: "DIBA FBC",
      equipovisitante: rival,
      fecha: fechaIso,
      hora,
      categoria: cat,
      Cancha: cancha,
      descripcion: torneo,
      resultado: "Pendiente",
      valor: 6000,
      uniforme: lower.includes("antiguo") ? "Homenaje a Barranquilla (antiguo)" : "Nuevo de competencia",
      observaciones: body.slice(0, 500),
      metodo_pago: "NEQUI 3246656083 Reinaldo Pérez",
      escudo_local: "/images/ESCUDO.webp",
      escudo_visitante: `https://ui-avatars.com/api/?name=${encodeURIComponent(rival)}&background=004d98&color=FFD700&size=200`,
    },
  ]);
  console.log(`[webhook] Auto-inserted match: DIBA FBC vs ${rival} (${cat}) on ${datePrefix}`);
}

// ══════════════════════════════════════════════════════════════
//  ATTENDANCE DETECTION
//  If the contact has an open event (convocatoria/llamado) and
//  replies SI/NO/TAL_VEZ, record it automatically.
// ══════════════════════════════════════════════════════════════
async function processAttendance(
  supabase: any,
  phone: string,
  body: string,
  contactId: string | undefined
) {
  if (!contactId) return;

  const normalized = body.trim().toLowerCase().replace(/[.,!?;:¡¿]+$/, '').replace(/\s+/g, ' ');
  let response: "si" | "no" | "tal_vez" | null = null;

  // Match common Spanish affirmation/negation patterns (flexible)
  const siPatterns = /^(s[ií](\s*,?\s*(por\s*favor|gracias|claro|dale|ok|amén))?|asistir[é]?|voy(\s*,?\s*(claro|dale|ok))?|claro|dale|ok|todo\s*bien|affirmative|yes|sí señor|a\s*las\s*[\d]|confirmo|confirmado|presento|ahí\s*estoy|asisto|me\s*uno|count\s*with\s*me)$/i;
  const noPatterns = /^(no(\s*,?\s*(puedo|voy|asistir[é]?|asisto|gracias|señor))?|negative|no\s*gracias|no\s*puedo|no\s*voy|no\s+asisto|me\s*quito|excusado|falto|no\s*asistiré)$/i;
  const talVezPatterns = /^(tal\s*vez|quiz[aá]|ver[eé]|no\s*estoy\s*seguro|maybe|puede\s*ser|depende|veremos|todavía\s*no\s*se|posiblemente)$/i;

  if (siPatterns.test(normalized)) {
    response = "si";
  } else if (noPatterns.test(normalized)) {
    response = "no";
  } else if (talVezPatterns.test(normalized)) {
    response = "tal_vez";
  }

  if (!response) return;

  // Find the most recent open event for this contact's category
  const { data: contact } = await supabase
    .from("whatsapp_contacts")
    .select("category")
    .eq("id", contactId)
    .single();

  let eventQuery = supabase
    .from("whatsapp_events")
    .select("id")
    .eq("status", "sent")
    .in("event_type", ["convocatoria", "llamado"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (contact?.category) {
    eventQuery = eventQuery.or(`category_filter.is.null,category_filter.eq.${contact.category}`);
  }

  const { data: events } = await eventQuery;
  const event = events?.[0];
  if (!event) return;

  // Check if already responded
  const { data: existing } = await supabase
    .from("whatsapp_attendance_responses")
    .select("id")
    .eq("event_id", event.id)
    .eq("contact_id", contactId)
    .single();

  if (existing) {
    // Update existing response
    await supabase
      .from("whatsapp_attendance_responses")
      .update({ response, responded_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // Insert new response
    await supabase.from("whatsapp_attendance_responses").insert({
      event_id: event.id,
      contact_id: contactId,
      response,
    });
  }

  // Update event counters
  const { data: allResponses } = await supabase
    .from("whatsapp_attendance_responses")
    .select("response")
    .eq("event_id", event.id);

  const confirmed = allResponses?.filter((r: any) => r.response === "si").length || 0;
  const declined = allResponses?.filter((r: any) => r.response === "no").length || 0;

  await supabase
    .from("whatsapp_events")
    .update({ total_confirmed: confirmed, total_declined: declined })
    .eq("id", event.id);

  console.log(`[attendance] ${phone} -> ${response} for event ${event.id}`);
}

// ══════════════════════════════════════════════════════════════
//  AUTO-REPLY ENGINE
//  Match incoming message against whatsapp_auto_replies rules
//  and send a response via OpenWA.
// ══════════════════════════════════════════════════════════════
async function processAutoReply(
  supabase: any,
  phone: string,
  body: string,
  _contactId: string | undefined
) {
  const normalized = body.trim().toLowerCase();

  // Fetch active auto-replies ordered by priority (highest first)
  const { data: rules } = await supabase
    .from("whatsapp_auto_replies")
    .select("*")
    .eq("active", true)
    .order("priority", { ascending: false });

  if (!rules?.length) return;

  let matchedResponse: string | null = null;

  for (const rule of rules) {
    const keyword = rule.keyword.toLowerCase();
    let matched = false;

    switch (rule.match_type) {
      case "exact":
        matched = normalized === keyword;
        break;
      case "contains":
        matched = normalized.includes(keyword);
        break;
      case "starts_with":
        matched = normalized.startsWith(keyword);
        break;
      case "regex":
        try {
          matched = new RegExp(keyword, "i").test(normalized);
        } catch {
          matched = false;
        }
        break;
    }

    if (matched) {
      matchedResponse = rule.response;
      break; // Use highest priority match
    }
  }

  if (!matchedResponse) return;

  // Send auto-reply via OpenWA
  try {
    // Resolve session
    const sessResp = await fetch(`${OPENWA_URL}/api/sessions`, {
      headers: { "x-api-key": OPENWA_KEY },
    });
    if (!sessResp.ok) return;

    const sessions = await sessResp.json();
    const session = sessions.find((s: any) => s.status === "ready");
    if (!session) return;

    const chatId = phone.endsWith("@c.us") ? phone : phone + "@c.us";

    const sendResp = await fetch(
      `${OPENWA_URL}/api/sessions/${session.id}/messages/send-text`,
      {
        method: "POST",
        headers: {
          "x-api-key": OPENWA_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, text: matchedResponse }),
      }
    );

    // Log auto-reply
    await supabase.from("whatsapp_messages").insert({
      conversation_id: null,
      contact_id: _contactId || null,
      direction: "outbound",
      message_type: "text",
      body: matchedResponse,
      status: sendResp.ok ? "sent" : "failed",
      metadata: { auto_reply: true, triggered_by: body },
    });

    console.log(`[auto-reply] Sent to ${phone}: "${matchedResponse.substring(0, 50)}..."`);
  } catch (err: any) {
    console.error(`[auto-reply] Failed to send to ${phone}:`, err.message);
  }
}

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

async function findContactByPhone(supabase: any, phone: string) {
  const clean = phone.replace(/\D/g, "");
  const last10 = clean.slice(-10);

  // Try exact match first
  let { data } = await supabase
    .from("whatsapp_contacts")
    .select("id, name, category, player_id")
    .eq("phone", clean)
    .single();

  // If not found, try matching last 10 digits (handles country code differences)
  if (!data) {
    const { data: all } = await supabase
      .from("whatsapp_contacts")
      .select("id, name, category, player_id, phone");
    data = (all || []).find((c: any) => {
      const cClean = (c.phone || "").replace(/\D/g, "");
      return cClean === clean || cClean.slice(-10) === last10;
    }) || null;
  }

  return data;
}

async function findConversation(supabase: any, contactId: string | undefined, phone: string) {
  if (!contactId) {
    const { data } = await supabase
      .from("whatsapp_conversations")
      .select("id")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data;
  }
  const { data } = await supabase
    .from("whatsapp_conversations")
    .select("id")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}
