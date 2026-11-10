import { SourceLanguage, TargetLanguage } from '../../types';

export interface ContextualExample {
  targetSentence: string;
  sourceSentences: {
    ar: string;
    en: string;
  };
  furigana?: string; // HTML ruby annotation for Japanese
  romaji?: string;   // For Japanese
  sourceAttribution?: string; // e.g. "Tatoeba (CC BY 2.0 FR / CC0)"
}

export interface MultiLangDictionaryEntry {
  id: string;
  term: string; // The word/phrase in the target language (e.g. "der Kaffee", "学生")
  normalizedTerm: string;
  targetLang: TargetLanguage; // 'en' | 'de' | 'ja'
  sourceMeanings: Record<string, string>;
  partOfSpeech: string;
  // German-specific:
  gender?: string;
  plural?: string;
  separablePrefix?: string;
  // Japanese-specific:
  reading?: string;   // Kana (e.g. "がくせい")
  romaji?: string;    // Romaji (e.g. "gakusei")
  furigana?: string;  // HTML ruby markup (e.g. "<ruby>学生<rt>がくせい</rt></ruby>")
  kanji?: string;
  // Contextual Immersion Sentences (Tatoeba / Pedagogical):
  examples: ContextualExample[];
  frequencyRank?: number;
  category?: string;
  [key: string]: any;
}

export interface GermanDictionaryEntry {
  id: string;
  germanWord?: string;
  englishTranslation?: string;
  arabicTranslation?: string;
  partOfSpeech?: string;
  gender?: string;
  exampleSentenceGerman?: string;
  exampleSentenceEnglish?: string;
  cefrLevel?: string;
  [key: string]: any;
}

export interface JapaneseDictionaryEntry {
  id: string;
  kanji?: string;
  readingFurigana?: string;
  romaji?: string;
  englishTranslation?: string;
  arabicTranslation?: string;
  partOfSpeech?: string;
  exampleSentenceJapanese?: string;
  exampleSentenceEnglish?: string;
  cefrLevel?: string;
  [key: string]: any;
}
