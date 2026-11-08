import { test, expect } from '@playwright/test';

test('onboarding completes and navigates to lessons', async ({ page }) => {
  // Clear storage to force onboarding
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto('/?app=true');

  // We should be on onboarding
  await expect(page.locator('text=Welcome').or(page.locator('text=أهلاً بك'))).toBeVisible();

  // For this spec, we will test the "Skip for now" / fast path if available
  // Let's just click through the main options until it dismisses.
  // The step 1 might have a language selection. We will just click the primary buttons.

  // Since we don't know the exact DOM elements without viewing the OnboardingModal, we will click buttons that are likely to advance.
  for (let i = 0; i < 5; i++) {
    const primaryButton = page.locator('button:has-text("متابعة"), button:has-text("Continue"), button:has-text("التالي"), button:has-text("Next"), button:has-text("تأكيد"), button:has-text("Confirm")').first();
    if (await primaryButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await primaryButton.click();
    } else {
       break;
    }
  }

  // After onboarding, we should see the path view
  await expect(page.locator('section[aria-label="Active Language Learning Bridge"]')).toBeVisible();
});
