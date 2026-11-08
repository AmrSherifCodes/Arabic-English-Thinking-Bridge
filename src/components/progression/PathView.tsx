import React, { useEffect, useMemo, useState } from 'react';
import { ProgressionState, StageNode, LessonNode } from '../../progression/types';
import { buildCourseStructure, isLessonUnlocked, isStageUnlocked } from '../../progression/courseData';
import { getTargetDictionary, getTargetDictionaryAsync } from '../../data/dictionaries';
import { Play, Crown, LockKeyhole, Star, Mic, Layers } from 'lucide-react';
import { TargetLanguage } from '../../types';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface PathViewProps {
  state: ProgressionState;
  targetLang: TargetLanguage;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  onOpenVoice?: () => void;
  onOpenFlashcards?: () => void;
  isArabic?: boolean;
}

export function PathView({
  state,
  targetLang,
  onSelectLesson,
  onSelectUnitCheckpoint,
  onOpenVoice,
  onOpenFlashcards,
  isArabic = true,
}: PathViewProps) {
  const [dictionaryVersion, setDictionaryVersion] = useState(0);
  const [isIdle, setIsIdle] = useState(false);

  // Dictionaries are lazy-loaded per target language. The localized course is
  // generated from that dictionary, so bump a version once it is ready to force
  // the zig-zag path to rebuild for the newly selected language.
  useEffect(() => {
    let cancelled = false;
    if (getTargetDictionary(targetLang).length > 0) return;
    void getTargetDictionaryAsync(targetLang).then(() => {
      if (!cancelled) setDictionaryVersion((version) => version + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [targetLang]);

  const courseStructure: StageNode[] = useMemo(
    () => buildCourseStructure(targetLang),
    [targetLang, dictionaryVersion]
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 5000);
    };

    resetIdle();
    window.addEventListener('touchstart', resetIdle, { passive: true });
    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    window.addEventListener('scroll', resetIdle, { passive: true });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('scroll', resetIdle);
    };
  }, []);

  const currentStageNode = courseStructure.find((s) => s.stage === state.currentStage) || courseStructure[0];
  const continueStageNode = currentStageNode;
  // The first stage is always reachable; this keeps the path usable after a
  // language swap even if the persisted current stage is not present yet.
  const isContinueStageUnlocked =
    continueStageNode.stage === courseStructure[0]?.stage ||
    isStageUnlocked(state, continueStageNode.stage, targetLang);

  const stageLessons = useMemo(() => {
    return continueStageNode.units.flatMap((u) => u.lessons);
  }, [continueStageNode]);

  const currentLessonId = useMemo(() => {
    return stageLessons.find((l) => !state.completedLessonIds.includes(l.id))?.id;
  }, [stageLessons, state.completedLessonIds]);

  return (
    <div className="relative space-y-6 max-w-[480px] mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Big Continue CTA */}
      <div className="p-4.5 rounded-3xl bg-surface border border-border shadow-xl flex items-center justify-between">
        <div className="space-y-1 text-start">
          <span className="text-[10px] font-black uppercase tracking-wider text-success block">
            {isArabic
              ? `المرحلة الحالية: ${continueStageNode.stage === 'A2' ? 'A2 (جسر B1)' : continueStageNode.stage}`
              : `Current Stage: ${continueStageNode.stage === 'A2' ? 'A2 (B1 Bridge)' : continueStageNode.stage}`}
          </span>
          <h3 className="text-sm font-black text-text">
            {isArabic ? continueStageNode.titleAr : continueStageNode.titleEn}
          </h3>
          <p className="text-xs text-muted">
            {isArabic ? 'تابع مسار التفكير دون تردد' : 'Resume your cognitive path'}
          </p>
        </div>

        <button
          onClick={() => {
            const firstUnfinished =
              stageLessons.find((l) => !state.completedLessonIds.includes(l.id)) || stageLessons[0];
            if (firstUnfinished) onSelectLesson(firstUnfinished);
          }}
          className={`px-5 py-3 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0 relative ${
            isIdle ? 'ring-4 ring-primary ring-offset-2 ring-offset-surface animate-pulse' : ''
          }`}
        >
          {isIdle && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
              👇
            </span>
          )}
          <Play size={16} fill="currentColor" />
          <span>{isArabic ? 'متابعة' : 'Continue'}</span>
        </button>
      </div>

      {/* Candy-Crush Style True Zig-Zag Path */}
      {isContinueStageUnlocked ? (
        <div className="flex flex-col items-center gap-8 relative py-4 w-full">
          {stageLessons.map((lesson, idx) => {
            const crowns = state.lessonCrowns[lesson.id] || 0;
            const isCompleted = state.completedLessonIds.includes(lesson.id);
            const unlocked = isLessonUnlocked(state, lesson, targetLang);
            const isCurrent = currentLessonId === lesson.id;

            const alignClass =
              idx % 4 === 0 ? 'ml-16' :
              idx % 4 === 1 ? 'mr-8' :
              idx % 4 === 2 ? 'mr-16' :
              'ml-8';

            const buttonContent = (
              <button
                onClick={() => {
                  if (!isCompleted && unlocked) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                  }
                  onSelectLesson(lesson);
                }}
                type="button"
                disabled={!unlocked}
                aria-label={`${isArabic ? lesson.titleAr : lesson.titleEn}${unlocked ? '' : isArabic ? ' — مقفول، أكمل الدرس السابق لفتحه' : ' — locked, complete the previous lesson to unlock'}`}
                className={`btn-shiny group relative flex flex-col items-center justify-center transition transform ${
                  unlocked ? 'active:scale-90' : 'cursor-not-allowed opacity-55'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-10 animate-bounce bg-surface border border-primary text-text px-3 py-1 rounded-xl shadow-lg z-10 text-[10px] font-black pointer-events-none whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-primary">
                    {isArabic ? 'أنت هنا' : 'You are here'}
                  </div>
                )}
                {crowns > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-black shadow-md flex items-center gap-0.5 z-10">
                    <Crown size={10} fill="currentColor" />
                    <span>{crowns}</span>
                  </span>
                )}

                <div
                  className={`w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center shadow-lg transition-all ${
                    isCompleted
                      ? 'bg-success text-on-primary border-success/80'
                      : isCurrent
                      ? 'bg-primary text-on-primary border-primary-dark ring-4 ring-primary/40 shadow-primary/50'
                      : unlocked
                      ? 'bg-surface border-border text-text hover:bg-surface-2'
                      : 'bg-surface-2 border-border/50 text-muted grayscale'
                  }`}
                >
                  {isCompleted ? (
                    <Star fill="currentColor" className="w-8 h-8 drop-shadow-md" />
                  ) : !unlocked ? (
                    <LockKeyhole className="w-6 h-6" />
                  ) : (
                    <span className="text-2xl font-black">{idx + 1}</span>
                  )}
                </div>
                {unlocked && (
                  <span className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm whitespace-nowrap max-w-[120px] truncate ${
                    isCompleted ? 'bg-success/10 text-success' : 'bg-surface border border-border text-text'
                  }`}>
                    {isArabic ? lesson.titleAr : lesson.titleEn}
                  </span>
                )}
              </button>
            );

            if (isCurrent) {
              return (
                <motion.div
                  key={lesson.id}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`relative flex justify-center ${alignClass}`}
                >
                  {buttonContent}
                </motion.div>
              );
            }

            return (
              <div key={lesson.id} className={`relative flex justify-center ${alignClass}`}>
                {buttonContent}
              </div>
            );
          })}

          {/* Feature Node 1: Voice Tutor (Purple) */}
          {(() => {
            const voiceIdx = stageLessons.length;
            const alignClass =
              voiceIdx % 4 === 0 ? 'ml-16' :
              voiceIdx % 4 === 1 ? 'mr-8' :
              voiceIdx % 4 === 2 ? 'mr-16' :
              'ml-8';

            return (
              <div key="feature-voice-node" className={`relative flex justify-center ${alignClass}`}>
                <button
                  onClick={() => onOpenVoice?.()}
                  type="button"
                  aria-label={isArabic ? 'المعلم الصوتي' : 'Voice Tutor'}
                  className="btn-shiny group relative flex flex-col items-center justify-center transition transform active:scale-90"
                >
                  <div className="w-20 h-20 rounded-full border-b-[6px] bg-purple-600 border-purple-800 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:bg-purple-500 transition-all">
                    <Mic className="w-8 h-8" />
                  </div>
                  <span className="mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-sm whitespace-nowrap">
                    {isArabic ? 'المعلم الصوتي' : 'Voice Tutor'}
                  </span>
                </button>
              </div>
            );
          })()}

          {/* Feature Node 2: Anki Flashcards (Amber) */}
          {(() => {
            const flashcardsIdx = stageLessons.length + 1;
            const alignClass =
              flashcardsIdx % 4 === 0 ? 'ml-16' :
              flashcardsIdx % 4 === 1 ? 'mr-8' :
              flashcardsIdx % 4 === 2 ? 'mr-16' :
              'ml-8';

            return (
              <div key="feature-flashcards-node" className={`relative flex justify-center ${alignClass}`}>
                <button
                  onClick={() => onOpenFlashcards?.()}
                  type="button"
                  aria-label={isArabic ? 'بطاقات أنكي' : 'Anki Flashcards'}
                  className="btn-shiny group relative flex flex-col items-center justify-center transition transform active:scale-90"
                >
                  <div className="w-20 h-20 rounded-full border-b-[6px] bg-amber-500 border-amber-700 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-all">
                    <Layers className="w-8 h-8" />
                  </div>
                  <span className="mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm whitespace-nowrap">
                    {isArabic ? 'بطاقات أنكي' : 'Anki Flashcards'}
                  </span>
                </button>
              </div>
            );
          })()}
        </div>
      ) : (
        <div role="status" className="p-4 rounded-2xl bg-surface border border-border text-center space-y-1 mt-4">
          <LockKeyhole className="mx-auto text-muted" size={20} aria-hidden="true" />
          <p className="text-sm font-black text-text">
            {isArabic ? `${continueStageNode.stage} مقفولة حالياً` : `${continueStageNode.stage} is locked`}
          </p>
        </div>
      )}
    </div>
  );
}

export default PathView;