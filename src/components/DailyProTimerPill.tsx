// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';

export interface DailyProTimerPillProps {
  visible?: boolean;
  remainingSeconds?: number;
  isArabic?: boolean;
  onClick?: () => void;
}

/**
 * V10 is 100% Free Forever — no daily 15-minute Pro timer or lockup is ever shown.
 */
export const DailyProTimerPill: React.FC<DailyProTimerPillProps> = () => null;

export interface DailyProExpiredCardProps {
  isArabic?: boolean;
  onOpenActivateCode?: () => void;
  onBackToLessons?: () => void;
}

export const DailyProExpiredCard: React.FC<DailyProExpiredCardProps> = () => null;
