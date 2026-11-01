import test from 'node:test';
import assert from 'node:assert/strict';
import middleware, { getClientIp, checkMemoryRateLimit, memoryLimiter } from '../middleware.ts';

test('1. Middleware getClientIp extracts authoritative client IP according to Vercel specification', () => {
  // Case A: x-real-ip takes highest priority
  const reqA = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    headers: {
      'x-real-ip': '198.51.100.22',
      'x-vercel-forwarded-for': '203.0.113.1, 10.0.0.1',
      'x-forwarded-for': '192.0.2.1'
    }
  });
  assert.equal(getClientIp(reqA), '198.51.100.22');

  // Case B: x-vercel-forwarded-for returns client IP from parts[0]
  const reqB = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    headers: {
      'x-vercel-forwarded-for': '198.51.100.33, 10.0.0.1'
    }
  });
  assert.equal(getClientIp(reqB), '198.51.100.33');

  // Case C: standard x-forwarded-for returns client IP from parts[0]
  const reqC = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    headers: {
      'x-forwarded-for': '198.51.100.44, 10.0.0.1'
    }
  });
  assert.equal(getClientIp(reqC), '198.51.100.44');

  // Case D: fallback default
  const reqD = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini');
  assert.equal(getClientIp(reqD), '127.0.0.1');
});

test('2. Middleware rate limiter blocks IP after 20 requests in 1 minute window', () => {
  const testIp = '198.51.100.77';
  memoryLimiter.delete(testIp);

  for (let i = 0; i < 20; i++) {
    const allowed = checkMemoryRateLimit(testIp);
    assert.equal(allowed, true, `Request ${i + 1} should be allowed`);
  }

  // 21st request must be rejected
  const blocked = checkMemoryRateLimit(testIp);
  assert.equal(blocked, false, 'Request 21 must exceed rate limit');

  // Clean up
  memoryLimiter.delete(testIp);
});

test('3. Middleware memory limiter evicts expired records when exceeding 5000 entries', () => {
  const pastTime = Date.now() - 500;
  for (let i = 0; i < 5050; i++) {
    memoryLimiter.set(`mw-test-ip-${i}`, {
      count: 1,
      resetAt: pastTime
    });
  }
  assert.ok(memoryLimiter.size > 5000);

  // Calling checkMemoryRateLimit triggers map pruning
  checkMemoryRateLimit('mw-cleanup-trigger');
  assert.ok(memoryLimiter.size <= 5000, `Expected memoryLimiter size <= 5000, got ${memoryLimiter.size}`);

  memoryLimiter.clear();
});

test('4. Middleware OPTIONS preflight bypasses rate limiter and sets x-middleware-next: 1', async () => {
  const req = new Request('https://arabicenglishthinkingbridge.vercel.app/api/gemini', {
    method: 'OPTIONS',
    headers: {
      origin: 'https://localhost'
    }
  });

  const res = await middleware(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-middleware-next'), '1');
});
