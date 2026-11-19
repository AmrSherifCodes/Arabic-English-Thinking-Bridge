import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCourseStructure, isLessonUnlocked, isStageUnlocked, getNextStageAfterLessonCompletion } from './courseData';
import { createInitialProgressionState } from './engine';
import { getTargetDictionaryAsync, searchTargetDictionaryAsync } from '../data/dictionaries';
import { isFeatureUnlocked } from './featureUnlocks';
import type { TargetLanguage } from '../types';

const TEST_LANGUAGES: { code: TargetLanguage; minDictEntries: number; sampleQuery: string }[] = [
  { code: 'en', minDictEntries: 10000, sampleQuery: 'book' },
  { code: 'ar', minDictEntries: 10000, sampleQuery: 'كتاب' },
  { code: 'de', minDictEntries: 2000, sampleQuery: 'Haus' },
  { code: 'es', minDictEntries: 10000, sampleQuery: 'hablar' },
];

test('1. Multi-Language Course Structure & Exercise Quality Test', async (t) => {
  for (const { code } of TEST_LANGUAGES) {
    await t.test(`Language pair target: ${code}`, () => {
      const course = buildCourseStructure(code);
      assert.ok(course.length >= 10, `Expected at least 10 stages for ${code}, got ${course.length}`);

      let totalLessons = 0;
      let totalExercises = 0;

      for (const stage of course) {
        assert.ok(stage.stage, `Stage missing name in ${code}`);
        assert.ok(stage.titleAr || stage.titleEn, `Stage missing title in ${code}`);

        const lessons = stage.units.flatMap((u) => u.lessons);
        assert.ok(lessons.length > 0, `Stage ${stage.stage} in ${code} must have at least 1 lesson`);

        for (const lesson of lessons) {
          totalLessons++;
          assert.ok(lesson.id, `Lesson missing ID in ${code}`);
          assert.ok(lesson.titleAr || lesson.titleEn, `Lesson missing title in ${code}`);
          assert.ok(lesson.exercises.length > 0, `Lesson ${lesson.id} in ${code} must have exercises`);

          for (const ex of lesson.exercises) {
            totalExercises++;
            assert.ok(ex.id, `Exercise in ${lesson.id} missing ID`);
            assert.ok(ex.promptAr || ex.promptEn, `Exercise ${ex.id} missing prompt`);
            assert.ok(ex.targetSentence, `Exercise ${ex.id} missing target sentence`);
            const chips = ex.wordChips || [];
            assert.ok(chips.length > 0 || ex.options?.length, `Exercise ${ex.id} missing word chips`);
          }
        }
      }

      assert.ok(totalLessons >= 20, `Target ${code} must have >= 20 total lessons, got ${totalLessons}`);
      assert.ok(totalExercises >= 20, `Target ${code} must have >= 20 total exercises, got ${totalExercises}`);
    });
  }
});

test('2. Dictionary Depth & Search Speed Test (Arabic, English, German, Spanish)', async (t) => {
  for (const { code, minDictEntries, sampleQuery } of TEST_LANGUAGES) {
    await t.test(`Dictionary depth for ${code}`, async () => {
      const startTime = Date.now();
      const dict = await getTargetDictionaryAsync(code);
      const loadTimeMs = Date.now() - startTime;

      assert.ok(
        dict.length >= minDictEntries,
        `Dictionary ${code} must have >= ${minDictEntries} entries, got ${dict.length}`
      );
      assert.ok(loadTimeMs < 1000, `Dictionary ${code} load time must be < 1000ms, got ${loadTimeMs}ms`);

      const searchResults = await searchTargetDictionaryAsync(sampleQuery, code, 'ar');
      assert.ok(
        searchResults.length > 0,
        `Search for "${sampleQuery}" in ${code} dictionary must return at least 1 result, got ${searchResults.length}`
      );
    });
  }
});

