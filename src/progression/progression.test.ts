import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlayerLevel, calculateSkillAxisLevel, createInitialProgressionState, updateStreakAndShields } from './engine';
import { calculateNextSrsState, getDueSrsQueue } from './srs';
import { migrateLegacyStorageToProgression } from './migration';
import { buildCourseStructure } from './courseData';

test('1. calculatePlayerLevel computes smooth quadratic levels', () => {
  assert.equal(calculatePlayerLevel(0), 1);
  assert.equal(calculatePlayerLevel(50), 2);
  assert.equal(calculatePlayerLevel(200), 3);
  assert.equal(calculatePlayerLevel(450), 4);
});

test('2. calculateNextSrsState updates stability and due dates correctly', () => {
  const item = {
    id: 'test-card',
    term: 'Kaffee',
    sourceText: 'قهوة',
    targetText: 'Kaffee',
    targetLang: 'de' as const,
    stability: 2.0,
    difficulty: 5.0,
    lapses: 0,
    reviews: 1,
    lastReviewedAt: Date.now() - 86400000,
    dueAt: Date.now() - 1000,
  };

  // Test Rating 3 (Good)
  const nextGood = calculateNextSrsState(item, 3);
  assert.ok(nextGood.stability > item.stability, 'Stability must increase on Good answer');
  assert.ok(nextGood.dueAt > Date.now(), 'Due date must be in the future');

  // Test Rating 1 (Again / Miss)
  const nextAgain = calculateNextSrsState(item, 1);
  assert.equal(nextAgain.lapses, 1, 'Lapses must increment on Miss');
  assert.ok(nextAgain.stability < item.stability, 'Stability must drop on Miss');
});

test('3. getDueSrsQueue limits daily reviews to dailyCap', () => {
  const items: Record<string, any> = {};
  for (let i = 0; i < 50; i++) {
    items[`card-${i}`] = {
      id: `card-${i}`,
      term: `word-${i}`,
      dueAt: Date.now() - 1000,
      stability: i,
      lapses: i % 2,
    };
  }

  const queue = getDueSrsQueue(items, 30);
  assert.equal(queue.length, 30, 'Daily review queue must be capped at 30');
});

test('4. updateStreakAndShields handles consecutive days and shield protection', () => {
  const init = createInitialProgressionState();
  init.lastActiveDate = '2026-11-01';
  init.streak = 5;
  init.streakShields = 2;

  // Active next day
  const day2 = updateStreakAndShields(init, '2026-11-02');
  assert.equal(day2.streak, 6, 'Streak must increment on consecutive day');

  // Missed a day (diff = 2 days) -> Auto-consume shield
  const missedDay = updateStreakAndShields(init, '2026-11-03');
  assert.equal(missedDay.streakShields, 1, 'Shield must be consumed on missed day');
  assert.equal(missedDay.streak, 6, 'Streak must be preserved by shield');
});

test('5. buildCourseStructure maps all 27 lessons into CEFR stages A0-A2 without dead ends', () => {
  const structure = buildCourseStructure();
  assert.equal(structure.length, 3, 'Must have exactly the A0, A1, and A2 stages');

  // Stages A0, A1, A2
  const a0 = structure.find((s) => s.stage === 'A0');
  const a1 = structure.find((s) => s.stage === 'A1');
  const a2 = structure.find((s) => s.stage === 'A2');

  assert.ok(a0 && a1 && a2, 'A0, A1, and A2 stages must be present');

  const getStageLessons = (s: any) => s.units.flatMap((u: any) => u.lessons);
  const a0Lessons = getStageLessons(a0);
  const a1Lessons = getStageLessons(a1);
  const a2Lessons = getStageLessons(a2);

  assert.equal(a0Lessons.length, 9, 'Stage A0 must have 9 lessons');
  assert.equal(a1Lessons.length, 9, 'Stage A1 must have 9 lessons');
  assert.equal(a2Lessons.length, 9, 'Stage A2 must have 9 lessons');

  const totalLessons = a0Lessons.length + a1Lessons.length + a2Lessons.length;
  assert.equal(totalLessons, 27, 'Total progression lessons across A0-A2 must be 27');
  assert.equal(
    new Set([...a0Lessons, ...a1Lessons, ...a2Lessons].map((lesson: any) => lesson.id)).size,
    27,
    'Every lesson must appear exactly once'
  );

  const allExercises = [...a0Lessons, ...a1Lessons, ...a2Lessons].flatMap((l: any) => l.exercises);
  assert.equal(allExercises.length, 81, 'Total progression exercises across A0-A2 must be 81');

  // Verify every exercise has valid target, prompt, and wordChips
  for (const ex of allExercises) {
    assert.ok(ex.targetSentence.length > 0, `Exercise ${ex.id} targetSentence missing`);
    assert.ok(ex.promptAr.length > 0, `Exercise ${ex.id} promptAr missing`);
    assert.ok(ex.wordChips.length >= 3, `Exercise ${ex.id} wordChips insufficient`);
  }
});

test('6. migrateLegacyStorageToProgression runs safely with fallback defaults', () => {
  const migrated = migrateLegacyStorageToProgression();
  assert.ok(migrated.version === 2, 'Version must be 2');
  assert.ok(migrated.overallLevel >= 1, 'Overall level must be at least 1');
  assert.ok(migrated.skills.structure >= 1, 'Structure skill axis must be initialized');
});
