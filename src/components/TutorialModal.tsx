import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Swords, Sparkles, CheckCircle2 } from 'lucide-react';

export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'english' | 'arabic';
}

interface StepData {
  image: string;
  badge: { en: string; ar: string };
  title: { en: string; ar: string };
  desc: { en: string; ar: string };
  actionText?: { en: string; ar: string };
}

const STEPS: StepData[] = [
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

export function TutorialModal({ isOpen, onClose, language }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isArabic = language === 'arabic';

  // Keyboard navigation & escape key
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (isArabic) {
          handlePrev();
        } else {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (isArabic) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isArabic]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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
      <div className="relative w-full max-w-md bg-stone-900/95 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Scouting Green & Amber Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 border-b border-stone-800/60">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Swords className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isArabic ? step.badge.ar : step.badge.en}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-lg transition-colors"
            aria-label={isArabic ? 'تخطي الشرح' : 'Skip tutorial'}
          >
            <span>{isArabic ? 'تخطي' : 'Skip'}</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Image & Content Body */}
        <div className="relative z-10 px-5 py-4 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Pose Illustration Stage */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-stone-800/40 via-stone-900/80 to-stone-950 border border-stone-800/70 shadow-inner flex items-center justify-center p-2 mb-4">
            <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent opacity-60" />
            <img
              key={step.image}
              src={step.image}
              alt={isArabic ? step.title.ar : step.title.en}
              className="relative z-10 w-auto h-auto max-h-[260px] sm:max-h-[290px] object-contain rounded-xl drop-shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              loading="eager"
            />
          </div>

          {/* Step Typography */}
          <div className="w-full text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight flex items-center justify-center gap-2">
              <span>{isArabic ? step.title.ar : step.title.en}</span>
              {isLastStep && <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              {isArabic ? step.desc.ar : step.desc.en}
            </p>
          </div>
        </div>

        {/* Step Indicators & Action Controls */}
        <div className="relative z-10 px-5 py-4 bg-stone-950/70 border-t border-stone-800/80 flex flex-col gap-3">
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentStep
                    ? 'w-7 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-500/40'
                    : 'w-2 h-2 bg-stone-700 hover:bg-stone-500'
                }`}
                aria-label={isArabic ? `الانتقال إلى الخطوة ${idx + 1}` : `Go to step ${idx + 1}`}
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
                isLastStep
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-stone-950 hover:brightness-110 shadow-emerald-500/25'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-500/20'
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
      </div>
    </div>
  );
}

