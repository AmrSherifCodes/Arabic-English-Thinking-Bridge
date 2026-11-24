// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useCallback, useEffect, useRef, useState } from 'react';

export const DAILY_PRO_ALLOWANCE_SECONDS = 900; // 15:00 per calendar day
export const DAILY_PRO_TIMER_LS_KEY = 'tb.dailyProTimer.v1';
export const DAILY_PRO_TIMER_IDB_NAME = 'tb-daily-timer-v1';
const DAILY_PRO_TIMER_IDB_STORE = 'daily_timer';
const DAILY_PRO_TIMER_IDB_RECORD_KEY = 'usage';
export const DAILY_PRO_TIMER_EVENT = 'tb:daily-pro-timer-updated';

export interface DailyProTimerRecord {
  date: string; // 'YYYY-MM-DD'
  usedSeconds: number;
}

export interface ProAccessResolution {
  hasProAccess: boolean;
  remainingSeconds: number;
  isExpired: boolean;
}

export interface MonotonicAccrualResult {
  usedSeconds: number;
  addedSeconds: number;
  nextPerfMs: number;
}

/**
 * Returns local calendar date in YYYY-MM-DD format so the 15-minute free pass
 * resets cleanly at local midnight both online and offline.
 */
export function getLocalDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizeUsedSeconds(
  record: DailyProTimerRecord | null | undefined,
  today: string,
  maxSeconds: number = DAILY_PRO_ALLOWANCE_SECONDS
): number {
  if (!record || typeof record !== 'object') return 0;
  if (record.date !== today) return 0;
  if (typeof record.usedSeconds !== 'number' || !Number.isFinite(record.usedSeconds)) return 0;
  return Math.max(0, Math.min(maxSeconds, Math.floor(record.usedSeconds)));
}

/**
 * Tamper-resistant mirror merge: always takes Math.max(lsUsed, idbUsed) for today.
 * If either store is from a previous calendar day, its count resets to 0.
 */
export function resolveDailyUsedSeconds(
  today: string,
  lsRecord: DailyProTimerRecord | null | undefined,
  idbRecord: DailyProTimerRecord | null | undefined,
  maxSeconds: number = DAILY_PRO_ALLOWANCE_SECONDS
): number {
  const lsUsed = sanitizeUsedSeconds(lsRecord, today, maxSeconds);
  const idbUsed = sanitizeUsedSeconds(idbRecord, today, maxSeconds);
  return Math.max(lsUsed, idbUsed);
}

/**
 * Monotonic elapsed-time accrual using performance.now() deltas.
 * Ignores backward jumps and preserves sub-second remainders so polling never drifts.
 */
export function accrueMonotonicSeconds(
  currentUsedSeconds: number,
  lastPerfMs: number,
  nowPerfMs: number,
  maxSeconds: number = DAILY_PRO_ALLOWANCE_SECONDS
): MonotonicAccrualResult {
  const safeCurrent = Math.max(0, Math.min(maxSeconds, Math.floor(currentUsedSeconds)));
  if (!Number.isFinite(lastPerfMs) || !Number.isFinite(nowPerfMs) || nowPerfMs <= lastPerfMs) {
    return {
      usedSeconds: safeCurrent,
      addedSeconds: 0,
      nextPerfMs: Number.isFinite(nowPerfMs) ? nowPerfMs : lastPerfMs,
    };
  }

  const deltaMs = nowPerfMs - lastPerfMs;
  const wholeSeconds = Math.floor(deltaMs / 1000);
  if (wholeSeconds <= 0) {
    return {
      usedSeconds: safeCurrent,
      addedSeconds: 0,
      nextPerfMs: lastPerfMs,
    };
  }

  const nextUsed = Math.min(maxSeconds, safeCurrent + wholeSeconds);
  return {
    usedSeconds: nextUsed,
    addedSeconds: nextUsed - safeCurrent,
    nextPerfMs: lastPerfMs + wholeSeconds * 1000,
  };
}

/**
 * Computes effective Pro access: paid/voucher Pro OR remaining daily free seconds > 0.
 */
