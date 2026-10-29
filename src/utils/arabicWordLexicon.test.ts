import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupArabicWord, stripTashkeel } from './arabicWordLexicon';
import { cardSched } from './fx';
import { PHASES_DATA } from '../data/lessons';
import {
  PREBUILT_DECKS,
  LEXICORE_DISCLAIMER,
  TATOEBA_DISCLAIMER,
  PUBLIC_DOMAIN_DISCLAIMER
} from '../data/prebuiltDecks';
import { DEFAULT_PROGRESS, sanitizeUserProgress } from './storage';
import { saveVoiceNoteToVault, resolveVoiceNoteFromVault } from './audioVault';
import { buildStandaloneHtmlString } from './standaloneHtmlBuilder';
import { EXPANDED_DECKS } from '../data/expandedDecks';
import {
  applyHabitMistakeWithShield,
  applyHabitWin,
  computeNextHintWord
} from './habitPsychology';

test('stripTashkeel strips Arabic diacritics, tatweel, and punctuation and normalizes Alef', () => {
  assert.equal(stripTashkeel('فُحِصَتْ'), 'فحصت');
  assert.equal(stripTashkeel('أَرْسَلْتُ،'), 'أرسلت');
  assert.equal(stripTashkeel('الإسكندرية.'), 'الأسكندرية');
  assert.equal(stripTashkeel('عـيّـنـات'), 'عينات');
});

test('lookupArabicWord resolves diacritic-marked words and all 72 exercises deterministically', () => {
  const entry1 = lookupArabicWord('عِنْدِي');
  assert.match(entry1.en, /I have/i);

  const entry2 = lookupArabicWord('فُحِصت');
  assert.match(entry2.en, /were tested/i);

  const allExercises = PHASES_DATA.flatMap(p => p.lessons.flatMap(l => l.exercises));
  for (const ex of allExercises) {
    const tokens = ex.arabicThought.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const res = lookupArabicWord(token, ex);
      assert.notEqual(
        res.en,
        'Check chunk breakdown below',
        `Expected deterministic translation for token "${token}" in exercise ${ex.id}`
      );
    }
  }
});

test('cardSched computes SM-2 spaced repetition intervals for Again, Hard, Good, Easy', () => {
  const gAgain = cardSched(undefined, 0);
  assert.equal(gAgain.int, 0);
  assert.equal(gAgain.reps, 0);

  const gHard = cardSched(undefined, 1);
  assert.equal(gHard.int, 1);

  const gGood1 = cardSched(undefined, 2);
  assert.equal(gGood1.int, 1);
  assert.equal(gGood1.reps, 1);

  const gGood2 = cardSched(gGood1, 2);
  assert.equal(gGood2.int, 3);
  assert.equal(gGood2.reps, 2);

  const gEasy = cardSched(undefined, 3);
  assert.equal(gEasy.int, 3);
  assert.equal(gEasy.reps, 1);
});

test('PREBUILT_DECKS and EXPANDED_DECKS are 100% Copyright-Free (CC0 1.0 Public Domain) and include Ultra-Beginner starter deck', async () => {
  const starter = PREBUILT_DECKS.find(d => d.id === 'beginner-starter-a0');
  assert.ok(starter);
  assert.equal(starter.license, 'CC0 1.0 Public Domain');
  assert.equal(starter.cards.length, 15);
  assert.ok(PUBLIC_DOMAIN_DISCLAIMER.includes('100% Copyright-Free'));

  const lexicore = PREBUILT_DECKS.find(d => d.name === 'LexiCore Daily English');
  assert.ok(lexicore);
  assert.equal(lexicore.license, 'CC0 1.0 Public Domain');
  assert.equal(lexicore.cards.length, 10);
  assert.ok(LEXICORE_DISCLAIMER.includes('100% Copyright-Free'));

  const tatoeba = PREBUILT_DECKS.find(d => d.name === 'Tatoeba Structural Bridges');
  assert.ok(tatoeba);
  assert.equal(tatoeba.license, 'CC0 1.0 Public Domain');
  assert.equal(tatoeba.cards.length, 10);
  assert.ok(TATOEBA_DISCLAIMER.includes('100% Copyright-Free'));

  const sanitized = sanitizeUserProgress({
    importedDecks: ['lexicore-daily', 'tatoeba-bridging'],
    reviewHistory: { '2026-10-28': 15, invalidKey: 99 },
    beginnerMode: true,
    dailyGoalCount: 4,
    dailyGoalDate: '2026-10-28',
    comboCount: 2,
    streakShields: 2
  });
  assert.deepEqual(sanitized.importedDecks, ['lexicore-daily', 'tatoeba-bridging']);
  assert.deepEqual(sanitized.reviewHistory, { '2026-10-28': 15 });
  assert.equal(sanitized.beginnerMode, true);
  assert.equal(sanitized.dailyGoalCount, 4);
  assert.equal(sanitized.comboCount, 2);
  assert.equal(sanitized.streakShields, 2);

  const refKey = await saveVoiceNoteToVault('data:audio/webm;base64,AAAA');
  assert.ok(refKey.startsWith('idb:vn-'));
  const resolved = await resolveVoiceNoteFromVault(refKey);
  assert.equal(resolved, 'data:audio/webm;base64,AAAA');
});

