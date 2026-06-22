import { expect, test } from '@playwright/test';

test('homepage renders EA Landing Page Chassis sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /what becomes possible/i })).toBeVisible();
  await expect(page.getByText(/canadian prospects\.ca has gone global/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /what families & players are saying/i })).toBeVisible();
  await expect(page.getByText(/good coaches get players through drills/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /cpr family portal/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /meet mike/i })).toHaveCount(0);
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

test('apply flow entry page is reachable', async ({ page }) => {
  await page.goto('/apply');
  await expect(page.getByRole('heading', { name: /athlete application/i })).toBeVisible();
  await expect(page.locator('input[autocomplete="given-name"]')).toBeVisible();
});

test('legacy intake URL redirects to apply', async ({ page }) => {
  await page.goto('/intake');
  await expect(page).toHaveURL(/\/apply$/);
});

test('admin login page loads', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: /cpr admin/i })).toBeVisible();
});

test('portal login page loads', async ({ page }) => {
  await page.goto('/portal/login');
  await expect(page.getByRole('heading', { name: /portal login/i })).toBeVisible();
});
