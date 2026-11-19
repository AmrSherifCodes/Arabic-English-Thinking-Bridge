import { useEffect, useState } from 'react';
import { AudioLines, BookOpen, Github, LockKeyhole, Mic2, WifiOff, Globe, Sparkles } from 'lucide-react';
import { CreatorCard } from './CreatorCard';
import './android-landing-page.css';

const WEB_APP_URL = '/app';
const GITHUB_URL = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge';
const X_URL = 'https://x.com/SciAmrSherif';

const FEATURES = [
  {
    icon: WifiOff,
    title: 'يعمل بدون إنترنت · Works Offline',
    description: 'جميع الدروس والبطاقات المعرفية والمعاجم تعمل بدون اتصال بالإنترنت. All core lessons, flashcards, and dictionaries work 100% offline.',
  },
  {
    icon: LockKeyhole,
    title: 'خصوصيتك محفوظة · Private & Local',
    description: 'لا تتبع ولا حسابات إجبارية. تقدمك يُحفظ محلياً على جهازك. No tracking, no mandatory accounts. Progress stays local on your device.',
  },
  {
    icon: Sparkles,
    title: 'مجاني 100% بدون إعلانات · 100% Free & No Ads',
    description: 'مشروع مفتوح المصدر محمي ضد الاستغلال التجاري وبدون اشتراكات. Free and open source (AGPLv3 / CC BY-NC-SA 4.0) with zero ads or paywalls.',
  },
  {
    icon: Mic2,
    title: 'تمارين نطق معرفية · Cognitive Speaking Practice',
    description: 'تدرب على نطق الجمل والتركيب الإنجليزي مباشرة بسرعة ودقة. Practice English sentence structure directly.',
  },
];

export function AndroidLandingPage() {
  const [showStickyDownload, setShowStickyDownload] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setShowStickyDownload(window.scrollY > 300);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  return (
    <main className="android-landing" aria-labelledby="android-hero-title">
      <header className="android-header">
        <a className="android-brand" href="/" aria-label="الصفحة الرئيسية لجسر التفكير · Thinking Bridge Home">
          <span className="android-brand-mark" aria-hidden="true">🧠</span>
          <span>Thinking Bridge</span>
        </a>
        <a
          className="android-header-link"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="المصدر على GitHub - Source on GitHub"
        >
          <Github size={16} aria-hidden="true" />
          <span>GitHub</span>
        </a>
      </header>

      <section className="android-hero">
        <div className="android-hero-copy">
          <span className="android-eyebrow">100% FREE · OPEN SOURCE (AGPLv3) · PWA</span>
          <h1 id="android-hero-title">فكّر بالإنجليزي، مش تترجم.</h1>
          <p className="android-subtitle">
            المنصة المعرفية الأقوى لمساعدة العقل العربي على البدء في التفكير باللغة الإنجليزية مباشرة وتجاوز الترجمة الحرفية.
          </p>
          <p className="android-clarifier">
            تعمل 100% بدون إنترنت. ابدأ الآن في 30 ثانية من أي متصفح.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
            <a
              className="android-download-button"
              href={WEB_APP_URL}
              aria-label="تشغيل التطبيق الفوري مجاناً وبدون إنترنت - Start Now Free Offline"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#0A0E13',
                textDecoration: 'none',
                padding: '1.1rem 1.75rem',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Globe size={24} aria-hidden="true" />
              <span>ابدأ الآن مجاناً - Start Now Free <span aria-hidden="true">🚀</span></span>
            </a>
            <a
              className="android-download-button"
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.3.0/Thinking-Bridge-v4.3.0.apk"
              download="Thinking-Bridge-v4.3.0.apk"
              aria-label="تحميل تطبيق الأندرويد المباشر v4.3.0"
              style={{
                background: 'rgba(201, 162, 39, 0.15)',
                color: '#FACC15',
                border: '1px solid rgba(201, 162, 39, 0.4)',
                textDecoration: 'none',
                padding: '0.85rem 1.5rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>📱</span>
              <span>تحميل تطبيق الأندرويد (v4.2.0 APK) — Direct Download</span>
            </a>
          </div>
          <span className="android-version">Web App & PWA · 100% Offline Ready</span>
        </div>

        <div className="android-device-wrap" aria-label="معاينة حية لتطبيقات التفكير بالإنجليزي - Live Demo Preview">
          <div className="android-phone">
            <div className="android-phone-camera" aria-hidden="true" />
            <div className="android-phone-screen">
              <div className="android-phone-topline">
                <span>9:41</span>
                <span aria-label="يعمل بدون إنترنت - Offline-ready">● ● ▰</span>
              </div>
              <div className="android-demo-heading">
                <span className="android-demo-icon" aria-hidden="true">🧠</span>
                <span><strong>فكّر إنجليزي</strong><small>English · A0-A2</small></span>
              </div>
              <div className="android-demo-chat">
                <span className="android-chat-label">الفكرة العربية</span>
                <p dir="rtl" lang="ar">أنا عايز أتعلم إنجليزي</p>
                <span className="android-chat-label android-chat-label-coach">التركيب المعرفي</span>
                <p className="android-coach-bubble">I want to learn English.</p>
                <p className="android-coach-note">ابدأ بالفاعل (I) ثم الرغبة (want) ثم المصدر (to learn).</p>
              </div>
              <div className="android-orb" aria-hidden="true"><AudioLines size={28} /></div>
              <span className="android-listening-label">تطبيق معرفي تفاعلي بدون إنترنت</span>
              <div className="android-demo-bottom"><BookOpen size={16} /> 27 درساً <span>·</span> جاهز بدون إنترنت</div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Presentation */}
      <CreatorCard />

      <section className="android-features" aria-labelledby="android-features-title">
        <div className="android-section-heading">
          <span className="android-eyebrow">مميزات المنصة المعرفية</span>
          <h2 id="android-features-title">تعلم حقيقي بدون تشتيت</h2>
        </div>
        <div className="android-feature-grid">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <article className="android-feature-card" key={title}>
              <span className="android-feature-icon"><Icon size={21} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="android-footer">
        <span>حقوق الطبع والنشر © {new Date().getFullYear()} عمرو شريف عبد العال</span>
        <nav aria-label="روابط التواصل والمصدر - Social and Source Links">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="كود المصدر على GitHub (يفتح في نافذة جديدة)"
          >
            <Github size={16} aria-hidden="true" /> GitHub
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="حساب X (تويتر) لعمرو شريف (يفتح في نافذة جديدة)"
          >
            X
          </a>
        </nav>
      </footer>

      <div
        className={`android-sticky-download${showStickyDownload ? ' is-visible' : ''}`}
        aria-hidden={!showStickyDownload}
      >
        <a
          href={WEB_APP_URL}
          tabIndex={showStickyDownload ? 0 : -1}
          aria-label="تشغيل التطبيق - Launch PWA"
        >
          <Globe size={19} aria-hidden="true" />
          ابدأ الآن — Launch App
        </a>
      </div>
    </main>
  );
}
