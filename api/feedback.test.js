import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { checkFeedbackRateLimit, isAdminAuthorized } from './feedback.js';

test('1. feedback handler returns 503 if database connection is unset', async () => {
  const envBackup = { ...process.env };
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_PRISMA_URL;
  delete process.env.POSTGRES_URL_NON_POOLING;
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;

  let statusCode = 0;
  let body = '';
  const req = { method: 'GET', headers: {} };
  const res = {
    setHeader() {},
    end(str) { body = str; },
    set statusCode(code) { statusCode = code; }
  };

  try {
    await handler(req, res);
    assert.equal(statusCode, 503);
    assert.match(body, /not configured/);
  } finally {
    process.env = envBackup;
  }
});

test('2. feedback handler responds to OPTIONS with 204', async () => {
  let statusCode = 0;
  const req = { method: 'OPTIONS', headers: {} };
  const res = {
    setHeader() {},
    end() {},
    set statusCode(code) { statusCode = code; }
  };

  await handler(req, res);
  assert.equal(statusCode, 204);
});

test('3. feedback handler rejects unauthorized GET requests with 401 when DB is configured', async () => {
  const envBackup = { ...process.env };
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/neondb';
  process.env.FEEDBACK_ADMIN_KEY = 'super-secret-admin-key-2026';

  let statusCode = 0;
  let body = '';
  const req = { method: 'GET', headers: {} };
  const res = {
    setHeader() {},
    end(str) { body = str; },
    set statusCode(code) { statusCode = code; }
  };

  try {
    await handler(req, res);
    assert.equal(statusCode, 401);
    assert.match(body, /Unauthorized/);
  } finally {
    process.env = envBackup;
  }
});

test('4. feedback handler rejects disallowed origins with 403', async () => {
  let statusCode = 0;
  let body = '';
  const req = {
    method: 'POST',
    headers: { origin: 'https://evil-phishing-site.com' },
    body: { rating: 5, message: 'spam' }
  };
  const res = {
    setHeader() {},
    end(str) { body = str; },
    set statusCode(code) { statusCode = code; }
  };

  await handler(req, res);
  assert.equal(statusCode, 403);
  assert.match(body, /Origin not allowed/);
});

test('5. checkFeedbackRateLimit limits repeated submissions per IP', () => {
  const testIp = '198.51.100.99';
  for (let i = 0; i < 5; i++) {
    const allowed = checkFeedbackRateLimit(testIp);
    assert.equal(allowed, true, `Submission ${i + 1} should be allowed`);
  }

  // 6th submission in window must be blocked
  const blocked = checkFeedbackRateLimit(testIp);
  assert.equal(blocked, false, '6th submission must be rate limited');
});
