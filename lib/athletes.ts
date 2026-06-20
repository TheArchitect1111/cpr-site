// CPR Athlete data layer.
// Live mode: set AIRTABLE_TOKEN in Vercel env vars (never in code).
// Without a token, falls back to the built-in sample so the page is always demo-able.

import { createHmac, timingSafeEqual } from 'crypto';

const BASE = 'appvVr6MVrJvEY0YJ';
const ATHLETES = 'tblZwrZHi3WBR3NHZ';
const ARCHIVE = process.env.AIRTABLE_ARCHIVE_TABLE_ID || 'Player Profile Archive';

export type CoachResponse = { school: string; coach: string; status: string; date: string };
export type ActivityItem = { date: string; message: string };
export type Athlete = {
  slug: string; firstName: string; lastName: string; position: string; height: string;
  weight: string; gradYear: string; gpa: string; sat: string; act: string; school: string;
  location: string; country: string; city: string;
  email: string; phone: string; parentName: string; bio: string;
  strengths: string[]; videoUrl: string; photoUrl: string; status: string;
  team: string; jersey: string; vertical: string; reach: string; hand: string; ncaa: string;
  profileViews: string; offers: string; visits: string;
  globalCities: string[];
  responses: CoachResponse[];
};

export type AthleteAdmin = Athlete & {
  id: string;
  submittedAt: string;
  parentEmail: string;
  parentPhone: string;
  feeStage1: boolean;
  feeStage2: boolean;
  feeStage3: boolean;
  nilInterest: boolean;
  termsAgreed: boolean;
  agreementSubmitted: string;
  programOption: string;
  editToken: string;
  notes: string;
  transcriptUrl: string;
  gameplayVideoUrl: string;
  pendingUpdates: PendingProfileUpdate[];
  activity: ActivityItem[];
};

export type AthleteInput = {
  slug?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  position?: string;
  height?: string;
  weight?: string;
  gradYear?: string;
  sat?: string;
  act?: string;
  school?: string;
  location?: string;
  gpa?: string;
  status?: string;
  bio?: string;
  strengths?: string;
  videoUrl?: string;
  photoUrl?: string;
  transcriptUrl?: string;
  gameplayVideoUrl?: string;
  team?: string;
  jersey?: string;
  vertical?: string;
  reach?: string;
  hand?: string;
  ncaa?: string;
  profileViews?: string;
  offers?: string;
  visits?: string;
  feeStage1?: boolean;
  feeStage2?: boolean;
  feeStage3?: boolean;
  nilInterest?: boolean;
  termsAgreed?: boolean;
};

export type PendingProfileUpdate = {
  id: string;
  submittedAt: string;
  fields: AthleteInput;
};

const sample: Athlete = {
  slug: 'jayden-thompson', firstName: 'Jayden', lastName: 'Thompson', position: 'Point Guard',
  height: "6'2\"", weight: '175 lbs', gradYear: '2026', gpa: '3.8', sat: '1180', act: '',
  school: 'Lorne Park SS', location: 'Mississauga, Ontario',
  country: 'Canada', city: 'Mississauga',
  email: 'jaydent2026@email.com', phone: '(416) 555-8932', parentName: 'Mark Thompson',
  bio: 'Dynamic point guard with elite court vision, leadership and scoring ability. Strong handle, quick first step and excellent decision maker in transition and half court sets. Dedicated to academic success and athletic development.',
  strengths: ['Basketball IQ', 'Court Vision', 'Playmaking', '3PT Shooting', 'Leadership', 'Transition', 'Defense', 'Quick First Step'],
  videoUrl: 'https://youtu.be/iqietCwnCxc', photoUrl: '/hero-athlete.png', status: 'Active',
  team: 'Mississauga Magic U18 AAA', jersey: '1', vertical: '', reach: '', hand: 'Right', ncaa: '',
  profileViews: '', offers: '', visits: '',
  globalCities: ['Toronto', 'New York', 'Los Angeles'],
  responses: [],
};

function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}
export function embedUrl(url: string): string | null {
  const id = youTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

type AirtableRecord = { id: string; fields: Record<string, unknown> };

const f = (r: AirtableRecord, name: string): string => {
  const v = r.fields[name];
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) {
    const first = v[0] as { url?: string } | string;
    if (typeof first === 'object' && first?.url) return first.url;
    return String(first ?? '');
  }
  return String(v);
};

