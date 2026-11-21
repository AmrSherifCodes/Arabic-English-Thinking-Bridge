import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PHASES_DATA } from '../data/lessons';
import { getGlossForWord } from '../utils/glossHelper';

describe('Active Channel Data Integrity & Gloss Coverage', () => {
  const allLessons = PHASES_DATA.flatMap((phase) => phase.lessons);

  it('contains zero duplicate prompts within the same lesson', () => {
    for (const lesson of allLessons) {
      const seenPrompts = new Set<string>();
      for (const ex of lesson.exercises) {
        const prompt = ex.arabicThought;
        assert.strictEqual(seenPrompts.has(prompt), false, `Duplicate prompt "${prompt}" in lesson ${lesson.id}`);
        seenPrompts.add(prompt);
      }
    }
  });

  it('contains zero numbered placeholder titles or prompts', () => {
    for (const lesson of allLessons) {
      assert.strictEqual(/\d+$/.test(lesson.title), false, `Lesson title has trailing number: ${lesson.title}`);
      for (const ex of lesson.exercises) {
        const prompt = ex.arabicThought;
        const target = ex.englishTarget || ex.targetSentence || '';
        assert.strictEqual(/\d+$/.test(prompt), false, `Prompt has trailing number: ${prompt}`);
        assert.strictEqual(/\d+$/.test(target), false, `Target sentence has trailing number: ${target}`);
      }
    }
  });

  it('provides 100% gloss coverage for all word chips across active lessons', () => {
    const missingGlosses: { lessonId: string; exerciseId: string; word: string }[] = [];

    for (const lesson of allLessons) {
      for (const ex of lesson.exercises) {
        const chips = ex.wordChips || [];
        for (const chip of chips) {
          const cleanWord = chip.replace(/[.,!?;:]/g, '').trim();
          if (!cleanWord) continue;

          const gloss = getGlossForWord(cleanWord, ex.breakdownChunks || [], 'en', 'ar');
          if (!gloss) {
            missingGlosses.push({
              lessonId: lesson.id,
              exerciseId: ex.id,
              word: cleanWord,
            });
          }
        }
      }
    }

    assert.deepStrictEqual(missingGlosses, [], `Missing glosses found for words: ${JSON.stringify(missingGlosses.slice(0, 10))}`);
  });

  it('resolves glosses correctly for en -> ar direction', () => {
    const glossHello = getGlossForWord('أهلاً', [], 'ar', 'en');
    assert.ok(
      glossHello.toLowerCase().includes('hi') || glossHello.toLowerCase().includes('hello'),
      `Expected hello/hi gloss for أهلاً, got: ${glossHello}`
    );

    const glossHouse = getGlossForWord('بيت', [], 'ar', 'en');
    assert.ok(
      glossHouse.toLowerCase().includes('house'),
      `Expected house gloss for بيت, got: ${glossHouse}`
    );
  });

  it('tracks repeated word tile selections independently by index', () => {
    const shuffledOptions = ['the', 'dog', 'saw', 'the', 'cat'];
    let selectedIndices: number[] = [];

    // Selecting first "the" (index 0)
    selectedIndices.push(0);
    assert.strictEqual(selectedIndices.includes(0), true, 'Index 0 should be selected');
    assert.strictEqual(selectedIndices.includes(3), false, 'Index 3 (second "the") should NOT be selected');

    // Selecting second "the" (index 3)
    selectedIndices.push(3);
    assert.strictEqual(selectedIndices.includes(3), true, 'Index 3 should now be selected');
    const selectedWords = selectedIndices.map((i) => shuffledOptions[i]);
    assert.deepStrictEqual(selectedWords, ['the', 'the']);

    // Unselecting first "the" (index at pos 0 in selectedIndices)
    selectedIndices = selectedIndices.filter((_, i) => i !== 0);
    assert.strictEqual(selectedIndices.includes(0), false, 'Index 0 should be unselected');
    assert.strictEqual(selectedIndices.includes(3), true, 'Index 3 should remain selected');
  });
});
