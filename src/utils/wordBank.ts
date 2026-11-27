// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface WordBankEntry {
  id: string;
  word: string;
  translationAr: string;
  egyptianHook?: string;
  targetLang: string;
  unlockedAt: string;
  masteredCount: number;
  lastReviewedAt: string;
}

export const WORD_BANK_STORAGE_KEY = 'tb.wordBank.v10';
export const WORD_BANK_UPDATED_EVENT = 'tb:word-bank-updated';
export const SOUND_MUTE_STORAGE_KEY = 'tb.soundMuted.v10';

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(SOUND_MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch {}
}

/**
 * Rising pentatonic Web Audio chime (C5 -> E6) + crisp 10ms haptic tick.
 * 100% offline, zero external audio files, mute-aware.
 */
const PENTATONIC_HZ = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

export function playPentatonicChime(step = 0): void {
  try {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(10);
    }
  } catch {}

  if (isSoundMuted()) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const idx = Math.max(0, Math.min(PENTATONIC_HZ.length - 1, step % PENTATONIC_HZ.length));
    const freq = PENTATONIC_HZ[idx];
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.12, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.085, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 220);
  } catch {}
}

/**
 * Lightweight Web Audio rising combo chime + subtle haptic feedback.
 * Zero external audio files needed — 100% offline, instant, muteable.
 */
export function playComboChime(comboLevel = 1): void {
  playPentatonicChime(Math.max(0, comboLevel - 1));
}

export function playSoftRetryTone(): void {
  if (isSoundMuted()) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function loadWordBank(): WordBankEntry[] {
  try {
    const raw = localStorage.getItem(WORD_BANK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWordBank(entries: WordBankEntry[]): void {
  try {
    localStorage.setItem(WORD_BANK_STORAGE_KEY, JSON.stringify(entries));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(WORD_BANK_UPDATED_EVENT, { detail: entries }));
    }
  } catch {}
}

export function normalizeWordKey(word: string, targetLang = 'en'): string {
  return `${targetLang.toLowerCase()}::${word.trim().toLowerCase().replace(/[.,!?;:'"()]/g, '')}`;
}

export function unlockWordInBank(input: {
  word: string;
  translationAr: string;
  egyptianHook?: string;
  targetLang?: string;
}): { isNew: boolean; totalUnlocked: number; milestoneReached: boolean; entry: WordBankEntry } {
  const targetLang = input.targetLang || 'en';
  const id = normalizeWordKey(input.word, targetLang);
  const cleanWord = input.word.trim().replace(/[.,!?;:]+$/g, '');
  const now = new Date().toISOString();
  const entries = loadWordBank();
  const existingIdx = entries.findIndex((e) => e.id === id);

  if (existingIdx >= 0) {
    const updated: WordBankEntry = {
      ...entries[existingIdx],
      masteredCount: entries[existingIdx].masteredCount + 1,
      lastReviewedAt: now,
    };
    const next = [...entries];
    next[existingIdx] = updated;
    saveWordBank(next);
    return {
      isNew: false,
      totalUnlocked: next.length,
      milestoneReached: false,
      entry: updated,
    };
  }

  const newEntry: WordBankEntry = {
    id,
    word: cleanWord,
    translationAr: input.translationAr,
    egyptianHook: input.egyptianHook,
    targetLang,
    unlockedAt: now,
    masteredCount: 1,
    lastReviewedAt: now,
  };
  const next = [newEntry, ...entries];
  saveWordBank(next);
  const milestoneReached = next.length > 0 && next.length % 5 === 0;
  return {
    isNew: true,
    totalUnlocked: next.length,
    milestoneReached,
    entry: newEntry,
  };
}

export function useWordBank() {
  const [words, setWords] = useState<WordBankEntry[]>(() => loadWordBank());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<WordBankEntry[]>).detail;
      if (Array.isArray(detail)) {
        setWords(detail);
      } else {
        setWords(loadWordBank());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === WORD_BANK_STORAGE_KEY) {
        setWords(loadWordBank());
      }
    };
    window.addEventListener(WORD_BANK_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(WORD_BANK_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const unlock = useCallback(
    (input: { word: string; translationAr: string; egyptianHook?: string; targetLang?: string }) => {
      const res = unlockWordInBank(input);
      setWords(loadWordBank());
      return res;
    },
    []
  );

  return {
    words,
    count: words.length,
    unlockWord: unlock,
  };
}
