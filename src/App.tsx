// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Download } from 'lucide-react';

import { LandingPage } from './components/LandingPage';
import { initDevicePerf, PERF_MODE_STORAGE_KEY } from './utils/devicePerf';
import { initTheme, THEME_STORAGE_KEY } from './features/gamification/themeStore';
import {
  ECONOMY_STORAGE_KEY,
  awardArcadeWinCoins,
  awardDailyStreakCoins,
  awardLevelCompletion,
} from './features/gamification/economy';
import { ThemeShopModal } from './features/gamification/ThemeShopModal';
import { UpdateBanner } from './components/UpdateBanner';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import type { UserProgress } from './types';
import { useLanguagePair } from './hooks/useLanguagePair';
import { GlobalErrorBoundary, ErrorReportPrompt } from './components/GlobalErrorBoundary';
import { installGlobalErrorHandlers } from './utils/errorLogger';
import { API_QUOTA_LIMIT_EVENT } from './hooks/useApiKeyGate';
import { ErwinChargeModal } from './components/ErwinChargeModal';
import { AlexandrianEasterEggModal } from './components/AlexandrianEasterEggModal';
import { MutahEasterEggModal } from './components/MutahEasterEggModal';
import { AchievementToast } from './features/gamification/AchievementToast';
import { useEntitlement } from './hooks/useEntitlement';
import { clearLocalLearningDataPreservingEntitlement } from './services/entitlementService';
import { useAmrClickEasterEgg } from './utils/easterEgg';
import { syncUiModeClass, useUiMode } from './utils/uiMode';
import { syncLearnerModeClass } from './utils/learnerMode';
import { UserSetupModal } from './components/UserSetupModal';
import { LaunchGateScreen, hasSeenLaunchGate } from './components/LaunchGateScreen';
import { AmrGuideDock } from './components/AmrGuide';
import { LevelSwitcherSheet } from './components/LevelSwitcherSheet';
import { DialectModePopover } from './components/DialectModePopover';
import {
  getTravelReadinessPercent,
  loadCompletedTravelDays,
  markTravelDayCompleted,
} from './utils/travelSprintProgress';
import { recordDailySelfBattleXp } from './utils/dailySelfBattle';
import { getSavedLeaderboardDisplayName, syncLeaderboardXp } from './features/gamification/flexTitles';
import { useWordBank } from './utils/wordBank';
import {
  GuideMode,
  LearnerTrack,
  getGuideModeBadge,
  hasCompletedUserSetup,
  syncGuideDocumentDirection,
  useGuidePreferences,
} from './utils/guideMode';
import { CefrLevelId, CefrStage, PhaseId, ProgressionState } from './progression/types';
import { migrateLegacyStorageToProgression } from './progression/migration';
import { updateStreakAndShields } from './progression/engine';
import { preloadB2C1FlagshipModules } from './progression/cefrHierarchy';

// Direct imports for 4 primary tabs -> ZERO full-screen loading flash on tab switches
import { PathView } from './components/progression/PathView';
import { PracticeHubView } from './components/progression/PracticeHubView';
import { ProfileView } from './components/progression/ProfileView';

// Modular App Shell & Navigation (v10.4)
import { TopScoreboardBar } from './app/TopScoreboardBar';
import { DesktopSidebar, BottomTabDock, ArcadeTabView } from './app/ShellChrome';
import { LazyRouteOverlays, InlineFallback } from './app/LazyRouteOverlays';
import { useAppNavigation } from './app/useAppNavigation';

// Lazy-loaded top-level standalone pages
const AndroidLandingPage = lazy(() => import('./components/AndroidLandingPage').then((m) => ({ default: m.AndroidLandingPage })));
const AdminConsoleView = lazy(() => import('./pages/AdminConsoleView').then((m) => ({ default: m.AdminConsoleView })));
const CertificateVerifyView = lazy(() => import('./pages/CertificateVerifyView').then((m) => ({ default: m.CertificateVerifyView })));

function getProfileStartingStage(): CefrStage | null {
  try {
    const raw = localStorage.getItem('tb.activeProfileConfig');
    if (!raw) return null;
    const profile: unknown = JSON.parse(raw);
    if (typeof profile !== 'object' || profile === null || !('cefrLevel' in profile)) return null;
    return profile.cefrLevel === 'A0' || profile.cefrLevel === 'A1' || profile.cefrLevel === 'A2'
      ? profile.cefrLevel
      : null;
  } catch {
    return null;
  }
}

