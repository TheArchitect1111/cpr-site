import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { validatePasswordStrength } from '@/lib/password-policy';

export type AdminUser = { email: string; password: string; role: string; name: string };
type AirtableRecord = { id: string; fields: Record<string, unknown> };

const COOKIE = 'cpr_admin_session';
const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const ADMIN_USERS_TABLE = process.env.AIRTABLE_ADMIN_USERS_TABLE_ID || '';

function secret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_PASSWORD || '';
}

function b64url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function unb64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(payload: string) {
  const s = secret();
  if (!s) return '';
  return createHmac('sha256', s).update(payload).digest('base64url');
}

export function adminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Array<Partial<AdminUser> & { username?: string }>;
      return parsed
        .map(user => ({
          email: String(user.email || user.username || '').trim().toLowerCase(),
          password: String(user.password || ''),
          role: String(user.role || 'admin'),
          name: String(user.name || user.email || user.username || 'Admin'),
        }))
        .filter(user => user.email && user.password);
    } catch {
      return raw.split(/[;\n]/).map(row => {
        const [email, password, role = 'admin', name = email] = row.split(':').map(part => part.trim());
        return { email: email.toLowerCase(), password, role, name };
      }).filter(user => user.email && user.password);
    }
  }
  const legacyPassword = process.env.ADMIN_PASSWORD;
  if (!legacyPassword) return [];
  const legacyEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_USER || 'cpr';
  return [{ email: legacyEmail.toLowerCase(), password: legacyPassword, role: 'owner', name: 'Mike' }];
}

function text(r: AirtableRecord, field: string) {
  const value = r.fields[field];
  return value === undefined || value === null ? '' : String(value);
}

function airtableToken() {
  return process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '';
}

