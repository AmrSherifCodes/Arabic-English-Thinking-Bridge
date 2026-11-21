import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Globe, BookOpen, Smartphone, RefreshCw, Apple, Laptop, ExternalLink, Brain, Sparkles, Terminal, Tv, Briefcase, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { getPlatformInfo, storageAdapter } from '../platform/adapter';
import { API_BASE_URL } from '../utils/api';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { CreatorCard } from './CreatorCard';
import { LandingPhoneMockup } from './LandingPhoneMockup';
import { StreetDemoModal } from './StreetDemoModal';
import { triggerHapticImpact } from '../utils/fx';
import './LandingPage.css';

interface LandingPageProps {
  onLaunchApp: () => void;
  isArabic?: boolean;
}

export function LandingPage({ onLaunchApp, isArabic = false }: LandingPageProps) {
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
          <a href="#" className="brand" aria-label="جسر التفكير — الرئيسية">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17h18M5 17V9l7-5 7 5v8"/>
                <path d="M9 17v-4a3 3 0 0 1 6 0v4"/>
              </svg>
            </span>
            <span>{isAr ? 'جسر التفكير' : 'Thinking Bridge'}</span>
          </a>

          <nav>
            <ul className="nav-links">
              <li><a href="#why">{isAr ? 'المميزات' : 'Features'}</a></li>
              <li><a href="#how">{isAr ? 'إزاي بنشتغل' : 'How it works'}</a></li>
              <li><a href="#stats">{isAr ? 'الأرقام' : 'Stats'}</a></li>
              <li><a href="#download-section">{isAr ? 'التنزيل' : 'Download'}</a></li>
              <li><a href="#subscribe-section" className="text-[var(--gold)] font-bold">{isAr ? 'الاشتراك' : 'Subscribe'}</a></li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHapticImpact();
                setStreetDemoOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer"
            >
              <Zap size={14} className="text-emerald-400" />
              <span>{isAr ? 'عرض الشارع 🚶‍♂️' : 'Street Mode 🚶‍♂️'}</span>
            </button>
            <button
              onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--nile)] text-[var(--nile)] text-xs font-bold hover:bg-[var(--nile)] hover:text-white transition"
              aria-label={t('landing2.switch_to_arabic')}
            >
              <Globe size={14} />
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>
            <button onClick={handleLaunchApp} className="btn btn-primary btn-sm">
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
              initial={{ opacity: 0, x: isAr ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="hero-copy text-start space-y-6"
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
                {isAr ? 'اتعلم إنجليزي' : 'Learn English'}<br/>
                <span className="accent">{isAr ? 'بعقلك المصري' : 'with your native mind'}</span><br/>
                {isAr ? '— مش بترجمة حرفية' : '— no literal translation'}
              </h1>

              <p className="text-slate-100 font-semibold text-lg leading-relaxed">
                {isAr
                  ? 'بطل تترجم الكلمة بكلمتها فدماغك. هنا هنفهمك تركيب الجملة بالإنجليزي بطريقة منطقية عشان تتكلم بطلاقة وعلى طبيعتك، من قلب إسكندرية للمصريين كلهم.'
                  : 'Stop translating word-for-word in your head. Grasp the logical structure of English to speak fluently and naturally, straight from Alexandria to the world.'}
              </p>

              <div className="hero-cta flex-wrap">
                <button onClick={handleLaunchApp} className="btn btn-gold">
                  {isAr ? 'ابدأ رحلتك مجاناً' : 'Start your journey for free'}
                  <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
                </button>
                <a
                  href="/exam"
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof window !== 'undefined' && window.history) {
                      window.history.pushState({}, '', '/exam');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="btn bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition flex items-center gap-2 cursor-pointer font-bold"
                >
                  <span>☕ {isAr ? 'اختبار يا باشا (اعرف مستواك)' : 'Ya Basha CEFR Exam'}</span>
                </a>
                <button
                  onClick={() => {
                    triggerHapticImpact();
                    setStreetDemoOpen(true);
                  }}
                  className="btn bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition flex items-center gap-2 cursor-pointer font-bold"
                >
                  <Zap size={18} className="text-emerald-400" />
                  <span>{isAr ? 'جرب عرض الشارع 🚶‍♂️' : 'Street Presentation 🚶‍♂️'}</span>
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

      {/* ================= WHY ================= */}
      <section className="section why" id="why">
        <div className="el-container">
          <span className="eyebrow">{isAr ? 'ليه جسر التفكير؟' : 'Why Thinking Bridge?'}</span>
          <h2 className="h2">{isAr ? 'مش مجرد كورس إنجليزي.' : 'Not just an English course.'}<br/>{isAr ? 'طريقة تفكير جديدة.' : 'A new way of thinking.'}</h2>
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
                <span className="text-sm text-[var(--ink-soft)] block">v4.4.1 Stable · 112 MB APK</span>
              </div>
              <a
                href="/app"
                onClick={(event) => { event.preventDefault(); onLaunchApp(); }}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                <ArrowRight size={16} />
                <span>{t('landing2.launch_app___')}</span>
              </a>
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.4.1/ThinkingBridge-v4.4.1.apk"
                download="Thinking-Bridge-v1.0.0-stable.apk"
                className="btn btn-gold btn-sm w-full mt-1"
              >
                <span>{isAr ? 'تحميل APK (v4.4.1 · 112 MB)' : 'Download APK (v4.4.1 · 112 MB)'}</span>
              </a>
            </div>

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
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.4.1/ThinkingBridge-v4.4.1.apk" className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2">
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
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.4.1/ThinkingBridge-v4.4.1.apk" className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2">
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
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
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
                  <button onClick={onLaunchApp} className="w-full py-2 rounded-xl bg-green-500 text-stone-950 font-bold text-xs hover:bg-green-400 transition">
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
                  <a href="/teacher" className="w-full py-2 rounded-xl bg-indigo-500 text-stone-950 font-bold text-xs text-center block hover:bg-indigo-400 transition">
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
                  <button onClick={onLaunchApp} className="w-full py-2 rounded-xl bg-blue-500 text-stone-950 font-bold text-xs hover:bg-blue-400 transition">
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
                  <a href="/api/agent" target="_blank" rel="noopener noreferrer" className="w-full py-2 rounded-xl bg-teal-500 text-stone-950 font-bold text-xs text-center block hover:bg-teal-400 transition">
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
              <span className="text-lg block font-bold text-white">🔑 {isAr ? 'مفتاحك الخاص (BYOK)' : 'Bring Your Own Key (BYOK)'}</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? 'ميزات الذكاء الاصطناعي اختيارية ومجانية عبر مفتاحك الخاص بدون أي تكاليف أو تتبع.' : 'Optional AI capabilities use your private Gemini key, stored locally without proxy retention.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Card */}
      <div className="bg-[var(--papyrus)] border-y border-[var(--line)] py-12">
        <CreatorCard />
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
    </div>
  );
}