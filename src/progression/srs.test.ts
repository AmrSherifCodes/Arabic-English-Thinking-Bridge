import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextSrsState, getDueSrsQueue } from './srs';
import { SrsItemRecord } from './types';

describe('srs', () => {
  it('updates SM-2 stability and interval on good rating', () => {
    const item: SrsItemRecord = {
      id: 'test-1',
      term: 'test',
      sourceText: 'test',
      targetText: 'test',
      targetLang: 'en',
      stability: 1.0,
      difficulty: 5.0,
      lapses: 0,
      reviews: 0,
      lastReviewedAt: 1000,
      dueAt: 1000,
    };

    const next = calculateNextSrsState(item, 3, 2000);
    assert.equal(next.reviews, 1);
    assert.ok(next.stability > 1.0);
    assert.ok(next.dueAt > 2000);
  });

  it('caps due queue and prioritizes lapses', () => {
    const now = Date.now();
    const items: Record<string, SrsItemRecord> = {
      'card-1': { id: 'card-1', term: 'c1', sourceText: 'c1', targetText: 'c1', targetLang: 'en', stability: 1, difficulty: 5, lapses: 0, reviews: 1, dueAt: now - 1000, lastReviewedAt: now - 2000 },
      'card-2': { id: 'card-2', term: 'c2', sourceText: 'c2', targetText: 'c2', targetLang: 'en', stability: 1, difficulty: 5, lapses: 3, reviews: 1, dueAt: now - 1000, lastReviewedAt: now - 2000 },
    };

    const due = getDueSrsQueue(items, 1, 'en', now);
    assert.equal(due.length, 1);
    assert.equal(due[0].id, 'card-2');
  });
});
