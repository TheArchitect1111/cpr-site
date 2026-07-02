import { landingConfig } from '@/config/landing';
import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { getLandingContent, type LandingContent, type LandingTestimonialSlot } from '@/lib/landing-content';
import { listCollection } from '@/lib/admin-collections';
import type { CollectionItem } from '@/lib/admin-collections-schema';

function pick<T extends string>(override: T, fallback: T): T {
  return override.trim() ? override : fallback;
}

function slotHasOverride(slot: LandingTestimonialSlot | undefined): boolean {
  if (!slot) return false;
  return Boolean(slot.quote.trim() || slot.name.trim() || slot.role.trim() || slot.photoUrl.trim());
}

function mergeTestimonialItems(
  baseItems: LandingPageConfig['socialProof']['items'],
  overrides: LandingContent,
): LandingPageConfig['socialProof']['items'] {
  const fromSlots = overrides.testimonials
    .map((slot, i) => {
      const base = baseItems[i];
      if (!slotHasOverride(slot)) return base;
      return {
        quote: pick(slot.quote, base?.quote ?? ''),
        name: pick(slot.name, base?.name ?? 'CPR Family'),
        role: pick(slot.role, base?.role ?? 'CPR Community'),
        photo: pick(slot.photoUrl, base?.photo ?? '/testimonial-nikki-blessed.jpg'),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.quote?.trim()));

  if (fromSlots.length) return fromSlots.slice(0, 3);

  if (overrides.socialProof.quote.trim() && baseItems[0]) {
    return [
      {
        quote: pick(overrides.socialProof.quote, baseItems[0].quote),
        name: pick(overrides.socialProof.name, baseItems[0].name),
        role: pick(overrides.socialProof.role, baseItems[0].role),
        photo: pick(overrides.socialProof.photoUrl, baseItems[0].photo),
      },
      ...baseItems.slice(1),
    ];
  }

  return baseItems;
}

export function mergeLandingConfig(
  base: LandingPageConfig,
  overrides: LandingContent,
): LandingPageConfig {
  const testimonialItems = mergeTestimonialItems(base.socialProof.items, overrides);

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
      items: testimonialItems,
    },
    philosophy: base.philosophy
      ? {
          ...base.philosophy,
          label: pick(overrides.philosophy.label, base.philosophy.label),
          quote: pick(overrides.philosophy.quote, base.philosophy.quote),
          attribution: pick(overrides.philosophy.attribution, base.philosophy.attribution),
        }
      : base.philosophy,
    pathBand: base.pathBand
      ? {
          ...base.pathBand,
          text: pick(overrides.pathBand.text, base.pathBand.text),
        }
      : base.pathBand,
    process: base.process
      ? {
          ...base.process,
          heading: pick(overrides.process.heading, base.process.heading),
          subheading: pick(overrides.process.subheading, base.process.subheading),
          steps: base.process.steps.map((step, i) => {
            const slot = overrides.process.steps[i];
            if (!slot?.label.trim() && !slot?.description.trim()) return step;
            return {
              ...step,
              label: pick(slot?.label ?? '', step.label),
              description: pick(slot?.description ?? '', step.description),
            };
          }),
        }
      : base.process,
    chipsAndDrip: base.chipsAndDrip
      ? {
          ...base.chipsAndDrip,
          heading: pick(overrides.chipsAndDrip.heading, base.chipsAndDrip.heading),
          body: pick(overrides.chipsAndDrip.body, base.chipsAndDrip.body),
        }
      : base.chipsAndDrip,
    campsExposure: base.campsExposure
      ? {
          ...base.campsExposure,
          heading: pick(overrides.campsExposure.heading, base.campsExposure.heading),
          body: pick(overrides.campsExposure.body, base.campsExposure.body),
          dashboardImage: pick(
            overrides.campsExposure.dashboardImageUrl,
            base.campsExposure.dashboardImage ?? '',
          ),
        }
      : base.campsExposure,
    results: base.results
      ? {
          ...base.results,
          heading: pick(overrides.results.heading, base.results.heading),
          subheading: pick(overrides.results.subheading, base.results.subheading),
          stats: base.results.stats.map((stat, i) => {
            const slot = overrides.results.stats[i];
            if (!slot?.value.trim() && !slot?.label.trim()) return stat;
            return {
              value: pick(slot?.value ?? '', stat.value),
              label: pick(slot?.label ?? '', stat.label),
            };
          }),
          proofs: base.results.proofs.map((proof, i) => {
            const slot = overrides.results.proofs[i];
            if (!slot?.imageUrl.trim() && !slot?.athleteName.trim() && !slot?.caption.trim()) return proof;
            return {
              image: pick(slot?.imageUrl ?? '', proof.image),
              athleteName: pick(slot?.athleteName ?? '', proof.athleteName ?? ''),
              caption: pick(slot?.caption ?? '', proof.caption ?? ''),
            };
          }),
        }
      : base.results,
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

export function hasEditorTestimonials(overrides: LandingContent): boolean {
  return overrides.testimonials.some(slotHasOverride);
}

export async function getLandingPageConfig(): Promise<LandingPageConfig> {
  const [overrides, quoteItems] = await Promise.all([
    getLandingContent(),
    listCollection('site-quotes'),
  ]);
  const merged = mergeLandingConfig(landingConfig, overrides);

  if (hasEditorTestimonials(overrides)) return merged;

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
