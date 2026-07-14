# External Service Registry

**Source of truth:** `governance/config/external-services.json`

## Service Summary

| Service | Purpose | Failure Impact | Owner |
|---------|---------|----------------|-------|
| [Airtable](#airtable) | Primary data store | Critical | Mike CPR |
| [Stripe](#stripe) | Fee payments | High | Mike CPR |
| [Resend](#resend) | Transactional email | High | Mike CPR |
| [Make.com](#makecom) | Automation webhooks | Medium | EA Platform Ops |
| [Google Forms](#google-forms) | External apply/agreements | Critical | Mike CPR |
| [Vercel Blob](#vercel-blob) | File storage | Medium | EA Platform Ops |
| [OpenAI](#openai) | Reserved/unused | None | EA Platform Ops |
| [EA Pulse](#ea-pulse) | Telemetry | Low | EA Platform Ops |
| [Sentry](#sentry) | Error monitoring | Low | EA Platform Ops |
| [Vercel](#vercel) | Hosting & deploy | Critical | EA Platform Ops |

---

## Airtable

**Purpose:** Athletes, coaches, admin users, portal content, tickets, events.

**Credentials:** `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`

**Configuration:** Base `appvVr6MVrJvEY0YJ`; schema version `2026-07-01`

**Connected modules:** Registration, Portal, Admin, Communications, Documents

**Health verification:** Authenticated `GET /api/admin/system-checks`

**Recovery:** Verify PAT permissions; confirm table IDs in `app/api/apply/route.ts` field map

**Backup:** Weekly Airtable export; field IDs in source code

---

## Stripe

**Purpose:** CPR fee payment checkout and webhook processing.

**Credentials:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`

**Configuration:** Webhook `https://cpr-site.vercel.app/api/webhooks/stripe`

**Connected modules:** Payments

**Failure impact:** High — `POST /api/payments/checkout` returns 503

**Health verification:** System checks; checkout returns 401 (not 503) when configured

**Recovery:** Create keys → Vercel Production → register webhook → test checkout

**Backup:** Stripe Dashboard export; metadata includes `recordId`

---

## Resend

**Purpose:** Apply confirmations, enrollments, admin alerts.

**Credentials:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`

**Configuration:** Domain `mississaugamagic.com`

**Connected modules:** Communications, Registration, Admin

**Health verification:** System checks Resend entry

**Recovery:** Verify domain → confirm API key → test send via apply flow

**Backup:** Resend delivery logs

---

## Make.com

**Purpose:** Apply and enrollment automation scenarios.

**Credentials:** `MAKE_CPR_WEBHOOK`, `CPR_ENROLL_WEBHOOK_URL`

**Connected modules:** Registration, Admin

**Health verification:** System checks webhook entries

**Recovery:** Export scenario → update Vercel URLs → test payload

**Backup:** Scenario export; in-app Resend as apply fallback

---

## Google Forms

**Purpose:** Current production apply and fee agreement UX.

**Credentials:** None (public URLs in `config/site.ts`)

**Configuration:** `PLAYER_APPLICATION_URL`, `STANDARD_FEE_AGREEMENT_URL`

**Connected modules:** Registration

**Health verification:** `GET /apply` → 307 to expected Form URL

**Recovery:** Verify form ownership; update `config/site.ts`

**Backup:** Form export; on-platform `/api/apply` as alternate

---

## Vercel Blob

**Purpose:** Apply photos and profile documents.

**Credentials:** `BLOB_READ_WRITE_TOKEN`

**Connected modules:** Documents, Registration

**Health verification:** System checks Blob entry

**Recovery:** Regenerate token in Vercel Storage

**Backup:** Critical documents exported periodically (not in Git)

---

## OpenAI

**Purpose:** Reserved — key in Vercel, unused in codebase.

**Action:** Remove key or wire to future AI module.

---

## EA Pulse

**Purpose:** Platform telemetry forwarding.

**Credentials:** `EA_PULSE_INGEST_URL`, `EA_CAPTURE_API_KEY`

**Status:** Optional, not configured

**Health verification:** Test event to ingest URL

---

## Sentry

**Purpose:** Error monitoring.

**Credentials:** `NEXT_PUBLIC_SENTRY_DSN`

**Docs:** `docs/sentry-setup.md`

---

## Vercel

**Purpose:** Hosting, env vars, deployments, domains.

**Configuration:** Project `cpr-site`; branch `main`

**Recovery:** See [Recovery Playbook](./RECOVERY-PLAYBOOK.md)

**Health verification:** `npm run governance:drift`; deployment Ready in dashboard
