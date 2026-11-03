import React, { useMemo } from 'react';
import { ProgressionState, StageNode, LessonNode } from '../../progression/types';
import { buildCourseStructure } from '../../progression/courseData';
import { Play, Crown, CheckCircle2, Target } from 'lucide-react';

interface PathViewProps {
  state: ProgressionState;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  isArabic?: boolean;
}

export function PathView({ state, onSelectLesson, onSelectUnitCheckpoint, isArabic = true }: PathViewProps) {
  const courseStructure: StageNode[] = buildCourseStructure();
  const activeStageNode = courseStructure.find((s) => s.stage === state.currentStage) || courseStructure[0];

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
      {/* 1. Top Big Continue CTA */}
      <div className="p-4.5 rounded-3xl bg-surface border border-border shadow-xl flex items-center justify-between">
        <div className="space-y-1 text-start">
          <span className="text-[10px] font-black uppercase tracking-wider text-success block">
            {isArabic ? `المرحلة الحالية: ${activeStageNode.stage}` : `Current Stage: ${activeStageNode.stage}`}
          </span>
          <h3 className="text-sm font-black text-text">
            {isArabic ? activeStageNode.titleAr : activeStageNode.titleEn}
          </h3>
          <p className="text-xs text-muted">
            {isArabic ? 'تابع مسار التفكير دون تردد' : 'Resume your cognitive path'}
          </p>
        </div>

        <button
          onClick={() => {
            const firstUnfinished = activeStageNode.units[0]?.lessons[0];
            if (firstUnfinished) onSelectLesson(firstUnfinished);
          }}
          className="px-5 py-3 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Play size={16} fill="currentColor" />
          <span>{isArabic ? 'متابعة' : 'Continue'}</span>
        </button>
      </div>

      {/* 2. Stages Tabs / Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {courseStructure.slice(0, 3).map((stg) => {
          const isActive = stg.stage === state.currentStage;
          return (
            <button
              key={stg.stage}
              onClick={() => {}}
              className={`px-4 py-2 min-h-[48px] min-w-[48px] rounded-2xl border text-xs font-black transition shrink-0 ${
                isActive
                  ? 'bg-success/20 border-success text-success shadow-md'
                  : 'bg-surface border-border text-muted hover:text-text'
              }`}
            >
              <span>{stg.stage}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Duolingo-Style Path Node List */}
      <div className="space-y-8">
        {activeStageNode.units.map((unit, uIdx) => {
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
              <div className="flex flex-col items-center gap-6 relative">
                {unit.lessons.map((lesson, lIdx) => {
                  const crowns = state.lessonCrowns[lesson.id] || 0;
                  const isCompleted = state.completedLessonIds.includes(lesson.id);

                  const xOffset = lIdx % 2 === 0 ? 'translate-x-0' : lIdx % 3 === 1 ? 'translate-x-6' : '-translate-x-6';

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className={`group relative flex flex-col items-center justify-center transition transform active:scale-90 ${xOffset}`}
                    >
                      {/* Crown Level Badge */}
                      {crowns > 0 && (
                        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-black shadow-md flex items-center gap-0.5 z-10">
                          <Crown size={10} fill="currentColor" />
                          <span>{crowns}</span>
                        </span>
                      )}

                      {/* Main Circular Node */}
                      <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all ${
                          isCompleted
                            ? 'bg-success border-success text-on-primary ring-4 ring-success/20'
                            : 'bg-surface border-border text-muted group-hover:border-success'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={24} /> : <Play size={22} fill="currentColor" className="ms-1" />}
                      </div>

                      {/* Lesson Label */}
                      <span
                        className="mt-1 text-[11px] font-black text-text text-center max-w-[150px] sm:max-w-[170px] line-clamp-2 leading-snug break-words px-1"
                        dir="auto"
                        title={isArabic ? lesson.titleAr : lesson.titleEn}
                      >
                        {isArabic ? lesson.titleAr : lesson.titleEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
