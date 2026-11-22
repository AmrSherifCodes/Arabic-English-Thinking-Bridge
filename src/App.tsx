import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Download } from 'lucide-react';

import { AppTab } from './components/navigation/AppShell';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { Onboarding } from './components/Onboarding';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { UserProgress, LearningGoal } from './types';
import { useLanguagePair } from './hooks/useLanguagePair';
import { LanguagePairBanner } from './components/LanguagePairBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ReviewPrompt } from './components/ReviewPrompt';
import { API_QUOTA_LIMIT_EVENT } from './hooks/useApiKeyGate';
import { ErwinChargeModal } from './components/ErwinChargeModal';
import { AlexandrianEasterEggModal } from './components/AlexandrianEasterEggModal';
import { MutahEasterEggModal } from './components/MutahEasterEggModal';
import { SupporterGateModal } from './components/SupporterGateModal';
import { YouTubeSupporterPopup } from './components/YouTubeSupporterPopup';
import { TARGET_LANGUAGE_META } from './data/languages';
import { DualSpeedAudio } from './components/DualSpeedAudio';
import { useAmrClickEasterEgg } from './utils/easterEgg';
import { initYouTubeSupporter, shouldShowSupporterPopup } from './utils/youtubeSupporter';
import { useUiMode, syncUiModeClass } from './utils/uiMode';
import { getLearnerMode, syncLearnerModeClass } from './utils/learnerMode';
import { AgeGateModal } from './components/AgeGateModal';

