import { test, expect, Page } from '@playwright/test';

async function seedStorage(page: Page, options?: { keepSupporterPopupOpen?: boolean }) {
  const keepOpen = Boolean(options?.keepSupporterPopupOpen);
  await page.addInitScript((dismissSupporter) => {
    window.localStorage.setItem('tb.learner_mode', 'regular');
    window.localStorage.setItem('tb.learnerMode', 'regular');
    window.localStorage.setItem('tb.ui_mode', 'pro');
    window.localStorage.setItem('tb.uiMode', 'pro');
    window.localStorage.setItem('tb.onboardingComplete', 'true');
    window.localStorage.setItem('tb.onboardingCompleted', 'true');
    window.localStorage.setItem('tb.ageGateCompleted', 'true');
    window.localStorage.setItem('tb.ageTrack', 'street_starter');
    window.localStorage.setItem('tb.ageBand', '18-30');
    window.localStorage.setItem('hide_download_banner', 'true');
    if (dismissSupporter) {
      window.localStorage.setItem('tb.yt_nudge_dismissed_v1', 'true');
    } else if (!window.sessionStorage.getItem('__e2e_popup_unseeded')) {
      window.sessionStorage.setItem('__e2e_popup_unseeded', 'true');
      window.localStorage.removeItem('tb.yt_nudge_dismissed_v1');
      window.localStorage.removeItem('tb.yt_subscribed');
    }
    window.localStorage.setItem('tb.progressionState', JSON.stringify({
      xp: 100,
      streak: 1,
      completedLessonIds: [],
      currentLevelId: 'A1',
      currentPhaseId: 'A1.1'
    }));
    window.sessionStorage.setItem('tb.audioUnlocked', 'true');
  }, !keepOpen);
}

const viewports = [
  { name: 'Small Android', width: 360, height: 740 },
  { name: 'Modern iPhone', width: 390, height: 844 },
  { name: 'Desktop', width: 1280, height: 800 },
];

