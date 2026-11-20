import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, ArrowLeft, Globe, Compass, Briefcase, Plane, GraduationCap, MessageCircle, Rocket } from 'lucide-react';
import type { LearningGoal, UserProfile, SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META } from '../data/languages';
import { LanguageFlag } from './LanguageFlag';
import { RoleAgeConfigurator } from './RoleAgeConfigurator';
import type { HighSchoolTrack } from '../features/preferences/usePreferences';

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

const PRESET_PROFILES = [
  {
    id: 'school_student',
    title: 'طالب مدرسة',
    titleEn: 'School Student',
    icon: '🎒',
    preset: {
       age: 15,
       isStudent: true,
       level: 'beginner',
       goal: 'academic'
    }
  },
  {
    id: 'university',
    title: 'طالب جامعي',
    titleEn: 'University Student',
    icon: '🎓',
    preset: {
       age: 20,
       isStudent: true,
       level: 'intermediate',
       goal: 'academic'
    }
  },
  {
    id: 'professional',
    title: 'للشغل والعمل',
    titleEn: 'Career / Work',
    icon: '💼',
    preset: {
       age: 26,
       isStudent: false,
       level: 'intermediate',
       goal: 'work'
    }
  },
  {
    id: 'traveler',
    title: 'مسافر ومغترب',
    titleEn: 'Traveler',
    icon: '✈️',
    preset: {
       age: 30,
       isStudent: false,
       level: 'beginner',
       goal: 'travel'
    }
  },
  {
    id: 'custom',
    title: 'إعداد مخصص',
    titleEn: 'Custom Setup',
    icon: '⚙️',
  }
];

