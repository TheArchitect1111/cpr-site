import { expect, test } from '@playwright/test';

const PLAYER_APPLICATION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScnS-NAIhJnNDCVMbhFtAPbEtYZT9ZzZytagNu1THa9f80qmg/viewform?usp=publish-editor';

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

test('application CTAs point to the Google Form', async ({ page }) => {
  await page.goto('/');
  const applyLinks = page.locator(`a[href="${PLAYER_APPLICATION_URL}"]`);
  // At least one CTA must be visible on load. The mobile-nav drawer also has an
  // "Apply Now" link that is intentionally hidden until the drawer is opened, so
  // assert on a visible CTA rather than whichever happens to be first in the DOM.
  const visibleApplyLinks = page.locator(`a[href="${PLAYER_APPLICATION_URL}"]:visible`);
  await expect(visibleApplyLinks.first()).toBeVisible();
  expect(await applyLinks.count()).toBeGreaterThanOrEqual(3);
});

test('/apply and legacy intake URLs redirect to the Google Form', async ({ request }) => {
  for (const path of ['/apply', '/intake']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([307, 308]).toContain(response.status());
    expect(response.headers().location).toBe(PLAYER_APPLICATION_URL);
  }
});

test('admin login page loads', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: /cpr admin/i })).toBeVisible();
});

test('portal login page loads', async ({ page }) => {
  await page.goto('/portal/login');
  await expect(page.getByRole('heading', { name: /portal login/i })).toBeVisible();
});
