import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getClientIp as getGeminiClientIp,
  FALLBACK_MODELS,
  MODEL,
  generateContentWithFallback
} from './gemini.js';
import { getClientIp as getMiddlewareClientIp } from '../middleware.ts';

// ---------------------------------------------------------------------------
// 1. Models Configuration & 404 Skip Tests
// ---------------------------------------------------------------------------
test('Models config: default model is gemini-3.6-flash and fallbacks exclude retired 404 models', () => {
  assert.equal(MODEL, 'gemini-3.6-flash');

  const retired404Models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash'];
  for (const retired of retired404Models) {
    assert.ok(
      !FALLBACK_MODELS.includes(retired),
      `FALLBACK_MODELS must not include 404 model ${retired}`
    );
  }

  assert.ok(FALLBACK_MODELS.includes('gemini-3.6-flash'));
  assert.ok(FALLBACK_MODELS.includes('gemini-2.5-flash'));
  assert.ok(FALLBACK_MODELS.includes('gemini-2.5-flash-lite'));
  assert.ok(FALLBACK_MODELS.includes('gemini-flash-lite-latest'));
  assert.ok(FALLBACK_MODELS.includes('gemini-3.5-flash-lite'));
});

test('Models runtime: generateContentWithFallback skips 404 models immediately without burning timeout', async () => {
  const queriedModels = [];
  const mockAi = {
    models: {
      async generateContent({ model, config }) {
        assert.equal(config.maxOutputTokens, 250);
        assert.equal(config.temperature, 0.7);
        queriedModels.push(model);
        if (model === 'gemini-3.6-flash') {
          const err = new Error('Model gemini-3.6-flash was not found (404 NOT_FOUND).');
          err.status = 404;
          throw err;
        }
        return { text: 'Fallback model answered successfully!' };
      }
    }
  };

  const startTime = Date.now();
  const res = await generateContentWithFallback(mockAi, { contents: 'Hello' });
  const duration = Date.now() - startTime;

  assert.equal(res.text, 'Fallback model answered successfully!');
  assert.ok(queriedModels.includes('gemini-3.6-flash'));
  assert.ok(queriedModels.length >= 2, 'Must have attempted fallback model after 404');
  assert.ok(duration < 2000, `Expected fast skip without delay, took ${duration}ms`);
});

// ---------------------------------------------------------------------------
// 2. gemini.js getClientIp Header Combinations
// ---------------------------------------------------------------------------
test('gemini.js getClientIp: Combination 1 — x-real-ip present takes absolute priority', () => {
  const req = {
    headers: {
      'x-real-ip': '203.0.113.10',
      'x-vercel-forwarded-for': '198.51.100.1, 10.0.0.1',
      'x-forwarded-for': '192.0.2.1, 10.0.0.2'
    },
    socket: { remoteAddress: '127.0.0.1' }
  };
  assert.equal(getGeminiClientIp(req), '203.0.113.10');
});

test('gemini.js getClientIp: Combination 2 — x-real-ip missing, x-vercel-forwarded-for is single client IP', () => {
  const req = {
    headers: {
      'x-vercel-forwarded-for': '203.0.113.20',
      'x-forwarded-for': '192.0.2.1'
    },
    socket: { remoteAddress: '127.0.0.1' }
  };
  assert.equal(getGeminiClientIp(req), '203.0.113.20');
});

test('gemini.js getClientIp: Combination 3 — x-real-ip missing, x-vercel-forwarded-for has multiple IPs (takes first)', () => {
  const req = {
    headers: {
      'x-vercel-forwarded-for': '203.0.113.30, 10.0.0.1, 10.0.0.2',
      'x-forwarded-for': '192.0.2.1'
    },
    socket: { remoteAddress: '127.0.0.1' }
  };
  assert.equal(getGeminiClientIp(req), '203.0.113.30');
});

test('gemini.js getClientIp: Combination 4 — only x-forwarded-for present with multiple IPs (takes first)', () => {
  const req = {
    headers: {
      'x-forwarded-for': '203.0.113.40, 198.51.100.99'
    },
    socket: { remoteAddress: '127.0.0.1' }
  };
  assert.equal(getGeminiClientIp(req), '203.0.113.40');
});

test('gemini.js getClientIp: Combination 5 — all proxy headers missing, falls back to socket remoteAddress', () => {
  const req = {
    headers: {},
    socket: { remoteAddress: '127.0.0.1' }
  };
  assert.equal(getGeminiClientIp(req), '127.0.0.1');
});

test('gemini.js getClientIp: Combination 6 — headers and socket missing, returns unknown', () => {
  const req = {
    headers: {}
  };
  assert.equal(getGeminiClientIp(req), 'unknown');
});

// ---------------------------------------------------------------------------
// 3. middleware.ts getClientIp Header Combinations
// ---------------------------------------------------------------------------
test('middleware.ts getClientIp: Combination 1 — x-real-ip present takes absolute priority', () => {
  const req = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    headers: {
      'x-real-ip': '198.51.100.50',
      'x-vercel-forwarded-for': '203.0.113.1, 10.0.0.1',
      'x-forwarded-for': '192.0.2.1'
    }
  });
  assert.equal(getMiddlewareClientIp(req), '198.51.100.50');
});

test('middleware.ts getClientIp: Combination 2 — x-real-ip missing, x-vercel-forwarded-for takes first IP', () => {
  const req = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    headers: {
      'x-vercel-forwarded-for': '198.51.100.60, 10.0.0.1'
    }
  });
  assert.equal(getMiddlewareClientIp(req), '198.51.100.60');
});

test('middleware.ts getClientIp: Combination 3 — only x-forwarded-for present with comma list, takes first IP', () => {
  const req = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    headers: {
      'x-forwarded-for': '198.51.100.70, 10.0.0.1'
    }
  });
  assert.equal(getMiddlewareClientIp(req), '198.51.100.70');
});

test('middleware.ts getClientIp: Combination 4 — all headers missing, defaults to 127.0.0.1', () => {
  const req = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini');
  assert.equal(getMiddlewareClientIp(req), '127.0.0.1');
});
