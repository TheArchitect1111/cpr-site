// CPR Coach Outreach data layer.
// Lives in Airtable table "Coach Outreach" (base appvVr6MVrJvEY0YJ).
// Falls back to sample data when AIRTABLE_TOKEN or the table is missing.

const BASE = 'appvVr6MVrJvEY0YJ';

export type Outreach = {
  school: string; coach: string; coachRole: string; prospect: string; prospectSlug: string;
  positionYear: string; dateSent: string; opened: boolean; viewed: boolean;
  response: string; status: string; notes: string;
};

export const sampleOutreach: Outreach[] = [
  { school: 'University of Michigan', coach: 'Coach T. Reynolds', coachRole: 'Asst. Coach', prospect: 'Ethan Johnson', prospectSlug: 'jayden-thompson', positionYear: 'PG | 2026', dateSent: '2024-05-14', opened: true, viewed: true, response: 'Interested', status: 'Active', notes: 'Ethan looks like a great fit for our system. Let us keep in touch and send full game film.' },
  { school: 'Syracuse University', coach: 'Coach B. Taylor', coachRole: 'Asst. Coach', prospect: 'Noah Williams', prospectSlug: '', positionYear: 'SG | 2026', dateSent: '2024-05-13', opened: true, viewed: true, response: 'Follow Up', status: 'Pending', notes: '' },
  { school: 'University of Kentucky', coach: 'Coach J. Smith', coachRole: 'Assoc. HC', prospect: 'Mason Brown', prospectSlug: '', positionYear: 'SF | 2027', dateSent: '2024-05-13', opened: true, viewed: true, response: 'Maybe', status: 'Active', notes: '' },
  { school: 'University of Illinois', coach: 'Coach D. Brown', coachRole: 'Asst. Coach', prospect: 'Tyler Davis', prospectSlug: '', positionYear: 'PF | 2026', dateSent: '2024-05-12', opened: true, viewed: true, response: 'Not Interested', status: 'Closed', notes: '' },
  { school: 'University of Minnesota', coach: 'Coach K. Anderson', coachRole: 'Asst. Coach', prospect: 'Noah Williams', prospectSlug: '', positionYear: 'SG | 2026', dateSent: '2024-05-12', opened: true, viewed: true, response: 'Interested', status: 'Active', notes: '' },
  { school: 'Boston University', coach: 'Coach M. Carter', coachRole: 'Asst. Coach', prospect: 'Ethan Johnson', prospectSlug: 'jayden-thompson', positionYear: 'PG | 2026', dateSent: '2024-05-11', opened: true, viewed: false, response: 'Maybe', status: 'Pending', notes: '' },
  { school: 'UConn', coach: 'Coach A. Hill', coachRole: 'Asst. Coach', prospect: 'Jacob Smith', prospectSlug: '', positionYear: 'C | 2026', dateSent: '2024-05-11', opened: true, viewed: false, response: 'No Response', status: 'Waiting', notes: '' },
  { school: 'Northeastern University', coach: 'Coach D. Roberts', coachRole: 'Asst. Coach', prospect: 'Lucas Martin', prospectSlug: '', positionYear: 'SF | 2026', dateSent: '2024-05-10', opened: false, viewed: false, response: 'No Response', status: 'Waiting', notes: '' },
];

type AirtableRecord = { id: string; fields: Record<string, unknown> };
const f = (r: AirtableRecord, name: string): string => {
  const v = r.fields[name];
  return v === undefined || v === null ? '' : String(v);
};
const fb = (r: AirtableRecord, name: string): boolean => r.fields[name] === true;

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
          school: f(r, 'School'), coach: f(r, 'Coach Name'), coachRole: f(r, 'Coach Role'),
          prospect: f(r, 'Prospect Name'), prospectSlug: f(r, 'Athlete Slug'),
          positionYear: f(r, 'Position Year'), dateSent: f(r, 'Response Date') || f(r, 'Date Sent'),
          opened: fb(r, 'Opened'), viewed: fb(r, 'Viewed'),
          response: f(r, 'Response Status') || 'No Response', status: f(r, 'Status') || 'Waiting',
          notes: f(r, 'Notes'),
        });
      }
      offset = data.offset ?? '';
    } while (offset);
    return rows.length ? { rows, live: true } : { rows: sampleOutreach, live: false };
  } catch {
    return { rows: sampleOutreach, live: false };
  }
}
