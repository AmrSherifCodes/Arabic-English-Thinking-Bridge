import test from 'node:test';
import assert from 'node:assert/strict';
import { API_QUOTA_LIMIT_EVENT, consumeDailyApiQuota } from './apiQuota';

test('daily AI quota allows 50 requests, then blocks and notifies the app', () => {
  const originalWindow = globalThis.window;
  const values = new Map<string, string>();
  let limitEvents = 0;
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
    dispatchEvent: (event: Event) => {
      if (event.type === API_QUOTA_LIMIT_EVENT) limitEvents += 1;
      return true;
    },
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });

  try {
    for (let request = 0; request < 50; request += 1) {
      assert.equal(consumeDailyApiQuota(), true, `request ${request + 1} should be allowed`);
    }

    assert.equal(consumeDailyApiQuota(), false);
    assert.equal(limitEvents, 1);
    assert.deepEqual(JSON.parse(values.get('tb.dailyApiUsage') || '{}'), {
      date: new Date().toISOString().slice(0, 10),
      count: 50,
    });
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
  }
});
