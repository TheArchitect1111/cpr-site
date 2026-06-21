import { expect, test } from '@playwright/test';

test('homepage renders global hero and tribute sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /canadian prospects\.ca has gone global/i })).toBeVisible();
  await expect(page.getByText(/take your first steps to make your dream come true/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /george raveling/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /what families & players are saying/i })).toBeVisible();
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
