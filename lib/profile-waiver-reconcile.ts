/**
 * Complimentary profile waivers are bearer authorizations issued by CPR
 * after a valid promo code is redeemed. The opaque redemption UUID is stored
 * only in a SameSite, HttpOnly cookie. It is never included in a URL.
 *
 * A waiver is matched only after a new applicant record has been saved.
 * The public Google Form remains outside this workflow.
 */
export const CPR_PROFILE_WAIVER_COOKIE = 'cpr_profile_waiver';
export const CPR_PROFILE_WAIVER_PATH = '/profile/complimentary/apply';

const CPR_BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const WAIVER_TABLE = 'tbl6KJoZtclYZvR6O';
const API_ROOT = `https://api.airtable.com/v0/${CPR_BASE}/${WAIVER_TABLE}`;
const REDEMPTION_ID = 'Redemption ID';
const EMAIL = 'Athlete Email';
const STATUS = 'Status';
const VERIFIED_APPLICATION = 'Verified Athlete Application';

type WaiverRecord = { id: string; fields: Record<string, unknown> };
type AirtablePage = { records?: WaiverRecord[] };

export type IssuedProfileWaiver = {
  recordId: string;
  redemptionId: string;
  email: string;
};

const validRedemptionId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export async function findIssuedProfileWaiver(input: {
  redemptionId: string;
  token: string;
}): Promise<IssuedProfileWaiver | null> {
  if (!validRedemptionId(input.redemptionId) || !input.token) return null;

  const formula = `AND({${REDEMPTION_ID}}=${JSON.stringify(input.redemptionId)},{${STATUS}}="Issued")`;
  const url = new URL(API_ROOT);
  url.searchParams.set('filterByFormula', formula);
  url.searchParams.set('maxRecords', '2');
  const result = await fetch(url, {
    headers: { Authorization: `Bearer ${input.token}` },
    cache: 'no-store',
  });
  if (!result.ok) throw new Error('Unable to verify complimentary profile authorization');

  const { records = [] } = await result.json() as AirtablePage;
  // Never accept ambiguous records or an already linked application.
  if (records.length !== 1) return null;
  const record = records[0];
  const email = String(record.fields[EMAIL] ?? '').trim().toLowerCase();
  if (record.fields[REDEMPTION_ID] !== input.redemptionId ||
      record.fields[STATUS] !== 'Issued' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (record.fields[VERIFIED_APPLICATION] as unknown[] | undefined)?.length) {
    return null;
  }
  return { recordId: record.id, redemptionId: input.redemptionId, email };
}

export async function reconcileProfileWaiver(input: {
  applicantEmail: string;
  applicantRecordId: string;
  redemptionId: string;
  token: string;
}): Promise<boolean> {
  if (!/^rec[A-Za-z0-9]{14}$/.test(input.applicantRecordId)) return false;
  const waiver = await findIssuedProfileWaiver({
    redemptionId: input.redemptionId,
    token: input.token,
  });
  if (!waiver || waiver.email !== input.applicantEmail.trim().toLowerCase()) return false;

  const response = await fetch(`${API_ROOT}/${waiver.recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${input.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        [STATUS]: 'Matched to Application',
        [VERIFIED_APPLICATION]: [input.applicantRecordId],
      },
      typecast: false,
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('CPR waiver reconciliation failed');
  return true;
}