async function airtableHeaders() {
  const token = airtableToken();
  if (!token) throw new Error('Missing AIRTABLE_TOKEN');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function adminUserFromRecord(record: AirtableRecord): AdminUser & { id: string } {
  return {
    id: record.id,
    email: text(record, 'Email').trim().toLowerCase(),
    password: text(record, 'Password Hash') || text(record, 'Password'),
    role: text(record, 'Role') || 'admin',
    name: text(record, 'Name') || text(record, 'Email') || 'Admin',
  };
}

async function findAirtableAdmin(email: string) {
  if (!ADMIN_USERS_TABLE || !airtableToken()) return null;
  const headers = await airtableHeaders();
  const safe = email.trim().toLowerCase().replace(/'/g, "\\'");
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(`LOWER({Email})='${safe}'`)}`,
    { headers, cache: 'no-store' },
  );
  if (!res.ok) return null;
  const data = await res.json() as { records?: AirtableRecord[] };
  const record = data.records?.[0];
  return record ? adminUserFromRecord(record) : null;
}

async function createAirtableAdmin(email: string, name = 'Admin') {
  if (!ADMIN_USERS_TABLE || !airtableToken()) throw new Error('Admin user table is not configured.');
  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      records: [{
        fields: {
          Email: email.trim().toLowerCase(),
          Name: name,
          Role: 'owner',
          Status: 'Active',
        },
      }],
      typecast: true,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json() as { records: AirtableRecord[] };
  return adminUserFromRecord(data.records[0]);
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `sha256$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string) {
  if (!password || !stored) return false;
  if (!stored.startsWith('sha256$')) {
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const [, salt, expected] = stored.split('$');
  if (!salt || !expected) return false;
  const actual = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminSession(user: AdminUser) {
  const payload = b64url(JSON.stringify({
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  }));
  const sig = sign(payload);
  return sig ? `${payload}.${sig}` : '';
}

export function verifyAdminSession(token: string): Omit<AdminUser, 'password'> | null {
  const [payload, sig] = token.split('.');
  const expected = sign(payload || '');
  if (!payload || !sig || !expected) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(unb64url(payload)) as { email: string; role: string; name: string; exp: number };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return { email: parsed.email, role: parsed.role || 'admin', name: parsed.name || parsed.email };
  } catch {
    return null;
  }
}

export function authenticateAdmin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const user = adminUsers().find(item => item.email === normalized);
  if (!user || !password) return null;
  return verifyPassword(password, user.password) ? user : null;
}

export async function authenticateAdminAsync(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const airtableUser = await findAirtableAdmin(normalized);
  if (airtableUser && verifyPassword(password, airtableUser.password)) return airtableUser;
  return authenticateAdmin(email, password);
}

export async function requestAdminPasswordReset(email: string, origin: string) {
  const normalized = email.trim().toLowerCase();
  const knownEnvUser = adminUsers().find(user => user.email === normalized);
  let user = await findAirtableAdmin(normalized);
  if (!user && knownEnvUser) user = await createAirtableAdmin(normalized, knownEnvUser.name);
  if (!user) return null;

  const token = randomBytes(32).toString('base64url');
  const headers = await airtableHeaders();
  const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      records: [{
        id: user.id,
        fields: {
          'Password Reset Token': hashToken(token),
          'Password Reset Expires': expires,
        },
      }],
      typecast: true,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return `${origin}/admin/reset-password?email=${encodeURIComponent(normalized)}&token=${encodeURIComponent(token)}`;
}

export async function resetAdminPassword(email: string, token: string, password: string) {
  const validation = validatePasswordStrength(password);
  if (!validation.ok) throw new Error(validation.message);
  const user = await findAirtableAdmin(email);
  if (!user) throw new Error('Reset link is invalid.');
  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}/${user.id}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Reset link is invalid.');
  const record = await res.json() as AirtableRecord;
  const storedToken = text(record, 'Password Reset Token');
  const expires = Date.parse(text(record, 'Password Reset Expires'));
  if (!storedToken || storedToken !== hashToken(token) || !expires || expires < Date.now()) {
    throw new Error('Reset link is invalid or expired.');
  }
  const patch = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      records: [{
        id: user.id,
        fields: {
          'Password Hash': hashPassword(password),
          'Password Reset Token': '',
          'Password Reset Expires': null,
          'Last Password Reset': new Date().toISOString(),
          Status: 'Active',
        },
      }],
      typecast: true,
    }),
  });
  if (!patch.ok) throw new Error(await patch.text());
}

export async function changeAdminPassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const validation = validatePasswordStrength(newPassword);
  if (!validation.ok) throw new Error(validation.message);

  const user = await authenticateAdminAsync(email, currentPassword);
  if (!user) throw new Error('Current password is incorrect.');

  const airtableUser = await findAirtableAdmin(email);
  if (airtableUser) {
    const headers = await airtableHeaders();
    const patch = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        records: [{
          id: airtableUser.id,
          fields: {
            'Password Hash': hashPassword(newPassword),
            'Last Password Reset': new Date().toISOString(),
          },
        }],
        typecast: true,
      }),
    });
    if (!patch.ok) throw new Error(await patch.text());
    return;
  }

  throw new Error('Password change is only available for admin accounts stored in Airtable Admin Users.');
}

export function adminFromRequest(req: NextRequest) {
  const session = req.cookies.get(COOKIE)?.value;
  if (session) {
    const user = verifyAdminSession(session);
    if (user) return user;
  }

  const legacyPassword = process.env.ADMIN_PASSWORD;
  const legacyUser = process.env.ADMIN_USER || 'cpr';
  if (!legacyPassword) return null;
  const header = req.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return null;
  const [u, p] = Buffer.from(encoded, 'base64').toString().split(':');
  if (u === legacyUser && p === legacyPassword) {
    return { email: (process.env.ADMIN_EMAIL || legacyUser).toLowerCase(), role: 'owner', name: 'Mike' };
  }
  return null;
}

export function isAdminAuthed(req: NextRequest) {
  return Boolean(adminFromRequest(req));
}

export function setAdminCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
}
