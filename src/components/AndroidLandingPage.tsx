import { useEffect, useState } from 'react';
import {
  WifiOff,
  LockKeyhole,
  Sparkles,
  Mic2,
  Globe,
  Github,
  Smartphone,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Laptop
} from 'lucide-react';
import { CreatorCard } from './CreatorCard';
import { LandingPhoneMockup } from './LandingPhoneMockup';
import './android-landing-page.css';

const WEB_APP_URL = '/app';
const GITHUB_URL = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge';
const APK_URL = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.4.0/Thinking-Bridge-v1.0.0-stable.apk';
const X_URL = 'https://x.com/SciAmrSherif';

const FEATURES = [
  {
    icon: WifiOff,
    title: 'يعمل 100% بدون إنترنت',
    subtitle: '100% Offline Autonomy',
    description: 'جميع الدروس والبطاقات المعرفية والمعاجم تعمل بدون اتصال بالإنترنت نهائياً على هاتف الأندرويد الخاص بك.',
    badge: 'بدون شبكة 📶',
  },
  {
    icon: LockKeyhole,
    title: 'خصوصيتك محفوظة 100%',
    subtitle: 'Private & Local Vault',
    description: 'لا تتبع، لا إعلانات، ولا حسابات إجبارية. تقدمك ومستواك يُحفظ محلياً على هاتفك فقط.',
    badge: 'خصوصية كاملة 🔒',
  },
  {
    icon: Sparkles,
    title: 'مجاني ومفتوح المصدر',
    subtitle: '100% Free & Open Source',
    description: 'مشروع غير تجاري برخصة (AGPLv3) حرة. بدون رسوم مخفية، بدون إعلانات، وبدون اشتراكات.',
    badge: 'مفتوح المصدر 📜',
  },
  {
    icon: Mic2,
    title: 'تمارين نطق وبناء معرفي',
    subtitle: 'Cognitive Sentence Practice',
    description: 'تدرب على تركيب الجمل مباشرة بالمنطق الإنجليزي وتغلب على معضلة الترجمة الحرفية.',
    badge: 'تفاعل فوري ⚡',
  },
];

const QUICK_SPECS = [
  { label: 'إصدار الأندرويد', value: 'Android 8.0+' },
  { label: 'حجم التطبيق', value: '106 MB' },
  { label: 'استهلاك البيانات', value: '0 MB' },
  { label: 'التراخيص', value: 'AGPLv3 / CC BY-NC-SA' },
];

