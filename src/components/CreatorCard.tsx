import React, { useState } from 'react';
import { MutahEasterEggModal } from './MutahEasterEggModal';
import { CVModal } from './CVModal';
import { Github, Linkedin, Youtube, Twitter, Mail, MapPin } from 'lucide-react';

export function CreatorCard() {
  const [tapCount, setTapCount] = useState(0);
  const [isPoemOpen, setIsPoemOpen] = useState(false);
  const [isCVOpen, setIsCVOpen] = useState(false);

  const handlePhotoClick = () => {
    setIsCVOpen(true);
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    if (nextCount === 8) {
      setIsPoemOpen(true);
    }
  };

  return (
    <>
      <section
        className="my-10 mx-auto max-w-2xl px-4"
        dir="rtl"
        aria-label="بطاقة مؤسس المشروع - Founder Card"
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-[#0E151D]/90 p-6 sm:p-7 shadow-[0_0_35px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all hover:border-emerald-400/60">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
            {/* Interactive Portrait with 8-tap Battle of Mu'tah Easter Egg */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={handlePhotoClick}>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-10 w-max">
                <span className="text-xs font-black text-amber-400 bg-amber-950/80 px-2 py-1 rounded-full shadow-lg border border-amber-500/30 font-arabic whitespace-nowrap">
                  👇 اضغط على صورتي لرؤية السيرة الذاتية / Click for CV
                </span>
              </div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
              <img
                src="/amr.jpg"
                data-amr-avatar="true"
                onError={(e) => {
                  e.currentTarget.src = '/amr-avatar.png';
                }}
                alt="عمرو شريف عبد العال - Amr Sherif Abdelaal"
                className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-emerald-400 shadow-md select-none active:scale-95 transition-transform"
                title="عمرو شريف عبد العال · اضغط للتعرف على المزيد"
              />
              {tapCount > 0 && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 font-extrabold text-[11px] text-black shadow-lg animate-pulse">
                  {tapCount}
                </span>
              )}
            </div>

            {/* Creator Info */}
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>المؤسس والمطوّر · Founder & Maintainer</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#EEF2F5] font-arabic">
                  عمرو شريف عبد العال
                </h3>
                <p className="text-xs font-mono text-emerald-400/90 font-medium dir-ltr text-right">
                  Amr Sherif Abdelaal
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                <MapPin size={13} className="text-amber-400" />
                <span>الإسكندرية، مصر · Alexandria, Egypt</span>
              </div>

              <p className="text-sm leading-relaxed text-[#9AA7B2] font-arabic">
                بنى الفكرة على منهج التفكير (Thinking Method) لميهاليس إليفثريو. مشروع مفتوح المصدر بالكامل (CC0 1.0).
              </p>
              <p className="text-xs text-slate-400 dir-ltr text-right font-sans">
                Built on Mihalis Eleftheriou's Thinking Method. Fully open source (CC0 1.0).
              </p>

              {/* Social & Contact Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <a
                  href="https://github.com/AmrSherifCodes"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub - AmrSherifCodes (يفتح في نافذة جديدة)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/sciamrsherif-abdelaal"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn - Amr Sherif Abdelaal (يفتح في نافذة جديدة)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://youtube.com/@SciAmrSherif"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube - @SciAmrSherif (يفتح في نافذة جديدة)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                >
                  <Youtube size={14} />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://x.com/SciAmrSherif"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter) - @SciAmrSherif (يفتح في نافذة جديدة)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                >
                  <Twitter size={14} />
                  <span>X</span>
                </a>
                <a
                  href="mailto:amrsherifwork@gmail.com"
                  aria-label="البريد الإلكتروني - Email Amr Sherif"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                >
                  <Mail size={14} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Rule 8 Attribution Footer */}
          <div className="mt-5 pt-3 border-t border-slate-800 text-center sm:text-right text-[11px] text-slate-400">
            With thanks to Mihalis Eleftheriou and Language Transfer for the Thinking Method.
          </div>
        </div>
      </section>

      {/* 8-Tap Battle of Mu'tah Easter Egg Modal */}
      <MutahEasterEggModal
        isOpen={isPoemOpen}
        onClose={() => {
          setIsPoemOpen(false);
          setTapCount(0);
        }}
      />

      <CVModal isOpen={isCVOpen} onClose={() => setIsCVOpen(false)} />
    </>
  );
}
