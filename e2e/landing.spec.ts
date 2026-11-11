import { test, expect } from '@playwright/test';

test('landing page renders correctly and has proper links', async ({ page }) => {
  await page.goto('/');

  // "27 lessons" and "10,000+" strings visible
  await expect(page.locator('text=27').first()).toBeVisible();
  await expect(page.locator('text=10,000+').first()).toBeVisible();

  // APK download link has href containing v4.1.0
  const apkLink = page.locator('a[href*="v4.1.0"]');
  await expect(apkLink).toBeVisible();
});
