import { createHash, randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { appendActivityLine } from '@/lib/athletes';
import { validatePasswordStrength } from '@/lib/password-policy';
import type { PortalSession } from '@/lib/portal-auth';

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const TABLE = process.env.AIRTABLE_TABLE_ID || 'tblZwrZHi3WBR3NHZ';
const RESET_PREFIX = '[CPR_PASSWORD_RESET]';

export type PortalRole = 'athlete' | 'parent';

export type PortalAccount = {
  recordId: string;
  role: PortalRole;
  slug: string;
  email: string;
  displayName: string;
  passwordHash: string;
  notes: string;
};

type AirtableRecord = { id: string; fields: Record<string, unknown> };

function airtableToken() {
  return process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '';
}

async function airtableHeaders() {
  const token = airtableToken();
  if (!token) throw new Error('Missing AIRTABLE_TOKEN');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function text(record: AirtableRecord, field: string): string {
  const value = record.fields[field];
  return value === undefined || value === null ? '' : String(value);
}

function escapeFormula(value: string): string {
  return value.trim().toLowerCase().replace(/'/g, "\\'");
}

async function queryOne(formula: string): Promise<AirtableRecord | null> {
  const headers = await airtableHeaders();
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`,
    { headers, cache: 'no-store' },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { records?: AirtableRecord[] };
  return data.records?.[0] ?? null;
}

function accountFromRecord(record: AirtableRecord, role: PortalRole): PortalAccount | null {
  const slug = text(record, 'Slug');
  const passwordHash =
    role === 'athlete'
      ? text(record, 'Athlete Password Hash')
      : text(record, 'Parent Password Hash');
  if (!slug || !passwordHash) return null;
  return {
    recordId: record.id,
    role,
    slug,
    email:
      role === 'athlete'
        ? text(record, 'Email') || text(record, 'Athlete Username')
        : text(record, 'Parent Email') || text(record, 'Parent Username'),
    displayName:
      role === 'athlete'
        ? `${text(record, 'First Name')} ${text(record, 'Last Name')}`.trim() || slug
        : text(record, 'Parent Name') || 'Parent',
    passwordHash,
    notes: text(record, 'Notes'),
  };
}

export async function findPortalAccount(identifier: string): Promise<PortalAccount | null> {
  const safe = escapeFormula(identifier);
  const athleteRecord = await queryOne(
    `OR(LOWER({Athlete Username})='${safe}', LOWER({Email})='${safe}')`,
  );
  if (athleteRecord?.fields['Athlete Password Hash']) {
    const account = accountFromRecord(athleteRecord, 'athlete');
    if (account) return account;
  }

  const parentRecord = await queryOne(
    `OR(LOWER({Parent Username})='${safe}', LOWER({Parent Email})='${safe}')`,
  );
  if (parentRecord?.fields['Parent Password Hash']) {
    return accountFromRecord(parentRecord, 'parent');
  }
  return null;
}

function portalAccountFromEmailRecord(
  record: AirtableRecord,
  role: PortalRole,
): PortalAccount | null {
  const slug = text(record, 'Slug');
  if (!slug) return null;
  const email =
    role === 'athlete'
      ? text(record, 'Email') || text(record, 'Athlete Username')
      : text(record, 'Parent Email') || text(record, 'Parent Username');
  if (!email) return null;
  return {
    recordId: record.id,
    role,
    slug,
    email,
    displayName:
      role === 'athlete'
        ? `${text(record, 'First Name')} ${text(record, 'Last Name')}`.trim() || slug
        : text(record, 'Parent Name') || 'Parent',
    passwordHash:
      role === 'athlete'
        ? text(record, 'Athlete Password Hash')
        : text(record, 'Parent Password Hash'),
    notes: text(record, 'Notes'),
  };
}

/** Email-only lookup for magic-link sign-in (must match portal email on file). */
export async function findPortalAccountByEmail(email: string): Promise<PortalAccount | null> {
  const safe = escapeFormula(email);
  const athleteRecord = await queryOne(`LOWER({Email})='${safe}'`);
  if (athleteRecord) {
    const account = portalAccountFromEmailRecord(athleteRecord, 'athlete');
    if (account) return account;
  }

  const parentRecord = await queryOne(`LOWER({Parent Email})='${safe}'`);
  if (parentRecord) {
    return portalAccountFromEmailRecord(parentRecord, 'parent');
  }
  return null;
}

export async function recordPortalLogin(account: PortalAccount): Promise<void> {
  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}/${account.recordId}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) return;
  const record = (await res.json()) as AirtableRecord;
  const now = new Date().toISOString();
  const loginType = account.role === 'athlete' ? 'Athlete' : 'Parent';
  const currentLogins = Number(record.fields['Total Logins'] ?? 0);
  const legacyField =
    loginType === 'Athlete' ? 'Athlete Portal Last Login' : 'Parent Portal Last Login';

  await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}/${account.recordId}`, {
    method: 'PATCH',
    headers,
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

export async function findApplicantByEmail(email: string): Promise<AirtableRecord | null> {
  const safe = escapeFormula(email);
  return queryOne(`LOWER({Email})='${safe}'`);
}

type ResetPayload = {
  role: PortalRole;
  tokenHash: string;
  expires: string;
};

function stripResetBlock(notes: string): string {
  return notes
    .split('\n')
    .filter((line) => !line.startsWith(RESET_PREFIX))
    .join('\n')
    .trim();
}

function readResetBlock(notes: string): ResetPayload | null {
  const line = notes.split('\n').find((entry) => entry.startsWith(RESET_PREFIX));
  if (!line) return null;
  try {
    return JSON.parse(line.slice(RESET_PREFIX.length).trim()) as ResetPayload;
  } catch {
    return null;
  }
}

function writeResetBlock(notes: string, payload: ResetPayload): string {
  const base = stripResetBlock(notes);
  const line = `${RESET_PREFIX} ${JSON.stringify(payload)}`;
  return base ? `${base}\n\n${line}` : line;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function patchRecord(recordId: string, fields: Record<string, unknown>) {
  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}/${recordId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function requestPortalPasswordReset(identifier: string, origin: string): Promise<string | null> {
  const account = await findPortalAccount(identifier);
  if (!account) return null;

  const token = randomBytes(32).toString('base64url');
  const payload: ResetPayload = {
    role: account.role,
    tokenHash: hashToken(token),
    expires: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
  };

  await patchRecord(account.recordId, {
    Notes: writeResetBlock(account.notes, payload),
  });

  const rolePath = account.role;
  return `${origin}/portal/reset-password?role=${rolePath}&recordId=${encodeURIComponent(account.recordId)}&token=${encodeURIComponent(token)}`;
}

export async function resetPortalPassword(
  recordId: string,
  role: PortalRole,
  token: string,
  password: string,
): Promise<void> {
  const validation = validatePasswordStrength(password);
  if (!validation.ok) throw new Error(validation.message);

  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}/${recordId}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Reset link is invalid.');
  const record = (await res.json()) as AirtableRecord;
  const notes = text(record, 'Notes');
  const reset = readResetBlock(notes);
  if (!reset || reset.role !== role) throw new Error('Reset link is invalid.');
  if (reset.tokenHash !== hashToken(token)) throw new Error('Reset link is invalid.');
  if (Date.parse(reset.expires) < Date.now()) throw new Error('Reset link is invalid or expired.');

  const hashField = role === 'athlete' ? 'Athlete Password Hash' : 'Parent Password Hash';
  const clearedNotes = appendActivityLine(
    stripResetBlock(notes),
    `${role === 'athlete' ? 'Athlete' : 'Parent'} password reset completed.`,
  );

  await patchRecord(recordId, {
    [hashField]: hashPassword(password),
    Notes: clearedNotes,
  });
}

export async function changePortalPassword(
  session: PortalSession,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const validation = validatePasswordStrength(newPassword);
  if (!validation.ok) throw new Error(validation.message);

  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${session.slug.replace(/'/g, "\\'")}'`)}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Unable to update password.');
  const data = (await res.json()) as { records?: AirtableRecord[] };
  const record = data.records?.[0];
  if (!record) throw new Error('Account not found.');

  const hashField = session.type === 'athlete' ? 'Athlete Password Hash' : 'Parent Password Hash';
  const storedHash = text(record, hashField);
  if (!verifyPassword(currentPassword, storedHash)) {
    throw new Error('Current password is incorrect.');
  }

  await patchRecord(record.id, {
    [hashField]: hashPassword(newPassword),
    Notes: appendActivityLine(
      text(record, 'Notes'),
      `${session.type === 'athlete' ? 'Athlete' : 'Parent'} changed password from Account Settings.`,
    ),
  });
}
