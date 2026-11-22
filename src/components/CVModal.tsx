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
  CheckCircle2,
  SlidersHorizontal,
  Copy,
  Check,
  Download,
  ExternalLink,
} from 'lucide-react';
import { SocialLinks } from './SocialLinks';

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
  const [copiedEmail, setCopiedEmail] = useState(false);
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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('amrsherifwork@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

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
      icon: <Bot className="w-5 h-5 text-cyan-400" />,
      accentColor: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
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
      subtitle: 'Creator of Thinking Bridge · +44,000 Lines of Code · Offline-First PWA & Android',
      icon: <Code2 className="w-5 h-5 text-teal-400" />,
      accentColor: 'border-teal-500/40 bg-teal-950/30 text-teal-300',
      badge: '44K+ Lines',
      summary:
        'Architected and built a complete production-grade language learning ecosystem from scratch (+44,000 lines of code across 188 files) with 111 automated unit tests.',
      highlights: [
        'Engineered +44,000 lines of robust code in React 19, TypeScript, Node.js, and Capacitor 8 spanning 188 modular files with 0 bloated UI frameworks.',
        'Engineered universal cross-browser speech engine with seamless automatic fallback for privacy browsers like Brave and Firefox.',
        'Implemented Anki-grade SM-2 Spaced Repetition mathematical algorithm to handle +10,000 dictionary flashcards.',
        'Packaged lean 28MB native Android APK with Capacitor 8, custom release keystore signing, and haptic feedback integration.',
        'Authored 111/111 automated unit tests covering rate limiters, proxy headers, audio chunks, and SM-2 interval progressions.',
      ],
      skills: ['React 19', 'TypeScript (+44K LOC)', 'Capacitor 8', 'Tailwind CSS', 'SM-2 Algorithm', 'Vite & Workbox PWA', 'Brave/Chrome Audio Engine'],
    },
    {
      id: 'science',
      title: 'Chemist & Environmental Scientist',
      subtitle: 'Alexandria University · Faculty of Science (B.Sc. Expected 2028)',
      icon: <FlaskConical className="w-5 h-5 text-amber-400" />,
      accentColor: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
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
      icon: <Headphones className="w-5 h-5 text-emerald-400" />,
      accentColor: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
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
      accentColor: 'border-sky-500/40 bg-sky-950/30 text-sky-300',
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 pt-safe pb-safe bg-[#060E1A]/90 backdrop-blur-xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#0B1C33]/98 via-[#0E2746]/95 to-[#060E1A]/98 border border-cyan-500/30 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.2)] p-5 sm:p-8 space-y-6 scrollbar-thin">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close CV modal"
          className="absolute top-5 right-5 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile with Alexandrian Ocean Style */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-8">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-gradient-to-br from-cyan-400 via-teal-400 to-amber-400 shadow-lg shadow-cyan-500/20">
              <img
                src="/amr.jpg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/amr-avatar.png';
                }}
                alt="Amr Sherif Abdelaal"
                className="w-full h-full object-cover rounded-[20px] bg-slate-900"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-slate-950 border border-cyan-400 text-cyan-300 text-[10px] font-black shadow-md flex items-center gap-1">
              🌊 Alexandrian
            </span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Polymath Creator & Full-Stack Engineer
            </div>
            <h2 id="cv-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Amr Sherif Abdelaal Ibrahim
            </h2>
            <p className="text-xs font-mono text-cyan-300/90 font-bold" dir="rtl">
              عمرو شريف عبد العال إبراهيم
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-bold">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Alexandria, Egypt 🇪🇬
              </span>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-xl"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedEmail ? 'Copied Email!' : 'amrsherifwork@gmail.com'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Quick Skill Badges Strip */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['Scientist 🔬', 'Floor Coach 🎧', 'Chemist ⚗️', 'Full-Stack Dev 💻', 'AI Tools Expert 🤖', 'Linguist 🗣️'].map((role) => (
            <span
              key={role}
              className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-[#061224] text-cyan-300 border border-cyan-500/25 shadow-sm"
            >
              {role}
            </span>
          ))}
        </div>

        {/* Executive Summary / About */}
        <section className="rounded-3xl bg-[#061224]/90 border border-cyan-500/25 p-4 sm:p-5 shadow-inner space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Executive Summary & Profile</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            Dedicated Chemistry & Environmental Studies undergraduate combining laboratory analytical rigor with real-world corporate leadership and advanced AI-native software engineering. Sole architect and developer of Thinking Bridge—a massive cross-platform ecosystem built from scratch spanning <strong>+44,000 lines of production code</strong> across 188 files (React 19, TypeScript, Node.js serverless streaming, and native Android), backed by 111/111 passing automated tests.
          </p>
        </section>

        {/* Interactive Foldable Roles & Experience */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Interactive Roles & Engineering Milestones</span>
            </h3>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] font-black text-cyan-300 hover:text-cyan-200 transition flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-xl"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {allOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim) => {
              const isOpen = Boolean(openSections[dim.id]);
              return (
                <div
                  key={dim.id}
                  className="rounded-3xl bg-[#061224]/80 border border-cyan-500/25 overflow-hidden transition-all duration-200 shadow-md hover:border-cyan-500/40"
                >
                  {/* Foldable Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(dim.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-cyan-500/5 transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#0B1C33] border border-cyan-500/30 shrink-0 shadow-sm">
                        {dim.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">{dim.title}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${dim.accentColor}`}>
                            {dim.badge}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">{dim.subtitle}</span>
                      </div>
                    </div>
                    <div className="text-slate-400 shrink-0 p-1">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Foldable Body */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 space-y-3 border-t border-cyan-500/20 bg-[#0B1C33]/60">
                      <p className="text-xs text-slate-200 leading-relaxed font-bold">
                        {dim.summary}
                      </p>

                      <div className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 block">
                          Key Achievements & Capabilities:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-200">
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
                            className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-[#061224] text-cyan-300 border border-cyan-500/25 shadow-sm"
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

        {/* Social & Channel Links */}
        <div className="pt-2">
          <SocialLinks />
        </div>

        {/* Footer Actions */}
        <footer className="pt-3 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="w-full sm:w-1/2 py-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copiedEmail ? 'Email Copied!' : 'Copy Contact Email'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition font-black text-xs text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer border border-amber-300"
          >
            Close CV Window ✕
          </button>
        </footer>
      </div>
    </div>
  );
}
