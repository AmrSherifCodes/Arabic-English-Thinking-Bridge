import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlayerLevel, calculateSkillAxisLevel, createInitialProgressionState, updateStreakAndShields } from './engine';
import { calculateNextSrsState, getDueSrsQueue } from './srs';
import { migrateLegacyStorageToProgression } from './migration';
import { TARGET_LANGUAGES, TARGET_LANGUAGE_LOCALES, TARGET_LANGUAGE_META } from '../data/languages';
import { generateSmartProfile } from '../services/profileEngine';
import { preloadDictionaries } from '../data/dictionaries';
import {
  buildCourseStructure,
  getNextStageAfterLessonCompletion,
  isLessonUnlocked,
  isStageUnlocked,
} from './courseData';

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

test('5a. language profiles build unlockable A0-A2 curricula for German, Spanish, and Japanese', async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });

  try {
    assert.deepEqual(TARGET_LANGUAGES.map((language) => language.code), [
      'en', 'de', 'ja', 'es', 'fr', 'zh', 'hi', 'ru', 'pt', 'it', 'el',
    ]);
    assert.ok(TARGET_LANGUAGES.every((language) => language.defaultVoice.length > 0));

    const examples: Record<string, string[]> = {
      de: ['Heute lerne ich Deutsch.', 'Ich sehe den Mann.', 'Morgen kauft der Lehrer einen Apfel.', 'Ich bin Schüler.'],
      es: ['La casa blanca es grande.', 'El libro rojo es nuevo.', 'Yo estudio español.'],
      ja: ['私は学生です。', '私は猫を見ます。', '私は家で勉強します。'],
    };

    for (const language of ['de', 'es', 'ja'] as const) {
      const profile = generateSmartProfile('ar', language, 'corporate', 'A1');
      assert.equal(profile.domainFocus, 'tech');
      assert.deepEqual(JSON.parse(entries.get('tb.activeProfileConfig') || '{}'), profile);

      const course = buildCourseStructure();
      assert.deepEqual(course.map((stage) => stage.stage), ['A0', 'A1', 'A2']);
      const localizedTargets = course[0].units.flatMap((unit) =>
        unit.lessons.flatMap((lesson) => lesson.exercises.map((exercise) => exercise.targetSentence))
      );
      for (const sentence of examples[language]) {
        assert.ok(localizedTargets.includes(sentence), `${language} A0 must include ${sentence}`);
      }
      for (const stage of course) {
        const lessons = stage.units.flatMap((unit) => unit.lessons);
        assert.ok(lessons.length >= 5, `${language} ${stage.stage} must have localized lessons`);
        for (const lesson of lessons) {
          const exercise = lesson.exercises[0];
          assert.ok(exercise.promptAr.trim(), `${lesson.id} Arabic prompt must not be empty`);
          assert.ok(exercise.targetSentence.trim(), `${lesson.id} target must not be empty`);
          const isJapanese = language === 'ja';
          assert.equal(
            isJapanese
              ? exercise.wordChips!.join('').replace(/[。、「」]/g, '')
              : exercise.wordChips!.join(' '),
            isJapanese
              ? exercise.targetSentence.replace(/[。、「」]/g, '')
              : exercise.targetSentence
          );
          if (isJapanese) {
            assert.match(exercise.targetSentence, /[\u3040-\u30ff\u3400-\u9fff]/u, `${lesson.id} must use Japanese writing`);
          } else {
            assert.ok(!exercise.targetSentence.includes('Welcome to'), `${lesson.id} must not use placeholder content`);
          }
          assert.ok(exercise.breakdownChunks?.length, `${lesson.id} must include structure breakdowns`);
          if (isJapanese) {
            assert.deepEqual(
              exercise.breakdownChunks!.map((chunk) => chunk.englishText).join(''),
              exercise.wordChips!.join(''),
              `${lesson.id} breakdown must account for every Japanese chip`
            );
          } else {
            assert.equal(
              exercise.breakdownChunks!.flatMap((chunk) => chunk.englishText.replace(/[.,!?;:]/g, '').split(/\s+/)).length,
              exercise.targetSentence.replace(/[.,!?;:]/g, '').split(/\s+/).length,
              `${lesson.id} breakdown must account for every target word`
            );
          }
        }
      }
      const a0Lessons = course[0].units.flatMap((unit) => unit.lessons);
      const state = createInitialProgressionState();
      state.completedLessonIds = a0Lessons.map((lesson) => lesson.id);
      assert.equal(getNextStageAfterLessonCompletion(state, a0Lessons[2].id), 'A1');
      state.currentStage = 'A1';
      assert.equal(isStageUnlocked(state, 'A1'), true);
      const a1Lessons = course[1].units.flatMap((unit) => unit.lessons);
      state.completedLessonIds.push(...a1Lessons.map((lesson) => lesson.id));
      assert.equal(getNextStageAfterLessonCompletion(state, a1Lessons[2].id), 'A2');
    }

    entries.set('tb.targetLang', 'ja');
    entries.set('tb.activeProfileConfig', JSON.stringify({ targetLang: 'en' }));
    const japaneseCourse = buildCourseStructure();
    assert.ok(
      japaneseCourse[0].units.flatMap((unit) => unit.lessons).some((lesson) =>
        lesson.exercises.some((exercise) => exercise.targetSentence === '彼はエンジニアです。')
      ),
      'The persisted Japanese target must route to Japanese curriculum even when the profile config is stale'
    );
    assert.ok(
      buildCourseStructure('de')[0].units.flatMap((unit) => unit.lessons).some((lesson) =>
        lesson.exercises.some((exercise) => exercise.targetSentence === 'Ich sehe den Mann.')
      ),
      'An explicit target-language selection must override stored profile values'
    );
    entries.delete('tb.targetLang');

    await preloadDictionaries(TARGET_LANGUAGES.map((l) => l.code));

    for (const language of TARGET_LANGUAGES) {
      const meta = TARGET_LANGUAGE_META[language.code as keyof typeof TARGET_LANGUAGE_META];
      assert.equal(meta.code, language.code, `${language.code} metadata code must match`);
      assert.equal(meta.flag, language.flag, `${language.code} metadata flag must match`);
      assert.equal(meta.nameAr, language.nameAr, `${language.code} Arabic name must match`);
      assert.ok(
        language.defaultVoice.startsWith(TARGET_LANGUAGE_LOCALES[language.code as keyof typeof TARGET_LANGUAGE_LOCALES]),
        `${language.code} default neural voice must match its locale`
      );

      generateSmartProfile('ar', language.code, 'general', 'A0');
      const course = buildCourseStructure();
      assert.deepEqual(course.map((stage) => stage.stage), ['A0', 'A1', 'A2']);
      for (const stage of course) {
        const lessons = stage.units.flatMap((unit) => unit.lessons);
        assert.ok(lessons.length > 0, `${language.code} ${stage.stage} must contain at least one lesson`);
        assert.ok(
          lessons.every((lesson) => lesson.exercises.length > 0),
          `${language.code} ${stage.stage} lessons must contain exercises`
        );
      }
    }
  } finally {
    if (originalStorage) {
      Object.defineProperty(globalThis, 'localStorage', originalStorage);
    } else {
      Reflect.deleteProperty(globalThis, 'localStorage');
    }
  }
});

