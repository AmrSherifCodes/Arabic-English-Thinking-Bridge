import React, { useState } from 'react';
import { CefrStage } from '../../progression/types';
import { Check, Sparkles, Globe, ArrowRight } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, SUPPORTED_PAIRS } from '../../data/languages';
import { LanguageFlag } from '../LanguageFlag';

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
  const [step, setStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<SourceLanguage>(initialSource);
  const [selectedTarget, setSelectedTarget] = useState<TargetLanguage>(initialTarget);
  const [selectedGoal, setSelectedGoal] = useState('general');
  const [dailyTime, setDailyTime] = useState(10);

  if (!isOpen) return null;

  const handleFinish = (stage: CefrStage) => {
    onComplete(selectedGoal, dailyTime, stage, selectedSource, selectedTarget);
  };

  const availableTargets = SUPPORTED_PAIRS
    .filter((p) => p.source === selectedSource)
    .map((p) => p.target);

  return (
    <div
      className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-3xl bg-bg border border-border p-6 space-y-6 text-start shadow-2xl flex flex-col justify-between sm:justify-start overflow-y-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span className="text-success font-black">
            {isArabic ? `الخطوة ${step + 1} من 4` : `Step ${step + 1} of 4`}
          </span>
          <span>{isArabic ? 'إعداد الحساب المجاني' : 'Free Profile Setup'}</span>
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
                            ? 'bg-success/20 border-success text-success shadow-md'
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
                  {isArabic ? '٢. أريد أن أتعلم التفكير بـ' : '2. I want to learn to think in'}
                </p>
                <div className="grid gap-2">
                  {availableTargets.map((code) => {
                    const meta = TARGET_LANGUAGES[code];
                    const selected = selectedTarget === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedTarget(code)}
                        className={`p-3.5 min-h-[48px] rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          selected
                            ? 'bg-success/20 border-success text-success shadow-md'
                            : 'bg-surface border-border text-text hover:border-surface-2'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LanguageFlag code={code} size={22} />
                          <div className="text-start">
                            <div className="font-black">{meta.nameNative}</div>
                            <div className="text-[10px] text-muted font-medium">
                              {isArabic ? meta.descriptionAr : meta.descriptionEn}
                            </div>
                          </div>
                        </div>
                        {selected && <Check size={18} className="text-success shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isArabic ? 'التالي' : 'Next'}</span>
              <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
            </button>
          </div>
        )}

        {/* STEP 1: Goal */}
        {step === 1 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? 'ما هو هدفك الأساسي لتعلم التفكير باللغة؟' : 'What is your main learning goal?'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic ? 'سنقوم بضبط خوارزمية التمارين خصيصاً لهدفك' : 'We will customize exercises for your goal'}
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  { id: 'work', titleAr: '💼 للشغل والشركات (Corporate)', titleEn: 'Workplace & Corporate' },
                  { id: 'travel', titleAr: '✈️ للسفر والحياة بالخارج', titleEn: 'Travel & Living Abroad' },
                  { id: 'study', titleAr: '🎓 للدراسة والأبحاث الأكاديمية', titleEn: 'Study & Academics' },
                  { id: 'general', titleAr: '🚀 طلاقة عامة والتفكير التلقائي', titleEn: 'General Fluency & Reflexes' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-3.5 min-h-[48px] rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                      selectedGoal === g.id
                        ? 'bg-success/20 border-success text-success shadow-md'
                        : 'bg-surface border-border text-text hover:border-surface-2'
                    }`}
                  >
                    <span>{isArabic ? g.titleAr : g.titleEn}</span>
                    {selectedGoal === g.id && <Check size={18} className="text-success" />}
                  </button>
                ))}
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
                className="flex-[2] py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm shadow-lg active:scale-95"
              >
                {isArabic ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Daily Target Time */}
        {step === 2 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? 'كم الوقت الذي تريد استثماره يومياً؟' : 'How much time will you invest daily?'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic ? 'الاستمرارية اليومية القصيرة تصنع معجزات في التفكير' : 'Short daily habits create huge cognitive shifts'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[5, 10, 15, 20].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDailyTime(t)}
                    className={`p-4 min-h-[48px] rounded-2xl border text-center font-black transition ${
                      dailyTime === t
                        ? 'bg-success/20 border-success text-success shadow-md'
                        : 'bg-surface border-border text-text'
                    }`}
                  >
                    <span className="text-base block">{t} {isArabic ? (t <= 10 ? 'دقائق' : 'دقيقة') : 'min'}</span>
                    <span className="text-[10px] text-muted">{isArabic ? 'يومياً' : 'daily'}</span>
                  </button>
                ))}
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
                onClick={() => setStep(3)}
                className="flex-[2] py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm shadow-lg active:scale-95"
              >
                {isArabic ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Adaptive Placement Choice */}
        {step === 3 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? 'من أين تريد البدء؟' : 'Where do you want to start?'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic ? 'أنت من يحدد مستواك — اختر المرحلة المناسبة، ويمكنك تغييرها في أي وقت' : 'You decide your level — pick a stage, change it anytime'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleFinish('A0')}
                  className="w-full p-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-xs transition shadow-lg flex items-center justify-between active:scale-95"
                >
                  <span>{isArabic ? 'البدء من الصفر (المرحلة A0) 🚀' : 'Start from scratch (Stage A0) 🚀'}</span>
                  <Sparkles size={18} />
                </button>

                <button
                  onClick={() => handleFinish('A1')}
                  className="w-full p-4 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-xs hover:border-success/40 transition flex items-center justify-between active:scale-95"
                >
                  <span>{isArabic ? 'أعرف الأساسيات (ابدأ من المرحلة A1)' : 'I know the basics (Start at A1)'}</span>
                  <Check size={18} className="text-success" />
                </button>

                <button
                  onClick={() => handleFinish('A2')}
                  className="w-full p-4 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-xs hover:border-success/40 transition flex items-center justify-between active:scale-95"
                >
                  <span>{isArabic ? 'أتحدث بشكل جيد (ابدأ من المرحلة A2)' : 'I can hold conversations (Start at A2)'}</span>
                  <Check size={18} className="text-success" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-surface border border-border text-text font-bold text-sm"
            >
              {isArabic ? 'رجوع' : 'Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
