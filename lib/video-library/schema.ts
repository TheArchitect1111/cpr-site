/**
 * CPR Video Library contract.
 * Step 1: UI and types only. No media upload, persistent writes, or publication.
 * Later runs can implement a private metadata store and approved playback sources.
 */
export const VIDEO_PLACEMENTS = [
  { value: 'homepage-featured', label: 'Homepage · Watch Video' },
  { value: 'homepage-gallery', label: 'Homepage · Video Gallery' },
  { value: 'recruiting', label: 'Recruitment page' },
  { value: 'camps', label: 'Camps & Exposure' },
  { value: 'portal', label: 'Family Portal' },
] as const;

export type VideoPlacement = (typeof VIDEO_PLACEMENTS)[number]['value'];
export type VideoSourceType = 'file' | 'youtube' | 'vimeo';
export type VideoStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived' | 'failed';

export type VideoDraft = {
  title: string;
  description: string;
  sourceType: VideoSourceType;
  externalUrl: string;
  placement: VideoPlacement;
  thumbnailUrl: string;
  caption: string;
};

/** Future server-side record contract. Do not persist using public admin-collections blobs. */
export type VideoRecord = {
  id: string;
  title: string;
  description: string;
  sourceType: VideoSourceType;
  placement: VideoPlacement;
  status: VideoStatus;
  /** An approved embed/playback URL, not an unvalidated user-submitted string. */
  playbackUrl: string | null;
  /** Private storage key or video-hosting asset identifier. */
  storageKey: string | null;
  thumbnailUrl: string | null;
  caption: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export const EMPTY_VIDEO_DRAFT: VideoDraft = {
  title: '',
  description: '',
  sourceType: 'file',
  externalUrl: '',
  placement: 'homepage-featured',
  thumbnailUrl: '',
  caption: '',
};

/** Accepted for in-browser preview only. Hosting/encoding rules belong to Step 2. */
export const PREVIEW_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export function getValidatedVideoLink(value: string, source: 'youtube' | 'vimeo'): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (source === 'youtube' && !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) return null;
    if (source === 'vimeo' && !['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function validateVideoDraft(draft: VideoDraft, file: File | null): string[] {
  const errors: string[] = [];
  const title = draft.title.trim();
  if (!title) errors.push('Enter a video title.');
  if (title.length > 120) errors.push('Title must be 120 characters or fewer.');
  if (draft.description.length > 2000) errors.push('Description must be 2,000 characters or fewer.');
  if (draft.caption.length > 300) errors.push('Caption must be 300 characters or fewer.');
  if (draft.sourceType === 'file') {
    if (!file) errors.push('Choose a video file to preview.');
    else if (!PREVIEW_VIDEO_TYPES.some((type) => type === file.type)) errors.push('Choose an MP4, WebM, or MOV video.');
  } else if (!getValidatedVideoLink(draft.externalUrl, draft.sourceType)) {
    errors.push('Enter a valid HTTPS ' + (draft.sourceType === 'youtube' ? 'YouTube' : 'Vimeo') + ' video link.');
  }
  if (draft.thumbnailUrl.trim()) {
    try {
      const url = new URL(draft.thumbnailUrl.trim());
      if (url.protocol !== 'https:') errors.push('Thumbnail must use an HTTPS URL.');
    } catch {
      errors.push('Enter a valid thumbnail URL.');
    }
  }
  return errors;
}
