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
