import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendPlacedTileId,
  createWordBankTiles,
  selectNextHintTile,
  tokenizeTargetSentence,
} from './sentenceBuilderHelper';

test('sentenceBuilderHelper: repeated clicks build exact German sentence once and never duplicate "ist"', () => {
  const targetSentence = 'Heute ist ein schöner Tag';
  const targetTokens = tokenizeTargetSentence(targetSentence);
  const wordBank = createWordBankTiles('de-ex-1-2-1', [
    'Tag',
    'ist',
    'Heute',
    'kalt',
    'schöner',
    'ein',
    'gut',
    'sehr',
  ]);

  let placedIds: string[] = [];

  // Simulate tapping "+ ضيف الكلمة الجاية" 35 times rapidly
  for (let click = 0; click < 35; click++) {
    const nextTile = selectNextHintTile(targetSentence, placedIds, wordBank);
    if (nextTile) {
      placedIds = appendPlacedTileId(placedIds, nextTile.id, targetTokens.length);
    }
  }

  const placedWords = placedIds.map((id) => wordBank.find((t) => t.id === id)?.word);
  assert.deepEqual(placedWords, ['Heute', 'ist', 'ein', 'schöner', 'Tag']);
  assert.equal(placedIds.length, targetTokens.length);
  assert.equal(new Set(placedIds).size, placedIds.length, 'Every placed tile ID must be unique');
  assert.equal(
    placedWords.filter((w) => w?.toLowerCase() === 'ist').length,
    1,
    '"ist" must appear exactly once and never be duplicated'
  );
});

test('sentenceBuilderHelper: aborts when user already placed a wrong tile and "ist" is already used', () => {
  const targetSentence = 'Das Wetter ist heute sehr warm';
  const targetTokens = tokenizeTargetSentence(targetSentence);
  const wordBank = createWordBankTiles('de-ex-1-2-4', [
    'Das',
    'Wetter',
    'ist',
    'heute',
    'sehr',
    'warm',
    'kalt',
  ]);

  // Suppose the user placed ["Das", "kalt"] and then clicks next-word repeatedly
  let placedIds: string[] = [wordBank[0].id, wordBank[6].id];

  for (let click = 0; click < 30; click++) {
    const nextTile = selectNextHintTile(targetSentence, placedIds, wordBank);
    if (nextTile) {
      placedIds = appendPlacedTileId(placedIds, nextTile.id, targetTokens.length);
    }
  }

  const placedWords = placedIds.map((id) => wordBank.find((t) => t.id === id)?.word);
  assert.equal(
    placedWords.filter((w) => w?.toLowerCase() === 'ist').length,
    1,
    '"ist" must never be inserted more than once even if earlier slots were wrong'
  );
  assert.ok(placedIds.length <= targetTokens.length);
  assert.equal(new Set(placedIds).size, placedIds.length);
});
