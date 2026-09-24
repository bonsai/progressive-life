import fs from "node:fs";

fs.mkdirSync("public", { recursive: true });

const read = (f, t) =>
  fs.existsSync(f)
    ? fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse).filter(x => x.type === t)
    : [];

const view = {
  generated_at: new Date().toISOString(),
  episodes: read("data/episodes.jsonl", "episode"),
  events: read("data/events.jsonl", "event"),
  decisions: read("data/decisions.jsonl", "decision"),
  relations: read("data/relations.jsonl", "relation")
};

fs.writeFileSync("public/view.json", JSON.stringify(view, null, 2) + "\n");

const esc = s => String(s ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const cards = view.episodes.map((e, i) =>
  '<article class="card" data-episode="' + esc(e.id) + '">' +
    '<div class="card-index">' + String(i + 1).padStart(2, "0") + "</div>" +
    '<div class="card-body"><h2>' + esc(e.title || "Untitled Episode") + "</h2>" +
    "<p>" + esc(e.summary || "") + "</p>" +
    '<div class="card-meta">' + esc(e.id) + "</div></div></article>"
).join("");

const html = '<!doctype html><html lang="ja"><head>' +
'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<title>progressive-life</title><style>' +
':root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171717;background:#f7f6f2}' +
'*{box-sizing:border-box}body{margin:0;min-height:100vh}' +
'header{max-width:960px;margin:auto;padding:48px 20px 24px;display:flex;justify-content:space-between;gap:20px;align-items:end}' +
'h1{font-size:clamp(32px,6vw,56px);letter-spacing:-.04em;margin:0}header p{margin:8px 0 0;color:#666}' +
'#mic{border:0;border-radius:999px;width:64px;height:64px;background:#171717;color:white;font-size:28px;cursor:pointer;box-shadow:0 8px 24px #0002}' +
'#mic:focus-visible{outline:3px solid #171717;outline-offset:4px}' +
'#mic.recording{background:#b42318;animation:pulse 1.2s infinite}#mic:disabled{opacity:.45;cursor:default}' +
'@keyframes pulse{50%{transform:scale(1.08)}}@media(prefers-reduced-motion:reduce){#mic.recording{animation:none}}#status{max-width:960px;margin:0 auto;padding:0 20px;color:#777;min-height:24px}' +
'.field{max-width:960px;margin:24px auto 80px;padding:0 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}' +
'.card{position:relative;min-height:190px;background:#fff;border:1px solid #e4e1d9;border-radius:20px;padding:24px;box-shadow:0 6px 24px #00000008;transition:transform .2s,box-shadow .2s}' +
'.card:hover{transform:translateY(-3px);box-shadow:0 12px 30px #00000012}.card-index{font-size:12px;color:#999;letter-spacing:.12em}' +
'.card h2{margin:28px 0 10px;font-size:23px}.card p{color:#555;line-height:1.7;margin:0}.card-meta{position:absolute;bottom:18px;left:24px;font-size:11px;color:#aaa}' +
'.empty{grid-column:1/-1;text-align:center;padding:72px 20px;border:1px dashed #ccc;border-radius:20px;color:#888}.recording-note{font-size:13px;color:#888}' +
'</style></head><body><header><div><h1>progressive-life</h1>' +
'<p>半生記を語る。つなげる。発見する。</p></div>' +
'<button id="mic" type="button" aria-label="録音開始">🎙</button></header>' +
'<div id="status" aria-live="polite"></div><main class="field">' +
(cards || '<div class="empty">まだEpisodeはありません。<br><span class="recording-note">マイクから、まずひとつ語ってみる。</span></div>') +
'</main><script>' +
'const mic=document.querySelector("#mic"),status=document.querySelector("#status");let recorder=null,chunks=[],stream=null;' +
'mic.addEventListener("click",async()=>{if(recorder?.state==="recording"){recorder.stop();return}' +
'if(!navigator.mediaDevices?.getUserMedia){status.textContent="このブラウザではマイク録音を利用できません。";return}' +
'try{stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);' +
'recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};' +
'recorder.onstart=()=>{mic.classList.add("recording");mic.textContent="■";mic.setAttribute("aria-label","録音停止");status.textContent="録音中……語ってください。"};' +
'recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"}),url=URL.createObjectURL(blob),a=document.createElement("a");' +
'a.href=url;a.download="progressive-life-"+Date.now()+".webm";a.textContent="録音を保存";a.style.marginLeft="8px";status.textContent="録音しました。";status.appendChild(a);' +
'stream?.getTracks().forEach(t=>t.stop());mic.classList.remove("recording");mic.textContent="🎙";mic.setAttribute("aria-label","録音開始")};recorder.start()' +
'}catch(err){status.textContent="マイクへのアクセスが許可されませんでした。"}});</script></body></html>';

fs.writeFileSync("public/index.html", html);

// The interactive PWA is the canonical deployed view; app.html remains directly addressable too.
if (fs.existsSync("public/app.html")) fs.copyFileSync("public/app.html", "public/index.html");
