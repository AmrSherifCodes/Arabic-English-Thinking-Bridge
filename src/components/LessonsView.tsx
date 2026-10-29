import React, { useState } from 'react';
import { Lesson, Phase, UserProgress } from '../types';
import {
  PAN_ARAB_NATIONS,
  PAN_ARAB_UNITY_PHRASES,
  PanArabUnityPhrase
} from '../utils/culturalIdentity';
import { OliveBranchIcon } from './CulturalToast';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS } from './uiConstants';

export interface LessonsViewProps {
  phases: Phase[];
  allLessons: Lesson[];
  progress: UserProgress;
  freeExplore: boolean;
  unityPhrase?: PanArabUnityPhrase;
  onCycleUnityPhrase?: () => void;
  onToggleFreeExplore: () => void;
  onDownloadOfflineHtml: () => void;
  onOpenLesson: (lessonIdx: number) => void;
  onQuickWinStart: () => void;
  onStartBeginnerDeck: () => void;
  getCompletedCountForLesson: (lesson: Lesson) => number;
  isLessonComplete: (lesson: Lesson) => boolean;
}

export function LessonsView({
  phases,
  allLessons,
  progress,
  freeExplore,
  unityPhrase = PAN_ARAB_UNITY_PHRASES[0],
  onCycleUnityPhrase,
  onToggleFreeExplore,
  onDownloadOfflineHtml,
  onOpenLesson,
  onQuickWinStart,
  onStartBeginnerDeck,
  getCompletedCountForLesson,
  isLessonComplete
}: LessonsViewProps) {
  const [showAllNations, setShowAllNations] = useState<boolean>(false);

  const nextIncompleteIdx = Math.max(
    0,
    allLessons.findIndex(l => !isLessonComplete(l))
  );
  const nextLesson = allLessons[nextIncompleteIdx] || allLessons[0];

  return (
    <div>
      {/* Pan-Arab 23 Nations Unity Header Banner */}
      <div
        id="pan-arab-unity-header"
        className={`${CARD_CLASS} kuffiyeh-card-watermark border-olive-600/30 dark:border-olive-500/30 bg-[#f7f2e7]/90 dark:bg-stone-900/90`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-olive-700 dark:text-olive-300">
              <OliveBranchIcon size={16} className="text-olive-600 dark:text-olive-400" />
              <span>Pan-Arab Linguistic Heritage · 23 Arabic-Speaking Nations</span>
            </div>
            <div
              dir="rtl"
              id="lessons-rotating-unity-ar"
              className="ar text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-1 text-right"
            >
              {unityPhrase.ar}
            </div>
            <p
              id="lessons-rotating-unity-en"
              className="text-xs text-stone-700 dark:text-stone-300 mt-0.5 leading-relaxed"
            >
              {unityPhrase.en}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onCycleUnityPhrase && (
              <button
                type="button"
                id="cycle-unity-phrase-btn"
                onClick={onCycleUnityPhrase}
                aria-label="Rotate Pan-Arab unity phrase"
                className="rounded-xl border border-olive-600/35 dark:border-olive-500/40 bg-olive-600/10 dark:bg-olive-500/15 hover:bg-olive-600/20 px-3 py-1.5 text-xs font-semibold text-olive-800 dark:text-olive-200 transition-colors !min-h-[36px] whitespace-nowrap"
              >
                ↻ Rotate Phrase
              </button>
            )}
            <button
              type="button"
              id="toggle-23-nations-btn"
              aria-expanded={showAllNations}
              onClick={() => setShowAllNations(prev => !prev)}
              className="rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-1.5 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors !min-h-[36px] whitespace-nowrap"
            >
              {showAllNations ? 'Hide 23 Nations ▲' : 'Explore 23 Nations ▼'}
            </button>
          </div>
        </div>

        {showAllNations && (
          <div
            id="pan-arab-23-nations-grid"
            className="mt-3 pt-3 border-t border-olive-600/20 dark:border-olive-500/20"
          >
            <p className="text-xs opacity-75 mb-2">
              Connected by one living tongue across 23 homelands — from the Atlantic Ocean to the Arabian Sea:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 text-xs">
              {PAN_ARAB_NATIONS.map((nation, idx) => (
                <div
                  key={nation.nameEn}
                  className="rounded-lg border border-stone-200/80 dark:border-stone-700/80 bg-white/80 dark:bg-stone-800/70 px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                >
                  <span className="font-medium truncate">
                    <span className="opacity-50 tabular-nums mr-1">{idx + 1}.</span>
                    {nation.nameEn}
                  </span>
                  <span dir="rtl" className="ar font-bold text-olive-700 dark:text-olive-300 shrink-0">
                    {nation.nameAr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zero-Friction Beginner Hero Card ("60-Second Quick Win") */}
      <div
        id="noob-quick-start-card"
        className={`${CARD_CLASS} bg-gradient-to-br from-olive-900/5 via-transparent to-teal-900/5 border-olive-600/30`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-olive-700 dark:text-olive-300 flex items-center gap-1.5">
              <OliveBranchIcon size={15} className="text-olive-600 dark:text-olive-400" />
              <span>🐣 New Here? Zero Grammar Jargon · Step-by-Step Guided Mode</span>
            </div>
            <h2 className="text-lg font-bold mt-0.5">
              Start Your 60-Second Quick Win (ابدأ في 60 ثانية بدون تعقيد)
            </h2>
            <p className="text-xs opacity-80 mt-1 leading-relaxed">
              Don’t know where to start? Tap below to jump straight into{' '}
              <strong>
                Lesson {nextLesson.number}: {nextLesson.title}
              </strong>{' '}
              with <strong>🐣 Beginner Help ON</strong> (we highlight the next word for you!) or
              try our 2-word starter flashcards.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              id="hero-quick-win-btn"
              onClick={onQuickWinStart}
              className={BTN_PRIMARY + ' whitespace-nowrap'}
            >
              🚀 Start 60s Quick Win →
            </button>
            <button
              type="button"
              id="hero-beginner-deck-btn"
              onClick={onStartBeginnerDeck}
              className={BTN_GHOST + ' !text-xs whitespace-nowrap'}
            >
              🃏 Try 2-Word Starter Cards (A0)
            </button>
          </div>
        </div>
      </div>

      <div className={`${CARD_CLASS} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <div className="text-xs font-semibold text-olive-700 dark:text-olive-300">
            Interactive Thinking Journey · 100% Copyright-Free (CC0 Public Domain)
          </div>
          <div className="text-sm opacity-80 mt-0.5 tabular-nums">
            ⭐ {progress.score} XP · 🔥 {progress.streak} streak ·{' '}
            {progress.completedLessonIds.length}/{allLessons.length} lessons mastered
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDownloadOfflineHtml}
            className={BTN_PRIMARY + ' !text-xs whitespace-nowrap'}
          >
            📥 Download Offline .HTML (for WhatsApp)
          </button>
          <button
            type="button"
            onClick={onToggleFreeExplore}
            className={BTN_GHOST + ' !text-xs whitespace-nowrap'}
          >
            {freeExplore ? '🔓 All Lessons Unlocked' : '🔒 Sequential Mode (Tap to Unlock All)'}
          </button>
        </div>
      </div>

      {phases.map(phase => (
        <div key={phase.id}>
          <h2 className="font-semibold mt-4 mb-2 flex items-center gap-1.5">
            <OliveBranchIcon size={16} className="text-olive-600 dark:text-olive-400" />
            <span>
              Phase {phase.id} ({phase.level}) · {phase.title}
            </span>
          </h2>
          {phase.lessons.map(lesson => {
            const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
            const prevLesson = globalIdx > 0 ? allLessons[globalIdx - 1] : null;
            const locked =
              !freeExplore && prevLesson !== null && !isLessonComplete(prevLesson);
            const doneCount = getCompletedCountForLesson(lesson);
            const completed = doneCount === lesson.exercises.length;

            return (
              <div
                key={lesson.id}
                className={`${CARD_CLASS} flex items-center justify-between gap-3 ${
                  locked ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <div className="font-semibold">
                    {locked ? '🔒' : completed ? '✅' : '▶️'} {lesson.number}. {lesson.title}
                  </div>
                  <div dir="rtl" className="ar text-xs opacity-75 mt-0.5 text-right">
                    {lesson.titleAr}
                  </div>
                  <div className="text-xs opacity-70 mt-0.5 tabular-nums">
                    {doneCount}/{lesson.exercises.length} exercises
                  </div>
                </div>
                <button
                  type="button"
                  disabled={locked}
                  aria-label={`${completed ? 'Review' : 'Start'} Lesson ${lesson.number}: ${lesson.title}`}
                  className={BTN_PRIMARY + ' whitespace-nowrap shrink-0'}
                  onClick={() => onOpenLesson(globalIdx)}
                >
                  {completed ? 'Review' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      ))}

      <p className="text-xs opacity-65 mt-3">
        Full course: 24 lessons across three phases · Built in Alexandria, Egypt by Amr Sherif, inspired by Mihalis Eleftheriou &amp; The Thinking Method.
      </p>
    </div>
  );
}