test('EXPANDED_DECKS contains 4 thematic decks with 40 + 40 + 40 + 30 = 150 total cards under CC0 1.0 Public Domain', () => {
  assert.equal(EXPANDED_DECKS.length, 4);
  const counts = EXPANDED_DECKS.map(d => ({
    name: d.name,
    count: d.cards.length,
    license: d.license
  }));
  assert.deepEqual(counts, [
    { name: 'Daily Life & Routines', count: 40, license: 'CC0 1.0 Public Domain' },
    { name: 'Work & Business', count: 40, license: 'CC0 1.0 Public Domain' },
    { name: 'Travel & Social', count: 40, license: 'CC0 1.0 Public Domain' },
    { name: 'Opinions & Connectors', count: 30, license: 'CC0 1.0 Public Domain' }
  ]);
  const total = EXPANDED_DECKS.reduce((sum, d) => sum + d.cards.length, 0);
  assert.equal(total, 150);
  for (const deck of EXPANDED_DECKS) {
    for (const card of deck.cards) {
      assert.ok(card.ar.trim().length > 0);
      assert.ok(card.en.trim().length > 0);
    }
  }
});

test('habitPsychology: computeNextHintWord, Variable-Ratio Mystery Chest, and Streak Shield protection work deterministically', () => {
  const hint1 = computeNextHintWord('I am ready right now.', '');
  assert.equal(hint1.nextWord, 'I');
  assert.equal(hint1.prefixToKeep, '');

  const hint2 = computeNextHintWord('I am ready right now.', 'I am');
  assert.equal(hint2.nextWord, 'ready');
  assert.equal(hint2.prefixToKeep, 'I am');

  const hintDone = computeNextHintWord('I am ready.', 'I am ready');
  assert.equal(hintDone.nextWord, null);

  // 3 wins in a row trigger the Mystery XP Chest
  let state = { ...DEFAULT_PROGRESS, dailyGoalDate: '2026-10-28', dailyGoalCount: 0, comboCount: 0 };
  const w1 = applyHabitWin(state, 10, '2026-10-28');
  assert.equal(w1.mysteryChest.triggered, false);
  assert.equal(w1.nextProgress.comboCount, 1);

  const w2 = applyHabitWin(w1.nextProgress, 10, '2026-10-28');
  assert.equal(w2.mysteryChest.triggered, false);
  assert.equal(w2.nextProgress.comboCount, 2);

  const w3 = applyHabitWin(w2.nextProgress, 10, '2026-10-28');
  assert.equal(w3.mysteryChest.triggered, true);
  assert.ok(w3.mysteryChest.bonusXp >= 15);
  assert.equal(w3.nextProgress.comboCount, 0);

  // Streak Shield protects a streak >= 2 on a mistake
  const shielded = applyHabitMistakeWithShield(w3.nextProgress);
  assert.equal(shielded.shieldUsed, true);
  assert.equal(shielded.preservedStreak, 3);
  assert.equal(shielded.nextProgress.streak, 3);
  assert.equal(shielded.nextProgress.streakShields, 1);
});

test('buildStandaloneHtmlString produces a complete self-contained HTML app without cookie gate', () => {
  const html = buildStandaloneHtmlString();
  assert.ok(
    html.startsWith('<!-- Copyright (c) 2026 Amr Sherif. All rights reserved. -->\n<!DOCTYPE html>')
  );
  assert.ok(html.includes('Thinking English™'));
  assert.ok(html.includes('Daily Life & Routines'));
  assert.ok(html.includes('Work & Business'));
  assert.ok(html.includes('Travel & Social'));
  assert.ok(html.includes('Opinions & Connectors'));
  assert.ok(html.includes('LexiCore Daily English'));
  assert.ok(html.includes('Tatoeba Structural Bridges'));
  assert.ok(html.includes('https://forms.gle/QhXYEV3gEusYLnxf9'));
  assert.ok(!html.includes('Action required to load your app'));
});
