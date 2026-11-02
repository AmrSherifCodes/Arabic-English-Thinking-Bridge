import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Github, Heart, Linkedin, ShieldCheck, Smartphone, Sparkles, X, Youtube } from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { TutorAvatar } from './TutorAvatar';

interface LandingViewProps {
  onStartWebApp: () => void;
  onStartGuest: () => void;
  onResumeApp?: () => void;
}

export function LandingView({ onStartWebApp, onStartGuest, onResumeApp }: LandingViewProps) {
  const { t, i18n } = useTranslation();
  const isAr = (i18n.language || 'ar').startsWith('ar');

  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showCv, setShowCv] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const mobileWidth = typeof window !== 'undefined' && window.innerWidth < 768;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobileWidth || isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!showInstallGuide && !showCv && !showPrivacyModal) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowInstallGuide(false);
        setShowCv(false);
        setShowPrivacyModal(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showInstallGuide, showCv, showPrivacyModal]);

  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-x-hidden bg-[#fafaf9] px-4 py-5 text-stone-900 dark:bg-stone-950 dark:text-stone-100 sm:px-8 sm:py-8">
      {/* Background Subtle Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative mx-auto w-full max-w-4xl py-2 flex-1 flex flex-col justify-between">
        {/* Top Header */}
        <header className="mb-6 flex items-center justify-between text-sm font-bold tracking-wide">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="ar font-black text-lg text-stone-950 dark:text-white block leading-tight">
                فكّر إنجليزي
              </span>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 block">
                Thinking English
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              مجاني 100% · مفتوح المصدر (CC0)
            </span>
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-700 shadow-xs hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 transition"
              aria-label="GitHub Repository"
            >
              <Github size={18} />
            </a>
          </div>
        </header>

        {/* ============================================================== */}
        {/* HERO SECTION WITH DUOLINGO-STYLE TUTOR AVATAR & MASCOT         */}
        {/* ============================================================== */}
        <section className="my-auto flex flex-col items-center text-center max-w-2xl mx-auto w-full py-2">
          {/* Duolingo Mascot Avatar with Animated Speech Bubble */}
          <div className="mb-6 w-full flex justify-center">
            <TutorAvatar
              isSpeaking={true}
              expression="happy"
              size="lg"
              speechText="أهلاً بيك يا بطل! 👋 فكك من حفظ القواعد المعقدة.. هنا هنتعلم نفكر بالإنجليزي مباشرة بطريقة سهلة وممتعة!"
            />
          </div>

          {/* Headline */}
          <h1 className="ar text-3xl sm:text-5xl font-black leading-tight tracking-tight text-stone-950 dark:text-white">
            تعلّم تفكّر بالإنجليزي، مش تترجم في دماغك
          </h1>

          {/* Subtitle */}
          <p className="ar mt-3 text-sm sm:text-lg font-bold text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
            مشروع مستقل مبني لمتحدثي العربية (مصري وفصحى) للتحدث بطلاقة وسلاسة — مجاني 100% وبدون إعلانات ولا تتبع.
          </p>

          {/* ============================================================== */}
          {/* THE SENTENCE BRIDGE (Concept #1: Copula omission)               */}
          {/* ============================================================== */}
          <div className="mt-5 w-full rounded-3xl border-2 border-emerald-500/25 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-lg shadow-emerald-950/5 text-start">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>فكرة التطبيق ببساطة (في 5 ثوانٍ):</span>
              </span>
              <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                المفهوم #1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Arabic Thought */}
              <div className="rounded-2xl bg-stone-100 dark:bg-stone-800/80 p-3 border border-stone-200 dark:border-stone-700 text-center">
                <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  العربي بيقول الفكرة مباشرة:
                </span>
                <span className="ar block text-xl font-black text-stone-950 dark:text-white mt-1">
                  « أنا طالب »
                </span>
              </div>

              {/* English Target with illuminated chips */}
              <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  الإنجليزي بيبني الهيكل بالكامل:
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-1 font-black text-base">
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 shadow-xs border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                    I
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-400">
                    am
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-400">
                    a
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 shadow-xs border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                    student
                  </span>
                </div>
              </div>
            </div>

            <p className="ar mt-3 text-xs font-semibold text-stone-600 dark:text-stone-300 leading-snug text-center">
              💡 <strong>الجسر:</strong> العربي بيوصل المعنى بدون فعل، لكن الإنجليزي مينفعش يستغنى عن فعل الكينونة (am) وأداة النكرة (a).
            </p>
          </div>

          {/* ============================================================== */}
          {/* ACTION BUTTONS (CHUNKY 3D INDIE / DUOLINGO STYLE)              */}
          {/* ============================================================== */}
          <div className="mt-6 w-full flex flex-col items-center gap-3">
            {/* Primary Action 1: Start & Customize Preferences */}
            <button
              type="button"
              onClick={onStartWebApp}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-1 text-white font-black text-lg sm:text-xl py-4 px-6 shadow-[0_5px_0_#065f46] active:shadow-none transition-all cursor-pointer"
            >
              <span>ابدأ الآن واضبط مستواك وهدفك 🚀</span>
              <ArrowRight size={22} className="rtl-flip shrink-0" aria-hidden="true" />
            </button>

            {/* Primary Action 2: Direct Download APK (Verified Release Asset) */}
            <a
              href="/apk"
              id="download-android-apk-btn"
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-teal-700 hover:bg-teal-600 active:translate-y-1 text-white font-black text-base sm:text-lg py-3.5 px-6 shadow-[0_4px_0_#115e59] active:shadow-none transition-all cursor-pointer"
            >
              <Smartphone size={22} className="shrink-0" />
              <span>تحميل تطبيق الأندرويد مباشرة (v3.0.1 APK) 📱</span>
            </a>

            {/* Releases page fallback link */}
            <div className="w-full flex items-center justify-center gap-2 pt-0.5">
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 underline underline-offset-2 transition"
              >
                صفحة كل الإصدارات والـ APK على GitHub Releases ↗
              </a>
            </div>

            {/* Quick Guest Mode & Resume */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs font-bold text-stone-600 dark:text-stone-400">
              {onResumeApp && (
                <button
                  type="button"
                  onClick={onResumeApp}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 transition cursor-pointer"
                >
                  متابعة من حيث توقفت (Resume)
                </button>
              )}
              {onResumeApp && <span>·</span>}
              <button
                type="button"
                onClick={onStartGuest}
                className="hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 transition cursor-pointer"
              >
                ⚡ تجربة سريعة كزائر فوراً (بدون حفظ)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>الخصوصية (بدون تسجيل)</span>
              </button>
            </div>
          </div>

          {/* Preferences Highlights Banner */}
          <div className="mt-6 grid grid-cols-3 gap-2 w-full text-center">
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5">
              <span className="block text-base">🇪🇬</span>
              <span className="block text-[11px] font-black text-stone-800 dark:text-stone-200 mt-1">مصري وفصحى</span>
            </div>
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5">
              <span className="block text-base">🎯</span>
              <span className="block text-[11px] font-black text-stone-800 dark:text-stone-200 mt-1">شغل · سفر · كلام يومي</span>
            </div>
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5">
              <span className="block text-base">📈</span>
              <span className="block text-[11px] font-black text-stone-800 dark:text-stone-200 mt-1">من الصفر للاحتراف</span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* CREATOR & OPEN SOURCE SECTION                                  */}
        {/* ============================================================== */}
        <section className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Creator Photo & Badge */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-600/50 bg-white shadow-md dark:border-emerald-500/40 dark:bg-stone-900">
                <img
                  src="/amr.jpg"
                  alt="Amr Sherif"
                  width={200}
                  height={240}
                  className="h-56 w-48 object-cover object-top"
                />
                <div className="bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-transparent px-3 pb-2.5 pt-4 text-white text-center">
                  <p className="text-sm font-bold tracking-wide">Amr Sherif</p>
                  <p className="text-[11px] text-emerald-300">Creator of Thinking English</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCv(true)}
                className="mt-3 flex w-full max-w-[12rem] items-center justify-center gap-1.5 rounded-xl border border-emerald-600/60 bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-xs transition hover:bg-emerald-50 focus-visible:outline-none dark:bg-stone-900 dark:text-emerald-300 dark:hover:bg-stone-800 cursor-pointer"
              >
                📄 عرض سيرتي الذاتية (CV)
              </button>
            </div>

            {/* Mission Text */}
            <div className="md:col-span-8 space-y-3 text-start">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                مشروع مستقل · مفتوح المصدر بالكامل
              </span>
              <h2 className="ar text-lg sm:text-xl font-black text-stone-950 dark:text-white">
                ليه عملت فكّر إنجليزي؟
              </h2>
              <p className="ar text-xs sm:text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-300">
                مشروع غير ربحي ومجاني 100% صممته عشان أساعد كل شاب عربي يكسر حاجز الترجمة الحرفية في دماغه، ويفهم المنطق الهيكلي للإنجليزي بدون أي تعقيد. كل الكود متاح ومفتوح على GitHub.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="https://youtu.be/All6Hz2NWLs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs transition hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300"
                >
                  <Youtube size={15} className="text-red-600 dark:text-red-400" aria-hidden="true" />
                  <span>🎥 شاهد قصة المشروع على يوتيوب</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 shadow-xs transition hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  🔒 الأمان والخصوصية
                </button>
                <button
                  type="button"
                  onClick={() => setShowInstallGuide(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 shadow-xs transition hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  📱 تثبيت على الهاتف
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative mx-auto mt-6 w-full max-w-4xl border-t border-stone-200 dark:border-stone-800 pt-4 text-xs text-stone-600 dark:text-stone-400 font-medium">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="font-semibold">© 2026 Thinking English · فكّر إنجليزي (CC0 1.0 Universal)</p>
          <nav aria-label="Creator social links" className="flex flex-wrap items-center gap-4">
            <a
              href="https://www.linkedin.com/in/sciamrsherif-abdelaal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              <Linkedin size={14} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              <Github size={14} aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <a
              href="https://youtube.com/@SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              <Youtube size={14} aria-hidden="true" />
              <span>YouTube</span>
            </a>
            <a
              href="https://www.patreon.com/c/SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              <Heart size={14} aria-hidden="true" />
              <span>Patreon</span>
              <ExternalLink size={12} aria-hidden="true" className="opacity-65" />
            </a>
          </nav>
        </div>
      </footer>

      {/* CV Modal */}
      {showCv && (
        <div
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-stone-950/60 p-3 backdrop-blur-xs sm:items-center sm:p-4"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowCv(false);
          }}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="cv-title"
            className="relative my-3 w-full max-w-4xl overflow-hidden rounded-3xl border border-stone-300 bg-white text-stone-900 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          >
            <header className="bg-emerald-700 px-6 py-6 pr-16 text-white sm:px-8">
              <button
                type="button"
                onClick={() => setShowCv(false)}
                aria-label="Close CV"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <X size={20} aria-hidden="true" />
              </button>
              <h2 id="cv-title" className="text-3xl font-black tracking-tight sm:text-4xl">
                Amr Sherif Abdelaal
              </h2>
              <p className="mt-1 text-base font-semibold text-emerald-100 sm:text-lg">
                Full-Stack Developer &amp; Chemistry Undergraduate
              </p>
            </header>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
                {/* Left column */}
                <div className="space-y-7">
                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Contact
                    </h3>
                    <ul className="space-y-2 break-words text-sm text-stone-700 dark:text-stone-300">
                      <li>
                        <a href="mailto:amrsherifwork@gmail.com" className="hover:underline inline-flex items-center gap-1.5">
                          ✉️ amrsherifwork@gmail.com
                        </a>
                      </li>
                      <li>📍 Alexandria, Egypt</li>
                      <li>
                        <a
                          href="https://github.com/AmrSherifCodes"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium"
                        >
                          <Github size={15} aria-hidden="true" /> github.com/AmrSherifCodes
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://linkedin.com/in/sciamrsherif-abdelaal"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium"
                        >
                          <Linkedin size={15} aria-hidden="true" /> linkedin.com/in/sciamrsherif-abdelaal
                        </a>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Core Skills
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST APIs', 'Supabase'].map(skill => (
                        <li key={skill} className="rounded-lg bg-emerald-50 dark:bg-stone-800 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Right column */}
                <div className="space-y-6 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  <section>
                    <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      About & Executive Summary
                    </h3>
                    <p>
                      Passionate software engineer, chemist, and educator dedicated to democratizing cognitive English learning for native Arabic speakers. Sole architect and creator of <strong>Thinking Bridge (+44,000 lines of production code across 188 files)</strong>, featuring deterministic SM-2 algorithms, real-time multimodal conversation, dual-engine speech resilience for Chrome and privacy browsers (Brave), and 111 automated unit tests.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Featured Milestone
                    </h3>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-700 dark:bg-stone-800">
                      <div className="flex items-center justify-between font-bold text-xs text-stone-900 dark:text-stone-100">
                        <span>Thinking Bridge Ecosystem</span>
                        <span className="text-emerald-600 dark:text-emerald-400">44,236 LOC · 111 Tests</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
                        Built completely from scratch with React 19, TypeScript, Capacitor 8 native Android packaging, Edge TTS neural streaming, and offline-first storage.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <footer className="border-t border-stone-300 px-6 py-4 dark:border-stone-700 sm:px-8">
              <button
                type="button"
                onClick={() => setShowCv(false)}
                className="w-full rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 cursor-pointer"
              >
                Close
              </button>
            </footer>
          </article>
        </div>
      )}

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowInstallGuide(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            className="w-full max-w-md rounded-3xl border border-stone-300 bg-white p-6 text-stone-900 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="install-guide-title" className="text-xl font-black">
                  تثبيت فكّر إنجليزي · Install
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  افتح قائمة المتصفح واختر <strong>Add to Home Screen</strong> أو{' '}
                  <strong>Install app</strong> لتحميل التطبيق مباشرة على هاتفك.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                aria-label="Close"
                className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <a
              href="/apk"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 cursor-pointer"
            >
              <Smartphone size={18} aria-hidden="true" />
              <span>تحميل ملف APK مباشرة (v3.0.1)</span>
            </a>
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="mt-3 w-full rounded-2xl border border-stone-300 dark:border-stone-700 py-2.5 font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              إغلاق
            </button>
          </section>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs overflow-y-auto"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowPrivacyModal(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            dir="rtl"
            className="w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 text-stone-900 dark:text-stone-100 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col ar"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 id="privacy-modal-title" className="text-xl font-black">
                🛡️ الخصوصية والأمان
              </h2>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3 text-sm font-medium leading-relaxed">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <p className="font-bold text-emerald-950 dark:text-emerald-200 mb-1">بياناتك ملكك تماماً:</p>
                <p className="text-stone-700 dark:text-stone-300">
                  ❌ <strong>بدون حسابات أو تسجيل:</strong> مش بنطلب إيميلك ولا رقمك ولا أي بيانات شخصية.<br />
                  ❌ <strong>بدون تتبع:</strong> لا نستخدم أي أدوات تتبع أو إعلانات ربحية.<br />
                  📱 <strong>تخزين محلي:</strong> تقدمك في الدروس محفوظ داخل متصفحك أو جهازك فقط.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition"
            >
              تمام، فهمت
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
