import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProgressionState } from '../progression/engine';
import { createAnkiCsv } from './ankiExport';

test('Anki export converts saved SRS cards into target-to-source CSV rows', () => {
  const state = createInitialProgressionState();
  state.srsItems['de-kaffee'] = {
    id: 'de-kaffee',
    term: 'Kaffee',
    sourceText: 'قهوة',
    targetText: 'Er sagt "Kaffee"',
    targetLang: 'de',
    stability: 1,
    difficulty: 5,
    lapses: 0,
    reviews: 0,
    lastReviewedAt: 0,
    dueAt: 0,
  };

  assert.equal(
    createAnkiCsv(state),
    '\uFEFF#separator:Comma\n#html:false\n#tags column:3\nFront,Back,Tags\n"Er sagt ""Kaffee""","قهوة","ThinkingBridge de"'
  );
});

test('Anki export does not invent example cards for an empty SRS collection', () => {
  assert.throws(() => createAnkiCsv(createInitialProgressionState()), /No saved flashcards/);
});
