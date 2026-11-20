import { useState, useEffect } from 'react';

export type LearnerMode = 'kids' | 'regular';

export const LEARNER_MODE_STORAGE_KEY = 'tb.learner_mode';
export const LEARNER_MODE_CHANGE_EVENT = 'tb:learner-mode-changed';

let _inMemoryLearnerMode: LearnerMode | null = null;

export function getLearnerMode(): LearnerMode | null {
  try {
    const storage = typeof localStorage !== 'undefined' ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    if (storage) {
      const val = storage.getItem(LEARNER_MODE_STORAGE_KEY);
      if (val === 'kids' || val === 'regular') return val;
    }
  } catch {}
  return _inMemoryLearnerMode;
}

export function setLearnerMode(mode: LearnerMode): void {
  _inMemoryLearnerMode = mode;
  try {
    const storage = typeof localStorage !== 'undefined' ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    if (storage) {
      storage.setItem(LEARNER_MODE_STORAGE_KEY, mode);
    }
    const doc = typeof document !== 'undefined' ? document : null;
    if (doc && doc.documentElement) {
      doc.documentElement.classList.toggle('tb-kids-mode', mode === 'kids');
    }
    const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
    if (win && typeof (win as any).dispatchEvent === 'function') {
      (win as any).dispatchEvent(
        new CustomEvent(LEARNER_MODE_CHANGE_EVENT, { detail: mode })
      );
    }
  } catch (err) {
    console.warn('Unable to persist learner mode state.', err);
  }
}

export function syncLearnerModeClass(): LearnerMode {
  const mode = getLearnerMode() || 'regular';
  const doc = typeof document !== 'undefined' ? document : null;
  if (doc && doc.documentElement) {
    doc.documentElement.classList.toggle('tb-kids-mode', mode === 'kids');
  }
  return mode;
}

export function useLearnerMode(): [LearnerMode, (mode: LearnerMode) => void] {
  const [mode, setModeState] = useState<LearnerMode>(() => getLearnerMode() || 'regular');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'kids' || detail === 'regular') {
        setModeState(detail);
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === LEARNER_MODE_STORAGE_KEY && (e.newValue === 'kids' || e.newValue === 'regular')) {
        setModeState(e.newValue as LearnerMode);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(LEARNER_MODE_CHANGE_EVENT, handler);
      window.addEventListener('storage', storageHandler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(LEARNER_MODE_CHANGE_EVENT, handler);
        window.removeEventListener('storage', storageHandler);
      }
    };
  }, []);

  const changeMode = (newMode: LearnerMode) => {
    setLearnerMode(newMode);
    setModeState(newMode);
  };

  return [mode, changeMode];
}