for (const vp of viewports) {
  test.describe(`Human UI Audit - ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test.beforeEach(async ({ page }) => {
      await seedStorage(page);
    });

    test('1. Zero crashes & zero horizontal overflow across screens', async ({ page }) => {
      const pageErrors: Error[] = [];
      const fatalConsoleErrors: string[] = [];

      page.on('pageerror', (err) => pageErrors.push(err));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (text.includes('TypeError') || text.includes('ReferenceError') || text.includes('Uncaught Error') || text.includes('Uncaught SyntaxError')) {
            fatalConsoleErrors.push(text);
          }
        }
      });

      // 1. Landing / Main screen
      await page.goto('/?app=true');
      await page.waitForLoadState('domcontentloaded');

      const isOverflowing = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(isOverflowing).toBe(false);

      expect(pageErrors.length).toBe(0);
      expect(fatalConsoleErrors.length).toBe(0);
    });

    test('2. Interactive UI Geometry & Touch Target Heights', async ({ page }) => {
      await page.goto('/?app=true');
      await page.locator('button:visible').first().waitFor({ state: 'visible', timeout: 10000 });

      // Check visible buttons on PathView/AppShell
      const buttons = await page.locator('button:visible').all();
      for (const btn of buttons) {
        const box = await btn.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          // Touch target height >= 24px minimum bounding box
          expect(box.height).toBeGreaterThanOrEqual(24);
          // Fits within viewport width
          expect(box.x).toBeGreaterThanOrEqual(-10);
          expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 10);
        }
      }
    });

    test('3. End-to-End Human Playthrough (Arabic -> English)', async ({ page }) => {
      await page.goto('/?app=true');

      // Click Hero Start Lesson CTA
      const startBtn = page.locator('button:has-text("ابدأ الدرس"), button:has-text("كمّل الدرس"), button:has-text("Start First"), button:has-text("Continue Next")').first();
      await expect(startBtn).toBeVisible({ timeout: 10000 });
      await startBtn.click();

      // Wait for LessonRunner Check Button
      const checkBtn = page.locator('button[aria-label*="تحقق"], button[aria-label*="Check"], button:has-text("تحقق"), button:has-text("Check")').first();
      await expect(checkBtn).toBeVisible({ timeout: 10000 });

      // Verify bottom CTA button is visible above fold
      const ctaBox = await checkBtn.boundingBox();
      expect(ctaBox).not.toBeNull();
      if (ctaBox) {
        expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(vp.height + 5);
      }

      // Tap word chips to assemble sentence
      const wordChips = page.locator('[data-testid="word-chip"]');
      const chipCount = await wordChips.count();
      expect(chipCount).toBeGreaterThan(0);

      // Verify word chips have text
      const firstChipText = await wordChips.first().innerText();
      expect(firstChipText.trim().length).toBeGreaterThan(0);

      // Tap chips
      for (let i = 0; i < Math.min(chipCount, 4); i++) {
        await wordChips.nth(i).click();
      }

      // Check answer (or press Enter if desktop)
      if (vp.width >= 1000) {
        await page.keyboard.press('Enter');
      } else {
        await checkBtn.click();
      }

      // Feedback card should appear
      const feedback = page.locator('text=/إجابة|Great Job|نظام|تعديل/i').first();
      await expect(feedback).toBeVisible({ timeout: 5000 });

      // Click Next
      const nextBtn = page.locator('button[aria-label*="السؤال التالي"], button[aria-label*="Next Question"], button:has-text("السؤال التالي"), button:has-text("Next Question")').first();
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
    });

    test('4. End-to-End Human Playthrough (Arabic -> German ar->de)', async ({ page }) => {
      await page.goto('/?app=true&from=arz&to=de');
      await page.waitForLoadState('domcontentloaded');

      // Open Lesson 1
      const startBtn = page.locator('button:has-text("ابدأ الدرس"), button:has-text("كمّل الدرس"), button:has-text("Start First"), button:has-text("Continue Next")').first();
      await expect(startBtn).toBeVisible({ timeout: 10000 });
      await startBtn.click();

      // Verify German sentence prompt is visible
      const checkBtn = page.locator('button[aria-label*="تحقق"], button[aria-label*="Check"], button:has-text("تحقق"), button:has-text("Check")').first();
      await expect(checkBtn).toBeVisible({ timeout: 10000 });

      // Tap German chips
      const wordChips = page.locator('[data-testid="word-chip"]');
      const chipCount = await wordChips.count();
      expect(chipCount).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(chipCount, 4); i++) {
        await wordChips.nth(i).click();
      }

      await checkBtn.click();

      // Feedback card
      const feedback = page.locator('text=/إجابة|Great Job|نظام|تعديل/i').first();
      await expect(feedback).toBeVisible({ timeout: 5000 });
    });

    test('5. End-to-End Human Playthrough (English -> Arabic en->ar)', async ({ page }) => {
      await page.goto('/?app=true&from=en&to=ar');
      await page.waitForLoadState('domcontentloaded');

      const startBtn = page.locator('button:has-text("Start First"), button:has-text("Continue Next"), button:has-text("ابدأ الدرس")').first();
      await expect(startBtn).toBeVisible({ timeout: 10000 });
      await startBtn.click();

      const checkBtn = page.locator('button[aria-label*="Check"], button[aria-label*="تحقق"], button:has-text("Check"), button:has-text("تحقق")').first();
      await expect(checkBtn).toBeVisible({ timeout: 10000 });
    });
  });
}

test.describe('v5.0.0 Official Stable Self-Scan & Regression Fixes', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('A. Bright default UI + one-time dismissible YouTube popup with big X button', async ({ page }) => {
    await seedStorage(page, { keepSupporterPopupOpen: true });
    await page.goto('/?app=true');
    await page.waitForLoadState('domcontentloaded');

    // UI must be crisp and bright (never dimmed/sad)
    const brightCheck = await page.evaluate(() => ({
      hasSadClass: document.documentElement.classList.contains('tb-sad-mode'),
      filter: window.getComputedStyle(document.documentElement).filter,
    }));
    expect(brightCheck.hasSadClass).toBe(false);
    expect(brightCheck.filter).toBe('none');

    // Friendly one-time popup must be visible with exact copy and big X
    const closeX = page.getByTestId('yt-popup-close-x');
    const subscribeBtn = page.getByTestId('yt-popup-subscribe-btn');
    const promiseBtn = page.getByTestId('yt-popup-promise-btn');

    await expect(closeX).toBeVisible({ timeout: 10000 });
    await expect(subscribeBtn).toBeVisible();
    await expect(promiseBtn).toBeVisible();
    await expect(page.locator('text=عايز التطبيق ينوّر ويكمل مجاناً؟')).toBeVisible();
    await expect(page.locator('text=@sciamrsherif').first()).toBeVisible();

    const closeBox = await closeX.boundingBox();
    expect(closeBox).not.toBeNull();
    if (closeBox) {
      expect(closeBox.width).toBeGreaterThanOrEqual(44);
      expect(closeBox.height).toBeGreaterThanOrEqual(44);
    }

    // Dismiss via big X and ensure permanent persistence across reload
    await closeX.click();
    await expect(closeX).toHaveCount(0);
    expect(await page.evaluate(() => window.localStorage.getItem('tb.yt_nudge_dismissed_v1'))).toBe('true');

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('yt-popup-close-x')).toHaveCount(0);
  });

  test('B. Hard-mode "Hello, how are you?" word bank completeness + unclipped non-leaking banner', async ({ page }) => {
    await seedStorage(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('tb.cognitiveProfile', JSON.stringify({
        difficultyLevel: 'Hard',
        difficultyScore: 95,
        streak: 5,
        speedScore: 95,
        accuracyScore: 98,
      }));
    });

    await page.goto('/?app=true');
    const startBtn = page.locator('button:has-text("ابدأ الدرس"), button:has-text("كمّل الدرس"), button:has-text("Start First")').first();
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    await expect(page.getByTestId('unlimited-hearts-badge')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('toggle-input-mode')).toBeVisible();

    // Locate "أهلاً، إزيك؟" (Lesson 1 exercises are shuffled at launch)
    let foundHelloExercise = false;
    for (let step = 0; step < 8; step++) {
      const targetPrompt = page.locator('text=أهلاً، إزيك؟').first();
      if (await targetPrompt.isVisible().catch(() => false)) {
        foundHelloExercise = true;
        break;
      }
      const chips = page.locator('[data-testid="word-chip"]');
      if ((await chips.count()) > 0) {
        await chips.first().click();
      }
      const checkBtn = page.locator('button[aria-label*="تحقق"], button:has-text("تحقق"), button:has-text("Check")').first();
      await checkBtn.click();
      const nextBtn = page.locator('button[aria-label*="السؤال التالي"], button:has-text("السؤال التالي"), button:has-text("Next Question")').first();
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click();
      } else {
        break;
      }
    }
    expect(foundHelloExercise).toBe(true);

    // 1. Check top illustration banner BEFORE answering: must load, be unclipped, and NOT leak target sentence
    const bannerImg = page.locator('img[alt*="Visual illustration"]').first();
    await expect(bannerImg).toBeVisible({ timeout: 5000 });
    const preBannerMeta = await bannerImg.evaluate((el) => {
      const img = el as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      const rawSrc = img.getAttribute('src') || '';
      const decodedSvg = rawSrc.includes(',') ? decodeURIComponent(rawSrc.split(',').slice(1).join(',')) : rawSrc;
      return {
        naturalWidth: img.naturalWidth,
        width: rect.width,
        height: rect.height,
        decodedSvg,
      };
    });
    expect(preBannerMeta.naturalWidth).toBeGreaterThan(0);
    expect(preBannerMeta.height).toBeGreaterThanOrEqual(120);
    expect(preBannerMeta.decodedSvg).toContain('width="400"');
    expect(preBannerMeta.decodedSvg).toContain('height="220"');
    expect(preBannerMeta.decodedSvg).toContain('viewBox="0 0 400 220"');
    expect(preBannerMeta.decodedSvg).not.toContain('Hello, how are you?');

    // 2. Verify every required token for "Hello, how are you?" is present even in Hard mode
    for (const token of ['Hello', 'how', 'are', 'you']) {
      const chip = page.locator(`[data-testid="word-chip"][data-word="${token}"]`).first();
      await expect(chip).toBeVisible();
      await chip.click();
    }

    const checkBtn = page.locator('button[aria-label*="تحقق"], button:has-text("تحقق"), button:has-text("Check")').first();
    await checkBtn.click();

    const feedback = page.locator('text=/إجابة ممتازة|إجابة صحيحة|عاش|Great Job|ممتاز/i').first();
    await expect(feedback).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('sentence-map')).toBeVisible();

    // Post-answer banner still remains unclipped 400x220
    const postBox = await bannerImg.boundingBox();
    expect(postBox).not.toBeNull();
    if (postBox) {
      expect(postBox.height).toBeGreaterThanOrEqual(120);
    }
  });

  test('C. Full Route, Modal & Pair Self-Scan (/, /app, /exam, Practice Views, Preferences, Support Modal, ar->de, ar->tr)', async ({ page }) => {
    await seedStorage(page);
    const pageErrors: string[] = [];
    const fatalConsoleErrors: string[] = [];

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('TypeError') || text.includes('ReferenceError') || text.includes('Uncaught')) {
          fatalConsoleErrors.push(text);
        }
      }
    });

    const assertNoOverflow = async () => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
    };

    // 1. Landing /
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=5.0.0').first()).toBeVisible({ timeout: 10000 });
    await assertNoOverflow();

    // 2. Exam /exam
    await page.goto('/exam');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('button').first()).toBeVisible({ timeout: 10000 });
    await assertNoOverflow();

    // 3. App /app + Support Modal + PayPal QR image
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    await assertNoOverflow();

    const supportBtn = page.locator('button:has-text("ادعم التطبيق")').first();
    await expect(supportBtn).toBeVisible({ timeout: 10000 });
    await supportBtn.click();

    const paypalQr = page.locator('img[src*="paypal-qr.png"]').first();
    await expect(paypalQr).toBeVisible({ timeout: 5000 });
    const qrWidth = await paypalQr.evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(qrWidth).toBeGreaterThan(0);
    await page.keyboard.press('Escape').catch(() => {});
    const closeSupportBtn = page.locator('button[aria-label*="إغلاق"], button:has-text("✕"), button:has-text("إغلاق")').first();
    if (await closeSupportBtn.isVisible().catch(() => false)) {
      await closeSupportBtn.click();
    }

    // 4. Practice Hub sub-views: Dictionary, Flashcards, Local Recorder
    const openPracticeTab = async () => {
      await page.goto('/?app=true');
      const practiceTab = page.locator('button:has-text("التدريب")').first();
      await expect(practiceTab).toBeVisible({ timeout: 10000 });
      await practiceTab.click();
    };

    await openPracticeTab();
    await page.locator('text=القاموس الذكي التفاعلي').first().click();
    await page.waitForTimeout(300);
    await assertNoOverflow();

    await openPracticeTab();
    await page.locator('text=المراجعة الذكية اليومية').first().click();
    await page.waitForTimeout(300);
    await assertNoOverflow();

    await openPracticeTab();
    await page.locator('text=مُسجّل النطق المحلّي').first().click();
    await page.waitForTimeout(300);
    await assertNoOverflow();

    // 5. Profile -> Preferences
    await page.goto('/?app=true');
    const profileTab = page.locator('button:has-text("الملف")').first();
    await expect(profileTab).toBeVisible({ timeout: 10000 });
    await profileTab.click();
    const prefsBtn = page.locator('button:has-text("الإعدادات")').first();
    await expect(prefsBtn).toBeVisible({ timeout: 5000 });
    await prefsBtn.click();
    await page.waitForTimeout(300);
    await assertNoOverflow();

    // 6. Language pairs ar->de and ar->tr
    for (const pairUrl of ['/?app=true&from=arz&to=de', '/?app=true&from=arz&to=tr']) {
      await page.goto(pairUrl);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('button:has-text("ابدأ الدرس"), button:has-text("كمّل الدرس")').first()).toBeVisible({ timeout: 10000 });
      await assertNoOverflow();
    }

    expect(pageErrors).toEqual([]);
    expect(fatalConsoleErrors).toEqual([]);
  });

  test('D. Offline Mistake Diff, Sentence Map, Advantage Strip & Mistake Repair Queue', async ({ page }) => {
    await seedStorage(page);
    await page.goto('/?app=true');
    await expect(page.getByTestId('path-advantage-strip')).toBeVisible({ timeout: 10000 });

    const startBtn = page.locator('button:has-text("ابدأ الدرس"), button:has-text("كمّل الدرس"), button:has-text("Start First")').first();
    await startBtn.click();

    // Submit only a single chip to guarantee a mismatch and verify offline diff + retry re-queue
    const firstChip = page.locator('[data-testid="word-chip"]').first();
    await expect(firstChip).toBeVisible({ timeout: 10000 });
    await firstChip.click();

    const checkBtn = page.locator('button[aria-label*="تحقق"], button:has-text("تحقق"), button:has-text("Check")').first();
    await checkBtn.click();

    await expect(page.getByTestId('mistake-diff')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('sentence-map')).toBeVisible();

    // Step forward until the queued Mistake Repair badge appears
    let sawRepairBadge = false;
    for (let step = 0; step < 8; step++) {
      const nextBtn = page.locator('button[aria-label*="السؤال التالي"], button:has-text("السؤال التالي"), button:has-text("Next Question")').first();
      if (!(await nextBtn.isVisible({ timeout: 2000 }).catch(() => false))) break;
      await nextBtn.click();

      if (await page.getByTestId('mistake-repair-badge').isVisible().catch(() => false)) {
        sawRepairBadge = true;
        break;
      }

      const chip = page.locator('[data-testid="word-chip"]').first();
      if (await chip.isVisible().catch(() => false)) {
        await chip.click();
      }
      if (await checkBtn.isVisible().catch(() => false)) {
        await checkBtn.click();
      }
    }
    expect(sawRepairBadge).toBe(true);
  });

  test('E. CV Click Flow (1-2 normal, 3 tap game, 110 Dev Mode + All-Socials Auto-Poster, 111 pure text Poem)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const openCvBtn = page.locator('button:has-text("السيرة الذاتية (CV)")').first();
    await openCvBtn.scrollIntoViewIfNeeded();
    await expect(openCvBtn).toBeVisible({ timeout: 10000 });
    await openCvBtn.click();

    const cvSurface = page.getByTestId('cv-click-surface');
    await expect(cvSurface).toBeVisible({ timeout: 5000 });

    // Clicks 1-2 stay normal without revealing the game
    await cvSurface.click();
    await cvSurface.click();
    await expect(page.getByTestId('cv-tap-game')).toHaveCount(0);

    // Click 3 activates the repeatable tap game
    await cvSurface.click();
    await expect(page.getByTestId('cv-tap-game')).toBeVisible();
    const tapBtn = page.getByTestId('cv-game-tap-btn');
    await expect(tapBtn).toBeVisible();

    // Reach 110 cleanly without lag (clicks 4..110 = 107 clicks)
    for (let i = 0; i < 107; i++) {
      await tapBtn.click();
    }

    const devModal = page.getByTestId('dev-mode-modal');
    await expect(devModal).toBeVisible({ timeout: 5000 });
    await expect(devModal.locator('a[href*="x.com/intent/tweet"]')).toBeVisible();
    expect(await page.evaluate(() => window.localStorage.getItem('tb.devMode'))).toBe('true');

    // Click #111 transitions straight to the visuals-free pure text poem
    await page.getByTestId('dev-to-poem-btn').click();
    const poemModal = page.getByTestId('mutah-poem-modal');
    await expect(poemModal).toBeVisible({ timeout: 5000 });
    await expect(poemModal).toContainText('أَقْسَمْتُ يَا نَفْسُ لَتَنْزِلِنَّهْ');
    await expect(poemModal.locator('svg')).toHaveCount(0);
  });
});

