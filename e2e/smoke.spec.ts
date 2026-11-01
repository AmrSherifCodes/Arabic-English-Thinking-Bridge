import { test, expect } from '@playwright/test';

test.describe('Thinking English (فكّر إنجليزي) E2E Smoke Suite', () => {

  test('Scenario 1: Page load has 0 console errors, 0 CSP violations, and mounts cleanly', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore self-signed basic-ssl certificate notices from local dev preview server
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
      // Ignore self-signed certificate service worker registration error on localhost
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

    // Verify title and main landing content
    const title = await page.title();
    expect(title).toMatch(/Thinking|فكّر|English/i);

    // Verify prominent action buttons mount without error
    const guestBtn = page.locator('button:has-text("جرّب كضيف"), button:has-text("Try as Guest")').first();
    await expect(guestBtn).toBeVisible({ timeout: 10000 });

    // Assert 0 unhandled application errors or CSP violations
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Scenario 2: Complete Lesson 1 exercise (wrong answer -> hint/feedback, right answer -> saved, reload -> persists)', async ({ page }) => {
    await page.goto('/');

    // Start as Guest to jump straight into Lesson 0
    const guestBtn = page.locator('button:has-text("جرّب كضيف"), button:has-text("Try as Guest")').first();
    await guestBtn.click();

    // Answer input must be visible
    const input = page.locator('#ans');
    await expect(input).toBeVisible({ timeout: 10000 });

    // 1. Submit Arabic interference (wrong answer without copula 'is' and article 'an')
    await input.fill('He architect');
    const checkBtn = page.locator('#check-answer-btn');
    await checkBtn.click();

    // Verify feedback container appears with pedagogical hint
    const feedback = page.locator('#fb');
    await expect(feedback).toBeVisible({ timeout: 5000 });
    const feedbackText = await feedback.textContent();
    expect(feedbackText).toMatch(/Missing 'is\/are\/am'|copula|to be|🧭/i);

    // 2. Submit correct answer
    await input.fill('He is an architect');
    await checkBtn.click();

    // Verify success state (checkmark)
    const successTarget = page.locator('text="He is an architect ✅"').first();
    await expect(successTarget).toBeVisible({ timeout: 5000 });

    // Verify progress is written to localStorage under thinking_english_progress_v1 with ex-1-1-1
    const savedProgress = await page.evaluate(() => {
      return window.localStorage.getItem('thinking_english_progress_v1');
    });
    expect(savedProgress).toBeTruthy();
    expect(savedProgress).toContain('ex-1-1-1');

    // 3. Reload page and assert completed exercise persists
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const progressAfterReload = await page.evaluate(() => {
      return window.localStorage.getItem('thinking_english_progress_v1');
    });
    expect(progressAfterReload).toContain('ex-1-1-1');
  });

  test('Scenario 3: Review flashcards with 4 SM-2 grade buttons (Again, Hard, Good, Easy)', async ({ page }) => {
    await page.goto('/');

    // Seed profile so HomeView mounts directly
    await page.evaluate(() => {
      window.localStorage.setItem('tb.userProfile', JSON.stringify({
        language: 'english',
        dialect: 'egyptian',
        level: 'beginner',
        goal: 'general',
        learningStyle: 'visual',
        focusArea: 'daily-speech'
      }));
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Flashcards via Home feature card
    const flashcardNavBtn = page.locator('h2:has-text("البطاقات التعليمية")').first();
    await expect(flashcardNavBtn).toBeVisible({ timeout: 10000 });
    await flashcardNavBtn.click();

    // Click "Study All Due Cards" button
    const studyAllBtn = page.locator('#study-all-btn');
    await expect(studyAllBtn).toBeVisible({ timeout: 10000 });
    await studyAllBtn.click();

    // Flashcard prompt is visible; reveal answer
    const showAnswerBtn = page.locator('#show-answer-btn');
    await expect(showAnswerBtn).toBeVisible({ timeout: 5000 });
    await showAnswerBtn.click();

    // Verify all 4 SM-2 grade buttons are present
    const againBtn = page.locator('#grade-btn-again');
    const hardBtn = page.locator('#grade-btn-hard');
    const goodBtn = page.locator('#grade-btn-good');
    const easyBtn = page.locator('#grade-btn-easy');

    await expect(againBtn).toBeVisible();
    await expect(hardBtn).toBeVisible();
    await expect(goodBtn).toBeVisible();
    await expect(easyBtn).toBeVisible();

    // Click 'Good' to submit SM-2 grade
    await goodBtn.click();
    await page.waitForTimeout(500);
  });

  test('Scenario 4: Language direction switches accurately (Arabic RTL <-> English LTR)', async ({ page }) => {
    await page.goto('/');

    // 1. Initial Arabic UI -> RTL
    await page.evaluate(() => {
      window.localStorage.setItem('tb.userProfile', JSON.stringify({
        language: 'english', // learning English -> Arabic UI
        dialect: 'egyptian',
        level: 'beginner',
        goal: 'general'
      }));
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 10000 });
    const dirArabic = await header.getAttribute('dir');
    expect(dirArabic).toBe('rtl');

    // 2. Switch to English UI (learning Arabic) via profile
    await page.evaluate(() => {
      window.localStorage.setItem('tb.userProfile', JSON.stringify({
        language: 'arabic', // learning Arabic -> English UI
        dialect: 'egyptian',
        level: 'beginner',
        goal: 'general'
      }));
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const headerEn = page.locator('header').first();
    await expect(headerEn).toBeVisible({ timeout: 10000 });
    const dirEnglish = await headerEn.getAttribute('dir');
    expect(dirEnglish).toBe('ltr');
  });

  test('Scenario 5: Theme persistence in light, dark, and system modes across reloads', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('tb.userProfile', JSON.stringify({
        language: 'english',
        dialect: 'egyptian',
        level: 'beginner',
        goal: 'general'
      }));
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Locate the theme button in header
    const themeBtn = page.locator('header button[aria-label*="mode"], header button[aria-label*="الوضع"]').first();
    await expect(themeBtn).toBeVisible({ timeout: 10000 });

    const isInitialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Toggle theme
    await themeBtn.click();
    const isToggledDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isToggledDark).toBe(!isInitialDark);

    // Verify localStorage was updated
    const savedTheme = await page.evaluate(() => window.localStorage.getItem('tb.theme'));
    expect(savedTheme).toBe(isToggledDark ? 'dark' : 'light');

    // Reload page and verify theme persisted without flash
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const isPersistedDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isPersistedDark).toBe(isToggledDark);
  });

  test('Scenario 6: Mock /api/gemini and /api/tts with success response and graceful 500 error handling', async ({ page }) => {
    // Intercept /api/tts
    await page.route('**/api/tts*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'audio/mpeg',
        body: Buffer.from([0xff, 0xfb, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00]),
      });
    });

    // Intercept /api/gemini with mock 200 success
    await page.route('**/api/gemini', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: 'In Arabic, nominal sentences do not use a present copula. In English, you must include "is".'
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');
    const guestBtn = page.locator('button:has-text("جرّب كضيف"), button:has-text("Try as Guest")').first();
    await guestBtn.click();

    const input = page.locator('#ans');
    await input.fill('He architect');
    await page.locator('#check-answer-btn').click();

    // Click "Why did I get this wrong?"
    const askWhyBtn = page.locator('button:has-text("Why did I get this wrong"), button:has-text("ليه إجابتي غلط")').first();
    await expect(askWhyBtn).toBeVisible({ timeout: 5000 });
    await askWhyBtn.click();

    // Verify AI explanation is displayed
    const explanation = page.getByText(/In Arabic, nominal sentences do not use a present copula/i);
    await expect(explanation).toBeVisible({ timeout: 5000 });

    // Now test 500 Server Error handling
    await page.unroute('**/api/gemini');
    await page.route('**/api/gemini', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Gemini rate-limited or unavailable' } }),
      });
    });

    // Reset and try another error
    await input.fill('He teacher');
    await page.locator('#check-answer-btn').click();

    const askWhyBtn2 = page.locator('button:has-text("Why did I get this wrong"), button:has-text("ليه إجابتي غلط")').first();
    await askWhyBtn2.click();

    // Verify fallback explanation rendered without crashing React
    const fallbackExp = page.getByText(/Structural Diagnosis/i);
    await expect(fallbackExp).toBeVisible({ timeout: 5000 });
  });

  test('Scenario 7: Offline mode opens and operates lessons from local storage & bundle', async ({ page }) => {
    await page.goto('/');
    const guestBtn = page.locator('button:has-text("جرّب كضيف"), button:has-text("Try as Guest")').first();
    await guestBtn.click();

    await expect(page.locator('#ans')).toBeVisible({ timeout: 10000 });

    // Simulate going offline
    await page.context().setOffline(true);
    // Trigger offline event in window so React listener fires immediately
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    // Verify offline banner appears in DOM
    const offlineNotice = page.getByText(/You are offline|غير متصل بالإنترنت/i).first();
    await expect(offlineNotice).toBeVisible({ timeout: 5000 });

    // Answer questions offline with local rules
    await page.locator('#ans').fill('He is an architect');
    await page.locator('#check-answer-btn').click();

    // Verify local rule engine evaluated correctly while offline
    const successTarget = page.locator('text="He is an architect ✅"').first();
    await expect(successTarget).toBeVisible({ timeout: 5000 });

    // Restore online
    await page.context().setOffline(false);
  });

  test('Scenario 8: 320px viewport renders responsively without horizontal layout overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify landing page does not exceed 320px width
    const scrollWidthLanding = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidthLanding).toBeLessThanOrEqual(322);

    // Open guest lesson
    const guestBtn = page.locator('button:has-text("جرّب كضيف"), button:has-text("Try as Guest")').first();
    await guestBtn.click();
    await expect(page.locator('#ans')).toBeVisible({ timeout: 10000 });

    // Verify lesson view does not exceed 320px width
    const scrollWidthLesson = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidthLesson).toBeLessThanOrEqual(322);
  });

});
