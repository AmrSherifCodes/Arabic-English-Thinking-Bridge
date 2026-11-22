import React, { useState } from 'react';
import { CefrLevelId, PhaseId, ProgressionState, LessonNode } from '../../progression/types';
import { generateCapstoneLesson, generatePhaseMasteryCheck } from '../../progression/cefrHierarchy';
import { X, Crown, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CapstoneRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelId?: CefrLevelId;
  phaseId?: PhaseId;
  state: ProgressionState;
  onCompleteCapstone: (targetId: string, passed: boolean, score: number) => void;
  isArabic?: boolean;
}

export function CapstoneRunnerModal({
  isOpen,
  onClose,
  levelId,
  phaseId,
  state,
  onCompleteCapstone,
  isArabic = true,
}: CapstoneRunnerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ passed: boolean; score: number; xp: number } | null>(null);

  if (!isOpen) return null;

  const targetId = levelId || phaseId || 'A1';
  const isLevelCapstone = !!levelId;

  const testLesson: LessonNode = isLevelCapstone
    ? generateCapstoneLesson(levelId as CefrLevelId)
    : generatePhaseMasteryCheck(phaseId as PhaseId);

  const exercises = testLesson.exercises;
  const currentEx = exercises[currentIndex];
  const passingScorePct = isLevelCapstone ? 75 : 70;

  const handleOptionSelect = (option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      let correctCount = 0;
      exercises.forEach((ex, idx) => {
        const userAns = (selectedAnswers[idx] || '').trim().toLowerCase();
        const targetAns = ex.targetSentence.trim().toLowerCase();
        if (userAns === targetAns || ex.acceptableAlternatives?.some((a) => a.trim().toLowerCase() === userAns)) {
          correctCount++;
        }
      });

      const pct = Math.round((correctCount / exercises.length) * 100);
      const passed = pct >= passingScorePct;
      const xp = passed ? (isLevelCapstone ? 150 : 75) : 25;

      if (passed) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }

      setResult({ passed, score: pct, xp });
    }
  };

  const handleFinish = () => {
    if (result) {
      onCompleteCapstone(targetId, result.passed, result.score);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[85dvh]"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/70">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? testLesson.titleAr : testLesson.titleEn}
                </h3>
                <p className="text-xs text-stone-400">
                  {result
                    ? isArabic ? 'نتيجة الاختبار' : 'Exam Result'
                    : isArabic ? `السؤال ${currentIndex + 1} من ${exercises.length} (درجة الاجتياز ${passingScorePct}%)` : `Question ${currentIndex + 1} of ${exercises.length} (Pass score ${passingScorePct}%)`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!result ? (
            <>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-stone-800">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                />
              </div>

              {/* Question Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold text-amber-300 bg-amber-500/15 rounded-lg mb-2">
                    {isArabic ? currentEx.promptAr : currentEx.promptEn}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {isArabic ? currentEx.explanationAr : currentEx.explanationEn}
                  </h4>
                </div>

                {/* Multiple choice chips */}
                <div className="space-y-3">
                  {(currentEx.wordChips || [
                    currentEx.targetSentence,
                    currentEx.acceptableAlternatives?.[0] || 'I practice English.',
                    'She is practicing daily.',
                    'They have practiced yesterday.',
                  ]).map((opt, i) => {
                    const isSelected = selectedAnswers[currentIndex] === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(opt)}
                        className={`w-full text-right p-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/30'
                            : 'bg-stone-800/40 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white disabled:opacity-30 transition-all flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{isArabic ? 'السابق' : 'Previous'}</span>
                </button>

                <button
                  disabled={!selectedAnswers[currentIndex]}
                  onClick={handleNext}
                  className="px-6 py-3 text-sm font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <span>{currentIndex === exercises.length - 1 ? (isArabic ? 'إنهاء وحساب النتيجة' : 'Submit Exam') : (isArabic ? 'التالي' : 'Next')}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Exam Results Display */
            <div className="p-6 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl mx-auto ${
                  result.passed
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 shadow-amber-500/20'
                    : 'bg-gradient-to-tr from-red-500 to-rose-400 text-white shadow-red-500/20'
                }`}
              >
                {result.passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {result.passed
                    ? isArabic ? 'تهانينا! تم اجتياز الاختبار بنجاح 🎉' : 'Congratulations! Passed! 🎉'
                    : isArabic ? 'لم تتجاوز نسبة الاجتياز، حاول مجدداً ✍️' : 'Did not reach passing score. Try again!'}
                </h3>
                <p className="text-sm text-stone-400 mt-1">
                  {isArabic
                    ? `درجتك: ${result.score}% (الحد الأدنى: ${passingScorePct}%) · المكافأة: +${result.xp} XP`
                    : `Score: ${result.score}% (Required: ${passingScorePct}%) · Reward: +${result.xp} XP`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-800 text-xs text-stone-300 max-w-md text-right leading-relaxed">
                {result.passed
                  ? isArabic
                    ? `تم فتح المرحلة/المستوى التالي بنجاح في مسارك التعليمي. حافظ على استمرارية التفكير والتدريب اليومي!`
                    : `Next phase/level successfully unlocked in your cognitive progression!`
                  : isArabic
                  ? `يمكنك مراجعة الدروس السابقة ومحاولة الاختبار مرة أخرى في أي وقت.`
                  : `Review prior lessons and retake the assessment anytime.`}
              </div>

              <button
                onClick={handleFinish}
                className={`w-full max-w-sm py-3.5 text-sm font-bold rounded-2xl transition-all shadow-lg ${
                  result.passed
                    ? 'text-stone-900 bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
                    : 'text-white bg-stone-800 hover:bg-stone-700 shadow-stone-800/20'
                }`}
              >
                {isArabic ? 'العودة إلى مسار التعلم' : 'Return to Path'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
