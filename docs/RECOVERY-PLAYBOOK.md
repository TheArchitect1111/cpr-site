# Recovery Playbook

Complete production recovery using **Git + documented infrastructure only**. A new developer should recreate CPR production from this guide.

## Recovery Checklist

- [ ] Access to GitHub repo `TheArchitect1111/cpr-site`
- [ ] Access to Vercel project `cpr-site`
- [ ] Access to Airtable base `appvVr6MVrJvEY0YJ`
- [ ] Access to Resend account (domain `mississaugamagic.com`)
- [ ] Access to Stripe account (when payments enabled)
- [ ] Access to Make.com scenarios
- [ ] Secret vault with env var values (1Password / Vercel export)
- [ ] Latest release manifest: `docs/releases/latest.json`

---

## Rollback Procedure

**When:** Bad deploy, broken auth, data corruption risk.

1. Open Vercel → `cpr-site` → Deployments
2. Find last known-good deployment (match SHA from previous `docs/releases/` manifest)
3. Click **Promote to Production**
4. Verify post-deploy checks in [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
5. Generate rollback manifest:
   ```bash
   GOVERNANCE_ROLLBACK_VERSION=<failed-release-version> npm run governance:manifest
   ```
6. If env var caused failure: revert in Vercel → redeploy same commit

**Do not roll back Airtable data** — fix forward in admin.

---

## Disaster Recovery

**When:** Vercel project lost, GitHub unavailable, or full platform rebuild.

### Step 1 — Code

```bash
git clone https://github.com/TheArchitect1111/cpr-site.git
cd cpr-site
git checkout main
git checkout $(jq -r '.git.commitSha' docs/releases/latest.json)
npm ci
```

### Step 2 — Vercel Project

1. Create Vercel project linked to `cpr-site` repo
2. Set production branch: `main`
3. Set Node.js version: 20 (match CI) or 24 (match current Vercel)
4. Import all env vars from [Environment Catalog](./ENVIRONMENT-CATALOG.md)
5. Connect Vercel Blob storage; set `BLOB_READ_WRITE_TOKEN`

### Step 3 — Domains

| Domain | Purpose |
|--------|-----------|
| `cpr-site.vercel.app` | Primary |
| `canadianprospectrecruitment.vercel.app` | Mike alias |

Add aliases in Vercel → Domains. Host redirects are in `vercel.json`.

### Step 4 — External Services

Follow recovery steps in [External Service Registry](./EXTERNAL-SERVICE-REGISTRY.md) for each service.

### Step 5 — Deploy & Verify

```bash
npm run verify:deploy
git push origin main
```

Run post-deploy verification from [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md).

---

## Environment Recreation

Copy every variable from `governance/config/env-catalog.json` into Vercel Production.

**Minimum viable production:**

```
AIRTABLE_TOKEN
AIRTABLE_BASE_ID
AIRTABLE_TABLE_ID
PORTAL_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_SITE_URL
BLOB_READ_WRITE_TOKEN
ADMIN_AUTH_SECRET
ADMIN_EMAIL
```

**Generate secrets:**

```bash
openssl rand -hex 32   # PORTAL_SECRET, ADMIN_AUTH_SECRET
```

**Forbidden on production:**

```
CPR_STAGING_OPEN=        # must be unset
DEMO_MODE=               # must be unset
```

---

## Dependency Restoration

| Dependency | Restore From |
|------------|--------------|
| Application code | Git @ manifest SHA |
| Env var values | Secret vault / Vercel export |
| Redirects | `vercel.json` + `redirects.manifest.json` |
| Airtable schema | Field IDs in `app/api/apply/route.ts`; base export backup |
| Blob files | Vercel Blob backup (not in Git) |
| Email domain | Resend dashboard verification |
| Stripe webhooks | Stripe dashboard → endpoint URL |
| Make webhooks | Make scenario URLs |

---

## External Service Recovery

See per-service **Recovery steps** in [External Service Registry](./EXTERNAL-SERVICE-REGISTRY.md).

Priority order:
1. Airtable (data)
2. Vercel (hosting)
3. Resend (communications)
4. Vercel Blob (documents)
5. Stripe (payments)
6. Make (automations)

---

## Deployment Verification

After recovery deploy:

```bash
npm run governance:drift        # Integrity score ≥ 85
npm run governance:gates -- --production
```

Manual checks:
- `/` loads
- `/portal/login` works
- `/admin/login` works
- `/api/admin/system-checks` (authenticated) all green

---

## Recovery Validation

Production recovery is complete when:

| Criterion | Verification |
|-----------|--------------|
| Git SHA matches manifest | `git rev-parse HEAD` = `latest.json` SHA |
| All gates pass | `governance:gates --production` exit 0 |
| Drift score ≥ 85 | `governance:drift` |
| External services healthy | System checks + manual flows |
| No staging flags | Vercel Production env review |
| Redirects in Git only | No dashboard-only rules |

---

## Emergency Contacts

| Role | Owner |
|------|-------|
| Platform Ops | EA Platform Ops |
| CPR Product | Mike CPR |
| Vercel Project | thearchitect11-7393 |

---

## Related

- [Deploy Runbook](./deploy-runbook.md)
- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
- [Drift Detection](./DRIFT-DETECTION.md)
