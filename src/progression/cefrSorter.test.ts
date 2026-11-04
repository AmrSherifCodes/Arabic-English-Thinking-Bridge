import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assignCEFRLevels, assignCEFRLevelByRank, calculateLevenshteinSimilarity } from './cefrSorter';

describe('cefrSorter', () => {
  it('assigns CEFR levels by frequency rank correctly', () => {
    assert.equal(assignCEFRLevelByRank(100), 'A0');
    assert.equal(assignCEFRLevelByRank(800), 'A1');
    assert.equal(assignCEFRLevelByRank(2000), 'A2');
    assert.equal(assignCEFRLevelByRank(4000), 'B1');
    assert.equal(assignCEFRLevelByRank(8000), 'B2');
    assert.equal(assignCEFRLevelByRank(12000), 'C1');
    assert.equal(assignCEFRLevelByRank(20000), 'C2');
  });

  it('calculates Levenshtein similarity correctly for cognates', () => {
    const sim = calculateLevenshteinSimilarity('hotel', 'Hotel');
    assert.equal(sim, 1.0);
    const sim2 = calculateLevenshteinSimilarity('information', 'información');
    assert.ok(sim2 >= 0.72);
  });

  it('promotes cognates and survival words in assignCEFRLevels', () => {
    const entries = [
      { word: 'you', translation: 'you', frequencyRank: 3000 },
      { word: 'informacion', translation: 'information', frequencyRank: 5000 },
    ];
    const assigned = assignCEFRLevels(entries);
    assert.equal(assigned[0].cefr, 'A1'); // Survival word override
    assert.equal(assigned[1].cefr, 'A2'); // Cognate promotion from B1 -> A2
  });
});
