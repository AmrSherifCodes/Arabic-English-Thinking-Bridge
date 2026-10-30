import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Smartphone, X } from 'lucide-react';

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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#fffdf9] px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
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

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-10 flex items-center gap-2 text-sm font-bold tracking-wide text-orange-700 dark:text-orange-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60">
            <BookOpen size={19} aria-hidden="true" />
          </span>
          THINKING ENGLISH
        </div>

        <section className="max-w-4xl">
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white sm:text-7xl lg:text-8xl">
            Master English
            <span className="block bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              the Smart Way
            </span>
          </h1>
          <p
            dir="rtl"
            className="ar mt-6 text-3xl font-bold leading-relaxed text-slate-700 dark:text-slate-200 sm:text-4xl"
          >
            تعلم الإنجليزية بذكاء
          </p>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
            100% Free, Open Source, and Private. No Ads. No Subscriptions.
          </p>

          <div className="mt-9 flex flex-col items-start gap-5">
            <button
              type="button"
              onClick={onStartWebApp}
              className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-orange-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-orange-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <span>
                <span className="block">Start Learning Now 🚀</span>
                <span dir="rtl" className="ar mt-0.5 block text-base">
                  ابدأ التعلم الآن
                </span>
              </span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowInstallGuide(true)}
              className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-orange-700 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-orange-300"
            >
              <Smartphone size={17} aria-hidden="true" />
              📱 Install as an App on your phone
            </button>
          </div>

          <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            🔒 No tracking · 100% CC0 Open Source
          </p>
        </section>
      </div>

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
