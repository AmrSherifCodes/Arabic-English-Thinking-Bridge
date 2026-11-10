import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, ArrowLeft, Globe, Compass, Briefcase, Plane, GraduationCap, MessageCircle, Rocket } from 'lucide-react';
import type { LearningGoal, UserProfile, SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META } from '../data/languages';
import { LanguageFlag } from './LanguageFlag';

export interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile?: UserProfile | null;
  initialSourceLang?: SourceLanguage;
  initialTargetLang?: TargetLanguage;
  onComplete: (profile: UserProfile, sourceLang: SourceLanguage, targetLang: TargetLanguage) => void;
  onSkip?: () => void;
}

const AMR_POSES = {
  welcome: '/amr-guide/pose1.png',
  thinking: '/amr-guide/pose3.png',
  ready: '/amr-guide/pose4.png'
};

const DIALECT_OPTIONS = [
  {
    id: 'egyptian' as const,
    icon: '🇪🇬',
    title: 'العامية المصرية (Egyptian Ammiya)',
    titleEn: 'Egyptian Colloquial Arabic',
    desc: 'الأمثلة والشرح بالعامية المصرية الحقيقية زي كلامنا اليومي في الشارع والشغل',
    descEn: 'Authentic everyday Egyptian phrasing used in daily life and work'
  },
  {
    id: 'msa' as const,
    icon: '🌍',
    title: 'العربية الفصحى (Modern Standard Arabic)',
    titleEn: 'Modern Standard Arabic',
    desc: 'الأمثلة والشرح باللغة العربية الفصحى المناسبة لجميع الدول العربية الشقيقة',
    descEn: 'Clear standard Arabic explanations suitable for all Arab world learners'
  }
];

const TARGET_OPTIONS = [
  {
    id: 'en' as TargetLanguage,
    flag: '🇬🇧',
    title: 'الإنجليزية · English',
    desc: 'فك عقدة الترجمة الحرفية، وبناء التفكير التلقائي بجمل كاملة وسريعة',
    descEn: 'Stop internal translation and build natural English thought reflexes',
    pedagogyTag: 'تفكير مباشر · طلاقة'
  },
  {
    id: 'de' as TargetLanguage,
    flag: '🇩🇪',
    title: 'الألمانية · Deutsch',
    desc: 'إتقان قاعدة الفعل الثاني (V2)، وأدوات der/die/das وحالة النصب (Akkusativ)',
    descEn: 'Master strict V2 verb position, genders (der/die/das) and accusative shifts',
    pedagogyTag: 'قاعدة V2 · Der/Die/Das'
  },
  {
    id: 'ja' as TargetLanguage,
    flag: '🇯🇵',
    title: 'اليابانية · 日本語',
    desc: 'نظام الفاعل-المفعول-الفعل (SOV)، جزيئات は و を، وقراءة الكانجي بالفوريجانا',
    descEn: 'Train SOV brain order, core particles (は, を, に) & Kanji with Furigana',
    pedagogyTag: 'نظام SOV · كانجي وفوريجانا'
  },
  {
    id: 'es' as TargetLanguage,
    flag: '🇪🇸',
    title: 'الإسبانية · Español',
    desc: 'التكيف مع تصريفات الأفعال وتوافق الجنس والرقم',
    descEn: 'Adapt to verb conjugations and gender/number agreement',
    pedagogyTag: 'تصريف · توافق'
  },
  {
    id: 'fr' as TargetLanguage,
    flag: '🇫🇷',
    title: 'الفرنسية · Français',
    desc: 'إتقان نطق اللغة الفرنسية وبناء الجمل المركبة',
    descEn: 'Master French pronunciation and complex sentence structure',
    pedagogyTag: 'نطق · تراكيب'
  },
  {
    id: 'zh' as TargetLanguage,
    flag: '🇨🇳',
    title: 'الصينية · 中文',
    desc: 'فهم النغمات وبناء الجمل بدون تصريف أفعال',
    descEn: 'Understand tones and build sentences without verb conjugation',
    pedagogyTag: 'نغمات · رموز'
  },
  {
    id: 'hi' as TargetLanguage,
    flag: '🇮🇳',
    title: 'الهندية · हिन्दी',
    desc: 'بناء الجمل (SOV) واستخدام الحروف المساعدة بعد الاسم',
    descEn: 'SOV structure and using postpositions',
    pedagogyTag: 'SOV · بناء الجمل'
  },
  {
    id: 'ru' as TargetLanguage,
    flag: '🇷🇺',
    title: 'الروسية · Русский',
    desc: 'التكيف مع الحالات الإعرابية الستة ونظام الأفعال',
    descEn: 'Adapt to the six cases and the aspect system of verbs',
    pedagogyTag: 'إعراب · سيريلية'
  },
  {
    id: 'pt' as TargetLanguage,
    flag: '🇧🇷',
    title: 'البرتغالية · Português',
    desc: 'إتقان الأزمنة المعقدة والأصوات الأنفية',
    descEn: 'Master complex tenses and nasal sounds',
    pedagogyTag: 'أزمنة · أصوات'
  },
  {
    id: 'it' as TargetLanguage,
    flag: '🇮🇹',
    title: 'الإيطالية · Italiano',
    desc: 'التكيف مع التوافق وإسقاط الفاعل كما في العربية',
    descEn: 'Adapt to agreement and pro-drop similar to Arabic',
    pedagogyTag: 'توافق · إيقاع'
  }
];

