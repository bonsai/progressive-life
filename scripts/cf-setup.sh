#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="progressive-life"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/5] Checking Node.js..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required."; exit 1; }
node --version

echo "[2/5] Installing project dependencies..."
npm install

echo "[3/5] Building the site..."
npm run validate
npm run build

echo "[4/5] Checking Wrangler..."
npx wrangler --version

echo "Cloudflare authentication is the only interactive step."
echo "A browser will open. Complete Cloudflare login, then return here."
npx wrangler login

echo "[5/5] Deploying to Cloudflare Pages..."
npx wrangler pages deploy public --project-name "$PROJECT_NAME"

echo "Cloudflare Pages deployment finished."
