import { SourceLanguage, TargetLanguage } from '../../types';

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

const loadedDictionaryCache: Record<string, DictWordEntry[]> = {};

export const DICTIONARY_LOADERS: Record<string, () => Promise<DictWordEntry[]>> = {
  de: async () => (await import('./germanDictionary')).GERMAN_DICTIONARY,
  ja: async () => (await import('./japaneseDictionary')).JAPANESE_DICTIONARY,
  es: async () => (await import('./spanishDictionary')).SPANISH_DICTIONARY,
  fr: async () => (await import('./frenchDictionary')).FRENCH_DICTIONARY,
  zh: async () => (await import('./chineseDictionary')).CHINESE_DICTIONARY,
  hi: async () => (await import('./hindiDictionary')).HINDI_DICTIONARY,
  ru: async () => (await import('./russianDictionary')).RUSSIAN_DICTIONARY,
  pt: async () => (await import('./portugueseDictionary')).PORTUGUESE_DICTIONARY,
  it: async () => (await import('./italianDictionary')).ITALIAN_DICTIONARY,
  el: async () => (await import('./greekDictionary')).GREEK_DICTIONARY,
  tr: async () => (await import('./trDictionary')).trDictionary,
  en: async () => (await import('./arabicDictionary')).ARABIC_DICTIONARY,
  ar: async () => (await import('./arabicDictionary')).ARABIC_DICTIONARY,
  arz: async () => (await import('./egyptianArabicDictionary')).EGYPTIANARABIC_DICTIONARY,
  apc: async () => (await import('./levantineArabicDictionary')).LEVANTINEARABIC_DICTIONARY,
  afb: async () => (await import('./gulfArabicDictionary')).GULFARABIC_DICTIONARY,
  ary: async () => (await import('./moroccanArabicDictionary')).MOROCCANARABIC_DICTIONARY,
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
  void getTargetDictionaryAsync(targetLang);
  return [];
}

export async function preloadDictionaries(langs: string[]): Promise<void> {
  await Promise.all(langs.map((l) => getTargetDictionaryAsync(l)));
}

function extractEntryWord(entry: any): string {
  return entry.word || entry.term || entry.germanWord || entry.kanji || entry.romaji || '';
}

function extractEntryTranslation(entry: any, sourceLang: string): string {
  return (
    entry.translation ||
    entry.englishTranslation ||
    entry.arabicTranslation ||
    (entry.sourceMeanings?.[sourceLang] ?? '')
  );
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
    const word = extractEntryWord(entry);
    const translation = extractEntryTranslation(entry, sourceLang);
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
    const word = extractEntryWord(entry);
    const translation = extractEntryTranslation(entry, sourceLang);
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

  return (
    dict.find((e) => {
      const w = extractEntryWord(e).toLowerCase();
      const t = (e.translation || '').toLowerCase();
      if (w === clean || t === clean) return true;
      const parts = t.split(/[;,]/).map((p) => p.replace(/^to\s+/, '').trim());
      return parts.includes(clean) || parts.some((p) => p.includes(clean)) || w.startsWith(clean);
    }) || null
  );
}
