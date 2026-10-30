import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CULTURAL_QUOTES,
  PAN_ARAB_NATIONS,
  PAN_ARAB_UNITY_PHRASES,
  getNextCulturalQuote,
  getNextUnityPhraseIndex
} from './culturalIdentity';

test('PAN_ARAB_NATIONS contains exactly 23 Arabic-speaking nations including Yemen, Morocco, Palestine, and Egypt', () => {
  assert.equal(PAN_ARAB_NATIONS.length, 23);
  const namesEn = PAN_ARAB_NATIONS.map(n => n.nameEn);
  assert.ok(namesEn.includes('Yemen'));
  assert.ok(namesEn.includes('Morocco'));
  assert.ok(namesEn.includes('Palestine'));
  assert.ok(namesEn.includes('Egypt'));
});

test('PAN_ARAB_UNITY_PHRASES includes From Yemen to Morocco in Arabic and English', () => {
  assert.ok(PAN_ARAB_UNITY_PHRASES.length >= 4);
  const first = PAN_ARAB_UNITY_PHRASES[0];
  assert.ok(first.ar.includes('من اليمن إلى المغرب'));
  assert.ok(first.en.includes('From Yemen to Morocco'));
});

test('CULTURAL_QUOTES includes all four core olive tree and Pan-Arab resilience quotes', () => {
  assert.equal(CULTURAL_QUOTES.length, 4);
  assert.ok(
    CULTURAL_QUOTES.some(q =>
      q.en.includes('Your mind is like the olive tree—deeply rooted in your heritage')
    )
  );
  assert.ok(
    CULTURAL_QUOTES.some(q =>
      q.en.includes('From the Atlas Mountains to the Arabian Peninsula')
    )
  );
  assert.ok(
    CULTURAL_QUOTES.some(q =>
      q.en.includes("planting your olive branch in new soil")
    )
  );
  assert.ok(
    CULTURAL_QUOTES.some(q =>
      q.en.includes('Behind every great civilization is a steadfast heart')
    )
  );
});

test('getNextCulturalQuote and getNextUnityPhraseIndex wrap around deterministically', () => {
  const first = getNextCulturalQuote(0);
  assert.equal(first.quote.id, 'olive-tree-mind');
  assert.equal(first.nextIndex, 1);

  const wrapped = getNextCulturalQuote(3);
  assert.equal(wrapped.quote.id, 'steadfast-heart');
  assert.equal(wrapped.nextIndex, 0);

  assert.equal(getNextUnityPhraseIndex(0), 1);
  assert.equal(getNextUnityPhraseIndex(PAN_ARAB_UNITY_PHRASES.length - 1), 0);
});
