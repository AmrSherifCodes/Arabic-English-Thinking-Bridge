import { test, expect } from '@playwright/test';

test('landing page renders correctly and has proper links', async ({ page }) => {
  await page.goto('/');

  // "27 lessons" and "10,000+" strings visible
  await expect(page.locator('text=27').first()).toBeVisible();
  await expect(page.locator('text=10,000+').first()).toBeVisible();

  // APK download link has href containing v4.0.2
  const apkLink = page.locator('a[href*="v4.0.2"]');
  await expect(apkLink).toBeVisible();
});
