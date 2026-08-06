import 'server-only';

import { list, put } from '@vercel/blob';
import type { CPRDraft } from './cpr-conversion-engine';

export type CPRConversionType = 'application' | 'profile-purchase' | 'registration' | 'custom';
export type CPRPlatform = 'facebook' | 'instagram';

export type CPRPlatformMetrics = {
  platform: CPRPlatform;
  source: 'not-connected' | 'manual' | 'connected';
  impressions: number;
  reach: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  updatedAt?: string;
};

export type CPRCampaignAnalytics = {
  clicks: number;
  applicationCompletions: number;
  profilePurchases: number;
  registrations: number;
  customConversions: number;
  byPost: Array<{
    draftId: string;
    platform: CPRPlatform;
    clicks: number;
    conversions: number;
  }>;
  platformMetrics: CPRPlatformMetrics[];
  updatedAt: string;
};

export type CPRCampaign = {
  id: string;
  topic: string;
  objective: string;
  audience: string;
  callToAction: string;
  destinationUrl: string;
  conversionType: CPRConversionType;
  drafts: Array<CPRDraft & {
    facebookTrackingUrl: string;
    instagramTrackingUrl: string;
  }>;
  analytics: CPRCampaignAnalytics;
  createdAt: string;
  updatedAt: string;
};

const PATH = 'cpr/amplifi/campaigns.json';
const CACHE_TTL_MS = 3_000;
let cache: { campaigns: CPRCampaign[]; at: number } | null = null;

function configured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function emptyAnalytics(): CPRCampaignAnalytics {
  return {
    clicks: 0,
    applicationCompletions: 0,
    profilePurchases: 0,
    registrations: 0,
    customConversions: 0,
    byPost: [],
    platformMetrics: (['facebook', 'instagram'] as const).map((platform) => ({
      platform,
      source: 'not-connected',
      impressions: 0,
      reach: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    })),
    updatedAt: new Date().toISOString(),
  };
}

export async function listCPRCampaigns(): Promise<CPRCampaign[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.campaigns;
  if (!configured()) return [];
  try {
    const { blobs } = await list({ prefix: PATH, limit: 1 });
    const blob = blobs.find((item) => item.pathname === PATH);
    if (!blob) return [];
    const response = await fetch(blob.url, { cache: 'no-store' });
    const campaigns = response.ok ? await response.json() as CPRCampaign[] : [];
    const value = Array.isArray(campaigns) ? campaigns : [];
    cache = { campaigns: value, at: Date.now() };
    return value;
  } catch {
    return [];
  }
}

async function persist(campaigns: CPRCampaign[]) {
  if (!configured()) throw new Error('Amplifi storage is not configured.');
  await put(PATH, JSON.stringify(campaigns, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  cache = { campaigns, at: Date.now() };
}

export async function getCPRCampaign(id: string) {
  return (await listCPRCampaigns()).find((campaign) => campaign.id === id) ?? null;
}

export async function saveCPRCampaign(campaign: CPRCampaign) {
  const campaigns = await listCPRCampaigns();
  const next = [campaign, ...campaigns.filter((item) => item.id !== campaign.id)].slice(0, 100);
  await persist(next);
  return campaign;
}

export async function createCPRCampaign(input: Omit<CPRCampaign, 'id' | 'analytics' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const now = new Date().toISOString();
  return saveCPRCampaign({
    ...input,
    id: input.id ?? `cpr-campaign-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}`,
    analytics: emptyAnalytics(),
    createdAt: now,
    updatedAt: now,
  });
}
