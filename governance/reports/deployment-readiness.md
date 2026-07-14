# Deployment Readiness Report

Generated: 2026-07-07T22:48:23.829Z

**Status:** ❌ BLOCKED

| Passed | Failed | Warnings |
|--------|--------|----------|
| 16 | 1 | 0 |

## Gate Results

✅ **Branch is main** — Skipped (not production check)
✅ **Git commit exists and is reachable** — SHA: 6034671
✅ **Release manifest exists for this commit** — Manifest matches current commit
✅ **Smoke tests passed** — passed
✅ **Production build succeeded** — passed
✅ **Lint passed** — passed
✅ **Required env vars documented in .env.example** — All required vars in .env.example
✅ **No undocumented variables in .env.example** — All .env.example vars in catalog
❌ **No dashboard-only redirects pending migration** — 3 dashboard-only redirect(s) must migrate to vercel.json
✅ **Stripe configuration documented** — 2 Stripe vars in catalog
✅ **Resend configuration documented** — 2 Resend vars in catalog
✅ **Required Airtable variables documented** — AIRTABLE_TOKEN, AIRTABLE_BASE_ID
✅ **Staging flags not enabled for production** — Staging flags off
✅ **All runtime flags cataloged** — 3 flags in catalog
✅ **All routes tracked in route manifest** — Routes tracked
✅ **Working tree clean for production deploy** — Uncommitted changes detected
✅ **Visual QA status recorded** — skipped