import type { LexiconEntry, Situation } from '../services/geminiLexicon';
import { STUDENT_DECK } from './studentDeck';
import { CALL_CENTER_DECK } from './callCenterDeck';
import { PUBLIC_MATTER_DECK } from './publicMatterDeck';

const VALID_SITUATIONS: readonly Situation[] = ['student', 'call-center', 'public-matter'];
const VALID_PARTS_OF_SPEECH: readonly LexiconEntry['partOfSpeech'][] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'interjection',
  'phrase'
];

const EGYPTIAN_STARTER_ENTRIES: LexiconEntry[] = [
  {
    arabicWord: 'إزيك',
    englishTranslation: 'How are you?',
    partOfSpeech: 'phrase',
    situations: ['student', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'إزيك يا صاحبي، عامل إيه النهارده؟',
    exampleSentenceEnglish: 'How are you my friend, how are you doing today?'
  },
  {
    arabicWord: 'عايز',
    englishTranslation: 'I want / need',
    partOfSpeech: 'verb',
    situations: ['student', 'call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'أنا عايز أفهم الدرس ده كويس.',
    exampleSentenceEnglish: 'I want to understand this lesson well.'
  },
  {
    arabicWord: 'دلوقتي',
    englishTranslation: 'right now',
    partOfSpeech: 'adverb',
    situations: ['student', 'call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'أنا بذاكر دلوقتي ومش فاضي.',
    exampleSentenceEnglish: 'I am studying right now and I am not free.'
  },
  {
    arabicWord: 'النهارده',
    englishTranslation: 'today',
    partOfSpeech: 'adverb',
    situations: ['student', 'call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'الجو برد أوي النهارده في إسكندرية.',
    exampleSentenceEnglish: 'The weather is very cold today in Alexandria.'
  },
  {
    arabicWord: 'ممكن تساعدني؟',
    englishTranslation: 'Can you help me?',
    partOfSpeech: 'phrase',
    situations: ['student', 'call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'لو سمحت، ممكن تساعدني في المشكلة دي؟',
    exampleSentenceEnglish: 'Excuse me, can you help me with this problem?'
  },
  {
    arabicWord: 'تحت أمرك',
    englishTranslation: 'At your service / happy to help',
    partOfSpeech: 'phrase',
    situations: ['call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'تحت أمرك يا فندم، هراجع الحساب فوراً.',
    exampleSentenceEnglish: 'At your service sir/madam, I will check the account right away.'
  },
  {
    arabicWord: 'ثانية واحدة',
    englishTranslation: 'One moment please',
    partOfSpeech: 'phrase',
    situations: ['call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'ثانية واحدة معايا على الخط يا فندم.',
    exampleSentenceEnglish: 'One moment with me on the line, please.'
  },
  {
    arabicWord: 'بكام ده؟',
    englishTranslation: 'How much is this?',
    partOfSpeech: 'phrase',
    situations: ['public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'لو سمحت، التذكرة دي بكام؟',
    exampleSentenceEnglish: 'Excuse me, how much is this ticket?'
  },
  {
    arabicWord: 'فين المحطة؟',
    englishTranslation: 'Where is the station?',
    partOfSpeech: 'phrase',
    situations: ['public-matter'],
    dialect: 'egyptian',
    level: 'beginner',
    exampleSentenceArabic: 'لو سمحت، فين أقرب محطة مترو؟',
    exampleSentenceEnglish: 'Excuse me, where is the nearest metro station?'
  },
  {
    arabicWord: 'فاهم قصدك',
    englishTranslation: 'I understand what you mean',
    partOfSpeech: 'phrase',
    situations: ['student', 'call-center', 'public-matter'],
    dialect: 'egyptian',
    level: 'intermediate',
    exampleSentenceArabic: 'أيوه، أنا فاهم قصدك كويس جداً.',
    exampleSentenceEnglish: 'Yes, I understand what you mean very well.'
  }
];

export function isValidEntry(entry: unknown): entry is LexiconEntry {
  if (!entry || typeof entry !== 'object') return false;
  const candidate = entry as Record<string, unknown>;
  return (
    typeof candidate.arabicWord === 'string' &&
    candidate.arabicWord.trim().length > 0 &&
    typeof candidate.englishTranslation === 'string' &&
    candidate.englishTranslation.trim().length > 0 &&
    typeof candidate.exampleSentenceArabic === 'string' &&
    candidate.exampleSentenceArabic.trim().length > 0 &&
    typeof candidate.exampleSentenceEnglish === 'string' &&
    candidate.exampleSentenceEnglish.trim().length > 0 &&
    typeof candidate.partOfSpeech === 'string' &&
    VALID_PARTS_OF_SPEECH.includes(candidate.partOfSpeech as LexiconEntry['partOfSpeech']) &&
    Array.isArray(candidate.situations) &&
    candidate.situations.length > 0 &&
    candidate.situations.every(
      (situation: unknown) =>
        typeof situation === 'string' && VALID_SITUATIONS.includes(situation as Situation)
    ) &&
    (candidate.dialect === 'msa' || candidate.dialect === 'egyptian') &&
    (candidate.level === undefined ||
      (typeof candidate.level === 'string' &&
        ['beginner', 'intermediate', 'advanced'].includes(candidate.level)))
  );
}

export const STATIC_DICTIONARY: LexiconEntry[] = [
  ...EGYPTIAN_STARTER_ENTRIES,
  ...STUDENT_DECK,
  ...CALL_CENTER_DECK,
  ...PUBLIC_MATTER_DECK
].filter(isValidEntry);

export function getStaticDictionaryEntries(situation: Situation, dialect?: LexiconEntry['dialect']): LexiconEntry[] {
  return STATIC_DICTIONARY.filter(
    entry =>
      entry.situations.includes(situation) &&
      (dialect === undefined || entry.dialect === dialect)
  );
}
