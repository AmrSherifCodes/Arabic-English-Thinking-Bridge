import { PrebuiltDeck } from '../prebuiltDecks';

export const JAPANESE_PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'japanese-starter-a1',
    name: '🇯🇵 Japanese Thinking Starter · 基礎 (Kisou)',
    description: 'Essential Japanese sentences with Kana readings and Romaji context. Based on JMdict & Tatoeba public domain corpus.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from JMdict & Tatoeba.',
    cards: [
      { ar: 'أنا أدرس اليابانية', en: '日本語を勉強します (Nihongo o benkyou shimasu)' },
      { ar: 'مرحباً', en: 'こんにちは (Konnichiwa)' },
      { ar: 'شكراً جزيلاً', en: 'ありがとうございます (Arigatou gozaimasu)' },
      { ar: 'صباح الخير', en: 'おはようございます (Ohayou gozaimasu)' },
      { ar: 'أنا بخير', en: '元気です (Genki desu)' },
      { ar: 'أين المخرج؟', en: '出口はどこですか (Deguchi wa doko desu ka)' },
      { ar: 'كم هذا؟', en: 'これはいくらですか (Kore wa ikura desu ka)' },
      { ar: 'عذراً', en: 'すみません (Sumimasen)' },
      { ar: 'نعم', en: 'はい (Hai)' },
      { ar: 'لا', en: 'いいえ (Iie)' },
    ],
  },
  {
    id: 'japanese-core-kanji',
    name: '🇯🇵 High-Frequency Core Kanji & Vocabulary',
    description: 'Essential Japanese Kanji words with Kana Furigana readings and English meanings.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from JMdict.',
    cards: [
      { ar: 'اليابان', en: '日本 (Nihon)' },
      { ar: 'شخص', en: '人 (Hito)' },
      { ar: 'يوم / شمس', en: '日 (Hi)' },
      { ar: 'سنة', en: '年 (Toshi)' },
      { ar: 'كبير', en: '大きい (Ookii)' },
      { ar: 'صغير', en: '小さい (Chiisai)' },
      { ar: 'زمان / وقت', en: '時間 (Jikan)' },
      { ar: 'ماء', en: '水 (Mizu)' },
      { ar: 'أرض / بلد', en: '国 (Kuni)' },
      { ar: 'طعام', en: '食べ物 (Tabemono)' },
    ],
  },
];
