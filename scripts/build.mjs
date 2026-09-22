import fs from "node:fs"; import path from "node:path";
fs.mkdirSync("public",{recursive:true});
const read=(f,t)=>fs.existsSync(f)?fs.readFileSync(f,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse).filter(x=>x.type===t):[];
const view={generated_at:new Date().toISOString(),episodes:read("data/episodes.jsonl","episode"),events:read("data/events.jsonl","event"),decisions:read("data/decisions.jsonl","decision"),relations:read("data/relations.jsonl","relation")};
fs.writeFileSync("public/view.json",JSON.stringify(view,null,2)+"\n");
const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const cards=view.episodes.map(e=>`<article><h2>${esc(e.title)}</h2><p>${esc(e.summary||"")}</p><small>${esc(e.id)}</small></article>`).join("");
fs.writeFileSync("public/index.html",`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>progressive-life</title><style>body{font:16px system-ui;max-width:900px;margin:40px auto;padding:0 20px}article{border:1px solid #ddd;border-radius:12px;padding:18px;margin:12px 0}</style><h1>progressive-life</h1><p>半生記を語る。つなげる。発見する。</p><main>${cards||"<p>まだEpisodeはありません。</p>"}</main>`)