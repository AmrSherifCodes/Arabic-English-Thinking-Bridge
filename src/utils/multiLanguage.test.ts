import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurriculum } from '../data/curriculumRegistry';
import { checkAnswerMatch, normalizeCjk } from './transferLogic';
import { isValidPair, SUPPORTED_PAIRS, getPairConfig } from '../data/languages';
import { Exercise } from '../types';

test('1. SUPPORTED_PAIRS defines all required source-to-target language pairs', () => {
  assert.ok(isValidPair('ar', 'en'), 'Arabic -> English must be valid');
  assert.ok(isValidPair('ar', 'de'), 'Arabic -> German must be valid');
  assert.ok(isValidPair('ar', 'ja'), 'Arabic -> Japanese must be valid');
  assert.ok(isValidPair('en', 'de'), 'English -> German must be valid');
  assert.ok(isValidPair('en', 'ja'), 'English -> Japanese must be valid');
  assert.ok(isValidPair('fr', 'ja'), 'French -> Japanese must be valid');
  assert.ok(isValidPair('es', 'ru'), 'Spanish -> Russian must be valid');

  assert.equal(isValidPair('fr', 'fr'), false, 'A language cannot be paired with itself');
});

test('2. getCurriculum returns valid pedagogical phases for Arabic -> English (canonical)', () => {
  const phases = getCurriculum('ar', 'en');
  assert.ok(phases.length >= 3, 'Must have at least 3 phases');
  assert.ok(phases[0].lessons.length > 0, 'Phase 1 must have lessons');
  const ex = phases[0].lessons[0].exercises[0];
  assert.ok(ex.arabicThought.length > 0, 'Exercise must have arabicThought');
  assert.ok(ex.englishTarget.length > 0, 'Exercise must have englishTarget');
});

test('3. getCurriculum returns German curriculum with V2 rules and Accusative case', () => {
  const arDePhases = getCurriculum('ar', 'de');
  assert.ok(arDePhases.length >= 1, 'German curriculum must have phases');
  const lesson1 = arDePhases[0].lessons[0];
  assert.match(lesson1.title, /V2/i, 'First German lesson must cover V2 rule');

  const ex1 = lesson1.exercises[0];
  assert.equal(ex1.targetSentence, 'Heute trinke ich Kaffee');
  assert.ok(ex1.wordChips.includes('trinke'));
  assert.ok(ex1.wordChips.includes('Heute'));

  // Test German answer matching (case-insensitive and alternative matching)
  const match1 = checkAnswerMatch('Heute trinke ich Kaffee', ex1);
  assert.equal(match1.isCorrect, true);

  const match2 = checkAnswerMatch('heute trinke ich kaffee', ex1);
  assert.equal(match2.isCorrect, true);

  // English -> German version
  const enDePhases = getCurriculum('en', 'de');
  assert.equal(enDePhases[0].lessons[0].exercises[0].sourceThought, 'Today I am drinking coffee');
});

test('4. getCurriculum returns Japanese curriculum with SOV, Kanji, Hiragana and Romaji', () => {
  const jaPhases = getCurriculum('ar', 'ja');
  assert.ok(jaPhases.length >= 1, 'Japanese curriculum must have phases');
  const lesson1 = jaPhases[0].lessons[0];
  assert.match(lesson1.title, /SOV/i, 'First Japanese lesson must cover SOV');

  const ex1 = lesson1.exercises[0];
  assert.equal(ex1.targetSentence, '私は学生です');
  assert.equal(ex1.romajiTarget, 'Watashi wa gakusei desu');
  assert.ok(ex1.furiganaTarget && ex1.furiganaTarget.includes('<ruby>'));

  // Test Japanese matching with Kanji
  const kanjiMatch = checkAnswerMatch('私は学生です', ex1);
  assert.equal(kanjiMatch.isCorrect, true, 'Matches pure Kanji');

  // Test Japanese matching with Hiragana
  const hiraganaMatch = checkAnswerMatch('わたしはがくせいです', ex1);
  assert.equal(hiraganaMatch.isCorrect, true, 'Matches Hiragana alternative');

  // Test Japanese matching with Romaji
  const romajiMatch = checkAnswerMatch('Watashi wa gakusei desu', ex1);
  assert.equal(romajiMatch.isCorrect, true, 'Matches Romaji target');
});

test('5. normalizeCjk handles Japanese spacing and punctuation seamlessly', () => {
  assert.equal(normalizeCjk('私 は 学生 です。'), '私は学生です');
  assert.equal(normalizeCjk('水 を 飲みます！'), '水を飲みます');
});

test('6. getPairConfig returns complete metadata and graceful fallbacks', () => {
  const deConfig = getPairConfig('ar', 'de');
  assert.match(deConfig.titleAr, /ألماني/);
  assert.match(deConfig.taglineAr, /الألمانية/);

  const jaConfig = getPairConfig('en', 'ja');
  assert.match(jaConfig.titleEn, /Japanese/);

  // Fallback
  const fallback = getPairConfig('ar' as any, 'xyz' as any);
  assert.equal(fallback.id, 'ar-en');
});

test('7. GERMAN_DICTIONARY provides valid dictionary entries and search', async () => {
  const { searchTargetDictionary, getTargetDictionaryAsync } = await import('../data/dictionaries');
  await getTargetDictionaryAsync('de');
  const results = searchTargetDictionary('haus', 'de', 'ar');
  assert.ok(results.length > 0, 'Must find entries for German');
});

test('8. JAPANESE_DICTIONARY provides valid dictionary entries and search', async () => {
  const { searchTargetDictionary, getTargetDictionaryAsync } = await import('../data/dictionaries');
  await getTargetDictionaryAsync('ja');
  const results = searchTargetDictionary('hon', 'ja', 'ar');
  assert.ok(results.length > 0, 'Must find entries for Japanese');
});

test('9. GERMAN_PREBUILT_DECKS and JAPANESE_PREBUILT_DECKS provide valid flashcards', async () => {
  const { GERMAN_PREBUILT_DECKS } = await import('../data/curriculum/germanDecks');
  const { JAPANESE_PREBUILT_DECKS } = await import('../data/curriculum/japaneseDecks');

  assert.ok(GERMAN_PREBUILT_DECKS.length >= 2, 'Must have at least 2 German prebuilt decks');
  assert.ok(GERMAN_PREBUILT_DECKS[0].cards.length > 0, 'German deck must have cards');

  assert.ok(JAPANESE_PREBUILT_DECKS.length >= 2, 'Must have at least 2 Japanese prebuilt decks');
  assert.ok(JAPANESE_PREBUILT_DECKS[0].cards.length > 0, 'Japanese deck must have cards');
});

test('10. getTargetDictionaryAsync loads non-empty dictionaries dynamically for all 15 languages', async () => {
  const { getTargetDictionaryAsync, getTargetDictionary } = await import('../data/dictionaries');
  const langs = ['de', 'ja', 'es', 'fr', 'zh', 'hi', 'ru', 'pt', 'it', 'el', 'ar', 'arz', 'apc', 'afb', 'ary'];

  for (const lang of langs) {
    const dict = await getTargetDictionaryAsync(lang);
    assert.ok(dict.length > 50, `Dictionary for ${lang} must have > 50 entries, got ${dict.length}`);
    assert.equal(getTargetDictionary(lang).length, dict.length, `getTargetDictionary(${lang}) must match cached length`);
  }
});
