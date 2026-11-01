import React from 'react';
import { UserProgress } from '../types';
import type { UserProfile } from '../hooks/useUserProfile';
import { DAILY_GOAL_TARGET } from '../utils/habitPsychology';
import { isArabicUI, uiText } from '../utils/i18n';
import { CARD_CLASS } from './uiConstants';

export interface HabitLoopBarProps {
  progress: UserProgress;
  mysteryRewardBanner: string | null;
  onToggleBeginnerMode: () => void;
  onQuickWinStart: () => void;
  language?: UserProfile['language'];
}

export function HabitLoopBar({
  progress,
  mysteryRewardBanner,
  onToggleBeginnerMode,
  onQuickWinStart,
  language
}: HabitLoopBarProps) {
  const todayKey = new Date().toISOString().split('T')[0];
  const dailyWins = progress.dailyGoalDate === todayKey ? (progress.dailyGoalCount ?? 0) : 0;
  const clampedDaily = Math.min(DAILY_GOAL_TARGET, dailyWins);
  const dailyPct = Math.min(100, Math.round((clampedDaily / DAILY_GOAL_TARGET) * 100));
  const shields = progress.streakShields ?? 2;
  const beginnerOn = progress.beginnerMode !== false;
  const rtl = isArabicUI(language);
  const t = (en: string, ar: string) => uiText(language, en, ar);

  return (
    <section
      id="habit-loop-bar"
      dir={rtl ? 'rtl' : 'ltr'}
      aria-label={t('Daily Habit Tracker', 'متتبع العادة اليومية')}
      className={`${CARD_CLASS} !p-4 mb-6 space-y-3.5`}
    >
      {/* Clean Horizontal Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-700/80 text-center rtl:divide-x-reverse">
        {/* Daily Goal */}
        <div className="px-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span aria-hidden="true">🎯</span>
            <span>{t('Daily Goal', 'الهدف')}</span>
          </div>
          <p className="mt-1 text-base sm:text-lg font-black text-teal-700 dark:text-teal-300 tabular-nums">
            {dailyWins}/{DAILY_GOAL_TARGET}
          </p>
        </div>

        {/* Streak */}
        <div className="px-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span aria-hidden="true">🔥</span>
            <span>{t('Streak', 'الحماس')}</span>
          </div>
          <p className="mt-1 text-base sm:text-lg font-black text-orange-600 dark:text-orange-400 tabular-nums">
            {progress.streak} <span className="text-xs font-semibold">{t('days', 'يوم')}</span>
          </p>
        </div>

        {/* Streak Shields */}
        <div className="px-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span aria-hidden="true">🧊</span>
            <span>{t('Shields', 'الدروع')}</span>
          </div>
          <p className="mt-1 text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 tabular-nums">
            {shields}
          </p>
        </div>
      </div>

      {/* Clean Single Tiny Habit Progress Bar */}
      <div className="pt-0.5">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 tabular-nums">
          <span>
            {dailyWins >= DAILY_GOAL_TARGET
              ? t('🎉 Daily Habit Complete! (+1 Shield)', '🎉 اكتمل هدف اليوم بنجاح!')
              : t('Daily Habit Progress', 'تقدم العادة اليومية')}
          </span>
          <span className="font-bold text-teal-700 dark:text-teal-300">{dailyPct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-700/80 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(6, dailyPct)}%` }}
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-700/80">
        <button
          type="button"
          id="toggle-beginner-mode-btn"
          onClick={onToggleBeginnerMode}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
            beginnerOn
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>🐣</span>
          <span>{beginnerOn ? t('Hints: ON', 'تلميحات: مفعلة') : t('Hints: OFF', 'تلميحات: مغلقة')}</span>
        </button>

        <button
          type="button"
          id="habit-quick-win-btn"
          onClick={onQuickWinStart}
          className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs active:scale-[0.98] flex items-center gap-1.5"
        >
          <span>🚀</span>
          <span>{t('60s Quick Win', 'تمرين 60 ثانية')}</span>
        </button>
      </div>

      {mysteryRewardBanner && (
        <div
          id="mystery-chest-banner"
          role="status"
          className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between"
        >
          <span>🎁 {mysteryRewardBanner}</span>
        </div>
      )}
    </section>
  );
}
