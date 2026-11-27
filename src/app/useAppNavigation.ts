// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { hasSeenLaunchGate } from '../components/LaunchGateScreen';
import { hasCompletedUserSetup } from '../utils/guideMode';
import type { LessonNode } from '../progression/types';

export type AppTab = 'path' | 'arcade' | 'practice' | 'profile';

export type AppView =
  | { name: 'shell' }
  | { name: 'landing' }
  | { name: 'android' }
  | { name: 'teacher' }
  | { name: 'voice' }
  | { name: 'flashcards'; deckId?: string }
  | { name: 'corporate' }
  | { name: 'clarifying' }
  | { name: 'preferences' }
  | { name: 'admin' }
  | { name: 'admin-console' }
  | { name: 'verify'; code?: string }
  | { name: 'maintenance' }
  | { name: 'pronunciation' }
  | { name: 'studio' }
  | { name: 'language-game' }
  | { name: 'story'; chapterId: string }
  | { name: 'hacker-terminal' }
  | { name: 'exam' }
  | { name: 'dictionary' };

export function normalizePath(pathname: string): string {
  return pathname.toLowerCase().replace(/\/+$/, '') || '/';
}

function resolveViewFromLocation(): AppView {
  try {
    if (typeof window !== 'undefined') {
      const path = normalizePath(window.location.pathname);
      const urlParams = new URLSearchParams(window.location.search);

      if (path === '/exam') return { name: 'exam' };
      if (path === '/android') return { name: 'android' };
      if (path === '/language-game') return { name: 'language-game' };
      if (path === '/teacher') return { name: 'teacher' };
      if (path === '/admin') return { name: 'admin-console' };
      if (path === '/verify' || path.startsWith('/verify/')) {
        const code = window.location.pathname.replace(/^\/verify\/?/i, '').trim();
        return { name: 'verify', code: code || undefined };
      }
      if (urlParams.get('admin') === 'true') return { name: 'studio' };
      if (urlParams.get('app') === 'true' || path === '/app') return { name: 'shell' };
      if (Capacitor.isNativePlatform()) return { name: 'shell' };
    }
  } catch {
    // Fallback below
  }
  if (Capacitor.isNativePlatform()) return { name: 'shell' };
  return { name: 'landing' };
}

/**
 * Central navigation, tab switching, scroll-to-top, hardware back button,
 * and modal orchestration hook for Thinking Bridge.
 */
export function useAppNavigation() {
  const [view, setView] = useState<AppView>(resolveViewFromLocation);
  const [activeTab, setActiveTab] = useState<AppTab>('path');
  const [activeLessonNode, setActiveLessonNode] = useState<LessonNode | null>(null);

  // Modal & sheet orchestration
  const [shopOpen, setShopOpen] = useState(false);
  const [placementModalOpen, setPlacementModalOpen] = useState(false);
  const [levelSwitcherOpen, setLevelSwitcherOpen] = useState(false);
  const [dialectPopoverOpen, setDialectPopoverOpen] = useState(false);
  const [wordBankOpen, setWordBankOpen] = useState(false);
  const [lightningBlitzOpen, setLightningBlitzOpen] = useState(false);
  const [travelSprintOpen, setTravelSprintOpen] = useState(false);
  const [liveTranslatorOpen, setLiveTranslatorOpen] = useState(false);
  const [travelScenariosOpen, setTravelScenariosOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [showSettingsPointer, setShowSettingsPointer] = useState(false);

  // First-launch Launch Gate + 1-screen UserSetupModal
  const [launchGateOpen, setLaunchGateOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      return false;
    }
    return !hasSeenLaunchGate();
  });

  const [userSetupOpen, setUserSetupOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      return false;
    }
    return !hasCompletedUserSetup();
  });

  // Sync browser popstate with view state
  useEffect(() => {
    const syncViewFromLocation = () => setView(resolveViewFromLocation());
    window.addEventListener('popstate', syncViewFromLocation);
    return () => window.removeEventListener('popstate', syncViewFromLocation);
  }, []);

  // Reset scroll to top on tab/view switches so users never land mid-page
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // Ignore in SSR/jsdom
    }
  }, [activeTab, view.name]);

  // Android Capacitor hardware back button
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const backListener = CapApp.addListener('backButton', () => {
      if (activeLessonNode) {
        setActiveLessonNode(null);
      } else if (view.name !== 'shell') {
        setView({ name: 'shell' });
      } else {
        CapApp.exitApp();
      }
    });
    return () => {
      backListener.then((l) => l.remove()).catch(() => {});
    };
  }, [view, activeLessonNode]);

  const goHome = useCallback(() => setView({ name: 'shell' }), []);

  const launchApp = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        if (window.history && normalizePath(window.location.pathname) !== '/app') {
          window.history.pushState({}, '', '/app');
        }
        window.scrollTo(0, 0);
      }
      localStorage.setItem('tb.onboardingComplete', 'true');
    } catch {
      // Ignore storage errors
    }
    setShowSettingsPointer(false);
    setActiveTab('path');
    setView({ name: 'shell' });
  }, []);

  const openLanding = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const lang = new URLSearchParams(window.location.search).get('lang');
        const targetUrl = lang ? '/?landing=true&lang=' + encodeURIComponent(lang) : '/?landing=true';
        if (window.history) {
          window.history.pushState({}, '', targetUrl);
        }
        window.scrollTo(0, 0);
      }
    } catch {
      // Ignore history errors
    }
    setView({ name: 'landing' });
  }, []);

  return {
    view,
    setView,
    activeTab,
    setActiveTab,
    activeLessonNode,
    setActiveLessonNode,
    goHome,
    launchApp,
    openLanding,
    modals: {
      shopOpen,
      setShopOpen,
      placementModalOpen,
      setPlacementModalOpen,
      levelSwitcherOpen,
      setLevelSwitcherOpen,
      dialectPopoverOpen,
      setDialectPopoverOpen,
      wordBankOpen,
      setWordBankOpen,
      lightningBlitzOpen,
      setLightningBlitzOpen,
      travelSprintOpen,
      setTravelSprintOpen,
      liveTranslatorOpen,
      setLiveTranslatorOpen,
      travelScenariosOpen,
      setTravelScenariosOpen,
      privacyOpen,
      setPrivacyOpen,
      feedbackOpen,
      setFeedbackOpen,
      langSelectorOpen,
      setLangSelectorOpen,
      launchGateOpen,
      setLaunchGateOpen,
      userSetupOpen,
      setUserSetupOpen,
      showSettingsPointer,
      setShowSettingsPointer,
    },
  };
}
