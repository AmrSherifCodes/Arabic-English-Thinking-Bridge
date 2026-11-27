import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Globe, Smartphone, RefreshCw, Apple, Laptop, ExternalLink, Brain, Sparkles, Terminal, Tv, Briefcase, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { getPlatformInfo, storageAdapter } from '../platform/adapter';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { CreatorCard } from './CreatorCard';
import { StreetDemoModal } from './StreetDemoModal';
import { SupportModal } from './SupportModal';
import { NewWordPopup } from './NewWordPopup';
import { triggerHapticImpact } from '../utils/fx';
import { setGuideMode } from '../utils/guideMode';
import './LandingPage.css';

interface LandingPageProps {
  onLaunchApp: () => void;
  isArabic?: boolean;
  returningLevel?: string | null;
}

export function LandingPage({ onLaunchApp, returningLevel = null }: LandingPageProps) {
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
  const [previewCollected, setPreviewCollected] = useState(false);

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
    <div
      className={`egyptian-landing ${isAr ? 'font-arabic' : 'font-sans-en'}`}
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ background: '#0B1120', color: '#F8FAFC' }}
    >
      {/* ================= NAV (Clean single-line EN & AR, zero collisions) ================= */}
      <header className="nav" style={{ background: 'rgba(11, 17, 32, 0.92)', borderBottomColor: 'rgba(148, 163, 184, 0.16)' }}>
        <div className="el-container nav-inner">
          <a
            href="#top"
            className="brand shrink-0"
            style={{ color: '#FFFFFF' }}
            aria-label={isAr ? 'جسر التفكير — الرئيسية' : 'Thinking Bridge — Home'}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="brand-mark" aria-hidden="true" style={{ background: '#10B981', color: '#0B1120' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17h18M5 17V9l7-5 7 5v8" />
                <path d="M9 17v-4a3 3 0 0 1 6 0v4" />
              </svg>
            </span>
            <span style={{ color: '#FFFFFF' }}>{isAr ? 'جسر التفكير' : 'Thinking Bridge'}</span>
          </a>

          <nav className="nav-desktop hidden lg:block">
            <ul className="nav-links" style={{ gap: '20px' }}>
              <li><a href="#why" className="whitespace-nowrap">{isAr ? 'المميزات' : 'Features'}</a></li>
              <li><a href="#how" className="whitespace-nowrap">{isAr ? 'إزاي بنشتغل' : 'How it works'}</a></li>
              <li><a href="#stats" className="whitespace-nowrap">{isAr ? 'الأرقام' : 'Stats'}</a></li>
              <li><a href="#download-section" className="whitespace-nowrap">{isAr ? 'التنزيل' : 'Download'}</a></li>
              <li><a href="#subscribe-section" className="whitespace-nowrap text-[#F59E0B] font-bold">{isAr ? 'الاشتراك' : 'Subscribe'}</a></li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextLang = isAr ? 'en' : 'ar';
                void i18n.changeLanguage(nextLang);
                setGuideMode(nextLang === 'en' ? 'english_guided' : 'egyptian_ar');
              }}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[40px] sm:min-h-[44px] min-w-[44px] rounded-2xl border border-[#22D3EE]/50 text-[#22D3EE] text-xs font-bold hover:bg-[#22D3EE] hover:text-[#0B1120] transition whitespace-nowrap shrink-0"
              aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
            >
              <Globe size={14} className="shrink-0" />
              <span className="sm:hidden">{isAr ? 'EN' : 'AR'}</span>
              <span className="hidden sm:inline">{isAr ? 'English' : 'عربي'}</span>
            </button>
            <button
              type="button"
              onClick={handleLaunchApp}
              className="px-3.5 sm:px-5 py-2 min-h-[40px] sm:min-h-[44px] rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 cursor-pointer tb-btn-3d tb-btn-emerald"
            >
              {isAr ? 'ابدأ مجاناً' : 'Start Free'}
            </button>
          </div>
        </div>
      </header>

      {/* ================= 1-SCREEN INTERACTIVE HERO ================= */}
      <section className="hero" style={{ background: '#0B1120', minHeight: 'min(88dvh, 760px)' }}>
        <div className="el-container hero-inner" style={{ paddingBlock: 'clamp(32px, 5vh, 64px)' }}>
          <div className="hero-grid">
            {/* Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="hero-copy text-start space-y-4 sm:space-y-5 min-w-0"
            >
              {returningLevel && (
                <button
                  type="button"
                  data-testid="landing-continue-returning-btn"
                  onClick={handleLaunchApp}
                  className="w-full sm:w-auto px-5 py-3 min-h-[52px] rounded-2xl border-2 border-[#22D3EE] bg-[#22D3EE]/15 text-[#F8FAFC] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
                >
                  <span>🚀</span>
                  <span>
                    {isAr
                      ? `كمّل من مكان ما وقفت (المستوى ${returningLevel})`
                      : `Continue Where You Left Off (Level ${returningLevel})`}
                  </span>
                  <ArrowRight size={16} className={isAr ? 'rotate-180' : ''} />
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/45 text-[#10B981] text-xs font-black">
                  <ShieldCheck size={15} />
                  <span>{isAr ? 'Anki + Duolingo + تحدي السفر 21 يوم · مجاني 100% وأوفلاين' : 'Anki + Duolingo + 21-Day Travel Immersion — 100% Free & Offline'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/45 text-[#FBBF24] text-xs font-black">
                  <Sparkles size={15} />
                  <span>{isAr ? 'إصدار v10.2 · Pre-A0 → C1' : 'v10.2 · Pre-A0 → C1'}</span>
                </div>
              </div>

              <h1 className="leading-tight" style={{ color: '#FFFFFF' }}>
                {isAr ? 'فكّر بالإنجليزي،' : 'Think in English,'}<br />
                <span style={{ color: '#22D3EE' }}>{isAr ? 'مش تترجم.' : "don't translate."}</span>
              </h1>

              <p className="text-[#CBD5E1] font-medium text-base sm:text-lg leading-relaxed max-w-xl">
                {isAr
                  ? 'أفضل 5 لغات عالمية من Pre-A0 حتى C1 + تحدي السفر في 21 يوم. اضغط على الكلمة أمامك وجرّب النطق وبنك الكلمات فوراً!'
                  : 'Top 5 global languages from Pre-A0 to C1 + 21-Day Travel Sprint. Tap the live card to hear audio and collect your first word instantly!'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  data-testid="landing-start-learning-btn"
                  onClick={handleLaunchApp}
                  className="px-6 py-3.5 min-h-[54px] rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald w-full sm:w-auto"
                >
                  <span>{isAr ? 'ابدأ التعلم الآن 🚀' : 'Start Learning Now 🚀'}</span>
                  <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
                </button>
                {!Capacitor.isNativePlatform() && (
                  <a
                    href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v10.0.0/ThinkingBridge-v10.0.0.apk"
                    download="ThinkingBridge-v10.0.0.apk"
                    className="px-5 py-3.5 min-h-[54px] rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-gold w-full sm:w-auto"
                  >
                    <Download size={18} />
                    <span>{isAr ? 'تحميل تطبيق الأندرويد (APK)' : 'Download Android App (APK)'}</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Hero Right Column: Live Mini New-Word Pop-Up Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
              className="hero-mockup flex flex-col items-center justify-center gap-3"
            >
              <NewWordPopup
                word="actually"
                translationAr="في الحقيقة / بصراحة"
                egyptianHook={
                  isAr
                    ? 'بتستخدمها زي "بصراحة" أو "في الحقيقة" لما تصحح فكرة بلطف.'
                    : 'Use it naturally to clarify or gently correct an idea.'
                }
                isArabic={isAr}
                compact
                onCollect={() => {
                  setPreviewCollected(true);
                  window.setTimeout(() => handleLaunchApp(), 450);
                }}
              />
              {previewCollected && (
                <p className="text-xs font-black text-[#10B981]">
                  {isAr ? '🚀 ممتاز! بنفتحلك أول درس دلوقتي...' : '🚀 Awesome! Launching your first lesson...'}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="section why" id="why" style={{ background: '#0B1120' }}>
        <div className="el-container">
          <span className="eyebrow">{isAr ? 'ليه جسر التفكير؟' : 'Why Thinking Bridge?'}</span>
          <h2 className="h2" style={{ color: '#FFFFFF' }}>
            {isAr ? 'مش مجرد كورس إنجليزي.' : 'Not just an English course.'}<br />
            {isAr ? 'طريقة تفكير جديدة.' : 'A new way of thinking.'}
          </h2>
          <p className="lede" style={{ color: '#CBD5E1' }}>
            {isAr
              ? 'بنشتغل على العقل العربي من جوّه. كل درس مبني على أمثلة من الحياة اليومية، بمنطق واضح.'
              : 'Built for the native mind. Every lesson is based on daily life examples, using clear structural logic.'}
          </p>

          <div className="cards-grid">
            <article className="feature-card" style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <div className="feature-icon" aria-hidden="true" style={{ background: '#10B981', color: '#0B1120' }}>
                <Brain size={30} />
              </div>
              <h3 style={{ color: '#FFFFFF' }}>{isAr ? 'بتفكر بالعربي' : 'Think Native'}</h3>
              <p style={{ color: '#CBD5E1' }}>{isAr ? 'بنشرح المفاهيم بعقلك المصري، مش بترجمة حرفية من الإنجليزي. الفهم من الأول.' : 'Concepts explained using your native logic, avoiding word-by-word translation.'}</p>
            </article>

            <article className="feature-card" style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <div className="feature-icon" aria-hidden="true" style={{ background: '#F59E0B', color: '#0B1120' }}>
                <Smartphone size={30} />
              </div>
              <h3 style={{ color: '#FFFFFF' }}>{isAr ? 'لعب بيد واحدة' : 'One-Handed Play'}</h3>
              <p style={{ color: '#CBD5E1' }}>{isAr ? 'أزرار كبيرة ومريحة في منطقة الإبهام مع بنك كلمات شخصي وكومبو ممتع.' : 'Chunky thumb-zone 3D buttons, personal Word Bank, and zero-punishment combo streaks.'}</p>
            </article>

            <article className="feature-card" style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <div className="feature-icon" aria-hidden="true" style={{ background: '#22D3EE', color: '#0B1120' }}>
                <RefreshCw size={30} />
              </div>
              <h3 style={{ color: '#FFFFFF' }}>{isAr ? 'مجاني 100% بدون نت' : '100% Free & Offline'}</h3>
              <p style={{ color: '#CBD5E1' }}>{isAr ? 'بدون اشتراكات وبدون إعلانات وبدون نت. اتعلم في المترو أو في أي مكان.' : 'Zero paywalls, zero ads, works completely offline on Android, desktop, and web.'}</p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section how" id="how" style={{ background: '#0F172A' }}>
        <div className="el-container">
          <span className="eyebrow">{isAr ? 'إزاي بنشتغل' : 'How it works'}</span>
          <h2 className="h2" style={{ color: '#FFFFFF' }}>{isAr ? '3 خطوات وتبدأ تتكلم بثقة' : '3 steps to speak with confidence'}</h2>
          <p className="lede" style={{ color: '#CBD5E1' }}>
            {isAr ? 'من غير تعقيد، ومن غير ما تحس إنك بتدرس. اختار، اتدرب، اتكلم.' : 'No complications. Pick, practice, and speak freely.'}
          </p>

          <div className="steps">
            <div className="step" style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <h3 style={{ color: '#FFFFFF' }}>{isAr ? 'افهم التركيب' : 'Structural Mapping'}</h3>
              <p style={{ color: '#CBD5E1' }}>{isAr ? 'كل كلمة جديدة بتظهرلك في بطاقة ذهبية مع النطق والتركيب المنطقي بتاعها.' : 'Every new word pops up in a warm amber-gold card with audio and clear structural logic.'}</p>
            </div>
            <div className="step" style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <h3 style={{ color: '#FFFFFF' }}>{isAr ? 'اتدرب بيد واحدة' : 'Thumb-Zone Practice'}</h3>
              <p style={{ color: '#CBD5E1' }}>{isAr ? 'تمارين سريعة وممتعة بدون عقاب قلوب، بتبني عندك سرعة التفكير المباشر.' : 'Fast, punchy thumb-zone drills with zero punishing hearts—pure flow and combo streaks.'}</p>
            </div>
            <div className="step" style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <h3 style={{ color: '#FFFFFF' }}>{isAr ? 'مراجعة ذكية SM-2' : 'Daily SM-2 Review'}</h3>
              <p style={{ color: '#CBD5E1' }}>{isAr ? 'بنك كلماتك الشخصي بيفكرك بالكلمات قبل ما تنساها عشان تثبت للأبد.' : 'Your personal Word Bank and SM-2 spaced repetition keep every word locked in memory.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="stats" id="stats" style={{ background: '#0B1120', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
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
      <section id="download-section" className="section border-b" style={{ background: '#0F172A', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
        <div className="el-container text-center space-y-8">
          <div>
            <h2 className="h2 mb-2" style={{ color: '#FFFFFF' }}>{t('landing2.download_for_your_device')}</h2>
            <p className="lede mx-auto" style={{ color: '#CBD5E1' }}>{t('landing2.works_natively_across_all_plat')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            <div className={`download-card ${detectedOs === 'android' ? 'highlight' : ''}`} style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <Smartphone size={32} className="text-[#10B981]" />
              <div className="mb-4 text-center">
                <span className="font-bold text-lg block text-[#F8FAFC]">Android</span>
                <span className="text-sm text-[#CBD5E1] block">V10 (v10.0.0) · Offline APK</span>
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
                    href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v10.0.0/ThinkingBridge-v10.0.0.apk"
                    download="ThinkingBridge-v10.0.0.apk"
                    className="w-full mt-1 py-2.5 px-3 rounded-2xl text-xs font-black text-center block tb-btn-3d tb-btn-gold"
                  >
                    <span>{isAr ? 'تحميل APK (V10.0.0)' : 'Download APK (V10.0.0)'}</span>
                  </a>
                  <a
                    href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v10.0.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#22D3EE] underline text-center w-full block mt-2"
                  >
                    {isAr ? 'صفحة الإصدار (GitHub v10.0.0)' : 'Release Notes (GitHub v10.0.0)'}
                  </a>
                </>
              )}
            </div>

            {!Capacitor.isNativePlatform() && detectedOs !== 'android' && (
              <div className={`download-card ${detectedOs === 'ios' ? 'highlight' : ''}`} style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
                <Apple size={32} className="text-[#22D3EE]" />
                <div className="mb-4 text-center">
                  <span className="font-bold text-lg block text-[#F8FAFC]">iOS / iPhone</span>
                  <span className="text-sm text-[#CBD5E1] block">PWA / Web App</span>
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
                  <p className="text-xs text-[#CBD5E1] mt-2">{t('landing2.in_safari__tap_share__then_cho')}</p>
                )}
              </div>
            )}

            <div className={`download-card ${detectedOs === 'windows' ? 'highlight' : ''}`} style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <Laptop size={32} className="text-[#22D3EE]" />
              <div className="mb-4 text-center">
                <span className="font-bold text-lg block text-[#F8FAFC]">Windows</span>
                <span className="text-sm text-[#CBD5E1] block">PWA / Desktop</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onLaunchApp()}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                <Globe size={16} />
                <span>{isInstallable ? (t('landing2.install_pwa')) : (t('landing2.open_web_app'))}</span>
              </button>
            </div>

            <div className={`download-card ${detectedOs === 'mac' ? 'highlight' : ''}`} style={{ background: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
              <Apple size={32} className="text-[#22D3EE]" />
              <div className="mb-4 text-center">
                <span className="font-bold text-lg block text-[#F8FAFC]">macOS</span>
                <span className="text-sm text-[#CBD5E1] block">PWA / Desktop</span>
              </div>
              <button
                onClick={() => isInstallable ? void triggerInstall() : onLaunchApp()}
                className="btn btn-primary btn-sm w-full mb-2"
              >
                <Globe size={16} />
                <span>{isInstallable ? (t('landing2.install_pwa')) : (t('landing2.open_web_app'))}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUBSCRIBE SECTION ================= */}
      <section className="subscribe-section" id="subscribe-section" ref={easterEggRef} style={{ background: '#0B1120' }}>
        <div className="el-container">
          <h2 className="h2" style={{ color: '#FFFFFF' }}>{t('landing2.subscribe_for_updates___secret')}</h2>
          <p className="lede mx-auto" style={{ color: '#CBD5E1' }}>
            {isAr ? 'سجل دلوقتي لمتابعة التحديثات وفتح الخزنة السرية للأدوات المتقدمة!' : 'Subscribe for updates and unlock the secret power tools vault!'}
          </p>
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
          {subMessage && (
            <p className="mt-4 font-bold text-[#22D3EE]">{subMessage}</p>
          )}

          {subscribed && (
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#131C31] border-2 border-[#22D3EE]/50 shadow-2xl text-start text-white space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#22D3EE]" size={24} />
                  <h3 className="font-black text-lg sm:text-xl text-[#F8FAFC]">
                    {isAr ? '🔓 تم فتح الخزنة السرية للأدوات المتقدمة!' : '🔓 Secret Feature Vault Unlocked!'}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-700/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs mb-1"><Terminal size={16} /><span>{isAr ? 'بيئة الطرفية' : 'Hacker Terminal'}</span></div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'الطرفية التفاعلية' : 'Terminal Mode'}</h4>
                  </div>
                  <button onClick={onLaunchApp} className="w-full min-h-[44px] py-2 rounded-xl bg-[#10B981] text-[#0B1120] font-black text-xs cursor-pointer">
                    {isAr ? 'تشغيل الطرفية ⚡' : 'Launch Terminal ⚡'}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-700/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#22D3EE] font-bold text-xs mb-1"><Tv size={16} /><span>{isAr ? 'الفصل الدراسي' : 'Teacher View'}</span></div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'وضع البروجيكتور' : 'Classroom Mode'}</h4>
                  </div>
                  <a href="/teacher" className="w-full min-h-[44px] py-2 rounded-xl bg-[#22D3EE] text-[#0B1120] font-black text-xs text-center flex items-center justify-center">
                    {isAr ? 'فتح وضع المعلم 🏫' : 'Open Teacher Mode 🏫'}
                  </a>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-700/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs mb-1"><Briefcase size={16} /><span>{isAr ? 'بيئة العمل / الشركات' : 'Corporate Bridge'}</span></div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'مترجم الشركات' : 'Executive Tone'}</h4>
                  </div>
                  <button onClick={onLaunchApp} className="w-full min-h-[44px] py-2 rounded-xl bg-[#F59E0B] text-[#0B1120] font-black text-xs cursor-pointer">
                    {isAr ? 'فتح المترجم 💼' : 'Launch Corporate 💼'}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-700/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs mb-1"><Cpu size={16} /><span>{isAr ? 'الذكاء الاصطناعي' : 'AI Agent'}</span></div>
                    <h4 className="font-bold text-sm text-white">{isAr ? 'معمل العميل المستقل' : 'Autonomous Agent'}</h4>
                  </div>
                  <a href="/api/agent" target="_blank" rel="noopener noreferrer" className="w-full min-h-[44px] py-2 rounded-xl bg-[#10B981] text-[#0B1120] font-black text-xs text-center flex items-center justify-center">
                    {isAr ? 'معاينة العميل 🤖' : 'View AI Agent 🤖'}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Creator Card */}
      <div className="border-y py-12" style={{ background: '#0F172A', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
        <CreatorCard isArabic={isAr} />
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="footer py-8 border-t text-[#CBD5E1]" style={{ background: '#05070B', borderColor: 'rgba(148, 163, 184, 0.16)' }}>
        <div className="el-container space-y-5">
          {/* Tasteful @sciamrsherif YouTube Discovery Card */}
          <a
            href="https://youtube.com/@sciamrsherif"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="landing-youtube-card"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition hover:border-rose-400/70"
            style={{ backgroundColor: '#131C31', borderColor: 'rgba(244, 63, 94, 0.35)' }}
          >
            <div className="text-start space-y-0.5">
              <div className="text-sm font-black text-[#F8FAFC]">
                {isAr
                  ? 'صُمم بواسطة عمرو شريف · شاهد الشروحات على يوتيوب (@sciamrsherif) ▶️'
                  : 'Built by Amr Sherif · Watch Tutorials on YouTube (@sciamrsherif) ▶️'}
              </div>
              <div className="text-xs text-[#CBD5E1]">
                {isAr
                  ? 'دروس عملية ومجانية لتعلم اللغات والتفكير المباشر بدون ترجمة حرفية'
                  : 'Practical language tutorials, science & engineering — youtube.com/@sciamrsherif'}
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black shrink-0">
              youtube.com/@sciamrsherif
            </span>
          </a>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-[#F8FAFC]">
                © {new Date().getFullYear()} Amr Sherif Abdelaal — {isAr ? 'جسر التفكير' : 'Thinking Bridge'}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[#10B981] font-semibold">GNU AGPLv3 / CC BY-NC-SA 4.0</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/blob/main/CONSTITUTION.md"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10B981] transition"
              >
                📜 {isAr ? 'دستور القناة' : 'Constitution'}
              </a>
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10B981] transition"
              >
                💻 {isAr ? 'الكود المصدري (GitHub)' : 'Source Code'}
              </a>
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="hover:text-[#FBBF24] transition cursor-pointer bg-transparent border-0 p-0 text-xs font-medium min-h-[44px] inline-flex items-center"
              >
                ☕ {isAr ? 'ادعم التطبيق' : 'Support the app'}
              </button>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
