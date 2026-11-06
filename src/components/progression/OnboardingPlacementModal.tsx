import React, { useEffect, useState } from 'react';
import { CefrStage } from '../../progression/types';
import { Check, Globe, Briefcase, GraduationCap, Plane, Cpu, ArrowLeft, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META } from '../../data/languages';
import { LanguageFlag } from '../LanguageFlag';
import { generateSmartProfile, ProfileCefrLevel } from '../../services/profileEngine';
import type { FocusArea } from '../../progression/profileMatcherEngine';

interface OnboardingPlacementModalProps {
  isOpen: boolean;
  onComplete: (
    goal: string,
    dailyMin: number,
    placedStage: CefrStage,
    sourceLang: SourceLanguage,
    targetLang: TargetLanguage
  ) => void;
  isArabic?: boolean;
  initialSource?: SourceLanguage;
  initialTarget?: TargetLanguage;
}

export function OnboardingPlacementModal({
  isOpen,
  onComplete,
  isArabic = true,
  initialSource = 'arz',
  initialTarget = 'en',
}: OnboardingPlacementModalProps) {
  // Steps: 0: Dialect/Native (L1) -> 1: Target (L2) -> 2: Goal/Focus
  const [step, setStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<SourceLanguage>(initialSource || 'arz');
  const [selectedTarget, setSelectedTarget] = useState<TargetLanguage>(initialTarget || 'en');
  const [selectedGoal, setSelectedGoal] = useState<FocusArea>('corporate');
  const [profileCreated, setProfileCreated] = useState(false);

  const availableTargets = (Object.keys(TARGET_LANGUAGE_META) as TargetLanguage[])
    .filter((code) => code !== selectedSource);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedSource(initialSource || 'arz');
    setSelectedTarget(
      initialTarget === initialSource
        ? (Object.keys(TARGET_LANGUAGE_META) as TargetLanguage[]).find((code) => code !== initialSource) || 'en'
        : initialTarget
    );
    setStep(0);
    setProfileCreated(false);
  }, [isOpen, initialSource, initialTarget]);

  const goals: { id: FocusArea; icon: any; titleAr: string; titleEn: string; descAr: string; descEn: string }[] = [
    {
      id: 'corporate',
      icon: Briefcase,
      titleAr: '💼 بيزنس وشركات (Business & Corporate)',
      titleEn: 'Business & Corporate',
      descAr: 'المراسلات الرسمية والاجتماعات والتفاوض',
      descEn: 'Executive emails, client negotiations'
    },
    {
      id: 'academic',
      icon: GraduationCap,
      titleAr: '🎓 أبحاث ودراسة أكاديمية (Academic & STEM)',
      titleEn: 'Academic & STEM',
      descAr: 'كتابة الأوراق العلمية والمناقشات الجامعية',
      descEn: 'Research papers, thesis, university defense'
    },
    {
      id: 'travel',
      icon: Plane,
      titleAr: '✈️ سفر واستقرار بالخارج (Travel & Mobility)',
      titleEn: 'Travel & Mobility',
      descAr: 'الحياة اليومية، المطار والاندماج بالمجتمع',
      descEn: 'Immigration, airport, daily errands'
    },
    {
      id: 'conversation',
      icon: MessageSquareQuote,
      titleAr: '🗣️ محادثات يومية (Daily Conversation)',
      titleEn: 'Daily Conversation',
      descAr: 'الطلاقة اليومية وبناء الصداقات بدون تعقيد',
      descEn: 'Casual chat, friendships, natural flow'
    },
    {
      id: 'dialect-immersion',
      icon: Globe,
      titleAr: '🌟 تعمق وتعبيرات محلية (Dialect & Idioms)',
      titleEn: 'Dialect & Idioms',
      descAr: 'إتقان المصطلحات التعبيرية واللغة المحلية',
      descEn: 'Local idioms, native nuances, figurative speech'
    },
    {
      id: 'general',
      icon: Cpu,
      titleAr: '🧠 بناء الهيكل الشامل (General Structure)',
      titleEn: 'General Structure',
      descAr: 'التأسيس الجوهري وإلغاء الترجمة الحرفية',
      descEn: 'Core cognitive transfer foundation'
    }
  ];

  const handleFinish = () => {
    setProfileCreated(true);
  };

  useEffect(() => {
    if (!isOpen || !profileCreated) return;
    const completionTimer = window.setTimeout(() => {
      generateSmartProfile(selectedSource, selectedTarget, selectedGoal, 'A1');
      onComplete(selectedGoal, 15, 'A1', selectedSource, selectedTarget);
    }, 1200);
    return () => window.clearTimeout(completionTimer);
  }, [isOpen, profileCreated]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 md:p-6"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full h-[100dvh] flex flex-col sm:h-auto sm:max-h-[92vh] max-w-[95vw] md:max-w-[720px] lg:max-w-[860px] sm:rounded-3xl bg-surface/95 border border-border p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 text-start shadow-2xl overflow-hidden">
        {profileCreated ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400 text-teal-400 flex items-center justify-center text-3xl">
              <Check size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-text">
                {isArabic ? 'تم تأكيد ملفك وبدء المسار!' : 'Profile Confirmed & Path Ready!'}
              </h2>
              <p className="text-sm text-stone-300">
                {isArabic ? 'أهلاً بك في جسر التفكير!' : 'Welcome to Thinking Bridge!'}
              </p>
            </div>
            <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-text">
              <span>{isArabic ? 'مسارك: ' : 'Your path: '}</span>
              <span aria-label={`${SOURCE_LANGUAGES[selectedSource]?.nameEn} to ${TARGET_LANGUAGE_META[selectedTarget]?.nameEn}`}>
                {SOURCE_LANGUAGES[selectedSource]?.flag} ➔ {TARGET_LANGUAGE_META[selectedTarget]?.flag}
              </span>
              <span>{` | ${selectedGoal}`}</span>
            </p>
            <span className="text-xs text-stone-400">{isArabic ? 'جارٍ تحميل المسار…' : 'Loading path…'}</span>
          </div>
        ) : (
          <>
        {/* Step Indicator Header */}
        <div className="flex shrink-0 items-center justify-between text-xs font-bold border-b border-border/60 pb-3">
          <span className="text-teal-400 font-black px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            {isArabic ? `الخطوة ${step + 1} من 3` : `Step ${step + 1} of 3`}
          </span>
          <span className="text-stone-300 font-semibold">{isArabic ? 'إعداد ملف التفكير اللغوي' : 'Language Profile Setup'}</span>
        </div>

        {/* STEP 0: Native Dialect / Language (L1) */}
        {step === 0 && (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text flex items-center gap-2">
                  {isArabic ? '١. ما لغتك الأم / لهجتك التي تفكّر بها؟' : '1. Which native dialect/language do you think in?'}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  {isArabic
                    ? 'اختيار اللهجة يحدد نقطة الانطلاق في المعلم الصوتي والتوجيه الذهني.'
                    : 'Select your native dialect to set up L1 transfer guidance.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(Object.keys(SOURCE_LANGUAGES) as SourceLanguage[]).map((code) => {
                  const meta = SOURCE_LANGUAGES[code];
                  const selected = selectedSource === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setSelectedSource(code);
                        if (selectedTarget === code) {
                          const next = (Object.keys(TARGET_LANGUAGE_META) as TargetLanguage[]).find((t) => t !== code);
                          if (next) setSelectedTarget(next);
                        }
                      }}
                      className={`p-3 min-h-[52px] rounded-2xl border text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer ${
                        selected
                          ? 'bg-teal-500/15 border-teal-400 text-teal-300 shadow-md ring-1 ring-teal-400/50'
                          : 'bg-surface border-border text-text hover:border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <LanguageFlag code={code} size={22} />
                        <div className="text-start min-w-0">
                          <span className="truncate block font-bold text-text">{isArabic ? meta.nameAr : meta.nameEn}</span>
                        </div>
                      </div>
                      {selected && <Check size={16} className="text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="sticky bottom-0 z-10 w-full shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span>{isArabic ? 'التالي: اختيار لغة الهدف' : 'Next: Target Language'}</span>
              {isArabic ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
        )}

        {/* STEP 1: Target Language (L2) */}
        {step === 1 && (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? '٢. ما اللغة التي تريد أن تفكر وتتحدث بها؟' : '2. Which language do you want to learn?'}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  {isArabic
                    ? '10 لغات مدعومة بالكامل بدون إنترنت مع قواميس مبنية داخل التطبيق'
                    : '10 fully bundled offline target languages'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {availableTargets.map((code) => {
                  const meta = TARGET_LANGUAGE_META[code];
                  const selected = selectedTarget === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedTarget(code)}
                      className={`p-3 min-h-[52px] rounded-2xl border text-xs font-bold transition flex items-center justify-between gap-1.5 cursor-pointer ${
                        selected
                          ? 'bg-teal-500/15 border-teal-400 text-teal-300 shadow-md ring-1 ring-teal-400/50'
                          : 'bg-surface border-border text-text hover:border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <LanguageFlag code={code} size={20} />
                        <span className="truncate font-bold text-text">{meta.nameNative}</span>
                      </div>
                      {selected && <Check size={14} className="text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-border/60 bg-surface pt-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3.5 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-sm cursor-pointer hover:bg-surface-2 transition"
              >
                {isArabic ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] py-3.5 min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isArabic ? 'التالي: المجال والهدف' : 'Next: Goal'}</span>
                {isArabic ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Goal / Focus Area */}
        {step === 2 && (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? '٣. ما هو مجالك وهدفك الأساسي؟' : '3. What is your primary focus & goal?'}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  {isArabic
                    ? 'منهج موحّد متكامل، يتم تخصيص التطبيق والمعلم الذكي وسجل الفلاش كاردز حسب هدفك.'
                    : 'One integrated curriculum, personalized by your goal for the AI tutor and SRS cards.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const isSelected = selectedGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`p-3.5 min-h-[52px] rounded-2xl border text-xs font-bold transition flex items-center justify-between text-start cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-400 text-teal-300 shadow-md ring-1 ring-teal-400/50'
                          : 'bg-surface border-border text-text hover:border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-surface-2 text-stone-300'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-text block truncate">{isArabic ? g.titleAr : g.titleEn}</span>
                          <span className="text-[10px] text-stone-300 block truncate">{isArabic ? g.descAr : g.descEn}</span>
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-teal-400 shrink-0 ms-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-border/60 bg-surface pt-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-sm cursor-pointer hover:bg-surface-2 transition"
              >
                {isArabic ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] py-3.5 min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isArabic ? 'تأكيد الملف وبدء المسار' : 'Confirm & Start Path'}</span>
                <Check size={18} />
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
