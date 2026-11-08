import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPANISH_PREBUILT_DECKS } from './spanishDecks';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

test('spanish decks have >=2 decks, each >=10 cards, no Arabic in en', () => {
  assert.ok(SPANISH_PREBUILT_DECKS.length >= 2);
  for (const d of SPANISH_PREBUILT_DECKS) {
    assert.ok(d.cards.length >= 10, `${d.id} has ${d.cards.length} cards`);
    for (const c of d.cards) {
      assert.ok(c.ar && c.ar.trim().length > 0, `empty ar in ${d.id}`);
      assert.ok(c.en && c.en.trim().length > 0, `empty en in ${d.id}`);
      assert.ok(!ARABIC_REGEX.test(c.en), `Arabic in en: ${c.en}`);
    }
  }
});