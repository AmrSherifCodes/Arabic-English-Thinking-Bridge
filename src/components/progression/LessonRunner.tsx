import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LessonNode, ExerciseItem } from '../../progression/types';
import { CheckCircle2, XCircle, ArrowRight, Zap, Timer, Sparkles } from 'lucide-react';
import { computeNextHintWord } from '../../utils/habitPsychology';
import { soundFX } from '../../utils/soundFX';

interface LessonRunnerProps {
  lesson: LessonNode;
  onCompleteSession: (earnedXp: number, accuracyPercent: number) => void;
  onClose: () => void;
  isArabic?: boolean;
}

export function LessonRunner({
  lesson,
  onCompleteSession,
  onClose,
  isArabic = true,
}: LessonRunnerProps) {
  const exercises = lesson.exercises;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Automaticity Timer Tracking (Reflex Speed in Seconds)
  const exerciseStartTimeRef = useRef<number>(Date.now());
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([]);

  const [autoHintPill, setAutoHintPill] = useState<string | null>(null);

  const currentExercise: ExerciseItem = exercises[currentIndex] || exercises[0];
  const isJapaneseExercise = /[\u3040-\u30ff\u3400-\u9fff]/u.test(currentExercise.targetSentence);

  useEffect(() => {
    const rawOptions = currentExercise.options && currentExercise.options.length > 0
      ? currentExercise.options
      : currentExercise.wordChips && currentExercise.wordChips.length > 0
      ? currentExercise.wordChips
      : currentExercise.targetSentence ? currentExercise.targetSentence.split(/\s+/) : [];

    const options = [...rawOptions];
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }
    setShuffledOptions(options);
  }, [currentExercise.id, currentIndex]);

  useEffect(() => {
    exerciseStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const triggerAutoHelper = useCallback(() => {
    if (isAnswered || showSummary) return;

    const targetSentence = currentExercise.targetSentence || '';

    const normalizeAnswer = (value: string) => {
      const normalized = value.toLowerCase().replace(/['".,?!。、「」]/g, '');
      return normalized.trim().replace(/\s+/g, ' ');
    };

    if (currentExercise.type === 'structure_builder') {
      const currentChoice = selectedChips.join(' ');

      // If already correct, don't show hint
      if (normalizeAnswer(currentChoice) === normalizeAnswer(targetSentence)) return;

      const { nextWord } = computeNextHintWord(targetSentence, currentChoice);

      // Try to find nextWord in available options that hasn't been selected yet
      let candidateOption = (currentExercise.options || []).find(
        (opt) => opt.toLowerCase() === (nextWord || '').toLowerCase() && !selectedChips.includes(opt)
      );

      // Smart Fallback: If currentChoice didn't match prefix, find first target token not yet in selectedChips
      if (!candidateOption) {
        const targetTokens = currentExercise.wordChips || targetSentence.replace(/[.,?!]/g, '').split(/\s+/).filter(Boolean);
        for (const token of targetTokens) {
          const opt = (currentExercise.options || []).find(
            (o) => o.toLowerCase() === token.toLowerCase() && !selectedChips.includes(o)
          );
          if (opt) {
            candidateOption = opt;
            break;
          }
        }
      }

      if (candidateOption) {
        setSelectedChips((prev) => [...prev, candidateOption!]);
        setAutoHintPill(
          isArabic
            ? `💡 تلميح: أضفنا "${candidateOption}" إلى إجابتك`
            : `💡 Hint: Added "${candidateOption}" to your answer`
        );
      }
    } else {
      if (normalizeAnswer(userInput) === normalizeAnswer(targetSentence)) return;
      const { nextWord, prefixToKeep } = computeNextHintWord(targetSentence, userInput);
      if (nextWord) {
        const updatedInput = prefixToKeep ? `${prefixToKeep} ${nextWord}` : nextWord;
        setUserInput(updatedInput);
        setAutoHintPill(
          isArabic
            ? `💡 تلميح: أضفنا "${nextWord}" إلى إجابتك`
            : `💡 Hint: Added "${nextWord}" to your answer`
        );
      }
    }
  }, [isAnswered, showSummary, currentExercise, selectedChips, userInput, isArabic]);

  // Dismiss the manual-hint confirmation after 2.5s.
  useEffect(() => {
    if (autoHintPill) {
      const t = window.setTimeout(() => setAutoHintPill(null), 2500);
      return () => window.clearTimeout(t);
    }
  }, [autoHintPill]);

  const handleCheckAnswer = () => {
    if (isAnswered) return;

    const timeSpentMs = Math.max(1000, Date.now() - exerciseStartTimeRef.current);
    setResponseTimesMs((prev) => [...prev, timeSpentMs]);

    let userSentence = '';
    if (currentExercise.type === 'structure_builder') {
      userSentence = selectedChips.join(' ').trim();
    } else {
      userSentence = userInput.trim();
    }

    const normalizeAnswer = (value: string) => {
      const normalized = value.toLowerCase().replace(/['".,?!。、「」]/g, '');
      return isJapaneseExercise
        ? normalized.replace(/\s+/g, '')
        : normalized.trim().replace(/\s+/g, ' ');
    };
    const normUser = normalizeAnswer(userSentence);
    const normTarget = normalizeAnswer(currentExercise.targetSentence);

    const isMatch =
      normUser === normTarget ||
      (currentExercise.acceptableAlternatives || []).some(
        (alt) => normalizeAnswer(alt) === normUser
      );

    setIsCorrect(isMatch);
    if (isMatch) {
      soundFX.playComboChord(correctAnswersCount + 1);
      if ((correctAnswersCount + 1) % 5 === 0) {
        soundFX.playFanfare();
      }
    } else {
      soundFX.playError();
    }
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(isMatch ? [30, 40, 50] : [70]);
      }
    } catch {}
    setAutoHintPill(null); // Clear any active hint
    setIsAnswered(true);

    if (isMatch) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextExercise = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedChips([]);
    setUserInput('');
    setAutoHintPill(null);

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  if (showSummary) {
    const accuracy = Math.round((correctAnswersCount / exercises.length) * 100);
    const totalTimeMs = responseTimesMs.reduce((a, b) => a + b, 0);
    const avgSecPerExercise = responseTimesMs.length > 0
      ? Number((totalTimeMs / responseTimesMs.length / 1000).toFixed(1))
      : 0;

    let automaticityTierAr = '⚡ طلاقة فورية بدون ترجمة!';
    let automaticityTierEn = '⚡ Instant Reflexes!';
    if (avgSecPerExercise > 8 || accuracy < 70) {
      automaticityTierAr = '💡 سرعة جيدة مع حاجة للمزيد من الممارسة';
      automaticityTierEn = '💡 Good speed, keep practicing!';
    }

    const earnedXp = Math.round((correctAnswersCount * 10) + (accuracy > 80 ? 20 : 0));

    return (
      <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="w-full h-full sm:h-[88vh] sm:max-w-[480px] sm:rounded-3xl bg-bg border border-border shadow-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="space-y-6 w-full max-w-sm">
            <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center text-4xl mx-auto shadow-2xl">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-text">
                {isArabic ? 'درس مكتمل بنجاح! 🎉' : 'Lesson Completed! 🎉'}
              </h2>
              <p className="text-xs text-muted">
                {isArabic ? lesson.titleAr : lesson.titleEn}
              </p>
            </div>

            {/* Reward Summary Card */}
            <div className="p-4 rounded-3xl bg-surface border border-border grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-surface-2">
                <span className="text-xl font-black text-success block">+{earnedXp} XP</span>
                <span className="text-[10px] text-muted font-bold">{isArabic ? 'نقاط مكتسبة' : 'Earned XP'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-2">
                <span className="text-xl font-black text-primary block">{accuracy}%</span>
                <span className="text-[10px] text-muted font-bold">{isArabic ? 'نسبة الدقة' : 'Accuracy'}</span>
              </div>
            </div>

            {/* Automaticity Reflex Meter Card */}
            <div className="p-3.5 rounded-2xl bg-surface-2 border border-border flex items-center justify-between text-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-success/20 text-success">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">
                    {isArabic ? 'معدل سرعة التفكير والبديهة' : 'Cognitive Reflex Speed'}
                  </span>
                  <span className="text-xs font-black text-text">
                    {isArabic ? automaticityTierAr : automaticityTierEn}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-success dir-ltr">
                {avgSecPerExercise}s/ex
              </span>
            </div>

            <button
              onClick={() => {
                onCompleteSession(earnedXp, accuracy);
                onClose();
              }}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-base transition active:scale-95 shadow-lg"
            >
              {isArabic ? 'استمرار والعودة للمسار 🚀' : 'Continue to Path 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / exercises.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full h-[100dvh] flex flex-col sm:h-auto sm:max-h-[90vh] sm:max-w-[480px] sm:rounded-3xl bg-bg border border-border shadow-2xl overflow-hidden relative">
        {/* Top Header Progress Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-surface/50">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-surface-2 text-muted hover:text-text font-bold transition"
            aria-label={isArabic ? 'إغلاق' : 'Close'}
          >
            ✕
          </button>
          <div className="flex-1 bg-surface-2 h-3 rounded-full overflow-hidden border border-border">
            <div
              className="bg-success h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-muted">
            <Timer size={14} className="text-primary" />
            <span>{currentIndex + 1}/{exercises.length}</span>
          </div>
        </div>

        {/* Exercise Body */}
        <motion.div
          key={currentIndex}
          animate={isAnswered && isCorrect
            ? { scale: [1, 1.02, 1], boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }
            : { scale: 1, boxShadow: '0 0 0 rgba(16, 185, 129, 0)' }}
          transition={{ duration: 0.4 }}
          className={`flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-6 relative transition-all duration-300 ${
            isAnswered && isCorrect ? 'ring-4 ring-success/50 rounded-2xl' : ''
          }`}
        >
          {isAnswered && isCorrect && (
            <motion.div
              key={`xp-${currentIndex}`}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              aria-live="polite"
              className="pointer-events-none absolute end-5 top-6 z-10 rounded-full border border-success/40 bg-success/20 px-3 py-1 text-sm font-black text-success"
            >
              +10 XP
            </motion.div>
          )}

          {/* Manual hint confirmation */}
          {autoHintPill && (
            <div className="p-3 rounded-2xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center gap-2 animate-bounce shadow-md">
              <Sparkles size={16} className="shrink-0" />
              <span>{autoHintPill}</span>
            </div>
          )}

          {/* Manual hint button */}
          {!isAnswered && (
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-surface border border-border">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Sparkles size={18} className="text-primary shrink-0" />
                <span className="flex-1 text-[10px] font-bold text-muted">
                  {isArabic ? 'خذ وقتك، لا تنتقل إلا عندما تكون مستعداً' : 'Take your time; continue when you are ready'}
                </span>
              </div>

              <button
                type="button"
                onClick={triggerAutoHelper}
                className="px-3 py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition active:scale-95 shrink-0"
              >
                {isArabic ? '💡 تلميح الآن' : '💡 Hint Now'}
              </button>
            </div>
          )}

          {/* Source Thought Prompt */}
          <div className="p-4 rounded-3xl bg-surface border border-border space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-success block">
              {isArabic ? 'عَبّر عن الفكرة بترتيب اللغة المستهدفة:' : 'Express the thought in the target language:'}
            </span>
            <h2 className="text-lg font-black text-text" dir="auto">
              "{isArabic ? currentExercise.promptAr : currentExercise.promptEn}"
            </h2>
          </div>

          {/* Structure Builder / Word Chips Mode */}
          {currentExercise.type === 'structure_builder' && (
            <div className="space-y-4">
              {/* Selected Chips Slot (Strict LTR direction & left alignment for English/German target sentence building) */}
              <div
                dir="ltr"
                style={{ direction: 'ltr', textAlign: 'left', justifyContent: 'flex-start' }}
                className="p-4 rounded-2xl bg-surface-2 border border-border min-h-[72px] flex flex-wrap flex-row items-center gap-2"
              >
                {selectedChips.length === 0 ? (
                  <span className="text-xs text-muted font-bold" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic ? 'اضغط الكلمات أدناه للترتيب الصحيح' : 'Tap words below to arrange'}
                  </span>
                ) : (
                  selectedChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isAnswered) {
                          setSelectedChips((prev) => prev.filter((_, i) => i !== idx));
                        }
                      }}
                      dir="ltr"
                      className="px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 font-black text-sm active:scale-95 shadow-sm"
                    >
                      {chip}
                    </button>
                  ))
                )}
              </div>

              {/* Available Word Chips Bank */}
              <div className="flex flex-wrap gap-2 justify-center pt-2" dir="ltr">
                {shuffledOptions.map((chip, idx) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={idx}
                      disabled={isSelected || isAnswered}
                      data-testid="word-chip"
                      data-word={chip}
                      onClick={() => {
                        soundFX.playChipSelect();
                        setSelectedChips((prev) => [...prev, chip]);
                      }}
                      dir="ltr"
                      className={`px-4 py-2.5 min-h-[48px] rounded-xl font-bold text-sm transition ${
                        isSelected
                          ? 'opacity-30 bg-surface border border-border text-muted'
                          : 'bg-surface border border-border text-text hover:bg-surface-2 active:scale-95 shadow-sm'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text Input Mode */}
          {currentExercise.type !== 'structure_builder' && (
            <div className="space-y-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isAnswered}
                dir="ltr"
                placeholder={isArabic ? 'اكتب الجملة باللغة المستهدفة هنا...' : 'Type the sentence in the target language...'}
                className="w-full p-4 rounded-2xl bg-surface-2 border border-border text-text text-base font-bold placeholder:text-muted focus:outline-none focus:border-success min-h-[100px] resize-none"
              />
            </div>
          )}

          {/* Rule Explanation "WHY" Feedback Card */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-start ${
                isCorrect
                  ? 'bg-success/15 border-success text-text animate-pulse'
                  : 'bg-danger/15 border-danger text-text'
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="text-success" size={20} />
                    <span>{isArabic ? 'إجابة ممتازة وبناء صحيح! 🎉' : 'Great Job! Perfect Structure! 🎉'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-danger" size={20} />
                    <span>{isArabic ? 'إجابة تحتاج تعديل بسيط' : 'Needs adjustment'}</span>
                  </>
                )}
              </div>

              <p className="text-xs font-semibold text-text-soft leading-relaxed mt-1" dir={isArabic ? 'rtl' : 'ltr'}>
                <strong>{isArabic ? 'الجملة الصحيحة:' : 'Target:'}</strong>{' '}
                <span dir="ltr" className="font-bold text-text">{currentExercise.targetSentence}</span>
              </p>

              {currentExercise.explanationAr && (
                <p className="text-xs text-muted mt-2 border-t border-border/50 pt-2 leading-relaxed" dir={isArabic ? 'rtl' : 'ltr'}>
                  💡 <strong>{isArabic ? 'سبب القاعدة:' : 'Rule Explanation:'}</strong>{' '}
                  {isArabic ? currentExercise.explanationAr : currentExercise.explanationEn}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Sticky Bottom Action Bar */}
        <div className="sticky bottom-0 bg-surface p-4 border-t border-border z-10 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              disabled={
                currentExercise.type === 'structure_builder'
                  ? selectedChips.length === 0
                  : !userInput.trim()
              }
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-base transition disabled:opacity-40 disabled:bg-surface-2 disabled:text-muted disabled:cursor-not-allowed shadow-lg active:scale-95"
            >
              {isArabic ? 'تحقق من البناء 🚀' : 'Check Structure 🚀'}
            </button>
          ) : (
            <button
              onClick={handleNextExercise}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-success text-on-primary font-black text-base transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isArabic ? 'السؤال التالي' : 'Next Question'}</span>
              <ArrowRight size={20} className={isArabic ? 'rotate-180' : ''} />
            </button>
          )}
        </div>

        {showExitConfirm && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 text-center space-y-4 shadow-2xl">
              <h3 className="text-base font-black text-text">
                {isArabic ? 'إنهاء الدرس؟' : 'Leave the lesson?'}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {isArabic
                  ? 'سيتم فقدان تقدمك في هذا الدرس. هل تريد الخروج؟'
                  : 'Your progress in this lesson will be lost. Leave anyway?'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm transition active:scale-95"
                >
                  {isArabic ? 'متابعة التعلم' : 'Keep learning'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 min-h-[48px] rounded-2xl bg-surface-2 border border-border text-text font-black text-sm transition active:scale-95"
                >
                  {isArabic ? 'خروج' : 'Leave'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
