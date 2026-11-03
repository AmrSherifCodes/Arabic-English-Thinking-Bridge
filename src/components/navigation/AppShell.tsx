import React from 'react';
import { ProgressionState } from '../../progression/types';
import { TargetLanguage } from '../../types';
import { LanguageFlag } from '../LanguageFlag';
import { Map, Zap, Award, Trophy, User } from 'lucide-react';

export type AppTab = 'path' | 'practice' | 'quests' | 'league' | 'profile';

interface AppShellProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  state: ProgressionState;
  targetLang: TargetLanguage;
  children: React.ReactNode;
  isArabic?: boolean;
}

export function AppShell({
  activeTab,
  onTabChange,
  state,
  targetLang,
  children,
  isArabic = true,
}: AppShellProps) {
  const tabs = [
    { id: 'path' as AppTab, labelAr: 'المسار', labelEn: 'Path', icon: Map },
    { id: 'practice' as AppTab, labelAr: 'التدريب', labelEn: 'Practice', icon: Zap },
    { id: 'quests' as AppTab, labelAr: 'المهام', labelEn: 'Quests', icon: Award },
    { id: 'league' as AppTab, labelAr: 'الدوري', labelEn: 'League', icon: Trophy },
    { id: 'profile' as AppTab, labelAr: 'الملف', labelEn: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r rtl:border-l rtl:border-r-0 border-border bg-surface p-4 sticky top-0 h-screen justify-between z-40 shrink-0">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 px-2">
            <span className="text-2xl">🧠</span>
            <div className="text-start">
              <h1 className="font-black text-sm text-text">فكّر إنجليزي</h1>
              <span className="text-[10px] text-success font-bold block">Thinking Bridge v3.1.0</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-2xl font-bold text-xs transition text-start ${
                    isActive
                      ? 'bg-success/20 text-success border border-success/30 shadow-md'
                      : 'text-muted hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Icon size={18} />
                  <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Level Summary in Sidebar */}
        <div className="p-3.5 rounded-2xl bg-surface-2 border border-border text-start space-y-1">
          <span className="text-[10px] font-bold text-success block uppercase">
            {isArabic ? 'مستوى اللاعب' : 'Player Level'}
          </span>
          <span className="font-black text-xs text-text block">
            {isArabic ? `المستوى ${state.overallLevel}` : `Level ${state.overallLevel}`} ({state.xp} XP)
          </span>
        </div>
      </aside>

      {/* Main Content Area - Centered Mobile-First Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header HUD Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-surface/90 border-b border-border px-4 py-2.5">
          <div className="max-w-[480px] mx-auto flex items-center justify-between">
            {/* Left HUD: Target Language Flag */}
            <div className="flex items-center gap-2">
              <LanguageFlag code={targetLang} size={20} />
              <span className="text-xs font-black text-text uppercase">{targetLang}</span>
            </div>

            {/* Right HUD: Streak 🔥, XP 🏆, Shields 🛡️ */}
            <div className="flex items-center gap-2.5 text-xs font-black">
              <div className="flex items-center gap-1 text-primary bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/20">
                <span>🔥</span>
                <span>{state.streak}</span>
              </div>
              <div className="flex items-center gap-1 text-success bg-success/10 px-2.5 py-1.5 rounded-xl border border-success/20">
                <span>🏆</span>
                <span>{state.xp}</span>
              </div>
              <div className="flex items-center gap-1 text-text-soft bg-surface-2 px-2.5 py-1.5 rounded-xl border border-border">
                <span>🛡️</span>
                <span>{state.streakShields}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body - Centered Mobile-First Container (Max-Width 480px) */}
        <main className="flex-1 p-4 sm:p-6 pb-28 md:pb-6 overflow-y-auto max-w-[480px] mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar with Safe Area Insets */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-h-[48px] min-w-[48px] rounded-xl transition ${
                isActive ? 'text-success font-black' : 'text-muted font-semibold hover:text-text'
              }`}
            >
              <Icon size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
              <span className="text-[10px] mt-0.5">{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
