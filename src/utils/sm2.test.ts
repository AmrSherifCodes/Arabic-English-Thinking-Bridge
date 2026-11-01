import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEaseFactor,
  calculateSM2,
  formatSM2Interval,
  getCardIntervalPreviews,
  gradeToQuality,
  qualityToGrade,
  MIN_EASE,
  DEFAULT_EASE,
  ONE_DAY_MS,
  TEN_MINUTES_MS
} from './sm2';

test('gradeToQuality and qualityToGrade bidirectional mappings are accurate', () => {
  assert.equal(gradeToQuality(0), 1);
  assert.equal(gradeToQuality(1), 3);
  assert.equal(gradeToQuality(2), 4);
  assert.equal(gradeToQuality(3), 5);

  assert.equal(qualityToGrade(0), 0);
  assert.equal(qualityToGrade(1), 0);
  assert.equal(qualityToGrade(2), 0);
  assert.equal(qualityToGrade(3), 1);
  assert.equal(qualityToGrade(4), 2);
  assert.equal(qualityToGrade(5), 3);
});

test('calculateEaseFactor implements canonical SM-2 formula', () => {
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // For q=5: delta = +0.10 => 2.5 + 0.1 = 2.6
  assert.equal(calculateEaseFactor(2.5, 5), 2.6);

  // For q=4: delta = 0.00 => 2.5 + 0.0 = 2.5
  assert.equal(calculateEaseFactor(2.5, 4), 2.5);

  // For q=3: delta = -0.14 => 2.5 - 0.14 = 2.36
  assert.equal(calculateEaseFactor(2.5, 3), 2.36);

  // For q=2: delta = -0.32 => 2.5 - 0.32 = 2.18
  assert.equal(calculateEaseFactor(2.5, 2), 2.18);

  // For q=1: delta = -0.54 => 2.5 - 0.54 = 1.96
  assert.equal(calculateEaseFactor(2.5, 1), 1.96);

  // For q=0: delta = -0.80 => 2.5 - 0.80 = 1.70
  assert.equal(calculateEaseFactor(2.5, 0), 1.7);
});

test('calculateEaseFactor strictly clamps to MIN_EASE (1.3)', () => {
  const lowEase = 1.4;
  const result = calculateEaseFactor(lowEase, 0); // delta = -0.8 => 0.6 -> clamped to 1.3
  assert.equal(result, MIN_EASE);
});

test('calculateSM2 computes canonical interval progression I(1)=1, I(2)=6, I(n)=round(I(n-1)*EF)', () => {
  const now = 1700000000000;

  // New card, graded Good (q=4, grade=2)
  const rep1 = calculateSM2(undefined, 2, { now });
  assert.equal(rep1.reps, 1);
  assert.equal(rep1.int, 1); // I(1) = 1 day
  assert.equal(rep1.ease, DEFAULT_EASE); // 2.5
  assert.equal(rep1.due, now + 1 * ONE_DAY_MS);
  assert.equal(rep1.lapses, 0);

  // Second repetition, graded Good (q=4)
  const rep2 = calculateSM2(rep1, 2, { now });
  assert.equal(rep2.reps, 2);
  assert.equal(rep2.int, 6); // I(2) = 6 days
  assert.equal(rep2.ease, DEFAULT_EASE); // 2.5
  assert.equal(rep2.due, now + 6 * ONE_DAY_MS);

  // Third repetition, graded Good (q=4)
  const rep3 = calculateSM2(rep2, 2, { now });
  assert.equal(rep3.reps, 3);
  assert.equal(rep3.int, Math.round(6 * 2.5)); // 15 days
  assert.equal(rep3.due, now + 15 * ONE_DAY_MS);

  // Fourth repetition, graded Good (q=4)
  const rep4 = calculateSM2(rep3, 2, { now });
  assert.equal(rep4.reps, 4);
  assert.equal(rep4.int, Math.round(15 * 2.5)); // 38 days
  assert.equal(rep4.due, now + 38 * ONE_DAY_MS);
});

test('calculateSM2 handles lapse / failure (Again, q < 3) by resetting repetitions and incrementing lapses', () => {
  const now = 1700000000000;
  const learnedCard = {
    ease: 2.5,
    int: 15,
    reps: 3,
    lapses: 0,
    due: now,
    nextReviewDate: now
  };

  const failed = calculateSM2(learnedCard, 0, { now }); // Again (grade=0, q=1)
  assert.equal(failed.reps, 0); // Repetitions reset to 0
  assert.equal(failed.int, 0); // Intraday review
  assert.equal(failed.lapses, 1); // Lapses incremented
  assert.equal(failed.due, now + TEN_MINUTES_MS);
  assert.ok(failed.ease < 2.5); // Ease factor dropped
});

test('calculateSM2 supports explicit quality rating q in [0, 5]', () => {
  const now = 1700000000000;
  const result = calculateSM2(undefined, 5, { now, isExplicitQuality: true });
  assert.equal(result.ease, 2.6);
  assert.equal(result.reps, 1);
});

test('formatSM2Interval formats intervals cleanly for UI', () => {
  assert.equal(formatSM2Interval(0, false), '<10m');
  assert.equal(formatSM2Interval(0, true), '10s');
  assert.equal(formatSM2Interval(1), '1d');
  assert.equal(formatSM2Interval(6), '6d');
  assert.equal(formatSM2Interval(15), '15d');
  assert.equal(formatSM2Interval(60), '2mo');
  assert.equal(formatSM2Interval(365), '1y');
});

test('getCardIntervalPreviews returns formatted previews for all 4 buttons', () => {
  const previewsNew = getCardIntervalPreviews(undefined);
  assert.equal(previewsNew[0], '<10m'); // Again
  assert.equal(previewsNew[1], '1d');   // Hard
  assert.equal(previewsNew[2], '1d');   // Good
  assert.equal(previewsNew[3], '4d');   // Easy

  const matureCard = { ease: 2.5, int: 6, reps: 2 };
  const previewsMature = getCardIntervalPreviews(matureCard);
  assert.equal(previewsMature[0], '<10m');
  assert.equal(previewsMature[1], '7d');   // Hard (6 * 1.2 or 6 + 1 = 7d)
  assert.equal(previewsMature[2], '15d');  // Good (6 * 2.5 = 15d)
  assert.equal(previewsMature[3], '20d');  // Easy (6 * 2.6 * 1.3 = ~20d)
});
