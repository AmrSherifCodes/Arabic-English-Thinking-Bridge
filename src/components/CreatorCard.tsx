import React, { useState } from 'react';
import { CVModal } from './CVModal';
import { Github, Linkedin, Youtube, Mail, MapPin, FileText, Sparkles } from 'lucide-react';

export function CreatorCard() {
  const [isCVOpen, setIsCVOpen] = useState(false);

  return (
    <>
      <section
        className="my-10 mx-auto max-w-2xl px-4"
        dir="rtl"
        aria-label="بطاقة مؤسس المشروع - Founder Card"
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-[#0B1C33]/95 via-[#0E2746]/90 to-[#071325]/95 p-6 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.18)] backdrop-blur-xl transition-all hover:border-cyan-400/60">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
            {/* Portrait Opens Interactive CV Modal */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setIsCVOpen(true)}>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-10 w-max">
                <span className="text-xs font-black text-amber-300 bg-amber-950/90 px-3 py-1 rounded-full shadow-lg border border-amber-500/40 font-arabic whitespace-nowrap">
                  👇 اضغط على صورتي (السيرة الذاتية 📄)
                </span>
              </div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-400 to-amber-400 opacity-80 blur-sm group-hover:opacity-100 transition duration-300" />
              <img
                src="/amr.jpg"
                data-amr-avatar="true"
                onError={(e) => {
                  e.currentTarget.src = '/amr-avatar.png';
                }}
                alt="عمرو شريف عبد العال - Amr Sherif Abdelaal"
                className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-cyan-400 shadow-xl select-none active:scale-95 transition-transform"
                title="عمرو شريف عبد العال · اضغط لفتح السيرة الذاتية"
              />
            </div>

            {/* Creator Info */}
            <div className="space-y-2.5 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3.5 py-1 text-xs font-black text-cyan-300 shadow-sm">
                <Sparkles size={13} className="text-amber-400" />
                <span>المؤسس والمطوّر · Founder & Maintainer 🌊</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-arabic">
                  عمرو شريف عبد العال
                </h3>
                <p className="text-xs font-mono text-cyan-300/90 font-bold dir-ltr text-right">
                  Amr Sherif Abdelaal
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300 font-bold">
                <MapPin size={13} className="text-amber-400" />
                <span>الإسكندرية، مصر · Alexandria, Egypt 🇪🇬</span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-arabic font-medium">
                بنى الفكرة على منهج التفكير (Thinking Method) لميهاليس إليفثريو. مشروع مفتوح المصدر بالكامل (CC0 1.0).
              </p>

              {/* Action Buttons: CV Modal & Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCVOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 border border-amber-300 cursor-pointer"
                >
                  <FileText size={14} />
                  <span>السيرة الذاتية (CV) 📄</span>
                </button>
                <a
                  href="https://github.com/AmrSherifCodes"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub - AmrSherifCodes"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#061224] border border-cyan-500/30 text-xs font-bold text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                >
                  <Github size={14} className="text-cyan-400" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/sciamrsherif-abdelaal"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn - Amr Sherif Abdelaal"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#061224] border border-cyan-500/30 text-xs font-bold text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                >
                  <Linkedin size={14} className="text-blue-400" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://youtube.com/@SciAmrSherif"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube - @SciAmrSherif"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#061224] border border-cyan-500/30 text-xs font-bold text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                >
                  <Youtube size={14} className="text-rose-400" />
                  <span>YouTube</span>
                </a>
                <a
                  href="mailto:amrsherifwork@gmail.com"
                  aria-label="البريد الإلكتروني"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#061224] border border-cyan-500/30 text-xs font-bold text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                >
                  <Mail size={14} className="text-amber-400" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Rule 8 Attribution Footer */}
          <div className="mt-5 pt-3 border-t border-cyan-500/20 text-center sm:text-right text-[11px] text-slate-400 font-mono">
            Built in Alexandria, Egypt. Powered by Mihalis Eleftheriou's Thinking Method.
          </div>
        </div>
      </section>

      <CVModal isOpen={isCVOpen} onClose={() => setIsCVOpen(false)} />
    </>
  );
}
