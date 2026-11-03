import { expect, test } from '@playwright/test';

// These checks deliberately use no admin credentials and do not write files.
test('CPR video API rejects anonymous reads and uploads', async ({ request }) => {
  const listing = await request.get('/api/admin/videos');
  expect(listing.status()).toBe(401);

  const authorize = await request.post('/api/admin/videos/upload', {
    data: { name: 'test.mp4', mime: 'video/mp4', size: 1024 },
  });
  expect(authorize.status()).toBe(401);

  const complete = await request.post('/api/admin/videos/complete', {
    data: { pathname: 'cpr-production/videos/encrypted/not-a-real-video' },
  });
  expect(complete.status()).toBe(401);

  const publish = await request.post('/api/admin/videos/publish', {
    data: { action: 'prepare', pathname: 'cpr-production/videos/encrypted/not-a-real-video' },
  });
  expect(publish.status()).toBe(401);

  const preview = await request.get('/api/admin/videos/preview?pathname=invalid');
  expect(preview.status()).toBe(401);
});

test('CPR video library requires an administrator sign-in', async ({ page }) => {
  await page.goto('/admin?tab=videos');
  await expect(page.getByRole('heading', { name: /cpr admin/i })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});
