import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest } from '@/lib/admin-auth';
import { publishPortalUpdate, type PortalUpdateChannel } from '@/lib/portal-update-publish';

export const dynamic = 'force-dynamic';

function parseChannels(value: unknown): PortalUpdateChannel[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item): item is PortalUpdateChannel => item === 'website' || item === 'social');
}

export async function POST(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const slug = String(body.slug || '').trim();
  const portalType = body.portalType === 'parent' ? 'parent' : 'athlete';
  const title = String(body.title || '').trim();
  const message = String(body.message || '').trim();
  const channels = parseChannels(body.channels);

  if (!slug) return NextResponse.json({ error: 'Athlete slug is required.' }, { status: 400 });
  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  if (!channels.length) {
    return NextResponse.json({ error: 'Select website, social media, or both.' }, { status: 400 });
  }

  try {
    const result = await publishPortalUpdate({
      slug,
      portalType,
      title,
      message,
      channels,
      audience: String(body.audience || 'All').trim(),
      socialCaption: String(body.socialCaption || '').trim() || undefined,
      actorName: admin.name || admin.email,
      actorEmail: admin.email,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update could not be published.' },
      { status: 500 },
    );
  }
}
