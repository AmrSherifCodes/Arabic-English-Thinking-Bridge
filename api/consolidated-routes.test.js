import test from 'node:test';
import assert from 'node:assert/strict';
import v8Handler from './v8.ts';
import entitlementsHandler from './entitlements/[action].ts';

function createMockRes() {
  const headers = {};
  let statusCode = 200;
  let body = null;
  const res = {
    setHeader(k, v) { headers[k.toLowerCase()] = v; },
    status(code) { statusCode = code; return res; },
    json(data) { body = data; return res; },
    send(data) { body = data; return res; },
    end(data) { if (data) body = data; return res; },
    get statusCode() { return statusCode; },
    set statusCode(code) { statusCode = code; },
    get body() { return body; },
    get headers() { return headers; },
  };
  return res;
}

test('v8 router handles backup sync/restore, certificates issue/verify, admin/vouchers, and report-error', async () => {
  const resSync = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'backup', action: 'sync' }, headers: {} }, resSync);
  assert.equal(resSync.statusCode, 405);

  const resRestore = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'backup', action: 'restore' }, headers: {} }, resRestore);
  assert.equal(resRestore.statusCode, 405);

  const resIssue = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'certificates', action: 'issue' }, headers: {} }, resIssue);
  assert.equal(resIssue.statusCode, 405);

  const resVerify = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'certificates', action: 'verify', code: 'BAD' }, headers: {} }, resVerify);
  assert.equal(resVerify.statusCode, 400);
  assert.equal(resVerify.body?.error, 'INVALID_FORMAT');

  const resReport = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'report-error' }, headers: {} }, resReport);
  assert.equal(resReport.statusCode, 405);

  const resAdmin = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'admin/vouchers' }, headers: {} }, resAdmin);
  assert.ok(resAdmin.statusCode === 401 || resAdmin.statusCode === 503);

  const resUnknown = createMockRes();
  await v8Handler({ method: 'GET', query: { __route: 'unknown' }, headers: {} }, resUnknown);
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
