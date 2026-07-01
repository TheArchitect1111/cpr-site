import { landingConfig } from '@/config/landing';
import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { getLandingContent, type LandingContent } from '@/lib/landing-content';
import { listCollection } from '@/lib/admin-collections';
import type { CollectionItem } from '@/lib/admin-collections-schema';

function pick<T extends string>(override: T, fallback: T): T {
  return override.trim() ? override : fallback;
}

export function mergeLandingConfig(
  base: LandingPageConfig,
  overrides: LandingContent,
): LandingPageConfig {
  const items = [...base.socialProof.items];
  if (items[0]) {
    items[0] = {
      quote: pick(overrides.socialProof.quote, items[0].quote),
      name: pick(overrides.socialProof.name, items[0].name),
      role: pick(overrides.socialProof.role, items[0].role),
      photo: pick(overrides.socialProof.photoUrl, items[0].photo),
    };
  }

  return {
    ...base,
    possibility: {
      ...base.possibility,
      announcement: pick(overrides.possibility.announcement, base.possibility.announcement ?? ''),
      headline: pick(overrides.possibility.headline, base.possibility.headline),
      subheadline: pick(overrides.possibility.subheadline, base.possibility.subheadline),
      supporting: pick(overrides.possibility.supporting, base.possibility.supporting),
      image: pick(overrides.possibility.imageUrl, base.possibility.image),
    },
    about: base.about
      ? {
          ...base.about,
          heading: pick(overrides.about.heading, base.about.heading),
          points: overrides.about.points.some((p) => p.trim())
            ? overrides.about.points.map((p, i) => pick(p, base.about!.points[i] ?? ''))
            : base.about.points,
        }
      : base.about,
    socialProof: {
      ...base.socialProof,
      heading: pick(overrides.socialProof.heading, base.socialProof.heading),
      items,
    },
    finalCta: {
      ...base.finalCta,
      heading: pick(overrides.finalCta.heading, base.finalCta.heading),
      subheading: pick(overrides.finalCta.subheading, base.finalCta.subheading),
    },
    footer: {
      ...base.footer,
      about: pick(overrides.footer.about, base.footer.about),
      email: pick(overrides.footer.email, base.footer.email),
      location: pick(overrides.footer.location, base.footer.location),
    },
  };
}

export async function getLandingPageConfig(): Promise<LandingPageConfig> {
  const [overrides, quoteItems] = await Promise.all([
    getLandingContent(),
    listCollection('site-quotes'),
  ]);
  const merged = mergeLandingConfig(landingConfig, overrides);
  const ownerQuotes = quoteItems
    .filter((item) => {
      const status = String(item.status || '').toLowerCase();
      const placement = String(item.placement || '').toLowerCase();
      return (
        (status === 'published' || status === 'featured') &&
        (!placement || placement.includes('homepage'))
      );
    })
    .sort((a, b) => (String(a.status) === 'Featured' ? -1 : 0) - (String(b.status) === 'Featured' ? -1 : 0))
    .map((item: CollectionItem) => ({
      quote: String(item.quote || ''),
      name: String(item.name || 'CPR Family'),
      role: String(item.role || 'CPR Community'),
      photo: String(item.photoUrl || '/testimonial-nikki-blessed.jpg'),
    }))
    .filter((item) => item.quote.trim());

  return ownerQuotes.length
    ? { ...merged, socialProof: { ...merged.socialProof, items: ownerQuotes.slice(0, 3) } }
    : merged;
}
