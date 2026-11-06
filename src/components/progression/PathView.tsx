import React, { useEffect, useMemo, useState } from 'react';
import { ProgressionState, StageNode, LessonNode } from '../../progression/types';
import { buildCourseStructure, isLessonUnlocked, isStageUnlocked } from '../../progression/courseData';
import { Play, Crown, CheckCircle2, Target, LockKeyhole } from 'lucide-react';
import { EmptyLessonState } from '../EmptyLessonState';
import { TargetLanguage } from '../../types';

interface PathViewProps {
  state: ProgressionState;
  targetLang: TargetLanguage;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  isArabic?: boolean;
}

export function PathView({ state, targetLang, onSelectLesson, onSelectUnitCheckpoint, isArabic = true }: PathViewProps) {
  const courseStructure: StageNode[] = useMemo(() => buildCourseStructure(targetLang), [targetLang]);
  const [viewedStage, setViewedStage] = useState<string>(state.currentStage);
  const [showAllLessons, setShowAllLessons] = useState<boolean>(false);
  const activeStageNode = courseStructure.find((s) => s.stage === viewedStage) || courseStructure[0];
  const currentStageNode = courseStructure.find((s) => s.stage === state.currentStage) || courseStructure[0];
  const continueStageNode = currentStageNode;
  const stageLessons = useMemo(() => activeStageNode.units.flatMap((unit) => unit.lessons), [activeStageNode]);

  const currentLessonIndex = useMemo(() => {
    const idx = stageLessons.findIndex((l) => !state.completedLessonIds.includes(l.id));
    return idx !== -1 ? idx : Math.max(0, stageLessons.length - 1);
  }, [stageLessons, state.completedLessonIds]);

  const currentLesson = stageLessons[currentLessonIndex] || stageLessons[0];
  const currentUnit = useMemo(() => {
    return activeStageNode.units.find((u) => u.lessons.some((l) => l.id === currentLesson?.id)) || activeStageNode.units[0];
  }, [activeStageNode, currentLesson]);

  const nextLessons = useMemo(() => {
    if (!currentLesson) return [];
    return stageLessons.slice(currentLessonIndex + 1, currentLessonIndex + 3);
  }, [stageLessons, currentLessonIndex, currentLesson]);

  useEffect(() => {
    setViewedStage(state.currentStage);
  }, [state.currentStage]);

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
          className="px-5 py-3 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Play size={16} fill="currentColor" />
          <span>{isArabic ? 'متابعة' : 'Continue'}</span>
        </button>
      </div>

      {/* 2. Stages Tabs / Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {courseStructure.map((stg) => {
          const isActive = stg.stage === viewedStage;
          const unlocked = isStageUnlocked(state, stg.stage, targetLang);
          return (
            <button
              key={stg.stage}
              type="button"
              onClick={() => setViewedStage(stg.stage)}
              disabled={!unlocked}
              aria-pressed={stg.stage === viewedStage}
              aria-label={`${stg.stage}${unlocked ? '' : isArabic ? ' — مقفولة، أكمل المرحلة السابقة لفتحها' : ' — locked, complete the previous stage to unlock'}`}
              className={`px-4 py-2 min-h-[48px] min-w-[48px] rounded-2xl border text-xs font-black transition shrink-0 ${
                isActive
                  ? 'bg-success/20 border-success text-success shadow-md'
                  : unlocked
                    ? 'bg-surface border-border text-muted hover:text-text'
                    : 'bg-surface/50 border-border/60 text-muted/60 cursor-not-allowed'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {!unlocked && <LockKeyhole size={12} aria-hidden="true" />}
                {stg.stage}
              </span>
            </button>
          );
        })}
      </div>

      {!isStageUnlocked(state, activeStageNode.stage, targetLang) && (
        <div role="status" className="p-4 rounded-2xl bg-surface border border-border text-center space-y-1">
          <LockKeyhole className="mx-auto text-muted" size={20} aria-hidden="true" />
          <p className="text-sm font-black text-text">
            {isArabic ? `${activeStageNode.stage} مقفولة حالياً` : `${activeStageNode.stage} is locked`}
          </p>
          <p className="text-xs text-muted">
            {isArabic
              ? `أكمل دروس ${currentStageNode.stage} لفتح المرحلة التالية.`
              : `Complete the ${currentStageNode.stage} lessons to unlock the next stage.`}
          </p>
        </div>
      )}

      {/* Empty State when stage has zero completed lessons */}
      {isStageUnlocked(state, activeStageNode.stage, targetLang) &&
        activeStageNode.units.every((u) => u.lessons.every((l) => !state.completedLessonIds.includes(l.id))) && (
        <EmptyLessonState
          stage={activeStageNode.stage}
          isArabic={isArabic}
          onStartFirstLesson={() => {
            const firstLesson = activeStageNode.units[0]?.lessons[0];
            if (firstLesson && isLessonUnlocked(state, firstLesson, targetLang)) onSelectLesson(firstLesson);
          }}
        />
      )}

      {/* 3. Duolingo-Style Prominent Current Lesson & Locked Previews */}
      {currentLesson && isStageUnlocked(state, activeStageNode.stage, targetLang) && (
        <div className="space-y-4 text-start">
          {/* Prominent Current Lesson Card */}
          <div className="p-5 rounded-3xl bg-surface border-2 border-primary/60 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                {isArabic
                  ? `الدرس الحالي · ${currentUnit ? currentUnit.titleAr : activeStageNode.stage}`
                  : `Current Lesson · ${currentUnit ? currentUnit.titleEn : activeStageNode.stage}`}
              </span>
              <span className="text-xl">{currentUnit?.icon || '📘'}</span>
            </div>

            <div>
              <h3 className="text-base font-black text-text">
                {isArabic ? currentLesson.titleAr : currentLesson.titleEn}
              </h3>
              {currentLesson.grammarFocus && (
                <p className="text-xs text-muted mt-0.5">
                  {isArabic ? `التركيز: ${currentLesson.grammarFocus}` : `Focus: ${currentLesson.grammarFocus}`}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectLesson(currentLesson)}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              <span>{isArabic ? 'ابدأ' : 'Start'}</span>
            </button>
          </div>

          {/* Next 2 Locked Previews */}
          {nextLessons.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted block px-1">
                {isArabic ? 'الدروس القادمة:' : 'Upcoming Lessons:'}
              </span>
              {nextLessons.map((nxt) => (
                <div
                  key={nxt.id}
                  className="p-3.5 rounded-2xl bg-surface-2 border border-border/80 flex items-center justify-between opacity-75 text-start"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-text">
                      {isArabic ? nxt.titleAr : nxt.titleEn}
                    </h4>
                    <span className="text-[10px] font-medium text-muted block">
                      🔒 {isArabic ? 'أكمل الدرس السابق لفتحه' : 'Complete the previous lesson'}
                    </span>
                  </div>
                  <LockKeyhole size={16} className="text-muted shrink-0 ms-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Collapsed Accordion for Full Path View */}
      {isStageUnlocked(state, activeStageNode.stage, targetLang) && (
        <div className="space-y-6 pt-2">
          <button
            type="button"
            onClick={() => setShowAllLessons((prev) => !prev)}
            aria-expanded={showAllLessons}
            className="w-full py-3 px-4 rounded-2xl bg-surface border border-border text-xs font-black text-muted hover:text-text transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>
              {showAllLessons
                ? (isArabic ? 'إخفاء باقي الدروس ▲' : 'Hide remaining lessons ▲')
                : (isArabic ? 'المزيد من الدروس ▼' : 'More lessons ▼')}
            </span>
          </button>

          {showAllLessons && (
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
                      {unit.lessons.map((lesson) => {
                        const crowns = state.lessonCrowns[lesson.id] || 0;
                        const isCompleted = state.completedLessonIds.includes(lesson.id);
                        const unlocked = isLessonUnlocked(state, lesson, targetLang);
                        const stageLessonIndex = stageLessons.findIndex((item) => item.id === lesson.id);
                        const previousLesson = stageLessons[stageLessonIndex - 1];

                        const xOffset = stageLessonIndex % 3 === 0 ? 'translate-x-0' : stageLessonIndex % 3 === 1 ? 'translate-x-6' : '-translate-x-6';

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => onSelectLesson(lesson)}
                            type="button"
                            disabled={!unlocked}
                            aria-label={`${isArabic ? lesson.titleAr : lesson.titleEn}${unlocked ? '' : isArabic ? ' — مقفول، أكمل الدرس السابق لفتحه' : ' — locked, complete the previous lesson to unlock'}`}
                            className={`btn-shiny group relative flex flex-col items-center justify-center transition transform ${
                              unlocked ? 'active:scale-90' : 'cursor-not-allowed opacity-55'
                            } ${xOffset}`}
                          >
                            {crowns > 0 && (
                              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-black shadow-md flex items-center gap-0.5 z-10">
                                <Crown size={10} fill="currentColor" />
                                <span>{crowns}</span>
                              </span>
                            )}

                            <div
                              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all ${
                                isCompleted
                                  ? 'bg-success border-success text-on-primary ring-4 ring-success/20'
                                  : unlocked
                                    ? 'bg-surface border-border text-muted group-hover:border-success'
                                    : 'bg-surface-2 border-border text-muted'
                              }`}
                            >
                              {isCompleted
                                ? <CheckCircle2 size={24} />
                                : unlocked
                                  ? <Play size={22} fill="currentColor" className="ms-1" />
                                  : <LockKeyhole size={22} />}
                            </div>

                            <span
                              className="mt-1 text-[11px] font-black text-text text-center max-w-[150px] sm:max-w-[170px] line-clamp-2 leading-snug break-words px-1"
                              dir="auto"
                              title={isArabic ? lesson.titleAr : lesson.titleEn}
                            >
                              {isArabic ? lesson.titleAr : lesson.titleEn}
                            </span>
                            {!unlocked && (
                              <span className="mt-1 text-[9px] font-bold text-muted">
                                {isArabic
                                  ? `أكمل ${previousLesson ? previousLesson.titleAr : 'المرحلة السابقة'}`
                                  : `Complete ${previousLesson ? previousLesson.titleEn : 'the previous stage'}`}
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
          )}
        </div>
      )}
    </div>
  );
}
