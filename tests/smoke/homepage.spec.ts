import { expect, test } from '@playwright/test';

const GOOGLE_FORM_HOST = 'docs.google.com/forms';

test('homepage renders EA Landing Page Chassis sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/what becomes possible when talent meets preparation/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /about cpr/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /built for every step of the journey/i })).toBeVisible();
  await expect(page.getByText(/good coaches get players through drills/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /where development meets opportunity/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /camps and exposure/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /results that speak/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /the challenge/i })).toHaveCount(0);
});

test('George Raveling tribute appears above contact footer', async ({ page }) => {
  await page.goto('/');
  const tribute = page.locator('#tribute');
  await expect(tribute).toBeVisible();
  await expect(tribute.getByRole('heading', { name: /george raveling/i })).toBeVisible();
  await expect(tribute.locator('.rotate-cap')).toHaveCount(0);
  const contact = page.locator('#contact');
  const tributeBox = await tribute.boundingBox();
  const contactBox = await contact.boundingBox();
  expect(tributeBox && contactBox && tributeBox.y < contactBox.y).toBeTruthy();
});

test('tribute deep link page still works', async ({ page }) => {
  await page.goto('/tribute');
  await expect(page.getByRole('heading', { name: /george raveling/i })).toBeVisible();
});

test('application CTAs point to the CPR Google Form', async ({ page }) => {
  await page.goto('/');
  const applyLinks = page.locator(`a[href*="${GOOGLE_FORM_HOST}"]`);
  expect(await applyLinks.count()).toBeGreaterThan(0);
  await expect(applyLinks.first()).toHaveAttribute('href', /^https:\\/\\/docs\\.google\\.com\\/forms\\//);
});

test('/apply and /intake redirect to the configured CPR application form', async ({ request }) => {
  const apply = await request.get('/apply', { maxRedirects: 0 });
  expect([307, 308]).toContain(apply.status());
  expect(apply.headers().location).toMatch(/^https:\\/\\/docs\\.google\\.com\\/forms\\//);

  const intake = await request.get('/intake', { maxRedirects: 0 });
  expect([307, 308]).toContain(intake.status());
  expect(intake.headers().location).toBe(apply.headers().location);
});

test('admin login page loads', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: /cpr admin/i })).toBeVisible();
});

test('portal login page loads', async ({ page }) => {
  await page.goto('/portal/login');
  await expect(page.getByRole('heading', { name: /portal sign in/i })).toBeVisible();
});
