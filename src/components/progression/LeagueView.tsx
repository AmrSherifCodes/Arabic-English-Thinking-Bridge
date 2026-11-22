import React from 'react';
import { ProgressionState } from '../../progression/types';
import { Trophy, Shield, EyeOff } from 'lucide-react';

interface LeagueViewProps {
  state: ProgressionState;
  onToggleOptOut: () => void;
  isArabic?: boolean;
}

export function LeagueView({ state, onToggleOptOut, isArabic = true }: LeagueViewProps) {
  if (state.leagueOptOut || state.isUnder13) {
    return (
      <div className="space-y-4 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto p-6 rounded-3xl bg-stone-900 border border-stone-800 text-center pb-24" dir={isArabic ? 'rtl' : 'ltr'}>
        <EyeOff className="mx-auto text-amber-400" size={32} />
        <h3 className="text-sm font-black text-white">
          {isArabic ? 'الدوري الأسبوعي معطل' : 'Weekly League Disabled'}
        </h3>
        <p className="text-xs text-stone-400 leading-relaxed">
          {isArabic
            ? 'تم إيقاف عرض الدوري لحماية الخصوصية وتقليل التشتت. يمكنك إعادة تفعيله في أي وقت من الإعدادات.'
            : 'League mode is disabled for privacy and focus. You can re-enable it anytime in settings.'}
        </p>
        <button
          onClick={onToggleOptOut}
          className="px-4 py-2.5 min-h-[48px] rounded-xl bg-teal-500 text-stone-950 font-black text-xs transition hover:bg-teal-400 cursor-pointer"
        >
          {isArabic ? 'تفعيل الدوري الأسبوعي' : 'Enable Weekly League'}
        </button>
      </div>
    );
  }

  const baseMembers = [
    ...(state.leagueMembers || []),
    {
      id: 'user-self',
      alias: `${state.anonymousAlias || 'أنت'} (${isArabic ? 'أنت' : 'You'})`,
      avatarIcon: '👑',
      weeklyXp: state.weeklyXp || state.xp || 0,
      tier: state.leagueTier,
      isUser: true,
    },
  ];

  const offlineRivals = [
    { id: 'rival-1', alias: 'أحمد (متدرّب افتراضي)', avatarIcon: '⚡', weeklyXp: 120, tier: state.leagueTier, isUser: false },
    { id: 'rival-2', alias: 'مريم (متدرّبة افتراضية)', avatarIcon: '🌟', weeklyXp: 95, tier: state.leagueTier, isUser: false },
    { id: 'rival-3', alias: 'يوسف (متدرّب افتراضي)', avatarIcon: '🔥', weeklyXp: 60, tier: state.leagueTier, isUser: false },
    { id: 'rival-4', alias: 'سارة (متدرّبة افتراضية)', avatarIcon: '🎯', weeklyXp: 30, tier: state.leagueTier, isUser: false },
  ];

  const allMembers = baseMembers.length < 5
    ? [...baseMembers, ...offlineRivals.slice(0, 5 - baseMembers.length)]
    : baseMembers;

  const sortedMembers = allMembers.sort((a, b) => b.weeklyXp - a.weeklyXp);

  return (
    <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Tier Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950 to-stone-900 border border-amber-500/40 text-start shadow-xl flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-amber-400 block">
            {isArabic ? 'الدوري الأسبوعي الآمن' : 'Safe Weekly League'}
          </span>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <Trophy className="text-amber-400" size={18} />
            <span>{isArabic ? `دوري ${state.leagueTier}` : `${state.leagueTier} League`}</span>
          </h2>
          <p className="text-[11px] text-stone-400">
            {isArabic ? 'التنافس والارتقاء أسبوعياً بناءً على نقاط XP' : 'Promote weekly based on earned XP'}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleOptOut}
          aria-label={isArabic ? 'إخفاء الخصوصية' : 'Privacy Opt-Out'}
          className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-stone-800 text-stone-400 hover:text-white text-xs font-bold cursor-pointer shrink-0"
          title={isArabic ? 'إخفاء الخصوصية' : 'Privacy Opt-Out'}
        >
          <Shield size={18} />
        </button>
      </div>

      {baseMembers.length < 5 && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-bold">
          {isArabic ? '⚡ تحدّي تجريبي محلي حتى ينضم متعلمون جدد' : '⚡ Local practice challenge until new learners join'}
        </div>
      )}

      {/* League Members Table */}
      <div className="space-y-2">
        {sortedMembers.map((member, rank) => {
          const isTop3 = rank < 3;
          return (
            <div
              key={member.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                member.isUser
                  ? 'bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/30 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-black text-xs ${isTop3 ? 'text-amber-400' : 'text-stone-500'}`}>
                  #{rank + 1}
                </span>
                <span className="text-xl">{member.avatarIcon}</span>
                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                  {member.alias}
                </span>
              </div>

              <span className="text-xs font-black text-amber-400">
                {member.weeklyXp} XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
