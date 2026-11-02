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

const DIALECT_OPTIONS = [
  {
    id: 'egyptian' as const,
    icon: '🇪🇬',
    title: 'العامية المصرية (Egyptian Ammiya)',
    desc: 'الأمثلة والشرح بالعامية المصرية الحقيقية التي نستخدمها يومياً'
  },
  {
    id: 'msa' as const,
    icon: '🌍',
    title: 'العربية الفصحى (Modern Standard Arabic)',
    desc: 'الأمثلة والشرح باللغة العربية الفصحى المناسبة لجميع الدول العربية'
  }
];

const LEVEL_OPTIONS = [
  {
    id: 'beginner' as const,
    icon: '🟢',
    title: 'مبتدئ (Beginner)',
    desc: 'أبدأ من الأساسيات وبناء الجمل والكلمات الأكثر شيوعاً'
  },
  {
    id: 'intermediate' as const,
    icon: '🟡',
    title: 'متوسط (Intermediate)',
    desc: 'أفهم القواعد وأريد التحدث بطلاقة والتوقف عن الترجمة الحرفية في عقلي'
  },
  {
    id: 'advanced' as const,
    icon: '🔵',
    title: 'متقدم (Advanced)',
    desc: 'أحتاج صياغات احترافية ومصطلحات متقدمة في المحادثات والعمل'
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
    desc: 'مقابلات العمل، كول سنتر، إيميلات، ومحادثات الشركات'
  },
  {
    id: 'academic',
    icon: '🎓',
    title: 'للدراسة والجامعة',
    desc: 'الأبحاث العلمية، الامتحانات، والمصطلحات الأكاديمية'
  },
  {
    id: 'travel',
    icon: '✈️',
    title: 'للسفر والحياة اليومية',
    desc: 'المطارات، الفنادق، والمحادثات السلسة أثناء التنقل'
  },
  {
    id: 'general',
    icon: '🚀',
    title: 'طلاقة عامة وتطوير الذات',
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
      aria-label="تخصيص تفضيلاتك التعليمية"
      dir="rtl"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 text-stone-100 shadow-2xl transition-all my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="ar text-xs font-black tracking-wide text-teal-400">
                جسر التفكير · التخصيص الذكي
              </p>
              <h2 className="ar text-lg font-black text-white">
                أهلاً بك في جسر التفكير 👋
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-stone-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-stone-800 transition"
          >
            تخطي الآن
          </button>
        </div>

        {/* Progress Bar (Step Indicator) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(idx => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step
                    ? 'w-8 bg-teal-400'
                    : idx < step
                    ? 'w-4 bg-teal-600'
                    : 'w-3 bg-stone-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-stone-400">
            الخطوة {step + 1} من 3
          </span>
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
              className="space-y-4"
            >
              <div>
                <h3 className="ar text-base font-black text-white">
                  ١. ما هي اللهجة التي تفضلها في الأمثلة والشرح؟
                </h3>
                <p className="ar text-xs text-stone-400 mt-1">
                  يتكيف القاموس والدروس والصوت تلقائياً بناءً على اختيارك
                </p>
              </div>

              <div className="grid gap-3 pt-1">
                {DIALECT_OPTIONS.map(opt => {
                  const isSelected = dialect === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDialect(opt.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border text-right transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-3xl shrink-0 mt-0.5">{opt.icon}</span>
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
              className="space-y-4"
            >
              <div>
                <h3 className="ar text-base font-black text-white">
                  ٢. ما هو مستواك الحالي في اللغة الإنجليزية؟
                </h3>
                <p className="ar text-xs text-stone-400 mt-1">
                  سنبدأ معك من المكان الذي يناسب مستواك تماماً
                </p>
              </div>

              <div className="grid gap-3 pt-1">
                {LEVEL_OPTIONS.map(opt => {
                  const isSelected = level === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLevel(opt.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border text-right transition cursor-pointer ${
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

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div>
                <h3 className="ar text-base font-black text-white">
                  ٣. ما هو هدفك الأساسي من التعلم؟
                </h3>
                <p className="ar text-xs text-stone-400 mt-1">
                  سنوصيك بأفضل الدروس والمفردات المناسبة لغايتك
                </p>
              </div>

              {/* Goal Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {GOAL_OPTIONS.map(opt => {
                  const isSelected = goal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGoal(opt.id)}
                      className={`flex flex-col text-right p-3.5 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl">{opt.icon}</span>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-stone-950 font-bold">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="ar mt-2 text-sm font-black text-stone-100">
                        {opt.title}
                      </span>
                      <span className="ar mt-1 text-xs text-stone-400 leading-snug">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Name Input */}
              <div className="pt-2">
                <label
                  htmlFor="user-name-input"
                  className="ar block text-xs font-bold text-stone-300 mb-1.5 text-right"
                >
                  اسمك إيه؟ (اختياري)
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثلاً: أحمد، سارة، م. شريف..."
                  className="w-full rounded-2xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-right ar font-medium"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-800">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition flex items-center gap-1.5"
            >
              <ArrowRight size={16} />
              <span>السابق</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 font-black text-sm shadow-md transition flex items-center gap-2"
          >
            {step < 2 ? (
              <>
                <span>التالي</span>
                <ArrowLeft size={16} />
              </>
            ) : (
              <>
                <span>يلا نبدأ! 🚀</span>
                <Sparkles size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
