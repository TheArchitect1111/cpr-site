import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const failures = [];
const warnings = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};
const warn = (condition, message) => {
  if (!condition) warnings.push(message);
};

const envExample = read('.env.example');
for (const key of [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_CURRENCY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'ADMIN_EMAIL',
  'AIRTABLE_TOKEN',
  'MAKE_CPR_WEBHOOK',
]) {
  assert(envExample.includes(`${key}=`), `.env.example is missing ${key}.`);
}

const checkout = read('app/api/payments/checkout/route.ts');
assert(checkout.includes('verifyAthleteEditToken(recordId, token)'), 'Checkout must verify payment link tokens.');
assert(checkout.includes('isPaymentStage(stage)'), 'Checkout must validate payment stages.');
assert(checkout.includes("mode: 'payment'"), 'Checkout must create one-time Stripe payments.');
assert(checkout.includes('metadata:'), 'Checkout must send metadata for webhook reconciliation.');
assert(checkout.includes('session.url'), 'Checkout must return a Stripe-hosted checkout URL.');
assert(checkout.includes('Stripe checkout creation failed'), 'Checkout must handle Stripe API failures safely.');

const webhook = read('app/api/webhooks/stripe/route.ts');
assert(webhook.includes('constructEvent'), 'Stripe webhook must verify signatures.');
assert(webhook.includes('checkout.session.completed'), 'Stripe webhook must handle completed checkouts.');
assert(webhook.includes('markAthletePaymentPaid'), 'Stripe webhook must update applicant payment status.');

const payPage = read('app/pay/page.tsx');
assert(payPage.includes('verifyAthleteEditToken(recordId, token)'), 'Payment page must reject invalid payment links.');
assert(payPage.includes('PAYMENT LINK INVALID'), 'Payment page must show invalid-link handling.');
assert(payPage.includes("status === 'success'"), 'Payment page must show success state.');
assert(payPage.includes("status === 'cancelled'"), 'Payment page must show cancelled state.');

const adminClient = read('app/admin/AdminClient.tsx');
assert(adminClient.includes('copyPaymentLink'), 'Admin must expose payment link creation.');
assert(adminClient.includes('feeStage1'), 'Admin must expose payment status fields.');

const siteConfig = read('config/site.ts');
const landingConfig = read('config/landing.ts');
warn(!siteConfig.includes('docs.google.com/forms'), 'config/site.ts still contains Google Forms application/agreement URLs.');
warn(!landingConfig.includes('docs.google.com/forms') && !landingConfig.includes('forms.gle'), 'config/landing.ts still contains Google Forms application/agreement URLs.');

if (failures.length) {
  console.error('Revenue smoke checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('Revenue smoke checks passed.');
if (warnings.length) {
  console.log('Certification warnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
