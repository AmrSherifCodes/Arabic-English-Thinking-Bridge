import React, { useEffect, useMemo, useState } from 'react';
import { ProgressionState, StageNode, LessonNode } from '../../progression/types';
import { buildCourseStructure, isLessonUnlocked, isStageUnlocked } from '../../progression/courseData';
import { getTargetDictionary, getTargetDictionaryAsync } from '../../data/dictionaries';
import { Play, Crown, LockKeyhole, Star, Mic, Layers, Sparkles } from 'lucide-react';
import { TargetLanguage, UserProgress } from '../../types';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  FEATURE_UNLOCKS,
  FeatureUnlockDefinition,
  getUnlocksForStage,
  isFeatureUnlocked,
} from '../../progression/featureUnlocks';
import { FeatureUnlockModal } from './FeatureUnlockModal';

interface PathViewProps {
  state: ProgressionState;
  targetLang: TargetLanguage;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  onOpenVoice?: () => void;
  onOpenFlashcards?: (deckId?: string) => void;
  onOpenCorporate?: () => void;
  onOpenClarifying?: () => void;
  onOpenMaintenance?: () => void;
  onOpenPronunciation?: () => void;
  onOpenStory?: () => void;
  onOpenHackerTerminal?: () => void;
  onOpenTeacherMode?: () => void;
  onOpenExam?: () => void;
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
  onOpenCorporate,
  onOpenClarifying,
  onOpenMaintenance,
  onOpenPronunciation,
  onOpenStory,
  onOpenHackerTerminal,
  onOpenTeacherMode,
  isArabic = true,
  progress,
  flashcardDeckIds,
}: PathViewProps) {
  const [dictionaryVersion, setDictionaryVersion] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<FeatureUnlockDefinition | null>(null);

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
  const currentLevelNumber = safeStageIndex + 1;

  const overallProgressPercent = Math.min(100, Math.round(((safeStageIndex + 1) / courseStructure.length) * 100));

  const launchFeature = (featId: string) => {
    switch (featId) {
      case 'srs_flashcards':
        if (onOpenFlashcards) onOpenFlashcards();
        break;
      case 'guided_questions':
        if (onOpenClarifying) onOpenClarifying();
        break;
      case 'pronunciation':
        if (onOpenPronunciation) onOpenPronunciation();
        break;
      case 'ai_voice':
        if (onOpenVoice) onOpenVoice();
        break;
      case 'corporate':
        if (onOpenCorporate) onOpenCorporate();
        break;
      case 'story':
        if (onOpenStory) onOpenStory();
        break;
      case 'teacher_mode':
        if (onOpenTeacherMode) onOpenTeacherMode();
        break;
      case 'maintenance':
        if (onOpenMaintenance) onOpenMaintenance();
        break;
      case 'hacker_terminal':
        if (onOpenHackerTerminal) onOpenHackerTerminal();
        break;
    }
  };

  return (
    <div className="relative space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
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

      {/* Sticky Primary CTA: Extra-Large Start Lesson Button */}
      <div className="sticky top-14 z-20 p-4 rounded-3xl bg-stone-900/98 border-2 border-amber-500/60 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="space-y-1 text-start min-w-0">
          <span className="text-xs font-black text-amber-400 block">
            {isArabic
              ? `المرحلة الحالية: ${continueStageNode?.stage || 'A0'}`
              : `Current Stage: ${continueStageNode?.stage || 'A0'}`}
          </span>
          <h3 className="text-base font-black text-white truncate">
            {isArabic ? continueStageNode?.titleAr : continueStageNode?.titleEn}
          </h3>
          <p className="text-xs text-stone-300">
            {isArabic ? 'اضغط الزر الذهبي لبدء الدرس مباشرة' : 'Tap the gold button to start lesson immediately'}
          </p>
        </div>

        <button
          onClick={() => {
            if (!continueStageNode) return;
            const firstUnfinished =
              continueStageNode.units.flatMap(u => u.lessons).find((l) => !state.completedLessonIds.includes(l.id)) || continueStageNode.units.flatMap(u => u.lessons)[0];
            if (firstUnfinished) onSelectLesson(firstUnfinished);
          }}
          aria-label="اضغط هنا لبدء الدرس الحالي · Start Current Lesson"
          className="min-h-[60px] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-base shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 shrink-0 border-2 border-amber-300 focus-visible:ring-4 focus-visible:ring-amber-300 cursor-pointer"
        >
          <Play size={20} fill="currentColor" />
          <div className="flex flex-col items-center">
            <span>ابدأ الدرس الحالي 🚀</span>
            <span className="text-[10px] font-sans font-bold opacity-90">Start Lesson</span>
          </div>
        </button>
      </div>

      {/* Candy-Crush Style True Zig-Zag Path */}
      <div className="flex flex-col items-center gap-4 relative py-8 w-full">
        {(() => {
          let nodeIndex = 0;
          // Creates a distinct S-curve zig-zag that sweeps across the screen more dramatically
          const alignFor = (index: number) => {
            const pattern = [
              '-translate-x-12', // Center-left
              '-translate-x-24', // Far left
              '-translate-x-32', // Extreme left
              '-translate-x-24', // Far left (curving back)
              '-translate-x-8',  // Center-left
              'translate-x-8',   // Center-right
              'translate-x-24',  // Far right
              'translate-x-32',  // Extreme right
              'translate-x-24',  // Far right (curving back)
              'translate-x-12',  // Center-right
            ];
            return pattern[index % pattern.length];
          };

          const nodes: React.ReactNode[] = [];

          courseStructure.forEach((stage, idx) => {
            const isCompleted = idx < safeStageIndex;
            const unlocked = idx <= safeStageIndex;
            const isCurrent = idx === safeStageIndex;

            const stageLessons = stage.units.flatMap(u => u.lessons);
            const completedInStage = stageLessons.filter(l => state.completedLessonIds.includes(l.id)).length;
            const totalInStage = Math.max(1, stageLessons.length);

            const stageUnlocks = getUnlocksForStage(stage.stage);

            const alignClass = alignFor(nodeIndex++);

            const buttonContent = (
              <div className="relative w-full flex flex-col items-center">
                {isCurrent && (
                  <div className="mb-2 animate-bounce bg-emerald-600 border border-emerald-400 text-white px-3 py-1 rounded-xl shadow-lg shadow-emerald-500/40 z-20 text-[11px] font-black pointer-events-none whitespace-nowrap">
                    📍 أنت هنا الآن (المستوى {idx + 1} من 10)
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
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all overflow-visible shadow-[0_8px_0_0_rgba(0,0,0,0.2)] active:translate-y-2 active:shadow-none ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_8px_0_0_rgba(6,95,70,1)]'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_0_0_rgba(153,27,27,1)] ring-4 ring-amber-400/40'
                        : unlocked
                        ? 'bg-gradient-to-br from-stone-100 to-stone-300 border-2 border-stone-400 text-stone-700 shadow-[0_8px_0_0_rgba(120,113,108,1)] hover:brightness-110'
                        : 'bg-surface-2 border-2 border-border/50 text-muted grayscale shadow-[0_8px_0_0_rgba(0,0,0,0.1)]'
                    }`}
                    style={{
                      borderRadius: '9999px',
                      boxShadow: isCurrent ? '0 8px 0 0 rgba(153,27,27,1), 0 0 28px rgba(251, 191, 36, 0.45)' : undefined,
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
                      {isCompleted
                        ? (isArabic ? `المستوى ${idx + 1}: ${stage.titleAr} (مكتمل ⭐)` : `Level ${idx + 1}: ${stage.titleEn} (Mastered)`)
                        : isCurrent
                        ? (isArabic ? `المستوى ${idx + 1}: ${stage.titleAr} (${completedInStage}/${totalInStage} دروس)` : `Level ${idx + 1}: ${stage.titleEn} (${completedInStage}/${totalInStage} lessons)`)
                        : (isArabic ? `المستوى ${idx + 1}: ${stage.titleAr}` : `Level ${idx + 1}: ${stage.titleEn}`)}
                    </span>
                  </div>
                )}

                {/* Checkpoint Feature Unlock Badge for this stage */}
                {stageUnlocks.length > 0 && (
                  <div className="mt-2.5 max-w-[240px] text-center flex flex-col items-center gap-1.5 z-10 px-1">
                    {stageUnlocks.map((feat) => {
                      const featUnlocked = unlocked;
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => {
                            if (featUnlocked) {
                              launchFeature(feat.id);
                            } else {
                              setSelectedLockedFeature(feat);
                            }
                          }}
                          className={`w-full p-2 rounded-2xl border text-start transition active:scale-95 flex items-center gap-2 shadow-sm ${
                            featUnlocked
                              ? 'bg-stone-900/90 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                              : 'bg-stone-950/80 border-stone-800 text-stone-400 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className="text-xl shrink-0">{feat.icon}</span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-black tracking-wide truncate">
                                {isArabic ? feat.titleAr : feat.titleEn}
                              </span>
                              {featUnlocked ? (
                                <Sparkles size={12} className="text-emerald-400 shrink-0" />
                              ) : (
                                <LockKeyhole size={12} className="text-amber-400 shrink-0" />
                              )}
                            </div>
                            <span className="text-[9px] block text-stone-400 truncate">
                              {featUnlocked
                                ? (isArabic ? '✨ ميزة مفتوحة — اضغط للتشغيل' : '✨ Unlocked feature — tap to launch')
                                : (isArabic ? `🔒 ينفتح في المستوى ${feat.requiredLevelNumber}` : `🔒 Requires Level ${feat.requiredLevelNumber}`)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );

            nodes.push(
              isCurrent ? (
                <motion.div
                  key={stage.stage}
                  animate={{ scale: [1, 1.05, 1], y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={`relative flex justify-center w-full transform ${alignClass} z-10`}
                >
                  {buttonContent}
                </motion.div>
              ) : (
                <div key={stage.stage} className={`relative flex justify-center w-full transform ${alignClass} ${isCompleted ? 'z-0' : 'z-0'}`}>
                  {buttonContent}
                </div>
              )
            );
          });

          return (
            <>
              {/* SVG path connector */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ filter: 'drop-shadow(0px 4px 0px rgba(0,0,0,0.15))' }}>
                <path
                  d="M 50% 0 Q 30% 100 20% 200 T 50% 400 T 80% 600 T 50% 800 T 20% 1000 T 50% 1200 T 80% 1400 T 50% 1600 T 20% 1800 T 50% 2000"
                  fill="none"
                  stroke="currentColor"
                  className="text-stone-300 dark:text-stone-800"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 50% 0 Q 30% 100 20% 200 T 50% 400 T 80% 600 T 50% 800 T 20% 1000 T 50% 1200 T 80% 1400 T 50% 1600 T 20% 1800 T 50% 2000"
                  fill="none"
                  stroke="currentColor"
                  className="text-stone-400 dark:text-stone-700"
                  strokeWidth="24"
                  strokeDasharray="24 32"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {nodes}
            </>
          );
        })()}
      </div>

      {/* Feature Unlock Modal */}
      {selectedLockedFeature && (
        <FeatureUnlockModal
          feature={selectedLockedFeature}
          currentLevelNumber={currentLevelNumber}
          currentStageTitleAr={continueStageNode?.titleAr || state.currentStage}
          currentStageTitleEn={continueStageNode?.titleEn || state.currentStage}
          isArabic={isArabic}
          onClose={() => setSelectedLockedFeature(null)}
          onContinueCourse={() => {
            setSelectedLockedFeature(null);
            const firstUnfinished =
              continueStageNode?.units.flatMap((u) => u.lessons).find((l) => !state.completedLessonIds.includes(l.id)) ||
              continueStageNode?.units.flatMap((u) => u.lessons)[0];
            if (firstUnfinished) onSelectLesson(firstUnfinished);
          }}
        />
      )}
    </div>
  );
}
