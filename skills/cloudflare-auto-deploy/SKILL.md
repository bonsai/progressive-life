# Cloudflare Auto Deploy Skill

## Goal

Keep `progressive-life` deployable to Cloudflare Workers from GitHub Actions with a one-time credential setup and automatic deploys after merge to `main`.

## Trigger

Use this skill when the user asks to:

- deploy progressive-life to Cloudflare
- make Cloudflare deployment automatic
- check why a Cloudflare deploy did not run
- reduce repeated manual deploy steps

## Current workflow

`.github/workflows/deploy.yml` already runs on:

- push to `main`
- manual `workflow_dispatch`

The workflow performs:

1. `npm ci`
2. `npm run validate`
3. `npm run build`
4. `npx wrangler deploy`

## Credentials

Wrangler currently expects:

- `CLOUDFLARE_API_TOKEN` — GitHub Actions **secret**
- `CLOUDFLARE_ACCOUNT_ID` — GitHub Actions **secret**

The GitHub connector cannot create or inspect repository secrets. Do not pretend to have configured them.

Recommended one-time setup:

1. Create a Cloudflare API token with only the permissions required to deploy the target Worker.
2. Add it to the repository/environment as `CLOUDFLARE_API_TOKEN`.
3. Add the Cloudflare account ID as `CLOUDFLARE_ACCOUNT_ID`.
4. Prefer the existing `production` environment so deployment credentials stay scoped to production.

After this, normal deploys need no manual Cloudflare command: merging/pushing to `main` triggers the workflow.

## Agent behavior

- First inspect `.github/workflows/deploy.yml` before proposing a new deploy workflow.
- Do not create duplicate Cloudflare workflows.
- Do not expose, print, or request the value of an API token in chat.
- If a deploy failed, inspect the workflow run/job logs before changing code.
- Keep deployment changes separate from product/UI changes when possible.
- Never claim a deployment happened unless a successful GitHub Actions run or equivalent deployment evidence is available.
- If credentials are missing, report exactly which credential names are required and stop short of claiming deployment.
- Prefer one-time setup over repeated local CLI commands.

## Success condition

A merged change on `main` causes the existing deploy workflow to validate, build, and deploy the Worker automatically.
