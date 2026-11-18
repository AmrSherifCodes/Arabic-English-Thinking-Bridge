import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressionState } from '../../progression/types';
import { TargetLanguage } from '../../types';
import { LanguageFlag } from '../LanguageFlag';
import { Map, Zap, Award, Trophy, User, Home } from 'lucide-react';
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
}

export function AppShell({
  activeTab,
  onTabChange,
  state,
  targetLang,
  children,
  isArabic = true,
  onOpenLanding,
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
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r rtl:border-l rtl:border-r-0 border-border bg-surface p-4 sticky top-0 h-screen justify-between z-40 shrink-0">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🧠</span>
              <div className="text-start">
                <h1 className="font-black text-sm text-text">فكّر إنجليزي</h1>
                <span className="text-[10px] text-success font-bold block">Thinking Bridge</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="space-y-1">
            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                className="btn-shiny w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-2xl font-black text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition text-start mb-2"
              >
                <Home size={18} />
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
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Left HUD: Landing Page Button 🏠 + Target Language Flag */}
            <div className="flex items-center gap-2">
              {onOpenLanding && (
                <button
                  type="button"
                  onClick={onOpenLanding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition active:scale-95 shrink-0 shadow-md"
                  title={isArabic ? 'العودة للصفحة الرئيسية' : 'Go back to Landing Page'}
                >
                  <Home size={14} className="text-stone-950 shrink-0" />
                  <span>{isArabic ? 'الرئيسية 🏠' : 'Home 🏠'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerHapticImpact();
                  setStreetDemoOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-black transition active:scale-95 shrink-0 shadow-md"
                title={isArabic ? 'عرض الشارع' : 'Street Mode'}
              >
                <Zap size={14} className="text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">{isArabic ? 'عرض الشارع 🚶‍♂️' : 'Street Mode 🚶‍♂️'}</span>
              </button>
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black transition active:scale-95 shrink-0 shadow-md"
                title="الكود مفتوح · Open Source Repository"
              >
                <span>الكود مفتوح · Open Source ↗</span>
              </a>
              <LanguageFlag code={targetLang} size={20} />
              <span className="text-xs font-black text-text uppercase hidden sm:inline">{targetLang}</span>
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

        {/* Dynamic Tab Body - Responsive Desktop / Laptop Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-8 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col">
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
          <footer className="mt-8 text-center pb-4">
            <button onClick={() => setPrivacyOpen(true)} className="text-xs text-muted hover:text-text transition-colors">Privacy</button>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar with Safe Area Insets (60px Touch Targets) */}
      <nav
        aria-label="التنقل الرئيسي · Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/98 backdrop-blur-xl border-t border-border px-2 pt-2 pb-[env(safe-area-inset-bottom)] flex items-center justify-around shadow-2xl"
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
              className={`flex flex-1 min-w-0 flex-col items-center justify-center py-2 px-1 min-h-[60px] rounded-2xl transition focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isActive
                  ? 'text-success font-black bg-success/20 ring-1 ring-success/40'
                  : 'text-muted font-bold hover:text-text hover:bg-surface-2'
              }`}
            >
              <Icon size={22} className={isActive ? 'scale-110 transition-transform' : ''} />
              <span className="text-[10px] mt-1 font-bold">{tab.labelAr}</span>
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
