import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Github,
  Linkedin,
  Youtube,
  Brain,
  Mic,
  Key,
  Globe,
  Award,
  Download,
  Code2,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Target,
  Flame,
} from 'lucide-react';
import { TargetLanguage } from '../types';
import { TARGET_LANGUAGE_META } from '../data/languages';

interface LandingPageProps {
  onLaunchApp: () => void;
  isArabic?: boolean;
}

export function LandingPage({ onLaunchApp, isArabic = false }: LandingPageProps) {
  const [lang, setLang] = useState<'en' | 'ar'>(isArabic ? 'ar' : 'en');
  const isAr = lang === 'ar';

  // Task 2: Read profile & target language from localStorage for CRO dynamic CTA
  const [userTarget, setUserTarget] = useState<TargetLanguage | null>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedLang = localStorage.getItem('tb.targetLang') as TargetLanguage;
        if (storedLang && TARGET_LANGUAGE_META[storedLang]) return storedLang;

        const rawProfile = localStorage.getItem('tb.userProfile');
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          if (parsed.targetLanguage && TARGET_LANGUAGE_META[parsed.targetLanguage as TargetLanguage]) {
            return parsed.targetLanguage as TargetLanguage;
          }
        }
      }
    } catch {
      /* noop */
    }
    return null;
  });

  // Task 4: Interactive Parallax Mouse Background Orb
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const orbY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window === 'undefined') return;
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX - innerWidth / 2) * 0.08);
      mouseY.set((e.clientY - innerHeight / 2) * 0.08);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  // Supported 10+ languages for marquee
  const marqueeLanguages = [
    { flag: '🇬🇧', nameEn: 'English', nameAr: 'الإنجليزية' },
    { flag: '🇩🇪', nameEn: 'Deutsch', nameAr: 'الألمانية' },
    { flag: '🇯🇵', nameEn: '日本語', nameAr: 'اليابانية' },
    { flag: '🇪🇸', nameEn: 'Español', nameAr: 'الإسبانية' },
    { flag: '🇫🇷', nameEn: 'Français', nameAr: 'الفرنسية' },
    { flag: '🇮🇹', nameEn: 'Italiano', nameAr: 'الإيطالية' },
    { flag: '🇨🇳', nameEn: '中文', nameAr: 'الصينية' },
    { flag: '🇹🇷', nameEn: 'Türkçe', nameAr: 'التركية' },
    { flag: '🇷🇺', nameEn: 'Русский', nameAr: 'الروسية' },
    { flag: '🇰🇷', nameEn: '한국어', nameAr: 'الكورية' },
  ];

  const targetMeta = userTarget ? TARGET_LANGUAGE_META[userTarget] : null;

  const dynamicCtaText = targetMeta
    ? isAr
      ? `متابعة تعلم ${targetMeta.nameAr} ${targetMeta.flag} 🚀`
      : `Resume Learning ${targetMeta.nameEn} ${targetMeta.flag} 🚀`
    : isAr
    ? 'ابدأ التفكير الآن 🚀'
    : 'Start Learning Free 🚀';

  return (
    <div
      className="min-h-screen bg-[#090D16] text-[#F9FAFB] font-sans antialiased overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-200 relative"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Background Interactive Glassmorphic Orb with Parallax Mouse Movement */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          style={{ x: orbX, y: orbY }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-teal-500/20 via-amber-500/10 to-emerald-500/15 blur-[120px] animate-pulse"
        />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-teal-600/10 blur-[110px]" />
      </div>

      {/* 1. HEADER NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090D16]/80 border-b border-stone-800/80 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-stone-950 font-black text-xl shadow-lg shadow-teal-500/20">
              🧠
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                Thinking Bridge
              </span>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                {isAr ? 'جسر التحول الذهني' : 'Cognitive Transfer Engine'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              className="px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900/80 hover:border-teal-500/50 text-xs font-bold transition flex items-center gap-1.5 text-stone-300"
            >
              <Globe size={14} className="text-teal-400" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            <button
              onClick={onLaunchApp}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-stone-950 font-black text-xs transition shadow-lg shadow-teal-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <span>{dynamicCtaText}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 px-4 pt-16 pb-12 max-w-5xl mx-auto text-center space-y-8">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
          {/* Active Dev & Open Source Flex Badge */}
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{isAr ? 'تطوير مستمر · مفتوح المصدر 100% · يعمل بدون إنترنت' : 'Active Development · 100% Open-Source · Offline First'}</span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {isAr ? (
              <>
                توقف عن الترجمة. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300">ابدأ التفكير بـ 10+ لغات.</span>
              </>
            ) : (
              <>
                Stop Translating. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300">Start Thinking in 10+ Languages.</span>
              </>
            )}
          </motion.h1>

          <motion.p variants={fadeIn} className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'الجسر الذهني المفتوح المصدر المدعوم بالذكاء الاصطناعي لإتقان التفكير المباشر بـ 10 لغات عالمية بدون ترجمة حرفية في الدماغ.'
              : 'The open-source, AI-powered cognitive bridge for mastering 10+ global languages natively without word-for-word translation.'}
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <button
              onClick={onLaunchApp}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:opacity-90 text-stone-950 font-black text-base transition shadow-2xl shadow-teal-500/30 active:scale-95 flex items-center gap-2"
            >
              <span>{dynamicCtaText}</span>
              <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
            </button>

            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-teal-500/50 text-stone-200 font-bold text-base transition flex items-center gap-2 hover:text-white"
            >
              <Github size={20} className="text-teal-400" />
              <span>{isAr ? 'الكود المصدري على GitHub' : 'View GitHub'}</span>
            </a>
          </motion.div>

          {/* Tech Stack Badge */}
          <motion.div variants={fadeIn} className="text-[11px] text-stone-400 font-mono pt-1">
            <span>Built with React 19, Vite, Tauri v2, & Gemini 2.5</span>
          </motion.div>
        </motion.div>

        {/* Task 1: Animated Language Marquee (Flags & Names) */}
        <div className="pt-8 overflow-hidden w-full relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#090D16] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#090D16] to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={{ x: isAr ? [0, 600] : [0, -600] }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="flex items-center gap-4 whitespace-nowrap"
          >
            {[...marqueeLanguages, ...marqueeLanguages].map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center gap-2 text-xs font-bold text-stone-300 shrink-0 shadow-sm"
              >
                <span className="text-lg">{item.flag}</span>
                <span>{isAr ? item.nameAr : item.nameEn}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. TASK 3: HOW IT WORKS (3-Step Visual Timeline) */}
      <section id="how-it-works" className="relative z-10 px-4 py-16 bg-stone-950/60 border-y border-stone-800/80">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 block">
              {isAr ? 'كيف يعمل النظام؟' : 'How It Works'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {isAr ? '3 خطوات لبناء بديهة لغوية فورية' : '3 Steps to Instant Native Reflexes'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-start">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-3 relative shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-black text-base">
                1
              </div>
              <h3 className="text-base font-black text-white">
                📝 {isAr ? 'خوض اختبار تحديد المستوى' : 'Take the Placement Test'}
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isAr
                  ? 'اختر لغتك الأم، واللغة التي تريد أن تفكر بها (إنجليزي، ألماني، ياباني)، وهدفك العملي لتخصيص الخريطة التعليمية.'
                  : 'Select your native thinking language, target language (English, German, Japanese), and practical goals.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-3 relative shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-base">
                2
              </div>
              <h3 className="text-base font-black text-white">
                🧠 {isAr ? 'إعادة برمجة الهيكل الذهني' : 'Rewire Your Brain'}
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isAr
                  ? 'حل تمارين تركيب الجمل التفاعلية التي تفكك عادات النقل اللغوي الخاطئة وتحول تفكيرك إلى المسار المباشر.'
                  : 'Complete interactive sentence-building exercises that break L1 transfer traps and automate target grammar.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-3 relative shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-black text-base">
                3
              </div>
              <h3 className="text-base font-black text-white">
                🎙️ {isAr ? 'التحدث الصوتي المباشر' : 'Speak with AI Coach'}
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isAr
                  ? 'اختبر بديهتك الجديدة في محادثات صوتية فورية مع المعلم الذكي مع دعم المقاطعة الفورية وتصحيح النطق.'
                  : 'Test your new cognitive reflexes in real-time voice conversations with your AI coach.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY I BUILT THIS STORY */}
      <section className="relative z-10 px-4 py-16 bg-stone-900/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10 items-center">
          {/* Amr's Photo Avatar Column */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-5 flex flex-col items-center text-center space-y-4"
          >
            <div className="relative">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl p-1 bg-gradient-to-tr from-teal-400 via-amber-400 to-emerald-400 shadow-2xl shadow-teal-500/20">
                <img
                  src="/amr.jpg"
                  alt="Amr Sherif"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/amr-avatar.png';
                  }}
                  className="w-full h-full object-cover rounded-[22px] bg-stone-950"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-stone-950 border border-teal-500/50 text-teal-400 text-xs font-black tracking-wide shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles size={12} />
                <span>Amr Sherif · Alexandria, Egypt 🇪🇬</span>
              </div>
            </div>

            <div className="pt-2 space-y-0.5">
              <span className="font-extrabold text-white text-lg block">Amr Sherif</span>
              <span className="text-xs text-teal-400 font-bold block">
                {isAr ? 'مبتكر ومطور جسر التفكير' : 'Creator & Lead Architect'}
              </span>
            </div>
          </motion.div>

          {/* Story Content Column */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 space-y-5 text-start"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Award size={14} />
              <span>{isAr ? 'قصة الابتكار والدافع' : 'Why I Built This'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {isAr ? (
                <>
                  من الصدمة في اختبار اللغة...{' '}
                  <span className="text-teal-400">إلى ابتكار نموذج تحول ذهني مجاني</span> للعالم العربي.
                </>
              ) : (
                <>
                  From an exam failure frustration...{' '}
                  <span className="text-teal-400">to architecting an open cognitive bridge</span> for humanity.
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
              {isAr
                ? 'عندما كنت طالباً جامعياً، قضيت 3 أسابيع كاملة في تعلّم الألمانية لأحصل على 11/160 فقط في اختبار OnSET! شعرت بالإحباط الشديد من التطبيقات التقليدية التي تدفعك للاشتراكات وتعلّمك الترجمة كلمة بكلمة. لذلك قررت بناء جسر التفكير لمساعدة كل متحدث بالعربية على إعادة برمجة عقله للتفكير المباشر باللغة المستهدفة. تطبيق مجاني 100%، مفتوح المصدر، ويعمل بدون إنترنت للحفاظ على الخصوصية والمجانية للجميع.'
                : 'As an undergrad, I spent 3 weeks learning German only to score 11/160 on the OnSET exam. I was frustrated. Duolingo kept nagging me to pay, and traditional apps taught me to translate word-for-word. So I took things into my own hands. I built Thinking Bridge to help every Arabic speaker rewire their brain to think in English—not just translate it. It\'s 100% open-source, offline-first, and uses a Bring Your Own Key (BYOK) model so it stays free for humanity.'}
            </p>

            <div className="pt-2">
              <button
                onClick={onLaunchApp}
                className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-stone-950 font-black text-xs transition shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>{dynamicCtaText}</span>
                <ArrowRight size={16} className={isAr ? 'rotate-180' : ''} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. FEATURE GRID (3 Columns) */}
      <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isAr ? 'مميزات هندسية فريدة' : 'Architected for Cognitive Speed'}
          </h2>
          <p className="text-sm text-stone-400 max-w-lg mx-auto">
            {isAr ? 'حلول جذريّة لمشكلات التفكير والترجمة التلقائية في الدماغ' : 'Radical solutions designed to break direct translation dependencies.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4 hover:border-teal-500/50 transition shadow-xl text-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-black text-2xl">
              🧠
            </div>
            <h3 className="text-lg font-black text-white">
              {isAr ? 'إعادة البرمجة الذهنية' : 'Cognitive Rewiring'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {isAr
                ? '27 درساً متكاملاً عبر مستويات A0-C2 يتكيف مع قواعد النقل اللغوي لأي لغة مستهدفة (إنجليزية، ألمانية، يابانية) لمعالجة الأخطاء التلقائية.'
                : '27 lessons across A0-C2 levels that adapt L1 transfer rules for any target language (English, German, Japanese) to fix structural habits.'}
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4 hover:border-amber-500/50 transition shadow-xl text-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-2xl">
              🎙️
            </div>
            <h3 className="text-lg font-black text-white">
              {isAr ? 'المعلم الصوتي الذكي' : 'AI Voice Tutor'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {isAr
                ? 'تدريب محادثة صوتي مباشر مع دعم المقاطعة الفورية (Barge-in) ومحاكاة النطق الطبيعي مدعوماً بذكاء Gemini 2.5 Flash.'
                : 'Real-time voice-to-voice practice with barge-in support, powered by Gemini.'}
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4 hover:border-emerald-500/50 transition shadow-xl text-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-2xl">
              🔑
            </div>
            <h3 className="text-lg font-black text-white">
              {isAr ? 'مفتاحك المجاني (BYOK)' : 'Bring Your Own Key'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {isAr
                ? 'أدخل مفتاحك المجاني الخاص من Google AI Studio لاستخدام بلا حدود أو اشتراكات. لا توجد جدران دفع أو إعلانات للأبد.'
                : 'Add your own free Gemini API key for unlimited access. No paywalls, no subscriptions.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 6. FOOTER & SOCIALS */}
      <footer className="relative z-10 px-4 py-12 bg-stone-950 border-t border-stone-800 text-center space-y-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="text-start">
            <span className="text-sm font-black text-white block">Thinking Bridge</span>
            <span className="text-xs text-stone-400 block">
              © 2026 Amr Sherif. Built in Alexandria, Egypt 🇪🇬.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.youtube.com/@SciAmrSherif?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-red-400 hover:bg-red-600 hover:text-white transition"
              aria-label="YouTube"
            >
              <Youtube size={18} />
            </a>

            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-teal-400 hover:bg-teal-500 hover:text-stone-950 transition"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>

            <a
              href="https://linkedin.com/in/sciamrsherif-abdelaal"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-blue-400 hover:bg-blue-600 hover:text-white transition"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>

            <a
              href="https://x.com/sciamrsherif"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition"
              aria-label="X (Twitter)"
            >
              <span className="font-black text-sm">𝕏</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
