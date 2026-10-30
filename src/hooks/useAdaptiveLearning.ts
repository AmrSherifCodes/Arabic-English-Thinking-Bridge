import { useCallback, useEffect, useState } from 'react';

export interface LearningStats {
  totalAnswers: number;
  correctAnswers: number;
  accuracyRate: number;
  consecutiveErrors: number;
}

const STORAGE_KEY = 'tb.learningStats';
const EMPTY_STATS: LearningStats = {
  totalAnswers: 0,
  correctAnswers: 0,
  accuracyRate: 0,
  consecutiveErrors: 0
};

function readLearningStats(): LearningStats {
  if (typeof window === 'undefined') return EMPTY_STATS;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_STATS;

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return EMPTY_STATS;
    const stats = parsed as Record<string, unknown>;
    const totalAnswers =
      typeof stats.totalAnswers === 'number' && Number.isSafeInteger(stats.totalAnswers)
        ? Math.max(0, stats.totalAnswers)
        : 0;
    const correctAnswers =
      typeof stats.correctAnswers === 'number' && Number.isSafeInteger(stats.correctAnswers)
        ? Math.min(totalAnswers, Math.max(0, stats.correctAnswers))
        : 0;
    const consecutiveErrors =
      typeof stats.consecutiveErrors === 'number' &&
      Number.isSafeInteger(stats.consecutiveErrors)
        ? Math.max(0, stats.consecutiveErrors)
        : 0;

    return {
      totalAnswers,
      correctAnswers,
      accuracyRate: totalAnswers ? correctAnswers / totalAnswers : 0,
      consecutiveErrors
    };
  } catch {
    return EMPTY_STATS;
  }
}

export function useAdaptiveLearning() {
  const [stats, setStats] = useState<LearningStats>(readLearningStats);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Unable to save adaptive learning stats.', error);
    }
  }, [stats]);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setStats(previous => {
      const totalAnswers = previous.totalAnswers + 1;
      const correctAnswers = previous.correctAnswers + Number(isCorrect);
      return {
        totalAnswers,
        correctAnswers,
        accuracyRate: correctAnswers / totalAnswers,
        consecutiveErrors: isCorrect ? 0 : previous.consecutiveErrors + 1
      };
    });
  }, []);

  return {
    ...stats,
    isStruggling: stats.consecutiveErrors >= 3,
    recordAnswer
  };
}
