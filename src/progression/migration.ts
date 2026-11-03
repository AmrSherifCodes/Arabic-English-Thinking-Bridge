import { ProgressionState, SrsItemRecord } from './types';
import { createInitialProgressionState, calculatePlayerLevel, calculateSkillAxisLevel } from './engine';
import { loadUserProgress } from '../utils/storage';

/**
 * Migration function converting old localStorage data (tb.userProgress, tb.userProfile, tb.cardSchedules)
 * into the new ProgressionState with NO loss.
 */
export function migrateLegacyStorageToProgression(): ProgressionState {
  const initialState = createInitialProgressionState();

  try {
    // 1. Load legacy user progress if available
    const oldProgress = loadUserProgress();
    if (!oldProgress) return initialState;

    const xp = typeof oldProgress.score === 'number' ? Math.max(0, oldProgress.score) : 0;
    const streak = typeof oldProgress.streak === 'number' ? Math.max(0, oldProgress.streak) : 0;
    const streakShields =
      typeof oldProgress.streakShields === 'number' ? Math.max(0, oldProgress.streakShields) : 2;

    const completedLessonIds = Array.isArray(oldProgress.completedLessonIds)
      ? oldProgress.completedLessonIds
      : [];

    // Map completed lessons to crowns = 1
    const lessonCrowns: Record<string, number> = {};
    completedLessonIds.forEach((id) => {
      lessonCrowns[id] = 1;
    });

    // Calculate level based on XP
    const overallLevel = calculatePlayerLevel(xp);
    const skillLevel = calculateSkillAxisLevel(xp);

    // 2. Load legacy card schedules if available
    const srsItems: Record<string, SrsItemRecord> = {};
    try {
      const rawSchedules = localStorage.getItem('tb.cardSchedules');
      if (rawSchedules) {
        const parsedSchedules = JSON.parse(rawSchedules);
        if (typeof parsedSchedules === 'object' && parsedSchedules !== null) {
          Object.entries(parsedSchedules).forEach(([cardId, sched]: [string, any]) => {
            if (sched && typeof sched === 'object') {
              srsItems[cardId] = {
                id: cardId,
                term: cardId,
                sourceText: cardId,
                targetText: cardId,
                targetLang: 'en',
                stability: Number(sched.interval || 1.0),
                difficulty: Number(sched.easeFactor || 2.5),
                lapses: Number(sched.lapses || 0),
                reviews: Number(sched.repetitions || 1),
                lastReviewedAt: Number(sched.lastReviewed || Date.now()),
                dueAt: Number(sched.nextDue || Date.now()),
              };
            }
          });
        }
      }
    } catch {
      /* ignore parse error */
    }

    return {
      ...initialState,
      xp,
      overallLevel,
      streak,
      streakShields,
      completedLessonIds,
      lessonCrowns,
      skills: {
        structure: skillLevel,
        vocabulary: skillLevel,
        listening: Math.max(1, skillLevel - 1),
        speaking: Math.max(1, skillLevel - 1),
        writing: skillLevel,
      },
      srsItems,
    };
  } catch (err) {
    console.warn('[ProgressionMigration] Migration encountered an issue, returning safe fallback:', err);
    return initialState;
  }
}
