import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('language switcher modal', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  const openSelectorBtn = page.locator('button:has-text("تغيير"), button:has-text("Change")').first();
  await openSelectorBtn.click();

  const modal = page.locator('[role="dialog"]').first();
  await expect(modal).toBeVisible();

  // Pick French
  const frBtn = modal.locator('button:has-text("French"), button:has-text("الفرنسية")').first();
  if (await frBtn.isVisible()) {
    await frBtn.click();
    const applyBtn = modal.locator('button:has-text("تأكيد"), button:has-text("Confirm"), button:has-text("ابدأ")').first();
    await applyBtn.click();

    await expect(page.locator('text=الفرنسية').or(page.locator('text=French')).first()).toBeVisible();
  }
});
