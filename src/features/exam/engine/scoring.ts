/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import { CEFR } from '../types';

export function estimateCEFR(answered: { level: number; correct: boolean }[]): CEFR {
  if (answered.length === 0) return 'A2';

  const recent = answered.slice(-8);
  // Weight correct answers double
  const weighted = recent.flatMap((a) => (a.correct ? [a.level, a.level] : [a.level]));
  weighted.sort((a, b) => a - b);

  const medianLevelIndex = weighted[Math.floor(weighted.length / 2)];
  const clampedIndex = Math.max(1, Math.min(5, medianLevelIndex));

  const cefrLevels: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  return cefrLevels[clampedIndex - 1];
}
