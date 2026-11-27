// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect } from 'react';
import { Globe, Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AmrGuide } from './AmrGuide';
import { speakUnified } from '../utils/offlineTts';
import { unlockAudio } from '../utils/audio';

export const LAUNCH_GATE_SEEN_KEY = 'tb.launchGateSeen.v1';

export function hasSeenLaunchGate(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(LAUNCH_GATE_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markLaunchGateSeen(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LAUNCH_GATE_SEEN_KEY, 'true');
    }
  } catch {
    // Ignore storage errors
  }
}

function OpenMushafIcon({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M24 12C19.5 9.2 13 8.5 7 9.5V35.5C13 34.5 19.5 35.2 24 38C28.5 35.2 35 34.5 41 35.5V9.5C35 8.5 28.5 9.2 24 12Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="rgba(11, 17, 32, 0.14)"
      />
      <path d="M24 12V38" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12 17H19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 23H19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M29 17H36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M29 23H36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M20 42L24 38L28 42"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface LaunchGateScreenProps {
  isArabic?: boolean;
  onSelectLanguages: () => void;
  onSelectQuran: () => void;
  onClose?: () => void;
}

export const LaunchGateScreen: React.FC<LaunchGateScreenProps> = ({
  isArabic = true,
  onSelectLanguages,
  onSelectQuran,
  onClose,
}) => {
  const greetingText = isArabic
    ? 'أهلاً بك! اختر طريقك بضغطة واحدة.'
    : 'Welcome! Pick where to begin in one tap.';

  const speakPrompt = (text: string, lang: 'ar' | 'en') => {
    try {
      unlockAudio();
      void speakUnified({
        text,
        lang: lang === 'ar' ? 'ar-EG' : 'en-US',
        rate: 0.9,
      });
    } catch {
      // Ignore TTS errors on restricted browsers
    }
  };

  useEffect(() => {
    // Gentle non-blocking auto-speak greeting on first render
    const timer = window.setTimeout(() => {
      speakPrompt(greetingText, isArabic ? 'ar' : 'en');
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenLanguages = () => {
    markLaunchGateSeen();
    onSelectLanguages();
  };

  const handleOpenQuran = () => {
    markLaunchGateSeen();
    onSelectQuran();
  };

  return (
    <div
      data-testid="launch-gate-screen"
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[220] h-[100dvh] w-full overflow-hidden flex flex-col justify-between px-4 sm:px-6 pt-safe pb-safe select-none"
      style={{ backgroundColor: '#0B1120', color: '#F8FAFC' }}
    >
      {/* Top Anchor: Optional Back + AmrGuide Greeting + Auto-Speak */}
      <header className="w-full max-w-lg mx-auto pt-2 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AmrGuide mood="welcome" isArabic={isArabic} size={68} />
          <div className="min-w-0 text-start">
            <h1 className="text-base sm:text-xl font-black text-[#F8FAFC] leading-snug">
              {greetingText}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-testid="launch-gate-speak-greeting"
            onClick={() => speakPrompt(greetingText, isArabic ? 'ar' : 'en')}
            aria-label={isArabic ? 'استمع للترحيب' : 'Listen to greeting'}
            className="min-h-[52px] min-w-[52px] rounded-2xl border-2 border-[#10B981]/60 bg-[#131C31] text-[#10B981] flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <Volume2 size={24} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={isArabic ? 'رجوع' : 'Back'}
              className="min-h-[52px] px-3.5 rounded-2xl border-2 border-slate-500/40 bg-[#1B2742] text-[#F8FAFC] font-black text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              <span>{isArabic ? 'رجوع' : 'Back'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Stage (~70% of viewport): 2 Giant 3D Tappable Cards */}
      <main className="w-full max-w-lg mx-auto flex-1 min-h-0 py-4 flex flex-col justify-center gap-4">
        {/* Card 1: Emerald 3D — Learn Languages */}
        <div
          role="button"
          tabIndex={0}
          data-testid="launch-gate-languages"
          onClick={handleOpenLanguages}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenLanguages();
            }
          }}
          className="flex-1 min-h-[150px] max-h-[36dvh] w-full rounded-[28px] p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer tb-btn-3d tb-btn-emerald animate-anticipate border-2 border-[#34D399]"
          style={{
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.28)',
          }}
        >
          <div className="flex items-center gap-4 min-w-0 flex-1 text-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#0B1120]/15 flex items-center justify-center shrink-0">
              <Globe size={42} strokeWidth={2.4} className="text-[#0B1120]" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-[#0B1120] leading-tight">
                {isArabic ? 'تعلم اللغات' : 'Learn Languages'}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B1120]/80 mt-1">
                {isArabic ? 'جسر التفكير · إنجليزي ولغات' : 'Thinking Bridge · English & more'}
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="launch-gate-speak-languages"
            aria-label={isArabic ? 'استمع لخيار تعلم اللغات' : 'Hear Learn Languages'}
            onClick={(e) => {
              e.stopPropagation();
              speakPrompt(
                isArabic
                  ? 'تعلم اللغات. اضغط هنا لبدء جسر التفكير.'
                  : 'Learn Languages. Tap here to start Thinking Bridge.',
                isArabic ? 'ar' : 'en'
              );
            }}
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-[#0B1120]/20 hover:bg-[#0B1120]/30 text-[#0B1120] flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
          >
            <Volume2 size={26} />
          </button>
        </div>

        {/* Card 2: Warm Gold 3D — Quran Hifz Sanctuary (Direct In-App Route /quran) */}
        <div
          role="button"
          tabIndex={0}
          data-testid="launch-gate-quran"
          onClick={handleOpenQuran}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenQuran();
            }
          }}
          className="flex-1 min-h-[150px] max-h-[36dvh] w-full rounded-[28px] p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer tb-btn-3d tb-btn-gold border-2 border-[#FCD34D]"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1 text-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#0B1120]/15 flex items-center justify-center shrink-0 text-[#0B1120]">
              <OpenMushafIcon size={44} />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-[#0B1120] leading-tight">
                {isArabic ? 'القرآن الكريم' : 'Quran Hifz'}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B1120]/80 mt-1">
                {isArabic ? 'ملاذ حفظ القرآن · بدون إنترنت' : 'Quran Hifz Sanctuary · Offline'}
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="launch-gate-speak-quran"
            aria-label={isArabic ? 'استمع لخيار القرآن الكريم' : 'Hear Quran Hifz'}
            onClick={(e) => {
              e.stopPropagation();
              speakPrompt(
                isArabic
                  ? 'القرآن الكريم. اضغط هنا لفتح ملاذ حفظ القرآن.'
                  : 'Quran Hifz. Tap here to open Quran Hifz Sanctuary.',
                isArabic ? 'ar' : 'en'
              );
            }}
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-[#0B1120]/20 hover:bg-[#0B1120]/30 text-[#0B1120] flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
          >
            <Volume2 size={26} />
          </button>
        </div>
      </main>

      {/* Subtle Footer Tag */}
      <footer className="w-full max-w-lg mx-auto pb-2 text-center shrink-0">
        <p className="text-xs font-bold text-[#CBD5E1]/80">
          {isArabic ? 'مجاني 100% · يعمل بدون إنترنت' : '100% Free · Works Offline'}
        </p>
      </footer>
    </div>
  );
};