import { CefrStage, ProgressionState, LessonNode } from './progression/types';
import { migrateLegacyStorageToProgression } from './progression/migration';
import { updateStreakAndShields } from './progression/engine';
import { getNextStageAfterLessonCompletion, isLessonUnlocked } from './progression/courseData';

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
const AppShell = lazy(() => import('./components/navigation/AppShell').then((m) => ({ default: m.AppShell })));
const AndroidLandingPage = lazy(() => import('./components/AndroidLandingPage').then((m) => ({ default: m.AndroidLandingPage })));
const PathView = lazy(() => import('./components/progression/PathView').then((m) => ({ default: m.PathView })));
const PracticeHubView = lazy(() => import('./components/progression/PracticeHubView').then((m) => ({ default: m.PracticeHubView })));
const QuestsView = lazy(() => import('./components/progression/QuestsView').then((m) => ({ default: m.QuestsView })));
const LeagueView = lazy(() => import('./components/progression/LeagueView').then((m) => ({ default: m.LeagueView })));
const ProfileView = lazy(() => import('./components/progression/ProfileView').then((m) => ({ default: m.ProfileView })));
const LessonRunner = lazy(() => import('./components/progression/LessonRunner').then((m) => ({ default: m.LessonRunner })));
const OnboardingPlacementModal = lazy(() => import('./components/progression/OnboardingPlacementModal').then((m) => ({ default: m.OnboardingPlacementModal })));
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
  | { name: 'maintenance' }
  | { name: 'pronunciation' }
  | { name: 'studio' }
  | { name: 'language-game' }
  | { name: 'story'; chapterId: string }
  | { name: 'hacker-terminal' }
  | { name: 'exam' }
  | { name: 'dictionary' };

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
        const path = window.location.pathname.toLowerCase();
        const urlParams = new URLSearchParams(window.location.search);

        if (path === '/exam') return { name: 'exam' };
        if (path === '/android') return { name: 'android' };
        if (path === '/language-game') return { name: 'language-game' };
        if (path === '/teacher') return { name: 'teacher' };
        if (urlParams.get('admin') === 'true') return { name: 'studio' };
        if (urlParams.get('app') === 'true' || path === '/app') {
          return { name: 'shell' };
        }
      }
    } catch {}
    // Option B: Native mobile apps (Capacitor Android/iOS) bypass marketing landing page completely
    if (Capacitor.isNativePlatform()) {
      return { name: 'shell' };
    }
    return { name: 'landing' };
  });

  const launchApp = () => {
    try {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/app');
      }
    } catch {}
    setView({ name: 'shell' });
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

  const [activeTab, setActiveTab] = useState<AppTab>('path');
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

  const { profile, saveProfile } = useUserProfile();
  const { sourceLang, targetLang, setPair } = useLanguagePair();
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());

  const updateAndSaveProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveUserProgress(next);
      return next;
    });
  };

  const isArabicSource = sourceLang.startsWith('ar') || sourceLang === 'arz' || sourceLang === 'apc' || sourceLang === 'afb' || sourceLang === 'ary';
  const isArabic = isArabicSource && (profile?.language !== 'english');
  const [uiMode] = useUiMode();

  // Deck opened by each stage's flashcard checkpoints in the masar path.
  const stageFlashcardDecks =
    profile?.dialect === 'egyptian'
      ? ['master-dictionary', 'master-dictionary', 'master-dictionary']
      : targetLang === 'en'
        ? ['phase-1', 'phase-2', 'phase-3']
        : [];

  useEffect(() => {
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
      } catch {}
      setAudioUnlocked(true);
      try {
        sessionStorage.setItem('tb.audioUnlocked', 'true');
      } catch {}
    };
    window.addEventListener('pointerdown', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  useEffect(() => {
    const syncViewFromLocation = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const urlParams = new URLSearchParams(window.location.search);
        if (path === '/exam') setView({ name: 'exam' });
        else if (path === '/android') setView({ name: 'android' });
        else if (path === '/language-game') setView({ name: 'language-game' });
        else if (path === '/teacher') setView({ name: 'teacher' });
        else if (urlParams.get('admin') === 'true') setView({ name: 'studio' });
        else if (urlParams.get('app') === 'true' || path === '/app' || Capacitor.isNativePlatform()) {
          setView({ name: 'shell' });
        } else {
          setView({ name: 'landing' });
        }
      } catch {}
    };
    window.addEventListener('popstate', syncViewFromLocation);
    return () => window.removeEventListener('popstate', syncViewFromLocation);
  }, []);

  useEffect(() => {
    if (view.name === 'landing') return;
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [view.name, isArabic]);

  useEffect(() => {
    if (view.name === 'shell' && !showAgeGate && !newOnboardingOpen && !onboardingOpen) {
      if (shouldShowSupporterPopup()) {
        setShowSupporterPopup(true);
      }
    }
  }, [view.name, showAgeGate, newOnboardingOpen, onboardingOpen]);

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
    } catch {}
  }, []);

  const T = (ar: string, en: string) => (
    <>
      <span dir="rtl" lang="ar" className="ar" style={{ display: 'block' }}>{ar}</span>
      <span style={{ display: 'block', opacity: 0.6, fontSize: '11px', marginTop: '2px' }}>{en}</span>
    </>
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
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#06101c' }).catch(() => {});
      if (Capacitor.getPlatform() === 'ios') {
        Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
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
        backListener.then((l) => l.remove()).catch(() => {});
      };
    }
  }, [view, activeLessonNode]);

  const goHome = () => setView({ name: 'shell' });

  const handleLessonSessionComplete = (earnedXp: number, _accuracyPercent: number) => {
    const nextStage = activeLessonNode
      ? getNextStageAfterLessonCompletion(progression, activeLessonNode.id)
      : undefined;

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
    showToast(stageCompleted && nextStage
      ? T(`🔓 فتحت المرحلة ${nextStage}! +${earnedXp} XP`, `🔓 ${nextStage} unlocked! +${earnedXp} XP`)
      : T(`🎉 +${earnedXp} XP! درس مكتمل بنجاح`, `🎉 +${earnedXp} XP! Lesson Mastered!`));
  };

  if (view.name === 'landing') {
    return (
      <ErrorBoundary>
        <div className="landing-shell">
          <LandingPage onLaunchApp={launchApp} isArabic={isArabic} />
        </div>
      </ErrorBoundary>
    );
  }

  if (view.name === 'android') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<main className="android-landing min-h-[100dvh]" aria-busy="true">Loading Thinking Bridge…</main>}>
          <AndroidLandingPage />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
      {/* 1. Primary App Shell (Home / Path / Practice / Quests / League / Profile) */}
      {view.name === 'shell' && (
        <AppShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={progression}
          targetLang={targetLang}
          isArabic={isArabic}
          onOpenLanding={() => setView({ name: 'landing' })}
          onOpenLanguageSelector={() => setLangSelectorOpen(true)}
          onOpenAgeGate={() => setShowAgeGate(true)}
          onOpenSupporterPopup={() => setShowSupporterPopup(true)}
        >
          {activeTab === 'path' && (
            <div className="space-y-3">
              <LanguagePairBanner
                sourceLang={sourceLang}
                targetLang={targetLang}
                onOpenSelector={() => setLangSelectorOpen(true)}
              />

              <PathView
                state={progression}
                targetLang={targetLang}
                onSelectLesson={(lesson) => {
                  setActiveLessonNode(lesson);
                }}
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
                onOpenLanguageSelector={() => setLangSelectorOpen(true)}
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
              onNavigateToCoursePath={() => setActiveTab('path')}
              targetLang={targetLang}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsView state={progression} isArabic={isArabic} />
          )}

          {activeTab === 'league' && (
            <LeagueView
              state={progression}
              onToggleOptOut={() => {
                updateProgression((p) => ({ ...p, leagueOptOut: !p.leagueOptOut }));
              }}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              state={progression}
              profile={profile}
              onUpdateState={updateProgression}
              onExportData={() => {
                showToast(T('تم تصدير البيانات بنجاح', 'Data exported successfully'));
              }}
              onOpenPreferences={() => setView({ name: 'preferences' })}
              onDeleteData={() => {
                try {
                  localStorage.clear();
                } catch {}
                window.location.reload();
              }}
              onOpenPrivacyPolicy={() => setPrivacyOpen(true)}
              onToast={(msg: string) => showToast(T(msg, msg))}
              isArabic={isArabic}
            />
          )}
        </AppShell>
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
        />
      )}

      {view.name === 'clarifying' && (
        <div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] px-4 pt-safe pb-safe flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="mb-4 px-4 py-2 min-h-[44px] bg-stone-800 rounded-xl text-sm font-bold self-start">
            {isArabic ? '← العودة' : '← Back'}
          </button>
          <ClarifyingCoachView onClose={goHome} />
        </div>
      )}

      {view.name === 'admin' && (
        <AdminFeedbackView onBack={goHome} isArabic={isArabic} />
      )}

      {view.name === 'maintenance' && (
        <div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] px-4 pt-safe pb-safe" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="mb-4 px-4 py-2 min-h-[44px] bg-stone-800 rounded-xl text-sm font-bold">
            {isArabic ? '← العودة' : '← Back'}
          </button>
          <MaintenanceGuide />
        </div>
      )}

      {view.name === 'pronunciation' && (
        <div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] px-4 pt-safe pb-safe flex flex-col items-center justify-start gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="px-4 py-2 min-h-[44px] bg-stone-800 rounded-xl text-sm font-bold self-start">
            {isArabic ? '← العودة' : '← Back'}
          </button>
          <PronunciationRecorder targetLang={targetLang} />
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
        <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A1E3F] text-[#F5F0E6] flex items-center justify-center font-arabic">جاري التحميل...</div>}>
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
        <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center font-arabic">جاري تحميل القصة...</div>}>
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
        <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0E13] text-amber-400 flex items-center justify-center font-arabic">جاري تحميل اختبار يا باشا...</div>}>
          <ExamPage onBack={() => setView({ name: 'shell' })} />
        </Suspense>
      )}

      {view.name === 'dictionary' && (
        <DictionaryView onBack={() => setView({ name: 'shell' })} isArabic={isArabic} targetLang={targetLang} />
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
          } catch {}
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
            } catch {}
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
        onOpenSupporterGate={() => setSupporterGateOpen(true)}
        onSelectPair={(source, target) => {
          const targetChanged = target !== targetLang;
          setPair(source, target);
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
        onToast={(msg) => showToast(T(msg, msg))}
        targetLanguageName={TARGET_LANGUAGE_META[targetLang]?.nameAr || 'الألماني'}
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

      {/* First-Launch Age Gate / Learner Selector Modal */}
      <AgeGateModal
        isOpen={showAgeGate}
        onClose={() => setShowAgeGate(false)}
        isArabic={isArabic}
      />



      {/* Feedback Review Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={() => {}}
        onToast={(msg) => showToast(T(msg, msg))}
        profile={profile}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-surface border border-border text-text text-xs font-bold rounded-xl shadow-xl backdrop-blur-md"
        >
          {toastMsg}
        </div>
      )}

      {/* Smart Android APK Download Banner */}
      {showApkBanner && !Capacitor.isNativePlatform() && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 pb-safe bg-surface border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom"
          dir="rtl"
          lang="ar"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black shrink-0">
              <Download size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-text truncate">حمّل تطبيق فكّر إنجليزي</span>
              <span className="text-[10px] text-muted font-bold truncate">يعمل بدون إنترنت (أندرويد)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/download"
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-black shadow-md hover:opacity-90 transition active:scale-95"
            >
              تحميل
            </a>
            <button
              onClick={() => {
                setShowApkBanner(false);
                try {
                  localStorage.setItem('hide_download_banner', 'true');
                } catch {}
              }}
              className="p-2 rounded-xl bg-surface-2 text-muted hover:text-text transition"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Audio Unlocker overlay removed */}
        </Suspense>
    </ErrorBoundary>
  );
}

