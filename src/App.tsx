import { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

import { AppShell, AppTab } from './components/navigation/AppShell';
import { PathView } from './components/progression/PathView';
import { PracticeHubView } from './components/progression/PracticeHubView';
import { QuestsView } from './components/progression/QuestsView';
import { LeagueView } from './components/progression/LeagueView';
import { ProfileView } from './components/progression/ProfileView';
import { LessonRunner } from './components/progression/LessonRunner';
import { OnboardingPlacementModal } from './components/progression/OnboardingPlacementModal';
import { PrivacyPolicyModal } from './components/progression/PrivacyPolicyModal';

import { VoicePracticeView } from './features/voice/VoicePracticeView';
import { FlashcardsView } from './features/flashcards/FlashcardsView';
import { LessonView } from './features/lesson/LessonView';
import { CorporateBridgeView } from './features/corporate/CorporateBridgeView';
import { PreferencesView } from './features/preferences/PreferencesView';

import { FeedbackModal, UserFeedbackData } from './components/FeedbackModal';
import { LandingView } from './components/LandingView';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { UserProfile, UserProgress } from './types';
import { AIHelper, AIHelperRequest } from './components/AIHelper';
import { LexiconEntry } from './services/geminiLexicon';
import { FlashcardItemData } from './components/uiConstants';
import { useLanguagePair } from './hooks/useLanguagePair';
import i18n from './i18n';

import { ProgressionState, LessonNode, CefrStage } from './progression/types';
import { migrateLegacyStorageToProgression } from './progression/migration';
import { updateStreakAndShields } from './progression/engine';

type View =
  | { name: 'shell' }
  | { name: 'landing' }
  | { name: 'voice' }
  | { name: 'flashcards' }
  | { name: 'lesson' }
  | { name: 'corporate' }
  | { name: 'preferences' };

export default function App() {
  const [view, setView] = useState<View>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('landing') === 'true') return { name: 'landing' };
      }
    } catch {}
    return { name: 'shell' };
  });

  const [activeTab, setActiveTab] = useState<AppTab>('path');
  const [progression, setProgression] = useState<ProgressionState>(() => {
    const migrated = migrateLegacyStorageToProgression();
    return updateStreakAndShields(migrated);
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
  const { profile, saveProfile } = useUserProfile();
  const { sourceLang, targetLang, setPair } = useLanguagePair();
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());

  const isArabic = (profile?.language || 'arabic') === 'arabic';

  // Save progression state updates
  const updateProgression = (updater: (prev: ProgressionState) => ProgressionState) => {
    setProgression((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('tb.progressionState', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [aiHelperRequest, setAiHelperRequest] = useState<AIHelperRequest | null>(null);
  const aiRequestIdRef = useRef(0);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2600);
  };

  const goHome = () => setView({ name: 'shell' });

  // Native Android Shell Configuration
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0c0a09' }).catch(() => {});
      Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
    }
  }, []);

  // Hardware Back Button
  useEffect(() => {
    let sub: Promise<any> | null = null;
    try {
      sub = CapApp.addListener('backButton', () => {
        setView((curr) => {
          if (curr.name !== 'shell') {
            return { name: 'shell' };
          }
          CapApp.exitApp();
          return curr;
        });
      });
    } catch {}
    return () => {
      sub?.then((h) => h.remove?.()).catch(() => {});
    };
  }, []);

  const handleLessonSessionComplete = (earnedXp: number) => {
    updateProgression((prev) => {
      const newXp = prev.xp + earnedXp;
      const lessonId = activeLessonNode?.id;
      const crowns = lessonId ? (prev.lessonCrowns[lessonId] || 0) + 1 : 1;
      const completed = lessonId && !prev.completedLessonIds.includes(lessonId)
        ? [...prev.completedLessonIds, lessonId]
        : prev.completedLessonIds;

      return {
        ...prev,
        xp: newXp,
        weeklyXp: prev.weeklyXp + earnedXp,
        lessonCrowns: lessonId ? { ...prev.lessonCrowns, [lessonId]: crowns } : prev.lessonCrowns,
        completedLessonIds: completed,
      };
    });
    showToast(isArabic ? `🎉 +${earnedXp} XP مكتسبة!` : `🎉 +${earnedXp} XP Earned!`);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progression, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Thinking_Bridge_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(isArabic ? '📥 تم تصوير النسخة الاحتياطية!' : '📥 Backup JSON downloaded!');
  };

  const handleDeleteData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {}
  };

  return (
    <>
      {/* 1. Landing View Mode */}
      {view.name === 'landing' && (
        <LandingView onStartWebApp={() => setView({ name: 'shell' })} />
      )}

      {/* 2. Primary App Shell (Path, Practice, Quests, League, Profile) */}
      {view.name === 'shell' && (
        <AppShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={progression}
          targetLang={targetLang}
          isArabic={isArabic}
        >
          {activeTab === 'path' && (
            <PathView
              state={progression}
              onSelectLesson={(lesson) => setActiveLessonNode(lesson)}
              onSelectUnitCheckpoint={() => showToast(isArabic ? 'اختبار اجتياز الوحدة جاهز!' : 'Unit Checkpoint ready!')}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeHubView
              state={progression}
              onOpenVoice={() => setView({ name: 'voice' })}
              onOpenFlashcards={() => setView({ name: 'flashcards' })}
              onOpenCorporate={() => setView({ name: 'corporate' })}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsView state={progression} isArabic={isArabic} />
          )}

          {activeTab === 'league' && (
            <LeagueView
              state={progression}
              onToggleOptOut={() => updateProgression((p) => ({ ...p, leagueOptOut: !p.leagueOptOut }))}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              state={progression}
              profile={profile}
              onUpdateState={updateProgression}
              onExportData={handleExportData}
              onDeleteData={handleDeleteData}
              onOpenPrivacyPolicy={() => setPrivacyOpen(true)}
              isArabic={isArabic}
            />
          )}
        </AppShell>
      )}

      {/* 3. Specialized Route Overlays */}
      {view.name === 'voice' && (
        <VoicePracticeView
          onBack={goHome}
          progress={progress}
          profile={profile}
          onToast={showToast}
        />
      )}

      {view.name === 'flashcards' && (
        <FlashcardsView
          profile={profile}
          progress={progress}
          onBack={goHome}
          onToast={showToast}
        />
      )}

      {view.name === 'corporate' && (
        <CorporateBridgeView
          onBack={goHome}
          onToast={showToast}
          preferredVoice={progress.preferredVoice}
        />
      )}

      {view.name === 'preferences' && (
        <PreferencesView
          onBack={goHome}
          profile={profile}
          onSaveProfile={saveProfile}
          progress={progress}
          onToast={showToast}
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

      {/* Onboarding & Placement Modal */}
      <OnboardingPlacementModal
        isOpen={onboardingOpen}
        onComplete={(goal, dailyMin, stage) => {
          updateProgression((p) => ({
            ...p,
            dailyDailyTargetMin: dailyMin,
            currentStage: stage,
          }));
          setOnboardingOpen(false);
        }}
        isArabic={isArabic}
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
        onToast={showToast}
        profile={profile}
      />

      {/* Floating AI Helper */}
      <AIHelper profile={profile} request={aiHelperRequest} />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-stone-900 border border-teal-500/40 text-stone-100 text-xs font-bold rounded-xl shadow-xl backdrop-blur-md"
        >
          {toastMsg}
        </div>
      )}

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </>
  );
}
