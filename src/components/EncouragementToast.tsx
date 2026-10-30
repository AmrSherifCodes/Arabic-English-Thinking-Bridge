import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const ENCOURAGEMENT_QUOTES = [
  { english: "You're doing amazing! Keep going.", arabic: 'أنت تتقدم بشكل رائع! استمر.' },
  { english: 'Every small step brings you closer.', arabic: 'خطوة بخطوة، ستصل!' },
  { english: 'Your effort is building something great.', arabic: 'جهدك اليوم يصنع نجاحك غدًا.' },
  { english: 'A little practice goes a long way.', arabic: 'قليل من التدريب يصنع فرقًا كبيرًا.' },
  { english: 'You should be proud of your progress.', arabic: 'افتخر بكل تقدم تحرزه.' }
];

const TOAST_INTERVAL_MS = 3 * 60 * 1000;
const TOAST_DURATION_MS = 5 * 1000;

export function EncouragementToast() {
  const [quoteIndex, setQuoteIndex] = useState<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const showQuote = () => {
      setQuoteIndex(Math.floor(Math.random() * ENCOURAGEMENT_QUOTES.length));
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(
        () => setQuoteIndex(null),
        TOAST_DURATION_MS
      );
    };

    const interval = window.setInterval(showQuote, TOAST_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const quote = quoteIndex === null ? null : ENCOURAGEMENT_QUOTES[quoteIndex];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[900] flex justify-center px-4 sm:bottom-24">
      <AnimatePresence>
        {quote && (
          <motion.div
            key={quoteIndex}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-stone-900 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-stone-900/80 dark:text-white"
          >
            <p className="font-semibold">✨ {quote.english}</p>
            <p dir="rtl" className="ar mt-1 text-sm text-stone-700 dark:text-stone-200">
              {quote.arabic}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
