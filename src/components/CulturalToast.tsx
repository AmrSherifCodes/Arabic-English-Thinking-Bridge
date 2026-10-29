import React from 'react';
import { CulturalQuote } from '../utils/culturalIdentity';

export interface OliveBranchIconProps {
  className?: string;
  size?: number;
  title?: string;
}

/**
 * Tiny, artisanal SVG olive branch icon celebrating Mediterranean & Pan-Arab heritage,
 * Sumud (steadfastness), and peaceful growth.
 */
export function OliveBranchIcon({
  className = 'text-olive-600 dark:text-olive-400',
  size = 18,
  title = 'Olive Branch · رمز الصمود والسلام'
}: OliveBranchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Gracefully arched olive stem */}
      <path
        d="M3.5 19.5C7.5 15.5 13 10.5 20.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Upper-left olive leaf */}
      <path
        d="M14.5 9.2C13.8 6.4 15.4 4.3 17.9 4.1C18.1 6.6 16.7 8.5 14.5 9.2Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Mid-left olive leaf */}
      <path
        d="M9.8 13.2C8.8 10.2 10.3 7.8 13 7.5C13.3 10.2 11.9 12.3 9.8 13.2Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Lower-left olive leaf */}
      <path
        d="M5.6 17.1C4.6 14.3 6 11.9 8.6 11.6C8.9 14.2 7.6 16.2 5.6 17.1Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Upper-right olive leaf */}
      <path
        d="M15.2 9.8C17.8 9.1 19.9 10.5 20.2 13C17.6 13.2 15.9 11.9 15.2 9.8Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Lower-right olive leaf */}
      <path
        d="M10.4 13.8C13.1 13.1 15.3 14.5 15.6 17.1C13 17.3 11.2 16 10.4 13.8Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Olive fruit drupes */}
      <circle cx="13.5" cy="11.2" r="1.35" fill="currentColor" />
      <circle cx="8.9" cy="15.1" r="1.25" fill="currentColor" />
    </svg>
  );
}

export interface CulturalToastProps {
  visible: boolean;
  quote: CulturalQuote;
  onDismiss: () => void;
  onNextQuote?: () => void;
}

/**
 * Subtle Cultural Motivational Popup that appears above the bottom navigation bar.
 * Celebrates resilience (Sumud), the olive tree, and shared heritage across all 23 Arab nations.
 */
export function CulturalToast({
  visible,
  quote,
  onDismiss,
  onNextQuote
}: CulturalToastProps) {
  if (!visible) return null;

  return (
    <aside
      id="cultural-toast"
      role="status"
      aria-live="polite"
      aria-label="Cultural Heritage & Motivation"
      className="cultural-toast-enter fixed left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-xl bottom-20 z-30 rounded-2xl border border-olive-600/35 dark:border-olive-500/40 bg-[#f6f1e6]/95 dark:bg-[#1f241b]/95 text-stone-900 dark:text-stone-100 px-4 py-3.5 shadow-xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="mt-0.5 p-1.5 rounded-xl bg-olive-600/15 dark:bg-olive-500/20 text-olive-700 dark:text-olive-300 shrink-0">
            <OliveBranchIcon size={20} className="text-olive-700 dark:text-olive-300" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold tracking-wide text-olive-700 dark:text-olive-300">
                غصن الزيتون · {quote.theme}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-stone-800 dark:text-stone-100 italic">
              “{quote.en}”
            </p>
            <p
              dir="rtl"
              className="ar text-xs sm:text-sm font-semibold leading-relaxed text-olive-800 dark:text-olive-200 text-right pt-0.5"
            >
              «{quote.ar}»
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            type="button"
            id="dismiss-cultural-toast-btn"
            onClick={onDismiss}
            aria-label="Dismiss cultural reflection"
            title="Dismiss"
            className="rounded-lg px-2 py-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-olive-600/15 dark:hover:bg-olive-500/20 !min-h-[32px] !min-w-[32px] flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          {onNextQuote && (
            <button
              type="button"
              id="next-cultural-quote-btn"
              onClick={onNextQuote}
              aria-label="Read another cultural reflection"
              title="Next reflection"
              className="rounded-lg px-2 py-0.5 text-[11px] font-medium text-olive-700 dark:text-olive-300 hover:underline !min-h-[28px] !min-w-[32px]"
            >
              ↻ Next
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
