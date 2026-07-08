import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const failures = [];
const warnings = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
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
const resourcesPage = read('app/resources/page.tsx');
const applyPage = read('app/apply/page.tsx');
const intakePage = read('app/intake/page.tsx');
const agreementRoute = read('app/api/agreement/route.ts');
const portalCreateRoute = read('app/api/portal/create-client/route.ts');

assert(!siteConfig.includes('docs.google.com/forms') && !siteConfig.includes('forms.gle'), 'config/site.ts must not contain Google Forms registration URLs.');
assert(!landingConfig.includes('docs.google.com/forms') && !landingConfig.includes('forms.gle'), 'config/landing.ts must not contain Google Forms registration URLs.');
assert(!resourcesPage.includes('docs.google.com/forms') && !resourcesPage.includes('forms.gle'), 'Resources page must not link to Google Forms registration URLs.');
assert(siteConfig.includes('"/apply"') || siteConfig.includes("'/apply'"), 'config/site.ts must point application links to /apply.');
assert(landingConfig.includes("'/apply'") || landingConfig.includes('"/apply"'), 'config/landing.ts must point application links to /apply.');
assert(applyPage.includes("fetch('/api/apply'"), '/apply must submit to /api/apply.');
assert(intakePage.includes('PLAYER_APPLICATION_URL'), '/intake must continue through the canonical application URL.');
assert(agreementRoute.includes('sendAgreementConfirmationEmail'), 'Agreement route must send family confirmation.');
assert(agreementRoute.includes('sendAgreementAdminAlert'), 'Agreement route must send admin notification.');
assert(webhook.includes('sendPaymentConfirmationEmail'), 'Stripe webhook must send payment confirmation.');
assert(webhook.includes('sendPaymentAdminAlert'), 'Stripe webhook must send payment admin notification.');
assert(portalCreateRoute.includes('Welcome to CPR Parent Success Portal'), 'Portal creation must send parent invitation.');
assert(portalCreateRoute.includes('Welcome to Your CPR Recruiting Portal'), 'Portal creation must send athlete invitation.');

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
