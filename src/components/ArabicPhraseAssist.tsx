// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';
import { Volume2 } from 'lucide-react';
import { hasArabicScript, transliterateArabicToLatin } from '../utils/arabicTranslit';
import { speakUnified } from '../utils/offlineTts';
import { unlockAudio } from '../utils/audio';

interface ArabicPhraseAssistProps {
  phrase: string;
  /** Optional custom Latin transliteration override */
  phonetic?: string;
  /** Compact inline style for cards and dictionary rows */
  compact?: boolean;
  className?: string;
}

/**
 * Accessible helper for English-Guided (weak-Arabic / IGCSE / diaspora) learners:
 * displays readable Latin phonetic transliteration + 1-tap Arabic audio button
 * beside any Arabic reference phrase.
 */
export function ArabicPhraseAssist({
  phrase,
  phonetic,
  compact = false,
  className = '',
}: ArabicPhraseAssistProps) {
  if (!phrase || !hasArabicScript(phrase)) return null;

  const latin = (phonetic || '').trim() || transliterateArabicToLatin(phrase);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    void speakUnified({ text: phrase, lang: 'ar-EG', rate: 0.9 });
  };

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center flex-wrap gap-1.5 ${className}`}
    >
      <span
        className={`italic font-semibold ${compact ? 'text-[11px]' : 'text-xs'}`}
        style={{ color: 'var(--accent)' }}
      >
        ({latin})
      </span>
      <button
        type="button"
        onClick={handleSpeak}
        aria-label={`Listen to Arabic phrase: ${latin}`}
        title={`Hear "${latin}"`}
        className={`inline-flex items-center gap-1 rounded-full border font-bold cursor-pointer transition active:scale-95 ${
          compact ? 'px-2 py-0.5 text-[10px] min-h-[28px]' : 'px-2.5 py-1 text-[11px] min-h-[34px]'
        }`}
        style={{
          backgroundColor: 'var(--accent-soft)',
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
        }}
      >
        <Volume2 size={compact ? 12 : 13} className="shrink-0" />
        <span>Hear</span>
      </button>
    </span>
  );
}
