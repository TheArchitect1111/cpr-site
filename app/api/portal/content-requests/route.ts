import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { createRequest, listForAthlete } from '@/lib/content-requests';
import { getParentPortalData } from '@/lib/portal-data';

export const dynamic = 'force-dynamic';

async function requirePortalSession(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  return token ? verifySession(token) : null;
}

export async function GET(req: NextRequest) {
  const session = await requirePortalSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const slugParam = req.nextUrl.searchParams.get('slug')?.trim();
  const slug = slugParam || session.slug;
  if (slug !== session.slug) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const result = await listForAthlete(slug);
  return NextResponse.json({
    ok: true,
    live: result.live,
    error: result.error,
    requests: result.records,
  });
}

export async function POST(req: NextRequest) {
  const session = await requirePortalSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  }

  let body: {
    slug?: string;
    requestType?: string;
    title?: string;
    description?: string;
    priority?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const slug = String(body.slug || session.slug).trim();
  if (slug !== session.slug) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const requestType = String(body.requestType || '').trim();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const priority = String(body.priority || 'Normal').trim() || 'Normal';

  if (!requestType || !title) {
    return NextResponse.json({ error: 'Request type and title are required.' }, { status: 400 });
  }

  const portalData = await getParentPortalData(slug);
  const athleteName = portalData
    ? `${portalData.firstName || ''} ${portalData.lastName || ''}`.trim() || slug
    : slug;
  const submittedBy =
    session.type === 'parent' ? `Parent (${slug})` : `Athlete (${athleteName})`;

  const result = await createRequest({
    athleteSlug: slug,
    athleteName,
    requestType,
    title,
    description: description || undefined,
    priority,
    submittedBy,
    status: 'Pending Review',
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Request could not be saved.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    recordId: result.recordId,
    requestId: result.requestId,
    status: 'Pending Review',
  });
}
