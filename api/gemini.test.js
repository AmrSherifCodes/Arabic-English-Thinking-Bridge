import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import {
  handler,
  getClientIp,
  checkMemoryRateLimit,
  rateLimits,
  getCorsOrigin,
  ALLOWED_CORS_ORIGINS,
  FALLBACK_MODELS,
  MODEL,
  _cb
} from './gemini.js';

function createMockReq({
  method = 'POST',
  url = '/api/gemini',
  headers = {},
  body = null
} = {}) {
  let stream;
  if (body !== null) {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    stream = Readable.from([Buffer.from(raw, 'utf8')]);
  } else {
    stream = Readable.from([]);
  }

  stream.method = method;
  stream.url = url;
  stream.headers = {
    host: 'arabicenglishthinkingbridge.vercel.app',
    origin: 'https://arabicenglishthinkingbridge.vercel.app',
    ...headers
  };
  stream.socket = { remoteAddress: '127.0.0.1' };
  return stream;
}

function createMockRes() {
  const headers = {};
  let bodyData = '';
  let finished = false;

  return {
    statusCode: 200,
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
    },
    getHeader(key) {
      return headers[key.toLowerCase()];
    },
    end(data) {
      if (data) {
        bodyData = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
      }
      finished = true;
    },
    get headers() {
      return headers;
    },
    get body() {
      return bodyData;
    },
    get json() {
      try {
        return JSON.parse(bodyData);
      } catch {
        return null;
      }
    },
    get isFinished() {
      return finished;
    }
  };
}

test('1. Disallowed origin returns 403 Forbidden with sanitized error', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { origin: 'https://evil.attacker.com' },
    body: { operation: 'explain-error', submitted: 'test', target: 'test' }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.json, {
    error: { code: 'bad-output', message: 'Origin not allowed.' }
  });
});

test('Custom-domain origins are explicitly allowed and used as the CORS fallback', () => {
  for (const origin of ['https://amrsherif.localhost.cc', 'https://www.amrsherif.localhost.cc']) {
    assert.equal(ALLOWED_CORS_ORIGINS.has(origin), true);
    assert.equal(getCorsOrigin(origin), origin);
  }
  assert.equal(getCorsOrigin('https://untrusted.example'), 'https://tb-eg.vercel.app');
});

test('1b. Evil Vercel preview origin (https://evil-attacker.vercel.app) is rejected with 403 Forbidden while https://tb-eg.vercel.app is allowed', async () => {
  const evilReq = createMockReq({
    method: 'POST',
    headers: { origin: 'https://evil-attacker.vercel.app' },
    body: { operation: 'explain-error', submitted: 'test', target: 'test' }
  });
  const evilRes = createMockRes();
  await handler(evilReq, evilRes);
  assert.equal(evilRes.statusCode, 403);

  const validReq = createMockReq({
    method: 'OPTIONS',
    headers: { origin: 'https://tb-eg.vercel.app' }
  });
  const validRes = createMockRes();
  await handler(validReq, validRes);
  assert.equal(validRes.statusCode, 204);
  assert.equal(validRes.getHeader('access-control-allow-origin'), 'https://tb-eg.vercel.app');
});

test('2. Android origin (https://localhost) preflight OPTIONS returns 204 with CORS headers', async () => {
  const req = createMockReq({
    method: 'OPTIONS',
    headers: {
      origin: 'https://localhost',
      'access-control-request-method': 'POST'
    }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.getHeader('access-control-allow-origin'), 'https://localhost');
  assert.equal(res.getHeader('access-control-allow-methods'), 'GET, POST, OPTIONS');
  assert.ok(res.isFinished);
});

test('3. Android origin (capacitor://localhost) receives exact matched CORS header', async () => {
  const allowed = getCorsOrigin('capacitor://localhost');
  assert.equal(allowed, 'capacitor://localhost');

  const req = createMockReq({
    method: 'OPTIONS',
    headers: { origin: 'capacitor://localhost' }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.getHeader('access-control-allow-origin'), 'capacitor://localhost');
});

test('POST requests without a user API key are rejected with BYOK_REQUIRED', async () => {
  const req = createMockReq({
    method: 'POST',
    body: {
      operation: 'explain-error',
      submitted: 'test',
      target: 'test',
      userApiKey: 'body-only-key-is-not-accepted',
    },
    headers: { 'x-user-api-key': undefined, 'x-user-gemini-key': 'alias-only-key' },
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.json, {
    error: 'BYOK_REQUIRED',
    message: 'You must provide your own Gemini API key.',
  });
});

test('4. explain-error rejects oversized submitted text (>500 chars) with 400 Bad Request', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { 'x-user-api-key': 'test-user-key' },
    body: {
      operation: 'explain-error',
      submitted: 'A'.repeat(501),
      target: 'Short target sentence.'
    }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.json?.error?.code, 'bad-output');
  assert.ok(res.json?.error?.message.includes('Input lengths exceed allowed maximum'));
});

test('5. explain-error rejects oversized conceptId (>80 chars) with 400 Bad Request', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { 'x-user-api-key': 'test-user-key' },
    body: {
      operation: 'explain-error',
      conceptId: 'c'.repeat(81),
      submitted: 'I go to school.',
      target: 'I went to school.'
    }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.json?.error?.code, 'bad-output');
});

