import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { getAthlete } from '@/lib/athletes';
import { appendOutreachActivity, getOutreachByRecordId } from '@/lib/outreach';
import { emailPage, sendEmail } from '@/lib/email';

const templates: Record<string, { subject: string; body: string }> = {
  initial: {
    subject: '{athleteName} - CPR Global Prospects recruiting profile',
    body: 'CPR Global Prospects is sharing {athleteName}\'s private recruiting profile for your review{schoolText}. If you would like transcripts, full game film, or an introduction, reply to this email and we will coordinate the next step.',
  },
  follow_up: {
    subject: 'Follow up: {athleteName} recruiting profile',
    body: 'Following up on {athleteName}\'s recruiting profile. CPR can provide additional film, academic details, and a direct introduction if this student-athlete fits your recruiting board.',
  },
  tournament: {
    subject: 'Tournament update: {athleteName}',
    body: '{athleteName} has new recruiting material available after recent competition. Please review the private CPR profile and reply if you would like the latest film or schedule details.',
  },
};

function fill(text: string, values: Record<string, string>) {
  return Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, value), text);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const outreach = await getOutreachByRecordId(id);
    if (!outreach) return NextResponse.json({ error: 'Outreach record not found.' }, { status: 404 });
    if (!outreach.prospectSlug) return NextResponse.json({ error: 'Add an athlete slug before sending this link.' }, { status: 400 });

    const to = String(body?.email || outreach.coachEmail || '').trim();
    if (!to) return NextResponse.json({ error: 'Add a coach email before sending this link.' }, { status: 400 });

    const athlete = await getAthlete(outreach.prospectSlug, { includeHidden: true });
    if (!athlete) return NextResponse.json({ error: 'Linked athlete profile was not found.' }, { status: 404 });

    const origin = req.nextUrl.origin;
    const shareUrl = `${origin}/coach/${encodeURIComponent(outreach.id)}?token=${encodeURIComponent(outreach.shareToken)}`;
    const athleteName = `${athlete.firstName} ${athlete.lastName}`.trim();
    const coachName = outreach.coach || 'Coach';
    const school = outreach.school ? ` at ${outreach.school}` : '';
    const selectedTemplate = templates[String(body?.template || 'initial')] || templates.initial;
    const values = { athleteName, coachName, school: outreach.school, schoolText: school, shareUrl };
    const subject = fill(String(body?.subject || selectedTemplate.subject), values);
    const message = fill(String(body?.message || selectedTemplate.body), values);

    const html = emailPage(
      `${athleteName} recruiting profile`,
      `
        <p>Hi ${coachName},</p>
        <p>${message}</p>
        <p><a href="${shareUrl}" style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;font-weight:700;padding:11px 16px;border-radius:6px">View Recruiting Profile</a></p>
      `,
    );

    const sent = await sendEmail({
      to,
      subject,
      html,
      text: `Hi ${coachName},\n\n${message}\n\nView the profile: ${shareUrl}`,
      idempotencyKey: `coach-share-${outreach.id}-${to}-${String(body?.template || 'initial')}`,
    });
    await appendOutreachActivity(outreach.id, `Admin sent coach share link to ${to}.${sent.id ? ` Resend email ID: ${sent.id}.` : ''}`);
    return NextResponse.json({ ok: true, emailId: sent.id });
  } catch (err) {
    console.error('Coach share email failed:', err);
    const message = err instanceof Error ? err.message : 'Could not send coach share link.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