const LEVEL_OPTIONS = [
  {
    id: 'beginner' as const,
    icon: '🟢',
    title: 'مبتدئ · Beginner',
    desc: 'أبدأ من الأساسيات وبناء الجمل والكلمات الأكثر استخداماً بدون تعقيد',
    descEn: 'Start from the essentials, core sentences, and high-frequency patterns'
  },
  {
    id: 'intermediate' as const,
    icon: '🟡',
    title: 'متوسط · Intermediate',
    desc: 'عندي حصيلة كلمات وقواعد، بس محتاج طلاقة وبديهة وتفكير مباشر بدون تردد',
    descEn: 'Good vocabulary base, but seeking instant reflexes without hesitation'
  },
  {
    id: 'advanced' as const,
    icon: '🔵',
    title: 'متقدم · Advanced',
    desc: 'محتاج صياغات احترافية، ومصطلحات متقدمة في مجال عملي ونبرة كالمتحدث الأصلي',
    descEn: 'Executive phrasing, nuance, idioms, and specialized professional discussions'
  }
];

const GOAL_OPTIONS: Array<{
  id: LearningGoal;
  icon: string;
  title: string;
  desc: string;
  descEn: string;
}> = [
  {
    id: 'daily',
    icon: '💬',
    title: 'محادثات يومية · Daily Talk',
    desc: 'كلام الشارع، الأصدقاء، والتعبير عن أفكاري اليومية بكل راحة',
    descEn: 'Casual conversation, social life, and spontaneous everyday thoughts'
  },
  {
    id: 'work',
    icon: '💼',
    title: 'للشغل وخدمة العملاء · Work',
    desc: 'مقابلات العمل، كول سنتر، إيميلات، ومحادثات الشركات الدولية',
    descEn: 'Job interviews, corporate emails, meetings, and international business'
  },
  {
    id: 'travel',
    icon: '✈️',
    title: 'للسفر والحياة بالخارج · Travel',
    desc: 'المطارات، الفنادق، المواصلات، والتنقل في أي بلد بثقة تامة',
    descEn: 'Airports, hotels, dining, asking for directions, and living abroad'
  },
  {
    id: 'academic',
    icon: '🎓',
    title: 'للدراسة والجامعة · Study',
    desc: 'الأبحاث العلمية، الامتحانات، والمصطلحات الأكاديمية التخصصية',
    descEn: 'Academic exams, research papers, and university coursework'
  },
  {
    id: 'general',
    icon: '🚀',
    title: 'طلاقة عامة وثقة بالنفس · Fluency',
    desc: 'أفكر مباشرة باللغة الجديدة كالمتحدث الأصلي بدون خوف أو تلعثم',
    descEn: 'Overcome hesitation, master immersion thinking, and achieve real fluency'
  }
];

