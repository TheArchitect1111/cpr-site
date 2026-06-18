// CPR Coach Outreach data layer.
// Lives in Airtable table "Coach Outreach" (base appvVr6MVrJvEY0YJ).
// Falls back to sample data when AIRTABLE_TOKEN or the table is missing.

import { createHmac, timingSafeEqual } from 'crypto';

const BASE = 'appvVr6MVrJvEY0YJ';
const TABLE = 'Coach Outreach';

export type ActivityItem = { date: string; message: string };
export type Outreach = {
  id: string; school: string; coach: string; coachEmail: string; coachRole: string; prospect: string; prospectSlug: string;
  positionYear: string; dateSent: string; opened: boolean; viewed: boolean;
  response: string; status: string; notes: string; shareToken: string; activity: ActivityItem[];
};

export type OutreachInput = Partial<Omit<Outreach, 'id'>>;

export const sampleOutreach: Outreach[] = [
  { id: 'sample-1', school: 'University of Michigan', coach: 'Coach T. Reynolds', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Ethan Johnson', prospectSlug: 'jayden-thompson', positionYear: 'PG | 2026', dateSent: '2024-05-14', opened: true, viewed: true, response: 'Interested', status: 'Active', notes: 'Ethan looks like a great fit for our system. Let us keep in touch and send full game film.', shareToken: '', activity: [] },
  { id: 'sample-2', school: 'Syracuse University', coach: 'Coach B. Taylor', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Noah Williams', prospectSlug: '', positionYear: 'SG | 2026', dateSent: '2024-05-13', opened: true, viewed: true, response: 'Follow Up', status: 'Pending', notes: '', shareToken: '', activity: [] },
  { id: 'sample-3', school: 'University of Kentucky', coach: 'Coach J. Smith', coachEmail: '', coachRole: 'Assoc. HC', prospect: 'Mason Brown', prospectSlug: '', positionYear: 'SF | 2027', dateSent: '2024-05-13', opened: true, viewed: true, response: 'Maybe', status: 'Active', notes: '', shareToken: '', activity: [] },
  { id: 'sample-4', school: 'University of Illinois', coach: 'Coach D. Brown', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Tyler Davis', prospectSlug: '', positionYear: 'PF | 2026', dateSent: '2024-05-12', opened: true, viewed: true, response: 'Not Interested', status: 'Closed', notes: '', shareToken: '', activity: [] },
  { id: 'sample-5', school: 'University of Minnesota', coach: 'Coach K. Anderson', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Noah Williams', prospectSlug: '', positionYear: 'SG | 2026', dateSent: '2024-05-12', opened: true, viewed: true, response: 'Interested', status: 'Active', notes: '', shareToken: '', activity: [] },
  { id: 'sample-6', school: 'Boston University', coach: 'Coach M. Carter', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Ethan Johnson', prospectSlug: 'jayden-thompson', positionYear: 'PG | 2026', dateSent: '2024-05-11', opened: true, viewed: false, response: 'Maybe', status: 'Pending', notes: '', shareToken: '', activity: [] },
  { id: 'sample-7', school: 'UConn', coach: 'Coach A. Hill', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Jacob Smith', prospectSlug: '', positionYear: 'C | 2026', dateSent: '2024-05-11', opened: true, viewed: false, response: 'No Response', status: 'Waiting', notes: '', shareToken: '', activity: [] },
  { id: 'sample-8', school: 'Northeastern University', coach: 'Coach D. Roberts', coachEmail: '', coachRole: 'Asst. Coach', prospect: 'Lucas Martin', prospectSlug: '', positionYear: 'SF | 2026', dateSent: '2024-05-10', opened: false, viewed: false, response: 'No Response', status: 'Waiting', notes: '', shareToken: '', activity: [] },
];

type AirtableRecord = { id: string; fields: Record<string, unknown> };
const f = (r: AirtableRecord, name: string): string => {
  const v = r.fields[name];
  return v === undefined || v === null ? '' : String(v);
};
const fb = (r: AirtableRecord, name: string): boolean => r.fields[name] === true;
const ACTIVITY_PREFIX = '[CPR_ACTIVITY]';

function shareSecret() {
  return process.env.COACH_SHARE_SECRET || process.env.ADMIN_PASSWORD || process.env.AIRTABLE_TOKEN || '';
}

export function outreachShareToken(recordId: string) {
  const secret = shareSecret();
  if (!secret || !recordId) return '';
  return createHmac('sha256', secret).update(`cpr-coach-share:${recordId}`).digest('base64url');
}

export function verifyOutreachShareToken(recordId: string, token: string) {
  const expected = outreachShareToken(recordId);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

function appendActivityLine(notes: string, message: string) {
  const line = `${ACTIVITY_PREFIX} ${new Date().toISOString()} ${message}`;
  return [notes.trim(), line].filter(Boolean).join('\n');
}

function decodeActivity(notes: string): ActivityItem[] {
  return notes
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith(ACTIVITY_PREFIX))
    .map(line => {
      const rest = line.slice(ACTIVITY_PREFIX.length).trim();
      const [date, ...parts] = rest.split(' ');
      return { date, message: parts.join(' ').trim() };
    })
    .filter(item => item.date && item.message)
    .reverse();
}

function outreachFromRecord(r: AirtableRecord): Outreach {
  return {
    id: r.id,
    school: f(r, 'School'), coach: f(r, 'Coach Name'), coachEmail: f(r, 'Coach Email'), coachRole: f(r, 'Coach Role'),
    prospect: f(r, 'Prospect Name'), prospectSlug: f(r, 'Athlete Slug'),
    positionYear: f(r, 'Position Year'), dateSent: f(r, 'Response Date') || f(r, 'Date Sent'),
    opened: fb(r, 'Opened'), viewed: fb(r, 'Viewed'),
    response: f(r, 'Response Status') || 'No Response', status: f(r, 'Status') || 'Waiting',
    notes: f(r, 'Notes'),
    shareToken: outreachShareToken(r.id),
    activity: decodeActivity(f(r, 'Notes')),
  };
}

function airtableHeaders() {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error('Missing AIRTABLE_TOKEN');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const cleanString = (value: unknown, allowBlank = false) => {
  if (value === undefined || value === null) return allowBlank ? '' : undefined;
  const text = String(value).trim();
  return text || (allowBlank ? '' : undefined);
};

const cleanBoolean = (value: unknown) => value === true;

export function outreachFieldsFromInput(input: OutreachInput) {
  const has = (key: keyof OutreachInput) => Object.prototype.hasOwnProperty.call(input, key);
  const fields: Record<string, unknown> = {
    School: has('school') ? cleanString(input.school, true) : undefined,
    'Coach Name': has('coach') ? cleanString(input.coach, true) : undefined,
    'Coach Email': has('coachEmail') ? cleanString(input.coachEmail, true) : undefined,
    'Coach Role': has('coachRole') ? cleanString(input.coachRole, true) : undefined,
    'Prospect Name': has('prospect') ? cleanString(input.prospect, true) : undefined,
    'Athlete Slug': has('prospectSlug') ? cleanString(input.prospectSlug, true) : undefined,
    'Position Year': has('positionYear') ? cleanString(input.positionYear, true) : undefined,
    'Date Sent': has('dateSent') ? cleanString(input.dateSent, true) : undefined,
    Opened: has('opened') ? cleanBoolean(input.opened) : undefined,
    Viewed: has('viewed') ? cleanBoolean(input.viewed) : undefined,
    'Response Status': has('response') ? cleanString(input.response, true) : undefined,
    Status: has('status') ? cleanString(input.status, true) : undefined,
    Notes: has('notes') ? cleanString(input.notes, true) : undefined,
  };
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}

export async function getOutreach(): Promise<{ rows: Outreach[]; live: boolean }> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return { rows: sampleOutreach, live: false };
  try {
    const rows: Outreach[] = [];
    let offset = '';
    do {
      const res = await fetch(
        `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Coach Outreach')}?pageSize=100${offset ? `&offset=${offset}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } },
      );
      if (!res.ok) return { rows: sampleOutreach, live: false };
      const data = (await res.json()) as { records: AirtableRecord[]; offset?: string };
      for (const r of data.records) {
        rows.push({
          ...outreachFromRecord(r),
        });
      }
      offset = data.offset ?? '';
    } while (offset);
    return rows.length ? { rows, live: true } : { rows: sampleOutreach, live: false };
  } catch {
    return { rows: sampleOutreach, live: false };
  }
}

export async function createOutreach(input: OutreachInput) {
  const headers = airtableHeaders();
  const fields = {
    ...outreachFieldsFromInput(input),
    Status: cleanString(input.status) || 'Waiting',
    'Response Status': cleanString(input.response) || 'No Response',
    Notes: appendActivityLine(cleanString(input.notes, true) || '', 'Admin created coach outreach record.'),
  };
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { records: AirtableRecord[] };
  return outreachFromRecord(data.records[0]);
}

export async function getOutreachByRecordId(recordId: string): Promise<Outreach | null> {
  const headers = airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}/${recordId}`, { headers });
  if (!res.ok) return null;
  return outreachFromRecord((await res.json()) as AirtableRecord);
}

export async function trackCoachShareView(recordId: string) {
  const outreach = await getOutreachByRecordId(recordId);
  if (!outreach) return null;
  const message = `Coach share link opened by ${[outreach.coach, outreach.school].filter(Boolean).join(' / ') || 'coach'}.`;
  await updateOutreach(recordId, {
    opened: true,
    viewed: true,
    notes: appendActivityLine(outreach.notes, message),
  });
  return outreach;
}

export async function updateOutreach(recordId: string, input: OutreachInput) {
  const headers = airtableHeaders();
  const fields = outreachFieldsFromInput(input);
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ records: [{ id: recordId, fields }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function appendOutreachActivity(recordId: string, message: string) {
  const outreach = await getOutreachByRecordId(recordId);
  if (!outreach) return null;
  await updateOutreach(recordId, { notes: appendActivityLine(outreach.notes, message) });
  return outreach;
}

export async function appendOutreachActivityByEmailId(emailId: string, message: string) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token || !emailId) return null;
  const safe = emailId.replace(/'/g, "\\'");
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(`SEARCH('${safe}', {Notes})`)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { records: AirtableRecord[] };
  const record = data.records?.[0];
  if (!record) return null;
  const outreach = outreachFromRecord(record);
  await updateOutreach(outreach.id, { notes: appendActivityLine(outreach.notes, message) });
  return outreach;
}

export async function recordCoachResponse(recordId: string, response: string, detail = '') {
  const outreach = await getOutreachByRecordId(recordId);
  if (!outreach) throw new Error('Outreach record not found');
  const responseMap: Record<string, { response: string; status: string }> = {
    interested: { response: 'Interested', status: 'Active' },
    maybe: { response: 'Maybe', status: 'Pending' },
    request_info: { response: 'Follow Up', status: 'Pending' },
    not_fit: { response: 'Not Interested', status: 'Closed' },
  };
  const next = responseMap[response] || responseMap.request_info;
  const label = next.response === 'Follow Up' ? 'Requested more information' : next.response;
  const suffix = detail.trim() ? ` Note: ${detail.trim()}` : '';
  await updateOutreach(recordId, {
    response: next.response,
    status: next.status,
    viewed: true,
    notes: appendActivityLine(outreach.notes, `Coach responded: ${label}.${suffix}`),
  });
}

export async function deleteOutreach(recordId: string) {
  const headers = airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}/${recordId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(await res.text());
}
