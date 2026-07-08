# CPR Revenue Path Certification

This document records the production revenue path that must be verified before launch.

## Intended Flow

1. Family starts from the public CPR landing page.
2. Family submits an application.
3. CPR admin reviews the applicant in Mission Control.
4. Admin sends the fee agreement link.
5. Family submits the agreement.
6. Admin sends a signed payment link for the correct fee stage.
7. Family completes Stripe Checkout.
8. Stripe calls `/api/webhooks/stripe`.
9. CPR updates the applicant payment stage in Airtable.
10. Admin confirms the record in Mission Control.
11. Parent or athlete receives portal access through the approved authentication path.

## Required Production Environment

Do not expose secret values in reports.

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CURRENCY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_EMAIL`
- `AIRTABLE_TOKEN`
- `MAKE_CPR_WEBHOOK`

## Stripe Setup Checklist

1. Create or confirm the Stripe account used for CPR production.
2. Add `STRIPE_SECRET_KEY` to Vercel Production.
3. Add `STRIPE_CURRENCY` to Vercel Production. Use a three-letter ISO currency such as `CAD`.
4. Create a webhook endpoint pointing to:

   `https://<production-domain>/api/webhooks/stripe`

5. Subscribe the endpoint to:

   `checkout.session.completed`

6. Add the endpoint signing secret as `STRIPE_WEBHOOK_SECRET`.
7. In Mission Control, copy a payment link for a real applicant with a valid edit token.
8. Complete a Stripe Checkout test or live transaction according to the launch approval plan.
9. Confirm Airtable marks the matching fee stage as paid.
10. Confirm Mission Control shows the updated payment status.

## Current Certification Notes

- Checkout is Stripe-hosted.
- Checkout links require a valid applicant record ID, stage, and edit token.
- Invalid payment links render a safe public message.
- Stripe webhooks verify signatures before updating Airtable.
- The public application and agreement links still contain Google Forms URLs. This must be either explicitly approved as the launch path or replaced with the in-platform flow before production certification can pass unconditionally.
