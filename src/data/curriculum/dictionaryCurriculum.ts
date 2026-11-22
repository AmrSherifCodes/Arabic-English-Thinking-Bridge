import { Phase, Lesson, Exercise, SourceLanguage, TargetLanguage, ChunkRole } from '../../types';
import { DictWordEntry, normalizeDictEntry } from '../dictionaries';

function extractWord(entry: any): string {
  const raw = entry.word || entry.term || entry.germanWord || entry.tr || entry.kanji || entry.romaji || '';
  return raw.replace(/\d+$/, '').trim();
}

function extractTranslation(entry: any): string {
  return entry.translation || entry.arabicWord || entry.ar || entry.englishTranslation || entry.en || '';
}

function mapPosToRole(pos?: string): ChunkRole {
  const p = (pos || '').toLowerCase();
  if (p.includes('verb')) return 'verb';
  if (p.includes('adj')) return 'modifier';
  if (p.includes('adv')) return 'modifier';
  if (p.includes('prep')) return 'connector';
  if (p.includes('conj')) return 'connector';
  if (p.includes('pron')) return 'subject';
  return 'object';
}

export function buildDictionaryPhases(
  target: TargetLanguage,
  rawEntries: DictWordEntry[],
  source: SourceLanguage = 'ar'
): Phase[] {
  const isArabicSource = source.startsWith('ar') || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary';

  // Normalize all entries to ensure 100% rich schema and filter out raw Wiktionary metadata
  const wiktionaryMetaRegex =
    /\b(verbal noun of|plural of|inflection of|diminutive of|alternative form of|alternative spelling of|apocopic form of|past participle of|present participle of|first-person singular|second-person singular|third-person singular|feminine singular of|masculine singular of)\b/i;

  const allNormalized = (rawEntries && rawEntries.length > 0 ? rawEntries : getStaticDictionaryEntries(target))
    .map((e, idx) => normalizeDictEntry(e, target, idx))
    .filter((e) => {
      const w = extractWord(e);
      const t = extractTranslation(e);
      return Boolean(w && t && !wiktionaryMetaRegex.test(t) && !wiktionaryMetaRegex.test(e.cognitiveHint || ''));
    });

  const arabicPreferred = isArabicSource
    ? allNormalized.filter((e) => /[\u0600-\u06FF]/.test(extractTranslation(e)))
    : [];
  const entries = arabicPreferred.length >= 10 ? arabicPreferred : allNormalized;

  const pool = entries.length > 0 ? entries : [
    normalizeDictEntry({ word: 'Hello', translation: 'أهلاً', phonetic: 'Hello', partOfSpeech: 'phrase', cefrLevel: 'A0' }, target, 0),
    normalizeDictEntry({ word: 'Yes', translation: 'نعم', phonetic: 'Yes', partOfSpeech: 'phrase', cefrLevel: 'A0' }, target, 1),
    normalizeDictEntry({ word: 'No', translation: 'لا', phonetic: 'No', partOfSpeech: 'phrase', cefrLevel: 'A0' }, target, 2),
    normalizeDictEntry({ word: 'Thank you', translation: 'شكراً', phonetic: 'Thank you', partOfSpeech: 'phrase', cefrLevel: 'A0' }, target, 3),
  ];

  // Tier splitting for progressive difficulty
  const tierA = pool.filter(e => ['A0', 'A1'].includes(e.cefrLevel || 'A1'));
  const tierB = pool.filter(e => ['A2', 'B1'].includes(e.cefrLevel || 'A2'));
  const tierC = pool.filter(e => ['B2', 'C1'].includes(e.cefrLevel || 'B2'));

  const poolPhases = [
    tierA.length >= 4 ? tierA : pool,
    tierB.length >= 4 ? tierB : pool,
    tierC.length >= 4 ? tierC : pool,
  ];

  const lessonsPerPhase = 5;
  const exercisesPerLesson = 5;
  const phases: Phase[] = [];

  const phaseMeta: { id: 1 | 2 | 3; title: string; titleAr: string; level: string; tagline: string; taglineAr: string }[] = [
    {
      id: 1,
      title: 'Phase 1: Basic Concepts & Identity',
      titleAr: 'المرحلة ١: المفردات والأساسيات الأولى',
      level: 'A0/A1',
      tagline: 'First Words & Core Expressions',
      taglineAr: 'أول الكلمات والعبارات الأساسية',
    },
    {
      id: 2,
      title: 'Phase 2: Everyday Actions & Objects',
      titleAr: 'المرحلة ٢: الأفعال والأشياء اليومية',
      level: 'A1/A2',
      tagline: 'Daily Routine & Practice',
      taglineAr: 'التطبيقات والروتين اليومي',
    },
    {
      id: 3,
      title: 'Phase 3: Extended Expressions & Fluency',
      titleAr: 'المرحلة ٣: التعبير والجمل الممتدة',
      level: 'A2/B1',
      tagline: 'Fluid Thinking & Context',
      taglineAr: 'التفكير السلس وبناء المعنى',
    },
  ];

  for (let pIdx = 0; pIdx < phaseMeta.length; pIdx++) {
    const pMeta = phaseMeta[pIdx];
    const phasePool = poolPhases[pIdx];
    const lessons: Lesson[] = [];

    for (let lIdx = 0; lIdx < lessonsPerPhase; lIdx++) {
      const lessonNum = pIdx * lessonsPerPhase + lIdx + 1;
      const exercises: Exercise[] = [];

      for (let eIdx = 0; eIdx < exercisesPerLesson; eIdx++) {
        const poolIndex = (lIdx * exercisesPerLesson + eIdx) % phasePool.length;
        const entry = phasePool[poolIndex];

        const word = extractWord(entry);
        const rawTrans = extractTranslation(entry);
        const trans = rawTrans.split(/[;,]/)[0].trim();
        const phonetic = entry.phonetic || entry.romaji || entry.reading || '';
        const pos = entry.partOfSpeech || 'noun';
        const cefr = entry.cefrLevel || 'A1';
        const cognitiveHint = entry.cognitiveHint || entry.usageHint || `استحضر المعنى: ${word} = ${trans}`;
        const exampleTarget = entry.exampleTarget || word;
        const exampleSource = entry.exampleSource || trans;

        const isSentenceEx = (eIdx % 2 === 1) && entry.exampleTarget && entry.exampleTarget !== word;
        const targetSentence = isSentenceEx ? exampleTarget : word;
        const promptText = isSentenceEx ? exampleSource : trans;

        const primaryChips = targetSentence.split(/\s+/).filter(Boolean);

        // Distractor chips drawn from dictionary pool
        const distractorEntries = pool
          .filter(e => extractWord(e) !== word)
          .slice(0, 4)
          .map(e => extractWord(e));

        const allChips = [
          ...primaryChips,
          ...Array.from(new Set(distractorEntries)).filter((d) => !primaryChips.includes(d)),
        ];

        const promptAr = isArabicSource ? `عبر عن المعنى: "${promptText}"` : `Express: "${promptText}"`;

        const breakdownChunks = [
          {
            arabicText: trans,
            englishText: word,
            sourceText: trans,
            targetText: word,
            role: mapPosToRole(pos),
            explanation: `${word} (${pos}, ${cefr}) = ${trans}. 💡 ${cognitiveHint}`,
          },
        ];

        if (isSentenceEx && exampleTarget && exampleSource) {
          breakdownChunks.push({
            arabicText: exampleSource,
            englishText: exampleTarget,
            sourceText: exampleSource,
            targetText: exampleTarget,
            role: 'modifier' as ChunkRole,
            explanation: `سياق التعبير: ${exampleTarget} = ${exampleSource}`,
          });
        }

        exercises.push({
          id: `${target}-ex-${lessonNum}-${eIdx + 1}`,
          arabicThought: promptAr,
          englishTarget: targetSentence,
          sourceThought: isArabicSource ? promptText : word,
          targetSentence: targetSentence,
          romajiTarget: phonetic,
          furiganaTarget: phonetic,
          arabicContext: isSentenceEx ? exampleSource : undefined,
          acceptableAlternatives: Array.from(
            new Set([targetSentence, targetSentence.toLowerCase(), targetSentence.trim()])
          ),
          wordChips: allChips.length > 0 ? allChips : [targetSentence],
          breakdownChunks,
          habitHint: cognitiveHint + (phonetic ? ` [نطق: ${phonetic}]` : ''),
          habitHintAr: cognitiveHint,
        });
      }

      const sampleEntry = phasePool[(lIdx * exercisesPerLesson) % phasePool.length];
      const sampleWord = extractWord(sampleEntry);
      const cleanSampleWord = (sampleWord || '').replace(/\d+$/, '').trim();

      lessons.push({
        id: `${target}-l${lessonNum}`,
        phaseId: pMeta.id,
        phaseTitle: pMeta.title,
        phaseLevel: pMeta.level,
        number: lessonNum,
        title: `Lesson ${lessonNum}: ${cleanSampleWord}`,
        titleAr: `الدرس ${lessonNum}: ${cleanSampleWord}`,
        transferConcept: `Core vocabulary and structures for ${target}`,
        transferConceptAr: `المفردات والتراكيب الأساسية في ${target}`,
        weakSpotTag: 'vocabulary',
        exercises,
      });
    }

    phases.push({
      id: pMeta.id,
      title: pMeta.title,
      titleAr: pMeta.titleAr,
      level: pMeta.level,
      tagline: pMeta.tagline,
      lessons,
    });
  }

  return phases;
}

export function getStaticDictionaryEntries(_target: TargetLanguage): DictWordEntry[] {
  return [];
}
