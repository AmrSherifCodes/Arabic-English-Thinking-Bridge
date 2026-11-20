import React, { useCallback, useEffect, useRef, useState } from 'react';

export type AnkiGrade = 'review' | 'good' | 'easy';

export interface ThinkingBridgeCard {
  id: string;
  levelLabelAr: string;
  arabicThought: string;
  englishPhrase: string;
  phoneticAr: string;
  thinkingHintAr: string;
  exampleAr?: string;
}

export interface AnkiFlashcardDeckProps {
  cards?: ThinkingBridgeCard[];
  fontScale?: number;
  autoPlayAudio?: boolean;
  onCardGraded?: (cardId: string, grade: AnkiGrade, earnedXp: number) => void;
  onDeckComplete?: (summary: { totalXp: number; reviewedCount: number }) => void;
}

export const SAMPLE_LEVEL_3_CARDS: ThinkingBridgeCard[] = [
  {
    id: 'lvl3-ready',
    levelLabelAr: 'المستوى ٣ • سر الرابط الخفي',
    arabicThought: 'أنا جاهز دلوقتي',
    englishPhrase: 'I am ready now',
    phoneticAr: 'آي آم ريدي ناو',
    thinkingHintAr:
      'في العربي بنقول "أنا جاهز" على طول، بس الإنجليزي لازم يحط رابط خفي (am) بينك وبين الصفة.',
  },
  {
    id: 'lvl3-location',
    levelLabelAr: 'المستوى ٣ • سر الرابط الخفي',
    arabicThought: 'هو في الطريق دلوقتي',
    englishPhrase: 'He is on the way',
    phoneticAr: 'هي إز أون ذا واي',
    thinkingHintAr:
      'مع "هو" أو "هي" بنستخدم الرابط (is) عشان الجملة تمسك في بعضها وماتقعش.',
  },
  {
    id: 'lvl3-order',
    levelLabelAr: 'المستوى ٣ • سر الرابط الخفي',
    arabicThought: 'الأوردر بتاعي جاهز؟',
    englishPhrase: 'Is my order ready?',
    phoneticAr: 'إز ماي أوردر ريدي؟',
    thinkingHintAr:
      'عشان تسأل بـ "هل"، كل اللي بتعمله إنك بتطلع الرابط (Is) قدام في أول الجملة.',
  },
];

const GRADE_XP: Record<AnkiGrade, number> = {
  review: 2,
  good: 10,
  easy: 15,
};

