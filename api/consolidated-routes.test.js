import test from 'node:test';
import assert from 'node:assert/strict';
import backupHandler from './backup/[action].ts';
import certificatesHandler from './certificates/[action].ts';
import entitlementsHandler from './entitlements/[action].ts';

function createMockRes() {
  const headers = {};
  let statusCode = 200;
  let body = null;
  const res = {
    setHeader(k, v) { headers[k.toLowerCase()] = v; },
    status(code) { statusCode = code; return res; },
    json(data) { body = data; return res; },
    end(data) { if (data) body = data; return res; },
    get statusCode() { return statusCode; },
    set statusCode(code) { statusCode = code; },
    get body() { return body; },
    get headers() { return headers; },
  };
  return res;
}

test('backup/[action] routes sync, restore, and rejects unknown action', async () => {
  const resSync = createMockRes();
  await backupHandler({ method: 'GET', query: { action: 'sync' }, headers: {} }, resSync);
  assert.equal(resSync.statusCode, 405);

  const resRestore = createMockRes();
  await backupHandler({ method: 'GET', url: '/api/backup/restore', query: {}, headers: {} }, resRestore);
  assert.equal(resRestore.statusCode, 405);

  const resUnknown = createMockRes();
  await backupHandler({ method: 'POST', query: { action: 'nope' }, headers: {} }, resUnknown);
  assert.equal(resUnknown.statusCode, 404);
});

test('certificates/[action] routes issue, verify, and rejects unknown action', async () => {
  const resIssue = createMockRes();
  await certificatesHandler({ method: 'GET', query: { action: 'issue' }, headers: {} }, resIssue);
  assert.equal(resIssue.statusCode, 405);

  const resVerify = createMockRes();
  await certificatesHandler({ method: 'GET', url: '/api/certificates/verify?code=BAD', query: { code: 'BAD' }, headers: {} }, resVerify);
  assert.equal(resVerify.statusCode, 400);
  assert.equal(resVerify.body?.error, 'INVALID_FORMAT');

  const resUnknown = createMockRes();
  await certificatesHandler({ method: 'GET', query: { action: 'unknown' }, headers: {} }, resUnknown);
  assert.equal(resUnknown.statusCode, 404);
});

test('entitlements/[action] routes redeem, status, cohort-sync, cohort-roster, and rejects unknown action', async () => {
  for (const [action, method, expectedStatus] of [
    ['redeem', 'GET', 405],
    ['status', 'DELETE', 405],
    ['cohort-sync', 'GET', 405],
    ['cohort-roster', 'POST', 405],
    ['nope', 'GET', 404],
  ]) {
    const res = createMockRes();
    await entitlementsHandler({ method, url: `/api/entitlements/${action}`, query: {}, headers: {} }, res);
    assert.equal(res.statusCode, expectedStatus, `Expected ${expectedStatus} for /api/entitlements/${action}`);
  }
});
