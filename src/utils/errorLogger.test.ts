import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_VERSION,
  ERROR_LOG_STORAGE_KEY,
  MAX_ERROR_LOG_ENTRIES,
  loadErrorLog,
  recordLocalError,
  sanitizeDiagnosticText,
  sendApprovedErrorReport,
  type StorageLike,
} from './errorLogger';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

describe('errorLogger (v8.0.0 Zero-PII Local Error Buffer)', () => {
  it('1. Sanitizes emails, PINs, tokens, JWTs, and webhook URLs without leaking PII', () => {
    const storage = createMemoryStorage();
    const rawMsg =
      'Failed for user test.user@example.com with pin=1234 Bearer abc.def.ghi ' +
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature123 ' +
      'https://discord.com/api/webhooks/123456/super-secret-token';

    const entry = recordLocalError(
      {
        source: 'react',
        message: rawMsg,
        stack: 'Error: boom\n  at render (/app?token=secret123&email=a@b.com:12:4)',
        route: '/app?pin=9999&token=xyz',
        viewportWidth: 390,
        theme: 'midnight',
        perfMode: 'lite',
      },
      storage
    );

    assert.equal(entry.appVersion, APP_VERSION);
    assert.equal(entry.appVersion, '8.0.0');
    assert.equal(entry.route, '/app');
    assert.equal(entry.viewportWidth, 390);
    assert.equal(entry.theme, 'midnight');
    assert.equal(entry.perfMode, 'lite');

    assert.equal(entry.message.includes('test.user@example.com'), false);
    assert.equal(entry.message.includes('1234'), false);
    assert.equal(entry.message.includes('super-secret-token'), false);
    assert.equal(entry.message.includes('signature123'), false);
    assert.equal(entry.stack.includes('secret123'), false);
    assert.equal(entry.stack.includes('a@b.com'), false);

    const truncated = sanitizeDiagnosticText('a'.repeat(500), 50);
    assert.ok(truncated.length <= 50);
  });

  it('2. Enforces the 15-entry cap in localStorage (tb.errorLog.v1)', () => {
    const storage = createMemoryStorage();
    for (let i = 1; i <= 20; i++) {
      recordLocalError({ source: 'window.onerror', message: `Error #${i}` }, storage);
    }

    const saved = loadErrorLog(storage);
    assert.equal(saved.length, MAX_ERROR_LOG_ENTRIES);
    assert.equal(saved.length, 15);
    assert.equal(saved[0].message, 'Error #6');
    assert.equal(saved[saved.length - 1].message, 'Error #20');
    assert.ok(storage.getItem(ERROR_LOG_STORAGE_KEY));
  });

  it('3. Never auto-sends on recordLocalError and only transmits & clears after explicit approval', async () => {
    const storage = createMemoryStorage();
    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;

    globalThis.fetch = (async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    try {
      recordLocalError({ source: 'unhandledrejection', message: 'Network timeout' }, storage);
      assert.equal(fetchCalls, 0, 'recordLocalError must NEVER auto-send errors');
      assert.equal(loadErrorLog(storage).length, 1);

      // Failed send preserves local queue
      const failRes = await sendApprovedErrorReport({
        storage,
        fetchImpl: (async () => new Response(JSON.stringify({ ok: false, error: 'RATE_LIMITED' }), { status: 429 })) as typeof fetch,
      });
      assert.equal(failRes.ok, false);
      assert.equal(failRes.status, 429);
      assert.equal(loadErrorLog(storage).length, 1, 'Queue must be preserved on non-200 response');

      // Explicit user-approved send clears local queue on 200 OK
      let sentUrl = '';
      const okRes = await sendApprovedErrorReport({
        storage,
        fetchImpl: (async (input: RequestInfo | URL) => {
          sentUrl = String(input);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }) as typeof fetch,
      });
      assert.equal(okRes.ok, true);
      assert.equal(sentUrl, '/api/report-error');
      assert.equal(loadErrorLog(storage).length, 0, 'Queue must clear after 200 OK');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
