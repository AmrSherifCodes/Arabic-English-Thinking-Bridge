// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

export const DAILY_SELF_BATTLE_KEY = 'tb.dailySelfBattle.v10_2';

export interface DailyRecord {
  xp: number;
  wordsMastered: number;
}

export interface DailySelfBattleStore {
  days: Record<string, DailyRecord>; // YYYY-MM-DD -> stats
  allTimeBestXp: number;
}

export interface DailyBarPoint {
  dateKey: string;
  labelAr: string;
  labelEn: string;
  xp: number;
  isToday: boolean;
}

export interface DailySelfBattleSnapshot {
  todayKey: string;
  yesterdayKey: string;
  todayXp: number;
  yesterdayXp: number;
  allTimeBestXp: number;
  deltaVsYesterdayPct: number | null;
  beatsYesterday: boolean;
  isNewPersonalBest: boolean;
  wordsMasteredToday: number;
  last7Days: DailyBarPoint[];
}

const DAY_LABELS_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDays(base: Date, deltaDays: number): Date {
  const copy = new Date(base.getTime());
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
}

export function loadDailySelfBattleStore(): DailySelfBattleStore {
  try {
    const raw = localStorage.getItem(DAILY_SELF_BATTLE_KEY);
    if (!raw) return { days: {}, allTimeBestXp: 0 };
    const parsed = JSON.parse(raw) as Partial<DailySelfBattleStore>;
    const days = parsed.days && typeof parsed.days === 'object' ? parsed.days : {};
    const computedBest = Object.values(days).reduce((max, rec) => Math.max(max, Number(rec?.xp) || 0), 0);
    return {
      days,
      allTimeBestXp: Math.max(Number(parsed.allTimeBestXp) || 0, computedBest),
    };
  } catch {
    return { days: {}, allTimeBestXp: 0 };
  }
}

function saveDailySelfBattleStore(store: DailySelfBattleStore): void {
  try {
    // Keep only the last 30 days to keep localStorage tiny
    const keys = Object.keys(store.days).sort();
    const trimmedDays: Record<string, DailyRecord> = {};
    for (const k of keys.slice(-30)) {
      trimmedDays[k] = store.days[k];
    }
    localStorage.setItem(
      DAILY_SELF_BATTLE_KEY,
      JSON.stringify({ days: trimmedDays, allTimeBestXp: store.allTimeBestXp })
    );
  } catch {}
}

export function recordDailySelfBattleXp(xpDelta: number, dateKey: string = toLocalDateKey()): DailySelfBattleStore {
  const safeDelta = Math.max(0, Math.round(Number(xpDelta) || 0));
  const store = loadDailySelfBattleStore();
  if (safeDelta === 0) return store;

  const existing = store.days[dateKey] || { xp: 0, wordsMastered: 0 };
  const nextXp = existing.xp + safeDelta;
  const nextStore: DailySelfBattleStore = {
    days: {
      ...store.days,
      [dateKey]: { ...existing, xp: nextXp },
    },
    allTimeBestXp: Math.max(store.allTimeBestXp, nextXp),
  };
  saveDailySelfBattleStore(nextStore);
  return nextStore;
}

export function recordDailySelfBattleWords(wordDelta: number = 1, dateKey: string = toLocalDateKey()): DailySelfBattleStore {
  const safeDelta = Math.max(0, Math.round(Number(wordDelta) || 0));
  const store = loadDailySelfBattleStore();
  if (safeDelta === 0) return store;

  const existing = store.days[dateKey] || { xp: 0, wordsMastered: 0 };
  const nextStore: DailySelfBattleStore = {
    ...store,
    days: {
      ...store.days,
      [dateKey]: { ...existing, wordsMastered: existing.wordsMastered + safeDelta },
    },
  };
  saveDailySelfBattleStore(nextStore);
  return nextStore;
}

export function getDailySelfBattleSnapshot(now: Date = new Date()): DailySelfBattleSnapshot {
  const store = loadDailySelfBattleStore();
  const todayKey = toLocalDateKey(now);
  const yesterdayKey = toLocalDateKey(shiftDays(now, -1));

  const todayRec = store.days[todayKey] || { xp: 0, wordsMastered: 0 };
  const yesterdayRec = store.days[yesterdayKey] || { xp: 0, wordsMastered: 0 };

  const todayXp = todayRec.xp || 0;
  const yesterdayXp = yesterdayRec.xp || 0;
  const allTimeBestXp = Math.max(store.allTimeBestXp || 0, todayXp, yesterdayXp);

  let deltaVsYesterdayPct: number | null = null;
  if (yesterdayXp > 0) {
    deltaVsYesterdayPct = Math.round(((todayXp - yesterdayXp) / yesterdayXp) * 100);
  } else if (todayXp > 0) {
    deltaVsYesterdayPct = 100;
  }

  const last7Days: DailyBarPoint[] = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const dt = shiftDays(now, offset);
    const key = toLocalDateKey(dt);
    const rec = store.days[key];
    last7Days.push({
      dateKey: key,
      labelAr: DAY_LABELS_AR[dt.getDay()],
      labelEn: DAY_LABELS_EN[dt.getDay()],
      xp: rec?.xp || 0,
      isToday: offset === 0,
    });
  }

  return {
    todayKey,
    yesterdayKey,
    todayXp,
    yesterdayXp,
    allTimeBestXp,
    deltaVsYesterdayPct,
    beatsYesterday: todayXp > yesterdayXp && todayXp > 0,
    isNewPersonalBest: todayXp > 0 && todayXp >= allTimeBestXp,
    wordsMasteredToday: todayRec.wordsMastered || 0,
    last7Days,
  };
}
