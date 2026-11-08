import type { Page } from '@playwright/test';

export async function seedStorage(page: Page) {
  await page.addInitScript(() => {
    // 1. tb.activeProfileConfig (App.tsx line 354)
    const profile = {
      cefrLevel: 'A1',
      placedFrom: 'beginner',
      targetLang: 'en',
      sourceLang: 'ar',
      focusArea: 'general',
      diagnosticOrigin: 'beginner'
    };
    window.localStorage.setItem('tb.activeProfileConfig', JSON.stringify(profile));

    // 2. tb.progressionState (App.tsx line 158)
    const progression = {
      xp: 150,
      streak: 7,
      leagueOptOut: false,
      completedLessonIds: [],
      lessonCrowns: {},
      currentStage: 'A1',
      currentUnitId: 'a1-unit-1',
      shields: 2,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    window.localStorage.setItem('tb.progressionState', JSON.stringify(progression));

    // 3. hide download banner
    window.localStorage.setItem('hide_download_banner', 'true');
  });
}