const fArr = (r: AirtableRecord, name: string): string[] => {
  const v = r.fields[name];
  if (!Array.isArray(v)) return [];
  return v.filter(Boolean).map(String);
};

const PENDING_PREFIX = '[[CPR_PENDING_PROFILE_UPDATE:';
const PENDING_SUFFIX = ']]';
const PENDING_RE = /\[\[CPR_PENDING_PROFILE_UPDATE:([A-Za-z0-9+/=]+)\]\]/g;
const ACTIVITY_PREFIX = '[CPR_ACTIVITY]';

export function appendActivityLine(notes: string, message: string) {
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

function boolField(r: AirtableRecord, name: string) {
  const value = r.fields[name];
  return value === true || String(value || '').toLowerCase() === 'true';
}

function noteValue(notes: string, label: string) {
  const line = notes.split('\n').find(item => item.toLowerCase().startsWith(label.toLowerCase()));
  return line ? line.slice(label.length).trim() : '';
}

function encodePending(update: PendingProfileUpdate) {
  return `${PENDING_PREFIX}${Buffer.from(JSON.stringify(update), 'utf8').toString('base64')}${PENDING_SUFFIX}`;
}

function decodePending(notes: string): PendingProfileUpdate[] {
  const updates: PendingProfileUpdate[] = [];
  for (const match of notes.matchAll(PENDING_RE)) {
    try {
      const parsed = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8')) as PendingProfileUpdate;
      if (parsed?.id && parsed?.fields) updates.push(parsed);
    } catch {
      // Ignore malformed legacy note blocks.
    }
  }
  return updates;
}

function removePending(notes: string, updateId?: string) {
  return notes.replace(PENDING_RE, (full, encoded) => {
    if (!updateId) return '';
    try {
      const parsed = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as PendingProfileUpdate;
      return parsed.id === updateId ? '' : full;
    } catch {
      return full;
    }
  }).replace(/\n{3,}/g, '\n\n').trim();
}

function accessSecret() {
  return process.env.ATHLETE_ACCESS_SECRET || process.env.ADMIN_PASSWORD || process.env.AIRTABLE_TOKEN || '';
}

export function athleteEditToken(recordId: string) {
  const secret = accessSecret();
  if (!secret || !recordId) return '';
  return createHmac('sha256', secret).update(`cpr-athlete-edit:${recordId}`).digest('base64url');
}

export function verifyAthleteEditToken(recordId: string, token: string) {
  const expected = athleteEditToken(recordId);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

const athleteFromRecord = (r: AirtableRecord): AthleteAdmin => ({
  id: r.id,
  slug: f(r, 'Slug'), firstName: f(r, 'First Name'), lastName: f(r, 'Last Name'),
  position: f(r, 'Position'), height: f(r, 'Height'),
  weight: f(r, 'Weight') ? `${f(r, 'Weight')} lbs` : '', gradYear: f(r, 'Graduation Year'),
  gpa: f(r, 'GPA'), sat: f(r, 'SAT Score'), act: f(r, 'ACT Score'),
  school: f(r, 'Current School'), location: f(r, 'City / Province'),
  country: f(r, 'Country'), city: f(r, 'City'),
  email: f(r, 'Email'), phone: f(r, 'Phone'), parentName: f(r, 'Parent Name'),
  parentEmail: f(r, 'Parent Email'), parentPhone: f(r, 'Parent Phone'),
  bio: f(r, 'Bio'), strengths: f(r, 'Strengths').split(/[,\n]/).map(s => s.trim()).filter(Boolean),
  videoUrl: f(r, 'Highlight Video URL'), photoUrl: f(r, 'Photo URL') || f(r, 'Photo') || '/hero-athlete.png',
  status: f(r, 'Status') || 'Pending', team: f(r, 'Club Team'), jersey: f(r, 'Jersey Number'),
  vertical: f(r, 'Vertical Jump'), reach: f(r, 'Standing Reach'), hand: f(r, 'Dominant Hand'),
  ncaa: f(r, 'NCAA Eligibility'), profileViews: f(r, 'Profile Views'),
  offers: f(r, 'Offers'), visits: f(r, 'Visits'),
  globalCities: fArr(r, 'Global Cities of Interest'),
  responses: [],
  submittedAt: f(r, 'Submitted At'),
  notes: f(r, 'Notes'),
  transcriptUrl: f(r, 'Transcript URL'),
  gameplayVideoUrl: f(r, 'Gameplay Video URL'),
  feeStage1: boolField(r, 'Fee Stage 1'),
  feeStage2: boolField(r, 'Fee Stage 2'),
  feeStage3: boolField(r, 'Fee Stage 3'),
  nilInterest: boolField(r, 'NIL Interest'),
  termsAgreed: boolField(r, 'Terms Agreed'),
  agreementSubmitted: f(r, 'Notes').includes('--- Fee Agreement submitted') ? 'Yes' : '',
  programOption: noteValue(f(r, 'Notes'), 'Selected fee option:'),
  pendingUpdates: decodePending(f(r, 'Notes')),
  activity: decodeActivity(f(r, 'Notes')),
  editToken: athleteEditToken(r.id),
});

export async function getAthletes(): Promise<{ rows: AthleteAdmin[]; live: boolean }> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return { rows: [{ ...sample, id: 'sample', submittedAt: '', parentEmail: '', parentPhone: '', feeStage1: false, feeStage2: false, feeStage3: false, nilInterest: false, termsAgreed: false, agreementSubmitted: '', programOption: '', editToken: '', notes: '', transcriptUrl: '', gameplayVideoUrl: '', pendingUpdates: [], activity: [] }], live: false };
  try {
    const rows: AthleteAdmin[] = [];
    let offset = '';
    do {
      const res = await fetch(
        `https://api.airtable.com/v0/${BASE}/${ATHLETES}?pageSize=100${offset ? `&offset=${offset}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } },
      );
      if (!res.ok) return { rows: [], live: false };
      const data = (await res.json()) as { records: AirtableRecord[]; offset?: string };
      rows.push(...data.records.map(athleteFromRecord));
      offset = data.offset ?? '';
    } while (offset);
    return { rows, live: true };
  } catch {
    return { rows: [], live: false };
  }
}

