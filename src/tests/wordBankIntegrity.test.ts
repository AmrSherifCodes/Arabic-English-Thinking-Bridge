import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurriculum } from '../data/curriculumRegistry';
import { getTargetDictionaryAsync } from '../data/dictionaries';
import {
  buildCefrHierarchy,
  buildCourseStructure,
  LOCALIZED_A0_LESSONS,
  LOCALIZED_A1_A2_LESSONS,
} from '../progression/courseData';
import { getDynamicExerciseOptions } from '../utils/adaptiveCurriculum';
import {
  ensureRequiredWordBankTokens,
  normalizeAnswerForComparison,
  normalizeTileWord,
  tokenizeTargetSentence,
} from '../utils/sentenceBuilderHelper';
import { generatePythonLevelSvg } from '../utils/localLevelImageGenerator';
import {
  dismissSupporterPopupWithPromise,
  initYouTubeSupporter,
  isSupporterPopupDismissed,
  isYouTubeSubscribed,
  setYouTubeSubscribed,
  shouldShowSupporterPopup,
  YT_NUDGE_DISMISSED_KEY,
} from '../utils/youtubeSupporter';

const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff]/u;

function assertExerciseWordBankValid(
  location: string,
  targetSentence: string,
  prompt: string,
  rawOptions: string[] | undefined,
  extraStrings: string[] = []
) {
  assert.ok(targetSentence && targetSentence.trim().length > 0, `${location}: empty targetSentence`);
  assert.ok(prompt && prompt.trim().length > 0, `${location}: empty prompt`);
  assert.notEqual(
    prompt.trim(),
    targetSentence.trim(),
    `${location}: prompt must not equal targetSentence ("${prompt}")`
  );

  for (const s of [targetSentence, prompt, ...(rawOptions || []), ...extraStrings]) {
    assert.equal(/<ctrl|default_api:/i.test(s), false, `${location}: corrupted marker in "${s}"`);
  }

  const chips = rawOptions && rawOptions.length > 0 ? rawOptions : tokenizeTargetSentence(targetSentence);
  assert.ok(chips.length > 0, `${location}: empty word bank`);

  if (CJK_RE.test(targetSentence)) {
    const reqChars = new Map<string, number>();
    for (const ch of normalizeAnswerForComparison(targetSentence, true)) {
      reqChars.set(ch, (reqChars.get(ch) || 0) + 1);
    }

    for (const diff of ['Easy', 'Medium', 'Hard'] as const) {
      const { wordChips } = getDynamicExerciseOptions(chips, targetSentence, diff);
      const bankChars = new Map<string, number>();
      for (const chip of wordChips) {
        for (const ch of normalizeAnswerForComparison(chip, true)) {
          bankChars.set(ch, (bankChars.get(ch) || 0) + 1);
        }
      }
      for (const [ch, need] of reqChars.entries()) {
        const have = bankChars.get(ch) || 0;
        assert.ok(
          have >= need,
          `${location} [${diff}]: CJK char "${ch}" missing (have ${have}, need ${need}) for "${targetSentence}". Chips=${JSON.stringify(wordChips)}`
        );
      }
    }
    return;
  }

  const reqTokens = tokenizeTargetSentence(targetSentence);
  const reqCounts = new Map<string, number>();
  for (const tok of reqTokens) {
    const k = normalizeTileWord(tok);
    if (!k) continue;
    reqCounts.set(k, (reqCounts.get(k) || 0) + 1);
  }

  // Raw chips must cover every required single token with exact multiplicity
  const rawCounts = new Map<string, number>();
  for (const chip of chips) {
    if (/\s/.test(chip.trim())) continue;
    const k = normalizeTileWord(chip);
    if (!k) continue;
    rawCounts.set(k, (rawCounts.get(k) || 0) + 1);
  }
  for (const [k, need] of reqCounts.entries()) {
    const have = rawCounts.get(k) || 0;
    assert.ok(
      have >= need,
      `${location} [RAW]: token "${k}" missing (have ${have}, need ${need}) for "${targetSentence}". Raw=${JSON.stringify(chips)}`
    );
  }

  // Every difficulty level must retain all required tokens & counts
  for (const diff of ['Easy', 'Medium', 'Hard'] as const) {
    const { wordChips } = getDynamicExerciseOptions(chips, targetSentence, diff);
    const bankCounts = new Map<string, number>();
    for (const chip of wordChips) {
      if (/\s/.test(chip.trim())) continue;
      const k = normalizeTileWord(chip);
      if (!k) continue;
      bankCounts.set(k, (bankCounts.get(k) || 0) + 1);
    }
    for (const [k, need] of reqCounts.entries()) {
      const have = bankCounts.get(k) || 0;
      assert.ok(
        have >= need,
        `${location} [${diff}]: token "${k}" missing (have ${have}, need ${need}) for "${targetSentence}". Chips=${JSON.stringify(wordChips)}`
      );
    }
  }
}