test('3. Level Progression & Sequential Stage Unlocking Test (ar, en, de, es)', (t) => {
  for (const { code } of TEST_LANGUAGES) {
    t.test(`Progression workflow for ${code}`, () => {
      const course = buildCourseStructure(code);
      const state = createInitialProgressionState();

      const stage1 = course[0];
      const stage2 = course[1];
      assert.ok(stage1, `Stage 1 missing for ${code}`);
      assert.ok(stage2, `Stage 2 missing for ${code}`);

      state.currentStage = stage1.stage;

      const stage1Lessons = stage1.units.flatMap((u) => u.lessons);
      const stage2Lessons = stage2.units.flatMap((u) => u.lessons);

      // Level 1 first lesson is unlocked initially
      assert.equal(isLessonUnlocked(state, stage1Lessons[0], code), true);
      assert.equal(isLessonUnlocked(state, stage1Lessons[1], code), false);
      assert.equal(isStageUnlocked(state, stage2.stage, code), false);

      // Mark first lesson completed
      state.completedLessonIds = [stage1Lessons[0].id];
      assert.equal(isLessonUnlocked(state, stage1Lessons[1], code), true);

      // Mark all lessons in Stage 1 completed
      state.completedLessonIds = stage1Lessons.map((l) => l.id);
      const nextStage = getNextStageAfterLessonCompletion(state, stage1Lessons[stage1Lessons.length - 1].id, code);
      assert.equal(nextStage, stage2.stage, `Completing Stage 1 in ${code} should unlock Stage 2 (${stage2.stage})`);

      // Update state to Stage 2
      state.currentStage = nextStage!;
      assert.equal(isStageUnlocked(state, stage2.stage, code), true);
      assert.equal(isLessonUnlocked(state, stage2Lessons[0], code), true);
    });
  }
});

test('4. Checkpoint-Based Feature Unlocks Test', () => {
  const state = createInitialProgressionState();

  // Level 1: SRS Flashcards & Guided Questions unlocked
  assert.equal(isFeatureUnlocked('srs_flashcards', state, 'en'), true);
  assert.equal(isFeatureUnlocked('guided_questions', state, 'en'), true);

  // Level 3 (AI Voice) is locked at Level 1
  assert.equal(isFeatureUnlocked('ai_voice', state, 'en'), false);

  // Advance state to Level 3 (A1)
  state.currentStage = 'A1';
  assert.equal(isFeatureUnlocked('ai_voice', state, 'en'), true);
  assert.equal(isFeatureUnlocked('corporate', state, 'en'), false);

  // Advance state to Level 5 (A2 - Story Engine)
  state.currentStage = 'A2';
  assert.equal(isFeatureUnlocked('story', state, 'en'), true);
});

test('5. Reverse Path (Foreigners / English Speakers Learning Arabic) Curriculum Test', async () => {
  const { getCurriculum } = await import('../data/curriculumRegistry');
  const phasesEnAr = getCurriculum('en', 'ar');
  assert.ok(phasesEnAr.length >= 3, 'Reverse curriculum (English to Arabic) must have phases');

  const ex0 = phasesEnAr[0].lessons[0].exercises[0];
  assert.ok(ex0.targetSentence, 'Target sentence in reverse path must exist');
  assert.ok(/[\u0600-\u06FF]/.test(ex0.targetSentence), 'Target sentence in reverse path must be Arabic');
  assert.ok(ex0.wordChips.length > 0, 'Word chips in reverse path must exist');
  assert.ok(/[\u0600-\u06FF]/.test(ex0.wordChips[0]), 'Word chips in reverse path must be Arabic words');

  const phasesEnArz = getCurriculum('en', 'arz');
  const exArz = phasesEnArz[0].lessons[0].exercises[0];
  assert.ok(/[\u0600-\u06FF]/.test(exArz.targetSentence), 'Egyptian Arabic target sentence must be Arabic');
});
