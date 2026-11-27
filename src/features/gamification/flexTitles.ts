// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { loadGamificationStore } from './achievements';
import { ProgressionState } from '../../progression/types';
import { API_BASE_URL } from '../../utils/api';
import { sanitizeDisplayText } from '../../utils/sanitize';

export interface FlexTitle {
  id: 'quick_reflex' | 'word_sniper' | 'bridge_legend';
  labelAr: string;
  labelEn: string;
  icon: string;
  descAr: string;
  descEn: string;
  accentColor: string;
}

export interface FlexStats {
  speedBonuses: number;
  maxLessonCombo: number;
  bossGatesCleared: number;
  blitzRoundsPlayed: number;
  equippedTitleId: FlexTitle['id'] | null;
}

export const FLEX_STATS_KEY = 'tb.flexStats.v10';
export const FLEX_STATS_EVENT = 'tb:flex-stats-updated';
export const LEADERBOARD_CACHE_KEY = 'tb.leaderboardCache.v10_2';
export const PLAYER_NAME_STORAGE_KEY = 'tb.scoreboardDisplayName.v10_2';
const LEADERBOARD_USER_ID_KEY = 'tb.leaderboardUserId.v10';

export const FLEX_TITLES: readonly FlexTitle[] = [
  {
    id: 'quick_reflex',
    labelAr: 'سريع البديهة ⚡',
    labelEn: 'Quick Reflexes ⚡',
    icon: '⚡',
    descAr: 'احصل على 3 مكافآت سرعة أو العب تحدي الـ 60 ثانية',
    descEn: 'Earn 3 speed bonuses or play 60s Lightning Blitz',
    accentColor: '#22D3EE',
  },
  {
    id: 'word_sniper',
    labelAr: 'قناص الكلمات 🎯',
    labelEn: 'Word Sniper 🎯',
    icon: '🎯',
    descAr: 'اوصل لكومبو x3+ في درس أو أكمل درساً بدقة 80%+',
    descEn: 'Hit a x3+ Fever combo or complete a lesson with 80%+ accuracy',
    accentColor: '#10B981',
  },
  {
    id: 'bridge_legend',
    labelAr: 'أسطورة الجسر 👑',
    labelEn: 'Bridge Legend 👑',
    icon: '👑',
    descAr: 'اهزم بوابة الزعيم أو اجمع 300+ نقطة خبرة XP',
    descEn: 'Defeat a Boss Gate or accumulate 300+ total XP',
    accentColor: '#F59E0B',
  },
];

const DEFAULT_FLEX_STATS: FlexStats = {
  speedBonuses: 0,
  maxLessonCombo: 0,
  bossGatesCleared: 0,
  blitzRoundsPlayed: 0,
  equippedTitleId: null,
};

export function loadFlexStats(): FlexStats {
  try {
    const raw = localStorage.getItem(FLEX_STATS_KEY);
    if (!raw) return { ...DEFAULT_FLEX_STATS };
    const parsed = JSON.parse(raw) as Partial<FlexStats>;
    return {
      speedBonuses: Number(parsed.speedBonuses) || 0,
      maxLessonCombo: Number(parsed.maxLessonCombo) || 0,
      bossGatesCleared: Number(parsed.bossGatesCleared) || 0,
      blitzRoundsPlayed: Number(parsed.blitzRoundsPlayed) || 0,
      equippedTitleId: parsed.equippedTitleId ?? null,
    };
  } catch {
    return { ...DEFAULT_FLEX_STATS };
  }
}

export function saveFlexStats(stats: FlexStats): void {
  try {
    localStorage.setItem(FLEX_STATS_KEY, JSON.stringify(stats));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FLEX_STATS_EVENT, { detail: stats }));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function recordFlexEvent(patch: {
  speedBonusDelta?: number;
  comboReached?: number;
  bossGateCleared?: boolean;
  blitzRoundPlayed?: boolean;
}): FlexStats {
  const current = loadFlexStats();
  const next: FlexStats = {
    speedBonuses: current.speedBonuses + (patch.speedBonusDelta || 0),
    maxLessonCombo: Math.max(current.maxLessonCombo, patch.comboReached || 0),
    bossGatesCleared: current.bossGatesCleared + (patch.bossGateCleared ? 1 : 0),
    blitzRoundsPlayed: current.blitzRoundsPlayed + (patch.blitzRoundPlayed ? 1 : 0),
    equippedTitleId: current.equippedTitleId,
  };
  saveFlexStats(next);
  return next;
}

export function equipFlexTitle(titleId: FlexTitle['id']): FlexStats {
  const current = loadFlexStats();
  const next: FlexStats = { ...current, equippedTitleId: titleId };
  saveFlexStats(next);
  return next;
}

