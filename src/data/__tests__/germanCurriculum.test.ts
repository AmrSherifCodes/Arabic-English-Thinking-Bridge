import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GERMAN_PROGRESSION_LEVELS } from '../germanProgressionLevels';
import { GERMAN_BRIDGE_LEXICON } from '../germanBridgeLexicon';

test('germanCurriculum: 10 levels exist sequentially with valid depth', () => {
  assert.equal(GERMAN_PROGRESSION_LEVELS.length, 10);

  GERMAN_PROGRESSION_LEVELS.forEach((level, idx) => {
    assert.equal(level.id, idx + 1, `Level ID must be ${idx + 1}`);
    assert.ok(level.titleAr.length > 0, `Level ${level.id} titleAr must not be empty`);
    assert.ok(level.subtitleEn.length > 0, `Level ${level.id} subtitleEn must not be empty`);
    assert.ok(level.cefr.length > 0, `Level ${level.id} cefr must not be empty`);

    // Depth checks
    if (level.id <= 5) {
      assert.ok(
        level.cards.length >= 8,
        `Level ${level.id} must have >= 8 cards (found ${level.cards.length})`
      );
      assert.ok(
        level.sentenceBuilders.length >= 5,
        `Level ${level.id} must have >= 5 sentence builders (found ${level.sentenceBuilders.length})`
      );
      assert.ok(
        level.lightningMatches.length >= 6,
        `Level ${level.id} must have >= 6 match pairs (found ${level.lightningMatches.length})`
      );
    } else {
      assert.ok(
        level.cards.length >= 6,
        `Level ${level.id} must have >= 6 cards (found ${level.cards.length})`
      );
      assert.ok(
        level.sentenceBuilders.length >= 4,
        `Level ${level.id} must have >= 4 sentence builders (found ${level.sentenceBuilders.length})`
      );
      assert.ok(
        level.lightningMatches.length >= 5,
        `Level ${level.id} must have >= 5 match pairs (found ${level.lightningMatches.length})`
      );
    }
  });
});

test('germanCurriculum: noun cards with articles strictly use der/die/das', () => {
  GERMAN_PROGRESSION_LEVELS.forEach((level) => {
    level.cards.forEach((card) => {
      if (card.gender) {
        assert.ok(
          ['der', 'die', 'das'].includes(card.gender),
          `Card ${card.id} gender must be der, die, or das (found ${card.gender})`
        );
      }
    });
  });
});

test('germanLexicon: contains >= 60 high-frequency entries with valid articles and phonetics', () => {
  assert.ok(GERMAN_BRIDGE_LEXICON.length >= 60, `Lexicon must have >= 60 entries (found ${GERMAN_BRIDGE_LEXICON.length})`);

  GERMAN_BRIDGE_LEXICON.forEach((entry) => {
    assert.ok(entry.de.length > 0, `Lexicon entry ${entry.id} 'de' field must be non-empty`);
    assert.ok(entry.ar.length > 0, `Lexicon entry ${entry.id} 'ar' field must be non-empty`);
    assert.ok(entry.phoneticAr.length > 0, `Lexicon entry ${entry.id} 'phoneticAr' field must be non-empty`);

    if (entry.article) {
      assert.ok(
        ['der', 'die', 'das'].includes(entry.article),
        `Lexicon entry ${entry.id} article must be der, die, or das (found ${entry.article})`
      );
    }
  });
});
