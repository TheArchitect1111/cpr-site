import { NextResponse } from 'next/server';

const BASE = 'appvVr6MVrJvEY0YJ';
const TABLE = 'tblZwrZHi3WBR3NHZ';

export async function POST(req: Request) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ error: 'Bad request' }, { status: 400 }); // honeypot
  const need = ['firstName', 'lastName', 'email', 'position', 'gradYear'];
  for (const k of need) if (!String(b[k] || '').trim()) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });

  const fields: Record<string, unknown> = {
    'First Name': String(b.firstName).trim(),
    'Last Name': String(b.lastName).trim(),
    'Email': String(b.email).trim(),
    'Status': 'Pending',
    'Submitted At': new Date().toISOString().slice(0, 10),
  };
  const map: [string, string][] = [
    ['phone', 'Phone'], ['dob', 'Date of Birth'], ['sport', 'Sport'], ['position', 'Position'],
    ['height', 'Height'], ['school', 'Current School'], ['city', 'City / Province'],
    ['parentName', 'Parent Name'], ['parentEmail', 'Parent Email'], ['parentPhone', 'Parent Phone'],
    ['bio', 'Bio'], ['strengths', 'Strengths'], ['videoUrl', 'Highlight Video URL'],
  ];
  for (const [k, f] of map) if (String(b[k] || '').trim()) fields[f] = String(b[k]).trim();
  for (const [k, f] of [['weight', 'Weight'], ['wingspan', 'Wingspan'], ['gpa', 'GPA'], ['sat', 'SAT Score'], ['gradYear', 'Graduation Year']] as [string, string][]) {
    const n = parseFloat(b[k]); if (!isNaN(n)) fields[f] = n;
  }

  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error('Airtable apply error:', detail);
    return NextResponse.json({ error: 'Could not save application' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
