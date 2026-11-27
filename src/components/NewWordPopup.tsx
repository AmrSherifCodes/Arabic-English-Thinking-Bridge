// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useState } from 'react';
import { Volume2, Sparkles, Check } from 'lucide-react';
import { AmrGuide } from './AmrGuide';
import { playComboChime } from '../utils/wordBank';
import { useUiMode } from '../utils/uiMode';

export interface NewWordPopupProps {
  word: string;
  translationAr: string;
  egyptianHook?: string;
  isArabic?: boolean;
  onCollect: () => void;
  compact?: boolean;
}

function speakWord(text: string, rate = 1.0) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch {}
}

/**
 * Warm Amber-Gold (#F59E0B / #FBBF24) New-Word Loot Drop Pop-Up.
 * Uses dark #0B1120 text inside gold pills for maximum contrast.
 */
export const NewWordPopup: React.FC<NewWordPopupProps> = ({
  word,
  translationAr,
  egyptianHook,
  isArabic = true,
  onCollect,
  compact = false,
}) => {
  const [collected, setCollected] = useState(false);
  const [uiMode] = useUiMode();
  const isSimple = uiMode === 'simple';

  const handleCollect = () => {
    playComboChime(3);
    setCollected(true);
    window.setTimeout(() => {
      onCollect();
    }, 280);
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`relative rounded-3xl border-2 p-4 sm:p-5 space-y-3.5 tb-pop-bounce ${compact ? 'max-w-sm' : 'w-full max-w-md mx-auto'}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: '#F59E0B',
        boxShadow: '0 0 32px rgba(251, 191, 36, 0.22)',
      }}
    >
      {/* Top Badge & Mascot */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F59E0B] text-[#0B1120]">
          <Sparkles size={14} />
          <span>{isArabic ? '✨ كلمة جديدة' : '✨ NEW WORD'}</span>
        </span>
        <span className="text-xs font-black text-[#FBBF24] bg-[#F59E0B]/15 px-2.5 py-1 rounded-full border border-[#F59E0B]/40">
          +10 XP
        </span>
      </div>

      <div className="flex items-center gap-3">
        <AmrGuide mood="excited" isArabic={isArabic} size={compact ? 68 : 80} />
        <div className="flex-1 min-w-0 text-start space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span dir="ltr" className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              {word}
            </span>
          </div>
          <p className="text-base font-bold text-[#FBBF24]">{translationAr}</p>
          {egyptianHook && (
            <p className="text-xs font-medium text-[#CBD5E1] leading-snug">
              💡 {egyptianHook}
            </p>
          )}
        </div>
      </div>

      {/* Dual-Speed Audio Row (1.0x / 0.75x turtle) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => speakWord(word, isSimple ? 0.85 : 1.0)}
          className={`${isSimple ? 'min-h-[56px] text-sm' : 'min-h-[48px] text-xs'} px-3 py-2 rounded-2xl border font-black text-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95`}
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          <Volume2 size={isSimple ? 18 : 15} className="text-[#22D3EE] shrink-0" />
          <span>{isArabic ? 'نطق عادي' : 'Normal'}</span>
        </button>
        <button
          type="button"
          onClick={() => speakWord(word, isSimple ? 0.65 : 0.75)}
          className={`${isSimple ? 'min-h-[56px] text-sm' : 'min-h-[48px] text-xs'} px-3 py-2 rounded-2xl border font-black text-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95`}
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          <span aria-hidden="true">🐢</span>
          <span>{isArabic ? 'نطق بطيء' : 'Slow'}</span>
        </button>
      </div>

      {/* Chunky 3D Thumb-Zone Collect Button */}
      <button
        type="button"
        onClick={handleCollect}
        className="w-full min-h-[60px] px-4 py-3 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald"
      >
        {collected ? (
          <>
            <Check size={18} />
            <span>{isArabic ? '+1 في بنك الكلمات!' : '+1 Added to Word Bank!'}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
            <span>{isArabic ? 'احفظها في بنك الكلمات' : 'Collect to Word Bank'}</span>
            <span dir="ltr">(+10 XP)</span>
          </span>
        )}
      </button>
    </div>
  );
};