test('6. progression unlocks lessons sequentially and stages after completing the active stage', () => {
  const course = buildCourseStructure();
  const state = createInitialProgressionState();
  const a0 = course.find((stage) => stage.stage === 'A0')!;
  const a1 = course.find((stage) => stage.stage === 'A1')!;
  const a0Lessons = a0.units.flatMap((unit) => unit.lessons);
  const a1Lessons = a1.units.flatMap((unit) => unit.lessons);

  assert.equal(isLessonUnlocked(state, a0Lessons[0]), true);
  assert.equal(isLessonUnlocked(state, a0Lessons[1]), false);
  assert.equal(isStageUnlocked(state, 'A1'), false);

  state.completedLessonIds = [a0Lessons[0].id];
  assert.equal(isLessonUnlocked(state, a0Lessons[1]), true);
  assert.equal(isLessonUnlocked(state, a0Lessons[2]), false);

  state.completedLessonIds = a0Lessons.slice(0, -1).map((lesson) => lesson.id);
  assert.equal(isStageUnlocked(state, 'A1'), false);
  assert.equal(getNextStageAfterLessonCompletion(state, a0Lessons[7].id), undefined);
  const nextStage = getNextStageAfterLessonCompletion(
    state,
    a0Lessons[a0Lessons.length - 1].id
  );
  assert.equal(nextStage, 'A1');
  state.currentStage = nextStage!;
  assert.equal(isStageUnlocked(state, 'A1'), true);
  assert.equal(isLessonUnlocked(state, a1Lessons[0]), true);
  assert.equal(isLessonUnlocked(state, a1Lessons[1]), false);
});

test('7. migrateLegacyStorageToProgression runs safely with fallback defaults', () => {
  const migrated = migrateLegacyStorageToProgression();
  assert.ok(migrated.version === 2, 'Version must be 2');
  assert.ok(migrated.overallLevel >= 1, 'Overall level must be at least 1');
  assert.ok(migrated.skills.structure >= 1, 'Structure skill axis must be initialized');
});
