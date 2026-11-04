import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeStoredGeminiKey, encodeStoredGeminiKey } from './geminiLexicon';

test('Gemini keys are obfuscated in storage and can be decoded', () => {
  const key = 'AIzaSyTestKey123';
  const stored = encodeStoredGeminiKey(key);

  assert.notEqual(stored, key);
  assert.equal(stored.startsWith('base64:'), true);
  assert.equal(decodeStoredGeminiKey(stored), key);
});

test('Gemini key decoder keeps legacy plaintext values compatible', () => {
  assert.equal(decodeStoredGeminiKey('legacy-key'), 'legacy-key');
});
