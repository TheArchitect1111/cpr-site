/**
 * In-portal payment link helpers for CPR athlete/parent workspaces.
 *
 * Reuses the same HMAC athlete edit token as admin-generated `/pay?...` links
 * and `POST /api/payments/checkout` (see `athleteEditToken` in lib/athletes.ts).
 * Do not weaken token verification on checkout — portal APIs only mint links
 * after a valid portal session for that athlete slug.
 *
 * Stripe: `STRIPE_SECRET_KEY` (and related env) must be set in Vercel/production
 * or checkout returns 503. Also requires `ATHLETE_ACCESS_SECRET` or `ADMIN_PASSWORD`
 * so edit tokens can be minted.
 */

import { athleteEditToken, getAthleteByRecordId, type AthleteAdmin } from '@/lib/athletes';
import {
  isPaymentStage,
  paymentAmountCents,
  paymentStageField,
  paymentStageLabel,
  type PaymentStage,
} from '@/lib/payments';
import { getParentPortalData } from '@/lib/portal-data';

const STAGES: PaymentStage[] = ['stage1', 'stage2', 'stage3'];

export type PortalPaymentStageInfo = {
  stage: PaymentStage;
  label: string;
  amountCents: number;
  paid: boolean;
};

export type PortalPaymentsSnapshot = {
  recordId: string;
  firstName: string;
  lastName: string;
  stages: PortalPaymentStageInfo[];
  dueStages: PaymentStage[];
};

export function unpaidPaymentStages(
  athlete: Pick<AthleteAdmin, 'feeStage1' | 'feeStage2' | 'feeStage3'>,
): PaymentStage[] {
  return STAGES.filter((stage) => !athlete[paymentStageField(stage)]);
}

export function buildPaymentPath(recordId: string, stage: PaymentStage): string | null {
  const token = athleteEditToken(recordId);
  if (!token || !recordId) return null;
  return `/pay?id=${encodeURIComponent(recordId)}&stage=${stage}&token=${encodeURIComponent(token)}`;
}

export async function getPortalPaymentsSnapshot(slug: string): Promise<PortalPaymentsSnapshot | null> {
  const portal = await getParentPortalData(slug);
  if (!portal?.recordId) return null;

  const athlete = await getAthleteByRecordId(portal.recordId);
  if (!athlete) {
    return {
      recordId: portal.recordId,
      firstName: portal.firstName,
      lastName: portal.lastName,
      stages: [],
      dueStages: [],
    };
  }

  const dueStages = unpaidPaymentStages(athlete);
  const stages: PortalPaymentStageInfo[] = STAGES.map((stage) => ({
    stage,
    label: paymentStageLabel(stage),
    amountCents: paymentAmountCents(stage, athlete),
    paid: athlete[paymentStageField(stage)],
  }));

  return {
    recordId: athlete.id,
    firstName: athlete.firstName || portal.firstName,
    lastName: athlete.lastName || portal.lastName,
    stages,
    dueStages,
  };
}

export type ResolvePaymentLinkResult =
  | { ok: true; url: string; stage: PaymentStage }
  | { ok: false; reason: 'not_found' | 'none_due' | 'invalid_stage' | 'token_unavailable' };

export async function resolvePortalPaymentLink(
  slug: string,
  stageValue?: string | null,
): Promise<ResolvePaymentLinkResult> {
  const snapshot = await getPortalPaymentsSnapshot(slug);
  if (!snapshot) return { ok: false, reason: 'not_found' };
  if (snapshot.dueStages.length === 0) return { ok: false, reason: 'none_due' };

  let stage: PaymentStage;
  if (stageValue) {
    if (!isPaymentStage(stageValue) || !snapshot.dueStages.includes(stageValue)) {
      return { ok: false, reason: 'invalid_stage' };
    }
    stage = stageValue;
  } else {
    stage = snapshot.dueStages[0];
  }

  const url = buildPaymentPath(snapshot.recordId, stage);
  if (!url) return { ok: false, reason: 'token_unavailable' };
  return { ok: true, url, stage };
}
