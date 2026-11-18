/**
 * Reconcile a complimentary CPR player-profile waiver only after a *new*
 * Athlete Intake record has actually been saved. External Google Forms
 * responses do not pass through this function unless separately imported.
 */
const CPR_BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const WAIVER_TABLE = 'tbl6KJoZtclYZvR6O';
const WAIVER_EMAIL = 'Athlete Email';
const WAIVER_STATUS = 'Status';
const WAIVER_REDEEMED_AT = 'Redeemed At';
const VERIFIED_APPLICATION = 'Verified Athlete Application';

type Waiver = { id: string; fields: Record<string, unknown> };
type AirtablePage = { records?: Waiver[]; offset?: string };

export async function reconcileProfileWaiver(input: {
  applicantEmail: string;
  applicantRecordId: string;
  token: string;
}): Promise<boolean> {
  const email = input.applicantEmail.trim().toLowerCase();
  if (!email || !/^rec[A-Za-z0-9]{14}$/.test(input.applicantRecordId)) {
    return false;
  }

  // JSON strings are valid Airtable formula strings and correctly escape
  // untrusted characters from the applicant's email address.
  const formula = `AND({${WAIVER_STATUS}}="Issued",LOWER({${WAIVER_EMAIL}})=${JSON.stringify(email)})`;
  const waivers: Waiver[] = [];
  let offset: string | undefined;
  const root = `https://api.airtable.com/v0/${CPR_BASE}/${WAIVER_TABLE}`;
  do {
    const url = new URL(root);
    url.searchParams.set('filterByFormula', formula);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${input.token}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('CPR waiver lookup failed');
    const body = await response.json() as AirtablePage;
    waivers.push(...(body.records ?? []));
    offset = body.offset;
  } while (offset && waivers.length < 1000);

  const now = Date.now();
  const eligible = waivers
    .filter((waiver) => {
      const issued = Date.parse(String(waiver.fields[WAIVER_REDEEMED_AT] ?? ''));
      return Number.isFinite(issued) && issued <= now;
    })
    .sort((a, b) => String(b.fields[WAIVER_REDEEMED_AT]).localeCompare(String(a.fields[WAIVER_REDEEMED_AT])));
  const candidate = eligible[0];
  if (!candidate) return false;

  const response = await fetch(`https://api.airtable.com/v0/${CPR_BASE}/${WAIVER_TABLE}/${candidate.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${input.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        [WAIVER_STATUS]: 'Matched to Application',
        [VERIFIED_APPLICATION]: [input.applicantRecordId],
      },
      typecast: false,
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('CPR waiver reconciliation failed');
  return true;
}
