import { describe, it, expect } from 'vitest';
import { PHASES_DATA } from '../data/lessons';
import { getGlossForWord } from '../utils/glossHelper';

describe('Active Channel Data Integrity & Gloss Coverage', () => {
  const allLessons = PHASES_DATA.flatMap((phase) => phase.lessons);

  it('contains zero duplicate prompts within the same lesson', () => {
    for (const lesson of allLessons) {
      const seenPrompts = new Set<string>();
      for (const ex of lesson.exercises) {
        const prompt = ex.promptAr || ex.arabicThought;
        expect(seenPrompts.has(prompt), `Duplicate prompt "${prompt}" in lesson ${lesson.id}`).toBe(false);
        seenPrompts.add(prompt);
      }
    }
  });

  it('contains zero numbered placeholder titles or prompts', () => {
    for (const lesson of allLessons) {
      expect(lesson.title).not.toMatch(/\d+$/);
      for (const ex of lesson.exercises) {
        const prompt = ex.promptAr || ex.arabicThought;
        expect(prompt).not.toMatch(/\d+$/);
        expect(ex.targetSentence).not.toMatch(/\d+$/);
      }
    }
  });

  it('provides 100% gloss coverage for all word chips across active lessons', () => {
    const missingGlosses: { lessonId: string; exerciseId: string; word: string }[] = [];

    for (const lesson of allLessons) {
      for (const ex of lesson.exercises) {
        const chips = ex.wordChips || [];
        for (const chip of chips) {
          // Clean chip punctuation
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

    if (missingGlosses.length > 0) {
      console.warn(`Found ${missingGlosses.length} missing glosses across exercises. First 5:`, missingGlosses.slice(0, 5));
    }

    expect(missingGlosses, `Missing glosses found for words: ${JSON.stringify(missingGlosses.slice(0, 10))}`).toEqual([]);
  });
});
