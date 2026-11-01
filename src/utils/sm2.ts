/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 *
 * Implements the canonical SuperMemo SM-2 algorithm:
 * - Ease Factor (EF) initialized to 2.5, minimum clamped to 1.3
 * - Quality score q in [0, 5]:
 *     EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * - Interval progression:
 *     I(1) = 1 day
 *     I(2) = 6 days
 *     I(n) = round(I(n-1) * EF)
 * - Repetition counts and lapse tracking
 * - 4-button UI grade mapping:
 *     0: Again (Forgot, q = 1) -> Lapse, reset repetitions, intraday review
 *     1: Hard (Tricky, q = 3) -> Pass with difficulty, EF decreases
 *     2: Good (Got it, q = 4) -> Normal recall, EF stays constant
 *     3: Easy (Simple, q = 5) -> Perfect recall, EF increases + bonus interval
 */

export type SM2Grade = 0 | 1 | 2 | 3;
export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2CardState {
  ease: number;
  int: number;
  reps: number;
  due?: number;
  nextReviewDate?: number;
  lapses?: number;
  lastReviewed?: number;
}

export interface SM2Result {
  ease: number;
  int: number;
  reps: number;
  due: number;
  nextReviewDate: number;
  lapses: number;
  lastReviewed: number;
}

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const TEN_MINUTES_MS = 10 * 60 * 1000;

/**
 * Maps 4-button Anki grade (0: Again, 1: Hard, 2: Good, 3: Easy)
 * to standard SuperMemo SM-2 quality rating (0-5).
 */
export function gradeToQuality(grade: SM2Grade): SM2Quality {
  switch (grade) {
    case 0:
      return 1; // Again / Forgot (failure, q < 3)
    case 1:
      return 3; // Hard / Tricky (pass with difficulty)
    case 2:
      return 4; // Good / Got it (pass with normal effort)
    case 3:
      return 5; // Easy / Simple (pass with perfect recall)
    default:
      return 4;
  }
}

/**
 * Maps standard SuperMemo quality (0-5) back to 4-button grade (0-3).
 */
export function qualityToGrade(quality: SM2Quality): SM2Grade {
  if (quality < 3) return 0;
  if (quality === 3) return 1;
  if (quality === 4) return 2;
  return 3;
}

/**
 * Calculates new Ease Factor using the canonical SM-2 formula:
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * Clamped to minimum 1.3.
 */
export function calculateEaseFactor(currentEase: number, quality: SM2Quality): number {
  const q = Math.max(0, Math.min(5, quality));
  const diff = 5 - q;
  const delta = 0.1 - diff * (0.08 + diff * 0.02);
  const nextEase = currentEase + delta;
  return Math.max(MIN_EASE, Math.round(nextEase * 100) / 100);
}

/**
 * Full SuperMemo SM-2 calculation.
 * Supports rating as either 4-grade (0..3) or SM-2 quality (0..5).
 */
export function calculateSM2(
  card: SM2CardState | undefined,
  rating: SM2Grade | SM2Quality,
  options: {
    now?: number;
    isStruggling?: boolean;
    isExplicitQuality?: boolean;
  } = {}
): SM2Result {
  const now = options.now ?? Date.now();
  const currentEase = typeof card?.ease === 'number' && card.ease >= MIN_EASE ? card.ease : DEFAULT_EASE;
  const currentInterval = typeof card?.int === 'number' && card.int >= 0 ? card.int : 0;
  const currentReps = typeof card?.reps === 'number' && card.reps >= 0 ? card.reps : 0;
  const currentLapses = typeof card?.lapses === 'number' && card.lapses >= 0 ? card.lapses : 0;

  // Determine quality score
  let quality: SM2Quality;
  let grade: SM2Grade;

  if (options.isExplicitQuality || (rating >= 4 && rating <= 5)) {
    quality = Math.max(0, Math.min(5, rating)) as SM2Quality;
    grade = qualityToGrade(quality);
  } else {
    grade = (Math.max(0, Math.min(3, rating)) as SM2Grade);
    quality = gradeToQuality(grade);
  }

  // Update ease factor
  const nextEase = calculateEaseFactor(currentEase, quality);

  let nextInterval: number;
  let nextReps: number;
  let nextLapses = currentLapses;
  let nextReviewDate: number;

  if (quality < 3) {
    // Lapse / Failure (Again)
    nextReps = 0;
    nextInterval = 0; // 0 days indicates intraday learning review
    nextLapses = currentLapses + 1;
    // Intraday retry: 10 seconds if struggling, otherwise 10 minutes
    const intradayDelay = options.isStruggling ? 10 * 1000 : TEN_MINUTES_MS;
    nextReviewDate = now + intradayDelay;
  } else {
    // Successful recall (Hard, Good, Easy)
    if (currentReps === 0) {
      // First successful repetition: I(1) = 1 day (or 4 days if Easy)
      nextInterval = grade === 3 ? 4 : 1;
      nextReps = 1;
    } else if (currentReps === 1) {
      // Second successful repetition: I(2) = 6 days (or 8 days if Easy)
      nextInterval = grade === 3 ? Math.round(6 * 1.3) : 6;
      nextReps = 2;
    } else {
      // Subsequent repetitions: I(n) = round(I(n-1) * EF)
      let calculatedInterval: number;
      if (grade === 1) {
        // Hard: conservative growth (1.2x or interval + 1)
        calculatedInterval = Math.max(currentInterval + 1, Math.round(currentInterval * 1.2));
      } else if (grade === 3) {
        // Easy: ease factor with 1.3x easy bonus
        calculatedInterval = Math.round(Math.max(currentInterval, 1) * nextEase * 1.3);
      } else {
        // Good: standard SM-2 formula
        calculatedInterval = Math.round(Math.max(currentInterval, 1) * nextEase);
      }
      nextInterval = Math.max(1, calculatedInterval);
      nextReps = currentReps + 1;
    }

    nextReviewDate = now + nextInterval * ONE_DAY_MS;
  }

  return {
    ease: nextEase,
    int: nextInterval,
    reps: nextReps,
    due: nextReviewDate,
    nextReviewDate,
    lapses: nextLapses,
    lastReviewed: now
  };
}

/**
 * Format interval into human-friendly string for UI buttons.
 * E.g. "<10m", "1d", "6d", "15d", "1m", "2m", "1y".
 */
export function formatSM2Interval(days: number, isStruggling = false): string {
  if (days <= 0) {
    return isStruggling ? '10s' : '<10m';
  }
  if (days === 1) {
    return '1d';
  }
  if (days < 30) {
    return `${days}d`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months}mo`;
  }
  const years = Math.round((days / 365) * 10) / 10;
  return `${years}y`;
}

/**
 * Compute the 4 preview interval strings for the review buttons:
 * [Again, Hard, Good, Easy]
 */
export function getCardIntervalPreviews(
  card: SM2CardState | undefined,
  isStruggling = false
): Record<SM2Grade, string> {
  const againResult = calculateSM2(card, 0, { isStruggling });
  const hardResult = calculateSM2(card, 1, { isStruggling });
  const goodResult = calculateSM2(card, 2, { isStruggling });
  const easyResult = calculateSM2(card, 3, { isStruggling });

  return {
    0: formatSM2Interval(againResult.int, isStruggling),
    1: formatSM2Interval(hardResult.int, isStruggling),
    2: formatSM2Interval(goodResult.int, isStruggling),
    3: formatSM2Interval(easyResult.int, isStruggling)
  };
}
