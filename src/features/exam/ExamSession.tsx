/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React, { useState } from 'react';
import { TargetLang } from './types';
import { useExamSession } from './hooks/useExamSession';
import { MetroProgress } from './components/MetroProgress';
import { TeaCups } from './components/TeaCups';
import { QuestionCard } from './components/QuestionCard';
import { Confetti } from './components/Confetti';
import { ExamResultScreen } from './ExamResultScreen';

interface ExamSessionProps {
  targetLang: TargetLang;
  isPlacementMode: boolean;
  supporterMode: boolean;
  onExit: () => void;
}

export const ExamSession: React.FC<ExamSessionProps> = ({
  targetLang,
  isPlacementMode,
  supporterMode,
  onExit,
}) => {
  const {
    state,
    currentQuestion,
    answerQuestion,
    skipQuestion,
    restartSession,
    result,
  } = useExamSession(targetLang, isPlacementMode, supporterMode);

  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);

  const handleAnswer = (selectedOptionIndex: number) => {
    if (!currentQuestion) return;

    const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;
    if (isCorrect && supporterMode) {
      setTriggerConfetti(true);
    }

    // Check if level increases on this answer
    if (isCorrect && state.consecutiveCorrect >= 1) {
      setShowLevelUpToast(true);
      setTimeout(() => setShowLevelUpToast(false), 2500);
    }

    answerQuestion(selectedOptionIndex);
  };

  if (state.isFinished && result) {
    return (
      <ExamResultScreen
        result={result}
        supporterMode={supporterMode}
        onRetry={restartSession}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 p-4 font-arabic">
      {/* Confetti Animation */}
      <Confetti
        trigger={triggerConfetti}
        onComplete={() => setTriggerConfetti(false)}
      />

      {/* Top Header Bar (Exit, Streak, Tea Cups) */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-stone-300 px-2">
        <button
          onClick={onExit}
          className="text-stone-400 hover:text-stone-200 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800"
        >
          ✕ إنهاء
        </button>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
            سلسلة: {state.currentStreak} 🔥
          </span>
          <TeaCups teaCups={state.teaCups} supporterMode={supporterMode} />
        </div>
      </div>

      {/* Metro Line Progress */}
      <MetroProgress
        answeredCount={state.answered.length}
        supporterMode={supporterMode}
      />

      {/* Level Up Toast Notification with Neutral Cairo Skyline Backdrop */}
      {showLevelUpToast && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold px-6 py-3 rounded-2xl shadow-xl animate-bounce flex items-center gap-2">
          {/* Neutral Cairo Skyline SVG Silhouette */}
          <svg
            className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-15 pointer-events-none fill-stone-950"
            viewBox="0 0 500 100"
            preserveAspectRatio="none"
          >
            <path d="M0,100 L0,70 L20,70 L20,40 L30,20 L40,40 L40,70 L80,70 L80,50 L100,20 L120,50 L120,70 L200,70 L200,30 L220,10 L240,30 L240,70 L300,70 L320,45 L340,70 L400,70 L420,35 L440,70 L500,70 L500,100 Z" />
          </svg>
          <span className="text-xl">📈</span>
          <span>طلعت مستوى يا باشا! كمل</span>
        </div>
      )}

      {/* Question Card */}
      {currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          onSkip={skipQuestion}
          supporterMode={supporterMode}
        />
      ) : (
        <div className="p-8 text-center text-stone-400 font-arabic">
          جاري تجهيز الأسئلة...
        </div>
      )}
    </div>
  );
};
