import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Mail,
  GraduationCap,
  Briefcase,
  Languages,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Headphones,
  Code2,
  Bot,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Dimension {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  badge: string;
  summary: string;
  highlights: string[];
  skills: string[];
}

export function CVModal({ isOpen, onClose }: CVModalProps) {
  // Accordion state: by default, show AI & Software open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    ai: true,
    software: true,
    science: false,
    leadership: false,
    languages: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allOpen = Object.values(openSections).every(Boolean);

  const toggleAll = () => {
    const nextState = !allOpen;
    setOpenSections({
      ai: nextState,
      software: nextState,
      science: nextState,
      leadership: nextState,
      languages: nextState,
    });
  };

  const dimensions: Dimension[] = [
    {
      id: 'ai',
      title: 'AI Tools & Agentic Architect',
      subtitle: 'Prompt Engineering · LLM Pipelines · Real-Time Audio',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      accentColor: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
      badge: 'Core Superpower',
      summary:
        'Architected real-time conversational AI workflows with sub-second voice latency and automated Socratic feedback.',
      highlights: [
        'Orchestrated Google Gemini 2.5 Flash with Serverless HTTP streaming for live cognitive grammar diagnosis.',
        'Engineered parallel TTS prefetching engine with Microsoft Edge Neural Voices, dropping voice latency under 500ms.',
        'Designed Socratic prompt architecture that analyzes Arabic L1 linguistic interference patterns without breaking privacy.',
        'Built full autonomous pair-programming workflows with DeepMind Antigravity agentic coding assistants.',
      ],
      skills: ['Google Gemini API', 'Edge-TTS Streaming', 'Agentic Pairing', 'Prompt Engineering', 'Speech Synthesis', 'Latency Profiling'],
    },
    {
      id: 'software',
      title: 'Full-Stack & Mobile Software Engineer',
      subtitle: 'Creator of Thinking Bridge · Offline-First PWA & Native Android',
      icon: <Code2 className="w-5 h-5 text-teal-400" />,
      accentColor: 'border-teal-500/30 bg-teal-950/20 text-teal-300',
      badge: 'Creator',
      summary:
        'Built a complete cross-platform language learning ecosystem from scratch with 98 automated unit tests.',
      highlights: [
        'Built modern frontend in React 19, TypeScript, and Vite with 60 FPS mobile transitions and dark theme styling.',
        'Implemented Anki-grade SM-2 Spaced Repetition mathematical algorithm to handle +10,000 dictionary flashcards.',
        'Packaged native Android APK with Capacitor 8, custom release keystore signing, and haptic feedback integration.',
        'Authored 98/98 unit tests covering rate limiters, proxy headers, audio chunks, and SM-2 interval progressions.',
      ],
      skills: ['React 19', 'TypeScript', 'Capacitor 8', 'Tailwind CSS', 'SM-2 Algorithm', 'Vite & Workbox PWA', 'Android Studio'],
    },
    {
      id: 'science',
      title: 'Chemist & Environmental Scientist',
      subtitle: 'Alexandria University · Faculty of Science (B.Sc. Expected 2028)',
      icon: <FlaskConical className="w-5 h-5 text-emerald-400" />,
      accentColor: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
      badge: 'Academic Science',
      summary:
        'Rigorous laboratory proficiency in instrumental chemical analysis, environmental monitoring, and industrial chlor-alkali processes.',
      highlights: [
        'Sanitary Drainage Company (Summer 2026): Conducted technical wastewater treatment testing, BOD/COD analysis, and effluent validation.',
        'Misr Chemical Industries (Aug–Sep 2025): Hands-on industrial chlor-alkali production, cell chemistry, and occupational safety.',
        'Extensive benchwork in spectrophotometry, atomic absorption (AA), volumetric titrations, and chemical safety standards.',
        'Trained in precision analytical thinking—applying laboratory-grade rigor to software architecture and debugging.',
      ],
      skills: ['Spectrophotometry', 'Atomic Absorption (AA)', 'Wastewater Quality Testing', 'Industrial Chlor-Alkali', 'Hazardous Materials'],
    },
    {
      id: 'leadership',
      title: 'Call Center Specialist & Floor Coach',
      subtitle: 'Intelcia Egypt · Optimum Corporate Account (July 2024 – Present)',
      icon: <Headphones className="w-5 h-5 text-amber-400" />,
      accentColor: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
      badge: 'Corporate Leadership',
      summary:
        'Loyalty retention specialist and acting floor coach managing high-stakes client relationships and agent mentorship.',
      highlights: [
        'Coached and guided floor agents in active de-escalation, conflict resolution, and retention strategies.',
        'Consistently exceeded quarterly KPIs in customer loyalty, save rate, and CSAT benchmarks.',
        'Successfully balanced demanding full-time university science laboratory courses with high-paced corporate responsibilities.',
        'Mastered rapid crisis management and cross-functional corporate communications under pressure.',
      ],
      skills: ['Customer Retention', 'Floor Coaching & Mentorship', 'Conflict De-escalation', 'Crisis Management', 'KPI Optimization'],
    },
    {
      id: 'languages',
      title: 'Language Expert & Cognitive Pedagogy',
      subtitle: 'Multilingual Polyglot · Arabic Dialect & Cognitive Transfer Specialist',
      icon: <Languages className="w-5 h-5 text-sky-400" />,
      accentColor: 'border-sky-500/30 bg-sky-950/20 text-sky-300',
      badge: 'Pedagogy',
      summary:
        'Expert in eliminating Arabic-English language interference traps through structured thinking methods.',
      highlights: [
        'Curated and validated +10,000 lexical entries with strict dialect isolation between Egyptian Ammiya and Fusha.',
        'Designed curriculum drills targeting Arabic syntactic transfer traps (e.g., copula omission, preposition mismatches).',
        'Fluent in Arabic (Native) and English (Advanced C1); conversational French and elementary Spanish.',
        'Advocate of open educational access governed by a non-profit open-source Constitution (CC0 1.0).',
      ],
      skills: ['Arabic (Native Ammiya & MSA)', 'English (Advanced C1)', 'French (Conversational)', 'Spanish (Elementary)', 'L1 Interference Analysis'],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl p-5 sm:p-7 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close CV modal"
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile */}
        <header className="pr-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Polymath Creator & Software Builder
          </div>
          <h2 id="cv-modal-title" className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
            Amr Sherif Abdelaal Ibrahim
          </h2>
          <div className="flex flex-wrap items-center gap-3.5 mt-2.5 text-xs text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              Alexandria, Egypt 🇪🇬
            </span>
            <a
              href="mailto:amrsherifwork@gmail.com"
              className="inline-flex items-center gap-1.5 text-teal-400 hover:underline font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              amrsherifwork@gmail.com
            </a>
          </div>

          {/* Quick Pillars Strip */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {['Scientist', 'Floor Coach', 'Student', 'Full-Stack Dev', 'AI Tools Expert', 'Linguist'].map((role) => (
              <span
                key={role}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-stone-800/80 text-stone-300 border border-stone-700/60"
              >
                {role}
              </span>
            ))}
          </div>
        </header>

        {/* Executive Summary */}
        <section className="rounded-2xl bg-stone-950/70 border border-stone-800/80 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
            Executive Summary
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Dedicated Chemistry and Environmental Studies undergraduate combining laboratory proficiency with real-world corporate leadership and advanced AI-native software engineering. Proven ability to balance demanding full-time university laboratory research with high-performance team coaching and building production-grade, offline-first applications.
          </p>
        </section>

        {/* Interactive Foldable Roles & Experience */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
              <Briefcase className="w-4 h-4 text-teal-400" />
              Interactive Roles & Project Milestones
            </h3>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {allOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          <div className="space-y-2.5">
            {dimensions.map((dim) => {
              const isOpen = Boolean(openSections[dim.id]);
              return (
                <div
                  key={dim.id}
                  className="rounded-2xl bg-stone-950/70 border border-stone-800/80 overflow-hidden transition-all duration-200"
                >
                  {/* Foldable Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(dim.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-stone-800/30 transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 shrink-0">
                        {dim.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-100">{dim.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dim.accentColor}`}>
                            {dim.badge}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 block mt-0.5">{dim.subtitle}</span>
                      </div>
                    </div>
                    <div className="text-stone-400 shrink-0 p-1">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Foldable Body */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-stone-800/50 bg-stone-900/40">
                      <p className="text-xs text-stone-300 leading-relaxed font-medium">
                        {dim.summary}
                      </p>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                          Key Achievements & Learned Capabilities:
                        </span>
                        <ul className="space-y-1.5 text-xs text-stone-300">
                          {dim.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {dim.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-2 border-t border-stone-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-98 transition font-bold text-sm text-white shadow-lg shadow-teal-900/30 cursor-pointer"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
