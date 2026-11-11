import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Plane,
  Clapperboard,
  GraduationCap,
  Bot,
  Smile,
  Brain,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { UserProfile, LearningGoal } from '../types';
import { AgeTrackSlider } from './AgeTrackSlider';

interface OnboardingProps {
  initialProfile?: UserProfile | null;
  onComplete: (
    profile: UserProfile,
    extraData?: { companion: 'strict' | 'chill' | 'analyst'; diagnosticLevel: 'beginner' | 'intermediate' | 'advanced' }
  ) => void;
  onCancel?: () => void;
}

export function Onboarding({ initialProfile, onComplete, onCancel }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [showArabicSubChoice, setShowArabicSubChoice] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Game onboarding choices state
  const [selectedMission, setSelectedMission] = useState<LearningGoal>(
    initialProfile?.goal || 'business'
  );
  const [diagnosticLevel, setDiagnosticLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    (initialProfile?.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner'
  );
  const [companion, setCompanion] = useState<'strict' | 'chill' | 'analyst'>('chill');
  const [diagnosticSelected, setDiagnosticSelected] = useState<string | null>(null);

  const [selectedTrack, setSelectedTrack] = useState<NonNullable<UserProfile['learnerTrack']>>('street_starter');
  const [selectedAgeBand, setSelectedAgeBand] = useState<NonNullable<UserProfile['ageBand']> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const goToNextStep = (nextDir = 1) => {
    setDirection(nextDir);
    setStep((prev) => {
      let next = prev + 1;

      // Step 0 -> 1 (Mission)
      // Step 1 -> 2 (Age Slider)
      // Step 2 -> 3 (Diagnostic) or 4 (Companion) if kg_primary
      if (prev === 2 && selectedTrack === 'kg_primary') {
        next = 4; // Skip diagnostic (step 3) for kg_primary
      }

      if (next >= 5) {
        setCompanion('chill');
        return 5; // Launch step is now 5
      }
      return next;
    });
  };

  const goToPrevStep = () => {
    if (step === 0 && showArabicSubChoice) {
      setShowArabicSubChoice(false);
      return;
    }
    setDirection(-1);
    setStep((prev) => {
      let next = prev - 1;
      if (prev === 4 && selectedTrack === 'kg_primary') {
        next = 2; // Go back from Companion to Age Slider
      }
      return Math.max(next, 0);
    });
  };

  const handleSelectDirectionCardA = () => {
    try {
      localStorage.setItem('tb.learningDirection', 'ar-to-x');
    } catch {}
    goToNextStep(1);
  };

  const handleSelectDirectionCardBSubChoice = (dialect: string) => {
    try {
      localStorage.setItem('tb.targetArabicDialect', dialect);
      localStorage.setItem('tb.learningDirection', 'ar-to-x');
    } catch {}
    showToast('🚧 المسار العكسي قادم قريباً · Reverse path coming soon');
    setShowArabicSubChoice(false);
  };

  const handleFinish = () => {
    const updatedProfile: UserProfile = {
      language: 'arabic', // Arabic UI
      dialect: 'egyptian',
      level: (diagnosticLevel as any),
      goal: 'general',
      sourceLanguage: 'arz',
      targetLanguage: 'en',
      learnerTrack: selectedTrack,
      ageBand: selectedAgeBand || undefined,
    };

    try {
      localStorage.setItem('tb.aiCompanion', companion);
    } catch {}

    onComplete(updatedProfile, { companion, diagnosticLevel, track: selectedTrack } as any);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-[#090D16] text-[#EEF2F5] p-4 select-none font-arabic"
    >
      {/* Dynamic Ambient Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/15 to-amber-500/10 blur-[100px] animate-pulse" />
      </div>

      {/* Toast Banner Notice */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-black text-xs shadow-2xl animate-bounce flex items-center gap-2 border border-amber-300">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Game Container */}
      <div className="w-full max-w-lg rounded-3xl border border-teal-500/30 bg-stone-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden flex flex-col justify-between min-h-[540px]">
        {/* Header Bar with Level Progress */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-black tracking-wider uppercase text-teal-400">
                جسر التفكير · Thinking Bridge
              </p>
              <p className="text-[11px] text-stone-400 font-medium">
                  {step === 0 && 'اختيار المسار · الخطوة ١ من ٥'}
                  {step === 1 && 'تحديد المهمة · الخطوة ٢ من ٥'}
                  {step === 2 && 'الفئة العمرية · الخطوة ٣ من ٥'}
                  {step === 3 && 'تحديد المستوى · الخطوة ٤ من ٥'}
                  {step === 4 && 'رفيق الرحلة · الخطوة ٥ من ٥'}
                  {step === 5 && 'انطلاق اللعبة · جاهز'}
                </p>
              </div>
            </div>

            {/* Game Dots Progress */}
            <div className="flex items-center gap-1.5" aria-label={`الخطوة ${step + 1} من 5`}>
              {[0, 1, 2, 3, 4].map((idx) => (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step
                      ? 'w-7 bg-teal-400 shadow-lg shadow-teal-500/50'
                      : idx < step
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-stone-700'
                  }`}
                />
              ))}
            </div>
        </div>

        {/* Animated Card Body */}
        <div className="relative flex-1 flex flex-col justify-center my-2">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 0: LEARNING DIRECTION SELECTION */}
            {step === 0 && (
              <motion.div
                key="step0-dir"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4 text-start"
              >
                {!showArabicSubChoice ? (
                  <>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                        من أين <span className="text-teal-400">تبدأ رحلتك؟</span> 🌐
                      </h1>
                      <p className="text-xs sm:text-sm text-stone-300 mt-1">
                        Where do you want to start? Choose your path:
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSelectDirectionCardA}
                        className="w-full p-4 rounded-2xl border border-teal-500/40 bg-teal-950/20 hover:border-teal-400 hover:bg-teal-900/30 text-start transition-all flex items-center justify-between shadow-lg"
                      >
                        <div className="space-y-1">
                          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                            <span>🇪🇬</span>
                            <span>أنا عربي وأريد تعلم لغة جديدة</span>
                          </h2>
                          <p className="text-xs text-teal-300 font-medium dir-ltr text-start">
                            I&apos;m Arabic, learning another language
                          </p>
                        </div>
                        <ArrowLeft size={20} className="text-teal-400 shrink-0 ms-2" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowArabicSubChoice(true)}
                        className="w-full p-4 rounded-2xl border border-stone-700 bg-stone-800/80 hover:border-amber-400/60 hover:bg-stone-800 text-start transition-all flex items-center justify-between shadow-md"
                      >
                        <div className="space-y-1">
                          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                            <span>🌍</span>
                            <span>أنا لست عربي وأريد تعلم العربية</span>
                          </h2>
                          <p className="text-xs text-amber-300 font-medium dir-ltr text-start">
                            I&apos;m not Arabic, learning Arabic
                          </p>
                        </div>
                        <ArrowLeft size={20} className="text-stone-400 shrink-0 ms-2" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                        اختر <span className="text-amber-400">اللهجة العربية</span> 🎯
                      </h1>
                      <p className="text-xs text-stone-300 mt-1">
                        Select your desired target Arabic dialect:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDirectionCardBSubChoice('egyptian')}
                        className="p-3.5 rounded-2xl border border-stone-700 bg-stone-800/90 hover:border-teal-400 hover:bg-teal-950/40 text-start transition-all"
                      >
                        <span className="text-lg">🇪🇬</span>
                        <h2 className="text-xs font-bold text-white mt-1">مصري</h2>
                        <span className="text-[10px] text-stone-400 block">Egyptian</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDirectionCardBSubChoice('gulf')}
                        className="p-3.5 rounded-2xl border border-stone-700 bg-stone-800/90 hover:border-teal-400 hover:bg-teal-950/40 text-start transition-all"
                      >
                        <span className="text-lg">🌴</span>
                        <h2 className="text-xs font-bold text-white mt-1">خليجي</h2>
                        <span className="text-[10px] text-stone-400 block">Gulf</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDirectionCardBSubChoice('levantine')}
                        className="p-3.5 rounded-2xl border border-stone-700 bg-stone-800/90 hover:border-teal-400 hover:bg-teal-950/40 text-start transition-all"
                      >
                        <span className="text-lg">🏛️</span>
                        <h2 className="text-xs font-bold text-white mt-1">شامي</h2>
                        <span className="text-[10px] text-stone-400 block">Levantine</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDirectionCardBSubChoice('msa')}
                        className="p-3.5 rounded-2xl border border-stone-700 bg-stone-800/90 hover:border-teal-400 hover:bg-teal-950/40 text-start transition-all"
                      >
                        <span className="text-lg">📖</span>
                        <h2 className="text-xs font-bold text-white mt-1">فصحى</h2>
                        <span className="text-[10px] text-stone-400 block">MSA Standard</span>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* SCREEN 1: MISSION SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1-mission"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4 text-start"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                    اختر <span className="text-teal-400">مهمتك الأولى</span> 🎯
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    حدد المجال الذي تريد أن تفكر وتتحدث فيه بطلاقة أولاً:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMission('business');
                      goToNextStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-start transition-all flex items-start gap-3 ${
                      selectedMission === 'business'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-teal-500/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-teal-500/30 text-teal-300 shrink-0 mt-0.5">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">💼 عالم الأعمال</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">إيميلات، اجتماعات، وتفاوض شركات</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMission('travel');
                      goToNextStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-start transition-all flex items-start gap-3 ${
                      selectedMission === 'travel'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-teal-500/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 shrink-0 mt-0.5">
                      <Plane size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">✈️ السفر والمغامرة</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">المطارات، المطاعم، وحياة الخارج</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMission('general');
                      goToNextStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-start transition-all flex items-start gap-3 ${
                      selectedMission === 'general'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-teal-500/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-purple-500/30 text-purple-300 shrink-0 mt-0.5">
                      <Clapperboard size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">🎬 الأفلام والميديا</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">تعبيرات دارجة وحوارات سينمائية</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMission('academic');
                      goToNextStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-start transition-all flex items-start gap-3 ${
                      selectedMission === 'academic'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-teal-500/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-blue-500/30 text-blue-300 shrink-0 mt-0.5">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">🎓 الدراسة والجامعة</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">أبحاث علمية ومناقشات أكاديمية</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: AGE TRACK SLIDER */}
            {step === 2 && (
              <motion.div
                key="step2-age"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4 text-start"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    تخصيص <span className="text-amber-400">الفئة العمرية</span> 🎯
                  </h1>
                  <p className="text-xs text-stone-300 mt-1 mb-6">
                    نخصص المفردات، القواعد وحجم الخط حسب الفئة العمرية ليناسبك تماماً:
                  </p>
                </div>

                <AgeTrackSlider
                  value={selectedTrack}
                  ageBand={selectedAgeBand}
                  onChange={(track, band) => {
                    setSelectedTrack(track);
                    setSelectedAgeBand(band);
                  }}
                  isArabic={true}
                />

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={() => goToNextStep(1)}
                    disabled={!selectedAgeBand && selectedTrack !== 'street_starter'}
                    className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: DIAGNOSTIC THINKING TEST */}
            {step === 3 && (
              <motion.div
                key="step2-diag"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4 text-start"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    اختبار التفكير: <span className="text-amber-400">لا تترجم حرفياً!</span> 🧠
                  </h1>
                  <p className="text-xs text-stone-300 mt-1">
                    اختر المعنى الذهني الحقيقي للعبارة التالية:
                  </p>
                </div>

                {/* Question Scenario Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-800 via-stone-850 to-stone-900 border border-teal-500/40 text-center space-y-1 shadow-inner">
                  <span className="text-[10px] font-bold text-teal-400 tracking-wider uppercase">
                    English Thought Scenario
                  </span>
                  <p className="text-xl font-black text-amber-300 dir-ltr font-mono">
                    &quot;It's raining cats and dogs.&quot;
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosticSelected('literal');
                      setDiagnosticLevel('beginner');
                      goToNextStep(1);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-stone-700 bg-stone-800/80 hover:border-amber-500/50 hover:bg-stone-800 text-start text-xs font-semibold text-stone-200 transition-all flex items-center justify-between"
                  >
                    <span>❌ تمطر قططاً وكلاباً (ترجمة حرفية)</span>
                    <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md">
                      مبتدئ A1
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosticSelected('meaning');
                      setDiagnosticLevel('intermediate');
                      goToNextStep(1);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-teal-500/50 bg-teal-950/30 hover:border-teal-400 hover:bg-teal-900/30 text-start text-xs font-bold text-teal-200 transition-all flex items-center justify-between shadow-md"
                  >
                    <span>💡 تمطر بغزارة (المعنى الاصطلاحي)</span>
                    <span className="text-[10px] text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded-md">
                      متوسط A2/B1
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosticSelected('unknown');
                      setDiagnosticLevel('beginner');
                      goToNextStep(1);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-stone-700 bg-stone-800/80 hover:border-stone-500 text-start text-xs font-medium text-stone-300 transition-all flex items-center justify-between"
                  >
                    <span>❓ لا أعرف المعنى، أريد البدء من الأساسيات</span>
                    <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md">
                      تأسيس A0
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 4: AI COMPANION SELECTION */}
            {step === 4 && (
              <motion.div
                key="step4-comp"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4 text-start"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    من سيكون <span className="text-emerald-400">رفيقك في الرحلة؟</span> 🤖
                  </h1>
                  <p className="text-xs text-stone-300 mt-1">
                    اختر شخصية الذكاء الاصطناعي التي تناسب أسلوبك في التعلم:
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCompanion('strict');
                      goToNextStep(1);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-start transition-all flex items-center gap-3.5 ${
                      companion === 'strict'
                        ? 'bg-rose-500/20 border-rose-400 text-white shadow-lg'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-rose-400/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-rose-500/30 text-rose-300 shrink-0">
                      <Bot size={22} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">🤖 المعلم الصارم (Strict Tutor)</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        يدقق في القواعد فوراً ويصلح كل خطأ بدقة متناهية
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCompanion('chill');
                      goToNextStep(1);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-start transition-all flex items-center gap-3.5 ${
                      companion === 'chill'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-emerald-400/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-500/30 text-emerald-300 shrink-0">
                      <Smile size={22} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">😎 الصديق المتفهم (Chill Friend)</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        يركز على طلاقة الحديث ويكسر حاجز الخوف من الخطأ
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCompanion('analyst');
                      goToNextStep(1);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-start transition-all flex items-center gap-3.5 ${
                      companion === 'analyst'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg'
                        : 'bg-stone-800/80 border-stone-700 text-stone-200 hover:border-teal-400/50 hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-teal-500/30 text-teal-300 shrink-0">
                      <Brain size={22} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">🧠 المحلل الذكي (Smart Analyst)</h2>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        يشرح لك المنطق الذهني وسبب ترتيب كل جملة
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 5: GAME READY & LAUNCH */}
            {step === 5 && (
              <motion.div
                key="step5-launch"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-5 text-center py-2"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-stone-950 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-teal-500/30 animate-bounce">
                  ⚡
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    أنت جاهز للمهمة! 🚀
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    تم تخصيص جسر التفكير خصيصاً لمهمتك ومستواك الذهني.
                  </p>
                </div>

                {/* Selected Options Summary Pill */}
                <div className="p-4 rounded-2xl bg-stone-800/90 border border-stone-700 text-start space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-300">
                    <span>اتجاه التعلم:</span>
                    <span className="font-bold text-teal-300">
                      {localStorage.getItem('tb.learningDirection') === 'x-to-ar'
                        ? '🌍 لست عربي ← تعلم العربية'
                        : '🇪🇬 عربي ← تعلم لغة جديدة'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300">
                    <span>المهمة المختارة:</span>
                    <span className="font-bold text-teal-300">
                      {selectedMission === 'business'
                        ? '💼 عالم الأعمال'
                        : selectedMission === 'travel'
                        ? '✈️ السفر والمغامرة'
                        : selectedMission === 'academic'
                        ? '🎓 الدراسة والجامعة'
                        : '🎬 الأفلام والميديا'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300">
                    <span>المستوى التشخيصي:</span>
                    <span className="font-bold text-amber-300">
                      {diagnosticLevel === 'intermediate' ? 'متوسط A2/B1' : 'تأسيس A1/A0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300">
                    <span>رفيق الذكاء الاصطناعي:</span>
                    <span className="font-bold text-emerald-300">
                      {companion === 'strict'
                        ? '🤖 المعلم الصارم'
                        : companion === 'analyst'
                        ? '🧠 المحلل الذكي'
                        : '😎 الصديق المتفهم'}
                    </span>
                  </div>
                </div>

                {/* Big Launch Button */}
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 text-stone-950 text-base font-black shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>ابدأ اللعبة الآن</span>
                  <Zap size={20} className="fill-current" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {(step > 0 || showArabicSubChoice) && (
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevStep}
              className="text-xs font-bold text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight size={16} />
              <span>رجوع</span>
            </button>

            <span className="text-[11px] text-stone-500 font-mono">
              Thinking Bridge v4.0
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
