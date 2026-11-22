import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Star, Flame, Trophy, PlayCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOCAB, VocabWord } from './vocab';
import { soundFX } from '../utils/soundFX';
import { speakUnified } from '../utils/offlineTts';
import { TARGET_LANGUAGE_META } from '../data/languages';
import type { TargetLanguage } from '../types';

// --- Types ---
type AgeBand = '5-7' | '8-9' | '10-12';
type Direction = 'ar-en' | 'en-ar';
type Step = 'AGE_SELECT' | 'DIR_SELECT' | 'HOME' | 'PLAYING';

interface GameState {
  ageBand: AgeBand | null;
  direction: Direction | null;
  streakDays: number;
  lastPlayDate: string | null;
  dailyChallengeLastCompleted: string | null;
  lastScore: number;
  sessionRounds: number;
  sessionStats: { accuracy: number; time: number }[];
}

interface CardData {
  uniqueId: string;
  wordId: string;
  isSource: boolean;
  content: string; // Emoji, Arabic word, or English word
  subContent?: string; // For 5-7 band (small text)
  lang: string; // For TTS
  ttsText: string;
}

// --- Numbers Dictionary for All Supported Languages ---
interface NumberEntry {
  id: string;
  digit: string;
  emoji: string;
  targetWord: string;
  arabicWord: string;
}

const NUMBERS_BY_LANG: Record<string, NumberEntry[]> = {
  en: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'One', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Two', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Three', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Four', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Five', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Six', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Seven', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Eight', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Nine', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Ten', arabicWord: 'عشرة' },
  ],
  de: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Eins', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Zwei', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Drei', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Vier', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Fünf', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Sechs', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Sieben', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Acht', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Neun', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Zehn', arabicWord: 'عشرة' },
  ],
  es: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Uno', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Dos', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Tres', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Cuatro', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Cinco', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Seis', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Siete', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Ocho', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Nueve', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Diez', arabicWord: 'عشرة' },
  ],
  fr: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Un', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Deux', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Trois', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Quatre', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Cinq', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Six', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Sept', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Huit', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Neuf', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Dix', arabicWord: 'عشرة' },
  ],
  it: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Uno', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Due', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Tre', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Quattro', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Cinque', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Sei', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Sette', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Otto', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Nove', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Dieci', arabicWord: 'عشرة' },
  ],
  pt: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Um', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Dois', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Três', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Quatro', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Cinco', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Seis', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Sete', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Oito', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Nove', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Dez', arabicWord: 'عشرة' },
  ],
  ja: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: '一 (Ichi)', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: '二 (Ni)', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: '三 (San)', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: '四 (Yon)', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: '五 (Go)', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: '六 (Roku)', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: '七 (Nana)', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: '八 (Hachi)', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: '九 (Kyu)', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: '十 (Jyu)', arabicWord: 'عشرة' },
  ],
  tr: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Bir', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'İki', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Üç', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Dört', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Beş', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Altı', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Yedi', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Sekiz', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Dokuz', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'On', arabicWord: 'عشرة' },
  ],
  zh: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: '一 (Yī)', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: '二 (Èr)', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: '三 (Sān)', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: '四 (Sì)', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: '五 (Wǔ)', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: '六 (Liù)', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: '七 (Qī)', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: '八 (Bā)', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: '九 (Jiǔ)', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: '十 (Shí)', arabicWord: 'عشرة' },
  ],
  ru: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Один', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Два', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Три', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Четыре', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Пять', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Шесть', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Семь', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Восемь', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Девять', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Десять', arabicWord: 'عشرة' },
  ],
  hi: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'एक (Ek)', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'दो (Do)', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'तीन (Teen)', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'चार (Chaar)', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'पाँच (Paanch)', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'छः (Chheh)', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'सात (Saat)', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'आठ (Aath)', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'नौ (Nau)', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'दस (Dus)', arabicWord: 'عشرة' },
  ],
  el: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'Ένα', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'Δύο', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'Τρία', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'Τέσσερα', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'Πέντε', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'Έξι', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'Επτά', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'Οκτώ', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'Εννέα', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'Δέκα', arabicWord: 'عشرة' },
  ],
  he: [
    { id: '1', digit: '1', emoji: '1️⃣', targetWord: 'אחד', arabicWord: 'واحد' },
    { id: '2', digit: '2', emoji: '2️⃣', targetWord: 'שתיים', arabicWord: 'اتنين' },
    { id: '3', digit: '3', emoji: '3️⃣', targetWord: 'שלוש', arabicWord: 'تلاتة' },
    { id: '4', digit: '4', emoji: '4️⃣', targetWord: 'ארבע', arabicWord: 'أربعة' },
    { id: '5', digit: '5', emoji: '5️⃣', targetWord: 'חמש', arabicWord: 'خمسة' },
    { id: '6', digit: '6', emoji: '6️⃣', targetWord: 'שש', arabicWord: 'ستة' },
    { id: '7', digit: '7', emoji: '7️⃣', targetWord: 'שבע', arabicWord: 'سبعة' },
    { id: '8', digit: '8', emoji: '8️⃣', targetWord: 'שמונה', arabicWord: 'ثمانية' },
    { id: '9', digit: '9', emoji: '9️⃣', targetWord: 'תשע', arabicWord: 'تسعة' },
    { id: '10', digit: '10', emoji: '🔟', targetWord: 'עשר', arabicWord: 'עشرة' },
  ],
  ar: [
    { id: '1', digit: '١', emoji: '1️⃣', targetWord: 'واحد', arabicWord: 'One' },
    { id: '2', digit: '٢', emoji: '2️⃣', targetWord: 'إثنان', arabicWord: 'Two' },
    { id: '3', digit: '٣', emoji: '3️⃣', targetWord: 'ثلاثة', arabicWord: 'Three' },
    { id: '4', digit: '٤', emoji: '4️⃣', targetWord: 'أربعة', arabicWord: 'Four' },
    { id: '5', digit: '٥', emoji: '5️⃣', targetWord: 'خمسة', arabicWord: 'Five' },
    { id: '6', digit: '٦', emoji: '6️⃣', targetWord: 'ستة', arabicWord: 'Six' },
    { id: '7', digit: '٧', emoji: '7️⃣', targetWord: 'سبعة', arabicWord: 'Seven' },
    { id: '8', digit: '٨', emoji: '8️⃣', targetWord: 'ثمانية', arabicWord: 'Eight' },
    { id: '9', digit: '٩', emoji: '9️⃣', targetWord: 'تسعة', arabicWord: 'Nine' },
    { id: '10', digit: '١٠', emoji: '🔟', targetWord: 'عشرة', arabicWord: 'Ten' },
  ],
};

