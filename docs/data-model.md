# Data Model

JSONLを中心に、原音声と派生データを分離する。

## Layout

voice/*.mp3

data/episodes.jsonl
data/events.jsonl
data/decisions.jsonl
data/relations.jsonl

public/view.json

## Rules

- 1行 = 1 record
- 各recordはstable IDを持つ
- recordsはappend-oriented
- Voiceはcanonical source
- 派生データは再生成可能
- Relationはrecord IDで参照する
- Viewはprojectionでありsourceではない

## Provenance

派生recordは、可能な範囲で直前のsourceとderived_fromを保持する。

## Immutability

過去のrecordを直接書き換えず、訂正は新recordとして追加する。必要ならsupersedesで旧recordを参照する。
