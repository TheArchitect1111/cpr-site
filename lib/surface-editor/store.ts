import 'server-only';

import { list, put } from '@vercel/blob';
import type {
  EditableSectionState,
  EditableSurfaceDocument,
  EditableSurfaceManifest,
} from './types';

const PREFIX = 'cpr/editable-surfaces';
const CACHE_TTL_MS = 10_000;
const cache = new Map<string, { value: EditableSurfaceDocument; at: number }>();

function configured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function pathFor(surfaceId: string) {
  return `${PREFIX}/${surfaceId}.json`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge<T>(defaults: T, overrides: unknown): T {
  if (Array.isArray(defaults)) return (Array.isArray(overrides) ? overrides : defaults) as T;
  if (!isPlainObject(defaults) || !isPlainObject(overrides)) {
    return (overrides === undefined || overrides === null ? defaults : overrides) as T;
  }
  const next: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    next[key] = key in next ? deepMerge(next[key], value) : value;
  }
  return next as T;
}

function normalizeSections(
  manifest: EditableSurfaceManifest,
  input?: EditableSectionState[],
): EditableSectionState[] {
  const byId = new Map((input ?? []).map((section) => [section.id, section]));
  return manifest.sections
    .map((section, index) => {
      const saved = byId.get(section.id);
      return {
        id: section.id,
        visible: section.protected ? true : saved?.visible !== false,
        order: Number.isFinite(saved?.order) ? Number(saved?.order) : index,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((section, order) => ({ ...section, order }));
}

function emptyDocument(manifest: EditableSurfaceManifest): EditableSurfaceDocument {
  return {
    surfaceId: manifest.id,
    content: manifest.defaults,
    sections: normalizeSections(manifest),
    updatedAt: '',
  };
}

export async function getEditableSurfaceDocument<T extends Record<string, unknown>>(
  manifest: EditableSurfaceManifest<T>,
): Promise<EditableSurfaceDocument<T>> {
  const hit = cache.get(manifest.id);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as EditableSurfaceDocument<T>;
  if (!configured()) return emptyDocument(manifest) as EditableSurfaceDocument<T>;

  try {
    const pathname = pathFor(manifest.id);
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const blob = blobs.find((item) => item.pathname === pathname);
    if (!blob) return emptyDocument(manifest) as EditableSurfaceDocument<T>;
    const response = await fetch(blob.url, { cache: 'no-store' });
    if (!response.ok) return emptyDocument(manifest) as EditableSurfaceDocument<T>;
    const saved = (await response.json()) as Partial<EditableSurfaceDocument<T>>;
    const value: EditableSurfaceDocument<T> = {
      surfaceId: manifest.id,
      content: deepMerge(manifest.defaults, saved.content),
      sections: normalizeSections(manifest, saved.sections),
      updatedAt: String(saved.updatedAt ?? ''),
    };
    cache.set(manifest.id, { value, at: Date.now() });
    return value;
  } catch {
    return emptyDocument(manifest) as EditableSurfaceDocument<T>;
  }
}

export async function saveEditableSurfaceDocument<T extends Record<string, unknown>>(
  manifest: EditableSurfaceManifest<T>,
  input: Pick<EditableSurfaceDocument<T>, 'content' | 'sections'>,
): Promise<EditableSurfaceDocument<T>> {
  if (!configured()) throw new Error('Website editor storage is not configured.');
  const document: EditableSurfaceDocument<T> = {
    surfaceId: manifest.id,
    content: deepMerge(manifest.defaults, input.content),
    sections: normalizeSections(manifest, input.sections),
    updatedAt: new Date().toISOString(),
  };
  await put(pathFor(manifest.id), JSON.stringify(document, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  cache.set(manifest.id, { value: document, at: Date.now() });
  return document;
}

export function sectionIsVisible(document: EditableSurfaceDocument, sectionId: string) {
  return document.sections.find((section) => section.id === sectionId)?.visible !== false;
}
