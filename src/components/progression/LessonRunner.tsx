import React, { useState } from 'react';
import { LessonNode, ExerciseItem } from '../../progression/types';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentExercise: ExerciseItem = exercises[currentIndex] || exercises[0];

  const handleCheckAnswer = () => {
    if (isAnswered) return;

    let userSentence = '';
    if (currentExercise.type === 'structure_builder') {
      userSentence = selectedChips.join(' ').trim();
    } else {
      userSentence = userInput.trim();
    }

    const normUser = userSentence.toLowerCase().replace(/['".,?!]/g, '').trim();
    const normTarget = currentExercise.targetSentence.toLowerCase().replace(/['".,?!]/g, '').trim();

    const isMatch =
      normUser === normTarget ||
      (currentExercise.acceptableAlternatives || []).some(
        (alt) => alt.toLowerCase().replace(/['".,?!]/g, '').trim() === normUser
      );

    setIsCorrect(isMatch);
    setIsAnswered(true);

    if (isMatch) {
      setCorrectAnswersCount((prev) => prev + 1);
      try {
        confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
  };

  const handleNextExercise = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedChips([]);
    setUserInput('');

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  if (showSummary) {
    const accuracy = Math.round((correctAnswersCount / exercises.length) * 100);
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
      <div className="w-full h-full sm:h-[88vh] sm:max-w-[480px] sm:rounded-3xl bg-bg border border-border shadow-2xl flex flex-col justify-between overflow-hidden relative">
        {/* Top Header Progress Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-surface/50">
          <button
            onClick={onClose}
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
          <span className="text-xs font-black text-muted">
            {currentIndex + 1}/{exercises.length}
          </span>
        </div>

        {/* Exercise Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Source Thought Prompt */}
          <div className="p-4 rounded-3xl bg-surface border border-border space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-success block">
              {isArabic ? 'عَبّر عن الفكرة بترتيب إنجليزي صحيح:' : 'Express thought in English:'}
            </span>
            <h2 className="text-lg font-black text-text" dir="auto">
              "{currentExercise.sourcePrompt}"
            </h2>
          </div>

          {/* Structure Builder / Word Chips Mode */}
          {currentExercise.type === 'structure_builder' && (
            <div className="space-y-4">
              {/* Selected Chips Slot */}
              <div className="p-4 rounded-2xl bg-surface-2 border border-border min-h-[72px] flex flex-wrap gap-2 items-center">
                {selectedChips.length === 0 ? (
                  <span className="text-xs text-muted font-bold">
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
                      className="px-3.5 py-2.5 rounded-xl bg-surface border border-border font-black text-sm text-text active:scale-95 shadow-sm"
                    >
                      {chip}
                    </button>
                  ))
                )}
              </div>

              {/* Available Word Chips Bank */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {(currentExercise.options || []).map((chip, idx) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={idx}
                      disabled={isSelected || isAnswered}
                      onClick={() => setSelectedChips((prev) => [...prev, chip])}
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
                placeholder={isArabic ? 'اكتب الجملة بالإنجليزية هنا...' : 'Type sentence in English...'}
                className="w-full p-4 rounded-2xl bg-surface-2 border border-border text-text text-base font-bold placeholder:text-muted focus:outline-none focus:border-success min-h-[100px] resize-none"
              />
            </div>
          )}

          {/* Rule Explanation "WHY" Feedback Card */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border ${
                isCorrect
                  ? 'bg-success/15 border-success text-text'
                  : 'bg-danger/15 border-danger text-text'
              }`}
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

              <p className="text-xs font-semibold text-text-soft leading-relaxed mt-1" dir="auto">
                <strong>{isArabic ? 'الجملة الصحيحة:' : 'Target:'}</strong>{' '}
                <span dir="ltr" className="font-bold">{currentExercise.targetSentence}</span>
              </p>

              {currentExercise.ruleExplanationAr && (
                <p className="text-xs text-muted mt-2 border-t border-border/50 pt-2" dir="auto">
                  💡 <strong>{isArabic ? 'سبب القاعدة:' : 'Rule Explanation:'}</strong>{' '}
                  {isArabic ? currentExercise.ruleExplanationAr : currentExercise.ruleExplanationEn}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-30">
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
      </div>
    </div>
  );
}
