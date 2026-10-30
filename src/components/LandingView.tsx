import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Github, Heart, Linkedin, Smartphone, X } from 'lucide-react';

interface LandingViewProps {
  onStartWebApp: () => void;
}

export function LandingView({ onStartWebApp }: LandingViewProps) {
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    if (!showInstallGuide) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowInstallGuide(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showInstallGuide]);

  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-[#fffdf9] px-5 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8 sm:py-12">
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-orange-100/50 dark:from-slate-950/20 dark:to-orange-950/20"
      />

      <div className="relative mx-auto my-auto w-full max-w-6xl py-4">
        <div className="mb-8 flex items-center gap-2 text-sm font-bold tracking-wide text-orange-700 dark:text-orange-300 sm:mb-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60">
            <BookOpen size={19} aria-hidden="true" />
          </span>
          THINKING ENGLISH
        </div>

        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7">
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Master English
              <span className="block bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                the Smart Way
              </span>
            </h1>
            <p
              dir="rtl"
              className="ar mt-5 text-3xl font-bold leading-relaxed text-slate-700 dark:text-slate-200 sm:text-4xl"
            >
              تعلم الإنجليزية بذكاء
            </p>
            <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
              100% Free, Open Source, and Private. No Ads. No Subscriptions.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4">
              <button
                type="button"
                onClick={onStartWebApp}
                className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-orange-600 px-8 py-4 text-lg font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                <span>
                  <span className="block">Start Learning Now 🚀</span>
                  <span dir="rtl" className="ar mt-0.5 block text-base">
                    ابدأ التعلم الآن
                  </span>
                </span>
                <ArrowRight size={20} aria-hidden="true" />
              </button>

              <p className="text-sm font-medium tracking-wide text-slate-600 dark:text-slate-400">
                Built with ❤️ by <span className="font-semibold text-slate-900 dark:text-slate-200">Amr Sherif</span>
              </p>

              <button
                type="button"
                onClick={() => setShowInstallGuide(true)}
                className="inline-flex items-center gap-2 rounded-lg py-1.5 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-orange-700 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-orange-300"
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
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-orange-500/25 via-amber-400/20 to-transparent blur-xl dark:from-orange-500/20 dark:via-amber-500/10"
              />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-orange-500/80 bg-white shadow-2xl shadow-orange-950/15 dark:border-orange-400/70 dark:bg-slate-900">
                <img
                  src="/amr.jpg"
                  alt="Amr Sherif"
                  className="h-80 w-64 object-cover object-top sm:h-96 sm:w-80 lg:h-[26rem] lg:w-80"
                />
                <div className="bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent px-4 pb-3.5 pt-8 text-white">
                  <p className="text-sm font-bold tracking-wide">Amr Sherif</p>
                  <p className="text-xs text-orange-200">Creator of Thinking English</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="relative mx-auto mt-10 w-full max-w-6xl border-t border-slate-200/80 pt-6 text-sm text-slate-600 dark:border-slate-800/80 dark:text-slate-400">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-medium">© 2026 Thinking English.</p>
          <nav aria-label="Creator social links" className="flex flex-wrap items-center gap-5">
            <a
              href="https://www.linkedin.com/in/sciamrsherif-abdelaal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 transition hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400"
            >
              <Linkedin size={16} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/AmrSherifCodes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 transition hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400"
            >
              <Github size={16} aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.patreon.com/c/SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 transition hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400"
            >
              <Heart size={16} aria-hidden="true" />
              <span>Patreon</span>
              <ExternalLink size={13} aria-hidden="true" className="opacity-65" />
            </a>
          </nav>
        </div>
      </footer>

      {showInstallGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowInstallGuide(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="install-guide-title" className="text-xl font-bold">
                  Install Thinking English
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Open your browser menu and choose <strong>Add to Home Screen</strong> or{' '}
                  <strong>Install app</strong>. The exact wording depends on your phone and browser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                aria-label="Close install instructions"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm leading-relaxed text-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
              On iPhone, open this page in Safari, tap the Share button, then tap{' '}
              <strong>Add to Home Screen</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="mt-5 w-full rounded-xl bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
