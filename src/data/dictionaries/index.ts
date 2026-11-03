import { SourceLanguage, TargetLanguage } from '../../types';
import { MultiLangDictionaryEntry } from './types';
import { GERMAN_DICTIONARY } from './germanDictionary';
import { JAPANESE_DICTIONARY } from './japaneseDictionary';

export * from './types';
export * from './germanDictionary';
export * from './japaneseDictionary';

export function getTargetDictionary(targetLang: TargetLanguage): MultiLangDictionaryEntry[] {
  if (targetLang === 'de') return GERMAN_DICTIONARY;
  if (targetLang === 'ja') return JAPANESE_DICTIONARY;
  return [];
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
    // 1. Target term match
    if (entry.term.toLowerCase().includes(clean)) return true;
    if (entry.normalizedTerm.toLowerCase().includes(clean)) return true;
    // 2. Reading / Romaji match for Japanese
    if (entry.reading && entry.reading.includes(clean)) return true;
    if (entry.romaji && entry.romaji.toLowerCase().includes(clean)) return true;
    // 3. Source meaning match
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

