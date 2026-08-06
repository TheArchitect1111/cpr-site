import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest } from '@/lib/admin-auth';
import { generateCPRConversionCampaign } from '@/lib/amplifi/cpr-conversion-engine';

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

  const drafts = await generateCPRConversionCampaign({
    topic,
    objective,
    audience: String(body?.audience || '').trim(),
    callToAction: String(body?.callToAction || '').trim(),
    proof: String(body?.proof || '').trim(),
  });

  return NextResponse.json({
    engine: 'amplifi-conversion-content-engine',
    strategyPack: 'cpr',
    version: 3,
    drafts,
  });
}
