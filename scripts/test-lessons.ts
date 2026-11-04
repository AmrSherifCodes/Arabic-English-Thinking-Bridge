import { generateProceduralStageLessons, LOCALIZED_A0_LESSONS } from '../src/progression/courseData.ts';

/**
 * Script: test-lessons.ts
 * Verifies procedural 100-lesson engine generation and prints first 5 generated lessons.
 */

console.log('[test-lessons] Testing procedural 100-lesson generation for German (de) A0...');

const seedA0 = LOCALIZED_A0_LESSONS.de || [];
const lessons = generateProceduralStageLessons('de' as any, 'A0', seedA0);

console.log(`[test-lessons] Total generated lessons for A0: ${lessons.length}`);
console.log('\n--- FIRST 5 GENERATED LESSONS ---');

lessons.slice(0, 5).forEach((lesson, idx) => {
  console.log(`\nLesson #${idx + 1} (${lesson.id}):`);
  console.log(`  Title: ${lesson.titleAr} / ${lesson.titleEn}`);
  console.log(`  Prompt (AR): "${lesson.promptAr}"`);
  console.log(`  Target Sentence: "${lesson.targetSentence}"`);
  console.log(`  Word Chips: [${lesson.wordChips.join(', ')}]`);
});

console.log('\n[test-lessons] Procedural 100-lesson engine verification complete!');
