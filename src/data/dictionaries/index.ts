import { SourceLanguage, TargetLanguage } from '../../types';
import { MultiLangDictionaryEntry } from './types';
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

export * from './types';
export * from './germanDictionary';
export * from './japaneseDictionary';
export * from './spanishDictionary';
export * from './frenchDictionary';
export * from './chineseDictionary';
export * from './hindiDictionary';
export * from './russianDictionary';
export * from './portugueseDictionary';
export * from './italianDictionary';
export * from './greekDictionary';

export function getTargetDictionary(targetLang: TargetLanguage): MultiLangDictionaryEntry[] {
  switch (targetLang) {
    case 'de': return GERMAN_DICTIONARY;
    case 'ja': return JAPANESE_DICTIONARY;
    case 'es': return SPANISH_DICTIONARY;
    case 'fr': return FRENCH_DICTIONARY;
    case 'zh': return CHINESE_DICTIONARY;
    case 'hi': return HINDI_DICTIONARY;
    case 'ru': return RUSSIAN_DICTIONARY;
    case 'pt': return PORTUGUESE_DICTIONARY;
    case 'it': return ITALIAN_DICTIONARY;
    case 'el': return GREEK_DICTIONARY;
    default: return GERMAN_DICTIONARY;
  }
}

export function searchTargetDictionary(
  query: string,
  targetLang: TargetLanguage,
  sourceLang: SourceLanguage = 'ar'
): MultiLangDictionaryEntry[] {
  if (!query || !query.trim()) return [];
  const clean = query.trim().toLowerCase();
  const dict = getTargetDictionary(targetLang);

  return dict.filter(entry => {
    if (entry.term.toLowerCase().includes(clean)) return true;
    if (entry.normalizedTerm.toLowerCase().includes(clean)) return true;
    if (entry.reading && entry.reading.includes(clean)) return true;
    if (entry.romaji && entry.romaji.toLowerCase().includes(clean)) return true;
    const meaning = entry.sourceMeanings[sourceLang] || '';
    if (meaning.toLowerCase().includes(clean)) return true;
    const enMeaning = entry.sourceMeanings.en || '';
    if (enMeaning.toLowerCase().includes(clean)) return true;

    return false;
  });
}

export function lookupTargetTerm(
  term: string,
  targetLang: TargetLanguage
): MultiLangDictionaryEntry | null {
  if (!term || !term.trim()) return null;
  const clean = term.trim().toLowerCase();
  const dict = getTargetDictionary(targetLang);

  return dict.find(e =>
    e.term.toLowerCase() === clean ||
    e.normalizedTerm.toLowerCase() === clean ||
    (e.romaji && e.romaji.toLowerCase() === clean) ||
    (e.reading && e.reading === clean)
  ) || null;
}
