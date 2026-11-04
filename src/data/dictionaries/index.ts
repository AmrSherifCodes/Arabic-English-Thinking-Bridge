import { SourceLanguage, TargetLanguage } from '../../types';
import { GERMAN_DICTIONARY } from './germanDictionary';
import { JAPANESE_DICTIONARY } from './japaneseDictionary';
import { SPANISH_DICTIONARY } from './spanishDictionary';
import { FRENCH_DICTIONARY } from './frenchDictionary';
import { ARABIC_DICTIONARY } from './arabicDictionary';
import { EGYPTIANARABIC_DICTIONARY } from './egyptianArabicDictionary';
import { GREEK_DICTIONARY } from './greekDictionary';

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
  ar: ARABIC_DICTIONARY,
  arz: EGYPTIANARABIC_DICTIONARY,
  el: GREEK_DICTIONARY,
};

export const DICTIONARY_LOADERS: Record<string, () => Promise<DictWordEntry[]>> = {
  de: async () => GERMAN_DICTIONARY,
  ja: async () => JAPANESE_DICTIONARY,
  es: async () => SPANISH_DICTIONARY,
  fr: async () => FRENCH_DICTIONARY,
  zh: async () => (await import('./chineseDictionary')).CHINESE_DICTIONARY,
  hi: async () => (await import('./hindiDictionary')).HINDI_DICTIONARY,
  ru: async () => (await import('./russianDictionary')).RUSSIAN_DICTIONARY,
  pt: async () => (await import('./portugueseDictionary')).PORTUGUESE_DICTIONARY,
  it: async () => (await import('./italianDictionary')).ITALIAN_DICTIONARY,
  el: async () => GREEK_DICTIONARY,
  ar: async () => ARABIC_DICTIONARY,
  arz: async () => EGYPTIANARABIC_DICTIONARY,
  apc: async () => (await import('./levantineArabicDictionary')).LEVANTINEARABIC_DICTIONARY,
  afb: async () => (await import('./gulfArabicDictionary')).GULFARABIC_DICTIONARY,
  ary: async () => (await import('./moroccanArabicDictionary')).MOROCCANARABIC_DICTIONARY,
};

export async function getTargetDictionaryAsync(targetLang: string): Promise<DictWordEntry[]> {
  if (loadedDictionaryCache[targetLang]) {
    return loadedDictionaryCache[targetLang];
  }
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
  return loadedDictionaryCache[targetLang] || GERMAN_DICTIONARY;
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
