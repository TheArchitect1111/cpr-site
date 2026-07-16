import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { getLandingContent, saveLandingContent, type LandingContent } from '@/lib/landing-content';

export const dynamic = 'force-dynamic';

function trim(value: unknown, max: number): string {
  return String(value ?? '').slice(0, max);
}

function trimTestimonials(
  input: LandingContent['testimonials'] | undefined,
  current: LandingContent['testimonials'],
) {
  const source = input ?? current;
  return [0, 1, 2].map((i) => ({
    quote: trim(source[i]?.quote ?? '', 4000),
    name: trim(source[i]?.name ?? '', 120),
    role: trim(source[i]?.role ?? '', 120),
    photoUrl: trim(source[i]?.photoUrl ?? '', 1000),
  }));
}

function trimSteps(
  input: LandingContent['process']['steps'] | undefined,
  current: LandingContent['process']['steps'],
) {
  const source = input ?? current;
  return [0, 1, 2, 3, 4].map((i) => ({
    label: trim(source[i]?.label ?? '', 80),
    description: trim(source[i]?.description ?? '', 400),
  }));
}

function trimStats(
  input: LandingContent['results']['stats'] | undefined,
  current: LandingContent['results']['stats'],
) {
  const source = input ?? current;
  return [0, 1, 2, 3].map((i) => ({
    value: trim(source[i]?.value ?? '', 40),
    label: trim(source[i]?.label ?? '', 80),
  }));
}

function trimProofs(
  input: LandingContent['results']['proofs'] | undefined,
  current: LandingContent['results']['proofs'],
) {
  const source = input ?? current;
  return [0, 1, 2].map((i) => ({
    imageUrl: trim(source[i]?.imageUrl ?? '', 1000),
    athleteName: trim(source[i]?.athleteName ?? '', 120),
    caption: trim(source[i]?.caption ?? '', 200),
  }));
}

function trimGallerySlides(
  input: LandingContent['possibility']['heroSlides'] | undefined,
  current: LandingContent['possibility']['heroSlides'],
  max = 12,
) {
  const source = input ?? current;
  return (source || []).slice(0, max).map((slot) => ({
    imageUrl: trim(slot?.imageUrl ?? '', 1000),
    caption: trim(slot?.caption ?? '', 200),
  }));
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
    const testimonials = trimTestimonials(body.testimonials, current.testimonials);
    const heroSlides = trimGallerySlides(body.possibility?.heroSlides, current.possibility.heroSlides);
    const saved = await saveLandingContent({
      possibility: {
        announcement: trim(body.possibility?.announcement ?? current.possibility.announcement, 400),
        headline: trim(body.possibility?.headline ?? current.possibility.headline, 200),
        subheadline: trim(body.possibility?.subheadline ?? current.possibility.subheadline, 300),
        supporting: trim(body.possibility?.supporting ?? current.possibility.supporting, 600),
        imageUrl: heroSlides[0]?.imageUrl || trim(body.possibility?.imageUrl ?? current.possibility.imageUrl, 1000),
        heroSlides,
      },
      about: {
        heading: trim(body.about?.heading ?? current.about.heading, 120),
        points: (body.about?.points ?? current.about.points).map((p) => trim(p, 200)),
      },
      socialProof: {
        heading: trim(body.socialProof?.heading ?? current.socialProof.heading, 120),
        quote: trim(testimonials[0]?.quote ?? body.socialProof?.quote ?? current.socialProof.quote, 4000),
        name: trim(testimonials[0]?.name ?? body.socialProof?.name ?? current.socialProof.name, 120),
        role: trim(testimonials[0]?.role ?? body.socialProof?.role ?? current.socialProof.role, 120),
        photoUrl: trim(
          testimonials[0]?.photoUrl ?? body.socialProof?.photoUrl ?? current.socialProof.photoUrl,
          1000,
        ),
      },
      testimonials,
      philosophy: {
        label: trim(body.philosophy?.label ?? current.philosophy.label, 80),
        quote: trim(body.philosophy?.quote ?? current.philosophy.quote, 600),
        attribution: trim(body.philosophy?.attribution ?? current.philosophy.attribution, 120),
      },
      pathBand: {
        text: trim(body.pathBand?.text ?? current.pathBand.text, 300),
      },
      process: {
        heading: trim(body.process?.heading ?? current.process.heading, 120),
        subheading: trim(body.process?.subheading ?? current.process.subheading, 400),
        steps: trimSteps(body.process?.steps, current.process.steps),
      },
      chipsAndDrip: {
        heading: trim(body.chipsAndDrip?.heading ?? current.chipsAndDrip.heading, 120),
        body: trim(body.chipsAndDrip?.body ?? current.chipsAndDrip.body, 2000),
        slides: trimGallerySlides(body.chipsAndDrip?.slides, current.chipsAndDrip.slides),
      },
      campsExposure: {
        heading: trim(body.campsExposure?.heading ?? current.campsExposure.heading, 120),
        body: trim(body.campsExposure?.body ?? current.campsExposure.body, 2000),
        dashboardImageUrl: trim(
          body.campsExposure?.dashboardImageUrl ?? current.campsExposure.dashboardImageUrl,
          1000,
        ),
        slides: trimGallerySlides(body.campsExposure?.slides, current.campsExposure.slides),
      },
      results: {
        heading: trim(body.results?.heading ?? current.results.heading, 120),
        subheading: trim(body.results?.subheading ?? current.results.subheading, 400),
        stats: trimStats(body.results?.stats, current.results.stats),
        proofs: trimProofs(body.results?.proofs, current.results.proofs),
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
