import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('corporate bridge', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  await page.locator('button[aria-label="Practice Hub"], button[aria-label="التدريبات"]').click();
  await page.locator('button:has-text("Corporate"), button:has-text("احترافي"), button:has-text("شركات")').first().click();

  // Enter thought
  const input = page.locator('textarea, input[type="text"]').first();
  await expect(input).toBeVisible();
});
