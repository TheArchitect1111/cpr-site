import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest } from '@/lib/admin-auth';
import { updateRequestStatus } from '@/lib/content-requests';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = adminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  let body: {
    status?: string;
    markPublished?: boolean;
    markScheduled?: boolean;
    publishedBody?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const status = body.markPublished
    ? 'Published'
    : body.markScheduled
      ? 'Scheduled'
      : body.status;
  const datePublished = body.markPublished
    ? new Date().toISOString().slice(0, 10)
    : undefined;
  const publishedBody = body.publishedBody?.trim();

  const result = await updateRequestStatus(id, {
    status,
    datePublished,
    publishedContent: publishedBody,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    status,
    datePublished,
  });
}
