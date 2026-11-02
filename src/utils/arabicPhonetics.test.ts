import test from 'node:test';
import assert from 'node:assert/strict';
import { getArabicPhoneticSpelling } from './arabicPhonetics';

test('arabicPhonetics: converts common English words to authentic Arabic spelling', () => {
  assert.equal(getArabicPhoneticSpelling('hello'), 'هيلو');
  assert.equal(getArabicPhoneticSpelling('water'), 'ووتر');
  assert.equal(getArabicPhoneticSpelling('because'), 'بيكوز');
  assert.equal(getArabicPhoneticSpelling('thinking'), 'ثينكينج');
  assert.equal(getArabicPhoneticSpelling('bridge'), 'بريدج');
  assert.equal(getArabicPhoneticSpelling('understand'), 'أندرستاند');
});

test('arabicPhonetics: converts phrases and sentences preserving spaces and punctuation', () => {
  assert.equal(getArabicPhoneticSpelling('good morning'), 'جود مورنينج');
  assert.equal(getArabicPhoneticSpelling('I am learning English'), 'آي آم ليرنينج إنجلش');
  assert.equal(getArabicPhoneticSpelling('Hello! How are you?'), 'هيلو! هاو آر يو?');
});

test('arabicPhonetics: handles unknown words gracefully with phonetic rules', () => {
  const result = getArabicPhoneticSpelling('teleportation');
  assert.ok(result.includes('شن'), 'Should convert tion to شن');
});

