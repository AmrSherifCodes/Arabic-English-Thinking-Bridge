// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { TARGET_LANGUAGE_META } from '../data/languages';
import type { TargetLanguage } from '../types';
import type { ProgressionState } from '../progression/types';

export interface GuideBadgeInfo {
  icon: string;
  shortLabel: string;
  fullLabelAr: string;
  fullLabelEn: string;
}

export interface TopScoreboardBarProps {
  isArabic: boolean;
  targetLang: TargetLanguage;
  progression: ProgressionState;
  guideBadge: GuideBadgeInfo;
  onOpenLevelSwitcher: () => void;
  onOpenScoreboard: () => void;
  onOpenModePopover: () => void;
}

/**
 * Clean single-row 56px Midnight Navy Scoreboard HUD (hidden in Easy Mode).
 * 3 focused items: Active Language+Level pill, Live Streak+XP pill, and Mode/Settings pill.
 */
export function TopScoreboardBar({
  isArabic,
  targetLang,
  progression,
  guideBadge,
  onOpenLevelSwitcher,
  onOpenScoreboard,
  onOpenModePopover,
}: TopScoreboardBarProps) {
  const activeLevelLabel =
    progression.currentStage === 'Pre-A0' || progression.currentStage === 'A0'
      ? progression.currentStage
      : progression.currentLevelId || progression.currentStage || 'A1';

  return (
    <header
      data-testid="top-scoreboard-hud"
      className="tb-hud-bar sticky top-0 z-40 w-full border-b"
      style={{
        backgroundColor: '#0B1120',
        borderColor: 'var(--border)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="h-[56px] max-w-[480px] lg:max-w-[1120px] mx-auto px-3 sm:px-5 flex items-center justify-between gap-2 flex-nowrap overflow-hidden">
        {/* 1. Active Language + Level Pill (44px+ tap target -> LevelSwitcherSheet) */}
        <button
          type="button"
          data-testid="hud-level-pill"
          onClick={onOpenLevelSwitcher}
          aria-label={isArabic ? 'تبديل اللغة والمستوى' : 'Switch Language & Level'}
          className="min-h-[44px] h-[44px] px-3 rounded-2xl border flex items-center gap-1.5 text-xs font-black whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
          style={{
            backgroundColor: '#131C31',
            color: '#F8FAFC',
            borderColor: 'rgba(16, 185, 129, 0.55)',
          }}
        >
          <span aria-hidden="true" className="text-sm leading-none">
            {TARGET_LANGUAGE_META[targetLang]?.flag || '🇬🇧'}
          </span>
          <span className="text-[#10B981]">{activeLevelLabel}</span>
        </button>

        {/* 2. Live Streak + Daily XP Pill (tapping opens Scoreboard / Daily Self-Battle) */}
        <button
          type="button"
          data-testid="hud-scoreboard-pill"
          onClick={onOpenScoreboard}
          aria-label={isArabic ? 'لوحة الصدارة وتحدي اليوم' : 'Scoreboard & Daily Self-Battle'}
          className="min-h-[44px] h-[44px] px-3 rounded-2xl border flex items-center justify-center gap-1.5 text-xs font-black whitespace-nowrap min-w-0 truncate cursor-pointer transition active:scale-95"
          style={{
            backgroundColor: '#131C31',
            borderColor: 'rgba(34, 211, 238, 0.45)',
            color: '#F8FAFC',
          }}
        >
          <span className="shrink-0">🔥 {progression.streak || 0}</span>
          <span className="opacity-40 shrink-0">·</span>
          <span className="text-[#22D3EE] truncate tabular-nums">⚡ {progression.xp || 0} XP</span>
        </button>

        {/* 3. Mode / Settings Pill (48px tap target) */}
        <button
          type="button"
          data-testid="hud-mode-pill"
          onClick={onOpenModePopover}
          aria-label={isArabic ? 'الوضع والإعدادات' : 'Mode & Settings'}
          title={isArabic ? guideBadge.fullLabelAr : guideBadge.fullLabelEn}
          className="min-h-[44px] min-w-[48px] h-[44px] px-2.5 rounded-2xl border flex items-center justify-center gap-1 text-xs font-black whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
          style={{
            backgroundColor: '#131C31',
            borderColor: 'var(--border)',
            color: '#F8FAFC',
          }}
        >
          <span aria-hidden="true" className="text-sm leading-none">
            {guideBadge.icon}
          </span>
          <span className="text-[11px] hidden min-[390px]:inline">{guideBadge.shortLabel}</span>
        </button>
      </div>
    </header>
  );
}
