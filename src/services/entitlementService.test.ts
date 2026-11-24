import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearLocalLearningDataPreservingEntitlement,
  getOrCreateDeviceId,
  hasAcademyTeacherAccess,
  hasProAccess,
  isValidVoucherCodeFormat,
  loadCachedEntitlement,
  normalizeVoucherCode,
  redeemVoucherCode,
  refreshEntitlementFromServer,
  saveCachedEntitlement,
} from './entitlementService';
import {
  DEVICE_ID_STORAGE_KEY,
  ENTITLEMENT_STORAGE_KEY,
  EntitlementState,
} from '../types/entitlement';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test('1. Voucher code normalization and format validation', () => {
  assert.equal(normalizeVoucherCode('  tb-pro-9x2k  '), 'TB-PRO-9X2K');
  assert.equal(isValidVoucherCodeFormat('TB-PRO-2026'), true);
  assert.equal(isValidVoucherCodeFormat('ALAQSA-0042'), true);
  assert.equal(isValidVoucherCodeFormat('ab'), false);
  assert.equal(isValidVoucherCodeFormat('INVALID CODE!@#'), false);
});

test('2. Successful voucher redemption calls same-origin /api/entitlements/redeem and caches offline', async () => {
  const storage = createMemoryStorage();
  let capturedUrl = '';
  let capturedBody = '';

  const mockFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedBody = String(init?.body || '');
    return new Response(
      JSON.stringify({
        ok: true,
        entitlement: {
          tier: 'academy_student',
          cohortCode: 'ALAQSA-2026-A',
          label: 'Al-Aqsa Educational Center',
          activatedAt: '2026-11-24T00:00:00.000Z',
          expiresAt: null,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  const result = await redeemVoucherCode('alaqsa-1001', {
    displayName: 'Youssef',
    fetchImpl: mockFetch,
    storage,
  });

  assert.equal(capturedUrl, '/api/entitlements/redeem', 'Must use same-origin Vercel API proxy');
  assert.match(capturedBody, /"code":"ALAQSA-1001"/);
  assert.equal(result.ok, true);
  assert.equal(result.entitlement?.tier, 'academy_student');
  assert.equal(result.entitlement?.cohortCode, 'ALAQSA-2026-A');

  const cached = loadCachedEntitlement(storage);
  assert.equal(cached.tier, 'academy_student');
  assert.equal(cached.cohortCode, 'ALAQSA-2026-A');
  assert.equal(hasProAccess(cached), true);
  assert.equal(hasAcademyTeacherAccess(cached), false);
});

test('3. Offline network failure returns NETWORK_OFFLINE without wiping existing cached entitlement', async () => {
  const storage = createMemoryStorage();
  const existing: EntitlementState = {
    tier: 'pro',
    cohortCode: null,
    label: 'InstaPay Pro',
    activatedAt: '2026-11-01T00:00:00.000Z',
    expiresAt: null,
    lastSyncedAt: '2026-11-01T00:00:00.000Z',
    source: 'server',
  };
  saveCachedEntitlement(existing, storage);

  const failingFetch = (async () => {
    throw new Error('Failed to fetch');
  }) as unknown as typeof fetch;

  const result = await redeemVoucherCode('TB-PRO-9999', {
    fetchImpl: failingFetch,
    storage,
  });

  assert.equal(result.ok, false);
  assert.equal(result.errorCode, 'NETWORK_OFFLINE');
  assert.equal(loadCachedEntitlement(storage).tier, 'pro');
});

test('4. Expired cached entitlement reverts safely to free tier', () => {
  const storage = createMemoryStorage();
  saveCachedEntitlement(
    {
      tier: 'pro',
      cohortCode: null,
      activatedAt: '2025-01-01T00:00:00.000Z',
      expiresAt: '2025-06-01T00:00:00.000Z',
      lastSyncedAt: '2025-01-01T00:00:00.000Z',
      source: 'server',
    },
    storage
  );

  const loaded = loadCachedEntitlement(storage, Date.parse('2026-11-24T00:00:00.000Z'));
  assert.equal(loaded.tier, 'free');
  assert.equal(hasProAccess(loaded), false);
});

test('5. clearLocalLearningDataPreservingEntitlement wipes progress keys while preserving entitlement & deviceId', () => {
  const storage = createMemoryStorage({
    'tb.progressionState': '{"xp":400}',
    'tb.onboardingComplete': 'true',
    'tb.activeProfileConfig': '{"cefrLevel":"A1"}',
  });
  const deviceId = getOrCreateDeviceId(storage);
  saveCachedEntitlement(
    {
      tier: 'academy_teacher',
      cohortCode: 'ALAQSA-2026-A',
      activatedAt: '2026-11-24T00:00:00.000Z',
      expiresAt: null,
      lastSyncedAt: '2026-11-24T00:00:00.000Z',
      source: 'server',
    },
    storage
  );

  clearLocalLearningDataPreservingEntitlement(storage);

  assert.equal(storage.getItem('tb.progressionState'), null);
  assert.equal(storage.getItem('tb.onboardingComplete'), null);
  assert.equal(storage.getItem('tb.activeProfileConfig'), null);
  assert.equal(storage.getItem(DEVICE_ID_STORAGE_KEY), deviceId);
  assert.notEqual(storage.getItem(ENTITLEMENT_STORAGE_KEY), null);
  assert.equal(hasAcademyTeacherAccess(loadCachedEntitlement(storage)), true);
});

test('6. Free-tier guest users make ZERO network calls on refreshEntitlementFromServer', async () => {
  const storage = createMemoryStorage();
  const forbiddenFetch = (() => {
    throw new Error('FREE_USER_NETWORK_CALL_FORBIDDEN');
  }) as unknown as typeof fetch;

  const result = await refreshEntitlementFromServer({
    fetchImpl: forbiddenFetch,
    storage,
  });

  assert.equal(result.tier, 'free');
});
