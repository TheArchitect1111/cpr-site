import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/hash';
import { signSession, makeSessionCookie, newExpiry, PORTAL_COOKIE } from '@/lib/portal-auth';

const BASE = 'appvVr6MVrJvEY0YJ';
const TABLE = 'tblZwrZHi3WBR3NHZ';

type AirtableRecord = { id: string; fields: Record<string, unknown> };

async function queryAirtable(token: string, formula: string): Promise<AirtableRecord | null> {
  const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { records: AirtableRecord[] };
  return data.records?.[0] ?? null;
}

async function patchLastLogin(token: string, recordId: string, field: string): Promise<void> {
  await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ id: recordId, fields: { [field]: new Date().toISOString() } }],
    }),
  }).catch(() => {/* non-fatal */});
}

export async function POST(req: NextRequest) {
  const airtableToken = process.env.AIRTABLE_TOKEN;
  if (!airtableToken) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const username = String(body.username ?? '').trim().toLowerCase();
  const password = String(body.password ?? '').trim();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  // Try athlete credentials
  const safeUser = username.replace(/'/g, "\\'");
  const athleteRecord = await queryAirtable(
    airtableToken,
    `LOWER({Athlete Username})='${safeUser}'`,
  );
  if (athleteRecord) {
    const storedHash = String(athleteRecord.fields['Athlete Password Hash'] ?? '');
    const slug = String(athleteRecord.fields['Slug'] ?? '');
    if (storedHash && slug && verifyPassword(password, storedHash)) {
      void patchLastLogin(airtableToken, athleteRecord.id, 'Athlete Portal Last Login');
      const token = await signSession({ type: 'athlete', slug, exp: newExpiry() });
      const res = NextResponse.json({ ok: true, type: 'athlete', slug });
      res.cookies.set(makeSessionCookie(token));
      return res;
    }
  }

  // Try parent credentials
  const parentRecord = await queryAirtable(
    airtableToken,
    `LOWER({Parent Username})='${safeUser}'`,
  );
  if (parentRecord) {
    const storedHash = String(parentRecord.fields['Parent Password Hash'] ?? '');
    const slug = String(parentRecord.fields['Slug'] ?? '');
    if (storedHash && slug && verifyPassword(password, storedHash)) {
      void patchLastLogin(airtableToken, parentRecord.id, 'Parent Portal Last Login');
      const token = await signSession({ type: 'parent', slug, exp: newExpiry() });
      const res = NextResponse.json({ ok: true, type: 'parent', slug });
      res.cookies.set(makeSessionCookie(token));
      return res;
    }
  }

  // Same response for wrong username OR wrong password (no enumeration)
  return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: PORTAL_COOKIE, value: '', maxAge: 0, path: '/' });
  return res;
}
