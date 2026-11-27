// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import * as nodeTest from 'node:test';
import assert from 'node:assert/strict';
import { getCefrLevelHierarchy, buildCourseStructure } from '../progression/courseData';
import { CEFR_7_TIERS } from '../components/LevelSwitcherSheet';
import {
  TRAVEL_SPRINT_DAYS,
  buildTravelSprintLesson,
  getTravelReadinessPercent,
  markTravelDayCompleted,
  loadCompletedTravelDays,
  TRAVEL_SPRINT_STORAGE_KEY,
} from '../data/travelSprintData';
import {
  DAILY_SELF_BATTLE_KEY,
  getDailySelfBattleSnapshot,
  recordDailySelfBattleWords,
  recordDailySelfBattleXp,
  toLocalDateKey,
} from '../utils/dailySelfBattle';
import type { TargetLanguage } from '../types';

type RunnerFn = (name: string, fn: () => void | Promise<void>) => unknown;
const isVitest = Boolean(process.env.VITEST || (globalThis as any).__vitest_worker__);
const vitestMod = isVitest ? await import('vitest') : null;
const describe: RunnerFn = vitestMod
  ? (vitestMod.describe as unknown as RunnerFn)
  : (nodeTest.describe as unknown as RunnerFn);
const test: RunnerFn = vitestMod
  ? (vitestMod.test as unknown as RunnerFn)
  : (nodeTest.test as unknown as RunnerFn);

function installMockLocalStorage() {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
  };
  return store;
}

const FLAGSHIP_LANGUAGES_WITH_EN_AR: TargetLanguage[] = ['en', 'de', 'es', 'it', 'fr', 'ar'];

