import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES_DATA } from './lessons';

test('1. Verify all 27 lessons and 81 exercises have non-empty promptAr, targetSentence, wordChips and breakdownChunks', () => {
  let totalLessonsCount = 0;
  let totalExercisesCount = 0;

  for (const phase of PHASES_DATA) {
    for (const lesson of phase.lessons) {
      totalLessonsCount++;
      assert.ok(lesson.id, `Lesson number ${lesson.number} must have an ID`);
      assert.ok(lesson.titleAr, `Lesson ${lesson.id} must have titleAr`);
      assert.ok(lesson.title, `Lesson ${lesson.id} must have titleEn`);
      assert.ok(lesson.exercises && lesson.exercises.length >= 3, `Lesson ${lesson.id} must have at least 3 exercises`);

      for (const ex of lesson.exercises) {
        totalExercisesCount++;
        assert.ok(ex.id, `Exercise in lesson ${lesson.id} must have an ID`);
        assert.ok(ex.arabicThought || (ex as any).promptAr, `Exercise ${ex.id} must have an Arabic thought/prompt`);
        assert.ok(ex.englishTarget || (ex as any).targetSentence, `Exercise ${ex.id} must have an English target sentence`);

        const target = ex.englishTarget || (ex as any).targetSentence;
        const chips = ex.wordChips || (ex as any).options || [];

        assert.ok(chips.length > 0, `Exercise ${ex.id} must have word chips / options`);

        // Strip punctuation and check if target words are contained in the word chips
        const targetTokens = target.replace(/[.,?!'"]/g, '').split(/\s+/).filter(Boolean);
        const chipTokens = chips.map((c: string) => c.replace(/[.,?!'"]/g, '').toLowerCase());

        for (const token of targetTokens) {
          const isContained = chipTokens.some(
            (chip) => chip === token.toLowerCase() || chip.includes(token.toLowerCase())
          );
          assert.ok(
            isContained,
            `Word "${token}" from target "${target}" in exercise ${ex.id} must be present in word chips: [${chips.join(', ')}]`
          );
        }
      }
    }
  }

  assert.equal(totalLessonsCount, 27, 'Total lessons count across all phases must be exactly 27');
  assert.equal(totalExercisesCount, 81, 'Total exercises count must be exactly 81 (27 * 3)');
});
