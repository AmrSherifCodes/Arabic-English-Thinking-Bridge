import { SrsItemRecord } from './types';
import { TargetLanguage } from '../types';
import { getUserCefrLevel } from '../brain/srs';

export type SrsRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

/**
 * Calculates next SRS state using FSRS/SM-2 hybrid principles.
 * Handles retention, stability, difficulty decay, and due date calculation.
 */
export function calculateNextSrsState(
  item: SrsItemRecord,
  rating: SrsRating,
  nowTimestamp: number = Date.now()
): SrsItemRecord {
  let { stability, difficulty, lapses, reviews } = item;

  // Initial defaults
  if (stability <= 0) stability = 1.0;
  if (difficulty <= 0) difficulty = 5.0;

  let newStability = stability;
  let newDifficulty = difficulty;
  let newLapses = lapses;
  const newReviews = reviews + 1;

  if (rating === 1) {
    // Again / Miss
    newLapses += 1;
    newDifficulty = Math.min(10, difficulty + 0.8);
    newStability = Math.max(0.2, stability * 0.4); // Drop stability on lapse
  } else if (rating === 2) {
    // Hard
    newDifficulty = Math.min(10, difficulty + 0.3);
    newStability = stability * 1.2;
  } else if (rating === 3) {
    // Good
    newDifficulty = Math.max(1, difficulty - 0.1);
    const difficultyFactor = Math.max(1.1, 2.5 - (difficulty - 5) * 0.15);
    newStability = stability * difficultyFactor;
  } else if (rating === 4) {
    // Easy
    newDifficulty = Math.max(1, difficulty - 0.4);
    const difficultyFactor = Math.max(1.3, 2.8 - (difficulty - 5) * 0.15);
    newStability = stability * difficultyFactor * 1.3;
  }

  // Calculate next due timestamp in days
  const intervalDays = rating === 1 ? 0.1 : Math.max(1, Math.round(newStability));
  const dueAt = nowTimestamp + intervalDays * 24 * 60 * 60 * 1000;

  return {
    ...item,
    stability: Number(newStability.toFixed(2)),
    difficulty: Number(newDifficulty.toFixed(2)),
    lapses: newLapses,
    reviews: newReviews,
    lastReviewedAt: nowTimestamp,
    dueAt,
  };
}

/**
 * Filter and cap daily SRS reviews by user CEFR level so reviews match their proficiency level.
 */
export function getDueSrsQueue(
  items: Record<string, SrsItemRecord>,
  dailyCap: number = 30,
  targetLang?: TargetLanguage,
  nowTimestamp: number = Date.now(),
  userLevel?: string
): SrsItemRecord[] {
  const allList = Object.values(items);
  const activeLevel = (userLevel || getUserCefrLevel()).toUpperCase();

  const dueList = allList.filter((item) => {
    if (targetLang && item.targetLang !== targetLang) return false;
    if (item.level && item.level.toUpperCase() !== activeLevel) return false;
    return item.dueAt <= nowTimestamp;
  });

  // Sort by priority: highest lapses & lowest stability first
  dueList.sort((a, b) => {
    if (b.lapses !== a.lapses) return b.lapses - a.lapses;
    return a.stability - b.stability;
  });

  return dueList.slice(0, dailyCap);
}
