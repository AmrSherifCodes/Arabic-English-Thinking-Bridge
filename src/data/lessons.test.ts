import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES_DATA } from './lessons';

test('curriculum has 3 phases and 24 total lessons', () => {
  assert.equal(PHASES_DATA.length, 3);
  const totalLessons = PHASES_DATA.reduce((acc, p) => acc + p.lessons.length, 0);
  assert.equal(totalLessons, 24);
});

test('every lesson has 3 interactive exercises with breakdown chunks', () => {
  let totalExercises = 0;
  for (const phase of PHASES_DATA) {
    for (const lesson of phase.lessons) {
      assert.equal(lesson.exercises.length, 3, `Lesson ${lesson.id} should have 3 exercises`);
      for (const ex of lesson.exercises) {
        totalExercises++;
        assert.ok(ex.arabicThought.length > 0, `Exercise ${ex.id} has empty arabicThought`);
        assert.ok(ex.englishTarget.length > 0, `Exercise ${ex.id} has empty englishTarget`);
        assert.ok(ex.wordChips.length >= 4, `Exercise ${ex.id} should have at least 4 word chips`);
        assert.ok(ex.breakdownChunks.length >= 2, `Exercise ${ex.id} should have breakdown chunks`);
        assert.ok(ex.habitHint.length > 0, `Exercise ${ex.id} must have a Socratic habit hint`);
      }
    }
  }
  assert.equal(totalExercises, 72);
});
