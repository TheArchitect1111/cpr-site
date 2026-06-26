import type { AthleteAdmin } from './athletes';

export type PaymentStage = 'stage1' | 'stage2' | 'stage3';

const STAGE_LABELS: Record<PaymentStage, string> = {
  stage1: 'Stage 1',
  stage2: 'Stage 2',
  stage3: 'Stage 3',
};

const STAGE_FIELD: Record<PaymentStage, 'feeStage1' | 'feeStage2' | 'feeStage3'> = {
  stage1: 'feeStage1',
  stage2: 'feeStage2',
  stage3: 'feeStage3',
};

function envAmount(stage: PaymentStage) {
  const key = `STRIPE_${stage.toUpperCase()}_AMOUNT_CENTS`;
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
}

export function paymentStageField(stage: PaymentStage) {
  return STAGE_FIELD[stage];
}

export function paymentStageLabel(stage: PaymentStage) {
  return STAGE_LABELS[stage];
}

export function isPaymentStage(value: string): value is PaymentStage {
  return value === 'stage1' || value === 'stage2' || value === 'stage3';
}

export function paymentAmountCents(stage: PaymentStage, athlete?: Pick<AthleteAdmin, 'programOption'>) {
  const configured = envAmount(stage);
  if (configured) return configured;
  const program = (athlete?.programOption || '').toLowerCase();
  if (program.includes('international')) return stage === 'stage3' ? 50000 : 100000;
  return 50000;
}

export function paymentDescription(stage: PaymentStage, athlete?: Pick<AthleteAdmin, 'firstName' | 'lastName'>) {
  const name = [athlete?.firstName, athlete?.lastName].filter(Boolean).join(' ') || 'CPR applicant';
  return `CPR Global Prospects ${paymentStageLabel(stage)} payment for ${name}`;
}
