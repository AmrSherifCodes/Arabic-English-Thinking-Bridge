import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('flashcards deck list and review', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  // Go to Practice Tab
  await page.locator('button').filter({ hasText: /التدريب|Practice/i }).first().click();

  // Go to Flashcards
  await page.locator('button').filter({ hasText: /Flashcards|بطاقات|استذكار/i }).first().click();

  // Deck list renders Phase 1 deck or similar
  await expect(page.locator('text=Phase 1').or(page.locator('text=المرحلة 1')).first()).toBeVisible();
});
