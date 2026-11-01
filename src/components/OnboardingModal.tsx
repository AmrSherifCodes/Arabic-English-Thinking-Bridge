import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import type { LearningGoal, UserProfile } from '../types';

export interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
}

const DEFAULT_FALLBACK_PROFILE: UserProfile = {
  name: undefined,
  goal: 'general',
  learningStyle: 'visual',
  focusArea: 'general',
  language: 'arabic',
  dialect: 'egyptian',
  level: 'beginner'
};

const GOAL_OPTIONS: Array<{
  id: LearningGoal;
  icon: string;
  title: string;
  desc: string;
}> = [
  {
    id: 'work',
    icon: '💼',
    title: 'للشغل',
    desc: 'مقابلات العمل، خدمة العملاء، والمحادثات المهنية'
  },
  {
    id: 'academic',
    icon: '🎓',
    title: 'للدراسة',
    desc: 'الجامعة، الأبحاث العلمية، واللغة الأكاديمية'
  },
  {
    id: 'travel',
    icon: '✈️',
    title: 'للسفر',
    desc: 'المطارات، الفنادق، والتعامل السلس في أي مكان'
  },
  {
    id: 'general',
    icon: '🚀',
    title: 'عشان أطور نفسي',
    desc: 'أتكلم بثقة وأفكر بالإنجليزي بدون ترجمة في دماغي'
  }
];

export function OnboardingModal({
  isOpen,
  initialProfile,
  onComplete,
  onSkip
}: OnboardingModalProps) {
  const [name, setName] = useState<string>(initialProfile?.name || '');
  const [goal, setGoal] = useState<LearningGoal>(initialProfile?.goal || 'general');

  if (!isOpen) return null;

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim() || undefined,
      goal,
      learningStyle: 'visual',
      focusArea: 'general',
      language: 'arabic',
      dialect: 'egyptian',
      level: 'beginner'
    };
    onComplete(profile);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete(DEFAULT_FALLBACK_PROFILE);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إعداد حسابك"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 text-stone-900 dark:text-stone-100 shadow-2xl transition-all my-auto"
      >
        {/* Top subtle brand badge */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="ar text-xs font-black tracking-wide text-teal-700 dark:text-teal-300">
                فكّر إنجليزي · خطوة واحدة
              </p>
              <h2 className="ar text-lg font-black text-stone-900 dark:text-white">
                أهلاً بيك يا بطل 👋
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            تخطي الآن
          </button>
        </div>

        {/* Optional Name Field */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="user-name-input"
              className="ar block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-right"
            >
              اسمك إيه؟ (اختياري)
            </label>
            <input
              id="user-name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثلاً: أحمد، سارة، د. عمرو..."
              className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 px-4 py-3 text-sm text-stone-900 dark:text-white placeholder-stone-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 text-right ar font-medium"
            />
          </div>

          {/* 1 Question: Why are you learning English? */}
          <div>
            <p className="ar block text-sm font-black text-stone-900 dark:text-white mb-2 text-right">
              إنت بتتعلم إنجليزي ليه؟
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map(option => {
                const isSelected = goal === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setGoal(option.id)}
                    className={`flex flex-col text-right p-4 rounded-2xl border transition-all text-right ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 ring-2 ring-teal-600/30'
                        : 'bg-white dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{option.icon}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className="ar mt-2.5 text-base font-black text-stone-900 dark:text-white">
                      {option.title}
                    </span>
                    <span className="ar mt-1 text-xs font-medium text-stone-600 dark:text-stone-300 leading-snug">
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-black text-base shadow-md transition-all text-center ar"
          >
            <span>يلا نبدأ! 🚀</span>
            <ArrowRight size={18} className="rtl-flip" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
