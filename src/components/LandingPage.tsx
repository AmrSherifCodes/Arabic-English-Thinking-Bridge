import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Globe, BookOpen, Smartphone, RefreshCw, Apple, Laptop, ExternalLink, Brain, Sparkles, Terminal, Tv, Briefcase, Cpu, ShieldCheck, Zap, Check, Crown, GraduationCap, KeyRound } from 'lucide-react';
import { getPlatformInfo, storageAdapter } from '../platform/adapter';
import { API_BASE_URL } from '../utils/api';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { CreatorCard } from './CreatorCard';
import { LandingPhoneMockup } from './LandingPhoneMockup';
import { StreetDemoModal } from './StreetDemoModal';
import { SupportModal } from './SupportModal';
import { triggerHapticImpact } from '../utils/fx';
import { setGuideMode } from '../utils/guideMode';
import './LandingPage.css';

const LazyActivateCodeModal = React.lazy(() =>
  import('./ActivateCodeModal').then((m) => ({ default: m.ActivateCodeModal }))
);

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenQuran?: () => void;
  isArabic?: boolean;
}

export function LandingPage({ onLaunchApp, onOpenQuran, isArabic = false }: LandingPageProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang.startsWith('ar');

  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    return storageAdapter.getItem('tb.subscribed') === 'true';
  });
  const [subMessage, setSubMessage] = useState<string | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [detectedOs, setDetectedOs] = useState<'android' | 'ios' | 'windows' | 'mac' | 'other'>('other');
  const [streetDemoOpen, setStreetDemoOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

  const [isNativeAndroid] = useState(() => {
    const platform = getPlatformInfo();
    return platform.os === 'android' && platform.isCapacitor;
  });

  const { isInstallable, triggerInstall, showIosHint } = usePwaInstall();
  const easterEggRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { os } = getPlatformInfo();
    if (os === 'macos') setDetectedOs('mac');
    else if (os === 'android' || os === 'ios' || os === 'windows') setDetectedOs(os);
    else setDetectedOs('other');
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
  }, [isAr]);

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
      storageAdapter.setItem('tb.subscribed', 'true');
      setSubscribed(true);

      const mailtoUrl = `mailto:amrsherifwork@gmail.com?subject=${encodeURIComponent('Thinking Bridge Subscription')}&body=${encodeURIComponent(`Please subscribe my email to Thinking Bridge updates: ${normalizedEmail}`)}`;
      if (typeof window !== 'undefined') {
        window.location.href = mailtoUrl;
      }

      setEmail('');
      setSubMessage(
        isAr
          ? '📧 جاري فتح تطبيق البريد لإرسال طلب الاشتراك إلى amrsherifwork@gmail.com 🎉'
          : '📧 Opening mail app to send subscription request to amrsherifwork@gmail.com 🎉'
      );

      window.setTimeout(() => {
        easterEggRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setSubMessage(isAr ? 'تعذر فتح تطبيق البريد. يمكنك مراسلتنا على amrsherifwork@gmail.com' : 'Could not open mail app. You can email amrsherifwork@gmail.com directly.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className={`egyptian-landing ${isAr ? 'font-arabic' : 'font-sans-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* ================= NAV ================= */}
      <header className="nav">
        <div className="el-container nav-inner">
          <a
            href="#top"
            className="brand"
            aria-label={isAr ? 'جسر التفكير — الرئيسية' : 'Thinking Bridge — Home'}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17h18M5 17V9l7-5 7 5v8" />
                <path d="M9 17v-4a3 3 0 0 1 6 0v4" />
              </svg>
            </span>
            <span>{isAr ? 'جسر التفكير' : 'Thinking Bridge'}</span>
          </a>

          <nav className="nav-desktop">
            <ul className="nav-links">
              <li><a href="#why">{isAr ? 'المميزات' : 'Features'}</a></li>
              <li><a href="#how">{isAr ? 'إزاي بنشتغل' : 'How it works'}</a></li>
              <li><a href="#plans">{isAr ? 'الباقات' : 'Plans'}</a></li>
              <li><a href="#stats">{isAr ? 'الأرقام' : 'Stats'}</a></li>
              <li><a href="#download-section">{isAr ? 'التنزيل' : 'Download'}</a></li>
              <li>
                <a
                  href="/quran"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenQuran) {
                      onOpenQuran();
                    } else if (typeof window !== 'undefined' && window.history) {
                      window.history.pushState({}, '', '/quran');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="text-emerald-300 font-bold"
                >
                  {isAr ? 'ملاذ حفظ القرآن' : 'Quran Hifz'}
                </a>
              </li>
              <li><a href="#subscribe-section" className="text-[var(--gold)] font-bold">{isAr ? 'الاشتراك' : 'Subscribe'}</a></li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHapticImpact();
                setStreetDemoOpen(true);
              }}
              aria-label={isAr ? 'تجربة سريعة' : 'Quick Demo'}
              className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Zap size={15} className="text-emerald-400 shrink-0" />
              <span>{isAr ? 'تجربة سريعة' : 'Quick Demo'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const nextLang = isAr ? 'en' : 'ar';
                void i18n.changeLanguage(nextLang);
                setGuideMode(nextLang === 'en' ? 'english_guided' : 'egyptian_ar');
              }}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[40px] sm:min-h-[44px] min-w-[44px] rounded-2xl border border-[var(--nile)] text-[var(--nile)] text-xs font-bold hover:bg-[var(--nile)] hover:text-[#040D1A] transition whitespace-nowrap shrink-0"
              aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
            >
              <Globe size={14} className="shrink-0" />
              <span className="sm:hidden">{isAr ? 'EN' : 'AR'}</span>
              <span className="hidden sm:inline">{isAr ? 'English' : 'Arabic'}</span>
            </button>
            <button
              type="button"
              onClick={handleLaunchApp}
              className="btn btn-primary btn-sm !px-3.5 sm:!px-5 !py-2 !min-h-[40px] sm:!min-h-[44px] !text-xs sm:!text-sm whitespace-nowrap shrink-0"
            >
              {isAr ? 'ابدأ دلوقتي' : 'Start Now'}
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true"></div>
        <div className="el-container hero-inner">
          <div className="hero-grid">
            {/* Hero Left Column: Main Headlines & Call To Action */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="hero-copy text-start space-y-4 sm:space-y-6 min-w-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="hero-badge m-0">
                  <ShieldCheck size={16} className="text-[#2DD4BF]" />
                  <span>{isAr ? 'مجاني · يعمل بدون إنترنت' : 'Free · 100% Offline'}</span>
                </div>
                <div className="hero-badge m-0 bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                  <Sparkles size={16} />
                  <span>{isAr ? 'فكّر بالإنجليزي، مش تترجم.' : 'Think in English, don\'t translate.'}</span>
                </div>
              </div>

              <h1 className="leading-tight">
                {isAr ? 'اتعلم إنجليزي' : 'Learn English'}<br />
                <span className="accent">{isAr ? 'بعقلك المصري' : 'with your native mind'}</span><br />
                {isAr ? '— مش بترجمة حرفية' : '— no literal translation'}
              </h1>

              <p className="text-slate-100 font-semibold text-base sm:text-lg leading-relaxed">
                {isAr
                  ? 'بطل تترجم الكلمة بكلمتها فدماغك. هنا هنفهمك تركيب الجملة بالإنجليزي بطريقة منطقية عشان تتكلم بطلاقة وعلى طبيعتك، من قلب إسكندرية للمصريين كلهم.'
                  : 'Stop translating word-for-word in your head. Grasp the logical structure of English to speak fluently and naturally, straight from Alexandria to the world.'}
              </p>

              <div className="hero-cta">
                <button
                  type="button"
                  onClick={handleLaunchApp}
                  className="btn btn-gold hero-primary-cta w-full sm:w-auto"
                >
                  <span>
                    {isAr
                      ? '▶ ابدأ أول درس (30 ثانية)'
                      : '▶ Start First Lesson (30s)'}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Hero Right Column: Interactive Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="hero-mockup flex justify-center py-4"
            >
              <LandingPhoneMockup isArabic={isAr} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= QUICK SECONDARY ACCESS (BELOW THE FOLD) ================= */}
      <section className="py-6 border-y border-cyan-500/15 bg-[#061124]/80" aria-label={isAr ? 'روابط سريعة' : 'Quick Links'}>
        <div className="el-container flex flex-wrap items-center justify-center gap-3">
          <a
            href="/quran"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenQuran) {
                onOpenQuran();
              } else if (typeof window !== 'undefined' && window.history) {
                window.history.pushState({}, '', '/quran');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="btn hero-secondary-cta bg-emerald-500/15 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/25 transition flex items-center gap-2 cursor-pointer font-bold text-sm"
          >
            <span>📖 {isAr ? 'ملاذ حفظ القرآن (صدقة جارية)' : 'Quran Hifz Sanctuary (Free)'}</span>
          </a>
          <a
            href="/exam"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState({}, '', '/exam');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="btn hero-secondary-cta bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/25 transition flex items-center gap-2 cursor-pointer font-bold text-sm"
          >
            <span>🧭 {isAr ? 'اختبار تحديد المستوى' : 'Quick Level Check'}</span>
          </a>
          {!Capacitor.isNativePlatform() && (
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v9.0.0/ThinkingBridge-v9.0.0.apk"
              download="ThinkingBridge-v9.0.0.apk"
              className="btn hero-secondary-cta bg-amber-400/15 text-amber-200 border border-amber-400/40 hover:bg-amber-400/25 transition flex items-center gap-2 cursor-pointer font-bold text-sm"
            >
              <Download size={16} />
              <span>{isAr ? 'تحميل APK للأندرويد (v9.0.0)' : 'Download Android APK (v9.0.0)'}</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              triggerHapticImpact();
              setStreetDemoOpen(true);
            }}
            className="btn hero-secondary-cta bg-white/5 text-slate-200 border border-white/20 hover:bg-white/10 transition flex items-center gap-2 cursor-pointer font-bold text-sm"
          >
            <Zap size={16} className="text-emerald-400" />
            <span>{isAr ? 'تجربة سريعة بدون تسجيل' : 'Quick Interactive Demo'}</span>
          </button>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="section why" id="why">
        <div className="el-container">
          <span className="eyebrow">{isAr ? 'ليه جسر التفكير؟' : 'Why Thinking Bridge?'}</span>
          <h2 className="h2">{isAr ? 'مش مجرد كورس إنجليزي.' : 'Not just an English course.'}<br />{isAr ? 'طريقة تفكير جديدة.' : 'A new way of thinking.'}</h2>
          <p className="lede">
            {isAr
              ? 'بنشتغل على العقل المصري من جوّه. كل درس مبني على أمثلة من الحياة اليومية، بمنطق عربي واضح.'
              : 'Built for the native mind. Every lesson is based on daily life examples, using clear structural logic.'}
          </p>

          <div className="cards-grid">
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Brain size={32} />
              </div>
              <h3>{isAr ? 'بتفكر بالعربي' : 'Think Native'}</h3>
              <p>{isAr ? 'بنشرح المفاهيم بعقلك المصري، مش بترجمة حرفية من الإنجليزي. الفهم من الأول.' : 'Concepts explained using your native logic, avoiding word-by-word translation.'}</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Smartphone size={32} />
              </div>
              <h3>{isAr ? 'تطبيق من إسكندرية' : 'Made in Alexandria'}</h3>
              <p>{isAr ? 'كل درس فيه تمارين من الحياة اليومية — من الكورنيش، للمترو، للسوق. الإنجليزي بيبقى حقيقي.' : 'Exercises from daily life—the corniche, the metro, the market. Real English.'}</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <RefreshCw size={32} />
              </div>
              <h3>{isAr ? 'شغل من غير نت' : 'Works Offline'}</h3>
              <p>{isAr ? 'التطبيقات بتشتغل على موبايلك من غير إنترنت. اتعلم في المترو، في القطر، في أي مكان.' : 'Works completely offline. Learn on the train, in the metro, anywhere.'}</p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section how" id="how">
        <div className="el-container">
          <span className="eyebrow">{isAr ? 'إزاي بنشتغل' : 'How it works'}</span>
          <h2 className="h2">{isAr ? '3 خطوات وتبدأ تتكلم بثقة' : '3 steps to speak with confidence'}</h2>
          <p className="lede">
            {isAr ? 'من غير تعقيد، ومن غير ما تحس إنك بتدرس. اختار، اتدرب، اتكلم.' : 'No complications. Pick, practice, and speak freely.'}
          </p>

          <div className="steps">
            <div className="step">
              <h3>{isAr ? 'اختار المحتوى' : 'Choose Content'}</h3>
              <p>{isAr ? 'اختار المستوى اللي يناسبك وابدأ من أي نقطة. المنصة بتتكيف مع مستواك الحقيقي.' : 'Pick your starting point. The platform adapts to your true level.'}</p>
            </div>
            <div className="step">
              <h3>{isAr ? 'اتدرب على تفكيرك' : 'Train your mind'}</h3>
              <p>{isAr ? 'تمارين قصيرة بتخليك تفكر بالإنجليزي من غير ترجمة ذهنية. كل تمرين دقيقتين.' : 'Short exercises that train you to think in English. Two minutes each.'}</p>
            </div>
            <div className="step">
              <h3>{isAr ? 'اتكلم بثقة' : 'Speak confidently'}</h3>
              <p>{isAr ? 'بتلاقي نفسك بتفكر وتتكلم من غير ما توقف. الثقة بتيجي من التكرار الصح.' : 'You will find yourself speaking without pausing. Confidence comes from the right repetition.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="stats" id="stats">
        <div className="el-container">
          <div className="stats-grid">
            <div>
              <div className="stat-value">27</div>
              <div className="stat-label">{t('landing2.interactive_lessons')}</div>
            </div>
            <div>
              <div className="stat-value">4090</div>
              <div className="stat-label">{t('landing2.spaced_flashcards')}</div>
            </div>
            <div>
              <div className="stat-value">10,000+</div>
              <div className="stat-label">{t('landing2.words___sentences')}</div>
            </div>
            <div>
              <div className="stat-value">0</div>
              <div className="stat-label">{t('landing2.cost')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FREE FOREVER VS PRO / ACADEMY ================= */}
      <section className="section plans-section" id="plans">
        <div className="el-container">
          <div className="text-start">
            <span className="eyebrow">
              {isAr ? 'شفافية كاملة · المجاني للأبد مقابل Pro' : 'Full Transparency · Free Forever vs Pro'}
            </span>
            <h2 className="h2">
              {isAr
                ? 'المسار الأساسي مجاني للأبد — وباقة Pro للطموحين والسناتر'
                : 'Core Learning Free Forever — Pro & Academy for Fast-Track Mastery'}
            </h2>
            <p className="lede">
              {isAr
                ? 'التعليم الأساسي حق للجميع بدون قيود. وباقة Pro والأكاديميات (مثل سنتر الأقصى والسناتر الشريكة) بتضيف أدوات احترافية متقدمة بدفع محلي عبر InstaPay أو كاش في السنتر.'
                : 'Core Arabic-to-English fluency is free forever with zero ads. Pro & Academy (Al-Aqsa & partner centers) unlock advanced voice shadowing, career tracks, and cohort tools with local Egyptian payment.'}
            </p>
          </div>

          <div className="plans-grid">
            {/* Free Forever Card */}
            <article className="plan-card plan-card--free text-start">
              <div className="plan-card__head">
                <span className="plan-badge plan-badge--free">
                  <ShieldCheck size={15} />
                  <span>{isAr ? 'مجاني للأبد' : 'Free Forever'}</span>
                </span>
                <div className="plan-price">
                  <span className="plan-price__amount">0</span>
                  <span className="plan-price__unit">{isAr ? 'ج.م / للأبد' : 'EGP / Forever'}</span>
                </div>
              </div>

              <h3 className="plan-card__title">
                {isAr ? 'المسار الأساسي الكامل (عربي ← إنجليزي)' : 'Complete Core Thinking Bridge'}
              </h3>
              <p className="plan-card__desc">
                {isAr
                  ? 'كل ما تحتاجه لتتعلم التفكير بالإنجليزي بدون إنترنت وبدون إعلانات أو بطاقة بنكية.'
                  : 'Everything you need to internalize English structure offline, with zero ads or credit cards.'}
              </p>

              <ul className="plan-list">
                <li>
                  <Check size={16} className="plan-check plan-check--free" />
                  <span>{isAr ? 'الـ 27 درس تفاعلي + 4,090 بطاقة مراجعة ذكية (SM-2)' : 'All 27 interactive lessons + 4,090 SM-2 flashcards'}</span>
                </li>
                <li>
                  <Check size={16} className="plan-check plan-check--free" />
                  <span>{isAr ? 'القاموس الناطق + اختبار يا باشا (CEFR) + القصة التفاعلية' : 'Talking dictionary + Ya Basha CEFR exam + Story Engine'}</span>
                </li>
                <li>
                  <Check size={16} className="plan-check plan-check--free" />
                  <span>{isAr ? 'تسجيل نطق فردي محلي + معاينة مجانية لمسار الإنترفيو' : 'Local single-take voice recorder + 1 free interview scenario'}</span>
                </li>
                <li>
                  <Check size={16} className="plan-check plan-check--free" />
                  <span>{isAr ? 'يعمل 100% أوفلاين بدون تتبع أو سيرفرات إجبارية' : '100% offline-first architecture with zero tracking'}</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={handleLaunchApp}
                className="btn btn-primary w-full mt-auto"
              >
                <span>{isAr ? 'ابدأ مجاناً الآن' : 'Start Free Forever'}</span>
                <ArrowRight size={17} className={isAr ? 'rotate-180' : ''} />
              </button>
            </article>

            {/* Pro / Academy Card */}
            <article className="plan-card plan-card--pro text-start">
              <div className="plan-card__head">
                <span className="plan-badge plan-badge--pro">
                  <Crown size={15} />
                  <span>{isAr ? 'Pro / أكاديمية الأقصى والسناتر' : 'Pro / Academy (Al-Aqsa & Centers)'}</span>
                </span>
                <div className="plan-price">
                  <span className="plan-price__amount">50</span>
                  <span className="plan-price__unit">{isAr ? 'ج.م / شهر' : 'EGP / month'}</span>
                </div>
              </div>

              {/* Free First-Session Student Code Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-3">
                <GraduationCap size={14} />
                <span>
                  {isAr
                    ? '🎓 كود مجاني لأول حصة للطلاب (ALAQSA-FREE) · بدون بطاقة بنكية'
                    : '🎓 Free First-Session Student Code (ALAQSA-FREE) · Zero Cards'}
                </span>
              </div>

              {/* Egypt Pricing Ladder */}
              <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2 mb-4">
                <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 text-center">
                  <span className="text-[11px] font-bold text-slate-300 block">{isAr ? 'شهري' : 'Monthly'}</span>
                  <span className="text-sm sm:text-base font-black text-white block">{isAr ? '50 ج.م' : '50 EGP'}</span>
                  <span className="text-[10px] text-teal-300 block">{isAr ? '30 يوم' : '30 days'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-400/40 text-center">
                  <span className="text-[11px] font-bold text-teal-200 block">{isAr ? '3 شهور' : '3 Months'}</span>
                  <span className="text-sm sm:text-base font-black text-white block">{isAr ? '120 ج.م' : '120 EGP'}</span>
                  <span className="text-[10px] text-emerald-300 block">{isAr ? 'وفّر 20%' : 'Save 20%'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-center">
                  <span className="text-[11px] font-black text-amber-200 block">{isAr ? 'مدى الحياة' : 'Founding Lifetime'}</span>
                  <span className="text-sm sm:text-base font-black text-amber-300 block">{isAr ? '299 ج.م' : '299 EGP'}</span>
                  <span className="text-[10px] text-amber-200/90 block">{isAr ? 'مرة واحدة ♾️' : 'One-time ♾️'}</span>
                </div>
              </div>

              <h3 className="plan-card__title">
                {isAr ? 'أركيد Pro (قناص الأخطاء + الزعماء) + خزانة الجوائز + استوديو النطق' : 'Pro Arcade (Blitz & Boss Duels), Full Trophy Cabinet & Voice Studio'}
              </h3>
              <p className="plan-card__desc">
                {isAr
                  ? 'ادفع بسهولة عبر InstaPay أو كاش في سنتر الأقصى والسناتر الشريكة — بدون فيزا أو دولار.'
                  : 'Pay locally via InstaPay or cash at Al-Aqsa & partner centers — zero foreign cards or USD.'}
              </p>

              <ul className="plan-list">
                <li>
                  <Check size={16} className="plan-check plan-check--pro" />
                  <span>
                    {isAr
                      ? 'أركيد Pro غير المحدود: تحدي قناص الأخطاء (60 ثانية) + معركة الزعماء بنظام RPG'
                      : 'Unlimited Pro Arcade: 60s L1 Trap Blitz + RPG Level Boss Duels'}
                  </span>
                </li>
                <li>
                  <Check size={16} className="plan-check plan-check--pro" />
                  <span>
                    {isAr
                      ? 'خزانة الجوائز الكاملة (16+ إنجاز على طريقة Steam) + دروع حماية السلسلة + بطاقة مشاركة واتساب'
                      : 'Full Steam-style Trophy Cabinet (16+ Rare/Epic/Legendary badges) + streak shields'}
                  </span>
                </li>
                <li>
                  <Check size={16} className="plan-check plan-check--pro" />
                  <span>
                    {isAr
                      ? 'استوديو Shadowing الصوتي (1.0x / 0.75x) + مسار الإنترفيو والكول سنتر المصري'
                      : 'Pro Voice Shadowing Studio (1.0x / 0.75x) + Egyptian Interview & Call-Center Track'}
                  </span>
                </li>
                <li>
                  <Check size={16} className="plan-check plan-check--pro" />
                  <span>
                    {isAr
                      ? 'أكواد السناتر والأكاديميات (مثل سنتر الأقصى) + لوحة متابعة للمعلم — يعمل 100% أوفلاين'
                      : 'Academy center codes (Al-Aqsa & partners) + Teacher dashboard — 100% offline afterwards'}
                  </span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticImpact();
                    setActivateOpen(true);
                  }}
                  className="btn plan-btn-pro flex-1"
                >
                  <KeyRound size={17} />
                  <span>{isAr ? 'تفعيل كود Pro / الأكاديمية' : 'Activate Pro / Academy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticImpact();
                    setActivateOpen(true);
                  }}
                  className="btn plan-btn-center"
                >
                  <GraduationCap size={17} />
                  <span>{isAr ? 'تفاصيل السناتر' : 'Center Info'}</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ================= DOWNLOAD SECTION ================= */}
      <section id="download-section" className="section bg-[var(--sand-light)] border-b border-[var(--line)]">
        <div className="el-container text-center space-y-8">
          <div>
            <h2 className="h2 mb-2">{t('landing2.download_for_your_device')}</h2>
            <p className="lede mx-auto">{t('landing2.works_natively_across_all_plat')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            <div className={`download-card ${detectedOs === 'android' ? 'highlight' : ''}`}>
              <Smartphone size={32} />
              <div className="mb-4 text-center">
                <span className="font-bold text-lg block text-[var(--navy)]">Android</span>
                <span className="text-sm text-[var(--ink-soft)] block">V9 (v9.0.0) · 42.7 MB APK</span>
              </div>
              <a
                href="/app"
                onClick={(event) => { event.preventDefault(); onLaunchApp(); }}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                <ArrowRight size={16} />
                <span>{t('landing2.launch_app___')}</span>
              </a>
              {!Capacitor.isNativePlatform() && (
                <>
                  <a
                    href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v9.0.0/ThinkingBridge-v9.0.0.apk"
                    download="ThinkingBridge-v9.0.0.apk"
                    className="btn btn-gold btn-sm w-full mt-1"
                  >
                    <span>{isAr ? 'تحميل APK (V9 · v9.0.0 · 42.7 MB)' : 'Download APK (V9 · v9.0.0 · 42.7 MB)'}</span>
                  </a>
                  <a
                    href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v9.0.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2"
                  >
                    {isAr ? 'صفحة الإصدار والتحقق (GitHub v9.0.0)' : 'Release Notes & Verification (GitHub v9.0.0)'}
                  </a>
                  <div
                    dir="ltr"
                    className="w-full max-w-full rounded-lg bg-black/10 px-2 py-1.5 text-[10px] font-mono text-[var(--ink-soft)] break-all select-all text-center mt-1"
                  >
                    SHA-256: 1c784627ea76bc14adad4f9744621a9e1395c03a8a9386ba12a7c81fc56a91d3
                  </div>
                </>
              )}
            </div>

            {!Capacitor.isNativePlatform() && detectedOs !== 'android' && (
              <div className={`download-card ${detectedOs === 'ios' ? 'highlight' : ''}`}>
                <Apple size={32} />
                <div className="mb-4 text-center">
                  <span className="font-bold text-lg block text-[var(--navy)]">iOS / iPhone</span>
                  <span className="text-sm text-[var(--ink-soft)] block">PWA / Web App</span>
                </div>
                <button
                  onClick={() => {
                    if (showIosHint) setShowIosGuide(value => !value);
                    else if (isInstallable) void triggerInstall();
                    else onLaunchApp();
                  }}
                  className="btn btn-primary btn-sm w-full mb-2"
                >
                  <ExternalLink size={16} />
                  <span>{showIosHint ? (t('landing2.install_guide')) : isInstallable ? (t('landing2.install_app')) : (t('landing2.open_web_app'))}</span>
                </button>
                {showIosGuide && showIosHint && (
                  <p className="text-xs text-[var(--ink-soft)] mt-2">{t('landing2.in_safari__tap_share__then_cho')}</p>
                )}
              </div>
            )}

            <div className={`download-card ${detectedOs === 'windows' ? 'highlight' : ''}`}>
              <Laptop size={32} />
              <div className="mb-4 text-center">
                <span className="font-bold text-lg block text-[var(--navy)]">Windows</span>
                <span className="text-sm text-[var(--ink-soft)] block">PWA / Desktop</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onLaunchApp()}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                <Globe size={16} />
                <span>{isInstallable ? (t('landing2.install_pwa')) : (t('landing2.open_web_app'))}</span>
              </button>
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v9.0.0" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2">
                {t('landing2.desktop_releases')}
              </a>
            </div>

            <div className={`download-card ${detectedOs === 'mac' ? 'highlight' : ''}`}>
              <Apple size={32} />
              <div className="mb-4 text-center">
                <span className="font-bold text-lg block text-[var(--navy)]">macOS</span>
                <span className="text-sm text-[var(--ink-soft)] block">PWA / Desktop</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onLaunchApp()}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                <Globe size={16} />
                <span>{isInstallable ? (t('landing2.install_pwa')) : (t('landing2.open_web_app'))}</span>
              </button>
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v9.0.0" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2">
                {t('landing2.desktop_releases')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUBSCRIBE SECTION ================= */}
      <section className="subscribe-section" id="subscribe-section" ref={easterEggRef}>
        <div className="el-container">
          <h2 className="h2">{t('landing2.subscribe_for_updates___secret')}</h2>
          <p className="lede mx-auto">{isAr ? 'سجل دلوقتي وفعّل حسابك في دقيقة واحدة. فتح الخزنة السرية للميزات المتقدمة!' : 'Sign up now and activate your account. Unlocks secret power tools!'}</p>
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('landing2.enter_your_email___')}
              required
              dir="ltr"
            />
            <button type="submit" disabled={subscribing} className="btn btn-primary">
              {subscribing ? (t('landing2.submitting___')) : (t('landing2.subscribe'))}
            </button>
          </form>
          <p className="text-xs text-[var(--ink-soft)] mt-3 opacity-90 max-w-lg mx-auto">
            {isAr
              ? '🔒 لا نستخدم سيرفرات خارجية لتخزين بريدك. النقر على "اشتراك" يفتح تطبيق البريد لإرسال رسالة مباشرة للحفاظ على خصوصيتك بنسبة 100%.'
              : '🔒 We do not use third-party servers to store your email. Clicking Subscribe opens your email client directly, guaranteeing 100% privacy.'}
          </p>
          {subMessage && (
            <p className="mt-4 font-bold text-[var(--nile)]">{subMessage}</p>
          )}

          {/* Secret Feature Vault (Revealed when Subscribed) */}
          {subscribed && (
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#0F172A] border-2 border-cyan-500/60 shadow-2xl text-start text-white space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-cyan-400" size={24} />
                  <h3 className="font-black text-lg sm:text-xl text-cyan-300">
                    {isAr ? '🔓 تم فتح الخزنة السرية للميزات المتقدمة!' : '🔓 Secret Feature Vault Unlocked!'}
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  SUBSCRIBER VIP PASS
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {isAr
                  ? 'شكراً لاشتراكك! بصفتك عضواً في مجتمع جسر التفكير، لديك وصول فوري ومستمر لجميع الأدوات السرية:'
                  : 'Thank you for subscribing! As a member, you have instant access to these advanced power features:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-green-400 font-bold text-xs mb-1">
                      <Terminal size={16} />
                      <span>{isAr ? 'بيئة الطرفية' : 'Hacker Terminal'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'الطرفية التفاعلية' : 'Terminal Mode'}</h4>
                    <p className="text-[11px] text-stone-400 mt-1">{isAr ? 'تدريب الجسور بأوامر سطر الأوامر' : 'CLI structural bridge practice'}</p>
                  </div>
                  <button onClick={onLaunchApp} className="w-full min-h-[48px] py-2 rounded-xl bg-green-500 text-stone-950 font-bold text-xs hover:bg-green-400 transition flex items-center justify-center">
                    {isAr ? 'تشغيل الطرفية ⚡' : 'Launch Terminal ⚡'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                      <Tv size={16} />
                      <span>{isAr ? 'الفصل الدراسي' : 'Teacher View'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'وضع البروجيكتور' : 'Classroom Mode'}</h4>
                    <p className="text-[11px] text-stone-400 mt-1">{isAr ? 'رمز QR للطلاب وعرض مكبر للمدرس' : 'Student QR + Big Projector Display'}</p>
                  </div>
                  <a href="/teacher" className="w-full min-h-[48px] py-2 rounded-xl bg-indigo-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center hover:bg-indigo-400 transition">
                    {isAr ? 'فتح وضع المعلم 🏫' : 'Open Teacher Mode 🏫'}
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                      <Briefcase size={16} />
                      <span>{isAr ? 'الصياغة الراقية' : 'Corporate Bridge'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'مترجم الشركات' : 'Executive Tone'}</h4>
                    <p className="text-[11px] text-stone-400 mt-1">{isAr ? 'تحويل العامية إلى إنجليزي الشركات' : 'Egyptian to Corporate English'}</p>
                  </div>
                  <button onClick={onLaunchApp} className="w-full min-h-[48px] py-2 rounded-xl bg-blue-500 text-stone-950 font-bold text-xs hover:bg-blue-400 transition flex items-center justify-center">
                    {isAr ? 'فتح المترجم 💼' : 'Launch Corporate 💼'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                      <Cpu size={16} />
                      <span>{isAr ? 'الذكاء الاصطناعي' : 'AI Agent'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'معمل العميل المستقل' : 'Autonomous Agent'}</h4>
                    <p className="text-[11px] text-stone-400 mt-1">{isAr ? 'مستكشف التحليل اللغوي المتقدم' : 'Linguistic Tool-Loop Agent'}</p>
                  </div>
                  <a href="/api/agent" target="_blank" rel="noopener noreferrer" className="w-full min-h-[48px] py-2 rounded-xl bg-teal-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center hover:bg-teal-400 transition">
                    {isAr ? 'معاينة العميل 🤖' : 'View AI Agent 🤖'}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= TRUST & PRIVACY SECTION ================= */}
      <section className="py-12 bg-[var(--papyrus)] border-t border-[var(--line)]">
        <div className="el-container max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-xl font-bold text-[var(--navy)]">
            {isAr ? '🛡️ معيار السيادة الرقمية والخصوصية المطلقة' : '🛡️ Digital Sovereignty & Absolute Privacy Standard'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            <div className="p-5 rounded-2xl bg-[#0B1C33] border border-cyan-500/30 space-y-2">
              <span className="text-lg block font-bold text-white">⚡ {isAr ? 'عملية 100% بدون إنترنت' : '100% Offline Architecture'}</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? 'يعمل التطبيق بالكامل بدون حاجة لاتصال بالإنترنت، وبدون سيرفرات خارجية تتبع بياناتك.' : 'Zero foreign cloud servers or telemetry trackers required. Designed for complete offline autonomy.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0B1C33] border border-cyan-500/30 space-y-2">
              <span className="text-lg block font-bold text-white">🔐 {isAr ? 'بياناتك ملكك على جهازك' : 'Local Device Vault'}</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? 'تُحفظ جميع إنجازاتك وتقدمك التعليمي محلياً على هاتفك في الخزنة المحلية.' : 'All progression, flashcards, and SRS metrics remain securely in local browser IndexedDB storage.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0B1C33] border border-cyan-500/30 space-y-2">
              <span className="text-lg block font-bold text-white">🔑 {isAr ? 'مفتاحك الخاص (اختياري)' : 'Bring Your Own Key (BYOK)'}</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? 'ميزات الذكاء الاصطناعي اختيارية ومجانية عبر مفتاحك الخاص بدون أي تكاليف أو تتبع.' : 'Optional AI capabilities use your private Gemini key, stored locally without proxy retention.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Card */}
      <div className="bg-[var(--papyrus)] border-y border-[var(--line)] py-12">
        <CreatorCard isArabic={isAr} />
      </div>

      {/* ================= FINAL CTA ================= */}
      <section className="cta-final">
        <div className="el-container">
          <h2>{isAr ? 'جاهز تبدأ رحلتك؟' : 'Ready to start your journey?'}</h2>
          <p>{isAr ? 'ادخل عالم التفكير بالإنجليزي، من إسكندرية للمستقبل.' : 'Enter the world of thinking in English, from Alexandria to the future.'}</p>
          <button onClick={handleLaunchApp} className="btn btn-primary">
            {isAr ? 'يلا بينا' : 'Let\'s go'}
          </button>
        </div>
      </section>

      {/* ================= FOOTER (Constitution Compliant: AGPLv3 / CC BY-NC-SA 4.0 Protected) ================= */}
      <footer className="footer py-8 border-t border-[var(--line)] bg-[#070A0E] text-stone-400">
        <div className="el-container flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-stone-200">
              © {new Date().getFullYear()} Amr Sherif Abdelaal — {isAr ? 'فكّر إنجليزي' : 'Thinking Bridge'}
            </span>
            <span className="text-stone-600">|</span>
            <span className="text-emerald-400 font-semibold">GNU AGPLv3 / CC BY-NC-SA 4.0</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/blob/main/CONSTITUTION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition"
            >
              📜 {isAr ? 'دستور القناة' : 'Constitution'}
            </a>
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition"
            >
              💻 {isAr ? 'الكود المصدري (GitHub)' : 'Source Code'}
            </a>
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="hover:text-amber-300 transition cursor-pointer bg-transparent border-0 p-0 text-xs font-medium min-h-[48px] inline-flex items-center"
            >
              ☕ {isAr ? 'ادعم التطبيق' : 'Support the app'}
            </button>
          </div>
        </div>
      </footer>

      {/* Street Demo Modal */}
      <StreetDemoModal
        isOpen={streetDemoOpen}
        onClose={() => setStreetDemoOpen(false)}
        onLaunchFullApp={() => {
          setStreetDemoOpen(false);
          onLaunchApp();
        }}
        isArabic={isAr}
      />
      <SupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        isArabic={isAr}
      />
      {activateOpen && (
        <Suspense fallback={null}>
          <LazyActivateCodeModal
            isOpen={activateOpen}
            onClose={() => setActivateOpen(false)}
            isArabic={isAr}
          />
        </Suspense>
      )}
    </div>
  );
}