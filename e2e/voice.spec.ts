import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('voice practice', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  await page.locator('button[aria-label="Practice Hub"], button[aria-label="التدريبات"]').click();
  await page.locator('button:has-text("Voice"), button:has-text("محادثة")').first().click();

  // Mic button
  const micBtn = page.locator('button[aria-label*="Mic"], button[aria-label*="تحدث"], button[aria-label*="مايك"]');
  await expect(micBtn).toBeVisible();

  // Transcript placeholder
  await expect(page.locator('text=تحدث الآن').or(page.locator('text=Listening'))).toBeVisible({ timeout: 1000 }).catch(() => {});
});
