import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest } from '@/lib/admin-auth';
import { generateCPRConversionCampaign } from '@/lib/amplifi/cpr-conversion-engine';
import { PLAYER_APPLICATION_URL } from '@/config/site';
import { createCPRCampaign, type CPRConversionType } from '@/lib/amplifi/campaign-store';
import { CPRCampaignPerformance } from '@/lib/amplifi/campaign-analytics';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!adminFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const topic = String(body?.topic || '').trim();
  const objective = String(body?.objective || '').trim();
  if (!topic || !objective) {
    return NextResponse.json({ error: 'Topic and objective are required.' }, { status: 400 });
  }

  const rawDestination = String(body?.destinationUrl || PLAYER_APPLICATION_URL).trim();
  let destinationUrl: string;
  try {
    destinationUrl = new URL(rawDestination, request.nextUrl.origin).toString();
  } catch {
    return NextResponse.json({ error: 'A valid destination link is required.' }, { status: 400 });
  }
  const allowedConversions = new Set<CPRConversionType>(['application', 'profile-purchase', 'registration', 'custom']);
  const requestedConversion = String(body?.conversionType || 'application') as CPRConversionType;
  const conversionType = allowedConversions.has(requestedConversion) ? requestedConversion : 'application';
  const actionInput = String(body?.callToAction || '').trim() || 'Complete the CPR application';
  const callToAction = actionInput.includes(destinationUrl) || actionInput.includes(rawDestination)
    ? actionInput
    : `${actionInput}: ${destinationUrl}`;
  const campaignId = `cpr-campaign-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}`;

  const generated = await generateCPRConversionCampaign({
    topic,
    objective,
    audience: String(body?.audience || '').trim(),
    callToAction,
    proof: String(body?.proof || '').trim(),
  });
  const trackingBase = `${request.nextUrl.origin}/r/amplifi/${encodeURIComponent(campaignId)}`;
  const drafts = generated.map((draft) => {
    const facebookTrackingUrl = `${trackingBase}/${encodeURIComponent(draft.id)}/facebook`;
    const instagramTrackingUrl = `${trackingBase}/${encodeURIComponent(draft.id)}/instagram`;
    return {
      ...draft,
      facebook: draft.facebook.split(destinationUrl).join(facebookTrackingUrl).split(rawDestination).join(facebookTrackingUrl),
      instagram: draft.instagram.split(destinationUrl).join(instagramTrackingUrl).split(rawDestination).join(instagramTrackingUrl),
      facebookTrackingUrl,
      instagramTrackingUrl,
    };
  });
  const campaign = await createCPRCampaign({
    id: campaignId,
    topic,
    objective,
    audience: String(body?.audience || '').trim() || 'Student-athletes ages 13–18 and their parents',
    callToAction: actionInput,
    destinationUrl,
    conversionType,
    drafts,
  });

  return NextResponse.json({
    engine: 'amplifi-conversion-content-engine',
    strategyPack: 'cpr',
    version: 3,
    campaign: { ...campaign, performance: CPRCampaignPerformance(campaign) },
  });
}
