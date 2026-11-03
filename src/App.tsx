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
import { CorporateBridgeView } from './features/corporate/CorporateBridgeView';
import { PreferencesView } from './features/preferences/PreferencesView';

import { FeedbackModal } from './components/FeedbackModal';
import { LandingView } from './components/LandingView';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { UserProgress, LearningGoal } from './types';
import { AIHelper, AIHelperRequest } from './components/AIHelper';
import { useLanguagePair } from './hooks/useLanguagePair';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { LanguagePairBanner } from './components/LanguagePairBanner';

import { ProgressionState, LessonNode } from './progression/types';
import { migrateLegacyStorageToProgression } from './progression/migration';
import { updateStreakAndShields } from './progression/engine';

type View =
  | { name: 'shell' }
  | { name: 'landing' }
  | { name: 'voice' }
  | { name: 'flashcards' }
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
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);

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
  const [aiHelperRequest] = useState<AIHelperRequest | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3000);
  };

  // Status Bar & Capacitor Mobile Setup
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
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
    updateProgression((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      streak: prev.streak === 0 ? 1 : prev.streak,
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
    showToast(`🎉 +${earnedXp} XP! ${isArabic ? 'درس مكتمل بنجاح' : 'Lesson Mastered!'}`);
  };

  if (view.name === 'landing') {
    return <LandingView onStartWebApp={() => setView({ name: 'shell' })} isArabic={isArabic} />;
  }

  return (
    <>
      {/* 1. Primary App Shell (Home / Path / Practice / Quests / League / Profile) */}
      {view.name === 'shell' && (
        <AppShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={progression}
          targetLang={targetLang}
          isArabic={isArabic}
        >
          {activeTab === 'path' && (
            <div className="space-y-4">
              <LanguagePairBanner
                sourceLang={sourceLang}
                targetLang={targetLang}
                onOpenSelector={() => setLangSelectorOpen(true)}
                onToast={showToast}
              />
              <PathView
                state={progression}
                onSelectLesson={(lesson) => setActiveLessonNode(lesson)}
                onSelectUnitCheckpoint={() => {}}
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
                const data = JSON.stringify({ progression, profile, progress }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `thinking-bridge-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast(isArabic ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
              }}
              onDeleteData={() => {
                localStorage.clear();
                window.location.reload();
              }}
              onOpenPrivacyPolicy={() => setPrivacyOpen(true)}
              isArabic={isArabic}
            />
          )}
        </AppShell>
      )}

      {/* 2. Specialized Route Overlays */}
      {view.name === 'voice' && (
        <VoicePracticeView
          onBack={goHome}
          progress={progress}
          profile={profile}
          onToast={showToast}
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

      {/* Onboarding & Placement Modal */}
      <OnboardingPlacementModal
        isOpen={onboardingOpen}
        onComplete={(goal, dailyMin, stage, source, target) => {
          setPair(source, target);
          saveProfile({
            language: profile?.language || 'arabic',
            dialect: profile?.dialect || 'egyptian',
            level: profile?.level || 'beginner',
            ...profile,
            goal: (['academic', 'travel', 'business', 'work', 'general', 'daily'].includes(goal) ? goal : 'general') as LearningGoal,
            sourceLanguage: source,
            targetLanguage: target,
          });
          updateProgression((p) => ({
            ...p,
            dailyDailyTargetMin: dailyMin,
            currentStage: stage,
          }));
          setOnboardingOpen(false);
          const goalLabel =
            goal === 'work'
              ? 'الشغل والشركات 💼'
              : goal === 'travel'
              ? 'السفر والتواصل ✈️'
              : goal === 'study'
              ? 'الدراسة والأبحاث 🎓'
              : 'الطلاقة التلقائية 🚀';
          showToast(`🚀 تم تخصيص المسار والمحتوى خصيصاً لهدفك: ${goalLabel}`);
        }}
        isArabic={isArabic}
        initialSource={sourceLang}
        initialTarget={targetLang}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={langSelectorOpen}
        onClose={() => setLangSelectorOpen(false)}
        currentSource={sourceLang}
        currentTarget={targetLang}
        onSelectPair={setPair}
        onToast={showToast}
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
        onToast={showToast}
        profile={profile}
      />

      {/* Floating AI Helper */}
      {!onboardingOpen && !activeLessonNode && (
        <AIHelper profile={profile} request={aiHelperRequest} />
      )}

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

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </>
  );
}
