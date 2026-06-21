import { emailPage, sendEmail } from '@/lib/email';
import { adminEmail } from '@/lib/env';
import { getSiteUrl } from '@/lib/site-url';

type ApplyEmailInput = {
  recordId: string;
  firstName: string;
  lastName: string;
  email: string;
  slug: string;
  profileUrl: string;
  sport?: string;
  position?: string;
  currentSchool?: string;
  gradYear?: string;
  parentEmail?: string;
};

export async function sendApplyConfirmationEmail(input: ApplyEmailInput): Promise<boolean> {
  try {
    await sendEmail({
      to: input.email,
      subject: 'CPR Application Received',
      idempotencyKey: `cpr-apply-confirm-${input.recordId}`,
      html: emailPage(
        'Application received',
        `
          <p>Hi ${input.firstName},</p>
          <p>Thank you for applying to Canadian Prospects Recruitment. We received your application and created your recruiting profile.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Coach Mike will review your application in the CPR admin portal.</li>
            <li>You will receive updates as your profile moves through the recruiting process.</li>
          </ul>
          <p>Your profile reference: <strong>${input.slug}</strong></p>
          <p><a href="${input.profileUrl}">View your public profile page</a></p>
        `,
      ),
    });
    return true;
  } catch (err) {
    console.error('Apply confirmation email failed:', err);
    return false;
  }
}

export async function sendApplyAdminAlert(input: ApplyEmailInput): Promise<boolean> {
  const admin = adminEmail();
  try {
    await sendEmail({
      to: admin,
      subject: `New CPR Application — ${input.firstName} ${input.lastName}`,
      idempotencyKey: `cpr-apply-admin-${input.recordId}`,
      html: emailPage(
        'New online application',
        `
          <p>A new athlete application was submitted on ${getSiteUrl()}.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Name</td><td><strong>${input.firstName} ${input.lastName}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Email</td><td>${input.email}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Sport</td><td>${input.sport || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Position</td><td>${input.position || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">School</td><td>${input.currentSchool || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Grad year</td><td>${input.gradYear || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Parent email</td><td>${input.parentEmail || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Record ID</td><td>${input.recordId}</td></tr>
          </table>
          <p><a href="${getSiteUrl()}/admin">Open CPR admin portal</a></p>
        `,
      ),
    });
    return true;
  } catch (err) {
    console.error('Apply admin alert email failed:', err);
    return false;
  }
}
