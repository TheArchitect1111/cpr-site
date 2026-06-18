import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { approvePendingAthleteUpdate, getAthleteByRecordId, rejectPendingAthleteUpdate } from '@/lib/athletes';
import { emailPage, sendEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> },
) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, updateId } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action === 'reject' ? 'reject' : 'approve';

  try {
    const athlete = await getAthleteByRecordId(id);
    if (action === 'reject') await rejectPendingAthleteUpdate(id, updateId);
    else await approvePendingAthleteUpdate(id, updateId);

    let emailError = '';
    if (athlete) {
      const recipients = Array.from(new Set([athlete.email, athlete.parentEmail].map(v => v.trim()).filter(Boolean)));
      if (recipients.length > 0) {
        try {
          const athleteName = `${athlete.firstName} ${athlete.lastName}`.trim() || 'your athlete';
          const approved = action === 'approve';
          await sendEmail({
            to: recipients,
            subject: approved ? 'Your CPR profile updates were approved' : 'Your CPR profile updates were reviewed',
            html: emailPage(
              approved ? 'Profile updates approved' : 'Profile updates reviewed',
              approved
                ? `<p>Hi ${athlete.firstName || 'there'},</p><p>Your submitted profile updates for ${athleteName} have been approved and published by Canadian Prospects Recruitment.</p><p>You can continue to use your private edit link whenever future updates are needed.</p>`
                : `<p>Hi ${athlete.firstName || 'there'},</p><p>Canadian Prospects Recruitment reviewed the submitted updates for ${athleteName}. The changes were not published at this time.</p><p>Please contact us if you have questions or want to resubmit corrected information.</p>`,
            ),
            text: approved
              ? `Your submitted CPR profile updates for ${athleteName} were approved and published.`
              : `Your submitted CPR profile updates for ${athleteName} were reviewed and were not published at this time.`,
            idempotencyKey: `profile-update-${action}-${id}-${updateId}`,
          });
        } catch (err) {
          emailError = err instanceof Error ? err.message : 'Email notification failed.';
          console.error('Applicant profile review email failed:', err);
        }
      }
    }

    return NextResponse.json({ ok: true, emailError: emailError || undefined });
  } catch (err) {
    console.error('Pending profile update action failed:', err);
    const message = err instanceof Error ? err.message : 'Could not process pending update.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
