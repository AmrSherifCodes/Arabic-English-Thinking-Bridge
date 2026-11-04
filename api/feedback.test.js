import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './feedback.ts';

function createResponse() {
  let statusCode = 200;
  let body = '';
  const headers = {};
  return {
    setHeader(k, v) { headers[k] = v; },
    end() {},
    status(code) { statusCode = code; return this; },
    json(data) { body = JSON.stringify(data); return this; },
    get statusCode() { return statusCode; },
    get body() { return body; },
    get headers() { return headers; },
  };
}

test('feedback endpoint responds to OPTIONS with 200', async () => {
  const response = createResponse();
  await handler({ method: 'OPTIONS', headers: {} }, response);
  assert.equal(response.statusCode, 200);
});

test('feedback endpoint rejects disallowed HTTP methods with 405', async () => {
  const response = createResponse();
  await handler({ method: 'GET', headers: {} }, response);
  assert.equal(response.statusCode, 405);
});

test('feedback endpoint validates message length', async () => {
  const response = createResponse();
  await handler({ method: 'POST', headers: {}, body: { message: 'a' } }, response);
  assert.equal(response.statusCode, 400);
});
