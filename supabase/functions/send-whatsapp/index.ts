import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Env vars required (set in Supabase Dashboard > Edge Functions > Secrets): ──
// OPENWA_URL   = https://openwa-diba.onrender.com
// OPENWA_KEY   = diba-fbc-2026
// ────────────────────────────────────────────────────────────────────────────────

const OPENWA_URL = Deno.env.get("OPENWA_URL") ?? "https://openwa-diba.onrender.com";
const OPENWA_KEY = Deno.env.get("OPENWA_KEY") ?? "";
const SESSION_NAME = "diba-fbc";
const FETCH_TIMEOUT = 30000; // 30s timeout for OpenWA calls

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

async function openwaFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const resp = await fetch(`${OPENWA_URL}${path}`, {
      ...options,
      headers: {
        "x-api-key": OPENWA_KEY,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    return resp;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // ── Auth ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const body = await req.json();
    const { action, phone, message, contacts, session_name } = body;
    const sessionId = session_name || SESSION_NAME;

    // ── Resolve OpenWA session ──
    let resolvedSessionId: string | null = null;
    let sessionStatus: string | null = null;
    try {
      const sessResp = await openwaFetch("/api/sessions");
      if (sessResp.ok) {
        const sessions = await sessResp.json();
        // Find by name first, then by ready status
        let found = sessions.find((s: any) => s.name === sessionId);
        if (!found) found = sessions.find((s: any) => s.status === "ready");
        if (!found) found = sessions.find((s: any) => s.status === "connected");
        if (found) {
          resolvedSessionId = found.id;
          sessionStatus = found.status;
        }
      }
    } catch (e: any) {
      console.error("OpenWA session resolve error:", e.message);
    }

    if (!resolvedSessionId) {
      // qr and status actions can work without an existing session
      if (action !== "qr" && action !== "status") {
        return new Response(
          JSON.stringify({ error: "No hay sesión de WhatsApp conectada. Escanea el QR primero." }),
          { status: 503, headers: CORS_HEADERS }
        );
      }
    }

    // ── Debug: raw OpenWA response ──
    if (action === "debug") {
      try {
        const sessResp = await openwaFetch("/api/sessions");
        const text = await sessResp.text();
        return new Response(
          JSON.stringify({
            status: sessResp.status,
            body: text.slice(0, 2000),
            resolvedSessionId,
            sessionStatus,
            OPENWA_URL,
            hasKey: !!OPENWA_KEY,
          }),
          { headers: CORS_HEADERS }
        );
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: e.message, OPENWA_URL, hasKey: !!OPENWA_KEY }),
          { status: 500, headers: CORS_HEADERS }
        );
      }
    }

    // ── Actions ──
    switch (action) {
      // ──────────────────────────── SINGLE SEND ────────────────────────────
      case "send": {
        if (!phone || !message) {
          return new Response(
            JSON.stringify({ error: "phone and message required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }
        if (!resolvedSessionId) {
          return new Response(
            JSON.stringify({ error: "No hay sesión conectada" }),
            { status: 503, headers: CORS_HEADERS }
          );
        }
        const chatId = normalizeChatId(phone);
        const sendResp = await openwaFetch(
          `/api/sessions/${resolvedSessionId}/messages/send-text`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId, text: message }),
          }
        );
        const sendResult = await sendResp.json().catch(() => ({}));

        // Log outbound message
        const contact = await findContactByPhone(supabase, phone);
        await supabase.from("whatsapp_messages").insert({
          contact_id: contact?.id ?? null,
          direction: "outbound",
          message_type: "text",
          body: message,
          status: sendResp.ok ? "sent" : "failed",
          metadata: { openwa_response: sendResult },
        });

        return new Response(
          JSON.stringify({ ok: sendResp.ok, result: sendResult }),
          { headers: CORS_HEADERS }
        );
      }

      // ──────────────────────── BULK SEND (convocatoria/llamado) ──────────
      case "bulk_send": {
        if (!contacts?.length || !message) {
          return new Response(
            JSON.stringify({ error: "contacts array and message required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        const results = [];
        const DELAY_MS = 1500; // rate limit: ~1 msg per 1.5s

        for (const c of contacts) {
          const phoneNum = c.phone;
          if (!phoneNum) continue;

          const chatId = normalizeChatId(phoneNum);
          try {
            const sendResp = await openwaFetch(
              `/api/sessions/${resolvedSessionId}/messages/send-text`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId, text: message }),
              }
            );
            const sendResult = await sendResp.json().catch(() => ({}));

            results.push({ phone: phoneNum, ok: sendResp.ok, result: sendResult });

            // Log
            await supabase.from("whatsapp_messages").insert({
              contact_id: c.id ?? null,
              direction: "outbound",
              message_type: "template",
              body: message,
              status: sendResp.ok ? "sent" : "failed",
              metadata: { openwa_response: sendResult },
            });
          } catch (err: any) {
            results.push({ phone: phoneNum, ok: false, error: err.message });
            await supabase.from("whatsapp_messages").insert({
              contact_id: c.id ?? null,
              direction: "outbound",
              message_type: "template",
              body: message,
              status: "failed",
              metadata: { error: err.message },
            });
          }

          // Rate limit delay
          if (contacts.indexOf(c) < contacts.length - 1) {
            await new Promise((r) => setTimeout(r, DELAY_MS));
          }
        }

        const successCount = results.filter((r) => r.ok).length;
        const failCount = results.filter((r) => !r.ok).length;

        return new Response(
          JSON.stringify({ ok: true, sent: successCount, failed: failCount, results }),
          { headers: CORS_HEADERS }
        );
      }

      // ──────────────────────── SESSION STATUS ────────────────────────────
      case "status": {
        try {
          const resp = await openwaFetch("/api/sessions");
          if (!resp.ok) throw new Error(`OpenWA status ${resp.status}`);
          const sessions = await resp.json();
          const session = sessions.find(
            (s: any) => s.name === sessionId || s.status === "ready" || s.status === "connected"
          );
          return new Response(
            JSON.stringify({
              connected: session?.status === "ready" || session?.status === "connected",
              session: session ?? null,
            }),
            { headers: CORS_HEADERS }
          );
        } catch (e: any) {
          return new Response(
            JSON.stringify({ connected: false, session: null, error: e.message }),
            { headers: CORS_HEADERS }
          );
        }
      }

      // ──────────────────────── QR CODE ───────────────────────────────────
      case "qr": {
        // Create or get session, then get QR
        let sessId = resolvedSessionId;

        // Try to create session if none exists
        if (!sessId) {
          try {
            const createResp = await openwaFetch("/api/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: sessionId }),
            });
            if (createResp.ok) {
              const created = await createResp.json();
              sessId = created.id;
            } else {
              // Session might already exist, try to find it
              const listResp = await openwaFetch("/api/sessions");
              if (listResp.ok) {
                const sessions = await listResp.json();
                const existing = sessions.find((s: any) => s.name === sessionId);
                if (existing) sessId = existing.id;
              }
            }
          } catch {
            return new Response(
              JSON.stringify({ error: "No se pudo crear sesión en OpenWA" }),
              { status: 503, headers: CORS_HEADERS }
            );
          }
        }

        if (!sessId) {
          return new Response(
            JSON.stringify({ error: "No hay sesión disponible" }),
            { status: 503, headers: CORS_HEADERS }
          );
        }

        // Check if session is already ready
        try {
          const checkResp = await openwaFetch(`/api/sessions/${sessId}`);
          if (checkResp.ok) {
            const sessData = await checkResp.json();
            if (sessData?.status === "ready" || sessData?.status === "open") {
              return new Response(
                JSON.stringify({ connected: true, session_id: sessId }),
                { headers: CORS_HEADERS }
              );
            }
          }
        } catch { /* continue to start */ }

        // Start session to trigger QR generation (fire and forget)
        try {
          await openwaFetch(`/api/sessions/${sessId}/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
        } catch { /* OpenWA might return error but still process */ }

        // Poll for QR (up to 90 seconds — Render cold start can be slow)
        for (let i = 0; i < 45; i++) {
          try {
            const qrResp = await openwaFetch(`/api/sessions/${sessId}/qr`);
            if (qrResp.ok) {
              const qrData = await qrResp.json();
              // OpenWA can return QR in different fields
              const qrCode = qrData?.qr || qrData?.qrCode || qrData?.data || null;
              const status = qrData?.status;

              if (qrCode) {
                return new Response(
                  JSON.stringify({ qr: qrCode, session_id: sessId }),
                  { headers: CORS_HEADERS }
                );
              }
              // If already connected, return that
              if (status === "authenticated" || status === "connected" || status === "ready") {
                return new Response(
                  JSON.stringify({ connected: true, session_id: sessId }),
                  { headers: CORS_HEADERS }
                );
              }
            }
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 2000));
        }

        return new Response(
          JSON.stringify({ error: "Timeout esperando QR (90s)" }),
          { status: 504, headers: CORS_HEADERS }
        );
      }

      // ──────────────────────── GROUPS LIST ────────────────────────────
      case "groups": {
        if (!resolvedSessionId) {
          return new Response(
            JSON.stringify({ error: "No hay sesión conectada. Conecta WhatsApp primero.", groups: [], debug: { sessionStatus, sessionId } }),
            { status: 503, headers: CORS_HEADERS }
          );
        }
        try {
          const resp = await openwaFetch(`/api/sessions/${resolvedSessionId}/groups`);
          const text = await resp.text();
          let groups;
          try { groups = JSON.parse(text); } catch { groups = { raw: text }; }
          if (!resp.ok) {
            return new Response(
              JSON.stringify({ error: `OpenWA respondió ${resp.status}`, groups: [], debug: { status: resp.status, body: text.slice(0, 500) } }),
              { status: 502, headers: CORS_HEADERS }
            );
          }
          return new Response(JSON.stringify({ groups }), { headers: CORS_HEADERS });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: `Error obteniendo grupos: ${err.message}`, groups: [] }),
            { status: 500, headers: CORS_HEADERS }
          );
        }
      }

      // ──────────────────────── GROUP MEMBERS ──────────────────────────
      case "group_members": {
        if (!resolvedSessionId) {
          return new Response(
            JSON.stringify({ error: "No hay sesión conectada", members: [] }),
            { status: 503, headers: CORS_HEADERS }
          );
        }
        const { group_id } = body;
        if (!group_id) {
          return new Response(
            JSON.stringify({ error: "group_id required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }
        try {
          const resp = await openwaFetch(`/api/sessions/${resolvedSessionId}/groups/${group_id}/members`);
          const text = await resp.text();
          let members;
          try { members = JSON.parse(text); } catch { members = { raw: text }; }
          if (!resp.ok) {
            return new Response(
              JSON.stringify({ error: `OpenWA respondió ${resp.status}`, members: [], debug: { status: resp.status, body: text.slice(0, 500) } }),
              { status: 502, headers: CORS_HEADERS }
            );
          }
          return new Response(JSON.stringify({ members }), { headers: CORS_HEADERS });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: `Error obteniendo miembros: ${err.message}`, members: [] }),
            { status: 500, headers: CORS_HEADERS }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: CORS_HEADERS }
        );
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});

// ── Helpers ──

function normalizeChatId(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  // Ensure Colombian country code
  if (clean.length === 10) clean = "57" + clean;
  if (!clean.endsWith("@c.us")) clean = clean + "@c.us";
  return clean;
}

async function findContactByPhone(supabase: any, phone: string) {
  const clean = phone.replace(/\D/g, "");
  const { data } = await supabase
    .from("whatsapp_contacts")
    .select("id")
    .eq("phone", clean)
    .single();
  return data;
}
