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
});
