/**
 * Owner-editable overrides for the public CPR landing page (homepage).
 * Stored in Vercel Blob; merged over static defaults in config/landing.ts.
 */

import { put, list } from '@vercel/blob';

export type LandingContent = {
  possibility: {
    announcement: string;
    headline: string;
    subheadline: string;
    supporting: string;
    imageUrl: string;
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

export const EMPTY_LANDING_CONTENT: LandingContent = {
  possibility: {
    announcement: '',
    headline: '',
    subheadline: '',
    supporting: '',
    imageUrl: '',
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

function normalize(input: Partial<LandingContent> | null | undefined): LandingContent {
  const base = EMPTY_LANDING_CONTENT;
  const points = Array.isArray(input?.about?.points) ? input.about.points : [];
  return {
    possibility: {
      announcement: String(input?.possibility?.announcement ?? base.possibility.announcement),
      headline: String(input?.possibility?.headline ?? base.possibility.headline),
      subheadline: String(input?.possibility?.subheadline ?? base.possibility.subheadline),
      supporting: String(input?.possibility?.supporting ?? base.possibility.supporting),
      imageUrl: String(input?.possibility?.imageUrl ?? base.possibility.imageUrl),
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
