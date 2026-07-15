'use client';

import type { LandingGallerySlideSlot } from '@/lib/landing-content';
import MediaLibraryPicker from './MediaLibraryPicker';

type Props = {
  title: string;
  slides: LandingGallerySlideSlot[];
  onChange: (slides: LandingGallerySlideSlot[]) => void;
  onUpload: (file: File, onUrl: (url: string) => void) => void;
  busy?: boolean;
};

/**
 * Owner UI for rotating homepage galleries (Chips & Drip / Camps).
 */
export default function GallerySlidesEditor({ title, slides, onChange, onUpload, busy }: Props) {
  const update = (index: number, patch: Partial<LandingGallerySlideSlot>) => {
    const next = slides.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(slides.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const addEmpty = () => {
    onChange([...slides, { imageUrl: '', caption: '' }]);
  };

  const addFromUrl = (url: string, caption = '') => {
    onChange([...slides, { imageUrl: url, caption }]);
  };

  return (
    <div className="landing-gallery-editor">
      <h3 className="landing-gallery-editor-title">{title}</h3>
      <p className="landing-editor-note">
        These photos rotate on the public homepage. Add from the photo gallery or upload, set a short
        caption, reorder, then <strong>Save changes</strong>.
      </p>

      {slides.length === 0 && (
        <p className="landing-editor-hint">
          No owner slides yet — the site still shows the default CPR gallery until you add and save
          slides here.
        </p>
      )}

      <div className="landing-gallery-editor-list">
        {slides.map((slide, index) => (
          <div key={`${slide.imageUrl}-${index}`} className="landing-gallery-editor-card">
            <div className="landing-gallery-editor-card-head">
              <strong>Slide {index + 1}</strong>
              <div className="landing-gallery-editor-card-actions">
                <button type="button" className="admin-btn admin-btn-secondary" disabled={index === 0} onClick={() => move(index, -1)}>
                  Up
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  disabled={index === slides.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Down
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => remove(index)}>
                  Remove
                </button>
              </div>
            </div>

            {slide.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="landing-editor-preview landing-editor-preview--thumb" src={slide.imageUrl} alt={slide.caption || `Slide ${index + 1}`} />
            ) : (
              <p className="landing-editor-hint">No image yet — upload or pick from gallery.</p>
            )}

            <label>
              Caption
              <input
                value={slide.caption}
                onChange={(e) => update(index, { caption: e.target.value })}
                placeholder="Short line under the photo"
              />
            </label>

            <label>
              Replace image
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onUpload(file, (url) => update(index, { imageUrl: url }));
                }}
              />
            </label>

            <MediaLibraryPicker
              label="Pick image from gallery"
              onPick={(url, item) =>
                update(index, {
                  imageUrl: url,
                  caption: slide.caption || item.name || '',
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="landing-gallery-editor-add">
        <button type="button" className="admin-btn admin-btn-secondary" onClick={addEmpty}>
          Add blank slide
        </button>
        <MediaLibraryPicker
          label="Add from photo gallery"
          onPick={(url, item) => addFromUrl(url, item.name || '')}
        />
        <label className="landing-gallery-upload-label">
          Upload new slide
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onUpload(file, (url) => addFromUrl(url, file.name.replace(/\.[^.]+$/, '')));
            }}
          />
        </label>
      </div>
    </div>
  );
}
