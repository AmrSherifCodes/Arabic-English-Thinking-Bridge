import { SourceLanguage, TargetLanguage } from '../../types';
import { GERMAN_DICTIONARY } from './germanDictionary';
import { JAPANESE_DICTIONARY } from './japaneseDictionary';
import { SPANISH_DICTIONARY } from './spanishDictionary';
import { FRENCH_DICTIONARY } from './frenchDictionary';
import { CHINESE_DICTIONARY } from './chineseDictionary';
import { HINDI_DICTIONARY } from './hindiDictionary';
import { RUSSIAN_DICTIONARY } from './russianDictionary';
import { PORTUGUESE_DICTIONARY } from './portugueseDictionary';
import { ITALIAN_DICTIONARY } from './italianDictionary';
import { GREEK_DICTIONARY } from './greekDictionary';
import { ARABIC_DICTIONARY } from './arabicDictionary';
import { EGYPTIANARABIC_DICTIONARY } from './egyptianArabicDictionary';
import { LEVANTINEARABIC_DICTIONARY } from './levantineArabicDictionary';
import { GULFARABIC_DICTIONARY } from './gulfArabicDictionary';
import { MOROCCANARABIC_DICTIONARY } from './moroccanArabicDictionary';

export * from './types';

export interface DictWordEntry {
  word: string;
  translation: string;
  term?: string;
  normalizedTerm?: string;
  sourceMeanings?: Record<string, string>;
  reading?: string;
  romaji?: string;
}

const SYNC_DICTIONARY_MAP: Record<string, DictWordEntry[]> = {
  de: GERMAN_DICTIONARY,
  ja: JAPANESE_DICTIONARY,
  es: SPANISH_DICTIONARY,
  fr: FRENCH_DICTIONARY,
  zh: CHINESE_DICTIONARY,
  hi: HINDI_DICTIONARY,
  ru: RUSSIAN_DICTIONARY,
  pt: PORTUGUESE_DICTIONARY,
  it: ITALIAN_DICTIONARY,
  el: GREEK_DICTIONARY,
  ar: ARABIC_DICTIONARY,
  arz: EGYPTIANARABIC_DICTIONARY,
  apc: LEVANTINEARABIC_DICTIONARY,
  afb: GULFARABIC_DICTIONARY,
  ary: MOROCCANARABIC_DICTIONARY,
};

export function getTargetDictionary(targetLang: string): DictWordEntry[] {
  const match = SYNC_DICTIONARY_MAP[targetLang];
  if (match) return match;
  if (targetLang.startsWith('ar')) return ARABIC_DICTIONARY;
  return GERMAN_DICTIONARY;
}

export function searchTargetDictionary(
  query: string,
  targetLang: TargetLanguage,
  sourceLang: SourceLanguage = 'ar'
): DictWordEntry[] {
  if (!query || !query.trim()) return [];
  const clean = query.trim().toLowerCase();
  const dict = getTargetDictionary(targetLang);

  return dict.filter((entry) => {
    const word = entry.word || entry.term || '';
    const translation = entry.translation || (entry.sourceMeanings?.[sourceLang] ?? '');
    if (word.toLowerCase().includes(clean)) return true;
    if (translation.toLowerCase().includes(clean)) return true;
    return false;
  });
}

export function lookupTargetTerm(
  term: string,
  targetLang: TargetLanguage
): DictWordEntry | null {
  if (!term || !term.trim()) return null;
  const clean = term.trim().toLowerCase();
  const dict = getTargetDictionary(targetLang);

  return dict.find((e) =>
    (e.word || e.term || '').toLowerCase() === clean ||
    (e.translation || '').toLowerCase() === clean
  ) || null;
}
