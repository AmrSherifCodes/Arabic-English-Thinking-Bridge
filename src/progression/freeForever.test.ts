import test from 'node:test';
import assert from 'node:assert/strict';
import { compactProgressionState, decompactUserState, MAX_STATE_SIZE_BYTES, resolveRealSrsCardText } from './compaction';
import { createInitialProgressionState } from './engine';
import { syncEngine } from '../services/syncEngine';
import { generateSmartConversationReply } from '../services/smartConversation';

test('1. compactProgressionState enforces 64 KB state size limit and excludes unreviewed cards', () => {
  const state = createInitialProgressionState();

  // Add 10 reviewed SRS cards
  for (let i = 0; i < 10; i++) {
    state.srsItems[`card-${i}`] = {
      id: `card-${i}`,
      term: `word-${i}`,
      sourceText: `source-${i}`,
      targetText: `target-${i}`,
      targetLang: 'en',
      stability: 2.0,
      difficulty: 5.0,
      lapses: 0,
      reviews: 1, // Reviewed -> kept in compact payload
      lastReviewedAt: Date.now(),
      dueAt: Date.now() + 86400000,
    };
  }

  // Add 5 unreviewed cards (reviews === 0)
  for (let i = 10; i < 15; i++) {
    state.srsItems[`card-${i}`] = {
      id: `card-${i}`,
      term: `unreviewed-${i}`,
      sourceText: `unreviewed-${i}`,
      targetText: `unreviewed-${i}`,
      targetLang: 'en',
      stability: 1.0,
      difficulty: 5.0,
      lapses: 0,
      reviews: 0, // Unreviewed -> MUST BE EXCLUDED
      lastReviewedAt: 0,
      dueAt: Date.now(),
    };
  }

  const compact = compactProgressionState(state);
  assert.equal(compact.srs.length, 10, 'Unreviewed cards must be excluded from state compaction');

  const jsonStr = JSON.stringify(compact);
  const sizeBytes = new TextEncoder().encode(jsonStr).length;
  assert.ok(sizeBytes < MAX_STATE_SIZE_BYTES, 'Compacted state size must be well under 64 KB limit');
});

test('2. Guests make ZERO database/network calls (Strict local-first rule)', async () => {
  const state = createInitialProgressionState();
  const isGuest = true;

  // Override fetch to throw an error if called
  const originalFetch = globalThis.fetch;
  (globalThis as any).fetch = () => {
    throw new Error('NETWORK_CALL_ATTEMPTED_FOR_GUEST: Guest users must make zero network calls!');
  };

  try {
    const synced = await syncEngine.syncUserState(state, isGuest);
    assert.equal(synced, true, 'Guest sync must resolve true immediately with ZERO network/fetch calls');
  } finally {
    (globalThis as any).fetch = originalFetch;
  }
});

test('3. State completeness: preserves completed lessons, quests, achievements, dates & card cap', () => {
  const base = createInitialProgressionState();
  base.xp = 275;
  base.streak = 8;
  base.completedLessonIds = ['p1-l1', 'p1-l2'];
  base.lastActiveDate = '2026-11-05';
  base.weekendPauseActive = true;
  base.dailyCardsCap = 50;
  base.quests[0].currentCount = 1;
  base.quests[0].isCompleted = true;
  base.achievements[0].unlockedAt = Date.now();

  const compact = compactProgressionState(base);
  assert.equal(compact.xp, 275, 'XP must be preserved for Supabase sync');
  assert.equal(compact.strk, 8, 'Streak must be preserved for Supabase sync');
  assert.deepEqual(compact.cls, ['p1-l1', 'p1-l2'], 'Completed lesson IDs must be preserved');
  assert.equal(compact.lad, '2026-11-05', 'Last active date must be preserved');
  assert.equal(compact.wp, true, 'Weekend pause setting must be preserved');
  assert.equal(compact.cap, 50, 'Daily cards cap must be preserved');

  const decompacted = decompactUserState(compact, createInitialProgressionState());
  assert.equal(decompacted.xp, 275);
  assert.equal(decompacted.streak, 8);
  assert.deepEqual(decompacted.completedLessonIds, ['p1-l1', 'p1-l2']);
  assert.equal(decompacted.lastActiveDate, '2026-11-05');
  assert.equal(decompacted.weekendPauseActive, true);
  assert.equal(decompacted.dailyCardsCap, 50);
  assert.equal(decompacted.quests[0].isCompleted, true);
  assert.ok(decompacted.achievements[0].unlockedAt !== null);
});

test('4. SRS card real text restoration from bundled dictionaries', () => {
  const base = createInitialProgressionState();
  const compact = {
    v: 2,
    lvl: 5,
    xp: 450,
    strk: 7,
    shlds: 3,
    stg: 'A1',
    crowns: { 'p1-l1': 2 },
    cls: ['p1-l1'],
    q: [],
    ach: [],
    lad: '2026-11-05',
    wp: false,
    cap: 30,
    skills: { st: 5, vo: 4, li: 3, sp: 3, wr: 5 },
    srs: [
      { id: 'de-kaffee', s: 4.5, d: 3.2, l: 0, r: 2, due: Date.now() + 100000 },
    ],
    ts: Date.now(),
  };

  const restored = decompactUserState(compact, base);
  assert.ok(restored.srsItems['de-kaffee'].term.length > 0, 'Real German term must be restored');
  assert.ok(restored.srsItems['de-kaffee'].sourceText.length > 0, 'Source translation must be restored');
});

test('5. AI quota fallback uses deterministic offline engine when network fails', () => {
  const reply = generateSmartConversationReply('Hello Amr, how are you?');
  assert.ok(reply.length > 0, 'Offline rule-based fallback reply must return valid response');
  assert.match(reply, /practicing|fantastic|excited|wonderful|great|hello|welcome/i, 'Reply must be warm and conversational');
});
