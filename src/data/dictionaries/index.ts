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

const DICTIONARY_LOADERS: Record<string, () => Promise<{ [key: string]: DictWordEntry[] }>> = {
  de: async () => { const m = await import('./germanDictionary'); return { de: m.GERMAN_DICTIONARY }; },
  ja: async () => { const m = await import('./japaneseDictionary'); return { ja: m.JAPANESE_DICTIONARY }; },
  es: async () => { const m = await import('./spanishDictionary'); return { es: m.SPANISH_DICTIONARY }; },
  fr: async () => { const m = await import('./frenchDictionary'); return { fr: m.FRENCH_DICTIONARY }; },
  zh: async () => { const m = await import('./chineseDictionary'); return { zh: m.CHINESE_DICTIONARY }; },
  hi: async () => { const m = await import('./hindiDictionary'); return { hi: m.HINDI_DICTIONARY }; },
  ru: async () => { const m = await import('./russianDictionary'); return { ru: m.RUSSIAN_DICTIONARY }; },
  pt: async () => { const m = await import('./portugueseDictionary'); return { pt: m.PORTUGUESE_DICTIONARY }; },
  it: async () => { const m = await import('./italianDictionary'); return { it: m.ITALIAN_DICTIONARY }; },
  el: async () => { const m = await import('./greekDictionary'); return { el: m.GREEK_DICTIONARY }; },
  ar: async () => { const m = await import('./arabicDictionary'); return { ar: m.ARABIC_DICTIONARY }; },
  arz: async () => { const m = await import('./egyptianArabicDictionary'); return { arz: m.EGYPTIANARABIC_DICTIONARY }; },
  apc: async () => { const m = await import('./levantineArabicDictionary'); return { apc: m.LEVANTINEARABIC_DICTIONARY }; },
  afb: async () => { const m = await import('./gulfArabicDictionary'); return { afb: m.GULFARABIC_DICTIONARY }; },
  ary: async () => { const m = await import('./moroccanArabicDictionary'); return { ary: m.MOROCCANARABIC_DICTIONARY }; },
};

export async function getTargetDictionaryAsync(targetLang: string): Promise<DictWordEntry[]> {
  if (loadedDictionaryCache[targetLang]) {
    return loadedDictionaryCache[targetLang];
  }
  const loader = DICTIONARY_LOADERS[targetLang];
  if (loader) {
    try {
      const res = await loader();
      const dict = Object.values(res)[0] || [];
      loadedDictionaryCache[targetLang] = dict;
      return dict;
    } catch (err) {
      console.warn(`[DictionaryLoader] Could not load dictionary for ${targetLang}`, err);
    }
  }
  return [];
}

export function getTargetDictionary(targetLang: string): DictWordEntry[] {
  return loadedDictionaryCache[targetLang] || [];
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
