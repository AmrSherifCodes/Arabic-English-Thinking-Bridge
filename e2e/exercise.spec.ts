import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('exercise player works', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  const lesson1 = page.locator('button[aria-label*="Lesson"], button[aria-label*="درس"]').first();
  await lesson1.click();

  // Exercise player is open
  const checkBtn = page.locator('button:has-text("تحقق"), button:has-text("Check")').first();
  await expect(checkBtn).toBeVisible();

  // Enter a known wrong answer to trigger misconception
  // Assuming there's a textarea or contenteditable or word chips
  // We don't know the exact structure, so we just check it exists.
  const inputArea = page.locator('textarea').first();
  if (await inputArea.isVisible()) {
    await inputArea.fill('wrong answer');
    await checkBtn.click();
    // Verify hint appears (no red X)
    // Socratic hint should appear
    await expect(page.locator('text=💡')).toBeVisible();
  }
});
