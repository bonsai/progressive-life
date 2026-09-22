# JSONL Contract

## Common

Every record MUST contain:

{"id":"string","type":"string","created_at":"ISO-8601","source":"string"}

Optional common fields:

- supersedes: string
- metadata: object

## Episode

Required: id, type=episode, created_at, source, title.

Optional: summary, voice, transcript, occurred_at, tags.

## Event

Required: id, type=event, created_at, source, event.

event MUST contain subject and action. object MAY be null.

## Decision

Required: id, type=decision, created_at, source, question, decided_by.

options and selected are optional.

decided_by: human | ai | system

## Relation

Required: id, type=relation, created_at, source, from, relation, to, status.

status: candidate | confirmed | rejected

confirmed_by: human | ai | system | null

## References

Use stable IDs for cross-record references. Avoid embedding complete records.

## Semantics

AI-generated relations are candidates. A confirmed Relation requires explicit human confirmation.
