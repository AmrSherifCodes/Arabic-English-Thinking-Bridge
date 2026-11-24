import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Download, Map, Gamepad2, BookOpen, User, Compass } from 'lucide-react';

import { LandingPage } from './components/LandingPage';
import { initDevicePerf, PERF_MODE_STORAGE_KEY } from './utils/devicePerf';
import { initTheme, THEME_STORAGE_KEY } from './features/gamification/themeStore';
import {
  ECONOMY_STORAGE_KEY,
  awardArcadeWinCoins,
  awardDailyStreakCoins,
  awardLevelCompletion,
  useEconomy,
} from './features/gamification/economy';
import { ThemeShopModal } from './features/gamification/ThemeShopModal';
import { UpdateBanner } from './components/UpdateBanner';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { UserProgress, LearningGoal } from './types';
import { useLanguagePair } from './hooks/useLanguagePair';
import { LanguagePairBanner } from './components/LanguagePairBanner';
import { GlobalErrorBoundary, ErrorReportPrompt } from './components/GlobalErrorBoundary';
import { installGlobalErrorHandlers } from './utils/errorLogger';
import { ReviewPrompt } from './components/ReviewPrompt';
import { API_QUOTA_LIMIT_EVENT } from './hooks/useApiKeyGate';
import { ErwinChargeModal } from './components/ErwinChargeModal';
import { AlexandrianEasterEggModal } from './components/AlexandrianEasterEggModal';
import { MutahEasterEggModal } from './components/MutahEasterEggModal';
import { SupporterGateModal } from './components/SupporterGateModal';
import { ActivateCodeModal } from './components/ActivateCodeModal';
import { AchievementToast } from './features/gamification/AchievementToast';
import { YouTubeSupporterPopup } from './components/YouTubeSupporterPopup';
import { useEntitlement } from './hooks/useEntitlement';
import { clearLocalLearningDataPreservingEntitlement } from './services/entitlementService';
import { QURAN_HIFZ_STORAGE_KEY } from './types/entitlement';
import { TARGET_LANGUAGE_META } from './data/languages';
import { DualSpeedAudio } from './components/DualSpeedAudio';
import { useAmrClickEasterEgg } from './utils/easterEgg';
import { initYouTubeSupporter, shouldShowSupporterPopup } from './utils/youtubeSupporter';
import { useUiMode, syncUiModeClass, setUiMode } from './utils/uiMode';
import { getLearnerMode, syncLearnerModeClass } from './utils/learnerMode';
import { AgeGateModal } from './components/AgeGateModal';
import { UserSetupModal } from './components/UserSetupModal';
import { ArabicPhraseAssist } from './components/ArabicPhraseAssist';
import {
  GuideMode,
  LearnerTrack,
  getGuideModeBadge,
  hasCompletedUserSetup,
  syncGuideDocumentDirection,
  useGuidePreferences,
} from './utils/guideMode';

import { CefrLevelId, CefrStage, PhaseId, ProgressionState, LessonNode } from './progression/types';
import { migrateLegacyStorageToProgression } from './progression/migration';
import { updateStreakAndShields } from './progression/engine';

function getProfileStartingStage(): CefrStage | null {
  try {
    const raw = localStorage.getItem('tb.activeProfileConfig');
    if (!raw) return null;
    const profile: unknown = JSON.parse(raw);
    if (typeof profile !== 'object' || profile === null || !('cefrLevel' in profile)) return null;
    return profile.cefrLevel === 'A0' || profile.cefrLevel === 'A1' || profile.cefrLevel === 'A2'
      ? profile.cefrLevel
      : null;
  } catch (error) {
    console.warn('Unable to read the saved learning level.', error);
    return null;
  }
}

function hasSavedProgression(): boolean {
  try {
    return localStorage.getItem('tb.progressionState') !== null;
  } catch {
    return false;
  }
}

