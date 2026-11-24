// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useEffect, useState, useCallback } from 'react';
import { ThemeId, THEME_MAP, setActiveTheme } from './themeStore';

export const ECONOMY_STORAGE_KEY = 'tb.economy.v1';
export const ECONOMY_UPDATED_EVENT = 'tb:economy-updated';

export type StarRating = 0 | 1 | 2 | 3;
export type ChestTier = 'wooden' | 'silver' | 'golden' | 'crown';
export type AvatarFrameId = 'classic' | 'nile-gold' | 'emerald-crest' | 'obsidian-crown';

export interface AvatarFrameDef {
  id: AvatarFrameId;
  nameAr: string;
  nameEn: string;
  badge: string;
  cost: number;
  ringColor: string;
  accentBg: string;
}

export const AVATAR_FRAMES: AvatarFrameDef[] = [
  {
    id: 'classic',
    nameAr: 'الإطار الكلاسيكي',
    nameEn: 'Classic Ring',
    badge: '🎯',
    cost: 0,
    ringColor: '#0891B2',
    accentBg: 'rgba(8, 145, 178, 0.16)',
  },
  {
    id: 'nile-gold',
    nameAr: 'إطار ذهب النيل',
    nameEn: 'Nile Gold',
    badge: '👑',
    cost: 100,
    ringColor: '#D97706',
    accentBg: 'rgba(217, 119, 6, 0.18)',
  },
  {
    id: 'emerald-crest',
    nameAr: 'وسام الزمرد',
    nameEn: 'Emerald Crest',
    badge: '💎',
    cost: 200,
    ringColor: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.18)',
  },
  {
    id: 'obsidian-crown',
    nameAr: 'تاج الأوبسيديان',
    nameEn: 'Obsidian Crown',
    badge: '⚔️',
    cost: 350,
    ringColor: '#A855F7',
    accentBg: 'rgba(168, 85, 247, 0.2)',
  },
];

export const AVATAR_FRAME_MAP: Record<AvatarFrameId, AvatarFrameDef> = AVATAR_FRAMES.reduce(
  (acc, frame) => {
    acc[frame.id] = frame;
    return acc;
  },
  {} as Record<AvatarFrameId, AvatarFrameDef>
);

export interface EconomyState {
  coins: number;
  shields: number;
  levelStars: Record<string, StarRating>;
  openedChests: string[];
  unlockedThemes: ThemeId[];
  unlockedFrames: AvatarFrameId[];
  equippedFrame: AvatarFrameId;
  lastDailyStreakDate?: string;
}

export interface ChestReward {
  chestId: string;
  tier: ChestTier;
  coins: number;
  shields: number;
  unlockedFrame?: AvatarFrameId;
  unlockedTheme?: ThemeId;
}

export const LEVEL_COMPLETION_COINS = 30;
export const THREE_STAR_BONUS_COINS = 20;
export const DAILY_STREAK_COINS = 25;
export const ARCADE_WIN_COINS = 40;

export function createDefaultEconomyState(): EconomyState {
  return {
    coins: 0,
    shields: 1,
    levelStars: {},
    openedChests: [],
    unlockedThemes: ['daylight-cyan'],
    unlockedFrames: ['classic'],
    equippedFrame: 'classic',
  };
}

export function loadEconomyState(): EconomyState {
  const defaults = createDefaultEconomyState();
  try {
    const raw = localStorage.getItem(ECONOMY_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<EconomyState>;
    if (!parsed || typeof parsed !== 'object') return defaults;

    const unlockedThemes = Array.isArray(parsed.unlockedThemes)
      ? Array.from(new Set<ThemeId>(['daylight-cyan', ...(parsed.unlockedThemes as ThemeId[])]))
      : defaults.unlockedThemes;

    const unlockedFrames = Array.isArray(parsed.unlockedFrames)
      ? Array.from(new Set<AvatarFrameId>(['classic', ...(parsed.unlockedFrames as AvatarFrameId[])]))
      : defaults.unlockedFrames;

    const equippedFrame: AvatarFrameId =
      parsed.equippedFrame && unlockedFrames.includes(parsed.equippedFrame)
        ? parsed.equippedFrame
        : 'classic';

    return {
      coins: typeof parsed.coins === 'number' && Number.isFinite(parsed.coins) ? Math.max(0, Math.floor(parsed.coins)) : defaults.coins,
      shields: typeof parsed.shields === 'number' && Number.isFinite(parsed.shields) ? Math.max(0, Math.floor(parsed.shields)) : defaults.shields,
      levelStars: parsed.levelStars && typeof parsed.levelStars === 'object' ? { ...parsed.levelStars } : {},
      openedChests: Array.isArray(parsed.openedChests) ? Array.from(new Set(parsed.openedChests)) : [],
      unlockedThemes,
      unlockedFrames,
      equippedFrame,
      lastDailyStreakDate: typeof parsed.lastDailyStreakDate === 'string' ? parsed.lastDailyStreakDate : undefined,
    };
  } catch {
    return defaults;
  }
}

export function saveEconomyState(state: EconomyState): EconomyState {
  try {
    localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ECONOMY_UPDATED_EVENT, { detail: state }));
  }
  return state;
}

