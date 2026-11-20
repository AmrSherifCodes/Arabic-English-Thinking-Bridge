/**
 * App-wide UI Mode utility for Simple Mode (🟢 بسيط) vs Pro Mode (⚡ متقدم)
 */

import { useState, useEffect } from 'react';

export type UiMode = 'simple' | 'pro';

export const UI_MODE_STORAGE_KEY = 'tb.ui_mode';
export const UI_MODE_CHANGE_EVENT = 'tb:ui-mode-changed';

let _inMemoryMode: UiMode = 'simple';

export function getUiMode(): UiMode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(UI_MODE_STORAGE_KEY);
      if (val === 'simple' || val === 'pro') return val;
    }
  } catch {}
  return _inMemoryMode;
}

export function setUiMode(mode: UiMode): void {
  _inMemoryMode = mode;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(UI_MODE_STORAGE_KEY, mode);
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('tb-simple-mode', mode === 'simple');
    }
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent(UI_MODE_CHANGE_EVENT, { detail: mode })
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
    }
    return mode;
  } catch {
    return 'simple';
  }
}

export function useUiMode(): [UiMode, (mode: UiMode) => void] {
  const [mode, setModeState] = useState<UiMode>(() => getUiMode());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'simple' || detail === 'pro') {
        setModeState(detail);
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === UI_MODE_STORAGE_KEY && (e.newValue === 'simple' || e.newValue === 'pro')) {
        setModeState(e.newValue as UiMode);
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
