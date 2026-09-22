#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-progressive-life}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run validate
npm run build

if npx wrangler deploy --help >/dev/null 2>&1; then
  echo "==> Deploying Cloudflare Worker: $PROJECT_NAME"
  npx wrangler deploy
else
  echo "==> Deploying Cloudflare Pages project: $PROJECT_NAME"
  npx wrangler pages deploy public --project-name "$PROJECT_NAME"
fi
