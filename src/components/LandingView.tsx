import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Smartphone,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Layers,
  Globe,
  Mic,
  RefreshCw,
  ArrowDown,
  Zap,
  ShieldCheck,
  Star,
  ExternalLink,
  Laptop,
  Apple
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { getPlatformInfo, storageAdapter } from '../platform/adapter';
import { API_BASE_URL } from '../utils/api';
import { CreatorCard } from './CreatorCard';

interface LandingViewProps {
  onStartWebApp: () => void;
  isArabic?: boolean;
}

export function LandingView({ onStartWebApp, isArabic = true }: LandingViewProps) {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const requestedLang = new URLSearchParams(window.location.search).get('lang');
      if (requestedLang === 'ar' || requestedLang === 'en') return requestedLang;
    }
    return isArabic ? 'ar' : 'en';
  });
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    return storageAdapter.getItem('tb.subscribed') === 'true';
  });
  const [subMessage, setSubMessage] = useState<string | null>(null);
  const [detectedOs, setDetectedOs] = useState<'android' | 'ios' | 'windows' | 'mac' | 'other'>('other');
  const [isNativeAndroid] = useState(() => {
    const platform = getPlatformInfo();
    return platform.os === 'android' && platform.isCapacitor;
  });
  const { isInstallable, triggerInstall, showIosHint } = usePwaInstall();

  const easterEggRef = useRef<HTMLDivElement>(null);
  const isAr = lang === 'ar';

  // Smart OS Detection
  useEffect(() => {
    const { os } = getPlatformInfo();
    if (os === 'macos') setDetectedOs('mac');
    else if (os === 'android' || os === 'ios' || os === 'windows') setDetectedOs(os);
    else setDetectedOs('other');
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [lang, isAr]);

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

  return (
    <div
      className="landing-shell min-h-screen text-[var(--landing-text)] bg-[var(--landing-bg)] transition-colors duration-300"
      lang={lang}
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      {/* 1. NAV HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--landing-surface)]/80 border-b border-[var(--landing-border)] px-4 py-3">
        <div className="max-w-[var(--landing-max-w)] mx-auto flex flex-wrap items-center justify-between gap-y-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-[var(--landing-text)]">
                {isAr ? 'فكّر إنجليزي' : 'Thinking English'}
              </span>
              <span className="text-[10px] text-[var(--landing-muted)] font-medium">
                {isAr ? 'جسر التحول الذهني' : 'Cognitive Bridge'}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'} className="order-3 flex w-full items-center justify-center gap-4 text-[10px] font-bold text-[var(--landing-muted)] sm:order-none sm:w-auto sm:gap-6 sm:text-xs">
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
              aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe size={13} className="text-[var(--landing-accent-teal)]" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="px-4 py-12 md:py-20 max-w-[var(--landing-max-w)] mx-auto">
        <div className="grid grid-cols-1 min-[820px]:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="min-[820px]:col-span-7 space-y-6 text-start">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--landing-accent-teal)]/10 border border-[var(--landing-accent-teal)]/30 text-[var(--landing-accent-teal)] text-xs font-bold">
              <Zap size={13} />
              <span>{isAr ? 'مجاني 100% · يعمل بدون إنترنت (التحميل الأول يحتاج واي فاي ~28 ميجا)' : '100% Free · Works Offline (First load requires WiFi ~28 MB)'}</span>
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs font-bold text-[var(--landing-muted)] border-t border-[var(--landing-border)]/50">
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
                <span>{isAr ? 'مجاني 100%' : '100% Free'}</span>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="min-[820px]:col-span-5 flex justify-center">
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

          <div className="grid grid-cols-1 min-[820px]:grid-cols-3 gap-6 text-start">
            {/* Card 1 */}
            <article className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-bg)] border border-[var(--landing-border)] space-y-3">
              <BookOpen className="text-[var(--landing-accent-teal)]" size={24} aria-hidden="true" />
              <h3 className="font-bold text-base text-[var(--landing-text)]">
                {isAr ? 'فهم البناء وتفكيك العقد' : 'Understand Structure'}
              </h3>
              <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                {isAr
                  ? 'التعرف على الفروق الجوهرية بين التفكير بالعربي والإنجليزي (مثل الأفعال المخفية وحروف الجر).'
                  : 'Identify structural shifts between native Arabic thinking and natural English reflexes.'}
              </p>
            </article>

            {/* Card 2 */}
            <article className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-bg)] border border-[var(--landing-border)] space-y-3">
              <Mic className="text-[var(--landing-secondary-amber)]" size={24} aria-hidden="true" />
              <h3 className="font-bold text-base text-[var(--landing-text)]">
                {isAr ? 'ممارسة محادثة تفاعلية' : 'Practice Speaking'}
              </h3>
              <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                {isAr
                  ? 'التحدث مع المدرب الذكي عمرو شريف وتلقي تصحيحات فورية بلباقة دون خوف من الخطأ.'
                  : 'Practice real-time speaking with AI coach Amr Sherif with instant, polite feedback.'}
              </p>
            </article>

            {/* Card 3 */}
            <article className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-bg)] border border-[var(--landing-border)] space-y-3">
              <RefreshCw className="text-[var(--landing-accent-teal)]" size={24} aria-hidden="true" />
              <h3 className="font-bold text-base text-[var(--landing-text)]">
                {isAr ? 'مراجعة ذكية يومية (SM-2)' : 'Review Daily (SM-2)'}
              </h3>
              <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                {isAr
                  ? 'نظام تكرار متباعد يحسب التوقيت الأمثل لمراجعة الكلمات والبطاقات قبل أن تنساها.'
                  : 'Spaced repetition system calculating the exact interval before you forget a phrase.'}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. STATS STRIP */}
      <section className="px-4 py-10 max-w-[var(--landing-max-w)] mx-auto">
        <div className="grid grid-cols-1 min-[820px]:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-accent-teal)] block mb-1">27</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'درس تفاعلي' : 'Interactive Lessons'}</span>
          </div>
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-secondary-amber)] block mb-1">4090</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'بطاقة استذكار' : 'Spaced Flashcards'}</span>
          </div>
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-accent-teal)] block mb-1">10,000+</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'مفردة وجملة' : 'Words & Sentences'}</span>
          </div>
          <div className="p-4 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="text-2xl sm:text-3xl font-black text-[var(--landing-text)] block mb-1">0</span>
            <span className="text-xs text-[var(--landing-muted)] font-bold">{isAr ? 'التكلفة' : 'Cost'}</span>
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

          <form onSubmit={handleSubscribe} className="flex flex-col min-[820px]:flex-row gap-2 max-w-md mx-auto">
            <label className="sr-only" htmlFor="subscription-email">{isAr ? 'البريد الإلكتروني' : 'Email address'}</label>
            <input
              id="subscription-email"
              type="email"
              name="email"
              autoComplete="email"
              dir="ltr"
              maxLength={254}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isAr ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
              className="flex-1 px-4 py-3 rounded-[var(--landing-radius-sm)] bg-[var(--landing-bg)] border border-[var(--landing-border)] text-sm text-[var(--landing-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent-teal)]"
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

          <p className="text-[11px] leading-relaxed text-[var(--landing-muted)]">
            {isAr
              ? 'يُستخدم بريدك لإرسال تحديثات المنتج فقط. لا نستخدم أدوات تتبع أو تحليلات.'
              : 'Your email is used only for product updates. We do not use tracking or analytics.'}
          </p>

          {subMessage && (
            <p role="status" aria-live="polite" className="text-xs font-bold text-[var(--landing-accent-teal)] mt-2">
              {subMessage}
            </p>
          )}
        </div>
      </section>

      {/* 6. EASTER EGG (Rendered ONLY if subscribed === true) */}
      {subscribed && (
        <section ref={easterEggRef} className="px-4 py-16 bg-gradient-to-b from-[var(--landing-bg)] to-[var(--landing-surface)] border-t border-[var(--landing-border)]">
          <div className="max-w-[var(--landing-max-w)] mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--landing-accent-teal)]/10 text-[var(--landing-accent-teal)] border border-[var(--landing-accent-teal)]/30 text-xs font-black">
              <Sparkles size={14} />
              <span>{isAr ? '🎉 تم فتح الميزات الخاصة للمشتركين!' : '🎉 Subscriber Exclusive Features Unlocked!'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[var(--landing-text)]">
              {isAr ? 'أدوات التحول الذهني المتقدمة' : 'Advanced Cognitive Tools'}
            </h2>

            {/* 2x2 Features Grid */}
            <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-6 text-start">
              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <MessageSquare className="text-[var(--landing-accent-teal)]" size={24} />
                <h3 className="font-bold text-base text-[var(--landing-text)]">
                  {isAr ? '1. تدريب المحادثة مع عمرو شريف' : '1. AI Conversation Practice'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'تحدث بصوتك مباشرة مع مدربك الذكي واحصل على تصحيحات وتغذية راجعة حية.' : 'Speak directly with AI coach Amr Sherif with live feedback.'}
                </p>
              </div>

              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <BookOpen className="text-[var(--landing-secondary-amber)]" size={24} />
                <h3 className="font-bold text-base text-[var(--landing-text)]">
                  {isAr ? '2. 27 درساً تفاعلياً متكاملاً' : '2. 27 Interactive Lessons'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'مسار تعليمي يتدرج من الأساسيات إلى الاحتراف في صياغة الأفكار.' : 'Step-by-step curriculum scaling from basics to executive phrasing.'}
                </p>
              </div>

              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <Zap className="text-[var(--landing-accent-teal)]" size={24} />
                <h3 className="font-bold text-base text-[var(--landing-text)]">
                  {isAr ? '3. مترجم «من البلدي إلى Corporate»' : '3. “Baladi to Corporate” Bridge'}
                </h3>
                <p className="text-xs text-[var(--landing-muted)]">
                  {isAr ? 'تحويل أفكارك بالعامية المصرية إلى صياغات شركات احترافية بثوانٍ.' : 'Convert raw colloquial thoughts into polished corporate English.'}
                </p>
              </div>

              <div className="p-6 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface)] border border-[var(--landing-accent-teal)]/40 space-y-2">
                <Layers className="text-[var(--landing-secondary-amber)]" size={24} />
                <h3 className="font-bold text-base text-[var(--landing-text)]">
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

      {/* 8. DOWNLOAD SECTION */}
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
          <div className="grid grid-cols-1 min-[820px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-4">
            {/* Android */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'android' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Smartphone className="mx-auto text-[var(--landing-accent-teal)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--landing-text)] block">Android</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">v4.0.2 · APK</span>
              </div>
              <a
                href={isNativeAndroid ? '/app' : 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.0.2/ThinkingBridge-v4.0.2.apk'}
                onClick={isNativeAndroid ? (event) => {
                  event.preventDefault();
                  onStartWebApp();
                } : undefined}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-accent-teal)] text-stone-950 font-bold text-xs w-full hover:opacity-90 transition"
              >
                {isNativeAndroid ? <ArrowDown size={13} aria-hidden="true" /> : <Download size={13} aria-hidden="true" />}
                <span>
                  {isNativeAndroid
                    ? (isAr ? 'تشغيل التطبيق 🚀' : 'Launch App 🚀')
                    : (isAr ? 'تحميل APK' : 'Download APK')}
                </span>
              </a>
              {isInstallable && (
                <button type="button" onClick={() => void triggerInstall()} className="text-[10px] font-bold text-[var(--landing-muted)] underline underline-offset-2">
                  {isAr ? 'تثبيت نسخة الويب' : 'Install web app'}
                </button>
              )}
            </div>

            {/* iOS / PWA */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'ios' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Apple className="mx-auto text-[var(--landing-text)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--landing-text)] block">iOS / iPhone</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">PWA / Web App</span>
              </div>
              <button
                onClick={() => {
                  if (showIosHint) setShowIosGuide(value => !value);
                  else if (isInstallable) void triggerInstall();
                  else onStartWebApp();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] text-[var(--landing-text)] font-bold text-xs w-full hover:border-[var(--landing-accent-teal)] transition"
              >
                <ExternalLink size={13} />
                <span>{showIosHint ? (isAr ? 'طريقة التثبيت' : 'Install guide') : isInstallable ? (isAr ? 'تثبيت التطبيق' : 'Install app') : (isAr ? 'تشغيل على الويب' : 'Open Web App')}</span>
              </button>
              {showIosGuide && showIosHint && (
                <p role="status" className="text-[11px] leading-relaxed text-[var(--landing-muted)]">
                  {isAr
                    ? 'في Safari اضغط مشاركة، ثم اختر «إضافة إلى الشاشة الرئيسية».'
                    : 'In Safari, tap Share, then choose “Add to Home Screen”.'}
                </p>
              )}
              {showIosHint && (
                <button onClick={onStartWebApp} className="text-xs font-bold text-[var(--landing-accent-teal)] underline underline-offset-2">
                  {isAr ? 'فتح تطبيق الويب' : 'Open web app'}
                </button>
              )}
            </div>

            {/* Windows */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'windows' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Laptop className="mx-auto text-[var(--landing-secondary-amber)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--landing-text)] block">Windows / Desktop</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">PWA / Desktop release</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onStartWebApp()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] text-[var(--landing-text)] font-bold text-xs w-full hover:border-[var(--landing-accent-teal)] transition"
              >
                <Globe size={13} />
                <span>{isInstallable ? (isAr ? 'تثبيت التطبيق' : 'Install PWA') : (isAr ? 'تشغيل على الويب' : 'Open Web App')}</span>
              </button>
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest" className="block text-[10px] font-bold text-[var(--landing-muted)] underline underline-offset-2">
                {isAr ? 'إصدارات سطح المكتب' : 'Desktop releases'}
              </a>
            </div>

            {/* macOS */}
            <div className={`p-5 rounded-[var(--landing-radius-md)] border text-center space-y-3 ${detectedOs === 'mac' ? 'bg-[var(--landing-surface)] border-[var(--landing-accent-teal)] ring-2 ring-[var(--landing-accent-teal)]/30' : 'bg-[var(--landing-bg)] border-[var(--landing-border)]'}`}>
              <Apple className="mx-auto text-[var(--landing-muted)]" size={28} />
              <div>
                <span className="font-bold text-sm text-[var(--landing-text)] block">macOS</span>
                <span className="text-[10px] text-[var(--landing-muted)] block">PWA / Desktop release</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onStartWebApp()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] text-[var(--landing-text)] font-bold text-xs w-full hover:border-[var(--landing-accent-teal)] transition"
              >
                <Globe size={13} />
                <span>{isInstallable ? (isAr ? 'تثبيت التطبيق' : 'Install PWA') : (isAr ? 'تشغيل على الويب' : 'Open Web App')}</span>
              </button>
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest" className="block text-[10px] font-bold text-[var(--landing-muted)] underline underline-offset-2">
                {isAr ? 'إصدارات سطح المكتب' : 'Desktop releases'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Card with 8-tap Easter Egg */}
      <CreatorCard />

      {/* 8. FOOTER */}
      <footer className="px-4 py-8 bg-[var(--landing-surface)] border-t border-[var(--landing-border)] text-center text-xs text-[var(--landing-muted)] space-y-3">
        <p className="font-bold text-[var(--landing-text)]">
          {isAr ? 'صُنع في الإسكندرية، مصر' : 'Made in Alexandria, Egypt'}
        </p>

        <p>
          {isAr ? 'إهداء وتقدير إلى ' : 'With gratitude to '}
          <a href="https://www.languagetransfer.org/" target="_blank" rel="noopener noreferrer" aria-label="Mihalis Eleftheriou and Language Transfer" className="underline underline-offset-2">
            Mihalis Eleftheriou &amp; Language Transfer
          </a>
          {' · CC0 1.0'}
        </p>
        <p>Copyright (c) 2024-Present Amr Sherif Abdelaal</p>

        <div className="flex justify-center items-center gap-2 mt-1 mb-2">
          <img
            src="https://github.com/AmrSherifCodes.png"
            alt="Amr Sherif (@sciamrsherif)"
            className="w-12 h-12 rounded-full border border-[var(--landing-border)]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-1 font-bold">
          <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" className="hover:text-[var(--landing-accent-teal)] transition">
            GitHub
          </a>
          <a href="https://youtube.com/@SciAmrSherif" target="_blank" rel="noopener noreferrer" aria-label="YouTube channel" className="hover:text-[var(--landing-accent-teal)] transition">
            YouTube
          </a>
          <a href="https://linkedin.com/in/sciamrsherif-abdelaal" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="hover:text-[var(--landing-accent-teal)] transition">
            LinkedIn
          </a>
          <a href="mailto:amrsherifwork@gmail.com" aria-label="Email Amr Sherif" className="hover:text-[var(--landing-accent-teal)] transition">
            Email
          </a>
        </div>
      </footer>
    </div>
  );
}
