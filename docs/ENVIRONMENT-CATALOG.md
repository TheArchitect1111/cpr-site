# Environment Catalog

Canonical registry of every environment variable. **Source of truth:** `governance/config/env-catalog.json`

## Catalog Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Last Updated | 2026-07-07 |
| Total Variables | 39 |
| Required (Production) | 11 |

## Required Production Variables

| Name | Purpose | Owner | External Service |
|------|---------|-------|------------------|
| `AIRTABLE_TOKEN` | Airtable PAT | Mike CPR | Airtable |
| `AIRTABLE_BASE_ID` | CPR base ID | Mike CPR | Airtable |
| `AIRTABLE_TABLE_ID` | Athletes table | Mike CPR | Airtable |
| `PORTAL_SECRET` | Portal session HMAC | EA Platform Ops | — |
| `RESEND_API_KEY` | Email API key | Mike CPR | Resend |
| `RESEND_FROM_EMAIL` | Verified sender | Mike CPR | Resend |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL | EA Platform Ops | — |
| `BLOB_READ_WRITE_TOKEN` | File uploads | EA Platform Ops | Vercel Blob |
| `ADMIN_AUTH_SECRET` | Admin session HMAC | EA Platform Ops | — |
| `ADMIN_EMAIL` | Admin notifications | Mike CPR | — |
| `STRIPE_SECRET_KEY` | Payments | Mike CPR | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook verify | Mike CPR | Stripe |

## Flagged Issues

### Duplicates (consolidate to canonical name)

| Duplicate | Canonical |
|-----------|-----------|
| `AIRTABLE_API_KEY` | `AIRTABLE_TOKEN` |
| `MAKE_WEBHOOK_URL` | `MAKE_CPR_WEBHOOK` |

### Unused (remove or wire)

| Name | Notes |
|------|-------|
| `OPENAI_API_KEY` | In Vercel Production; no code references |

### Undocumented in `.env.example`

| Name | Action |
|------|--------|
| `CPR_STAGING_OPEN` | Add to `.env.example` with preview-only note |
| `NEXT_PUBLIC_CPR_STAGING_OPEN` | Add to `.env.example` |
| `PROFILE_SITE_URL` | Document or remove from Vercel |
| `ADMIN_SETUP_TOKEN` | Document or remove from Vercel |

### Feature Flags (forbidden on production)

| Name | Purpose |
|------|---------|
| `CPR_STAGING_OPEN` | Bypass auth, sample data |
| `NEXT_PUBLIC_CPR_STAGING_OPEN` | Client staging indicator |
| `DEMO_MODE` | Sample athlete/coach data |

## Validation

```bash
npm run governance:gates    # Validates catalog ↔ .env.example sync
npm run governance:drift      # Flags undocumented/unused vars
```

## Adding a New Variable

1. Add entry to `governance/config/env-catalog.json`
2. Add to `.env.example` with comment
3. Increment `environmentCatalogVersion` in `version-baseline.json`
4. Run `npm run governance:drift`

## Security Classifications

| Class | Handling |
|-------|----------|
| `secret` | Vercel encrypted; never in Git |
| `internal` | Vercel encrypted; documented defaults OK |
| `public` | `NEXT_PUBLIC_*` only |

## Rotation Schedule

See per-variable `rotationSchedule` in `env-catalog.json`. Secrets: 90–180 days.
