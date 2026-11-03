import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function runLiveAudit() {
  console.log('🚀 Starting Comprehensive Live Audit for https://tb-eg.vercel.app ...');

  const consoleLogs = [];
  const networkFailures = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ar-EG',
  });

  const page = await context.newPage();

  // Listen to console events
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text, location: msg.location() });
  });

  // Listen to failed network requests
  page.on('response', (res) => {
    if (res.status() >= 400) {
      networkFailures.push({
        url: res.url(),
        status: res.status(),
        statusText: res.statusText(),
      });
    }
  });

  // -------------------------------------------------------------
  // PHASE 1: Discovery & Baseline
  // -------------------------------------------------------------
  console.log('📸 Phase 1: Navigating to https://tb-eg.vercel.app ...');
  await page.goto('https://tb-eg.vercel.app', { waitUntil: 'networkidle' });

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01_desktop_landing.png'), fullPage: true });

  const pageTitle = await page.title();
  const metaDescription = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content')).catch(() => 'N/A');
  const ogTitle = await page.$eval('meta[property="og:title"]', (el) => el.getAttribute('content')).catch(() => 'N/A');
  const ogDesc = await page.$eval('meta[property="og:description"]', (el) => el.getAttribute('content')).catch(() => 'N/A');

  // Performance Timing
  const navTiming = await page.evaluate(() => {
    const [timing] = performance.getEntriesByType('navigation');
    if (!timing) return null;
    return {
      ttfbMs: Math.round(timing.responseStart - timing.requestStart),
      domContentLoadedMs: Math.round(timing.domContentLoadedEventEnd - timing.startTime),
      loadEventMs: Math.round(timing.loadEventEnd - timing.startTime),
    };
  });

  console.log(`Title: ${pageTitle}`);
  console.log(`Description: ${metaDescription}`);
  console.log(`Navigation Timing:`, navTiming);

  // -------------------------------------------------------------
  // PHASE 2: Core User Flow Simulation
  // -------------------------------------------------------------
  console.log('🔄 Phase 2: Testing Onboarding & Lesson Flow ...');

  const onboardingVisible = await page.isVisible('text="إعداد الحساب المجاني"').catch(() => false);
  console.log(`Onboarding Modal Visible: ${onboardingVisible}`);

  if (onboardingVisible) {
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02_onboarding_step0.png') });

    // Step 0 -> Step 1
    const nextBtn1 = page.locator('button:has-text("التالي"), button:has-text("Next")').first();
    if (await nextBtn1.isVisible()) {
      await nextBtn1.scrollIntoViewIfNeeded().catch(() => {});
      await nextBtn1.click({ force: true });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03_onboarding_step1.png') });
    }

    // Step 1 -> Step 2
    const nextBtn2 = page.locator('button:has-text("التالي"), button:has-text("Next")').first();
    if (await nextBtn2.isVisible()) {
      await nextBtn2.scrollIntoViewIfNeeded().catch(() => {});
      await nextBtn2.click({ force: true });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04_onboarding_step2.png') });
    }

    // Step 2 -> Step 3
    const nextBtn3 = page.locator('button:has-text("التالي"), button:has-text("Next")').first();
    if (await nextBtn3.isVisible()) {
      await nextBtn3.scrollIntoViewIfNeeded().catch(() => {});
      await nextBtn3.click({ force: true });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05_onboarding_step3.png') });
    }

    // Complete Onboarding
    const startBtn = page.locator('button:has-text("البدء من الصفر"), button:has-text("عندي خلفية")').first();
    if (await startBtn.isVisible()) {
      await startBtn.scrollIntoViewIfNeeded().catch(() => {});
      await startBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }
  }

  // Path View
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06_path_view_desktop.png'), fullPage: true });

  // Try opening a lesson
  const firstLessonBtn = page.locator('button:has-text("صلة الموصول"), button:has-text("الدرس الأول"), button:has-text("الأنماط")').first();
  if (await firstLessonBtn.isVisible()) {
    await firstLessonBtn.scrollIntoViewIfNeeded().catch(() => {});
    await firstLessonBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07_lesson_runner.png') });
  }

  // -------------------------------------------------------------
  // PHASE 3: Mobile Viewport Audit (375px & 390px)
  // -------------------------------------------------------------
  console.log('📱 Phase 3: Testing Mobile Viewports (375px & 390px) ...');

  // iPhone SE (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '08_mobile_375.png'), fullPage: true });

  const hasHScroll375 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`375px Horizontal Scroll Overflow: ${hasHScroll375}`);

  // iPhone 12/13/14 (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '09_mobile_390.png'), fullPage: true });

  const hasHScroll390 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`390px Horizontal Scroll Overflow: ${hasHScroll390}`);

  // -------------------------------------------------------------
  // PHASE 4 & 5: Save Diagnostics & Compile Summary
  // -------------------------------------------------------------
  await browser.close();

  const auditData = {
    pageTitle,
    metaDescription,
    ogTitle,
    ogDesc,
    navTiming,
    hasHScroll375,
    hasHScroll390,
    consoleLogs,
    networkFailures,
  };

  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'audit_data.json'), JSON.stringify(auditData, null, 2));

  console.log('✅ Live Audit Completed Successfully!');
}

runLiveAudit().catch((err) => {
  console.error('Audit Script Error:', err);
  process.exit(1);
});
