import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import {
  getPortalContent,
  savePortalContent,
  type PortalContent,
  type PortalSection,
  type PortalSectionId,
} from '@/lib/portal-content';

export const dynamic = 'force-dynamic';

const VALID_IDS: PortalSectionId[] = [
  'hub-cards',
  'action-center',
  'onboarding',
  'roadmap',
  'action-plan',
  'opportunities',
  'learning-center',
  'athlete-services',
];

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const content = await getPortalContent();
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Partial<PortalContent>;
  try {
    body = (await req.json()) as Partial<PortalContent>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const sections: PortalSection[] | undefined = Array.isArray(body.sections)
    ? body.sections
        .filter((s): s is PortalSection => Boolean(s) && VALID_IDS.includes(s.id as PortalSectionId))
        .map((s, index) => ({
          id: s.id,
          label: String(s.label ?? '').slice(0, 80),
          hidden: Boolean(s.hidden),
          order: typeof s.order === 'number' ? s.order : index,
        }))
    : undefined;

  const hero = body.hero
    ? {
        title: String(body.hero.title ?? '').slice(0, 160),
        subtitle: String(body.hero.subtitle ?? '').slice(0, 400),
        imageUrl: String(body.hero.imageUrl ?? '').slice(0, 1000),
      }
    : undefined;

  try {
    const current = await getPortalContent();
    const saved = await savePortalContent({
      hero: hero ?? current.hero,
      sections: sections ?? current.sections,
      announcementsEnabled:
        typeof body.announcementsEnabled === 'boolean'
          ? body.announcementsEnabled
          : current.announcementsEnabled,
    });
    return NextResponse.json({ content: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not save content.' },
      { status: 500 },
    );
  }
}
