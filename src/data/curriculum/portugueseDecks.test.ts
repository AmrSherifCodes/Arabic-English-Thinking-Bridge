import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PORTUGUESE_PREBUILT_DECKS } from './portugueseDecks';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

test('portuguese decks have >=2 decks, each >=10 cards, no Arabic in en', () => {
  assert.ok(PORTUGUESE_PREBUILT_DECKS.length >= 2, 'at least 2 Portuguese prebuilt decks');
  for (const deck of PORTUGUESE_PREBUILT_DECKS) {
    assert.ok(deck.cards.length >= 10, `deck ${deck.id} has < 10 cards`);
    for (const card of deck.cards) {
      assert.ok(card.ar.trim().length > 0, 'empty ar');
      assert.ok(card.en.trim().length > 0, 'empty en');
      assert.ok(!ARABIC_REGEX.test(card.en), `Arabic in portuguese card en: ${card.en}`);
    }
  }
});
