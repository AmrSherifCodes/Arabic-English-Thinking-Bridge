import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCorporateBridgeOffline } from './corporateBridgeOffline';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

test('IT presets: no Arabic in english and labels are Cortese/Diretto/Esecutivo', () => {
  const result = buildCorporateBridgeOffline('بيماطل في الداتا والرد', 'it');
  assert.equal(result.tones.polite.label, 'Cortese');
  assert.equal(result.tones.assertive.label, 'Diretto');
  assert.equal(result.tones.executive.label, 'Esecutivo');
  assert.ok(!ARABIC_REGEX.test(result.tones.polite.english), `Arabic in polite: ${result.tones.polite.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.assertive.english), `Arabic in assertive: ${result.tones.assertive.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.executive.english), `Arabic in executive: ${result.tones.executive.english}`);
});

test('IT generic: no Arabic and no raw input substring', () => {
  const rawInput = 'العميل مش عاجبه الشغل وبيشتكي كتير';
  const result = buildCorporateBridgeOffline(rawInput, 'it');
  assert.ok(!ARABIC_REGEX.test(result.tones.polite.english), `Arabic in generic polite: ${result.tones.polite.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.assertive.english), `Arabic in generic assertive: ${result.tones.assertive.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.executive.english), `Arabic in generic executive: ${result.tones.executive.english}`);
  assert.ok(!result.tones.polite.english.includes('العميل'), 'Raw Arabic input string leaked into Italian polite output');
});
