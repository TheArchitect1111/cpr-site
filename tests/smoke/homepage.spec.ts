import { expect, test } from '@playwright/test';

test('homepage renders global and tribute sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /take the first step in making your dreams a reality/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /george raveling/i })).toBeVisible();
});

test('apply flow entry page is reachable', async ({ page }) => {
  await page.goto('/apply');
  await expect(page.getByRole('heading', { name: /athlete application/i })).toBeVisible();
  await expect(page.locator('input[autocomplete="given-name"]')).toBeVisible();
});
