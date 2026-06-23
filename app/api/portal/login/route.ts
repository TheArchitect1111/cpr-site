import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/hash';
import {
  checkLoginAllowed,
  clearLoginGuard,
  recordLoginFailure,
} from '@/lib/login-rate-limit';
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

async function patchActivityFields(
  token: string,
  record: AirtableRecord,
  loginType: 'Athlete' | 'Parent'
): Promise<void> {
  const now = new Date().toISOString();
  const currentLogins = Number(record.fields['Total Logins'] ?? 0);
  const legacyField =
    loginType === 'Athlete' ? 'Athlete Portal Last Login' : 'Parent Portal Last Login';

  await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}/${record.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'Last Login': now,
        'Last Login Type': loginType,
        'Total Logins': currentLogins + 1,
        [legacyField]: now,
      },
    }),
  }).catch(() => { /* non-fatal */ });
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

  const guardCheck = checkLoginAllowed(req, 'portal', username);
  if (!guardCheck.allowed) {
    return NextResponse.json({ error: guardCheck.message }, { status: 429 });
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
      void patchActivityFields(airtableToken, athleteRecord, 'Athlete');
      const token = await signSession({ type: 'athlete', slug, exp: newExpiry() });
      if (!token) {
        return NextResponse.json({ error: 'Portal login is temporarily unavailable.' }, { status: 503 });
      }
      const res = NextResponse.json({ ok: true, type: 'athlete', slug });
      res.cookies.set(makeSessionCookie(token));
      clearLoginGuard(res, 'portal');
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
      void patchActivityFields(airtableToken, parentRecord, 'Parent');
      const token = await signSession({ type: 'parent', slug, exp: newExpiry() });
      if (!token) {
        return NextResponse.json({ error: 'Portal login is temporarily unavailable.' }, { status: 503 });
      }
      const res = NextResponse.json({ ok: true, type: 'parent', slug });
      res.cookies.set(makeSessionCookie(token));
      clearLoginGuard(res, 'portal');
      return res;
    }
  }

  const res = NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  const failure = recordLoginFailure(req, res, 'portal', username);
  return NextResponse.json({ error: failure.message }, { status: 401, headers: res.headers });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: PORTAL_COOKIE, value: '', maxAge: 0, path: '/' });
  return res;
}
