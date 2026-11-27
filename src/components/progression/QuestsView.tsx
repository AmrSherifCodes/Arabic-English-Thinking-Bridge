import React from 'react';
import { ProgressionState } from '../../progression/types';
import { CheckCircle2, Award } from 'lucide-react';

interface QuestsViewProps {
  state: ProgressionState;
  isArabic?: boolean;
}

export function QuestsView({ state, isArabic = true }: QuestsViewProps) {
  const dailySrsQuest = {
    id: 'q-srs-10',
    titleAr: 'مراجعة 10 كلمات اليوم',
    titleEn: 'Review 10 words today',
    targetCount: 10,
    currentCount: 0,
    xpReward: 50,
    isCompleted: false,
    type: 'daily' as const,
  };

  const questsList = [...(state.quests || [])].map((q) => ({
    ...q,
    // Strip any duplicated "(50 XP)" or "to earn 50 XP" inside quest titles
    titleAr: (q.titleAr || '').replace(/\s*\(\+?\d+\s*XP\)/gi, '').trim(),
    titleEn: (q.titleEn || '').replace(/\s*(?:to earn\s*)?\(?\+?\d+\s*XP\)?/gi, '').trim(),
  }));
  if (!questsList.some((q) => q.id === 'q-srs-10' || (q.titleEn && q.titleEn.includes('Review 10 words')))) {
    questsList.unshift(dailySrsQuest);
  }

  return (
    <div className="space-y-6 w-full pb-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Daily Quests Header */}
      <div className="text-start space-y-1">
        <h2 className="text-lg font-black text-[#F8FAFC] flex items-center gap-2 flex-wrap">
          <span>⚡ {isArabic ? 'المهام والجوائز' : 'Quests & Rewards'}</span>
          <span className="text-xs font-black text-[#0B1120] bg-[#F59E0B] px-2.5 py-0.5 rounded-full">
            {isArabic ? 'تتجدد يومياً' : 'Resets Daily'}
          </span>
        </h2>
        <p className="text-xs font-medium text-[#CBD5E1]">
          {isArabic
            ? 'أكمل المهام اليومية للحصول على دروع الحماية ونقاط XP'
            : 'Complete daily quests to earn XP and streak shields'}
        </p>
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {questsList.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.currentCount / Math.max(1, quest.targetCount)) * 100));
          return (
            <div
              key={quest.id}
              className="p-4 rounded-2xl border text-start space-y-3 transition"
              style={{
                backgroundColor: quest.isCompleted ? 'rgba(16, 185, 129, 0.14)' : 'var(--surface)',
                borderColor: quest.isCompleted ? 'rgba(16, 185, 129, 0.5)' : 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-black text-[#F8FAFC] leading-snug">
                    {isArabic ? quest.titleAr : quest.titleEn}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-[#F59E0B] text-[#0B1120]">
                    +{quest.xpReward} XP
                  </span>
                </div>

                {quest.isCompleted ? (
                  <span className="flex items-center gap-1 text-xs font-black text-[#10B981] shrink-0">
                    <CheckCircle2 size={16} />
                    <span>{isArabic ? 'مكتمل' : 'Done'}</span>
                  </span>
                ) : (
                  <span className="text-xs font-black text-[#F8FAFC] bg-[#1B2742] px-2.5 py-1 rounded-xl border border-slate-400/25 tabular-nums shrink-0">
                    {quest.currentCount}/{quest.targetCount}
                  </span>
                )}
              </div>

              {/* High-Contrast Progress Bar (>= 4.5:1) */}
              <div
                className="h-2.5 w-full rounded-full overflow-hidden border"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'rgba(203, 213, 225, 0.25)',
                }}
              >
                <div
                  className="h-full bg-[#10B981] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(progressPercent, quest.currentCount > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements Showcase */}
      <div className="pt-2 space-y-3 text-start">
        <h3 className="text-base font-black text-[#F8FAFC] flex items-center gap-2">
          <Award className="text-[#F59E0B]" size={18} />
          <span>{isArabic ? '🏆 الأوسمة والإنجازات' : '🏆 Badges & Achievements'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(state.achievements || []).map((ach) => {
            const isUnlocked = ach.unlockedAt !== null;
            return (
              <div
                key={ach.id}
                className="p-3.5 rounded-2xl border flex items-center gap-3 transition"
                style={{
                  backgroundColor: isUnlocked ? 'rgba(245, 158, 11, 0.14)' : 'var(--surface)',
                  borderColor: isUnlocked ? 'rgba(245, 158, 11, 0.45)' : 'var(--border)',
                }}
              >
                <span className="text-3xl shrink-0" aria-hidden="true">{ach.icon}</span>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black text-[#F8FAFC] truncate">
                    {isArabic ? ach.titleAr : ach.titleEn}
                  </h4>
                  <p className="text-[11px] font-medium text-[#CBD5E1] leading-snug">
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
