// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { RefreshCw, Download, X } from 'lucide-react';

export const CURRENT_APP_VERSION = '7.2.1';
const REMOTE_VERSION_URL = 'https://tb-eg.vercel.app/version.json';

interface RemoteVersionPayload {
  version?: string;
  apkUrl?: string;
  notesAr?: string;
  notesEn?: string;
}

interface UpdateBannerProps {
  isArabic?: boolean;
}

export function isNewerSemver(remote: string, current: string): boolean {
  const parse = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('.')
      .map((part) => {
        const num = parseInt(part, 10);
        return Number.isFinite(num) ? num : 0;
      });

  const r = parse(remote);
  const c = parse(current);
  const len = Math.max(r.length, c.length, 3);
  for (let i = 0; i < len; i += 1) {
    const rv = r[i] ?? 0;
    const cv = c[i] ?? 0;
    if (rv > cv) return true;
    if (rv < cv) return false;
  }
  return false;
}

export function UpdateBanner({ isArabic = true }: UpdateBannerProps) {
  const [pwaReady, setPwaReady] = useState(false);
  const [apkUpdate, setApkUpdate] = useState<{
    version: string;
    apkUrl: string;
    notesAr?: string;
    notesEn?: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  // 1. Web / PWA Service Worker Update Lifecycle (needRefresh / controllerchange)
  useEffect(() => {
    if (typeof window === 'undefined' || Capacitor.isNativePlatform()) return;
    if (!('serviceWorker' in navigator)) return;

    let active = true;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const watchRegistration = (reg: ServiceWorkerRegistration | undefined) => {
      if (!reg || !active) return;

      if (reg.waiting && navigator.serviceWorker.controller) {
        waitingWorkerRef.current = reg.waiting;
        setPwaReady(true);
      }

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (!active) return;
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorkerRef.current = reg.waiting || installing;
            setPwaReady(true);
            setDismissed(false);
          }
        });
      });

      // Silently pre-fetch any newly deployed SW
      reg.update().catch(() => {});
    };

    const handleControllerChange = () => {
      if (!active || !hadController) return;
      setPwaReady(true);
      setDismissed(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker
          .getRegistration()
          .then((reg) => reg?.update().catch(() => {}))
          .catch(() => {});
      }
    };

    navigator.serviceWorker.getRegistration().then(watchRegistration).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // 2. Capacitor Android APK Silent Update Check (boot + resume)
  useEffect(() => {
    if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) return;

    let active = true;

    const checkApkVersion = async () => {
      try {
        const res = await fetch(REMOTE_VERSION_URL, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as RemoteVersionPayload;
        if (!active || !data?.version || !data?.apkUrl) return;
        if (isNewerSemver(data.version, CURRENT_APP_VERSION)) {
          setApkUpdate({
            version: data.version,
            apkUrl: data.apkUrl,
            notesAr: data.notesAr,
            notesEn: data.notesEn,
          });
          setDismissed(false);
        }
      } catch {
        // Offline-first: swallow all network/offline errors silently
      }
    };

    void checkApkVersion();

    const listenerPromise = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        void checkApkVersion();
      }
    });

    return () => {
      active = false;
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  }, []);

  const visible = !dismissed && (pwaReady || Boolean(apkUpdate));
  if (!visible) return null;

  const handleApplyPwaUpdate = () => {
    try {
      const worker = waitingWorkerRef.current;
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch {
      // Fall through to clean reload
    }
    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  const handleOpenApkUpdate = () => {
    if (!apkUpdate?.apkUrl) return;
    window.open(apkUpdate.apkUrl, '_blank', 'noopener,noreferrer');
  };

  const isNativeUpdate = Boolean(apkUpdate);
  const subtitle = isNativeUpdate
    ? isArabic
      ? apkUpdate?.notesAr || `الإصدار ${apkUpdate?.version} متاح الآن`
      : apkUpdate?.notesEn || `Version ${apkUpdate?.version} is ready`
    : isArabic
    ? 'تحديث جديد جاهز — حدّث الآن بدون فقدان تقدمك'
    : 'New version ready — Update now (progress preserved)';

  return (
    <div
      role="status"
      aria-live="polite"
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] inset-x-3 z-[45] flex justify-center pointer-events-none"
    >
      <div
        className="pointer-events-auto w-full max-w-[460px] rounded-2xl border px-3.5 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2.5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--accent)',
          color: 'var(--ink)',
        }}
      >
        <div className="min-w-0 flex-1 text-start">
          <p className="text-xs font-black leading-snug break-words" style={{ color: 'var(--ink)' }}>
            {isArabic ? '✨ تحديث جديد جاهز' : '✨ New version ready'}
          </p>
          <p className="text-[11px] leading-snug break-words" style={{ color: 'var(--ink-muted)' }}>
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={isNativeUpdate ? handleOpenApkUpdate : handleApplyPwaUpdate}
            className="min-h-[48px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-ink)',
            }}
          >
            {isNativeUpdate ? <Download size={14} /> : <RefreshCw size={14} />}
            <span>{isArabic ? 'حدّث الآن' : 'Update now'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={isArabic ? 'إغلاق' : 'Dismiss'}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--ink-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
