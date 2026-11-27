// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';
import { MASCOT_ASSETS, MascotMood } from '../constants/mascotMap';

export interface AmrGuideProps {
  mood: MascotMood;
  isArabic?: boolean;
  size?: number;
  className?: string;
}

/**
 * Reusable 2D Guide Avatar component displaying the 10 transparent 512x512 WebP mascot poses
 * with zero layout shift and smooth CSS spring transitions.
 */
export const AmrGuide: React.FC<AmrGuideProps> = ({
  mood,
  isArabic = true,
  size = 88,
  className = '',
}) => {
  const asset = MASCOT_ASSETS[mood] || MASCOT_ASSETS.welcome;

  return (
    <div
      className={`relative shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        key={mood}
        src={asset.src}
        alt={isArabic ? asset.altAr : asset.altEn}
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain tb-mascot-spring pointer-events-none"
      />
    </div>
  );
};

export interface AmrGuideDockProps {
  visible: boolean;
  mood?: MascotMood;
  messageAr: string;
  messageEn: string;
  isArabic?: boolean;
  pointToSettings?: boolean;
  onDismiss: () => void;
  onAction?: () => void;
}

/**
 * Subtle, non-blocking corner guide dock. Dismisses in 1 tap.
 * Never chains multi-step popup tours.
 */
export const AmrGuideDock: React.FC<AmrGuideDockProps> = ({
  visible,
  mood = 'pointSettings',
  messageAr,
  messageEn,
  isArabic = true,
  pointToSettings = false,
  onDismiss,
  onAction,
}) => {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom,0px))] inset-x-3 sm:inset-x-auto sm:end-5 z-[55] max-w-sm mx-auto sm:mx-0 tb-pop-bounce"
    >
      <div
        onClick={onDismiss}
        className="relative flex items-center gap-3 p-3 rounded-2xl border shadow-2xl cursor-pointer"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'rgba(245, 158, 11, 0.55)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
        }}
      >
        <AmrGuide mood={mood} isArabic={isArabic} size={64} />
        <div className="flex-1 min-w-0 space-y-1 text-start">
          <p className="text-xs sm:text-sm font-bold text-[#F8FAFC] leading-snug">
            {isArabic ? messageAr : messageEn}
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            {pointToSettings && onAction && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                  onAction();
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-[#10B981] text-[#0B1120] cursor-pointer transition active:scale-95"
              >
                {isArabic ? 'افتح الإعدادات ↗' : 'Open Settings ↗'}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#1B2742] text-[#CBD5E1] cursor-pointer"
            >
              {isArabic ? 'تمام ✓' : 'Got it ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
