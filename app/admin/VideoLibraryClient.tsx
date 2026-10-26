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
  type VideoRecord,
} from '@/lib/video-library/schema';
import './video-library.css';

const VIDEO_ACCEPT = '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';

export default function VideoLibraryClient({
  storageConfigured,
  initialVideos,
}: {
  storageConfigured: boolean;
  initialVideos: VideoRecord[];
}) {
  const [draft, setDraft] = useState<VideoDraft>({ ...EMPTY_VIDEO_DRAFT });
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [items, setItems] = useState<VideoRecord[]>(initialVideos);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const selectFile = (next: File | null) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const url = next ? URL.createObjectURL(next) : null;
    previewUrl.current = url;
    setFile(next);
    setLocalPreview(url);
  };

  const change = <K extends keyof VideoDraft>(key: K, value: VideoDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setReviewed(false);
    setErrors([]);
    setUploadedPath(null);
    setUploadMessage('');
  };

  const clearDraft = () => {
    setDraft({ ...EMPTY_VIDEO_DRAFT });
    selectFile(null);
    setErrors([]);
    setReviewed(false);
    setUploadedPath(null);
    setUploadMessage('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const changeSource = (next: VideoSourceType) => {
    change('sourceType', next);
    selectFile(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const reviewDraft = () => {
    const nextErrors = validateVideoDraft(draft, file);
    setErrors(nextErrors);
    setReviewed(nextErrors.length === 0);
  };

  const uploadPrivateVideo = async () => {
    if (!storageConfigured || !file || uploading) return;
    const problems = validateVideoDraft(draft, file);
    setErrors(problems);
    if (problems.length) return;
    setUploading(true);
    setUploadMessage('');
    try {
      const authorize = await fetch('/api/admin/videos/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, mime: file.type, size: file.size }),
      });
      const permission = await authorize.json() as { error?: string; pathname?: string; uploadUrl?: string };
      if (!authorize.ok || !permission.pathname || !permission.uploadUrl) {
        throw new Error(permission.error || 'Private upload authorization failed.');
      }
      const result = await fetch(permission.uploadUrl, {
        method: 'PUT', body: file, headers: { 'Content-Type': file.type },
      });
      if (!result.ok) throw new Error('The video file could not be uploaded.');
      const complete = await fetch('/api/admin/videos/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: permission.pathname, draft }),
      });
      const saved = await complete.json() as { error?: string; record?: VideoRecord };
      if (!complete.ok || !saved.record) throw new Error(saved.error || 'Video upload could not be verified.');
      setItems((previous) => [saved.record!, ...previous.filter(item => item.id !== saved.record!.id)]);
      setUploadedPath(permission.pathname);
      setSelectedPath(permission.pathname);
      setUploadMessage('Video uploaded to private storage and saved as a draft. It is not published.');
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Private upload failed.');
    } finally {
      setUploading(false);
    }
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
<strong>Step 2: private video uploads and previews.</strong> Videos are stored as
        unpublished drafts. Nothing is placed on the public CPR website yet.
        {!storageConfigured && (
          <span> Private video storage must be connected before uploading is available.</span>
        )}
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
                    selectFile(event.target.files?.[0] ?? null);
                    setReviewed(false);
                    setErrors([]);
                    setUploadedPath(null);
                    setUploadMessage('');
                  }} />
                <small>MP4, WebM, or MOV, up to 100 MB. Choose Review draft, then Upload privately.</small>
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
            {draft.sourceType === 'file' && (
              <button type="button" className="video-library-primary"
                disabled={!storageConfigured || uploading || !file}
                onClick={() => void uploadPrivateVideo()}>
                {uploading ? 'Uploading…' : 'Upload privately'}
              </button>
            )}
            <button type="button" className="video-library-secondary" onClick={clearDraft}>
              Clear form
            </button>
          </div>
          {reviewed && (
            <p className="video-library-reviewed" role="status">
              Draft details verified. File uploads can be stored privately; website publishing is not enabled.
            </p>
          )}
          {uploadMessage && <p className="video-library-reviewed" role="status">{uploadMessage}</p>}
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
            {selectedPath ? (
              <video key={selectedPath} src={`/api/admin/videos/preview?pathname=${encodeURIComponent(selectedPath)}`}
                controls playsInline preload="metadata" />
            ) : draft.sourceType === 'file' && localPreview && file &&
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
            <div><dt>Status</dt><dd>{uploadedPath ? 'Private uploaded draft' : 'Unsaved local draft'}</dd></div>
          </dl>
          <div className="video-library-disabled">
            <button type="button" disabled>Save draft</button>
            <button type="button" disabled>Publish video</button>
            <p>Publishing is intentionally disabled until the website integration is verified in Step 3.</p>
          </div>
        </section>
      </div>
      <section className="video-library-panel" aria-labelledby="video-records-heading" style={{ marginTop: 18 }}>
        <div className="video-library-panel-heading">
          <span className="video-library-step">03</span>
          <div>
            <h2 id="video-records-heading">Private video drafts</h2>
            <p>Stored files are only accessible through the authenticated admin preview.</p>
          </div>
        </div>
        {items.length === 0 ? <p>No uploaded video drafts yet.</p> : (
          <div className="video-library-records">
            {items.map(item => (
              <div key={item.id} className="video-library-record">
                <div>
                  <strong>{item.title}</strong>
                  <small>Draft · {VIDEO_PLACEMENTS.find(p => p.value === item.placement)?.label}</small>
                </div>
                {item.storageKey && (
                  <button type="button" className="video-library-secondary"
                    onClick={() => { setSelectedPath(item.storageKey); setUploadMessage(''); }}>
                    Preview
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