async function airtableHeaders() {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error('Missing AIRTABLE_TOKEN');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function getRawAthleteRecord(recordId: string): Promise<AirtableRecord | null> {
  const headers = await airtableHeaders();
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${ATHLETES}/${recordId}`, { headers });
  if (!res.ok) return null;
  return (await res.json()) as AirtableRecord;
}

export async function getAthleteByRecordId(recordId: string): Promise<AthleteAdmin | null> {
  const record = await getRawAthleteRecord(recordId);
  return record ? athleteFromRecord(record) : null;
}

export async function archiveAthlete(recordId: string, reason: string) {
  const headers = await airtableHeaders();
  const record = await getRawAthleteRecord(recordId);
  if (!record) return;
  const fields = {
    ...record.fields,
    'Archived At': new Date().toISOString(),
    'Archive Reason': reason,
    'Original Record ID': recordId,
  };
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(ARCHIVE)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) console.error('Athlete archive failed:', await res.text());
}

export async function updateAthlete(recordId: string, fields: Record<string, unknown>) {
  const headers = await airtableHeaders();
  const cleanFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  if (String(cleanFields.Status || '').toLowerCase() === 'active') {
    await archiveAthlete(recordId, 'Profile became active');
  }
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${ATHLETES}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ records: [{ id: recordId, fields: cleanFields }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function patchAthleteFields(recordId: string, fields: Record<string, unknown>) {
  const headers = await airtableHeaders();
  const cleanFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${ATHLETES}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ records: [{ id: recordId, fields: cleanFields }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function submitPendingAthleteUpdate(recordId: string, fields: AthleteInput) {
  const record = await getRawAthleteRecord(recordId);
  if (!record) throw new Error('Profile not found');
  const existingNotes = f(record, 'Notes');
  const update: PendingProfileUpdate = {
    id: `upd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: new Date().toISOString(),
    fields,
  };
  const notes = [appendActivityLine(existingNotes, 'Applicant submitted profile updates for review.'), encodePending(update)].filter(Boolean).join('\n\n');
  await patchAthleteFields(recordId, { Notes: notes });
  return update;
}

