import React, { useState } from 'react';
import { Crown, CheckCircle2, RefreshCw, Volume2, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakGerman } from '../../utils/germanAudio';

interface VerbSeatTwoBuilderProps {
  promptAr: string;
  correctTokens: string[];
  distractors?: string[];
  verbSeatIndex?: number; // 0-based index of verb in correctTokens (e.g. 1 for seat #2)
  sandwichPair?: [number, number]; // [startIndex, endIndex]
  cognitiveCoachHints?: Record<string, string>;
  onSuccess?: () => void;
}

export function VerbSeatTwoBuilder({
  promptAr,
  correctTokens,
  distractors = [],
  verbSeatIndex = 1,
  sandwichPair,
  cognitiveCoachHints = {},
  onSuccess,
}: VerbSeatTwoBuilderProps) {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [coachHint, setCoachHint] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pool of available tokens (correct + distractors)
  const pool = React.useMemo(() => {
    return [...correctTokens, ...distractors].sort((a, b) => a.localeCompare(b));
  }, [correctTokens, distractors]);

  const handleSelectToken = (token: string) => {
    if (selectedTokens.includes(token)) return;
    const next = [...selectedTokens, token];
    setSelectedTokens(next);
    setCoachHint(null);

    // Check if user completed sentence length
    if (next.length === correctTokens.length) {
      if (next.join(' ') === correctTokens.join(' ')) {
        setIsSuccess(true);
        speakGerman(correctTokens.join(' '), 1.0);
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {
          // Ignore
        }
        onSuccess?.();
      } else {
        // Detect error pattern for cognitive coach
        const userAttemptKey = next.join(' ').toLowerCase();
        let matchedHint: string | null = null;

        for (const [pattern, hint] of Object.entries(cognitiveCoachHints)) {
          if (userAttemptKey.includes(pattern.toLowerCase())) {
            matchedHint = hint;
            break;
          }
        }

        if (!matchedHint) {
          // Fallback V2 rule hint if verb is not in position 2
          if (next[1] && next[1].toLowerCase() !== correctTokens[verbSeatIndex]?.toLowerCase()) {
            matchedHint = `خلي بالك من قاعدة الكرسي التاني! الفعل بالألماني لازم يقعد في الخانة الثانية فوراً. الجملة الصح تبدأ بـ: ${correctTokens[0]} ${correctTokens[verbSeatIndex]}.`;
          } else {
            matchedHint = `راجع الترتيب مرة ثانية. الكلمات المطلوبة هي: ${correctTokens.join(' ')}`;
          }
        }

        setCoachHint(matchedHint);
      }
    }
  };

  const handleReset = () => {
    setSelectedTokens([]);
    setCoachHint(null);
    setIsSuccess(false);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-border bg-surface text-text shadow-xl space-y-5 text-start" dir="rtl">
      {/* Prompt */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-400">فكرة الجملة بالألمانية:</span>
          {selectedTokens.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted hover:text-text flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          )}
        </div>
        <h4 className="text-lg sm:text-xl font-black text-text">
          «{promptAr}»
        </h4>
      </div>

      {/* Numbered Seats Slot Container */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-muted flex items-center gap-1">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>هندسة الجملة الألمانية (مقاعد الجملة):</span>
        </div>

        <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-border bg-surface-2 flex items-center flex-wrap gap-2.5" dir="ltr">
          {correctTokens.map((_, seatIdx) => {
            const token = selectedTokens[seatIdx];
            const isVerbSeat = seatIdx === verbSeatIndex;
            const isSandwichStart = sandwichPair && seatIdx === sandwichPair[0];
            const isSandwichEnd = sandwichPair && seatIdx === sandwichPair[1];

            return (
              <div
                key={seatIdx}
                className={`relative flex flex-col items-center justify-center min-w-[56px] px-3 py-2 rounded-2xl border transition-all font-mono font-black text-sm ${
                  token
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                    : isVerbSeat
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-border bg-surface text-muted'
                }`}
              >
                {/* Seat Badge Header */}
                <div className="text-[10px] font-bold opacity-80 mb-0.5 flex items-center gap-0.5">
                  {isVerbSeat && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  <span>#{seatIdx + 1}</span>
                </div>

                {/* Token or Slot Placeholder */}
                <span>{token || (isVerbSeat ? '👑 الفعل' : '...')}</span>

                {/* Sandwich Tags */}
                {isSandwichStart && (
                  <span className="absolute -bottom-2 text-[9px] font-black bg-rose-500 text-white px-1.5 rounded-full">
                    🥪 أول الساندويتش
                  </span>
                )}
                {isSandwichEnd && (
                  <span className="absolute -bottom-2 text-[9px] font-black bg-rose-500 text-white px-1.5 rounded-full">
                    🥪 آخر الساندويتش
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Word Chips Pool */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted">اختر الكلمات بالترتيب الصحيح:</span>
        <div className="flex items-center flex-wrap gap-2" dir="ltr">
          {pool.map((token, idx) => {
            const isUsed = selectedTokens.includes(token);
            return (
              <button
                key={idx}
                type="button"
                disabled={isUsed}
                onClick={() => handleSelectToken(token)}
                className={`px-3.5 py-2 rounded-xl text-sm font-black border transition-all font-mono ${
                  isUsed
                    ? 'opacity-30 border-border bg-surface-2 text-muted cursor-not-allowed'
                    : 'border-border bg-surface hover:border-amber-500 text-text shadow-sm hover:scale-105 active:scale-95'
                }`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cognitive Coach Hint Box */}
      {coachHint && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400">
            <Lightbulb className="w-4 h-4 fill-amber-400/30" />
            <span>مدرب التفكير الأكاديمي:</span>
          </div>
          <p className="text-xs text-text font-medium leading-relaxed">
            {coachHint}
          </p>
        </div>
      )}

      {/* Success State */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>إجابة صحيحة ١٠٠٪! هندسة الجملة وموقع الفعل تمام 🚀</span>
            </div>
            <button
              type="button"
              onClick={() => speakGerman(correctTokens.join(' '), 1.0)}
              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              title="سماع الجملة بالكامل"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
