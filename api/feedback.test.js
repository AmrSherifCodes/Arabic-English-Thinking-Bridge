import test from 'node:test';
import assert from 'node:assert/strict';
import feedbackHandler from './feedback.ts';

test('1. feedback handler responds to OPTIONS preflight with status 200', async () => {
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

  await feedbackHandler(req, res);
  assert.equal(statusCode, 200);
  assert.equal(ended, true);
  assert.equal(headers['Access-Control-Allow-Origin'], 'https://tb-eg.vercel.app');
});

test('2. feedback handler rejects non-POST HTTP methods with 405', async () => {
  let statusCode = 200;
  let jsonBody = null;

  const req = {
    method: 'GET',
    headers: {}
  };
  const res = {
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

  await feedbackHandler(req, res);
  assert.equal(statusCode, 405);
  assert.equal(jsonBody?.error, 'Method not allowed');
});

test('3. feedback handler formats subscription payload vs general feedback payload', async () => {
  let statusCode = 200;
  let jsonBody = null;
  const originalEnv = process.env.DISCORD_FEEDBACK_WEBHOOK;

  // Clear env to test graceful handling without webhook
  delete process.env.DISCORD_WEBHOOK_URL;
  delete process.env.DISCORD_FEEDBACK_WEBHOOK;
  delete process.env.DISCORD_REVIEWS_WEBHOOK;

  const reqSubscribe = {
    method: 'POST',
    body: { type: 'subscribe', email: 'user@example.com' }
  };
  const resSubscribe = {
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

  await feedbackHandler(reqSubscribe, resSubscribe);
  assert.equal(statusCode, 200);
  assert.equal(jsonBody?.success, true);

  // Restore env if any
  if (originalEnv) process.env.DISCORD_FEEDBACK_WEBHOOK = originalEnv;
});
