import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Swords,
  Sparkles,
  CheckCircle2,
  Youtube,
  Lock,
  Unlock,
  ExternalLink,
  BookOpen,
  Mic,
  Star,
  Download,
  Shield,
  Layers,
} from 'lucide-react';

export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'english' | 'arabic';
}

interface StepData {
  badge: { en: string; ar: string };
  title: { en: string; ar: string };
  desc: { en: string; ar: string };
  image?: string;
  illustrationType?: 'avatar' | 'features' | 'karaoke' | 'offline';
  actionText?: { en: string; ar: string };
}

// 1. Attack on Titan Survey Corps Edition Steps
const AOT_STEPS: StepData[] = [
  {
    image: '/tutorial/pose1.png',
    badge: { en: '⚔️ Step 1: Gear Briefing', ar: '⚔️ الخطوة ١: استعراض العتاد' },
    title: { en: 'Welcome, Commander!', ar: 'أهلاً بك أيها القائد!' },
    desc: {
      en: "Your mission is to bridge the gap between Arabic and English thinking. Let's run through your gear.",
      ar: 'مهمتك هي ردم الفجوة بين التفكير بالعربية والإنجليزية. دعنا نستعرض العدة.'
    }
  },
  {
    image: '/tutorial/pose2.png',
    badge: { en: '🗺️ Step 2: Tactical Routes', ar: '🗺️ الخطوة ٢: المسارات التكتيكية' },
    title: { en: 'Choose Your Path', ar: 'اختر مسارك' },
    desc: {
      en: 'Navigate through Voice Practice, Lessons, and Flashcards. Your progression adapts to your level.',
      ar: 'تنقل بين تدريب المحادثة والدروس والبطاقات التعليمية. تقدمك يتكيف مع مستواك.'
    }
  },
  {
    image: '/tutorial/pose3.png',
    badge: { en: '✨ Step 3: Neural Bridge', ar: '✨ الخطوة ٣: لحظة الإلهام' },
    title: { en: 'The Aha! Moment', ar: 'لحظة الإلهام!' },
    desc: {
      en: 'Watch the AI speak with Karaoke highlighting. Words marked with a purple ★ are new to your vocabulary.',
      ar: 'شاهد الذكاء الاصطناعي يتحدث مع تظليل الكلمات. الكلمات المميزة بنجمة بنفسجية ★ هي جديدة في قاموسك.'
    }
  },
  {
    image: '/tutorial/pose4.png',
    badge: { en: '🚀 Step 4: Shinzou wo Sasageyo!', ar: '🚀 الخطوة ٤: جاهز للميدان' },
    title: { en: 'Ready for Deployment', ar: 'جاهز للانطلاق' },
    desc: {
      en: "You're all set! You can download the offline Android APK from the menu and start your journey.",
      ar: 'كل شيء جاهز! يمكنك تحميل تطبيق الأندرويد من القائمة وبدء رحلتك.'
    },
    actionText: {
      en: 'Shinzou wo Sasageyo! ⚔️',
      ar: 'كرّس قلبك! ⚔️'
    }
  }
];