function DictionaryView({ onBack, isArabic, targetLang }: { onBack: () => void; isArabic: boolean; targetLang: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    import('./data/dictionaries')
      .then(({ getTargetDictionaryAsync, searchTargetDictionary }) =>
        getTargetDictionaryAsync(targetLang).then(() => {
          if (!active) return;
          const res = searchTargetDictionary(query, targetLang as any, 'ar');
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
    return () => {
      active = false;
    };
  }, [query, targetLang]);

  return (
    <div className="min-h-[100dvh] bg-[#060E1A] text-slate-100 pb-safe" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-40 bg-[#06101c]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-6 pb-3 pt-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button onClick={onBack} className="px-4 py-2 min-h-[44px] rounded-2xl bg-[#0B1C33] border border-cyan-500/40 text-cyan-300 font-black text-xs cursor-pointer shrink-0">
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
                className="absolute end-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-cyan-400 font-bold text-sm">جاري تحميل القاموس...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((entry, idx) => {
                const word = entry.word || entry.term || entry.germanWord || entry.arabicWord || '';
                const translation = entry.translation || entry.arabicWord || entry.englishTranslation || '';
                const rawPhonetic = entry.phoneticAr || entry.reading || entry.romaji || '';
                const phonetic = rawPhonetic && rawPhonetic !== `[${word}]` && rawPhonetic !== word ? rawPhonetic : '';
                const isWordArabic = /[\u0600-\u06FF]/.test(word);
                const audioText =
                  targetLang === 'en' && isWordArabic && translation
                    ? translation.split(/[;,()]/)[0].replace(/^to\s+/i, '').trim() || word
                    : word;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0B1C33]/90 border border-cyan-500/20 shadow-md flex items-center justify-between gap-4">
                    <div className="space-y-1 text-start min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-cyan-300 font-sans">{word}</span>
                        {phonetic && <span className="text-xs text-amber-300/80 font-medium">({phonetic})</span>}
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{translation}</p>
                    </div>
                    <div className="shrink-0">
                      <DualSpeedAudio text={audioText} showLabels={false} targetLang={targetLang} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-6 rounded-3xl bg-[#0B1C33]/80 border border-amber-500/30 text-center space-y-2">
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-bold text-amber-300">
                مش لاقي الكلمة دي في القاموس المحلي حالياً — جرّب كلمة أبسط أو بدون تشكيل
              </p>
              <p className="text-xs text-slate-400">Zero internet required. Try typing a simpler root word or search term.</p>
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