export function AndroidLandingPage() {
  const [showStickyDownload, setShowStickyDownload] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setShowStickyDownload(window.scrollY > 280);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  return (
    <main className="android-landing" aria-labelledby="android-hero-title" dir="rtl">
      {/* ===== HEADER ===== */}
      <header className="android-header">
        <a className="android-brand" href="/" aria-label="جسر التفكير — الرئيسية">
          <span className="android-brand-mark" aria-hidden="true">🧠</span>
          <div className="android-brand-text">
            <span className="android-brand-name">Thinking Bridge</span>
            <span className="android-brand-tag">Android Edition</span>
          </div>
        </a>

        <div className="android-header-actions">
          <a
            className="android-header-btn android-header-btn-ghost"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="المصدر على GitHub"
          >
            <Github size={16} aria-hidden="true" />
            <span className="android-hide-mobile">GitHub</span>
          </a>
          <a
            className="android-header-btn android-header-btn-primary"
            href={WEB_APP_URL}
            aria-label="تشغيل التطبيق"
          >
            <Globe size={15} aria-hidden="true" />
            <span>ابدأ الآن</span>
          </a>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="android-hero">
        <div className="android-hero-copy">
          <div className="android-badges-row">
            <span className="android-badge android-badge-green">
              <Zap size={13} aria-hidden="true" />
              <span>أندرويد · Android</span>
            </span>
            <span className="android-badge android-badge-outline">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>مجاني 100% · بدون إعلانات</span>
            </span>
          </div>

          <h1 id="android-hero-title">
            فكّر بالإنجليزي، <br />
            <span className="android-title-accent">مش تترجم.</span>
          </h1>

          <p className="android-subtitle">
            المنصة المعرفية الأقوى لمساعدة العقل العربي على التفكير بالإنجليزية مباشرة وتجاوز الترجمة الحرفية — مصممة لتعمل 100% بدون إنترنت على هاتفك.
          </p>

          {/* Clean Vertical CTAs */}
          <div className="android-cta-group">
            <a
              className="android-btn android-btn-primary"
              href={WEB_APP_URL}
              aria-label="تشغيل التطبيق المباشر مجاناً"
            >
              <Zap size={20} aria-hidden="true" />
              <span>ابدأ الآن مجاناً — Start Now</span>
              <ArrowRight size={18} className="android-arrow-rtl" aria-hidden="true" />
            </a>

            <a
              className="android-btn android-btn-secondary"
              href={APK_URL}
              download="Thinking-Bridge-v1.0.0-stable.apk"
              aria-label="تحميل تطبيق الأندرويد المباشر APK"
            >
              <Download size={18} aria-hidden="true" />
              <span>تحميل تطبيق APK (v4.4.0 · 106 MB)</span>
            </a>
          </div>

          <div className="android-hero-meta">
            <span><CheckCircle2 size={13} className="android-icon-green" /> يعمل فوراً بدون تثبيت (PWA)</span>
            <span><CheckCircle2 size={13} className="android-icon-green" /> ملف APK مباشر للأندرويد</span>
          </div>
        </div>

        {/* Live Interactive Phone Demo (Portrait Optimized) */}
        <div className="android-device-wrap" aria-label="معاينة حية لتطبيق جسر التفكير للأندرويد">
          <LandingPhoneMockup isArabic={true} />
        </div>
      </section>

      {/* ===== QUICK SPECS BAR ===== */}
      <section className="android-specs-bar" aria-label="مواصفات تطبيق الأندرويد">
        <div className="android-specs-grid">
          {QUICK_SPECS.map((spec) => (
            <div className="android-spec-item" key={spec.label}>
              <span className="android-spec-label">{spec.label}</span>
              <span className="android-spec-value">{spec.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="android-features" aria-labelledby="android-features-title">
        <div className="android-section-heading">
          <span className="android-eyebrow">مميزات منصة الأندرويد</span>
          <h2 id="android-features-title">تعلم حقيقي، من غير تشتيت</h2>
          <p className="android-section-desc">
            تم تصميم كل جزئية في التطبيق لتناسب الهاتف المحمول، مع تركيز تام على التفكير البنيوي السريع.
          </p>
        </div>

        <div className="android-feature-grid">
          {FEATURES.map(({ icon: Icon, title, subtitle, description, badge }) => (
            <article className="android-feature-card" key={title}>
              <div className="android-feature-card-header">
                <span className="android-feature-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="android-feature-pill">{badge}</span>
              </div>
              <h3>{title}</h3>
              <span className="android-feature-sub">{subtitle}</span>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ===== CREATOR PRESENTATION ===== */}
      <section className="android-creator-wrapper" aria-label="صانع المشروع">
        <CreatorCard />
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="android-footer">
        <div className="android-footer-brand">
          <span>🧠 Thinking Bridge Android</span>
          <small>حقوق الطبع والنشر © {new Date().getFullYear()} عمرو شريف عبد العال</small>
        </div>

        <nav className="android-footer-nav" aria-label="روابط التواصل">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="المصدر على GitHub"
          >
            <Github size={15} aria-hidden="true" /> GitHub
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="حساب X"
          >
            X (Twitter)
          </a>
        </nav>
      </footer>

      {/* ===== STICKY BOTTOM DOWNLOAD FOR MOBILE VERTICAL ===== */}
      <div
        className={`android-sticky-download${showStickyDownload ? ' is-visible' : ''}`}
        aria-hidden={!showStickyDownload}
      >
        <div className="android-sticky-inner">
          <a
            href={WEB_APP_URL}
            tabIndex={showStickyDownload ? 0 : -1}
            className="android-sticky-btn"
            aria-label="تشغيل التطبيق الفوري"
          >
            <Zap size={18} aria-hidden="true" />
            <span>ابدأ الآن مجاناً — Launch App</span>
          </a>
        </div>
      </div>
    </main>
  );
}
