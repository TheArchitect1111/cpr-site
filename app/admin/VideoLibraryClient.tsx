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
import { encryptVideoFile, decryptVideoFile } from '@/lib/video-library/browser-crypto';
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
  const [savedPreview, setSavedPreview] = useState<string | null>(null);
  const savedPreviewUrl = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    if (savedPreviewUrl.current) URL.revokeObjectURL(savedPreviewUrl.current);
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

  const refreshLibrary = async () => {
    const response = await fetch('/api/admin/videos', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not refresh video statuses.');
    const data = await response.json() as { items: VideoRecord[] };
    setItems(data.items);
  };

  const publishAction = async (action: 'prepare' | 'commit' | 'unpublish', pathname: string, publicPath?: string) => {
    const response = await fetch('/api/admin/videos/publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, pathname, publicPath }),
    });
    const data = await response.json() as {
      uploadUrl?: string; publicPath?: string; sizeBytes?: number; mimeType?: string;
      error?: string;
    };
    if (!response.ok) throw new Error(data.error || 'Publishing action failed.');
    return data;
  };

  const publishRecord = async (record: VideoRecord) => {
    if (!record.storageKey || !record.mimeType || !record.sizeBytes || actionId) return;
    setActionId(record.id);
    try {
      setUploadMessage('Preparing video for publication…');
      const authorization = await publishAction('prepare', record.storageKey);
      if (!authorization.uploadUrl || !authorization.publicPath) throw new Error('Publication authorization failed.');
      const decrypted = await fetch('/api/admin/videos/preview?pathname=' +
        encodeURIComponent(record.storageKey), { cache: 'no-store' });
      const info = await decrypted.json() as { url?: string; key?: string; iv?: string; mime?: string; error?: string };
      if (!decrypted.ok || !info.url || !info.key || !info.iv || !info.mime) {
        throw new Error(info.error || 'Could not open encrypted draft.');
      }
      const response = await fetch(info.url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not retrieve encrypted video.');
      const clearUrl = await decryptVideoFile(await response.arrayBuffer(), info.key, info.iv, info.mime);
      let clearFile: Blob;
      try { clearFile = await (await fetch(clearUrl)).blob(); }
      finally { URL.revokeObjectURL(clearUrl); }
      if (clearFile.size !== record.sizeBytes) throw new Error('Video size did not match draft.');
      setUploadMessage('Publishing approved video to CPR homepage…');
      const upload = await fetch(authorization.uploadUrl, {
        method: 'PUT', headers: { 'Content-Type': record.mimeType }, body: clearFile,
      });
      if (!upload.ok) throw new Error('Could not upload the published video.');
      await publishAction('commit', record.storageKey, authorization.publicPath);
      await refreshLibrary();
      setUploadMessage('Video published to the CPR homepage. Unpublish is available below.');
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Publication failed.');
    } finally { setActionId(null); }
  };

  const unpublishRecord = async (record: VideoRecord) => {
    if (!record.storageKey || actionId) return;
    setActionId(record.id);
    setUploadMessage('Unpublishing video…');
    try {
      await publishAction('unpublish', record.storageKey);
      await refreshLibrary();
      setUploadMessage('Video unpublished. Your encrypted draft remains saved.');
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Unpublishing failed.');
    } finally { setActionId(null); }
  };

  const openSavedPreview = async (pathname: string) => {
    try {
      setUploadMessage('Decrypting saved video for preview…');
      const result = await fetch('/api/admin/videos/preview?pathname=' + encodeURIComponent(pathname), {
        cache: 'no-store',
      });
      const details = await result.json() as { url?: string; key?: string; iv?: string; mime?: string; error?: string };
      if (!result.ok || !details.url || !details.key || !details.iv || !details.mime) {
        throw new Error(details.error || 'Secure preview unavailable.');
      }
      const encryptedResult = await fetch(details.url, { cache: 'no-store' });
      if (!encryptedResult.ok) throw new Error('Encrypted video is temporarily unavailable.');
      const decryptedUrl = await decryptVideoFile(
        await encryptedResult.arrayBuffer(), details.key, details.iv, details.mime,
      );
      if (savedPreviewUrl.current) URL.revokeObjectURL(savedPreviewUrl.current);
      savedPreviewUrl.current = decryptedUrl;
      setSavedPreview(decryptedUrl);
      setUploadMessage('Secure video preview ready. The video remains unpublished.');
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Secure preview failed.');
    }
  };

  const uploadPrivateVideo = async () => {
    if (!storageConfigured || !file || uploading) return;
    const problems = validateVideoDraft(draft, file);
    setErrors(problems);
    if (problems.length) return;
    setUploading(true);
    setUploadMessage('');
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('Video must be 100 MB or smaller.');
      setUploadMessage('Encrypting the video on your device…');
      const encrypted = await encryptVideoFile(file);
      const authorize = await fetch('/api/admin/videos/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, mime: file.type, size: file.size }),
      });
      const permission = await authorize.json() as { error?: string; pathname?: string; uploadUrl?: string };
      if (!authorize.ok || !permission.pathname || !permission.uploadUrl) {
        throw new Error(permission.error || 'Private upload authorization failed.');
      }
      setUploadMessage('Uploading protected video…');
      const result = await fetch(permission.uploadUrl, {
        method: 'PUT', body: encrypted.data, headers: { 'Content-Type': 'application/octet-stream' },
      });
      if (!result.ok) throw new Error('The video file could not be uploaded.');
      const complete = await fetch('/api/admin/videos/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: permission.pathname, draft, crypto: {
          key: encrypted.key, iv: encrypted.iv, size: encrypted.size, mime: encrypted.mime,
        } }),
      });
      const saved = await complete.json() as { error?: string; record?: VideoRecord };
      if (!complete.ok || !saved.record) throw new Error(saved.error || 'Video upload could not be verified.');
      setItems((previous) => [saved.record!, ...previous.filter(item => item.id !== saved.record!.id)]);
      setUploadedPath(permission.pathname);
      setUploadMessage('Video encrypted and saved as an unpublished draft.');
      void openSavedPreview(permission.pathname);
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
          <p>Upload a video, review it, then publish it to CPR's homepage.</p>
        </div>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
      </header>

      <div className="video-library-notice" role="status">
