import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Download } from 'lucide-react';

import { AppTab } from './components/navigation/AppShell';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress } from './utils/storage';
import { UserProgress, LearningGoal } from './types';
import { useLanguagePair } from './hooks/useLanguagePair';
import { LanguagePairBanner } from './components/LanguagePairBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ReviewPrompt } from './components/ReviewPrompt';
import { API_QUOTA_LIMIT_EVENT } from './hooks/useApiKeyGate';

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

type View =
  | { name: 'shell' }
  | { name: 'landing' }
  | { name: 'android' }
  | { name: 'voice' }
  | { name: 'flashcards'; deckId?: string }
  | { name: 'corporate' }
  | { name: 'preferences' }
  | { name: 'admin' }
  | { name: 'maintenance' }
  | { name: 'pronunciation' };

export default function App() {
  const [view, setView] = useState<View>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const urlParams = new URLSearchParams(window.location.search);

        if (path === '/android') return { name: 'android' };
        if (urlParams.get('admin') === 'true') return { name: 'admin' };
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
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
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

  const { profile, saveProfile } = useUserProfile();
  const { sourceLang, targetLang, setPair } = useLanguagePair();
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());

  const updateAndSaveProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('tb_user_progress', JSON.stringify(next));
      } catch (err) {
        console.warn('Unable to persist user progress locally.', err);
      }
      return next;
    });
  };

  const isArabic = (profile?.language || 'arabic') === 'arabic';

  // Deck opened by each stage's flashcard checkpoints in the masar path.
  const stageFlashcardDecks =
    profile?.dialect === 'egyptian'
      ? ['master-dictionary', 'master-dictionary', 'master-dictionary']
      : targetLang === 'en'
        ? ['phase-1', 'phase-2', 'phase-3']
        : [];

  useEffect(() => {
    if (view.name === 'landing') return;
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [view.name, isArabic]);

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
    const isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || (window as any).opera);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const isNative = Capacitor.isNativePlatform();
    const isDismissed = localStorage.getItem('hide_download_banner') === 'true';

    if (isAndroid && !isStandalone && !isNative && !isDismissed) {
      const t = window.setTimeout(() => setShowApkBanner(true), 3000);
      return () => window.clearTimeout(t);
    }
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
      StatusBar.setBackgroundColor({ color: '#090D16' }).catch(() => {});
      Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});

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

    updateProgression((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      streak: prev.streak === 0 ? 1 : prev.streak,
      currentStage: nextStage || prev.currentStage,
      currentUnitId: nextStage ? `${nextStage.toLowerCase()}-unit-1` : prev.currentUnitId,
      completedLessonIds: activeLessonNode
        ? Array.from(new Set([...prev.completedLessonIds, activeLessonNode.id]))
        : prev.completedLessonIds,
      lessonCrowns: activeLessonNode
        ? {
            ...prev.lessonCrowns,
            [activeLessonNode.id]: Math.min(5, (prev.lessonCrowns[activeLessonNode.id] || 0) + 1),
          }
        : prev.lessonCrowns,
    }));
    showToast(stageCompleted && nextStage
      ? T(`🔓 فتحت المرحلة ${nextStage}! +${earnedXp} XP`, `🔓 ${nextStage} unlocked! +${earnedXp} XP`)
      : T(`🎉 +${earnedXp} XP! درس مكتمل بنجاح`, `🎉 +${earnedXp} XP! Lesson Mastered!`));
  };

  if (view.name === 'landing') {
    return (
      <ErrorBoundary>
        <LandingPage onLaunchApp={launchApp} isArabic={isArabic} />
      </ErrorBoundary>
    );
  }

  if (view.name === 'android') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<main className="android-landing min-h-screen" aria-busy="true">Loading Thinking Bridge…</main>}>
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
              className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0A0E13] via-[#101b24] to-[#0d302e] px-6 text-center text-[#EEF2F5]"
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
                  if (isLessonUnlocked(progression, lesson, targetLang)) setActiveLessonNode(lesson);
                }}
                onSelectUnitCheckpoint={() => {}}
                onOpenVoice={() => setView({ name: 'voice' })}
                onOpenFlashcards={(deckId) => setView({ name: 'flashcards', deckId })}
                isArabic={isArabic}
                progress={progress}
                flashcardDeckIds={stageFlashcardDecks}
              />
            </div>
          )}

          {activeTab === 'practice' && (
            <PracticeHubView
              state={progression}
              onOpenVoice={() => setView({ name: 'voice' })}
              onOpenFlashcards={() => setView({ name: 'flashcards' })}
              onOpenCorporate={() => setView({ name: 'corporate' })}
              onOpenMaintenance={() => setView({ name: 'maintenance' })}
              onOpenPronunciation={() => setView({ name: 'pronunciation' })}
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
                localStorage.clear();
                window.location.reload();
              }}
              onOpenPrivacyPolicy={() => setPrivacyOpen(true)}
              onToast={(msg) => showToast(T(msg, msg))}
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

      {view.name === 'admin' && (
        <AdminFeedbackView onBack={goHome} isArabic={isArabic} />
      )}

      {view.name === 'maintenance' && (
        <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] p-4" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="mb-4 px-4 py-2 bg-stone-800 rounded-xl text-sm font-bold">
            {isArabic ? '← العودة' : '← Back'}
          </button>
          <MaintenanceGuide />
        </div>
      )}

      {view.name === 'pronunciation' && (
        <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] p-4 flex flex-col items-center justify-center" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="mb-4 px-4 py-2 bg-stone-800 rounded-xl text-sm font-bold self-start">
            {isArabic ? '← العودة' : '← Back'}
          </button>
          <PronunciationRecorder />
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

      {/* Interactive Lesson Session Modal */}
      {activeLessonNode && (
        <LessonRunner
          lesson={activeLessonNode}
          onCompleteSession={handleLessonSessionComplete}
          onClose={() => setActiveLessonNode(null)}
          isArabic={isArabic}
        />
      )}

      {/* Game-Style Diagnostic Onboarding Modal */}
      {onboardingOpen && (
        <Onboarding
          initialProfile={profile}
          onComplete={(newProfile, extraData) => {
            saveProfile({
              ...profile,
              ...newProfile,
            });
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
            } catch (err) {
              console.warn('Unable to persist active profile config locally.', err);
            }
            setOnboardingOpen(false);
            const toastMsg = extraData?.diagnosticLevel === 'intermediate'
              ? T('🚀 تم تخصيص جسر التفكير — موقعك A2 (جسر B1)', "🚀 Mission initialized — you're at A2 (B1 Bridge)")
              : T('🚀 تم تخصيص جسر التفكير وانطلقت اللعبة!', 'Mission initialized! Game Started 🚀');
            showToast(toastMsg);
          }}
          onCancel={() => setOnboardingOpen(false)}
        />
      )}

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={langSelectorOpen}
        onClose={() => setLangSelectorOpen(false)}
        currentSource={sourceLang}
        currentTarget={targetLang}
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

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
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
      {showApkBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-surface border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom"
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
                localStorage.setItem('hide_download_banner', 'true');
              }}
              className="p-2 rounded-xl bg-surface-2 text-muted hover:text-text transition"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>
      )}
        </Suspense>
    </ErrorBoundary>
  );
}
