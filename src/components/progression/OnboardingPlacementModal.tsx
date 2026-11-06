import React, { useEffect, useState, useMemo } from 'react';
import { CefrStage } from '../../progression/types';
import { Check, Sparkles, Globe, Briefcase, GraduationCap, Plane, Cpu, ArrowLeft, ArrowRight, Eye, MessageSquareQuote } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META } from '../../data/languages';
import { LanguageFlag } from '../LanguageFlag';
import { generateSmartProfile, ProfileCefrLevel } from '../../services/profileEngine';
import { getLessons, type FocusArea, type LanguageCode } from '../../progression/profileMatcherEngine';

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
  // Steps: 0: Dialect/Native (L1) -> 1: Target (L2) -> 2: Goal/Focus -> 3: CEFR Level -> 4: Live Preview
  const [step, setStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<SourceLanguage>(initialSource || 'arz');
  const [selectedTarget, setSelectedTarget] = useState<TargetLanguage>(initialTarget || 'en');
  const [selectedGoal, setSelectedGoal] = useState<FocusArea>('corporate');
  const [selectedStage, setSelectedStage] = useState<ProfileCefrLevel>('A1');
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
  }, [isOpen, initialSource, initialTarget]);

  const cefrLevels: {
    id: ProfileCefrLevel;
    code: string;
    labelAr: string;
    labelEn: string;
    descAr: string;
    descEn: string;
    accent: string;
  }[] = [
    {
      id: 'A0',
      code: 'A0',
      labelAr: 'مبتدئ (A0 - Beginner)',
      labelEn: 'A0 Beginner',
      descAr: 'تكوين الجمل البسيطة وفك عقدة الأفعال المخفية',
      descEn: 'Basic clauses, copula fundamentals',
      accent: 'border-teal-400 text-teal-300 bg-teal-500/15'
    },
    {
      id: 'A1',
      code: 'A1',
      labelAr: 'أساسي (A1 - Elementary)',
      labelEn: 'A1 Elementary',
      descAr: 'الربط التلقائي، الأزمنة اليومية والأفعال المركبة',
      descEn: 'Daily tenses, phrasal verbs, routine fluency',
      accent: 'border-teal-400 text-teal-300 bg-teal-500/15'
    },
    {
      id: 'A2',
      code: 'A2',
      labelAr: 'متوسط (A2 - Intermediate)',
      labelEn: 'A2 Intermediate',
      descAr: 'الحديث والشرح دون توقف وترجمة في الرأس',
      descEn: 'Narratives, workplace conversation without lag',
      accent: 'border-teal-400 text-teal-300 bg-teal-500/15'
    }
  ];

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

  const liveFirstLesson = useMemo(() => {
    const lessons = getLessons(
      selectedSource as LanguageCode,
      selectedTarget as LanguageCode,
      selectedGoal,
      selectedStage
    );
    return lessons[0] || null;
  }, [selectedSource, selectedTarget, selectedGoal, selectedStage]);

  const handleFinish = () => {
    setProfileCreated(true);
  };

  useEffect(() => {
    if (!isOpen || !profileCreated) return;
    const completionTimer = window.setTimeout(() => {
      generateSmartProfile(selectedSource, selectedTarget, selectedGoal, selectedStage);
      onComplete(selectedGoal, 15, selectedStage, selectedSource, selectedTarget);
    }, 1500);
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
                {isArabic ? 'تم تأكيد ملفك وشحن أول درس!' : 'Profile Confirmed!'}
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
              <span>{` | ${selectedStage} | ${selectedGoal}`}</span>
            </p>
            <span className="text-xs text-stone-400">{isArabic ? 'جارٍ التحميل…' : 'Loading path…'}</span>
          </div>
        ) : (
          <>
        {/* Step Indicator Header */}
        <div className="flex shrink-0 items-center justify-between text-xs font-bold border-b border-border/60 pb-3">
          <span className="text-teal-400 font-black px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            {isArabic ? `الخطوة ${step + 1} من 5` : `Step ${step + 1} of 5`}
          </span>
          <span className="text-stone-300 font-semibold">{isArabic ? 'إعداد ملف التفكير اللغوي' : 'Profile & Dialect Combinator'}</span>
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
                    ? 'اختيار اللهجة يغير صياغة كل جملة وتمرين في المسار للتركيز على لغة عقلك التلقائية.'
                    : 'Dialect selection changes the phrasing of every sentence in your exercises.'}
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
                    ? '10+ لغات مدعومة بالكامل بدون إنترنت مع قواميس مبنية داخل التطبيق'
                    : '10+ fully bundled offline target languages'}
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
                    ? 'يغير اختيار المجال القاموس والمفردات المستخدمة في كل تمرين بالكامل'
                    : 'Focus area selects specific vocabulary and sentence patterns'}
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
                onClick={() => setStep(3)}
                className="flex-[2] py-3.5 min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isArabic ? 'التالي: مستوى التحديد' : 'Next: Level'}</span>
                {isArabic ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CEFR Level Selection */}
        {step === 3 && (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text flex items-center gap-2">
                  <Sparkles size={20} className="text-teal-400" />
                  {isArabic ? '٤. حدد مستواك الحقيقي (CEFR Stage)' : '4. Select Your CEFR Level'}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  {isArabic
                    ? 'يحدد هذا المستوى كلاً من كمية وعمق الدروس الناتجة محلياً'
                    : 'Determines the depth and count of lessons generated offline'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {cefrLevels.map((lvl) => {
                  const isSelected = selectedStage === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedStage(lvl.id)}
                      className={`p-3.5 min-h-[56px] rounded-2xl border text-start transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? `${lvl.accent} shadow-lg ring-1 ring-teal-400/50`
                          : 'bg-surface border-border text-text hover:border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center font-black text-sm text-text shrink-0">
                          {lvl.code}
                        </span>
                        <div className="min-w-0">
                          <span className="font-black text-xs text-text block truncate">
                            {isArabic ? lvl.labelAr : lvl.labelEn}
                          </span>
                          <span className="text-[10px] text-stone-300 block truncate">
                            {isArabic ? lvl.descAr : lvl.descEn}
                          </span>
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
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-sm cursor-pointer hover:bg-surface-2 transition"
              >
                {isArabic ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-[2] py-3.5 min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isArabic ? 'معاينة أول درس مباشر 👁️' : 'Preview First Lesson 👁️'}</span>
                {isArabic ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Live First-Lesson Preview */}
        {step === 4 && (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-wider">
                  <Eye size={16} />
                  <span>{isArabic ? 'معاينة الدرس الأول لملفك الشخصي' : 'Live First Lesson Preview'}</span>
                </div>
                <h3 className="text-base font-black text-text">
                  {liveFirstLesson ? liveFirstLesson.titleAr : (isArabic ? 'الدرس الأول' : 'First Lesson')}
                </h3>
              </div>

              {liveFirstLesson ? (
                <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-300 font-bold">
                    <span>{isArabic ? `لهجتك: ${selectedSource}` : `Source: ${selectedSource}`}</span>
                    <span className="text-teal-400">{`CEFR ${selectedStage} · ${selectedGoal}`}</span>
                  </div>

                  <div className="rounded-xl bg-surface/90 border border-border p-3 space-y-2 text-start">
                    <p className="text-xs text-stone-400 font-medium">{isArabic ? 'الجملة المنطلقة من تفكيرك الأصلي:' : 'Source Thought:'}</p>
                    <p className="text-sm font-black text-amber-300">{liveFirstLesson.sourceThought}</p>
                  </div>

                  <div className="rounded-xl bg-surface/90 border border-border p-3 space-y-2 text-start">
                    <p className="text-xs text-stone-400 font-medium">{isArabic ? 'الجملة الإدراكية باللغة الهدف:' : 'Target Structure:'}</p>
                    <p className="text-sm font-black text-teal-300">{liveFirstLesson.targetSentence}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {liveFirstLesson.wordChips.map((chip, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface border border-teal-500/30 text-xs font-bold text-text">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400">{isArabic ? 'جارٍ توليد المعاينة…' : 'Generating preview…'}</p>
              )}
            </div>

            <div className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-border/60 bg-surface pt-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-sm cursor-pointer hover:bg-surface-2 transition"
              >
                {isArabic ? 'تعديل الخيارات' : 'Edit Choices'}
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] py-3.5 min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isArabic ? 'ابدأ هذا المسار الآن 🚀' : 'Start This Path Now 🚀'}</span>
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
