import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { getEditableSurfaceManifest } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument, saveEditableSurfaceDocument } from '@/lib/surface-editor/store';

export const dynamic = 'force-dynamic';

function sanitize(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) return value.slice(0, 100).map((entry) => sanitize(entry, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, 300).map(([childKey, child]) => [childKey, sanitize(child, childKey)]));
  }
  if (typeof value !== 'string') return value;
  const text = value.slice(0, 20_000);
  if (!/url|href|image|photo|portrait|logo/i.test(key) || !text) return text;
  if (/^(\/|#|https?:\/\/|mailto:|tel:)/i.test(text)) return text;
  return '';
}

export async function GET(req: NextRequest, context: { params: Promise<{ surfaceId: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { surfaceId } = await context.params;
  const manifest = getEditableSurfaceManifest(surfaceId);
  if (!manifest) return NextResponse.json({ error: 'Unknown editable page.' }, { status: 404 });
  return NextResponse.json({ document: await getEditableSurfaceDocument(manifest) });
}

export async function POST(req: NextRequest, context: { params: Promise<{ surfaceId: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { surfaceId } = await context.params;
  const manifest = getEditableSurfaceManifest(surfaceId);
  if (!manifest) return NextResponse.json({ error: 'Unknown editable page.' }, { status: 404 });
  try {
    const body = await req.json();
    const serialized = JSON.stringify(body);
    if (serialized.length > 1_000_000) return NextResponse.json({ error: 'Page content is too large.' }, { status: 413 });
    const document = await saveEditableSurfaceDocument(manifest, { content: sanitize(body.content ?? {}) as Record<string, unknown>, sections: body.sections ?? [] });
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save page.' }, { status: 500 });
  }
}
