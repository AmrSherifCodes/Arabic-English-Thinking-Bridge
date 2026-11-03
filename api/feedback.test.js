import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './feedback.js';

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
  const req = { method: 'GET' };
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
  const req = { method: 'OPTIONS' };
  const res = {
    setHeader() {},
    end() {},
    set statusCode(code) { statusCode = code; }
  };

  await handler(req, res);
  assert.equal(statusCode, 204);
});
