import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('profile and preferences', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  await page.locator('button').filter({ hasText: /الملف|Profile/i }).first().click();

  // Verify profile page renders
  await expect(page.locator('text=تصدير').or(page.locator('text=Export')).first()).toBeVisible();
});
