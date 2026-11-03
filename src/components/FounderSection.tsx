import React from 'react';
import { Github, Linkedin, ExternalLink, Code2, Sparkles, Award } from 'lucide-react';

interface FounderSectionProps {
  isArabic?: boolean;
}

export function FounderSection({ isArabic = true }: FounderSectionProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-16" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="relative rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-surface)]/80 backdrop-blur-xl p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--landing-accent-teal)]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[var(--landing-secondary-amber)]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
          {/* Avatar Card */}
          <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-1 bg-gradient-to-tr from-[var(--landing-accent-teal)] via-[var(--landing-secondary-amber)] to-emerald-400 shadow-xl">
                <img
                  src="/amr-avatar.png"
                  alt="Amr Sherif"
                  onError={(e) => {
                    // Fallback to amr.jpg if avatar fails
                    (e.target as HTMLImageElement).src = '/amr.jpg';
                  }}
                  className="w-full h-full object-cover rounded-[22px] bg-stone-900"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-stone-950 border border-[var(--landing-accent-teal)] text-[var(--landing-accent-teal)] text-[10px] font-black tracking-wide shadow-md flex items-center gap-1">
                <Sparkles size={12} />
                <span>Solo Builder</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Amr Sherif</h3>
              <p className="text-xs text-[var(--landing-accent-teal)] font-bold">
                {isArabic ? 'مهندس برمجيات ومؤسس المشروع' : 'Software Engineer & Founder'}
              </p>
              <p className="text-[11px] text-[var(--landing-muted)] mt-0.5">Alexandria, Egypt 🇪🇬</p>
            </div>

            {/* Clickable Social Badges */}
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <a
                href="https://github.com/AmrSherifCodes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold hover:border-[var(--landing-accent-teal)] hover:text-white transition shadow-sm"
              >
                <Github size={14} className="text-[var(--landing-accent-teal)]" />
                <span>@AmrSherifCodes</span>
              </a>

              <a
                href="https://linkedin.com/in/sciamrsherif-abdelaal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold hover:border-blue-400 hover:text-white transition shadow-sm"
              >
                <Linkedin size={14} className="text-blue-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://tiktok.com/@sciamrsherif"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold hover:border-pink-500 hover:text-white transition shadow-sm"
              >
                <span className="text-pink-400 font-black text-xs">♪</span>
                <span>@sciamrsherif</span>
              </a>

              <a
                href="https://x.com/sciamrsherif"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold hover:border-[var(--landing-secondary-amber)] hover:text-white transition shadow-sm"
              >
                <span className="text-[var(--landing-secondary-amber)] font-black text-xs">𝕏</span>
                <span>@sciamrsherif</span>
              </a>
            </div>
          </div>

          {/* Bio & Open-Source Mission Content */}
          <div className="md:col-span-8 space-y-5 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--landing-accent-teal)]/10 border border-[var(--landing-accent-teal)]/30 text-[var(--landing-accent-teal)] text-xs font-black">
              <Award size={14} />
              <span>{isArabic ? 'رسالة المشروع للمجتمع' : 'Open Source Public Mission'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {isArabic ? (
                <>
                  بناء تقني مستقل{' '}
                  <span className="text-[var(--landing-accent-teal)]">لنفع المتحدث العربي</span> عالمياً.
                </>
              ) : (
                <>
                  Independent engineering{' '}
                  <span className="text-[var(--landing-accent-teal)]">built for the cognitive freedom</span> of Arabic speakers.
                </>
              )}
            </h2>

            <p className="text-sm text-[var(--landing-muted)] leading-relaxed">
              {isArabic
                ? 'تم تصميم وبناء جسر التفكير كحل هندسي جذري للتخلص من معضلة الترجمة التلقائية وحفظ الكلمات المنفصلة. تطبيق مجاني 100% مفتوح المصدر يعمل بدون إنترنت من كود واحد لكافة المنصات (Android APK، الويب PWA، وسطح المكتب).'
                : 'Thinking Bridge was architected to break direct-translation interference through cognitive structural modeling. 100% free and open-source under CC0, running offline on all devices from a single unified codebase.'}
            </p>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-start space-y-1">
                <span className="text-lg font-black text-[var(--landing-accent-teal)] block">27</span>
                <span className="text-[11px] text-[var(--landing-muted)] font-bold block">
                  {isArabic ? 'مستوى تفاعلي كامل' : 'Interactive Levels'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-start space-y-1">
                <span className="text-lg font-black text-[var(--landing-secondary-amber)] block">4,090+</span>
                <span className="text-[11px] text-[var(--landing-muted)] font-bold block">
                  {isArabic ? 'بطاقة استرجاع متباعد' : 'Spaced Repetition Cards'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-start space-y-1">
                <span className="text-lg font-black text-emerald-400 block">0 EGP</span>
                <span className="text-[11px] text-[var(--landing-muted)] font-bold block">
                  {isArabic ? 'مجاني للأبد بدون إعلانات' : 'Free Forever · Zero Ads'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-[var(--landing-accent-teal)] hover:underline"
              >
                <Code2 size={16} />
                <span>{isArabic ? 'استعراض الكود المصدري على GitHub' : 'Inspect the source code on GitHub'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
