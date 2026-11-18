import { UserProgress } from '../types';

/**
 * Dynamically detects the user's CEFR level by analyzing their actual
 * lesson progression, streak, and XP, ignoring static self-reported values.
 */
export function detectDynamicCefrLevel(progress?: UserProgress | null): string {
  if (!progress) return 'A0';

  const xp = progress.score || 0;
  const streak = progress.streak || 0;

  // Calculate a baseline score using total XP and current daily consistency (streak)
  // 1 Lesson = ~10-30 XP
  if (xp > 3000 && streak > 14) return 'C1';
  if (xp > 1500 && streak > 7) return 'B2';
  if (xp > 800) return 'B1';
  if (xp > 300) return 'A2';
  if (xp > 100) return 'A1';

  return 'A0';
}
