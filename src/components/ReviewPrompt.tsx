import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import type { UserProfile } from '../types';

interface ReviewPromptProps {
  profile?: UserProfile | null;
  onOpenFeedback: () => void;
  onToast?: (msg: string) => void;
  isArabic?: boolean;
}

const DISMISS_KEY = 'thinking_bridge_review_prompt_dismissed_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function ReviewPrompt({
  profile,
  onOpenFeedback,
  isArabic = true
}: ReviewPromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const lastTime = parseInt(dismissedAt, 10);
        if (Date.now() - lastTime < SEVEN_DAYS_MS) {
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // Appears promptly after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      /* ignore */
    }
    setIsVisible(false);
  };

  const handleCardClick = () => {
    setIsVisible(false);
    onOpenFeedback();
  };

  const effectiveIsArabic = profile ? profile.language === 'arabic' : isArabic;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -140, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={handleCardClick}
          dir={effectiveIsArabic ? 'rtl' : 'ltr'}
          className="fixed left-3 bottom-36 z-[9999] cursor-pointer max-w-[280px] sm:max-w-xs rounded-2xl border border-amber-500/50 bg-stone-900/98 p-3 shadow-2xl backdrop-blur-md hover:border-amber-400 transition-all hover:scale-105 active:scale-95 ring-2 ring-amber-500/20"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Star size={16} className="fill-amber-400 text-amber-400 animate-pulse" />
              </span>
              <div className="min-w-0 text-start">
                <h4 className="text-xs font-black text-amber-300 truncate">
                  {effectiveIsArabic ? 'شاركونا رأيكم 🌟' : 'Enjoying Thinking Bridge? 🌟'}
                </h4>
                <p className="text-[10px] font-bold text-stone-200 leading-tight mt-0.5 line-clamp-2">
                  {effectiveIsArabic
                    ? 'صوتك يطور التطبيق ويدعم الفكرة! انقر لترك تقييم 🚀'
                    : 'Your review shapes the app! Tap to leave feedback 🚀'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label={effectiveIsArabic ? 'إغلاق' : 'Close'}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
