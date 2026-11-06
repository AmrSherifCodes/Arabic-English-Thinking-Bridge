import { test, mock } from 'node:test';
import assert from 'node:assert';
import { KeyVault } from './KeyVault.js';

// Setup basic global DOM mocks since this runs in Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    _data: {} as Record<string, string>,
    getItem(key: string) { return this._data[key] || null; },
    setItem(key: string, val: string) { this._data[key] = val; },
    removeItem(key: string) { delete this._data[key]; },
    clear() { this._data = {}; },
    length: 0,
    key(index: number) { return null; }
  };
}

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto').webcrypto;
}

test('KeyVault derived key is non-extractable', async () => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await KeyVault.deriveKey('super-secret-passphrase', salt);
  assert.strictEqual(key.extractable, false, 'Derived key must have extractable === false');
});

test('KeyVault decrypt with wrong passphrase returns null', async () => {
  localStorage.clear();
  await KeyVault.encryptAndStore('my-api-key', 'correct-password');

  const decrypted = await KeyVault.decrypt('wrong-password');
  assert.strictEqual(decrypted, null, 'Should return null when passphrase is wrong');
});

test('KeyVault ciphertext does not contain plaintext key', async () => {
  localStorage.clear();
  const rawKey = 'test-gemini-api-key-12345';
  await KeyVault.encryptAndStore(rawKey, 'mypassword');

  const storedStr = localStorage.getItem('tb_secure_vault');
  assert.ok(storedStr, 'Vault should be written to localStorage');

  assert.strictEqual(storedStr.includes(rawKey), false, 'Ciphertext bundle MUST NOT contain the plaintext key as a substring');

  // Verify it decrypts back correctly with right password
  const recovered = await KeyVault.decrypt('mypassword');
  assert.strictEqual(recovered, rawKey);
});
