import { generateProceduralStageLessons } from '../src/progression/courseData.ts';

/**
 * Script: test-pairs.ts (Gate 2 Verification)
 * Tests procedural lesson generation for 10 representative language pairs with 0 crashes.
 */

const PAIRS = [
  { src: 'en', tgt: 'de' },
  { src: 'ar', tgt: 'en' },
  { src: 'arz', tgt: 'en' },
  { src: 'es', tgt: 'ja' },
  { src: 'ar', tgt: 'de' },
  { src: 'hi', tgt: 'el' },
  { src: 'ja', tgt: 'zh' },
  { src: 'fr', tgt: 'it' },
  { src: 'ru', tgt: 'ar' },
  { src: 'ary', tgt: 'es' },
];

console.log('[test-pairs] Testing 10 representative language pairs...\n');

let passCount = 0;

for (const p of PAIRS) {
  try {
    const lessons = generateProceduralStageLessons(p.tgt as any, 'A0', [], 'general', 100, p.src as any);
    console.log(`✓ Pair ${p.src} -> ${p.tgt}: Generated ${lessons.length} lessons. Sample: "${lessons[0]?.targetSentence}"`);
    passCount++;
  } catch (err: any) {
    console.error(`✖ Pair ${p.src} -> ${p.tgt} failed:`, err.message);
  }
}

console.log(`\n[test-pairs] Gate 2 Result: ${passCount}/${PAIRS.length} pairs passed without errors.`);
if (passCount === PAIRS.length) {
  console.log('GATE 2 PASSED!');
} else {
  process.exit(1);
}
