import test from 'node:test';
import assert from 'node:assert/strict';
import reviewHandler from './review.ts';

test('1. review handler responds to OPTIONS preflight with status 200', async () => {
  let statusCode = 200;
  let ended = false;
  const headers = {};

  const req = {
    method: 'OPTIONS',
    headers: {}
  };
  const res = {
    setHeader(key, val) { headers[key] = val; },
    status(code) {
      statusCode = code;
      return this;
    },
    end() {
      ended = true;
      return this;
    }
  };

  await reviewHandler(req, res);
  assert.equal(statusCode, 200);
  assert.equal(ended, true);
  assert.equal(headers['Access-Control-Allow-Origin'], 'https://tb-eg.vercel.app');
});

test('2. review handler accepts short reviews (>= 3 chars) and rejects reviews < 3 chars', async () => {
  let statusCode = 200;
  let jsonBody = null;

  delete process.env.DISCORD_WEBHOOK_URL;
  delete process.env.DISCORD_FEEDBACK_WEBHOOK;
  delete process.env.DISCORD_REVIEWS_WEBHOOK;

  // Case A: Too short (< 3 chars)
  const reqShort = {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.99' },
    body: { text: 'hi', rating: 5, name: 'Tester' }
  };
  const resShort = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonBody = body;
      return this;
    }
  };

  await reviewHandler(reqShort, resShort);
  assert.equal(statusCode, 400);
  assert.equal(jsonBody?.ok, false);

  // Case B: Valid short review (>= 3 chars e.g. "Great!")
  const reqValid = {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.98' },
    body: { text: 'Great!', rating: 5, name: 'Tester' }
  };
  const resValid = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonBody = body;
      return this;
    }
  };

  await reviewHandler(reqValid, resValid);
  assert.equal(statusCode, 200);
  assert.equal(jsonBody?.ok, true);
  assert.equal(jsonBody?.review?.text, 'Great!');
});
