// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useEffect, useState, useCallback } from 'react';

export type ThemeId = 'daylight-cyan' | 'midnight-cyan' | 'noir-mono' | 'royal-emerald';

export const THEME_STORAGE_KEY = 'tb.theme.v1';
export const THEME_UPDATED_EVENT = 'tb:theme-updated';

export interface ThemeTokens {
  bg: string;
  surface: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  gold: string;
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
    id: 'daylight-cyan',
    nameAr: 'نهار سيان',
    nameEn: 'Daylight Cyan',
    descAr: 'أبيض دافئ مريح للعين مع تباين فائق ولمسات سيان وذهبي',
    descEn: 'Eye-soothing warm off-white with crisp ink and electric cyan-teal',
    cost: 0,
    isDark: false,
    tokens: {
      bg: '#F6F8FA',
      surface: '#FFFFFF',
      ink: '#0B1220',
      inkMuted: '#334155',
      accent: '#0B5D75',
      accentInk: '#FFFFFF',
      accentSoft: 'rgba(11, 93, 117, 0.14)',
      gold: '#D97706',
      goldInk: '#0B1220',
      border: '#CBD5E1',
    },
  },
  {
    id: 'midnight-cyan',
    nameAr: 'منتصف الليل',
    nameEn: 'Midnight Cyan',
    descAr: 'داكن هادئ لشاشات OLED بدون إجهاد للعين أثناء المذاكرة الليلية',
    descEn: 'Calm low-glare OLED dark designed for late-night studying',
    cost: 150,
    isDark: true,
    tokens: {
      bg: '#0D1117',
      surface: '#161B22',
      ink: '#F0F6FC',
      inkMuted: '#94A3B8',
      accent: '#22D3EE',
      accentInk: '#041019',
      accentSoft: 'rgba(34, 211, 238, 0.16)',
      gold: '#F59E0B',
      goldInk: '#0B1220',
      border: '#2B3544',
    },
  },
  {
    id: 'noir-mono',
    nameAr: 'أبيض وأسود معماري',
    nameEn: 'Noir Mono',
    descAr: 'تصميم تحريري أحادي اللون فائق التباين والوضوح',
    descEn: 'Ultra-clean architectural black & white high-contrast editorial look',
    cost: 250,
    isDark: true,
    tokens: {
      bg: '#0A0A0A',
      surface: '#141414',
      ink: '#FFFFFF',
      inkMuted: '#C2C2C2',
      accent: '#FFFFFF',
      accentInk: '#0A0A0A',
      accentSoft: 'rgba(255, 255, 255, 0.14)',
      gold: '#E5E5E5',
      goldInk: '#0A0A0A',
      border: '#3A3A3A',
    },
  },
  {
    id: 'royal-emerald',
    nameAr: 'زمردي ملكي',
    nameEn: 'Royal Emerald',
    descAr: 'أردوازي عميق مع زمردي ملكي وإطارات ذهبية دافئة (مجاني لـ Pro)',
    descEn: 'Deep slate with royal emerald and warm gold trim (Free for Pro)',
    cost: 400,
    freeForPro: true,
    isDark: true,
    tokens: {
      bg: '#071312',
      surface: '#0F221F',
      ink: '#ECFDF5',
      inkMuted: '#A7F3D0',
      accent: '#10B981',
      accentInk: '#041A13',
      accentSoft: 'rgba(16, 185, 129, 0.18)',
      gold: '#F59E0B',
      goldInk: '#0B1220',
      border: '#1F423B',
    },
  },
];

export const THEME_MAP: Record<ThemeId, ThemeDefinition> = THEME_CATALOG.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ThemeId, ThemeDefinition>
);

export function isValidThemeId(value: unknown): value is ThemeId {
  return (
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
  } catch {
    // Ignore storage errors
  }
  return 'daylight-cyan';
}

export function applyThemeToDocument(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  const def = THEME_MAP[themeId] || THEME_MAP['daylight-cyan'];
  const root = document.documentElement;

  root.setAttribute('data-theme', def.id);
  root.classList.toggle('dark', def.isDark);
  root.classList.toggle('light', !def.isDark);
  root.style.colorScheme = def.isDark ? 'dark' : 'light';

  root.style.setProperty('--bg', def.tokens.bg);
  root.style.setProperty('--fg', def.tokens.ink);
  root.style.setProperty('--surface', def.tokens.surface);
  root.style.setProperty('--ink', def.tokens.ink);
  root.style.setProperty('--ink-muted', def.tokens.inkMuted);
  root.style.setProperty('--accent', def.tokens.accent);
  root.style.setProperty('--accent-ink', def.tokens.accentInk);
  root.style.setProperty('--accent-soft', def.tokens.accentSoft);
  root.style.setProperty('--gold', def.tokens.gold);
  root.style.setProperty('--gold-ink', def.tokens.goldInk);
  root.style.setProperty('--border', def.tokens.border);
  root.style.setProperty('--text', def.tokens.ink);
  root.style.setProperty('--muted', def.tokens.inkMuted);
  root.style.setProperty('--color-bg', def.tokens.bg);
  root.style.setProperty('--color-surface', def.tokens.surface);
  root.style.setProperty('--color-border', def.tokens.border);
  root.style.setProperty('--color-text', def.tokens.ink);
  root.style.setProperty('--color-muted', def.tokens.inkMuted);
}

export function setActiveTheme(themeId: ThemeId): ThemeId {
  const safeId: ThemeId = isValidThemeId(themeId) ? themeId : 'daylight-cyan';
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
    theme: THEME_MAP[themeId] || THEME_MAP['daylight-cyan'],
    themes: THEME_CATALOG,
    selectTheme,
  };
}
