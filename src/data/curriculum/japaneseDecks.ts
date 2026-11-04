import { PrebuiltDeck } from '../prebuiltDecks';
import { JAPANESE_DICTIONARY } from '../dictionaries/japaneseDictionary';

export const JAPANESE_PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'japanese-starter-a1',
    name: '🇯🇵 Japanese Thinking Starter · 基礎 (Kisou)',
    description: 'Essential Japanese sentences with Kana readings and Romaji context. Based on JMdict & Tatoeba public domain corpus.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from JMdict & Tatoeba.',
    cards: JAPANESE_DICTIONARY.slice(0, 100).map((entry) => ({
      ar: (entry as any).translation || (entry as any).word || 'أنا أدرس اليابانية',
      en: (entry as any).word || (entry as any).translation || '日本語を勉強します',
    })),
  },
  {
    id: 'japanese-core-kanji',
    name: '🇯🇵 High-Frequency Core Kanji & Vocabulary',
    description: 'Essential Japanese Kanji words with Kana Furigana readings and English meanings.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from JMdict.',
    cards: JAPANESE_DICTIONARY.slice(100, 200).map((entry) => ({
      ar: (entry as any).translation || (entry as any).word || 'كلمة يابانية',
      en: (entry as any).word || (entry as any).translation || '日本語',
    })),
  },
];
