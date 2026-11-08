import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getFrenchPhases } from './frenchCurriculum';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

test('1. getFrenchPhases returns exactly 3 phases with IDs 1,2,3', () => {
  const phases = getFrenchPhases('ar');
  assert.equal(phases.length, 3);
  assert.deepEqual(phases.map(p => p.id), [1, 2, 3]);
});

test('2. Phase levels are exactly A1-A2, A2-B1, B1-B2', () => {
  const phases = getFrenchPhases('ar');
  assert.deepEqual(phases.map(p => p.level), ['A1 – A2', 'A2 – B1', 'B1 – B2']);
});

test('3. Total lessons >= 15, unique IDs matching pattern /^fr-p\\d-l\\d+$/', () => {
  const phases = getFrenchPhases('ar');
  const lessons = phases.flatMap(p => p.lessons);
  assert.ok(lessons.length >= 15, `lessons=${lessons.length}`);
  const ids = lessons.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate lesson ids');
  for (const id of ids) {
    assert.match(id, /^fr-p\d-l\d+$/, `bad id: ${id}`);
  }
});

test('4. Every exercise has required non-empty fields', () => {
  const phases = getFrenchPhases('ar');
  for (const p of phases) {
    for (const l of p.lessons) {
      assert.ok(l.exercises.length >= 2, `lesson ${l.id} has <2 exercises`);
      for (const ex of l.exercises) {
        assert.ok(ex.targetSentence && ex.targetSentence.trim().length > 0, `empty targetSentence in ${ex.id}`);
        assert.ok(Array.isArray(ex.wordChips) && ex.wordChips.length > 0, `empty wordChips in ${ex.id}`);
        assert.ok(Array.isArray(ex.acceptableAlternatives) && ex.acceptableAlternatives.length > 0, `empty acceptableAlternatives in ${ex.id}`);
        assert.ok(Array.isArray(ex.breakdownChunks) && ex.breakdownChunks.length > 0, `empty breakdownChunks in ${ex.id}`);
      }
    }
  }
  const first = phases[0].lessons[0];
  assert.ok(first.exercises.length >= 3, `fr-p1-l1 has ${first.exercises.length} exercises`);
});

test('5. No Arabic characters in target fields (every exercise)', () => {
  const phases = getFrenchPhases('ar');
  for (const p of phases) {
    for (const l of p.lessons) {
      for (const ex of l.exercises) {
        assert.ok(!ARABIC_REGEX.test(ex.targetSentence || ''), `Arabic in targetSentence ${ex.id}: ${ex.targetSentence}`);
        for (const w of ex.wordChips) {
          assert.ok(!ARABIC_REGEX.test(w), `Arabic in wordChips ${ex.id}: ${w}`);
        }
        for (const a of ex.acceptableAlternatives) {
          assert.ok(!ARABIC_REGEX.test(a), `Arabic in acceptableAlternatives ${ex.id}: ${a}`);
        }
        for (const c of ex.breakdownChunks) {
          assert.ok(!ARABIC_REGEX.test(c.targetText || ''), `Arabic in targetText ${ex.id}`);
          assert.ok(!ARABIC_REGEX.test(c.englishText || ''), `Arabic in englishText ${ex.id}`);
        }
      }
    }
  }
});

test('6. Every targetSentence matches allowed French charset', () => {
  const phases = getFrenchPhases('ar');
  const re = /^[\p{L}\p{N}\s.,;:!?'"’`()\-\u00C0-\u024F]+$/u;
  for (const p of phases) {
    for (const l of p.lessons) {
      for (const ex of l.exercises) {
        assert.match(ex.targetSentence || '', re, `bad charset in ${ex.id}: ${ex.targetSentence}`);
      }
    }
  }
});

test('7. No cross-script contamination in targetSentence, wordChips, or alternatives', () => {
  const phases = getFrenchPhases('ar');
  // Cyrillic, Greek, Devanagari, CJK, Japanese kana, Arabic
  const FORBIDDEN = /[\u0400-\u04FF\u0370-\u03FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\u0600-\u06FF]/;
  for (const p of phases) {
    for (const l of p.lessons) {
      for (const ex of l.exercises) {
        assert.ok(!FORBIDDEN.test(ex.targetSentence || ''),
          `cross-script in targetSentence ${ex.id}: ${ex.targetSentence}`);
        for (const w of ex.wordChips) {
          assert.ok(!FORBIDDEN.test(w),
            `cross-script in wordChips ${ex.id}: ${w}`);
        }
        for (const a of ex.acceptableAlternatives) {
          assert.ok(!FORBIDDEN.test(a),
            `cross-script in acceptableAlternatives ${ex.id}: ${a}`);
        }
        for (const c of ex.breakdownChunks) {
          assert.ok(!FORBIDDEN.test(c.targetText || ''),
            `cross-script in targetText ${ex.id}: ${c.targetText}`);
        }
      }
    }
  }
});