const GUIDES = [
  {
    id: 'amr',
    nameAr: 'عمرو شريف',
    nameEn: 'Amr Sherif',
    roleAr: 'المدرب الأساسي',
    roleEn: 'Core Coach',
    avatar: '👨🏻‍🏫', // Or the actual image if we can render it
    unlocked: true,
  },
  {
    id: 'sarah',
    nameAr: 'سارة',
    nameEn: 'Sarah',
    roleAr: 'خبيرة النطق',
    roleEn: 'Pronunciation Expert',
    avatar: '👩🏽‍🏫',
    unlocked: false,
    unlockLevel: 5,
  },
  {
    id: 'tariq',
    nameAr: 'طارق',
    nameEn: 'Tariq',
    roleAr: 'محترف بيئة العمل',
    roleEn: 'Career Expert',
    avatar: '👨🏽‍💼',
    unlocked: false,
    unlockLevel: 10,
  }
];

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
  // 5 Steps:
  // Step 0: Welcome & Avatars / Gamification
  // Step 1: Preset Profiles
  // Step 2: Source & Target Language
  // Step 3: Custom Level & Goal
  // Step 4: Confirmation
  const [step, setStep] = useState<number>(0);
  const [presetId, setPresetId] = useState<string>('');

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
  const [isStudent, setIsStudent] = useState<boolean>(initialProfile?.isStudent || false);
  const [age, setAge] = useState<number>(initialProfile?.age || 22);
  const [highSchoolTrack, setHighSchoolTrack] = useState<HighSchoolTrack>(
    (initialProfile?.highSchoolTrack as HighSchoolTrack) || 'thanawiya'
  );

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
        coachTag: isSourceArabic ? 'عمرو شريف · مدربك اللغوي 🌊' : 'Amr Sherif · Cognitive Coach',
        title: isSourceArabic ? 'أهلاً بيك يا بطل! جاهز للرحلة؟ 👋' : "Welcome! I'm Amr 👋",
        dialogue: isSourceArabic
          ? 'أنا عمرو، وهكون معاك خطوة بخطوة. هنجمع نقاط (XP)، ونفك عقدة الإنجليزي ونفكر مباشرة بدون ترجمة! جاهز ننطلق؟'
          : "I'll guide you step by step. We'll earn XP, rewire your brain, and think directly! Ready to start?"
      };
    }
    if (step === 1) {
      return {
        pose: AMR_POSES.thinking,
        coachTag: isSourceArabic ? 'عمرو شريف · إعداد سريع ⏱️' : 'Amr Sherif · Quick Setup ⏱️',
        title: isSourceArabic ? 'عشان نوفر وقتك، إنت مين في دول؟ 🚀' : 'To save time, which one are you? 🚀',
        dialogue: isSourceArabic
          ? 'اختار بروفايل جاهز وهظبطلك خطتك تلقائياً، أو اختار إعداد مخصص لو حابب تختار كل حاجة بنفسك.'
          : 'Pick a preset profile to auto-configure your plan, or choose Custom Setup.'
      };
    }
    if (step === 2) {
      return {
        pose: AMR_POSES.thinking,
        coachTag: isSourceArabic ? 'عمرو شريف · اللغات 🌍' : 'Amr Sherif · Languages 🌍',
        title: isSourceArabic ? 'إيه هي لغتك الحالية واللغة اللي بتستهدفها؟' : 'Source & Target Languages?',
        dialogue: isSourceArabic
          ? 'بنحتاج نعرف لغتك الأم اللي بتفكر بيها دلوقتي، واللغة اللي نفسك تتقن التفكير والتحدث بيها.'
          : 'What language do you think in now, and which one do you want to learn to think in?'
      };
    }
    if (step === 3) {
      return {
        pose: AMR_POSES.thinking,
        coachTag: isSourceArabic ? 'عمرو شريف · تفصيل الخطة 📊' : 'Amr Sherif · Custom Plan 📊',
        title: isSourceArabic ? 'تخصيص الخطة: مستواك وهدفك 🚀' : 'Tailor your plan: Level & Goal 🚀',
        dialogue: isSourceArabic
          ? 'عشان أظبطلك التمارين والمفردات بالمللي على مقاسك وما نضيعش وقتك، إيه مستواك الحالي وإيه هدفك الأساسي؟'
          : 'To tailor every exercise and situation precisely to your needs, what is your current level and main goal?'
      };
    }
    return {
      pose: AMR_POSES.ready,
      coachTag: isSourceArabic ? 'عمرو شريف · الخطة جاهزة (+50 XP) 🌟' : 'Amr Sherif · Ready (+50 XP) 🌟',
      title: isSourceArabic ? `عاش عليك يا ${name.trim() || 'بطل'}! 👏` : `Outstanding, ${name.trim() || 'Champion'}! 👏`,
      dialogue: isSourceArabic
        ? `حصلت على 50 نقطة خبرة كبداية! جهزتلك جسر تحول ذهني مخصص من ${SOURCE_LANGUAGES[sourceLang]?.nameAr} إلى ${TARGET_LANGUAGE_META[targetLang]?.nameAr}. انطلق!`
        : `You earned 50 XP to start! Your cognitive bridge from ${SOURCE_LANGUAGES[sourceLang]?.nameEn} to ${TARGET_LANGUAGE_META[targetLang]?.nameEn} is fully prepared!`
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
      targetLanguage: targetLang,
      age,
      isStudent,
      highSchoolTrack,
    };

    try {
      const stored = localStorage.getItem('tb.preferences.v1');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed.age = age;
      parsed.isStudent = isStudent;
      parsed.highSchoolTrack = highSchoolTrack;
      localStorage.setItem('tb.preferences.v1', JSON.stringify(parsed));
    } catch {}

    onComplete(profile, sourceLang, targetLang);
  };

  const handleNext = () => {
    if (step === 1 && presetId && presetId !== 'custom') {
      // Skip step 3 (Custom setup) if preset is chosen
      setStep(2);
    } else if (step === 2 && presetId && presetId !== 'custom') {
      // Go directly to Step 4 after language choice
      setStep(4);
    } else if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (step === 4 && presetId && presetId !== 'custom') {
      setStep(2);
    } else if (step === 2 && presetId && presetId !== 'custom') {
      setStep(1);
    } else if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleSelectPreset = (id: string) => {
    setPresetId(id);
    if (id !== 'custom') {
      const p = PRESET_PROFILES.find(x => x.id === id)?.preset;
      if (p) {
        setAge(p.age);
        setIsStudent(p.isStudent);
        setLevel(p.level as any);
        setGoal(p.goal as any);
      }
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
            {[0, 1, 2, 3, 4].map(idx => (
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
            {isSourceArabic ? `الخطوة ${step + 1} من 5` : `Step ${step + 1} of 5`}
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
          {/* STEP 0: WELCOME & GUIDES (GAMIFIED) */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-lg font-black text-white">{isSourceArabic ? 'اختر مدربك للرحلة 🗺️' : 'Choose your Guide 🗺️'}</h3>
                <p className="text-xs text-stone-400">
                  {isSourceArabic ? 'ستفتح المزيد من المدربين كلما تقدمت في المستويات!' : 'You will unlock more guides as you level up!'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {GUIDES.map(g => (
                  <div
                    key={g.id}
                    className={`relative p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
                      g.unlocked
                        ? 'bg-teal-950/40 border-teal-500/80 ring-1 ring-teal-500/30'
                        : 'bg-stone-950/40 border-stone-800 opacity-60 grayscale'
                    }`}
                  >
                    <div className="text-4xl">{g.avatar}</div>
                    <div>
                      <span className="font-bold text-[11px] text-stone-100 block truncate">{isSourceArabic ? g.nameAr : g.nameEn}</span>
                      <span className="text-[9px] text-stone-400 block truncate">{isSourceArabic ? g.roleAr : g.roleEn}</span>
                    </div>
                    {!g.unlocked && (
                      <div className="absolute top-2 right-2 bg-stone-900 text-stone-400 p-1 rounded-md text-[8px] font-bold border border-stone-800">
                        🔒 Lv {g.unlockLevel}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mt-4">
                 <div className="inline-block bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] px-3 py-1 rounded-full font-bold">
                    ✨ {isSourceArabic ? 'أكمل الإعداد لتحصل على 50 نقطة خبرة (XP) مجانية!' : 'Complete setup to get 50 free XP!'}
                 </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: PRESET PROFILES */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_PROFILES.map(p => {
                  const isSelected = presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-3xl mb-1.5">{p.icon}</span>
                      <span className="font-black text-sm text-stone-100">{isSourceArabic ? p.title : p.titleEn}</span>
                      {isSelected && (
                        <span className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-stone-950">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: SOURCE & TARGET LANGUAGE (Was Step 0 and Step 1 combined conceptually, but we can just ask both here or in quick succession. Let's do it in one view for speed) */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-teal-400">
                  {isSourceArabic ? 'أ. لغة التفكير الحالية (لغة الأم):' : 'A. Language you currently think in:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleSelectSource('ar')} className={`flex items-center gap-2 p-2 rounded-xl border transition ${sourceLang === 'ar' ? 'bg-teal-950/50 border-teal-500' : 'border-stone-800'}`}>
                    <LanguageFlag code="ar" size={16} /> <span className="text-xs font-bold text-white">العربية</span>
                  </button>
                  <button type="button" onClick={() => handleSelectSource('en')} className={`flex items-center gap-2 p-2 rounded-xl border transition ${sourceLang === 'en' ? 'bg-teal-950/50 border-teal-500' : 'border-stone-800'}`}>
                    <LanguageFlag code="en" size={16} /> <span className="text-xs font-bold text-white">English</span>
                  </button>
                </div>
                {sourceLang === 'ar' && (
                   <div className="pt-2">
                      <span className="text-[10px] font-bold text-stone-400 block mb-1">لهجة الشرح:</span>
                      <select value={dialect} onChange={e => setDialect(e.target.value as any)} className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-xs text-white outline-none">
                         <option value="egyptian">🇪🇬 العامية المصرية</option>
                         <option value="msa">🌍 العربية الفصحى</option>
                      </select>
                   </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800/60">
                <span className="text-xs font-bold text-teal-400">
                  {isSourceArabic ? 'ب. لغة الهدف (اللغة المراد تعلمها):' : 'B. Target Language:'}
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {TARGET_OPTIONS.map(opt => {
                    const isDisabled = sourceLang === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setTargetLang(opt.id)}
                        className={`flex flex-col items-center p-2 rounded-xl border text-center transition ${
                          targetLang === opt.id
                            ? 'bg-teal-950/50 border-teal-500'
                            : isDisabled ? 'opacity-30 border-stone-800' : 'bg-stone-900 border-stone-800'
                        }`}
                      >
                         <div className="flex items-center gap-1">
                            <LanguageFlag code={opt.id} size={16} />
                            <span className="text-xs font-bold text-white">{opt.title.split('·')[1] || opt.title}</span>
                         </div>
                         <span className="text-[9px] text-stone-400 mt-1">{opt.pedagogyTag}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOM SETUP (Only if custom selected) */}
          {step === 3 && (
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
                <RoleAgeConfigurator
                  age={age}
                  isStudent={isStudent}
                  highSchoolTrack={highSchoolTrack}
                  onAgeChange={setAge}
                  onStudentChange={setIsStudent}
                  onHighSchoolTrackChange={setHighSchoolTrack}
                  onStartFromZero={() => {
                    setLevel('beginner');
                    setStep(3);
                  }}
                />
              </div>

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

          {/* STEP 4: CONFIRMATION & PERSONALIZATION SUMMARY */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-teal-500/40 space-y-2.5">
                <div className="flex flex-col items-center justify-center border-b border-stone-800 pb-3 mb-2 gap-1 text-center">
                  <div className="text-2xl mb-1">🎉</div>
                  <span className="text-sm font-black text-amber-400">
                    {isSourceArabic ? '+50 نقطة خبرة (XP) 🌟' : '+50 XP Gained! 🌟'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isSourceArabic ? 'تم تفعيل خطة التحول الذهني بنجاح' : 'Immersion Plan Activated'}
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
            {step < 4 ? (
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
