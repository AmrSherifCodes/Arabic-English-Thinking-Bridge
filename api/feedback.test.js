import test from 'node:test';
import assert from 'node:assert/strict';
import handler, {
  ALLOWED_CORS_ORIGINS,
  checkFeedbackRateLimit,
  getCorsOrigin,
  isAdminAuthorized,
} from './feedback.js';

test('feedback API allows both custom-domain origins and uses the primary domain as fallback', () => {
  for (const origin of ['https://amrsherif.localhost.cc', 'https://www.amrsherif.localhost.cc']) {
    assert.equal(ALLOWED_CORS_ORIGINS.has(origin), true);
    assert.equal(getCorsOrigin(origin), origin);
  }
  assert.equal(getCorsOrigin('https://untrusted.example'), 'https://amrsherif.localhost.cc');
});

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

test('6. isAdminAuthorized validates valid admin keys via x-admin-key and Bearer headers', () => {
  const envBackup = { ...process.env };
  process.env.FEEDBACK_ADMIN_KEY = 'super-secret-admin-key-2026';

  try {
    const validHeaderReq = { headers: { 'x-admin-key': 'super-secret-admin-key-2026' } };
    assert.equal(isAdminAuthorized(validHeaderReq), true);

    const validBearerReq = { headers: { authorization: 'Bearer super-secret-admin-key-2026' } };
    assert.equal(isAdminAuthorized(validBearerReq), true);

    const invalidReq = { headers: { 'x-admin-key': 'wrong-key-guess-12345678' } };
    assert.equal(isAdminAuthorized(invalidReq), false);
  } finally {
    process.env = envBackup;
  }
});

test('7. isAdminAuthorized fails closed if secret key is missing or shorter than 16 chars', () => {
  const envBackup = { ...process.env };
  delete process.env.FEEDBACK_ADMIN_KEY;
  delete process.env.ADMIN_SECRET;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    assert.equal(isAdminAuthorized({ headers: { 'x-admin-key': 'short' } }), false);

    process.env.FEEDBACK_ADMIN_KEY = 'short-key'; // < 16 chars
    assert.equal(isAdminAuthorized({ headers: { 'x-admin-key': 'short-key' } }), false);
  } finally {
    process.env = envBackup;
  }
});
