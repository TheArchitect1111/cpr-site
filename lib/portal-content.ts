/**
 * Portal content store — owner-editable section config, copy, and images.
 *
 * Persisted as a single JSON document in Vercel Blob (already configured for
 * uploads), so it survives serverless restarts with no extra infrastructure.
 * Falls back to in-code defaults when Blob is unavailable (local/dev/sample).
 */

import { put, list } from '@vercel/blob';

export type PortalSectionId =
  | 'hub-cards'
  | 'action-center'
  | 'onboarding'
  | 'roadmap'
  | 'action-plan'
  | 'opportunities'
  | 'learning-center'
  | 'athlete-services';

export type PortalSection = {
  id: PortalSectionId;
  label: string;
  hidden: boolean;
  order: number;
};

export type PortalContent = {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  sections: PortalSection[];
  announcementsEnabled: boolean;
  updatedAt: string;
};

const BLOB_PATH = 'cpr/portal-content/site.json';
const CACHE_TTL_MS = 10_000;

const DEFAULT_SECTIONS: PortalSection[] = [
  { id: 'hub-cards', label: 'Your CPR Portals', hidden: false, order: 0 },
  { id: 'action-center', label: 'Action Center', hidden: false, order: 1 },
  { id: 'onboarding', label: 'Onboarding', hidden: false, order: 2 },
  { id: 'roadmap', label: 'Recruiting Roadmap', hidden: false, order: 3 },
  { id: 'action-plan', label: 'Monthly Action Plan', hidden: false, order: 4 },
  { id: 'opportunities', label: 'Opportunity Tracker', hidden: false, order: 5 },
  { id: 'learning-center', label: 'Recruiting Resources', hidden: false, order: 6 },
  { id: 'athlete-services', label: 'Portal Tools', hidden: false, order: 7 },
];

export const DEFAULT_PORTAL_CONTENT: PortalContent = {
  hero: { title: '', subtitle: '', imageUrl: '' },
  sections: DEFAULT_SECTIONS,
  announcementsEnabled: true,
  updatedAt: '',
};

function normalize(input: Partial<PortalContent> | null | undefined): PortalContent {
  const base = DEFAULT_PORTAL_CONTENT;
  const incoming = input?.sections ?? [];
  // Merge stored sections over defaults so newly added defaults always appear.
  const merged: PortalSection[] = DEFAULT_SECTIONS.map((def) => {
    const found = incoming.find((s) => s.id === def.id);
    return found
      ? {
          id: def.id,
          label: typeof found.label === 'string' && found.label.trim() ? found.label : def.label,
          hidden: Boolean(found.hidden),
          order: typeof found.order === 'number' ? found.order : def.order,
        }
      : def;
  }).sort((a, b) => a.order - b.order);

  return {
    hero: {
      title: input?.hero?.title ?? base.hero.title,
      subtitle: input?.hero?.subtitle ?? base.hero.subtitle,
      imageUrl: input?.hero?.imageUrl ?? base.hero.imageUrl,
    },
    sections: merged,
    announcementsEnabled: input?.announcementsEnabled ?? base.announcementsEnabled,
    updatedAt: input?.updatedAt ?? base.updatedAt,
  };
}

let cache: { value: PortalContent; at: number } | null = null;

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function getPortalContent(): Promise<PortalContent> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
  if (!blobConfigured()) return DEFAULT_PORTAL_CONTENT;

  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === BLOB_PATH) ?? blobs[0];
    if (!match) {
      cache = { value: DEFAULT_PORTAL_CONTENT, at: Date.now() };
      return DEFAULT_PORTAL_CONTENT;
    }
    const res = await fetch(match.url, { cache: 'no-store' });
    if (!res.ok) return DEFAULT_PORTAL_CONTENT;
    const json = (await res.json()) as Partial<PortalContent>;
    const value = normalize(json);
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return DEFAULT_PORTAL_CONTENT;
  }
}

export async function savePortalContent(input: Partial<PortalContent>): Promise<PortalContent> {
  if (!blobConfigured()) {
    throw new Error('Content storage is not configured (missing Vercel Blob token).');
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

/** Convenience: ordered, visible sections for rendering. */
export function visibleSections(content: PortalContent): PortalSection[] {
  return [...content.sections].filter((s) => !s.hidden).sort((a, b) => a.order - b.order);
}

export function sectionLabel(content: PortalContent, id: PortalSectionId, fallback: string): string {
  const found = content.sections.find((s) => s.id === id);
  return found?.label?.trim() || fallback;
}

export function isSectionVisible(content: PortalContent, id: PortalSectionId): boolean {
  const found = content.sections.find((s) => s.id === id);
  return found ? !found.hidden : true;
}
