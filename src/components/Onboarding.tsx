import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { UserProfile } from '../hooks/useUserProfile';
import { BouncyButton } from './BouncyButton';

interface OnboardingProps {
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const CHOICE_CLASS =
  'w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-base font-semibold text-white transition-colors hover:border-olive-300 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-300';

export function Onboarding({ initialProfile, onComplete, onCancel }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<UserProfile['language']>(
    initialProfile?.language ?? 'english'
  );
  const [dialect, setDialect] = useState<UserProfile['dialect']>(
    initialProfile?.dialect ?? 'egyptian'
  );
  const [level, setLevel] = useState<UserProfile['level']>(
    initialProfile?.level ?? 'beginner'
  );
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = (selectedGoal: UserProfile['goal']) => {
    try {
      onComplete({ language, dialect, level, goal: selectedGoal });
    } catch {
      setError('We couldn’t save your profile. Check browser storage and try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(12, 16, 13, 0.86), rgba(12, 16, 13, 0.9)), url('/arabic-pattern.png')"
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-stone-950/85 p-6 text-white shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-300">
              Thinking Bridge
            </p>
            <p className="mt-1 text-sm text-stone-300">
              Step {step + 1} of 4
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-label={`Step ${step + 1} of 4`}>
              {[0, 1, 2, 3].map(index => (
                <span
                  key={index}
                  className={`h-1.5 w-7 rounded-full ${
                    index <= step ? 'bg-olive-300' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            {initialProfile && onCancel && (
              <BouncyButton
                type="button"
                onClick={onCancel}
                className="rounded-lg px-2 py-1 text-xs font-medium text-stone-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-300"
              >
                Cancel
              </BouncyButton>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {step === 0 && 'What do you want to learn?'}
              {step === 1 && 'Which Arabic dialect do you want to learn?'}
              {step === 2 && 'What is your current level?'}
              {step === 3 && 'Why are you learning?'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">
              {step === 0 && 'Choose the language you want to focus on.'}
              {step === 1 && 'Choose Egyptian Arabic (Ammiya) or Modern Standard Arabic (MSA/Fusha).'}
              {step === 2 && 'We’ll use this to help shape your learning path.'}
              {step === 3 && 'Pick the goal that matters most to you.'}
            </p>

            <div className="mt-6 grid gap-3">
              {step === 0 && (
                <>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setLanguage('english');
                      setStep(1);
                      setError(null);
                    }}
                  >
                    English
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setLanguage('arabic');
                      setStep(1);
                      setError(null);
                    }}
                  >
                    Arabic
                  </BouncyButton>
                </>
              )}
              {step === 1 && (
                <>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setDialect('egyptian');
                      setStep(2);
                      setError(null);
                    }}
                  >
                    Egyptian (Ammiya) 🇪🇬
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setDialect('msa');
                      setStep(2);
                      setError(null);
                    }}
                  >
                    Standard (Fusha) 📖
                  </BouncyButton>
                </>
              )}
              {step === 2 && (
                <>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setLevel('beginner');
                      setStep(3);
                      setError(null);
                    }}
                  >
                    Beginner
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setLevel('intermediate');
                      setStep(3);
                      setError(null);
                    }}
                  >
                    Intermediate
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      setLevel('advanced');
                      setStep(3);
                      setError(null);
                    }}
                  >
                    Advanced
                  </BouncyButton>
                </>
              )}
              {step === 3 && (
                <>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      completeOnboarding('travel');
                    }}
                  >
                    Travel
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      completeOnboarding('work');
                    }}
                  >
                    Work
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={CHOICE_CLASS}
                    onClick={() => {
                      completeOnboarding('general');
                    }}
                  >
                    General
                  </BouncyButton>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-rose-300">
            {error}
          </p>
        )}

        {step > 0 && (
          <BouncyButton
            type="button"
            onClick={() => {
              setStep(currentStep => currentStep - 1);
              setError(null);
            }}
            className="mt-6 rounded-lg px-2 py-2 text-sm font-medium text-stone-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-300"
          >
            ← Back
          </BouncyButton>
        )}
      </div>
    </div>
  );
}
