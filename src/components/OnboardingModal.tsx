import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, Eye, Headphones, BookOpen, FlaskConical, MessageSquare, Briefcase, Globe } from 'lucide-react';
import type { FocusArea, LearningGoal, LearningStyle, UserProfile } from '../types';

export interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
}

const DEFAULT_FALLBACK_PROFILE: UserProfile = {
  name: 'Learner',
  goal: 'general',
  learningStyle: 'visual',
  focusArea: 'daily-speech',
  language: 'arabic',
  dialect: 'egyptian',
  level: 'beginner'
};

export function OnboardingModal({
  isOpen,
  initialProfile,
  onComplete,
  onSkip
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState<string>(initialProfile?.name || '');
  const [goal, setGoal] = useState<LearningGoal>(initialProfile?.goal || 'academic');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(initialProfile?.learningStyle || 'visual');
  const [focusArea, setFocusArea] = useState<FocusArea>(initialProfile?.focusArea || 'chemistry');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 2 | 3);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
    }
  };

  const finishOnboarding = () => {
    const profile: UserProfile = {
      name: name.trim() || undefined,
      goal,
      learningStyle,
      focusArea,
      language: initialProfile?.language ?? 'arabic',
      dialect: initialProfile?.dialect ?? 'egyptian',
      level: initialProfile?.level ?? 'beginner'
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
      aria-label="Personalized Profile Setup"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-700/80 bg-stone-900/95 p-6 sm:p-8 text-stone-100 shadow-2xl transition-all my-auto">
        {/* Header / Steps Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
              <Compass size={18} />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
                Thinking English Setup
              </p>
              <h2 className="text-base font-bold text-white">
                Step {step} of 3 · {step === 1 ? 'Goal & Name' : step === 2 ? 'Learning Style' : 'Focus Area'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Indicators */}
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3].map(s => (
                <span
                  key={s}
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    s <= step ? 'bg-teal-500' : 'bg-stone-700'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="ml-2 text-xs font-semibold text-stone-400 hover:text-stone-200 transition px-2 py-1 rounded-lg hover:bg-stone-800"
            >
              Skip
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Name & Learning Goal */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="user-name-input" className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  What should we call you? (Optional)
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amr, Sarah, Dr. Ahmed"
                  className="w-full rounded-xl border border-stone-700 bg-stone-800/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                  What is your primary learning goal?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'academic' as LearningGoal,
                      icon: '🎓',
                      title: 'Academic & Science',
                      desc: 'University, research, lab papers, formal English'
                    },
                    {
                      id: 'travel' as LearningGoal,
                      icon: '✈️',
                      title: 'Travel & Mobility',
                      desc: 'Airports, hotels, ordering food, directions'
                    },
                    {
                      id: 'business' as LearningGoal,
                      icon: '💼',
                      title: 'Business & Career',
                      desc: 'Call centers, client retention, corporate meetings'
                    },
                    {
                      id: 'general' as LearningGoal,
                      icon: '🌍',
                      title: 'General Fluency',
                      desc: 'Thinking in English naturally without translation'
                    }
                  ].map(option => {
                    const isSelected = goal === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setGoal(option.id)}
                        className={`flex flex-col text-left p-3.5 rounded-2xl border transition ${
                          isSelected
                            ? 'bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/30'
                            : 'bg-stone-800/50 border-stone-700/70 hover:bg-stone-800 hover:border-stone-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl">{option.icon}</span>
                          {isSelected && <Check size={16} className="text-teal-400" />}
                        </div>
                        <span className="mt-2 text-sm font-bold text-white">{option.title}</span>
                        <span className="mt-0.5 text-xs text-stone-400 leading-snug">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Learning Style */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                  How does your brain process new thoughts best?
                </p>
                <p className="text-xs text-stone-400 mb-3">
                  We customize the exercises and AI tutor explanations to your cognitive style.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'visual' as LearningStyle,
                    Icon: Eye,
                    title: 'Visual Architecture',
                    desc: 'I learn by seeing word blocks, color-coded sentence parts, and diagram maps.',
                    badge: 'Interactive Blocks'
                  },
                  {
                    id: 'audio' as LearningStyle,
                    Icon: Headphones,
                    title: 'Auditory & Voice Flow',
                    desc: 'I learn best by listening to voice notes, spoken rhythm, and speech practice.',
                    badge: 'Voice & Sound'
                  },
                  {
                    id: 'text' as LearningStyle,
                    Icon: BookOpen,
                    title: 'Analytical & Textual',
                    desc: 'I prefer in-depth grammatical breakdowns, sentence comparisons, and notes.',
                    badge: 'Deep Rules'
                  }
                ].map(option => {
                  const isSelected = learningStyle === option.id;
                  const Icon = option.Icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLearningStyle(option.id)}
                      className={`flex items-start gap-3.5 w-full text-left p-4 rounded-2xl border transition ${
                        isSelected
                          ? 'bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-800/50 border-stone-700/70 hover:bg-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-teal-500/30 text-teal-300' : 'bg-stone-700/50 text-stone-400'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white">{option.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-700 text-stone-300">
                            {option.badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{option.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Focus Area */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Choose your specialized focus area:
                </p>
                <p className="text-xs text-stone-400 mb-3">
                  This customizes the AI tutor metaphors (e.g. using chemistry analogies for grammar) and curriculum order.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'chemistry' as FocusArea,
                    icon: '⚗️',
                    title: 'Chemistry & Physical Sciences',
                    desc: 'STEM terminology, lab reports, covalent bonding analogies for syntax.',
                    highlight: 'AI Chemistry Analogies'
                  },
                  {
                    id: 'daily-speech' as FocusArea,
                    icon: '🗣️',
                    title: 'Daily Speech & Colloquial Slang',
                    desc: 'Everyday idioms, spoken rhythm, casual street interactions.',
                    highlight: 'Natural Cadence'
                  },
                  {
                    id: 'business' as FocusArea,
                    icon: '💼',
                    title: 'Workplace & Retention Calls',
                    desc: 'Customer retention, formal email register, corporate presentations.',
                    highlight: 'Professional Register'
                  },
                  {
                    id: 'general' as FocusArea,
                    icon: '📖',
                    title: 'Core Thinking Grammar',
                    desc: 'Overcoming the missing copula and direct translation habits.',
                    highlight: 'Foundations'
                  }
                ].map(option => {
                  const isSelected = focusArea === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFocusArea(option.id)}
                      className={`flex items-start gap-3.5 w-full text-left p-4 rounded-2xl border transition ${
                        isSelected
                          ? 'bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-800/50 border-stone-700/70 hover:bg-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <span className="text-2xl shrink-0 p-1">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white">{option.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                            {option.highlight}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{option.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-stone-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-stone-400 hover:text-stone-300 px-3 py-2"
            >
              Continue with Defaults
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-900/40 transition active:scale-[0.98]"
          >
            <span>{step === 3 ? 'Launch Personalized Bridge 🚀' : 'Continue'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
