/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React from 'react';

interface TeaCupsProps {
  teaCups: number; // 0 to 3
  supporterMode?: boolean;
}

export const TeaCups: React.FC<TeaCupsProps> = ({ teaCups, supporterMode = false }) => {
  const maxCups = 3;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 border border-amber-900/40 backdrop-blur-sm"
      aria-label={`الشاي: ${teaCups} من 3`}
    >
      <span className="text-xs text-amber-300 font-bold ml-1 font-arabic">الشاي:</span>
      {Array.from({ length: maxCups }).map((_, i) => {
        const isFilled = i < teaCups;

        return (
          <div
            key={i}
            className={`relative transition-all duration-300 ${
              isFilled ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'
            }`}
            data-supporter={supporterMode ? 'true' : undefined}
          >
            <svg
              className={`w-5 h-5 ${
                supporterMode && isFilled
                  ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(212,169,74,0.6)]'
                  : isFilled
                  ? 'text-amber-500'
                  : 'text-stone-600'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Egyptian tea glass SVG outline */}
              <path d="M6 3h12v2H6V3zm1 3h10l-1.5 13a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6 6zm3 3v6m3-6v6" />
            </svg>

            {/* Supporter Mode Steam curl animation */}
            {supporterMode && isFilled && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-amber-200/60 rounded-full animate-ping opacity-75" />
            )}
          </div>
        );
      })}
    </div>
  );
};
