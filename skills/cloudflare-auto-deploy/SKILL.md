# Cloudflare Auto Deploy Skill

## Goal

Keep `progressive-life` deployable while keeping the boundary clear:

- **CLI** handles deterministic local Cloudflare work.
- **AW** handles orchestration, observation, scheduling, GitHub Actions feedback, retries, and other automation.

## CLI handoff

Use `scripts/cf-cli-handoff.sh` for the CLI-supported path:

```bash
./scripts/cf-cli-handoff.sh validate
./scripts/cf-cli-handoff.sh build
./scripts/cf-cli-handoff.sh deploy
```

The deploy path runs:

1. `npm run validate`
2. `npm run build`
3. `npx wrangler deploy`

The existing `scripts/cf-deploy.sh` remains the lower-level deploy script.

## AW boundary

Do not put these responsibilities into the CLI handoff script:

- GitHub Actions orchestration
- secret creation or inspection
- scheduled execution
- workflow observation/reporting
- automatic retries
- cross-repository coordination
- deployment state collection

Those are AW responsibilities.

## GitHub Actions

`.github/workflows/deploy.yml` already deploys on push to `main` and can be started manually.

It performs:

1. `npm ci`
2. `npm run validate`
3. `npm run build`
4. `npx wrangler deploy`

Required GitHub secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The GitHub connector cannot create or inspect repository secrets. Never expose or print secret values.

## Agent behavior

- Inspect the existing workflow before creating another deployment workflow.
- Prefer the CLI handoff for deterministic local operations.
- Prefer AW for orchestration and feedback loops.
- Do not duplicate Cloudflare workflows.
- If a deploy failed, inspect workflow/job logs before changing code.
- Never claim deployment success without successful execution evidence.
