import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressionState } from '../../progression/types';
import { TargetLanguage } from '../../types';
import { LanguageFlag } from '../LanguageFlag';
import { Map, Zap, Award, Trophy, User, Home, Waves, Anchor, Baby } from 'lucide-react';
import { PrivacyPolicyModal } from '../progression/PrivacyPolicyModal';
import { StreetDemoModal } from '../StreetDemoModal';
import { SupportModal } from '../SupportModal';
import { triggerHapticImpact } from '../../utils/fx';
import { isYouTubeSubscribed } from '../../utils/youtubeSupporter';
import { openSafeExternalUrl } from '../../utils/safeExternalUrl';
import { useUiMode } from '../../utils/uiMode';
import { useLearnerMode } from '../../utils/learnerMode';

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
  onOpenAgeGate?: () => void;
  onOpenSupporterPopup?: () => void;
}

function YoutubeSupporterPill({
  isArabic,
  compact,
  onOpenSupporterPopup,
}: {
  isArabic: boolean;
  compact?: boolean;
  onOpenSupporterPopup?: () => void;
}) {
  const [subscribed, setSubscribed] = useState(() => isYouTubeSubscribed());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.subscribed === 'boolean') {
        setSubscribed(detail.subscribed);
      }
    };
    window.addEventListener('tb:supporter-change', handler);
    return () => window.removeEventListener('tb:supporter-change', handler);
  }, []);

  const handleClick = () => {
    if (!subscribed && onOpenSupporterPopup) {
      onOpenSupporterPopup();
      return;
    }
    openSafeExternalUrl('https://www.youtube.com/@sciamrsherif');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-2.5 py-2 min-h-[44px] rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer active:scale-95 bg-amber-500/15 text-amber-300 border border-amber-500/35 hover:bg-amber-500/25"
      title={isArabic ? 'قناة @sciamrsherif على يوتيوب' : '@sciamrsherif YouTube channel'}
    >
      <span className="truncate">
        {compact
          ? (subscribed ? (isArabic ? '☀️ داعم' : '☀️ Subbed') : (isArabic ? '▶️ القناة' : '▶️ YouTube'))
          : (subscribed ? (isArabic ? '☀️ داعم لقناة @sciamrsherif' : '☀️ Supporter @sciamrsherif') : (isArabic ? '▶️ اشترك في @sciamrsherif' : '▶️ Subscribe @sciamrsherif'))}
      </span>
    </button>
  );
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
  onOpenAgeGate,
  onOpenSupporterPopup,
}: AppShellProps) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [streetDemoOpen, setStreetDemoOpen] = useState(false);
  const [uiMode, setUiMode] = useUiMode();
  const [learnerMode, setLearnerMode] = useLearnerMode();

  const isKids = learnerMode === 'kids';

  const tabs = isKids
    ? [
        { id: 'path' as AppTab, labelAr: 'تعلّم 🎈', labelEn: 'Learn 🎈', icon: Map },
        { id: 'practice' as AppTab, labelAr: 'الأصوات 🔊', labelEn: 'Sounds 🔊', icon: Zap },
        { id: 'profile' as AppTab, labelAr: 'حسابي 🧸', labelEn: 'Profile 🧸', icon: User },
      ]
    : uiMode === 'simple'
      ? [
          { id: 'path' as AppTab, labelAr: 'تعلّم', labelEn: 'Learn', icon: Map },
          { id: 'practice' as AppTab, labelAr: 'القاموس', labelEn: 'Dictionary', icon: Zap },
          { id: 'profile' as AppTab, labelAr: 'حسابي', labelEn: 'Profile', icon: User },
        ]
      : [
          { id: 'path' as AppTab, labelAr: 'المسار', labelEn: 'Path', icon: Map },
          { id: 'practice' as AppTab, labelAr: 'التدريب', labelEn: 'Practice', icon: Zap },
          { id: 'quests' as AppTab, labelAr: 'المهام', labelEn: 'Quests', icon: Award },
          { id: 'league' as AppTab, labelAr: 'الدوري', labelEn: 'League', icon: Trophy },
          { id: 'profile' as AppTab, labelAr: 'الملف', labelEn: 'Profile', icon: User },
        ];

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      onTabChange('path');
    }
  }, [activeTab, isKids, uiMode, onTabChange]);

  return (
    <div className={`min-h-[100dvh] bg-[#060E1A] text-slate-100 flex flex-col md:flex-row overflow-x-hidden ${isKids ? 'tb-kids-mode' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r rtl:border-l rtl:border-r-0 border-cyan-500/20 bg-[#0B1C33] p-4 sticky top-0 h-[100dvh] justify-between z-40 shrink-0 shadow-xl">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B1C33] rounded-[14px] flex items-center justify-center text-xl">
                  {isKids ? '🎈' : '⚓'}
                </div>
              </div>
              <div className="text-start">
                <div className="flex items-center gap-1">
                  <h1 className="font-black text-sm text-white">
                    {isKids ? (isArabic ? 'فكّر إنجليزي 🎈' : 'Thinking English 🎈') : (isArabic ? 'فكّر إنجليزي' : 'Thinking English')}
                  </h1>
                  <span className="text-[10px] text-cyan-400 font-bold">🌊</span>
                </div>
                <span className="text-[10px] text-cyan-300/80 font-bold block">
                  {isKids
                    ? (isArabic ? 'نسخة الأطفال ٤-١٢ سنة 🎈' : 'Kids Mode 4-12 Yrs 🎈')
                    : (isArabic ? 'صُنع في الإسكندرية ⚓' : 'Made in Alexandria ⚓')}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="space-y-1.5">
            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                className="btn-shiny w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-2xl font-black text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition text-start mb-2 shadow-sm cursor-pointer active:scale-98"
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
                  type="button"
                  onClick={() => {
                    triggerHapticImpact();
                    onTabChange(tab.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-2xl font-bold text-xs transition text-start cursor-pointer active:scale-98 ${
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

        {/* User Level Summary in Sidebar */}
        <div className="space-y-2">
          <YoutubeSupporterPill isArabic={isArabic} onOpenSupporterPopup={onOpenSupporterPopup} />
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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header HUD Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-[#06101c]/95 border-b border-cyan-500/20 px-3 sm:px-4 pb-2.5 pt-safe">
          <div className="max-w-4xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
            {/* Left HUD Controls */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 py-0.5 min-w-0">
              {onOpenLanding && (
                <button
                  type="button"
                  onClick={onOpenLanding}
                  className="md:hidden flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition active:scale-95 shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
                  title={isArabic ? 'العودة للصفحة الرئيسية' : 'Go back to Landing Page'}
                >
                  <Home size={14} className="text-slate-950 shrink-0" />
                  <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
                </button>
              )}
              <div className="md:hidden">
                <YoutubeSupporterPill isArabic={isArabic} compact onOpenSupporterPopup={onOpenSupporterPopup} />
              </div>

              {!isKids && uiMode === 'pro' && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticImpact();
                    setStreetDemoOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-black transition active:scale-95 shrink-0 shadow-sm cursor-pointer"
                  title={isArabic ? 'عرض الشارع' : 'Street Mode'}
                >
                  <Zap size={14} className="text-cyan-400 shrink-0" />
                  <span className="hidden sm:inline">{isArabic ? 'عرض الشارع 🚶‍♂️' : 'Street Mode 🚶‍♂️'}</span>
                </button>
              )}

              {/* Language Flag Selector Trigger */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticImpact();
                  onOpenLanguageSelector?.();
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] rounded-xl bg-[#0B1C33] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 text-xs font-black transition active:scale-95 shrink-0 shadow-sm cursor-pointer"
                title={isArabic ? 'تغيير لغة التعلم' : 'Change Target Language'}
              >
                <LanguageFlag code={targetLang} size={18} />
                <span className="text-[11px] font-black uppercase">{targetLang}</span>
              </button>

              {/* Learner Mode Toggle (Kids vs Regular) */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[#0B1C33] border border-pink-500/30 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticImpact();
                    setLearnerMode('kids');
                  }}
                  className={`px-2 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                    isKids ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isArabic ? 'وضع الأطفال (4-12 سنة)' : 'Kids Mode (Ages 4-12)'}
                >
                  <span>🎈</span>
                  <span>{isArabic ? 'أطفال' : 'Kids'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHapticImpact();
                    setLearnerMode('regular');
                  }}
                  className={`px-2 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                    !isKids ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isArabic ? 'النسخة العادية (13+ سنة)' : 'Regular Mode (Ages 13+)'}
                >
                  <span>👤</span>
                  <span>{isArabic ? 'كبار' : 'Adults'}</span>
                </button>
              </div>

              {/* 1-Tap Simple | Pro Mode Switcher (In Regular Mode) */}
              {!isKids && (
                <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[#0B1C33] border border-cyan-500/30 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticImpact();
                      setUiMode('simple');
                    }}
                    className={`px-2 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center ${
                      uiMode === 'simple' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isArabic ? 'الوضع البسيط (للمبتدئين)' : 'Simple Mode'}
                  >
                    🟢 {isArabic ? 'بسيط' : 'Simple'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticImpact();
                      setUiMode('pro');
                    }}
                    className={`px-2 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center ${
                      uiMode === 'pro' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isArabic ? 'الوضع المتقدم (كل الأدوات)' : 'Pro Mode'}
                  >
                    ⚡ {isArabic ? 'متقدم' : 'Pro'}
                  </button>
                </div>
              )}
            </div>

            {/* Right HUD: Streak 🔥, XP 🏆, Shields 🛡️ */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-black shrink-0">
              <div className="flex items-center gap-1 text-amber-300 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-2.5 py-2 min-h-[44px] rounded-xl border border-amber-500/30 shadow-sm">
                <span>🔥</span>
                <span>{state?.streak ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-300 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 px-2.5 py-2 min-h-[44px] rounded-xl border border-cyan-500/30 shadow-sm">
                <span>🏆</span>
                <span>{state?.xp ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 bg-[#0B1C33] px-2.5 py-2 min-h-[44px] rounded-xl border border-cyan-500/20">
                <span>🛡️</span>
                <span>{state?.streakShields ?? 2}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
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
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="text-xs text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer min-h-[44px] px-3 inline-flex items-center justify-center"
              >
                ☕ {isArabic ? 'ادعم التطبيق' : 'Support the app'}
              </button>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer min-h-[44px] px-3 inline-flex items-center justify-center"
              >
                {isArabic ? 'الخصوصية والقوانين' : 'Privacy & Legal'}
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="التنقل الرئيسي · Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#06101c]/95 backdrop-blur-md border-t border-cyan-500/25 px-2 pt-2 pb-safe flex items-center justify-around shadow-[0_-8px_32px_rgba(6,182,212,0.18)]"
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
              className={`flex flex-1 min-w-0 flex-col items-center justify-center py-1.5 px-1 min-h-[58px] rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-cyan-300 font-black bg-gradient-to-b from-cyan-500/25 to-teal-500/15 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]'
                  : 'text-slate-400 font-bold hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon size={21} className={isActive ? 'text-cyan-300 transition-transform scale-110' : 'text-slate-400'} />
              <span className="text-[10px] mt-1 font-extrabold tracking-tight leading-tight text-center">{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>

      <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <SupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        isArabic={isArabic}
      />
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
