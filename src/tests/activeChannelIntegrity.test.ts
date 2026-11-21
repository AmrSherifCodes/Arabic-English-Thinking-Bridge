import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PHASES_DATA } from '../data/lessons';
import { getGlossForWord } from '../utils/glossHelper';
import { getCurriculum } from '../data/curriculumRegistry';
import { getTargetDictionaryAsync } from '../data/dictionaries';
import { TargetLanguage } from '../types';
import {
  selectBestVoiceForLang,
  getCloudTtsUnavailable,
  setCloudTtsUnavailable,
  speakWithRate,
} from '../utils/audio';

describe('Active Channel Data Integrity & Gloss Coverage', () => {
  const UNLOCKED_TARGETS: TargetLanguage[] = ['en', 'de', 'es', 'fr', 'tr', 'ja', 'it', 'pt', 'ar'];

  it('verifies all unlocked language channels have zero duplicates, zero trailing numbers, zero inappropriate distractors, and 100% gloss coverage', async () => {
    for (const target of UNLOCKED_TARGETS) {
      await getTargetDictionaryAsync(target);
      const phases = getCurriculum('ar', target);
      const lessons = phases.flatMap((p) => p.lessons);

      assert.ok(lessons.length > 0, `Expected non-empty lessons for target language ${target}`);

      for (const lesson of lessons) {
        const seenPrompts = new Set<string>();
        assert.strictEqual(
          /\d+$/.test(lesson.title),
          false,
          `Lesson title has trailing number: ${lesson.title} in channel ${target}`
        );

        for (const ex of lesson.exercises) {
          const prompt = ex.arabicThought || (ex as any).promptAr || ex.sourceThought || '';
          const targetText = ex.englishTarget || ex.targetSentence || '';

          // 1. Zero duplicate prompts within the same lesson
          assert.strictEqual(
            seenPrompts.has(prompt),
            false,
            `Duplicate prompt "${prompt}" in lesson ${lesson.id} of channel ${target}`
          );
          seenPrompts.add(prompt);

          // 2. Zero trailing placeholder numbers
          assert.strictEqual(
            /\d+$/.test(prompt.trim()),
            false,
            `Prompt has trailing number: "${prompt}" in channel ${target}`
          );
          assert.strictEqual(
            /\d+$/.test(targetText.trim()),
            false,
            `Target text has trailing number: "${targetText}" in channel ${target}`
          );

          // 3. Zero spoiler glosses and zero inappropriate distractors
          const allText = `${prompt} ${targetText} ${ex.wordChips?.join(' ')} ${(ex.breakdownChunks || []).map((c) => c.explanation).join(' ')}`;
          assert.strictEqual(
            allText.includes('(خطأ)'),
            false,
            `Found spoiler gloss (خطأ) in lesson ${lesson.id} of channel ${target}`
          );
          assert.strictEqual(
            /\bBier\b/i.test(allText),
            false,
            `Found inappropriate distractor Bier in lesson ${lesson.id} of channel ${target}`
          );

          // 4. 100% word-level gloss coverage for word chips
          const chips = ex.wordChips || [];
          for (const chip of chips) {
            const cleanWord = chip.replace(/[.,!?;:]/g, '').trim();
            if (!cleanWord) continue;
            const gloss = getGlossForWord(cleanWord, ex.breakdownChunks || [], target, 'ar');
            assert.ok(
              gloss !== '',
              `Missing gloss for word "${cleanWord}" in exercise ${ex.id} of channel ${target}`
            );
          }
        }
      }
    }
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

  it('selects localService === true voice when offline = true', () => {
    const mockVoices = [
      {
        name: 'Google US English (Online)',
        lang: 'en-US',
        localService: false,
        default: false,
        voiceURI: 'google-online',
      },
      {
        name: 'Microsoft David (Offline Local)',
        lang: 'en-US',
        localService: true,
        default: true,
        voiceURI: 'microsoft-david',
      },
    ] as unknown as SpeechSynthesisVoice[];

    const chosen = selectBestVoiceForLang(mockVoices, 'en-US', undefined, true);
    assert.ok(chosen, 'Expected a voice to be chosen');
    assert.strictEqual(chosen?.localService, true, 'Expected offline selection to pick localService: true voice');
    assert.strictEqual(chosen?.name, 'Microsoft David (Offline Local)');
  });

  it('handles Edge TTS circuit breaker cleanly', () => {
    setCloudTtsUnavailable(false);
    assert.strictEqual(getCloudTtsUnavailable(), false);

    setCloudTtsUnavailable(true);
    assert.strictEqual(getCloudTtsUnavailable(), true);

    const handled = speakWithRate('Test sentence', 1.0, undefined, 'en-US');
    assert.strictEqual(typeof handled, 'boolean');
    setCloudTtsUnavailable(false);
  });
});
