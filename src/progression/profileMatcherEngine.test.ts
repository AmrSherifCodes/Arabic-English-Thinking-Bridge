import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAllLanguageProfiles,
  scoreAndSortProfiles,
  computeTypologicalDistance,
  computeCognateOverlap,
  buildLanguagePairLexicon,
  LANGUAGE_METADATA,
  UserLearningPreferences,
} from './profileMatcherEngine';

describe('profileMatcherEngine', () => {
  it('generates 1440 profile combinations for 16 languages x 15 targets x 6 focus areas', () => {
    const profiles = generateAllLanguageProfiles('general', 'A1', true);
    assert.equal(profiles.length, 1440);
  });

  it('computes typological distance correctly between sister and distant languages', () => {
    const es = LANGUAGE_METADATA.es;
    const it = LANGUAGE_METADATA.it;
    const ja = LANGUAGE_METADATA.ja;

    const romanceDist = computeTypologicalDistance(es, it);
    const distantDist = computeTypologicalDistance(es, ja);

    assert.ok(romanceDist < distantDist);
  });

  it('ranks Egyptian Arabic native with target English appropriately', () => {
    const profiles = generateAllLanguageProfiles('general', 'A1', true);
    const prefs: UserLearningPreferences = {
      nativeLang: 'arz',
      desiredTargetLangs: ['en'],
      preferredFocusArea: 'general',
      preferredStyle: 'thinking-bridge',
      currentStage: 'A1',
      dailyMinutes: 30,
      challengeAppetite: 0.5,
    };

    const sorted = scoreAndSortProfiles(profiles, prefs, 10);
    assert.ok(sorted.length > 0);
    assert.equal(sorted[0].profile.sourceLang, 'arz');
    assert.equal(sorted[0].profile.targetLang, 'en');
  });

  it('bridges non-English language pairs via pivot glosses without error', () => {
    const srcDict = [{ word: 'casa', translation: 'house' }];
    const tgtDict = [{ word: 'Haus', translation: 'house' }];

    const bridged = buildLanguagePairLexicon('es', 'de', srcDict, tgtDict);
    assert.equal(bridged.length, 1);
    assert.equal(bridged[0].word, 'Haus');
    assert.equal(bridged[0].translation, 'casa');
  });
});
