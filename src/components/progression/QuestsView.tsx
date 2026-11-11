import React from 'react';
import { ProgressionState } from '../../progression/types';
import { CheckCircle2, Award, Zap, Gift } from 'lucide-react';

interface QuestsViewProps {
  state: ProgressionState;
  isArabic?: boolean;
}

export function QuestsView({ state, isArabic = true }: QuestsViewProps) {
  const dailySrsQuest = {
    id: 'q-srs-10',
    titleAr: 'مراجعة 10 كلمات اليوم (50 XP)',
    titleEn: 'Review 10 words to earn 50 XP',
    targetCount: 10,
    currentCount: 0,
    xpReward: 50,
    isCompleted: false,
    type: 'daily' as const,
  };

  const questsList = [...(state.quests || [])];
  if (!questsList.some(q => q.id === 'q-srs-10' || (q.titleEn && q.titleEn.includes('Review 10 words')))) {
    questsList.unshift(dailySrsQuest);
  }

  return (
    <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Daily Quests Header */}
      <div className="text-start space-y-1">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>⚡ المهام والجوائز</span>
          <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
            {isArabic ? 'تتجدد يومياً' : 'Resets Daily'}
          </span>
        </h2>
        <p className="text-xs text-stone-400">
          {isArabic ? 'أكمل المهام اليومية للحصول على دروع الحماية ونقاط XP' : 'Complete daily quests to earn XP and streak shields'}
        </p>
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {questsList.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));
          return (
            <div
              key={quest.id}
              className={`p-4 rounded-2xl border text-start space-y-2.5 transition ${
                quest.isCompleted
                  ? 'bg-teal-950/30 border-teal-500/50'
                  : 'bg-stone-900 border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-white">
                    {isArabic ? quest.titleAr : quest.titleEn}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-400">
                    +{quest.xpReward} XP
                  </span>
                </div>

                {quest.isCompleted ? (
                  <span className="flex items-center gap-1 text-xs font-black text-teal-400">
                    <CheckCircle2 size={16} />
                    <span>{isArabic ? 'مكتمل' : 'Done'}</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-stone-400">
                    {quest.currentCount}/{quest.targetCount}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-teal-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements Showcase */}
      <div className="pt-4 space-y-3 text-start">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Award className="text-amber-400" size={18} />
          <span>{isArabic ? '🏆 الأوسمة والإنجازات' : '🏆 Badges & Achievements'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(state.achievements || []).map((ach) => {
            const isUnlocked = ach.unlockedAt !== null;
            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                  isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/40 text-stone-100'
                    : 'bg-stone-900/60 border-stone-800 text-stone-500 opacity-60'
                }`}
              >
                <span className="text-3xl shrink-0">{ach.icon}</span>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black text-white truncate">
                    {isArabic ? ach.titleAr : ach.titleEn}
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    {isArabic ? ach.descAr : ach.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
