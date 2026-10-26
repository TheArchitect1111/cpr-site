'use client';

import { useEffect, useRef, useState } from 'react';
import {
  EMPTY_VIDEO_DRAFT,
  PREVIEW_VIDEO_TYPES,
  VIDEO_PLACEMENTS,
  getValidatedVideoLink,
  validateVideoDraft,
  type VideoDraft,
  type VideoSourceType,
} from '@/lib/video-library/schema';
import './video-library.css';

const VIDEO_ACCEPT = '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';

export default function VideoLibraryClient() {
  const [draft, setDraft] = useState<VideoDraft>({ ...EMPTY_VIDEO_DRAFT });
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const change = <K extends keyof VideoDraft>(key: K, value: VideoDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setReviewed(false);
    setErrors([]);
  };

  const clearDraft = () => {
    setDraft({ ...EMPTY_VIDEO_DRAFT });
    setFile(null);
    setErrors([]);
    setReviewed(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const changeSource = (next: VideoSourceType) => {
    change('sourceType', next);
    setFile(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const reviewDraft = () => {
    const nextErrors = validateVideoDraft(draft, file);
    setErrors(nextErrors);
    setReviewed(nextErrors.length === 0);
  };

  const externalVideoUrl = draft.sourceType === 'file'
    ? null
    : getValidatedVideoLink(draft.externalUrl, draft.sourceType);

  return (
    <div className="video-library">
      <header className="ahead">
        <div>
          <p className="video-library-eyebrow">WEBSITE / MEDIA</p>
          <h1 className="display">VIDEO LIBRARY</h1>
          <p>Prepare a video, choose its placement, and review it before publishing.</p>
        </div>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
      </header>

      <div className="video-library-notice" role="status">
        <strong>Step 1: draft workspace only.</strong> You can choose a local video or paste a
        YouTube/Vimeo link and review its details. Nothing is uploaded, saved, or published yet.
        Storage and uploads come next.
      </div>

      <div className="video-library-layout">
        <section className="video-library-panel" aria-labelledby="video-draft-heading">
          <div className="video-library-panel-heading">
            <span className="video-library-step">01</span>
            <div>
              <h2 id="video-draft-heading">Video details</h2>
              <p>Give the video a name Mike and his team can recognize.</p>
            </div>
          </div>

          <div className="video-library-fields">
            <label>
              <span>Video title <em>*</em></span>
              <input type="text" maxLength={120} value={draft.title}
                placeholder="e.g. What CPR can do for your future"
                onChange={(event) => change('title', event.target.value)} />
            </label>
            <label>
              <span>Description</span>
              <textarea rows={3} maxLength={2000} value={draft.description}
                placeholder="What will families and athletes learn from this video?"
                onChange={(event) => change('description', event.target.value)} />
            </label>
            <label>
              <span>Video source <em>*</em></span>
              <select value={draft.sourceType}
                onChange={(event) => changeSource(event.target.value as VideoSourceType)}>
                <option value="file">Upload a video file</option>
                <option value="youtube">YouTube link</option>
                <option value="vimeo">Vimeo link</option>
              </select>
            </label>
            {draft.sourceType === 'file' ? (
              <label>
                <span>Choose video for local preview <em>*</em></span>
                <input ref={fileInput} type="file" accept={VIDEO_ACCEPT}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setReviewed(false);
                    setErrors([]);
                  }} />
                <small>MP4, WebM, or MOV. The file stays on this device during Step 1.</small>
                {file && <small>Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</small>}
              </label>
            ) : (
              <label>
                <span>{draft.sourceType === 'youtube' ? 'YouTube' : 'Vimeo'} video URL <em>*</em></span>
                <input type="url" inputMode="url" placeholder="https://"
                  value={draft.externalUrl}
                  onChange={(event) => change('externalUrl', event.target.value)} />
                <small>Only HTTPS links from the selected video provider are accepted.</small>
              </label>
            )}
            <label>
              <span>Where should it appear?</span>
              <select value={draft.placement}
                onChange={(event) => change('placement', event.target.value as VideoDraft['placement'])}>
                {VIDEO_PLACEMENTS.map((placement) => (
                  <option key={placement.value} value={placement.value}>{placement.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Thumbnail URL (optional)</span>
              <input type="url" value={draft.thumbnailUrl} placeholder="https://"
                onChange={(event) => change('thumbnailUrl', event.target.value)} />
            </label>
            <label>
              <span>Video caption (optional)</span>
              <input type="text" maxLength={300} value={draft.caption}
                placeholder="Short accessible summary"
                onChange={(event) => change('caption', event.target.value)} />
            </label>
          </div>

          {errors.length > 0 && (
            <div className="video-library-errors" role="alert">
              {errors.map((error) => <p key={error}>{error}</p>)}
            </div>
          )}

          <div className="video-library-actions">
            <button type="button" className="video-library-primary" onClick={reviewDraft}>
              Review draft
            </button>
            <button type="button" className="video-library-secondary" onClick={clearDraft}>
              Clear form
            </button>
          </div>
          {reviewed && (
            <p className="video-library-reviewed" role="status">
              Draft details verified locally. Saving and publishing will become available
              after storage and publishing are connected.
            </p>
          )}
        </section>

        <section className="video-library-panel" aria-labelledby="video-preview-heading">
          <div className="video-library-panel-heading">
            <span className="video-library-step">02</span>
            <div>
              <h2 id="video-preview-heading">Preview &amp; placement</h2>
              <p>Check what will be prepared for the website.</p>
            </div>
          </div>
          <div className="video-library-preview">
            {draft.sourceType === 'file' && localPreview && file &&
              PREVIEW_VIDEO_TYPES.some((type) => type === file.type) ? (
                <video src={localPreview} controls playsInline preload="metadata" />
              ) : externalVideoUrl ? (
                <div className="video-library-link-preview">
                  <span>▶</span>
                  <p>{draft.sourceType === 'youtube' ? 'YouTube' : 'Vimeo'} video selected</p>
                  <a href={externalVideoUrl} target="_blank" rel="noopener noreferrer">
                    Open video in a new tab
                  </a>
                </div>
              ) : (
                <div className="video-library-empty-preview">
                  <span>▶</span>
                  <p>Choose a video to see a local preview.</p>
                </div>
              )}
          </div>
          <dl className="video-library-summary">
            <div><dt>Title</dt><dd>{draft.title.trim() || 'Untitled video'}</dd></div>
            <div><dt>Placement</dt><dd>{VIDEO_PLACEMENTS.find((item) => item.value === draft.placement)?.label}</dd></div>
            <div><dt>Status</dt><dd>Unsaved local draft</dd></div>
          </dl>
          <div className="video-library-disabled">
            <button type="button" disabled>Save draft</button>
            <button type="button" disabled>Publish video</button>
            <p>These controls are intentionally disabled until secure storage and website publishing are ready.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
