import React, { useEffect, useRef, useState } from 'react';
import { Exercise } from '../types';
import { speakWithRate } from '../utils/audio';
import {
  ArabicLexiconEntry,
  fetchFallbackArabicWordTranslation,
  lookupArabicWord
} from '../utils/arabicWordLexicon';

export interface InteractiveArabicSentenceProps {
  sentence: string;
  exercise?: Exercise;
  preferredVoice?: string;
  className?: string;
  showCaption?: boolean;
  resetKey?: string | number;
}

/**
 * Interactive Double-Tap Arabic Word Auto-Translator Component
 * - Splits Arabic sentence into interactive <span role="button" tabIndex={0}> tokens
 * - Detects mobile double-tap within a 320ms window (via onTouchEnd / onPointerUp) + desktop onDoubleClick
 * - Zero iOS/Android double-tap zoom or accidental text selection
 */
export function InteractiveArabicSentence({
  sentence,
  exercise,
  preferredVoice,
  className = 'ar text-3xl leading-relaxed font-semibold',
  showCaption = true,
  resetKey
}: InteractiveArabicSentenceProps) {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [selectedRawWord, setSelectedRawWord] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<ArabicLexiconEntry | null>(null);

  const lastTapTimeRef = useRef<number>(0);
  const lastTappedIdxRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedTokenIndex(null);
    setSelectedRawWord(null);
    setActiveEntry(null);
  }, [sentence, resetKey]);

  const tokens = String(sentence || '').split(/\s+/).filter(Boolean);

  const triggerWordTranslation = (token: string, idx: number) => {
    try {
      navigator.vibrate?.(15);
    } catch {}

    setSelectedTokenIndex(idx);
    setSelectedRawWord(token);
    const localEntry = lookupArabicWord(token, exercise);
    setActiveEntry(localEntry);

    if (localEntry.en === 'Check chunk breakdown below') {
      fetchFallbackArabicWordTranslation(token).then(remoteEntry => {
        if (remoteEntry) {
          setActiveEntry(remoteEntry);
        }
      });
    }
  };

  const handleTouchOrPointerTap = (
    e: React.TouchEvent<HTMLSpanElement> | React.PointerEvent<HTMLSpanElement>,
    token: string,
    idx: number
  ) => {
    const now = Date.now();
    const delta = now - lastTapTimeRef.current;
    if (lastTappedIdxRef.current === idx && delta > 0 && delta < 320) {
      e.preventDefault();
      lastTapTimeRef.current = 0;
      lastTappedIdxRef.current = null;
      triggerWordTranslation(token, idx);
    } else {
      lastTapTimeRef.current = now;
      lastTappedIdxRef.current = idx;
    }
  };

  return (
    <div>
      <div id="arabic-prompt" dir="rtl" className={className}>
        {tokens.map((token, idx) => {
          const isSelected = selectedTokenIndex === idx;
          return (
            <React.Fragment key={`${token}-${idx}`}>
              <span
                role="button"
                tabIndex={0}
                title="Double-tap to translate word"
                style={{ touchAction: 'manipulation' }}
                onTouchEnd={e => handleTouchOrPointerTap(e, token, idx)}
                onPointerUp={e => {
                  if (e.pointerType !== 'touch') {
                    handleTouchOrPointerTap(e, token, idx);
                  }
                }}
                onDoubleClick={e => {
                  e.preventDefault();
                  triggerWordTranslation(token, idx);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerWordTranslation(token, idx);
                  }
                }}
                className={`inline-block select-none cursor-pointer rounded-lg px-1.5 py-0.5 mx-0.5 transition border ${
                  isSelected
                    ? 'bg-emerald-500/25 border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'border-transparent hover:bg-emerald-500/15 active:bg-emerald-500/25'
                }`}
              >
                {token}
              </span>{' '}
            </React.Fragment>
          );
        })}
      </div>

      {showCaption && (
        <div className="mt-1.5 text-[11px] opacity-70 flex flex-wrap items-center justify-between gap-1">
          <span>💡 Double-tap any Arabic word to translate it</span>
          <span dir="rtl" className="ar font-medium">
            (اضغط مرتين على أي كلمة لترجمتها)
          </span>
        </div>
      )}

      {selectedRawWord && activeEntry && (
        <div
          id="ar-word-popover"
          role="region"
          aria-label="Arabic word translation"
          className="mt-3 p-3.5 rounded-2xl bg-emerald-950/95 text-white border border-emerald-500/40 shadow-xl transition-all text-left"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span dir="rtl" className="ar font-extrabold text-xl text-emerald-400">
                {selectedRawWord}
              </span>
              <span className="text-stone-400">→</span>
              <span translate="no" className="font-extrabold text-base text-white">
                {activeEntry.en}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="popover-speak-btn"
                onClick={() => {
                  const cleanSpeakText = activeEntry.en
                    .replace(/\(.*?\)/g, '')
                    .split('/')[0]
                    .trim();
                  speakWithRate(cleanSpeakText || activeEntry.en, 0.95, preferredVoice);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold !min-h-[36px] !min-w-[36px]"
              >
                🔊 Listen
              </button>
              <button
                type="button"
                id="popover-close-btn"
                aria-label="Close word translation"
                onClick={() => {
                  setSelectedTokenIndex(null);
                  setSelectedRawWord(null);
                  setActiveEntry(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs !min-h-[36px] !min-w-[36px]"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="text-[11px] text-emerald-300 font-semibold mt-1">
            {activeEntry.grammar}
          </div>
          <p className="text-xs text-stone-200 mt-1 leading-relaxed">💡 {activeEntry.tip}</p>
        </div>
      )}
    </div>
  );
}