// 2. Standard Edition Steps
const STANDARD_STEPS: StepData[] = [
  {
    image: '/amr-guide/pose1.png',
    badge: { en: '👋 Step 1: Foundation', ar: '👋 الخطوة ١: الأساس' },
    title: { en: 'Welcome to Thinking Bridge!', ar: 'أهلاً بك في جسر التفكير!' },
    desc: {
      en: 'Learn English by thinking in structures rather than memorizing tables. Designed to dismantle native Arabic interference.',
      ar: 'تعلّم الإنجليزية بالتفكير في البنية اللغوية مباشرة دون ترجمة حرفية أو حفظ جداول، لكسر عادات التدخل اللغوي.'
    }
  },
  {
    image: '/amr-guide/pose2.png',
    badge: { en: '🧭 Step 2: 3 Learning Paths', ar: '🧭 الخطوة ٢: ٣ مسارات تعليمية' },
    title: { en: 'Practice, Lessons & Cards', ar: 'المحادثة، الدروس، والبطاقات' },
    desc: {
      en: 'Practice speaking with instant AI feedback, progress through structured lessons, and master spaced-repetition cards.',
      ar: 'تدرّب على النطق بالصوت مع الذكاء الاصطناعي، وتابع الدروس التفاعلية، ورسّخ المفردات بنظام التكرار المتباعد الذكي.'
    }
  },
  {
    image: '/amr-guide/pose3.png',
    badge: { en: '✨ Step 3: Smart Karaoke', ar: '✨ الخطوة ٣: لحظة الإلهام' },
    title: { en: 'Live Audio & New Words', ar: 'التظليل الصوتي والكلمات الجديدة' },
    desc: {
      en: 'Follow along word-by-word with live audio streaming. Words marked with a purple ★ are new to your active dictionary.',
      ar: 'شاهد الذكاء الاصطناعي يتحدث مع تظليل الكلمات. الكلمات المميزة بنجمة بنفسجية ★ هي جديدة في قاموسك.'
    }
  },
  {
    image: '/amr-guide/pose4.png',
    badge: { en: '📱 Step 4: 100% Offline', ar: '📱 الخطوة ٤: بدون إنترنت تماماً' },
    title: { en: 'Ready to Master English', ar: 'جاهز للانطلاق' },
    desc: {
      en: 'The app works completely offline without tracking. Download the official Android APK directly from the main menu.',
      ar: 'كل شيء جاهز! يمكنك تحميل تطبيق الأندرويد من القائمة وبدء رحلتك.'
    },
    actionText: {
      en: 'Start Learning Now 🚀',
      ar: 'ابدأ التعلم الآن 🚀'
    }
  }
];

