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
    (candidate.dialect === undefined ||
      candidate.dialect === 'msa' ||
      candidate.dialect === 'egyptian') &&
    (candidate.level === undefined ||
      (typeof candidate.level === 'string' &&
        ['beginner', 'intermediate', 'advanced'].includes(candidate.level)))
  );
}

export const STATIC_DICTIONARY: LexiconEntry[] = [
  ...STUDENT_DECK,
  ...CALL_CENTER_DECK,
  ...PUBLIC_MATTER_DECK
].filter(isValidEntry);

export function getStaticDictionaryEntries(situation: Situation): LexiconEntry[] {
  return STATIC_DICTIONARY.filter(entry => entry.situations.includes(situation));
}
