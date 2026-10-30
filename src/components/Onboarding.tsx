import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { UserProfile } from '../hooks/useUserProfile';
import { isArabicUI, uiText } from '../utils/i18n';
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
    initialProfile?.language ?? 'arabic'
  );
  const [dialect, setDialect] = useState<UserProfile['dialect']>(
    initialProfile?.dialect ?? 'egyptian'
  );
  const [level, setLevel] = useState<UserProfile['level']>(
    initialProfile?.level ?? 'beginner'
  );
  const [error, setError] = useState<string | null>(null);

  const rtl = step > 0 && isArabicUI(language);
  const t = (en: string, ar: string) => (step === 0 ? `${en} · ${ar}` : uiText(language, en, ar));
  const choiceAlignClass = rtl ? `${CHOICE_CLASS} text-right` : CHOICE_CLASS;

  const completeOnboarding = (selectedGoal: UserProfile['goal']) => {
    try {
      onComplete({ language, dialect, level, goal: selectedGoal });
    } catch {
      setError(
        uiText(
          language,
          'We couldn’t save your profile. Check browser storage and try again.',
          'تعذر حفظ ملفك الشخصي. يرجى التحقق من مساحة تخزين المتصفح والمحاولة مرة أخرى.'
        )
      );
    }
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
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
              {step === 0
                ? `Step 1 of 4 · الخطوة 1 من 4`
                : uiText(language, `Step ${step + 1} of 4`, `الخطوة ${step + 1} من 4`)}
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
                {uiText(language, 'Cancel', 'إلغاء')}
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
              {step === 0 && t('What do you want to learn?', 'ماذا تريد أن تتعلم؟')}
              {step === 1 &&
                uiText(
                  language,
                  'Which Arabic dialect do you want to learn?',
                  'أي لهجة عربية تفضل استخدامها في الأمثلة والشرح؟'
                )}
              {step === 2 &&
                uiText(language, 'What is your current level?', 'ما هو مستواك الحالي؟')}
              {step === 3 &&
                uiText(language, 'Why are you learning?', 'ما هو هدفك الأساسي من التعلم؟')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">
              {step === 0 &&
                t(
                  'Choose the language you want to focus on.',
                  'اختر اللغة التي ترغب في التركيز عليها.'
                )}
              {step === 1 &&
                uiText(
                  language,
                  'Choose Egyptian Arabic (Ammiya) or Modern Standard Arabic (MSA/Fusha).',
                  'اختر العامية المصرية أو العربية الفصحى.'
                )}
              {step === 2 &&
                uiText(
                  language,
                  'We’ll use this to help shape your learning path.',
                  'سنستخدم هذا لتخصيص مسارك التعليمي.'
                )}
              {step === 3 &&
                uiText(
                  language,
                  'Pick the goal that matters most to you.',
                  'اختر الهدف الأكثر أهمية بالنسبة لك.'
                )}
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
                    English (تعلم الإنجليزية — واجهة عربية)
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
                    Arabic (Learn Arabic — English UI)
                  </BouncyButton>
                </>
              )}
              {step === 1 && (
                <>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      setDialect('egyptian');
                      setStep(2);
                      setError(null);
                    }}
                  >
                    {uiText(language, 'Egyptian (Ammiya) 🇪🇬', 'العامية المصرية 🇪🇬')}
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      setDialect('msa');
                      setStep(2);
                      setError(null);
                    }}
                  >
                    {uiText(language, 'Standard (Fusha) 📖', 'العربية الفصحى 📖')}
                  </BouncyButton>
                </>
              )}
              {step === 2 && (
                <>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      setLevel('beginner');
                      setStep(3);
                      setError(null);
                    }}
                  >
                    {uiText(language, 'Beginner', 'مبتدئ (Beginner)')}
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      setLevel('intermediate');
                      setStep(3);
                      setError(null);
                    }}
                  >
                    {uiText(language, 'Intermediate', 'متوسط (Intermediate)')}
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      setLevel('advanced');
                      setStep(3);
                      setError(null);
                    }}
                  >
                    {uiText(language, 'Advanced', 'متقدم (Advanced)')}
                  </BouncyButton>
                </>
              )}
              {step === 3 && (
                <>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      completeOnboarding('travel');
                    }}
                  >
                    {uiText(language, 'Travel', 'السفر والتنقل (Travel)')}
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      completeOnboarding('work');
                    }}
                  >
                    {uiText(language, 'Work', 'العمل وخدمة العملاء (Work)')}
                  </BouncyButton>
                  <BouncyButton
                    type="button"
                    className={choiceAlignClass}
                    onClick={() => {
                      completeOnboarding('general');
                    }}
                  >
                    {uiText(language, 'General', 'تعلم عام ودراسة (General)')}
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
            {uiText(language, '← Back', '→ رجوع')}
          </BouncyButton>
        )}
      </div>
    </div>
  );
}
