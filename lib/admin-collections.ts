/**
 * Blob-backed store for owner-managed admin collections.
 *
 * Each collection is one JSON document (an array of items) in Vercel Blob,
 * reusing the BLOB_READ_WRITE_TOKEN that already powers uploads. No external
 * schema to provision. Falls back to an empty list when Blob is unconfigured
 * so the admin UI still renders (read-only) in local/dev.
 */

import { put, list } from '@vercel/blob';
import { randomUUID } from 'crypto';
import {
  allowedKeys,
  isCollectionId,
  type CollectionId,
  type CollectionItem,
} from '@/lib/admin-collections-schema';

const CACHE_TTL_MS = 5_000;

function blobPath(id: CollectionId) {
  return `cpr/admin-collections/${id}.json`;
}

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

const cache = new Map<CollectionId, { value: CollectionItem[]; at: number }>();

function sanitize(id: CollectionId, input: Record<string, unknown>): Record<string, unknown> {
  const keys = new Set(allowedKeys(id));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!keys.has(key)) continue;
    if (value === undefined || value === null) {
      out[key] = '';
    } else if (typeof value === 'string') {
      out[key] = value.slice(0, 5000);
    } else {
      out[key] = String(value).slice(0, 5000);
    }
  }
  return out;
}

export async function listCollection(id: CollectionId): Promise<CollectionItem[]> {
  const cached = cache.get(id);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;
  if (!blobConfigured()) return [];

  try {
    const path = blobPath(id);
    const { blobs } = await list({ prefix: path, limit: 1 });
    const match = blobs.find((b) => b.pathname === path) ?? blobs[0];
    if (!match) {
      cache.set(id, { value: [], at: Date.now() });
      return [];
    }
    const res = await fetch(match.url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = (await res.json()) as CollectionItem[];
    const value = Array.isArray(json) ? json : [];
    cache.set(id, { value, at: Date.now() });
    return value;
  } catch {
    return [];
  }
}

async function persist(id: CollectionId, items: CollectionItem[]): Promise<CollectionItem[]> {
  if (!blobConfigured()) {
    throw new Error('Storage is not configured (missing Vercel Blob token).');
  }
  await put(blobPath(id), JSON.stringify(items, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  cache.set(id, { value: items, at: Date.now() });
  return items;
}

export async function createItem(
  id: CollectionId,
  input: Record<string, unknown>,
): Promise<CollectionItem> {
  const items = await listCollection(id);
  const now = new Date().toISOString();
  const item: CollectionItem = {
    ...sanitize(id, input),
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await persist(id, [item, ...items]);
  return item;
}

export async function updateItem(
  id: CollectionId,
  itemId: string,
  input: Record<string, unknown>,
): Promise<CollectionItem> {
  const items = await listCollection(id);
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) throw new Error('Item not found.');
  const updated: CollectionItem = {
    ...items[index],
    ...sanitize(id, input),
    id: itemId,
    createdAt: items[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  const next = [...items];
  next[index] = updated;
  await persist(id, next);
  return updated;
}

export async function deleteItem(id: CollectionId, itemId: string): Promise<void> {
  const items = await listCollection(id);
  const next = items.filter((item) => item.id !== itemId);
  if (next.length === items.length) throw new Error('Item not found.');
  await persist(id, next);
}

export { isCollectionId };
export type { CollectionId };
