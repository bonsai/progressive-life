# Stack

## Core

| Layer | Technology | Responsibility |
|---|---|---|
| Canon | GitHub | Source / History / Versioning |
| Automation | GitHub Actions / gh aw | Collect / Transform / Connect / Build |
| Data | JSONL | Episode / Event / Decision / Relation |
| Decision | Jev | Structured decision |
| View | HTML / CSS / JavaScript | Episode Field / Reader |
| Hosting / Interface | Cloudflare Workers | Public View / API / Interface |

## Current Public View

https://progressive-life.vonsai-apps.workers.dev

Cloudflare Workersを現在の公開View / Interfaceとする。
GitHub Pagesは現在の主要な公開先ではない。

## Optional Providers

| Provider | Role |
|---|---|
| Cloudflare D1 | Current State |
| Cloudflare R2 | Audio / Binary Artifact |
| Vercel | Alternate API / Runtime |
| Surge | Prototype View |
| GitHub Pages | Legacy / Optional Static View |

Providerは交換可能。CanonはGitHubに置き、View / API / Artifactの実装はProviderに依存しない。

## Data Flow

Voice → Episode → Event → Decision → Candidate Relation → Human Confirmation → Relation → View

## World Flow

history → latest → now → action

## Deploy Flow

GitHub Canon → clone → Cloudflare CLI auth → validate → build → Workers deploy → Public View

## Principles

GitHub is Canon. Voice is Source. History is Append-oriented. Interpretation is Additive. View is Projection. Providers are Replaceable.
