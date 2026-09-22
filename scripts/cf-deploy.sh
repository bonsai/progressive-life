#!/usr/bin/env bash
set -euo pipefail
PROJECT_NAME="progressive-life"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
npm run validate
npm run build
npx wrangler pages deploy public --project-name "$PROJECT_NAME"
