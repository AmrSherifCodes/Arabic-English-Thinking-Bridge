import { test, expect } from '@playwright/test';
import { seedStorage } from './seed';

test('flashcards deck list and review', async ({ page }) => {
  await seedStorage(page);
  await page.goto('/?app=true');

  // Go to Practice Hub
  await page.locator('button[aria-label="Practice Hub"], button[aria-label="التدريبات"]').click();

  // Go to Flashcards
  await page.locator('button:has-text("Flashcards"), button:has-text("بطاقات"), button:has-text("استذكار")').first().click();

  // Deck list renders Phase 1 deck
  await expect(page.locator('text=Phase 1').or(page.locator('text=المرحلة 1'))).toBeVisible();

  // Open deck
  await page.locator('text=Phase 1').or(page.locator('text=المرحلة 1')).click();

  // Show front of card
  await expect(page.locator('button:has-text("Reveal"), button:has-text("كشف"), button:has-text("إظهار")').first()).toBeVisible();
  await page.locator('button:has-text("Reveal"), button:has-text("كشف"), button:has-text("إظهار")').first().click();

  // Back of card + SM2 grade buttons
  await expect(page.locator('button:has-text("Again"), button:has-text("مجدداً")').first()).toBeVisible();
});
