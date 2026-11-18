/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

export function nextQuestionLevel(
  currentLevel: number,
  wasCorrect: boolean,
  consecutiveCorrect: number
): number {
  const levels = [1, 2, 3, 4, 5]; // A1=1, A2=2, B1=3, B2=4, C1=5
  let idx = levels.indexOf(currentLevel);
  if (idx === -1) idx = 1; // Default A2

  if (wasCorrect) {
    if (consecutiveCorrect >= 2 || Math.random() > 0.5) {
      idx = Math.min(idx + 1, levels.length - 1);
    }
  } else {
    idx = Math.max(idx - 1, 0);
  }
  return levels[idx];
}
