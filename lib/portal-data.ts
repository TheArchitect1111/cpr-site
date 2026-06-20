const BASE = 'appvVr6MVrJvEY0YJ';
const ATHLETES = 'tblZwrZHi3WBR3NHZ';
const OPPORTUNITIES = 'tblDQp0xesXvvpDBa';

export type OnboardingData = {
  profileComplete: boolean;
  videoUploaded: boolean;
  photosUploaded: boolean;
  assessmentComplete: boolean;
  parentOrientation: boolean;
  cprReview: boolean;
  readyForPromotion: boolean;
};

export type ParentPortalData = {
  recordId: string;
  slug: string;
  firstName: string;
  lastName: string;
  parentName: string;
  gradYear: number;
  sport: string;
  packagePurchased: string;
  onboarding: OnboardingData;
};

export type Opportunity = {
  id: string;
  schoolName: string;
  coachName: string;
  status: string;
  lastContactDate: string;
  followUpDate: string;
};

type AirtableRecord = { id: string; fields: Record<string, unknown> };

const fStr = (r: AirtableRecord, name: string): string => {
  const v = r.fields[name];
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return String(v[0] ?? '');
  return String(v);
};

const fBool = (r: AirtableRecord, name: string): boolean => r.fields[name] === true;

const SAMPLE_DATA: ParentPortalData = {
  recordId: 'rec_sample',
  slug: 'jayden-thompson',
  firstName: 'Jayden',
  lastName: 'Thompson',
  parentName: 'Mark Thompson',
  gradYear: 2027,
  sport: 'Basketball',
  packagePurchased: 'Elite',
  onboarding: {
    profileComplete: true,
    videoUploaded: true,
    photosUploaded: false,
    assessmentComplete: false,
    parentOrientation: true,
    cprReview: false,
    readyForPromotion: false,
  },
};

const SAMPLE_OPPS: Opportunity[] = [
  { id: 's1', schoolName: 'University of Toronto', coachName: 'Coach Williams', status: 'Responded', lastContactDate: '2026-05-28', followUpDate: '2026-06-21' },
  { id: 's2', schoolName: 'York University', coachName: 'Coach Davis', status: 'Interested', lastContactDate: '2026-06-05', followUpDate: '' },
  { id: 's3', schoolName: 'McMaster University', coachName: 'Coach Patel', status: 'Evaluation Scheduled', lastContactDate: '2026-06-10', followUpDate: '2026-06-25' },
];

export async function getParentPortalData(slug: string): Promise<ParentPortalData | null> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return slug === 'jayden-thompson' ? SAMPLE_DATA : null;

  const safe = slug.replace(/[^a-z0-9-]/g, '');
  const url = `https://api.airtable.com/v0/${BASE}/${ATHLETES}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${safe}'`)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) return null;
  const data = (await res.json()) as { records: AirtableRecord[] };
  const r = data.records?.[0];
  if (!r) return null;

  return {
    recordId: r.id,
    slug: fStr(r, 'Slug'),
    firstName: fStr(r, 'First Name'),
    lastName: fStr(r, 'Last Name'),
    parentName: fStr(r, 'Parent Name'),
    gradYear: Number(fStr(r, 'Graduation Year')) || 0,
    sport: fStr(r, 'Sport'),
    packagePurchased: fStr(r, 'Package Purchased'),
    onboarding: {
      profileComplete: fBool(r, 'Onboarding: Profile Complete'),
      videoUploaded: fBool(r, 'Onboarding: Highlight Video Uploaded'),
      photosUploaded: fBool(r, 'Onboarding: Photos Uploaded'),
      assessmentComplete: fBool(r, 'Onboarding: Recruiting Assessment Complete'),
      parentOrientation: fBool(r, 'Onboarding: Parent Orientation Complete'),
      cprReview: fBool(r, 'Onboarding: CPR Review Complete'),
      readyForPromotion: fBool(r, 'Onboarding: Ready For Promotion'),
    },
  };
}

export async function getOpportunities(athleteRecordId: string): Promise<Opportunity[]> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return athleteRecordId === 'rec_sample' ? SAMPLE_OPPS : [];

  const formula = `FIND("${athleteRecordId}",ARRAYJOIN({Athlete}))`;
  const url =
    `https://api.airtable.com/v0/${BASE}/${OPPORTUNITIES}` +
    `?filterByFormula=${encodeURIComponent(formula)}` +
    `&sort[0][field]=Last%20Contact%20Date&sort[0][direction]=desc`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) return [];
  const data = (await res.json()) as { records: AirtableRecord[] };

  return (data.records ?? []).map(r => ({
    id: r.id,
    schoolName: fStr(r, 'School Name'),
    coachName: fStr(r, 'Coach Name'),
    status: fStr(r, 'Status'),
    lastContactDate: fStr(r, 'Last Contact Date'),
    followUpDate: fStr(r, 'Follow-Up Date'),
  }));
}

export function getYearsUntilGrad(gradYear: number, currentYear: number): number {
  return gradYear > 0 ? gradYear - currentYear : 99;
}

export function onboardingProgress(onboarding: OnboardingData): number {
  const keys = Object.keys(onboarding) as (keyof OnboardingData)[];
  const done = keys.filter((key) => onboarding[key]).length;
  return keys.length ? Math.round((done / keys.length) * 100) : 0;
}
