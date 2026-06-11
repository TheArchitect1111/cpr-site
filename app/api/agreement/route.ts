import { NextResponse } from 'next/server';

const BASE = 'appvVr6MVrJvEY0YJ';
const TABLE = 'tblZwrZHi3WBR3NHZ';

export async function POST(req: Request) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  if (!String(b.email || '').trim()) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  if (b.terms !== 'Yes') return NextResponse.json({ error: 'Terms must be accepted' }, { status: 400 });
  if (!String(b.playerName || '').trim() || !String(b.parentName || '').trim()) {
    return NextResponse.json({ error: 'Player and parent names are required' }, { status: 400 });
  }

  const email = String(b.email).trim();
  const noteLines = [
    `--- Fee Agreement submitted ${new Date().toISOString().slice(0, 16).replace('T', ' ')} ---`,
    `Academic standing disclaimer acknowledged: ${b.academic === 'Yes' ? 'Yes' : 'No'}`,
    b.transcriptUrl ? `Transcript link: ${String(b.transcriptUrl).trim()}` : '',
    b.filmUrl ? `Game film link: ${String(b.filmUrl).trim()}` : '',
    `Fee Stage 1 ($500 outreach): ${b.fee1 === 'Yes' ? 'Acknowledged' : 'Declined'}`,
    `Fee Stage 2 ($500 application): ${b.fee2 === 'Yes' ? 'Acknowledged' : 'Declined'}`,
    `Fee Stage 3 ($500 approval): ${b.fee3 === 'Yes' ? 'Acknowledged' : 'Declined'}`,
    `NIL / Branding interest: ${b.nil === 'Yes' ? 'Yes' : 'No'}`,
  ].filter(Boolean).join('\n');

  const fields: Record<string, unknown> = {
    'Fee Stage 1 Acknowledged': b.fee1 === 'Yes',
    'Fee Stage 2 Acknowledged': b.fee2 === 'Yes',
    'Fee Stage 3 Acknowledged': b.fee3 === 'Yes',
    'NIL Interest': b.nil === 'Yes',
    'Terms Agreed': true,
    'Digital Signature': String(b.playerName).trim(),
    'Parent Name': String(b.parentName).trim(),
  };

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const safe = email.replace(/'/g, "\\'");
  const find = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=1&filterByFormula=${encodeURIComponent(`LOWER({Email})='${safe.toLowerCase()}'`)}`,
    { headers },
  );
  const found = find.ok ? ((await find.json()) as { records: { id: string; fields: Record<string, unknown> }[] }).records?.[0] : undefined;

  let res: Response;
  if (found) {
    const existingNotes = typeof found.fields['Notes'] === 'string' ? (found.fields['Notes'] as string) + '\n\n' : '';
    res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ records: [{ id: found.id, fields: { ...fields, Notes: existingNotes + noteLines } }], typecast: true }),
    });
  } else {
    res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: 'POST', headers,
      body: JSON.stringify({
        records: [{
          fields: {
            ...fields, Email: email, Notes: noteLines, Status: 'Pending',
            'First Name': String(b.playerName).trim().split(' ')[0] || 'Unknown',
            'Last Name': String(b.playerName).trim().split(' ').slice(1).join(' ') || '-',
            'Submitted At': new Date().toISOString().slice(0, 10),
          },
        }],
        typecast: true,
      }),
    });
  }
  if (!res.ok) {
    console.error('Airtable agreement error:', await res.text());
    return NextResponse.json({ error: 'Could not save agreement' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, matched: Boolean(found) });
}