export function computeProAccess(
  isPro: boolean,
  usedSeconds: number,
  maxSeconds: number = DAILY_PRO_ALLOWANCE_SECONDS
): ProAccessResolution {
  const clampedUsed = Math.max(0, Math.min(maxSeconds, Math.floor(usedSeconds)));
  const remainingSeconds = Math.max(0, maxSeconds - clampedUsed);
  return {
    hasProAccess: Boolean(isPro) || remainingSeconds > 0,
    remainingSeconds,
    isExpired: !isPro && remainingSeconds <= 0,
  };
}

export function formatRemainingTimer(remainingSeconds: number): string {
  const safe = Math.max(0, Math.floor(remainingSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function readLocalStorageRecord(): DailyProTimerRecord | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(DAILY_PRO_TIMER_LS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'date' in parsed &&
      'usedSeconds' in parsed &&
      typeof (parsed as DailyProTimerRecord).date === 'string' &&
      typeof (parsed as DailyProTimerRecord).usedSeconds === 'number'
    ) {
      return parsed as DailyProTimerRecord;
    }
    return null;
  } catch {
    return null;
  }
}

function writeLocalStorageRecord(record: DailyProTimerRecord): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(DAILY_PRO_TIMER_LS_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota or privacy mode errors
  }
}

function openTimerDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      const req = indexedDB.open(DAILY_PRO_TIMER_IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DAILY_PRO_TIMER_IDB_STORE)) {
          db.createObjectStore(DAILY_PRO_TIMER_IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readIndexedDbRecord(): Promise<DailyProTimerRecord | null> {
  const db = await openTimerDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DAILY_PRO_TIMER_IDB_STORE, 'readonly');
      const store = tx.objectStore(DAILY_PRO_TIMER_IDB_STORE);
      const req = store.get(DAILY_PRO_TIMER_IDB_RECORD_KEY);
      req.onsuccess = () => {
        const val = req.result as DailyProTimerRecord | undefined;
        db.close();
        if (val && typeof val.date === 'string' && typeof val.usedSeconds === 'number') {
          resolve(val);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      try {
        db.close();
      } catch {
        // Ignore close errors
      }
      resolve(null);
    }
  });
}

async function writeIndexedDbRecord(record: DailyProTimerRecord): Promise<void> {
  const db = await openTimerDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DAILY_PRO_TIMER_IDB_STORE, 'readwrite');
      const store = tx.objectStore(DAILY_PRO_TIMER_IDB_STORE);
      store.put(record, DAILY_PRO_TIMER_IDB_RECORD_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      try {
        db.close();
      } catch {
        // Ignore close errors
      }
      resolve();
    }
  });
}

function broadcastTimerUpdate(record: DailyProTimerRecord): void {
  try {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<DailyProTimerRecord>(DAILY_PRO_TIMER_EVENT, { detail: record }));
  } catch {
    // Ignore event dispatch errors
  }
}

export interface UseDailyProTimerOptions {
  isPro: boolean;
  /** Must be true ONLY while the user is actively inside a Pro feature. */
  active: boolean;
}

export interface DailyProTimerState {
  usedSeconds: number;
  remainingSeconds: number;
  formattedRemaining: string;
  hasProAccess: boolean;
  isExpired: boolean;
  showPill: boolean;
}

