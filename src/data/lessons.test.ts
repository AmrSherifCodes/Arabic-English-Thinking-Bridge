import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES_DATA, ALL_LESSONS, getCurriculum } from './curriculum';

test('curriculum has 3 phases and 27 total lessons', () => {
  assert.equal(PHASES_DATA.length, 3);
  const totalLessons = PHASES_DATA.reduce((acc, p) => acc + p.lessons.length, 0);
  assert.equal(totalLessons, 27);
  assert.equal(ALL_LESSONS.length, 27);
});

test('curriculum.ts re-exports getCurriculum and canonical phases correctly', () => {
  const phases = getCurriculum('ar', 'en');
  assert.equal(phases.length, 3);
  const total = phases.reduce((acc, p) => acc + p.lessons.length, 0);
  assert.equal(total, 27);
});

test('every lesson has sequential numbers from 1 to 27 and unique IDs', () => {
  const seenIds = new Set<string>();
  let expectedNumber = 1;

  for (const phase of PHASES_DATA) {
    for (const lesson of phase.lessons) {
      assert.equal(lesson.number, expectedNumber, `Lesson ${lesson.id} should have number ${expectedNumber}`);
      assert.ok(!seenIds.has(lesson.id), `Duplicate lesson id: ${lesson.id}`);
      seenIds.add(lesson.id);

      assert.ok(lesson.title.trim().length > 3, `Lesson ${lesson.id} title is too short`);
      assert.ok(lesson.titleAr.trim().length > 3, `Lesson ${lesson.id} titleAr is too short`);
      assert.ok(lesson.transferConcept.trim().length >= 10, `Lesson ${lesson.id} transferConcept is too short`);
      assert.ok(lesson.transferConceptAr.trim().length >= 10, `Lesson ${lesson.id} transferConceptAr is too short`);
      assert.ok(lesson.weakSpotTag.trim().length > 2, `Lesson ${lesson.id} weakSpotTag is missing`);

      expectedNumber++;
    }
  }
  assert.equal(seenIds.size, 27);
});

test('every lesson has exactly 3 interactive exercises with breakdown chunks and chips', () => {
  let totalExercises = 0;
  const seenExIds = new Set<string>();

  for (const phase of PHASES_DATA) {
    for (const lesson of phase.lessons) {
      assert.equal(lesson.exercises.length, 3, `Lesson ${lesson.id} should have exactly 3 exercises`);
      for (const ex of lesson.exercises) {
        totalExercises++;
        assert.ok(!seenExIds.has(ex.id), `Duplicate exercise id: ${ex.id}`);
        seenExIds.add(ex.id);

        assert.ok(ex.arabicThought.length > 0, `Exercise ${ex.id} has empty arabicThought`);
        assert.ok(ex.englishTarget.length > 0, `Exercise ${ex.id} has empty englishTarget`);
        assert.ok(ex.wordChips.length >= 4, `Exercise ${ex.id} should have at least 4 word chips`);
        assert.ok(ex.breakdownChunks.length >= 2, `Exercise ${ex.id} should have breakdown chunks`);
        assert.ok(ex.habitHint.length > 0, `Exercise ${ex.id} must have a Socratic habit hint`);

        // Verify each breakdown chunk has role and explanation
        for (const chunk of ex.breakdownChunks) {
          assert.ok(chunk.arabicText.length > 0, `Chunk in ${ex.id} missing arabicText`);
          assert.ok(chunk.englishText.length > 0, `Chunk in ${ex.id} missing englishText`);
          assert.ok(chunk.role.length > 0, `Chunk in ${ex.id} missing role`);
          assert.ok(chunk.explanation.length > 0, `Chunk in ${ex.id} missing explanation`);
        }
      }
    }
  }
  assert.equal(totalExercises, 81);
  assert.equal(seenExIds.size, 81);
});
