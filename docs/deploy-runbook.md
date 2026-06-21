# CPR Deploy Runbook

Production URLs (all should show the same site):

- https://cpr-site.vercel.app (primary)
- https://canadianprospectrecruitment.vercel.app (Mike alias)
- https://template-sports-recruitment.vercel.app (redirects to primary)

**Not the CPR recruitment site:** https://mississaugamagic.com (WordPress — basketball org only)

## Pre-deploy checklist

1. Copy `.env.example` and set all required variables in Vercel **Production**.
2. Verify Resend domain for `mississaugamagic.com` (or your `RESEND_FROM_EMAIL` domain).
3. Confirm Airtable PAT has read/write on base `appvVr6MVrJvEY0YJ`.
4. Set `PORTAL_SECRET` to a unique 32+ byte random value (never use dev default in production).
5. Set `BLOB_READ_WRITE_TOKEN` from Vercel → Storage → Blob.
6. Set `CPR_ENROLL_WEBHOOK_URL` to the Make enroll scenario webhook (if using Make).
7. Optionally set `MAKE_CPR_WEBHOOK` for legacy Make apply automation (in-app Resend also sends apply emails).

## Deploy

```bash
npm run lint
npm run build
npm run test:smoke
git push origin main
```

Vercel auto-deploys from `main`. Confirm the deployment uses **Production** env vars, not Preview-only secrets.

## Post-deploy verification

Run these on production:

| Flow | Steps | Pass criteria |
|------|-------|---------------|
| Apply | Submit `/apply` with test data + mobile photo | Airtable row created; confirmation email to athlete; admin alert to `ADMIN_EMAIL` |
| Admin | Log in at `/admin/login` | Live registrants (no sample Jayden unless `DEMO_MODE=1`) |
| Create client | `/admin/create-client` | Airtable row; welcome emails; Make webhook if configured |
| Portal | Log in as athlete/parent | Dashboard loads; session persists |
| Intake redirect | Visit `/intake` | Redirects to `/apply` |
| System checks | Admin → system checks (if exposed) | Airtable, Resend, secrets OK |

## Rollback

1. Vercel → Deployments → select last known-good deployment → **Promote to Production**.
2. If env var change caused the issue, revert the variable in Vercel and redeploy.
3. Do not roll back Airtable data — fix forward in admin if bad records were created during testing.

## Common failures

| Symptom | Fix |
|---------|-----|
| Apply saves but no email | Set `RESEND_API_KEY` + verified `RESEND_FROM_EMAIL` |
| Portal login 503 | Set `PORTAL_SECRET` in production |
| Mobile photo missing on profile | Set `BLOB_READ_WRITE_TOKEN` |
| Create client no Make trigger | Set `CPR_ENROLL_WEBHOOK_URL` |
| Admin shows sample athlete | Remove `DEMO_MODE`; ensure `AIRTABLE_TOKEN` is set |

## Do not

- Share legacy `www.efficiencyarchitects.online` as CPR.
- Enable `DEMO_MODE` on paying-client production deploys.
- Hardcode webhook URLs in source — use env vars only.
