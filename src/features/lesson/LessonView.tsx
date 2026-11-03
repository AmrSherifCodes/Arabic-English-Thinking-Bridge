import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Volume2, Sparkles, AlertCircle, CheckCircle2, ChevronRight, BookOpen, Star, Youtube, HelpCircle } from 'lucide-react';
import { TabTutorialModal } from '../../components/TabTutorialModal';
import { Exercise, Lesson, Phase, UserProfile, UserProgress, SourceLanguage, TargetLanguage } from '../../types';
import { getCurriculum } from '../../data/curriculumRegistry';
import { checkAnswerMatch, diagnoseArabicInterference } from '../../utils/transferLogic';
import { applyHabitWin, applyHabitMistakeWithShield } from '../../utils/habitPsychology';
import { speakWithRate } from '../../utils/audio';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS, CHUNK_COLORS, CHUNK_LABELS, FlashcardItemData } from '../../components/uiConstants';
import { getLessonRelevanceScore } from '../../utils/adaptiveCurriculum';
import { getArabicPhoneticSpelling } from '../../utils/arabicPhonetics';
import { JapaneseFuriganaText, JapaneseModeToggle, JapaneseDisplayMode } from '../../components/JapaneseFuriganaText';

export interface LessonViewProps {
  profile: UserProfile | null;
  progress: UserProgress;
  updateAndSaveProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onBack: () => void;
  onToast: (msg: string) => void;
  preferredVoice?: string;
  onAskAIAboutCard?: (card: FlashcardItemData) => void;
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
}

