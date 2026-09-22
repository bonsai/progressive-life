export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/voice") {
      if (!env.VOICE_BUCKET || !env.GITHUB_TOKEN) {
        return Response.json({ error: "server is not configured" }, { status: 503 });
      }

      const form = await request.formData();
      const audio = form.get("audio");
      if (!(audio instanceof File)) {
        return Response.json({ error: "audio is required" }, { status: 400 });
      }

      const voiceId = crypto.randomUUID();
      const key = `voice/${voiceId}.webm`;
      await env.VOICE_BUCKET.put(key, audio.stream(), {
        httpMetadata: { contentType: audio.type || "audio/webm" }
      });

      const voiceUrl = new URL(`/api/voice/${voiceId}`, request.url).toString();
      const dispatch = await fetch(
        "https://api.github.com/repos/bonsai/progressive-life/actions/workflows/stt-episode.yml/dispatches",
        {
          method: "POST",
          headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "progressive-life-worker",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ref: "main",
            inputs: { audio_url: voiceUrl, voice_id: voiceId }
          })
        }
      );

      if (!dispatch.ok) {
        return Response.json({ error: "workflow dispatch failed" }, { status: 502 });
      }

      return Response.json({ ok: true, voice_id: voiceId, status: "processing" }, { status: 202 });
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/voice/")) {
      const voiceId = url.pathname.split("/").pop();
      const object = await env.VOICE_BUCKET?.get(`voice/${voiceId}.webm`);
      if (!object) return new Response("Not found", { status: 404 });
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "audio/webm",
          "Cache-Control": "private, max-age=3600"
        }
      });
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  }
};
