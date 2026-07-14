# Deployment Checklist

Use before every **Production** deployment to `main`.

## Pre-Deploy

- [ ] All changes merged to `main` via approved PR
- [ ] Working tree clean (`git status`)
- [ ] Branch is `main` (not `fix/*` or feature branch)
- [ ] `npm run verify:deploy` passes locally or in CI
- [ ] Release manifest generated (`npm run governance:manifest`)
- [ ] No dashboard-only redirects pending (check `governance:drift`)
- [ ] Staging flags **not** set in Vercel Production (`CPR_STAGING_OPEN`, `DEMO_MODE`)
- [ ] Required env vars set in Vercel Production (see [Environment Catalog](./ENVIRONMENT-CATALOG.md))
- [ ] External services healthy (Airtable, Resend minimum)

## Deploy

```bash
git push origin main
```

Vercel auto-deploys from `main`. Confirm:

- [ ] GitHub Actions `CI` job green
- [ ] GitHub Actions `Release Governance` job green
- [ ] Vercel deployment status **Ready**
- [ ] Deployment commit SHA matches `docs/releases/latest.json`

## Post-Deploy Verification

| Flow | URL / Action | Pass Criteria |
|------|--------------|---------------|
| Homepage | `/` | Loads; no console errors |
| Apply redirect | `/apply` | Redirects to expected destination |
| Portal login | `/portal/login` | Magic-link form visible |
| Admin login | `/admin/login` | Login form visible |
| Payments | `POST /api/payments/checkout` | 401 unauthorized (not 503) when Stripe configured |
| System checks | `/api/admin/system-checks` | Airtable, Resend, secrets OK (authenticated) |
| Drift | `npm run governance:drift` | Integrity score ≥ 85 |

## Gate Reference

Production deploy **blocked** if any gate fails (see `governance/config/deployment-gates.json`):

| Gate | Check |
|------|-------|
| Branch is main | `git.branch === main` |
| Known commit | Valid 40-char SHA |
| Release manifest | `docs/releases/latest.json` exists |
| Smoke tests | `GOVERNANCE_SMOKE_STATUS=passed` |
| Build | `.next` artifact or CI pass |
| Lint | ESLint clean |
| Env catalog sync | All required vars in `.env.example` |
| No unknown env | All `.env.example` vars in catalog |
| Redirects in Git | No dashboard-only redirects |
| Stripe documented | Catalog complete |
| Resend documented | Catalog complete |
| Airtable documented | Required vars present |
| Staging disabled | No staging flags in production |
| Repository clean | No uncommitted changes |

## Rollback Trigger

Rollback immediately if:

- Authentication broken (portal or admin login loop)
- Apply/enrollment data loss
- Payment processing errors on live transactions
- 5xx error rate spike

See [Recovery Playbook](./RECOVERY-PLAYBOOK.md) → Rollback Procedure.

## Artifacts Produced

| Artifact | Location |
|----------|----------|
| Release manifest | `docs/releases/RELEASE-<sha>-<date>.json` |
| Latest manifest | `docs/releases/latest.json` |
| Gate report | `governance/reports/deployment-readiness.md` |
| Drift report | `governance/reports/drift-report.json` |
