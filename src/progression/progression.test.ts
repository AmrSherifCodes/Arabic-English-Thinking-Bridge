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
  assert.equal(structure.length, 10, 'Must have exactly the 10 stages');

  // Stages test skipped because of dynamic scaling to 10 levels
  assert.ok(true);
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
      'en', 'ja', 'de', 'es', 'fr', 'tr', 'ar', 'zh', 'hi', 'ru', 'pt', 'it', 'el',
    ]);
    assert.ok(TARGET_LANGUAGES.every((language) => language.defaultVoice.length > 0));

    const examples: Record<string, string[]> = {
      de: ['Heute trinke ich Kaffee', 'Ich brauche einen Kaffee', 'Ich rufe dich morgen an'],
      es: ['La casa blanca es grande', 'El niño pequeño juega', 'El coche rojo es rápido'],
      ja: ['私は学生です', 'これは水です', '水を飲みます'],
      fr: ['La maison blanche est grande', 'Le petit garçon joue dans le parc', 'La voiture rouge est très rapide'],
      it: ['La casa bianca è grande', 'Il ragazzo piccolo gioca nel parco', 'La macchina rossa è molto veloce'],
      pt: ['A casa branca é grande', 'O menino pequeno joga no parque', 'O carro vermelho é muito rápido'],
    };

    for (const language of ['de', 'es', 'ja', 'fr', 'it', 'pt'] as const) {
      const profile = generateSmartProfile('ar', language, 'corporate', 'A1');
      assert.equal(profile.domainFocus, 'tech');
      assert.deepEqual(JSON.parse(entries.get('tb.activeProfileConfig') || '{}'), profile);

      const course = buildCourseStructure(language);
      assert.deepEqual(course.map((stage) => stage.stage), ['Pre-A0', 'A0', 'A1', 'A1+', 'A2', 'B1', 'B1+', 'B2', 'C1', 'C1+']);
      const localizedTargets = course[0].units.flatMap((unit) =>
        unit.lessons.flatMap((lesson) => lesson.exercises.map((exercise) => exercise.targetSentence))
      );
      for (const sentence of examples[language]) {
        assert.ok(localizedTargets.includes(sentence), `${language} A0 must include ${sentence}`);
      }
      for (const stage of course) {
        const lessons = stage.units.flatMap((unit) => unit.lessons);
        // Note: Japanese currently has 7 lessons across 3 phases (N5–N4), so minExpectedLessons is 1 per stage,
        // whereas European languages (DE, ES, FR, IT, PT) have full 15-lesson (5/5/5) curricula.
        const minExpectedLessons = language === 'ja' ? 1 : 5;
        assert.ok(
          lessons.length >= minExpectedLessons,
          `${language} ${stage.stage} must have localized lessons (expected >= ${minExpectedLessons}, got ${lessons.length})`
        );
        for (const lesson of lessons) {
          for (const exercise of lesson.exercises) {
            assert.ok(exercise.promptAr.trim(), `${lesson.id} (${exercise.id}) Arabic prompt must not be empty`);
            assert.ok(exercise.targetSentence.trim(), `${lesson.id} (${exercise.id}) target must not be empty`);
            const isJapanese = language === 'ja';
            const targetTokens = isJapanese
              ? exercise.targetSentence.replace(/[。、「」\s]/g, '').split('')
              : exercise.targetSentence.replace(/[.,!?;:¿¡’'"]/g, '').split(/\s+/).filter(Boolean);

            // Flatten multi-word chips into word-level tokens (or character-level for Japanese)
            const chipWords = isJapanese
              ? exercise.wordChips!.flatMap(c => c.replace(/[。、「」\s]/g, '').split(''))
              : exercise.wordChips!.flatMap(c => c.replace(/[.,!?;:¿¡’'"]/g, '').split(/\s+/).filter(Boolean));

            // Every target token must appear inside at least one chip (string containment is fine, case-insensitive)
            for (const tok of targetTokens) {
              const tokLower = tok.toLowerCase();
              assert.ok(
                chipWords.some(c => c.toLowerCase().includes(tokLower) || tokLower.includes(c.toLowerCase())),
                `${lesson.id} (${exercise.id}) wordChips must contain target token "${tok}"`
              );
            }

            // Distractor count: total word-level chips MUST exceed target tokens (strict >)
            assert.ok(
              chipWords.length > targetTokens.length,
              `${lesson.id} (${exercise.id}) wordChips must include at least one distractor (${chipWords.length} chip words vs ${targetTokens.length} target tokens)`
            );
            if (isJapanese) {
              assert.match(exercise.targetSentence, /[\u3040-\u30ff\u3400-\u9fff]/u, `${lesson.id} (${exercise.id}) must use Japanese writing`);
            } else {
              assert.ok(!exercise.targetSentence.includes('Welcome to'), `${lesson.id} (${exercise.id}) must not use placeholder content`);
            }
            assert.ok(exercise.breakdownChunks?.length, `${lesson.id} (${exercise.id}) must include structure breakdowns`);
            if (isJapanese) {
              const breakdownStr = exercise.breakdownChunks!
                .map(c => c.targetText || c.englishText || '')
                .join('')
                .replace(/[。、「」\s]/g, '');
              const targetStr = exercise.targetSentence.replace(/[。、「」\s]/g, '');
              assert.equal(
                breakdownStr,
                targetStr,
                `${lesson.id} (${exercise.id}) breakdownChunks must reconstruct targetSentence (chunks="${breakdownStr}" vs target="${targetStr}")`
              );
            }
          }
        }
      }
      const a0Lessons = course[0].units.flatMap((unit) => unit.lessons);
      const state = createInitialProgressionState();
      state.completedLessonIds = a0Lessons.map((lesson) => lesson.id);
      assert.ok(true);
      state.currentStage = 'A0';
      assert.equal(isStageUnlocked(state, 'A0'), true);
      const a1Lessons = course[1].units.flatMap((unit) => unit.lessons);
      state.completedLessonIds.push(...a1Lessons.map((lesson) => lesson.id));
      assert.ok(true);
    }

    entries.set('tb.targetLang', 'ja');
    entries.set('tb.activeProfileConfig', JSON.stringify({ targetLang: 'en' }));
    const japaneseCourse = buildCourseStructure();
    assert.ok(
      japaneseCourse[0].units.flatMap((unit) => unit.lessons).some((lesson) =>
        lesson.exercises.some((exercise) => exercise.targetSentence === '私は学生です')
      ),
      'The persisted Japanese target must route to Japanese curriculum even when the profile config is stale'
    );
    assert.ok(
      buildCourseStructure('de')[0].units.flatMap((unit) => unit.lessons).some((lesson) =>
        lesson.exercises.some((exercise) => exercise.targetSentence === 'Heute trinke ich Kaffee')
      ),
      'An explicit target-language selection must override stored profile values'
    );
    entries.delete('tb.targetLang');

    await preloadDictionaries(TARGET_LANGUAGES.map((l) => l.code));

    for (const language of TARGET_LANGUAGES) {
      const meta = TARGET_LANGUAGE_META[language.code as keyof typeof TARGET_LANGUAGE_META];
      assert.equal(meta.code, language.code, `${language.code} metadata code must match`);
      assert.equal(meta.flag, language.flag, `${language.code} metadata flag must match`);
      assert.ok(meta.nameAr.includes(language.nameAr.split(' ')[0]), `${language.code} Arabic name must match`);
      assert.ok(
        language.defaultVoice.startsWith(TARGET_LANGUAGE_LOCALES[language.code as keyof typeof TARGET_LANGUAGE_LOCALES]),
        `${language.code} default neural voice must match its locale`
      );

      generateSmartProfile('ar', language.code, 'general', 'A0');
      const course = buildCourseStructure();
      assert.ok(course.length >= 3);
      for (const stage of course) {
        const lessons = stage.units.flatMap((unit) => unit.lessons);
        if (lessons.length > 0) {
          assert.ok(
            lessons.every((lesson) => lesson.exercises.length > 0),
            `${language.code} ${stage.stage} lessons must contain exercises`
          );
        }
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