export function OnboardingModal({
  isOpen,
  initialProfile,
  initialSourceLang,
  initialTargetLang,
  onComplete,
  onSkip
}: OnboardingModalProps) {
  // 4 Steps:
  // Step 0: Source Language (ar vs en) + Dialect if Arabic
  // Step 1: Target Language (en, de, ja)
  // Step 2: Level & Main Goal & Name
  // Step 3: Confirmation & Personalization Summary
  const [step, setStep] = useState<number>(0);

  const [sourceLang, setSourceLang] = useState<SourceLanguage>(
    initialSourceLang || (initialProfile?.sourceLanguage || (initialProfile?.language === 'english' ? 'en' : 'ar'))
  );
  const [targetLang, setTargetLang] = useState<TargetLanguage>(
    initialTargetLang || (initialProfile?.targetLanguage || 'en')
  );
  const [dialect, setDialect] = useState<'egyptian' | 'msa'>(initialProfile?.dialect || 'egyptian');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>((initialProfile?.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner');
  const [goal, setGoal] = useState<LearningGoal>(initialProfile?.goal || 'general');
  const [name, setName] = useState<string>(initialProfile?.name || '');

  const isSourceArabic = sourceLang === 'ar';
  const isRtl = isSourceArabic;

  // Auto-switch target language if user selects source = en and target was en
  const handleSelectSource = (src: SourceLanguage) => {
    setSourceLang(src);
    if (src === 'en' && targetLang === 'en') {
      setTargetLang('de');
    }
  };

  const coachDialogue = useMemo(() => {
    if (step === 0) {
      return {
        pose: AMR_POSES.welcome,
        coachTag: isSourceArabic ? 'عمرو شريف · مدربك اللغوي 🇪🇬' : 'Amr Sherif · Cognitive Coach',
        title: isSourceArabic ? 'أهلاً بيك يا بطل! أنا عمرو 👋' : "Welcome! I'm Amr 👋",
        dialogue: isSourceArabic
          ? 'وهكون معاك خطوة بخطوة عشان نبني التفكير باللغة مش الترجمة الحرفية. قولي.. إنت بتفكر حالياً بالعربي ولا بالإنجليزي؟'
          : "I'll guide you step by step to rewire your brain to think directly in your target language. First, what language do you currently think in?"
      };
    }
    if (step === 1) {
      return {
        pose: AMR_POSES.thinking,
        coachTag: isSourceArabic ? 'عمرو شريف · لغة التفكير 🎯' : 'Amr Sherif · Target Language 🎯',
        title: isSourceArabic ? 'اختيار ممتاز! ودلوقتي أهم قرار 👏' : 'Great choice! Now the core target 👏',
        dialogue: isSourceArabic
          ? 'عايز تدرب مخك يفكر مباشرة بانهي لغة؟ اختر لغة الهدف اللي نفسك تتقن التفكير والتحدث بيها!'
          : 'Which language do you want to train your brain to think in? Select your target language!'
      };
    }
    if (step === 2) {
      return {
        pose: AMR_POSES.thinking,
        coachTag: isSourceArabic ? 'عمرو شريف · تفصيل الخطة 📊' : 'Amr Sherif · Custom Plan 📊',
        title: isSourceArabic ? 'قربنا ننطلق! قولي مستواك وهدفك 🚀' : 'Almost ready! Tell me your level & goal 🚀',
        dialogue: isSourceArabic
          ? 'عشان أظبطلك التمارين والمفردات بالمللي على مقاسك وما نضيعش وقتك، إيه مستواك الحالي وإيه هدفك الأساسي؟'
          : 'To tailor every exercise and situation precisely to your needs, what is your current level and main goal?'
      };
    }
    return {
      pose: AMR_POSES.ready,
      coachTag: isSourceArabic ? 'عمرو شريف · خطتك الشخصية جاهزة 🌟' : 'Amr Sherif · Ready for Launch 🌟',
      title: isSourceArabic ? `عاش عليك يا ${name.trim() || 'بطل'}! 👏` : `Outstanding, ${name.trim() || 'Champion'}! 👏`,
      dialogue: isSourceArabic
        ? `جهزتلك جسر تحول ذهني مخصص من ${SOURCE_LANGUAGES[sourceLang]?.nameAr} إلى ${TARGET_LANGUAGE_META[targetLang]?.nameAr}. التمارين والمفردات وأسلوب المدرب متبرمجين بالكامل لخدمة هدفك!`
        : `Your personalized cognitive bridge from ${SOURCE_LANGUAGES[sourceLang]?.nameEn} to ${TARGET_LANGUAGE_META[targetLang]?.nameEn} is fully prepared!`
    };
  }, [step, isSourceArabic, sourceLang, targetLang, name]);

  if (!isOpen) return null;

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim() || undefined,
      dialect: isSourceArabic ? dialect : 'egyptian',
      level,
      goal,
      focusArea:
        goal === 'work'
          ? 'workplace'
          : goal === 'academic'
          ? 'academic'
          : goal === 'travel'
          ? 'travel'
          : goal === 'daily'
          ? 'daily-speech'
          : 'general',
      learningStyle: 'visual',
      language: isSourceArabic ? 'arabic' : 'english',
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    };

    onComplete(profile, sourceLang, targetLang);
  };

  const handleNext = () => {
    if (step < 3) {
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
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl border border-stone-800 bg-stone-900 p-4 sm:p-6 text-stone-100 shadow-2xl transition-all my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles size={16} />
            </span>
            <div>
              <span className="text-xs font-black tracking-wide text-teal-400 block">
                {isSourceArabic ? 'جسر التفكير · الإعداد الذكي' : 'Thinking Bridge · Smart Setup'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                {isSourceArabic ? 'تخصيص كامل خلال 30 ثانية' : 'Personalized in under 30 seconds'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-stone-400 hover:text-white px-2.5 py-1 rounded-xl hover:bg-stone-800 transition"
          >
            {isSourceArabic ? 'تخطي الآن' : 'Skip'}
          </button>
        </div>

        {/* Progress Bar (Step Indicator) */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map(idx => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === step
                    ? 'w-7 bg-teal-400'
                    : idx < step
                    ? 'w-3.5 bg-teal-600'
                    : 'w-2 bg-stone-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-stone-400">
            {isSourceArabic ? `الخطوة ${step + 1} من 4` : `Step ${step + 1} of 4`}
          </span>
        </div>

        {/* Amr's Animated Interactive Coach Card */}
        <div className="flex items-center gap-3 bg-stone-950/80 border border-teal-500/30 rounded-2xl p-3 mb-4 relative overflow-hidden">
          <div className="relative shrink-0 flex flex-col items-center">
            <motion.img
              key={coachDialogue.pose}
              src={coachDialogue.pose}
              alt="Amr Sherif"
              className="w-16 sm:w-18 h-auto object-contain drop-shadow-[0_8px_16px_rgba(20,184,166,0.3)] select-none"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />
            <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 mt-1">
              عمرو شريف
            </span>
          </div>

          <div className="flex-1 bg-stone-900/90 border border-stone-800 rounded-xl p-2.5 sm:p-3 relative shadow-inner">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-400 mb-0.5">
              <Sparkles size={11} />
              <span>{coachDialogue.coachTag}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">
              {coachDialogue.title}
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed font-medium">
              {coachDialogue.dialogue}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 0: SOURCE LANGUAGE & DIALECT */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-400">
                  {isSourceArabic ? '1. لغة التفكير الحالية (لغة الأم / الشرح):' : '1. Language you currently think in:'}
                </span>
              </div>

              {/* Source Language Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectSource('ar')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                    sourceLang === 'ar'
                      ? 'bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <LanguageFlag code="ar" size={22} className="mb-1" />
                  <span className="font-black text-sm text-stone-100">العربية (Arabic)</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">لغة الأم والتفكير التلقائي</span>
                  {sourceLang === 'ar' && (
                    <span className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-stone-950">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSource('en')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                    sourceLang === 'en'
                      ? 'bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <LanguageFlag code="en" size={22} className="mb-1" />
                  <span className="font-black text-sm text-stone-100">English (الإنجليزية)</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">I think mainly in English</span>
                  {sourceLang === 'en' && (
                    <span className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-stone-950">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>

              {/* If Arabic is selected: Dialect Preference Sub-Selector */}
              {sourceLang === 'ar' && (
                <div className="pt-1.5 space-y-2">
                  <span className="text-[11px] font-bold text-stone-300 block">
                    لهجة الشرح والأمثلة المفضلة:
                  </span>
                  <div className="grid gap-2">
                    {DIALECT_OPTIONS.map(opt => {
                      const isSelected = dialect === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDialect(opt.id)}
                          className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-right transition cursor-pointer ${
                            isSelected
                              ? 'bg-teal-950/40 border-teal-500/80 ring-1 ring-teal-500/30'
                              : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs sm:text-sm text-stone-100">
                                {opt.title}
                              </span>
                              {isSelected && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-stone-950">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1: TARGET LANGUAGE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-400">
                  {isSourceArabic ? '2. لغة الهدف (اللغة التي تريد تعلم التفكير بها):' : '2. Language you want to learn to think in:'}
                </span>
              </div>

              <div className="grid gap-2.5">
                {TARGET_OPTIONS.map(opt => {
                  const isSelected = targetLang === opt.id;
                  const isDisabled = sourceLang === opt.id; // cannot choose en -> en as standard onboarding target
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setTargetLang(opt.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-start transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-stone-950/30 border-stone-800'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <LanguageFlag code={opt.id} size={22} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-stone-100">
                            {opt.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            {opt.pedagogyTag}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                          {isSourceArabic ? opt.desc : opt.descEn}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-stone-950 font-bold shrink-0 mt-1">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Pair Visual Bridge */}
              <div className="mt-2 p-2 rounded-xl bg-stone-950/60 border border-stone-800 text-center flex items-center justify-center gap-2 text-xs font-bold text-stone-300">
                <LanguageFlag code={sourceLang} size={16} />
                <span>{isSourceArabic ? SOURCE_LANGUAGES[sourceLang]?.nameNative : SOURCE_LANGUAGES[sourceLang]?.nameEn}</span>
                <span className="text-teal-400">➔</span>
                <LanguageFlag code={targetLang} size={16} />
                <span>{TARGET_LANGUAGE_META[targetLang]?.nameNative} ({isSourceArabic ? TARGET_LANGUAGE_META[targetLang]?.nameAr : TARGET_LANGUAGE_META[targetLang]?.nameEn})</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LEVEL & GOAL & NAME */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {/* Level Selector */}
              <div>
                <label className="block text-xs font-bold text-teal-400 mb-1.5 text-start">
                  {isSourceArabic ? '3. مستواك الحالي باللغة المستهدفة:' : '3. Current level in target language:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LEVEL_OPTIONS.map(opt => {
                    const isSelected = level === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLevel(opt.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                            : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="font-bold text-xs text-stone-100 mt-1">
                          {isSourceArabic ? opt.title.split('·')[0].trim() : opt.title.split('·')[1].trim()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goal Selector */}
              <div>
                <label className="block text-xs font-bold text-teal-400 mb-1.5 text-start">
                  {isSourceArabic ? '4. هدفك الأساسي اللي بتتعلم علشانه:' : '4. Your primary learning goal:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_OPTIONS.map(opt => {
                    const isSelected = goal === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGoal(opt.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-start transition cursor-pointer ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                            : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-stone-100 block truncate">
                            {isSourceArabic ? opt.title.split('·')[0].trim() : opt.title.split('·')[1]?.trim() || opt.title}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="ms-auto flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-500 text-stone-950 shrink-0">
                            <Check size={8} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Friendly Name */}
              <div>
                <label
                  htmlFor="user-name-input"
                  className="block text-xs font-bold text-stone-300 mb-1 text-start"
                >
                  {isSourceArabic ? 'اسمك إيه؟ (اختياري عشان أناديك بيه وإحنا بنتدرب سوا):' : "What is your name? (Optional):"}
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isSourceArabic ? 'مثلاً: أحمد، سارة، م. شريف...' : 'e.g. Alex, Sarah, Omar...'}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-start font-medium"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONFIRMATION & PERSONALIZATION SUMMARY */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-teal-500/40 space-y-2.5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold text-teal-400">
                    {isSourceArabic ? '🎯 ملخص خطة التحول الذهني المخصصة:' : '🎯 Your Personalized Immersion Plan:'}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                    جاهزة للانطلاق
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block mb-0.5">
                      {isSourceArabic ? '🧠 لغة التفكير الحالية:' : '🧠 Current Thought Language:'}
                    </span>
                    <span className="font-bold text-stone-100 flex items-center gap-1.5">
                      <LanguageFlag code={sourceLang} size={14} />
                      <span>{isSourceArabic ? SOURCE_LANGUAGES[sourceLang]?.nameNative : SOURCE_LANGUAGES[sourceLang]?.nameEn}</span>
                      {sourceLang === 'ar' && ` (${dialect === 'egyptian' ? 'عامية مصرية' : 'فصحى'})`}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block mb-0.5">
                      {isSourceArabic ? '🎯 لغة الهدف:' : '🎯 Target Language:'}
                    </span>
                    <span className="font-bold text-teal-400 flex items-center gap-1.5">
                      <LanguageFlag code={targetLang} size={14} />
                      <span>{TARGET_LANGUAGE_META[targetLang]?.nameNative}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block mb-0.5">
                      {isSourceArabic ? '📊 المستوى:' : '📊 Level:'}
                    </span>
                    <span className="font-bold text-stone-100">
                      {level === 'beginner' ? '🟢 مبتدئ (Beginner)' : level === 'intermediate' ? '🟡 متوسط (Intermediate)' : '🔵 متقدم (Advanced)'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block mb-0.5">
                      {isSourceArabic ? '🏆 الهدف الأساسي:' : '🏆 Primary Goal:'}
                    </span>
                    <span className="font-bold text-stone-100">
                      {GOAL_OPTIONS.find(g => g.id === goal)?.title.split('·')[0].trim() || 'طلاقة عامة'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 pt-1 leading-relaxed">
                  {isSourceArabic
                    ? '💡 سيتم ضبط واجهة التطبيق، وبنوك المفردات، وتمارين التفكير، وشخصية المدرب الذكي عمرو شريف وفق هذه الخطة فوراً.'
                    : '💡 The UI language, vocabulary decks, thinking exercises, and AI coach Amr will immediately adapt to this plan.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-800">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition flex items-center gap-1.5"
            >
              {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{isSourceArabic ? 'السابق' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="btn-shiny px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
          >
            {step < 3 ? (
              <>
                <span>{isSourceArabic ? 'الخطوة التالية' : 'Next Step'}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </>
            ) : (
              <>
                <span>{isSourceArabic ? 'يلا نبدأ الرحلة! 🚀' : 'Start Journey! 🚀'}</span>
                <Rocket size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
