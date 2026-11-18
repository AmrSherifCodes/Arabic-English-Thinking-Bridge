import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProgressionState } from '../progression/engine';
import { createAnkiCsv } from './ankiExport';

test('Anki export converts saved SRS cards into target-to-source CSV rows', async () => {
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

  const csv = await createAnkiCsv(state);
  assert.ok(csv.includes('\uFEFF#separator:Comma\n#html:true\n#tags column:3\nFront,Back,Tags'));
  assert.ok(csv.includes('"Er sagt ""Kaffee"""'));
  assert.ok(csv.includes('قهوة'));
});

test('Anki export does not invent example cards for an empty SRS collection', async () => {
  await assert.rejects(() => createAnkiCsv(createInitialProgressionState()), /No saved flashcards/);
});
