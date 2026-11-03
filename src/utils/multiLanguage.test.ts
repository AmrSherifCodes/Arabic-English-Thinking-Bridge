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

  assert.equal(isValidPair('fr', 'en'), false, 'Unsupported language must be false');
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
