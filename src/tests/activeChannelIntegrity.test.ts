import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getGlossForWord } from '../utils/glossHelper';
import { getCurriculum } from '../data/curriculumRegistry';
import { getTargetDictionaryAsync } from '../data/dictionaries';
import { SourceLanguage, TargetLanguage } from '../types';
import {
  selectBestVoiceForLang,
  getCloudTtsUnavailable,
  setCloudTtsUnavailable,
  speakWithRate,
} from '../utils/audio';

describe('Active Channel Data Integrity & Gloss Coverage', () => {
  interface ActiveChannel {
    source: SourceLanguage;
    target: TargetLanguage;
  }

  const ACTIVE_CHANNELS: ActiveChannel[] = [
    { source: 'ar', target: 'en' },
    { source: 'en', target: 'ar' },
    { source: 'ar', target: 'de' },
    { source: 'ar', target: 'tr' },
  ];

  it('verifies all active language channels pass strict non-self-referential, length-capped, localized gloss rules and clean prompts', async () => {
    for (const channel of ACTIVE_CHANNELS) {
      await getTargetDictionaryAsync(channel.target);
      const phases = getCurriculum(channel.source, channel.target);
      const lessons = phases.flatMap((p) => p.lessons);

      assert.ok(lessons.length > 0, `Expected non-empty lessons for channel ${channel.source}->${channel.target}`);

      for (const lesson of lessons) {
        const seenPrompts = new Set<string>();
        assert.strictEqual(
          /\d+$/.test(lesson.title),
          false,
          `Lesson title has trailing number: ${lesson.title} in channel ${channel.source}->${channel.target}`
        );

        for (const ex of lesson.exercises) {
          const prompt = ex.arabicThought || (ex as any).promptAr || ex.sourceThought || '';
          const targetText = ex.englishTarget || ex.targetSentence || '';
          const promptEn = (ex as any).promptEn || '';

          // 1. Prompt integrity
          if (channel.source === 'en' && channel.target === 'ar') {
            assert.ok(
              promptEn && /[A-Za-z]/.test(promptEn),
              `Expected non-empty English promptEn for en->ar exercise ${ex.id}, got: "${promptEn}"`
            );
            assert.strictEqual(
              /[\u0600-\u06FF]/.test(promptEn),
              false,
              `English promptEn contains Arabic text in exercise ${ex.id}: "${promptEn}"`
            );
          }

          // 2. Zero duplicate prompts within the same lesson
          assert.strictEqual(
            seenPrompts.has(prompt),
            false,
            `Duplicate prompt "${prompt}" in lesson ${lesson.id} of channel ${channel.source}->${channel.target}`
          );
          seenPrompts.add(prompt);

          // 3. Zero trailing placeholder numbers
          assert.strictEqual(
            /\d+$/.test(prompt.trim()),
            false,
            `Prompt has trailing number: "${prompt}" in channel ${channel.source}->${channel.target}`
          );
          assert.strictEqual(
            /\d+$/.test(targetText.trim()),
            false,
            `Target text has trailing number: "${targetText}" in channel ${channel.source}->${channel.target}`
          );

          // 4. Zero spoiler glosses and zero inappropriate distractors
          const allText = `${prompt} ${targetText} ${ex.wordChips?.join(' ')} ${(ex.breakdownChunks || []).map((c) => c.explanation).join(' ')}`;
          assert.strictEqual(
            allText.includes('(خطأ)'),
            false,
            `Found spoiler gloss (خطأ) in lesson ${lesson.id} of channel ${channel.source}->${channel.target}`
          );
          assert.strictEqual(
            /\bBier\b/i.test(allText),
            false,
            `Found inappropriate distractor Bier in lesson ${lesson.id} of channel ${channel.source}->${channel.target}`
          );

          // 5. Strict 100% non-self-referential, sanitized word-level gloss coverage
          const chips = ex.wordChips || [];
          for (const chip of chips) {
            const cleanWord = chip.replace(/[.,!?;:]/g, '').trim();
            if (!cleanWord) continue;
            const gloss = getGlossForWord(cleanWord, ex.breakdownChunks || [], channel.target, channel.source);
            assert.ok(
              gloss !== '',
              `Missing gloss for word "${cleanWord}" in exercise ${ex.id} of channel ${channel.source}->${channel.target}`
            );

            // Block self-referential glosses (Ich -> Ich, Der -> Der, ليس -> ليس)
            assert.notStrictEqual(
              gloss.toLowerCase(),
              cleanWord.toLowerCase(),
              `Self-referential gloss "${gloss}" for word "${cleanWord}" in exercise ${ex.id} of channel ${channel.source}->${channel.target}`
            );

            // Cap length & sanitize check
            assert.ok(
              gloss.length <= 28,
              `Gloss too long (${gloss.length} chars) for word "${cleanWord}": "${gloss}" in exercise ${ex.id}`
            );
            assert.strictEqual(
              gloss.includes(';'),
              false,
              `Raw dictionary semicolon found in gloss "${gloss}" for word "${cleanWord}" in exercise ${ex.id}`
            );
            assert.strictEqual(
              /name of the/i.test(gloss),
              false,
              `Raw dictionary definition found in gloss "${gloss}" for word "${cleanWord}" in exercise ${ex.id}`
            );

            // Language scoping check for German
            if (channel.target === 'de') {
              assert.ok(
                /[\u0600-\u06FF]/.test(gloss),
                `German gloss for "${cleanWord}" must contain Arabic characters, got: "${gloss}" in exercise ${ex.id}`
              );
              if (cleanWord.toLowerCase() === 'an') {
                assert.notStrictEqual(
                  gloss,
                  'واحد / مفرد',
                  `German "an" received English "an" gloss "واحد / مفرد" in exercise ${ex.id}`
                );
              }
            }

            // Language scoping check for English -> Arabic
            if (channel.source === 'en' && channel.target === 'ar') {
              assert.ok(
                /[A-Za-z]/.test(gloss),
                `English gloss for Arabic word "${cleanWord}" must contain Latin characters, got: "${gloss}" in exercise ${ex.id}`
              );
            }
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
