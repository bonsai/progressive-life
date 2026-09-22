# PRD

## Product

**progressive-life — 半生記を語る、つなげる、発見する。**

## Problem

半生を振り返ろうとしても、人生は時系列の文章だけでは整理しにくい。記憶は断片的で、後から別の出来事との関係が見えてくる。

## Vision

本人が声で半生を語る。語った断片をEpisodeとして残し、出来事・判断・関係をつなげる。つながりが増えるほど、自分の人生の構造が見えてくる。

## Core Loop

Voice → Episode → Event → Decision → Relation → View

AIはつながりの候補を提示し、本人が確認する。AIが人生の意味を決めるのではない。

## User Experience

1. 語る
2. 断片がEpisodeになる
3. 過去のEpisodeと候補のつながりが提示される
4. 本人がつなげる／つなげないを選ぶ
5. つながった関係から新しいViewが生まれる
6. また語る

## Product Principles

- Voice is Source
- Human confirms interpretation
- Connection creates value
- History is append-oriented
- View is projection
- GitHub is Canon
- Providers are replaceable

## MVP

- Voice recording/import
- Episode extraction
- JSONL history
- Relation candidates
- Human confirmation
- Episode Field / static View
- GitHub Actions / gh aw automation

## Success Signals

- 語られたEpisode数
- 確認されたRelation数
- EpisodeあたりのRelation数
- 新しいRelationから再発見されたEpisode数
- 継続して語られた回数

## Non-goals

- AIによる自動的な人生評価
- 一度で完成する自伝
- 固定された年表だけを表示すること
- 原音声の上書き

## Future

D1 / R2 / Workers / Vercel / Surge は、MVPで必要性が発生した場合に追加する。
