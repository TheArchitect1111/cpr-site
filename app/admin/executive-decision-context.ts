import type { CollectionDef, CollectionItem } from '@/lib/admin-collections-schema';

export type ExecutiveDecisionSignal = {
  label: string;
  value: string | number;
  detail?: string;
  urgency?: 'low' | 'medium' | 'high';
};

export type ExecutiveDecisionContext = {
  screen: string;
  signals: ExecutiveDecisionSignal[];
  interpretation: string;
  recommendation: string;
  nextBestAction: string;
  confidence: string;
  expectedOutcome: string;
  successMetric: string;
  urgency: 'low' | 'medium' | 'high';
  reasonForPriority: string;
  followUpMeasurement: string;
};

export type RankedDecisionItem = {
  title: string;
  reason: string;
  action: string;
  outcome: string;
  trigger: string;
  risk: string;
  followUpMeasurement: string;
  href?: string;
  actionLabel?: string;
  urgency?: ExecutiveDecisionContext['urgency'];
};

export function createExecutiveDecisionContext(context: ExecutiveDecisionContext) {
  return context;
}

export function briefFromDecision(context: ExecutiveDecisionContext, actionHref?: string, actionLabel?: string) {
  return {
    eyebrow: context.screen,
    title: context.interpretation,
    situation: context.signals.map((signal) => `${signal.label}: ${signal.value}${signal.detail ? ` (${signal.detail})` : ''}`).join('. '),
    recommendation: context.recommendation,
    why: context.reasonForPriority,
    nextBestAction: context.nextBestAction,
    expectedOutcome: context.expectedOutcome,
    confidence: context.confidence,
    successMetric: context.successMetric,
    urgency: context.urgency,
    followUpMeasurement: context.followUpMeasurement,
    actionHref,
    actionLabel,
  };
}

export function recommendedFromDecision(item: RankedDecisionItem) {
  return {
    title: item.title,
    reason: item.reason,
    action: item.action,
    outcome: item.outcome,
    trigger: item.trigger,
    risk: item.risk,
    followUpMeasurement: item.followUpMeasurement,
    href: item.href,
    actionLabel: item.actionLabel,
    urgency: item.urgency,
  };
}

function text(item: CollectionItem, key: string) {
  return String(item[key] ?? '').trim();
}

function timeValue(value: unknown) {
  const parsed = new Date(String(value || '')).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function rankCollectionItem(def: CollectionDef, items: CollectionItem[]): CollectionItem | null {
  if (items.length === 0) return null;
  const statusKey = def.statusField;
  const priorityStatus = new Set([
    'pending',
    'draft',
    'sent',
    'viewed',
    'under review',
    'identified',
    'contacted',
    'follow up',
    'maybe',
    'target',
    'reach',
  ]);
  return [...items].sort((a, b) => {
    const aStatus = statusKey ? text(a, statusKey).toLowerCase() : '';
    const bStatus = statusKey ? text(b, statusKey).toLowerCase() : '';
    const aScore = (priorityStatus.has(aStatus) ? 100 : 0) + (aStatus === 'published' || aStatus === 'signed' || aStatus === 'accepted' ? -30 : 0);
    const bScore = (priorityStatus.has(bStatus) ? 100 : 0) + (bStatus === 'published' || bStatus === 'signed' || bStatus === 'accepted' ? -30 : 0);
    if (aScore !== bScore) return bScore - aScore;
    return timeValue(a.updatedAt || a.createdAt) - timeValue(b.updatedAt || b.createdAt);
  })[0] ?? null;
}

export function collectionDecisionItem(def: CollectionDef, items: CollectionItem[], href: string): RankedDecisionItem {
  const item = rankCollectionItem(def, items);
  if (!item) {
    return {
      title: `No ${def.singular.toLowerCase()} needs action right now`,
      reason: `There are no ${def.singular.toLowerCase()} records creating a clear owner decision.`,
      action: `Create a ${def.singular.toLowerCase()} only if it supports a current decision or active opportunity.`,
      outcome: 'The workspace stays focused on meaningful work instead of inventory.',
      trigger: 'No active records were available to rank.',
      risk: 'Low risk; the main risk is creating unnecessary work.',
      followUpMeasurement: 'A new record should create a named next step, owner, or publishable update.',
      href,
      actionLabel: 'Create only if needed',
      urgency: 'low',
    };
  }
  const title = text(item, def.titleField) || `Priority ${def.singular.toLowerCase()}`;
  const status = def.statusField ? text(item, def.statusField) : '';
  return {
    title,
    reason: status ? `${status} is the clearest signal in this list and should be resolved before lower-impact records.` : 'This is the oldest visible record, so it is the safest first item to confirm or advance.',
    action: `Open this ${def.singular.toLowerCase()} and decide whether to improve, publish, assign, close, or leave it as-is.`,
    outcome: 'One record moves from passive inventory to a measurable operating outcome.',
    trigger: status ? `Priority status: ${status}.` : 'Oldest available record.',
    risk: 'Reduces stale records, missed follow-up, and unclear ownership.',
    followUpMeasurement: 'The item should have a clearer status, owner, date, or next action after review.',
    href,
    actionLabel: 'Review priority item',
    urgency: status ? 'medium' : 'low',
  };
}