export function TutorialModal({ isOpen, onClose, language }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isArabic = language === 'arabic';

  // Check YouTube subscription unlock state
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tb.yt_subscribed') === 'true';
    } catch {
      return false;
    }
  });

  // Current view mode: 'aot' (Survey Corps) vs 'standard'
  const [mode, setMode] = useState<'standard' | 'aot'>('standard');
  const [showUnlockGate, setShowUnlockGate] = useState(false);

  // Sync mode with subscription when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      try {
        const sub = localStorage.getItem('tb.yt_subscribed') === 'true';
        setIsSubscribed(sub);
        if (sub) {
          setMode('aot');
        } else {
          setMode('standard');
        }
      } catch {
        // fallback
      }
    }
  }, [isOpen]);

  // Keyboard navigation & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUnlockGate) {
          setShowUnlockGate(false);
        } else {
          onClose();
        }
      } else if (!showUnlockGate) {
        if (e.key === 'ArrowRight') {
          if (isArabic) handlePrev();
          else handleNext();
        } else if (e.key === 'ArrowLeft') {
          if (isArabic) handleNext();
          else handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isArabic, showUnlockGate, mode]);

  if (!isOpen) return null;

  const currentStepsList = mode === 'aot' && isSubscribed ? AOT_STEPS : STANDARD_STEPS;
  const step = currentStepsList[currentStep] || currentStepsList[0];
  const isLastStep = currentStep === currentStepsList.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, currentStepsList.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleToggleMode = (targetMode: 'standard' | 'aot') => {
    if (targetMode === 'aot') {
      if (!isSubscribed) {
        setShowUnlockGate(true);
        return;
      }
      setMode('aot');
      setCurrentStep(0);
    } else {
      setMode('standard');
      setCurrentStep(0);
    }
  };

  const handleSubscribeClick = () => {
    window.open('https://www.youtube.com/@SciAmrSherif?sub_confirmation=1', '_blank', 'noopener,noreferrer');
    setIsSubscribed(true);
    setMode('aot');
    setCurrentStep(0);
    try {
      localStorage.setItem('tb.yt_subscribed', 'true');
    } catch {
      // fallback
    }
    setShowUnlockGate(false);
  };

  const handleConfirmSubscribed = () => {
    setIsSubscribed(true);
    setMode('aot');
    setCurrentStep(0);
    try {
      localStorage.setItem('tb.yt_subscribed', 'true');
    } catch {
      // fallback
    }
    setShowUnlockGate(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/90 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'دليل الاستخدام' : 'App Tutorial'}
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-stone-900/95 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Ambient Backdrops: Green for AoT mode, Teal/Blue for Standard */}
        {mode === 'aot' && isSubscribed ? (
          <>
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-stone-700/20 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* 1. Top Header Strip */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 border-b border-stone-800/60">
          {/* Mode Switcher Pill */}
          <div className="inline-flex items-center gap-1 p-1 bg-stone-950/80 border border-stone-800 rounded-full text-xs">
            <button
              type="button"
              onClick={() => handleToggleMode('standard')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                mode === 'standard'
                  ? 'bg-stone-800 text-teal-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {isArabic ? 'النسخة القياسية' : 'Standard'}
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('aot')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all ${
                mode === 'aot' && isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <Swords className="w-3 h-3" />
              <span>AoT Edition</span>
              {!isSubscribed && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-lg transition-colors"
            aria-label={isArabic ? 'إغلاق الشرح' : 'Close tutorial'}
          >
            <span>{isArabic ? 'تخطي' : 'Skip'}</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Main Content Stage */}
        <div className="relative z-10 px-5 py-4 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Mode Badge Indicator */}
          <div className="mb-3">
            {mode === 'aot' && isSubscribed ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? step.badge.ar : step.badge.en}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700/60 text-teal-300 text-xs font-bold tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>{isArabic ? step.badge.ar : step.badge.en}</span>
              </div>
            )}
          </div>

          {/* Visual Showcase (AoT Image vs Standard Clean Illustrative Elements) */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-stone-800/40 via-stone-900/80 to-stone-950 border border-stone-800/70 shadow-inner flex items-center justify-center p-3 mb-4 min-h-[220px]">
            {step.image ? (
              <>
                <div
                  className={`absolute inset-0 bg-radial ${
                    mode === 'aot' ? 'from-emerald-500/15' : 'from-teal-500/15'
                  } via-transparent to-transparent opacity-70`}
                />
                <img
                  key={step.image}
                  src={step.image}
                  alt={isArabic ? step.title.ar : step.title.en}
                  className="relative z-10 w-auto h-auto max-h-[230px] sm:max-h-[270px] object-contain rounded-xl drop-shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  loading="eager"
                />
              </>
            ) : (
              /* Standard Graphic Component */
              <div className="w-full flex flex-col items-center justify-center py-2 text-center">
                {step.illustrationType === 'avatar' && (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-teal-500/40 shadow-xl bg-stone-800/80 flex items-center justify-center">
                      <img
                        src="/amr-avatar.png"
                        alt="Amr Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-teal-500 text-stone-950 text-[10px] font-black uppercase">
                      Alexandria, EG
                    </span>
                  </div>
                )}

                {step.illustrationType === 'features' && (
                  <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                    <div className="flex flex-col items-center p-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
                      <Mic className="w-6 h-6 text-teal-400 mb-1" />
                      <span className="text-[11px] font-bold text-stone-200">
                        {isArabic ? 'صوت' : 'Voice'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
                      <BookOpen className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-[11px] font-bold text-stone-200">
                        {isArabic ? 'دروس' : 'Lessons'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
                      <Layers className="w-6 h-6 text-emerald-400 mb-1" />
                      <span className="text-[11px] font-bold text-stone-200">
                        {isArabic ? 'بطاقات' : 'Cards'}
                      </span>
                    </div>
                  </div>
                )}

                {step.illustrationType === 'karaoke' && (
                  <div className="w-full max-w-xs p-4 rounded-xl bg-stone-900 border border-purple-500/30 flex flex-col items-center gap-2 shadow-lg">
                    <div className="flex items-center gap-2 text-stone-200 text-sm font-semibold">
                      <span>I am</span>
                      <span className="text-purple-300 font-extrabold border-b-2 border-purple-400 pb-0.5">
                        learning
                      </span>
                      <span>English</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold mt-1">
                      <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
                      <span>{isArabic ? 'كلمة جديدة ★' : 'New Word ★'}</span>
                    </div>
                  </div>
                )}

                {step.illustrationType === 'offline' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-teal-950/60 border border-teal-500/40 flex items-center justify-center shadow-lg">
                      <Download className="w-8 h-8 text-teal-400" />
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{isArabic ? '١٠٠٪ بدون إنترنت · CC0 1.0' : '100% Offline · CC0 1.0'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Typography */}
          <div className="w-full text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight flex items-center justify-center gap-2">
              <span>{isArabic ? step.title.ar : step.title.en}</span>
              {isLastStep && <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              {isArabic ? step.desc.ar : step.desc.en}
            </p>
          </div>

          {/* AoT Unlock Teaser (Shown on standard mode when not yet subscribed) */}
          {mode === 'standard' && !isSubscribed && (
            <button
              type="button"
              onClick={() => setShowUnlockGate(true)}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isArabic
                  ? '⚔️ اشترك بقناة يوتيوب لفتح نسخة الهجوم على العمالقة!'
                  : '⚔️ Subscribe on YouTube to unlock Attack on Titan Edition!'}
              </span>
            </button>
          )}
        </div>

        {/* 3. Footer & Navigation Controls */}
        <div className="relative z-10 px-5 py-4 bg-stone-950/70 border-t border-stone-800/80 flex flex-col gap-3">
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2">
            {currentStepsList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentStep
                    ? mode === 'aot'
                      ? 'w-7 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-500/40'
                      : 'w-7 h-2 bg-gradient-to-r from-teal-400 to-emerald-400 shadow-sm shadow-teal-500/40'
                    : 'w-2 h-2 bg-stone-700 hover:bg-stone-500'
                }`}
                aria-label={isArabic ? `الخطوة ${idx + 1}` : `Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800/80 text-stone-200 hover:bg-stone-700 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all"
              >
                {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{isArabic ? 'السابق' : 'Back'}</span>
              </button>
            ) : (
              <div className="w-0" />
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                mode === 'aot'
                  ? isLastStep
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-stone-950 hover:brightness-110 shadow-emerald-500/25'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-500/20'
                  : isLastStep
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-stone-950 hover:brightness-110 shadow-teal-500/25'
                  : 'bg-teal-500 hover:bg-teal-400 text-stone-950 shadow-teal-500/20'
              }`}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-stone-950" />
                  <span>
                    {isArabic
                      ? step.actionText?.ar || 'ابدأ التعلم'
                      : step.actionText?.en || 'Start Learning'}
                  </span>
                </>
              ) : (
                <>
                  <span>{isArabic ? 'التالي' : 'Next'}</span>
                  {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. YouTube Subscription Unlock Gate Overlay */}
        {showUnlockGate && (
          <div className="absolute inset-0 z-30 bg-stone-950/95 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center animate-fadeIn">
            {/* YouTube Red Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center shadow-2xl mb-4">
              <Youtube className="w-8 h-8 text-red-500 fill-red-500" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>{isArabic ? 'ميزة فيلق الاستطلاع الحصرية' : 'Exclusive Survey Corps Edition'}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-100 mb-2">
              {isArabic ? 'اشترك بالقناة لفتح وضع العمالقة!' : 'Subscribe to Unlock AoT Mode!'}
            </h3>

            <p className="text-stone-300 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
              {isArabic
                ? 'اشترك في قناة عمرو شريف (@SciAmrSherif) على يوتيوب لتفعيل شخصيات فيلق الاستطلاع الأربعة والوضع التكتيكي السري مجاناً!'
                : 'Subscribe to Amr Sherif’s YouTube channel (@SciAmrSherif) to unlock the exclusive 4-step Attack on Titan Commander Edition!'}
            </p>

            <div className="w-full max-w-xs space-y-2.5">
              <button
                type="button"
                onClick={handleSubscribeClick}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all active:scale-[0.98]"
              >
                <Youtube className="w-4 h-4 fill-white" />
                <span>{isArabic ? '🔴 اشترك في القناة وافتح الوضع' : '🔴 Subscribe on YouTube & Unlock'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={handleConfirmSubscribed}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? '✅ أنا مشترك بالفعل! تفعيل الآن' : '✅ I’ve Already Subscribed! Unlock'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUnlockGate(false)}
                className="w-full py-2 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
              >
                {isArabic ? 'العودة للنسخة العادية' : 'Back to Standard Guide'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
