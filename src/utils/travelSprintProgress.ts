// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

/**
 * Lightweight localStorage persistence for the 21-Day Travel Abroad Sprint.
 * Separated from `src/data/travelSprintData.ts` so App.tsx can display the
 * readiness badge at cold boot without eagerly parsing the full 21-day dataset.
 */
export const TRAVEL_SPRINT_STORAGE_KEY = 'tb.travelSprint.v10_2';

export function loadCompletedTravelDays(): number[] {
  try {
    const raw = localStorage.getItem(TRAVEL_SPRINT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(parsed.filter((n) => typeof n === 'number' && n >= 1 && n <= 21))
    ).sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export function markTravelDayCompleted(day: number): number[] {
  const current = loadCompletedTravelDays();
  if (day < 1 || day > 21) return current;
  const next = Array.from(new Set([...current, day])).sort((a, b) => a - b);
  try {
    localStorage.setItem(TRAVEL_SPRINT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function getTravelReadinessPercent(completedDays: number[]): number {
  return Math.min(100, Math.round((completedDays.length / 21) * 100));
}