describe('Thinking Bridge v10.2 Master Verification Suite', () => {
  test('1. All 5 Flagship Languages (EN, DE, ES, IT, FR) + EN->AR expose complete Pre-A0 -> C1 with non-empty B2 and C1 nodes', () => {
    // Verify 7-tier switcher exposes Pre-A0..C1
    const tierStages = CEFR_7_TIERS.map((t) => t.stage);
    assert.deepEqual(tierStages, ['Pre-A0', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1']);

    for (const lang of FLAGSHIP_LANGUAGES_WITH_EN_AR) {
      const hierarchy = getCefrLevelHierarchy(lang);
      const levelIds = hierarchy.map((l) => l.level);
      assert.deepEqual(levelIds, ['A1', 'A2', 'B1', 'B2', 'C1'], `${lang} must expose A1..C1 hierarchy`);

      const b2 = hierarchy.find((l) => l.level === 'B2');
      const c1 = hierarchy.find((l) => l.level === 'C1');
      assert.ok(b2 && b2.phases.length > 0, `${lang} B2 node must exist and have phases`);
      assert.ok(c1 && c1.phases.length > 0, `${lang} C1 node must exist and have phases`);

      const b2Lessons = b2!.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons)));
      const c1Lessons = c1!.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons)));
      assert.ok(b2Lessons.length > 0, `${lang} B2 must have non-empty lessons`);
      assert.ok(c1Lessons.length > 0, `${lang} C1 must have non-empty lessons`);

      // Verify exercises are populated and authentic
      assert.ok(b2Lessons[0].exercises.length >= 4, `${lang} B2 lesson must have exercises`);
      assert.ok(c1Lessons[0].exercises.length >= 4, `${lang} C1 lesson must have exercises`);
      assert.ok(
        c1Lessons.some((l) => l.isBossGate && l.titleAr.includes('بوابة الأسطورة C1')),
        `${lang} C1 must include the ⚔️ بوابة الأسطورة C1 Boss Gate lesson`
      );

      // Verify stage-based structure exposes Pre-A0 through C1
      const stages = buildCourseStructure(lang).map((s) => s.stage);
      assert.ok(stages.includes('Pre-A0'), `${lang} must include Pre-A0 stage`);
      assert.ok(stages.includes('A0'), `${lang} must include A0 stage`);
      assert.ok(stages.includes('B2'), `${lang} must include B2 stage`);
      assert.ok(stages.includes('C1'), `${lang} must include C1 stage`);
    }
  });

  test('2. 21-Day Travel Abroad Sprint renders all 21 days with valid playable exercises across all flagship languages + EN->AR', () => {
    installMockLocalStorage();

    assert.equal(TRAVEL_SPRINT_DAYS.length, 21, 'Travel Sprint must contain exactly 21 days');
    const dayNumbers = TRAVEL_SPRINT_DAYS.map((d) => d.day);
    assert.deepEqual(
      dayNumbers,
      Array.from({ length: 21 }, (_, i) => i + 1),
      'Days must be sequential 1..21'
    );
    assert.equal(TRAVEL_SPRINT_DAYS.filter((d) => d.week === 1).length, 7);
    assert.equal(TRAVEL_SPRINT_DAYS.filter((d) => d.week === 2).length, 7);
    assert.equal(TRAVEL_SPRINT_DAYS.filter((d) => d.week === 3).length, 7);
    assert.equal(TRAVEL_SPRINT_DAYS[20].isBossDay, true, 'Day 21 must be the Boss Test');

    for (const lang of FLAGSHIP_LANGUAGES_WITH_EN_AR) {
      for (let day = 1; day <= 21; day += 1) {
        const lesson = buildTravelSprintLesson(day, lang);
        assert.equal(lesson.id, `travel-sprint-day-${day}`);
        assert.ok(lesson.exercises.length >= 4, `Day ${day} (${lang}) must have >= 4 exercises`);
        for (const ex of lesson.exercises) {
          assert.ok(ex.targetSentence.trim().length > 0, `Empty targetSentence in Day ${day} (${lang})`);
          assert.ok(ex.promptAr.trim().length > 0, `Empty promptAr in Day ${day} (${lang})`);
          assert.ok((ex.wordChips?.length || 0) > 0, `Missing wordChips in Day ${day} (${lang})`);
        }
      }
    }

    // Verify local persistence & Travel Readiness Meter
    assert.equal(getTravelReadinessPercent([]), 0);
    markTravelDayCompleted(1);
    markTravelDayCompleted(2);
    markTravelDayCompleted(10);
    const saved = loadCompletedTravelDays();
    assert.deepEqual(saved, [1, 2, 10]);
    assert.equal(getTravelReadinessPercent(saved), Math.round((3 / 21) * 100));
    localStorage.removeItem(TRAVEL_SPRINT_STORAGE_KEY);
  });

  test('3. Local Daily Self-Battle tracks Today vs. Yesterday vs. All-Time Best and 7-day chart accurately offline', () => {
    installMockLocalStorage();

    const fixedNow = new Date(2026, 10, 27, 12, 0, 0); // 2026-11-27
    const todayKey = toLocalDateKey(fixedNow);
    const yesterday = new Date(2026, 10, 26, 12, 0, 0);
    const yesterdayKey = toLocalDateKey(yesterday);
    const threeDaysAgo = new Date(2026, 10, 24, 12, 0, 0);
    const threeDaysAgoKey = toLocalDateKey(threeDaysAgo);

    recordDailySelfBattleXp(200, threeDaysAgoKey);
    recordDailySelfBattleXp(100, yesterdayKey);
    recordDailySelfBattleXp(145, todayKey);
    recordDailySelfBattleWords(6, todayKey);

    const snap = getDailySelfBattleSnapshot(fixedNow);
    assert.equal(snap.todayKey, todayKey);
    assert.equal(snap.yesterdayKey, yesterdayKey);
    assert.equal(snap.todayXp, 145);
    assert.equal(snap.yesterdayXp, 100);
    assert.equal(snap.allTimeBestXp, 200);
    assert.equal(snap.deltaVsYesterdayPct, 45);
    assert.equal(snap.beatsYesterday, true);
    assert.equal(snap.isNewPersonalBest, false);
    assert.equal(snap.wordsMasteredToday, 6);
    assert.equal(snap.last7Days.length, 7);
    assert.equal(snap.last7Days[6].isToday, true);
    assert.equal(snap.last7Days[6].xp, 145);

    // Beat all-time best today
    recordDailySelfBattleXp(100, todayKey);
    const snap2 = getDailySelfBattleSnapshot(fixedNow);
    assert.equal(snap2.todayXp, 245);
    assert.equal(snap2.allTimeBestXp, 245);
    assert.equal(snap2.isNewPersonalBest, true);

    localStorage.removeItem(DAILY_SELF_BATTLE_KEY);
  });
});
