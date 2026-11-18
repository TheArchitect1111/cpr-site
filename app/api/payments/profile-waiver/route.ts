import { NextRequest, NextResponse } from 'next/server';
import { PLAYER_APPLICATION_URL } from '@/config/site';

const BASE_ID = 'appvVr6MVrJvEY0YJ';
const CODE_TABLE = 'tbleSmCpbQ9VmfRg4';
const WAIVER_TABLE = 'tbl6KJoZtclYZvR6O';
const API_ROOT = `https://api.airtable.com/v0/${BASE_ID}`;

type AirtableRecord = { id: string; fields: Record<string, unknown> };
type AirtableList = { records?: AirtableRecord[]; offset?: string };

function failure(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function airtableList(table: string, formula: string, token: string): Promise<AirtableRecord[]> {
  const result: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(`${API_ROOT}/${table}`);
    url.searchParams.set('filterByFormula', formula);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Promo record read failed');
    const json = (await response.json()) as AirtableList;
    result.push(...(json.records ?? []));
    offset = json.offset;
  } while (offset && result.length < 1000);
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== req.nextUrl.origin) return failure('Invalid request origin.', 403);
    const token = process.env.AIRTABLE_TOKEN?.trim();
    if (!token) return failure('Profile waivers are temporarily unavailable.', 503);

    const body = await req.json();
    const code = String(body?.code ?? '').trim().toUpperCase();
    const email = String(body?.email ?? '').trim().toLowerCase();
    if (!/^[A-Z0-9-]{8,64}$/.test(code) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254) {
      return failure('Enter a valid promotion code and email address.', 400);
    }

    // A random, unguessable code is issued privately by CPR. Never accept a client-side price.
    const escapedCode = code.replace(/'/g, "\\'");
    const codes = await airtableList(CODE_TABLE, `{Code}='${escapedCode}'`, token);
    const promotion = codes.find((record) => record.fields['Active'] === true && record.fields['Code'] === code);
    if (!promotion) return failure('This promotion code is not valid or is inactive.', 400);

    const expiry = promotion.fields['Expires On'];
    if (typeof expiry === 'string' && expiry < new Date().toISOString().slice(0, 10)) {
      return failure('This promotion code has expired.', 400);
    }

    const waivers = await airtableList(WAIVER_TABLE, `{Promo Code}='${escapedCode}'`, token);
    const alreadyIssued = waivers.find((r) => String(r.fields['Athlete Email'] ?? '').toLowerCase() === email
      && r.fields['Status'] !== 'Voided');
    if (alreadyIssued) {
      return NextResponse.json({ url: PLAYER_APPLICATION_URL, waived: true },
        { headers: { 'Cache-Control': 'no-store' } });
    }

    const limit = Number(promotion.fields['Max Uses']);
    if (Number.isFinite(limit) && limit > 0 && waivers.filter((r) => r.fields['Status'] !== 'Voided').length >= limit) {
      return failure('This promotion code has reached its usage limit.', 400);
    }
    const record = await fetch(`${API_ROOT}/${WAIVER_TABLE}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields: {
          'Redemption ID': crypto.randomUUID(),
          'Promo Code': code,
          'Athlete Email': email,
          'Redeemed At': new Date().toISOString(),
          'Status': 'Issued',
        } }],
        typecast: false,
      }),
      cache: 'no-store',
    });
    if (!record.ok) throw new Error('Could not record waiver');

    // The current CPR application is an external Google Form. Staff must reconcile
    // 'Issued' waivers to submissions; this response does not prove application completion.
    return NextResponse.json({ url: PLAYER_APPLICATION_URL, waived: true },
      { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return failure('We could not verify the code right now. Please try again.', 502);
  }
}
