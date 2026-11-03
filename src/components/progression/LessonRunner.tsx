import React, { useState } from 'react';
import { LessonNode, ExerciseItem } from '../../progression/types';
import { CheckCircle2, XCircle, ArrowRight, Volume2, Mic, Sparkles, Award } from 'lucide-react';
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
      // Finished all exercises! Show summary
      setShowSummary(true);
    }
  };

  if (showSummary) {
    const accuracy = Math.round((correctAnswersCount / exercises.length) * 100);
    const earnedXp = Math.round((correctAnswersCount * 10) + (accuracy > 80 ? 20 : 0));

    return (
      <div className="fixed inset-0 z-50 bg-[#0A0E13] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="space-y-6 w-full">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-4xl mx-auto shadow-2xl">
            🏆
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">
              {isArabic ? 'درس مكتمل بنجاح! 🎉' : 'Lesson Completed! 🎉'}
            </h2>
            <p className="text-xs text-stone-400">
              {isArabic ? lesson.titleAr : lesson.titleEn}
            </p>
          </div>

          {/* Reward Summary Card */}
          <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-stone-950">
              <span className="text-xl font-black text-teal-400 block">+{earnedXp} XP</span>
              <span className="text-[10px] text-stone-400 font-bold">{isArabic ? 'نقاط مكتسبة' : 'Earned XP'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950">
              <span className="text-xl font-black text-amber-400 block">{accuracy}%</span>
              <span className="text-[10px] text-stone-400 font-bold">{isArabic ? 'نسبة الدقة' : 'Accuracy'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onCompleteSession(earnedXp, accuracy);
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-teal-400 text-stone-950 font-black text-sm transition hover:bg-teal-300 active:scale-95 shadow-lg"
          >
            {isArabic ? 'استمرار والعودة للمسار 🚀' : 'Continue to Path 🚀'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E13] flex flex-col justify-between p-4 max-w-md mx-auto" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Header Progress Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button onClick={onClose} className="text-stone-400 hover:text-white font-bold text-xs">
          ✕
        </button>

        <div className="flex-1 h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
          <div
            className="h-full bg-teal-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>

        <span className="text-xs font-black text-teal-400">
          {currentIndex + 1}/{exercises.length}
        </span>
      </div>

      {/* Main Exercise Content Body */}
      <div className="flex-1 flex flex-col justify-center space-y-6 my-auto">
        {/* Prompt Header */}
        <div className="space-y-2 text-start bg-stone-900/80 p-4 rounded-3xl border border-stone-800">
          <span className="text-[10px] font-black uppercase text-teal-400 block">
            {isArabic ? 'عبر عن الفكرة بتركيب إنجليزي صحيح:' : 'Translate the cognitive thought:'}
          </span>
          <h3 className="text-lg font-black text-white">
            "{currentExercise.promptAr}"
          </h3>
        </div>

        {/* Structure Builder (Word Chips) */}
        {currentExercise.type === 'structure_builder' ? (
          <div className="space-y-4">
            {/* Selected Chips Output Zone */}
            <div className="min-h-[56px] p-3 rounded-2xl bg-stone-950 border border-stone-800 flex flex-wrap gap-2 items-center">
              {selectedChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChips(selectedChips.filter((_, i) => i !== idx))}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs animate-in zoom-in-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Available Word Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {(currentExercise.wordChips || []).map((chip, idx) => {
                const countUsed = selectedChips.filter((c) => c === chip).length;
                const countAvailable = (currentExercise.wordChips || []).filter((c) => c === chip).length;
                const isDisabled = countUsed >= countAvailable;

                return (
                  <button
                    key={idx}
                    disabled={isDisabled}
                    onClick={() => setSelectedChips([...selectedChips, chip])}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-black transition ${
                      isDisabled
                        ? 'opacity-30 border-stone-800 bg-stone-950 text-stone-600'
                        : 'bg-stone-900 border-stone-700 text-stone-100 hover:border-teal-400 active:scale-95'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Text Input Mode */
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isArabic ? 'اكتب الجملة بالإنجليزية هنا...' : 'Type English sentence here...'}
            className="w-full p-4 rounded-2xl bg-stone-950 border border-stone-800 text-white font-bold text-sm focus:border-teal-400 focus:outline-none"
          />
        )}

        {/* Answer Feedback Card */}
        {isAnswered && (
          <div
            className={`p-4 rounded-3xl border space-y-2 text-start animate-in slide-in-from-bottom-2 ${
              isCorrect
                ? 'bg-teal-950/60 border-teal-500 text-teal-200'
                : 'bg-red-950/60 border-red-500 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} className="text-teal-400" />
                  <span>{isArabic ? 'إجابة ممتازة وبناء صحيح! 🎉' : 'Correct Structure! 🎉'}</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-400" />
                  <span>{isArabic ? 'لاحظ البناء الصحيح:' : 'Correct Structure:'}</span>
                </>
              )}
            </div>

            <p className="text-xs font-bold text-white">
              "{currentExercise.targetSentence}"
            </p>

            <p className="text-[11px] text-stone-300 leading-relaxed border-t border-stone-800/80 pt-1.5">
              💡 <strong>{isArabic ? 'سبب القاعدة:' : 'Rule WHY:'}</strong> {currentExercise.explanationAr}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="pb-4">
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={currentExercise.type === 'structure_builder' ? selectedChips.length === 0 : !userInput.trim()}
            className="w-full py-4 rounded-2xl bg-teal-400 text-stone-950 font-black text-sm transition hover:bg-teal-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-lg"
          >
            {isArabic ? 'تحقق من البناء 🎯' : 'Check Structure 🎯'}
          </button>
        ) : (
          <button
            onClick={handleNextExercise}
            className="w-full py-4 rounded-2xl bg-teal-400 text-stone-950 font-black text-sm transition hover:bg-teal-300 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <span>{isArabic ? 'السؤال التالي' : 'Next Question'}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
