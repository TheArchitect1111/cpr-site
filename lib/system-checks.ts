import { adminUsers } from './admin-auth';

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const ATHLETES = process.env.AIRTABLE_ATHLETES_TABLE_ID || 'tblZwrZHi3WBR3NHZ';
const COACHES = process.env.AIRTABLE_COACHES_TABLE_ID || 'Coach Directory';
const ADMIN_USERS_TABLE = process.env.AIRTABLE_ADMIN_USERS_TABLE_ID || '';

const ATHLETE_FIELDS = [
  'First Name',
  'Last Name',
  'Email',
  'Status',
  'Notes',
  'Transcript URL',
  'Gameplay Video URL',
  'Fee Stage 1',
  'Fee Stage 2',
  'Fee Stage 3',
  'NIL Interest',
  'Terms Agreed',
];

const ADMIN_FIELDS = [
  'Email',
  'Name',
  'Role',
  'Password Hash',
  'Password Reset Token',
  'Password Reset Expires',
];

export type SystemCheck = { name: string; ok: boolean; detail: string };

async function airtableSchemaChecks(): Promise<SystemCheck[]> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return [{ name: 'Airtable token', ok: false, detail: 'AIRTABLE_TOKEN is missing.' }];
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE}/tables`, { headers, cache: 'no-store' });
    if (!res.ok) {
      return [{ name: 'Airtable schema', ok: false, detail: `Metadata check failed with ${res.status}. Confirm the token has schema.bases:read scope.` }];
    }
    const data = await res.json() as { tables?: Array<{ id: string; name: string; fields: Array<{ name: string }> }> };
    const athleteTable = data.tables?.find(table => table.id === ATHLETES || table.name === ATHLETES);
    const coachTable = data.tables?.find(table => table.id === COACHES || table.name === COACHES);
    const adminTable = ADMIN_USERS_TABLE ? data.tables?.find(table => table.id === ADMIN_USERS_TABLE || table.name === ADMIN_USERS_TABLE) : undefined;
    const fields = new Set((athleteTable?.fields || []).map(field => field.name));
    const missing = ATHLETE_FIELDS.filter(field => !fields.has(field));
    const adminFields = new Set((adminTable?.fields || []).map(field => field.name));
    const missingAdmin = ADMIN_FIELDS.filter(field => !adminFields.has(field));
    return [
      { name: 'Athlete Intake table', ok: Boolean(athleteTable), detail: athleteTable ? `${athleteTable.name} found.` : `${ATHLETES} was not found.` },
      { name: 'Athlete payment fields', ok: missing.length === 0, detail: missing.length ? `Missing: ${missing.join(', ')}` : 'Required applicant/payment fields found.' },
      { name: 'Coach Directory table', ok: Boolean(coachTable), detail: coachTable ? `${coachTable.name} found.` : `${COACHES} was not found.` },
      { name: 'Admin Users table', ok: Boolean(adminTable), detail: adminTable ? `${adminTable.name} found.` : 'AIRTABLE_ADMIN_USERS_TABLE_ID is missing or the table was not found.' },
      { name: 'Password reset fields', ok: Boolean(adminTable) && missingAdmin.length === 0, detail: missingAdmin.length ? `Missing: ${missingAdmin.join(', ')}` : 'Password reset fields found.' },
    ];
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Airtable schema error.';
    return [{ name: 'Airtable schema', ok: false, detail: message }];
  }
}

export async function getSystemChecks(): Promise<SystemCheck[]> {
  const admins = adminUsers();
  const usingLegacy = !process.env.ADMIN_USERS && Boolean(process.env.ADMIN_PASSWORD);
  return [
    { name: 'Admin users', ok: admins.length > 0, detail: process.env.ADMIN_USERS ? `${admins.length} configured in ADMIN_USERS.` : usingLegacy ? 'Using legacy ADMIN_USER/ADMIN_PASSWORD fallback.' : 'No admin users configured.' },
    { name: 'Admin auth secret', ok: Boolean(process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_PASSWORD), detail: process.env.ADMIN_AUTH_SECRET ? 'ADMIN_AUTH_SECRET configured.' : 'Using ADMIN_PASSWORD as session secret fallback.' },
    { name: 'Stripe secret key', ok: Boolean(process.env.STRIPE_SECRET_KEY), detail: process.env.STRIPE_SECRET_KEY ? 'Stripe checkout can create sessions.' : 'STRIPE_SECRET_KEY is missing.' },
    { name: 'Stripe webhook secret', ok: Boolean(process.env.STRIPE_WEBHOOK_SECRET), detail: process.env.STRIPE_WEBHOOK_SECRET ? 'Stripe webhook can verify signatures.' : 'STRIPE_WEBHOOK_SECRET is missing.' },
    ...(await airtableSchemaChecks()),
  ];
}
