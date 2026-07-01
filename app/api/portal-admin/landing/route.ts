import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { getLandingContent, saveLandingContent, type LandingContent } from '@/lib/landing-content';

export const dynamic = 'force-dynamic';

function trim(value: unknown, max: number): string {
  return String(value ?? '').slice(0, max);
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const content = await getLandingContent();
  return NextResponse.json({ content, storageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Partial<LandingContent>;
  try {
    body = (await req.json()) as Partial<LandingContent>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const current = await getLandingContent();
    const saved = await saveLandingContent({
      possibility: {
        announcement: trim(body.possibility?.announcement ?? current.possibility.announcement, 400),
        headline: trim(body.possibility?.headline ?? current.possibility.headline, 200),
        subheadline: trim(body.possibility?.subheadline ?? current.possibility.subheadline, 300),
        supporting: trim(body.possibility?.supporting ?? current.possibility.supporting, 600),
        imageUrl: trim(body.possibility?.imageUrl ?? current.possibility.imageUrl, 1000),
      },
      about: {
        heading: trim(body.about?.heading ?? current.about.heading, 120),
        points: (body.about?.points ?? current.about.points).map((p) => trim(p, 200)),
      },
      socialProof: {
        heading: trim(body.socialProof?.heading ?? current.socialProof.heading, 120),
        quote: trim(body.socialProof?.quote ?? current.socialProof.quote, 4000),
        name: trim(body.socialProof?.name ?? current.socialProof.name, 120),
        role: trim(body.socialProof?.role ?? current.socialProof.role, 120),
        photoUrl: trim(body.socialProof?.photoUrl ?? current.socialProof.photoUrl, 1000),
      },
      finalCta: {
        heading: trim(body.finalCta?.heading ?? current.finalCta.heading, 200),
        subheading: trim(body.finalCta?.subheading ?? current.finalCta.subheading, 400),
      },
      footer: {
        about: trim(body.footer?.about ?? current.footer.about, 600),
        email: trim(body.footer?.email ?? current.footer.email, 200),
        location: trim(body.footer?.location ?? current.footer.location, 200),
      },
    });
    return NextResponse.json({ content: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not save landing page.' },
      { status: 500 },
    );
  }
}
