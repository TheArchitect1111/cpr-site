// CPR Athlete data layer.
// Live mode: set AIRTABLE_TOKEN in Vercel env vars (never in code).
// Without a token, falls back to the built-in sample so the page is always demo-able.

const BASE = 'appvVr6MVrJvEY0YJ';
const ATHLETES = 'tblZwrZHi3WBR3NHZ';

export type CoachResponse = { school: string; coach: string; status: string; date: string };
export type Athlete = {
  slug: string; firstName: string; lastName: string; position: string; height: string;
  weight: string; gradYear: string; gpa: string; sat: string; act: string; school: string;
  location: string; email: string; phone: string; parentName: string; bio: string;
  strengths: string[]; videoUrl: string; photoUrl: string; status: string;
  team: string; jersey: string; vertical: string; reach: string; hand: string; ncaa: string;
  profileViews: string; offers: string; visits: string;
  responses: CoachResponse[];
};

const sample: Athlete = {
  slug: 'jayden-thompson', firstName: 'Jayden', lastName: 'Thompson', position: 'Point Guard',
  height: "6'2\"", weight: '175 lbs', gradYear: '2026', gpa: '3.8', sat: '1180', act: '',
  school: 'Lorne Park SS', location: 'Mississauga, Ontario', email: 'jaydent2026@email.com',
  phone: '(416) 555-8932', parentName: 'Mark Thompson',
  bio: 'Dynamic point guard with elite court vision, leadership and scoring ability. Strong handle, quick first step and excellent decision maker in transition and half court sets. Dedicated to academic success and athletic development.',
  strengths: ['Basketball IQ', 'Court Vision', 'Playmaking', '3PT Shooting', 'Leadership', 'Transition', 'Defense', 'Quick First Step'],
  videoUrl: 'https://youtu.be/iqietCwnCxc', photoUrl: '/hero-athlete.png', status: 'Active',
  team: 'Mississauga Magic U18 AAA', jersey: '1', vertical: '', reach: '', hand: 'Right', ncaa: '',
  profileViews: '', offers: '', visits: '', responses: [],
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

export async function getAthlete(slug: string): Promise<Athlete | null> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return slug === sample.slug ? sample : null;

  const safe = slug.replace(/[^a-z0-9-]/g, '');
  const url = `https://api.airtable.com/v0/${BASE}/${ATHLETES}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${safe}'`)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = (await res.json()) as { records: AirtableRecord[] };
  const r = data.records?.[0];
  if (!r) return null;

  const athlete: Athlete = {
    slug: f(r, 'Slug'), firstName: f(r, 'First Name'), lastName: f(r, 'Last Name'),
    position: f(r, 'Position'), height: f(r, 'Height'),
    weight: f(r, 'Weight') ? `${f(r, 'Weight')} lbs` : '', gradYear: f(r, 'Graduation Year'),
    gpa: f(r, 'GPA'), sat: f(r, 'SAT Score'), act: f(r, 'ACT Score'),
    school: f(r, 'Current School'), location: f(r, 'City / Province'),
    email: f(r, 'Email'), phone: f(r, 'Phone'), parentName: f(r, 'Parent Name'),
    bio: f(r, 'Bio'), strengths: f(r, 'Strengths').split(/[,\n]/).map(s => s.trim()).filter(Boolean),
    videoUrl: f(r, 'Highlight Video URL'), photoUrl: f(r, 'Photo URL') || f(r, 'Photo') || '/hero-athlete.png',
    status: f(r, 'Status') || 'Active', team: f(r, 'Club Team'), jersey: f(r, 'Jersey Number'),
    vertical: f(r, 'Vertical Jump'), reach: f(r, 'Standing Reach'), hand: f(r, 'Dominant Hand'),
    ncaa: f(r, 'NCAA Eligibility'), profileViews: f(r, 'Profile Views'),
    offers: f(r, 'Offers'), visits: f(r, 'Visits'), responses: [],
  };

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
