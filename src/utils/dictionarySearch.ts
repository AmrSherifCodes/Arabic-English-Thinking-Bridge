import { ALL_LESSONS } from '../data/lessons';
import { EXPANDED_DECKS } from '../data/expandedDecks';
import { PREBUILT_DECKS } from '../data/prebuiltDecks';
import { STATIC_DICTIONARY } from '../data/staticDictionary';
import { ARABIC_WORD_LEXICON, stripTashkeel } from './arabicWordLexicon';
import { normalizeSentence } from './transferLogic';

const ALL_EXERCISES = ALL_LESSONS.flatMap(l => l.exercises);
const ALL_DECKS = [...EXPANDED_DECKS, ...PREBUILT_DECKS];

export interface DictionaryBridgeResult {
  ar: string;
  en: string;
  phonetic?: string;
  root?: string;
  exampleAr?: string;
  exampleEn?: string;
  note?: string;
}

/**
 * Fast, deterministic multi-layered offline dictionary search.
 * Searches across:
 * 1. Core structural lesson exercises
 * 2. Prebuilt & expanded flashcard decks
 * 3. Static Egyptian & MSA situational dictionary
 * 4. Comprehensive Arabic Word Lexicon (1000+ entries)
 */
export function searchOfflineDictionary(query: string, from: 'ar' | 'en'): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (from === 'ar') {
    const cleanAr = stripTashkeel(trimmed);

    // 1. Direct match on lesson exercises
    const exMatch = ALL_EXERCISES.find(ex => stripTashkeel(ex.arabicThought) === cleanAr);
    if (exMatch) return exMatch.englishTarget;

    // 2. Direct match on flashcard decks
    for (const deck of ALL_DECKS) {
      const cardMatch = deck.cards.find(c => stripTashkeel(c.ar) === cleanAr);
      if (cardMatch) return cardMatch.en;
    }

    // 3. Static dictionary match
    const staticMatch = STATIC_DICTIONARY.find(s => stripTashkeel(s.arabicWord) === cleanAr);
    if (staticMatch) return staticMatch.englishTranslation;

    // 4. Arabic word lexicon match
    if (ARABIC_WORD_LEXICON[cleanAr]) {
      return ARABIC_WORD_LEXICON[cleanAr].en.replace(/\(.*?\)/g, '').split('/')[0].trim();
    }

    // 5. Partial/fuzzy substring match on lexicon
    for (const [key, val] of Object.entries(ARABIC_WORD_LEXICON)) {
      if (cleanAr.includes(key) || key.includes(cleanAr)) {
        return val.en.replace(/\(.*?\)/g, '').split('/')[0].trim();
      }
    }
  } else {
    const normEn = normalizeSentence(trimmed);

    // 1. Direct match on lesson exercises
    const exMatch = ALL_EXERCISES.find(
      ex =>
        normalizeSentence(ex.englishTarget) === normEn ||
        ex.acceptableAlternatives?.some(a => normalizeSentence(a) === normEn)
    );
    if (exMatch) return exMatch.arabicThought;

    // 2. Direct match on flashcard decks
    for (const deck of ALL_DECKS) {
      const cardMatch = deck.cards.find(c => normalizeSentence(c.en) === normEn);
      if (cardMatch) return cardMatch.ar;
    }

    // 3. Static dictionary match
    const staticMatch = STATIC_DICTIONARY.find(s => normalizeSentence(s.englishTranslation) === normEn);
    if (staticMatch) return staticMatch.arabicWord;

    // 4. Lexicon reverse search
    for (const [arKey, val] of Object.entries(ARABIC_WORD_LEXICON)) {
      if (normalizeSentence(val.en) === normEn || val.en.toLowerCase().includes(normEn)) {
        return arKey;
      }
    }
  }

  return null;
}

/**
 * Searches for rich pedagogical details for a word or phrase (examples, roots, bridge notes).
 */
export function lookupPedagogicalWordBridge(query: string): DictionaryBridgeResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const isAr = /[\u0600-\u06FF]/.test(trimmed);

  if (isAr) {
    const cleanAr = stripTashkeel(trimmed);

    // Check static dictionary for full bilingual sentence example
    const staticEntry = STATIC_DICTIONARY.find(s =>
      stripTashkeel(s.arabicWord) === cleanAr || cleanAr.includes(stripTashkeel(s.arabicWord))
    );
    if (staticEntry) {
      return {
        ar: staticEntry.arabicWord,
        en: staticEntry.englishTranslation,
        exampleAr: staticEntry.exampleSentenceArabic,
        exampleEn: staticEntry.exampleSentenceEnglish,
        note: `اللهجة: ${staticEntry.dialect === 'egyptian' ? 'عامية مصرية' : 'فصحى'} · تصنيف: ${staticEntry.partOfSpeech}`
      };
    }

    // Check lexicon
    const lex = ARABIC_WORD_LEXICON[cleanAr];
    if (lex) {
      return {
        ar: cleanAr,
        en: lex.en,
        phonetic: lex.phonetic,
        root: lex.root,
        note: `نطق تقريبي: [${lex.phonetic}]${lex.root ? ` · الجذر: [${lex.root}]` : ''}`
      };
    }
  } else {
    const norm = normalizeSentence(trimmed);
    const staticEntry = STATIC_DICTIONARY.find(s =>
      normalizeSentence(s.englishTranslation).includes(norm) ||
      norm.includes(normalizeSentence(s.englishTranslation))
    );
    if (staticEntry) {
      return {
        ar: staticEntry.arabicWord,
        en: staticEntry.englishTranslation,
        exampleAr: staticEntry.exampleSentenceArabic,
        exampleEn: staticEntry.exampleSentenceEnglish,
        note: `Dialect: ${staticEntry.dialect} · Part of Speech: ${staticEntry.partOfSpeech}`
      };
    }

    // Reverse lexicon
    for (const [arKey, val] of Object.entries(ARABIC_WORD_LEXICON)) {
      if (normalizeSentence(val.en).includes(norm)) {
        return {
          ar: arKey,
          en: val.en,
          phonetic: val.phonetic,
          root: val.root,
          note: `Pronunciation: [${val.phonetic}]`
        };
      }
    }
  }

  return null;
}
