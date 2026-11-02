import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import type { LearningGoal, UserProfile } from '../types';

export interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
}

const AMR_SPEECH = [
  {
    pose: '/amr-guide/pose1.png',
    coachTag: 'عمرو شريف · مدربك اللغوي 🇪🇬',
    title: 'أهلاً بيك يا بطل! أنا عمرو 👋',
    dialogue: 'وهكون معاك خطوة بخطوة عشان نفك عقدة الإنجليزي ونبني التفكير باللغة مش الترجمة الحرفية. قولي.. تحب نبدأ بالأمثلة والشرح بالعامية المصرية ولا بالعربية الفصحى؟',
  },
  {
    pose: '/amr-guide/pose3.png',
    coachTag: 'عمرو شريف · لحظة الإلهام 💡',
    title: 'عاش عليك! اختيار ممتاز 👏',
    dialogue: 'دلوقتي قولي.. إيه مستواك الحالي في الإنجليزي؟ عشان أظبطلك التمارين والمفردات بالمللي على مقاسك وما نضيعش وقتك في اللي إنت عارفه!',
  },
  {
    pose: '/amr-guide/pose4.png',
    coachTag: 'عمرو شريف · جاهز للانطلاق 🚀',
    title: 'وصلنا لأهم خطوة مع بعض! 🎯',
    dialogue: 'إيه هو هدفك الأساسي اللي بتتعلم علشانه؟ وقولي اسمك إيه لو حابب أناديك بيه وإحنا بنتدرب سوا!',
  }
];

const DIALECT_OPTIONS = [
  {
    id: 'egyptian' as const,
    icon: '🇪🇬',
    title: 'العامية المصرية (Egyptian Ammiya)',
    desc: 'الأمثلة والشرح بالعامية المصرية الحقيقية زي كلامنا اليومي في الشارع والشغل'
  },
  {
    id: 'msa' as const,
    icon: '🌍',
    title: 'العربية الفصحى (Modern Standard Arabic)',
    desc: 'الأمثلة والشرح باللغة العربية الفصحى المناسبة لجميع الدول العربية الشقيقة'
  }
];

const LEVEL_OPTIONS = [
  {
    id: 'beginner' as const,
    icon: '🟢',
    title: 'مبتدئ (Beginner)',
    desc: 'أبدأ من الأساسيات وبناء الجمل والكلمات الأكثر استخداماً بدون تعقيد'
  },
  {
    id: 'intermediate' as const,
    icon: '🟡',
    title: 'متوسط (Intermediate)',
    desc: 'عندي حصيلة كلمات وقواعد، بس عاوز أتكلم بطلاقة بدون ترجمة في دماغي'
  },
  {
    id: 'advanced' as const,
    icon: '🔵',
    title: 'متقدم (Advanced)',
    desc: 'محتاج صياغات احترافية، ومصطلحات متقدمة في مجال عملي والأبحاث'
  }
];

const GOAL_OPTIONS: Array<{
  id: LearningGoal;
  icon: string;
  title: string;
  desc: string;
}> = [
  {
    id: 'work',
    icon: '💼',
    title: 'للشغل وخدمة العملاء',
    desc: 'مقابلات العمل، كول سنتر، إيميلات، ومحادثات الشركات الدولية'
  },
  {
    id: 'academic',
    icon: '🎓',
    title: 'للدراسة والجامعة',
    desc: 'الأبحاث العلمية، الامتحانات، والمصطلحات الأكاديمية التخصصية'
  },
  {
    id: 'travel',
    icon: '✈️',
    title: 'للسفر والحياة اليومية',
    desc: 'المطارات، الفنادق، والمحادثات الحياتية السلسة في أي مكان'
  },
  {
    id: 'general',
    icon: '🚀',
    title: 'طلاقة عامة وثقة بالنفس',
    desc: 'أتكلم بثقة تامة وأفكر بالإنجليزي مباشرة كالمتحدث الأصلي'
  }
];