// Lazy loading heavy view components for instant Landing Page loading & code-splitting
const OnboardingFlow = lazy(() => import('./components/Onboarding/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow })));
const Onboarding = lazy(() => import('./components/Onboarding').then((m) => ({ default: m.Onboarding })));
const AndroidLandingPage = lazy(() => import('./components/AndroidLandingPage').then((m) => ({ default: m.AndroidLandingPage })));
const PathView = lazy(() => import('./components/progression/PathView').then((m) => ({ default: m.PathView })));
const PracticeHubView = lazy(() => import('./components/progression/PracticeHubView').then((m) => ({ default: m.PracticeHubView })));
const QuestsView = lazy(() => import('./components/progression/QuestsView').then((m) => ({ default: m.QuestsView })));
const LeagueView = lazy(() => import('./components/progression/LeagueView').then((m) => ({ default: m.LeagueView })));
const ProfileView = lazy(() => import('./components/progression/ProfileView').then((m) => ({ default: m.ProfileView })));
const LessonRunner = lazy(() => import('./components/progression/LessonRunner').then((m) => ({ default: m.LessonRunner })));
const OnboardingPlacementModal = lazy(() => import('./components/progression/OnboardingPlacementModal').then((m) => ({ default: m.OnboardingPlacementModal })));
const PlacementTestModal = lazy(() => import('./components/progression/PlacementTestModal').then((m) => ({ default: m.PlacementTestModal })));
const PrivacyPolicyModal = lazy(() => import('./components/progression/PrivacyPolicyModal').then((m) => ({ default: m.PrivacyPolicyModal })));
const VoicePracticeView = lazy(() => import('./features/voice/VoicePracticeView').then((m) => ({ default: m.VoicePracticeView })));
const FlashcardsView = lazy(() => import('./features/flashcards/FlashcardsView').then((m) => ({ default: m.FlashcardsView })));
const CorporateBridgeView = lazy(() => import('./features/corporate/CorporateBridgeView').then((m) => ({ default: m.CorporateBridgeView })));
const PreferencesView = lazy(() => import('./features/preferences/PreferencesView').then((m) => ({ default: m.PreferencesView })));
const FeedbackModal = lazy(() => import('./components/FeedbackModal').then((m) => ({ default: m.FeedbackModal })));
const LanguageSelectorModal = lazy(() => import('./components/LanguageSelectorModal').then((m) => ({ default: m.LanguageSelectorModal })));
const AdminFeedbackView = lazy(() => import('./components/AdminFeedbackView').then((m) => ({ default: m.AdminFeedbackView })));
const MaintenanceGuide = lazy(() => import('./features/maintenance/MaintenanceGuide').then((m) => ({ default: m.MaintenanceGuide })));
const PronunciationRecorder = lazy(() => import('./features/voice/PronunciationRecorder').then((m) => ({ default: m.PronunciationRecorder })));
const StudioDashboard = lazy(() => import('./features/studio/StudioDashboard').then((m) => ({ default: m.StudioDashboard })));
const ClarifyingCoachView = lazy(() => import('./features/clarifying/ClarifyingCoachView').then((m) => ({ default: m.ClarifyingCoachView })));
const LanguageGame = lazy(() => import('./pages/LanguageGame').then((m) => ({ default: m.LanguageGame })));
const HackerTerminal = lazy(() => import('./components/story/HackerTerminal').then((m) => ({ default: m.HackerTerminal })));
const StoryEngineLoader = lazy(() => import('./components/story/StoryEngineLoader').then((m) => ({ default: m.StoryEngineLoader })));
const TeacherView = lazy(() => import('./pages/TeacherView').then((m) => ({ default: m.TeacherView })));
const ExamPage = lazy(() => import('./features/exam/ExamPage').then((m) => ({ default: m.ExamPage })));
const AdminConsoleView = lazy(() => import('./pages/AdminConsoleView').then((m) => ({ default: m.AdminConsoleView })));
const CertificateVerifyView = lazy(() => import('./pages/CertificateVerifyView').then((m) => ({ default: m.CertificateVerifyView })));
const QuranSanctuaryView = lazy(() => import('./features/quran/QuranSanctuaryView').then((m) => ({ default: m.QuranSanctuaryView })));

type View =
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
  | { name: 'dictionary' }
  | { name: 'quran' };

function normalizePath(pathname: string): string {
  return pathname.toLowerCase().replace(/\/+$/, '') || '/';
}

export default function App() {
  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('tb.audioUnlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [view, setView] = useState<View>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = normalizePath(window.location.pathname);
        const urlParams = new URLSearchParams(window.location.search);

        if (path === '/exam') return { name: 'exam' };
        if (path === '/quran') return { name: 'quran' };
        if (path === '/android') return { name: 'android' };
        if (path === '/language-game') return { name: 'language-game' };
        if (path === '/teacher') return { name: 'teacher' };
        if (path === '/admin') return { name: 'admin-console' };
        if (path === '/verify' || path.startsWith('/verify/')) {
          const code = window.location.pathname.replace(/^\/verify\/?/i, '').trim();
          return { name: 'verify', code: code || undefined };
        }
        if (urlParams.get('admin') === 'true') return { name: 'studio' };
        if (urlParams.get('app') === 'true' || path === '/app') {
          return { name: 'shell' };
        }
      }
    } catch { }
    // Option B: Native mobile apps (Capacitor Android/iOS) bypass marketing landing page completely
    if (Capacitor.isNativePlatform()) {
      return { name: 'shell' };
    }
    return { name: 'landing' };
  });

  const launchApp = () => {
    try {
      if (typeof window !== 'undefined') {
        if (window.history && normalizePath(window.location.pathname) !== '/app') {
          window.history.pushState({}, '', '/app');
        }
        window.scrollTo(0, 0);
      }
      localStorage.setItem('tb.onboardingComplete', 'true');
    } catch { }
    // Drop first-time learners straight onto Node 1 of the winding map
    setShowAgeGate(false);
    setNewOnboardingOpen(false);
    setOnboardingOpen(false);
    setActiveTab('path');
    setView({ name: 'shell' });
  };

  const openLanding = () => {
    try {
      if (typeof window !== 'undefined') {
        const lang = new URLSearchParams(window.location.search).get('lang');
        const targetUrl = lang ? '/?lang=' + encodeURIComponent(lang) : '/';
        if (window.history && normalizePath(window.location.pathname) !== '/') {
          window.history.pushState({}, '', targetUrl);
        }
        window.scrollTo(0, 0);
      }
    } catch { }
    setView({ name: 'landing' });
  };

  const openQuranSanctuary = () => {
    try {
      if (typeof window !== 'undefined') {
        if (window.history && normalizePath(window.location.pathname) !== '/quran') {
          window.history.pushState({}, '', '/quran');
        }
        window.scrollTo(0, 0);
      }
    } catch { }
    setView({ name: 'quran' });
  };

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

  const [activeTab, setActiveTab] = useState<'path' | 'arcade' | 'practice' | 'profile'>('path');
  const [shopOpen, setShopOpen] = useState(false);
  const [placementModalOpen, setPlacementModalOpen] = useState(false);
  const { economy } = useEconomy();
  const [progression, setProgression] = useState<ProgressionState>(() => {
    const hasExistingProgression = hasSavedProgression();
    const migrated = migrateLegacyStorageToProgression();
    const startingStage = getProfileStartingStage();
    return updateStreakAndShields(startingStage && !hasExistingProgression
      ? { ...migrated, currentStage: startingStage, currentUnitId: `${startingStage.toLowerCase()}-unit-1` }
      : migrated);
  });

  const [activeLessonNode, setActiveLessonNode] = useState<LessonNode | null>(null);
  const [supporterGateOpen, setSupporterGateOpen] = useState(false);
  const [activateCodeOpen, setActivateCodeOpen] = useState(false);
  const { entitlement, isPro } = useEntitlement();
  const [showSupporterPopup, setShowSupporterPopup] = useState(false);
  const [newOnboardingOpen, setNewOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      return false;
    }
    try {
      return localStorage.getItem('tb.onboardingComplete') !== 'true';
    } catch {
      return false;
    }
  });

  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      return false;
    }
    try {
      const stored = localStorage.getItem('tb.progressionState');
      return stored === null;
    } catch {
      return false;
    }
  });

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      return false;
    }
    return getLearnerMode() === null;
  });
  const [userSetupOpen, setUserSetupOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      return false;
    }
    return !hasCompletedUserSetup();
  });

  const { guideMode, learnerTrack, isArabicGuide, setGuideMode } = useGuidePreferences();
  const guideBadge = getGuideModeBadge(guideMode);
  const [quranHighlighted, setQuranHighlighted] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem('tb.quranInterest') === 'true';
    } catch {
      return false;
    }
  });

  const { profile, saveProfile } = useUserProfile();
  const { sourceLang, targetLang, setPair } = useLanguagePair();
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (targetLang === 'de') {
      document.title = 'فكّر ألماني · Thinking German | جسر التفكير المعرفي';
    } else if (targetLang === 'tr') {
      document.title = 'فكّر تركي · Thinking Turkish | جسر التفكير المعرفي';
    } else if (targetLang === 'es') {
      document.title = 'فكّر إسباني · Thinking Spanish | جسر التفكير المعرفي';
    } else if (targetLang === 'fr') {
      document.title = 'فكّر فرنسي · Thinking French | جسر التفكير المعرفي';
    } else if (targetLang === 'ja') {
      document.title = 'فكّر ياباني · Thinking Japanese | جسر التفكير المعرفي';
    } else {
      document.title = 'فكّر إنجليزي · Thinking English | جسر التفكير المعرفي';
    }
  }, [targetLang]);

  const updateAndSaveProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveUserProgress(next);
      return next;
    });
  };

  const isArabic = isArabicGuide;
  const [uiMode] = useUiMode();

  // Deck opened by each stage's flashcard checkpoints in the masar path.
  const stageFlashcardDecks =
    profile?.dialect === 'egyptian'
      ? ['master-dictionary', 'master-dictionary', 'master-dictionary']
      : targetLang === 'en'
        ? ['phase-1', 'phase-2', 'phase-3']
        : [];

  useEffect(() => {
    const uninstallErrorHandlers = installGlobalErrorHandlers();
    initDevicePerf();
    initTheme();
    awardDailyStreakCoins(isPro);
    initYouTubeSupporter();
    syncUiModeClass();
    syncLearnerModeClass();
    const handleUnlock = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          ctx.resume();
        }
      } catch { }
      setAudioUnlocked(true);
      try {
        sessionStorage.setItem('tb.audioUnlocked', 'true');
      } catch { }
    };
    window.addEventListener('pointerdown', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });
    return () => {
      uninstallErrorHandlers();
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  useEffect(() => {
    const syncViewFromLocation = () => {
      try {
        const path = normalizePath(window.location.pathname);
        const urlParams = new URLSearchParams(window.location.search);
        if (path === '/exam') setView({ name: 'exam' });
        else if (path === '/quran') setView({ name: 'quran' });
        else if (path === '/android') setView({ name: 'android' });
        else if (path === '/language-game') setView({ name: 'language-game' });
        else if (path === '/teacher') setView({ name: 'teacher' });
        else if (path === '/admin') setView({ name: 'admin-console' });
        else if (path === '/verify' || path.startsWith('/verify/')) {
          const code = window.location.pathname.replace(/^\/verify\/?/i, '').trim();
          setView({ name: 'verify', code: code || undefined });
        }
        else if (urlParams.get('admin') === 'true') setView({ name: 'studio' });
        else if (urlParams.get('app') === 'true' || path === '/app' || Capacitor.isNativePlatform()) {
          setView({ name: 'shell' });
        } else {
          setView({ name: 'landing' });
        }
      } catch { }
    };
    window.addEventListener('popstate', syncViewFromLocation);
    return () => window.removeEventListener('popstate', syncViewFromLocation);
  }, []);

  useEffect(() => {
    if (view.name === 'landing') return;
    syncGuideDocumentDirection(guideMode);
  }, [view.name, guideMode]);

  const handleUserSetupComplete = (
    mode: GuideMode,
    track: LearnerTrack,
    quranInterested?: boolean,
    launchPlacement?: boolean
  ) => {
    setUserSetupOpen(false);
    setShowAgeGate(false);
    setNewOnboardingOpen(false);
    setOnboardingOpen(false);
    try {
      localStorage.setItem('tb.onboardingComplete', 'true');
    } catch { }
    if (typeof quranInterested === 'boolean') {
      setQuranHighlighted(quranInterested);
    }

    if (track === 'teacher') {
      try {
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', '/teacher');
        }
      } catch { }
      setView({ name: 'teacher' });
      return;
    }

    if (launchPlacement) {
      setPlacementModalOpen(true);
    } else {
      try {
        localStorage.setItem('tb.placementDone', 'true');
      } catch { }
      setActiveTab('path');
    }

    const isAr = mode !== 'english_guided';
    showToast(
      isAr
        ? mode === 'standard_ar'
          ? '✅ تم حفظ تفضيلاتك بنجاح!'
          : '✅ تم تظبيط التطبيق على مقاسك!'
        : '✅ Your preferences are ready!'
    );
  };

  useEffect(() => {
    const hasCompletedFirstLesson =
      (progression.completedLessonIds?.length || 0) >= 1 || (progression.xp || 0) >= 50;
    if (
      view.name === 'shell' &&
      hasCompletedFirstLesson &&
      !userSetupOpen &&
      !placementModalOpen &&
      !showAgeGate &&
      !newOnboardingOpen &&
      !onboardingOpen
    ) {
      if (shouldShowSupporterPopup()) {
        setShowSupporterPopup(true);
      }
    }
  }, [
    view.name,
    progression.completedLessonIds?.length,
    progression.xp,
    userSetupOpen,
    placementModalOpen,
    showAgeGate,
    newOnboardingOpen,
    onboardingOpen,
  ]);

  // Save progression state updates
  const updateProgression = (updater: (prev: ProgressionState) => ProgressionState) => {
    setProgression((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('tb.progressionState', JSON.stringify(next));
      } catch (error) {
        console.error('Unable to persist progression state locally.', error);
      }
      return next;
    });
  };

  const [toastMsg, setToastMsg] = useState<React.ReactNode | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [showApkBanner, setShowApkBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || (window as any).opera);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      const isNative = Capacitor.isNativePlatform();
      const isDismissed = localStorage.getItem('hide_download_banner') === 'true';

      if (isAndroid && !isStandalone && !isNative && !isDismissed) {
        const t = window.setTimeout(() => setShowApkBanner(true), 3000);
        return () => window.clearTimeout(t);
      }
    } catch { }
  }, []);

  const T = (ar: string, en: string) =>
    isArabic ? (
      <>
        <span dir="rtl" lang="ar" className="ar" style={{ display: 'block' }}>{ar}</span>
        {en !== ar && (
          <span style={{ display: 'block', opacity: 0.6, fontSize: '11px', marginTop: '2px' }}>{en}</span>
        )}
      </>
    ) : (
      <span dir="ltr" lang="en" style={{ display: 'block' }}>{en}</span>
    );

  const showToast = (msg: React.ReactNode) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const handleQuotaLimit = () => {
      showToast(T('وصلت إلى حد الذكاء الاصطناعي اليومي. يتجدد غداً.', 'Daily AI limit reached. Resets tomorrow.'));
    };
    window.addEventListener(API_QUOTA_LIMIT_EVENT, handleQuotaLimit);
    return () => window.removeEventListener(API_QUOTA_LIMIT_EVENT, handleQuotaLimit);
  }, [isArabic]);

  // Status Bar & Capacitor Mobile Setup
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => { });
      StatusBar.setStyle({ style: Style.Dark }).catch(() => { });
      StatusBar.setBackgroundColor({ color: '#06101c' }).catch(() => { });
      if (Capacitor.getPlatform() === 'ios') {
        Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => { });
      }
    }
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
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
        backListener.then((l) => l.remove()).catch(() => { });
      };
    }
  }, [view, activeLessonNode]);

  const goHome = () => setView({ name: 'shell' });

  const handleAdaptivePlacementComplete = async (
    levelId: CefrLevelId,
    phaseId: PhaseId,
    score: number
  ) => {
    let autoCompletedIds: string[] = [];
    try {
      const { getCefrLevelHierarchy } = await import('./progression/courseData');
      const hierarchy = getCefrLevelHierarchy(targetLang);
      const allLessons = hierarchy.flatMap((l) =>
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

    let placedBand = '';
    try {
      placedBand = localStorage.getItem('tb.placementBand') || '';
    } catch {
      placedBand = '';
    }
    const nextStage: CefrStage = placedBand === 'Pre-A0' ? 'A0' : levelId === 'A1' ? 'A1' : 'A2';

    updateProgression((prev) => ({
      ...prev,
      currentLevelId: levelId,
      currentPhaseId: phaseId,
      currentStage: nextStage,
      currentUnitId: `${nextStage.toLowerCase()}-unit-1`,
      placementResult: { levelId, phaseId, score, dateISO: new Date().toISOString() },
      completedLessonIds: Array.from(new Set([...prev.completedLessonIds, ...autoCompletedIds])),
    }));

    setActiveTab('path');
    showToast(
      T(
        `🎯 تم فتح مستواك (${placedBand || levelId}) على الخريطة!`,
        `🎯 Unlocked your level (${placedBand || levelId}) on the map!`
      )
    );
  };

  const handleLessonSessionComplete = async (earnedXp: number, accuracyPercent: number) => {
    let nextStage: CefrStage | undefined;
    let coinsEarned = 0;
    let starsEarned = 1;
    if (activeLessonNode) {
      const { getNextStageAfterLessonCompletion } = await import('./progression/courseData');
      nextStage = getNextStageAfterLessonCompletion(progression, activeLessonNode.id);
      const economyResult = awardLevelCompletion(activeLessonNode.id, accuracyPercent, { isPro });
      coinsEarned = economyResult.coinsEarned;
      starsEarned = economyResult.starsEarned;
    }

    const stageCompleted = Boolean(nextStage);

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
          ? {
            ...stateWithStreak.lessonCrowns,
            [activeLessonNode.id]: Math.min(5, (stateWithStreak.lessonCrowns[activeLessonNode.id] || 0) + 1),
          }
          : stateWithStreak.lessonCrowns,
      };
    });
    const starText = '⭐'.repeat(starsEarned);
    showToast(
      stageCompleted && nextStage
        ? T(
          `🔓 فتحت المرحلة ${nextStage}! +${earnedXp} XP · +${coinsEarned} 🪙 ${starText}`,
          `🔓 ${nextStage} unlocked! +${earnedXp} XP · +${coinsEarned} 🪙 ${starText}`
        )
        : T(
          `🎉 +${earnedXp} XP · +${coinsEarned} 🪙 (${starText})`,
          `🎉 +${earnedXp} XP · +${coinsEarned} 🪙 (${starText})`
        )
    );
  };

  if (view.name === 'landing') {
    return (
      <GlobalErrorBoundary isArabic={isArabic}>
        <div className="landing-shell">
          <LandingPage onLaunchApp={launchApp} onOpenQuran={openQuranSanctuary} isArabic={isArabic} />
          <ErrorReportPrompt isArabic={isArabic} />
        </div>
      </GlobalErrorBoundary>
    );
  }

  if (view.name === 'android') {
    return (
      <GlobalErrorBoundary isArabic={isArabic}>
        <Suspense fallback={<main className="android-landing min-h-[100dvh]" aria-busy="true">Loading Thinking Bridge…</main>}>
          <AndroidLandingPage />
          <ErrorReportPrompt isArabic={isArabic} />
        </Suspense>
      </GlobalErrorBoundary>
    );
  }

  if (view.name === 'admin-console') {
    return (
      <GlobalErrorBoundary isArabic={isArabic}>
        <Suspense fallback={<main className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center" aria-busy="true">Loading Admin Console…</main>}>
          <AdminConsoleView onBack={openLanding} isArabic={isArabic} />
          <ErrorReportPrompt isArabic={isArabic} />
        </Suspense>
      </GlobalErrorBoundary>
    );
  }

  if (view.name === 'verify') {
    return (
      <GlobalErrorBoundary isArabic={isArabic}>
        <Suspense fallback={<main className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center" aria-busy="true">Loading Certificate Verification…</main>}>
          <CertificateVerifyView initialCode={view.code} onBack={openLanding} isArabic={isArabic} />
          <ErrorReportPrompt isArabic={isArabic} />
        </Suspense>
      </GlobalErrorBoundary>
    );
  }

  return (
    <GlobalErrorBoundary isArabic={isArabic}>
      <Suspense
        fallback={
          <main
            className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0A0E13] via-[#101b24] to-[#0d302e] px-6 text-center text-[#EEF2F5]"
            dir={isArabic ? 'rtl' : 'ltr'}
            aria-live="polite"
            aria-busy="true"
          >
            <div className="animate-pulse rounded-3xl bg-gradient-to-br from-teal-400/20 to-emerald-500/10 p-5 text-5xl shadow-xl shadow-teal-500/10">
              🧠
            </div>
            <p className="text-lg font-bold text-[#D8E2E8]">
              {isArabic ? 'جاري تحميل جسر التفكير...' : 'Loading Thinking Bridge...'}
            </p>
          </main>
        }
      >
        {/* 1. Primary One-Thumb Mobile Game HUD (Map / Arcade / Practice / Profile) */}
        {view.name === 'shell' && (
          <div
            className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip flex flex-col"
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--ink)',
            }}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {/* Clean Single-Row 52px Sticky Top HUD Bar (3 items max) */}
            <header
              className="tb-hud-bar sticky top-0 z-40 w-full border-b"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                paddingTop: 'env(safe-area-inset-top, 0px)',
              }}
            >
              <div className="h-[52px] max-w-[480px] mx-auto px-4 flex items-center justify-between gap-2 flex-nowrap">
                {/* 1. Level / Rank Pill (1-tap 60s Level Test) */}
                <button
                  type="button"
                  onClick={() => setPlacementModalOpen(true)}
                  aria-label={isArabic ? 'مستواك الحالي — اختبار تحديد المستوى' : 'Current Level — Adaptive Level Test'}
                  className="h-9 px-3 rounded-2xl border flex items-center gap-1.5 text-xs font-black whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    borderColor: 'var(--accent)',
                  }}
                >
                  <span>{progression.currentLevelId || progression.currentStage || 'A1'}</span>
                  <span className="opacity-80 text-[11px]">· {isArabic ? 'المستوى' : 'Lvl'}</span>
                </button>

                {/* 2. Coins & Streak Pill (1-tap Theme Shop) */}
                <button
                  type="button"
                  onClick={() => setShopOpen(true)}
                  aria-label={isArabic ? 'العملات والسلسلة — متجر الثيمات' : 'Coins & Streak — Theme Shop'}
                  className="h-9 px-3 rounded-2xl border flex items-center gap-2 text-xs font-black whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                >
                  <span>🪙 {economy.coins}</span>
                  <span className="opacity-30">|</span>
                  <span>🔥 {progression.streak || 0}</span>
                </button>

                {/* 3. Single Clean Settings / Language Icon */}
                <button
                  type="button"
                  onClick={() => setUserSetupOpen(true)}
                  aria-label={isArabic ? 'تغيير لغة الشرح والإعدادات' : 'Language & Settings'}
                  title={isArabic ? guideBadge.fullLabelAr : guideBadge.fullLabelEn}
                  className="h-9 min-w-[44px] px-2.5 rounded-2xl border flex items-center justify-center gap-1 text-xs font-black whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                >
                  <span aria-hidden="true">{guideBadge.icon}</span>
                  <span className="text-[11px]">{guideBadge.shortLabel}</span>
                </button>
              </div>
            </header>

            {/* Main Game Column */}
            <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] overflow-x-clip">
              {activeTab === 'path' && (
                <div className="space-y-4">
                  <LanguagePairBanner
                    sourceLang={sourceLang}
                    targetLang={targetLang}
                    isArabic={isArabic}
                    onOpenSelector={() => setLangSelectorOpen(true)}
                  />

                  <button
                    type="button"
                    onClick={openQuranSanctuary}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-2 text-start cursor-pointer transition active:scale-[0.99] ${
                      quranHighlighted ? 'ring-2 ring-emerald-500/50 shadow-md' : ''
                    }`}
                    style={{
                      backgroundColor: quranHighlighted ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface)',
                      borderColor: quranHighlighted ? '#10B981' : 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <span className="text-xs font-black truncate">
                      📖 {isArabic ? 'ملاذ حفظ القرآن · صدقة جارية' : 'Quran Hifz Sanctuary · Free Forever'}
                    </span>
                    <span className="text-xs font-black shrink-0" style={{ color: quranHighlighted ? '#10B981' : 'var(--accent)' }}>
                      {isArabic ? 'دخول ←' : 'Open →'}
                    </span>
                  </button>

                  <PathView
                    state={progression}
                    targetLang={targetLang}
                    learnerTrack={learnerTrack}
                    guideMode={guideMode}
                    onSelectLesson={(lesson) => {
                      setActiveLessonNode(lesson);
                    }}
                    onSelectUnitCheckpoint={() => { }}
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
                    onOpenLanguageSelector={() => setLangSelectorOpen(true)}
                    isPro={isPro}
                    onToast={(msg) => showToast(T(msg, msg))}
                  />
                </div>
              )}

              {activeTab === 'arcade' && (
                <div className="space-y-4">
                  <section
                    className="tb-card-surface p-4 rounded-3xl border space-y-3 text-start"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h2 className="text-base font-black" style={{ color: 'var(--ink)' }}>
                        🎮 {isArabic ? 'الأركيد والتحديات السريعة' : 'Arcade & Quick Challenges'}
                      </h2>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-black border"
                        style={{
                          backgroundColor: 'var(--accent-soft)',
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                        }}
                      >
                        {isPro ? '2× 🪙 Pro' : '+40 🪙'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('practice')}
                        className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--gold)', color: 'var(--ink)' }}
                      >
                        <span className="text-base block">⚔️</span>
                        <span className="text-xs font-black block">{isArabic ? 'أركيد Pro والزعماء' : 'Pro Arcade & Bosses'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setView({ name: 'exam' })}
                        className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                      >
                        <span className="text-base block">☕</span>
                        <span className="text-xs font-black block">{isArabic ? 'اختبار تحديد المستوى' : 'Quick Level Check'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setView({ name: 'story', chapterId: 'chapter-1-cairo-airport' })}
                        className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                      >
                        <span className="text-base block">✈️</span>
                        <span className="text-xs font-black block">{isArabic ? 'القصة التفاعلية' : 'Interactive Story'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setView({ name: 'language-game' })}
                        className="min-h-[56px] p-3 rounded-2xl border text-start cursor-pointer transition active:scale-95"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                      >
                        <span className="text-base block">🕹️</span>
                        <span className="text-xs font-black block">{isArabic ? 'لعبة الجسر السريعة' : 'Bridge Speed Game'}</span>
                      </button>
                    </div>
                  </section>

                  <QuestsView state={progression} isArabic={isArabic} />
                  <LeagueView
                    state={progression}
                    onToggleOptOut={() => {
                      updateProgression((p) => ({ ...p, leagueOptOut: !p.leagueOptOut }));
                    }}
                    isArabic={isArabic}
                  />
                </div>
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
                  onOpenActivateCode={() => setActivateCodeOpen(true)}
                  onXpEarned={(earned) => {
                    updateProgression((prev) => ({
                      ...prev,
                      xp: (prev.xp || 0) + earned,
                      weeklyXp: (prev.weeklyXp || 0) + earned,
                    }));
                    if (earned > 0) {
                      const coinRes = awardArcadeWinCoins(isPro);
                      showToast(
                        T(
                          `🪙 +${coinRes.coinsEarned} عملة جسر · +${earned} XP`,
                          `🪙 +${coinRes.coinsEarned} Bridge Coins · +${earned} XP`
                        )
                      );
                    }
                  }}
                  onNavigateToCoursePath={() => setActiveTab('path')}
                  targetLang={targetLang}
                  isArabic={isArabic}
                />
              )}

              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <section
                    className="tb-card-surface p-4 rounded-[20px] border flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'var(--accent-soft)',
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                        }}
                      >
                        <Compass size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black leading-tight truncate">
                          {isArabic ? 'اختبار المستوى التكيفي (60 ثانية)' : '60s Adaptive Level Test'}
                        </h3>
                        <p className="text-[11px] font-bold truncate" style={{ color: 'var(--ink-muted)' }}>
                          {isArabic
                            ? `المستوى الحالي: ${progression.currentLevelId || 'A1'} · يمكنك إعادة الاختبار في أي وقت`
                            : `Current Level: ${progression.currentLevelId || 'A1'} · Retake anytime`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlacementModalOpen(true)}
                      className="min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 cursor-pointer transition active:scale-95"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-ink)',
                      }}
                    >
                      {isArabic ? 'اختبر مستواك' : 'Retake'}
                    </button>
                  </section>

                  <ProfileView
                    state={progression}
                    profile={profile}
                    entitlement={entitlement}
                    onOpenActivateCode={() => setActivateCodeOpen(true)}
                    onOpenShop={() => setShopOpen(true)}
                    onOpenTeacherMode={() => {
                      try {
                        if (typeof window !== 'undefined' && window.history) {
                          window.history.pushState({}, '', '/teacher');
                        }
                      } catch { }
                      setView({ name: 'teacher' });
                    }}
                    onUpdateState={updateProgression}
                    onExportData={() => {
                      showToast(T('تم تصدير البيانات بنجاح', 'Data exported successfully'));
                    }}
                    onOpenPreferences={() => setView({ name: 'preferences' })}
                    onDeleteData={() => {
                      const preservedEconomy = localStorage.getItem(ECONOMY_STORAGE_KEY);
                      const preservedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                      const preservedPerf = localStorage.getItem(PERF_MODE_STORAGE_KEY);
                      const preservedQuran = localStorage.getItem(QURAN_HIFZ_STORAGE_KEY);
                      clearLocalLearningDataPreservingEntitlement();
                      try {
                        if (preservedEconomy !== null) localStorage.setItem(ECONOMY_STORAGE_KEY, preservedEconomy);
                        if (preservedTheme !== null) localStorage.setItem(THEME_STORAGE_KEY, preservedTheme);
                        if (preservedPerf !== null) localStorage.setItem(PERF_MODE_STORAGE_KEY, preservedPerf);
                        if (preservedQuran !== null) localStorage.setItem(QURAN_HIFZ_STORAGE_KEY, preservedQuran);
                      } catch { }
                      window.location.reload();
                    }}
                    onOpenPrivacyPolicy={() => setPrivacyOpen(true)}
                    onToast={(msg: string) => showToast(T(msg, msg))}
                    isArabic={isArabic}
                  />
                </div>
              )}
            </main>

            {/* Sticky Bottom 4-Tab One-Thumb Dock */}
            <nav
              aria-label={isArabic ? 'التنقل الرئيسي' : 'Main Navigation'}
              className="tb-hud-bar fixed bottom-0 inset-x-0 z-40 border-t"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="max-w-[480px] mx-auto grid grid-cols-4 gap-1 px-2 py-1.5">
                {(
                  [
                    { id: 'path', ar: 'الخريطة', en: 'Map', Icon: Map },
                    { id: 'arcade', ar: 'الأركيد', en: 'Arcade', Icon: Gamepad2 },
                    { id: 'practice', ar: 'التدريب', en: 'Practice', Icon: BookOpen },
                    { id: 'profile', ar: 'ملفي', en: 'Profile', Icon: User },
                  ] as const
                ).map(({ id, ar, en, Icon }) => {
                  const isSelected = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      aria-current={isSelected ? 'page' : undefined}
                      className="min-h-[48px] px-1 py-1.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-black leading-tight text-center cursor-pointer transition"
                      style={
                        isSelected
                          ? {
                            backgroundColor: 'var(--accent-soft)',
                            color: 'var(--accent)',
                          }
                          : {
                            color: 'var(--ink-muted)',
                          }
                      }
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="break-words">{isArabic ? ar : en}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        )}

        {/* 2. Specialized Route Overlays */}
        {view.name === 'voice' && (
          <VoicePracticeView
            onBack={goHome}
            onOpenPreferences={() => setView({ name: 'preferences' })}
            progress={progress}
            profile={profile}
            updateAndSaveProgress={updateAndSaveProgress}
            onToast={(msg) => showToast(T(msg, msg))}
            sourceLang={sourceLang}
            targetLang={targetLang}
          />
        )}

        {view.name === 'flashcards' && (
          <FlashcardsView
            profile={profile}
            progress={progress}
            updateAndSaveProgress={updateAndSaveProgress}
            onBack={goHome}
            onToast={(msg) => showToast(T(msg, msg))}
            sourceLang={sourceLang}
            targetLang={targetLang}
            initialDeckId={view.deckId}
          />
        )}

        {view.name === 'corporate' && (
          <CorporateBridgeView
            onBack={goHome}
            onToast={(msg) => showToast(T(msg, msg))}
            preferredVoice={progress.preferredVoice}
            targetLang={targetLang}
            isArabic={isArabic}
          />
        )}

        {view.name === 'clarifying' && (
          <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0A0E13] text-[#EEF2F5] px-4 pt-safe pb-safe flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
            <button onClick={goHome} className="mb-4 px-4 py-2 min-h-[48px] bg-stone-800 rounded-xl text-sm font-bold self-start cursor-pointer">
              {isArabic ? '← العودة' : '← Back'}
            </button>
            <ClarifyingCoachView onClose={goHome} />
          </div>
        )}

        {view.name === 'admin' && (
          <AdminFeedbackView onBack={goHome} isArabic={isArabic} />
        )}

        {view.name === 'maintenance' && (
          <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0A0E13] text-[#EEF2F5] px-4 pt-safe pb-safe" dir={isArabic ? 'rtl' : 'ltr'}>
            <button onClick={goHome} className="mb-4 px-4 py-2 min-h-[48px] bg-stone-800 rounded-xl text-sm font-bold cursor-pointer">
              {isArabic ? '← العودة' : '← Back'}
            </button>
            <MaintenanceGuide />
          </div>
        )}

        {view.name === 'pronunciation' && (
          <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0A0E13] text-[#EEF2F5] px-4 pt-safe pb-safe flex flex-col items-center justify-start gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
            <button onClick={goHome} className="px-4 py-2 min-h-[48px] bg-stone-800 rounded-xl text-sm font-bold self-start cursor-pointer">
              {isArabic ? '← العودة' : '← Back'}
            </button>
            <PronunciationRecorder
              targetLang={targetLang}
              isArabic={isArabic}
              onBackToLessons={goHome}
              onToast={(msg) => showToast(T(msg, msg))}
            />
          </div>
        )}

        {view.name === 'preferences' && (
          <PreferencesView
            onBack={goHome}
            profile={profile}
            onSaveProfile={saveProfile}
            progress={progress}
            onToast={(msg) => showToast(T(msg, msg))}
            sourceLang={sourceLang}
            targetLang={targetLang}
            onOpenLanguageSelector={() => setLangSelectorOpen(true)}
          />
        )}

        {view.name === 'studio' && (
          <StudioDashboard
            onBack={goHome}
            isArabic={isArabic}
          />
        )}

        {view.name === 'language-game' && (
          <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A1E3F] text-[#F5F0E6] flex items-center justify-center font-arabic">{isArabic ? 'جاري التحميل...' : 'Loading game...'}</div>}>
            <LanguageGame
              targetLang={targetLang}
              sourceLang={sourceLang}
              onBack={() => {
                if (typeof window !== 'undefined' && window.history) {
                  window.history.pushState({}, '', '/');
                }
                setView({ name: 'landing' });
              }}
            />
          </Suspense>
        )}

        {view.name === 'story' && (
          <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center font-arabic">{isArabic ? 'جاري تحميل القصة...' : 'Loading story...'}</div>}>
            <StoryEngineLoader
              sourceLang={sourceLang as import('./types/story').LanguageCode}
              targetLang={targetLang as import('./types/story').LanguageCode}
              onComplete={() => {
                showToast(T('🎉 أكملت الفصل الأول!', '🎉 Chapter 1 completed!'));
                setView({ name: 'shell' });
              }}
              onBack={() => setView({ name: 'shell' })}
            />
          </Suspense>
        )}

        {view.name === 'hacker-terminal' && (
          <Suspense fallback={<div className="min-h-[100dvh] bg-black text-green-500 font-mono flex items-center justify-center">INITIALIZING TERMINAL...</div>}>
            <HackerTerminal onComplete={() => setView({ name: 'shell' })} />
          </Suspense>
        )}

        {view.name === 'teacher' && (
          <Suspense fallback={<div className="min-h-[100dvh] bg-black text-teal-500 flex items-center justify-center">Loading Teacher Mode...</div>}>
            <TeacherView onBack={() => setView({ name: 'shell' })} />
          </Suspense>
        )}

        {view.name === 'exam' && (
          <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0E13] text-amber-400 flex items-center justify-center font-arabic">{isArabic ? 'جاري تحميل اختبار يا باشا...' : 'Loading Ya Basha CEFR Exam...'}</div>}>
            <ExamPage onBack={() => setView({ name: 'shell' })} />
          </Suspense>
        )}

        {view.name === 'dictionary' && (
          <DictionaryView onBack={() => setView({ name: 'shell' })} isArabic={isArabic} targetLang={targetLang} />
        )}

        {view.name === 'quran' && (
          <QuranSanctuaryView onBack={goHome} isArabic={isArabic} />
        )}

        {/* Interactive Lesson Session Modal */}
        {activeLessonNode && (
          <LessonRunner
            lesson={activeLessonNode}
            onCompleteSession={handleLessonSessionComplete}
            onClose={() => setActiveLessonNode(null)}
            isArabic={isArabic}
            targetLang={targetLang}
            sourceLang={sourceLang}
          />
        )}

        {/* Game-Style Diagnostic Onboarding Modal */}
        {!showAgeGate && newOnboardingOpen && (
          <OnboardingFlow onComplete={() => {
            setNewOnboardingOpen(false);
            try {
              localStorage.setItem('tb.onboardingComplete', 'true');
            } catch { }
            setOnboardingOpen(false);
          }} />
        )}

        {!showAgeGate && !newOnboardingOpen && onboardingOpen && (
          <Onboarding
            initialProfile={profile}
            onComplete={(newProfile, extraData) => {
              saveProfile({
                ...profile,
                ...newProfile,
              });
              if (newProfile.sourceLanguage && newProfile.targetLanguage) {
                setPair(newProfile.sourceLanguage, newProfile.targetLanguage);
              }
              const stage: CefrStage = extraData?.diagnosticLevel === 'intermediate' ? 'A2' : 'A0';
              updateProgression((p) => ({
                ...p,
                currentStage: stage,
                currentUnitId: `${stage.toLowerCase()}-unit-1`,
              }));
              try {
                const activeConfig = {
                  cefrLevel: stage,
                  placedFrom: extraData?.diagnosticLevel === 'intermediate' ? 'intermediate-bridge' : 'beginner',
                  targetLang: newProfile.targetLanguage || 'en',
                  sourceLang: newProfile.sourceLanguage || 'arz',
                  focusArea: newProfile.goal || 'general',
                  diagnosticOrigin: extraData?.diagnosticLevel || 'beginner',
                };
                localStorage.setItem('tb.activeProfileConfig', JSON.stringify(activeConfig));
                localStorage.setItem('tb.onboardingComplete', 'true');
              } catch (err) {
                console.warn('Unable to persist active profile config locally.', err);
              }
              setOnboardingOpen(false);
              const toastMsg = extraData?.diagnosticLevel === 'intermediate'
                ? T('🚀 تم تخصيص جسر التفكير — موقعك A2 (جسر B1)', "🚀 Mission initialized — you're at A2 (B1 Bridge)")
                : T('🚀 تم تخصيص جسر التفكير وانطلقت اللعبة!', 'Mission initialized! Game Started 🚀');
              showToast(toastMsg);
            }}
            onCancel={() => {
              try {
                localStorage.setItem('tb.onboardingComplete', 'true');
              } catch { }
              setOnboardingOpen(false);
            }}
          />
        )}

        {/* Language Selector Modal */}
        <LanguageSelectorModal
          isOpen={langSelectorOpen}
          onClose={() => setLangSelectorOpen(false)}
          currentSource={sourceLang}
          currentTarget={targetLang}
          isArabic={isArabic}
          onOpenSupporterGate={() => setSupporterGateOpen(true)}
          onSelectPair={(source, target) => {
            const targetChanged = target !== targetLang;
            setPair(source, target);
            // Immediately sync live UI language & direction when the learner confirms a course pair
            if (source.startsWith('ar')) {
              setGuideMode(guideMode === 'standard_ar' ? 'standard_ar' : 'egyptian_ar');
            } else {
              setGuideMode('english_guided');
            }
            if (targetChanged) {
              // A new target language starts from the beginning of its own path,
              // instead of inheriting the previous language's stage (e.g. A2).
              updateProgression((prev) => ({
                ...prev,
                currentStage: 'A0',
                currentUnitId: 'a0-unit-1',
              }));
            }
          }}
          onToast={(msg) => showToast(T(msg, msg))}
        />

        {/* One-time bright YouTube supporter nudge popup */}
        <YouTubeSupporterPopup
          isOpen={showSupporterPopup}
          onClose={() => setShowSupporterPopup(false)}
          isArabic={isArabic}
        />

        {/* Supporter Gate Modal (@sciamrsherif) */}
        <SupporterGateModal
          isOpen={supporterGateOpen}
          onClose={() => setSupporterGateOpen(false)}
          onUnlocked={() => {
            showToast(T('🎉 تم فتح الألماني وكل اللغات بنجاح! أهلاً بك في عائلة جسر التفكير.', '🎉 All languages unlocked! Welcome to the family.'));
          }}
          onOpenActivateCode={() => {
            setSupporterGateOpen(false);
            setActivateCodeOpen(true);
          }}
          onToast={(msg) => showToast(T(msg, msg))}
          targetLanguageName={TARGET_LANGUAGE_META[targetLang]?.nameAr || 'الألماني'}
        />

        {/* Pro / Academy Voucher Code Activation Modal */}
        <ActivateCodeModal
          isOpen={activateCodeOpen}
          onClose={() => setActivateCodeOpen(false)}
          isArabic={isArabic}
          onToast={(msg) => showToast(T(msg, msg))}
        />

        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal
          isOpen={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
          isArabic={isArabic}
        />

        {/* 8-Click Poem Easter Egg Modal */}
        <MutahEasterEggModal
          isOpen={showPoemModal}
          onClose={closePoemModal}
          clickCount={clickCount}
          onIncrementClick={registerClick}
        />

        {/* 99-Click Captain Erwin Charge Easter Egg Modal */}
        <ErwinChargeModal
          isOpen={showErwinModal}
          onClose={closeErwinModal}
          clickCount={clickCount}
        />

        {/* Alexandrian Sea Breeze Easter Egg Modal */}
        <AlexandrianEasterEggModal
          isOpen={showAlexandrianModal}
          onClose={closeAlexandrianModal}
        />

        {/* First-Launch Clean 1-Screen Setup Modal */}
        <UserSetupModal
          isOpen={view.name === 'shell' && userSetupOpen}
          initialGuideMode={guideMode}
          initialTrack={learnerTrack}
          onClose={() => {
            setUserSetupOpen(false);
            setShowAgeGate(false);
            setNewOnboardingOpen(false);
            setOnboardingOpen(false);
            try {
              localStorage.setItem('tb.onboardingComplete', 'true');
            } catch { }
          }}
          onComplete={handleUserSetupComplete}
        />

        {/* 60-Second Adaptive English Placement Test Modal */}
        {placementModalOpen && (
          <PlacementTestModal
            isOpen={placementModalOpen}
            onClose={() => {
              setPlacementModalOpen(false);
              try {
                localStorage.setItem('tb.placementDone', 'true');
              } catch { }
            }}
            state={progression}
            onCompletePlacement={handleAdaptivePlacementComplete}
            isArabic={isArabic}
          />
        )}

        {/* First-Launch Age Gate / Learner Selector Modal */}
        <AgeGateModal
          isOpen={!userSetupOpen && showAgeGate}
          onClose={() => setShowAgeGate(false)}
          isArabic={isArabic}
        />



        {/* Feedback Review Modal */}
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSubmit={() => { }}
          onToast={(msg) => showToast(T(msg, msg))}
          profile={profile}
        />

        {/* Theme & Cosmetic Shop Modal */}
        <ThemeShopModal
          isOpen={shopOpen}
          onClose={() => setShopOpen(false)}
          isPro={isPro}
          isArabic={isArabic}
          onToast={(msg) => showToast(T(msg, msg))}
        />

        {/* Non-blocking PWA & Capacitor Android Auto-Update Banner */}
        <UpdateBanner isArabic={isArabic} />

        {/* Steam-style Achievement Unlock Toast */}
        <AchievementToast isArabic={isArabic} />

        {/* Floating Toast Notification */}
        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[90] max-w-[calc(100vw-1.5rem)] px-4 py-2.5 border text-xs font-bold rounded-2xl shadow-xl pointer-events-none text-center break-words"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--accent)',
              color: 'var(--ink)',
            }}
          >
            {toastMsg}
          </div>
        )}

        {/* Smart Android APK Download Banner (only after Level 1 completes to keep first-launch clean) */}
        {showApkBanner && !Capacitor.isNativePlatform() && (progression.completedLessonIds?.length || 0) >= 1 && (
          <div
            className="fixed bottom-0 left-0 right-0 z-[48] p-3.5 pb-safe border-t shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
            dir={isArabic ? 'rtl' : 'ltr'}
            lang={isArabic ? 'ar' : 'en'}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <Download size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black break-words" style={{ color: 'var(--ink)' }}>
                  {isArabic ? 'حمّل تطبيق فكّر إنجليزي' : 'Download Thinking Bridge App'}
                </span>
                <span className="text-[11px] font-bold break-words" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic ? 'يعمل بدون إنترنت · V9 (42.7 MB APK)' : '100% Offline · V9 (42.7 MB APK)'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v9.0.0/ThinkingBridge-v9.0.0.apk"
                download="ThinkingBridge-v9.0.0.apk"
                className="min-h-[48px] px-4 py-2 rounded-xl text-xs font-black shadow-md hover:opacity-90 transition active:scale-95 inline-flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                {isArabic ? 'تحميل' : 'Download'}
              </a>
              <button
                onClick={() => {
                  setShowApkBanner(false);
                  try {
                    localStorage.setItem('hide_download_banner', 'true');
                  } catch { }
                }}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border transition cursor-pointer"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink-muted)' }}
                aria-label={isArabic ? 'إغلاق' : 'Close'}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* User-Approved Local Error Report Prompt */}
        <ErrorReportPrompt isArabic={isArabic} />

        {/* Audio Unlocker overlay removed */}
      </Suspense>
    </GlobalErrorBoundary>
  );
}

function DictionaryView({ onBack, isArabic, targetLang }: { onBack: () => void; isArabic: boolean; targetLang: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Warm dictionary chunk once when entering Smart Dictionary or switching language
  useEffect(() => {
    let active = true;
    import('./data/dictionaries')
      .then(({ getTargetDictionaryAsync }) => getTargetDictionaryAsync(targetLang))
      .catch(() => {
        if (active) setResults([]);
      });
    return () => {
      active = false;
    };
  }, [targetLang]);

  useEffect(() => {
    let active = true;
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      import('./data/dictionaries')
        .then(({ searchTargetDictionaryAsync }) =>
          searchTargetDictionaryAsync(query, targetLang as any, 'ar', 15).then((res) => {
            if (!active) return;
            setResults(res.slice(0, 15));
            setLoading(false);
          })
        )
        .catch(() => {
          if (active) {
            setResults([]);
            setLoading(false);
          }
        });
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, targetLang]);

  return (
    <div className="min-h-[100dvh] bg-[#060E1A] text-slate-100 pb-safe" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-40 bg-[#06101c]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-6 pb-3 pt-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button onClick={onBack} className="px-4 py-2 min-h-[48px] rounded-2xl bg-[#0B1C33] border border-cyan-500/40 text-cyan-300 font-black text-xs cursor-pointer shrink-0">
            ← {isArabic ? 'العودة' : 'Back'}
          </button>
          <h2 className="text-base font-black text-white leading-snug break-words">{isArabic ? '📖 القاموس الذكي التفاعلي' : 'Interactive Smart Dictionary'}</h2>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Live Search Bar */}
        <div className="p-4 rounded-3xl bg-[#0B1C33] border border-cyan-500/30 space-y-3 shadow-xl">
          <label className="text-xs font-bold text-cyan-300 block">
            {isArabic
              ? `ابحث عن أي كلمة (${TARGET_LANGUAGE_META[targetLang as keyof typeof TARGET_LANGUAGE_META]?.nameAr || targetLang} أو عربي) في القاموس المحلي (بدون إنترنت):`
              : 'Search offline dictionary (instant, zero internet):'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? 'اكتب كلمة للبحث (مثل: hello, water, سلام)...' : 'Type to search...'}
              className="w-full px-4 py-3 rounded-2xl bg-[#060E1A] border border-cyan-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
                className="absolute end-1 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-cyan-400 font-bold text-sm">
              {isArabic ? 'جاري تحميل القاموس...' : 'Loading offline dictionary...'}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((entry, idx) => {
                const rawWord = (entry.word || entry.term || entry.germanWord || entry.arabicWord || '').trim();
                const translation = (entry.translation || entry.arabicWord || entry.englishTranslation || '').trim();
                const rawPhonetic = (entry.phoneticAr || entry.phonetic || entry.reading || entry.romaji || '').trim();
                const wLower = rawWord.toLowerCase();
                const pLower = rawPhonetic.toLowerCase();
                const phonetic =
                  rawPhonetic &&
                    pLower !== wLower &&
                    pLower !== `[${wLower}]` &&
                    pLower !== `(${wLower})` &&
                    pLower !== `([${wLower}])`
                    ? rawPhonetic
                    : '';
                const isWordArabic = /[\u0600-\u06FF]/.test(rawWord);
                const audioText =
                  targetLang === 'en' && isWordArabic && translation
                    ? translation.split(/[;,()]/)[0].replace(/^to\s+/i, '').trim() || rawWord
                    : rawWord.replace(/\s*\([^)]*\)/g, '').trim();
                const displayWord = targetLang === 'en' && isWordArabic ? audioText : rawWord;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0B1C33]/90 border border-cyan-500/20 shadow-md flex items-center justify-between gap-4">
                    <div className="space-y-1 text-start min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-cyan-300 font-sans">{displayWord}</span>
                        {phonetic && <span className="text-xs text-amber-300/80 font-medium">({phonetic})</span>}
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{translation}</p>
                      {!isArabic && translation && (
                        <ArabicPhraseAssist phrase={translation} compact />
                      )}
                    </div>
                    <div className="shrink-0">
                      <DualSpeedAudio text={audioText} showLabels={false} targetLang={targetLang} isArabic={isArabic} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-6 rounded-3xl bg-[#0B1C33]/80 border border-amber-500/30 text-center space-y-2">
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-bold text-amber-300">
                {isArabic
                  ? 'مش لاقي الكلمة دي في القاموس المحلي حالياً — جرّب كلمة أبسط أو بدون تشكيل'
                  : 'No local match found — try a simpler root word.'}
              </p>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'يعمل بدون إنترنت بالكامل.'
                  : 'Zero internet required. Try typing a simpler root word or search term.'}
              </p>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              {isArabic ? 'اكتب في خانة البحث أعلاه لاستكشاف القاموس المحلي فوراً.' : 'Type a query above to search the offline dictionary.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
