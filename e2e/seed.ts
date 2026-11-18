import type { Page } from '@playwright/test';

export async function seedStorage(page: Page) {
  await page.addInitScript(() => {
    // 1. tb.activeProfileConfig
    const profile = {
      cefrLevel: 'B2',
      placedFrom: 'intermediate-bridge',
      targetLang: 'en',
      sourceLang: 'ar',
      focusArea: 'general',
      diagnosticOrigin: 'intermediate'
    };
    window.localStorage.setItem('tb.activeProfileConfig', JSON.stringify(profile));

    // 2. tb.progressionState
    const progression = {
      xp: 1500,
      streak: 14,
      leagueOptOut: false,
      completedLessonIds: ['a0-l1', 'a0-l2', 'a0-l3', 'a1-l1'],
      lessonCrowns: {},
      currentStage: 'B2',
      currentUnitId: 'b2-unit-1',
      shields: 3,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    window.localStorage.setItem('tb.progressionState', JSON.stringify(progression));

    // 3. hide download banner, onboarding, and unlock audio
    window.localStorage.setItem('hide_download_banner', 'true');
    window.localStorage.setItem('tb.onboardingCompleted', 'true');
    window.sessionStorage.setItem('tb.audioUnlocked', 'true');
  });
}
