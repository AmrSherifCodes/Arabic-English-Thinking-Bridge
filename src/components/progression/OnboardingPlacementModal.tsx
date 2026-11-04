import React, { useEffect, useState } from 'react';
import { CefrStage } from '../../progression/types';
import { Check, Sparkles, Globe, Briefcase, GraduationCap, Plane, Cpu, ArrowLeft, ArrowRight } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META, SUPPORTED_PAIRS } from '../../data/languages';
import { LanguageFlag } from '../LanguageFlag';
import { generateSmartProfile, ProfileCefrLevel } from '../../services/profileEngine';

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
  initialSource = 'ar',
  initialTarget = 'en',
}: OnboardingPlacementModalProps) {
  // Steps: 0: Language Pair -> 1: Goal -> 2: CEFR Level Grid (A0-A2)
  const [step, setStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<SourceLanguage>(initialSource);
  const [selectedTarget, setSelectedTarget] = useState<TargetLanguage>(initialTarget);
  const [selectedGoal, setSelectedGoal] = useState('tech');
  const [selectedStage, setSelectedStage] = useState<ProfileCefrLevel>('A0');
  const [profileCreated, setProfileCreated] = useState(false);

  const handleFinish = (stage: ProfileCefrLevel) => {
    setSelectedStage(stage);
    setProfileCreated(true);
  };

  const availableTargets = SUPPORTED_PAIRS
    .filter((p) => p.source === selectedSource)
    .map((p) => p.target);

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
      labelAr: 'مبتدئ (Beginner)',
      labelEn: 'Beginner',
      descAr: 'تكوين الجمل البسيطة وفك عقدة الأفعال المخفية',
      descEn: 'Basic clauses, copula fundamentals',
      accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'A1',
      code: 'A1',
      labelAr: 'أساسي (Elementary)',
      labelEn: 'Elementary',
      descAr: 'الربط التلقائي، الأزمنة اليومية والأفعال المركبة',
      descEn: 'Daily tenses, phrasal verbs, routine fluency',
      accent: 'border-teal-500/40 text-teal-300 bg-teal-500/10'
    },
    {
      id: 'A2',
      code: 'A2',
      labelAr: 'متوسط (Intermediate)',
      labelEn: 'Intermediate',
      descAr: 'الحديث والشرح دون توقف وترجمة في الرأس',
      descEn: 'Narratives, workplace conversation without lag',
      accent: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10'
    }
  ];

  const goals = [
    {
      id: 'tech',
      icon: Cpu,
      titleAr: '💻 هندسة وبرمجة (Tech & Engineering)',
      titleEn: 'Tech & Engineering',
      descAr: 'مصطلحات الأنظمة، البرمجة، والتوظيف الدولي',
      descEn: 'System architecture, SWE, global hiring'
    },
    {
      id: 'study',
      icon: GraduationCap,
      titleAr: '🎓 أبحاث ودراسة أكاديمية (Academic & Science)',
      titleEn: 'Academic & Science',
      descAr: 'كتابة الأوراق العلمية والمناقشات الجامعية',
      descEn: 'Research papers, thesis, university defense'
    },
    {
      id: 'corporate',
      icon: Briefcase,
      titleAr: '💼 بيزنس وشركات (Business & Corporate)',
      titleEn: 'Business & Corporate',
      descAr: 'المراسلات الرسمية والاجتماعات مع القيادات',
      descEn: 'Client negotiations, executive meetings'
    },
    {
      id: 'travel',
      icon: Plane,
      titleAr: '✈️ سفر واستقرار بالخارج (Travel & Relocation)',
      titleEn: 'Travel & Relocation',
      descAr: 'الحياة اليومية والاندماج السلس مع المجتمع',
      descEn: 'Immigration, daily errands, spontaneous talk'
    }
  ];

  useEffect(() => {
    if (!isOpen || !profileCreated) return;
    const completionTimer = window.setTimeout(() => {
      generateSmartProfile(selectedSource, selectedTarget, selectedGoal, selectedStage);
      onComplete(selectedGoal, 15, selectedStage, selectedSource, selectedTarget);
    }, 2000);
    return () => window.clearTimeout(completionTimer);
  }, [isOpen, profileCreated]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full h-full sm:h-auto sm:max-w-[520px] sm:rounded-3xl bg-surface/90 border border-border p-6 space-y-6 text-start shadow-2xl flex flex-col justify-between sm:justify-start overflow-y-auto">
        {profileCreated ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-success/15 border border-success/40 text-success flex items-center justify-center text-3xl">
              <Check size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-text">
                {isArabic ? 'تم إنشاء ملفك التعليمي!' : 'Profile Created!'}
              </h2>
              <p className="text-sm text-muted">
                {isArabic ? 'أهلاً بك في Thinking Bridge!' : 'Welcome to Thinking Bridge!'}
              </p>
            </div>
            <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-text">
              <span>{isArabic ? 'مسارك: ' : 'Your path: '}</span>
              <span aria-label={`${SOURCE_LANGUAGES[selectedSource].nameEn} to ${TARGET_LANGUAGE_META[selectedTarget].nameEn}`}>
                {SOURCE_LANGUAGES[selectedSource].flag} ➔ {TARGET_LANGUAGE_META[selectedTarget].flag}
              </span>
              <span>{` | ${isArabic ? 'المستوى: ' : 'Level: '}${selectedStage} | ${isArabic ? 'الهدف: ' : 'Goal: '}${isArabic ? goals.find((item) => item.id === selectedGoal)?.titleAr : goals.find((item) => item.id === selectedGoal)?.titleEn}`}</span>
            </p>
            <span className="text-xs text-muted">{isArabic ? 'جارٍ تجهيز مسارك…' : 'Preparing your learning path…'}</span>
          </div>
        ) : (
          <>
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span className="text-primary font-black">
            {isArabic ? `الخطوة ${step + 1} من 3` : `Step ${step + 1} of 3`}
          </span>
          <span>{isArabic ? 'إعداد الحساب والمسار' : 'Profile & Path Setup'}</span>
        </div>

        {/* STEP 0: Language Pair */}
        {step === 0 && (
          <div className="space-y-5 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text flex items-center gap-2">
                  <Globe size={20} className="text-primary" />
                  {isArabic ? 'ما اللغة التي تريد أن تفكّر بها؟' : 'Which language do you want to think in?'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic
                    ? 'اختر مسار التحول الذهني. يمكنك تغييره لاحقاً من الإعدادات.'
                    : 'Choose your thinking bridge. You can change this later in Settings.'}
                </p>
              </div>

              {/* Source Language */}
              <div>
                <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
                  {isArabic ? '١. لغتي الحالية (مصدر التفكير)' : '1. I currently think in'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(SOURCE_LANGUAGES) as SourceLanguage[]).map((code) => {
                    const meta = SOURCE_LANGUAGES[code];
                    const selected = selectedSource === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setSelectedSource(code);
                          const first = SUPPORTED_PAIRS.find((p) => p.source === code);
                          if (first) setSelectedTarget(first.target);
                        }}
                        className={`p-3.5 min-h-[52px] rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                          selected
                            ? 'bg-primary/20 border-primary text-primary shadow-md'
                            : 'bg-surface border-border text-text hover:border-surface-2'
                        }`}
                      >
                        <LanguageFlag code={code} size={24} />
                        <span>{isArabic ? meta.nameAr : meta.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Language */}
              <div>
                <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
                  {isArabic ? '٢. أريد أن أتعلّم التفكير بـ' : '2. I want to build reflexes in'}
                </p>
                <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                  {availableTargets.map((code) => {
                    const meta = TARGET_LANGUAGE_META[code];
                    const selected = selectedTarget === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedTarget(code)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          selected
                            ? 'bg-primary/20 border-primary text-primary shadow-md'
                            : 'bg-surface border-border text-text hover:border-surface-2'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <LanguageFlag code={code} size={20} />
                          <div className="text-start">
                            <span className="font-bold text-text block">{meta.nameEn}</span>
                            <span className="text-[10px] text-muted block">
                              {isArabic ? meta.descriptionAr : meta.descriptionEn}
                            </span>
                          </div>
                        </div>
                        {selected && <Check size={16} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{isArabic ? 'التالي' : 'Next'}</span>
              {isArabic ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        )}

        {/* STEP 1: Primary Goal */}
        {step === 1 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? 'ما هو مجالك وهدفك الأساسي؟' : 'What is your primary focus & goal?'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic
                    ? 'سيتم تكييف الأمثلة والذكاء الاصطناعي وفق سياقك المهني'
                    : 'Curriculum drills & AI prompts will adapt to your field'}
                </p>
              </div>

              <div className="grid gap-2.5">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const isSelected = selectedGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`p-3.5 min-h-[52px] rounded-2xl border text-xs font-bold transition flex items-center justify-between text-start ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-primary shadow-md ring-1 ring-primary/40'
                          : 'bg-surface border-border text-text hover:border-surface-2'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-text block truncate">{isArabic ? g.titleAr : g.titleEn}</span>
                          <span className="text-[10px] text-muted block truncate">{isArabic ? g.descAr : g.descEn}</span>
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-primary shrink-0 ms-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-4 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-sm"
              >
                {isArabic ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isArabic ? 'التالي' : 'Next'}</span>
                {isArabic ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CEFR Level Selection Grid (A0-A2) */}
        {step === 2 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  {isArabic ? 'حدد مستواك الحالي (CEFR)' : 'Select Your CEFR Level'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic
                    ? 'اختر نقطة انطلاقك. يمكنك التعديل والتبديل بحرية في أي وقت.'
                    : 'Choose your starting tier. Switch anytime from the main path.'}
                </p>
              </div>

              <div className="grid gap-2 max-h-[340px] overflow-y-auto pr-1">
                {cefrLevels.map((lvl) => {
                  const isSelected = selectedStage === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedStage(lvl.id)}
                      className={`p-3.5 min-h-[56px] rounded-2xl border text-start transition flex items-center justify-between ${
                        isSelected
                          ? `${lvl.accent} shadow-lg ring-2 ring-primary/40`
                          : 'bg-surface border-border text-text hover:border-surface-2'
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
                          <span className="text-[10px] text-muted block truncate">
                            {isArabic ? lvl.descAr : lvl.descEn}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-primary shrink-0 ms-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-sm"
              >
                {isArabic ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={() => handleFinish(selectedStage)}
                className="flex-[2] py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isArabic ? 'بدء التفكير الآن 🚀' : 'Start Thinking 🚀'}</span>
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
