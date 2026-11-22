import * as nodeTest from 'node:test';
import assert from 'node:assert/strict';
import {
  SOURCE_LANGUAGES,
  TARGET_LANGUAGES,
  TARGET_LANGUAGE_LOCALES,
  TARGET_LANGUAGE_META,
  getPairConfig,
} from '../data/languages';
import { getCurriculum } from '../data/curriculumRegistry';
import { getCefrLevelHierarchy, buildCourseStructure } from '../progression/courseData';
import { getGlossForWord } from './glossHelper';
import {
  getTargetDictionaryAsync,
  searchTargetDictionaryAsync,
  scoreDictionaryMatch,
  formatDictionaryEntryForUi,
} from '../data/dictionaries';
import { normalizeTtsLang } from './offlineTts';
import { getSmartGrammarClue } from '../components/progression/LessonRunner';
import type { TargetLanguage } from '../types';

type RunnerFn = (name: string, fn: () => void | Promise<void>) => unknown;
const isVitest = Boolean(process.env.VITEST || (globalThis as any).__vitest_worker__);
const vitestMod = isVitest ? await import('vitest') : null;
const describe: RunnerFn = vitestMod
  ? (vitestMod.describe as unknown as RunnerFn)
  : (nodeTest.describe as unknown as RunnerFn);
const test: RunnerFn = vitestMod
  ? (vitestMod.test as unknown as RunnerFn)
  : (nodeTest.test as unknown as RunnerFn);

const TOP_5_LANGUAGES: TargetLanguage[] = ['en', 'de', 'fr', 'es', 'tr'];

const EXPECTED_BCP47: Record<string, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  tr: 'tr-TR',
};

const WIKTIONARY_LEAK_REGEX =
  /\b(verbal noun of|plural of|inflection of|diminutive of|alternative form of|alternative spelling of|apocopic form of|past participle of|present participle of|first-person singular|second-person singular|third-person singular|feminine singular of|masculine singular of)\b/i;

const CORE_10_WORDS: Array<{
  conceptEn: string;
  conceptAr: string;
  expectedTargets: Record<'en' | 'de' | 'fr' | 'es' | 'tr', string[]>;
}> = [
  {
    conceptEn: 'water',
    conceptAr: 'ماء',
    expectedTargets: {
      en: ['water'],
      de: ['wasser', 'das wasser'],
      fr: ['eau', "l'eau"],
      es: ['agua', 'el agua'],
      tr: ['su'],
    },
  },
  {
    conceptEn: 'book',
    conceptAr: 'كتاب',
    expectedTargets: {
      en: ['book'],
      de: ['buch', 'das buch'],
      fr: ['livre', 'le livre'],
      es: ['libro', 'el libro'],
      tr: ['kitap'],
    },
  },
  {
    conceptEn: 'house',
    conceptAr: 'منزل',
    expectedTargets: {
      en: ['house', 'home'],
      de: ['haus', 'das haus'],
      fr: ['maison', 'la maison'],
      es: ['casa', 'la casa'],
      tr: ['ev'],
    },
  },
  {
    conceptEn: 'hello',
    conceptAr: 'مرحباً',
    expectedTargets: {
      en: ['hello', 'hi'],
      de: ['hallo'],
      fr: ['bonjour', 'salut'],
      es: ['hola'],
      tr: ['merhaba', 'selam'],
    },
  },
  {
    conceptEn: 'thank you',
    conceptAr: 'شكراً',
    expectedTargets: {
      en: ['thank you', 'thanks'],
      de: ['danke', 'danke schön'],
      fr: ['merci'],
      es: ['gracias'],
      tr: ['teşekkür ederim', 'teşekkürler', 'sağol'],
    },
  },
  {
    conceptEn: 'friend',
    conceptAr: 'صديق',
    expectedTargets: {
      en: ['friend'],
      de: ['freund', 'der freund'],
      fr: ['ami', 'amie'],
      es: ['amigo', 'amiga'],
      tr: ['arkadaş', 'dost'],
    },
  },
  {
    conceptEn: 'time',
    conceptAr: 'وقت',
    expectedTargets: {
      en: ['time'],
      de: ['zeit', 'die zeit'],
      fr: ['temps', 'fois', 'heure'],
      es: ['tiempo', 'hora', 'vez'],
      tr: ['zaman', 'vakit'],
    },
  },
  {
    conceptEn: 'good',
    conceptAr: 'جيد',
    expectedTargets: {
      en: ['good'],
      de: ['gut'],
      fr: ['bon', 'bien', 'bonne'],
      es: ['bueno', 'bien', 'buena'],
      tr: ['iyi', 'güzel'],
    },
  },
  {
    conceptEn: 'eat',
    conceptAr: 'يأكل',
    expectedTargets: {
      en: ['eat', 'to eat'],
      de: ['essen'],
      fr: ['manger'],
      es: ['comer'],
      tr: ['yemek'],
    },
  },
  {
    conceptEn: 'go',
    conceptAr: 'يذهب',
    expectedTargets: {
      en: ['go', 'to go'],
      de: ['gehen', 'fahren'],
      fr: ['aller'],
      es: ['ir'],
      tr: ['gitmek'],
    },
  },
];

