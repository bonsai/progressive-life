#!/usr/bin/env python3
import json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
from faster_whisper import WhisperModel

audio_path = Path(sys.argv[1])
if not audio_path.exists():
    raise SystemExit(f"audio not found: {audio_path}")

model_name = os.getenv("WHISPER_MODEL", "tiny")
model = WhisperModel(model_name, device="cpu", compute_type="int8")
segments, info = model.transcribe(str(audio_path), language=os.getenv("STT_LANGUAGE", "ja"))
transcript = " ".join(s.text.strip() for s in segments if s.text.strip()).strip()
if not transcript:
    raise SystemExit("STT produced an empty transcript")

sentences = [s.strip() for s in re.split(r"[。！？!?\n]+", transcript) if s.strip()]
summary = "。".join(sentences[:2])
if summary and not summary.endswith("。"):
    summary += "。"
title_seed = sentences[0] if sentences else transcript
title = title_seed[:32] + ("…" if len(title_seed) > 32 else "")
now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
voice_id = os.getenv("VOICE_ID", audio_path.stem)
episode_id = f"episode-{now.replace(':', '').replace('-', '').replace('.', '')}"

episode = {
    "id": episode_id, "type": "episode", "created_at": now,
    "source": f"voice/{voice_id}", "title": title or "Untitled Episode",
    "summary": summary, "voice": {"id": voice_id, "artifact": str(audio_path)},
    "transcript": {"text": transcript, "language": getattr(info, "language", "ja"),
                   "provider": "faster-whisper", "model": model_name},
    "confidence": "candidate", "tags": []
}
out = Path(os.getenv("EPISODE_OUTPUT", "data/episodes.jsonl"))
out.parent.mkdir(parents=True, exist_ok=True)
with out.open("a", encoding="utf-8") as f:
    f.write(json.dumps(episode, ensure_ascii=False) + "\n")
print(json.dumps({"episode_id": episode_id, "transcript": transcript}, ensure_ascii=False))
