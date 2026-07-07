# External Service Registry

External services must be documented before release so failures can be diagnosed without developer archaeology.

## Current Service Classes

- Airtable: operating data
- Resend: transactional and inbound email
- Stripe: payments
- Vercel Blob: uploaded assets
- Sentry: error monitoring
- Make.com: automation webhooks

Each production release should confirm ownership, credentials, webhook health, and rollback posture for active services.

