import { test, expect, Page } from '@playwright/test';

async function seedStorage(page: Page) {
  await page.addInitScript(() => {
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
    window.localStorage.setItem('tb.progressionState', JSON.stringify({
      xp: 100,
      streak: 1,
      completedLessonIds: [],
      currentLevelId: 'A1',
      currentPhaseId: 'A1.1'
    }));
    window.sessionStorage.setItem('tb.audioUnlocked', 'true');
  });
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
      await page.waitForSelector('button', { timeout: 10000 });

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
