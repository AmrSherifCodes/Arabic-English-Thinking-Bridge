import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, MessageCircle, RefreshCw, ArrowLeft, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PHASES_DATA } from '../../data/lessons';
import { ExerciseItem } from '../../progression/types';
import { soundFX } from '../../utils/soundFX';
import { triggerHapticNotification } from '../../utils/fx';
import { NotificationType } from '@capacitor/haptics';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  // We extract a canonical exercise (e.g., 'عندي سؤال مهم' -> 'I have an important question')
  // from PHASES_DATA for the structural lesson demo.
  const demoExercise: any = PHASES_DATA[0]?.lessons.find(l => l.id === 'p1-l3')?.exercises.find(e => e.id === 'ex-1-3-1');

  const steps = [
    {
      id: 'philosophy',
      title: 'فكّر بالإنجليزي، مش تترجم',
      description: 'الطريقة التقليدية بتخليك تترجم كل كلمة في دماغك قبل ما تتكلم. هنا إحنا بنبني "جسور هيكلية" عشان تفكر وتتكلم مباشرة بالإنجليزي.',
      icon: <BrainCircuit className="w-20 h-20 text-[var(--color-primary)] mb-8 mx-auto" />
    },
    {
      id: 'lesson-demo',
      title: 'الدروس الهيكلية التفاعلية',
      description: 'كل درس بيعلمك إزاي تبني الجملة صح من غير ما تحفظ قواعد جافة.',
      icon: <Zap className="w-16 h-16 text-[var(--secondary-amber)] mb-6 mx-auto drop-shadow-md" />,
      content: demoExercise && (
        <div className="bg-[var(--color-surface-2)] p-4 rounded-2xl text-right mt-6 border border-[var(--color-border)] shadow-xl">
          <p className="text-[var(--color-muted)] text-sm mb-2 font-arabic">بدل ما تترجم حرفياً:</p>
          <p className="text-xl font-bold font-arabic mb-4 text-[var(--color-danger)] line-through decoration-[var(--color-danger)]/50">عندي سؤال مهم (With me important question)</p>
          <p className="text-[var(--color-muted)] text-sm mb-2 font-arabic">بنخليك تفكر كده:</p>
          <div className="flex flex-col gap-2 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
            {demoExercise.breakdownChunks?.map((chunk: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="font-arabic text-[var(--color-primary)]">{chunk.arabicText}</span>
                <ArrowLeft className="w-4 h-4 text-[var(--color-muted)]" />
                <span className="font-mono text-[var(--color-success)] font-bold">{chunk.englishText}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-center text-lg font-bold text-[var(--color-text)] tracking-wide">
            {demoExercise.targetSentence}
          </p>
        </div>
      )
    },
    {
      id: 'smart-trainer',
      title: 'المدرب الذكي والتحدث الصوتي',
      description: 'بعد كل درس، هتتكلم بصوتك مع المدرب الذكي. بيسمعك، بيصحح لك، وبيساعدك تكسر حاجز الخوف من الكلام، وكل ده 100% بدون إنترنت.',
      icon: <MessageCircle className="w-16 h-16 text-indigo-400 mb-6 mx-auto drop-shadow-md" />
    },
    {
      id: 'srs',
      title: 'نظام المراجعة الذكي (SRS)',
      description: 'عشان ما تنساش اللي اتعلمته، التطبيق بيبرمج مراجعاتك أوتوماتيكياً بطريقة التكرار المتباعد (Spaced Repetition) عشان يثبت الجمل في ذاكرتك للأبد.',
      icon: <RefreshCw className="w-16 h-16 text-sky-400 mb-6 mx-auto drop-shadow-md" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
      soundFX.playChipSelect();
    } else {
      // Grand finale!
      soundFX.playFanfare();
      triggerHapticNotification(NotificationType.Success);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#F0B84C', '#6FCF97', '#56CCF2'] });

      localStorage.setItem('tb.onboardingComplete', 'true');
      setTimeout(() => onComplete(), 1500); // Wait a moment for the fanfare before closing
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tb.onboardingComplete', 'true');
    onComplete();
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100000] bg-[var(--color-bg)] flex flex-col justify-between overflow-hidden">
      {/* Background Decorators for visual flair */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[var(--color-surface-2)]/20 to-transparent pointer-events-none" />

      <div className="relative z-10 flex-1 overflow-y-auto pt-16 pb-8 px-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="max-w-md w-full text-center"
          >
            {currentStep.icon}

            <h1 className="text-3xl font-bold font-arabic mb-6 text-[var(--color-text)] leading-tight tracking-wide">
              {currentStep.title}
            </h1>

            <p className="text-lg font-arabic text-[var(--color-text-soft)] leading-relaxed px-2">
              {currentStep.description}
            </p>

            {currentStep.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-20 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-6 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="max-w-md w-full mx-auto flex flex-col gap-4">
          <div className="flex justify-center gap-3 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  i === step ? 'w-10 bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]' : 'w-2 bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-[var(--color-on-primary)] font-arabic font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            {step === steps.length - 1 ? (
              <>
                <span>ابدأ رحلتك</span>
                <CheckCircle className="w-6 h-6" />
              </>
            ) : (
              <>
                <span>التالي</span>
                <ArrowLeft className="w-6 h-6" />
              </>
            )}
          </button>

          {step < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-xl bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)] font-arabic text-base transition-colors"
            >
              تخطي المقدمة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
