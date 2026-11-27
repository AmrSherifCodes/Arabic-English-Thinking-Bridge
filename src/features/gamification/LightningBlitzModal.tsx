// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, RotateCcw, Share2, Trophy, X, Zap } from 'lucide-react';
import { AmrGuide } from '../../components/AmrGuide';
import { loadGamificationStore, recordArcadeResult } from './achievements';
import {
  getSavedLeaderboardDisplayName,
  recordFlexEvent,
  shareFlexCard,
  syncLeaderboardXp,
} from './flexTitles';
import { playPentatonicChime, playSoftRetryTone } from '../../utils/wordBank';
import { safeVibrate } from '../../utils/fx';

export interface LightningBlitzModalProps {
  isArabic?: boolean;
  userAlias?: string;
  streak?: number;
  leagueOptOut?: boolean;
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
}

interface BlitzRound {
  id: string;
  promptAr: string;
  promptEn: string;
  correct: string;
  distractors: [string, string, string];
}

const BLITZ_BANK: readonly BlitzRound[] = [
  {
    id: 'b-agree',
    promptAr: 'أنا موافق معاك',
    promptEn: 'Fix: "I am agree with you"',
    correct: 'I agree with you',
    distractors: ['I am agree with you', 'I agreeing you', 'I have agree'],
  },
  {
    id: 'b-age',
    promptAr: 'عندي 16 سنة',
    promptEn: 'Fix: "I have 16 years"',
    correct: 'I am 16 years old',
    distractors: ['I have 16 years', 'My age has 16', 'I got 16 years'],
  },
  {
    id: 'b-light',
    promptAr: 'افتح النور',
    promptEn: 'Fix: "Open the light"',
    correct: 'Turn on the light',
    distractors: ['Open the light', 'Start the light', 'Switch up light'],
  },
  {
    id: 'b-didnt-go',
    promptAr: 'هو ماراحش المدرسة',
    promptEn: 'Fix: "He didn\'t went"',
    correct: "He didn't go",
    distractors: ["He didn't went", "He wasn't go", 'He not went'],
  },
  {
    id: 'b-home',
    promptAr: 'روحت البيت بدري',
    promptEn: 'Fix: "I went to home"',
    correct: 'I went home early',
    distractors: ['I went to home', 'I went at home', 'I went in home'],
  },
  {
    id: 'b-wait',
    promptAr: 'أنا مستنيك بره',
    promptEn: 'Fix: "I am waiting you"',
    correct: 'I am waiting for you',
    distractors: ['I am waiting you', 'I wait to you', 'I am wait you'],
  },
  {
    id: 'b-news',
    promptAr: 'الأخبار حلوة جداً',
    promptEn: 'Fix: "The news are great"',
    correct: 'The news is great',
    distractors: ['The news are great', 'A news is great', 'News were great'],
  },
  {
    id: 'b-taller',
    promptAr: 'أحمد أطول من علي',
    promptEn: 'Fix: "more tall than"',
    correct: 'taller than Ali',
    distractors: ['more tall than Ali', 'more taller Ali', 'tallest than Ali'],
  },
  {
    id: 'b-live',
    promptAr: 'أنا عايش في مصر',
    promptEn: 'Fix: "I am live in Egypt"',
    correct: 'I live in Egypt',
    distractors: ['I am live in Egypt', 'I living Egypt', 'I am lives Egypt'],
  },
  {
    id: 'b-told',
    promptAr: 'هو قال لي الحقيقة',
    promptEn: 'Fix: "He told to me"',
    correct: 'He told me',
    distractors: ['He told to me', 'He said me', 'He told for me'],
  },
  {
    id: 'b-married',
    promptAr: 'هي متجوزة من مهندس',
    promptEn: 'Fix: "married from"',
    correct: 'married to an engineer',
    distractors: ['married from engineer', 'married with engineer', 'married by engineer'],
  },
  {
    id: 'b-discuss',
    promptAr: 'خلينا نناقش الفكرة',
    promptEn: 'Fix: "discuss about"',
    correct: "Let's discuss the idea",
    distractors: ['Discuss about idea', 'Discuss on the idea', 'Discussing about it'],
  },
  {
    id: 'b-interested',
    promptAr: 'أنا مهتم بالبرمجة',
    promptEn: 'Fix: "I am interesting in"',
    correct: 'I am interested in coding',
    distractors: ['I am interesting in', 'I have interested in', 'I interest in coding'],
  },
  {
    id: 'b-depends',
    promptAr: 'ده بيعتمد على الوقت',
    promptEn: 'Fix: "depend of"',
    correct: 'It depends on time',
    distractors: ['It depend of time', 'It is depend on time', 'It depends from time'],
  },
  {
    id: 'b-explain',
    promptAr: 'اشرح لي اللعبة دي',
    promptEn: 'Fix: "explain me"',
    correct: 'Explain this game to me',
    distractors: ['Explain me this game', 'Explain for me game', 'Explain to me is game'],
  },
  {
    id: 'b-fan',
    promptAr: 'اقفل المروحة',
    promptEn: 'Fix: "Close the fan"',
    correct: 'Turn off the fan',
    distractors: ['Close the fan', 'Lock the fan', 'Shut down fan'],
  },
  {
    id: 'b-saw',
    promptAr: 'ما شفتوش امبارح',
    promptEn: 'Fix: "didn\'t saw"',
    correct: "I didn't see him",
    distractors: ["I didn't saw him", "I wasn't see him", "I haven't saw him"],
  },
  {
    id: 'b-has',
    promptAr: 'أخويا عنده لابتوب جديد',
    promptEn: 'Fix: "My brother have"',
    correct: 'My brother has a laptop',
    distractors: ['My brother have laptop', 'My brother is have', 'Brother having laptop'],
  },
  {
    id: 'b-doctor',
    promptAr: 'هي دكتورة شاطرة',
    promptEn: 'Fix: "She smart doctor"',
    correct: 'She is a smart doctor',
    distractors: ['She smart doctor', 'She is doctor smart', 'She has a smart doctor'],
  },
  {
    id: 'b-busy',
    promptAr: 'هو مش مشغول دلوقتي',
    promptEn: 'Fix: "He no busy now"',
    correct: 'He is not busy now',
    distractors: ['He no busy now', "He doesn't busy now", 'He not is busy'],
  },
];

