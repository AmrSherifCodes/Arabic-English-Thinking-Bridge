import React, { useState } from 'react';
import { CefrStage } from '../../progression/types';
import { Check, Sparkles } from 'lucide-react';

interface OnboardingPlacementModalProps {
  isOpen: boolean;
  onComplete: (goal: string, dailyMin: number, placedStage: CefrStage) => void;
  isArabic?: boolean;
}

export function OnboardingPlacementModal({
  isOpen,
  onComplete,
  isArabic = true,
}: OnboardingPlacementModalProps) {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState('general');
  const [dailyTime, setDailyTime] = useState(10);
  const [placedStage, setPlacedStage] = useState<CefrStage>('A0');

  if (!isOpen) return null;

  const handleFinish = (stage: CefrStage = placedStage) => {
    onComplete(selectedGoal, dailyTime, stage);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-3xl bg-bg border border-border p-6 space-y-6 text-start shadow-2xl flex flex-col justify-between sm:justify-start">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span className="text-success font-black">
            {isArabic ? `الخطوة ${step + 1} من 3` : `Step ${step + 1} of 3`}
          </span>
          <span>{isArabic ? 'إعداد الحساب المجاني' : 'Free Profile Setup'}</span>
        </div>

        {/* Step 0: Goal */}
        {step === 0 && (
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

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm transition shadow-lg active:scale-95"
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 1: Daily Target Time */}
        {step === 1 && (
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
                    <span className="text-base block">{t} {isArabic ? 'دقائق' : 'min'}</span>
                    <span className="text-[10px] text-muted">{isArabic ? 'يومياً' : 'daily'}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm transition shadow-lg active:scale-95"
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 2: Adaptive Placement Choice */}
        {step === 2 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text">
                  {isArabic ? 'من أين تريد البدء؟' : 'Where do you want to start?'}
                </h3>
                <p className="text-xs text-muted">
                  {isArabic ? 'اختر البدء من الصفر أو خوض اختبار تحديد المستوى السريع' : 'Start from scratch or take a quick placement check'}
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
                  onClick={() => {
                    setPlacedStage('A1');
                    handleFinish('A1');
                  }}
                  className="w-full p-4 min-h-[48px] rounded-2xl bg-surface border border-border text-text font-bold text-xs hover:border-success/40 transition flex items-center justify-between active:scale-95"
                >
                  <span>{isArabic ? 'عندي خلفية سابقة (التخطي للمرحلة A1)' : 'I have background (Jump to A1)'}</span>
                  <Check size={18} className="text-success" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
