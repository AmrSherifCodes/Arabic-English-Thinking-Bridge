// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useEffect, useState, useCallback } from 'react';

export type PerfModeSetting = 'auto' | 'rich' | 'lite';
export type ResolvedPerfMode = 'rich' | 'lite';

export const PERF_MODE_STORAGE_KEY = 'tb.perfMode.v1';
export const PERF_MODE_EVENT = 'tb:perf-mode-updated';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

let probeStarted = false;
let probeDetectedLite = false;

export function getSavedPerfSetting(): PerfModeSetting {
  try {
    const raw = localStorage.getItem(PERF_MODE_STORAGE_KEY);
    if (raw === 'auto' || raw === 'rich' || raw === 'lite') {
      return raw;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return 'auto';
}

export function detectHardwareLite(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const nav = navigator as NavigatorWithMemory;
  const lowCores =
    typeof nav.hardwareConcurrency === 'number' &&
    nav.hardwareConcurrency > 0 &&
    nav.hardwareConcurrency <= 4;

  const lowMemory =
    typeof nav.deviceMemory === 'number' &&
    nav.deviceMemory > 0 &&
    nav.deviceMemory <= 3;

  let reducedMotion = false;
  try {
    reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    reducedMotion = false;
  }

  return lowCores || lowMemory || reducedMotion || probeDetectedLite;
}

export function resolvePerfMode(setting: PerfModeSetting = getSavedPerfSetting()): ResolvedPerfMode {
  if (setting === 'lite') return 'lite';
  if (setting === 'rich') return 'rich';
  return detectHardwareLite() ? 'lite' : 'rich';
}

export function applyPerfMode(resolved: ResolvedPerfMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-perf', resolved);
}

export function setPerfModeSetting(setting: PerfModeSetting): ResolvedPerfMode {
  try {
    localStorage.setItem(PERF_MODE_STORAGE_KEY, setting);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
  const resolved = resolvePerfMode(setting);
  applyPerfMode(resolved);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PERF_MODE_EVENT, { detail: { setting, resolved } }));
  }
  return resolved;
}

/**
 * Silent 800ms requestAnimationFrame probe at boot.
 * If average frame time exceeds 34ms (< ~30 FPS) and mode is 'auto', switches to 'lite'.
 */
export function runBootFrameProbe(durationMs = 800): void {
  if (probeStarted || typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return;
  }
  if (getSavedPerfSetting() !== 'auto' || detectHardwareLite()) {
    return;
  }

  probeStarted = true;
  let startTime: number | null = null;
  let frameCount = 0;

  const step = (now: number) => {
    if (startTime === null) {
      startTime = now;
    }
    frameCount += 1;
    const elapsed = now - startTime;

    if (elapsed < durationMs) {
      window.requestAnimationFrame(step);
      return;
    }

    const avgFrameMs = frameCount > 1 ? elapsed / (frameCount - 1) : elapsed;
    if (avgFrameMs > 34) {
      probeDetectedLite = true;
      if (getSavedPerfSetting() === 'auto') {
        applyPerfMode('lite');
        window.dispatchEvent(
          new CustomEvent(PERF_MODE_EVENT, { detail: { setting: 'auto', resolved: 'lite' } })
        );
      }
    }
  };

  window.requestAnimationFrame(step);
}

export function isLitePerfMode(): boolean {
  return resolvePerfMode() === 'lite';
}

/**
 * Hardware-aware confetti dispatcher for low-RAM Android devices (deviceMemory <= 3)
 * and users with `prefers-reduced-motion: reduce`.
 * Dynamically imports `canvas-confetti` only when actually needed.
 */
export async function fireSafeConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
}): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
  } catch {
    // Ignore matchMedia errors
  }

  const lite = isLitePerfMode();
  const baseCount = options?.particleCount ?? 50;
  const particleCount = lite ? Math.min(14, Math.max(8, Math.round(baseCount * 0.25))) : baseCount;

  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti({
      spread: options?.spread ?? (lite ? 45 : 70),
      origin: options?.origin ?? { y: 0.65 },
      colors: options?.colors,
      particleCount,
      disableForReducedMotion: true,
    });
  } catch {
    // Non-critical celebratory visual
  }
}

export function initDevicePerf(): ResolvedPerfMode {
  const setting = getSavedPerfSetting();
  const resolved = resolvePerfMode(setting);
  applyPerfMode(resolved);
  if (setting === 'auto' && resolved === 'rich') {
    runBootFrameProbe(800);
  }
  return resolved;
}

export function usePerfMode() {
  const [setting, setSettingState] = useState<PerfModeSetting>(() => getSavedPerfSetting());
  const [resolved, setResolved] = useState<ResolvedPerfMode>(() => resolvePerfMode());

  useEffect(() => {
    const sync = () => {
      const nextSetting = getSavedPerfSetting();
      setSettingState(nextSetting);
      setResolved(resolvePerfMode(nextSetting));
    };

    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ setting: PerfModeSetting; resolved: ResolvedPerfMode }>).detail;
      if (detail) {
        setSettingState(detail.setting);
        setResolved(detail.resolved);
      } else {
        sync();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === PERF_MODE_STORAGE_KEY) sync();
    };

    window.addEventListener(PERF_MODE_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(PERF_MODE_EVENT, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateSetting = useCallback((next: PerfModeSetting) => {
    const nextResolved = setPerfModeSetting(next);
    setSettingState(next);
    setResolved(nextResolved);
  }, []);

  return { setting, resolved, setPerfMode: updateSetting };
}
