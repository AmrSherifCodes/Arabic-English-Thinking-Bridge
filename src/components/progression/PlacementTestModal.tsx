import React, { useState } from 'react';
import { CefrLevelId, PhaseId, ProgressionState } from '../../progression/types';
import { generatePlacementTest, getAllHierarchicalLessons } from '../../progression/cefrHierarchy';
import { X, Compass, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProgressionState;
  onCompletePlacement: (levelId: CefrLevelId, phaseId: PhaseId, score: number) => void;
  isArabic?: boolean;
}

export function PlacementTestModal({
  isOpen,
  onClose,
  state,
  onCompletePlacement,
  isArabic = true,
}: PlacementTestModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [testResult, setTestResult] = useState<{ levelId: CefrLevelId; phaseId: PhaseId; score: number } | null>(null);

  if (!isOpen) return null;

  const testLesson = generatePlacementTest();
  const exercises = testLesson.exercises;
  const currentEx = exercises[currentIndex];

  const handleOptionSelect = (option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate placement result
      let correctCount = 0;
      exercises.forEach((ex, idx) => {
        const userAns = (selectedAnswers[idx] || '').trim().toLowerCase();
        const targetAns = ex.targetSentence.trim().toLowerCase();
        if (userAns === targetAns || ex.acceptableAlternatives?.some((a) => a.trim().toLowerCase() === userAns)) {
          correctCount++;
        }
      });

      const pct = Math.round((correctCount / exercises.length) * 100);
      let levelId: CefrLevelId = 'A1';
      let phaseId: PhaseId = 'A1.1';

      if (pct >= 85) {
        levelId = 'C1';
        phaseId = 'C1.1';
      } else if (pct >= 70) {
        levelId = 'B2';
        phaseId = 'B2.1';
      } else if (pct >= 50) {
        levelId = 'B1';
        phaseId = 'B1.1';
      } else if (pct >= 30) {
        levelId = 'A2';
        phaseId = 'A2.1';
      } else {
        levelId = 'A1';
        phaseId = 'A1.1';
      }

      setTestResult({ levelId, phaseId, score: pct });
    }
  };

  const handleApplyResult = () => {
    if (testResult) {
      onCompletePlacement(testResult.levelId, testResult.phaseId, testResult.score);
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
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? 'اختبار تحديد المستوى التكيفي (CEFR)' : 'Adaptive CEFR Placement Test'}
                </h3>
                <p className="text-xs text-stone-400">
                  {testResult
                    ? isArabic ? 'نتيجة التقييم التكيفي' : 'Placement Evaluation Result'
                    : isArabic ? `السؤال ${currentIndex + 1} من ${exercises.length}` : `Question ${currentIndex + 1} of ${exercises.length}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!testResult ? (
            <>
              {/* Progress Line */}
              <div className="w-full h-1.5 bg-stone-800">
                <div
                  className="h-full bg-teal-400 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                />
              </div>

              {/* Question Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold text-teal-300 bg-teal-500/15 rounded-lg mb-2">
                    {isArabic ? currentEx.promptAr : currentEx.promptEn}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {isArabic ? currentEx.explanationAr : currentEx.explanationEn}
                  </h4>
                </div>

                {/* Multiple choice chips or target selection */}
                <div className="space-y-3">
                  {(currentEx.wordChips || currentEx.options || [
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
                            ? 'bg-teal-500/20 border-teal-400 text-teal-200 ring-1 ring-teal-400/30'
                            : 'bg-stone-800/40 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />}
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
                  className="px-6 py-3 text-sm font-bold text-stone-900 bg-teal-400 hover:bg-teal-300 disabled:opacity-40 rounded-2xl transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                >
                  <span>{currentIndex === exercises.length - 1 ? (isArabic ? 'إنهاء التقييم' : 'Finish Placement') : (isArabic ? 'التالي' : 'Next')}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Results Display */
            <div className="p-6 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-stone-950 shadow-xl shadow-teal-500/20 mx-auto">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {isArabic ? `المستوى المحدد: ${testResult.levelId}` : `Assigned Level: ${testResult.levelId}`}
                </h3>
                <p className="text-sm text-stone-400 mt-1">
                  {isArabic ? `المرحلة البدائية: ${testResult.phaseId} · الدقة: ${testResult.score}%` : `Starting Phase: ${testResult.phaseId} · Score: ${testResult.score}%`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-800 text-xs text-stone-300 max-w-md text-right leading-relaxed">
                {isArabic
                  ? `تم تحديد مستواك بناءً على إجاباتك بنجاح. تم فتح المحتوى الخاص بـ ${testResult.levelId} وجميع المستويات السابقة متوفرة للمراجعة.`
                  : `Your starting CEFR level has been configured to ${testResult.levelId}. All prior modules are unlocked for quick review.`}
              </div>

              <button
                onClick={handleApplyResult}
                className="w-full max-w-sm py-3.5 text-sm font-bold text-stone-900 bg-teal-400 hover:bg-teal-300 rounded-2xl transition-all shadow-lg shadow-teal-500/20"
              >
                {isArabic ? 'بدء التعلم في مستواك الجديد' : 'Start Learning at New Level'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
