# Cloudflare Deployment

## Purpose
progressive-life is deployed as a static site to Cloudflare Pages.
GitHub remains the Canon. Cloudflare is the runtime/distribution layer.

## Flow

GitHub → npm run validate → npm run build → public/ → Wrangler CLI → Cloudflare Pages

## First setup

From the repository root:
bash scripts/cf-setup.sh

The script installs dependencies, validates/builds the site, checks Wrangler, then starts the only interactive authentication step:
npx wrangler login

Authentication is handled by Cloudflare's browser-based CLI login. No API token is stored in the repository.

## Subsequent deploys

bash scripts/cf-deploy.sh

This runs validation, build, and Wrangler Pages deployment.

## Authentication

The preferred local flow is npx wrangler login.
For CI, use a Cloudflare API token and account ID as GitHub Actions Secrets. Never commit either value.

## Future providers

R2 can hold voice/audio artifacts, D1 can hold current state, and Workers can provide API/interface. Vercel or Surge can remain replaceable providers.
The source model remains append-oriented JSONL in GitHub.
