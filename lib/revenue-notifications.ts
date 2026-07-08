import { emailPage, sendEmail } from '@/lib/email';
import { adminEmail } from '@/lib/env';
import { getSiteUrl } from '@/lib/site-url';

type AgreementNotificationInput = {
  email: string;
  parentName: string;
  playerName: string;
  programOption: string;
  matched: boolean;
};

type PaymentNotificationInput = {
  email?: string;
  parentEmail?: string;
  athleteName: string;
  stageLabel: string;
  amount: string;
  sessionId: string;
  recordId: string;
};

export async function sendAgreementConfirmationEmail(input: AgreementNotificationInput): Promise<boolean> {
  try {
    await sendEmail({
      to: input.email,
      subject: 'CPR Fee Agreement Received',
      idempotencyKey: `cpr-agreement-confirm-${input.email}-${input.programOption}`,
      html: emailPage(
        'Fee agreement received',
        `
          <p>Hi ${input.parentName || 'there'},</p>
          <p>CPR Global Prospects received the fee agreement for <strong>${input.playerName}</strong>.</p>
          <p><strong>Selected option:</strong> ${input.programOption}</p>
          <p>CPR will review the agreement in Mission Control and send the correct payment link when it is time to move forward.</p>
        `,
      ),
    });
    return true;
  } catch (error) {
    console.error('Agreement confirmation email failed:', error);
    return false;
  }
}

export async function sendAgreementAdminAlert(input: AgreementNotificationInput): Promise<boolean> {
  try {
    await sendEmail({
      to: adminEmail(),
      subject: `CPR Fee Agreement Received - ${input.playerName}`,
      idempotencyKey: `cpr-agreement-admin-${input.email}-${input.programOption}`,
      html: emailPage(
        'Fee agreement submitted',
        `
          <p>A CPR fee agreement was submitted.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Player</td><td><strong>${input.playerName}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Parent</td><td>${input.parentName}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Email</td><td>${input.email}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Program</td><td>${input.programOption}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Matched record</td><td>${input.matched ? 'Yes' : 'No - new pending record created'}</td></tr>
          </table>
          <p><a href="${getSiteUrl()}/admin?tab=fee-agreements">Review agreements in Mission Control</a></p>
        `,
      ),
    });
    return true;
  } catch (error) {
    console.error('Agreement admin alert failed:', error);
    return false;
  }
}

export async function sendPaymentConfirmationEmail(input: PaymentNotificationInput): Promise<boolean> {
  const recipient = input.email || input.parentEmail;
  if (!recipient) return false;
  try {
    await sendEmail({
      to: recipient,
      subject: 'CPR Payment Received',
      idempotencyKey: `cpr-payment-confirm-${input.sessionId}`,
      html: emailPage(
        'Payment received',
        `
          <p>Thank you. CPR Global Prospects received the ${input.stageLabel} payment for <strong>${input.athleteName}</strong>.</p>
          <p><strong>Amount:</strong> ${input.amount || 'Confirmed by Stripe'}</p>
          <p>CPR will continue the onboarding process and follow up with portal access or next steps.</p>
        `,
      ),
    });
    return true;
  } catch (error) {
    console.error('Payment confirmation email failed:', error);
    return false;
  }
}

export async function sendPaymentAdminAlert(input: PaymentNotificationInput): Promise<boolean> {
  try {
    await sendEmail({
      to: adminEmail(),
      subject: `CPR Payment Confirmed - ${input.athleteName}`,
      idempotencyKey: `cpr-payment-admin-${input.sessionId}`,
      html: emailPage(
        'Payment confirmed by Stripe',
        `
          <p>Stripe confirmed a CPR payment.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Player</td><td><strong>${input.athleteName}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Stage</td><td>${input.stageLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Amount</td><td>${input.amount || 'Confirmed by Stripe'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Record ID</td><td>${input.recordId}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Stripe session</td><td>${input.sessionId}</td></tr>
          </table>
          <p><a href="${getSiteUrl()}/admin?tab=fee-agreements">Review payment status in Mission Control</a></p>
        `,
      ),
    });
    return true;
  } catch (error) {
    console.error('Payment admin alert failed:', error);
    return false;
  }
}
