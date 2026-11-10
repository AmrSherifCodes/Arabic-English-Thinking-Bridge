import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, Flame, Award, ArrowRight } from 'lucide-react';
import { soundFX } from '../utils/soundFX';
import { speakWithRate } from '../utils/audio';
import type { FlashcardItemData } from './uiConstants';

interface BubbleArcadeGameProps {
  cards: FlashcardItemData[];
  onFinish: () => void;
  onGradeCard: (grade: 0 | 1 | 2 | 3) => void;
  preferredVoice?: string;
  isArabic?: boolean;
}

export function BubbleArcadeGame({
  cards,
  onFinish,
  onGradeCard,
  preferredVoice,
  isArabic = true,
}: BubbleArcadeGameProps) {
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(1);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<string[]>([]);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  const current = cards[index];

  useEffect(() => {
    if (!current) return;
    setPoppedIndex(null);
    setWrongIndex(null);

    // Auto speak target word
    try {
      speakWithRate(current.en, 1.0, preferredVoice);
    } catch {}

    // Generate 3 choices (1 correct, 2 distractors)
    const otherCards = cards.filter((c, i) => i !== index);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 2).map((c) => c.en);

    // Fallback if not enough cards
    while (distractors.length < 2) {
      distractors.push(distractors.length === 0 ? 'Good morning' : 'Thank you');
    }

    const options = [current.en, ...distractors].sort(() => 0.5 - Math.random());
    setBubbles(options);
  }, [index, current, preferredVoice]);

  if (!current) {
    return (
      <div className="p-8 text-center space-y-4 rounded-3xl bg-slate-900 border border-emerald-500/30">
        <div className="text-5xl animate-bounce">🏆</div>
        <h3 className="text-2xl font-black text-emerald-400">
          {isArabic ? 'بطل خارق! فجّرت كل الفقاعات!' : 'Awesome! All Bubbles Popped!'}
        </h3>
        <p className="text-sm text-slate-300">
          {isArabic ? `المجموع: +${score} XP · سلسلة الانتصارات 🔥 ${streak}` : `Score: +${score} XP`}
        </p>
        <button
          onClick={onFinish}
          className="py-3 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base shadow-xl"
        >
          {isArabic ? 'العودة للبطاقات' : 'Back to Decks'}
        </button>
      </div>
    );
  }

  const handleBubbleClick = (option: string, bubbleIdx: number) => {
    if (option === current.en) {
      // Correct!
      setPoppedIndex(bubbleIdx);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 20 * Math.min(nextStreak, 5));

      soundFX.playComboChord(nextStreak);
      if (nextStreak % 5 === 0) {
        soundFX.playFanfare();
      }

      void confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      onGradeCard(3);

      setTimeout(() => {
        if (index + 1 < cards.length) {
          setIndex((i) => i + 1);
        } else {
          onFinish();
        }
      }, 550);
    } else {
      // Wrong bubble
      setWrongIndex(bubbleIdx);
      soundFX.playError();
      setTimeout(() => setWrongIndex(null), 600);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center select-none" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top HUD: Streak & Score */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
          <Flame className="h-5 w-5 fill-amber-400 animate-pulse" />
          <span>سلسلة: 🔥 {streak}x</span>
        </div>
        <div className="text-xs text-slate-400 font-bold">
          بطاقة {index + 1} من {cards.length}
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-sm">
          <Award className="h-4 w-4" />
          <span>+{score} XP</span>
        </div>
      </div>

      {/* Target Word Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <span className="text-5xl sm:text-6xl my-2 block drop-shadow-lg animate-bounce">
          🎯
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {current.ar}
        </h2>

        {/* Audio Replay */}
        <button
          type="button"
          onClick={() => speakWithRate(current.en, 1.0, preferredVoice)}
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold text-xs cursor-pointer active:scale-95 transition-transform"
        >
          <Volume2 size={16} />
          <span>{isArabic ? '🔊 اسمع النطق تاني' : '🔊 Hear again'}</span>
        </button>
      </div>

      {/* 3 Glowing Floating Bubbles */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-bold text-slate-400">
          {isArabic ? 'فرقع الفقاعة اللي فيها الكلمة الصح! 🫧' : 'Pop the right bubble! 🫧'}
        </p>

        <div className="grid grid-cols-1 gap-3">
          {bubbles.map((opt, bIdx) => {
            const isPopped = poppedIndex === bIdx;
            const isWrong = wrongIndex === bIdx;

            return (
              <button
                key={bIdx}
                type="button"
                onClick={() => handleBubbleClick(opt, bIdx)}
                className={`w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl transition-all duration-200 cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-3 ${
                  isPopped
                    ? 'bg-emerald-500 text-black scale-105 ring-4 ring-emerald-300'
                    : isWrong
                    ? 'bg-rose-600 text-white animate-shake'
                    : 'bg-gradient-to-r from-teal-900/60 via-slate-800 to-emerald-950/60 hover:from-teal-800/80 hover:to-emerald-900/80 text-emerald-200 border-2 border-teal-500/40 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                }`}
              >
                <span>🫧</span>
                <span dir="ltr">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

