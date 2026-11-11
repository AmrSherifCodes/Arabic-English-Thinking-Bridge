import { LearnerState, ErrorType } from './types';
export { selectNext } from './selectNext';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

export function getUserCefrLevel(): string {
  if (typeof localStorage === 'undefined') return 'A1';
  try {
    const raw = localStorage.getItem('tb.activeProfileConfig');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.cefrLevel || parsed.estimated_level)) {
        return String(parsed.cefrLevel || parsed.estimated_level).toUpperCase();
      }
    }
  } catch {
    // Fallback
  }
  return 'A1';
}

export function createInitialLearnerState(conceptId: string): LearnerState {
  return {
    concept_id: conceptId,
    mastery: 0.0,
    ease: 2.5,
    interval: 0,
    next_due: 0,
    error_signature: {
      copula_omitted: 0,
      article_missing: 0,
      article_spurious: 0,
      aspect_confused: 0,
      pronoun_dropped: 0,
      word_order_vso: 0,
      plural_irregular: 0,
      preposition_transfer: 0
    }
  };
}

export function updateSrs(
  current: LearnerState,
  isCorrect: boolean,
  detectedError: ErrorType | null = null,
  now: number = Date.now()
): LearnerState {
  const updatedErrors = { ...current.error_signature };
  if (detectedError && detectedError in updatedErrors) {
    updatedErrors[detectedError] = (updatedErrors[detectedError] || 0) + 1;
  }

  if (isCorrect) {
    const nextEase = Math.round((current.ease + 0.1) * 100) / 100;
    const baseInterval = current.interval <= 0 ? 1 : current.interval;
    const nextInterval = current.interval <= 0 ? 1 : Math.max(1, Math.round(baseInterval * nextEase));
    const nextMastery = Math.min(1.0, Math.round((current.mastery + 0.15) * 100) / 100);
    const nextDue = now + nextInterval * ONE_DAY_MS;

    return {
      ...current,
      ease: nextEase,
      interval: nextInterval,
      mastery: nextMastery,
      next_due: nextDue,
      error_signature: updatedErrors
    };
  } else {
    const nextEase = Math.max(MIN_EASE, Math.round((current.ease - 0.2) * 100) / 100);
    const nextInterval = 1;
    const nextMastery = Math.max(0.0, Math.round((current.mastery - 0.15) * 100) / 100);
    const nextDue = now + nextInterval * ONE_DAY_MS;

    return {
      ...current,
      ease: nextEase,
      interval: nextInterval,
      mastery: nextMastery,
      next_due: nextDue,
      error_signature: updatedErrors
    };
  }
}
