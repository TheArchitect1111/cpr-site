import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest } from '@/lib/admin-auth';
import { listCPRCampaigns, type CPRPlatform } from '@/lib/amplifi/campaign-store';
import { CPRCampaignPerformance, updateCPRPlatformMetrics } from '@/lib/amplifi/campaign-analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!adminFromRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const campaigns = await listCPRCampaigns();
  return NextResponse.json({
    campaigns: campaigns.map((campaign) => ({ ...campaign, performance: CPRCampaignPerformance(campaign) })),
  });
}

export async function PATCH(request: NextRequest) {
  if (!adminFromRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const campaignId = String(body?.campaignId || '').trim();
  const platform = String(body?.platform || '') as CPRPlatform;
  if (!campaignId || !['facebook', 'instagram'].includes(platform)) {
    return NextResponse.json({ error: 'Campaign and platform are required.' }, { status: 400 });
  }
  const campaign = await updateCPRPlatformMetrics(campaignId, platform, body || {});
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  return NextResponse.json({ campaign: { ...campaign, performance: CPRCampaignPerformance(campaign) } });
}
