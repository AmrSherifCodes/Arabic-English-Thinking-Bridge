import React from 'react';
import { ProgressionState } from '../../progression/types';
import { Trophy, Shield, Lock, EyeOff } from 'lucide-react';

interface LeagueViewProps {
  state: ProgressionState;
  onToggleOptOut: () => void;
  isArabic?: boolean;
}

export function LeagueView({ state, onToggleOptOut, isArabic = true }: LeagueViewProps) {
  if (state.leagueOptOut || state.isUnder13) {
    return (
      <div className="space-y-4 max-w-md mx-auto p-6 rounded-3xl bg-stone-900 border border-stone-800 text-center pb-24" dir={isArabic ? 'rtl' : 'ltr'}>
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
          className="px-4 py-2 rounded-xl bg-teal-500 text-stone-950 font-black text-xs transition hover:bg-teal-400"
        >
          {isArabic ? 'تفعيل الدوري الأسبوعي' : 'Enable Weekly League'}
        </button>
      </div>
    );
  }

  // Combine user entry into current league members
  const allMembers = [
    ...state.leagueMembers,
    {
      id: 'user-self',
      alias: `${state.anonymousAlias} (${isArabic ? 'أنت' : 'You'})`,
      avatarIcon: '👑',
      weeklyXp: state.weeklyXp || state.xp,
      tier: state.leagueTier,
      isUser: true,
    },
  ].sort((a, b) => b.weeklyXp - a.weeklyXp);

  return (
    <div className="space-y-4 max-w-md mx-auto pb-24" dir={isArabic ? 'rtl' : 'ltr'}>
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
            {isArabic ? 'الارتقاء أسبوعياً بناءً على نقاط XP المكتسبة' : 'Promote weekly based on earned XP'}
          </p>
        </div>

        <button
          onClick={onToggleOptOut}
          className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white text-xs font-bold"
          title={isArabic ? 'إخفاء الخصوصية' : 'Privacy Opt-Out'}
        >
          <Shield size={16} />
        </button>
      </div>

      {/* League Members Table / Honest Empty State */}
      {allMembers.length < 5 ? (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-2 shadow-lg">
          <Trophy className="mx-auto text-amber-400" size={32} />
          <h3 className="text-sm font-black text-white">
            {isArabic ? 'الدوري سينطلق فور انضمام 5 متعلمين!' : 'League Activates at 5 Real Learners!'}
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isArabic
              ? `يتواجد حالياً ${allMembers.length} متعلم حقيقي. التطبيق لا يستخدم أي حسابات وهمية (Bots) احتراماً للمنافسة العادلة.`
              : `Currently ${allMembers.length} real learner(s). We never populate fake bots to guarantee honest, real competition.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {allMembers.map((member, rank) => {
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
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">
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
      )}
    </div>
  );
}
