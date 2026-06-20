# Sentry setup (`cpr-site`)

Sentry is wired in code and **activates only when a DSN is set**.

## Vercel environment variables

Set in **Production** (and Preview if desired):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | From Sentry project → Settings → Client Keys (DSN) |

## Verify

1. Add DSN in Vercel Production for `cpr-site`.
2. Redeploy.
3. Confirm test events in Sentry dashboard.

## References

- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
