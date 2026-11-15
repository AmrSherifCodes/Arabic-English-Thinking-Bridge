import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Download, Globe, BookOpen, Smartphone, RefreshCw, Apple, Laptop, ExternalLink, Brain, Sparkles, Terminal, Tv, Briefcase, Cpu, ShieldCheck } from 'lucide-react';
import { getPlatformInfo, storageAdapter } from '../platform/adapter';
import { API_BASE_URL } from '../utils/api';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { CreatorCard } from './CreatorCard';
import { LandingPhoneMockup } from './LandingPhoneMockup';
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
          <div className="hero-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
            </svg>
            <span>{isAr ? 'منصة إسكندرانية — بتكلمك بجدعنة' : 'Alexandrian Platform — Straight to the point'}</span>
          </div>

          <h1>
            {isAr ? 'اتعلم إنجليزي' : 'Learn English'}<br/>
            <span className="accent">{isAr ? 'بعقلك المصري' : 'with your native mind'}</span><br/>
            {isAr ? '— مش بترجمة حرفية' : '— no literal translation'}
          </h1>

          <p>
            {isAr
              ? 'بطل تترجم الكلمة بكلمتها فدماغك. هنا هنفهمك تركيب الجملة بالإنجليزي بطريقة منطقية عشان تتكلم بطلاقة وعلى طبيعتك، من قلب إسكندرية للمصريين كلهم.'
              : 'Stop translating word-for-word in your head. Grasp the logical structure of English to speak fluently and naturally, straight from Alexandria to the world.'}
          </p>

          <div className="hero-cta">
            <button onClick={handleLaunchApp} className="btn btn-gold">
              {isAr ? 'ابدأ رحلتك مجاناً' : 'Start your journey for free'}
              <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
            </button>
            <a href="#how" className="btn btn-ghost" style={{ color: 'var(--sand-light)', borderColor: 'var(--sand-light)' }}>
              {isAr ? 'شوف إزاي بنشتغل' : 'See how it works'}
            </a>
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
                <span className="text-sm text-[var(--ink-soft)] block">v1.1.0-unofficial.1 · APK</span>
              </div>
              <a
                href={isNativeAndroid ? '/app' : 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v1.1.0-unofficial.1/Thinking-Bridge-v1.1.0-unofficial.1.apk'}
                target={isNativeAndroid ? undefined : "_blank"}
                rel={isNativeAndroid ? undefined : "noopener noreferrer"}
                onClick={isNativeAndroid ? (event) => { event.preventDefault(); onLaunchApp(); } : undefined}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                {isNativeAndroid ? <ArrowRight size={16} /> : <Download size={16} />}
                <span>{isNativeAndroid ? (t('landing2.launch_app___')) : (t('landing2.download_apk'))}</span>
              </a>
              {isInstallable && (
                <button type="button" onClick={() => void triggerInstall()} className="text-xs font-bold text-[var(--nile)] underline text-center w-full block">
                  {t('landing2.install_web_app')}
                </button>
              )}
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
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest" className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2">
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
              <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest" className="text-xs font-bold text-[var(--nile)] underline text-center w-full block mt-2">
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
          <p className="lede mx-auto">{isAr ? 'سجل دلوقتي وفعّل حسابك في دقيقة واحدة. أول درس مجاني بالكامل.' : 'Sign up now and activate your account in a minute. Your first lesson is completely free.'}</p>
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
        </div>
      </section>

      {/* ================= TRUST & PRIVACY SECTION ================= */}
      <section className="py-12 bg-[var(--papyrus)] border-t border-[var(--line)]">
        <div className="el-container max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-xl font-bold text-[var(--navy)]">
            {isAr ? '🛡️ معيار السيادة الرقمية والخصوصية المطلقة' : '🛡️ Digital Sovereignty & Absolute Privacy Standard'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            <div className="p-5 rounded-2xl bg-white/80 border border-[var(--line)] space-y-2">
              <span className="text-lg block font-bold text-[var(--navy)]">⚡ {isAr ? 'عملية 100% بدون إنترنت' : '100% Offline Architecture'}</span>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                {isAr ? 'يعمل التطبيق بالكامل بدون حاجة لاتصال بالإنترنت، وبدون سيرفرات خارجية تتبع بياناتك.' : 'Zero foreign cloud servers or telemetry trackers required. Designed for complete offline autonomy.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/80 border border-[var(--line)] space-y-2">
              <span className="text-lg block font-bold text-[var(--navy)]">🔐 {isAr ? 'بياناتك ملكك على جهازك' : 'Local Device Vault'}</span>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                {isAr ? 'تُحفظ جميع إنجازاتك وتقدمك التعليمي محلياً على هاتفك في الخزنة المحلية.' : 'All progression, flashcards, and SRS metrics remain securely in local browser IndexedDB storage.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/80 border border-[var(--line)] space-y-2">
              <span className="text-lg block font-bold text-[var(--navy)]">🔑 {isAr ? 'مفتاحك الخاص (BYOK)' : 'Bring Your Own Key (BYOK)'}</span>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
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

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="el-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="brand">
                <span className="brand-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17h18M5 17V9l7-5 7 5v8"/>
                    <path d="M9 17v-4a3 3 0 0 1 6 0v4"/>
                  </svg>
                </span>
                <span>{isAr ? 'جسر التفكير' : 'Thinking Bridge'}</span>
              </a>
              <p>{isAr ? 'منصة تعليمية مصرية بتحترم عقلك ولغتك. عربي أولاً، إنجليزي تاني. من إسكندرية، بحب.' : 'An Egyptian educational platform that respects your mind and native tongue. From Alexandria, with love.'}</p>
            </div>

            <div>
              <h4>{isAr ? 'المنصة' : 'Platform'}</h4>
              <ul>
                <li><a href="#why">{isAr ? 'المميزات' : 'Features'}</a></li>
                <li><a href="#how">{isAr ? 'إزاي بنشتغل' : 'How it works'}</a></li>
                <li><a href="#stats">{isAr ? 'الأرقام' : 'Stats'}</a></li>
              </ul>
            </div>

            <div>
              <h4>{isAr ? 'تواصل' : 'Connect'}</h4>
              <ul>
                <li><a href="mailto:amrsherifwork@gmail.com">amrsherifwork@gmail.com</a></li>
                <li><a href="https://linkedin.com/in/sciamrsherif-abdelaal" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://youtube.com/@SciAmrSherif" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} {isAr ? 'جسر التفكير' : 'Thinking Bridge'}. {t('landing2.made_in_alexandria__egypt')} 🇪🇬
          </div>
        </div>
      </footer>
    </div>
  );
}