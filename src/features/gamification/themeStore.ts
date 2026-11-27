// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useEffect, useState, useCallback } from 'react';

export type ThemeId =
  | 'midnight-navy'
  | 'amoled-obsidian'
  | 'daylight-cyan'
  | 'midnight-cyan'
  | 'noir-mono'
  | 'royal-emerald';

export const THEME_STORAGE_KEY = 'tb.theme.v10';
export const THEME_UPDATED_EVENT = 'tb:theme-updated';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentLip: string;
  accentInk: string;
  accentSoft: string;
  fever: string;
  gold: string;
  goldGlow: string;
  goldInk: string;
  border: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  cost: number;
  freeForPro?: boolean;
  isDark: boolean;
  tokens: ThemeTokens;
}

export const THEME_CATALOG: ThemeDefinition[] = [
  {
    id: 'midnight-navy',
    nameAr: 'كحلي منتصف الليل (الافتراضي)',
    nameEn: 'Midnight Navy (Default)',
    descAr: 'تصميم كحلي عميق عالي التباين مع زمردي وذهبي دافئ مريح للعين',
    descEn: 'Deep midnight navy with crisp emerald, warm amber-gold, and WCAG AAA contrast',
    cost: 0,
    isDark: true,
    tokens: {
      bg: '#0B1120',
      surface: '#131C31',
      surface2: '#1B2742',
      ink: '#F8FAFC',
      inkMuted: '#CBD5E1',
      accent: '#10B981',
      accentLip: '#059669',
      accentInk: '#0B1120',
      accentSoft: 'rgba(16, 185, 129, 0.16)',
      fever: '#22D3EE',
      gold: '#F59E0B',
      goldGlow: '#FBBF24',
      goldInk: '#0B1120',
      border: 'rgba(148, 163, 184, 0.16)',
    },
  },
  {
    id: 'amoled-obsidian',
    nameAr: 'أسود أوبسيديان OLED',
    nameEn: 'AMOLED Obsidian',
    descAr: 'أسود عميق فائق الراحة لشاشات OLED والتعلم الليلي',
    descEn: 'Ultra-deep obsidian dark crafted for OLED battery life and zero glare',
    cost: 0,
    isDark: true,
    tokens: {
      bg: '#05070B',
      surface: '#0F141E',
      surface2: '#172030',
      ink: '#F8FAFC',
      inkMuted: '#CBD5E1',
      accent: '#10B981',
      accentLip: '#059669',
      accentInk: '#05070B',
      accentSoft: 'rgba(16, 185, 129, 0.16)',
      fever: '#22D3EE',
      gold: '#F59E0B',
      goldGlow: '#FBBF24',
      goldInk: '#05070B',
      border: 'rgba(148, 163, 184, 0.16)',
    },
  },
];

export const THEME_MAP: Record<ThemeId, ThemeDefinition> = {
  'midnight-navy': THEME_CATALOG[0],
  'amoled-obsidian': THEME_CATALOG[1],
  'daylight-cyan': THEME_CATALOG[0],
  'midnight-cyan': THEME_CATALOG[0],
  'noir-mono': THEME_CATALOG[1],
  'royal-emerald': THEME_CATALOG[0],
};

export function isValidThemeId(value: unknown): value is ThemeId {
  return (
    value === 'midnight-navy' ||
    value === 'amoled-obsidian' ||
    value === 'daylight-cyan' ||
    value === 'midnight-cyan' ||
    value === 'noir-mono' ||
    value === 'royal-emerald'
  );
}

export function getSavedThemeId(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidThemeId(raw)) return raw;
    // Migrate legacy noir-mono users to AMOLED Obsidian; everyone else gets Midnight Navy
    const legacy = localStorage.getItem('tb.theme.v1');
    if (legacy === 'noir-mono') return 'amoled-obsidian';
  } catch {
    // Ignore storage errors
  }
  return 'midnight-navy';
}

export function applyThemeToDocument(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  const def = THEME_MAP[themeId] || THEME_MAP['midnight-navy'];
  const root = document.documentElement;

  root.setAttribute('data-theme', def.id);
  root.classList.add('dark');
  root.classList.remove('light');
  root.style.colorScheme = 'dark';

  root.style.setProperty('--bg', def.tokens.bg);
  root.style.setProperty('--fg', def.tokens.ink);
  root.style.setProperty('--surface', def.tokens.surface);
  root.style.setProperty('--surface-2', def.tokens.surface2);
  root.style.setProperty('--ink', def.tokens.ink);
  root.style.setProperty('--ink-muted', def.tokens.inkMuted);
  root.style.setProperty('--accent', def.tokens.accent);
  root.style.setProperty('--accent-lip', def.tokens.accentLip);
  root.style.setProperty('--accent-ink', def.tokens.accentInk);
  root.style.setProperty('--accent-soft', def.tokens.accentSoft);
  root.style.setProperty('--fever', def.tokens.fever);
  root.style.setProperty('--gold', def.tokens.gold);
  root.style.setProperty('--gold-glow', def.tokens.goldGlow);
  root.style.setProperty('--gold-ink', def.tokens.goldInk);
  root.style.setProperty('--border', def.tokens.border);
  root.style.setProperty('--text', def.tokens.ink);
  root.style.setProperty('--muted', def.tokens.inkMuted);
  root.style.setProperty('--color-bg', def.tokens.bg);
  root.style.setProperty('--color-surface', def.tokens.surface);
  root.style.setProperty('--color-surface-2', def.tokens.surface2);
  root.style.setProperty('--color-border', def.tokens.border);
  root.style.setProperty('--color-text', def.tokens.ink);
  root.style.setProperty('--color-muted', def.tokens.inkMuted);
}

export function setActiveTheme(themeId: ThemeId): ThemeId {
  const safeId: ThemeId = isValidThemeId(themeId) ? themeId : 'midnight-navy';
  try {
    localStorage.setItem(THEME_STORAGE_KEY, safeId);
  } catch {
    // Ignore storage errors
  }
  applyThemeToDocument(safeId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_UPDATED_EVENT, { detail: safeId }));
  }
  return safeId;
}

export function initTheme(): ThemeId {
  const saved = getSavedThemeId();
  applyThemeToDocument(saved);
  return saved;
}

export function useThemeStore() {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => getSavedThemeId());

  useEffect(() => {
    applyThemeToDocument(themeId);
  }, [themeId]);

  useEffect(() => {
    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<ThemeId>).detail;
      if (isValidThemeId(detail)) {
        setThemeIdState(detail);
      } else {
        setThemeIdState(getSavedThemeId());
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeIdState(getSavedThemeId());
      }
    };
    window.addEventListener(THEME_UPDATED_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(THEME_UPDATED_EVENT, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const selectTheme = useCallback((nextId: ThemeId) => {
    const applied = setActiveTheme(nextId);
    setThemeIdState(applied);
  }, []);

  return {
    themeId,
    theme: THEME_MAP[themeId] || THEME_MAP['midnight-navy'],
    themes: THEME_CATALOG,
    selectTheme,
  };
}
