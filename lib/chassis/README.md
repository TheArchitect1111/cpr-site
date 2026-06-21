# CPR chassis binding

CPR consumes **`@ea/portal-chassis`** from `vendor/portal-chassis` (Vercel-compatible vendored build).

**Source of truth:** `ea-operating-system/portal-core`  
**Sync before deploy when chassis changes:**

```bash
npm run sync-chassis
```

Only CPR-specific config lives here:

- `cpr-portal.ts` — cookie names + `PORTAL_SECRET` env key

Adapters (keep thin):

- `lib/portal-auth.ts`
- `lib/env.ts`
- `middleware.ts`
- `app/portal/components/PortalShell.tsx`
