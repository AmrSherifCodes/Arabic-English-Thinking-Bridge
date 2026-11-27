// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { Map, Gamepad2, BookOpen, User, BookmarkCheck, Flame, Trophy } from 'lucide-react';
import { AmrGuide } from '../components/AmrGuide';
import { QuestsView } from '../components/progression/QuestsView';
import { LeagueView } from '../components/progression/LeagueView';
import type { ProgressionState } from '../progression/types';
import type { AppTab, AppView } from './useAppNavigation';

const NAV_TABS = [
  { id: 'path' as const, ar: 'الخريطة', en: 'Map', Icon: Map },
  { id: 'arcade' as const, ar: 'الأركيد', en: 'Arcade', Icon: Gamepad2 },
  { id: 'practice' as const, ar: 'التدريب', en: 'Practice', Icon: BookOpen },
  { id: 'profile' as const, ar: 'ملفي', en: 'Profile', Icon: User },
];

export function DesktopSidebar({
  isArabic,
  progression,
  wordBankCount,
  activeTab,
  onSelectTab,
  onOpenWordBank,
}: {
  isArabic: boolean;
  progression: ProgressionState;
  wordBankCount: number;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenWordBank: () => void;
}) {
  return (
    <aside className="hidden lg:flex lg:col-span-4 flex-col gap-4 sticky top-[68px]">
      <div
        className="p-4 rounded-3xl border flex items-center gap-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <AmrGuide mood="welcome" isArabic={isArabic} size={68} />
        <div className="min-w-0 text-start">
          <h2 className="text-base font-black text-[#F8FAFC]">
            {isArabic ? 'جسر التفكير' : 'Thinking Bridge'}
          </h2>
          <p className="text-xs font-medium text-[#CBD5E1]">
            {isArabic ? 'مجاني 100% · يعمل بدون إنترنت' : '100% Free · Offline-First'}
          </p>
        </div>
      </div>

      <div
        className="p-4 rounded-3xl border space-y-3 text-start"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#CBD5E1]">
            {isArabic ? 'ملخص مستواك' : 'Level Summary'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#10B981] text-[#0B1120]">
            {progression.currentLevelId || 'A1'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#CBD5E1]">
              <Flame size={14} className="text-[#F59E0B]" />
              <span>{isArabic ? 'السلسلة' : 'Streak'}</span>
            </div>
            <div className="text-xl font-black text-[#F8FAFC] mt-1">{progression.streak || 0}</div>
          </div>
          <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#CBD5E1]">
              <Trophy size={14} className="text-[#22D3EE]" />
              <span>XP</span>
            </div>
            <div className="text-xl font-black text-[#22D3EE] mt-1">{progression.xp || 0}</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenWordBank}
        className="p-4 rounded-3xl border flex items-center justify-between gap-3 text-start cursor-pointer transition hover:border-[#F59E0B]/60"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center text-[#FBBF24] shrink-0">
            <BookmarkCheck size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-[#F8FAFC]">
              {isArabic ? 'بنك الكلمات الشخصي' : 'Personal Word Bank'}
            </div>
            <div className="text-xs font-medium text-[#CBD5E1]">
              {isArabic ? `${wordBankCount} كلمة محفوظة` : `${wordBankCount} words unlocked`}
            </div>
          </div>
        </div>
        <span className="text-xs font-black text-[#FBBF24] shrink-0">
          {isArabic ? 'فتح' : 'Open'}
        </span>
      </button>

      <nav
        aria-label={isArabic ? 'التنقل الجانبي' : 'Sidebar Navigation'}
        className="p-2 rounded-3xl border grid grid-cols-2 gap-1.5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {NAV_TABS.map(({ id, ar, en, Icon }) => {
          const isSelected = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className="min-h-[48px] px-3 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition"
              style={
                isSelected
                  ? { backgroundColor: '#10B981', color: '#0B1120' }
                  : { backgroundColor: 'var(--bg)', color: '#CBD5E1' }
              }
            >
              <Icon size={16} />
              <span>{isArabic ? ar : en}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomTabDock({
  isArabic,
  activeTab,
  onSelectTab,
}: {
  isArabic: boolean;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}) {
  return (
    <nav
      aria-label={isArabic ? 'التنقل الرئيسي' : 'Main Navigation'}
      className="tb-hud-bar lg:hidden fixed bottom-0 inset-x-0 z-40 border-t"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="max-w-[480px] mx-auto grid grid-cols-4 gap-1 px-2 py-1.5">
        {NAV_TABS.map(({ id, ar, en, Icon }) => {
          const isSelected = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={isSelected ? 'page' : undefined}
              className="min-h-[48px] px-1 py-1.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-black leading-tight text-center cursor-pointer transition"
              style={
                isSelected
                  ? { backgroundColor: 'rgba(16, 185, 129, 0.18)', color: '#10B981' }
                  : { color: '#CBD5E1' }
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="break-words">{isArabic ? ar : en}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function ArcadeTabView({
  isArabic,
  progression,
  onOpenLightningBlitz,
  onOpenPractice,
  onSetView,
  onUpdateProgression,
}: {
  isArabic: boolean;
  progression: ProgressionState;
  onOpenLightningBlitz: () => void;
  onOpenPractice: () => void;
  onSetView: (view: AppView) => void;
  onUpdateProgression: (updater: (prev: ProgressionState) => ProgressionState) => void;
}) {
  return (
    <div className="space-y-5">
      <section
        className="tb-card-surface p-4 rounded-3xl border space-y-3 text-start"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-base font-black text-[#F8FAFC]">
            🎮 {isArabic ? 'الأركيد والتحديات السريعة' : 'Arcade & Quick Challenges'}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#F59E0B] text-[#0B1120]">
            +40 🪙
          </span>
        </div>

        <button
          type="button"
          data-testid="launch-lightning-blitz-arcade"
          onClick={onOpenLightningBlitz}
          className="w-full min-h-[64px] p-4 rounded-2xl border-2 text-start flex items-center justify-between gap-3 cursor-pointer tb-btn-3d"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(16, 185, 129, 0.16))',
            borderColor: '#22D3EE',
            color: '#F8FAFC',
          }}
        >
          <div className="min-w-0 space-y-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22D3EE] text-[#0B1120] text-[10px] font-black">
              ⚡ {isArabic ? 'العب فوراً · ضغطة واحدة' : '1-TAP SPEED MODE'}
            </span>
            <span className="text-base font-black block text-[#F8FAFC]">
              {isArabic ? 'تحدي الـ 60 ثانية ⚡' : '60-Second Lightning Blitz ⚡'}
            </span>
            <span className="text-[11px] font-bold text-[#CBD5E1] block">
              {isArabic ? 'كومبو x2 → x5 · رقم قياسي · مزامنة فورية للمتصدرين' : 'x2 → x5 combo · Personal Best · Global Leaderboard XP'}
            </span>
          </div>
          <span className="w-11 h-11 rounded-2xl bg-[#22D3EE] text-[#0B1120] font-black text-xl flex items-center justify-center shrink-0 shadow-lg">
            ⚡
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenPractice}
            className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'rgba(245, 158, 11, 0.45)', color: '#F8FAFC' }}
          >
            <span className="text-base block">⚔️</span>
            <span className="text-xs font-black block">{isArabic ? 'الأركيد والزعماء' : 'Arcade & Bosses'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetView({ name: 'exam' })}
            className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: '#F8FAFC' }}
          >
            <span className="text-base block">🧭</span>
            <span className="text-xs font-black block">{isArabic ? 'اختبار تحديد المستوى' : 'Quick Level Check'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetView({ name: 'story', chapterId: 'chapter-1-cairo-airport' })}
            className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: '#F8FAFC' }}
          >
            <span className="text-base block">✈️</span>
            <span className="text-xs font-black block">{isArabic ? 'القصة التفاعلية' : 'Interactive Story'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetView({ name: 'language-game' })}
            className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: '#F8FAFC' }}
          >
            <span className="text-base block">🕹️</span>
            <span className="text-xs font-black block">{isArabic ? 'لعبة الجسر السريعة' : 'Bridge Speed Game'}</span>
          </button>
        </div>
      </section>

      <QuestsView state={progression} isArabic={isArabic} />
      <LeagueView
        state={progression}
        onToggleOptOut={() => onUpdateProgression((p) => ({ ...p, leagueOptOut: !p.leagueOptOut }))}
        onUpdateAlias={(alias) => onUpdateProgression((p) => ({ ...p, anonymousAlias: alias }))}
        isArabic={isArabic}
      />
    </div>
  );
}
