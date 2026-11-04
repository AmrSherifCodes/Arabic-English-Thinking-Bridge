import test from 'node:test';
import assert from 'node:assert/strict';
import handler, {
  ALLOWED_CORS_ORIGINS,
  checkFeedbackRateLimit,
  getCorsOrigin,
  isAdminAuthorized,
  normalizeSubscriptionEmail,
} from './feedback.js';

function createResponse() {
  let statusCode = 0;
  let body = '';
  return {
    setHeader() {},
    end(value = '') { body = value; },
    set statusCode(code) { statusCode = code; },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
}

test('feedback API allows application origins and uses the primary domain as fallback', () => {
  for (const origin of ['https://amrsherif.localhost.cc', 'https://www.amrsherif.localhost.cc']) {
    assert.equal(ALLOWED_CORS_ORIGINS.has(origin), true);
    assert.equal(getCorsOrigin(origin), origin);
  }
  assert.equal(getCorsOrigin('https://untrusted.example'), 'https://amrsherif.localhost.cc');
});

test('subscription email normalization validates and canonicalizes addresses', () => {
  assert.equal(normalizeSubscriptionEmail(' Amr.Sherif@Example.com '), 'amr.sherif@example.com');
  assert.equal(normalizeSubscriptionEmail('not-an-email'), null);
  assert.equal(normalizeSubscriptionEmail(`${'a'.repeat(250)}@example.com`), null);
});

test('feedback endpoint requires a configured database', async () => {
  const envBackup = { ...process.env };
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.POSTGRES_PRISMA_URL;
  delete process.env.POSTGRES_URL_NON_POOLING;

  try {
    const response = createResponse();
    await handler({ method: 'GET', headers: {} }, response);
    assert.equal(response.statusCode, 503);
    assert.match(response.body, /not configured/);
  } finally {
    process.env = envBackup;
  }
});

test('feedback endpoint responds to OPTIONS with 204', async () => {
  const response = createResponse();
  await handler({ method: 'OPTIONS', headers: {} }, response);
  assert.equal(response.statusCode, 204);
});

test('feedback endpoint rejects unauthorized GET requests when a database is configured', async () => {
  const envBackup = { ...process.env };
  process.env.DATABASE_URL = 'postgresql://example:example@ep-test.neon.tech/neondb';
  delete process.env.FEEDBACK_ADMIN_KEY;
  delete process.env.ADMIN_SECRET;

  try {
    const response = createResponse();
    await handler({ method: 'GET', headers: {} }, response);
    assert.equal(response.statusCode, 401);
    assert.match(response.body, /Unauthorized/);
  } finally {
    process.env = envBackup;
  }
});

test('feedback endpoint rejects disallowed origins', async () => {
  const response = createResponse();
  await handler({
    method: 'POST',
    headers: { origin: 'https://evil-phishing-site.com' },
    body: { rating: 5, message: 'spam' },
  }, response);
  assert.equal(response.statusCode, 403);
  assert.match(response.body, /Origin not allowed/);
});

test('feedback rate limiter blocks the sixth submission from an IP in its window', () => {
  const testIp = '198.51.100.99';
  for (let index = 0; index < 5; index += 1) {
    assert.equal(checkFeedbackRateLimit(testIp), true);
  }
  assert.equal(checkFeedbackRateLimit(testIp), false);
});

test('admin authorization validates configured keys and fails closed', () => {
  const envBackup = { ...process.env };
  process.env.FEEDBACK_ADMIN_KEY = 'test-admin-secret-2026';

  try {
    assert.equal(isAdminAuthorized({ headers: { 'x-admin-key': 'test-admin-secret-2026' } }), true);
    assert.equal(isAdminAuthorized({ headers: { authorization: 'Bearer test-admin-secret-2026' } }), true);
    assert.equal(isAdminAuthorized({ headers: { 'x-admin-key': 'incorrect-admin-key' } }), false);
    process.env.FEEDBACK_ADMIN_KEY = 'short';
    assert.equal(isAdminAuthorized({ headers: { 'x-admin-key': 'short' } }), false);
  } finally {
    process.env = envBackup;
  }
});
