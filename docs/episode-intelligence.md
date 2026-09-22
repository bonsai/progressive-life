# Episode Intelligence

## Purpose

progressive-life is not a voice recorder. It turns spoken memories into Episodes, presents them as movable cards, and helps the person discover relationships between them.

## Core Loop

Voice → STT → Episode candidate → Card → Human arrangement → Relation candidates → Human confirmation → Event → View

## Responsibilities

### Voice
The original audio is the source. It is never overwritten.

### STT
Speech-to-text produces a derived transcript. The transcript is evidence for Episode extraction, not a replacement for the voice.

### Episode intelligence
The system detects meaningful fragments from a transcript and proposes Episode candidates with:
- title
- summary
- people
- places
- time hints
- source voice
- confidence
- candidate relations

### Cards
Each Episode is presented as a card. Cards can be reordered directly by the person.

The order is an editable projection, not an absolute chronology.

### Relation intelligence
After cards are arranged, the system can propose relationships such as:
- same person
- same place
- same period
- cause / consequence
- contrast
- repeated theme
- before / after
- unresolved connection

The person confirms or rejects each proposed relation.

## Human-in-the-loop rule

AI proposes. The person decides.

AI must not silently rewrite the person's life, invent events, or turn uncertain interpretation into fact.

A confirmed interpretation becomes a new Event and remains distinguishable from the original Voice.

## Intelligence Layers

1. **Hear** — capture Voice.
2. **Understand** — STT and extract Episode candidates.
3. **Present** — render cards.
4. **Arrange** — let the person move cards.
5. **Connect** — propose Relations.
6. **Confirm** — person accepts or rejects.
7. **Remember** — append Event/history.
8. **Project** — rebuild the View.

## Desired UX

The user should feel that they are talking about their life, not operating an AI pipeline.

Speak → cards appear → move cards → connections appear → confirm → the life view changes.

## Data Principle

Voice is canonical source.

Transcript is derived.

Episode is a structured fragment.

Card order is a user-controlled View state.

Relation is a proposed or confirmed connection.

Event is historical evidence of an action or confirmation.

View is a projection of the current accumulated knowledge.

## MVP

- browser microphone recording
- STT adapter
- Episode candidate extraction
- Episode cards
- drag-and-drop ordering
- persistence of order
- relation candidate display
- human confirmation
- JSONL-compatible history
