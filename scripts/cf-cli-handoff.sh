#!/usr/bin/env bash
set -euo pipefail

# CLI handoff: local Cloudflare deployment only.
# Anything requiring GitHub Actions secrets, schedules, observation,
# retries, reporting, or other orchestration belongs to AW.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

case "${1:-deploy}" in
  validate)
    npm run validate
    ;;
  build)
    npm run validate
    npm run build
    ;;
  deploy)
    npm run validate
    npm run build
    npx wrangler deploy
    ;;
  *)
    echo "Usage: $0 {validate|build|deploy}"
    exit 2
    ;;
esac
