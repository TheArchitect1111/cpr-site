# Drift Detection

Automated comparison of Git, Vercel, environment, routes, and deployment metadata.

## Command

```bash
npm run governance:drift
```

Output: JSON report + integrity score. Written to `governance/reports/drift-report.json` with `--write`.

## Drift Categories

### Configuration Drift

Compares:
- `governance/config/env-catalog.json` ↔ `.env.example`
- Duplicate env var names (`AIRTABLE_API_KEY` vs `AIRTABLE_TOKEN`)
- Unused vars (`OPENAI_API_KEY`)
- Undocumented vars (`PROFILE_SITE_URL`, `ADMIN_SETUP_TOKEN`)

### Infrastructure Drift

Compares:
- `vercel.json` ↔ `governance/config/redirects.manifest.json`
- Dashboard-only redirects (known list in manifest)
- `governance/config/route-manifest.json` ↔ current `app/` routes

### Repository Drift

Compares:
- Working tree cleanliness
- Current branch vs production branch (`main`)

### Deployment Drift

Compares:
- `docs/releases/latest.json` commit SHA ↔ `git rev-parse HEAD`
- GitHub deployment record ↔ Vercel active deployment (manual check)

### Runtime Drift

Compares:
- Feature flags active in environment vs allowed environments
- Middleware checksum vs last release manifest

## Integrity Score

```
Score = (pass × 1.0 + warn × 0.5 + fail × 0) / total × 100
```

| Score | Status |
|-------|--------|
| 90–100 | Healthy — Git matches operational state |
| 70–89 | Warning — review drift report |
| < 70 | Critical — production may not match Git |

## Alert Conditions

Alert (exit code 1) when any check has `status: fail`:

- Dashboard-only redirects pending migration
- Staging flags enabled in production context
- Release manifest missing or SHA mismatch
- Undocumented env vars in `.env.example`

## Continuous Monitoring

| Trigger | Action |
|---------|--------|
| Push to `main` | `release-governance.yml` runs full pipeline |
| Daily (recommended) | Scheduled workflow runs `governance:drift` |
| Pre-promote | Operator runs `governance:drift` manually |

## Remediation

| Drift Type | Fix |
|------------|-----|
| Dashboard redirect | Add to `vercel.json`; remove from Vercel dashboard |
| Undocumented env | Add to catalog + `.env.example` |
| Unused env | Remove from Vercel or wire to code |
| Manifest mismatch | Run `npm run governance:manifest` |
| Orphan route | Run `npm run governance:routes -- --write` |
| Branch fork | Merge/reconcile per [Branch Governance](./BRANCH-GOVERNANCE.md) |

## CPR Known Drift (Baseline)

As of 2026-07-07 audit:

| Item | Status |
|------|--------|
| `/story/selena`, `/magnifi`, `/amplify` redirects | Dashboard-only — migrate to Git |
| `CPR_STAGING_OPEN` in Vercel Production | Must unset |
| `fix/admin-login-loop` vs `main` | 50-commit fork — reconcile |
| Orphan `/staging` page in production | Not in Git — recover or remove |
