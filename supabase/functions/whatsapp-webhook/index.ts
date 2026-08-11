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

    // Skip group messages and own messages
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