<strong>Upload privately. Publish when approved.</strong> Original files remain encrypted
        in CPR's admin library. Publishing creates a separate public homepage video.
        Unpublish removes that public copy.
        {!storageConfigured && (
          <span> CPR's existing Blob connection or admin encryption secret is unavailable.</span>
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
              <span>Homepage placement</span>
              <select value={draft.placement}
                onChange={(event) => change('placement', event.target.value as VideoDraft['placement'])}>
                {VIDEO_PLACEMENTS.filter((placement) => ['homepage-featured', 'homepage-gallery'].includes(placement.value)).map((placement) => (
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
              Video details verified. Choose Upload privately, then use Publish on the saved video below.
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
            {savedPreview ? (
              <video key={savedPreview} src={savedPreview}
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
          <p className="video-library-reviewed">After uploading, choose Publish on the saved video below.</p>
        </section>
      </div>
      <section className="video-library-panel" aria-labelledby="video-records-heading" style={{ marginTop: 18 }}>
        <div className="video-library-panel-heading">
          <span className="video-library-step">03</span>
          <div>
            <h2 id="video-records-heading">Private video drafts</h2>
            <p>Preview drafts, publish approved homepage videos, or remove videos from the public website.</p>
          </div>
        </div>
        {items.length === 0 ? <p>No uploaded video drafts yet.</p> : (
          <div className="video-library-records">
            {items.map(item => (
              <div key={item.id} className="video-library-record">
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.status === 'published' ? 'Published' : 'Private draft'} · {VIDEO_PLACEMENTS.find(p => p.value === item.placement)?.label}</small>
                  {item.status === 'published' && item.playbackUrl &&
                    <a href={item.playbackUrl} target="_blank" rel="noopener noreferrer">View published video</a>}
                </div>
                {item.storageKey && (
                  <div className="video-library-record-actions">
                    <button type="button" className="video-library-secondary"
                      disabled={actionId !== null}
                      onClick={() => void openSavedPreview(item.storageKey!)}>
                      Preview
                    </button>
                    {item.status === 'published' ? (
                      <button type="button" className="video-library-secondary"
                        disabled={actionId !== null}
                        onClick={() => void unpublishRecord(item)}>
                        {actionId === item.id ? 'Working…' : 'Unpublish'}
                      </button>
                    ) : ['homepage-featured', 'homepage-gallery'].includes(item.placement) ? (
                      <button type="button" className="video-library-primary"
                        disabled={actionId !== null}
                        onClick={() => void publishRecord(item)}>
                        {actionId === item.id ? 'Publishing…' : 'Publish'}
                      </button>
                    ) : <small>Publishing to this section is not yet available.</small>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
