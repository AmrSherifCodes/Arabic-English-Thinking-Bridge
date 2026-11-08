import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('profile and language switcher', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  await page.locator('button[aria-label="Profile"], button[aria-label="الحساب"]').click();

  // Settings button
  await page.locator('button[aria-label="Preferences"], button[aria-label="الإعدادات"]').click();

  // Language switcher in settings
  await expect(page.locator('button:has-text("Change Language"), button:has-text("تغيير اللغة")').first()).toBeVisible();
});
