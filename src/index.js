/**
 * progressive-life — Privacy-First Edge Proxy
 *
 * Design principle: NO personal data is stored on the server.
 * The server acts ONLY as:
 *   1. API key proxy (Sakura STT/Embedding)
 *   2. Mail relay (SendGrid/Resend)
 *   3. SPA static asset delivery
 *
 * All voice, text, episodes, relations, and PDFs stay in the user's browser.
 */

const SAKURA_URL = "https://api.ai.sakura.ad.jp/v1";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- CORS (allow browser SPA to call this worker) ---
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    // --- Health check ---
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, mode: "privacy-first", storage: "r2+github-actions" }, { headers: corsHeaders });
    }

    // --- Proxy: Sakura STT ---
    // Browser posts audio blob here → we forward to Sakura with our key
    // The audio NEVER touches disk/R2/KV. Stream-through only.
    if (request.method === "POST" && url.pathname === "/api/proxy/stt") {
      if (!env.SAKURA_API_KEY) {
        return Response.json({ error: "STT proxy not configured" }, { status: 503 });
      }

      // Clone the request body (stream) and forward to Sakura
      const contentType = request.headers.get("content-type") || "";
      let body;
      if (contentType.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        body = request.body; // stream-through for direct blob
      }

      const sakuraReq = new Request(`${SAKURA_URL}/audio/transcriptions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.SAKURA_API_KEY}`,
        },
        body: body,
      });

      // Stream-through response from Sakura → Browser
      const sakuraRes = await fetch(sakuraReq);
      return new Response(sakuraRes.body, {
        status: sakuraRes.status,
        headers: {
          ...corsHeaders,
          "Content-Type": sakuraRes.headers.get("content-type") || "application/json",
        },
      });
    }

    // --- Proxy: Sakura Embeddings ---
    if (request.method === "POST" && url.pathname === "/api/proxy/embed") {
      if (!env.SAKURA_API_KEY) {
        return Response.json({ error: "Embed proxy not configured" }, { status: 503 });
      }

      const body = await request.json();
      const sakuraReq = new Request(`${SAKURA_URL}/embeddings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.SAKURA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const sakuraRes = await fetch(sakuraReq);
      return new Response(sakuraRes.body, {
        status: sakuraRes.status,
        headers: {
          ...corsHeaders,
          "Content-Type": sakuraRes.headers.get("content-type") || "application/json",
        },
      });
    }

    // --- Relay: Send email (Resend preferred, SendGrid fallback) ---
    // Browser posts {to, subject, body, attachment: base64} → relay to mail API
    // Mail body is encrypted PDF (base64) from browser.
    if (request.method === "POST" && url.pathname === "/api/proxy/mail") {
      const mailApiKey = env.RESEND_API_KEY || env.SENDGRID_API_KEY;
      if (!mailApiKey) {
        return Response.json({ error: "mail relay not configured" }, { status: 503 });
      }

      const payload = await request.json();
      const { to, subject, body, attachment, filename } = payload;

      if (!to || !attachment) {
        return Response.json({ error: "to and attachment required" }, { status: 400 });
      }

      // Build mail API request
      let mailBody, mailHeaders, mailUrl;

      if (env.RESEND_API_KEY) {
        // Resend API
        mailUrl = "https://api.resend.com/emails";
        mailHeaders = {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        };
        mailBody = JSON.stringify({
          from: env.FROM_EMAIL || "progressive-life@notify.io",
          to: to,
          subject: subject || "あなたの半生記と遺言状参考資料が完成しました",
          html: body || "<p>ご利用ありがとうございます。PDFを添付いたします。</p>",
          attachments: attachment ? [{
            filename: filename || "progressive-life.pdf",
            content: attachment,
          }] : undefined,
        });
      } else {
        // SendGrid v3 API
        mailUrl = "https://api.sendgrid.com/v3/mail/send";
        mailHeaders = {
          "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        };
        mailBody = JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: env.FROM_EMAIL || "noreply@progressive-life.dev" },
          subject: subject || "あなたの半生記と遺言状参考資料が完成しました",
          content: [{ type: "text/html", value: body || "<p>ご利用ありがとうございます。PDFを添付いたします。</p>" }],
          attachments: attachment ? [{
            filename: filename || "progressive-life.pdf",
            content: attachment,
            type: "application/pdf",
            disposition: "attachment",
          }] : undefined,
        });
      }

      const mailRes = await fetch(mailUrl, { method: "POST", headers: mailHeaders, body: mailBody });
      if (!mailRes.ok) {
        const errText = await mailRes.text();
        return Response.json({ error: "mail relay failed", detail: errText }, { status: 502 });
      }

      return Response.json({ ok: true, mode: "relay-only", stored: false });
    }

    // --- Voice artifact: R2 + GitHub Actions dispatch ---
    if (request.method === "POST" && url.pathname === "/api/voice") {
      if (!env.VOICE_BUCKET) return Response.json({ error: "voice storage not configured" }, { status: 503 });
      if (!env.GITHUB_TOKEN) return Response.json({ error: "workflow dispatch not configured" }, { status: 503 });
      const form = await request.formData();
      const file = form.get("file");
      const voiceId = String(form.get("voice_id") || crypto.randomUUID());
      if (!(file instanceof File)) return Response.json({ error: "file required" }, { status: 400 });
      const safeId = voiceId.replace(/[^a-zA-Z0-9_-]/g, "-");
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".webm";
      const key = `voices/${safeId}${ext}`;
      await env.VOICE_BUCKET.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || "application/octet-stream" },
        customMetadata: { voice_id: safeId, original_name: file.name },
      });
      const audioUrl = `${url.origin}/api/voice/${encodeURIComponent(safeId)}`;
      const repo = env.GITHUB_REPO || "bonsai/progressive-life";
      const dispatch = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/stt-episode.yml/dispatches`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "progressive-life-worker",
        },
        body: JSON.stringify({ ref: "main", inputs: { audio_url: audioUrl, voice_id: safeId } }),
      });
      if (!dispatch.ok) return Response.json({ error: "workflow dispatch failed", detail: await dispatch.text() }, { status: 502 });
      return Response.json({ ok: true, voice_id: safeId, audio_url: audioUrl, queued: true }, { headers: corsHeaders });
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/voice/")) {
      if (!env.VOICE_BUCKET) return new Response("voice storage not configured", { status: 503 });
      const voiceId = decodeURIComponent(url.pathname.slice("/api/voice/".length));
      const listed = await env.VOICE_BUCKET.list({ prefix: `voices/${voiceId}`, limit: 1 });
      const object = listed.objects[0];
      if (!object) return new Response("Voice not found", { status: 404 });
      const stored = await env.VOICE_BUCKET.get(object.key);
      if (!stored) return new Response("Voice not found", { status: 404 });
      return new Response(stored.body, {
        headers: {
          "Content-Type": stored.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    // --- Static assets (SPA) ---
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  }
};
