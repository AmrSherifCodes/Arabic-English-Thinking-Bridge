import React, { useEffect } from 'react';
import { X, MapPin, Mail, GraduationCap, Briefcase, Languages, Award, Sparkles } from 'lucide-react';

export interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CVModal({ isOpen, onClose }: CVModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close CV modal"
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <header className="pr-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Creator & Full-Stack Developer
          </div>
          <h2 id="cv-modal-title" className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
            Amr Sherif Abdelaal Ibrahim
          </h2>
          <div className="flex flex-wrap items-center gap-3.5 mt-2.5 text-xs text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              Alexandria, Egypt
            </span>
            <a
              href="mailto:amrsherifwork@gmail.com"
              className="inline-flex items-center gap-1.5 text-teal-400 hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              amrsherifwork@gmail.com
            </a>
          </div>
        </header>

        {/* Summary */}
        <section className="rounded-2xl bg-stone-950/60 border border-stone-800/80 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
            Executive Summary
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Dedicated Chemistry and Environmental Studies undergraduate combining rigorous laboratory proficiency with practical experience in water quality analysis and industrial chlor-alkali processes. Proven ability to balance a demanding full-time academic schedule with corporate leadership roles.
          </p>
        </section>

        {/* Education */}
        <section className="space-y-2">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
            <GraduationCap className="w-4 h-4 text-teal-400" />
            Education
          </h3>
          <div className="rounded-2xl bg-stone-950/60 border border-stone-800/80 p-4">
            <div className="font-bold text-sm text-stone-100">
              Alexandria University, Faculty of Science
            </div>
            <div className="text-xs text-teal-400 font-medium mt-0.5">
              B.Sc. in Chemistry and Environmental Studies (Expected 2028)
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-2.5">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Briefcase className="w-4 h-4 text-teal-400" />
            Experience
          </h3>
          <div className="space-y-2">
            <div className="rounded-2xl bg-stone-950/60 border border-stone-800/80 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-stone-100">Intelcia Egypt</span>
                <span className="text-[11px] text-teal-400 font-semibold shrink-0">July 2024 – Present</span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Loyalty Specialist & Acting Floor Coach (Optimum Account)
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950/60 border border-stone-800/80 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-stone-100">Sanitary Drainage Company</span>
                <span className="text-[11px] text-stone-400 font-semibold shrink-0">Summer 2026</span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Technical Wastewater Treatment Intern
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950/60 border border-stone-800/80 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-stone-100">Misr Chemical Industries</span>
                <span className="text-[11px] text-stone-400 font-semibold shrink-0">Aug 2025 – Sep 2025</span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Industrial Chemistry Intern
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-2">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Award className="w-4 h-4 text-teal-400" />
            Laboratory & Professional Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Spectrophotometry',
              'Atomic Absorption (AA)',
              'Water Quality Testing',
              'Excel',
              'Cross-functional Team Leadership',
              'Crisis Management'
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-stone-800 text-stone-200 border border-stone-700/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section className="space-y-2">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Languages className="w-4 h-4 text-teal-400" />
            Languages
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-stone-200">Arabic</span>
              <span className="text-stone-400 block mt-0.5">Native</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-stone-200">English</span>
              <span className="text-teal-400 block mt-0.5 font-semibold">Advanced C1</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-stone-200">French</span>
              <span className="text-stone-400 block mt-0.5">Conversational</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-stone-200">Spanish</span>
              <span className="text-stone-400 block mt-0.5">Elementary</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-2 border-t border-stone-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-98 transition font-bold text-sm text-white shadow-lg shadow-teal-900/30"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