test('6. Malformed JSON body in POST returns 400 Bad Request without leaking server details', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { 'x-user-api-key': 'test-user-key' },
    body: '{"invalid_json: unclosed'
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.json, {
    error: { code: 'bad-output', message: 'Invalid request body.' }
  });
});

test('7. IP extraction gives priority to x-real-ip and uses first entry of x-vercel-forwarded-for', () => {
  // Case A: x-real-ip present
  const reqA = {
    headers: {
      'x-real-ip': '203.0.113.195',
      'x-vercel-forwarded-for': '198.51.100.1, 198.51.100.2',
      'x-forwarded-for': '192.0.2.1'
    }
  };
  assert.equal(getClientIp(reqA), '203.0.113.195');

  // Case B: x-real-ip absent, x-vercel-forwarded-for has multiple IPs (client IP is first)
  const reqB = {
    headers: {
      'x-vercel-forwarded-for': '203.0.113.50, 10.0.0.1',
      'x-forwarded-for': '192.0.2.1, 10.0.0.1'
    }
  };
  assert.equal(getClientIp(reqB), '203.0.113.50');

  // Case C: only x-forwarded-for present (client IP is first)
  const reqC = {
    headers: {
      'x-forwarded-for': '203.0.113.99, 70.0.0.1'
    }
  };
  assert.equal(getClientIp(reqC), '203.0.113.99');

  // Case D: fallback to socket address
  const reqD = {
    headers: {},
    socket: { remoteAddress: '127.0.0.1' }
  };
  assert.equal(getClientIp(reqD), '127.0.0.1');
});

test('8. Memory rate limiter prunes map when exceeding 5000 entries to prevent memory exhaustion', () => {
  // Seed map with expired entries
  const pastTime = Date.now() - 1000;
  for (let i = 0; i < 5050; i++) {
    rateLimits.set(`test-ip-${i}`, {
      minuteCount: 1,
      minuteResetAt: pastTime,
      dayCount: 1,
      dayResetAt: pastTime
    });
  }
  assert.ok(rateLimits.size > 5000);

  // Calling checkMemoryRateLimit triggers cleanup of expired records
  checkMemoryRateLimit('new-test-ip-trigger');
  assert.ok(rateLimits.size <= 5000, `Expected rateLimits size <= 5000, got ${rateLimits.size}`);

  // Clean up test keys
  rateLimits.clear();
});

test('9. Active Gemini models are valid and exclude retired 404 models', () => {
  const retiredModels = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash'];
  for (const retired of retiredModels) {
    assert.ok(!FALLBACK_MODELS.includes(retired), `FALLBACK_MODELS should not contain retired model ${retired}`);
  }
  assert.ok(FALLBACK_MODELS.includes('gemini-3.6-flash'));
  assert.ok(FALLBACK_MODELS.includes('gemini-2.5-flash'));
  assert.ok(FALLBACK_MODELS.includes('gemini-2.5-flash-lite'));
});


test('10. transcribe operation rejects empty audio data with 400 Bad Request', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { 'x-user-api-key': 'test-user-key' },
    body: { operation: 'transcribe', audioData: '' }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.json, {
    error: { code: 'empty-audio', message: 'Audio data is required.' }
  });
});


test('11. corporate-bridge operation rejects empty thought with 400 Bad Request', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { 'x-user-api-key': 'test-user-key' },
    body: { operation: 'corporate-bridge', thought: '' }
  });
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.json, {
    error: { code: 'empty-input', message: 'Thought is required and cannot exceed 500 characters.' }
  });
});


test('12. corporate-bridge prompt reflects targetLang', async () => {
  const orig = _cb.generateContentWithFallback;
  let captured = '';
  _cb.generateContentWithFallback = async (_client, params) => {
    captured = typeof params?.contents === 'string' ? params.contents : JSON.stringify(params?.contents);
    return { text: JSON.stringify({ tones: { polite: { english: 'ok' }, assertive: { english: 'ok' }, executive: { english: 'ok' } } }) };
  };
  try {
    let req = createMockReq({
      method: 'POST',
      headers: { 'x-user-api-key': 'test-user-key' },
      body: { operation: 'corporate-bridge', thought: 'thought-de', targetLang: 'de' }
    });
    let res = createMockRes();
    await handler(req, res);
    assert.match(captured, /German|Deutsch/);

    req = createMockReq({
      method: 'POST',
      headers: { 'x-user-api-key': 'test-user-key' },
      body: { operation: 'corporate-bridge', thought: 'thought-ja', targetLang: 'ja' }
    });
    res = createMockRes();
    await handler(req, res);
    assert.match(captured, /Japanese/);

    req = createMockReq({
      method: 'POST',
      headers: { 'x-user-api-key': 'test-user-key' },
      body: { operation: 'corporate-bridge', thought: 'thought-en' }
    });
    res = createMockRes();
    await handler(req, res);
    assert.match(captured, /English/);
  } finally {
    _cb.generateContentWithFallback = orig;
  }
});
