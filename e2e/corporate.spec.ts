import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('corporate bridge opens from practice hub', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/app');

  // Click Practice tab
  await page.getByRole('button', { name: /التدريب|Practice/ }).first().click();

  // Click Corporate card
  const corpBtn = page.getByRole('button', { name: /Corporate|من البلدي إلى Corporate/ }).first();
  await expect(corpBtn).toBeVisible();
  await corpBtn.click();

  // Verify Corporate View opens
  await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible();
});
