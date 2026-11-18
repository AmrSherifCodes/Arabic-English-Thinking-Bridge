import { test, expect } from '@playwright/test';

test('landing page renders correctly and has proper sections', async ({ page }) => {
  await page.goto('/');

  // Main heading is visible
  await expect(page.locator('h1').first()).toBeVisible();

  // Start CTA button is present and visible
  const startBtn = page.getByRole('button', { name: /ابدأ رحلتك مجاناً|ابدأ دلوقتي|Start your journey for free/ }).first();
  await expect(startBtn).toBeVisible();
});