export async function approvePendingAthleteUpdate(recordId: string, updateId: string) {
  const record = await getRawAthleteRecord(recordId);
  if (!record) throw new Error('Profile not found');
  const notes = f(record, 'Notes');
  const update = decodePending(notes).find(item => item.id === updateId);
  if (!update) throw new Error('Pending update not found');
  await patchAthleteFields(recordId, {
    ...athleteFieldsFromInput(update.fields, true),
    Notes: appendActivityLine(removePending(notes, updateId), `Admin approved profile update ${updateId}.`),
  });
}

export async function rejectPendingAthleteUpdate(recordId: string, updateId: string) {
  const record = await getRawAthleteRecord(recordId);
  if (!record) throw new Error('Profile not found');
  await patchAthleteFields(recordId, { Notes: appendActivityLine(removePending(f(record, 'Notes'), updateId), `Admin rejected profile update ${updateId}.`) });
}

export async function markAthletePaymentPaid(recordId: string, stage: 'stage1' | 'stage2' | 'stage3', detail: string) {
  const record = await getRawAthleteRecord(recordId);
  if (!record) throw new Error('Profile not found');
  const field = stage === 'stage1' ? 'Fee Stage 1' : stage === 'stage2' ? 'Fee Stage 2' : 'Fee Stage 3';
  await patchAthleteFields(recordId, {
    [field]: true,
    Notes: appendActivityLine(f(record, 'Notes'), detail),
  });
}

function cleanString(value: unknown, allowBlank = false) {
  if (value === undefined || value === null) return allowBlank ? '' : undefined;
  const text = String(value).trim();
  return text || (allowBlank ? '' : undefined);
}

function cleanNumber(value: unknown, allowBlank = false) {
  const text = cleanString(value, allowBlank);
  if (!text) return allowBlank ? null : undefined;
  const num = Number(text);
  return Number.isFinite(num) ? num : undefined;
}

function slugify(parts: Array<string | undefined>) {
  const base = parts.filter(Boolean).join(' ').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base || `athlete-${Date.now()}`;
}

export function athleteFieldsFromInput(input: AthleteInput, includeAdminFields = false) {
  const has = (key: keyof AthleteInput) => Object.prototype.hasOwnProperty.call(input, key);
  const fields: Record<string, unknown> = {
    Slug: includeAdminFields && has('slug') ? cleanString(input.slug, true) : undefined,
    'First Name': has('firstName') ? cleanString(input.firstName, true) : undefined,
    'Last Name': has('lastName') ? cleanString(input.lastName, true) : undefined,
    Email: has('email') ? cleanString(input.email, true) : undefined,
    Phone: has('phone') ? cleanString(input.phone, true) : undefined,
    'Parent Name': has('parentName') ? cleanString(input.parentName, true) : undefined,
    'Parent Email': has('parentEmail') ? cleanString(input.parentEmail, true) : undefined,
    'Parent Phone': has('parentPhone') ? cleanString(input.parentPhone, true) : undefined,
    Position: has('position') ? cleanString(input.position, true) : undefined,
    Height: has('height') ? cleanString(input.height, true) : undefined,
    Weight: has('weight') ? cleanNumber(input.weight, true) : undefined,
    'Graduation Year': has('gradYear') ? cleanNumber(input.gradYear, true) : undefined,
    'SAT Score': has('sat') ? cleanNumber(input.sat, true) : undefined,
    'ACT Score': has('act') ? cleanNumber(input.act, true) : undefined,
    'Current School': has('school') ? cleanString(input.school, true) : undefined,
    'City / Province': has('location') ? cleanString(input.location, true) : undefined,
    GPA: has('gpa') ? cleanNumber(input.gpa, true) : undefined,
    Bio: has('bio') ? cleanString(input.bio, true) : undefined,
    Strengths: has('strengths') ? cleanString(input.strengths, true) : undefined,
    'Highlight Video URL': has('videoUrl') ? cleanString(input.videoUrl, true) : undefined,
    'Photo URL': has('photoUrl') ? cleanString(input.photoUrl, true) : undefined,
    'Transcript URL': has('transcriptUrl') ? cleanString(input.transcriptUrl, true) : undefined,
    'Gameplay Video URL': has('gameplayVideoUrl') ? cleanString(input.gameplayVideoUrl, true) : undefined,
    'Club Team': has('team') ? cleanString(input.team, true) : undefined,
    'Jersey Number': has('jersey') ? cleanString(input.jersey, true) : undefined,
    'Vertical Jump': has('vertical') ? cleanString(input.vertical, true) : undefined,
    'Standing Reach': has('reach') ? cleanString(input.reach, true) : undefined,
    'Dominant Hand': has('hand') ? cleanString(input.hand, true) : undefined,
    'NCAA Eligibility': has('ncaa') ? cleanString(input.ncaa, true) : undefined,
    'Profile Views': includeAdminFields && has('profileViews') ? cleanNumber(input.profileViews, true) : undefined,
    Offers: includeAdminFields && has('offers') ? cleanString(input.offers, true) : undefined,
    Visits: includeAdminFields && has('visits') ? cleanString(input.visits, true) : undefined,
    'Fee Stage 1': includeAdminFields && has('feeStage1') ? input.feeStage1 === true : undefined,
    'Fee Stage 2': includeAdminFields && has('feeStage2') ? input.feeStage2 === true : undefined,
    'Fee Stage 3': includeAdminFields && has('feeStage3') ? input.feeStage3 === true : undefined,
    'NIL Interest': includeAdminFields && has('nilInterest') ? input.nilInterest === true : undefined,
    'Terms Agreed': includeAdminFields && has('termsAgreed') ? input.termsAgreed === true : undefined,
  };
  if (includeAdminFields && has('status')) fields.Status = cleanString(input.status, true);
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}

