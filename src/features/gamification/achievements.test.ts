import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STEAM_ACHIEVEMENTS,
  buildTrophyShareText,
  evaluateAndUnlockAchievements,
  getRpgRankProgress,
  loadGamificationStore,
  recordArcadeResult,
  unlockAchievement,
  xpThresholdForLevel,
} from './achievements';
import { getRemainingEntitlementDays } from '../../services/entitlementService';
import { EntitlementState } from '../../types/entitlement';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
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

test('v7.1 Steam achievements define 16+ badges with 4 free starters and 4 rarity tiers', () => {
  assert.ok(STEAM_ACHIEVEMENTS.length >= 16);
  const freeStarters = STEAM_ACHIEVEMENTS.filter((a) => !a.proOnly);
  assert.equal(freeStarters.length, 4);
  const rarities = new Set(STEAM_ACHIEVEMENTS.map((a) => a.rarity));
  assert.deepEqual(rarities, new Set(['Common', 'Rare', 'Epic', 'Legendary']));
});

test('RPG rank progression maps Level 1 (مبتدئ الجسر) through Level 50 (أسطورة الطلاقة C1)', () => {
  const lv1 = getRpgRankProgress(0);
  assert.equal(lv1.level, 1);
  assert.equal(lv1.titleAr, 'مبتدئ الجسر');

  const lv50 = getRpgRankProgress(xpThresholdForLevel(50) + 500);
  assert.equal(lv50.level, 50);
  assert.equal(lv50.titleAr, 'أسطورة الطلاقة C1');
  assert.equal(lv50.progressPercent, 100);
});

test('Free users unlock starter achievements while Pro unlocks full cabinet & streak shields', () => {
  const storage = createMemoryStorage();

  const freeUnlocks = evaluateAndUnlockAchievements(
    {
      baseXp: 3000,
      streak: 7,
      completedLessons: 10,
      reviewedCardsCount: 15,
      hasProfileName: true,
      isPro: false,
      localHour: 23,
    },
    storage
  );

  assert.deepEqual(
    freeUnlocks.map((a) => a.id).sort(),
    ['daily_spark', 'first_bridge', 'flashcard_initiate', 'name_forged']
  );

  const blockedPro = unlockAchievement('boss_vanquisher', { isPro: false, storage });
  assert.equal(blockedPro.unlockedNow, false);

  const proUnlocks = evaluateAndUnlockAchievements(
    {
      baseXp: 3000,
      streak: 7,
      completedLessons: 10,
      reviewedCardsCount: 15,
      hasProfileName: true,
      isPro: true,
      localHour: 23,
    },
    storage
  );

  assert.equal(proUnlocks.some((a) => a.id === 'midnight_scholar'), true);
  assert.equal(proUnlocks.some((a) => a.id === 'shield_bearer'), true);
  assert.equal(loadGamificationStore(storage).streakFreezeShields, 3);
});

test('Pro Arcade Blitz and Boss Duel results unlock trophies and format shareable Trophy Card', () => {
  const storage = createMemoryStorage();

  const blitzRes = recordArcadeResult(
    {
      mode: 'blitz',
      score: 1600,
      maxCombo: 5,
      correctStreak: 10,
      xpEarned: 320,
      markTeaserUsed: false,
    },
    { isPro: true, storage }
  );
  const blitzIds = blitzRes.unlocked.map((a) => a.id);
  for (const expected of ['blitz_survivor', 'combo_king', 'copula_slayer', 'alexandria_polyglot']) {
    assert.equal(blitzIds.includes(expected), true, `Expected ${expected} to unlock`);
  }

  const bossRes = recordArcadeResult(
    {
      mode: 'boss',
      bossId: 'boss-copula-guardian',
      bossDefeated: true,
      flawless: true,
      xpEarned: 260,
    },
    { isPro: true, storage }
  );
  const bossIds = bossRes.unlocked.map((a) => a.id);
  assert.equal(bossIds.includes('boss_vanquisher'), true);
  assert.equal(bossIds.includes('zero_hit_duel'), true);

  const share = buildTrophyShareText({
    playerName: 'Amr',
    rank: getRpgRankProgress(1200),
    unlockedCount: 6,
    totalCount: STEAM_ACHIEVEMENTS.length,
    streak: 7,
    blitzBestScore: 1600,
    isArabic: true,
  });
  assert.equal(share.includes('Amr'), true);
  assert.equal(share.includes('1600'), true);
});

test('getRemainingEntitlementDays handles 30-day, expired, and lifetime entitlements', () => {
  const now = Date.parse('2026-11-24T00:00:00Z');
  const monthly: EntitlementState = {
    tier: 'pro',
    cohortCode: null,
    activatedAt: '2026-11-24T00:00:00Z',
    expiresAt: '2026-12-24T00:00:00Z',
    lastSyncedAt: '2026-11-24T00:00:00Z',
    source: 'server',
  };
  const lifetime: EntitlementState = { ...monthly, expiresAt: null };
  const expired: EntitlementState = { ...monthly, expiresAt: '2026-11-20T00:00:00Z' };

  assert.equal(getRemainingEntitlementDays(monthly, now), 30);
  assert.equal(getRemainingEntitlementDays(lifetime, now), null);
  assert.equal(getRemainingEntitlementDays(expired, now), 0);
});
