import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchTeacherCohortRoster,
  formatL1MistakeTag,
  pushStudentCohortProgress,
} from './cohortSyncService';
import { saveCachedEntitlement } from './entitlementService';
import type { EntitlementState } from '../types/entitlement';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

function makeEntitlement(tier: EntitlementState['tier'], cohortCode: string | null = null): EntitlementState {
  return {
    tier,
    cohortCode,
    label: cohortCode ? 'Al-Aqsa Academy' : null,
    activatedAt: '2026-11-24T00:00:00.000Z',
    expiresAt: null,
    lastSyncedAt: '2026-11-24T00:00:00.000Z',
    source: 'server',
  };
}

describe('cohortSyncService', () => {
  it('makes ZERO network calls when pushing progress for free or pro users', async () => {
    let fetchCalls = 0;
    const mockFetch = (async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;

    for (const tier of ['free', 'pro', 'academy_teacher'] as const) {
      const storage = createMemoryStorage();
      saveCachedEntitlement(makeEntitlement(tier, tier === 'academy_teacher' ? 'ALAQSA-G1' : null), storage);

      const res = await pushStudentCohortProgress(
        {
          displayName: 'Youssef',
          weeklyXp: 200,
          streakDays: 5,
          topL1Mistakes: ['copula-drop'],
        },
        { fetchImpl: mockFetch, storage }
      );

      assert.equal(res.ok, false);
      assert.equal(res.skipped, true);
    }

    assert.equal(fetchCalls, 0);
  });

  it('pushes sanitized student progress to /api/entitlements/cohort-sync for academy_student', async () => {
    const storage = createMemoryStorage();
    saveCachedEntitlement(makeEntitlement('academy_student', 'ALAQSA-G1'), storage);

    let capturedUrl = '';
    let capturedBody: Record<string, unknown> = {};
    const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(String(init?.body || '{}'));
      return new Response(
        JSON.stringify({
          ok: true,
          cohortCode: 'ALAQSA-G1',
          updatedAt: '2026-11-24T01:00:00.000Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;

    const res = await pushStudentCohortProgress(
      {
        displayName: '  يوسف أحمد  ',
        weeklyXp: 420.9,
        totalXp: 1500,
        streakDays: 7,
        completedLessons: 11,
        topL1Mistakes: ['copula-drop', 'article-the'],
      },
      { fetchImpl: mockFetch, storage }
    );

    assert.equal(res.ok, true);
    assert.equal(res.cohortCode, 'ALAQSA-G1');
    assert.equal(capturedUrl, '/api/entitlements/cohort-sync');
    assert.equal(capturedBody.displayName, 'يوسف أحمد');
    assert.equal(capturedBody.weeklyXp, 420);
    assert.equal(capturedBody.streakDays, 7);
    assert.deepEqual(capturedBody.topL1Mistakes, ['copula-drop', 'article-the']);
  });

  it('makes ZERO network calls when fetching roster for free, pro, or academy_student users', async () => {
    let fetchCalls = 0;
    const mockFetch = (async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ ok: true, students: [] }), { status: 200 });
    }) as unknown as typeof fetch;

    for (const tier of ['free', 'pro', 'academy_student'] as const) {
      const storage = createMemoryStorage();
      saveCachedEntitlement(makeEntitlement(tier, tier === 'academy_student' ? 'ALAQSA-G1' : null), storage);

      const res = await fetchTeacherCohortRoster({ fetchImpl: mockFetch, storage });
      assert.equal(res.ok, false);
      assert.equal(res.skipped, true);
      assert.deepEqual(res.students, []);
    }

    assert.equal(fetchCalls, 0);
  });

  it('fetches cohort roster for verified academy_teacher', async () => {
    const storage = createMemoryStorage();
    saveCachedEntitlement(makeEntitlement('academy_teacher', 'ALAQSA-G1'), storage);

    let capturedUrl = '';
    const mockFetch = (async (url: string | URL | Request) => {
      capturedUrl = String(url);
      return new Response(
        JSON.stringify({
          ok: true,
          cohortCode: 'ALAQSA-G1',
          label: 'Al-Aqsa Academy',
          students: [
            {
              deviceId: 'stu-device-01',
              displayName: 'Mariam Khaled',
              cohortCode: 'ALAQSA-G1',
              weeklyXp: 510,
              totalXp: 2100,
              streakDays: 8,
              completedLessons: 10,
              topL1Mistakes: ['article-the'],
              updatedAt: '2026-11-24T00:30:00.000Z',
            },
          ],
          fetchedAt: '2026-11-24T01:00:00.000Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;

    const res = await fetchTeacherCohortRoster({ fetchImpl: mockFetch, storage });
    assert.equal(res.ok, true);
    assert.equal(res.cohortCode, 'ALAQSA-G1');
    assert.equal(res.students.length, 1);
    assert.equal(res.students[0].displayName, 'Mariam Khaled');
    assert.ok(capturedUrl.startsWith('/api/entitlements/cohort-roster?deviceId='));
  });

  it('formats known and unknown L1 mistake tags cleanly', () => {
    assert.equal(formatL1MistakeTag('copula-drop').en, 'Dropped "be" verb (is / are)');
    assert.equal(formatL1MistakeTag('custom-tag').en, 'custom tag');
  });
});
