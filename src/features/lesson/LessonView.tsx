import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Sparkles, AlertCircle, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Exercise, Lesson, Phase, UserProfile, UserProgress } from '../../types';
import { PHASES_DATA } from '../../data/lessons';
import { checkAnswerMatch, diagnoseArabicInterference } from '../../utils/transferLogic';
import { speakWithRate } from '../../utils/audio';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS, CHUNK_COLORS, CHUNK_LABELS } from '../../components/uiConstants';

export interface LessonViewProps {
  profile: UserProfile | null;
  progress: UserProgress;
  updateAndSaveProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onBack: () => void;
  onToast: (msg: string) => void;
  preferredVoice?: string;
}

export function LessonView({
  profile,
  progress,
  updateAndSaveProgress,
  onBack,
  onToast,
  preferredVoice
}: LessonViewProps) {
  // Find first incomplete lesson or default to phase 1, lesson 1
  const allLessons = PHASES_DATA.flatMap(p => p.lessons);
  const firstIncomplete = allLessons.find(l => !progress.completedLessonIds.includes(l.id)) || allLessons[0];

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(firstIncomplete);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const [revealed, setRevealed] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const exercise: Exercise | undefined = activeLesson?.exercises[exerciseIndex];

  useEffect(() => {
    setInput('');
    setStatus('idle');
    setFeedback('');
    setRevealed(false);
    inputRef.current?.focus();
  }, [activeLesson?.id, exerciseIndex]);

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setExerciseIndex(0);
  };

  const handleChipClick = (word: string) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
    if (status === 'correct') return;
    setInput(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${word}` : word;
    });
    inputRef.current?.focus();
  };

  const handleCheck = () => {
    if (!exercise || !activeLesson || !input.trim() || status === 'correct') return;
    const currentLesson = activeLesson;

    const match = checkAnswerMatch(input, exercise);
    if (match.isCorrect) {
      setStatus('correct');
      setFeedback('Excellent! Thought translated accurately.');
      speakWithRate(match.matchedTarget || exercise.englishTarget, 1, preferredVoice);

      updateAndSaveProgress(prev => {
        const nextExIds = prev.completedExerciseIds.includes(exercise.id)
          ? prev.completedExerciseIds
          : [...prev.completedExerciseIds, exercise.id];

        const isLessonDone = currentLesson.exercises.every(ex => nextExIds.includes(ex.id));
        const nextLessonIds = isLessonDone && !prev.completedLessonIds.includes(currentLesson.id)
          ? [...prev.completedLessonIds, currentLesson.id]
          : prev.completedLessonIds;

        return {
          ...prev,
          completedExerciseIds: nextExIds,
          completedLessonIds: nextLessonIds,
          score: prev.score + 10,
          completedExerciseCount: (prev.completedExerciseCount || 0) + 1
        };
      });
    } else {
      setStatus('incorrect');
      const diagnosis = diagnoseArabicInterference(input, exercise);
      setFeedback(diagnosis);
    }
  };

  const handleNextExercise = () => {
    if (!activeLesson) return;
    if (exerciseIndex < activeLesson.exercises.length - 1) {
      setExerciseIndex(prev => prev + 1);
    } else {
      onToast(`🎉 Completed lesson: ${activeLesson.title}!`);
      // Find next incomplete lesson
      const nextIdx = allLessons.findIndex(l => l.id === activeLesson.id) + 1;
      if (nextIdx < allLessons.length) {
        setActiveLesson(allLessons[nextIdx]);
        setExerciseIndex(0);
      } else {
        setActiveLesson(null); // Back to syllabus
      }
    }
  };

  const handleAudioPlay = () => {
    if (!exercise) return;
    speakWithRate(exercise.englishTarget, 1, preferredVoice);
  };

  // Syllabus / Overview mode
  if (!activeLesson || !exercise) {
    return (
      <div className="min-h-dvh bg-stone-950 text-stone-100 p-4 sm:p-6 pb-20">
        <header className="max-w-2xl mx-auto flex items-center justify-between mb-6">
          <button type="button" onClick={onBack} className={BTN_GHOST}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Home
          </button>
          <h1 className="text-lg font-bold text-stone-200">Curriculum Syllabus</h1>
          <div className="w-16" />
        </header>

        <div className="max-w-2xl mx-auto space-y-6">
          {PHASES_DATA.map((phase: Phase) => (
            <div key={phase.id} className="space-y-3">
              <div className="border-b border-stone-800 pb-2">
                <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">
                  Phase {phase.id} • {phase.level}
                </span>
                <h2 className="text-xl font-black text-stone-100">{phase.title}</h2>
                <p className="text-xs text-stone-400">{phase.tagline}</p>
              </div>

              <div className="grid gap-2.5">
                {phase.lessons.map(lesson => {
                  const isComplete = progress.completedLessonIds.includes(lesson.id);
                  const completedCount = lesson.exercises.filter(ex => progress.completedExerciseIds.includes(ex.id)).length;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => handleSelectLesson(lesson)}
                      className={`${CARD_CLASS} text-left flex items-center justify-between p-3.5 hover:border-teal-500/50 transition cursor-pointer`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-400">Lesson {lesson.number}</span>
                          {isComplete && (
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-stone-200 mt-0.5">{lesson.title}</h3>
                        <p className="text-xs text-stone-400" dir="rtl">{lesson.titleAr}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-stone-400">
                          {completedCount}/{lesson.exercises.length}
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-500 ml-2 inline" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Exercise mode
  return (
    <div className="min-h-dvh bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6 pb-12">
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between mb-4">
        <button type="button" onClick={() => setActiveLesson(null)} className={BTN_GHOST}>
          <BookOpen className="w-4 h-4 mr-1.5" />
          Syllabus
        </button>
        <div className="text-center">
          <div className="text-xs font-bold text-teal-400">
            Lesson {activeLesson.number} • Exercise {exerciseIndex + 1}/{activeLesson.exercises.length}
          </div>
          <div className="text-xs text-stone-400 truncate max-w-[200px]">
            {activeLesson.title}
          </div>
        </div>
        <button type="button" onClick={onBack} className={BTN_GHOST}>
          Exit
        </button>
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center space-y-5">
        {/* Arabic Thought Card */}
        <section className={`${CARD_CLASS} p-5 border-stone-800 text-center relative overflow-hidden`}>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Arabic Thought (فكّر بالمعنى)
          </div>
          <div dir="rtl" className="ar text-2xl sm:text-3xl font-black text-amber-300 leading-relaxed mb-1">
            {exercise.arabicThought}
          </div>
          {exercise.arabicContext && (
            <div dir="rtl" className="ar text-xs text-stone-400 mt-1">
              Context: {exercise.arabicContext}
            </div>
          )}
          <button
            type="button"
            onClick={handleAudioPlay}
            aria-label="Listen to model English pronunciation"
            className="absolute top-3 right-3 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </section>

        {/* Translation Input Area */}
        <section className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (status === 'correct' || revealed) {
                    handleNextExercise();
                  } else {
                    handleCheck();
                  }
                }
              }}
              placeholder="Express this in English..."
              className="w-full rounded-2xl border border-stone-700 bg-stone-900/90 px-4 py-3.5 text-base text-stone-100 placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Word Chips */}
          {exercise.wordChips && exercise.wordChips.length > 0 && status !== 'correct' && (
            <div className="flex flex-wrap gap-2 pt-1">
              {exercise.wordChips.map((chip, idx) => (
                <button
                  key={`${chip}-${idx}`}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:border-teal-500 hover:text-white hover:bg-stone-800 transition active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Actions & Feedback */}
          {status === 'idle' && !revealed && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCheck}
                disabled={!input.trim()}
                className={`${BTN_PRIMARY} flex-1`}
              >
                Check Answer
              </button>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className={`${BTN_GHOST} text-xs`}
              >
                Peek Answer
              </button>
            </div>
          )}

          {status === 'incorrect' && !revealed && (
            <div className="space-y-3 pt-1">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-200 leading-relaxed">
                  {feedback}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  className={`${BTN_PRIMARY} flex-1`}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className={`${BTN_GHOST} text-xs`}
                >
                  Reveal
                </button>
              </div>
            </div>
          )}

          {(status === 'correct' || revealed) && (
            <div className="space-y-4 pt-1">
              <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-teal-300">
                    {status === 'correct' ? 'Target Matched (+10 pts)' : 'Model Translation'}
                  </div>
                  <div className="text-sm font-semibold text-stone-100 mt-0.5">
                    {exercise.englishTarget}
                  </div>
                </div>
              </div>

              {/* Color-Coded Structural Breakdown */}
              {exercise.breakdownChunks && exercise.breakdownChunks.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Structural Blueprint (التركيب العقلي)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {exercise.breakdownChunks.map((chunk, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-2.5 ${CHUNK_COLORS[chunk.role] || 'bg-stone-900 border border-stone-800'}`}
                      >
                        <div dir="rtl" className="ar text-xs font-bold text-stone-200">
                          {chunk.arabicText}
                        </div>
                        <div dir="ltr" className="text-xs font-semibold text-stone-100 mt-0.5">
                          {chunk.englishText}
                        </div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">
                          {CHUNK_LABELS[chunk.role] || chunk.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Habit Tip */}
              {exercise.habitHint && (
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-300 leading-relaxed">{exercise.habitHint}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextExercise}
                className={`${BTN_PRIMARY} w-full flex items-center justify-center gap-1.5`}
              >
                {exerciseIndex < activeLesson.exercises.length - 1 ? (
                  <>
                    Next Exercise
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Finish Lesson
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}