export function calculateStarRating(accuracyPercent: number, fastClear = false): 1 | 2 | 3 {
  if (accuracyPercent >= 95 || (accuracyPercent >= 85 && fastClear)) return 3;
  if (accuracyPercent >= 80) return 2;
  return 1;
}

export function awardLevelCompletion(
  levelId: string,
  accuracyPercent: number,
  options: { isPro?: boolean; fastClear?: boolean } = {}
): {
  state: EconomyState;
  coinsEarned: number;
  starsEarned: 1 | 2 | 3;
  bestStars: StarRating;
  upgradedToThreeStars: boolean;
} {
  const prev = loadEconomyState();
  const starsEarned = calculateStarRating(accuracyPercent, Boolean(options.fastClear));
  const prevStars: StarRating = prev.levelStars[levelId] || 0;
  const bestStars: StarRating = Math.max(prevStars, starsEarned) as StarRating;
  const upgradedToThreeStars = prevStars < 3 && bestStars === 3;

  const baseCoins = LEVEL_COMPLETION_COINS + (starsEarned === 3 ? THREE_STAR_BONUS_COINS : 0);
  const multiplier = options.isPro ? 2 : 1;
  const coinsEarned = baseCoins * multiplier;

  const next: EconomyState = {
    ...prev,
    coins: prev.coins + coinsEarned,
    levelStars: {
      ...prev.levelStars,
      [levelId]: bestStars,
    },
  };

  saveEconomyState(next);
  return {
    state: next,
    coinsEarned,
    starsEarned,
    bestStars,
    upgradedToThreeStars,
  };
}

export function awardDailyStreakCoins(
  isPro = false,
  dateKey = new Date().toISOString().slice(0, 10)
): { state: EconomyState; coinsEarned: number; awarded: boolean } {
  const prev = loadEconomyState();
  if (prev.lastDailyStreakDate === dateKey) {
    return { state: prev, coinsEarned: 0, awarded: false };
  }
  const coinsEarned = DAILY_STREAK_COINS * (isPro ? 2 : 1);
  const next: EconomyState = {
    ...prev,
    coins: prev.coins + coinsEarned,
    lastDailyStreakDate: dateKey,
  };
  saveEconomyState(next);
  return { state: next, coinsEarned, awarded: true };
}

export function awardArcadeWinCoins(isPro = false): { state: EconomyState; coinsEarned: number } {
  const prev = loadEconomyState();
  const coinsEarned = ARCADE_WIN_COINS * (isPro ? 2 : 1);
  const next: EconomyState = {
    ...prev,
    coins: prev.coins + coinsEarned,
  };
  saveEconomyState(next);
  return { state: next, coinsEarned };
}

