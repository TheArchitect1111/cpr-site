import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest } from '@/lib/admin-auth';
import {
  createCommunicationAnnouncement,
  updateCommunicationAnnouncement,
} from '@/lib/communication-center-data';

export const dynamic = 'force-dynamic';

function parseEmails(value: unknown) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(/[\n,;]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseChannels(value: unknown) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const title = String(body.title || '').trim();
  const message = String(body.body || '').trim();
  const audience = String(body.audience || 'All').trim();
  const channels = parseChannels(body.channels);
  const scheduledAt = String(body.scheduledAt || '').trim();

  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  if (!channels.length) return NextResponse.json({ error: 'Select at least one channel.' }, { status: 400 });

  try {
    const announcement = await createCommunicationAnnouncement({
      title,
      body: message,
      audience,
      channels,
      recipientEmails: parseEmails(body.recipientEmails),
      pinned: Boolean(body.pinned),
      scheduledAt,
      publishNow: Boolean(body.publishNow),
      actorName: admin.name || admin.email,
    });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Announcement could not be saved.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const id = String(body.id || '').trim();
  const action = String(body.action || '').trim();
  if (!id) return NextResponse.json({ error: 'Announcement id is required.' }, { status: 400 });
  if (action !== 'publish' && action !== 'archive') {
    return NextResponse.json({ error: 'Action must be publish or archive.' }, { status: 400 });
  }

  try {
    const announcement = await updateCommunicationAnnouncement({
      id,
      action,
      actorName: admin.name || admin.email,
    });
    return NextResponse.json({ announcement });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Announcement could not be updated.' },
      { status: 500 },
    );
  }
}