const LANGUAGE_LOCALES: Record<string, string> = {
  ar: 'ar-EG',
  en: 'en-US',
  de: 'de-DE',
  ja: 'ja-JP',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  el: 'el-GR',
  tr: 'tr-TR',
  he: 'he-IL',
};

const speak = (text: string, langCode: string) => {
  const locale = LANGUAGE_LOCALES[langCode] || (langCode === 'ar' ? 'ar-EG' : 'en-US');
  void speakUnified({ text, lang: locale, rate: 1.0 });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- Main Component ---
export const LanguageGame: React.FC<{ onBack: () => void; targetLang?: string; sourceLang?: string }> = ({ onBack, targetLang = 'en', sourceLang = 'ar' }) => {
  // Storage
  const [state, setState] = useState<GameState>(() => {
    try {
      const stored = localStorage.getItem('wa3i_game_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      ageBand: null,
      direction: null,
      streakDays: 0,
      lastPlayDate: null,
      dailyChallengeLastCompleted: null,
      lastScore: 0,
      sessionRounds: 0,
      sessionStats: []
    };
  });

  const saveState = (newState: Partial<GameState>) => {
    setState(prev => {
      const merged = { ...prev, ...newState };
      try {
        localStorage.setItem('wa3i_game_v1', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  const [step, setStep] = useState<Step>(() => {
    if (!state.ageBand) return 'AGE_SELECT';
    if (!state.direction) return 'DIR_SELECT';
    return 'HOME';
  });

  // Game state
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongShakeId, setWrongShakeId] = useState<string | null>(null);

  const [isDaily, setIsDaily] = useState(false);
  const [roundTimer, setRoundTimer] = useState<number | null>(null);

  // Stats for current round
  const [clicks, setClicks] = useState(0);
  const [matches, setMatches] = useState(0);
  const startTime = useRef<number>(0);

  // Timer effect
  useEffect(() => {
    if (step === 'PLAYING' && roundTimer !== null && roundTimer > 0 && matchedPairs.size * 2 < cards.length) {
      const tid = setTimeout(() => setRoundTimer(r => (r ? r - 1 : 0)), 1000);
      return () => clearTimeout(tid);
    } else if (step === 'PLAYING' && roundTimer === 0 && matchedPairs.size * 2 < cards.length) {
      handleTimeOut();
    }
  }, [step, roundTimer, matchedPairs, cards]);

  const handleTimeOut = () => {
    if (state.ageBand === '8-9') {
      // 8-9: Try again (reset round but keep same cards)
      setMatchedPairs(new Set());
      setSelectedId(null);
      setRoundTimer(45);
      setClicks(0);
      setMatches(0);
      startTime.current = Date.now();
      soundFX.playError();
    } else if (state.ageBand === '10-12') {
      // 10-12: Lose points, end round
      finishRound(true);
    }
  };

  const startRound = (daily: boolean) => {
    setIsDaily(daily);
    let pairCount = 3;
    let timeLimit = null;
    const band = state.ageBand;

    if (daily) {
      pairCount = 7;
      timeLimit = 30; // Daily always has a bit of pressure
    } else {
      if (band === '5-7') { pairCount = 4; timeLimit = null; } // 4 numbers for simple mode
      if (band === '8-9') { pairCount = 5; timeLimit = 45; }
      if (band === '10-12') { pairCount = 7; timeLimit = 25; }
    }

    const newCards: CardData[] = [];
    const dir = state.direction || 'ar-en';
    const isArSource = dir === 'ar-en';

    if (band === '5-7' && !daily) {
      // Simple Mode: Gamified to just numbers in ALL supported languages
      const langNumbers = NUMBERS_BY_LANG[targetLang] || NUMBERS_BY_LANG['en'];
      const selectedNumbers = shuffle(langNumbers).slice(0, pairCount);

      selectedNumbers.forEach((item) => {
        const sourceText = isArSource ? item.arabicWord : item.targetWord;
        const targetText = isArSource ? item.targetWord : item.arabicWord;
        const sourceLangCode = isArSource ? sourceLang : targetLang;
        const targetLangCode = isArSource ? targetLang : sourceLang;

        const sourceCard: CardData = {
          uniqueId: `${item.id}-src`,
          wordId: item.id,
          isSource: true,
          content: item.emoji, // Number emoji/digit
          subContent: sourceText,
          lang: sourceLangCode,
          ttsText: sourceText
        };
        const targetCard: CardData = {
          uniqueId: `${item.id}-tgt`,
          wordId: item.id,
          isSource: false,
          content: targetText,
          subContent: item.emoji,
          lang: targetLangCode,
          ttsText: targetText
        };

        newCards.push(sourceCard, targetCard);
      });
    } else {
      // Pick words for older bands or daily
      const available = VOCAB.filter(v => daily || v.bands.includes(band || '8-9'));
      const selectedVocab = shuffle(available).slice(0, pairCount);

      selectedVocab.forEach((v) => {
        const sourceText = isArSource ? v.ar : v.en;
        const targetText = isArSource ? v.en : v.ar;
        const sourceLangCode = isArSource ? sourceLang : targetLang;
        const targetLangCode = isArSource ? targetLang : sourceLang;

        const sourceCard: CardData = { uniqueId: `${v.id}-src`, wordId: v.id, isSource: true, content: v.emoji, subContent: sourceText, lang: sourceLangCode, ttsText: sourceText };
        const targetCard: CardData = { uniqueId: `${v.id}-tgt`, wordId: v.id, isSource: false, content: targetText, lang: targetLangCode, ttsText: targetText };

        newCards.push(sourceCard, targetCard);
      });
    }

    setCards(shuffle(newCards));
    setMatchedPairs(new Set());
    setSelectedId(null);
    setRoundTimer(timeLimit);
    setClicks(0);
    setMatches(0);
    setStep('PLAYING');
    startTime.current = Date.now();
  };

  const handleCardClick = (card: CardData) => {
    if (matchedPairs.has(card.wordId)) return;
    if (selectedId === card.uniqueId) return;

    speak(card.ttsText, card.lang);
    setClicks(c => c + 1);

    if (!selectedId) {
      setSelectedId(card.uniqueId);
      return;
    }

    const firstCard = cards.find(c => c.uniqueId === selectedId)!;
    if (firstCard.wordId === card.wordId && firstCard.isSource !== card.isSource) {
      // Match!
      soundFX.playCorrect();
      setMatchedPairs(prev => {
        const next = new Set(prev);
        next.add(card.wordId);
        if (next.size * 2 === cards.length) {
          setTimeout(() => finishRound(false), 500);
        }
        return next;
      });
      setMatches(m => m + 1);
      setSelectedId(null);
      // Combo confetti
      if (matches > 1) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#F0B84C', '#6FCF97'] });
      }
    } else {
      // Wrong
      soundFX.playError();
      setWrongShakeId(card.uniqueId);
      setTimeout(() => setWrongShakeId(null), 400);
      setSelectedId(null);
    }
  };

  const finishRound = (timeout: boolean) => {
    const timeSpent = (Date.now() - startTime.current) / 1000;
    const accuracy = clicks === 0 ? 0 : (matchedPairs.size * 2) / clicks;

    let score = matchedPairs.size * 10;
    if (accuracy >= 0.8) score += 20;
    if (isDaily) score = Math.floor(score * 1.5);
    if (timeout) score = Math.floor(score / 2);

    soundFX.playFanfare();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#F0B84C', '#6FCF97', '#E8886B'] });

    // Update streak
    const today = getTodayString();
    let newStreak = state.streakDays;
    if (state.lastPlayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (state.lastPlayDate === yesterday) newStreak += 1;
      else newStreak = 1;
    }

    const newStats = [...state.sessionStats, { accuracy, time: timeSpent }];
    let newBand = state.ageBand;

    // Adaptive logic every 3 rounds
    if (newStats.length >= 3) {
      const avgAcc = newStats.reduce((s, x) => s + x.accuracy, 0) / newStats.length;
      const avgTime = newStats.reduce((s, x) => s + x.time, 0) / newStats.length;
      const expectedTime = state.ageBand === '8-9' ? 45 : state.ageBand === '10-12' ? 25 : 60;

      if (avgAcc >= 0.9 && avgTime < expectedTime / 2) {
        if (newBand === '5-7') newBand = '8-9';
        else if (newBand === '8-9') newBand = '10-12';
        alert('شكلك جاهز لمستوى أعلى! 🌟');
      } else if (avgAcc < 0.5) {
        if (newBand === '10-12') newBand = '8-9';
        else if (newBand === '8-9') newBand = '5-7';
        alert('يلا نلعب مستوى أهدى شوية 🌱');
      }
      newStats.length = 0; // reset
    }

    saveState({
      streakDays: newStreak,
      lastPlayDate: today,
      dailyChallengeLastCompleted: isDaily ? today : state.dailyChallengeLastCompleted,
      lastScore: score,
      sessionRounds: state.sessionRounds + 1,
      sessionStats: newStats,
      ageBand: newBand
    });

    setStep('HOME');
  };

  if (step === 'AGE_SELECT') {
    return (
      <div className="min-h-[100dvh] bg-[#0A1E3F] text-[#F5F0E6] flex flex-col items-center justify-center p-6 pt-safe pb-safe font-arabic rtl" dir="rtl">
        <h1 className="text-3xl font-bold mb-10 text-[#F0B84C]">إنت عندك كام سنة؟</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {['٥-٧ سنين', '٨-٩ سنين', '١٠-١٢ سنة'].map((label, idx) => (
            <button
              key={label}
              onClick={() => {
                const band: AgeBand = idx === 0 ? '5-7' : idx === 1 ? '8-9' : '10-12';
                saveState({ ageBand: band });
                setStep('DIR_SELECT');
              }}
              className="bg-[#143A6B] hover:bg-[#1a4a8a] text-2xl font-bold py-6 rounded-2xl border-2 border-[#A8B2C9]/20 transition-transform active:scale-95"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'DIR_SELECT') {
    return (
      <div className="min-h-[100dvh] bg-[#0A1E3F] text-[#F5F0E6] flex flex-col items-center justify-center p-6 pt-safe pb-safe font-arabic rtl relative" dir="rtl">
        <button onClick={() => setStep('AGE_SELECT')} aria-label="رجوع" className="absolute top-4 end-4 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-[#A8B2C9]">
          <ChevronRight size={32} />
        </button>
        <h1 className="text-3xl font-bold mb-10 text-[#F0B84C] text-center">إنت عايز تتعلم إيه النهارده؟</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => { saveState({ direction: 'ar-en' }); setStep('HOME'); }}
            className="bg-[#143A6B] hover:bg-[#1a4a8a] text-xl font-bold py-8 rounded-2xl border-2 border-[#A8B2C9]/20 transition-transform active:scale-95"
          >
            عربي ← {TARGET_LANGUAGE_META[(targetLang as TargetLanguage) || 'en']?.nameAr || 'إنجليزي'}
          </button>
          <button
            onClick={() => { saveState({ direction: 'en-ar' }); setStep('HOME'); }}
            className="bg-[#143A6B] hover:bg-[#1a4a8a] text-xl font-bold py-8 rounded-2xl border-2 border-[#A8B2C9]/20 transition-transform active:scale-95"
          >
            {TARGET_LANGUAGE_META[(targetLang as TargetLanguage) || 'en']?.nameAr || 'إنجليزي'} ← عربي
          </button>
        </div>
      </div>
    );
  }

  if (step === 'HOME') {
    const today = getTodayString();
    const canDoDaily = state.dailyChallengeLastCompleted !== today;

    return (
      <div className="min-h-[100dvh] bg-[#0A1E3F] text-[#F5F0E6] flex flex-col items-center p-6 pt-safe pb-safe font-arabic rtl" dir="rtl">
        <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
          <button onClick={onBack} aria-label="رجوع" className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-[#143A6B] rounded-full text-[#A8B2C9]">
            <ChevronRight size={24} />
          </button>
          <div className="flex items-center gap-2 bg-[#143A6B] px-4 py-2 rounded-full font-bold text-[#F0B84C]">
            <Flame size={20} className={state.streakDays > 0 ? "text-[#E8886B]" : "text-[#A8B2C9]"} />
            <span>{state.streakDays} أيام</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-[#F5F0E6]">لعبة الكلمات 🐟</h1>
        <p className="text-[#A8B2C9] mb-10 text-lg">ملتقى اللغات</p>

        {state.lastScore > 0 && (
          <div className="mb-8 flex items-center gap-2 text-[#6FCF97] font-bold text-xl bg-[#143A6B]/50 px-6 py-3 rounded-2xl">
            <Trophy size={24} />
            <span>آخر سكور: {state.lastScore}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {canDoDaily && (
            <button
              onClick={() => startRound(true)}
              className="bg-gradient-to-r from-[#F0B84C] to-[#E8886B] text-[#0A1E3F] text-2xl font-bold py-6 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Star size={28} className="fill-current" />
              تحدي اليوم (بونص ٥٠٪)
            </button>
          )}

          <button
            onClick={() => startRound(false)}
            className="bg-[#143A6B] hover:bg-[#1a4a8a] text-[#F5F0E6] text-2xl font-bold py-6 rounded-2xl border-2 border-[#A8B2C9]/20 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            <PlayCircle size={28} />
            🚀 يلا نلعب!
          </button>
        </div>

        <button
          onClick={() => setStep('AGE_SELECT')}
          className="mt-auto text-[#A8B2C9] underline py-4"
        >
          تغيير المستوى أو اللغة
        </button>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="min-h-[100dvh] bg-[#0A1E3F] text-[#F5F0E6] flex flex-col p-4 pt-safe pb-safe font-arabic rtl" dir="rtl">
      <div className="flex justify-between items-center mb-6 mt-2">
        <button onClick={() => setStep('HOME')} aria-label="رجوع" className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-[#143A6B] rounded-full text-[#A8B2C9]">
          <ChevronRight size={24} />
        </button>
        {roundTimer !== null && (
          <div className={`font-bold text-xl px-4 py-1 rounded-full ${roundTimer <= 10 ? 'bg-[#E8886B] text-[#0A1E3F] animate-pulse' : 'bg-[#143A6B] text-[#F0B84C]'}`}>
            ⏳ {roundTimer} ث
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {cards.map(card => {
            const isMatched = matchedPairs.has(card.wordId);
            const isSelected = selectedId === card.uniqueId;
            const isWrongShake = wrongShakeId === card.uniqueId;

            return (
              <button
                key={card.uniqueId}
                onClick={() => handleCardClick(card)}
                disabled={isMatched}
                className={`
                  relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300
                  ${state.ageBand === '5-7' && !isDaily ? 'min-h-[140px]' : state.ageBand === '8-9' && !isDaily ? 'min-h-[100px]' : 'min-h-[80px]'}
                  ${isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
                  ${isSelected ? 'bg-[#1a4a8a] border-[#F0B84C] shadow-[0_0_15px_rgba(240,184,76,0.5)]' : 'bg-[#143A6B] border-[#A8B2C9]/20 hover:border-[#A8B2C9]/50'}
                  ${isWrongShake ? 'animate-[tb-shake_0.4s_ease-in-out] border-[#E8886B] bg-[#E8886B]/20' : ''}
                `}
              >
                {/* 5-7 shows large emoji and small text */}
                {card.subContent ? (
                  <>
                    <span className="text-5xl mb-2">{card.content}</span>
                    <span className="text-sm text-[#A8B2C9]">{card.subContent}</span>
                  </>
                ) : (
                  // Others show just content
                  <span className={`text-center px-2 ${card.content.length > 8 ? 'text-xl' : 'text-3xl'} font-bold`}>
                    {card.content}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};