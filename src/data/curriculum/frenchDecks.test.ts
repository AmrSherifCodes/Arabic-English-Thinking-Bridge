import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRENCH_PREBUILT_DECKS } from './frenchDecks';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

test('french decks have >=2 decks, each >=10 cards, no Arabic in en', () => {
  assert.ok(FRENCH_PREBUILT_DECKS.length >= 2, 'at least 2 French prebuilt decks');
  for (const deck of FRENCH_PREBUILT_DECKS) {
    assert.ok(deck.cards.length >= 10, `deck ${deck.id} has < 10 cards`);
    for (const card of deck.cards) {
      assert.ok(card.ar.trim().length > 0, 'empty ar');
      assert.ok(card.en.trim().length > 0, 'empty en');
      assert.ok(!ARABIC_REGEX.test(card.en), `Arabic in french card en: ${card.en}`);
    }
  }
});
