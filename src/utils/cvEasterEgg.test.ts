import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CV_DEV_MODE_CLICKS,
  CV_GAME_START_CLICKS,
  CV_POEM_CLICKS,
  DEV_MODE_STORAGE_KEY,
  advanceCvClickState,
  getCvGameMilestone,
  isDevModeEnabled,
  setDevModeEnabled,
} from './cvEasterEgg';

test('cvEasterEgg stays normal on clicks 1-2 and starts tap game cleanly at click 3', () => {
  const c1 = advanceCvClickState(0);
  assert.equal(c1.count, 1);
  assert.equal(c1.phase, 'normal');
  assert.equal(c1.enteredGame, false);
  assert.equal(c1.remainingForDev, 109);

  const c2 = advanceCvClickState(c1.count);
  assert.equal(c2.count, 2);
  assert.equal(c2.phase, 'normal');
  assert.equal(c2.enteredGame, false);

  const c3 = advanceCvClickState(c2.count);
  assert.equal(c3.count, CV_GAME_START_CLICKS);
  assert.equal(c3.phase, 'game');
  assert.equal(c3.enteredGame, true);
  assert.equal(c3.enteredDevMode, false);
  assert.equal(c3.unlockedPoem, false);
});

test('cvEasterEgg stays in game through 109, enters Dev Mode at 110, and unlocks pure poem at 111', () => {
  const c109 = advanceCvClickState(108);
  assert.equal(c109.count, 109);
  assert.equal(c109.phase, 'game');
  assert.equal(c109.remainingForDev, 1);
  assert.equal(c109.progressPercent, 99);

  const c110 = advanceCvClickState(109);
  assert.equal(c110.count, CV_DEV_MODE_CLICKS);
  assert.equal(c110.phase, 'dev');
  assert.equal(c110.enteredDevMode, true);
  assert.equal(c110.unlockedPoem, false);
  assert.equal(c110.progressPercent, 100);
  assert.equal(c110.remainingForDev, 0);

  const c111 = advanceCvClickState(110);
  assert.equal(c111.count, CV_POEM_CLICKS);
  assert.equal(c111.phase, 'poem');
  assert.equal(c111.unlockedPoem, true);
  assert.match(getCvGameMilestone(111), /111/);
});

test('cvEasterEgg setDevModeEnabled persists and notifies safely when storage is mocked', () => {
  const store = new Map<string, string>();
  const events: string[] = [];
  const origWindow = (globalThis as any).window;
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    },
    dispatchEvent: (ev: Event) => {
      events.push(ev.type);
      return true;
    },
  };

  try {
    assert.equal(isDevModeEnabled(), false);
    setDevModeEnabled(true);
    assert.equal(store.get(DEV_MODE_STORAGE_KEY), 'true');
    assert.equal(isDevModeEnabled(), true);
    setDevModeEnabled(false);
    assert.equal(isDevModeEnabled(), false);
    assert.deepEqual(events, ['tb-dev-mode-change', 'tb-dev-mode-change']);
  } finally {
    (globalThis as any).window = origWindow;
  }
});
