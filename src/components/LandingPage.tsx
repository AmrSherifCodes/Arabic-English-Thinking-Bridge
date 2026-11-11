import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
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
  Play,
  X,
  CheckCircle2,
  HelpCircle,
  Lock,
  Mail,
  Star,
  MessageSquare,
  BookOpen,
  Layers,
  RefreshCw,
  Smartphone,
  Laptop,
  Apple,
  WifiOff,
  Shield,
  Heart,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { getPlatformInfo, storageAdapter } from '../platform/adapter';
import { API_BASE_URL } from '../utils/api';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { CreatorCard } from './CreatorCard';

interface LandingPageProps {
  onLaunchApp: () => void;
  isArabic?: boolean;
}

export function LandingPage({ onLaunchApp, isArabic = false }: LandingPageProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang.startsWith('ar');

  const tUI = (en: string, ar: string) => {
    if (lang.startsWith('ar')) return ar;
    return en;
  };

  const [liteMode, setLiteMode] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const memory = (navigator as any).deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 4;
      if (memory < 4 || cores <= 4) setLiteMode(true);
    }
  }, []);


  const [byokModalOpen, setByokModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    return storageAdapter.getItem('tb.subscribed') === 'true';
  });
  const [subMessage, setSubMessage] = useState<string | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [detectedOs, setDetectedOs] = useState<'android' | 'ios' | 'windows' | 'mac' | 'other'>('other');
  const [isNativeAndroid] = useState(() => {
    const platform = getPlatformInfo();
    return platform.os === 'android' && platform.isCapacitor;
  });
  const { isInstallable, triggerInstall, showIosHint } = usePwaInstall();

  const easterEggRef = useRef<HTMLDivElement>(null);

  // Smart OS Detection
  useEffect(() => {
    const { os } = getPlatformInfo();
    if (os === 'macos') setDetectedOs('mac');
    else if (os === 'android' || os === 'ios' || os === 'windows') setDetectedOs(os);
    else setDetectedOs('other');
  }, []);

  const handleLaunchApp = useCallback(() => {
    onLaunchApp();
  }, [onLaunchApp]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSubMessage(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }

    setSubscribing(true);
    setSubMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscribe', email: normalizedEmail }),
      });
      const result = await response.json() as { success?: boolean };
      if (!response.ok || result.success !== true) {
        throw new Error('Subscription request failed');
      }
      storageAdapter.setItem('tb.subscribed', 'true');
      setSubscribed(true);
      setEmail('');
      setSubMessage(isAr ? 'تم الاشتراك بنجاح! تم فتح الميزات الخاصة 🎉' : 'Subscribed successfully! Secret features unlocked 🎉');

      window.setTimeout(() => {
        easterEggRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setSubMessage(isAr ? 'تعذر إكمال الاشتراك. حاول مرة أخرى لاحقاً.' : 'Subscription failed. Please try again later.');
    } finally {
      setSubscribing(false);
    }
  };

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

  // Background orb animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const orbY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouchOrMobile = 'ontouchstart' in window || window.innerWidth < 768;
    if (isTouchOrMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX - innerWidth / 2) * 0.08);
      mouseY.set((e.clientY - innerHeight / 2) * 0.08);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className={`landing-shell min-h-screen text-[var(--text)] bg-[var(--bg)] transition-colors duration-300 ${tUI('font-sans-en', 'font-arabic')}`}
      dir={tUI('ltr', 'rtl')}
      lang={lang}
      style={{ scrollBehavior: 'smooth', fontFamily: 'var(--font)' }}
    >
      {/* Background Interactive Glassmorphic Orb with Mobile Guard */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          style={{ x: orbX, y: orbY }}
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[var(--accent-teal)]/20 via-[var(--secondary-amber)]/10 to-emerald-500/15 animate-pulse ${liteMode ? 'blur-[40px] opacity-50' : 'blur-[120px]'}`}
        />
        <div className={`absolute bottom-10 end-10 w-[450px] h-[450px] rounded-full bg-[var(--accent-teal)]/10 ${liteMode ? 'blur-[40px] opacity-50' : 'blur-[110px]'}`} />
      </div>

      {/* 1. NAV HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg)]/80 border-b border-[var(--border)]/80 px-4 py-3.5">
        <div className="max-w-[var(--max-width)] mx-auto flex flex-wrap items-center justify-between gap-y-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-teal)] to-emerald-500 flex items-center justify-center text-stone-950 font-black text-xl shadow-lg shadow-[var(--accent-teal)]/20">
              🧠
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                {tUI('Thinking Bridge', 'جسر التفكير')}
              </span>
              <span className="text-[10px] text-[var(--accent-teal)] font-bold uppercase tracking-wider block">
                {tUI('Cognitive Transfer Engine', 'جسر التحول الذهني')}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav aria-label={tUI('Main navigation', 'التنقل الرئيسي')} className="order-3 flex w-full items-center justify-center gap-4 text-[10px] font-bold text-[var(--muted)] sm:order-none sm:w-auto sm:gap-6 sm:text-xs">
            <a href="#subscribe-section" className="hover:text-[var(--accent-teal)] transition">
              {tUI('Subscribe', 'اشترك')}
            </a>
            <a href="#how-it-works" className="hover:text-[var(--accent-teal)] transition">
              {tUI('How it works', 'كيف يعمل')}
            </a>
            <a href="#download-section" className="hover:text-[var(--accent-teal)] transition">
              {tUI('Download', 'التحميل')}
            </a>
          </nav>

          {/* Controls: AR/EN Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => i18n.changeLanguage(lang.startsWith('ar') ? 'en' : 'ar')}
              className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--accent-teal)] transition flex items-center gap-1.5"
              aria-label={tUI('Switch to Arabic', 'التبديل إلى الإنجليزية')}
            >
              <Globe size={13} className="text-[var(--accent-teal)]" />
              <span>{tUI('العربية', 'English')}</span>
            </button>

            <button
              onClick={handleLaunchApp}
              className="btn-shiny px-5 py-2 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--accent-teal)] to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-stone-950 font-black text-xs transition shadow-lg shadow-[var(--accent-teal)]/20 active:scale-95 flex items-center gap-1.5"
            >
              <span>{tUI('Start Free 🚀', 'ابدأ مجاناً 🚀')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 px-4 pt-16 pb-10 max-w-[var(--max-width)] mx-auto">
        <div className="grid grid-cols-1 min-[820px]:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="min-[820px]:col-span-7 space-y-6 text-start">
            {/* Pill */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/30 text-[var(--accent-teal)] text-xs font-bold">
              <Zap size={13} />
              <span>{tUI('100% Free · Works Offline (First load ~28 MB)', 'مجاني 100% · يعمل بدون إنترنت (التحميل الأول ~28 ميجا)')}</span>
            </motion.div>

            {/* Main H1 */}
            <motion.h1 initial="hidden" animate="visible" variants={fadeIn} className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {isAr ? (
                <>
                  فكّر بالإنجليزي، <br />
                  <span className="text-[var(--accent-teal)]">مش تترجم.</span>
                </>
              ) : (
                <>
                  Think directly, <br />
                  <span className="text-[var(--accent-teal)]">don't translate.</span>
                </>
              )}
            </motion.h1>

            {/* Tagline */}
            <motion.p initial="hidden" animate="visible" variants={fadeIn} className="text-base sm:text-xl font-bold text-[var(--secondary-amber)]">
              "Think the structure. Don't memorize words."
            </motion.p>

            <motion.p initial="hidden" animate="visible" variants={fadeIn} className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-xl">
              {isAr
                ? 'جسر إدراكي يربط طريقة تفكيرك بالعربي مع التراكيب الإنجليزية الحقيقية. بطل ترجمة حرفية في دماغك وابدأ اتكلم ببديهة وطلاقة.'
                : 'A cognitive bridge that maps your native thoughts directly into natural English structures. Stop translating word-for-word and gain natural spoken reflexes.'}
            </motion.p>

            {/* CTAs */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-wrap gap-3 pt-2">
              <a
                href="#download-section"
                className="btn-shiny px-6 py-3.5 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--accent-teal)] via-emerald-400 to-[var(--accent-teal)] hover:opacity-90 active:scale-95 text-stone-950 font-black text-sm transition shadow-2xl shadow-[var(--accent-teal)]/30 flex items-center gap-2"
              >
                <Download size={16} />
                <span>{tUI('Download App', 'تحميل التطبيق')}</span>
              </a>

              <button
                onClick={handleLaunchApp}
                className="px-6 py-3.5 rounded-[var(--radius-md)] bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] font-bold text-sm text-[var(--text)] transition flex items-center gap-2"
              >
                <Globe size={16} className="text-[var(--accent-teal)]" />
                <span>{tUI('Try on Web', 'تجربة على الويب')}</span>
              </button>

              <a
                href="https://youtube.com/@SciAmrSherif"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Video Tutorial"
                className="px-6 py-3.5 rounded-[var(--radius-md)] bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 font-bold text-sm text-red-400 transition flex items-center gap-2"
              >
                <Youtube size={16} className="text-red-500 fill-red-500" />
                <span>{tUI('Watch YouTube Tutorial 🎬', 'شاهد الشرح على يوتيوب 🎬')}</span>
              </a>
            </motion.div>

            {/* Meta Stats */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs font-bold text-[var(--muted)] border-t border-[var(--border)]/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--accent-teal)]" />
                <span>{tUI('27 Interactive Lessons', '27 درس تفاعلي')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--accent-teal)]" />
                <span>{tUI('10,000+ Words & Phrases', '10,000+ كلمة وجملة')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--accent-teal)]" />
                <span>{tUI('100% Free', 'مجاني 100%')}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Phone Mockup */}
          <div className="min-[820px]:col-span-5 flex justify-center">
            <div className="w-full max-w-[320px] rounded-[38px] p-4 bg-stone-950 border-4 border-[var(--border)] shadow-2xl relative overflow-hidden">
              <div className="w-28 h-4 bg-stone-900 rounded-full mx-auto mb-4 border border-stone-800"></div>

              {/* Sample AR to EN Chat Mockup */}
              <div className="space-y-3 text-xs font-medium">
                <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl text-start">
                  <span className="text-[10px] text-[var(--muted)] block mb-1">{tUI('User:', 'المستخدم:')}</span>
                  <p className="text-white font-bold" dir="rtl">"ازيك يا عمرو؟ عامل ايه اليوم؟"</p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--accent-teal)]/30 p-3 rounded-2xl text-start relative">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent-teal)] mb-1">
                    <Sparkles size={11} />
                    <span>{tUI('Amr Sherif (AI Coach)', 'عمرو شريف (المدرب الذكي)')}</span>
                  </div>
                  <p className="text-stone-200 font-bold mb-1">
                    "Hello! I am doing fantastic today. How is your day going?"
                  </p>
                  <p className="text-[10px] text-[var(--secondary-amber)] bg-stone-950/60 p-2 rounded-xl mt-2 leading-relaxed">
                    💡 <strong>{tUI('Thinking Bridge:', 'جسر التفكير:')}</strong> {tUI('"عامل ايه" ➔ In English we ask about the current action/state: <strong>"How are you doing?"</strong>', '"عامل ايه" ➔ في الإنجليزية نسأل عن الفعل/الحالة الحالية: <strong>"How are you doing?"</strong>')}
                  </p>
                </div>

                <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl text-center text-[11px] text-[var(--muted)] font-bold">
                  ⚡ {tUI('Spaced Repetition Flashcards Due:', 'بطاقات الاستذكار المتباعد المستحقة:')} <strong>4,090</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 px-4 py-16 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-[var(--max-width)] mx-auto space-y-10 text-center">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              {tUI('How the Cognitive Bridge Works', 'كيف يعمل جسر التحول الذهني؟')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              {tUI('3 science-backed steps to stop word-for-word translation', '3 خطوات علمية للتخلص التام من الترجمة الحرفية')}
            </p>
          </div>

          <div className="grid grid-cols-1 min-[820px]:grid-cols-3 gap-6 text-start">
            {/* Card 1 */}
            <article className="p-6 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-3 hover:border-[var(--accent-teal)]/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/30 text-[var(--accent-teal)] flex items-center justify-center font-black text-2xl">
                <BookOpen size={24} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-base text-[var(--text)]">
                {tUI('Understand Structure', 'فهم البناء وتفكيك العقد')}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {isAr
                  ? 'التعرف على الفروق الجوهرية بين التفكير بالعربي والإنجليزي (مثل الأفعال المخفية وحروف الجر).'
                  : 'Identify structural shifts between native Arabic thinking and natural English reflexes.'}
              </p>
            </article>

            {/* Card 2 */}
            <article className="p-6 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-3 hover:border-[var(--secondary-amber)]/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-[var(--secondary-amber)]/10 border border-[var(--secondary-amber)]/30 text-[var(--secondary-amber)] flex items-center justify-center font-black text-2xl">
                <Mic size={24} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-base text-[var(--text)]">
                {tUI('Practice Speaking', 'ممارسة محادثة تفاعلية')}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {isAr
                  ? 'التحدث مع المدرب الذكي عمرو شريف وتلقي تصحيحات فورية بلباقة دون خوف من الخطأ.'
                  : 'Practice real-time speaking with AI coach Amr Sherif with instant, polite feedback.'}
              </p>
            </article>

            {/* Card 3 */}
            <article className="p-6 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-3 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-2xl">
                <RefreshCw size={24} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-base text-[var(--text)]">
                {tUI('Review Daily (SM-2)', 'مراجعة ذكية يومية (SM-2)')}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {isAr
                  ? 'نظام تكرار متباعد يحسب التوقيت الأمثل لمراجعة الكلمات والبطاقات قبل أن تنساها.'
                  : 'Spaced repetition system calculating the exact interval before you forget a phrase.'}
              </p>
            </article>
          </div>

          <div className="pt-8 flex justify-center">
            <button
              onClick={handleLaunchApp}
              className="btn-shiny px-8 py-4 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--accent-teal)] via-emerald-400 to-[var(--accent-teal)] text-stone-950 font-black text-base transition shadow-xl active:scale-95 flex items-center gap-2"
            >
              <span>{tUI('Begin Level Test 🚀', 'ابدأ تحديد المستوى الآن 🚀')}</span>
              <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. STATS STRIP */}
      <section className="px-4 py-10 max-w-[var(--max-width)] mx-auto">
        <div className="grid grid-cols-1 min-[820px]:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--accent-teal)] block mb-1">27</span>
            <span className="text-xs text-[var(--muted)] font-bold">{tUI('Interactive Lessons', 'درس تفاعلي')}</span>
          </div>
          <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--secondary-amber)] block mb-1">4090</span>
            <span className="text-xs text-[var(--muted)] font-bold">{tUI('Spaced Flashcards', 'بطاقة استذكار')}</span>
          </div>
          <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--accent-teal)] block mb-1">10,000+</span>
            <span className="text-xs text-[var(--muted)] font-bold">{tUI('Words & Sentences', 'مفردة وجملة')}</span>
          </div>
          <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--text)] block mb-1">0</span>
            <span className="text-xs text-[var(--muted)] font-bold">{tUI('Cost', 'التكلفة')}</span>
          </div>
        </div>
      </section>

      {/* 5. SUBSCRIBE SECTION */}
      <section id="subscribe-section" className="px-4 py-16 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--secondary-amber)] px-3 py-1 rounded-full bg-[var(--secondary-amber)]/10 border border-[var(--secondary-amber)]/20">
            <Star size={13} />
            <span>{tUI('Unlock Exclusive Features', 'احصل على الميزات المتقدمة')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {tUI('Subscribe for updates & secret features', 'اشترك لمتابعة التحديثات وفتح المميزات الخاصة')}
          </h2>

          <form onSubmit={handleSubscribe} className="flex flex-col min-[820px]:flex-row gap-2 max-w-md mx-auto">
            <label className="sr-only" htmlFor="subscription-email">{tUI('Email address', 'البريد الإلكتروني')}</label>
            <input
              id="subscription-email"
              type="email"
              name="email"
              autoComplete="email"
              dir="ltr"
              maxLength={254}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={tUI('Enter your email...', 'أدخل بريدك الإلكتروني...')}
              className="flex-1 px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-teal)]"
              required
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-6 py-3 rounded-[var(--radius-sm)] bg-[var(--accent-teal)] hover:opacity-90 active:scale-95 text-stone-950 font-black text-sm transition"
            >
              {subscribing ? (tUI('Submitting...', 'جاري الإرسال...')) : (tUI('Subscribe', 'اشترك الآن'))}
            </button>
          </form>

          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            {tUI('Your email is used only for product updates. We do not use tracking or analytics.', 'يُستخدم بريدك لإرسال تحديثات المنتج فقط. لا نستخدم أدوات تتبع أو تحليلات.')}
          </p>

          {subMessage && (
            <p role="status" aria-live="polite" className="text-xs font-bold text-[var(--accent-teal)] mt-2">
              {subMessage}
            </p>
          )}
        </div>
      </section>

      {/* 6. EASTER EGG (Rendered ONLY if subscribed === true) */}
      {subscribed && (
        <section ref={easterEggRef} className="px-4 py-16 bg-gradient-to-b from-[var(--bg)] to-[var(--surface)] border-t border-[var(--border)]">
          <div className="max-w-[var(--max-width)] mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 text-xs font-black">
              <Sparkles size={14} />
              <span>{tUI('🎉 Subscriber Exclusive Features Unlocked!', '🎉 تم فتح الميزات الخاصة للمشتركين!')}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[var(--text)]">
              {tUI('Advanced Cognitive Tools', 'أدوات التحول الذهني المتقدمة')}
            </h2>

            {/* 2x2 Features Grid */}
            <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-6 text-start">
              <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--accent-teal)]/40 space-y-2">
                <MessageSquare className="text-[var(--accent-teal)]" size={24} />
                <h3 className="font-bold text-base text-[var(--text)]">
                  {tUI('1. AI Conversation Practice', '1. تدريب المحادثة مع عمرو شريف')}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {tUI('Speak directly with AI coach Amr Sherif with live feedback.', 'تحدث بصوتك مباشرة مع مدربك الذكي واحصل على تصحيحات وتغذية راجعة حية.')}
                </p>
              </div>

              <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--accent-teal)]/40 space-y-2">
                <BookOpen className="text-[var(--secondary-amber)]" size={24} />
                <h3 className="font-bold text-base text-[var(--text)]">
                  {tUI('2. 27 Interactive Lessons', '2. 27 درساً تفاعلياً متكاملاً')}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {tUI('Step-by-step curriculum scaling from basics to executive phrasing.', 'مسار تعليمي يتدرج من الأساسيات إلى الاحتراف في صياغة الأفكار.')}
                </p>
              </div>

              <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--accent-teal)]/40 space-y-2">
                <Zap className="text-[var(--accent-teal)]" size={24} />
                <h3 className="font-bold text-base text-[var(--text)]">
                  {tUI('3. "Baladi to Corporate" Bridge', '3. مترجم «من البلدي إلى Corporate»')}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {tUI('Convert raw colloquial thoughts into polished corporate English.', 'تحويل أفكارك بالعامية المصرية إلى صياغات شركات احترافية بثوانٍ.')}
                </p>
              </div>

              <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--accent-teal)]/40 space-y-2">
                <Layers className="text-[var(--secondary-amber)]" size={24} />
                <h3 className="font-bold text-base text-[var(--text)]">
                  {tUI('4. 4,090 Spaced Flashcards', '4. 4090 بطاقات استذكار متباعد')}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {tUI('Retain your vocabulary effortlessly using the SM-2 algorithm.', 'حافظ على حصيلتك اللغوية بدون نسيان عبر خوارزمية SM-2.')}
                </p>
              </div>
            </div>

            <button
              onClick={handleLaunchApp}
              className="btn-shiny px-8 py-3.5 rounded-[var(--radius-md)] bg-[var(--accent-teal)] hover:opacity-90 active:scale-95 text-stone-950 font-black text-sm transition shadow-lg"
            >
              {tUI('Start Practice Now 🚀', 'الدخول للتمارين الآن 🚀')}
            </button>
          </div>
        </section>
      )}

      {/* 7. DOWNLOAD SECTION */}
      <section id="download-section" className="px-4 py-16 max-w-[var(--max-width)] mx-auto">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              {tUI('Download for Your Device', 'حمل التطبيق على جهازك')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              {tUI('Works natively across all platforms with full offline support', 'يعمل على جميع المنصات والهواتف بدون إنترنت')}
            </p>
          </div>

          {/* Highlighted OS Card */}
          <div className="grid grid-cols-1 min-[820px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-4">
            {/* Android */}
            <div className={`p-5 rounded-[var(--radius-md)] border text-center space-y-3 ${detectedOs === 'android' ? 'bg-[var(--surface)] border-[var(--accent-teal)] ring-2 ring-[var(--accent-teal)]/30' : 'bg-[var(--bg)] border-[var(--border)]'}`}>
              <Smartphone className="mx-auto text-[var(--accent-teal)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">Android</span>
                <span className="text-[10px] text-[var(--muted)] block">v4.1.0 · APK</span>
              </div>
              <a
                href={isNativeAndroid ? '/app' : 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.1.0/Thinking-Bridge-v4.1.0.apk'}
                target={isNativeAndroid ? undefined : "_blank"}
                rel={isNativeAndroid ? undefined : "noopener noreferrer"}
                onClick={isNativeAndroid ? (event) => {
                  event.preventDefault();
                  onLaunchApp();
                } : undefined}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-teal)] text-stone-950 font-bold text-xs w-full hover:opacity-90 transition"
              >
                {isNativeAndroid ? <ArrowRight size={13} aria-hidden="true" /> : <Download size={13} aria-hidden="true" />}
                <span>
                  {isNativeAndroid
                    ? (tUI('Launch App 🚀', 'تشغيل التطبيق 🚀'))
                    : (tUI('Download APK', 'تحميل APK'))}
                </span>
              </a>
              {!isNativeAndroid && (
                <div className="text-[9px] text-[var(--muted)] font-mono text-center opacity-70">
                  <span className="block mb-0.5">SHA-256 Checksum:</span>
                  <span>f5eed85dccbbed8b9367e9cd8b1a8dca79081b0738e80c2c699c0c29c956f6d8</span>
                </div>
              )}
              {isInstallable && (
                <button type="button" onClick={() => void triggerInstall()} className="text-[10px] font-bold text-[var(--muted)] underline underline-offset-2">
                  {tUI('Install web app', 'تثبيت نسخة الويب')}
                </button>
              )}
            </div>

            {/* iOS / PWA */}
            <div className={`p-5 rounded-[var(--radius-md)] border text-center space-y-3 ${detectedOs === 'ios' ? 'bg-[var(--surface)] border-[var(--accent-teal)] ring-2 ring-[var(--accent-teal)]/30' : 'bg-[var(--bg)] border-[var(--border)]'}`}>
              <Apple className="mx-auto text-[var(--text)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">iOS / iPhone</span>
                <span className="text-[10px] text-[var(--muted)] block">PWA / Web App</span>
              </div>
              <button
                onClick={() => {
                  if (showIosHint) setShowIosGuide(value => !value);
                  else if (isInstallable) void triggerInstall();
                  else onLaunchApp();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-bold text-xs w-full hover:border-[var(--accent-teal)] transition"
              >
                <ExternalLink size={13} />
                <span>{showIosHint ? (tUI('Install guide', 'طريقة التثبيت')) : isInstallable ? (tUI('Install app', 'تثبيت التطبيق')) : (tUI('Open Web App', 'تشغيل على الويب'))}</span>
              </button>
              {showIosGuide && showIosHint && (
                <p role="status" className="text-[11px] leading-relaxed text-[var(--muted)]">
                  {tUI('In Safari, tap Share, then choose "Add to Home Screen".', 'في Safari اضغط مشاركة، ثم اختر «إضافة إلى الشاشة الرئيسية».')}
                </p>
              )}
              {showIosHint && (
                <button onClick={onLaunchApp} className="text-xs font-bold text-[var(--accent-teal)] underline underline-offset-2">
                  {tUI('Open web app', 'فتح تطبيق الويب')}
                </button>
              )}
            </div>

            {/* Windows */}
            <div className={`p-5 rounded-[var(--radius-md)] border text-center space-y-3 ${detectedOs === 'windows' ? 'bg-[var(--surface)] border-[var(--accent-teal)] ring-2 ring-[var(--accent-teal)]/30' : 'bg-[var(--bg)] border-[var(--border)]'}`}>
              <Laptop className="mx-auto text-[var(--secondary-amber)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">Windows / Desktop</span>
                <span className="text-[10px] text-[var(--muted)] block">PWA / Desktop release</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onLaunchApp()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-bold text-xs w-full hover:border-[var(--accent-teal)] transition"
              >
                <Globe size={13} />
                <span>{isInstallable ? (tUI('Install PWA', 'تثبيت التطبيق')) : (tUI('Open Web App', 'تشغيل على الويب'))}</span>
              </button>
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest" className="block text-[10px] font-bold text-[var(--muted)] underline underline-offset-2">
                {tUI('Desktop releases', 'إصدارات سطح المكتب')}
              </a>
            </div>

            {/* macOS */}
            <div className={`p-5 rounded-[var(--radius-md)] border text-center space-y-3 ${detectedOs === 'mac' ? 'bg-[var(--surface)] border-[var(--accent-teal)] ring-2 ring-[var(--accent-teal)]/30' : 'bg-[var(--bg)] border-[var(--border)]'}`}>
              <Apple className="mx-auto text-[var(--muted)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">macOS</span>
                <span className="text-[10px] text-[var(--muted)] block">PWA / Desktop release</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onLaunchApp()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-bold text-xs w-full hover:border-[var(--accent-teal)] transition"
              >
                <Globe size={13} />
                <span>{isInstallable ? (tUI('Install PWA', 'تثبيت التطبيق')) : (tUI('Open Web App', 'تشغيل على الويب'))}</span>
              </button>
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest" className="block text-[10px] font-bold text-[var(--muted)] underline underline-offset-2">
                {tUI('Desktop releases', 'إصدارات سطح المكتب')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Card with 8-tap Easter Egg */}
      <CreatorCard />

      {/* 8. FOOTER */}
      <footer className="px-4 py-8 bg-[var(--surface)] border-t border-[var(--border)] text-center text-xs text-[var(--muted)] space-y-3">
        <p className="font-bold text-[var(--text)]">
          {tUI('Made in Alexandria, Egypt', 'صُنع في الإسكندرية، مصر')}
        </p>

        <p>
          {tUI('With gratitude to ', 'إهداء وتقدير إلى ')}
          <a href="https://www.languagetransfer.org/" target="_blank" rel="noopener noreferrer" aria-label="Mihalis Eleftheriou and Language Transfer" className="underline underline-offset-2 hover:text-[var(--accent-teal)] transition">
            Mihalis Eleftheriou & Language Transfer
          </a>
          {' · CC0 1.0'}
        </p>
        <p>Copyright (c) 2024-Present Amr Sherif Abdelaal</p>

        <div className="flex flex-wrap justify-center gap-4 pt-1 font-bold">
          <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" className="hover:text-[var(--accent-teal)] transition">
            GitHub
          </a>
          <a href="https://youtube.com/@SciAmrSherif" target="_blank" rel="noopener noreferrer" aria-label="YouTube channel" className="hover:text-[var(--accent-teal)] transition">
            YouTube
          </a>
          <a href="https://linkedin.com/in/sciamrsherif-abdelaal" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="hover:text-[var(--accent-teal)] transition">
            LinkedIn
          </a>
          <a href="mailto:amrsherifwork@gmail.com" aria-label="Email Amr Sherif" className="hover:text-[var(--accent-teal)] transition">
            Email
          </a>
        </div>
      </footer>



      {/* BYOK TUTORIAL MODAL */}
      <AnimatePresence>
        {byokModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 p-6 relative space-y-6 shadow-2xl text-start"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Key size={20} className="text-emerald-400" />
                  <h3 className="font-black text-base text-white">
                    {tUI('How to get a free Gemini Key', 'كيف تحصل على مفتاح Gemini مجاناً؟')}
                  </h3>
                </div>
                <button
                  onClick={() => setByokModalOpen(false)}
                  className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium text-stone-300">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                  <span className="font-black text-emerald-400 block">
                    {tUI('Step 1: Open Google AI Studio', 'الخطوة ١: افتح Google AI Studio')}
                  </span>
                  <p className="text-stone-400">
                    {isAr
                      ? 'افتح موقع Google AI Studio الرسمي واضغط على "Get API Key". المفتاح مجاني 100% بدون أي بطاقة أئتمان.'
                      : 'Visit Google AI Studio and click "Get API Key". It is 100% free with no credit card required.'}
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500 hover:text-stone-950 transition"
                  >
                    <span>Google AI Studio</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                  <span className="font-black text-emerald-400 block">
                    {tUI('Step 2: Paste key into Settings', 'الخطوة ٢: انسخ المفتاح في إعدادات التطبيق')}
                  </span>
                  <p className="text-stone-400">
                    {isAr
                      ? 'انسخ المفتاح الذي يبدأ بـ (AIzaSy...) والصقه في خانة المفتاح في إعدادات التطبيق واضغط "اختبار المفتاح".'
                      : 'Copy the key (starting with AIzaSy...) and paste it into Thinking Bridge Settings, then click "Test Key".'}
                  </p>
                </div>

                {/* Privacy Reassurance Note */}
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold flex items-start gap-2">
                  <Lock size={16} className="shrink-0 text-teal-400 mt-0.5" />
                  <p className="leading-relaxed">
                    {isAr
                      ? 'ملاحظة خصوصية: يتم حفظ المفتاح بنسبة 100% محلياً على هاتفك في الخزنة المحلية. لا نقوم بتسجيله أو إرساله لسيرفراتنا أبداً.'
                      : 'Privacy Note: Your key is stored 100% locally in your device vault. We never see, transmit, or log it on our servers.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setByokModalOpen(false);
                  handleLaunchApp();
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs transition active:scale-95 shadow-lg"
              >
                {tUI('Launch App & Enter Key 🚀', 'الانتقال للتطبيق وإدخال المفتاح 🚀')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}