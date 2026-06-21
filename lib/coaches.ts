import { allowSampleData } from '@/lib/env';

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const TABLE = process.env.AIRTABLE_COACHES_TABLE_ID || 'Coach Directory';

export type CoachContact = {
  id: string;
  school: string;
  coach: string;
  coachEmail: string;
  coachRole: string;
  sport: string;
  conference: string;
  region: string;
  status: string;
  notes: string;
};

export type CoachInput = Partial<Omit<CoachContact, 'id'>>;

const sampleCoaches: CoachContact[] = [
  { id: 'sample-coach-1', school: 'University of Michigan', coach: 'Coach T. Reynolds', coachEmail: '', coachRole: 'Asst. Coach', sport: 'Basketball', conference: 'Big Ten', region: 'Midwest', status: 'Active', notes: '' },
  { id: 'sample-coach-2', school: 'Syracuse University', coach: 'Coach B. Taylor', coachEmail: '', coachRole: 'Asst. Coach', sport: 'Basketball', conference: 'ACC', region: 'Northeast', status: 'Active', notes: '' },
];

type AirtableRecord = { id: string; fields: Record<string, unknown> };

function f(r: AirtableRecord, name: string) {
  const value = r.fields[name];
  return value === undefined || value === null ? '' : String(value);
}

function coachFromRecord(r: AirtableRecord): CoachContact {
  return {
    id: r.id,
    school: f(r, 'School'),
    coach: f(r, 'Coach Name'),
    coachEmail: f(r, 'Coach Email'),
    coachRole: f(r, 'Coach Role'),
    sport: f(r, 'Sport') || 'Basketball',
    conference: f(r, 'Conference'),
    region: f(r, 'Region'),
    status: f(r, 'Status') || 'Active',
    notes: f(r, 'Notes'),
  };
}

function headers() {
  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY;
  if (!token) throw new Error('Missing AIRTABLE_TOKEN');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function cleanString(value: unknown, allowBlank = false) {
  if (value === undefined || value === null) return allowBlank ? '' : undefined;
  const text = String(value).trim();
  return text || (allowBlank ? '' : undefined);
}

export function coachFieldsFromInput(input: CoachInput) {
  const has = (key: keyof CoachInput) => Object.prototype.hasOwnProperty.call(input, key);
  const fields: Record<string, unknown> = {
    School: has('school') ? cleanString(input.school, true) : undefined,
    'Coach Name': has('coach') ? cleanString(input.coach, true) : undefined,
    'Coach Email': has('coachEmail') ? cleanString(input.coachEmail, true) : undefined,
    'Coach Role': has('coachRole') ? cleanString(input.coachRole, true) : undefined,
    Sport: has('sport') ? cleanString(input.sport, true) : undefined,
    Conference: has('conference') ? cleanString(input.conference, true) : undefined,
    Region: has('region') ? cleanString(input.region, true) : undefined,
    Status: has('status') ? cleanString(input.status, true) : undefined,
    Notes: has('notes') ? cleanString(input.notes, true) : undefined,
  };
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}

export async function getCoaches(): Promise<{ rows: CoachContact[]; live: boolean }> {
  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY;
  if (!token) {
    if (!allowSampleData()) return { rows: [], live: false };
    return { rows: sampleCoaches, live: false };
  }
  try {
    const rows: CoachContact[] = [];
    let offset = '';
    do {
      const res = await fetch(
        `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}?pageSize=100${offset ? `&offset=${offset}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } },
      );
      if (!res.ok) return { rows: allowSampleData() ? sampleCoaches : [], live: false };
      const data = (await res.json()) as { records: AirtableRecord[]; offset?: string };
      rows.push(...data.records.map(coachFromRecord));
      offset = data.offset || '';
    } while (offset);
    return { rows: rows.length ? rows : (allowSampleData() ? sampleCoaches : []), live: rows.length > 0 };
  } catch {
    return { rows: allowSampleData() ? sampleCoaches : [], live: false };
  }
}

export async function createCoach(input: CoachInput) {
  const school = cleanString(input.school);
  const coach = cleanString(input.coach);
  if (!school || !coach) throw new Error('School and coach name are required.');
  const fields = { ...coachFieldsFromInput(input), Status: cleanString(input.status) || 'Active' };
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { records: AirtableRecord[] };
  return coachFromRecord(data.records[0]);
}

export async function updateCoach(recordId: string, input: CoachInput) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ records: [{ id: recordId, fields: coachFieldsFromInput(input) }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteCoach(recordId: string) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}/${recordId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
}
