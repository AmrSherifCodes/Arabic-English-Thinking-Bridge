/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React, { useState, useEffect } from 'react';
import { Volume2, Forward } from 'lucide-react';
import { ExamQuestion } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { ExplanationPanel } from './ExplanationPanel';

interface QuestionCardProps {
  question: ExamQuestion;
  onAnswer: (selectedOptionIndex: number) => void;
  onSkip: () => void;
  supporterMode?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  onSkip,
  supporterMode = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { speak, isPlaying, isSupported } = useSpeech();

  useEffect(() => {
    setSelectedIndex(null);
    setShowExplanation(false);
    setHasSubmitted(false);
  }, [question.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < question.options.length) {
          setSelectedIndex(idx);
        }
      } else if (e.key === 'Enter' && selectedIndex !== null && !hasSubmitted) {
        setHasSubmitted(true);
        onAnswer(selectedIndex);
      } else if (e.key === ' ' && question.audioText) {
        e.preventDefault();
        speak(question.audioText, question.lang);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, selectedIndex, hasSubmitted, onAnswer, speak]);

  const handleSelectOption = (index: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    if (selectedIndex === null || hasSubmitted) return;
    setHasSubmitted(true);
    onAnswer(selectedIndex);
  };

  return (
    <div
      className={`w-full max-w-xl bg-stone-900/95 border rounded-3xl p-6 shadow-2xl backdrop-blur-xl font-arabic flex flex-col gap-5 text-right transition-all ${
        supporterMode
          ? 'border-amber-500/40 shadow-[0_0_20px_rgba(212,169,74,0.15)]'
          : 'border-stone-800'
      }`}
      data-supporter={supporterMode ? 'true' : undefined}
    >
      {/* Skill & CEFR Badge */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <button
          onClick={onSkip}
          aria-label="عدّي · Skip Question"
          className="flex items-center gap-1 text-xs text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 px-3.5 py-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Forward className="w-4 h-4" />
          <span>عدّي · Skip</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-stone-800 text-stone-200 font-mono font-bold">
            {question.cefr}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
            {question.skill === 'grammar' && 'قواعد · Grammar'}
            {question.skill === 'vocabulary' && 'مفردات · Vocab'}
            {question.skill === 'reading' && 'قراءة · Reading'}
            {question.skill === 'listening' && 'استماع · Listening'}
          </span>
        </div>
      </div>

      {/* Egyptian Prompt */}
      <h3 className="text-lg font-bold text-amber-300 leading-snug">{question.promptArz}</h3>

      {/* Listening Audio Button */}
      {question.skill === 'listening' && question.audioText && (
        <div className="my-1 flex flex-col items-center gap-2 p-4 bg-stone-950/80 rounded-2xl border border-stone-800">
          <button
            onClick={() => speak(question.audioText!, question.lang)}
            aria-label="شغّل الصوت · Play Audio"
            className={`min-h-[50px] flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-teal-300 ${
              isPlaying
                ? 'bg-amber-400 text-stone-950 animate-pulse'
                : 'bg-teal-500 hover:bg-teal-400 text-stone-950'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>{isPlaying ? 'جاري التشغيل... · Playing' : 'شغّل الصوت 🔊 · Play Audio'}</span>
          </button>
          {!isSupported && (
            <span className="text-xs text-amber-300/90 font-arabic">
              الصوت مش متاح على الجهاز — بس السؤال شغال
            </span>
          )}
        </div>
      )}

      {/* Stem / Sentence */}
      <div
        className="p-5 bg-stone-950/90 rounded-2xl border border-stone-800 text-left font-sans dir-ltr text-xl text-stone-100 font-bold leading-relaxed tracking-wide shadow-inner"
        dir="ltr"
      >
        {question.stem}
      </div>

      {/* Options List (Enlarged Touch Targets: Min 56px Height) */}
      <div className="flex flex-col gap-3 my-1">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = question.correctIndex === index;

          let btnStyle =
            'bg-stone-800/90 border-stone-700/80 text-stone-100 hover:bg-stone-800 hover:border-amber-400/60';

          if (hasSubmitted) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold ring-2 ring-emerald-400/50';
            } else if (isSelected) {
              btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 font-bold';
            } else {
              btnStyle = 'bg-stone-900/40 border-stone-850 text-stone-500 opacity-40';
            }
          } else if (isSelected) {
            btnStyle =
              'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-lg ring-2 ring-amber-400/60';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelectOption(index)}
              disabled={hasSubmitted}
              aria-label={`Option ${index + 1}: ${option}`}
              className={`w-full min-h-[56px] p-4 rounded-2xl border text-left font-sans text-lg transition-all flex items-center justify-between dir-ltr focus-visible:ring-2 focus-visible:ring-amber-300 ${btnStyle}`}
              dir="ltr"
            >
              <span className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-stone-950 flex items-center justify-center text-sm font-mono font-black text-amber-400 border border-stone-800">
                  {index + 1}
                </span>
                <span className="font-semibold">{option}</span>
              </span>
              {hasSubmitted && isCorrect && <span className="text-emerald-400 text-xl font-bold">✓</span>}
              {hasSubmitted && isSelected && !isCorrect && (
                <span className="text-rose-400 text-xl font-bold">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm Action Button (Sticky, 60px Height, High Contrast) */}
      {!hasSubmitted ? (
        <button
          onClick={handleConfirm}
          disabled={selectedIndex === null}
          aria-label="أكّد الإجابة · Confirm Answer"
          className={`w-full min-h-[60px] py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-teal-300 ${
            selectedIndex !== null
              ? 'bg-teal-400 hover:bg-teal-300 text-stone-950 active:scale-[0.99] cursor-pointer'
              : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
          }`}
        >
          <span>أكّد الإجابة (Enter)</span>
          <span className="text-xs font-sans opacity-80 font-normal">· Confirm</span>
        </button>
      ) : (
        <ExplanationPanel
          explanationArz={question.explanationArz}
          tags={question.tags}
          isOpen={showExplanation}
          onToggle={() => setShowExplanation((prev) => !prev)}
        />
      )}
    </div>
  );
};
