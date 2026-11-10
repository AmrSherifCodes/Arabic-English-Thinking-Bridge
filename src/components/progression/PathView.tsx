import React, { useEffect, useMemo, useState } from 'react';
import { ProgressionState, StageNode, LessonNode } from '../../progression/types';
import { buildCourseStructure, isLessonUnlocked, isStageUnlocked } from '../../progression/courseData';
import { getTargetDictionary, getTargetDictionaryAsync } from '../../data/dictionaries';
import { Play, Crown, LockKeyhole, Star, Mic, Layers } from 'lucide-react';
import { TargetLanguage, UserProgress } from '../../types';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface PathViewProps {
  state: ProgressionState;
  targetLang: TargetLanguage;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  onOpenVoice?: () => void;
  onOpenFlashcards?: (deckId?: string) => void;
  isArabic?: boolean;
  progress?: UserProgress;
  flashcardDeckIds?: string[];
}

export function PathView({
  state,
  targetLang,
  onSelectLesson,
  onSelectUnitCheckpoint,
  onOpenVoice,
  onOpenFlashcards,
  isArabic = true,
  progress,
  flashcardDeckIds,
}: PathViewProps) {
  const [dictionaryVersion, setDictionaryVersion] = useState(0);
  const [isIdle, setIsIdle] = useState(false);

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

  const currentStageIndex = courseStructure.findIndex((s) => s.stage === state.currentStage);
  const safeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const continueStageNode = courseStructure[safeStageIndex] || courseStructure[0];

  const overallProgressPercent = Math.min(100, Math.round(((safeStageIndex + 1) / courseStructure.length) * 100));

  return (
    <div className="relative space-y-6 max-w-[480px] mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Alexandrian & Egyptian Friendly Welcome Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-emerald-950/40 to-amber-950/30 border border-teal-500/40 text-start flex items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-teal-300">
            <span>🌊</span>
            <span>{isArabic ? 'من إسكندرية لكل أهل مصر · سهولة وطلاقة' : 'Alexandrian Warmth & Ease'}</span>
          </div>
          <p className="text-[11px] text-stone-300 font-bold leading-snug truncate">
            {isArabic ? 'اتكلم وفكّر إنجليزي عالماشي ومن غير عقد!' : 'Think directly in English without internal translation!'}
          </p>
        </div>
        <span className="text-xl shrink-0">⚓</span>
      </div>

      {/* Top Progress Bar */}
      <div className="bg-surface border border-border p-3 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-muted">{isArabic ? '0% نحو C1' : '0% towards C1'}</span>
          <span className="text-xs font-bold text-primary">{overallProgressPercent}%</span>
          <span className="text-xs font-bold text-muted">{isArabic ? '100% القمة' : '100% Mastery'}</span>
        </div>
        <div className="h-3 rounded-full bg-surface-2 overflow-hidden border border-border relative">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000" style={{ width: `${overallProgressPercent}%` }} />
        </div>
      </div>

      {/* Top Big Continue CTA */}
      <div className="p-4.5 rounded-3xl bg-surface border border-border shadow-xl flex items-center justify-between">
        <div className="space-y-1 text-start">
          <span className="text-[10px] font-black uppercase tracking-wider text-success block">
            {isArabic
              ? `المرحلة الحالية: ${continueStageNode?.stage === 'A2' ? 'A2 (جسر B1)' : continueStageNode?.stage || 'Unknown'}`
              : `Current Stage: ${continueStageNode?.stage === 'A2' ? 'A2 (B1 Bridge)' : continueStageNode?.stage || 'Unknown'}`}
          </span>
          <h3 className="text-sm font-black text-text">
            {isArabic ? continueStageNode?.titleAr : continueStageNode?.titleEn}
          </h3>
          <p className="text-xs text-muted">
            {isArabic ? 'تابع مسار التفكير دون تردد' : 'Resume your cognitive path'}
          </p>
        </div>

        <button
          onClick={() => {
            if (!continueStageNode) return;
            const firstUnfinished =
              continueStageNode.units.flatMap(u => u.lessons).find((l) => !state.completedLessonIds.includes(l.id)) || continueStageNode.units.flatMap(u => u.lessons)[0];
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
      <div className="flex flex-col items-center gap-8 relative py-4 w-full">
        {(() => {
          let nodeIndex = 0;
          const alignFor = (index: number) =>
            index % 4 === 0 ? 'ml-16' :
            index % 4 === 1 ? 'mr-8' :
            index % 4 === 2 ? 'mr-16' :
            'ml-8';

          const nodes: React.ReactNode[] = [];

          courseStructure.forEach((stage, idx) => {
            const isCompleted = idx < safeStageIndex;
            const unlocked = idx <= safeStageIndex;
            const isCurrent = idx === safeStageIndex;

            const alignClass = alignFor(nodeIndex++);

            const buttonContent = (
              <div className="relative w-full flex flex-col items-center">
                {isCurrent && (
                  <div className="mb-2 animate-bounce bg-emerald-600 border border-emerald-400 text-white px-3 py-1 rounded-xl shadow-lg shadow-emerald-500/40 z-20 text-[11px] font-black pointer-events-none whitespace-nowrap">
                    📍 مكانك دلوقتي (المستوى {idx + 1} من 10)
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!isCompleted && unlocked) {
                      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    }
                    const firstUnfinished =
                      stage.units.flatMap(u => u.lessons).find((l) => !state.completedLessonIds.includes(l.id)) || stage.units.flatMap(u => u.lessons)[0];
                    if (firstUnfinished) onSelectLesson(firstUnfinished);
                  }}
                  type="button"
                  disabled={!unlocked}
                  aria-label={`${isArabic ? stage.titleAr : stage.titleEn}${unlocked ? '' : isArabic ? ' — مقفول، أكمل الدرس السابق لفتحه' : ' — locked, complete the previous lesson to unlock'}`}
                  className={`group relative flex flex-col items-center justify-center transition-transform rounded-full ${
                    unlocked ? 'active:scale-95' : 'cursor-not-allowed opacity-55'
                  }`}
                  style={{ borderRadius: '9999px', overflow: 'visible' }}
                >
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all overflow-visible ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40'
                        : unlocked
                        ? 'bg-surface border-2 border-border text-text hover:bg-surface-2'
                        : 'bg-surface-2 border-2 border-border/50 text-muted grayscale'
                    }`}
                    style={{
                      borderRadius: '9999px',
                      boxShadow: isCurrent ? '0 0 28px rgba(16, 185, 129, 0.45)' : undefined,
                    }}
                  >
                    {isCompleted ? (
                      <Star fill="currentColor" className="w-10 h-10 drop-shadow-md" />
                    ) : !unlocked ? (
                      <LockKeyhole className="w-8 h-8 opacity-50" />
                    ) : (
                      <span className="text-3xl font-black">{idx + 1}</span>
                    )}
                  </div>
                </button>

                {unlocked && (
                  <div className="mt-2.5 max-w-[220px] text-center flex flex-col items-center gap-1 z-10 px-1">
                    <span
                      className={`block text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl shadow-sm text-center leading-tight whitespace-normal ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-emerald-950/90 text-emerald-200 border-2 border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-surface border border-border text-text'
                      }`}
                    >
                      {isArabic ? `المستوى ${idx + 1}: ${stage.titleAr}` : `Level ${idx + 1}: ${stage.titleEn}`}
                    </span>
                  </div>
                )}
              </div>
            );

            nodes.push(
              isCurrent ? (
                <motion.div
                  key={stage.stage}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`relative flex justify-center w-full ${alignClass}`}
                >
                  {buttonContent}
                </motion.div>
              ) : (
                <div key={stage.stage} className={`relative flex justify-center w-full ${alignClass}`}>
                  {buttonContent}
                </div>
              )
            );
          });

          return (
            <>
              {/* SVG path connector */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-surface-2 -z-10 rounded-full border-x border-border/30"></div>
              {nodes}
            </>
          );
        })()}
      </div>
    </div>
  );
}
