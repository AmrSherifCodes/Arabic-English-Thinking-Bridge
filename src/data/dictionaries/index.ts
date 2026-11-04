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

const loadedDictionaryCache: Record<string, DictWordEntry[]> = {
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

export const DICTIONARY_LOADERS: Record<string, () => Promise<DictWordEntry[]>> = {
  de: async () => GERMAN_DICTIONARY,
  ja: async () => JAPANESE_DICTIONARY,
  es: async () => SPANISH_DICTIONARY,
  fr: async () => FRENCH_DICTIONARY,
  zh: async () => CHINESE_DICTIONARY,
  hi: async () => HINDI_DICTIONARY,
  ru: async () => RUSSIAN_DICTIONARY,
  pt: async () => PORTUGUESE_DICTIONARY,
  it: async () => ITALIAN_DICTIONARY,
  el: async () => GREEK_DICTIONARY,
  ar: async () => ARABIC_DICTIONARY,
  arz: async () => EGYPTIANARABIC_DICTIONARY,
  apc: async () => LEVANTINEARABIC_DICTIONARY,
  afb: async () => GULFARABIC_DICTIONARY,
  ary: async () => MOROCCANARABIC_DICTIONARY,
};

export async function getTargetDictionaryAsync(targetLang: string): Promise<DictWordEntry[]> {
  const match = loadedDictionaryCache[targetLang];
  if (match) return match;
  const loader = DICTIONARY_LOADERS[targetLang];
  if (loader) {
    try {
      const dict = await loader();
      loadedDictionaryCache[targetLang] = dict;
      return dict;
    } catch (err) {
      console.warn(`[DictionaryLoader] Failed to load dictionary for ${targetLang}`, err);
    }
  }
  return [];
}

export function getTargetDictionary(targetLang: string): DictWordEntry[] {
  const match = loadedDictionaryCache[targetLang];
  if (match) return match;
  if (targetLang?.startsWith('ar')) return ARABIC_DICTIONARY;
  if (targetLang === 'en') return [];
  void getTargetDictionaryAsync(targetLang);
  return [];
}

export async function preloadDictionaries(langs: string[]): Promise<void> {
  await Promise.all(langs.map((l) => getTargetDictionaryAsync(l)));
}

export async function searchTargetDictionaryAsync(
  query: string,
  targetLang: TargetLanguage,
  sourceLang: SourceLanguage = 'ar'
): Promise<DictWordEntry[]> {
  const dict = await getTargetDictionaryAsync(targetLang);
  if (!query || !query.trim()) return [];
  const clean = query.trim().toLowerCase();

  return dict.filter((entry) => {
    const word = entry.word || entry.term || '';
    const translation = entry.translation || (entry.sourceMeanings?.[sourceLang] ?? '');
    if (word.toLowerCase().includes(clean)) return true;
    if (translation.toLowerCase().includes(clean)) return true;
    return false;
  });
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
