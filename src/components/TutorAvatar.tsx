import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TutorAvatarProps {
  isSpeaking?: boolean;
  expression?: 'happy' | 'thinking' | 'celebrating' | 'neutral';
  speechText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const TutorAvatar: React.FC<TutorAvatarProps> = ({
  isSpeaking = false,
  expression = 'happy',
  speechText,
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeMap = {
    sm: { img: 'w-14 h-14', text: 'text-xs' },
    md: { img: 'w-20 h-20', text: 'text-sm' },
    lg: { img: 'w-24 h-24', text: 'text-base' },
    xl: { img: 'w-28 h-28', text: 'text-lg' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3.5 sm:gap-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Avatar Container with Animated Glow */}
      <div className="relative shrink-0 select-none">
        {/* Animated aura ring when speaking */}
        {isSpeaking && (
          <span
            aria-hidden="true"
            className="absolute -inset-1.5 rounded-full bg-teal-500/30 animate-ping pointer-events-none"
          />
        )}
        {expression === 'thinking' && !isSpeaking && (
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-full bg-amber-500/20 animate-pulse pointer-events-none"
          />
        )}

        {/* Framer-motion wrap around <img> */}
        <motion.div
          animate={
            isSpeaking
              ? { y: [0, -5, 0] }
              : expression === 'thinking'
              ? { rotate: [0, 5, -5, 0] }
              : { y: [0, -2, 0] }
          }
          transition={{
            repeat: Infinity,
            duration: isSpeaking ? 0.45 : expression === 'thinking' ? 2.2 : 3.5,
            ease: 'easeInOut'
          }}
          className="relative"
        >
          <img
            src="/amr-avatar.png"
            alt="Amr - AI Tutor"
            className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-lg"
          />
        </motion.div>
      </div>

      {/* Floating Speech Bubble */}
      {speechText && (
        <AnimatePresence mode="wait">
          <motion.div
            key={speechText}
            initial={{ opacity: 0, y: 5, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative flex-1 rounded-2xl bg-white dark:bg-stone-900 border border-teal-500/35 p-3.5 sm:p-4 shadow-md text-stone-900 dark:text-stone-100"
          >
            {/* Pointer arrow to avatar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -left-2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white dark:border-r-stone-900 rtl:left-auto rtl:-right-2 rtl:border-r-0 rtl:border-l-8 rtl:border-l-white dark:rtl:border-l-stone-900 filter drop-shadow-[0_1px_1px_rgba(13,148,136,0.3)]"
            />
            <p className={`font-bold leading-relaxed ${currentSize.text}`}>
              {speechText}
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
