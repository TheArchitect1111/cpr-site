# Platform Manifest

Machine-readable platform description for CPR. **Generated artifact:** `governance/config/platform.manifest.json`

Regenerate after structural changes:

```bash
npm run governance:platform
```

## Application

| Field | Value |
|-------|-------|
| ID | `cpr` |
| Name | Canadian Prospects Recruitment |
| Production URL | https://cpr-site.vercel.app |
| Production Branch | `main` |
| Vercel Project | `cpr-site` |
| Platform Version | `1.0.0` |

## Modules

| Module | Status | Primary Files |
|--------|--------|---------------|
| Authentication | Live | `middleware.ts`, `app/api/auth/`, `lib/admin-auth.ts` |
| Registration | Live (Google Forms UX) | `config/site.ts`, `app/apply/page.tsx`, `app/api/apply/route.ts` |
| Portal | Live | `app/portal/**` |
| Admin | Live | `app/admin/**`, `app/api/admin/**` |
| Payments | Code ready, Stripe unconfigured | `app/api/payments/`, `app/api/portal/payments/link`, portal Payments tab, `lib/stripe.ts` |
| Communications | Partial | `lib/email.ts`, `app/api/ask-cpr/`, Resend |
| Documents | Live | `app/api/upload/`, Vercel Blob |
| Staging | Env-gated | `lib/staging.ts` |
| Experience Lab | Fix branch only | `app/cpr-experience-lab/` |
| Website Builder | Fix branch only | `app/website-builder/` |
| Orbie | Fix branch only | `app/components/orbie/` |

## Version Stack

| Component | Source |
|-----------|--------|
| Application | `package.json` version |
| Next.js | `package-lock.json` |
| Node | CI Node 20 / Vercel Node 24 |
| Chassis | `vendor/portal-chassis/package.json` |
| Portal | `governance/config/version-baseline.json` |
| Orbie | `governance/config/version-baseline.json` |

## Routing

- **Middleware matcher:** `/admin/*`, `/portal/login`, `/portal/athlete/*`, `/portal/parent/*`
- **Redirects:** `vercel.json` (host aliases only; path redirects must be migrated from dashboard)
- **Route inventory:** `governance/config/route-manifest.json`

## Environment & Feature Flags

- Catalog: `governance/config/env-catalog.json` (v1.0.0)
- Feature flags: `governance/config/feature-flags.json`
- Forbidden on production: `CPR_STAGING_OPEN`, `NEXT_PUBLIC_CPR_STAGING_OPEN`, `DEMO_MODE`

## External Integrations

See [External Service Registry](./EXTERNAL-SERVICE-REGISTRY.md).

## Deployment

- CI: `.github/workflows/ci.yml`
- Governance: `.github/workflows/release-governance.yml`
- Verify: `npm run verify:deploy`
