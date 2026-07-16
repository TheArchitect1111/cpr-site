/**
 * Owner-editable overrides for the public CPR landing page (homepage).
 * Stored in Vercel Blob; merged over static defaults in config/landing.ts.
 */

import { put, list } from '@vercel/blob';

export type LandingTestimonialSlot = {
  quote: string;
  name: string;
  role: string;
  photoUrl: string;
};

export type LandingStatSlot = {
  value: string;
  label: string;
};

export type LandingProofSlot = {
  imageUrl: string;
  athleteName: string;
  caption: string;
};

export type LandingProcessStepSlot = {
  label: string;
  description: string;
};

export type LandingGallerySlideSlot = {
  imageUrl: string;
  caption: string;
};

export type LandingContent = {
  possibility: {
    announcement: string;
    headline: string;
    subheadline: string;
    supporting: string;
    imageUrl: string;
    /** Owner-managed hero slideshow; empty = use imageUrl / static default */
    heroSlides: LandingGallerySlideSlot[];
  };
  about: {
    heading: string;
    points: string[];
  };
  socialProof: {
    heading: string;
    quote: string;
    name: string;
    role: string;
    photoUrl: string;
  };
  testimonials: LandingTestimonialSlot[];
  philosophy: {
    label: string;
    quote: string;
    attribution: string;
  };
  pathBand: {
    text: string;
  };
  process: {
    heading: string;
    subheading: string;
    steps: LandingProcessStepSlot[];
  };
  chipsAndDrip: {
    heading: string;
    body: string;
    /** Owner-managed rotating gallery; empty = keep static config slides */
    slides: LandingGallerySlideSlot[];
  };
  campsExposure: {
    heading: string;
    body: string;
    dashboardImageUrl: string;
    /** Owner-managed rotating gallery; empty = keep static config slides */
    slides: LandingGallerySlideSlot[];
  };
  results: {
    heading: string;
    subheading: string;
    stats: LandingStatSlot[];
    proofs: LandingProofSlot[];
  };
  finalCta: {
    heading: string;
    subheading: string;
  };
  footer: {
    about: string;
    email: string;
    location: string;
  };
  updatedAt: string;
};

const BLOB_PATH = 'cpr/landing-content/site.json';
const CACHE_TTL_MS = 10_000;

const emptyTestimonial = (): LandingTestimonialSlot => ({
  quote: '',
  name: '',
  role: '',
  photoUrl: '',
});

const emptyStat = (): LandingStatSlot => ({ value: '', label: '' });

const emptyProof = (): LandingProofSlot => ({
  imageUrl: '',
  athleteName: '',
  caption: '',
});

const emptyStep = (): LandingProcessStepSlot => ({ label: '', description: '' });

const emptySlide = (): LandingGallerySlideSlot => ({ imageUrl: '', caption: '' });

export function normalizeGallerySlides(
  input: LandingGallerySlideSlot[] | undefined | null,
): LandingGallerySlideSlot[] {
  if (!Array.isArray(input) || !input.length) return [];
  return input
    .map((slot) => ({
      imageUrl: String(slot?.imageUrl ?? '').trim(),
      caption: String(slot?.caption ?? '').trim(),
    }))
    .filter((slot) => Boolean(slot.imageUrl));
}

export const EMPTY_LANDING_CONTENT: LandingContent = {
  possibility: {
    announcement: '',
    headline: '',
    subheadline: '',
    supporting: '',
    imageUrl: '',
    heroSlides: [],
  },
  about: {
    heading: '',
    points: ['', '', ''],
  },
  socialProof: {
    heading: '',
    quote: '',
    name: '',
    role: '',
    photoUrl: '',
  },
  testimonials: [emptyTestimonial(), emptyTestimonial(), emptyTestimonial()],
  philosophy: {
    label: '',
    quote: '',
    attribution: '',
  },
  pathBand: {
    text: '',
  },
  process: {
    heading: '',
    subheading: '',
    steps: [emptyStep(), emptyStep(), emptyStep(), emptyStep(), emptyStep()],
  },
  chipsAndDrip: {
    heading: '',
    body: '',
    slides: [],
  },
  campsExposure: {
    heading: '',
    body: '',
    dashboardImageUrl: '',
    slides: [],
  },
  results: {
    heading: '',
    subheading: '',
    stats: [emptyStat(), emptyStat(), emptyStat(), emptyStat()],
    proofs: [emptyProof(), emptyProof(), emptyProof()],
  },
  finalCta: {
    heading: '',
    subheading: '',
  },
  footer: {
    about: '',
    email: '',
    location: '',
  },
  updatedAt: '',
};

function normalizeTestimonials(input: Partial<LandingContent> | null | undefined): LandingTestimonialSlot[] {
  if (Array.isArray(input?.testimonials) && input.testimonials.length) {
    return [0, 1, 2].map((i) => {
      const slot = input.testimonials?.[i];
      return {
        quote: String(slot?.quote ?? ''),
        name: String(slot?.name ?? ''),
        role: String(slot?.role ?? ''),
        photoUrl: String(slot?.photoUrl ?? ''),
      };
    });
  }

  const legacy = input?.socialProof;
  if (legacy?.quote?.trim() || legacy?.name?.trim()) {
    return [
      {
        quote: String(legacy.quote ?? ''),
        name: String(legacy.name ?? ''),
        role: String(legacy.role ?? ''),
        photoUrl: String(legacy.photoUrl ?? ''),
      },
      emptyTestimonial(),
      emptyTestimonial(),
    ];
  }

  return [emptyTestimonial(), emptyTestimonial(), emptyTestimonial()];
}

