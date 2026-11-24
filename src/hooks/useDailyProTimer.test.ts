// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_PRO_ALLOWANCE_SECONDS,
  accrueMonotonicSeconds,
  computeProAccess,
  formatRemainingTimer,
  getLocalDateKey,
  resolveDailyUsedSeconds,
} from './useDailyProTimer.ts';

test('daily reset: stale dates reset to 0 while current date preserves usage', () => {
  const today = '2026-11-24';
  const yesterday = '2026-11-23';

  assert.equal(
    resolveDailyUsedSeconds(
      today,
      { date: yesterday, usedSeconds: 850 },
      { date: yesterday, usedSeconds: 900 }
    ),
    0
  );

  assert.equal(
    resolveDailyUsedSeconds(
      today,
      { date: today, usedSeconds: 120 },
      { date: yesterday, usedSeconds: 900 }
    ),
    120
  );
});

test('Math.max mirror enforcement between localStorage and IndexedDB', () => {
  const today = '2026-11-24';

  // User cleared localStorage, but IndexedDB retains higher usage
  assert.equal(
    resolveDailyUsedSeconds(today, null, { date: today, usedSeconds: 640 }),
    640
  );

  // User tampered localStorage down to 10s, IndexedDB has 420s -> Math.max enforces 420s
  assert.equal(
    resolveDailyUsedSeconds(
      today,
      { date: today, usedSeconds: 10 },
      { date: today, usedSeconds: 420 }
    ),
    420
  );

  // Clamps above allowance to DAILY_PRO_ALLOWANCE_SECONDS (900)
  assert.equal(
    resolveDailyUsedSeconds(
      today,
      { date: today, usedSeconds: 1500 },
      { date: today, usedSeconds: 200 }
    ),
    DAILY_PRO_ALLOWANCE_SECONDS
  );
});

test('monotonic performance.now() accrual ignores backward jumps and clamps at 900s', () => {
  // Normal 5.4s forward delta -> accrues 5 whole seconds, keeps 400ms remainder
  const r1 = accrueMonotonicSeconds(100, 10_000, 15_400);
  assert.equal(r1.usedSeconds, 105);
  assert.equal(r1.addedSeconds, 5);
  assert.equal(r1.nextPerfMs, 15_000);

  // Sub-second delta -> accrues 0, does not advance anchor
  const r2 = accrueMonotonicSeconds(105, 15_000, 15_800);
  assert.equal(r2.usedSeconds, 105);
  assert.equal(r2.addedSeconds, 0);
  assert.equal(r2.nextPerfMs, 15_000);

  // Backward clock jump -> ignores jump, accrues 0
  const r3 = accrueMonotonicSeconds(105, 15_000, 12_000);
  assert.equal(r3.usedSeconds, 105);
  assert.equal(r3.addedSeconds, 0);
  assert.equal(r3.nextPerfMs, 12_000);

  // Clamps at 900s allowance
  const r4 = accrueMonotonicSeconds(895, 20_000, 35_000);
  assert.equal(r4.usedSeconds, 900);
  assert.equal(r4.addedSeconds, 5);
});

test('hasProAccess cutoff at 900s for free users and unlimited for Pro users', () => {
  const freeAtStart = computeProAccess(false, 0);
  assert.equal(freeAtStart.hasProAccess, true);
  assert.equal(freeAtStart.remainingSeconds, 900);
  assert.equal(freeAtStart.isExpired, false);
  assert.equal(formatRemainingTimer(freeAtStart.remainingSeconds), '15:00');

  const freeAt899 = computeProAccess(false, 899);
  assert.equal(freeAt899.hasProAccess, true);
  assert.equal(freeAt899.remainingSeconds, 1);
  assert.equal(freeAt899.isExpired, false);
  assert.equal(formatRemainingTimer(freeAt899.remainingSeconds), '00:01');

  const freeAt900 = computeProAccess(false, 900);
  assert.equal(freeAt900.hasProAccess, false);
  assert.equal(freeAt900.remainingSeconds, 0);
  assert.equal(freeAt900.isExpired, true);
  assert.equal(formatRemainingTimer(freeAt900.remainingSeconds), '00:00');

  // Paid Pro user always has access even if usedSeconds === 900
  const proAt900 = computeProAccess(true, 900);
  assert.equal(proAt900.hasProAccess, true);
  assert.equal(proAt900.isExpired, false);

  // Date key formatting
  assert.match(getLocalDateKey(new Date(2026, 10, 5)), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(getLocalDateKey(new Date(2026, 0, 9)), '2026-01-09');
});
