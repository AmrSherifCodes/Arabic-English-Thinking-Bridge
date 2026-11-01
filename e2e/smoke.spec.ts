import { test, expect } from '@playwright/test';

test.describe('Thinking Bridge Choice Menu & Preferences Smoke Suite', () => {

  test('Scenario 1: Page load has 0 errors and mounts Choice Menu cleanly', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('SSL certificate') &&
          !text.includes('ERR_CERT_AUTHORITY_INVALID') &&
          !text.includes('Failed to register a ServiceWorker')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', err => {
      const msg = err.message || '';
      if (
        !msg.includes('SSL certificate') &&
        !msg.includes('ERR_CERT_AUTHORITY_INVALID') &&
        !msg.includes('Failed to register a ServiceWorker')
      ) {
        pageErrors.push(msg);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Title verification
    const menuTitle = page.locator('.menu__title');
    await expect(menuTitle).toBeVisible({ timeout: 10000 });
    await expect(menuTitle).toHaveText('Thinking Bridge');

    // Verify all 4 action tiles mount cleanly
    const voiceTile = page.locator('button:has-text("Voice Practice")');
    const lessonTile = page.locator('button:has-text("Continue Lesson")');
    const cardsTile = page.locator('button:has-text("Flashcards")');
    const prefTile = page.locator('button:has-text("Preferences")');

    await expect(voiceTile).toBeVisible();
    await expect(lessonTile).toBeVisible();
    await expect(cardsTile).toBeVisible();
    await expect(prefTile).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Scenario 2: Navigate to Voice Practice shell and back to menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click Voice Practice tile
    const voiceTile = page.locator('button:has-text("Voice Practice")');
    await voiceTile.click();

    // Verify Voice Practice screen mounted
    const voiceHeader = page.locator('.voice__header');
    await expect(voiceHeader).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.voice__status')).toHaveText('Tap the mic to begin');
    await expect(page.locator('.voice__mic')).toBeVisible();

    // Click Back
    const backBtn = page.locator('.voice__back');
    await backBtn.click();

    // Assert back on main menu
    await expect(page.locator('.menu__title')).toBeVisible();
  });

  test('Scenario 3: Schema-driven Preferences screen renders and controls function', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open Preferences
    const prefTile = page.locator('button:has-text("Preferences")');
    await prefTile.click();

    // Verify Preferences title and categories
    await expect(page.locator('.pref-header h1')).toHaveText('Preferences');
    await expect(page.locator('text=Audio & Voice')).toBeVisible();
    await expect(page.locator('text=System')).toBeVisible();

    // Verify schema fields rendered
    const voiceSelect = page.locator('.pref-select').first();
    await expect(voiceSelect).toBeVisible();
    await voiceSelect.selectOption('en-US-AvaNeural');

    // Toggle auto-listen switch
    const toggleBtn = page.locator('button[role="switch"]').first();
    await expect(toggleBtn).toBeVisible();
    const initialChecked = await toggleBtn.getAttribute('aria-checked');
    await toggleBtn.click();
    const newChecked = await toggleBtn.getAttribute('aria-checked');
    expect(newChecked).not.toBe(initialChecked);

    // Click Back
    const backBtn = page.locator('.pref-back');
    await backBtn.click();

    // Assert return to main menu
    await expect(page.locator('.menu__title')).toBeVisible();
  });

  test('Scenario 4: Preferences persist to localStorage and survive reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Go to Preferences
    await page.locator('button:has-text("Preferences")').click();

    // Change speech rate slider
    const slider = page.locator('.pref-slider');
    await slider.fill('1.3');
    await slider.dispatchEvent('change');

    // Verify localStorage has persisted the value
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('tb.preferences.v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(stored).toBeTruthy();
    expect(Number(stored.speechRate)).toBeCloseTo(1.3, 1);

    // Reload page and re-enter Preferences to verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await page.locator('button:has-text("Preferences")').click();
    const sliderValue = await page.locator('.pref-slider').inputValue();
    expect(Number(sliderValue)).toBeCloseTo(1.3, 1);
  });

  test('Scenario 5: Placeholder routes (Lesson & Flashcards) have working back navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Lesson route
    await page.locator('button:has-text("Continue Lesson")').click();
    await expect(page.locator('text=lesson screen is wired in Phase 2.3.')).toBeVisible();
    await page.locator('button:has-text("← Back")').click();
    await expect(page.locator('.menu__title')).toBeVisible();

    // Flashcards route
    await page.locator('button:has-text("Flashcards")').click();
    await expect(page.locator('text=flashcards screen is wired in Phase 2.3.')).toBeVisible();
    await page.locator('button:has-text("← Back")').click();
    await expect(page.locator('.menu__title')).toBeVisible();
  });
});
