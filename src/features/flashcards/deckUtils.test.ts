import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UserProgress } from '../../types';
import { PHASES_DATA } from '../../data/lessons';
import { getJapanesePhases } from '../../data/curriculum/japaneseCurriculum';
import { getGermanPhases } from '../../data/curriculum/germanCurriculum';
import { getDeckCardKeys, getCardData, getDeckStats } from './deckUtils';

const emptyProgress: UserProgress = {
  completedExerciseIds: [],
  completedLessonIds: [],
  score: 0,
  streak: 0,
  bestStreak: 0,
  soundOn: true,
  lastActiveDate: '',
  weakSpotCounts: {},
  savedNotes: [],
};

test('1. Japanese phase-1 deck returns only ja-* IDs present in curriculum', () => {
  const keys = getDeckCardKeys('phase-1', emptyProgress, [], null, 'ar', 'ja');
  assert.ok(keys.length > 0);
  const valid = new Set(getJapanesePhases('ar')[0].lessons.flatMap(l => l.exercises).map(e => e.id));
  for (const k of keys) {
    assert.ok(k.startsWith('ja-'), `expected ja- prefix: ${k}`);
    assert.ok(valid.has(k), `unknown id: ${k}`);
  }
});

test('2. German phase-1 deck returns only de-* IDs present in curriculum', () => {
  const keys = getDeckCardKeys('phase-1', emptyProgress, [], null, 'ar', 'de');
  assert.ok(keys.length > 0);
  const valid = new Set(getGermanPhases('ar')[0].lessons.flatMap(l => l.exercises).map(e => e.id));
  for (const k of keys) {
    assert.ok(k.startsWith('de-'), `expected de- prefix: ${k}`);
    assert.ok(valid.has(k), `unknown id: ${k}`);
  }
});

test('3. Default (ar/en) phase-1 keys match English canonical PHASES_DATA', () => {
  const keys = getDeckCardKeys('phase-1', emptyProgress, [], null);
  const expected = (PHASES_DATA[0]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id));
  assert.deepEqual(keys, expected);
});

test('4. getCardData for ja key returns card with Japanese char in en', () => {
  const keys = getDeckCardKeys('phase-1', emptyProgress, [], null, 'ar', 'ja');
  const card = getCardData(keys[0], emptyProgress, [], null, 'ar', 'ja');
  assert.ok(card);
  assert.match(card.en, /[\u3040-\u30FF\u3400-\u9FFF]/);
});

test('5. Cross-language lookup of a Japanese exercise ID under de returns null', () => {
  const jaKeys = getDeckCardKeys('phase-1', emptyProgress, [], null, 'ar', 'ja');
  const card = getCardData(jaKeys[0], emptyProgress, [], null, 'ar', 'de');
  assert.equal(card, null);
});

test('6. getDeckStats phase-1 ja totalCards > 0', () => {
  const stats = getDeckStats('phase-1', emptyProgress, [], null, 'ar', 'ja');
  assert.ok(stats.totalCards > 0);
});