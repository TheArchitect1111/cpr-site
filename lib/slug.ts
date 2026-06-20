const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const ATHLETES = process.env.AIRTABLE_TABLE_ID || 'tblZwrZHi3WBR3NHZ';

export function toAthleteSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

async function slugTaken(token: string, slug: string): Promise<boolean> {
  const safe = slug.replace(/'/g, "\\'");
  const url = `https://api.airtable.com/v0/${BASE}/${ATHLETES}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${safe}'`)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) return false;
  const data = (await res.json()) as { records: unknown[] };
  return (data.records?.length ?? 0) > 0;
}

export async function uniqueAthleteSlug(
  token: string,
  firstName: string,
  lastName: string,
): Promise<string> {
  const base = toAthleteSlug(firstName, lastName) || `athlete-${Date.now()}`;
  if (!(await slugTaken(token, base))) return base;
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    if (!(await slugTaken(token, candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}
