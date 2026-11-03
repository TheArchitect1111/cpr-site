import { expect, test } from '@playwright/test';
import type { VideoRecord } from '../../lib/video-library/schema';

// Valid tiny VP8/WebM fixture generated from FFmpeg color source.
// No CPR client media or private data are used.
const sampleVideo = Buffer.from('GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAKCEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHWTbuMU6uEElTDZ1OsggEjTbuMU6uEHFO7a1OsggJs7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsCrXsYMPQkBNgIxMYXZmNjEuNy4xMDNXQYxMYXZmNjEuNy4xMDNEiYhAh3AAAAAAABZUrmvIrgEAAAAAAAA/14EBc8WIcs9dzCuXd4+cgQAitZyDdW5kiIEAhoVWX1ZQOIOBASPjg4QHc1lA4JCwgWC6gUCagQJVsIRVuYEBElTDZ/tzc59jwIBnyJlFo4dFTkNPREVSRIeMTGF2ZjYxLjcuMTAzc3PWY8CLY8WIcs9dzCuXd49nyKFFo4dFTkNPREVSRIeUTGF2YzYxLjE5LjEwMSBsaWJ2cHhnyKFFo4hEVVJBVElPTkSHkzAwOjAwOjAwLjc1MDAwMDAwMAAfQ7Z1QMPngQCjxoEAAIDwAwCdASpgAEAAAEcIhYWIhYSIAgICdaoD+AIGwSzT6hw4cOHDhw4ZAP7/TRL//FhX8WFfxYV/8WFf/PzO7cX85gCjloEAfQDRAQABEBAAGAAYWC/0AAiFKACjloEA+gDRAQABEBAAGAAYWC/0AAiFKACjloEBdwDRAQABEBAAGAAYWC/0AAiFKACjloEB9ADRAQABEBAAGAAYWC/0AAiFKACjloECcQDRAQABEBAAGAAYWC/0AAiFKAAcU7trkbuPs4EAt4r3gQHxggGj8IED', 'base64');

