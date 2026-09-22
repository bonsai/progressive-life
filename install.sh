#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/bonsai/progressive-life.git"
PROJECT_DIR="${PROGRESSIVE_LIFE_DIR:-progressive-life}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

if [ -e "$PROJECT_DIR" ] && [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "Target exists but is not a Git repository: $PROJECT_DIR" >&2
  exit 1
fi

if [ -d "$PROJECT_DIR/.git" ]; then
  echo "==> Existing clone: $PROJECT_DIR"
  cd "$PROJECT_DIR"
  git pull --ff-only
else
  echo "==> Clone: $REPO_URL"
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

echo "==> Cloudflare setup"
bash scripts/cf-setup.sh
