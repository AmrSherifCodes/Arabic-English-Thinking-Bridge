import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendPlacedTileId,
  computeSentenceDiff,
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

test('computeSentenceDiff: exact match ignoring punctuation and case marks all tokens match', () => {
  const diff = computeSentenceDiff('hello how are you', 'Hello, how are you?');
  assert.deepEqual(diff, [
    { word: 'Hello', status: 'match' },
    { word: 'how', status: 'match' },
    { word: 'are', status: 'match' },
    { word: 'you', status: 'match' },
  ]);
});

test('computeSentenceDiff: detects omitted copula without shifting later matches', () => {
  const diff = computeSentenceDiff('I a student', 'I am a student');
  assert.deepEqual(diff, [
    { word: 'I', status: 'match' },
    { word: 'am', status: 'missing' },
    { word: 'a', status: 'match' },
    { word: 'student', status: 'match' },
  ]);
});

test('computeSentenceDiff: flags wrong substituted word with userWord', () => {
  const diff = computeSentenceDiff('Hello how is you', 'Hello, how are you?');
  assert.deepEqual(diff, [
    { word: 'Hello', status: 'match' },
    { word: 'how', status: 'match' },
    { word: 'are', status: 'wrong', userWord: 'is' },
    { word: 'you', status: 'match' },
  ]);
});

test('computeSentenceDiff: aligns CJK characters cleanly', () => {
  const diff = computeSentenceDiff('私はです', '私は学生です');
  assert.deepEqual(diff, [
    { word: '私', status: 'match' },
    { word: 'は', status: 'match' },
    { word: '学', status: 'missing' },
    { word: '生', status: 'missing' },
    { word: 'で', status: 'match' },
    { word: 'す', status: 'match' },
  ]);
});

