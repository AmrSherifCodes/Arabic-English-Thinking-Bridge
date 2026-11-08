import { useEffect, useState } from 'react';
import { ArrowDownToLine, AudioLines, BookOpen, Github, KeyRound, LockKeyhole, Mic2, WifiOff } from 'lucide-react';
import './android-landing-page.css';

const APK_URL =
  'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.0.2/ThinkingBridge-v4.0.2.apk';
const RELEASES_URL = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases';
const GITHUB_URL = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge';
const X_URL = 'https://x.com/SciAmrSherif';

const FEATURES = [
  {
    icon: WifiOff,
    title: 'Learn offline',
    description: 'Lessons, dictionaries, and downloaded Piper voices work offline. Cloud AI features need an internet connection.',
  },
  {
    icon: LockKeyhole,
    title: 'Private by design',
    description: 'Learning progress and an optional Gemini key are stored locally on your device.',
  },
  {
    icon: Mic2,
    title: 'Voice-to-voice practice',
    description: 'Practice speaking, interrupt the coach naturally, and continue at your own pace.',
  },
  {
    icon: KeyRound,
    title: 'Bring your own key',
    description: 'Connect your own Gemini API key for AI coaching beyond the free shared allowance.',
  },
];

export function AndroidLandingPage() {
  const [showStickyDownload, setShowStickyDownload] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent));

    const updateScrollState = () => setShowStickyDownload(window.scrollY > 300);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  return (
    <main className="android-landing" aria-labelledby="android-hero-title">
      <header className="android-header">
        <a className="android-brand" href="/android" aria-label="Thinking Bridge Android home">
          <span className="android-brand-mark" aria-hidden="true">🧠</span>
          <span>Thinking Bridge</span>
        </a>
        <a className="android-header-link" href={RELEASES_URL} target="_blank" rel="noreferrer">
          All releases
        </a>
      </header>

      <section className="android-hero">
        <div className="android-hero-copy">
          <span className="android-eyebrow">FREE AND OPEN SOURCE · ANDROID APK</span>
          <h1 id="android-hero-title">The Ultimate Offline Arabic-English AI Coach.</h1>
          <p className="android-subtitle">
            Rewire your brain to think in 10+ languages. Practice offline with lessons, dictionaries, and local speech.
          </p>
          <p className="android-clarifier">
            Core learning works offline. AI coaching requires internet access; bring your own Gemini key for extended use.
          </p>
          <a className="android-download-button" href={APK_URL} download>
            <ArrowDownToLine size={23} aria-hidden="true" />
            <span>Download APK <span aria-hidden="true">🚀</span></span>
          </a>
          <span className="android-version">Version 3.1.0 · Android · Free</span>
          <p className="android-device-hint" role="status">
            {isAndroid
              ? 'Your Android download is ready. Allow installs from this source if prompted.'
              : 'Download the APK and open it on your Android device to install.'}
          </p>
        </div>

        <div className="android-device-wrap" aria-label="Preview of voice practice in Thinking Bridge">
          <div className="android-phone">
            <div className="android-phone-camera" aria-hidden="true" />
            <div className="android-phone-screen">
              <div className="android-phone-topline">
                <span>9:41</span>
                <span aria-label="Offline-ready">● ● ▰</span>
              </div>
              <div className="android-demo-heading">
                <span className="android-demo-icon" aria-hidden="true">🧠</span>
                <span><strong>Voice Practice</strong><small>English · Beginner</small></span>
              </div>
              <div className="android-demo-chat">
                <span className="android-chat-label">YOU</span>
                <p dir="rtl" lang="ar">أنا عايز أتعلم إنجليزي</p>
                <span className="android-chat-label android-chat-label-coach">THINKING BRIDGE</span>
                <p className="android-coach-bubble">I want to learn English.</p>
                <p className="android-coach-note">Start with the subject: “I” — then add what you want.</p>
              </div>
              <div className="android-orb" aria-hidden="true"><AudioLines size={28} /></div>
              <span className="android-listening-label">Tap to practice speaking</span>
              <div className="android-demo-bottom"><BookOpen size={16} /> Lessons <span>·</span> Offline ready</div>
            </div>
          </div>
        </div>
      </section>

      <section className="android-features" aria-labelledby="android-features-title">
        <div className="android-section-heading">
          <span className="android-eyebrow">MADE FOR YOUR PHONE</span>
          <h2 id="android-features-title">Focused learning. No clutter.</h2>
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
        <span>© {new Date().getFullYear()} Amr Sherif Abdelaal</span>
        <nav aria-label="Social links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Github size={16} aria-hidden="true" /> GitHub</a>
          <a href={X_URL} target="_blank" rel="noreferrer">X</a>
        </nav>
      </footer>

      <div className={`android-sticky-download${showStickyDownload ? ' is-visible' : ''}`} aria-hidden={!showStickyDownload}>
        <a href={APK_URL} download tabIndex={showStickyDownload ? 0 : -1}>
          <ArrowDownToLine size={19} aria-hidden="true" />
          Download APK
        </a>
      </div>
    </main>
  );
}
