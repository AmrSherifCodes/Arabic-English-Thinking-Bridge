import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Github, Heart, Linkedin, ShieldCheck, Smartphone, Sparkles, X, Youtube } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

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

  const handlePrimaryAction = () => {
    if (onResumeApp) {
      onResumeApp();
    } else {
      onStartGuest();
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-x-hidden bg-[#f8f9fa] px-4 py-4 text-stone-900 dark:bg-stone-950 dark:text-stone-100 sm:px-8 sm:py-8">
      {/* Background patterns */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 17px, rgba(15, 23, 42, 0.045) 17px 18px, transparent 18px 34px), repeating-linear-gradient(-45deg, transparent 0 17px, rgba(15, 23, 42, 0.045) 17px 18px, transparent 18px 34px)',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 78%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-teal-50/40 dark:from-stone-950/20 dark:to-teal-950/20"
      />

      <div className="relative mx-auto w-full max-w-4xl py-2 sm:py-4 flex-1 flex flex-col justify-between">
        {/* Top Header */}
        <header className="mb-4 sm:mb-6 flex items-center justify-between text-sm font-bold tracking-wide text-teal-800 dark:text-teal-300">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
              <BookOpen size={17} aria-hidden="true" />
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="ar font-black text-base text-stone-950 dark:text-white">
                {isAr ? 'فكّر إنجليزي' : 'Thinking English'}
              </span>
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                · {isAr ? 'Thinking English' : 'فكّر إنجليزي'}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
            {isAr ? 'مجاني 100% · مفتوح المصدر' : '100% Free · Open Source'}
          </span>
        </header>

        {/* ============================================================== */}
        {/* HERO SECTION — STRICTLY ABOVE THE FOLD (THE 5-SECOND TEST)    */}
        {/* ============================================================== */}
        <section className="my-auto flex flex-col items-center text-center max-w-2xl mx-auto w-full py-1">
          {/* 1. One-Line Headline */}
          <h1 className="ar text-2xl sm:text-4xl font-black leading-tight tracking-tight text-stone-950 dark:text-white">
            {t('landing.headline', 'تعلّم تفكّر بالإنجليزي، مش تترجم في دماغك')}
          </h1>

          {/* 2. One-Line Subline: States target audience and 100% free / open source */}
          <p className="ar mt-2 text-xs sm:text-base font-bold text-teal-800 dark:text-teal-300 leading-normal max-w-xl">
            {t('landing.subline', 'مُصمم للمتحدثين بالعربية لإتقان التفكير بالإنجليزية · مجاني 100% ومفتوح المصدر وخاص بالكامل')}
          </p>

          {/* 3. The 5-Second Real Sentence Bridge (Concept #1: Copula omission) */}
          <div className="mt-4 w-full rounded-2xl border-2 border-teal-600/30 bg-white/95 dark:bg-stone-900/95 p-3.5 sm:p-5 shadow-lg shadow-teal-950/5 backdrop-blur-xs text-start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-teal-600 dark:text-teal-400" />
                <span>{t('landing.exampleTitle', '⚡ مثال التحول الذهني الفوري (في 5 ثوانٍ):')}</span>
              </span>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                {t('landing.exampleConcept', 'المفهوم #1')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Arabic Thought */}
              <div className="rounded-xl bg-stone-100 dark:bg-stone-800/80 p-2.5 border border-stone-200 dark:border-stone-700/60">
                <span className="block text-[10px] font-bold text-stone-500 dark:text-stone-400">
                  {t('landing.thoughtLabel', 'الفكرة بالعربي:')}
                </span>
                <span className="ar block text-base font-black text-stone-950 dark:text-white mt-0.5">
                  {t('landing.thoughtText', '« أنا طالب »')}
                </span>
              </div>

              {/* English Target with illuminated chips */}
              <div className="rounded-xl bg-teal-50/80 dark:bg-teal-950/40 p-2.5 border border-teal-200 dark:border-teal-800/60">
                <span className="block text-[10px] font-bold text-teal-800 dark:text-teal-300">
                  {t('landing.targetLabel', 'الهيكل بالإنجليزي:')}
                </span>
                <div className="flex items-center gap-1 mt-1 font-black text-sm">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-900 shadow-2xs border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                    I
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-600 text-white shadow-2xs font-extrabold ring-2 ring-teal-400">
                    am
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-600 text-white shadow-2xs font-extrabold ring-2 ring-teal-400">
                    a
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-900 shadow-2xs border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                    student
                  </span>
                </div>
              </div>
            </div>

            <p className="ar mt-2.5 text-[11px] font-semibold text-stone-600 dark:text-stone-300 leading-snug">
              💡 {t('landing.bridgeNote', 'الجسر: العربية تستغني عن فعل الكينونة، بينما الإنجليزية تشترط (am + a).')}
            </p>
          </div>

          {/* 4. One Single Primary Action Button */}
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] py-3.5 px-6 text-lg sm:text-xl font-black text-white shadow-lg shadow-teal-950/20 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950"
            >
              <span className="ar">{t('landing.primaryCta', 'ابدأ درسك الأول (دقيقتان) ←')}</span>
              <ArrowRight size={20} className="rtl-flip shrink-0" aria-hidden="true" />
            </button>

            {/* Subtle Platform & Privacy Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 pt-0.5">
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v1.1.2/thinking-english-v1.1.2.apk"
                className="hover:text-teal-700 dark:hover:text-teal-300 transition underline underline-offset-2 inline-flex items-center gap-1 font-bold"
              >
                <Smartphone size={14} />
                <span>{t('landing.secondaryInfo', '📱 متوفر للأندرويد (v1.1.2)')}</span>
              </a>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-teal-700 dark:hover:text-teal-300 transition underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>{isAr ? 'بدون تتبع أو تسجيل' : 'Private · No signup'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECONDARY SECTION (BELOW THE FOLD): CREATOR & OPEN SOURCE      */}
        {/* ============================================================== */}
        <section className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Creator Photo & Details */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative overflow-hidden rounded-3xl border-2 border-teal-700/60 bg-white shadow-xl dark:border-teal-500/50 dark:bg-stone-900">
                <img
                  src="/amr.jpg"
                  alt="Amr Sherif"
                  width={240}
                  height={280}
                  className="h-64 w-56 object-cover object-top"
                />
                <div className="bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-transparent px-4 pb-3 pt-6 text-white text-center">
                  <p className="text-sm font-bold tracking-wide">Amr Sherif</p>
                  <p className="text-xs text-teal-200">Creator of Thinking English</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCv(true)}
                className="mt-3 flex w-full max-w-[14rem] items-center justify-center gap-1.5 rounded-xl border border-teal-600/60 bg-white px-4 py-2 text-xs font-bold text-teal-800 shadow-xs transition hover:bg-teal-50 focus-visible:outline-none dark:bg-stone-900 dark:text-teal-300 dark:hover:bg-stone-800"
              >
                📄 {t('landing.viewCv', 'عرض سيرتي الذاتية (CV)')}
              </button>
            </div>

            {/* Project Philosophy & Constitution */}
            <div className="md:col-span-8 space-y-3.5 text-start">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80">
                {isAr ? 'عن المشروع ودستور القناة' : 'About the Project & Constitution'}
              </span>
              <h2 className="ar text-xl sm:text-2xl font-black text-stone-950 dark:text-white">
                {t('landing.aboutMission', 'عن المشروع ورسالة المصدر المفتوح')}
              </h2>
              <p className="ar text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-300">
                {t(
                  'landing.aboutMissionDesc',
                  'مشروع غير ربحي، مجاني 100% ومفتوح المصدر بالكامل تحت رخصة CC0، صُمم لمساعدة كل متحدث بالعربية على بناء جسر تفكير ذهني مستقل دون الحاجة للترجمة في الدماغ.'
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://youtu.be/All6Hz2NWLs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-50/90 px-3.5 py-2 text-xs font-bold text-red-700 shadow-xs transition hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300"
                >
                  <Youtube size={15} className="text-red-600 dark:text-red-400" aria-hidden="true" />
                  <span>🎥 {isAr ? 'قصة بناء التطبيق' : 'Watch the Story'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 shadow-xs transition hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  🔒 {isAr ? 'الخصوصية والأمان' : 'Privacy & Security'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInstallGuide(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 shadow-xs transition hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  📱 {isAr ? 'طريقة التثبيت على الهاتف' : 'How to install on phone'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="relative mx-auto mt-8 w-full max-w-4xl border-t border-stone-200 dark:border-stone-800/80 pt-4 text-xs text-stone-600 dark:text-stone-400 font-medium">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="font-semibold">© 2026 Thinking English · فكّر إنجليزي (CC0 1.0 Universal)</p>
          <nav aria-label="Creator social links" className="flex flex-wrap items-center gap-4">
            <a
              href="https://www.linkedin.com/in/sciamrsherif-abdelaal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Linkedin size={14} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Github size={14} aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <a
              href="https://youtube.com/@SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Youtube size={14} aria-hidden="true" />
              <span>YouTube</span>
            </a>
            <a
              href="https://www.patreon.com/c/SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
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
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-stone-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
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
            <header className="bg-teal-700 px-6 py-6 pr-16 text-white sm:px-8">
              <button
                type="button"
                onClick={() => setShowCv(false)}
                aria-label="Close CV"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
              <h2 id="cv-title" className="text-3xl font-black tracking-tight sm:text-4xl">
                Amr Sherif Abdelaal
              </h2>
              <p className="mt-1 text-base font-semibold text-teal-100 sm:text-lg">
                Full-Stack Developer &amp; Chemistry Undergraduate
              </p>
            </header>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
                {/* Left column: contact, skills, volunteering */}
                <div className="space-y-7">
                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
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
                          className="hover:underline inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium"
                        >
                          <Github size={15} aria-hidden="true" /> github.com/AmrSherifCodes
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://linkedin.com/in/sciamrsherif-abdelaal"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium"
                        >
                          <Linkedin size={15} aria-hidden="true" /> linkedin.com/in/sciamrsherif-abdelaal
                        </a>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Core Skills
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST APIs', 'Supabase'].map(skill => (
                        <li key={skill} className="rounded-lg bg-teal-50 dark:bg-stone-800 px-2.5 py-1 text-xs font-bold text-teal-800 dark:text-teal-300">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Right column: About, Experience & Projects */}
                <div className="space-y-6 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  <section>
                    <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Summary
                    </h3>
                    <p>
                      Passionate software engineer and educator dedicated to democratizing cognitive English learning for native Arabic speakers through open-source technology, deterministic SRS algorithms, and intelligent pedagogical design.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowInstallGuide(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-stone-900 dark:text-stone-100 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 id="install-guide-title" className="text-lg font-black">
                {isAr ? 'تثبيت التطبيق على الهاتف' : 'Install on your phone'}
              </h2>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                aria-label="Close install instructions"
                className="rounded-lg p-2 text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 rounded-2xl bg-teal-50 p-3 text-sm leading-relaxed text-teal-900 dark:bg-teal-950/40 dark:text-teal-200 ar">
              على أجهزة iPhone: افتح الصفحة في Safari، واضغط على زر المشاركة (Share)، ثم اختر{' '}
              <strong>Add to Home Screen</strong>.
            </p>
            <a
              href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v1.1.2/thinking-english-v1.1.2.apk"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-teal-700/70 bg-teal-50 dark:bg-stone-800 px-4 py-2.5 text-xs font-bold text-teal-800 dark:text-teal-200 transition hover:bg-teal-100 dark:hover:bg-stone-700 cursor-pointer"
            >
              <Smartphone size={16} aria-hidden="true" />
              <span>{t('landing.downloadAndroidApk', 'تحميل تطبيق الأندرويد 📱 (v1.1.2)')}</span>
            </a>
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="mt-5 w-full rounded-2xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800 cursor-pointer"
            >
              {isAr ? 'فهمت' : 'Got it'}
            </button>
          </section>
        </div>
      )}

      {/* Privacy & Security Modal */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm overflow-y-auto"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowPrivacyModal(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            dir="rtl"
            className="w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 text-stone-900 dark:text-stone-100 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col ar text-start"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-lg">
                  🛡️
                </span>
                <h2 id="privacy-modal-title" className="text-xl font-black text-stone-900 dark:text-white">
                  الخصوصية والأمان
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition cursor-pointer"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto space-y-3 text-xs sm:text-sm font-medium leading-relaxed pr-1 text-right">
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-1">
                <p className="font-bold text-teal-950 dark:text-teal-200 text-sm">
                  إحنا مش بناخد منك أي حاجة:
                </p>
                <p className="text-stone-700 dark:text-stone-300">
                  ❌ <strong>مفيش تسجيل:</strong> التطبيق مش بيطلب إيميلك ولا رقمك.
                </p>
                <p className="text-stone-700 dark:text-stone-300">
                  ❌ <strong>مفيش تتبع:</strong> إحنا مش بنجمع أي إحصائيات عنك.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                <p className="font-bold text-stone-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                  <span>🎙️</span>
                  <span>المايك بأمان:</span>
                </p>
                <p className="text-stone-700 dark:text-stone-300">
                  المايك بيشتغل بس عشان يسمعك في تمارين المحادثة. الصوت بيتحول لنص وبس، ومفيش أي تسجيل بيتم تخزينه على السيرفرات.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                <p className="font-bold text-stone-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                  <span>💾</span>
                  <span>بياناتك على موبايلك:</span>
                </p>
                <p className="text-stone-700 dark:text-stone-300">
                  كل تقدمك في الدروس محفوظ جوه موبايلك أنت بس (Local Storage).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                <p className="font-bold text-stone-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                  <span>💻</span>
                  <span>الكود مفتوح للكل:</span>
                </p>
                <p className="text-stone-700 dark:text-stone-300">
                  التطبيق كله مفتوح المصدر على GitHub، يعني أي مبرمج يقدر يشوف الكود ويتأكد إن مفيش أي فيروسات أو تجسس.
                </p>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 px-5 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-black text-sm sm:text-base shadow-md transition-all cursor-pointer"
              >
                تمام، فهمت
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