export function openMilestoneChest(
  chestId: string,
  tier: ChestTier,
  isPro = false
): { ok: boolean; alreadyOpened: boolean; reward?: ChestReward; state: EconomyState } {
  const prev = loadEconomyState();
  if (prev.openedChests.includes(chestId)) {
    return { ok: false, alreadyOpened: true, state: prev };
  }

  const multiplier = isPro ? 2 : 1;
  let coins = 60;
  let shields = 1;
  let unlockedFrame: AvatarFrameId | undefined;
  let unlockedTheme: ThemeId | undefined;

  if (tier === 'wooden') {
    coins = 60 * multiplier;
    shields = 1;
  } else if (tier === 'silver') {
    coins = 110 * multiplier;
    shields = 1;
    if (!prev.unlockedFrames.includes('nile-gold')) {
      unlockedFrame = 'nile-gold';
    } else {
      coins += 40 * multiplier;
    }
  } else if (tier === 'golden') {
    coins = 180 * multiplier;
    shields = 2;
    if (!prev.unlockedFrames.includes('emerald-crest')) {
      unlockedFrame = 'emerald-crest';
    } else {
      coins += 60 * multiplier;
    }
  } else {
    // crown
    coins = 300 * multiplier;
    shields = 3;
    if (!prev.unlockedFrames.includes('obsidian-crown')) {
      unlockedFrame = 'obsidian-crown';
    }
    if (!prev.unlockedThemes.includes('midnight-cyan')) {
      unlockedTheme = 'midnight-cyan';
    }
  }

  const next: EconomyState = {
    ...prev,
    coins: prev.coins + coins,
    shields: prev.shields + shields,
    openedChests: [...prev.openedChests, chestId],
    unlockedFrames: unlockedFrame
      ? Array.from(new Set<AvatarFrameId>([...prev.unlockedFrames, unlockedFrame]))
      : prev.unlockedFrames,
    unlockedThemes: unlockedTheme
      ? Array.from(new Set<ThemeId>([...prev.unlockedThemes, unlockedTheme]))
      : prev.unlockedThemes,
  };

  saveEconomyState(next);

  return {
    ok: true,
    alreadyOpened: false,
    reward: {
      chestId,
      tier,
      coins,
      shields,
      unlockedFrame,
      unlockedTheme,
    },
    state: next,
  };
}

export function purchaseThemeUnlock(
  themeId: ThemeId,
  isPro = false
): { ok: boolean; reason?: 'already_unlocked' | 'insufficient_coins'; state: EconomyState } {
  const prev = loadEconomyState();
  const def = THEME_MAP[themeId];
  if (!def) {
    return { ok: false, reason: 'insufficient_coins', state: prev };
  }

  if (prev.unlockedThemes.includes(themeId)) {
    setActiveTheme(themeId);
    return { ok: true, reason: 'already_unlocked', state: prev };
  }

  const effectiveCost = def.freeForPro && isPro ? 0 : def.cost;
  if (prev.coins < effectiveCost) {
    return { ok: false, reason: 'insufficient_coins', state: prev };
  }

  const next: EconomyState = {
    ...prev,
    coins: prev.coins - effectiveCost,
    unlockedThemes: Array.from(new Set<ThemeId>([...prev.unlockedThemes, themeId])),
  };
  saveEconomyState(next);
  setActiveTheme(themeId);
  return { ok: true, state: next };
}

export function purchaseAvatarFrame(
  frameId: AvatarFrameId
): { ok: boolean; reason?: 'already_unlocked' | 'insufficient_coins'; state: EconomyState } {
  const prev = loadEconomyState();
  const frame = AVATAR_FRAME_MAP[frameId];
  if (!frame) {
    return { ok: false, reason: 'insufficient_coins', state: prev };
  }

  if (prev.unlockedFrames.includes(frameId)) {
    const nextEquipped: EconomyState = { ...prev, equippedFrame: frameId };
    saveEconomyState(nextEquipped);
    return { ok: true, reason: 'already_unlocked', state: nextEquipped };
  }

  if (prev.coins < frame.cost) {
    return { ok: false, reason: 'insufficient_coins', state: prev };
  }

  const next: EconomyState = {
    ...prev,
    coins: prev.coins - frame.cost,
    unlockedFrames: Array.from(new Set<AvatarFrameId>([...prev.unlockedFrames, frameId])),
    equippedFrame: frameId,
  };
  saveEconomyState(next);
  return { ok: true, state: next };
}

export function equipAvatarFrame(frameId: AvatarFrameId): EconomyState {
  const prev = loadEconomyState();
  if (!prev.unlockedFrames.includes(frameId)) return prev;
  const next: EconomyState = { ...prev, equippedFrame: frameId };
  saveEconomyState(next);
  return next;
}

export function useEconomy() {
  const [economy, setEconomy] = useState<EconomyState>(() => loadEconomyState());

  useEffect(() => {
    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<EconomyState>).detail;
      if (detail && typeof detail.coins === 'number') {
        setEconomy(detail);
      } else {
        setEconomy(loadEconomyState());
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === ECONOMY_STORAGE_KEY) {
        setEconomy(loadEconomyState());
      }
    };
    window.addEventListener(ECONOMY_UPDATED_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(ECONOMY_UPDATED_EVENT, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const refresh = useCallback(() => {
    setEconomy(loadEconomyState());
  }, []);

  return {
    economy,
    refresh,
  };
}
