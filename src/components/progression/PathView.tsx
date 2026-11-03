import React from 'react';
import { ProgressionState, StageNode, LessonNode, CefrStage } from '../../progression/types';
import { buildCourseStructure } from '../../progression/courseData';
import { Play, Crown, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';

interface PathViewProps {
  state: ProgressionState;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  isArabic?: boolean;
}

export function PathView({ state, onSelectLesson, onSelectUnitCheckpoint, isArabic = true }: PathViewProps) {
  const courseStructure: StageNode[] = buildCourseStructure();

  // Find current active stage or default to A0
  const activeStageNode = courseStructure.find((s) => s.stage === state.currentStage) || courseStructure[0];

  return (
    <div className="space-y-6 max-w-md mx-auto pb-24" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 1. Top Big Continue CTA */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-950 to-stone-900 border border-teal-500/40 shadow-xl flex items-center justify-between">
        <div className="space-y-1 text-start">
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
            {isArabic ? `المرحلة الحالية: ${activeStageNode.stage}` : `Current Stage: ${activeStageNode.stage}`}
          </span>
          <h3 className="text-sm font-black text-white">
            {isArabic ? activeStageNode.titleAr : activeStageNode.titleEn}
          </h3>
          <p className="text-xs text-stone-400">
            {isArabic ? 'تابع مسار التفكير دون تردد' : 'Resume your cognitive path'}
          </p>
        </div>

        <button
          onClick={() => {
            const firstUnfinished = activeStageNode.units[0]?.lessons[0];
            if (firstUnfinished) onSelectLesson(firstUnfinished);
          }}
          className="px-5 py-3 rounded-2xl bg-teal-400 hover:bg-teal-300 active:scale-95 text-stone-950 font-black text-xs shadow-lg transition flex items-center gap-2 shrink-0"
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
              className={`px-3.5 py-2 rounded-2xl border text-xs font-black transition shrink-0 ${
                isActive
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300 ring-1 ring-teal-500/30'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{stg.stage}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Duolingo-Style Path Node List */}
      <div className="space-y-8">
        {activeStageNode.units.map((unit, uIdx) => (
          <div key={unit.id} className="space-y-4">
            {/* Unit Header Banner */}
            <div
              className="p-4 rounded-2xl border flex items-center justify-between shadow-md"
              style={{ backgroundColor: `${unit.color}15`, borderColor: `${unit.color}40` }}
            >
              <div className="space-y-0.5 text-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                  {isArabic ? `الوحدة ${uIdx + 1}` : `Unit ${uIdx + 1}`}
                </span>
                <h4 className="text-sm font-black text-white">
                  {isArabic ? unit.titleAr : unit.titleEn}
                </h4>
                <p className="text-xs text-stone-400">
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

                // Offset node x-position for playful snake path
                const xOffset = lIdx % 2 === 0 ? 'translate-x-0' : lIdx % 3 === 1 ? 'translate-x-6' : '-translate-x-6';

                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={`group relative flex flex-col items-center justify-center transition transform active:scale-90 ${xOffset}`}
                  >
                    {/* Crown Level Badge */}
                    {crowns > 0 && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black shadow-md flex items-center gap-0.5 z-10">
                        <Crown size={10} fill="currentColor" />
                        <span>{crowns}</span>
                      </span>
                    )}

                    {/* Main Circular Node */}
                    <div
                      className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all ${
                        isCompleted
                          ? 'bg-teal-500 border-teal-300 text-stone-950 ring-4 ring-teal-500/20'
                          : 'bg-stone-900 border-stone-700 text-stone-300 group-hover:border-teal-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <span className="text-2xl">{lesson.icon}</span>}
                    </div>

                    {/* Lesson Title */}
                    <span className="text-xs font-bold text-stone-200 mt-2 text-center max-w-[140px] line-clamp-1">
                      {isArabic ? lesson.titleAr : lesson.titleEn}
                    </span>
                  </button>
                );
              })}

              {/* Unit Checkpoint Node */}
              <button
                onClick={() => onSelectUnitCheckpoint(unit.id)}
                className="mt-2 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 text-xs font-black transition flex items-center gap-2 shadow-lg"
              >
                <Award size={18} />
                <span>{isArabic ? 'اختبار اجتياز الوحدة (Checkpoint)' : 'Unit Checkpoint Test'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
