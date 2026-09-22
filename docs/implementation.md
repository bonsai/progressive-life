# Implementation

## MVP
Voice artifact → Episode JSONL → Event JSONL → Relation candidate → Human confirmation → static View.

## Runtime
GitHub stores Canon and JSONL. GitHub Actions builds derived data. gh aw orchestrates agentic operations. GitHub Pages serves the View.

## Commands
npm run validate
npm run build

## Deployment
Push to main triggers GitHub Pages deployment. Optional providers are added only for concrete requirements.
