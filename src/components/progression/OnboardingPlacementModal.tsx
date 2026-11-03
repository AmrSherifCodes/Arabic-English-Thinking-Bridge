import React, { useState } from 'react';
import { CefrStage } from '../../progression/types';
import { ArrowRight, ArrowLeft, Check, Sparkles, Rocket } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md rounded-3xl bg-[#0F151C] border border-[#1E2933] p-6 space-y-6 text-start shadow-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-stone-400">
          <span className="text-teal-400 font-black">
            {isArabic ? `الخطوة ${step + 1} من 4` : `Step ${step + 1} of 4`}
          </span>
          <span>{isArabic ? 'إعداد الحساب المجاني' : 'Free Profile Setup'}</span>
        </div>

        {/* Step 0: Goal */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {isArabic ? 'ما هو هدفك الأساسي لتعلم التفكير باللغة؟' : 'What is your main learning goal?'}
              </h3>
              <p className="text-xs text-stone-400">
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
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                    selectedGoal === g.id
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <span>{isArabic ? g.titleAr : g.titleEn}</span>
                  {selectedGoal === g.id && <Check size={16} className="text-teal-400" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-2xl bg-teal-400 text-stone-950 font-black text-xs transition hover:bg-teal-300"
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 1: Daily Target Time */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {isArabic ? 'كم الوقت الذي تريد استثماره يومياً؟' : 'How much time will you invest daily?'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? 'الاستمرارية اليومية القصيرة تصنع معجزات في التفكير' : 'Short daily habits create huge cognitive shifts'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[5, 10, 15, 20].map((t) => (
                <button
                  key={t}
                  onClick={() => setDailyTime(t)}
                  className={`p-4 rounded-2xl border text-center font-black transition ${
                    dailyTime === t
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-stone-900 border-stone-800 text-stone-300'
                  }`}
                >
                  <span className="text-base block">{t} {isArabic ? 'دقائق' : 'min'}</span>
                  <span className="text-[10px] text-stone-400">{isArabic ? 'يومياً' : 'daily'}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-teal-400 text-stone-950 font-black text-xs transition hover:bg-teal-300"
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 2: Adaptive Placement Choice */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {isArabic ? 'من أين تريد البدء؟' : 'Where do you want to start?'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? 'اختر البدء من الصفر أو خوض اختبار تحديد المستوى السريع' : 'Start from scratch or take a quick placement check'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleFinish('A0')}
                className="w-full p-4 rounded-2xl bg-teal-400 text-stone-950 font-black text-xs transition hover:bg-teal-300 shadow-lg flex items-center justify-between"
              >
                <span>{isArabic ? 'البدء من الصفر (المرحلة A0) 🚀' : 'Start from scratch (Stage A0) 🚀'}</span>
                <Sparkles size={18} />
              </button>

              <button
                onClick={() => {
                  setPlacedStage('A1');
                  handleFinish('A1');
                }}
                className="w-full p-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 font-bold text-xs hover:border-teal-500/40 transition flex items-center justify-between"
              >
                <span>{isArabic ? 'عندي خلفية سابقة (التخطي للمرحلة A1)' : 'I have background (Jump to A1)'}</span>
                <Check size={16} className="text-teal-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
