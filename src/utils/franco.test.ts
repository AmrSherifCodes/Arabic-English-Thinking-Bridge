import test from 'node:test';
import assert from 'node:assert/strict';
import { isFranco, francoToArabic } from './franco';

test('isFranco detects Egyptian Franco-Arabic correctly', () => {
  assert.equal(isFranco('ya basha el 3ameel mesh rady yeb3at'), true);
  assert.equal(isFranco('delwa2ty feen el data?'), true);
  assert.equal(isFranco('Hello how are you doing today?'), false);
  assert.equal(isFranco('العميل مأخر الداتا'), false);
});

test('francoToArabic converts numbers and common words', () => {
  const converted = francoToArabic('mesh 3ameel');
  assert.ok(converted.includes('مش'));
  assert.ok(converted.includes('عميل'));
});
