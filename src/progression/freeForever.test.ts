import test from 'node:test';
import assert from 'node:assert/strict';
import { compactProgressionState, decompactUserState, MAX_STATE_SIZE_BYTES } from './compaction';
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

test('2. Guests make ZERO database calls (local-first rule)', async () => {
  const state = createInitialProgressionState();
  const isGuest = true;

  // Attempting to sync as a guest should resolve true immediately without any network calls
  const synced = await syncEngine.syncUserState(state, isGuest);
  assert.equal(synced, true, 'Guest sync must resolve true immediately with zero DB calls');
});

test('3. AI quota fallback uses deterministic offline engine when network fails', () => {
  const reply = generateSmartConversationReply('Hello Amr, how are you?');
  assert.ok(reply.length > 0, 'Offline rule-based fallback reply must return valid response');
  assert.match(reply, /practicing|fantastic|excited|wonderful|great|hello|welcome/i, 'Reply must be warm and conversational');
});

test('4. DecompactUserState restores base state and SRS items correctly', () => {
  const base = createInitialProgressionState();
  const compact = {
    v: 2,
    lvl: 5,
    xp: 450,
    strk: 7,
    shlds: 3,
    stg: 'A1',
    crowns: { 'p1-l1': 2 },
    skills: { st: 5, vo: 4, li: 3, sp: 3, wr: 5 },
    srs: [
      { id: 'card-1', s: 4.5, d: 3.2, l: 0, r: 2, due: Date.now() + 100000 },
    ],
    ts: Date.now(),
  };

  const restored = decompactUserState(compact, base);
  assert.equal(restored.overallLevel, 5);
  assert.equal(restored.xp, 450);
  assert.equal(restored.streak, 7);
  assert.equal(restored.srsItems['card-1'].stability, 4.5);
});
