import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import {
  getCPRCampaign,
  saveCPRCampaign,
  type CPRCampaign,
  type CPRConversionType,
  type CPRPlatform,
  type CPRPlatformMetrics,
} from './campaign-store';

export const CPR_AMPLIFI_COOKIE = 'cpr_amplifi_attribution';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Attribution = { campaignId: string; draftId: string; platform: CPRPlatform; exp: number };

function secret() {
  return process.env.AMPLIFI_TRACKING_SECRET?.trim() || getAdminSessionSecret() || 'cpr-amplifi-v1';
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createCPRAttribution(campaignId: string, draftId: string, platform: CPRPlatform) {
  const encoded = Buffer.from(JSON.stringify({ campaignId, draftId, platform, exp: Date.now() + TTL_MS } satisfies Attribution)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function readCPRAttribution(value: string | undefined): Attribution | null {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot < 1) return null;
  const encoded = value.slice(0, dot);
  const supplied = value.slice(dot + 1);
  const expected = sign(encoded);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Attribution;
    if (!parsed.campaignId || !parsed.draftId || !['facebook', 'instagram'].includes(parsed.platform) || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function conversionField(type: CPRConversionType): keyof Pick<CPRCampaign['analytics'], 'applicationCompletions' | 'profilePurchases' | 'registrations' | 'customConversions'> {
  if (type === 'application') return 'applicationCompletions';
  if (type === 'profile-purchase') return 'profilePurchases';
  if (type === 'registration') return 'registrations';
  return 'customConversions';
}

export async function recordCPRCampaignEvent(input: Omit<Attribution, 'exp'> & { event: 'click' | 'conversion' }) {
  const campaign = await getCPRCampaign(input.campaignId);
  if (!campaign || !campaign.drafts.some((draft) => draft.id === input.draftId)) return false;
  const analytics = campaign.analytics;
  const current = analytics.byPost.find((row) => row.draftId === input.draftId && row.platform === input.platform) ?? {
    draftId: input.draftId,
    platform: input.platform,
    clicks: 0,
    conversions: 0,
  };
  const field = conversionField(campaign.conversionType);
  const nextAnalytics = {
    ...analytics,
    clicks: analytics.clicks + (input.event === 'click' ? 1 : 0),
    [field]: analytics[field] + (input.event === 'conversion' ? 1 : 0),
    byPost: [
      ...analytics.byPost.filter((row) => row.draftId !== input.draftId || row.platform !== input.platform),
      {
        ...current,
        clicks: current.clicks + (input.event === 'click' ? 1 : 0),
        conversions: current.conversions + (input.event === 'conversion' ? 1 : 0),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
  await saveCPRCampaign({ ...campaign, analytics: nextAnalytics, updatedAt: nextAnalytics.updatedAt });
  return true;
}

function count(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

export async function updateCPRPlatformMetrics(campaignId: string, platform: CPRPlatform, input: Partial<CPRPlatformMetrics>) {
  const campaign = await getCPRCampaign(campaignId);
  if (!campaign) return null;
  const current = campaign.analytics.platformMetrics.find((item) => item.platform === platform);
  const updated: CPRPlatformMetrics = {
    platform,
    source: 'manual',
    impressions: count(input.impressions ?? current?.impressions),
    reach: count(input.reach ?? current?.reach),
    reactions: count(input.reactions ?? current?.reactions),
    comments: count(input.comments ?? current?.comments),
    shares: count(input.shares ?? current?.shares),
    saves: count(input.saves ?? current?.saves),
    updatedAt: new Date().toISOString(),
  };
  const analytics = {
    ...campaign.analytics,
    platformMetrics: [...campaign.analytics.platformMetrics.filter((item) => item.platform !== platform), updated],
    updatedAt: updated.updatedAt!,
  };
  return saveCPRCampaign({ ...campaign, analytics, updatedAt: analytics.updatedAt });
}

export function CPRCampaignPerformance(campaign: CPRCampaign) {
  const totals = campaign.analytics.platformMetrics.reduce((sum, item) => ({
    impressions: sum.impressions + item.impressions,
    reach: sum.reach + item.reach,
    engagements: sum.engagements + item.reactions + item.comments + item.shares + item.saves,
  }), { impressions: 0, reach: 0, engagements: 0 });
  const conversions = campaign.analytics.applicationCompletions + campaign.analytics.profilePurchases + campaign.analytics.registrations + campaign.analytics.customConversions;
  return {
    ...totals,
    conversions,
    clickThroughRate: totals.impressions ? campaign.analytics.clicks / totals.impressions : null,
    conversionRate: campaign.analytics.clicks ? conversions / campaign.analytics.clicks : null,
  };
}
