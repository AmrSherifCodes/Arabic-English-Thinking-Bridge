import { PrebuiltDeck } from '../prebuiltDecks';

export const JAPANESE_PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'japanese-starter-a1',
    name: '🇯🇵 Japanese Thinking Starter · 基礎 (Kisou)',
    description: 'Essential Japanese sentences with Kana readings and Romaji context.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source.',
    cards: [
      { ar: 'أنا أدرس اليابانية', en: '日本語を勉強します' },
      { ar: 'مرحباً', en: 'こんにちは' },
      { ar: 'شكراً جزيلاً', en: 'ありがとうございます' },
      { ar: 'صباح الخير', en: 'おはようございます' },
      { ar: 'تشرفت بمعرفتك', en: 'はじめまして' },
    ],
  },
  {
    id: 'japanese-core-kanji',
    name: '🇯🇵 High-Frequency Core Kanji & Vocabulary',
    description: 'Essential Japanese Kanji words with Kana Furigana readings and English meanings.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source.',
    cards: [
      { ar: 'ماء', en: '水' },
      { ar: 'شخص', en: '人' },
      { ar: 'يوم', en: '日' },
      { ar: 'كتاب', en: '本' },
      { ar: 'مدرسة', en: '学校' },
    ],
  },
];
