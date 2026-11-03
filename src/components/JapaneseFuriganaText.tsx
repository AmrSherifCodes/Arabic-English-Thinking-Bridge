import React, { useState } from 'react';

export type JapaneseDisplayMode = 'furigana' | 'kanji' | 'romaji';

interface JapaneseFuriganaTextProps {
  kanjiText: string;
  furiganaHtml?: string;
  romajiText?: string;
  displayMode?: JapaneseDisplayMode;
  className?: string;
}

export function JapaneseFuriganaText({
  kanjiText,
  furiganaHtml,
  romajiText,
  displayMode = 'furigana',
  className = ''
}: JapaneseFuriganaTextProps) {
  if (displayMode === 'romaji' && romajiText) {
    return <span className={`japanese-text japanese-text--romaji ${className}`}>{romajiText}</span>;
  }

  if (displayMode === 'furigana' && furiganaHtml) {
    return (
      <span
        className={`japanese-text japanese-text--furigana leading-loose ${className}`}
        dangerouslySetInnerHTML={{ __html: furiganaHtml }}
      />
    );
  }

  return <span className={`japanese-text japanese-text--kanji ${className}`}>{kanjiText}</span>;
}

interface JapaneseModeToggleProps {
  mode: JapaneseDisplayMode;
  onChange: (next: JapaneseDisplayMode) => void;
  className?: string;
}

export function JapaneseModeToggle({ mode, onChange, className = '' }: JapaneseModeToggleProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs font-medium ${className}`}
      role="group"
      aria-label="Japanese display mode"
    >
      <button
        type="button"
        onClick={() => onChange('furigana')}
        className={`px-2 py-0.5 rounded-md transition-colors ${
          mode === 'furigana'
            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
        }`}
        title="Show Furigana reading above Kanji"
      >
        ふりがな
      </button>
      <button
        type="button"
        onClick={() => onChange('kanji')}
        className={`px-2 py-0.5 rounded-md transition-colors ${
          mode === 'kanji'
            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
        }`}
        title="Show pure Kanji"
      >
        漢字
      </button>
      <button
        type="button"
        onClick={() => onChange('romaji')}
        className={`px-2 py-0.5 rounded-md transition-colors ${
          mode === 'romaji'
            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
            : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
        }`}
        title="Show Latin Romaji alphabet"
      >
        Romaji
      </button>
    </div>
  );
}
