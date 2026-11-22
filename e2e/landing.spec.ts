import { test, expect } from '@playwright/test';

test('landing page renders correctly and has proper sections', async ({ page }) => {
  await page.goto('/');

  // Main heading is visible
  await expect(page.locator('h1').first()).toBeVisible();

  // Start CTA button is present and visible
  const startBtn = page.getByRole('button', { name: /ابدأ رحلتك مجاناً|ابدأ دلوقتي|Start your journey for free/ }).first();
  await expect(startBtn).toBeVisible();
});

test.describe('Landing Page mobile layout & navigation regressions', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('renders cleanly on mobile 360x740 without overflow, sticks header on scroll, switches AR/EN, and syncs / <-> /app URLs', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('tb.ageGateCompleted', 'true');
      window.localStorage.setItem('tb.onboardingComplete', 'true');
      window.localStorage.setItem('tb.learner_mode', 'regular');
      window.localStorage.setItem('tb.yt_nudge_dismissed_v1', 'true');
      window.localStorage.setItem('tb.progressionState', JSON.stringify({
        xp: 0,
        streak: 0,
        completedLessonIds: [],
        currentStage: 'A0',
      }));
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // No orphaned static fallback sections outside #root
    const extraBodyChildren = await page.evaluate(() =>
      Array.from(document.body.children)
        .filter((el) => el.id !== 'root' && el.tagName !== 'SCRIPT')
        .map((el) => `${el.tagName}.${el.className}`)
    );
    expect(extraBodyChildren).toEqual([]);

    // Positive gap between sticky navbar and first hero badge, and primary hero CTA above fold
    const heroGeometry = await page.evaluate(() => {
      const nav = document.querySelector('.egyptian-landing .nav')?.getBoundingClientRect();
      const badge = document.querySelector('.egyptian-landing .hero-badge')?.getBoundingClientRect();
      const cta = document.querySelector('.egyptian-landing .hero-cta .btn-gold')?.getBoundingClientRect();
      return {
        gapBelowNav: nav && badge ? badge.top - nav.bottom : -1,
        ctaBottom: cta ? cta.bottom : 9999,
        vh: window.innerHeight,
      };
    });
    expect(heroGeometry.gapBelowNav).toBeGreaterThanOrEqual(12);
    expect(heroGeometry.ctaBottom).toBeLessThanOrEqual(heroGeometry.vh);

    // Helper asserting zero horizontal overflow across interactive elements & cards
    const assertNoMobileOverflow = async () => {
      const overflowing = await page.evaluate(() => {
        const vw = window.innerWidth;
        const hits: string[] = [];
        document
          .querySelectorAll('.egyptian-landing header *, .egyptian-landing a, .egyptian-landing button, .egyptian-landing .download-card, .egyptian-landing .feature-card, .egyptian-landing .step, .egyptian-landing input')
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && (r.left < -1 || r.right > vw + 1)) {
              hits.push(`${el.tagName}:${(el.textContent || '').trim().slice(0, 30)} (${Math.round(r.left)}..${Math.round(r.right)})`);
            }
          });
        return hits;
      });
      expect(overflowing).toEqual([]);
    };

    await assertNoMobileOverflow();

    // Sticky header remains pinned at top on scroll
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(150);
    const navTopAfterScroll = await page.evaluate(
      () => document.querySelector('.egyptian-landing .nav')?.getBoundingClientRect().top ?? -999
    );
    expect(navTopAfterScroll).toBeGreaterThanOrEqual(-1);
    expect(navTopAfterScroll).toBeLessThanOrEqual(2);

    // Mobile language toggle is visible and switches AR <-> EN cleanly without overflow
    await page.evaluate(() => window.scrollTo(0, 0));
    const langBtn = page.locator('.egyptian-landing header button').nth(1);
    await expect(langBtn).toBeVisible();
    await langBtn.click();
    await expect(page.locator('.egyptian-landing')).toHaveAttribute('dir', 'ltr');
    await assertNoMobileOverflow();

    // Switch back to Arabic and launch app -> /app -> return home -> /
    await langBtn.click();
    await expect(page.locator('.egyptian-landing')).toHaveAttribute('dir', 'rtl');

    await page.locator('.egyptian-landing header button.btn-primary').click();
    await expect(page).toHaveURL(/\/app/);

    const homeBtn = page.locator('header button:has-text("الرئيسية"), header button:has-text("Home")').first();
    await expect(homeBtn).toBeVisible({ timeout: 10000 });
    await homeBtn.click();
    await expect(page).toHaveURL(/\/(\?lang=(ar|en))?$/);
    await expect(page.locator('.egyptian-landing')).toBeVisible();
  });
});
