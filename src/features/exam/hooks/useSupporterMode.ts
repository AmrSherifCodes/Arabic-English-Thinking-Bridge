/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 *
 * Supporter Mode is an honor-system cosmetic layer. Zero gating, zero paywall, zero network calls.
 */

import { useState } from 'react';
import { STORAGE_KEYS } from '../types';

export function useSupporterMode() {
  const [supporterMode, setSupporterModeState] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem(STORAGE_KEYS.SUPPORTER_MODE) === 'on';
    } catch {
      return false;
    }
  });

  const setSupporterMode = (enabled: boolean) => {
    setSupporterModeState(enabled);
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUPPORTER_MODE, enabled ? 'on' : 'off');
    } catch (err) {
      console.warn('Unable to persist Supporter Mode state.', err);
    }
  };

  return { supporterMode, setSupporterMode };
}