export function useDailyProTimer({ isPro, active }: UseDailyProTimerOptions): DailyProTimerState {
  const [record, setRecord] = useState<DailyProTimerRecord>(() => {
    const today = getLocalDateKey();
    const lsRec = readLocalStorageRecord();
    return {
      date: today,
      usedSeconds: resolveDailyUsedSeconds(today, lsRec, null),
    };
  });

  const recordRef = useRef<DailyProTimerRecord>(record);
  recordRef.current = record;

  const lastPerfRef = useRef<number | null>(null);

  const persistMirror = useCallback((next: DailyProTimerRecord) => {
    recordRef.current = next;
    setRecord(next);
    writeLocalStorageRecord(next);
    void writeIndexedDbRecord(next);
    broadcastTimerUpdate(next);
  }, []);

  // Hydrate & reconcile localStorage vs IndexedDB on mount (always Math.max)
  useEffect(() => {
    let mounted = true;
    const today = getLocalDateKey();
    const lsRec = readLocalStorageRecord();

    void readIndexedDbRecord().then((idbRec) => {
      if (!mounted) return;
      const mergedUsed = resolveDailyUsedSeconds(today, lsRec, idbRec);
      const currentUsed = recordRef.current.date === today ? recordRef.current.usedSeconds : 0;
      const finalUsed = Math.max(mergedUsed, currentUsed);
      const next: DailyProTimerRecord = { date: today, usedSeconds: finalUsed };

      if (
        recordRef.current.date !== next.date ||
        recordRef.current.usedSeconds !== next.usedSeconds ||
        lsRec?.date !== next.date ||
        lsRec?.usedSeconds !== next.usedSeconds ||
        idbRec?.date !== next.date ||
        idbRec?.usedSeconds !== next.usedSeconds
      ) {
        persistMirror(next);
      }
    });

    const handleExternalUpdate = (e: Event) => {
      const detail = (e as CustomEvent<DailyProTimerRecord>).detail;
      if (!detail || typeof detail.date !== 'string') return;
      const nowDate = getLocalDateKey();
      const nextUsed = resolveDailyUsedSeconds(nowDate, recordRef.current, detail);
      if (recordRef.current.date !== nowDate || nextUsed > recordRef.current.usedSeconds) {
        const merged = { date: nowDate, usedSeconds: nextUsed };
        recordRef.current = merged;
        setRecord(merged);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(DAILY_PRO_TIMER_EVENT, handleExternalUpdate);
    }

    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener(DAILY_PRO_TIMER_EVENT, handleExternalUpdate);
      }
    };
  }, [persistMirror]);

  // Monotonic performance.now() ticker: ONLY ticks when !isPro && active && !document.hidden
  useEffect(() => {
    if (isPro || !active) {
      lastPerfRef.current = null;
      return;
    }

    const isHidden = () => typeof document !== 'undefined' && document.hidden === true;

    const flushDelta = () => {
      const today = getLocalDateKey();
      const baseUsed = recordRef.current.date === today ? recordRef.current.usedSeconds : 0;

      if (recordRef.current.date !== today) {
        lastPerfRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
        persistMirror({ date: today, usedSeconds: 0 });
        return;
      }

      if (baseUsed >= DAILY_PRO_ALLOWANCE_SECONDS) {
        lastPerfRef.current = null;
        return;
      }

      const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (lastPerfRef.current === null) {
        lastPerfRef.current = nowMs;
        return;
      }

      const { usedSeconds, addedSeconds, nextPerfMs } = accrueMonotonicSeconds(
        baseUsed,
        lastPerfRef.current,
        nowMs
      );
      lastPerfRef.current = nextPerfMs;

      if (addedSeconds > 0) {
        persistMirror({ date: today, usedSeconds });
      }
    };

    if (!isHidden()) {
      lastPerfRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    } else {
      lastPerfRef.current = null;
    }

    const handleVisibilityChange = () => {
      if (isHidden()) {
        flushDelta();
        lastPerfRef.current = null;
      } else {
        lastPerfRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      }
    };

    const intervalId = window.setInterval(() => {
      if (isHidden()) {
        lastPerfRef.current = null;
        return;
      }
      flushDelta();
    }, 1000);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (!isHidden()) {
        flushDelta();
      }
      lastPerfRef.current = null;
      window.clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [isPro, active, persistMirror]);

  const access = computeProAccess(isPro, record.usedSeconds);

  return {
    usedSeconds: record.usedSeconds,
    remainingSeconds: access.remainingSeconds,
    formattedRemaining: formatRemainingTimer(access.remainingSeconds),
    hasProAccess: access.hasProAccess,
    isExpired: access.isExpired,
    showPill: !isPro && active && access.remainingSeconds > 0,
  };
}
