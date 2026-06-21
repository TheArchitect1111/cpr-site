import { NextRequest, NextResponse } from 'next/server';

const BASE = 'appvVr6MVrJvEY0YJ';
const COACH_INQUIRIES = 'tblDIMW6Pc2l9jNjU';
const ATHLETES = 'tblZwrZHi3WBR3NHZ';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { athleteSlug, coachName, coachEmail, organization, inquiryType, message } = body as Record<string, string>;

    if (!coachName?.trim() || !coachEmail?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Coach name, email, and message are required.' },
        { status: 400 },
      );
    }
    if (!/\S+@\S+\.\S+/.test(coachEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 },
      );
    }

    const token = process.env.AIRTABLE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Look up athlete for the notification email
    let athleteFirstName = '';
    let athleteLastName = '';
    if (athleteSlug) {
      const safe = athleteSlug.replace(/[^a-z0-9-]/g, '');
      const ar = await fetch(
        `https://api.airtable.com/v0/${BASE}/${ATHLETES}?maxRecords=1` +
          `&filterByFormula=${encodeURIComponent(`{Slug}='${safe}'`)}` +
          `&fields[]=First+Name&fields[]=Last+Name`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (ar.ok) {
        const ad = await ar.json() as { records: { fields: Record<string, unknown> }[] };
        const r = ad.records?.[0]?.fields;
        if (r) {
          athleteFirstName = String(r['First Name'] ?? '');
          athleteLastName = String(r['Last Name'] ?? '');
        }
      }
    }

    // Save to Coach Inquiries table (field names with typecast)
    const record: Record<string, string> = {
      'Athlete Slug': String(athleteSlug ?? ''),
      'Coach Name': coachName.trim(),
      'Coach Email': coachEmail.trim(),
      'Submitted At': new Date().toISOString().slice(0, 10),
      'Message': message.trim(),
    };
    if (organization?.trim()) record['Organization'] = organization.trim();
    if (inquiryType?.trim()) record['Inquiry Type'] = inquiryType.trim();

    const saved = await fetch(`https://api.airtable.com/v0/${BASE}/${COACH_INQUIRIES}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [{ fields: record }], typecast: true }),
    });
    if (!saved.ok) {
      const detail = await saved.text();
      console.error('Coach inquiry save failed:', detail);
      return NextResponse.json(
        { error: 'Could not save inquiry. Please try again.' },
        { status: 502 },
      );
    }

    // Notify Mike via Resend
    const athleteName =
      [athleteFirstName, athleteLastName].filter(Boolean).join(' ') || athleteSlug || 'an athlete';
    const orgLine = organization?.trim() ? `<p><strong>Organization:</strong> ${organization.trim()}</p>` : '';
    const typeLine = inquiryType?.trim() ? `<p><strong>Inquiry Type:</strong> ${inquiryType.trim()}</p>` : '';

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CPR Portal <noreply@canadianprospects.com>',
          to: 'mikecprglobal@mississaugamagic.com',
          subject: `New coach inquiry for ${athleteName}`,
          html: `<p><strong>Coach / Contact:</strong> ${coachName.trim()}</p>
<p><strong>Email:</strong> ${coachEmail.trim()}</p>
${orgLine}
${typeLine}
<p><strong>Athlete:</strong> ${athleteName} (slug: ${athleteSlug ?? 'unknown'})</p>
<p><strong>Message:</strong><br/>${message.trim().replace(/\n/g, '<br/>')}</p>`,
        }),
      });
    } catch (err) {
      console.error('Resend notification failed:', err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Coach inquiry route error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
