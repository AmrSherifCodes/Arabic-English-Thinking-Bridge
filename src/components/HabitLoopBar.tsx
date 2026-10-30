import React from 'react';
import { UserProgress } from '../types';
import type { UserProfile } from '../hooks/useUserProfile';
import { DAILY_GOAL_TARGET, MYSTERY_CHEST_THRESHOLD } from '../utils/habitPsychology';
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
  const combo = (progress.comboCount ?? 0) % MYSTERY_CHEST_THRESHOLD;
  const winsLeftForChest = MYSTERY_CHEST_THRESHOLD - combo;
  const shields = progress.streakShields ?? 2;
  const beginnerOn = progress.beginnerMode !== false;
  const rtl = isArabicUI(language);
  const t = (en: string, ar: string) => uiText(language, en, ar);

  return (
    <section
      id="habit-loop-bar"
      dir={rtl ? 'rtl' : 'ltr'}
      aria-label={t('Daily Habit and Mystery Reward Tracker', 'متتبع العادة اليومية وصندوق المكافآت')}
      className={`${CARD_CLASS} !p-3.5 mb-3`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 font-medium tabular-nums">
          <span className="font-semibold text-teal-800 dark:text-teal-300">
            {t(
              `🎯 Today’s Goal: ${dailyWins}/${DAILY_GOAL_TARGET} Wins`,
              `🎯 هدف اليوم: ${dailyWins}/${DAILY_GOAL_TARGET} إجابات صحيحة`
            )}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span
            title={t(
              'Every 3 correct answers unlocks a surprise Mystery XP Chest!',
              'كل 3 إجابات صحيحة تفتح صندوق مكافآت مفاجئ!'
            )}
          >
            {t('🎁 Chest:', '🎁 الصندوق:')} {combo}/{MYSTERY_CHEST_THRESHOLD}{' '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              ({t(`${winsLeftForChest} left`, `باقي ${winsLeftForChest}`)})
            </span>
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span
            title={t(
              'Streak Shields automatically protect your 🔥 streak if you make a mistake!',
              'دروع الحماية تحمي سلسلتك اليومية 🔥 تلقائياً عند الخطأ!'
            )}
          >
            🔥 {progress.streak} {t('Streak', 'يوم')} · 🧊 {shields}{' '}
            {t(`Shield${shields === 1 ? '' : 's'}`, 'درع')}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span className="opacity-70">{t('🔓 Free & Open Source', '🔓 مجاني ومفتوح المصدر')}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="toggle-beginner-mode-btn"
            onClick={onToggleBeginnerMode}
            title={t(
              'Beginner Mode highlights the next word block and enables 1-tap word hints',
              'وضع المبتدئين يميز الكلمة التالية ويفعّل التلميحات السريعة'
            )}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 !min-h-[36px] border ${
              beginnerOn
                ? 'bg-emerald-600/15 border-emerald-600/40 text-emerald-800 dark:text-emerald-300'
                : 'border-stone-300 dark:border-stone-600 opacity-75 hover:opacity-100'
            }`}
          >
            {t(
              `🐣 Beginner Help: ${beginnerOn ? 'ON' : 'OFF'}`,
              `🐣 مساعدة المبتدئين: ${beginnerOn ? 'مفعّلة' : 'مغلقة'}`
            )}
          </button>
          <button
            type="button"
            id="habit-quick-win-btn"
            onClick={onQuickWinStart}
            className="rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 !min-h-[36px]"
          >
            {t('🚀 60s Quick Win', '🚀 تمرين سريع (60 ثانية)')}
          </button>
        </div>
      </div>

      {/* Dual Progress Bars: Daily Tiny Habit (Left) + Mystery Chest Variable Reward (Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
        <div>
          <div className="flex justify-between text-[11px] opacity-75 mb-1 tabular-nums">
            <span>
              {dailyWins >= DAILY_GOAL_TARGET
                ? t(
                    '✅ Daily Habit Complete! (+1 🧊 Shield Earned)',
                    '✅ اكتمل هدف اليوم! (+1 🧊 درع حماية)'
                  )
                : t(
                    'Tiny Habit: Complete 5 quick sentences or cards today',
                    'عادة يومية: أكمل 5 جمل أو بطاقات سريعة اليوم'
                  )}
            </span>
            <span>{dailyPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              className="h-2 rounded-full bg-teal-600 transition-all duration-200"
              style={{ width: `${Math.max(12, dailyPct)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] opacity-75 mb-1 tabular-nums">
            <span>
              {t(
                `🎁 Mystery XP Chest (${winsLeftForChest} more win${winsLeftForChest === 1 ? '' : 's'} to open!)`,
                `🎁 صندوق نقاط الخبرة (باقي ${winsLeftForChest} لفتحه!)`
              )}
            </span>
            <span>
              {Array.from({ length: MYSTERY_CHEST_THRESHOLD })
                .map((_, i) => (i < combo ? '⚡' : '⚪'))
                .join(' ')}
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all duration-200"
              style={{ width: `${Math.round((combo / MYSTERY_CHEST_THRESHOLD) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {mysteryRewardBanner && (
        <div
          id="mystery-chest-banner"
          role="status"
          className="mt-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between"
        >
          <span>{mysteryRewardBanner}</span>
          <span className="text-[11px] opacity-80">
            {t('Keep going for the next chest!', 'استمر لفتح الصندوق القادم!')}
          </span>
        </div>
      )}
    </section>
  );
}