function normalize(input: Partial<LandingContent> | null | undefined): LandingContent {
  const base = EMPTY_LANDING_CONTENT;
  const points = Array.isArray(input?.about?.points) ? input.about.points : [];
  const steps = Array.isArray(input?.process?.steps) ? input.process.steps : [];
  const stats = Array.isArray(input?.results?.stats) ? input.results.stats : [];
  const proofs = Array.isArray(input?.results?.proofs) ? input.results.proofs : [];

  return {
    possibility: {
      announcement: String(input?.possibility?.announcement ?? base.possibility.announcement),
      headline: String(input?.possibility?.headline ?? base.possibility.headline),
      subheadline: String(input?.possibility?.subheadline ?? base.possibility.subheadline),
      supporting: String(input?.possibility?.supporting ?? base.possibility.supporting),
      imageUrl: String(input?.possibility?.imageUrl ?? base.possibility.imageUrl),
      heroSlides: normalizeGallerySlides(input?.possibility?.heroSlides),
    },
    about: {
      heading: String(input?.about?.heading ?? base.about.heading),
      points: [0, 1, 2].map((i) => String(points[i] ?? '')),
    },
    socialProof: {
      heading: String(input?.socialProof?.heading ?? base.socialProof.heading),
      quote: String(input?.socialProof?.quote ?? base.socialProof.quote),
      name: String(input?.socialProof?.name ?? base.socialProof.name),
      role: String(input?.socialProof?.role ?? base.socialProof.role),
      photoUrl: String(input?.socialProof?.photoUrl ?? base.socialProof.photoUrl),
    },
    testimonials: normalizeTestimonials(input),
    philosophy: {
      label: String(input?.philosophy?.label ?? base.philosophy.label),
      quote: String(input?.philosophy?.quote ?? base.philosophy.quote),
      attribution: String(input?.philosophy?.attribution ?? base.philosophy.attribution),
    },
    pathBand: {
      text: String(input?.pathBand?.text ?? base.pathBand.text),
    },
    process: {
      heading: String(input?.process?.heading ?? base.process.heading),
      subheading: String(input?.process?.subheading ?? base.process.subheading),
      steps: [0, 1, 2, 3, 4].map((i) => ({
        label: String(steps[i]?.label ?? ''),
        description: String(steps[i]?.description ?? ''),
      })),
    },
    chipsAndDrip: {
      heading: String(input?.chipsAndDrip?.heading ?? base.chipsAndDrip.heading),
      body: String(input?.chipsAndDrip?.body ?? base.chipsAndDrip.body),
      slides: normalizeGallerySlides(input?.chipsAndDrip?.slides),
    },
    campsExposure: {
      heading: String(input?.campsExposure?.heading ?? base.campsExposure.heading),
      body: String(input?.campsExposure?.body ?? base.campsExposure.body),
      dashboardImageUrl: String(input?.campsExposure?.dashboardImageUrl ?? base.campsExposure.dashboardImageUrl),
      slides: normalizeGallerySlides(input?.campsExposure?.slides),
    },
    results: {
      heading: String(input?.results?.heading ?? base.results.heading),
      subheading: String(input?.results?.subheading ?? base.results.subheading),
      stats: [0, 1, 2, 3].map((i) => ({
        value: String(stats[i]?.value ?? ''),
        label: String(stats[i]?.label ?? ''),
      })),
      proofs: [0, 1, 2].map((i) => ({
        imageUrl: String(proofs[i]?.imageUrl ?? ''),
        athleteName: String(proofs[i]?.athleteName ?? ''),
        caption: String(proofs[i]?.caption ?? ''),
      })),
    },
    finalCta: {
      heading: String(input?.finalCta?.heading ?? base.finalCta.heading),
      subheading: String(input?.finalCta?.subheading ?? base.finalCta.subheading),
    },
    footer: {
      about: String(input?.footer?.about ?? base.footer.about),
      email: String(input?.footer?.email ?? base.footer.email),
      location: String(input?.footer?.location ?? base.footer.location),
    },
    updatedAt: String(input?.updatedAt ?? base.updatedAt),
  };
}

let cache: { value: LandingContent; at: number } | null = null;

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function getLandingContent(): Promise<LandingContent> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
  if (!blobConfigured()) {
    cache = { value: EMPTY_LANDING_CONTENT, at: Date.now() };
    return EMPTY_LANDING_CONTENT;
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === BLOB_PATH) ?? blobs[0];
    if (!match) {
      cache = { value: EMPTY_LANDING_CONTENT, at: Date.now() };
      return EMPTY_LANDING_CONTENT;
    }
    const res = await fetch(match.url, { cache: 'no-store' });
    if (!res.ok) return EMPTY_LANDING_CONTENT;
    const json = (await res.json()) as Partial<LandingContent>;
    const value = normalize(json);
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return EMPTY_LANDING_CONTENT;
  }
}

export async function saveLandingContent(input: Partial<LandingContent>): Promise<LandingContent> {
  if (!blobConfigured()) {
    throw new Error('Landing storage is not configured (missing Vercel Blob token).');
  }
  const next = normalize({ ...input, updatedAt: new Date().toISOString() });
  await put(BLOB_PATH, JSON.stringify(next, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  cache = { value: next, at: Date.now() };
  return next;
}
