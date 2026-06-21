# EA Portal Chassis (CPR copy)

Synced from `ea-operating-system/portal-core` — **commit a39442c**.

When chassis changes upstream, copy updated files into this folder and redeploy CPR.

| File | Purpose |
|------|---------|
| `env.ts` | Production guards, demo mode |
| `auth/hmac-session.ts` | Signed portal cookies |
| `auth/hmac-middleware-factory.ts` | Athlete/parent + admin route protection |
| `layout/HeaderPortalShell.tsx` | Config-driven portal header |
| `cpr-portal.ts` | CPR cookie names + secret env key |

CPR adapters (keep thin):

- `lib/portal-auth.ts` → wraps `hmac-session` + `cpr-portal.ts`
- `middleware.ts` → uses `createHmacPortalMiddleware`
- `app/portal/components/PortalShell.tsx` → wraps `HeaderPortalShell`
