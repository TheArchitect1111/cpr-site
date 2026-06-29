import { hashPassword } from '@/lib/admin-auth';

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const ADMIN_USERS_TABLE = process.env.AIRTABLE_ADMIN_USERS_TABLE_ID || '';

type AirtableRecord = { id: string; fields: Record<string, unknown> };

function token() {
  return process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '';
}

function headers() {
  return {
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  };
}

function text(row: AirtableRecord, field: string) {
  const value = row.fields[field];
  return value === undefined || value === null ? '' : String(value);
}

export type AdminTeamMember = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

export async function listAdminTeamMembers(): Promise<{ members: AdminTeamMember[]; live: boolean }> {
  if (!ADMIN_USERS_TABLE || !token()) {
    return { members: [], live: false };
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}?pageSize=100`,
    { headers: headers(), cache: 'no-store' },
  );
  if (!res.ok) return { members: [], live: true };

  const data = (await res.json()) as { records?: AirtableRecord[] };
  const members = (data.records || []).map((row) => ({
    id: row.id,
    email: text(row, 'Email').trim().toLowerCase(),
    name: text(row, 'Name') || text(row, 'Email'),
    role: text(row, 'Role') || 'admin',
    status: text(row, 'Status') || 'Active',
  }));
  return { members, live: true };
}

export async function createAdminTeamMember(input: {
  email: string;
  name: string;
  password: string;
  role?: string;
}): Promise<AdminTeamMember> {
  if (!ADMIN_USERS_TABLE || !token()) {
    throw new Error('Admin user storage is not configured. Set AIRTABLE_ADMIN_USERS_TABLE_ID.');
  }

  const email = input.email.trim().toLowerCase();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ADMIN_USERS_TABLE)}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      records: [{
        fields: {
          Email: email,
          Name: input.name.trim() || email,
          Role: input.role || 'admin',
          Status: 'Active',
          'Password Hash': hashPassword(input.password),
        },
      }],
      typecast: true,
    }),
  });
  if (!res.ok) throw new Error(await res.text());

  const data = (await res.json()) as { records: AirtableRecord[] };
  const row = data.records[0];
  return {
    id: row.id,
    email,
    name: text(row, 'Name') || email,
    role: text(row, 'Role') || 'admin',
    status: text(row, 'Status') || 'Active',
  };
}
