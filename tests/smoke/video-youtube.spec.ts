import { expect, test } from '@playwright/test';
import { getYouTubeEmbedUrl, getYouTubeVideoId, getValidatedVideoLink } from '../../lib/video-library/schema';

test('CPR accepts Shorts share links and produces a restricted YouTube embed', () => {
  const short = 'https://youtube.com/shorts/hd-Lfve3otA?si=piwazqlP09xaVi73';
  expect(getYouTubeVideoId(short)).toBe('hd-Lfve3otA');
  expect(getYouTubeEmbedUrl(short)).toBe('https://www.youtube-nocookie.com/embed/hd-Lfve3otA');
  expect(getValidatedVideoLink(short, 'youtube')).toBe('https://www.youtube.com/watch?v=hd-Lfve3otA');
  expect(getYouTubeVideoId('https://www.youtube.com/watch?v=hd-Lfve3otA')).toBe('hd-Lfve3otA');
  expect(getYouTubeVideoId('https://youtu.be/hd-Lfve3otA')).toBe('hd-Lfve3otA');
  expect(getYouTubeVideoId('https://m.youtube.com/shorts/hd-Lfve3otA')).toBe('hd-Lfve3otA');
});

test('CPR refuses malformed or attacker-controlled video URLs', () => {
  for (const url of [
    'https://youtube.com.evil.example/shorts/hd-Lfve3otA',
    'https://www.youtube.com.evil.example/watch?v=hd-Lfve3otA',
    'https://youtube.com/shorts/not-a-valid-video-id',
    'https://youtube.com/redirect?q=https://example.com',
    'javascript:alert(1)',
    'http://youtube.com/shorts/hd-Lfve3otA',
    'https://youtube.com:8443/shorts/hd-Lfve3otA',
    'https://user:password@youtube.com/shorts/hd-Lfve3otA',
  ]) {
    expect(getYouTubeVideoId(url)).toBeNull();
    expect(getYouTubeEmbedUrl(url)).toBeNull();
  }
});

test('CPR blocks unsigned admin requests to YouTube publishing and saving', async ({ request }) => {
  for (const action of ['save', 'publish', 'unpublish']) {
    const res = await request.post('/api/admin/videos/external', {
      data: { action, id: '11111111-1111-4111-8111-111111111111',
        draft: { title: 'Unauthorized', sourceType: 'youtube',
          externalUrl: 'https://youtube.com/shorts/hd-Lfve3otA' } },
    });
    expect(res.status()).toBe(401);
  }
});
