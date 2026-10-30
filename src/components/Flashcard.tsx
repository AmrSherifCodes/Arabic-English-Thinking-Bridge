import React from 'react';

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

    onFlip();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    onFlip();
  };

  return (
    <div
      className="flashcard-perspective relative mx-auto h-[320px] w-full max-w-2xl md:h-[360px]"
      style={{ perspective: '1200px' }}
    >
      <div
        className="flashcard-inner absolute inset-0"
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
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 500ms',
          transform: `rotateY(${isFlipped ? 180 : 0}deg)`
        }}
      >
        <div
          className="flashcard-face absolute inset-0 h-full w-full overflow-y-auto"
          aria-hidden={isFlipped}
          inert={isFlipped}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
        >
          {front}
        </div>
        <div
          className="flashcard-face flashcard-back absolute inset-0 h-full w-full overflow-y-auto"
          aria-hidden={!isFlipped}
          inert={!isFlipped}
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
