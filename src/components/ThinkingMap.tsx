import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Circle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Compass, Filter, Target } from 'lucide-react';
import { ALL_LESSONS } from '../data/lessons';
import { Lesson, UserProgress } from '../types';
import type { UserProfile } from '../hooks/useUserProfile';
import { isArabicUI, uiText } from '../utils/i18n';
import { CARD_CLASS } from './uiConstants';
import {
  getAdaptiveRecommendation,
  getProfileTrackInfo,
  isPriorityLessonForProfile
} from '../utils/adaptiveCurriculum';

export interface ThinkingMapProps {
  progress: UserProgress;
  onOpenLesson: (lessonIdx: number) => void;
  language?: UserProfile['language'];
  profile?: UserProfile;
}

export interface ConceptStatus {
  lessonIndex: number;
  id: string;
  number: number;
  title: string;
  titleAr: string;
  concept: string;
  conceptAr: string;
  status: 'mastered' | 'attention' | 'next' | 'locked';
  weakSpotCount: number;
  isPriority: boolean;
}

export function ThinkingMap({ progress, onOpenLesson, language, profile }: ThinkingMapProps) {
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'priority'>('priority');

  const effectiveProfile: UserProfile = profile || {
    goal: 'general',
    language: language || 'arabic',
    dialect: 'egyptian',
    level: 'beginner'
  };

  const trackInfo = getProfileTrackInfo(effectiveProfile);
  const rtl = isArabicUI(language || effectiveProfile.language);
  const t = (en: string, ar: string) => uiText(language || effectiveProfile.language, en, ar);

  // Map each lesson to its cognitive status and priority flag
  const concepts: ConceptStatus[] = ALL_LESSONS.map((lesson: Lesson, idx: number) => {
    const isCompleted = progress.completedLessonIds.includes(lesson.id);
    const weakCount = lesson.weakSpotTag ? (progress.weakSpotCounts?.[lesson.weakSpotTag] || 0) : 0;
    const isPriority = isPriorityLessonForProfile(lesson, effectiveProfile);

    let status: ConceptStatus['status'] = 'locked';
    if (isCompleted) {
      status = weakCount > 1 ? 'attention' : 'mastered';
    } else {
      const firstIncompleteIdx = ALL_LESSONS.findIndex((l: Lesson) => !progress.completedLessonIds.includes(l.id));
      if (idx === firstIncompleteIdx || (firstIncompleteIdx === -1 && idx === 0)) {
        status = 'next';
      } else if (idx < firstIncompleteIdx) {
        status = 'mastered';
      } else {
        status = 'locked';
      }
    }

    return {
      lessonIndex: idx,
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      titleAr: lesson.titleAr,
      concept: lesson.transferConcept,
      conceptAr: lesson.transferConceptAr,
      status,
      weakSpotCount: weakCount,
      isPriority
    };
  });

  // Adaptive recommendation calculated specifically for this profile
  const adaptiveRec = getAdaptiveRecommendation(progress, effectiveProfile);
  const recommendedConcept = concepts[adaptiveRec.lessonIndex] || concepts[0];

  const masteredCount = concepts.filter(c => c.status === 'mastered').length;
  const attentionCount = concepts.filter(c => c.status === 'attention').length;
  const priorityConcepts = concepts.filter(c => c.isPriority);

  const displayedConcepts =
    filterMode === 'priority' && priorityConcepts.length > 0 ? priorityConcepts : concepts;

  return (
    <section
      dir={rtl ? 'rtl' : 'ltr'}
      aria-label={t('Personal Thinking Map', 'خريطة التفكير الإنجليزي الشخصية')}
      className={`${CARD_CLASS} !p-4 sm:!p-5 !mb-0 border border-stone-300 dark:border-stone-700 shadow-sm`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 dark:border-stone-700 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <Compass size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('🧠 Personal Thinking Map', '🧠 خريطة التفكير الإنجليزي')}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                <span>{trackInfo.icon}</span>
                <span>{t(trackInfo.titleEn, trackInfo.titleAr)}</span>
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
              {t(
                `${masteredCount} of ${concepts.length} structural shifts mastered · Tailored for your profile`,
                `تم إتقان ${masteredCount} من ${concepts.length} تحولات إدراكية · مسار مخصص لملفك`
              )}
            </p>
          </div>
        </div>

        {/* Status Indicators Pill */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 size={13} className="text-emerald-600" /> {masteredCount}
          </span>
          {attentionCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <AlertTriangle size={13} className="text-amber-600" /> {attentionCount}
            </span>
          )}
        </div>
      </div>

      {/* Recommended Next Shift (Adaptive Hero Card) */}
      {recommendedConcept && (
        <div className="my-4 overflow-hidden rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-4 shadow-sm dark:border-teal-500/30 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/20 sm:p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
              <Sparkles size={13} />
              {t('Adaptive Recommended Shift', 'التحول التكيفي المقترح')}
            </span>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
              {t(`Shift #${recommendedConcept.number}`, `التحول #${recommendedConcept.number}`)}
            </span>
          </div>

          <h4 className="mt-2.5 text-lg font-black text-slate-950 dark:text-white">
            {recommendedConcept.number}. {t(recommendedConcept.title, recommendedConcept.titleAr)}
          </h4>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
            {t(recommendedConcept.concept, recommendedConcept.conceptAr)}
          </p>

          <div className="mt-2 text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <Target size={14} className="shrink-0" />
            <span>{t(adaptiveRec.reasonEn, adaptiveRec.reasonAr)}</span>
          </div>

          <button
            type="button"
            onClick={() => onOpenLesson(recommendedConcept.lessonIndex)}
            className="mt-3.5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 active:scale-[0.99] sm:w-auto"
          >
            <span>{t('Practice This Shift →', 'تدرّب على هذا التحول الآن ←')}</span>
            <ArrowRight size={16} className="rtl-flip" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Filter Tabs: Tailored Track vs All 24 Shifts */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {filterMode === 'priority'
            ? t(`🎯 Tailored Track (${displayedConcepts.length} shifts)`, `🎯 المسار المخصص (${displayedConcepts.length} تحولات)`)
            : t(`All Core Shifts (24)`, `جميع التحولات (24)`)}
        </p>

        <div className="flex items-center rounded-xl bg-stone-100 p-0.5 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => setFilterMode('priority')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              filterMode === 'priority'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-stone-700 hover:text-stone-900 dark:text-stone-300 font-medium'
            }`}
          >
            {t('🎯 Tailored', '🎯 مخصص لك')}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              filterMode === 'all'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-stone-700 hover:text-stone-900 dark:text-stone-300 font-medium'
            }`}
          >
            {t('All 24', 'الكل (24)')}
          </button>
        </div>
      </div>

      {/* Structural Concepts Checklist Tree */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {displayedConcepts.map((concept) => {
            const isExpanded = expandedConceptId === concept.id;
            const isMastered = concept.status === 'mastered';
            const isAttention = concept.status === 'attention';
            const isNext = concept.status === 'next';

            return (
              <div
                key={concept.id}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  concept.isPriority && filterMode === 'all'
                    ? 'ring-1 ring-teal-500/30'
                    : ''
                } ${
                  isNext
                    ? 'border-teal-500/60 bg-teal-50/40 dark:border-teal-400/50 dark:bg-teal-950/20'
                    : isAttention
                    ? 'border-amber-400/60 bg-amber-50/30 dark:border-amber-500/40 dark:bg-amber-950/20'
                    : isMastered
                    ? 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800/60'
                    : 'border-slate-300 bg-slate-100/70 opacity-90 dark:border-slate-700 dark:bg-slate-900/60 font-medium'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedConceptId(isExpanded ? null : concept.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedConceptId(isExpanded ? null : concept.id);
                    }
                  }}
                  className="flex items-center justify-between gap-3 p-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Status Icon */}
                    {isMastered && (
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Mastered" />
                    )}
                    {isAttention && (
                      <AlertTriangle size={18} className="shrink-0 text-amber-500" aria-label="Needs attention" />
                    )}
                    {isNext && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                        ▶
                      </span>
                    )}
                    {!isMastered && !isAttention && !isNext && (
                      <Circle size={17} className="shrink-0 text-slate-400" aria-label="Locked / Up next" />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {concept.number}. {t(concept.title, concept.titleAr)}
                        </p>
                        {concept.isPriority && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-300">
                            ★ {t('Priority Focus', 'أولوية')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isMastered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isAttention
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : isNext
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium'
                      }`}
                    >
                      {isMastered
                        ? t('✓ Mastered', '✓ متقن')
                        : isAttention
                        ? t('⚠ Focus', '⚠ مراجعة')
                        : isNext
                        ? t('★ Next', '★ التالي')
                        : t('Locked', 'قادم')}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="border-t border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                        {t(concept.concept, concept.conceptAr)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {concept.weakSpotCount > 0
                            ? t(
                                `Logged mistakes: ${concept.weakSpotCount}`,
                                `الأخطاء المسجلة: ${concept.weakSpotCount}`
                              )
                            : t('Zero interference recorded', 'لا توجد أخطاء مسجلة')}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenLesson(concept.lessonIndex)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-teal-700"
                        >
                          <span>{t('Open Lesson', 'فتح الدرس')}</span>
                          <ArrowRight size={13} className="rtl-flip" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
