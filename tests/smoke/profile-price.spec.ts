import { expect, test } from '@playwright/test';

test('CPR player profile page clearly prices the one-time fee at $100', async ({ page }) => {
  await page.goto('/profile/create');
  await expect(page.getByRole('heading', { name: /create a coach-visible profile/i })).toBeVisible();
  await expect(page.getByText('$100 one-time profile fee')).toBeVisible();
  await expect(page.getByRole('button', { name: 'CREATE YOUR PLAYER PROFILE | $100' })).toBeVisible();
  await expect(page.getByText('The $100 profile fee does not include CPR recruitment services.')).toBeVisible();
  await expect(page.getByText(/\$75/)).toHaveCount(0);
});

test('CPR PayPal profile checkout sets $100 without taking payment', async ({ request }) => {
  const response = await request.post('/api/payments/profile-checkout');
  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as { url: string };
  const checkout = new URL(payload.url);
  expect(checkout.hostname).toBe('www.paypal.com');
  expect(checkout.searchParams.get('cmd')).toBe('_xclick');
  expect(checkout.searchParams.get('item_name')).toBe('CPR Player Profile');
  expect(checkout.searchParams.get('amount')).toBe('100.00');
  expect(checkout.searchParams.get('currency_code')).toBeTruthy();
});