function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const TOTAL_SECONDS = 60;
const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function LightningBlitzModal({
  isArabic = true,
  userAlias = 'Player',
  streak = 0,
  leagueOptOut = false,
  onClose,
  onXpEarned,
}: LightningBlitzModalProps) {
  const [deck, setDeck] = useState<BlitzRound[]>(() => shuffleArray(BLITZ_BANK));
  const [roundIdx, setRoundIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [personalBest, setPersonalBest] = useState(() => loadGamificationStore().blitzBestScore);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [syncedLeaderboard, setSyncedLeaderboard] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const popIdRef = useRef(0);
  const [pops, setPops] = useState<Array<{ id: number; text: string; x: number; y: number; tone: 'xp' | 'combo' }>>([]);
  const finalizedRef = useRef(false);

  const currentRound = deck[roundIdx % deck.length];
  const options = useMemo(() => {
    if (!currentRound) return [];
    return shuffleArray([currentRound.correct, ...currentRound.distractors]);
  }, [currentRound, roundIdx]);

  const multiplier = Math.min(5, comboStreak >= 8 ? 5 : comboStreak >= 6 ? 4 : comboStreak >= 4 ? 3 : comboStreak >= 2 ? 2 : 1);
  const isFever = multiplier >= 3;
  const isGoldFever = multiplier >= 5;

  const spawnPop = useCallback((text: string, tone: 'xp' | 'combo', el?: HTMLElement | null) => {
    const frame = frameRef.current;
    let x = 50;
    let y = 55;
    if (frame && el) {
      const f = frame.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (f.width > 0 && f.height > 0) {
        x = Math.min(82, Math.max(18, ((r.left + r.width / 2 - f.left) / f.width) * 100));
        y = Math.min(78, Math.max(20, ((r.top - f.top) / f.height) * 100));
      }
    }
    const id = ++popIdRef.current;
    setPops((prev) => [...prev.slice(-2), { id, text, x, y, tone }]);
    window.setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  }, []);

  const finalizeRound = useCallback(
    (finalScore: number, bestCombo: number, totalCorrect: number) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      setFinished(true);

      const prevBest = loadGamificationStore().blitzBestScore;
      const earnedXp = Math.max(25, Math.min(150, Math.round(finalScore / 8)));
      const res = recordArcadeResult(
        {
          mode: 'blitz',
          score: finalScore,
          maxCombo: bestCombo,
          correctStreak: totalCorrect,
          xpEarned: earnedXp,
        },
        { isPro: true }
      );
      recordFlexEvent({ blitzRoundPlayed: true, comboReached: bestCombo });
      setPersonalBest(res.store.blitzBestScore);
      setIsNewBest(finalScore > prevBest && finalScore > 0);
      onXpEarned?.(earnedXp);

      void syncLeaderboardXp({
        displayName: getSavedLeaderboardDisplayName(userAlias),
        xpDelta: earnedXp,
        streak,
        hidden: leagueOptOut,
      }).then((ok) => {
        if (ok) setSyncedLeaderboard(true);
      });

      if (finalScore >= 300) {
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#22D3EE', '#F59E0B', '#10B981'],
          });
        } catch {}
      }
    },
    [leagueOptOut, onXpEarned, streak, userAlias]
  );

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (timeLeft === 0 && !finished) {
      finalizeRound(score, maxCombo, correctCount);
    }
  }, [timeLeft, finished, score, maxCombo, correctCount, finalizeRound]);

  const handleRestart = () => {
    finalizedRef.current = false;
    setDeck(shuffleArray(BLITZ_BANK));
    setRoundIdx(0);
    setTimeLeft(TOTAL_SECONDS);
    setScore(0);
    setComboStreak(0);
    setMaxCombo(1);
    setCorrectCount(0);
    setFinished(false);
    setIsNewBest(false);
    setFeedback(null);
    setShareStatus(null);
    setSyncedLeaderboard(false);
  };

  const handleTapOption = (option: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (finished || !currentRound) return;
    const isCorrect = option === currentRound.correct;

    if (isCorrect) {
      const nextStreak = comboStreak + 1;
      const nextMult = Math.min(5, nextStreak >= 8 ? 5 : nextStreak >= 6 ? 4 : nextStreak >= 4 ? 3 : nextStreak >= 2 ? 2 : 1);
      const pts = 50 * nextMult;
      setComboStreak(nextStreak);
      setMaxCombo((prev) => Math.max(prev, nextMult));
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + pts);
      playPentatonicChime(nextStreak - 1);
      safeVibrate(10);
      spawnPop(
        nextMult >= 2 ? `+${pts} · 🔥 x${nextMult}` : `+${pts} ⚡`,
        nextMult >= 3 ? 'combo' : 'xp',
        e.currentTarget
      );
      setFeedback({
        ok: true,
        text:
          nextMult >= 5
            ? isArabic ? 'وحش اللغات! 👑' : 'Language Beast! 👑'
            : nextMult >= 3
              ? isArabic ? 'إيه السرعة دي! ⚡' : 'Pure Speed! ⚡'
              : isArabic ? 'عاش يا بطل! 🔥' : 'Nice snipe! 🔥',
      });
      setRoundIdx((prev) => prev + 1);
    } else {
      playSoftRetryTone();
      safeVibrate(25);
      setComboStreak(0);
      setFeedback({
        ok: false,
        text: isArabic
          ? `قريبة جداً! الصح: ${currentRound.correct} 😉`
          : `So close! Answer: ${currentRound.correct} 😉`,
      });
      setRoundIdx((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    const res = await shareFlexCard({
      alias: userAlias,
      xp: Math.max(25, Math.min(150, Math.round(score / 8))),
      streak,
      blitzBest: Math.max(personalBest, score),
      titleLabel: isArabic ? 'سريع البديهة ⚡' : 'Quick Reflexes ⚡',
      isArabic,
    });
    if (res === 'copied') {
      setShareStatus(isArabic ? '✅ تم النسخ للمشاركة في واتساب!' : '✅ Copied for WhatsApp!');
    } else if (res === 'shared') {
      setShareStatus(isArabic ? '✅ تمت المشاركة!' : '✅ Shared!');
    }
  };

  const ringOffset = RING_CIRCUMFERENCE * (1 - timeLeft / TOTAL_SECONDS);
  const ringStroke = timeLeft <= 10 ? '#F43F5E' : timeLeft <= 20 ? '#F59E0B' : '#22D3EE';
  const earnedXpPreview = Math.max(25, Math.min(150, Math.round(score / 8)));

  return (
    <div
      className="fixed inset-0 z-[70] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        ref={frameRef}
        data-testid="lightning-blitz-modal"
        className={`w-full h-full sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:rounded-3xl bg-[#0B1120] border-2 flex flex-col overflow-hidden relative shadow-2xl ${
          isGoldFever ? 'tb-fever-gold' : isFever ? 'tb-fever-cyan' : 'border-[#22D3EE]/40'
        }`}
      >
        {/* Floating Pop Particles */}
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
          <AnimatePresence>
            {pops.map((pop) => (
              <motion.div
                key={pop.id}
                initial={{ y: 0, scale: 0.75, opacity: 0 }}
                animate={{ y: -52, scale: 1.08, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 440, damping: 24 }}
                style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
                className={`absolute -translate-x-1/2 px-3 py-1 rounded-full border text-xs font-black whitespace-nowrap shadow-xl ${
                  pop.tone === 'combo'
                    ? 'bg-[#0B1120]/95 border-[#F59E0B] text-[#FBBF24]'
                    : 'bg-[#22D3EE]/95 border-cyan-200 text-[#0B1120]'
                }`}
              >
                {pop.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sticky Header HUD */}
        <div className="px-4 pb-3 pt-safe border-b border-slate-700/50 bg-[#131C31] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[48px] min-w-[48px] px-3 rounded-2xl bg-[#1B2742] border border-slate-600/40 text-[#F8FAFC] font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X size={18} />
            <span>{isArabic ? 'خروج' : 'Exit'}</span>
          </button>

          <div className="text-center min-w-0 flex-1">
            <span className="text-[11px] font-black text-[#22D3EE] block">
              {isArabic ? 'تحدي الـ 60 ثانية ⚡' : '60s Lightning Blitz ⚡'}
            </span>
            <span className="text-xs font-bold text-[#CBD5E1]">
              {isArabic ? `أفضل رقم: ${personalBest}` : `PB: ${personalBest}`}
            </span>
          </div>

          {/* Live SVG Countdown Ring */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center" data-testid="blitz-countdown-ring">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(148,163,184,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="36"
                cy="36"
                r={RING_RADIUS}
                fill="none"
                stroke={ringStroke}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                className="transition-all duration-300"
              />
            </svg>
            <span
              className={`absolute text-sm font-black font-mono tabular-nums ${
                timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-[#F8FAFC]'
              }`}
            >
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Body */}
        {!finished ? (
          <div className="flex-1 flex flex-col justify-between p-4 pb-safe gap-4 overflow-y-auto">
            {/* Live Score + Multiplier Strip */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-[#131C31] border border-slate-700/50">
                <span className="text-[10px] font-bold text-[#CBD5E1] block">{isArabic ? 'النقاط' : 'Score'}</span>
                <span className="text-lg font-black text-[#FBBF24] tabular-nums" data-testid="blitz-score">{score}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#131C31] border border-slate-700/50">
                <span className="text-[10px] font-bold text-[#CBD5E1] block">{isArabic ? 'الكومبو' : 'Combo'}</span>
                <span className="text-lg font-black text-[#22D3EE] inline-flex items-center justify-center gap-0.5" data-testid="blitz-combo">
                  <Flame size={16} />x{multiplier}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#131C31] border border-slate-700/50">
                <span className="text-[10px] font-bold text-[#CBD5E1] block">{isArabic ? 'إجابات صح' : 'Hits'}</span>
                <span className="text-lg font-black text-[#10B981] tabular-nums">{correctCount}</span>
              </div>
            </div>

            {/* Prompt Card + AmrGuide */}
            <div className="p-5 rounded-3xl bg-[#131C31] border border-[#22D3EE]/35 text-center space-y-3 shadow-xl">
              <div className="flex items-center justify-center gap-3">
                <AmrGuide
                  mood={isGoldFever ? 'cheer' : isFever ? 'celebrate' : feedback?.ok === false ? 'encourage' : 'excited'}
                  isArabic={isArabic}
                  size={60}
                />
                {feedback && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border tb-pop-bounce ${
                      feedback.ok
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                        : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    }`}
                  >
                    {feedback.text}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-[#22D3EE] block">
                  {isArabic ? 'اختار التركيبة الإنجليزية الصح بسرعة ⚡' : 'Tap the right English structure fast ⚡'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] leading-snug">
                  {isArabic ? currentRound.promptAr : currentRound.promptEn}
                </h3>
              </div>
            </div>

            {/* 4-Button Thumb-Zone Pad */}
            <div className="grid grid-cols-2 gap-2.5 pt-1" dir="ltr" data-testid="blitz-thumb-pad">
              {options.map((opt) => (
                <button
                  key={`${roundIdx}-${opt}`}
                  type="button"
                  onClick={(e) => handleTapOption(opt, e)}
                  className="min-h-[68px] px-3 py-3 rounded-2xl bg-[#1B2742] border border-slate-500/35 hover:border-[#22D3EE] text-[#F8FAFC] font-black text-xs sm:text-sm leading-snug flex items-center justify-center text-center cursor-pointer tb-btn-3d active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 pb-safe text-center space-y-5 overflow-y-auto">
            <AmrGuide mood={isNewBest ? 'cheer' : 'proud'} isArabic={isArabic} size={104} />

            {isNewBest && (
              <span className="px-3.5 py-1 rounded-full bg-[#F59E0B] text-[#0B1120] text-xs font-black tb-pop-bounce">
                🏆 {isArabic ? 'رقم قياسي جديد!' : 'NEW PERSONAL BEST!'}
              </span>
            )}

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#F8FAFC]">
                {isArabic ? 'انتهى تحدي الـ 60 ثانية! ⚡' : '60s Lightning Blitz Complete! ⚡'}
              </h3>
              <p className="text-xs font-bold text-[#22D3EE]">
                {syncedLeaderboard
                  ? isArabic ? '✅ تم تسجيل XP في لوحة المتصدرين العالمية!' : '✅ XP synced to Global Leaderboard!'
                  : isArabic ? `⚡ +${earnedXpPreview} XP تمت إضافتها لحسابك` : `⚡ +${earnedXpPreview} XP added to your profile`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
              <div className="p-3 rounded-2xl bg-[#131C31] border border-slate-700/60">
                <span className="text-[10px] font-bold text-[#CBD5E1] block">{isArabic ? 'النتيجة' : 'Score'}</span>
                <span className="text-lg font-black text-[#FBBF24]">{score}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#131C31] border border-slate-700/60">
                <span className="text-[10px] font-bold text-[#CBD5E1] block">{isArabic ? 'أعلى كومبو' : 'Max Combo'}</span>
                <span className="text-lg font-black text-[#22D3EE]">x{maxCombo}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#131C31] border border-slate-700/60">
                <span className="text-[10px] font-bold text-[#CBD5E1] block">{isArabic ? 'أفضل رقم' : 'Best'}</span>
                <span className="text-lg font-black text-[#10B981]">{personalBest}</span>
              </div>
            </div>

            {shareStatus && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                {shareStatus}
              </div>
            )}

            <div className="w-full max-w-sm space-y-2.5">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full min-h-[54px] py-3 rounded-2xl font-black text-base inline-flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald"
              >
                <RotateCcw size={18} />
                <span>{isArabic ? 'جولة تانية! ⚡' : 'One More Round! ⚡'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-full min-h-[50px] py-2.5 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-gold"
              >
                <Share2 size={16} />
                <span>{isArabic ? 'شارك نتيجتك في واتساب 📤' : 'Share My Score 📤'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