export function LessonView({
  profile,
  progress,
  updateAndSaveProgress,
  onBack,
  onToast,
  preferredVoice,
  onAskAIAboutCard,
  sourceLang = 'ar',
  targetLang = 'en'
}: LessonViewProps) {
  const source: SourceLanguage = sourceLang || profile?.sourceLanguage || (profile?.language === 'arabic' ? 'ar' : 'en');
  const target: TargetLanguage = targetLang || profile?.targetLanguage || 'en';
  const isJapanese = target === 'ja';
  const isGerman = target === 'de';

  const [japaneseMode, setJapaneseMode] = useState<JapaneseDisplayMode>('furigana');

  const phases = useMemo(() => getCurriculum(source, target), [source, target]);
  const allLessons = useMemo(() => phases.flatMap(p => p.lessons), [phases]);

  // Find first incomplete lesson or default to phase 1, lesson 1
  const firstIncomplete = allLessons.find(l => !progress.completedLessonIds.includes(l.id)) || allLessons[0];

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(firstIncomplete);
  const [showGuide, setShowGuide] = useState(false);
  const [syllabusFilter, setSyllabusFilter] = useState<'all' | 'recommended' | 1 | 2 | 3>('all');
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const [revealed, setRevealed] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync active lesson when language pair changes
  useEffect(() => {
    const nextFirst = allLessons.find(l => !progress.completedLessonIds.includes(l.id)) || allLessons[0];
    setActiveLesson(nextFirst);
    setExerciseIndex(0);
  }, [source, target, allLessons]);

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
    const todayKey = new Date().toISOString().split('T')[0];

    const match = checkAnswerMatch(input, exercise);
    if (match.isCorrect) {
      setStatus('correct');
      setFeedback('Excellent! Thought translated accurately.');
      speakWithRate(match.matchedTarget || exercise.targetSentence || exercise.englishTarget, 1, preferredVoice);

      updateAndSaveProgress(prev => {
        const habitTransition = applyHabitWin(prev, 10, todayKey);
        const baseNext = habitTransition.nextProgress;

        const nextExIds = prev.completedExerciseIds.includes(exercise.id)
          ? prev.completedExerciseIds
          : [...prev.completedExerciseIds, exercise.id];

        const isLessonDone = currentLesson.exercises.every(ex => nextExIds.includes(ex.id));
        const nextLessonIds = isLessonDone && !prev.completedLessonIds.includes(currentLesson.id)
          ? [...prev.completedLessonIds, currentLesson.id]
          : prev.completedLessonIds;

        const prevReviewCount = prev.reviewHistory?.[todayKey] || 0;

        return {
          ...baseNext,
          completedExerciseIds: nextExIds,
          completedLessonIds: nextLessonIds,
          completedExerciseCount: (prev.completedExerciseCount || 0) + 1,
          lastActiveDate: todayKey,
          reviewHistory: {
            ...(prev.reviewHistory || {}),
            [todayKey]: prevReviewCount + 1
          }
        };
      });

      if (Capacitor.isNativePlatform()) {
        try {
          Haptics.impact({ style: ImpactStyle.Light });
        } catch {}
      }
    } else {
      setStatus('incorrect');
      const diagnosis = diagnoseArabicInterference(input, exercise);
      setFeedback(diagnosis);

      updateAndSaveProgress(prev => {
        const shielded = applyHabitMistakeWithShield(prev);
        const weakKey = currentLesson.weakSpotTag || 'general';
        const nextWeakSpots = {
          ...prev.weakSpotCounts,
          [weakKey]: (prev.weakSpotCounts?.[weakKey] || 0) + 1
        };

        if (shielded.shieldUsed) {
          onToast('🛡️ Streak Shield protected your streak!');
        }

        return {
          ...shielded.nextProgress,
          weakSpotCounts: nextWeakSpots
        };
      });
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
    const targetSpoken = exercise.targetSentence || exercise.englishTarget;
    speakWithRate(targetSpoken, 1, preferredVoice);
  };

  // Syllabus / Overview mode
  if (!activeLesson || !exercise) {
    const isArabic = source === 'ar';
    const goalLabel = profile?.goal || 'General';

    // Filter phases based on user preference
    const filteredPhases = phases.filter(phase => {
      if (typeof syllabusFilter === 'number') {
        return phase.id === syllabusFilter;
      }
      return true;
    }).map(phase => {
      if (syllabusFilter === 'recommended' && profile) {
        return {
          ...phase,
          lessons: phase.lessons.filter(l => getLessonRelevanceScore(l, profile) >= 8)
        };
      }
      return phase;
    }).filter(phase => phase.lessons.length > 0);

    return (
      <div className="min-h-dvh bg-stone-950 text-stone-100 p-4 sm:p-6 pb-20">
        <header className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <button type="button" onClick={onBack} className={BTN_GHOST}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {isArabic ? 'الرئيسية' : 'Home'}
          </button>
          <h1 className="text-lg font-bold text-stone-200">
            {isArabic ? 'خطة المنهج التفاعلي' : 'Curriculum Syllabus'}
          </h1>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1 transition"
            aria-label="How lessons work"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>{isArabic ? 'دليل الدروس' : 'Guide'}</span>
          </button>
        </header>

        {/* Adaptive Goal & Level Filter Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>{isArabic ? 'تخصيص الدروس حسب هدفك ومستواك:' : 'Customize lessons for your goal & level:'}</span>
            {profile?.goal && (
              <span className="font-semibold text-teal-400">
                🎯 {profile.goal}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSyllabusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                syllabusFilter === 'all'
                  ? 'bg-teal-500 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-700'
              }`}
            >
              {isArabic ? 'جميع الدروس' : 'All Lessons'}
            </button>
            <button
              type="button"
              onClick={() => setSyllabusFilter('recommended')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                syllabusFilter === 'recommended'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900 text-amber-300 border border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{isArabic ? `⭐ موصى به لهدفي (${goalLabel})` : `⭐ Recommended for My Goal (${goalLabel})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setSyllabusFilter(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                syllabusFilter === 1
                  ? 'bg-teal-500 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-700'
              }`}
            >
              Phase 1 (A1-A2)
            </button>
            <button
              type="button"
              onClick={() => setSyllabusFilter(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                syllabusFilter === 2
                  ? 'bg-teal-500 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-700'
              }`}
            >
              Phase 2 (B1-B2)
            </button>
            <button
              type="button"
              onClick={() => setSyllabusFilter(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                syllabusFilter === 3
                  ? 'bg-teal-500 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-700'
              }`}
            >
              Phase 3 (C1)
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {filteredPhases.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-stone-800 bg-stone-900/50">
              <p className="text-stone-400 text-sm">
                {isArabic ? 'لا توجد دروس تطابق هذا الفلتر حالياً.' : 'No lessons match this filter.'}
              </p>
              <button
                type="button"
                onClick={() => setSyllabusFilter('all')}
                className="mt-3 px-4 py-2 rounded-xl bg-teal-500 text-stone-950 font-bold text-xs"
              >
                {isArabic ? 'عرض جميع الدروس' : 'Show All Lessons'}
              </button>
            </div>
          ) : (
            filteredPhases.map((phase: Phase) => (
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
                    const relevance = profile ? getLessonRelevanceScore(lesson, profile) : 5;
                    const isRecommended = relevance >= 8;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson)}
                        className={`${CARD_CLASS} text-left flex items-center justify-between p-3.5 hover:border-teal-500/50 transition cursor-pointer ${
                          isRecommended ? 'border-amber-500/40 bg-stone-900/90' : ''
                        }`}
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-stone-400">Lesson {lesson.number}</span>
                            {isRecommended && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current text-amber-400" />
                                {isArabic ? 'موصى به لهدفك' : 'Recommended for your goal'}
                              </span>
                            )}
                            {isComplete && (
                              <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
                                {isArabic ? 'مكتمل' : 'Completed'}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-stone-200 mt-1">{lesson.title}</h3>
                          <p className="text-xs text-stone-400" dir="rtl">{lesson.titleAr}</p>
                        </div>
                        <div className="text-right shrink-0">
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
            ))
          )}

          {/* Amr Sherif Creator Footer */}
          <footer className="mt-10 pt-6 border-t border-stone-800 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-stone-900 border border-stone-800 text-xs text-stone-400 mb-2">
              <span>Crafted by Amr Sherif</span>
              <span className="text-stone-600">•</span>
              <a
                href="https://www.youtube.com/@SciAmrSherif?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1 transition"
              >
                <Youtube className="w-3.5 h-3.5 fill-current" />
                <span>YouTube @SciAmrSherif</span>
              </a>
              <span className="text-stone-600">•</span>
              <a
                href="https://github.com/AmrSherifCodes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-white transition"
              >
                GitHub
              </a>
            </div>
            <p className="text-[11px] text-stone-500">
              {isArabic
                ? 'جسر التفكير · مجاني بالكامل وبدون إعلانات · صُمم لكسر عادات الترجمة الحرفية'
                : 'Thinking Bridge · 100% Free · No Ads · Designed to bridge native Arabic thinking to English'}
            </p>
          </footer>
        </div>
        <TabTutorialModal
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
          language={isArabic ? 'arabic' : 'english'}
          initialTab="lesson"
        />
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
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-white transition"
            title="How lessons work"
            aria-label="How lessons work"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button type="button" onClick={onBack} className={BTN_GHOST}>
            Exit
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center space-y-5">
        {/* Thought Card */}
        <section className={`${CARD_CLASS} p-5 border-stone-800 text-center relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {source === 'ar' ? 'فكرة التحول الذهني (فكّر بالمعنى):' : 'Mental Thought Concept:'}
            </span>
            {isJapanese && (
              <JapaneseModeToggle mode={japaneseMode} onChange={setJapaneseMode} />
            )}
          </div>
          <div dir={source === 'ar' ? 'rtl' : 'ltr'} className={`text-2xl sm:text-3xl font-black text-amber-300 leading-relaxed mb-1 ${source === 'ar' ? 'ar' : ''}`}>
            {source === 'ar' ? exercise.arabicThought : (exercise.sourceThought || exercise.arabicThought)}
          </div>
          {exercise.arabicContext && (
            <div dir={source === 'ar' ? 'rtl' : 'ltr'} className="text-xs text-stone-400 mt-1">
              Context: {exercise.arabicContext}
            </div>
          )}
          <button
            type="button"
            onClick={handleAudioPlay}
            aria-label="Listen to model pronunciation"
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
                <div className="flex-1">
                  <div className="text-xs font-bold text-teal-300">
                    {status === 'correct' ? 'Target Matched (+10 pts)' : 'Model Translation'}
                  </div>
                  <div className="text-sm font-semibold text-stone-100 mt-0.5">
                    {isJapanese ? (
                      <JapaneseFuriganaText
                        kanjiText={exercise.targetSentence || exercise.englishTarget}
                        furiganaHtml={exercise.furiganaTarget}
                        romajiText={exercise.romajiTarget}
                        displayMode={japaneseMode}
                      />
                    ) : (
                      exercise.targetSentence || exercise.englishTarget
                    )}
                  </div>
                  {/* Arabic Literal Phonetic Pronunciation (for English target) */}
                  {target === 'en' && (
                    <div className="mt-1.5 text-xs text-teal-400/90 font-medium flex items-center gap-1.5" dir="rtl">
                      <span className="text-stone-400 text-[11px]">النطق الصوتي بالعربي:</span>
                      <span className="font-bold text-teal-200 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-800">
                        {getArabicPhoneticSpelling(exercise.englishTarget)}
                      </span>
                    </div>
                  )}
                  {isJapanese && exercise.romajiTarget && (
                    <div className="mt-1.5 text-xs text-teal-300 font-mono">
                      Romaji: {exercise.romajiTarget}
                    </div>
                  )}
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
                        <div dir={source === 'ar' ? 'rtl' : 'ltr'} className={`text-xs font-bold text-stone-200 ${source === 'ar' ? 'ar' : ''}`}>
                          {chunk.sourceText || (source === 'ar' ? chunk.arabicText : chunk.englishText)}
                        </div>
                        <div dir="ltr" className="text-xs font-semibold text-stone-100 mt-0.5">
                          {chunk.targetText || chunk.englishText}
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

              {onAskAIAboutCard && (
                <button
                  type="button"
                  onClick={() => onAskAIAboutCard({ ar: exercise.arabicThought, en: exercise.englishTarget, breakdownChunks: null, nextReviewDate: Date.now() })}
                  className={`${BTN_GHOST} w-full text-xs py-2`}
                >
                  ✨ Ask AI Tutor about this sentence
                </button>
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

      <TabTutorialModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        language={profile?.language === 'arabic' ? 'arabic' : 'english'}
        initialTab="lesson"
      />
    </div>
  );
}
