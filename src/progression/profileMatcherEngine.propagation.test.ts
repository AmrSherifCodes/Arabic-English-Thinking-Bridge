import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLessons } from './profileMatcherEngine';
import { lookupTargetTerm } from '../data/dictionaries';

test('1. sourceLang dimension propagates to lesson IDs and content', () => {
  const arzLessons = getLessons('arz', 'en', 'travel', 'A1');
  const arLessons = getLessons('ar', 'en', 'travel', 'A1');

  const arzIds = arzLessons.map((l) => l.id);
  const arIds = arLessons.map((l) => l.id);

  assert.notDeepEqual(arzIds, arIds, 'arz and ar profile dimensions must not produce identical lesson IDs');
  assert.notEqual(arzLessons[0].sourceThought, arLessons[0].sourceThought, 'arz and ar source thoughts must differ');
});

test('2. targetLang dimension propagates to lesson IDs, target sentences, and dictionary lookups', () => {
  const enLessons = getLessons('arz', 'en', 'corporate', 'A1');
  const deLessons = getLessons('arz', 'de', 'corporate', 'A1');

  const enIds = enLessons.map((l) => l.id);
  const deIds = deLessons.map((l) => l.id);

  assert.notDeepEqual(enIds, deIds, 'en and de target languages must not produce identical lesson IDs');
  assert.notEqual(enLessons[0].targetSentence, deLessons[0].targetSentence, 'target sentences must differ');

  const enBook = lookupTargetTerm('book', 'en');
  const deBook = lookupTargetTerm('book', 'de');
  assert.notDeepEqual(enBook, deBook, 'probe word dictionary lookups must differ between en and de');
});

test('3. focusArea dimension propagates to lesson IDs and vocabulary themes', () => {
  const travelLessons = getLessons('arz', 'en', 'travel', 'A1');
  const corporateLessons = getLessons('arz', 'en', 'corporate', 'A1');

  const travelIds = travelLessons.map((l) => l.id);
  const corporateIds = corporateLessons.map((l) => l.id);

  assert.notDeepEqual(travelIds, corporateIds, 'travel and corporate focus areas must not produce identical lesson IDs');
  assert.notEqual(travelLessons[0].targetSentence, corporateLessons[0].targetSentence, 'exercise target sentences must differ between focus areas');
});

test('4. cefrLevel dimension propagates to lesson IDs and lesson counts', () => {
  const a0Lessons = getLessons('arz', 'en', 'general', 'A0');
  const c2Lessons = getLessons('arz', 'en', 'general', 'C2');

  const a0Ids = a0Lessons.map((l) => l.id);
  const c2Ids = c2Lessons.map((l) => l.id);

  assert.notDeepEqual(a0Ids, c2Ids, 'A0 and C2 CEFR levels must not produce identical lesson IDs');
  assert.notEqual(a0Lessons.length, c2Lessons.length, 'A0 (10) and C2 (40) lesson counts must differ');
});

test('5. dialectSentence test asserts first exercise sourceThought differs between arz, apc, and ar', () => {
  const arz = getLessons('arz', 'en', 'travel', 'A1')[0].sourceThought;
  const apc = getLessons('apc', 'en', 'travel', 'A1')[0].sourceThought;
  const ar = getLessons('ar', 'en', 'travel', 'A1')[0].sourceThought;

  assert.notEqual(arz, apc, 'Egyptian (arz) and Levantine (apc) source thoughts must differ');
  assert.notEqual(arz, ar, 'Egyptian (arz) and MSA (ar) source thoughts must differ');
  assert.notEqual(apc, ar, 'Levantine (apc) and MSA (ar) source thoughts must differ');
});
