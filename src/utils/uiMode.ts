/**
 * App-wide UI Complexity Mode utility:
 * - 'simple' (بسيط / Easy & Elder): 56px+ oversized buttons, 1.25x typography, auto-read audio, max 2 primary actions
 * - 'standard' (عادي / Standard): Balanced modern mobile UI (default)
 * - 'pro' (متقدم / Technical Pro): Compact density, grammar transfer notes, Anki review intervals
 */

import { useState, useEffect } from 'react';

export type UiMode = 'simple' | 'standard' | 'pro';

export const UI_MODE_STORAGE_KEY = 'tb.ui_mode';
export const UI_MODE_CHANGE_EVENT = 'tb:ui-mode-changed';

let _inMemoryMode: UiMode = 'standard';

export function isValidUiMode(val: unknown): val is UiMode {
  return val === 'simple' || val === 'standard' || val === 'pro';
}

export function getUiMode(): UiMode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(UI_MODE_STORAGE_KEY);
      if (isValidUiMode(val)) return val;
    }
  } catch {}
  return _inMemoryMode;
}

export function setUiMode(mode: UiMode): void {
  const safeMode: UiMode = isValidUiMode(mode) ? mode : 'standard';
  _inMemoryMode = safeMode;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(UI_MODE_STORAGE_KEY, safeMode);
      window.localStorage.setItem('tb.uiMode', safeMode === 'simple' ? 'easy' : safeMode);
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('tb-simple-mode', safeMode === 'simple');
      document.documentElement.setAttribute('data-ui-mode', safeMode === 'simple' ? 'easy' : safeMode);
    }
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent(UI_MODE_CHANGE_EVENT, { detail: safeMode })
      );
    }
  } catch (err) {
    console.warn('Unable to persist UI mode state.', err);
  }
}

export function syncUiModeClass(): UiMode {
  try {
    const mode = getUiMode();
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('tb-simple-mode', mode === 'simple');
      document.documentElement.setAttribute('data-ui-mode', mode === 'simple' ? 'easy' : mode);
    }
    return mode;
  } catch {
    return 'standard';
  }
}

export function useUiMode(): [UiMode, (mode: UiMode) => void] {
  const [mode, setModeState] = useState<UiMode>(() => getUiMode());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isValidUiMode(detail)) {
        setModeState(detail);
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === UI_MODE_STORAGE_KEY && isValidUiMode(e.newValue)) {
        setModeState(e.newValue);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(UI_MODE_CHANGE_EVENT, handler);
      window.addEventListener('storage', storageHandler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(UI_MODE_CHANGE_EVENT, handler);
        window.removeEventListener('storage', storageHandler);
      }
    };
  }, []);

  const changeMode = (newMode: UiMode) => {
    setUiMode(newMode);
    setModeState(newMode);
  };

  return [mode, changeMode];
}
