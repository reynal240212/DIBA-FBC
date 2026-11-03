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

    // ── Auto-detect and insert training announcements from official group or admin ──
    await processTrainingAnnouncement(supabase, body, from);

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
    await supabase
      .from("whatsapp_messages")
      .insert({
        conversation_id: conversation?.id,
        contact_id: contact?.id,
        direction: "inbound",
        message_type: "text",
        body,
        status: "delivered",
        metadata: { openwa_msg_id: msgId, raw: msgData },
      });

    // Update conversation timestamp
    await supabase
      .from("whatsapp_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation?.id);

    // ── 4. Attendance detection ──
    const attendanceHandled = await processAttendance(supabase, phone, body, contact?.id);

    // ── 5. Auto-reply engine (if not an attendance response) ──
    if (!attendanceHandled) {
      await processAutoReply(supabase, phone, body, contact?.id);
    }

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
//  HELPER: SEND WHATSAPP MESSAGE VIA OPENWA
// ══════════════════════════════════════════════════════════════
async function sendWhatsAppText(phone: string, text: string): Promise<boolean> {
  try {
    const sessResp = await fetch(`${OPENWA_URL}/api/sessions`, {
      headers: { "x-api-key": OPENWA_KEY },
    });
    if (!sessResp.ok) return false;

    const sessions = await sessResp.json();
    const session = Array.isArray(sessions) ? sessions.find((s: any) => s.status === "ready") : null;
    if (!session) return false;

    const chatId = phone.endsWith("@c.us") ? phone : phone + "@c.us";
    const sendResp = await fetch(
      `${OPENWA_URL}/api/sessions/${session.id}/messages/send-text`,
      {
        method: "POST",
        headers: {
          "x-api-key": OPENWA_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, text }),
      }
    );
    return sendResp.ok;
  } catch (err: any) {
    console.error(`[sendWhatsAppText] Error sending to ${phone}:`, err.message);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
//  HELPER: NORMALIZE TEXT (ACCENTS, PUNCTUATION, LOWERCASE)
// ══════════════════════════════════════════════════════════════
function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:¡¿"'\(\)\-_#*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
  const hasPartido = lower.includes("partido") || lower.includes("vs ") || lower.includes("vs.") || lower.includes("convocados");
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
  const horaMatch = body.match(/hora\s*(?:en la cancha)?\s*:?[\s]*([0-9]{1,2}\s*[:; ]\s*[0-9]{2}(?:\s*(?:am|pm|a\s*m|p\s*m))?)/i) ||
                    body.match(/\b([0-9]{1,2}:[0-9]{2}\s*(?:am|pm)?)\b/i);
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
    const mes = String(MESES[dateMatch[2].toLowerCase()] || (now.getUTCMonth() + 1)).padStart(2, "0");
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
      observaciones: body.slice(0, 2000),
      metodo_pago: "NEQUI 3246656083 Reinaldo Pérez",
      escudo_local: "/images/ESCUDO.webp",
      escudo_visitante: `https://ui-avatars.com/api/?name=${encodeURIComponent(rival)}&background=004d98&color=FFD700&size=200`,
    },
  ]);
  console.log(`[webhook] Auto-inserted match: DIBA FBC vs ${rival} (${cat}) on ${datePrefix}`);
}

