import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WhyEnglishViewProps {
  onClose: () => void;
}

const REASONS = [
  {
    title: 'Global Communication',
    titleAr: 'تواصل عالمي',
    explanation: 'Connect with people from around the world, wherever life takes you.',
    explanationAr: 'تواصل مع أشخاص من جميع أنحاء العالم أينما تأخذك الحياة.'
  },
  {
    title: 'Career & Business',
    titleAr: 'فرص عمل وأعمال',
    explanation: 'Open doors to new careers, partnerships, and opportunities.',
    explanationAr: 'افتح أبوابًا لوظائف وشراكات وفرص جديدة.'
  },
  {
    title: 'Access to Knowledge',
    titleAr: 'الوصول إلى المعرفة',
    explanation: 'Explore books, courses, and ideas from across the globe.',
    explanationAr: 'اكتشف الكتب والدورات والأفكار من مختلف أنحاء العالم.'
  },
  {
    title: 'Travel Confidence',
    titleAr: 'الثقة في السفر',
    explanation: 'Ask for directions, make plans, and feel more at home abroad.',
    explanationAr: 'اسأل عن الاتجاهات وخطط لرحلتك واشعر براحة أكبر في الخارج.'
  },
  {
    title: 'Technology & Internet',
    titleAr: 'التكنولوجيا والإنترنت',
    explanation: 'Understand the tools and communities shaping our digital world.',
    explanationAr: 'افهم الأدوات والمجتمعات التي تشكّل عالمنا الرقمي.'
  },
  {
    title: 'Higher Education',
    titleAr: 'التعليم العالي',
    explanation: 'Reach more study programs and learn from more teachers.',
    explanationAr: 'استفد من برامج دراسية أكثر وتعلّم من مزيد من المعلمين.'
  },
  {
    title: 'Brain Health',
    titleAr: 'صحة الدماغ',
    explanation: 'Learning a language gives your mind a rewarding daily workout.',
    explanationAr: 'يمنح تعلّم اللغة ذهنك تمرينًا يوميًا مفيدًا.'
  },
  {
    title: 'Cultural Connection',
    titleAr: 'التواصل الثقافي',
    explanation: 'Discover stories, humor, and perspectives from other cultures.',
    explanationAr: 'اكتشف القصص والفكاهة ووجهات النظر في ثقافات أخرى.'
  },
  {
    title: 'Making Friends',
    titleAr: 'تكوين صداقات',
    explanation: 'Share conversations and build friendships across borders.',
    explanationAr: 'تبادل الأحاديث وابنِ صداقات تتجاوز الحدود.'
  },
  {
    title: 'Personal Growth',
    titleAr: 'النمو الشخصي',
    explanation: 'Every new phrase is proof of how far you can go.',
    explanationAr: 'كل عبارة جديدة دليل على ما يمكنك تحقيقه.'
  }
] as const;

export function WhyEnglishView({ onClose }: WhyEnglishViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastReason = activeIndex === REASONS.length - 1;
  const reason = REASONS[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && activeIndex < REASONS.length - 1) {
        setActiveIndex(index => Math.min(index + 1, REASONS.length - 1));
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex(index => Math.max(index - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, onClose]);

  const advance = () => {
    if (!isLastReason) setActiveIndex(index => index + 1);
  };

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="Why learn English story"
      onClick={advance}
      className="fixed inset-0 z-[980] flex min-h-0 flex-col overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white"
    >
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
          <BookOpen size={18} aria-hidden="true" />
          <span>Why Learn English?</span>
        </div>
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="Close story"
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
        >
          <X size={21} aria-hidden="true" />
        </button>
      </header>

      <div className="mx-auto mt-5 w-full max-w-2xl" aria-label={`Reason ${activeIndex + 1} of ${REASONS.length}`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-indigo-300"
            style={{ width: `${((activeIndex + 1) / REASONS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs font-medium text-indigo-100">
          {activeIndex + 1} of {REASONS.length}
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center py-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="w-full cursor-pointer rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl sm:p-10"
            onClick={advance}
          >
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">
              A reason to begin
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
              {reason.title}
            </h1>
            <p dir="rtl" className="mt-3 text-xl font-semibold text-indigo-100 sm:text-2xl">
              {reason.titleAr}
            </p>
            <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-slate-100 sm:text-xl">
              {reason.explanation}
            </p>
            <p
              dir="rtl"
              className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              {reason.explanationAr}
            </p>
          </motion.article>
        </AnimatePresence>
      </div>

      <footer className="mx-auto flex w-full max-w-2xl justify-center">
        {isLastReason ? (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              onClose();
            }}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-indigo-400 px-6 py-3 font-bold text-slate-950 hover:bg-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Start My Journey 🚀
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              advance();
            }}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
          >
            Next
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  );
}