export const AnkiFlashcardDeck: React.FC<AnkiFlashcardDeckProps> = ({
  cards = SAMPLE_LEVEL_3_CARDS,
  fontScale = 1.05,
  autoPlayAudio = true,
  onCardGraded,
  onDeckComplete,
}) => {
  const [queue, setQueue] = useState<ThinkingBridgeCard[]>(cards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speakingRate, setSpeakingRate] = useState<1 | 0.75 | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const currentCard = queue[0] ?? null;
  const completedCount = Math.max(0, cards.length - queue.length);
  const progressPct = cards.length > 0 ? Math.round((completedCount / cards.length) * 100) : 100;

  useEffect(() => {
    setQueue(cards);
    setIsFlipped(false);
    setTotalXp(0);
    setReviewedCount(0);
  }, [cards]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingRate(null);
  }, []);

  const speakEnglish = useCallback(
    (text: string, rate: 1 | 0.75) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang === 'en-US' && /natural|google|samantha|aria/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en-'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setSpeakingRate(rate);
      utterance.onend = () => setSpeakingRate(null);
      utterance.onerror = () => setSpeakingRate(null);

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  useEffect(() => {
    return () => {
      stopSpeech();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [stopSpeech]);

  const showToast = useCallback((msg: string) => {
    setFeedbackToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setFeedbackToast(null), 1800);
  }, []);

  const handleFlip = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && autoPlayAudio) {
        speakEnglish(currentCard.englishPhrase, 1);
      } else if (!next) {
        stopSpeech();
      }
      return next;
    });
  }, [autoPlayAudio, currentCard, speakEnglish, stopSpeech]);

  const handleGrade = useCallback(
    (grade: AnkiGrade) => {
      if (!currentCard) return;
      stopSpeech();

      const earnedXp = GRADE_XP[grade];
      const nextXp = totalXp + earnedXp;
      const nextReviewed = reviewedCount + 1;

      setTotalXp(nextXp);
      setReviewedCount(nextReviewed);
      onCardGraded?.(currentCard.id, grade, earnedXp);

      setQueue((prevQueue) => {
        const [active, ...rest] = prevQueue;
        if (!active) return [];

        // Non-punitive: "محتاج أراجعها" re-queues the card 2 spots later so it sticks
        if (grade === 'review') {
          const insertAt = Math.min(2, rest.length);
          const nextQueue = [...rest];
          nextQueue.splice(insertAt, 0, active);
          return nextQueue;
        }

        if (rest.length === 0) {
          onDeckComplete?.({ totalXp: nextXp, reviewedCount: nextReviewed });
        }
        return rest;
      });

      if (grade === 'review') {
        showToast('🛡️ ولا يهمك! هنرجعلها تاني بعد شوية عشان تثبت (+2 XP)');
      } else if (grade === 'good') {
        showToast('👏 عاش! الفكرة وصلت (+10 XP)');
      } else {
        showToast('🔥 ممتاز! ثبتت في دماغك (+15 XP)');
      }

      setIsFlipped(false);
    },
    [currentCard, onCardGraded, onDeckComplete, reviewedCount, showToast, stopSpeech, totalXp]
  );

  // Keyboard shortcuts: Space/Enter to flip, 1/2/3 to grade
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentCard) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && e.key === '1') {
        handleGrade('review');
      } else if (isFlipped && e.key === '2') {
        handleGrade('good');
      } else if (isFlipped && e.key === '3') {
        handleGrade('easy');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentCard, handleFlip, handleGrade, isFlipped]);

  if (!currentCard) {
    return (
      <section
        dir="rtl"
        className="mx-auto w-full max-w-xl rounded-3xl border border-emerald-400/30 bg-slate-900/95 p-6 text-center text-white shadow-[0_0_32px_rgba(16,185,129,0.22)]"
        style={{ fontSize: `${fontScale}rem` }}
      >
        <div className="mb-3 text-4xl">🏆</div>
        <h2 className="text-xl font-bold text-emerald-300">خلصت البطاقات الذكية للمستوى ده!</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          جمعت <strong className="text-amber-300">+{totalXp} XP</strong> في {reviewedCount} محاولة.
          جاهز للمرحلة الجاية (رتّب الفكرة)؟
        </p>
        <button
          type="button"
          onClick={() => {
            setQueue(cards);
            setIsFlipped(false);
            setTotalXp(0);
            setReviewedCount(0);
          }}
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
        >
          راجع المجموعة تاني
        </button>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-xl overflow-visible px-2 py-4 text-white"
      style={{ fontSize: `${fontScale}rem` }}
    >
      {/* Top Progress & XP Strip */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-emerald-300">
          {currentCard.levelLabelAr}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 px-3 py-1 font-bold text-amber-300">
            ⚡ {totalXp} XP
          </span>
          <span className="text-slate-400">متبقي {queue.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 h-2 w-full rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-l from-emerald-400 to-teal-300 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Encouraging Toast */}
      <div className="mb-3 min-h-[28px] text-center">
        {feedbackToast && (
          <p className="inline-block rounded-full bg-slate-800/90 px-4 py-1 text-xs font-semibold text-emerald-200 shadow">
            {feedbackToast}
          </p>
        )}
      </div>

      {/* 3D Flip Scene (overflow-visible prevents shadow clipping) */}
      <div
        className="w-full overflow-visible"
        style={{ perspective: '1200px' }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          aria-label={isFlipped ? 'اقلب البطاقة للعربي' : 'اقلب البطاقة عشان تشوف الإنجليزي'}
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.code === 'Space') {
              e.preventDefault();
              handleFlip();
            }
          }}
          className="relative min-h-[340px] w-full cursor-pointer select-none transition-transform duration-500 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE — Arabic Thought */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border border-slate-700/80 bg-slate-900 p-6 text-center shadow-[0_12px_36px_rgba(0,0,0,0.45)]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
              البطاقات الذكية • فكّر بالعربي الأول
            </span>

            <div className="my-auto py-4">
              <p className="text-2xl font-extrabold leading-snug text-white sm:text-3xl">
                {currentCard.arabicThought}
              </p>
              <p className="mt-3 text-sm text-slate-400">
                تفتكر نقولها إزاي بالإنجليزي؟
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200">
              👆 اضغط على البطاقة عشان تقلبها
            </span>
          </div>

          {/* BACK FACE — English Phrase + Dual-Speed Audio + Cognitive Hint */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-emerald-400/50 bg-slate-900 p-5 text-center shadow-[0_0_32px_rgba(16,185,129,0.22)] sm:p-6"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              <p
                dir="ltr"
                className="text-2xl font-extrabold tracking-wide text-emerald-300 sm:text-3xl"
              >
                {currentCard.englishPhrase}
              </p>
              <p className="mt-2 text-base font-medium text-amber-200">
                🗣️ النطق التقريبي: {currentCard.phoneticAr}
              </p>
            </div>

            {/* Dual-Speed Speech Synthesis Buttons */}
            <div className="my-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakEnglish(currentCard.englishPhrase, 1);
                }}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                  speakingRate === 1
                    ? 'bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.6)]'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                🔊 اسمعها طبيعي (1.0x)
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakEnglish(currentCard.englishPhrase, 0.75);
                }}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                  speakingRate === 0.75
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.6)]'
                    : 'bg-slate-800 text-amber-200 hover:bg-slate-700'
                }`}
              >
                🐢 اسمعها بالراحة (0.75x)
              </button>
            </div>

            {/* Cognitive Hint Box */}
            <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3.5 text-right">
              <p className="text-xs font-bold text-amber-300">💡 سر التفكير بالإنجليزي</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-100">
                {currentCard.thinkingHintAr}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Self-Grading Buttons (Shown after flipping) */}
      <div className="mt-5">
        {!isFlipped ? (
          <button
            type="button"
            onClick={handleFlip}
            className="w-full rounded-2xl bg-emerald-500 py-3.5 text-base font-extrabold text-slate-950 shadow-[0_6px_24px_rgba(16,185,129,0.3)] transition hover:bg-emerald-400"
          >
            اكشف الإجابة واسمع النطق
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleGrade('review')}
              className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-200 transition hover:bg-rose-500/25"
            >
              🔄 محتاج أراجعها
            </button>
            <button
              type="button"
              onClick={() => handleGrade('good')}
              className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-3 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-500/25"
            >
              👍 فهمت الفكرة (+10)
            </button>
            <button
              type="button"
              onClick={() => handleGrade('easy')}
              className="rounded-2xl border border-emerald-400/50 bg-emerald-500/20 px-3 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/30"
            >
              ⚡ سهلة وثبتت (+15)
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