// ══════════════════════════════════════════════════════════════
//  AUTO TRAINING PARSER (GRUPO OFICIAL & ADMIN)
// ══════════════════════════════════════════════════════════════
async function processTrainingAnnouncement(supabase: any, rawBody: string, from: string) {
  if (!rawBody) return;
  const isOfficialSource =
    from.includes("120363141323973958") ||
    from.includes("3128051695") ||
    from.includes("3246656083");
  if (!isOfficialSource) return;

  const body = rawBody.trim();
  const lower = body.toLowerCase();

  // Debe ser un anuncio de entrenamiento o práctica
  const hasTraining =
    lower.includes("entrenamiento") ||
    lower.includes("entrenos") ||
    lower.includes("entreno") ||
    lower.includes("practica") ||
    lower.includes("práctica") ||
    lower.includes("entrenar");

  // Si tiene 'vs ' o 'vs.' con rival, es un partido, no un entreno
  const isMatch = lower.includes("vs ") || lower.includes("vs.") || (lower.includes("partido") && lower.includes("torneo"));
  if (!hasTraining || isMatch || body.length < 30) return;

  const hasDetails =
    lower.includes("cancha") ||
    lower.includes("hora") ||
    lower.includes("lugar") ||
    lower.includes("pradera") ||
    lower.includes("parque") ||
    /\b\d{1,2}:\d{2}\b/.test(lower) ||
    /\b(pm|am)\b/.test(lower);
  if (!hasDetails) return;

  const MESES: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };

  // 1. Extraer Hora
  let hora = "04:30 PM";
  const horaMatch = body.match(/hora\s*(?:en la cancha)?\s*:?[\s]*([0-9]{1,2}\s*[:; ]\s*[0-9]{2}(?:\s*(?:am|pm|a\s*m|p\s*m))?)/i) ||
                    body.match(/\b([0-9]{1,2}:[0-9]{2}\s*(?:am|pm)?)\b/i);
  if (horaMatch) {
    hora = horaMatch[1].trim().toUpperCase().replace(";", ":").replace("A M", "AM").replace("P M", "PM").replace(/(\d{1,2})\s+(\d{2})/, "$1:$2").replace(/\s+/g, " ");
    if (!/AM|PM/.test(hora)) {
      const h = parseInt(hora.split(":")[0], 10);
      hora += h >= 6 && h <= 11 ? " AM" : " PM";
    }
  }

  // 2. Extraer Lugar / Cancha
  let lugar = "Parque La Pradera";
  const lugarMatch = body.match(/(?:cancha|lugar|en la cancha|sede)\s*:?[\s]*([^\n\r]+)/i);
  if (lugarMatch) {
    let lVal = lugarMatch[1].trim().replace(/\.$/, "");
    lVal = lVal.split(/\b(?:a\s+las|hora|de|desde|puntualidad|traer|con)\b/i)[0].trim();
    if (lVal.length > 2 && !/hora|sabado|sábado|domingo|hoy|mañana/i.test(lVal)) {
      lugar = lVal.charAt(0).toUpperCase() + lVal.slice(1);
    }
  }
  if (/pradera/i.test(lugar)) {
    lugar = "Parque La Pradera";
  }

  // 3. Extraer Fecha
  const now = new Date();
  const year = 2026;
  let fechaIso = `${year}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T17:00:00+00:00`;
  const dateMatch = body.match(/(\d{1,2})\s+de\s+([a-zA-Z]+)/i);
  if (dateMatch) {
    const dia = String(Math.min(31, Math.max(1, parseInt(dateMatch[1], 10)))).padStart(2, "0");
    const mes = String(MESES[dateMatch[2].toLowerCase()] || (now.getUTCMonth() + 1)).padStart(2, "0");
    fechaIso = `${year}-${mes}-${dia}T17:00:00+00:00`;
  }

  // 4. Extraer Categorías si las menciona con dígitos
  let catText = "";
  const catMatch = body.match(/categor[ií]as?\s*:?[\s]*([0-9\/\-\s]+)/i) || body.match(/\b(201[0-9](?:\/[0-9]{2,4})?)\b/i);
  if (catMatch) {
    const valCat = catMatch[1].trim();
    if (/\d/.test(valCat)) {
      catText = ` - Cat. ${valCat}`;
    }
  }
  const titulo = `Entrenamiento DIBA FBC${catText}`;

  // 5. Evitar duplicados (mismo día y misma hora)
  const datePrefix = fechaIso.split("T")[0];
  const { data: existing } = await supabase
    .from("entrenamientos")
    .select("id, fecha, hora")
    .gte("fecha", `${datePrefix}T00:00:00`)
    .lte("fecha", `${datePrefix}T23:59:59`);

  const isDup = (existing || []).some(
    (ex: any) => String(ex.hora || "").trim().toUpperCase() === hora.toUpperCase()
  );
  if (isDup) return;

  await supabase.from("entrenamientos").insert([
    {
      titulo,
      descripcion: body.slice(0, 500),
      fecha: fechaIso,
      hora,
      lugar,
      observaciones: body.slice(0, 2000),
    },
  ]);
  console.log(`[webhook] Auto-inserted training: ${titulo} on ${datePrefix} at ${hora}`);
}