export function getUnlockedFlexTitles(
  state: Pick<ProgressionState, 'xp' | 'completedLessonIds'>,
  stats: FlexStats = loadFlexStats()
): FlexTitle[] {
  const gamification = loadGamificationStore();
  const unlocked: FlexTitle[] = [];

  if (
    stats.speedBonuses >= 3 ||
    stats.blitzRoundsPlayed >= 1 ||
    gamification.blitzBestScore >= 200
  ) {
    unlocked.push(FLEX_TITLES[0]);
  }

  if (
    stats.maxLessonCombo >= 3 ||
    gamification.blitzMaxCombo >= 3 ||
    (state.completedLessonIds?.length || 0) >= 1
  ) {
    unlocked.push(FLEX_TITLES[1]);
  }

  if (
    stats.bossGatesCleared >= 1 ||
    gamification.bossesDefeated.length >= 1 ||
    (state.xp || 0) >= 300
  ) {
    unlocked.push(FLEX_TITLES[2]);
  }

  return unlocked;
}

export function getActiveFlexTitle(
  state: Pick<ProgressionState, 'xp' | 'completedLessonIds'>,
  stats: FlexStats = loadFlexStats()
): FlexTitle | null {
  const unlocked = getUnlockedFlexTitles(state, stats);
  if (unlocked.length === 0) return null;
  if (stats.equippedTitleId) {
    const found = unlocked.find((t) => t.id === stats.equippedTitleId);
    if (found) return found;
  }
  return unlocked[unlocked.length - 1];
}

export function getOrCreateLeaderboardUserId(): string {
  try {
    const existing = localStorage.getItem(LEADERBOARD_USER_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const generated = `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(LEADERBOARD_USER_ID_KEY, generated);
    return generated;
  } catch {
    return `tb-guest-${Date.now().toString(36)}`;
  }
}

export function getSavedLeaderboardDisplayName(fallbackAlias?: string): string {
  try {
    const stored = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
    if (stored && stored.trim()) {
      const cleaned = sanitizeDisplayText(stored, 28);
      if (cleaned) return cleaned;
    }
  } catch {
    // Ignore storage errors
  }
  const fallback = sanitizeDisplayText(fallbackAlias || '', 28);
  return fallback || 'Learner';
}

/**
 * Non-blocking instant XP / profile sync to /api/leaderboard (gracefully no-ops offline).
 */
export async function syncLeaderboardXp(params: {
  displayName: string;
  xpDelta: number;
  streak: number;
  hidden?: boolean;
  country?: string;
  forceSync?: boolean;
}): Promise<boolean> {
  const isHidden = Boolean(params.hidden);
  const delta = Math.max(0, Math.min(150, Math.floor(Number(params.xpDelta) || 0)));
  if (!params.forceSync && !isHidden && delta <= 0) return false;
  if (!params.forceSync && isHidden) return false;

  try {
    localStorage.removeItem(LEADERBOARD_CACHE_KEY);
  } catch {
    // Ignore
  }

  try {
    const endpoint = `${API_BASE_URL}/api/leaderboard`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: getOrCreateLeaderboardUserId(),
        displayName: sanitizeDisplayText(params.displayName, 28) || 'Learner',
        country: params.country || 'EG',
        xpDelta: delta,
        streak: Math.max(0, Math.floor(Number(params.streak) || 0)),
        hidden: isHidden,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}

export interface ShareFlexPayload {
  alias: string;
  xp: number;
  streak: number;
  blitzBest?: number;
  titleLabel?: string | null;
  isArabic?: boolean;
}

/**
 * 1-Tap Share Card (Native Capacitor Share -> Web Share API -> Clipboard fallback).
 */
export async function shareFlexCard(payload: ShareFlexPayload): Promise<'shared' | 'copied' | 'failed'> {
  const isArabic = payload.isArabic ?? true;
  const titleLine = payload.titleLabel
    ? isArabic
      ? `🏅 لقبي: ${payload.titleLabel}\n`
      : `🏅 Title: ${payload.titleLabel}\n`
    : '';
  const blitzLine =
    payload.blitzBest && payload.blitzBest > 0
      ? isArabic
        ? `⚡ رقمي في تحدي الـ 60 ثانية: ${payload.blitzBest} نقطة\n`
        : `⚡ 60s Lightning Blitz Best: ${payload.blitzBest} pts\n`
      : '';

  const text = isArabic
    ? `🔥 بفكّر بالإنجليزي على تطبيق Thinking Bridge!\n👤 ${payload.alias}\n${titleLine}⚡ نقاط الخبرة: ${payload.xp} XP · 🔥 سلسلة: ${payload.streak} يوم\n${blitzLine}تقدر تكسر رقمي؟ 👇\nhttps://tb-eg.vercel.app`
    : `🔥 Thinking in English on Thinking Bridge!\n👤 ${payload.alias}\n${titleLine}⚡ XP: ${payload.xp} · 🔥 Streak: ${payload.streak} days\n${blitzLine}Can you beat my score? 👇\nhttps://tb-eg.vercel.app`;

  const title = isArabic ? 'إنجازي على Thinking Bridge ⚡' : 'My Thinking Bridge Flex ⚡';

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title,
        text,
        url: 'https://tb-eg.vercel.app',
        dialogTitle: isArabic ? 'شارك نتيجتك مع أصحابك' : 'Share your score',
      });
      return 'shared';
    }
  } catch {
    // Fall through to Web Share / Clipboard
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text, url: 'https://tb-eg.vercel.app' });
      return 'shared';
    }
  } catch {
    // User cancelled or unsupported — try clipboard
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // Ignore
  }

  return 'failed';
}
