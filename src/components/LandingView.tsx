import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import {
  Sparkles,
  Download,
  Smartphone,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Layers,
  Globe,
  Moon,
  Sun,
  ArrowDown,
  Zap,
  ShieldCheck,
  Star,
  ExternalLink,
  Laptop,
  Apple
} from 'lucide-react';

interface LandingViewProps {
  onStartWebApp: () => void;
  isArabic?: boolean;
}

export function LandingView({ onStartWebApp }: LandingViewProps) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tb.subscribed') === 'true';
    } catch {
      return false;
    }
  });
  const [subMessage, setSubMessage] = useState<string | null>(null);
  const [detectedOs, setDetectedOs] = useState<'android' | 'ios' | 'windows' | 'mac' | 'other'>('other');

  const easterEggRef = useRef<HTMLDivElement>(null);
  const isAr = lang === 'ar';

  // Smart OS Detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) {
      setDetectedOs('android');
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setDetectedOs('ios');
    } else if (/win/i.test(ua)) {
      setDetectedOs('windows');
    } else if (/mac/i.test(ua)) {
      setDetectedOs('mac');
    }
  }, []);

  // Sync theme with document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubMessage(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }

    setSubscribing(true);
    setSubMessage(null);

    try {
      if (supabase) {
        const { error } = await supabase.from('subscribers').insert({ email: email.trim().toLowerCase() });
        if (error && error.code !== '23505') {
          console.warn('Subscription error:', error.message);
        }
      }
    } catch (err) {
      console.warn('Subscription error:', err);
    } finally {
      setSubscribing(false);
      setSubscribed(true);
      try {
        localStorage.setItem('tb.subscribed', 'true');
      } catch {}
      setSubMessage(isAr ? 'تم الاشتراك بنجاح! تم فتح الميزات الخاصة 🎉' : 'Subscribed successfully! Secret features unlocked 🎉');

      // Smooth scroll to hidden Easter Egg features after render
      setTimeout(() => {
        easterEggRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div
      className="min-h-screen text-[var(--landing-text)] bg-[var(--landing-bg)] transition-colors duration-300"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      {/* 1. NAV HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--landing-surface)]/80 border-b border-[var(--landing-border)] px-4 py-3">
        <div className="max-w-[var(--landing-max-w)] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white">
                {isAr ? 'فكّر إنجليزي' : 'Thinking English'}
              </span>
              <span className="text-[10px] text-[var(--landing-muted)] font-medium">
                {isAr ? 'جسر التحول الذهني' : 'Cognitive Bridge'}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[var(--landing-muted)]">
            <a href="#subscribe-section" className="hover:text-[var(--landing-accent-teal)] transition">
              {isAr ? 'اشترك' : 'Subscribe'}
            </a>
            <a href="#how-it-works" className="hover:text-[var(--landing-accent-teal)] transition">
              {isAr ? 'كيف يعمل' : 'How it works'}
            </a>
            <a href="#download-section" className="hover:text-[var(--landing-accent-teal)] transition">
              {isAr ? 'التحميل' : 'Download'}
            </a>
          </nav>

          {/* Controls: AR/EN Toggle + Theme */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(prev => (prev === 'ar' ? 'en' : 'ar'))}
              className="px-2.5 py-1 rounded-[var(--landing-radius-sm)] border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-bold hover:border-[var(--landing-accent-teal)] transition flex items-center gap-1.5"
              aria-label="Toggle Language"
            >
              <Globe size={13} className="text-[var(--landing-accent-teal)]" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-[var(--landing-radius-sm)] border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs hover:border-[var(--landing-accent-teal)] transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={14} className="text-[var(--landing-secondary-amber)]" /> : <Moon size={14} className="text-[var(--landing-accent-teal)]" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="px-4 py-12 md:py-20 max-w-[var(--landing-max-w)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--landing-accent-teal)]/10 border border-[var(--landing-accent-teal)]/30 text-[var(--landing-accent-teal)] text-xs font-bold">
              <Zap size={13} />
              <span>{isAr ? 'مجاني 100% · يعمل بدون إنترنت' : '100% Free · Works Offline'}</span>
            </div>

            {/* Main H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {isAr ? (
                <>
                  فكّر بالإنجليزي، <br />
                  <span className="text-[var(--landing-accent-teal)]">مش تترجم.</span>
                </>
              ) : (
                <>
                  Think directly, <br />
                  <span className="text-[var(--landing-accent-teal)]">don't translate.</span>
                </>
              )}
            </h1>

            {/* Tagline */}
            <p className="text-base sm:text-xl font-bold text-[var(--landing-secondary-amber)]">
              "Think the structure. Don't memorize words."
            </p>

            <p className="text-sm sm:text-base text-[var(--landing-muted)] leading-relaxed max-w-xl">
              {isAr
                ? 'جسر إدراكي يربط طريقة تفكيرك بالعربي مع التراكيب الإنجليزية الحقيقية. بطل ترجمة حرفية في دماغك وابدأ اتكلم ببديهة وطلاقة.'
                : 'A cognitive bridge that maps your native thoughts directly into natural English structures. Stop translating word-for-word and gain natural spoken reflexes.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#download-section"
                className="px-6 py-3.5 rounded-[var(--landing-radius-md)] bg-[var(--landing-accent-teal)] hover:opacity-90 active:scale-95 text-stone-950 font-black text-sm transition shadow-lg shadow-[var(--landing-accent-teal)]/20 flex items-center gap-2"
              >
                <Download size={16} />
                <span>{isAr ? 'تحميل التطبيق' : 'Download App'}</span>
              </a>

              <button
                onClick={onStartWebApp}
                className="px-6 py-3.5 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] hover:bg-[var(--landing-border)] border border-[var(--landing-border)] font-bold text-sm text-[var(--landing-text)] transition flex items-center gap-2"
              >
                <Globe size={16} className="text-[var(--landing-accent-teal)]" />
                <span>{isAr ? 'تجربة على الويب مباشرة' : 'Try on Web'}</span>
              </button>
            </div>

            {/* Meta Stats */}
            <div className="flex items-center gap-6 pt-4 text-xs font-bold text-[var(--landing-muted)] border-t border-[var(--landing-border)]/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--landing-accent-teal)]" />
                <span>27 {isAr ? 'درس تفاعلي' : 'Interactive Lessons'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--landing-accent-teal)]" />
                <span>10,000+ {isAr ? 'كلمة وجملة' : 'Words & Phrases'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--landing-accent-teal)]" />
                <span>{isAr ? 'بدون إعلانات' : 'Zero Ads'}</span>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[320px] rounded-[38px] p-4 bg-stone-950 border-4 border-[var(--landing-border)] shadow-2xl relative overflow-hidden">
              <div className="w-28 h-4 bg-stone-900 rounded-full mx-auto mb-4 border border-stone-800"></div>

              {/* Sample AR to EN Chat Mockup */}
              <div className="space-y-3 text-xs font-medium">
                <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl text-start">
                  <span className="text-[10px] text-[var(--landing-muted)] block mb-1">المستخدم (User):</span>
                  <p className="text-white font-bold">"ازيك يا عمرو؟ عامل ايه اليوم؟"</p>
                </div>

                <div className="bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/30 p-3 rounded-2xl text-start relative">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--landing-accent-teal)] mb-1">
                    <Sparkles size={11} />
                    <span>عمرو شريف (AI Coach)</span>
                  </div>
                  <p className="text-stone-200 font-bold mb-1">
                    "Hello! I am doing fantastic today. How is your day going?"
                  </p>
                  <p className="text-[10px] text-[var(--landing-secondary-amber)] bg-stone-950/60 p-2 rounded-xl mt-2 leading-relaxed">
                    💡 <strong>جسر التفكير:</strong> "عامل ايه" ➔ In English we ask about the current action/state: <strong>"How are you doing?"</strong>
                  </p>
                </div>

                <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl text-center text-[11px] text-[var(--landing-muted)] font-bold">
                  ⚡ Spaced Repetition Flashcard Due: <strong>4,090 Cards</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="px-4 py-16 bg-[var(--landing-surface)] border-y border-[var(--landing-border)]">
        <div className="max-w-[var(--landing-max-w)] mx-auto space-y-10 text-center">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              {isAr ? 'كيف يعمل جسر التحول الذهني؟' : 'How the Cognitive Bridge Works'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--landing-muted)]">
              {isAr ? '3 خطوات علمية للتخلص التام من الترجمة الحرفية' : '3 science-backed steps to stop word-for-word translation'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            {/* Card 1 */}
            <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-bg)] border border-[var(--landing-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--landing-accent-teal)]/10 text-[var(--landing-accent-teal)] flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-white">
                {isAr ? 'فهم البناء وتفكيك العقد' : 'Understand Structure'}
              </h3>
              <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                {isAr
                  ? 'التعرف على الفروق الجوهرية بين التفكير بالعربي والإنجليزي (مثل الكينونة المحذوفة وحروف الجر).'
                  : 'Identify structural shifts between native Arabic thinking and natural English reflexes.'}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-bg)] border border-[var(--landing-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--landing-secondary-amber)]/10 text-[var(--landing-secondary-amber)] flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-white">
                {isAr ? 'ممارسة محادثة تفاعلية' : 'Practice Speaking'}
              </h3>
              <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                {isAr
                  ? 'التحدث مع المدرب الذكي عمرو شريف وتلقي تصحيحات فورية بلباقة دون خوف من الخطأ.'
                  : 'Practice real-time speaking with AI coach Amr Sherif with instant, polite feedback.'}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-bg)] border border-[var(--landing-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--landing-accent-teal)]/10 text-[var(--landing-accent-teal)] flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-white">
                {isAr ? 'مراجعة ذكية يومية (SM-2)' : 'Review Daily (SM-2)'}
              </h3>
              <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                {isAr
                  ? 'نظام تكرار متباعد يحسب التوقيت الأمثل لمراجعة الكلمات والبطاقات قبل أن تنساها.'
                  : 'Spaced repetition system calculating the exact interval before you forget a phrase.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS STRIP */}
      <section className="px-4 py-10 max-w-[var(--landing-max-w)] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-accent-teal)] block mb-1">27</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'درس تفاعلي' : 'Interactive Lessons'}</span>
          </div>
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-secondary-amber)] block mb-1">4,090</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'بطاقة استذكار' : 'Spaced Flashcards'}</span>
          </div>
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-accent-teal)] block mb-1">10,000+</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'مفردة وجملة' : 'Words & Sentences'}</span>
          </div>
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-white block mb-1">0 EGP</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'مجاني للأبد' : '100% Free Forever'}</span>
          </div>
        </div>
      </section>

      {/* 5. SUBSCRIBE SECTION */}
      <section id="subscribe-section" className="px-4 py-16 bg-[var(--landing-surface)] border-t border-[var(--landing-border)]">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--landing-secondary-amber)] px-3 py-1 rounded-full bg-[var(--landing-secondary-amber)]/10 border border-[var(--landing-secondary-amber)]/20">
            <Star size={13} />
            <span>{isAr ? 'احصل على الميزات المتقدمة' : 'Unlock Exclusive Features'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isAr ? 'اشترك لمتابعة التحديثات وفتح المميزات الخاصة' : 'Subscribe for updates & secret features'}
          </h2>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isAr ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
              className="flex-1 px-4 py-3 rounded-[var(--landing-radius-sm)] bg-[var(--landing-bg)] border border-[var(--landing-border)] text-sm text-[var(--landing-text)] focus:border-[var(--landing-accent-teal)] focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-6 py-3 rounded-[var(--landing-radius-sm)] bg-[var(--landing-accent-teal)] hover:opacity-90 active:scale-95 text-stone-950 font-black text-sm transition"
            >
              {subscribing ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'اشترك الآن' : 'Subscribe')}
            </button>
          </form>

          {subMessage && (
            <p className="text-xs font-bold text-[var(--landing-accent-teal)] mt-2">
              {subMessage}
            </p>
          )}
        </div>
      </section>

      {/* 6. EASTER EGG (Rendered ONLY if subscribed === true) */}
      {subscribed && (
        <section ref={easterEggRef} className="px-4 py-16 bg-gradient-to-b from-[var(--landing-bg)] to-[var(--landing-surface)] border-t border-[var(--landing-border)]">
          <div className="max-w-[var(--landing-max-w)] mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black">
              <Sparkles size={14} />
              <span>{isAr ? '🎉 تم فتح الميزات الخاصة للمشتركين!' : '🎉 Subscriber Exclusive Features Unlocked!'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isAr ? 'أدوات التحول الذهني المتقدمة' : 'Advanced Cognitive Tools'}
            </h2>

            {/* 2x2 Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <MessageSquare className="text-[var(--landing-accent-teal)]" size={24} />
                <h3 className="font-bold text-base text-white">
                  {isAr ? '1. تدريب المحادثة مع عمرو شريف' : '1. AI Conversation Practice'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'تحدث بصوتك مباشرة مع مدربك الذكي واحصل على تصحيحات وتغذية راجعة حية.' : 'Speak directly with AI coach Amr Sherif with live feedback.'}
                </p>
              </div>

              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <BookOpen className="text-[var(--landing-secondary-amber)]" size={24} />
                <h3 className="font-bold text-base text-white">
                  {isAr ? '2. 27 درساً تفاعلياً متكاملاً' : '2. 27 Interactive Lessons'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'مسار تعليمي يتدرج من الأساسيات إلى الاحتراف في صياغة الأفكار.' : 'Step-by-step curriculum scaling from basics to executive phrasing.'}
                </p>
              </div>

              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <Zap className="text-[var(--landing-accent-teal)]" size={24} />
                <h3 className="font-bold text-base text-white">
                  {isAr ? '3. مترجم "من البلدي لـ Corporate"' : '3. "Baladi to Corporate" Bridge'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'تحويل أفكارك بالعامية المصرية إلى صياغات شركات احترافية بثوانٍ.' : 'Convert raw colloquial thoughts into polished corporate English.'}
                </p>
              </div>

              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <Layers className="text-[var(--landing-secondary-amber)]" size={24} />
                <h3 className="font-bold text-base text-white">
                  {isAr ? '4. 4090 بطاقات استذكار متباعد' : '4. 4,090 Spaced Flashcards'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'حافظ على حصيلتك اللغوية بدون نسيان عبر خوارزمية SM-2.' : 'Retain your vocabulary effortlessly using the SM-2 algorithm.'}
                </p>
              </div>
            </div>

            <button
              onClick={onStartWebApp}
              className="px-8 py-3.5 rounded-[var(--landing-radius-md)] bg-[var(--landing-accent-teal)] hover:opacity-90 active:scale-95 text-stone-950 font-black text-sm transition shadow-lg"
            >
              {isAr ? 'الدخول للتمارين الآن 🚀' : 'Start Practice Now 🚀'}
            </button>
          </div>
        </section>
      )}

      {/* 7. DOWNLOAD SECTION */}
      <section id="download-section" className="px-4 py-16 max-w-[var(--landing-max-w)] mx-auto">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              {isAr ? 'حمل التطبيق على جهازك' : 'Download for Your Device'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--landing-muted)]">
              {isAr ? 'يعمل على جميع المنصات والهواتف بدون إنترنت' : 'Works natively across all platforms with full offline support'}
            </p>
          </div>

          {/* Highlighted OS Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Android */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'android' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Smartphone className="mx-auto text-[var(--landing-accent-teal)]" size={28} />
              <div>
                <span className="font-bold text-sm text-white block">Android</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">v3.1.0 · APK</span>
              </div>
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v3.1.0/Thinking-Bridge-v3.1.0.apk"
                download
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-accent-teal)] text-stone-950 font-bold text-xs w-full hover:opacity-90 transition"
              >
                <Download size={13} />
                <span>{isAr ? 'تثبيت APK' : 'Download APK'}</span>
              </a>
            </div>

            {/* iOS / PWA */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'ios' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Apple className="mx-auto text-white" size={28} />
              <div>
                <span className="font-bold text-sm text-white block">iOS / iPhone</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">PWA / Web App</span>
              </div>
              <button
                onClick={onStartWebApp}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] text-white font-bold text-xs w-full hover:border-[var(--landing-accent-teal)] transition"
              >
                <ExternalLink size={13} />
                <span>{isAr ? 'إضافة للشاشة الرئيسية' : 'Add to Home'}</span>
              </button>
            </div>

            {/* Windows */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'windows' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Laptop className="mx-auto text-[var(--landing-secondary-amber)]" size={28} />
              <div>
                <span className="font-bold text-sm text-white block">Windows / Desktop</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">Web / PWA</span>
              </div>
              <button
                onClick={onStartWebApp}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] text-white font-bold text-xs w-full hover:border-[var(--landing-accent-teal)] transition"
              >
                <Globe size={13} />
                <span>{isAr ? 'تشغيل على الويب' : 'Open Web App'}</span>
              </button>
            </div>

            {/* macOS */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'mac' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Apple className="mx-auto text-stone-300" size={28} />
              <div>
                <span className="font-bold text-sm text-white block">macOS</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">Web / PWA</span>
              </div>
              <button
                onClick={onStartWebApp}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] text-white font-bold text-xs w-full hover:border-[var(--landing-accent-teal)] transition"
              >
                <Globe size={13} />
                <span>{isAr ? 'تشغيل على الويب' : 'Open Web App'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="px-4 py-8 bg-[var(--landing-surface)] border-t border-[var(--landing-border)] text-center text-xs text-[var(--landing-muted)] space-y-3">
        <p className="font-bold text-white">
          {isAr ? 'صُنع في الإسكندرية، مصر 🇪🇬 · v3.1.0' : 'Crafted in Alexandria, Egypt 🇪🇬 · v3.1.0'}
        </p>

        {/* Explicit Single License Line */}
        <p>
          All rights reserved, Amr Sherif Abdelaal
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-1 font-bold">
          <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--landing-accent-teal)] transition">
            GitHub
          </a>
          <a href="https://youtube.com/@SciAmrSherif" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--landing-accent-teal)] transition">
            YouTube
          </a>
          <a href="https://linkedin.com/in/sciamrsherif-abdelaal" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--landing-accent-teal)] transition">
            LinkedIn
          </a>
          <a href="mailto:amrsherifbusiness@gmail.com" className="hover:text-[var(--landing-accent-teal)] transition">
            Email
          </a>
        </div>
      </footer>
    </div>
  );
}
