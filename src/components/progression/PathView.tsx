import React, { useEffect, useMemo, useState } from 'react';
import { ProgressionState, StageNode, LessonNode } from '../../progression/types';
import { buildCourseStructure, isLessonUnlocked, isStageUnlocked } from '../../progression/courseData';
import { Play, Crown, CheckCircle2, Target, LockKeyhole, Star } from 'lucide-react';
import { EmptyLessonState } from '../EmptyLessonState';
import { TargetLanguage } from '../../types';
import confetti from 'canvas-confetti';
import { getCurrentTheme } from '../../progression/rotationEngine';
import { Sparkles } from 'lucide-react';

interface PathViewProps {
  state: ProgressionState;
  targetLang: TargetLanguage;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  isArabic?: boolean;
}

export function PathView({ state, targetLang, onSelectLesson, onSelectUnitCheckpoint, isArabic = true }: PathViewProps) {
  const courseStructure: StageNode[] = useMemo(() => buildCourseStructure(targetLang), [targetLang]);
  const [isIdle, setIsIdle] = useState(false);

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

  // Read saved user goal from localStorage if available
  const userGoal = useMemo(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('tb.userProfile');
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.goal || 'general';
        }
      }
    } catch {}
    return 'general';
  }, []);

  const getGoalBadge = (unitIdx: number) => {
    if (userGoal === 'work' && unitIdx === 0) {
      return isArabic ? '🎯 الأهم لهدف الشغل والشركات' : '🎯 Top priority for Work';
    }
    if (userGoal === 'travel' && unitIdx === 1) {
      return isArabic ? '🎯 الأهم لهدف السفر والتواصل' : '🎯 Top priority for Travel';
    }
    if (userGoal === 'study' && unitIdx === 0) {
      return isArabic ? '🎯 الأهم للدراسة الأكاديمية' : '🎯 Top priority for Study';
    }
    if (unitIdx === 0) {
      return isArabic ? '⭐ الأساس الهيكلي الموصى به' : '⭐ Recommended Foundation';
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-[480px] mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
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
            const allLessons = continueStageNode.units.flatMap((u) => u.lessons);
            const firstUnfinished =
              allLessons.find((l) => !state.completedLessonIds.includes(l.id)) || allLessons[0];
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

      {/* Candy-Crush Style Full Path */}
      {isStageUnlocked(state, continueStageNode.stage, targetLang) ? (
        <div className="space-y-8 pt-4">
          {continueStageNode.units.map((unit, uIdx) => {
            const goalBadge = getGoalBadge(uIdx);

            return (
              <div key={unit.id} className="space-y-4">
                {/* Unit Header Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-md ${
                  goalBadge ? 'bg-surface border-success/60 ring-2 ring-success/20' : 'bg-surface-2 border-border'
                }`}>
                  <div className="space-y-1 text-start">
                    {goalBadge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-success/20 text-success inline-flex items-center gap-1 mb-1">
                        <Target size={12} />
                        <span>{goalBadge}</span>
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                      {isArabic ? `الوحدة ${uIdx + 1}` : `Unit ${uIdx + 1}`}
                    </span>
                    <h4 className="text-sm font-black text-text">
                      {isArabic ? unit.titleAr : unit.titleEn}
                    </h4>
                    <p className="text-xs text-muted">
                      {isArabic ? unit.descriptionAr : unit.descriptionEn}
                    </p>
                  </div>
                  <span className="text-2xl">{unit.icon}</span>
                </div>

                {/* Lesson Nodes Path */}
                <div className="flex flex-col items-center gap-6 relative py-4">
                  {/* SVG Winding Path Connector */}
                  <svg className="absolute top-0 left-0 w-full h-full -z-10 opacity-30" preserveAspectRatio="none">
                    <path
                      d={`M 50% 0 Q 80% 25%, 50% 50% T 50% 100%`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="8 8"
                      className="text-border"
                    />
                  </svg>
                  {unit.lessons.map((lesson) => {
                    const crowns = state.lessonCrowns[lesson.id] || 0;
                    const isCompleted = state.completedLessonIds.includes(lesson.id);
                    const unlocked = isLessonUnlocked(state, lesson, targetLang);

                    const allStageLessons = continueStageNode.units.flatMap(u => u.lessons);
                    const stageLessonIndex = allStageLessons.findIndex(l => l.id === lesson.id);

                    const isCurrent = allStageLessons.find(l => !state.completedLessonIds.includes(l.id))?.id === lesson.id;
                    const previousLesson = allStageLessons[stageLessonIndex - 1];

                    const xOffset = stageLessonIndex % 3 === 0 ? 'translate-x-0' : stageLessonIndex % 3 === 1 ? 'translate-x-12' : '-translate-x-12';

                    return (
                      <button
                        key={lesson.id}
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
                        } ${xOffset}`}
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
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-b-[6px] shadow-md transition-all ${
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
                            <span className="text-2xl font-black">{stageLessonIndex + 1}</span>
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
                  })}
                </div>
              </div>
            );
          })}
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