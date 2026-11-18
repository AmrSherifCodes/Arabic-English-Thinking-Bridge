import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('voice practice', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  await page.locator('button').filter({ hasText: /التدريب|Practice/i }).first().click();
  await page.locator('button').filter({ hasText: /Voice|محادثة|نطق/i }).first().click();

  // Mic button or voice container
  const voiceContainer = page.locator('.voice, [class*="voice"]').first();
  await expect(voiceContainer).toBeVisible();
});