export async function createAthlete(input: AthleteInput) {
  const headers = await airtableHeaders();
  const firstName = cleanString(input.firstName);
  const lastName = cleanString(input.lastName);
  if (!firstName || !lastName) throw new Error('First and last name are required.');
  const fields = {
    ...athleteFieldsFromInput(input, true),
    Slug: slugify([firstName, lastName, cleanString(input.gradYear)]),
    Status: cleanString(input.status) || 'Pending',
    'Submitted At': new Date().toISOString().slice(0, 10),
  };
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${ATHLETES}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { records: AirtableRecord[] };
  return athleteFromRecord(data.records[0]);
}

export async function deleteAthlete(recordId: string) {
  await archiveAthlete(recordId, 'Profile archived by admin');
  const record = await getRawAthleteRecord(recordId);
  await patchAthleteFields(recordId, {
    Status: 'Archived',
    Slug: `archived-${recordId}`,
    Notes: appendActivityLine(record ? f(record, 'Notes') : '', 'Admin archived profile.'),
  });
}

export async function getAthlete(slug: string, options: { includeHidden?: boolean } = {}): Promise<Athlete | null> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return slug === sample.slug ? sample : null;

  const safe = slug.replace(/[^a-z0-9-]/g, '');
  const url = `https://api.airtable.com/v0/${BASE}/${ATHLETES}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${safe}'`)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = (await res.json()) as { records: AirtableRecord[] };
  const r = data.records?.[0];
  if (!r) return null;

  const athlete: Athlete = athleteFromRecord(r);
  if (!options.includeHidden && athlete.status === 'Archived') return null;

  // Coach Responses table is optional; ignore errors until it exists.
  try {
    const cr = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Coach Outreach')}?filterByFormula=${encodeURIComponent(`{Athlete Slug}='${safe}'`)}&sort%5B0%5D%5Bfield%5D=Response%20Date&sort%5B0%5D%5Bdirection%5D=desc`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } },
    );
    if (cr.ok) {
      const crData = (await cr.json()) as { records: AirtableRecord[] };
      athlete.responses = crData.records.map(rec => ({
        school: f(rec, 'School'), coach: f(rec, 'Coach Name'),
        status: f(rec, 'Response Status'), date: f(rec, 'Response Date'),
      }));
    }
  } catch { /* table not created yet */ }

  return athlete;
}
