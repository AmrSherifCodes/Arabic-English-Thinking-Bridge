// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ECONOMY_STORAGE_KEY,
  awardArcadeWinCoins,
  awardDailyStreakCoins,
  awardLevelCompletion,
  calculateStarRating,
  loadEconomyState,
  openMilestoneChest,
  purchaseAvatarFrame,
  purchaseThemeUnlock,
} from './economy';
import { THEME_STORAGE_KEY } from './themeStore';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
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
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
}

describe('v7.2 Gamification Economy (Coins, Stars, Chests, Themes)', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it('awards level completion coins (+30), 3-star bonus (+20), and 2x Pro multiplier', () => {
    const first = awardLevelCompletion('lesson-1', 75, { isPro: false });
    assert.equal(first.starsEarned, 1);
    assert.equal(first.coinsEarned, 30);
    assert.equal(first.state.coins, 30);

    const threeStar = awardLevelCompletion('lesson-2', 98, { isPro: false });
    assert.equal(threeStar.starsEarned, 3);
    assert.equal(threeStar.coinsEarned, 50);
    assert.equal(threeStar.state.coins, 80);

    const proThreeStar = awardLevelCompletion('lesson-3', 96, { isPro: true });
    assert.equal(proThreeStar.starsEarned, 3);
    assert.equal(proThreeStar.coinsEarned, 100);
    assert.equal(proThreeStar.state.coins, 180);
  });

  it('upgrades level star ratings cleanly without ever downgrading', () => {
    assert.equal(calculateStarRating(60), 1);
    assert.equal(calculateStarRating(82), 2);
    assert.equal(calculateStarRating(96), 3);

    const r1 = awardLevelCompletion('lesson-a1-1', 65);
    assert.equal(r1.bestStars, 1);

    const r2 = awardLevelCompletion('lesson-a1-1', 85);
    assert.equal(r2.bestStars, 2);

    const r3 = awardLevelCompletion('lesson-a1-1', 99);
    assert.equal(r3.bestStars, 3);
    assert.equal(r3.upgradedToThreeStars, true);

    // Replaying with lower accuracy must keep 3 stars
    const r4 = awardLevelCompletion('lesson-a1-1', 50);
    assert.equal(r4.bestStars, 3);
    assert.equal(loadEconomyState().levelStars['lesson-a1-1'], 3);
  });

  it('awards daily streak coins once per day and arcade win coins with 2x Pro', () => {
    const day1 = awardDailyStreakCoins(false, '2026-11-24');
    assert.equal(day1.awarded, true);
    assert.equal(day1.coinsEarned, 25);

    const day1Again = awardDailyStreakCoins(false, '2026-11-24');
    assert.equal(day1Again.awarded, false);
    assert.equal(day1Again.coinsEarned, 0);

    const arcadePro = awardArcadeWinCoins(true);
    assert.equal(arcadePro.coinsEarned, 80);
    assert.equal(arcadePro.state.coins, 105);
  });

  it('protects milestone chests against double-opening and grants rewards once', () => {
    const firstOpen = openMilestoneChest('chest-a1-3-wooden', 'wooden', false);
    assert.equal(firstOpen.ok, true);
    assert.equal(firstOpen.alreadyOpened, false);
    assert.equal(firstOpen.reward?.coins, 60);
    assert.equal(firstOpen.reward?.shields, 1);

    const coinsAfterFirst = firstOpen.state.coins;
    const shieldsAfterFirst = firstOpen.state.shields;

    const secondOpen = openMilestoneChest('chest-a1-3-wooden', 'wooden', false);
    assert.equal(secondOpen.ok, false);
    assert.equal(secondOpen.alreadyOpened, true);
    assert.equal(secondOpen.state.coins, coinsAfterFirst);
    assert.equal(secondOpen.state.shields, shieldsAfterFirst);
  });

  it('handles 100% free V10 theme switches and avatar frame unlocks with coins', () => {
    // Both V10 dark themes (Midnight Navy & AMOLED Obsidian) are 100% free
    const amoled = purchaseThemeUnlock('amoled-obsidian', false);
    assert.equal(amoled.ok, true);
    assert.equal(localStorage.getItem(THEME_STORAGE_KEY), 'amoled-obsidian');

    // Earn coins via golden chest (180 coins) and buy nile-gold frame (100 coins)
    openMilestoneChest('chest-a1-9-golden', 'golden', false);
    const frameRes = purchaseAvatarFrame('nile-gold');
    assert.equal(frameRes.ok, true);
    assert.equal(frameRes.state.equippedFrame, 'nile-gold');
    assert.equal(frameRes.state.coins, 80);

    // Persisted cleanly in tb.economy.v1
    const raw = localStorage.getItem(ECONOMY_STORAGE_KEY);
    assert.ok(raw);
  });
});