test('100% Curriculum Word-Bank Integrity across ALL languages and curricula', async () => {
  const langs = ['en', 'de', 'tr', 'es', 'fr', 'ja', 'it', 'pt', 'ar', 'zh', 'hi', 'ru', 'el', 'he'] as const;
  let checkedCount = 0;

  for (const lang of langs) {
    await getTargetDictionaryAsync(lang);
    const src = lang === 'ar' ? 'en' : 'ar';

    // 1. Legacy/Registry Phases
    const phases = getCurriculum(src, lang);
    for (const phase of phases) {
      for (const lesson of phase.lessons) {
        for (const ex of lesson.exercises) {
          const target = ex.targetSentence || ex.englishTarget || '';
          const prompt = lang === 'ar'
            ? ((ex as { promptEn?: string }).promptEn || ex.sourceThought || ex.englishTarget || '')
            : (ex.arabicThought || ex.sourceThought || '');
          assertExerciseWordBankValid(
            `curriculum:${lang}:${lesson.id}:${ex.id}`,
            target,
            prompt,
            ex.wordChips,
            ex.acceptableAlternatives || []
          );
          checkedCount++;
        }
      }
    }

    // 2. Stage Course Structure
    const stages = buildCourseStructure(lang, src);
    for (const stage of stages) {
      for (const unit of stage.units) {
        for (const lesson of unit.lessons) {
          for (const ex of lesson.exercises) {
            assertExerciseWordBankValid(
              `coursePath:${lang}:${lesson.id}:${ex.id}`,
              ex.targetSentence,
              ex.promptAr,
              ex.options || ex.wordChips,
              [ex.promptEn, ...(ex.acceptableAlternatives || [])]
            );
            assert.notEqual(
              ex.promptEn.trim(),
              ex.targetSentence.trim(),
              `coursePath:${lang}:${ex.id}: promptEn leaked targetSentence`
            );
            checkedCount++;
          }
        }
      }
    }

    // 3. CEFR Hierarchy
    const hierarchy = buildCefrHierarchy(lang, src);
    for (const level of hierarchy) {
      for (const phase of level.phases) {
        for (const mod of phase.modules) {
          for (const unit of mod.units) {
            for (const lesson of unit.lessons) {
              for (const ex of lesson.exercises) {
                assertExerciseWordBankValid(
                  `cefr:${lang}:${lesson.id}:${ex.id}`,
                  ex.targetSentence,
                  ex.promptAr,
                  ex.options || ex.wordChips,
                  [ex.promptEn, ...(ex.acceptableAlternatives || [])]
                );
                assert.notEqual(
                  ex.promptEn.trim(),
                  ex.targetSentence.trim(),
                  `cefr:${lang}:${ex.id}: promptEn leaked targetSentence`
                );
                checkedCount++;
              }
            }
          }
        }
      }
    }
  }

  // 4. Direct localized seed lessons
  for (const [lang, list] of Object.entries(LOCALIZED_A0_LESSONS)) {
    for (const def of list) {
      assertExerciseWordBankValid(`localized-a0:${lang}:${def.id}`, def.targetSentence, def.promptAr, def.wordChips);
      checkedCount++;
    }
  }
  for (const [lang, rec] of Object.entries(LOCALIZED_A1_A2_LESSONS)) {
    for (const stage of ['A1', 'A2'] as const) {
      for (const def of rec[stage]) {
        assertExerciseWordBankValid(`localized-${stage}:${lang}:${def.id}`, def.targetSentence, def.promptAr, def.wordChips);
        checkedCount++;
      }
    }
  }

  assert.ok(checkedCount > 1000, `Expected > 1000 scanned exercises, scanned ${checkedCount}`);
});

