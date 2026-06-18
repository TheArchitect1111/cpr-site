import { NextRequest, NextResponse } from 'next/server';
import { site } from '@/config/site';
import { emailPage, sendEmail } from '@/lib/email';
import { getOutreachByRecordId, recordCoachResponse, verifyOutreachShareToken } from '@/lib/outreach';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token') || '';
  if (!verifyOutreachShareToken(id, token)) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const response = String(form?.get('response') || '').trim();
  const detail = String(form?.get('detail') || '').trim();
  if (!response) return NextResponse.json({ error: 'Missing response' }, { status: 400 });

  try {
    const outreach = await getOutreachByRecordId(id);
    await recordCoachResponse(id, response, detail);
    if (outreach) {
      try {
        const adminEmail = process.env.ADMIN_EMAIL || site.footer.email;
        const labelMap: Record<string, string> = {
          interested: 'Interested',
          maybe: 'Maybe',
          request_info: 'Requested more information',
          not_fit: 'Not a fit',
        };
        const label = labelMap[response] || response;
        await sendEmail({
          to: adminEmail,
          subject: `Coach response: ${label} - ${outreach.prospect || outreach.prospectSlug}`,
          html: emailPage(
            'New coach response',
            `
              <p><strong>${outreach.coach || 'A coach'}</strong>${outreach.school ? ` from ${outreach.school}` : ''} responded to ${outreach.prospect || outreach.prospectSlug}.</p>
              <p><strong>Response:</strong> ${label}</p>
              ${detail ? `<p><strong>Note:</strong> ${detail}</p>` : ''}
            `,
          ),
          text: `${outreach.coach || 'A coach'}${outreach.school ? ` from ${outreach.school}` : ''} responded ${label} for ${outreach.prospect || outreach.prospectSlug}.${detail ? ` Note: ${detail}` : ''}`,
          idempotencyKey: `coach-response-notify-${id}-${response}-${Date.now()}`,
        });
      } catch (err) {
        console.error('Coach response notification failed:', err);
      }
    }
    const redirect = new URL(`/coach/${encodeURIComponent(id)}`, req.nextUrl.origin);
    redirect.searchParams.set('token', token);
    redirect.searchParams.set('thanks', '1');
    return NextResponse.redirect(redirect, 303);
  } catch (err) {
    console.error('Coach response failed:', err);
    return NextResponse.json({ error: 'Could not save response' }, { status: 502 });
  }
}