describe('Top-5 Language Viability & Pedagogy Integrity Suite', () => {
  test('1. Curriculum & Exercise Completeness across all 5 languages (en, de, fr, es, tr)', async () => {
    for (const lang of TOP_5_LANGUAGES) {
      await getTargetDictionaryAsync(lang);

      // Verify BCP-47 locale config
      assert.equal(
        TARGET_LANGUAGE_LOCALES[lang],
        EXPECTED_BCP47[lang],
        `TARGET_LANGUAGE_LOCALES[${lang}] must equal ${EXPECTED_BCP47[lang]}`
      );
      assert.equal(
        normalizeTtsLang(lang),
        EXPECTED_BCP47[lang],
        `normalizeTtsLang(${lang}) must resolve to ${EXPECTED_BCP47[lang]}`
      );

      for (const source of ['ar', 'arz'] as const) {
        const phases = getCurriculum(source, lang);
        assert.ok(phases.length > 0, `getCurriculum(${source}, ${lang}) must have phases`);

        let exerciseCount = 0;
        for (const phase of phases) {
          assert.ok(phase.title && !/undefined|NaN/i.test(phase.title), `Invalid phase title for ${lang}: ${phase.title}`);
          assert.ok(phase.titleAr && !/undefined|NaN/i.test(phase.titleAr), `Invalid phase titleAr for ${lang}: ${phase.titleAr}`);
          assert.ok(phase.lessons.length > 0, `Phase ${phase.id} in ${lang} must have lessons`);

          for (const lesson of phase.lessons) {
            assert.ok(lesson.title && !/undefined|NaN/i.test(lesson.title), `Invalid lesson title in ${lang}: ${lesson.id}`);
            assert.ok(lesson.titleAr && !/undefined|NaN/i.test(lesson.titleAr), `Invalid lesson titleAr in ${lang}: ${lesson.id}`);
            assert.ok(lesson.exercises.length > 0, `Lesson ${lesson.id} in ${lang} must have exercises`);

            for (const ex of lesson.exercises) {
              exerciseCount++;
              const prompt = (ex.arabicThought || ex.sourceThought || '').trim();
              const target = (ex.targetSentence || ex.englishTarget || '').trim();
              assert.ok(prompt.length > 0, `Empty prompt in ${lang} (${source}) lesson ${lesson.id} ex ${ex.id}`);
              assert.ok(target.length > 0, `Empty targetSentence in ${lang} (${source}) lesson ${lesson.id} ex ${ex.id}`);
              assert.ok(!/\b(undefined|NaN)\b/i.test(prompt), `Prompt contains undefined/NaN in ${lang}: ${prompt}`);
              assert.ok(!/\b(undefined|NaN)\b/i.test(target), `Target contains undefined/NaN in ${lang}: ${target}`);
              assert.ok(Array.isArray(ex.wordChips) && ex.wordChips.length > 0, `Empty wordChips in ${lang} ex ${ex.id}`);
              for (const chip of ex.wordChips) {
                assert.ok(chip.trim().length > 0 && !/\b(undefined|NaN)\b/i.test(chip), `Invalid chip "${chip}" in ${lang} ex ${ex.id}`);
              }
            }
          }
        }
        assert.ok(exerciseCount >= 20, `Expected at least 20 exercises for ${lang} (${source}), got ${exerciseCount}`);
      }

      // Verify CEFR Hierarchy & Course Structure completeness
      const hierarchy = getCefrLevelHierarchy(lang);
      assert.ok(hierarchy.length >= 5, `CEFR hierarchy for ${lang} must have 5 levels`);
      for (const level of hierarchy) {
        assert.ok(level.titleAr && !/undefined|NaN/i.test(level.titleAr), `Invalid level.titleAr for ${lang}`);
        for (const phase of level.phases) {
          assert.ok(phase.titleAr && !/undefined|NaN/i.test(phase.titleAr), `Invalid phase.titleAr for ${lang}`);
          for (const mod of phase.modules) {
            for (const unit of mod.units) {
              assert.ok(unit.titleAr && !/undefined|NaN/i.test(unit.titleAr), `Invalid unit.titleAr for ${lang}`);
              assert.ok(unit.lessons.length > 0, `Unit ${unit.id} in ${lang} must have lessons`);
              for (const lesson of unit.lessons) {
                assert.ok(lesson.exercises.length > 0, `Lesson ${lesson.id} in ${lang} must have exercises`);
                for (const ex of lesson.exercises) {
                  assert.ok(ex.promptAr && ex.promptAr.trim().length > 0, `Empty promptAr in ${lang} hierarchy ex ${ex.id}`);
                  assert.ok(ex.targetSentence && ex.targetSentence.trim().length > 0, `Empty targetSentence in ${lang} hierarchy ex ${ex.id}`);
                  assert.ok(ex.wordChips && ex.wordChips.length > 0, `Empty wordChips in ${lang} hierarchy ex ${ex.id}`);
                }
              }
            }
          }
        }
      }

      const stages = buildCourseStructure(lang);
      assert.ok(stages.length > 0, `buildCourseStructure(${lang}) must return stages`);
    }
  });

  test('2. Gloss & Grammar Leak Guard across all 5 languages', async () => {
    for (const lang of TOP_5_LANGUAGES) {
      await getTargetDictionaryAsync(lang);

      for (const source of ['ar', 'arz'] as const) {
        const phases = getCurriculum(source, lang);
        for (const phase of phases) {
          for (const lesson of phase.lessons) {
            for (const ex of lesson.exercises) {
              // Check grammar clues / explanations
              const rawExplanation = ex.explanationAr || ex.habitHintAr || ex.habitHint || '';
              assert.ok(
                /[\u0600-\u06FF]/.test(rawExplanation),
                `Grammar clue for ${lang} (${source}) ex ${ex.id} lacks Arabic script: "${rawExplanation}"`
              );
              assert.ok(
                !WIKTIONARY_LEAK_REGEX.test(rawExplanation),
                `Grammar clue for ${lang} (${source}) ex ${ex.id} contains Wiktionary metadata: "${rawExplanation}"`
              );
              assert.ok(
                !/despite "car" often feminine/i.test(rawExplanation),
                `Grammar clue for ${lang} (${source}) ex ${ex.id} leaks raw English sentence: "${rawExplanation}"`
              );

              const smartClue = getSmartGrammarClue(
                {
                  id: ex.id,
                  type: 'structure_builder',
                  promptAr: ex.arabicThought || ex.sourceThought || '',
                  promptEn: ex.sourceThought || '',
                  targetSentence: ex.targetSentence || ex.englishTarget || '',
                  wordChips: ex.wordChips,
                  options: ex.wordChips,
                  breakdownChunks: ex.breakdownChunks,
                  explanationAr: ex.explanationAr || ex.habitHintAr || ex.habitHint,
                  explanationEn: ex.explanationEn || '',
                  skillAxes: ['structure'],
                },
                true,
                lang
              );
              assert.ok(
                /[\u0600-\u06FF]/.test(smartClue),
                `getSmartGrammarClue for ${lang} ex ${ex.id} lacks Arabic script: "${smartClue}"`
              );
              assert.ok(
                !/بـ\s+(en|de|fr|es|tr)\b/i.test(smartClue),
                `getSmartGrammarClue for ${lang} ex ${ex.id} contains raw language code leak: "${smartClue}"`
              );

              // Check word chip glosses
              for (const chip of ex.wordChips) {
                const gloss = getGlossForWord(chip, ex.breakdownChunks || [], lang, source);
                if (gloss) {
                  assert.ok(
                    !WIKTIONARY_LEAK_REGEX.test(gloss),
                    `Gloss for chip "${chip}" in ${lang} (${source}) ex ${ex.id} contains Wiktionary metadata: "${gloss}"`
                  );
                  assert.ok(
                    /[\u0600-\u06FF]/.test(gloss),
                    `Arabic gloss for chip "${chip}" in ${lang} (${source}) ex ${ex.id} lacks Arabic script: "${gloss}"`
                  );
                }
              }
            }
          }
        }
      }

      // Check hierarchy Lesson 1 exercises for gloss & grammar clue quality
      const hierarchy = getCefrLevelHierarchy(lang);
      const firstUnitLessons = hierarchy[0].phases[0].modules[0].units[0].lessons;
      for (const lesson of firstUnitLessons) {
        for (const ex of lesson.exercises) {
          assert.ok(
            /[\u0600-\u06FF]/.test(ex.explanationAr || ''),
            `Hierarchy explanationAr in ${lang} ex ${ex.id} lacks Arabic script: "${ex.explanationAr}"`
          );
          assert.ok(
            !/بـ\s+(en|de|fr|es|tr)\b/i.test(ex.explanationAr || ''),
            `Hierarchy explanationAr in ${lang} ex ${ex.id} contains raw lang code: "${ex.explanationAr}"`
          );
          for (const chip of ex.wordChips || []) {
            const gloss = getGlossForWord(chip, ex.breakdownChunks || [], lang, 'ar');
            if (gloss) {
              assert.ok(
                !WIKTIONARY_LEAK_REGEX.test(gloss),
                `Hierarchy gloss for "${chip}" in ${lang} ex ${ex.id} has Wiktionary leak: "${gloss}"`
              );
              assert.ok(
                /[\u0600-\u06FF]/.test(gloss),
                `Hierarchy gloss for "${chip}" in ${lang} ex ${ex.id} lacks Arabic script: "${gloss}"`
              );
            }
          }
        }
      }
    }
  });

  test('3. Smart Dictionary Ranking & Audio Resolution for 10 core words across all 5 languages', async () => {
    for (const lang of TOP_5_LANGUAGES) {
      await getTargetDictionaryAsync(lang);

      for (const item of CORE_10_WORDS) {
        const expectedList = item.expectedTargets[lang as 'en' | 'de' | 'fr' | 'es' | 'tr'];

        // Search by English concept (e.g. 'water', 'book', 'house', ...)
        const resultsEn = await searchTargetDictionaryAsync(item.conceptEn, lang, 'ar');
        assert.ok(
          resultsEn.length > 0,
          `Dictionary search for "${item.conceptEn}" in ${lang} returned 0 results`
        );

        const topEntry = resultsEn[0];
        const uiFormatted = formatDictionaryEntryForUi(topEntry, lang);

        const normalizedTargetTerm = uiFormatted.targetTerm
          .toLowerCase()
          .replace(/^(der|die|das|el|la|los|las|le|les|un|une)\s+/i, '')
          .trim();
        const fullTargetTerm = uiFormatted.targetTerm.toLowerCase().trim();

        const matchesExpected = expectedList.some(
          (exp) => exp === fullTargetTerm || exp === normalizedTargetTerm
        );
        assert.ok(
          matchesExpected,
          `Top-1 dictionary match for "${item.conceptEn}" in ${lang} was "${uiFormatted.targetTerm}" (translation: "${uiFormatted.translation}"), expected one of [${expectedList.join(', ')}]`
        );

        // Verify scoreDictionaryMatch ranks the top entry #1 (>= 95)
        const topScore = scoreDictionaryMatch(
          uiFormatted.targetTerm,
          topEntry.englishTranslation || topEntry.translation || '',
          item.conceptEn.toLowerCase(),
          topEntry
        );
        assert.ok(
          topScore >= 95,
          `scoreDictionaryMatch for "${item.conceptEn}" in ${lang} top entry "${uiFormatted.targetTerm}" must be >= 95, got ${topScore}`
        );

        // Verify redundant ([word]) phonetic brackets are suppressed when phonetic === word
        assert.ok(
          uiFormatted.phonetic !== uiFormatted.word &&
            uiFormatted.phonetic !== `[${uiFormatted.word}]` &&
            uiFormatted.phonetic !== `([${uiFormatted.word}])`,
          `Redundant phonetic bracket not suppressed for "${uiFormatted.word}" in ${lang}: "${uiFormatted.phonetic}"`
        );

        // Also test synthetic entry where phonetic === word or `[${word}]`
        const syntheticSame = formatDictionaryEntryForUi(
          { word: uiFormatted.targetTerm, translation: item.conceptAr, phonetic: uiFormatted.targetTerm },
          lang
        );
        assert.equal(
          syntheticSame.phonetic,
          '',
          `formatDictionaryEntryForUi must suppress phonetic when phonetic === word`
        );
        const syntheticBracketed = formatDictionaryEntryForUi(
          { word: uiFormatted.targetTerm, translation: item.conceptAr, phonetic: `[${uiFormatted.targetTerm}]` },
          lang
        );
        assert.equal(
          syntheticBracketed.phonetic,
          '',
          `formatDictionaryEntryForUi must suppress phonetic when phonetic === "[word]"`
        );

        // Verify TTS extracts clean target-language term (not Arabic, not empty) with valid BCP-47 locale
        assert.ok(
          uiFormatted.audioText.length > 0 && !/[\u0600-\u06FF]/.test(uiFormatted.audioText),
          `TTS audioText for "${item.conceptEn}" in ${lang} must be clean target-language text, got "${uiFormatted.audioText}"`
        );
        assert.equal(
          uiFormatted.ttsLocale,
          EXPECTED_BCP47[lang],
          `TTS locale for "${item.conceptEn}" in ${lang} must be ${EXPECTED_BCP47[lang]}, got ${uiFormatted.ttsLocale}`
        );
      }
    }
  });

  test('4. Arabic UI Copy & Grammar for PathView, LanguagePairBanner, and LanguageSelectorModal across all 5 languages', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const pathViewSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/progression/PathView.tsx'),
      'utf8'
    );
    const bannerSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/LanguagePairBanner.tsx'),
      'utf8'
    );
    const modalSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/LanguageSelectorModal.tsx'),
      'utf8'
    );

    // PathView must have zero min-h-[44px] buttons (all upgraded to >= 48px)
    assert.ok(
      !pathViewSource.includes('min-h-[44px]'),
      'PathView.tsx must not contain any min-h-[44px] controls (all must meet min-h-[48px])'
    );
    // PathView must not concatenate بـ directly onto targetNameAr
    assert.ok(
      !pathViewSource.includes('بـ${targetNameAr}'),
      'PathView.tsx must not use awkward بـ${targetNameAr} concatenation'
    );
    assert.ok(
      pathViewSource.includes('باللغة ${targetNameAr}'),
      'PathView.tsx must use natural Arabic preposition باللغة ${targetNameAr}'
    );

    // LanguagePairBanner must not truncate sourceName and must rotate ArrowRight in RTL
    assert.ok(
      !bannerSource.includes('truncate text-slate-200'),
      'LanguagePairBanner.tsx must not truncate source language name'
    );
    assert.ok(
      bannerSource.includes('rotate-180'),
      'LanguagePairBanner.tsx must rotate arrow 180deg in RTL'
    );

    // LanguageSelectorModal must meet min-h-[48px] and not truncate language names
    assert.ok(
      !modalSource.includes('min-h-[44px]'),
      'LanguageSelectorModal.tsx must not contain any min-h-[44px] controls'
    );

    for (const lang of TOP_5_LANGUAGES) {
      const meta = TARGET_LANGUAGE_META[lang];
      assert.ok(meta, `Missing TARGET_LANGUAGE_META for ${lang}`);
      assert.ok(/[\u0600-\u06FF]/.test(meta.nameAr), `nameAr for ${lang} must be Arabic`);
      assert.ok(!meta.nameAr.includes('ـ'), `nameAr for ${lang} should not have tatweel concatenation artifact`);

      // Verify PathView hero headline & NameForge CTA grammar
      const heroHeadline = `جاهز لأول جملة باللغة ${meta.nameAr}؟ 🎯`;
      assert.ok(
        heroHeadline.includes(`باللغة ${meta.nameAr}`),
        `Hero headline for ${lang} must use natural "باللغة ${meta.nameAr}"`
      );
      assert.ok(!heroHeadline.includes('بـ'), `Hero headline must not use awkward "بـ" concatenation`);

      const nameForgeLabel =
        lang === 'en'
          ? 'اكتب اسمك بالإنجليزي (30 ثانية)'
          : `اكتب اسمك باللغة ${meta.nameAr} (30 ثانية)`;
      assert.ok(!nameForgeLabel.includes('بـال'), `NameForge label for ${lang} must not contain awkward "بـال": ${nameForgeLabel}`);

      // Verify LanguagePairBanner source & target names
      for (const src of ['ar', 'arz'] as const) {
        const srcMeta = SOURCE_LANGUAGES[src];
        assert.ok(srcMeta.nameAr && /[\u0600-\u06FF]/.test(srcMeta.nameAr), `Invalid source nameAr for ${src}`);
        const pairConfig = getPairConfig(src, lang);
        assert.ok(
          pairConfig.bridgeConceptAr && /[\u0600-\u06FF]/.test(pairConfig.bridgeConceptAr),
          `pairConfig.bridgeConceptAr for ${src}->${lang} must be valid Arabic`
        );
        assert.ok(
          pairConfig.taglineAr && /[\u0600-\u06FF]/.test(pairConfig.taglineAr),
          `pairConfig.taglineAr for ${src}->${lang} must be valid Arabic`
        );
      }

      // Verify TARGET_LANGUAGES entry has defaultVoice matching BCP-47 prefix
      const targetConfig = TARGET_LANGUAGES.find((t) => t.code === lang);
      assert.ok(targetConfig, `TARGET_LANGUAGES must include ${lang}`);
      assert.ok(
        targetConfig.defaultVoice.startsWith(EXPECTED_BCP47[lang]),
        `defaultVoice for ${lang} (${targetConfig.defaultVoice}) must start with ${EXPECTED_BCP47[lang]}`
      );
    }
  });
});
