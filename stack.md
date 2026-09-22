# Stack

progressive-life は、**Voice → Episode → Event → Decision → Relation → View** を、交換可能なProviderの上に構築する。

## Core

| Layer | Technology | Responsibility |
|---|---|---|
| Canon | GitHub | Source / History / Versioning |
| Automation | GitHub Actions / `gh aw` | Collect / Transform / Build / Deploy |
| Data | JSONL | Episode / Event / Decision / Relation |
| Decision | Jev | Structured decision / scoring / confidence |
| View | HTML / CSS / JavaScript | Episode Field / Reader / Editor |
| Hosting | GitHub Pages | Static View |

## Optional Providers

必要性が発生した時だけ追加する。

| Layer | Technology | Responsibility |
|---|---|---|
| Current State | Cloudflare D1 | `now` / queryable state |
| Binary | Cloudflare R2 | MP3 / audio artifacts |
| API | Cloudflare Workers | External Interface |
| Runtime / API | Vercel | Alternate runtime |
| Prototype | Surge | Temporary View |

## Data Flow

```
Voice
  ↓
Fragment / Episode
  ↓
Event
  ↓
Jev
  ↓
Candidate Relation
  ↓
Human Confirmation
  ↓
New Event
  ↓
View
```

世界モデルとしては、

```
history → latest → now → action
```

を基本とする。

- **history** = append-oriented events
- **latest** = 最新の事実・判断
- **now** = 現在状態
- **action** = 次の操作

## Source / Derived

```
voice/                  # canonical source
  *.mp3

data/
  episodes.jsonl        # derived from Voice
  events.jsonl          # history
  decisions.jsonl       # Jev decisions
  relations.jsonl       # confirmed relations

public/
  view.json             # View projection
```

原音声は上書きしない。Transcript、Episode、Decision、Relation、View はすべて派生物として扱い、再生成可能にする。

## Interface

Providerを直接依存させず、WorldのInterfaceとして扱う。

```
World
 ├─ Canon      → GitHub
 ├─ Operation  → gh aw / Actions
 ├─ Decision   → Jev
 ├─ State      → D1 (optional)
 ├─ Artifact   → R2 (optional)
 └─ View       → Pages
```

Providerを交換しても、Ontology / Topology / Data Model / Event History は維持する。

## MVP

最初の実装は最小構成に固定する。

```
GitHub
+ GitHub Pages
+ GitHub Actions
+ gh aw
+ JSONL
+ Jev
```

D1 / R2 / Workers / Vercel / Surge は、静的構成では解決できない具体的な要求が発生した時点で追加する。

## Principles

1. **GitHub is Canon**
2. **Voice is Source**
3. **History is Append-oriented**
4. **Interpretation is Additive**
5. **View is Projection**
6. **Human confirms AI interpretation**
7. **Providers are Replaceable**
8. **Start Static, Add Runtime Only When Needed**
