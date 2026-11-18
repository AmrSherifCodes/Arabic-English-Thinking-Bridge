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
      icon: <BrainCircuit className="w-16 h-16 text-teal-400 mb-6 mx-auto" />
    },
    {
      id: 'lesson-demo',
      title: 'الدروس الهيكلية التفاعلية',
      description: 'كل درس بيعلمك إزاي تبني الجملة صح من غير ما تحفظ قواعد جافة.',
      icon: <Zap className="w-16 h-16 text-amber-400 mb-6 mx-auto" />,
      content: demoExercise && (
        <div className="bg-stone-800 p-4 rounded-xl text-right mt-6 border border-stone-700">
          <p className="text-stone-400 text-sm mb-2 font-arabic">بدل ما تترجم حرفياً:</p>
          <p className="text-xl font-bold font-arabic mb-4 text-rose-400 line-through decoration-rose-500/50">عندي سؤال مهم (With me important question)</p>
          <p className="text-stone-400 text-sm mb-2 font-arabic">بنخليك تفكر كده:</p>
          <div className="flex flex-col gap-2 bg-stone-900 p-3 rounded-lg border border-stone-800">
            {demoExercise.breakdownChunks?.map((chunk: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="font-arabic text-teal-300">{chunk.arabicText}</span>
                <ArrowLeft className="w-4 h-4 text-stone-500" />
                <span className="font-mono text-emerald-400 font-bold">{chunk.englishText}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-center text-lg font-bold text-white tracking-wide">
            {demoExercise.targetSentence}
          </p>
        </div>
      )
    },
    {
      id: 'smart-trainer',
      title: 'المدرب الذكي والتحدث الصوتي',
      description: 'بعد كل درس، هتتكلم بصوتك مع المدرب الذكي. بيسمعك، بيصحح لك، وبيساعدك تكسر حاجز الخوف من الكلام، وكل ده 100% بدون إنترنت.',
      icon: <MessageCircle className="w-16 h-16 text-indigo-400 mb-6 mx-auto" />
    },
    {
      id: 'srs',
      title: 'نظام المراجعة الذكي (SRS)',
      description: 'عشان ما تنساش اللي اتعلمته، التطبيق بيبرمج مراجعاتك أوتوماتيكياً بطريقة التكرار المتباعد (Spaced Repetition) عشان يثبت الجمل في ذاكرتك للأبد.',
      icon: <RefreshCw className="w-16 h-16 text-sky-400 mb-6 mx-auto" />
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
    <div className="fixed inset-0 z-[100000] bg-stone-950 flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto pt-16 pb-8 px-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md w-full text-center"
          >
            {currentStep.icon}

            <h1 className="text-3xl font-bold font-arabic mb-6 text-stone-100 leading-tight">
              {currentStep.title}
            </h1>

            <p className="text-lg font-arabic text-stone-300 leading-relaxed">
              {currentStep.description}
            </p>

            {currentStep.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-stone-900 border-t border-stone-800 p-6 safe-area-bottom">
        <div className="max-w-md w-full mx-auto flex flex-col gap-4">
          <div className="flex justify-center gap-2 mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-teal-500' : 'w-2 bg-stone-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-arabic font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            {step === steps.length - 1 ? (
              <>
                <span>ابدأ رحلتك</span>
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </>
            )}
          </button>

          {step < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-xl bg-transparent text-stone-400 hover:text-stone-300 font-arabic text-base transition-colors"
            >
              تخطي المقدمة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
