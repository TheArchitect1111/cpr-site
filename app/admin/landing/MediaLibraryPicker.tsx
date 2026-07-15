'use client';

import { useEffect, useState } from 'react';

type MediaItem = {
  id: string;
  name?: string;
  fileUrl?: string;
  category?: string;
  usage?: string;
};

type Props = {
  /** Called when Mike picks an image from the library */
  onPick: (url: string, item: MediaItem) => void;
  label?: string;
};

/**
 * Lets admin pick a named image from /admin Images (media-library)
 * and apply it to a homepage field — closes the “named it but where did it go?” gap.
 */
export default function MediaLibraryPicker({ onPick, label = 'Or pick from photo gallery' }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/collections/media-library');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not load gallery');
        const list = (json.items || json || []) as MediaItem[];
        if (!cancelled) {
          setItems(
            Array.isArray(list)
              ? list.filter((it) => Boolean(String(it.fileUrl || '').trim()))
              : [],
          );
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gallery load failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <div className="landing-media-picker">
      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide photo gallery' : label}
      </button>
      {open && (
        <div className="landing-media-picker-panel">
          <p className="landing-editor-note">
            Images you named under{' '}
            <a href="/admin?tab=media-library">Admin → Images</a> appear here. Click one to place it
            on this section, then click <strong>Save changes</strong>.
          </p>
          {loading && <p className="landing-editor-hint">Loading gallery…</p>}
          {error && <p className="landing-editor-message">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="landing-editor-hint">
              No images yet.{' '}
              <a href="/admin?tab=media-library">Open the photo gallery</a> to upload and name
              pictures first.
            </p>
          )}
          <div className="landing-media-picker-grid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="landing-media-picker-card"
                onClick={() => {
                  const url = String(item.fileUrl || '');
                  if (!url) return;
                  onPick(url, item);
                  setOpen(false);
                }}
                title={item.name || item.usage || 'Use this image'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(item.fileUrl)} alt={item.name || 'Gallery image'} />
                <span>{item.name || 'Untitled'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
