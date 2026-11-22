/**
 * Pure state machine and helpers for the CV click progression:
 * - Clicks 1-2: Normal CV inspection
 * - Click 3+: Unlocks the smooth, repeatable CV Tap Game
 * - Click 110: Unlocks Developer Mode + All-Socials Auto-Poster
 * - Click 111: Unlocks the pure text Mu'tah poem (zero visuals)
 */

export const CV_GAME_START_CLICKS = 3;
export const CV_DEV_MODE_CLICKS = 110;
export const CV_POEM_CLICKS = 111;
export const DEV_MODE_STORAGE_KEY = 'tb.devMode';

export type CvClickPhase = 'normal' | 'game' | 'dev' | 'poem';

export interface CvClickTransition {
  count: number;
  phase: CvClickPhase;
  enteredGame: boolean;
  enteredDevMode: boolean;
  unlockedPoem: boolean;
  progressPercent: number;
  remainingForDev: number;
  milestone: string;
}

export function getCvGameMilestone(count: number): string {
  if (count >= CV_POEM_CLICKS) return '111! أَبْيَاتُ الثَّبَاتِ — Pure Poem Unlocked';
  if (count === CV_DEV_MODE_CLICKS) return '110! 🛠️ Developer Mode Unlocked — Tap once more for #111';
  if (count === 109) return '109 / 110 — ONE more click for Dev Mode!';
  if (count >= 100) return `${count} / 110 — Final Sprint!`;
  if (count >= 75) return `${count} / 110 — Turbo Mode`;
  if (count >= 50) return `${count} / 110 — Halfway to Dev Mode`;
  if (count >= 25) return `${count} / 110 — Building Momentum`;
  if (count >= 10) return `${count} / 110 — Warmup Complete`;
  if (count >= CV_GAME_START_CLICKS) return 'CV Tap Game Active — Reach 110 for Dev Mode!';
  return '';
}

export function advanceCvClickState(currentCount: number): CvClickTransition {
  const safeCurrent = Number.isFinite(currentCount) && currentCount > 0 ? Math.floor(currentCount) : 0;
  const count = safeCurrent + 1;

  let phase: CvClickPhase = 'normal';
  if (count >= CV_POEM_CLICKS) {
    phase = 'poem';
  } else if (count === CV_DEV_MODE_CLICKS) {
    phase = 'dev';
  } else if (count >= CV_GAME_START_CLICKS) {
    phase = 'game';
  }

  const remainingForDev = Math.max(0, CV_DEV_MODE_CLICKS - count);
  const progressPercent = Math.min(100, Math.round((Math.min(count, CV_DEV_MODE_CLICKS) / CV_DEV_MODE_CLICKS) * 100));

  return {
    count,
    phase,
    enteredGame: count === CV_GAME_START_CLICKS,
    enteredDevMode: count === CV_DEV_MODE_CLICKS,
    unlockedPoem: count === CV_POEM_CLICKS,
    progressPercent,
    remainingForDev,
    milestone: getCvGameMilestone(count),
  };
}

export function isDevModeEnabled(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDevModeEnabled(enabled: boolean): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (enabled) {
      window.localStorage.setItem(DEV_MODE_STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(DEV_MODE_STORAGE_KEY);
    }
    window.dispatchEvent(new Event('tb-dev-mode-change'));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}
