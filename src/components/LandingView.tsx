import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Github, Heart, Linkedin, Smartphone, X, Youtube } from 'lucide-react';

interface LandingViewProps {
  onStartWebApp: () => void;
  onStartGuest: () => void;
  onResumeApp?: () => void;
}

export function LandingView({ onStartWebApp, onStartGuest, onResumeApp }: LandingViewProps) {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showCv, setShowCv] = useState(false);
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
    if (!showInstallGuide && !showCv) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowInstallGuide(false);
        setShowCv(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showInstallGuide, showCv]);

  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-[#f8f9fa] px-5 py-8 text-stone-900 dark:bg-stone-950 dark:text-stone-100 sm:px-8 sm:py-12">
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

      <div className="relative mx-auto my-auto w-full max-w-6xl py-4">
        <div className="mb-8 flex items-center gap-2.5 text-sm font-bold tracking-wide text-teal-800 dark:text-teal-300 sm:mb-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
            <BookOpen size={19} aria-hidden="true" />
          </span>
          <span className="ar font-black text-lg">فكّر إنجليزي</span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">· Thinking English</span>
        </div>

        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 mb-2">
                مجاني 100% · بدون إعلانات · مفتوح المصدر
              </span>
              <h1 className="ar text-5xl font-black leading-[1.08] tracking-tight text-stone-950 dark:text-white sm:text-6xl lg:text-7xl">
                فكّر إنجليزي
              </h1>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-teal-700 dark:text-teal-400">
                Thinking English
              </p>
            </div>
            <p
              dir="rtl"
              className="ar mt-5 text-xl sm:text-2xl font-bold leading-relaxed text-stone-700 dark:text-stone-200"
            >
              الطريقة الأسهل عشان تتكلم إنجليزي بثقة وتفكر بيه بشكل طبيعي
            </p>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
              بدون حفظ قواعد معقدة أو ترجمة حرفية في دماغك. 100% مجاني ومفتوح المصدر وخاص تماماً.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4">
              <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onResumeApp || onStartWebApp}
                  className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] px-6 py-3.5 text-lg font-bold text-white shadow-md shadow-teal-900/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950"
                >
                  <span className="text-center">
                    <span className="ar block text-lg font-black">{onResumeApp ? 'استئناف التعلم 🚀' : 'ابدأ التعلم الآن 🚀'}</span>
                    <span className="block text-xs font-semibold opacity-90">
                      {onResumeApp ? 'Resume Learning' : 'Start Learning Now'}
                    </span>
                  </span>
                  <ArrowRight size={20} className="rtl-flip" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onStartGuest}
                  className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-teal-700/80 bg-white/80 px-6 py-3.5 text-lg font-bold text-teal-800 transition hover:bg-teal-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:bg-stone-900/60 dark:text-teal-300 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-950"
                >
                  <span className="text-center">
                    <span className="ar block text-lg font-black">جرّب كضيف 🚀</span>
                    <span className="block text-xs font-semibold opacity-90">
                      Try as Guest
                    </span>
                  </span>
                </button>
              </div>

              {/* Secondary Android APK Download / Mobile CTA */}
              <div className="w-full max-w-md space-y-1.5 pt-1">
                <a
                  href="/thinking-english.apk"
                  download="thinking-english.apk"
                  id="download-android-apk-btn"
                  className="flex w-full min-h-12 items-center justify-center gap-2.5 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 hover:bg-teal-50 dark:hover:bg-stone-800 hover:border-teal-600 dark:hover:border-teal-500 py-3 px-5 text-stone-900 dark:text-stone-100 font-bold text-base transition-all shadow-xs group cursor-pointer"
                >
                  <Smartphone size={19} className="text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
                  <span className="truncate">Download Android App 📱</span>
                </a>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium text-center">
                  {isMobile ? (
                    <span>
                      Install the APK directly on your phone for the best experience.
                      <br className="sm:hidden" />
                      <button
                        type="button"
                        onClick={() => setShowInstallGuide(true)}
                        className="underline hover:text-teal-700 dark:hover:text-teal-300 transition ms-1 font-semibold cursor-pointer"
                      >
                        (Or Add to Home Screen instead)
                      </button>
                    </span>
                  ) : (
                    'Install the APK directly on your phone for the best experience.'
                  )}
                </p>
              </div>

              <p className="text-sm font-medium tracking-wide text-stone-700 dark:text-stone-300 font-semibold">
                Built with ❤️ by <span className="font-semibold text-stone-900 dark:text-stone-200">Amr Sherif</span>
              </p>

              <a
                href="https://youtu.be/All6Hz2NWLs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-50/90 px-4 py-2 text-xs font-extrabold text-red-700 shadow-xs transition hover:bg-red-100 hover:text-red-800 hover:shadow-sm dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
              >
                <Youtube size={16} className="text-red-600 dark:text-red-400" aria-hidden="true" />
                <span>🎥 Watch the Story Behind the App</span>
              </a>

              <button
                type="button"
                onClick={() => setShowInstallGuide(true)}
                className="inline-flex items-center gap-2 rounded-lg py-1.5 text-sm font-semibold text-stone-600 underline decoration-stone-300 underline-offset-4 transition hover:text-teal-700 dark:text-stone-300 dark:decoration-stone-600 dark:hover:text-teal-300"
              >
                <Smartphone size={17} aria-hidden="true" />
                📱 Install as an App on your phone
              </button>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              🔒 No tracking · 5,000+ Words &amp; Phrases · Open Source
            </p>
          </div>

          {/* Right Column: Creator Photo */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-teal-500/25 via-emerald-400/20 to-transparent blur-xl dark:from-teal-500/20 dark:via-emerald-500/10"
                />
                <div className="relative overflow-hidden rounded-[2rem] border-4 border-teal-700/80 bg-white shadow-2xl shadow-teal-950/15 dark:border-teal-500/70 dark:bg-stone-900">
                  <img
                    src="/amr.jpg"
                    alt="Amr Sherif"
                    width={320}
                    height={416}
                    className="h-80 w-64 object-cover object-top sm:h-96 sm:w-80 lg:h-[26rem] lg:w-80"
                  />
                  <div className="bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-transparent px-4 pb-3.5 pt-8 text-white">
                    <p className="text-sm font-bold tracking-wide">Amr Sherif</p>
                    <p className="text-xs text-teal-200">Creator of Thinking English</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCv(true)}
                className="relative z-10 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-teal-600/60 bg-white px-5 py-3 text-sm font-bold text-teal-800 shadow-sm transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:bg-stone-900 dark:text-teal-300 dark:hover:bg-stone-800"
              >
                📄 View My CV
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="relative mx-auto mt-10 w-full max-w-6xl border-t border-stone-300 pt-6 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-200 font-medium">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-medium">© 2026 Thinking English · فكّر إنجليزي</p>
          <nav aria-label="Creator social links" className="flex flex-wrap items-center gap-5">
            <a
              href="https://www.linkedin.com/in/sciamrsherif-abdelaal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Linkedin size={16} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/AmrSherifCodes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Github size={16} aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <a
              href="https://youtube.com/@SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Youtube size={16} aria-hidden="true" />
              <span>YouTube</span>
            </a>
            <a
              href="https://www.patreon.com/c/SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-400"
            >
              <Heart size={16} aria-hidden="true" />
              <span>Patreon</span>
              <ExternalLink size={13} aria-hidden="true" className="opacity-65" />
            </a>
          </nav>
        </div>
      </footer>

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
                      {[
                        'Full-Stack Development (React, TypeScript, Tailwind CSS)',
                        'AI & API Integration (Gemini, Serverless Routing)',
                        'Product Strategy & UX Design',
                        'UI/UX & RTL Localization',
                        'Team Leadership & Coaching',
                        'High-Risk De-escalation'
                      ].map(skill => (
                        <li
                          key={skill}
                          className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Volunteering
                    </h3>
                    <div className="border-l-2 border-teal-300 pl-4 dark:border-teal-800">
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        Volunteer — Resala Charity
                      </p>
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                        Jul 2022 – Present
                      </p>
                    </div>
                  </section>
                </div>

                {/* Right column: profile, featured project, experience, internships, education */}
                <div className="space-y-7">
                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Profile
                    </h3>
                    <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                      Results-driven professional bridging the gap between scientific analytical thinking and full-stack software development. Creator of &ldquo;Thinking English&rdquo; (#0), a 100% free, open-source, AI-powered web application that teaches English to Arabic speakers using structural comparison. Combines a strong background in BPO operations (Retention &amp; Sales) with proven technical ability in React, TypeScript, AI API integration (Gemini), and product strategy.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Featured Project
                    </h3>
                    <div className="border-l-2 border-teal-300 pl-4 dark:border-teal-800">
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        Creator &amp; Full-Stack Developer — Thinking English (#0)
                      </p>
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                        Oct 2026 – Present
                      </p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-stone-700 dark:text-stone-300">
                        <li>
                          Built a fully functional, open-source web app deployed on Vercel, designed to help Arabic speakers learn English through cognitive structural bridging.
                        </li>
                        <li>
                          Integrated Gemini AI with a custom fallback system (rate limiting, caching, and a local offline dictionary) to ensure 100% uptime.
                        </li>
                        <li>
                          Engineered a &ldquo;Bring Your Own Key&rdquo; (BYOK) system and localized RTL interface for Arabic users.
                        </li>
                        <li>
                          App code was officially reviewed and selected by the XERJ Corpus Hub as a gold-standard reference for AI coding agents.
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Experience
                    </h3>
                    <div className="border-l-2 border-teal-300 pl-4 dark:border-teal-800">
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        Loyalty (Retention) Specialist — Optimum (Intelcia Egypt)
                      </p>
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                        Jul 2024 – Present
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700 dark:text-stone-300">
                        <li>Handle high-risk retention cases and negotiate tailored solutions.</li>
                        <li>Sell 200+ mobile lines and mentor newcomers.</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Technical Internships
                    </h3>
                    <div className="space-y-4 border-l-2 border-teal-300 pl-4 dark:border-teal-800">
                      <div>
                        <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Industrial Chemistry Intern — Misr Chemical Industries
                        </p>
                        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                          Aug 2025 – Sep 2025
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Wastewater Treatment Intern — Sanitary Drainage Company
                        </p>
                        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                          Summer 2026
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                      Education
                    </h3>
                    <div className="border-l-2 border-teal-300 pl-4 dark:border-teal-800">
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        Faculty of Science, Alexandria University
                      </p>
                      <p className="text-sm text-stone-700 dark:text-stone-300">
                        BSc in Environmental Studies / Chemistry (2023 – Present)
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
                className="w-full rounded-2xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
              >
                Close
              </button>
            </footer>
          </article>
        </div>
      )}

      {showInstallGuide && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
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
                <h2 id="install-guide-title" className="text-xl font-bold">
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
                aria-label="Close install instructions"
                className="rounded-lg p-2 text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-stone-800 dark:hover:text-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 rounded-2xl bg-teal-50 p-3 text-sm leading-relaxed text-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
              على أجهزة iPhone: افتح الصفحة في Safari، واضغط على زر المشاركة (Share)، ثم اختر{' '}
              <strong>Add to Home Screen</strong>.
            </p>
            <a
              href="/thinking-english.apk"
              download="thinking-english.apk"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-teal-700/70 bg-teal-50 dark:bg-stone-800 px-4 py-2.5 text-xs font-bold text-teal-800 dark:text-teal-200 transition hover:bg-teal-100 dark:hover:bg-stone-700 cursor-pointer"
            >
              <Smartphone size={16} aria-hidden="true" />
              <span>أو حمّل ملف الـ APK مباشرة (Android APK Download)</span>
            </a>
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="mt-5 w-full rounded-2xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
            >
              فهمت (Got it)
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
