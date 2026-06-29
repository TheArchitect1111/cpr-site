import { emailPage, sendEmail } from '@/lib/email';
import { adminEmail } from '@/lib/env';
import { getSiteUrl } from '@/lib/site-url';

export async function notifyAdminNewMessage(input: {
  athleteSlug: string;
  sender: string;
  messageBody: string;
  messageId: string;
}): Promise<boolean> {
  try {
    await sendEmail({
      to: adminEmail(),
      subject: `CPR Portal Message — ${input.sender} (${input.athleteSlug})`,
      idempotencyKey: `cpr-msg-admin-${input.messageId}`,
      html: emailPage(
        'New portal message',
        `
          <p>A family sent a message through the CPR portal.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Athlete slug</td><td><strong>${input.athleteSlug}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Sender</td><td>${input.sender}</td></tr>
          </table>
          <p style="margin-top:16px;white-space:pre-wrap">${input.messageBody}</p>
          <p><a href="${getSiteUrl()}/admin?tab=messages">Open messages in admin</a></p>
        `,
      ),
    });
    return true;
  } catch (err) {
    console.error('Admin message alert failed:', err);
    return false;
  }
}

export async function notifyAdminNewTicket(input: {
  athleteSlug: string;
  subject: string;
  message: string;
  ticketId: string;
}): Promise<boolean> {
  try {
    await sendEmail({
      to: adminEmail(),
      subject: `Ask CPR Ticket — ${input.subject}`,
      idempotencyKey: `cpr-ticket-admin-${input.ticketId}`,
      html: emailPage(
        'New Ask CPR ticket',
        `
          <p>A new support ticket was submitted from the CPR portal.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Athlete slug</td><td><strong>${input.athleteSlug}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Subject</td><td>${input.subject}</td></tr>
          </table>
          <p style="margin-top:16px;white-space:pre-wrap">${input.message}</p>
          <p><a href="${getSiteUrl()}/admin?tab=tickets">Open tickets in admin</a></p>
        `,
      ),
    });
    return true;
  } catch (err) {
    console.error('Admin ticket alert failed:', err);
    return false;
  }
}

export async function notifyOwnerUpdatePublished(input: {
  ownerEmail: string;
  ownerName: string;
  title: string;
  message: string;
  channels: Array<'website' | 'social'>;
  actions: string[];
  portalUrl: string;
  website?: { ok: boolean; detail: string };
  social?: { ok: boolean; detail: string; mode?: string };
}): Promise<{ ok: boolean; detail: string }> {
  const channelLabels = input.channels
    .map((c) => (c === 'website' ? 'Website / Portal' : 'Social Media (Amplifi)'))
    .join(', ');
  const actionList = input.actions.map((a) => `<li>${a}</li>`).join('');

  try {
    await sendEmail({
      to: input.ownerEmail,
      subject: `Update Hub confirmation — ${input.title}`,
      idempotencyKey: `cpr-update-confirm-${Date.now()}-${input.title.slice(0, 24)}`,
      html: emailPage(
        'Your update was submitted',
        `
          <p>Hi ${input.ownerName},</p>
          <p>Your Update Hub submission has been processed.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
            <tr><td style="padding:6px 0;color:#666">Title</td><td><strong>${input.title}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Channels</td><td>${channelLabels}</td></tr>
          </table>
          <p style="white-space:pre-wrap">${input.message}</p>
          <p><strong>Actions taken:</strong></p>
          <ul>${actionList}</ul>
          ${input.website ? `<p style="font-size:13px;color:#555">Portal: ${input.website.detail}</p>` : ''}
          ${input.social ? `<p style="font-size:13px;color:#555">Social: ${input.social.detail}</p>` : ''}
          <p><a href="${input.portalUrl}">View update feed</a></p>
        `,
      ),
      text: [
        `Update Hub confirmation — ${input.title}`,
        `Channels: ${channelLabels}`,
        '',
        input.message,
        '',
        'Actions taken:',
        ...input.actions.map((a) => `- ${a}`),
      ].join('\n'),
    });
    return { ok: true, detail: 'Confirmation email sent.' };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Confirmation email failed';
    console.error('Owner update confirmation failed:', error);
    return { ok: false, detail };
  }
}
