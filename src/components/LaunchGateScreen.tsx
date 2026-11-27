// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Globe, Volume2, ExternalLink, ArrowRight, ArrowLeft, Smartphone } from 'lucide-react';
import { AmrGuide } from './AmrGuide';
import { speakUnified } from '../utils/offlineTts';
import { unlockAudio } from '../utils/audio';

export const LAUNCH_GATE_SEEN_KEY = 'tb.launchGateSeen.v1';

const QURAN_DEEP_LINK = 'quranhifz://open';
const QURAN_ANDROID_INTENT =
  'intent://open#Intent;scheme=quranhifz;package=com.amrsherif.quranhifz;S.browser_fallback_url=https%3A%2F%2Fquranhifz.vercel.app;end';
const QURAN_STANDALONE_WEB_URL = 'https://quranhifz.vercel.app';

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
  onClose?: () => void;
}

export const LaunchGateScreen: React.FC<LaunchGateScreenProps> = ({
  isArabic = true,
  onSelectLanguages,
  onClose,
}) => {
  const [quranSheetOpen, setQuranSheetOpen] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);

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

  const handleDeepLinkQuran = () => {
    setLaunchStatus(
      isArabic
        ? 'جاري فتح تطبيق القرآن الكريم المستقل...'
        : 'Opening standalone Quran Hifz Sanctuary app...'
    );
    try {
      const isAndroid =
        Capacitor.getPlatform() === 'android' ||
        /android/i.test(navigator.userAgent || '');
      const targetUri = isAndroid ? QURAN_ANDROID_INTENT : QURAN_DEEP_LINK;
      window.location.href = targetUri;
    } catch {
      window.open(QURAN_STANDALONE_WEB_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenQuranWeb = () => {
    try {
      window.open(QURAN_STANDALONE_WEB_URL, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = QURAN_STANDALONE_WEB_URL;
    }
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

        {/* Card 2: Warm Gold 3D — Quran Hifz (Standalone Launcher) */}
        <div
          role="button"
          tabIndex={0}
          data-testid="launch-gate-quran"
          onClick={() => {
            setLaunchStatus(null);
            setQuranSheetOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLaunchStatus(null);
              setQuranSheetOpen(true);
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
                {isArabic ? 'تطبيق مستقل لحفظ القرآن' : 'Standalone Quran Hifz App'}
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
                  ? 'القرآن الكريم. يفتح تطبيق حفظ القرآن المستقل.'
                  : 'Quran Hifz. Opens the standalone Quran Hifz Sanctuary app.',
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

      {/* Standalone Quran Hifz Launcher Sheet (Zero Quran files inside this APK) */}
      {quranSheetOpen && (
        <div
          data-testid="quran-launcher-sheet"
          className="fixed inset-0 z-[230] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setQuranSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border-2 border-[#F59E0B]/50 p-5 sm:p-6 pb-safe space-y-5 shadow-2xl tb-pop-bounce"
            style={{ backgroundColor: '#131C31', color: '#F8FAFC' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Anchor: Single Large Back Button */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setQuranSheetOpen(false)}
                className="min-h-[52px] px-4 rounded-2xl border-2 border-slate-500/40 bg-[#1B2742] text-[#F8FAFC] font-black text-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                <span>{isArabic ? 'رجوع' : 'Back'}</span>
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40">
                {isArabic ? 'تطبيق مستقل' : 'Standalone App'}
              </span>
            </div>

            {/* Center Stage */}
            <div className="text-center space-y-3 py-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F59E0B]/20 border-2 border-[#F59E0B] text-[#FBBF24] flex items-center justify-center">
                <OpenMushafIcon size={44} />
              </div>
              <h2 className="text-xl font-black text-[#F8FAFC]">
                {isArabic ? 'ملاذ حفظ القرآن الكريم' : 'Quran Hifz Sanctuary'}
              </h2>
              <p className="text-sm font-medium text-[#CBD5E1] leading-relaxed">
                {isArabic
                  ? 'تطبيق القرآن الكريم مستقل تماماً للحفاظ على خفة المساحة وسرعة الجهاز.'
                  : 'Quran Hifz Sanctuary is a dedicated standalone app to keep Thinking Bridge ultra-lightweight.'}
              </p>
              {launchStatus && (
                <p className="text-xs font-black text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl px-3 py-2">
                  {launchStatus}
                </p>
              )}
            </div>

            {/* Bottom Thumb Zone */}
            <div className="space-y-3">
              <button
                type="button"
                data-testid="quran-deep-link-btn"
                onClick={handleDeepLinkQuran}
                className="w-full min-h-[60px] px-5 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 cursor-pointer tb-btn-3d tb-btn-gold"
              >
                <Smartphone size={22} />
                <span>{isArabic ? 'افتح تطبيق القرآن الآن' : 'Open Quran Hifz App'}</span>
              </button>

              <button
                type="button"
                data-testid="quran-web-link-btn"
                onClick={handleOpenQuranWeb}
                className="w-full min-h-[56px] px-5 py-3 rounded-2xl border-2 border-slate-500/40 bg-[#0B1120] text-[#F8FAFC] font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
              >
                <ExternalLink size={18} className="text-[#FBBF24]" />
                <span>{isArabic ? 'تحميل أو فتح النسخة المستقلة' : 'Download / Open Standalone Web'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
