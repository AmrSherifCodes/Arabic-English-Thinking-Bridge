import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isNative = Capacitor.isNativePlatform();
    const ua = window.navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/i.test(ua);

    // Check if running as installed standalone PWA or native Capacitor app
    const isStandaloneMode =
      isNative ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Detect iOS (never true on Android or native Capacitor builds)
    const isIosDevice = !isNative && !isAndroidDevice && /iphone|ipad|ipod/i.test(ua);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event on Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return choice.outcome === 'accepted';
  };

  return {
    isInstallable,
    isIos,
    isStandalone,
    triggerInstall,
    showIosHint: isIos && !isStandalone,
  };
}
