import { NextRequest, NextResponse } from 'next/server';
import { getCPRCampaign, type CPRPlatform } from '@/lib/amplifi/campaign-store';
import {
  CPR_AMPLIFI_COOKIE,
  createCPRAttribution,
  recordCPRCampaignEvent,
} from '@/lib/amplifi/campaign-analytics';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; draftId: string; platform: string }> },
) {
  const values = await params;
  const campaignId = decodeURIComponent(values.campaignId);
  const draftId = decodeURIComponent(values.draftId);
  const platform = values.platform as CPRPlatform;
  const campaign = await getCPRCampaign(campaignId);
  if (!campaign || !campaign.drafts.some((draft) => draft.id === draftId) || !['facebook', 'instagram'].includes(platform)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  const destination = new URL(campaign.destinationUrl);
  destination.searchParams.set('utm_source', platform);
  destination.searchParams.set('utm_medium', 'social');
  destination.searchParams.set('utm_campaign', campaign.id);
  destination.searchParams.set('utm_content', draftId);
  destination.searchParams.set('amplifi_campaign', campaign.id);
  destination.searchParams.set('amplifi_post', draftId);

  await recordCPRCampaignEvent({ campaignId, draftId, platform, event: 'click' });
  const response = NextResponse.redirect(destination);
  response.cookies.set({
    name: CPR_AMPLIFI_COOKIE,
    value: createCPRAttribution(campaignId, draftId, platform),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
