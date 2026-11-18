import React from 'react';
import { motion } from 'framer-motion';
import { triggerHapticImpact } from '../utils/fx';

export interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('button, a, input, select, textarea, [role="button"]') !==
        event.currentTarget
    ) {
      return;
    }

    triggerHapticImpact();
    onFlip();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    triggerHapticImpact();
    onFlip();
  };

  return (
    <div
      className="flashcard-perspective relative mx-auto w-full max-w-2xl"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        className="flashcard-inner grid w-full grid-cols-1 [grid-template-areas:'card'] cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? 'Flashcard back. Activate to show the Arabic prompt.'
            : 'Flashcard front. Activate to reveal the English translation.'
        }
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d'
        }}
      >
        <div
          className="flashcard-face [grid-area:card] flex min-h-[240px] sm:min-h-[280px] w-full flex-col justify-center"
          aria-hidden={isFlipped}
          inert={isFlipped}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
        >
          {front}
        </div>
        <div
          className="flashcard-face flashcard-back [grid-area:card] flex min-h-[240px] sm:min-h-[280px] w-full flex-col justify-center"
          aria-hidden={!isFlipped}
          inert={!isFlipped}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
