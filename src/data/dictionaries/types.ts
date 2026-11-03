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
  sourceMeanings: {
    ar: string; // Meaning in Arabic
    en: string; // Meaning in English
  };
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'particle' | 'pronoun' | 'conjunction' | 'preposition';
  // German-specific:
  gender?: 'der' | 'die' | 'das';
  plural?: string;
  separablePrefix?: string;
  // Japanese-specific:
  reading?: string;   // Kana (e.g. "がくせい")
  romaji?: string;    // Romaji (e.g. "gakusei")
  furigana?: string;  // HTML ruby markup (e.g. "<ruby>学生<rt>がくせい</rt></ruby>")
  // Contextual Immersion Sentences (Tatoeba / Pedagogical):
  examples: ContextualExample[];
  frequencyRank?: number;
  category?: 'core' | 'daily' | 'work' | 'travel' | 'academic';
}
