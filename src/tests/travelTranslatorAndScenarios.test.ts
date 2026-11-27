// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import * as nodeTest from 'node:test';
import assert from 'node:assert/strict';
import {
  TRAVEL_SCENARIOS,
  ScenarioLang,
  gradeVoiceReply,
  loadCompletedTravelScenarios,
  markTravelScenarioCompleted,
  TRAVEL_SCENARIOS_STORAGE_KEY,
} from '../data/travelScenariosData';
import {
  TRAVEL_PHRASEBOOK,
  WEB_OFFLINE_APK_BADGE_AR,
  getLocalTranslatorModelStatus,
  matchTravelPhrasebook,
  translateLocally,
} from '../native/localTranslator';

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

const ALL_SCENARIO_LANGS: ScenarioLang[] = ['en', 'de', 'es', 'it', 'fr', 'ar'];

describe('Thinking Bridge v10.3 — Local Translator & Travel Scenarios Suite', () => {
  test('1. All 8 real-world travel scenarios exist with valid 4+ turn dialogues across EN, DE, ES, IT, FR + EN->AR', () => {
    assert.equal(TRAVEL_SCENARIOS.length, 8, 'Must contain exactly 8 flagship travel scenarios');

    const expectedIds = [
      'airport',
      'taxi',
      'hotel',
      'cafe',
      'shopping',
      'pharmacy',
      'smalltalk',
      'police',
    ];
    assert.deepEqual(
      TRAVEL_SCENARIOS.map((s) => s.id),
      expectedIds
    );

    for (const scenario of TRAVEL_SCENARIOS) {
      assert.ok(scenario.turns.length >= 4, `${scenario.id} must have at least 4 turns`);
      assert.ok(scenario.badgeAr.trim().length > 0, `${scenario.id} must have Arabic badge`);
      assert.ok(scenario.badgeEn.trim().length > 0, `${scenario.id} must have English badge`);

      for (const turn of scenario.turns) {
        assert.equal(turn.choices.length, 3, `${turn.id} must have 3 branching choices`);
        assert.deepEqual(
          turn.choices.map((c) => c.tone),
          ['polite', 'natural', 'survival'],
          `${turn.id} choices must cover polite, natural, survival`
        );

        for (const lang of ALL_SCENARIO_LANGS) {
          assert.ok(
            turn.strangerLine[lang].trim().length > 3,
            `${turn.id} missing strangerLine for ${lang}`
          );
          const reactions = new Set<string>();
          for (const choice of turn.choices) {
            assert.ok(
              choice.text[lang].trim().length > 2,
              `${choice.id} missing choice text for ${lang}`
            );
            assert.ok(
              choice.strangerReaction[lang].trim().length > 2,
              `${choice.id} missing strangerReaction for ${lang}`
            );
            reactions.add(choice.strangerReaction[lang].trim());
          }
          assert.equal(
            reactions.size,
            3,
            `${turn.id} (${lang}) should have 3 distinct stranger reactions`
          );
        }
      }
    }
  });

  test('2. Local voice-reply fuzzy grader scores close pronunciations >= 65% (+20 XP) and gives coaching hints on misses', () => {
    const expected = [
      'Good evening. Here is my passport. I am here for tourism.',
      'Hi! Here you go — just visiting for a short vacation.',
      'Here is my passport. Tourism.',
    ];

    // Exact / near-exact pronunciation pass
    const passRes = gradeVoiceReply('here is my passport tourism', expected);
    assert.equal(passRes.passed, true);
    assert.ok(passRes.score >= 65, `Expected score >= 65, got ${passRes.score}`);
    assert.equal(passRes.xpEarned, 20);
    assert.equal(passRes.matchedChoiceIndex, 2);

    // Slight pronunciation typo still passes (>= 65%)
    const closeGerman = gradeVoiceReply('hier ist mein pass ich bin als tourist hier', [
      'Guten Abend. Hier ist mein Pass. Ich bin als Tourist hier.',
    ]);
    assert.equal(closeGerman.passed, true);
    assert.equal(closeGerman.xpEarned, 20);

    // Unrelated phrase fails (< 65%) and gives coaching hint showing exact expected phrase
    const missRes = gradeVoiceReply('banana spaceship', expected);
    assert.equal(missRes.passed, false);
    assert.ok(missRes.score < 65);
    assert.equal(missRes.xpEarned, 0);
    assert.ok(
      missRes.feedbackAr.includes(missRes.bestExpectedPhrase),
      'Miss feedback must include exact phrase to repeat'
    );
  });

  test('3. Offline Travel Phrasebook fallback works cleanly (0ms, 200+ phrases) when Capacitor.isNativePlatform() is false', async () => {
    installMockLocalStorage();
    assert.ok(
      TRAVEL_PHRASEBOOK.length >= 200,
      `Phrasebook should have 200+ sentences, found ${TRAVEL_PHRASEBOOK.length}`
    );
    assert.ok(WEB_OFFLINE_APK_BADGE_AR.includes('APK'));

    // Status on web returns graceful web fallback
    const status = await getLocalTranslatorModelStatus({ sourceLang: 'ar', targetLang: 'de' });
    assert.equal(status.isWebFallback, true);
    assert.equal(status.downloaded, true);

    // Exact Arabic -> German emergency phrase match
    const deRes = await translateLocally({
      text: 'أين الحمام؟',
      sourceLang: 'ar',
      targetLang: 'de',
    });
    assert.equal(deRes.translatedText, 'Wo ist die Toilette?');
    assert.equal(deRes.engine, 'phrasebook-offline');
    assert.equal(deRes.latencyMs, 0);
    assert.equal(deRes.isWebFallback, true);

    // Egyptian Arabic colloquial alias -> English
    const enRes = await translateLocally({
      text: 'بكام ده',
      sourceLang: 'ar-EG',
      targetLang: 'en',
    });
    assert.equal(enRes.translatedText, 'How much is this?');
    assert.equal(enRes.engine, 'phrasebook-offline');

    // Reverse stranger reply: French -> Arabic
    const arRes = matchTravelPhrasebook('Est-ce que c’est Halal ?', 'fr', 'ar');
    assert.ok(arRes && arRes.translatedText.includes('حلال'));

    // Scenario completion persistence
    assert.deepEqual(loadCompletedTravelScenarios(), []);
    markTravelScenarioCompleted('airport');
    markTravelScenarioCompleted('cafe');
    assert.deepEqual(loadCompletedTravelScenarios(), ['airport', 'cafe']);
    localStorage.removeItem(TRAVEL_SCENARIOS_STORAGE_KEY);
  });
});