test('Regression: "Hello, how are you?" NEVER loses Hello or you in Hard difficulty', () => {
  const target = 'Hello, how are you?';
  const rawChips = ['Hello', 'how', 'are', 'you', 'Hi', 'is', 'am'];

  for (const diff of ['Easy', 'Medium', 'Hard'] as const) {
    const { wordChips } = getDynamicExerciseOptions(rawChips, target, diff);
    const normalized = wordChips.map((w) => normalizeTileWord(w));
    for (const required of ['hello', 'how', 'are', 'you']) {
      assert.ok(
        normalized.includes(required),
        `Missing "${required}" in ${diff} mode: ${JSON.stringify(wordChips)}`
      );
    }
  }
});

test('ensureRequiredWordBankTokens injects missing tokens, preserves duplicates, and strips punctuation garbage', () => {
  const repaired = ensureRequiredWordBankTokens(['Hi', 'how', 'are', '?', 'am'], 'Hello, how are you?');
  const normalized = repaired.map((w) => normalizeTileWord(w));
  assert.ok(normalized.includes('hello'));
  assert.ok(normalized.includes('you'));
  assert.equal(repaired.includes('?'), false, 'Orphan punctuation tile should be stripped');

  const duplicated = ensureRequiredWordBankTokens(['the', 'dog', 'chased', 'cat'], 'the dog chased the cat');
  assert.equal(duplicated.filter((w) => normalizeTileWord(w) === 'the').length, 2);

  assert.equal(normalizeAnswerForComparison('أهلاً، إزيك؟'), 'أهلاً إزيك');
  assert.equal(normalizeAnswerForComparison('¿Por qué?'), 'por qué');
  assert.equal(normalizeAnswerForComparison('J’apprends le français.'), 'japprends le français');
});

test('generatePythonLevelSvg hides target answer unless revealTarget is true and keeps unclipped viewBox', () => {
  const hiddenSvg = generatePythonLevelSvg({
    stage: 'A0',
    levelNumber: 1,
    promptAr: 'أهلاً، إزيك؟',
    englishTarget: 'Hello, how are you?',
  });

  assert.equal(
    hiddenSvg.includes('Hello, how are you?'),
    false,
    'Banner SVG must NEVER leak target answer text when revealTarget is omitted/false'
  );
  assert.match(hiddenSvg, /width="400"\s+height="220"\s+viewBox="0 0 400 220"/);

  const revealedSvg = generatePythonLevelSvg({
    stage: 'A0',
    levelNumber: 1,
    promptAr: 'أهلاً، إزيك؟',
    englishTarget: 'Hello, how are you?',
    revealTarget: true,
  });
  assert.equal(revealedSvg.includes('Hello, how are you?'), true);
  assert.match(revealedSvg, /y="176"\s+width="376"\s+height="32"/);
});

test('youtubeSupporter keeps bright UI (never adds tb-sad-mode) and dismisses one-time popup permanently', () => {
  const origWindow = (globalThis as any).window;
  const origDocument = (globalThis as any).document;

  const store = new Map<string, string>();
  const classSet = new Set<string>(['tb-sad-mode']);
  const events: string[] = [];

  (globalThis as any).document = {
    documentElement: {
      classList: {
        add: (c: string) => classSet.add(c),
        remove: (c: string) => classSet.delete(c),
        contains: (c: string) => classSet.has(c),
      },
    },
  };
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    },
    dispatchEvent: (ev: { type?: string }) => {
      if (ev?.type) events.push(ev.type);
    },
  };

  try {
    initYouTubeSupporter();
    assert.equal(classSet.has('tb-sad-mode'), false, 'initYouTubeSupporter must strip tb-sad-mode');
    assert.equal(shouldShowSupporterPopup(), true, 'Fresh user should see one-time supporter popup');

    setYouTubeSubscribed(false);
    assert.equal(classSet.has('tb-sad-mode'), false, 'setYouTubeSubscribed(false) must NEVER add tb-sad-mode');

    dismissSupporterPopupWithPromise();
    assert.equal(isSupporterPopupDismissed(), true);
    assert.equal(store.get(YT_NUDGE_DISMISSED_KEY), 'true');
    assert.equal(isYouTubeSubscribed(), true);
    assert.equal(shouldShowSupporterPopup(), false, 'Popup must stay dismissed permanently');
    assert.equal(classSet.has('tb-sad-mode'), false);
    assert.ok(events.includes('tb:supporter-change'));
  } finally {
    (globalThis as any).window = origWindow;
    (globalThis as any).document = origDocument;
  }
});
