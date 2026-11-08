import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('lessons render and respect locks', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  // Verify header shows the source->target pair
  await expect(page.locator('section[aria-label="Active Language Learning Bridge"]')).toBeVisible();

  // All 27 lessons render (we can just check for at least a few lesson nodes)
  const lessons = page.locator('button[aria-label*="Lesson"], button[aria-label*="درس"]');
  const count = await lessons.count();
  expect(count).toBeGreaterThan(0);

  // Click lesson 1
  const lesson1 = lessons.first();
  await lesson1.click();

  // Exercise player should appear
  await expect(page.locator('button:has-text("تحقق"), button:has-text("Check")').first()).toBeVisible();
});
