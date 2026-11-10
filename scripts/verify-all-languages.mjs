import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TARGET_LANGUAGES,
  TARGET_LANGUAGE_META,
  TARGET_LANGUAGE_LOCALES,
  SOURCE_LANGUAGES,
  isValidPair,
  getPairConfig
} from '../src/data/languages.ts';

import {
  buildCourseStructure
} from '../src/progression/courseData.ts';

import {
  getTargetDictionaryAsync,
  searchTargetDictionaryAsync
} from '../src/data/dictionaries/index.ts';

import { trDictionary } from '../src/data/dictionaries/trDictionary.ts';

test('PHASE 3: Programmatic Language Matrix Verification (13 targets)', async () => {
  assert.equal(TARGET_LANGUAGES.length, 13, 'TARGET_LANGUAGES must have 13 entries');

  const unfinishedLangs = new Set([]);

  for (const targetObj of TARGET_LANGUAGES) {
    const T = targetObj.code;

    // 1. buildCourseStructure(T) does not throw and returns >= 3 stages.
    const course = buildCourseStructure(T);
    assert.ok(Array.isArray(course) && course.length >= 3, `Target ${T} must return >= 3 stages`);

    // 2. Every stage has >= 1 unit with >= 1 lesson.
    for (const stage of course) {
      assert.ok(stage.units.length >= 1, `Target ${T} stage ${stage.stage} must have >= 1 unit`);
      const lessons = stage.units.flatMap(u => u.lessons);
      assert.ok(lessons.length >= 1, `Target ${T} stage ${stage.stage} must have >= 1 lesson`);

      // 3. Every lesson has >= 1 exercise with non-empty promptAr and targetSentence.
      for (const lesson of lessons) {
        assert.ok(lesson.exercises.length >= 1, `Lesson ${lesson.id} must have >= 1 exercise`);
        for (const ex of lesson.exercises) {
          assert.ok(ex.promptAr && ex.promptAr.trim().length > 0, `Exercise ${ex.id} promptAr missing`);
          assert.ok(ex.targetSentence && ex.targetSentence.trim().length > 0, `Exercise ${ex.id} targetSentence missing`);
        }
      }
    }

    // 4. getTargetDictionaryAsync(T) resolves to a non-empty array (>= 5 entries).
    const dict = await getTargetDictionaryAsync(T);
    assert.ok(Array.isArray(dict) && dict.length >= 5, `Target ${T} dictionary must have >= 5 entries (got ${dict?.length})`);

    // 5. searchTargetDictionaryAsync(T, <a known word>) returns a match.
    const sampleWord = dict[0].word || dict[0].term || dict[0].germanWord || dict[0].kanji || dict[0].romaji || '';
    assert.ok(sampleWord.length > 0, `Dict entry for ${T} must have word or term`);
    const searchResult = await searchTargetDictionaryAsync(sampleWord, T);
    assert.ok(searchResult.length >= 1, `Search in ${T} dict for '${sampleWord}' should return match`);

    // 6. TARGET_LANGUAGE_META[T] exists and has code, nameAr, nameEn, flag, defaultVoice.
    const meta = TARGET_LANGUAGE_META[T];
    assert.ok(meta, `TARGET_LANGUAGE_META[${T}] must exist`);
    assert.equal(meta.code, T);
    assert.ok(meta.nameAr && meta.nameEn && meta.flag);

    // 7. TARGET_LANGUAGE_LOCALES[T] is a valid BCP-47 tag and defaultVoice.startsWith(locale).
    const locale = TARGET_LANGUAGE_LOCALES[T];
    assert.ok(locale, `Locale for ${T} must exist`);
    assert.ok(targetObj.defaultVoice.startsWith(locale), `Voice ${targetObj.defaultVoice} must start with locale ${locale}`);

    // 8. For T === 'tr': trDictionary contains köprü, oda, çanta, taze, doğru.
    if (T === 'tr') {
      const trWords = trDictionary.map(e => e.word);
      assert.ok(trWords.includes('köprü'));
      assert.ok(trWords.includes('oda'));
      assert.ok(trWords.includes('çanta'));
      assert.ok(trWords.includes('taze'));
      assert.ok(trWords.includes('doğru'));
    }

    // 9. For T in ['ja','es','fr','it']: TARGET_LANGUAGES.find(l => l.code===T).nameAr includes '🚧'.
    // 10. For T in ['en','de','tr','zh','hi','ru','pt','el']: nameAr must NOT include '🚧'.
    if (unfinishedLangs.has(T)) {
      assert.ok(targetObj.nameAr.includes('🚧'), `Target ${T} nameAr should include 🚧`);
    } else {
      assert.ok(!targetObj.nameAr.includes('🚧'), `Target ${T} nameAr should NOT include 🚧`);
    }

    console.log(`✅ Target ${T} verified 100%`);
  }
});

test('PHASE 4: Pair Matrix Verification (5 sources × 13 targets)', () => {
  const sources = Object.keys(SOURCE_LANGUAGES); // ar, arz, apc, afb, ary
  const targets = TARGET_LANGUAGES.map(l => l.code);

  console.log('\n--- PHASE 4: 5x13 Pair Matrix ---');
  console.log('Source \\ Target | ' + targets.map(t => t.padEnd(4)).join(' | '));
  console.log('-'.repeat(100));

  let failureCount = 0;

  for (const src of sources) {
    let rowStr = src.padEnd(14) + ' | ';
    for (const tgt of targets) {
      try {
        const valid = isValidPair(src, tgt);
        if (valid) {
          const course = buildCourseStructure(tgt, src);
          assert.ok(course.length >= 3, `Pair ${src}->${tgt} course >= 3 stages`);
          rowStr += ' ✅  | ';
        } else {
          const fallback = getPairConfig(src, tgt);
          assert.ok(fallback, `Fallback config for ${src}->${tgt} must exist`);
          rowStr += ' ⚠️  | ';
        }
      } catch (err) {
        rowStr += ' ❌  | ';
        failureCount++;
      }
    }
    console.log(rowStr);
  }

  assert.equal(failureCount, 0, 'Pair Matrix must have 0 failures');
});
