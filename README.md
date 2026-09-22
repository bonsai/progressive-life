# progressive-life

**声から、自分の半生を発見する。**

progressive-life は、人生を時系列に並べて記録するためのWebではない。
声で語られた断片を **Episode** として保存し、互いの関係を発見しながら、
どこからでも読める「無限編集」の半生記をつくる。

## Concept

> どっから読んでもおもしろい。はじめと終わりがない編集。

Episode は固定された年表の一点ではなく、Episode Field に浮かぶ断片。
読者も語り手も同じUIを使い、語り手にはマイクが追加される。

- **Voice** — 原資料。録音された声を失わない
- **Episode** — 声から切り出された人生の断片
- **Event** — 世界で起きた操作・変化の履歴
- **Decision** — AIによる構造化された判断
- **Relation** — Episode同士の関係
- **View** — 履歴・判断から生成される現在の表示

AIは人生を書き換えない。候補となる関係や解釈を提案し、人間が確認した結果だけを新しいEventとして残す。

## World Model

history → latest → now → action

世界には状態と操作があり、操作の蓄積がHistoryになる。世界同士はInterfaceを通じて接続する。

### SVO

Subject → Action → Object

人間またはAgentが主体となって対象を操作し、その操作をEventとして記録する。

## Architecture

progressive-life = GitHub Canon + AW + Jev + View + replaceable Providers

### Provider strategy

無料枠と分散を前提に、各Providerに役割を固定しない。

| Provider | Role |
|---|---|
| GitHub | Canon / History / Source |
| GitHub Actions / gh aw | Operation / Automation |
| GitHub Pages | Static View |
| Jev | Structured Decision |
| Cloudflare D1 | Current State |
| Cloudflare R2 | Audio / Binary Artifact |
| Cloudflare Workers | API / Interface |
| Vercel | Alternate API / Runtime |
| Surge | Prototype View |

最初は **GitHub Pages + gh aw + Actions + JSONL + Jev** だけで成立させ、必要になった時点で D1 / R2 / Workers / Vercel / Surge を追加する。

## Data

原資料と派生データを分離する。

```
voice/
  001.mp3
  002.mp3

data/
  episodes.jsonl
  events.jsonl
  decisions.jsonl
  relations.jsonl

public/
  view.json
```

Voice = canonical source / Transcript = derived / Decision = interpretation / Event = history / View = projection

音声は上書きしない。新しく吹き込んだ声は新しいFragment / Episodeとして扱う。

## Interaction

Episode Field は固定されたTimelineではない。

- Episodeを自由に配置する
- Episodeを別のEpisodeへ「運ぶ」
- 近づけることで関係を表現する
- AIは関係候補を発見する
- 人間が確認する
- 確認結果をEventとして保存する

読むこと・語ること・編集することが同じField上で行われる。

## Decision Flow

Human Action → Event → Jev → Candidate Relation → Human Confirmation → New Event → View

Jev は文章を書くための中心ではなく、候補の選択・スコア・確信度などの構造化された意思決定に使う。

## Ontology / Topology

- **Ontology** = 何が存在し、それは何か
- **Topology** = それらがどう接続し、どう流れるか

`ontology.yaml` と `topology.yaml` をSemantic / Structural Dictionaryとして管理する。

## Principles

1. Voice is source — 原音声を守る
2. History is append-oriented — 履歴を積み上げる
3. Interpretation is additive — 解釈は原資料を上書きしない
4. View is projection — Viewは再生成できる
5. Human confirms — AIの解釈を人間が確認する
6. No fixed beginning or end — 半生記を固定年表にしない
7. Providers are replaceable — Interfaceの内側は交換可能
8. GitHub is Canon — まずGitに残す

## Status

設計段階。次の実装単位：Episode Field → Voice recording → MP3 artifact → JSONL event history → gh aw / Jev → Relation → GitHub Pages View → 必要に応じてD1 / R2 / Workers / Vercel。

## License

TBD