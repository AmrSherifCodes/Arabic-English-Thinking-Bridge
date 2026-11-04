import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPlatformInfo, shareAdapter, storageAdapter } from './adapter';

test('platform detection is safe without a browser window', () => {
  assert.deepEqual(getPlatformInfo(), {
    os: 'web',
    isPWA: false,
    isCapacitor: false,
    isTauri: false,
  });
});

test('storage adapter keeps values in memory when browser storage is unavailable', () => {
  const key = `platform-adapter-test-${Date.now()}`;
  storageAdapter.setItem(key, 'saved');
  assert.equal(storageAdapter.getItem(key), 'saved');
  storageAdapter.removeItem(key);
  assert.equal(storageAdapter.getItem(key), null);
});

test('share adapter falls back to copying the URL', async () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const copied: string[] = [];

  try {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { clipboard: { writeText: async (value: string) => copied.push(value) } },
    });

    const result = await shareAdapter({ title: 'Title', text: 'Text', url: 'https://example.com' });
    assert.deepEqual(result, { method: 'clipboard', ok: true });
    assert.deepEqual(copied, ['https://example.com']);
  } finally {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    } else {
      Reflect.deleteProperty(globalThis, 'navigator');
    }
  }
});