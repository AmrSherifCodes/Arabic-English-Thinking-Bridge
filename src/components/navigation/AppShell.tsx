import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressionState } from '../../progression/types';
import { TargetLanguage } from '../../types';
import { LanguageFlag } from '../LanguageFlag';
import { Map, Zap, Award, Trophy, User, Home, Waves, Anchor } from 'lucide-react';
import { PrivacyPolicyModal } from '../progression/PrivacyPolicyModal';
import { StreetDemoModal } from '../StreetDemoModal';
import { triggerHapticImpact } from '../../utils/fx';

export type AppTab = 'path' | 'practice' | 'quests' | 'league' | 'profile';

interface AppShellProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  state: ProgressionState;
  targetLang: TargetLanguage;
  children: React.ReactNode;
  isArabic?: boolean;
  onOpenLanding?: () => void;
  onOpenLanguageSelector?: () => void;
}

export function AppShell({
  activeTab,
  onTabChange,
  state,
  targetLang,
  children,
  isArabic = true,
  onOpenLanding,
  onOpenLanguageSelector,
}: AppShellProps) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [streetDemoOpen, setStreetDemoOpen] = useState(false);

  const tabs = [
    { id: 'path' as AppTab, labelAr: 'المسار', labelEn: 'Path', icon: Map },
    { id: 'practice' as AppTab, labelAr: 'التدريب', labelEn: 'Practice', icon: Zap },
    { id: 'quests' as AppTab, labelAr: 'المهام', labelEn: 'Quests', icon: Award },
    { id: 'league' as AppTab, labelAr: 'الدوري', labelEn: 'League', icon: Trophy },
    { id: 'profile' as AppTab, labelAr: 'الملف', labelEn: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#060E1A] text-slate-100 flex flex-col md:flex-row" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r rtl:border-l rtl:border-r-0 border-cyan-500/20 bg-[#0B1C33] p-4 sticky top-0 h-screen justify-between z-40 shrink-0 shadow-xl">
        <div className="space-y-6">
          {/* Logo Branding - Alexandrian Touch */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B1C33] rounded-[14px] flex items-center justify-center text-xl">
                  ⚓
                </div>
              </div>
              <div className="text-start">
                <div className="flex items-center gap-1">
                  <h1 className="font-black text-sm text-white">فكّر إنجليزي</h1>
                  <span className="text-[10px] text-cyan-400 font-bold">🌊</span>
                </div>
                <span className="text-[10px] text-cyan-300/80 font-bold block">Made in Alexandria ⚓</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="space-y-1.5">
            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                className="btn-shiny w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-2xl font-black text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition text-start mb-2 shadow-sm"
              >
                <Home size={18} className="text-amber-400 shrink-0" />
                <span>{isArabic ? 'الصفحة الرئيسية 🏠' : 'Landing Page 🏠'}</span>
              </button>
            )}
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHapticImpact();
                    onTabChange(tab.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-2xl font-bold text-xs transition text-start ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-transparent text-cyan-300 border border-cyan-400/30 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Level Summary in Sidebar - Alexandrian Citadel Badge */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 text-start space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-cyan-400 block uppercase tracking-wider">
              {isArabic ? 'مستوى البحر والممارسة 🌊' : 'Level & Sea Rank'}
            </span>
            <Anchor size={12} className="text-amber-400" />
          </div>
          <span className="font-black text-xs text-white block">
            {isArabic ? `المستوى ${state?.overallLevel ?? 1}` : `Level ${state?.overallLevel ?? 1}`} ({state?.xp ?? 0} XP)
          </span>
        </div>
      </aside>

      {/* Main Content Area - Centered Mobile-First Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header HUD Bar - Alexandrian Glassmorphism */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#060E1A]/90 border-b border-cyan-500/20 px-3 sm:px-4 py-2.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            {/* Left HUD: Landing Page Button 🏠 + Target Language Flag */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
              {onOpenLanding && (
                <button
                  type="button"
                  onClick={onOpenLanding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition active:scale-95 shrink-0 shadow-md shadow-amber-500/20"
                  title={isArabic ? 'العودة للصفحة الرئيسية' : 'Go back to Landing Page'}
                >
                  <Home size={14} className="text-slate-950 shrink-0" />
                  <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerHapticImpact();
                  setStreetDemoOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-black transition active:scale-95 shrink-0 shadow-sm"
                title={isArabic ? 'عرض الشارع' : 'Street Mode'}
              >
                <Zap size={14} className="text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">{isArabic ? 'عرض الشارع 🚶‍♂️' : 'Street Mode 🚶‍♂️'}</span>
              </button>
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black transition active:scale-95 shrink-0 shadow-sm"
                title="الكود مفتوح · Open Source Repository"
              >
                <span>Open Source ⚡</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  triggerHapticImpact();
                  onOpenLanguageSelector?.();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0B1C33] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 text-xs font-black transition active:scale-95 shrink-0 shadow-sm cursor-pointer"
                title={isArabic ? 'تغيير اللغة' : 'Change Language'}
              >
                <LanguageFlag code={targetLang} size={18} />
                <span className="text-[11px] font-black uppercase">{targetLang}</span>
              </button>
            </div>

            {/* Right HUD: Streak 🔥, XP 🏆, Shields 🛡️ - Glowing Alexandrian Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-black shrink-0">
              <div className="flex items-center gap-1 text-amber-300 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-2.5 py-1.5 rounded-xl border border-amber-500/30 shadow-sm">
                <span>🔥</span>
                <span>{state?.streak ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-300 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 shadow-sm">
                <span>🏆</span>
                <span>{state?.xp ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 bg-[#0B1C33] px-2.5 py-1.5 rounded-xl border border-cyan-500/20">
                <span>🛡️</span>
                <span>{state?.streakShields ?? 2}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body - Responsive Desktop / Laptop Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-8 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <footer className="mt-8 text-center pb-4 space-y-1">
            <p className="text-[11px] text-cyan-400/70 font-bold">
              {isArabic ? '🌊 تطبيق من الإسكندرية · Made in Alexandria' : '🌊 Built in Alexandria, Egypt'}
            </p>
            <button onClick={() => setPrivacyOpen(true)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Privacy & Legal
            </button>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar - Alexandrian Floating Glass (60px Touch Targets) */}
      <nav
        aria-label="التنقل الرئيسي · Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#061224]/95 backdrop-blur-2xl border-t border-cyan-500/25 px-2 pt-2 pb-[calc(6px+env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-8px_32px_rgba(6,182,212,0.18)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = `${tab.labelAr} · ${tab.labelEn}`;
          return (
            <button
              key={tab.id}
              type="button"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                triggerHapticImpact();
                onTabChange(tab.id);
              }}
              className={`flex flex-1 min-w-0 flex-col items-center justify-center py-1.5 px-1 min-h-[58px] rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isActive
                  ? 'text-cyan-300 font-black bg-gradient-to-b from-cyan-500/25 to-teal-500/15 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]'
                  : 'text-slate-400 font-bold hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon size={21} className={isActive ? 'text-cyan-300 transition-transform scale-110' : 'text-slate-400'} />
              <span className="text-[10px] mt-1 font-extrabold tracking-tight">{tab.labelAr}</span>
            </button>
          );
        })}
      </nav>

      <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <StreetDemoModal
        isOpen={streetDemoOpen}
        onClose={() => setStreetDemoOpen(false)}
        onLaunchFullApp={() => {
          setStreetDemoOpen(false);
          onTabChange('path');
        }}
        isArabic={isArabic}
      />
    </div>
  );
}