export function OnboardingModal({
  isOpen,
  initialProfile,
  onComplete,
  onSkip
}: OnboardingModalProps) {
  const [step, setStep] = useState<number>(0); // 0: Dialect, 1: Level, 2: Goal & Name
  const [dialect, setDialect] = useState<'egyptian' | 'msa'>(initialProfile?.dialect || 'egyptian');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(initialProfile?.level || 'beginner');
  const [goal, setGoal] = useState<LearningGoal>(initialProfile?.goal || 'general');
  const [name, setName] = useState<string>(initialProfile?.name || '');

  if (!isOpen) return null;

  const currentCoach = AMR_SPEECH[step] || AMR_SPEECH[0];

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim() || undefined,
      dialect,
      level,
      goal,
      focusArea:
        goal === 'work'
          ? 'workplace'
          : goal === 'academic'
          ? 'academic'
          : goal === 'travel'
          ? 'travel'
          : 'daily-speech',
      learningStyle: 'visual',
      language: 'arabic'
    };
    onComplete(profile);
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      handleFinish();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تخصيص تفضيلاتك التعليمية مع عمرو"
      dir="rtl"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-7 text-stone-100 shadow-2xl transition-all my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles size={16} />
            </span>
            <span className="ar text-xs font-black tracking-wide text-teal-400">
              جسر التفكير · تجربة مخصصة
            </span>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-stone-400 hover:text-white px-2.5 py-1 rounded-xl hover:bg-stone-800 transition"
          >
            تخطي الآن
          </button>
        </div>

        {/* Progress Bar (Step Indicator) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(idx => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === step
                    ? 'w-8 bg-teal-400'
                    : idx < step
                    ? 'w-4 bg-teal-600'
                    : 'w-2.5 bg-stone-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-stone-400">
            الخطوة {step + 1} من 3
          </span>
        </div>

        {/* Amr's Animated Interactive Coach Card */}
        <div className="flex items-center gap-3 bg-stone-950/80 border border-teal-500/30 rounded-2xl p-3 sm:p-3.5 mb-4 relative overflow-hidden">
          {/* Animated 3D Avatar */}
          <div className="relative shrink-0 flex flex-col items-center">
            <motion.img
              key={currentCoach.pose}
              src={currentCoach.pose}
              alt="Amr Sherif"
              className="w-16 sm:w-20 h-auto object-contain drop-shadow-[0_8px_16px_rgba(20,184,166,0.3)] select-none"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />
            <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 mt-1">
              عمرو شريف
            </span>
          </div>

          {/* Animated Speech Dialogue Bubble */}
          <div className="flex-1 bg-stone-900/90 border border-stone-800 rounded-xl p-3 relative shadow-inner">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-400 mb-1">
              <Sparkles size={11} />
              <span>{currentCoach.coachTag}</span>
            </div>
            <h4 className="ar text-xs sm:text-sm font-black text-white mb-0.5">
              {currentCoach.title}
            </h4>
            <p className="ar text-xs text-stone-300 leading-relaxed font-medium">
              {currentCoach.dialogue}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              <div className="grid gap-2.5">
                {DIALECT_OPTIONS.map(opt => {
                  const isSelected = dialect === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDialect(opt.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-right transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="ar font-black text-sm text-stone-100">
                            {opt.title}
                          </span>
                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-stone-950 font-bold">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="ar text-xs text-stone-400 mt-1 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              <div className="grid gap-2.5">
                {LEVEL_OPTIONS.map(opt => {
                  const isSelected = level === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLevel(opt.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-right transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="ar font-black text-sm text-stone-100">
                            {opt.title}
                          </span>
                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-stone-950 font-bold">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="ar text-xs text-stone-400 mt-1 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {/* Goal Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GOAL_OPTIONS.map(opt => {
                  const isSelected = goal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGoal(opt.id)}
                      className={`flex flex-col text-right p-3 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl">{opt.icon}</span>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-stone-950 font-bold">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="ar mt-1.5 text-xs sm:text-sm font-black text-stone-100">
                        {opt.title}
                      </span>
                      <span className="ar mt-0.5 text-[11px] text-stone-400 leading-snug">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Name Input */}
              <div className="pt-1">
                <label
                  htmlFor="user-name-input"
                  className="ar block text-xs font-bold text-stone-300 mb-1 text-right"
                >
                  اسمك إيه؟ (اختياري عشان أناديك بيه)
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثلاً: أحمد، سارة، م. شريف..."
                  className="w-full rounded-2xl border border-stone-800 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-right ar font-medium"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-stone-800">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition flex items-center gap-1.5"
            >
              <ArrowRight size={15} />
              <span>السابق</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
          >
            {step < 2 ? (
              <>
                <span>الخطوة التالية</span>
                <ArrowLeft size={15} />
              </>
            ) : (
              <>
                <span>يلا نبدأ التعلم! 🚀</span>
                <Sparkles size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