function hasSavedProgression(): boolean {
  try {
    return localStorage.getItem('tb.progressionState') !== null || localStorage.getItem('tb.onboardingComplete') === 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const {
    view,
    setView,
    activeTab,
    setActiveTab,
    activeLessonNode,
    setActiveLessonNode,
    goHome,
    launchApp,
    openLanding,
    modals,
  } = useAppNavigation();

  const {
    clickCount,
    registerClick,
    showPoemModal,
    closePoemModal,
    showErwinModal,
    closeErwinModal,
    showAlexandrianModal,
    closeAlexandrianModal,
  } = useAmrClickEasterEgg();

  const [completedTravelDays, setCompletedTravelDays] = useState<number[]>(() => loadCompletedTravelDays());
  const travelReadinessPct = getTravelReadinessPercent(completedTravelDays);
  const { count: wordBankCount } = useWordBank();

  const [progression, setProgression] = useState<ProgressionState>(() => {
    const hasExistingProgression = hasSavedProgression();
    const migrated = migrateLegacyStorageToProgression();
    const startingStage = getProfileStartingStage();
    return updateStreakAndShields(
      startingStage && !hasExistingProgression
        ? { ...migrated, currentStage: startingStage, currentUnitId: `${startingStage.toLowerCase()}-unit-1` }
        : migrated
    );
  });

  const { entitlement } = useEntitlement();
  const [uiMode] = useUiMode();
  const isSimpleMode = uiMode === 'simple';
  const { guideMode, learnerTrack, isArabicGuide: isArabic, setGuideMode } = useGuidePreferences();
  const guideBadge = getGuideModeBadge(guideMode);
  const { profile, saveProfile } = useUserProfile();
  const { sourceLang, targetLang, setPair } = useLanguagePair();
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [toastMsg, setToastMsg] = useState<React.ReactNode | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [showApkBanner, setShowApkBanner] = useState(false);

  const stageFlashcardDecks =
    profile?.dialect === 'egyptian'
      ? ['master-dictionary', 'master-dictionary', 'master-dictionary']
      : targetLang === 'en'
        ? ['phase-1', 'phase-2', 'phase-3']
        : [];

  const updateAndSaveProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveUserProgress(next);
      return next;
    });
  };

  const updateProgression = (updater: (prev: ProgressionState) => ProgressionState) => {
    setProgression((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('tb.progressionState', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const T = (ar: string, en: string) =>
    isArabic ? <span dir="rtl" lang="ar" className="ar block">{ar}</span> : <span dir="ltr" lang="en" className="block">{en}</span>;

  const showToast = (msg: React.ReactNode) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3000);
  };

  // Boot-time initialization (Auto-Lite perf, theme, streak coins, error handlers)
  useEffect(() => {
    const uninstallErrorHandlers = installGlobalErrorHandlers();
    initDevicePerf();
    initTheme();
    awardDailyStreakCoins(true);
    syncUiModeClass();
    syncLearnerModeClass();
    return () => uninstallErrorHandlers();
  }, []);

  // Dynamically preload B2/C1 flagship dataset only when learner enters B2 or C1
  useEffect(() => {
    if (
      progression.currentLevelId === 'B2' ||
      progression.currentLevelId === 'C1' ||
      progression.currentStage === 'B2' ||
      progression.currentStage === 'C1'
    ) {
      void preloadB2C1FlagshipModules();
    }
  }, [progression.currentLevelId, progression.currentStage]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = 'جسر التفكير · Thinking Bridge';
  }, [targetLang]);

  useEffect(() => {
    if (view.name !== 'landing') syncGuideDocumentDirection(guideMode);
  }, [view.name, guideMode]);

  useEffect(() => {
    const handleQuotaLimit = () => showToast(T('وصلت إلى حد الذكاء الاصطناعي اليومي. يتجدد غداً.', 'Daily AI limit reached. Resets tomorrow.'));
    window.addEventListener(API_QUOTA_LIMIT_EVENT, handleQuotaLimit);
    return () => window.removeEventListener(API_QUOTA_LIMIT_EVENT, handleQuotaLimit);
  }, [isArabic]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0B1120' }).catch(() => {});
    if (Capacitor.getPlatform() === 'ios') {
      Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || (window as any).opera);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (isAndroid && !isStandalone && !Capacitor.isNativePlatform() && localStorage.getItem('hide_download_banner') !== 'true') {
        const t = window.setTimeout(() => setShowApkBanner(true), 3000);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, []);

  const handleUserSetupComplete = (_mode: GuideMode, track: LearnerTrack, launchPlacement?: boolean) => {
    modals.setUserSetupOpen(false);
    try { localStorage.setItem('tb.onboardingComplete', 'true'); } catch {}
    if (track === 'teacher') {
      try { window.history?.pushState({}, '', '/teacher'); } catch {}
      setView({ name: 'teacher' });
      return;
    }
    if (launchPlacement) {
      modals.setPlacementModalOpen(true);
    } else {
      try { localStorage.setItem('tb.placementDone', 'true'); } catch {}
      setActiveTab('path');
      modals.setShowSettingsPointer(true);
    }
  };

  const handleAdaptivePlacementComplete = async (
    levelId: CefrLevelId,
    phaseId: PhaseId,
    score: number,
    meta?: { theta: number; band: string; masteredCount: number; startingNodeIndex: number; masteredViaPlacementIds: string[]; activeNodeId: string | null }
  ) => {
    let autoCompletedIds: string[] = meta?.masteredViaPlacementIds || [];
    if (autoCompletedIds.length === 0) {
      try {
        const { getCefrLevelHierarchy } = await import('./progression/courseData');
        const allLessons = getCefrLevelHierarchy(targetLang).flatMap((l) =>
          l.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons)))
        );
        const levelsOrder: CefrLevelId[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
        const targetLevelIndex = levelsOrder.indexOf(levelId);
        autoCompletedIds = allLessons
          .filter((l) => levelsOrder.indexOf((l.levelId || 'A1') as CefrLevelId) < targetLevelIndex)
          .map((l) => l.id);
      } catch {
        autoCompletedIds = [];
      }
    }
    let placedBand = meta?.band || '';
    if (!placedBand) {
      try { placedBand = localStorage.getItem('tb.placementBand') || ''; } catch {}
    }
    const nextStage: CefrStage = placedBand === 'Pre-A0' || placedBand === 'A0' ? 'A0' : levelId === 'A1' ? 'A1' : 'A2';
    updateProgression((prev) => ({
      ...prev,
      currentLevelId: levelId,
      currentPhaseId: phaseId,
      currentStage: nextStage,
      currentUnitId: `${nextStage.toLowerCase()}-unit-1`,
      placementResult: { levelId, phaseId, score, dateISO: new Date().toISOString() },
      completedLessonIds: Array.from(new Set([...prev.completedLessonIds, ...autoCompletedIds])),
    }));
    modals.setShowSettingsPointer(false);
    setActiveTab('path');
    showToast(T(`🎯 تم فتح مستواك (${placedBand || levelId}) على الخريطة!`, `🎯 Unlocked your level (${placedBand || levelId}) on the map!`));
  };

  const handleLessonSessionComplete = async (earnedXp: number, accuracyPercent: number) => {
    let nextStage: CefrStage | undefined;
    let coinsEarned = 0;
    let starsEarned = 1;
    if (activeLessonNode) {
      const { getNextStageAfterLessonCompletion } = await import('./progression/courseData');
      nextStage = getNextStageAfterLessonCompletion(progression, activeLessonNode.id);
      const economyResult = awardLevelCompletion(activeLessonNode.id, accuracyPercent, { isPro: true });
      coinsEarned = economyResult.coinsEarned;
      starsEarned = economyResult.starsEarned;
    }
    if (earnedXp > 0) {
      recordDailySelfBattleXp(earnedXp);
      if (!progression.leagueOptOut && !progression.isUnder13) {
        void syncLeaderboardXp({
          displayName: getSavedLeaderboardDisplayName(progression.anonymousAlias),
          xpDelta: earnedXp,
          streak: progression.streak || 0,
          hidden: false,
        });
      }
    }
    if (activeLessonNode?.id.startsWith('travel-sprint-day-')) {
      const dayNum = Number(activeLessonNode.id.replace('travel-sprint-day-', ''));
      if (Number.isFinite(dayNum) && dayNum >= 1 && dayNum <= 21) {
        setCompletedTravelDays(markTravelDayCompleted(dayNum));
      }
    }
    updateProgression((prev) => {
      const stateWithStreak = updateStreakAndShields(prev);
      return {
        ...stateWithStreak,
        xp: stateWithStreak.xp + earnedXp,
        currentStage: nextStage || stateWithStreak.currentStage,
        currentUnitId: nextStage ? `${nextStage.toLowerCase()}-unit-1` : stateWithStreak.currentUnitId,
        completedLessonIds: activeLessonNode
          ? Array.from(new Set([...stateWithStreak.completedLessonIds, activeLessonNode.id]))
          : stateWithStreak.completedLessonIds,
        lessonCrowns: activeLessonNode
          ? { ...stateWithStreak.lessonCrowns, [activeLessonNode.id]: Math.min(5, (stateWithStreak.lessonCrowns[activeLessonNode.id] || 0) + 1) }
          : stateWithStreak.lessonCrowns,
      };
    });
    const starText = '⭐'.repeat(starsEarned);
    showToast(
      nextStage
        ? T(`🔓 فتحت المرحلة ${nextStage}! +${earnedXp} XP · +${coinsEarned} 🪙 ${starText}`, `🔓 ${nextStage} unlocked! +${earnedXp} XP · +${coinsEarned} 🪙 ${starText}`)
        : T(`🎉 +${earnedXp} XP · +${coinsEarned} 🪙 (${starText})`, `🎉 +${earnedXp} XP · +${coinsEarned} 🪙 (${starText})`)
    );
  };

  if (view.name === 'landing') {
    const returningLevel = hasSavedProgression() ? progression.currentLevelId || progression.currentStage || 'A1' : null;
    return (
      <GlobalErrorBoundary isArabic={isArabic}>
        <div className="landing-shell">
          <LandingPage onLaunchApp={launchApp} isArabic={isArabic} returningLevel={returningLevel} />
          <ErrorReportPrompt isArabic={isArabic} />
        </div>
      </GlobalErrorBoundary>
    );
  }

  if (view.name === 'android' || view.name === 'admin-console' || view.name === 'verify') {
    return (
      <GlobalErrorBoundary isArabic={isArabic}>
        <Suspense fallback={<InlineFallback />}>
          {view.name === 'android' && <AndroidLandingPage />}
          {view.name === 'admin-console' && <AdminConsoleView onBack={openLanding} isArabic={isArabic} />}
          {view.name === 'verify' && <CertificateVerifyView initialCode={view.code} onBack={openLanding} isArabic={isArabic} />}
          <ErrorReportPrompt isArabic={isArabic} />
        </Suspense>
      </GlobalErrorBoundary>
    );
  }

  return (
    <GlobalErrorBoundary isArabic={isArabic}>
      {view.name === 'shell' && (
        <div
          className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip flex flex-col"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {!isSimpleMode && (
            <TopScoreboardBar
              isArabic={isArabic}
              targetLang={targetLang}
              progression={progression}
              guideBadge={guideBadge}
              onOpenLevelSwitcher={() => modals.setLevelSwitcherOpen(true)}
              onOpenScoreboard={() => setActiveTab('arcade')}
              onOpenModePopover={() => modals.setDialectPopoverOpen(true)}
            />
          )}

          <main className={`flex-1 w-full max-w-[480px] lg:max-w-[1120px] mx-auto px-3 sm:px-5 pt-3 ${isSimpleMode ? 'pt-safe pb-safe' : 'pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:pb-12'} overflow-x-clip`}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
              <DesktopSidebar
                isArabic={isArabic}
                progression={progression}
                wordBankCount={wordBankCount}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenWordBank={() => modals.setWordBankOpen(true)}
              />

              <div className="lg:col-span-8 min-w-0">
                {activeTab === 'path' && (
                  <PathView
                    state={progression}
                    targetLang={targetLang}
                    learnerTrack={learnerTrack}
                    guideMode={guideMode}
                    onSelectLesson={setActiveLessonNode}
                    onSelectUnitCheckpoint={() => {}}
                    onUpdateState={updateProgression}
                    onOpenVoice={() => setView({ name: 'voice' })}
                    onOpenFlashcards={(deckId) => setView({ name: 'flashcards', deckId })}
                    onOpenCorporate={() => setView({ name: 'corporate' })}
                    onOpenClarifying={() => setView({ name: 'clarifying' })}
                    onOpenMaintenance={() => setView({ name: 'maintenance' })}
                    onOpenPronunciation={() => setView({ name: 'pronunciation' })}
                    onOpenStory={() => setView({ name: 'story', chapterId: 'chapter-1-cairo-airport' })}
                    onOpenHackerTerminal={() => setView({ name: 'hacker-terminal' })}
                    onOpenTeacherMode={() => setView({ name: 'teacher' })}
                    onOpenExam={() => setView({ name: 'exam' })}
                    isArabic={isArabic}
                    progress={progress}
                    flashcardDeckIds={stageFlashcardDecks}
                    onOpenLanguageSelector={() => modals.setLangSelectorOpen(true)}
                    onOpenWordBank={() => modals.setWordBankOpen(true)}
                    onOpenModeSettings={() => modals.setDialectPopoverOpen(true)}
                    onOpenPreferences={() => setView({ name: 'preferences' })}
                    onOpenTravelSprint={() => modals.setTravelSprintOpen(true)}
                    travelReadinessPct={travelReadinessPct}
                    wordBankCount={wordBankCount}
                    isPro={true}
                    onToast={(msg) => showToast(T(msg, msg))}
                  />
                )}

                {activeTab === 'arcade' && (
                  <ArcadeTabView
                    isArabic={isArabic}
                    progression={progression}
                    onOpenLightningBlitz={() => modals.setLightningBlitzOpen(true)}
                    onOpenPractice={() => setActiveTab('practice')}
                    onSetView={setView}
                    onUpdateProgression={updateProgression}
                  />
                )}

                {activeTab === 'practice' && (
                  <PracticeHubView
                    state={progression}
                    onOpenVoice={() => setView({ name: 'voice' })}
                    onOpenFlashcards={() => setView({ name: 'flashcards' })}
                    onOpenCorporate={() => setView({ name: 'corporate' })}
                    onOpenClarifying={() => setView({ name: 'clarifying' })}
                    onOpenMaintenance={() => setView({ name: 'maintenance' })}
                    onOpenPronunciation={() => setView({ name: 'pronunciation' })}
                    onOpenStory={() => setView({ name: 'story', chapterId: 'chapter-1-cairo-airport' })}
                    onOpenHackerTerminal={() => setView({ name: 'hacker-terminal' })}
                    onOpenTeacherMode={() => setView({ name: 'teacher' })}
                    onOpenExam={() => setView({ name: 'exam' })}
                    onOpenDictionary={() => setView({ name: 'dictionary' })}
                    onOpenLightningBlitz={() => modals.setLightningBlitzOpen(true)}
                    onOpenTravelSprint={() => modals.setTravelSprintOpen(true)}
                    onOpenLiveTranslator={() => modals.setLiveTranslatorOpen(true)}
                    onOpenTravelScenarios={() => modals.setTravelScenariosOpen(true)}
                    travelReadinessPct={travelReadinessPct}
                    onXpEarned={(earned) => {
                      if (earned > 0) {
                        recordDailySelfBattleXp(earned);
                        if (!progression.leagueOptOut && !progression.isUnder13) {
                          void syncLeaderboardXp({
                            displayName: getSavedLeaderboardDisplayName(progression.anonymousAlias),
                            xpDelta: earned,
                            streak: progression.streak || 0,
                            hidden: false,
                          });
                        }
                      }
                      updateProgression((prev) => ({ ...prev, xp: (prev.xp || 0) + earned, weeklyXp: (prev.weeklyXp || 0) + earned }));
                      if (earned > 0) {
                        const coinRes = awardArcadeWinCoins(true);
                        showToast(T(`🪙 +${coinRes.coinsEarned} عملة جسر · +${earned} XP`, `🪙 +${coinRes.coinsEarned} Bridge Coins · +${earned} XP`));
                      }
                    }}
                    onNavigateToCoursePath={() => setActiveTab('path')}
                    targetLang={targetLang}
                    isArabic={isArabic}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileView
                    state={progression}
                    profile={profile}
                    entitlement={entitlement}
                    onOpenShop={() => modals.setShopOpen(true)}
                    onOpenTeacherMode={() => {
                      try { window.history?.pushState({}, '', '/teacher'); } catch {}
                      setView({ name: 'teacher' });
                    }}
                    onUpdateState={updateProgression}
                    onExportData={() => showToast(T('تم تصدير البيانات بنجاح', 'Data exported successfully'))}
                    onOpenPreferences={() => setView({ name: 'preferences' })}
                    onDeleteData={() => {
                      const preservedEconomy = localStorage.getItem(ECONOMY_STORAGE_KEY);
                      const preservedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                      const preservedPerf = localStorage.getItem(PERF_MODE_STORAGE_KEY);
                      clearLocalLearningDataPreservingEntitlement();
                      try {
                        if (preservedEconomy !== null) localStorage.setItem(ECONOMY_STORAGE_KEY, preservedEconomy);
                        if (preservedTheme !== null) localStorage.setItem(THEME_STORAGE_KEY, preservedTheme);
                        if (preservedPerf !== null) localStorage.setItem(PERF_MODE_STORAGE_KEY, preservedPerf);
                      } catch {}
                      window.location.reload();
                    }}
                    onOpenPrivacyPolicy={() => modals.setPrivacyOpen(true)}
                    onToast={(msg: string) => showToast(T(msg, msg))}
                    isArabic={isArabic}
                  />
                )}
              </div>
            </div>
          </main>

          {!isSimpleMode && <BottomTabDock isArabic={isArabic} activeTab={activeTab} onSelectTab={setActiveTab} />}
        </div>
      )}

      <LazyRouteOverlays
        view={view}
        setView={setView}
        goHome={goHome}
        openLanding={openLanding}
        isArabic={isArabic}
        sourceLang={sourceLang}
        targetLang={targetLang}
        guideMode={guideMode}
        setGuideMode={setGuideMode}
        setPair={setPair}
        profile={profile}
        saveProfile={saveProfile}
        progress={progress}
        updateAndSaveProgress={updateAndSaveProgress}
        progression={progression}
        updateProgression={updateProgression}
        activeLessonNode={activeLessonNode}
        setActiveLessonNode={setActiveLessonNode}
        onCompleteLessonSession={handleLessonSessionComplete}
        onCompletePlacement={handleAdaptivePlacementComplete}
        onBlitzXpEarned={(earned) => {
          if (earned > 0) recordDailySelfBattleXp(earned);
          updateProgression((prev) => ({ ...prev, xp: (prev.xp || 0) + earned, weeklyXp: (prev.weeklyXp || 0) + earned }));
          if (earned > 0) {
            const coinRes = awardArcadeWinCoins(true);
            showToast(T(`⚡ +${earned} XP · 🪙 +${coinRes.coinsEarned} عملة جسر`, `⚡ +${earned} XP · 🪙 +${coinRes.coinsEarned} Bridge Coins`));
          }
        }}
        onScenarioXpEarned={(earned) => {
          if (earned > 0) {
            recordDailySelfBattleXp(earned);
            if (!progression.leagueOptOut && !progression.isUnder13) {
              void syncLeaderboardXp({
                displayName: getSavedLeaderboardDisplayName(progression.anonymousAlias),
                xpDelta: earned,
                streak: progression.streak || 0,
                hidden: false,
              });
            }
          }
          updateProgression((prev) => ({ ...prev, xp: (prev.xp || 0) + earned, weeklyXp: (prev.weeklyXp || 0) + earned }));
        }}
        onToast={(ar, en) => showToast(T(ar, en))}
        onRawToast={(msg) => showToast(T(msg, msg))}
        modals={modals}
      />

      <LevelSwitcherSheet
        isOpen={modals.levelSwitcherOpen}
        onClose={() => modals.setLevelSwitcherOpen(false)}
        currentLevel={progression.currentLevelId || progression.currentStage || 'A1'}
        currentStage={progression.currentStage}
        isArabic={isArabic}
        onSelectLevel={(levelId, stage, phaseId) => {
          if (levelId === 'B2' || levelId === 'C1' || stage === 'B2' || stage === 'C1') {
            void preloadB2C1FlagshipModules();
          }
          updateProgression((prev) => ({
            ...prev,
            currentLevelId: levelId,
            currentStage: stage,
            currentPhaseId: phaseId || `${levelId}.1`,
            currentUnitId: `${stage.toLowerCase()}-unit-1`,
          }));
          showToast(T(`✅ تم التحويل إلى المستوى ${stage}`, `✅ Switched to Level ${stage}`));
        }}
        onOpenPlacementTest={() => modals.setPlacementModalOpen(true)}
        onOpenLanguageSelector={() => modals.setLangSelectorOpen(true)}
      />

      <DialectModePopover
        isOpen={modals.dialectPopoverOpen}
        onClose={() => modals.setDialectPopoverOpen(false)}
        guideMode={guideMode}
        onChangeGuideMode={setGuideMode}
        isArabic={isArabic}
        onOpenLaunchGate={() => modals.setLaunchGateOpen(true)}
        onOpenPlacementTest={() => modals.setPlacementModalOpen(true)}
      />

      {view.name === 'shell' && modals.launchGateOpen && (
        <LaunchGateScreen
          isArabic={isArabic}
          onSelectLanguages={() => {
            modals.setLaunchGateOpen(false);
            if (!hasCompletedUserSetup()) modals.setUserSetupOpen(true);
          }}
          onClose={hasSeenLaunchGate() ? () => modals.setLaunchGateOpen(false) : undefined}
        />
      )}

      <UserSetupModal
        isOpen={view.name === 'shell' && !modals.launchGateOpen && modals.userSetupOpen}
        initialGuideMode={guideMode}
        initialTrack={learnerTrack}
        onClose={() => {
          modals.setUserSetupOpen(false);
          try { localStorage.setItem('tb.onboardingComplete', 'true'); } catch {}
        }}
        onComplete={handleUserSetupComplete}
      />

      <AmrGuideDock
        visible={view.name === 'shell' && !modals.launchGateOpen && !modals.userSetupOpen && !isSimpleMode && !toastMsg && modals.showSettingsPointer}
        mood="pointSettings"
        messageAr="تقدر تغيّر شكل الواجهة أو الوضع في أي وقت من الإعدادات!"
        messageEn="You can adjust your UI mode anytime in Settings!"
        isArabic={isArabic}
        pointToSettings
        onDismiss={() => modals.setShowSettingsPointer(false)}
        onAction={() => setView({ name: 'preferences' })}
      />

      <MutahEasterEggModal isOpen={showPoemModal} onClose={closePoemModal} clickCount={clickCount} onIncrementClick={registerClick} />
      <ErwinChargeModal isOpen={showErwinModal} onClose={closeErwinModal} clickCount={clickCount} />
      <AlexandrianEasterEggModal isOpen={showAlexandrianModal} onClose={closeAlexandrianModal} />
      <ThemeShopModal isOpen={modals.shopOpen} onClose={() => modals.setShopOpen(false)} isPro={true} isArabic={isArabic} onToast={(msg) => showToast(T(msg, msg))} />
      <UpdateBanner isArabic={isArabic} />
      <AchievementToast isArabic={isArabic} />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[90] max-w-[calc(100vw-1.5rem)] px-4 py-2.5 border text-xs font-bold rounded-2xl shadow-xl pointer-events-none text-center break-words"
          style={{ backgroundColor: 'var(--surface)', borderColor: '#10B981', color: '#F8FAFC' }}
        >
          {toastMsg}
        </div>
      )}

      {showApkBanner && !Capacitor.isNativePlatform() && (progression.completedLessonIds?.length || 0) >= 1 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[48] p-3.5 pb-safe border-t shadow-2xl flex flex-wrap items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: '#F8FAFC' }}
          dir={isArabic ? 'rtl' : 'ltr'}
          lang={isArabic ? 'ar' : 'en'}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 bg-[#10B981]/20 text-[#10B981]">
              <Download size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black break-words text-[#F8FAFC]">{isArabic ? 'حمّل تطبيق جسر التفكير' : 'Download Thinking Bridge App'}</span>
              <span className="text-[11px] font-bold break-words text-[#CBD5E1]">{isArabic ? 'مجاني 100% · يعمل بدون إنترنت · V10' : '100% Free & Offline · V10'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v10.0.0/ThinkingBridge-v10.0.0.apk" download="ThinkingBridge-v10.0.0.apk" className="min-h-[48px] px-4 py-2 rounded-xl text-xs font-black inline-flex items-center justify-center tb-btn-3d tb-btn-emerald">
              {isArabic ? 'تحميل' : 'Download'}
            </a>
            <button
              onClick={() => {
                setShowApkBanner(false);
                try { localStorage.setItem('hide_download_banner', 'true'); } catch {}
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition cursor-pointer text-[#CBD5E1]"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <ErrorReportPrompt isArabic={isArabic} />
    </GlobalErrorBoundary>
  );
}
