import React from 'react';
import { ProgressionState } from '../../progression/types';
import { TargetLanguage } from '../../types';
import { LanguageFlag } from '../LanguageFlag';
import { Map, Zap, Award, Trophy, User, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] flex flex-col md:flex-row" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Desktop Left Rail / Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-e border-[#1E2933] bg-[#0F151C] p-4 sticky top-0 h-screen justify-between z-40">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl">🧠</span>
            <div className="text-start">
              <h1 className="font-black text-sm text-white">فكّر إنجليزي</h1>
              <span className="text-[10px] text-teal-400 font-bold block">Thinking Bridge v3.0.4</span>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition text-start ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
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
        <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-start space-y-1">
          <span className="text-[10px] font-bold text-teal-400 block uppercase">
            {isArabic ? 'مستوى اللاعب' : 'Player Level'}
          </span>
          <span className="font-black text-xs text-white block">
            {isArabic ? `المستوى ${state.overallLevel}` : `Level ${state.overallLevel}`} ({state.xp} XP)
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header HUD Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0F151C]/90 border-b border-[#1E2933] px-4 py-2.5">
          <div className="max-w-md md:max-w-4xl mx-auto flex items-center justify-between">
            {/* Left HUD: Target Language Flag */}
            <div className="flex items-center gap-2">
              <LanguageFlag code={targetLang} size={20} />
              <span className="text-xs font-black text-white uppercase">{targetLang}</span>
            </div>

            {/* Right HUD: Streak 🔥, XP 🏆, Shields 🛡️ */}
            <div className="flex items-center gap-3 text-xs font-black">
              <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-xl border border-amber-500/20">
                <span>🔥</span>
                <span>{state.streak}</span>
              </div>
              <div className="flex items-center gap-1 text-teal-400 bg-teal-500/10 px-2 py-1 rounded-xl border border-teal-500/20">
                <span>🏆</span>
                <span>{state.xp}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded-xl border border-blue-500/20">
                <span>🛡️</span>
                <span>{state.streakShields}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F151C]/95 backdrop-blur-lg border-t border-[#1E2933] px-2 py-2 flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-teal-400 font-black' : 'text-stone-400 font-semibold hover:text-stone-200'
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