// ══════════════════════════════════════════════════════════════
//  ATTENDANCE DETECTION
//  If the contact has an open event (convocatoria/llamado) and
//  replies SI/NO/TAL_VEZ, record it automatically and send confirmation.
// ══════════════════════════════════════════════════════════════
async function processAttendance(
  supabase: any,
  phone: string,
  body: string,
  contactId: string | undefined
): Promise<boolean> {
  if (!contactId) return false;

  const normalized = normalizeText(body);
  let response: "si" | "no" | "tal_vez" | null = null;

  const siPatterns = /^(si|asistire|voy|claro|dale|ok|amigo|afirmativo|yes|si senor|confirmo|confirmado|presento|ahi estoy|asisto|me uno|asistencia)$/i;
  const noPatterns = /^(no|no puedo|no voy|no asistire|no asisto|me quito|excusado|falto|negativo|imposible)$/i;
  const talVezPatterns = /^(tal vez|quiza|quizas|vere|no estoy seguro|maybe|puede ser|depende|veremos|todavia no se|posiblemente)$/i;

  if (siPatterns.test(normalized)) {
    response = "si";
  } else if (noPatterns.test(normalized)) {
    response = "no";
  } else if (talVezPatterns.test(normalized)) {
    response = "tal_vez";
  }

  if (!response) return false;

  // Find the most recent open event
  const { data: contact } = await supabase
    .from("whatsapp_contacts")
    .select("category")
    .eq("id", contactId)
    .single();

  let eventQuery = supabase
    .from("whatsapp_events")
    .select("id, title")
    .eq("status", "sent")
    .in("event_type", ["convocatoria", "llamado"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (contact?.category) {
    eventQuery = eventQuery.or(`category_filter.is.null,category_filter.eq.${contact.category}`);
  }

  const { data: events } = await eventQuery;
  const event = events?.[0];
  if (!event) return false;

  // Check if already responded
  const { data: existing } = await supabase
    .from("whatsapp_attendance_responses")
    .select("id")
    .eq("event_id", event.id)
    .eq("contact_id", contactId)
    .single();

  if (existing) {
    await supabase
      .from("whatsapp_attendance_responses")
      .update({ response, responded_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
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

  // Send polite confirmation message to parent
  if (response === "si") {
    await sendWhatsAppText(phone, "✅ *¡Asistencia confirmada!* Tu respuesta ha sido guardada en el sistema de *DIBA FBC*. ¡Nos vemos en la cancha con toda la energía! ⚽💙💛");
  } else if (response === "no") {
    await sendWhatsAppText(phone, "📝 *Excusa registrada.* Hemos anotado tu novedad en el sistema de *DIBA FBC*. Gracias por avisar oportunamente al cuerpo técnico. ¡Esperamos verte pronto! ⚽");
  } else {
    await sendWhatsAppText(phone, "⏳ *Respuesta registrada.* Quedamos atentos a tu confirmación final antes del cierre de la convocatoria. ¡DIBA FBC! ⚽");
  }

  return true;
}

// ══════════════════════════════════════════════════════════════
//  INTELLIGENT AUTO-REPLY ENGINE (DIBA FBC EXPERT ASSISTANT)
// ══════════════════════════════════════════════════════════════
async function processAutoReply(
  supabase: any,
  phone: string,
  rawBody: string,
  _contactId: string | undefined
) {
  const normalized = normalizeText(rawBody);
  if (!normalized) return;

  // 1. Check custom rules in Supabase first (if configured in Admin panel)
  let matchedResponse: string | null = null;
  try {
    const { data: rules } = await supabase
      .from("whatsapp_auto_replies")
      .select("*")
      .eq("active", true)
      .order("priority", { ascending: false });

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        const kw = normalizeText(rule.keyword);
        let matched = false;

        switch (rule.match_type) {
          case "exact":
            matched = normalized === kw;
            break;
          case "contains":
            matched = normalized.includes(kw);
            break;
          case "starts_with":
            matched = normalized.startsWith(kw);
            break;
          case "regex":
            try {
              matched = new RegExp(kw, "i").test(normalized);
            } catch {
              matched = false;
            }
            break;
        }

        if (matched) {
          matchedResponse = rule.response;
          break;
        }
      }
    }
  } catch (err: any) {
    console.warn("[auto-reply] Error fetching DB rules, falling back to smart KB:", err.message);
  }

  // 2. If no custom DB rule matched, use DIBA FBC built-in Smart Knowledge Base
  if (!matchedResponse) {
    matchedResponse = getSmartDibaResponse(normalized);
  }

  if (!matchedResponse) return;

  // 3. Send response via OpenWA
  const sent = await sendWhatsAppText(phone, matchedResponse);

  // 4. Log outbound auto-reply in DB
  try {
    await supabase.from("whatsapp_messages").insert({
      conversation_id: null,
      contact_id: _contactId || null,
      direction: "outbound",
      message_type: "text",
      body: matchedResponse,
      status: sent ? "sent" : "failed",
      metadata: { auto_reply: true, triggered_by: rawBody },
    });
    console.log(`[auto-reply] Sent to ${phone}: "${matchedResponse.substring(0, 50)}..."`);
  } catch (err: any) {
    console.error("[auto-reply] Failed to log in DB:", err.message);
  }
}

// ══════════════════════════════════════════════════════════════
//  SMART DIBA FBC RESPONSES
// ══════════════════════════════════════════════════════════════
function getSmartDibaResponse(text: string): string | null {
  // Option 1 or ENTRENAMIENTOS / HORARIOS / PRÁCTICA
  if (
    text === "1" ||
    text.includes("entrenamiento") ||
    text.includes("entrenamientos") ||
    text.includes("entreno") ||
    text.includes("entrenos") ||
    text.includes("entrenar") ||
    text.includes("horario") ||
    text.includes("horarios") ||
    text.includes("practica") ||
    text.includes("practicas") ||
    text.includes("a que hora") ||
    text.includes("cuando entrenan")
  ) {
    return (
      "⚽ *HORARIOS DE ENTRENAMIENTO — DIBA FBC* 🏃‍♂️\n\n" +
      "📅 *Lunes, Miércoles y Viernes:*\n" +
      "• *Categorías 2014 / 2015 / 2016:* 4:00 PM a 5:30 PM\n" +
      "• *Categorías 2012 / 2013:* 5:30 PM a 7:00 PM\n\n" +
      "📍 *Sede Oficial:* Cancha Parque La Pradera, Barranquilla.\n" +
      "👟 *Indumentaria:* Uniforme oficial o camiseta de entreno, guayos y canilleras.\n" +
      "💧 *Requisito:* Hidratación personal obligatoria y llegar 10 minutos antes.\n\n" +
      "🌐 Puedes consultar la programación semanal en vivo en nuestra web:\n" +
      "https://diba-fbc.vercel.app/partidos.html?tab=entrenamientos"
    );
  }

  // Option 2 or PARTIDOS / CONVOCATORIAS / JUEGOS
  if (
    text === "2" ||
    text.includes("partido") ||
    text.includes("partidos") ||
    text.includes("juego") ||
    text.includes("juegos") ||
    text.includes("cuando jugamos") ||
    text.includes("proximo partido") ||
    text.includes("proximos partidos") ||
    text.includes("rival") ||
    text.includes("convocatoria") ||
    text.includes("convocados") ||
    text.includes("torneo") ||
    text.includes("programacion")
  ) {
    return (
      "🏆 *CALENDARIO Y PARTIDOS — DIBA FBC* ⚽\n\n" +
      "Los partidos oficiales del fin de semana, rivales, canchas y resultados se actualizan en vivo en nuestro portal web:\n\n" +
      "👉 *Consulta los partidos aquí:*\n" +
      "https://diba-fbc.vercel.app/partidos.html\n\n" +
      "📱 *Convocatorias:* Se notifican individualmente por esta línea con la hora de citación y uniforme correspondiente. ¡Responde SI o NO para confirmar tu cupo!"
    );
  }

  // Option 3 or INSCRIPCIONES / REQUISITOS / COSTOS
  if (
    text === "3" ||
    text.includes("inscripcion") ||
    text.includes("inscripciones") ||
    text.includes("inscribir") ||
    text.includes("matricula") ||
    text.includes("requisitos") ||
    text.includes("cuanto cuesta") ||
    text.includes("costo") ||
    text.includes("costos") ||
    text.includes("precio") ||
    text.includes("precios") ||
    text.includes("mensualidad") ||
    text.includes("cuota")
  ) {
    return (
      "📝 *INSCRIPCIONES DIBA FBC* 🌟\n\n" +
      "¡Forma parte de nuestra academia formativa! Contamos con cupos disponibles para niños y jóvenes de 5 a 15 años.\n\n" +
      "📋 *Requisitos de ingreso:*\n" +
      "1. Documento de identidad del deportista (TI / Registro Civil) y del acudiente.\n" +
      "2. Certificado de EPS o Sisbén vigente.\n" +
      "3. Foto 3x4 fondo blanco para el carnet del club.\n" +
      "4. Asistir a una clase de prueba y diagnóstico de cortesía.\n\n" +
      "📲 Para coordinar la prueba de cortesía y conocer valores de matrícula:\n" +
      "👉 DT Reinaldo Pérez: *+57 324 665 6083* / *312 805 1695*"
    );
  }

  // Option 4 or SEDE / UBICACIÓN / CANCHA / MAPA
  if (
    text === "4" ||
    text.includes("sede") ||
    text.includes("sedes") ||
    text.includes("ubicacion") ||
    text.includes("cancha") ||
    text.includes("donde estan") ||
    text.includes("donde queda") ||
    text.includes("donde entrenan") ||
    text.includes("direccion") ||
    text.includes("mapa") ||
    text.includes("como llegar")
  ) {
    return (
      "📍 *SEDE OFICIAL DE ENTRENAMIENTOS — DIBA FBC*\n\n" +
      "🏟️ *Parque La Pradera*\n" +
      "Ciudad: Barranquilla, Atlántico.\n\n" +
      "🗺️ Explora el mapa interactivo y cómo llegar aquí:\n" +
      "https://diba-fbc.vercel.app/partidos.html?tab=mapa\n\n" +
      "¡Te esperamos en el terreno de juego! 💙💛"
    );
  }

  // Option 5 or CATEGORÍAS / EDADES
  if (
    text === "5" ||
    text.includes("categoria") ||
    text.includes("categorias") ||
    text.includes("edades") ||
    text.includes("edad") ||
    text.includes("que categorias") ||
    text.includes("ano de nacimiento")
  ) {
    return (
      "⚽ *CATEGORÍAS DE FORMACIÓN — DIBA FBC*\n\n" +
      "• *Semillero / Iniciación:* Años 2017 a 2019 (Fundamentos técnicos y motricidad)\n" +
      "• *Categoría 2015 / 2016:* Fútbol 8 y festivales formativos\n" +
      "• *Categoría 2014 / 2015:* Perfeccionamiento táctico y torneos locales\n" +
      "• *Categoría 2012 / 2013:* Fútbol 11 competitivo y alto rendimiento\n\n" +
      "¿En qué año nació el deportista? Escríbenos para asignarte el grupo correspondiente."
    );
  }

  // UNIFORMES
  if (
    text.includes("uniforme") ||
    text.includes("uniformes") ||
    text.includes("indumentaria") ||
    text.includes("camiseta") ||
    text.includes("ropa")
  ) {
    return (
      "👕 *INDUMENTARIA OFICIAL DIBA FBC*\n\n" +
      "• *Uniforme de Competencia:* Azul y Dorado (Oficial 2026)\n" +
      "• *Uniforme Alterno:* Edición Costa Azul / Homenaje a Barranquilla\n" +
      "• Obligatorio uso de canilleras y medias oficiales para entrenamientos y partidos.\n\n" +
      "Para solicitar tallas o uniformes, contacta a la coordinación del club."
    );
  }

  // SALUDOS / MENÚ
  if (
    text === "hola" ||
    text.startsWith("hola") ||
    text.includes("buenos dias") ||
    text.includes("buenas tardes") ||
    text.includes("buenas noches") ||
    text === "buenas" ||
    text === "menu" ||
    text === "ayuda" ||
    text === "info" ||
    text === "informacion"
  ) {
    return (
      "👋 ¡Hola! Bienvenido a la línea oficial de *DIBA FBC* ⚽💙💛\n\n" +
      "¿En qué te podemos colaborar hoy? Escribe el *número* o la palabra de tu consulta:\n\n" +
      "1️⃣ *Entrenamientos* — Días, horarios y sede de prácticas.\n" +
      "2️⃣ *Partidos* — Próximos encuentros y programación.\n" +
      "3️⃣ *Inscripciones* — Requisitos y clase de prueba.\n" +
      "4️⃣ *Sede* — Ubicación del Parque La Pradera y mapa.\n" +
      "5️⃣ *Categorías* — Edades y grupos formativos.\n\n" +
      "O escribe tu consulta y el DT te responderá a la brevedad posible. ⚽"
    );
  }

  // AGRADECIMIENTO
  if (
    text.includes("gracias") ||
    text === "vale" ||
    text === "listo" ||
    text === "perfecto" ||
    text === "entendido"
  ) {
    return (
      "¡Con el mayor gusto! 💙💛 En *DIBA FBC* formamos deportistas íntegros con pasión y disciplina. ¡Siempre a la orden! ⚽"
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════════
//  HELPERS: CONTACT & CONVERSATION LOOKUP
// ══════════════════════════════════════════════════════════════
async function findContactByPhone(supabase: any, phone: string) {
  const clean = phone.replace(/\D/g, "");
  const last10 = clean.slice(-10);

  let { data } = await supabase
    .from("whatsapp_contacts")
    .select("id, name, category, player_id")
    .eq("phone", clean)
    .single();

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