test('sandbox: real WebM file goes through upload, encrypted draft, preview, publish, playback and unpublish', async ({ page }) => {
  test.skip(process.env.CPR_SANDBOX_VIDEO_E2E !== '1', 'Only run in isolated local sandbox');

  const id = '11111111-1111-4111-8111-111111111111';
  const encryptedPath = 'cpr-production/videos/encrypted/' + id + '/sample-webm.enc';
  const publicPath = 'cpr-production/videos/published/' + id + '/22222222-2222-4222-8222-222222222222.webm';

  const state: {
    encryptedBytes: Buffer | null;
    publishedBytes: Buffer | null;
    cryptoParams: { key: string; iv: string; size: number; mime: string } | null;
    record: VideoRecord | null;
    published: boolean;
    completed: boolean;
    publishedCount: number;
  } = {
    encryptedBytes: null, publishedBytes: null, cryptoParams: null,
    record: null, published: false, completed: false, publishedCount: 0,
  };

  const json = (data: unknown, status = 200) => ({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });

  await page.route('**/api/admin/videos/upload', async route => {
    const data = route.request().postDataJSON() as { name: string; mime: string; size: number };
    expect(data).toEqual({ name: 'sample.webm', mime: 'video/webm', size: sampleVideo.length });
    await route.fulfill(json({ pathname: encryptedPath, uploadUrl: '/__sandbox/blob/encrypted' }));
  });

  await page.route('**/api/admin/videos/complete', async route => {
    const data = route.request().postDataJSON() as {
      pathname: string;
      draft: { title: string; description: string; placement: VideoRecord['placement']; caption: string; thumbnailUrl: string };
      crypto: { key: string; iv: string; size: number; mime: string };
    };
    expect(data.pathname).toBe(encryptedPath);
    expect(data.crypto.size).toBe(sampleVideo.length);
    expect(data.crypto.mime).toBe('video/webm');
    expect(state.encryptedBytes).not.toBeNull();
    expect(state.encryptedBytes?.equals(sampleVideo)).toBe(false);
    expect(state.encryptedBytes?.length).toBe(sampleVideo.length + 16);
    state.cryptoParams = data.crypto;
    const now = new Date().toISOString();
    state.record = {
      id, title: data.draft.title, description: data.draft.description,
      sourceType: 'file', placement: data.draft.placement,
      status: 'draft', playbackUrl: null, storageKey: encryptedPath,
      thumbnailUrl: data.draft.thumbnailUrl || null, caption: data.draft.caption,
      mimeType: 'video/webm', sizeBytes: sampleVideo.length,
      createdAt: now, updatedAt: now, publishedAt: null,
    };
    state.completed = true;
    await route.fulfill(json({ record: state.record }, 201));
  });

  await page.route('**/api/admin/videos/preview?**', async route => {
    expect(state.cryptoParams).not.toBeNull();
    await route.fulfill(json({
      url: '/__sandbox/blob/encrypted',
      key: state.cryptoParams?.key, iv: state.cryptoParams?.iv, mime: 'video/webm',
    }));
  });

  await page.route('**/api/admin/videos/publish', async route => {
    const request = route.request().postDataJSON() as {
      action: string; pathname: string; publicPath?: string;
    };
    expect(request.pathname).toBe(encryptedPath);
    if (request.action === 'prepare') {
      await route.fulfill(json({
        uploadUrl: '/__sandbox/blob/published',
        publicPath, mimeType: 'video/webm', sizeBytes: sampleVideo.length,
      }));
    } else if (request.action === 'commit') {
      expect(request.publicPath).toBe(publicPath);
      expect(state.publishedBytes?.equals(sampleVideo)).toBe(true);
      state.published = true;
      state.publishedCount++;
      await route.fulfill(json({ video: { id, publicPath, playbackUrl: '/__sandbox/blob/published' } }));
    } else if (request.action === 'unpublish') {
      state.published = false;
      await route.fulfill(json({ unpublished: true }));
    } else {
      await route.fulfill(json({ error: 'Bad action' }, 400));
    }
  });

  await page.route('**/api/admin/videos', async route => {
    const items = state.record
      ? [{ ...state.record, status: state.published ? 'published' as const : 'draft' as const,
          playbackUrl: state.published ? '/__sandbox/blob/published' : null,
          publishedAt: state.published ? new Date().toISOString() : null }]
      : [];
    await route.fulfill(json({ items, configured: true }));
  });

  await page.route('**/__sandbox/blob/**', async route => {
    const url = new URL(route.request().url());
    const isPublic = url.pathname.endsWith('/published');
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataBuffer();
      if (isPublic) state.publishedBytes = body;
      else state.encryptedBytes = body;
      await route.fulfill({ status: 200, body: '', headers: { 'access-control-allow-origin': '*' } });
      return;
    }
    const bytes = isPublic ? state.publishedBytes : state.encryptedBytes;
    if (!bytes) {
      await route.fulfill({ status: 404, body: 'Not found' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: isPublic ? 'video/webm' : 'application/octet-stream',
      body: bytes,
      headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
    });
  });

  await page.goto('/cpr-video-sandbox');
  await expect(page.getByRole('heading', { name: 'VIDEO LIBRARY' })).toBeVisible();
  await page.getByPlaceholder('e.g. What CPR can do for your future').fill('CPR sandbox sample');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'sample.webm', mimeType: 'video/webm', buffer: sampleVideo,
  });
  await page.getByRole('button', { name: 'Review draft', exact: true }).click();
  await expect(page.getByText('Video details verified.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Upload privately' }).click();

  await expect(page.getByText('Video saved securely.', { exact: false })).toBeVisible();
  expect(state.completed).toBe(true);
  expect(state.encryptedBytes?.equals(sampleVideo)).toBe(false);
  await expect(page.getByRole('button', { name: 'Upload privately' })).toBeDisabled();
  await expect(page.getByText('CPR sandbox sample').first()).toBeVisible();

  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('.video-library-preview video')).toHaveAttribute('src', /^blob:/);
  await page.waitForFunction(() => {
    const media = document.querySelector('.video-library-preview video') as HTMLVideoElement | null;
    return Boolean(media && media.videoWidth > 0 && media.readyState >= 1);
  });

  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText('Video published to the CPR homepage.', { exact: false })).toBeVisible();
  expect(state.publishedCount).toBe(1);
  expect(state.publishedBytes?.equals(sampleVideo)).toBe(true);
  const liveLink = page.getByRole('link', { name: 'View published video' });
  await expect(liveLink).toHaveAttribute('href', '/__sandbox/blob/published');

  // Check the published bytes actually decode in a browser video element.
  const playback = await page.evaluate(async () => {
    const media = document.createElement('video');
    media.muted = true;
    media.preload = 'auto';
    media.src = '/__sandbox/blob/published';
    document.body.appendChild(media);
    await new Promise<void>((resolve, reject) => {
      media.addEventListener('loadedmetadata', () => resolve(), { once: true });
      media.addEventListener('error', () => reject(new Error('Video decode failed')), { once: true });
      media.load();
    });
    return { width: media.videoWidth, height: media.videoHeight, duration: media.duration };
  });
  expect(playback.width).toBeGreaterThan(0);
  expect(playback.height).toBeGreaterThan(0);
  expect(playback.duration).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Unpublish' }).click();
  await expect(page.getByText('Video unpublished.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View published video' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeVisible();
  expect(state.published).toBe(false);
});
