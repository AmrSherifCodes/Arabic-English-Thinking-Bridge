// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import type { UserProfile, UserProgress, TargetLanguage } from '../types';
import type { CefrLevelId, LessonNode, PhaseId, ProgressionState } from '../progression/types';
import type { GuideMode } from '../utils/guideMode';
import type { AppView } from './useAppNavigation';

// Aggressive code splitting for secondary routes, heavy modals, and V10.2/V10.3 datasets
const LessonRunner = lazy(() => import('../components/progression/LessonRunner').then((m) => ({ default: m.LessonRunner })));
const LightningBlitzModal = lazy(() => import('../features/gamification/LightningBlitzModal').then((m) => ({ default: m.LightningBlitzModal })));
const PlacementTestModal = lazy(() => import('../components/progression/PlacementTestModal').then((m) => ({ default: m.PlacementTestModal })));
const PrivacyPolicyModal = lazy(() => import('../components/progression/PrivacyPolicyModal').then((m) => ({ default: m.PrivacyPolicyModal })));
const VoicePracticeView = lazy(() => import('../features/voice/VoicePracticeView').then((m) => ({ default: m.VoicePracticeView })));
const FlashcardsView = lazy(() => import('../features/flashcards/FlashcardsView').then((m) => ({ default: m.FlashcardsView })));
const CorporateBridgeView = lazy(() => import('../features/corporate/CorporateBridgeView').then((m) => ({ default: m.CorporateBridgeView })));
const PreferencesView = lazy(() => import('../features/preferences/PreferencesView').then((m) => ({ default: m.PreferencesView })));
const FeedbackModal = lazy(() => import('../components/FeedbackModal').then((m) => ({ default: m.FeedbackModal })));
const LanguageSelectorModal = lazy(() => import('../components/LanguageSelectorModal').then((m) => ({ default: m.LanguageSelectorModal })));
const AdminFeedbackView = lazy(() => import('../components/AdminFeedbackView').then((m) => ({ default: m.AdminFeedbackView })));
const MaintenanceGuide = lazy(() => import('../features/maintenance/MaintenanceGuide').then((m) => ({ default: m.MaintenanceGuide })));
const PronunciationRecorder = lazy(() => import('../features/voice/PronunciationRecorder').then((m) => ({ default: m.PronunciationRecorder })));
const StudioDashboard = lazy(() => import('../features/studio/StudioDashboard').then((m) => ({ default: m.StudioDashboard })));
const ClarifyingCoachView = lazy(() => import('../features/clarifying/ClarifyingCoachView').then((m) => ({ default: m.ClarifyingCoachView })));
const LanguageGame = lazy(() => import('../pages/LanguageGame').then((m) => ({ default: m.LanguageGame })));
const HackerTerminal = lazy(() => import('../components/story/HackerTerminal').then((m) => ({ default: m.HackerTerminal })));
const StoryEngineLoader = lazy(() => import('../components/story/StoryEngineLoader').then((m) => ({ default: m.StoryEngineLoader })));
const TeacherView = lazy(() => import('../pages/TeacherView').then((m) => ({ default: m.TeacherView })));
const ExamPage = lazy(() => import('../features/exam/ExamPage').then((m) => ({ default: m.ExamPage })));
const DictionaryView = lazy(() => import('./DictionaryView').then((m) => ({ default: m.DictionaryView })));
const LiveTranslatorModal = lazy(() => import('../components/LiveTranslatorModal').then((m) => ({ default: m.LiveTranslatorModal })));
const TravelScenariosModal = lazy(() => import('../components/TravelScenariosModal').then((m) => ({ default: m.TravelScenariosModal })));
const TravelSprintModal = lazy(() => import('../components/TravelSprintModal').then((m) => ({ default: m.TravelSprintModal })));
const WordBankModal = lazy(() => import('../components/WordBankModal').then((m) => ({ default: m.WordBankModal })));
const QuranSanctuaryView = lazy(() => import('../features/quran/QuranSanctuaryView').then((m) => ({ default: m.QuranSanctuaryView })));

/** Lightweight Midnight Navy inline skeleton — never a full-screen dark splash blocker */
export function InlineFallback() {
  return (
    <div className="w-full p-4 flex items-center justify-center">
      <div className="w-full max-w-md h-32 rounded-3xl bg-[#131C31] animate-pulse border border-slate-400/15" />
    </div>
  );
}

export interface LazyRouteOverlaysProps {
  view: AppView;
  setView: (v: AppView) => void;
  goHome: () => void;
  openLanding: () => void;
  isArabic: boolean;
  sourceLang: string;
  targetLang: TargetLanguage;
  guideMode: GuideMode;
  setGuideMode: (m: GuideMode) => void;
  setPair: (source: any, target: any) => void;
  profile: UserProfile | null;
  saveProfile: (p: UserProfile) => void;
  progress: UserProgress;
  updateAndSaveProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  progression: ProgressionState;
  updateProgression: (updater: (prev: ProgressionState) => ProgressionState) => void;
  activeLessonNode: LessonNode | null;
  setActiveLessonNode: (n: LessonNode | null) => void;
  onCompleteLessonSession: (earnedXp: number, accuracyPercent: number) => Promise<void>;
  onCompletePlacement: (
    levelId: CefrLevelId,
    phaseId: PhaseId,
    score: number,
    meta?: {
      theta: number;
      band: string;
      masteredCount: number;
      startingNodeIndex: number;
      masteredViaPlacementIds: string[];
      activeNodeId: string | null;
    }
  ) => Promise<void>;
  onBlitzXpEarned: (earned: number) => void;
  onScenarioXpEarned: (earned: number) => void;
  onToast: (ar: string, en: string) => void;
  onRawToast: (msg: string) => void;
  modals: {
    lightningBlitzOpen: boolean;
    setLightningBlitzOpen: (v: boolean) => void;
    langSelectorOpen: boolean;
    setLangSelectorOpen: (v: boolean) => void;
    placementModalOpen: boolean;
    setPlacementModalOpen: (v: boolean) => void;
    privacyOpen: boolean;
    setPrivacyOpen: (v: boolean) => void;
    feedbackOpen: boolean;
    setFeedbackOpen: (v: boolean) => void;
    travelSprintOpen: boolean;
    setTravelSprintOpen: (v: boolean) => void;
    liveTranslatorOpen: boolean;
    setLiveTranslatorOpen: (v: boolean) => void;
    travelScenariosOpen: boolean;
    setTravelScenariosOpen: (v: boolean) => void;
    wordBankOpen: boolean;
    setWordBankOpen: (v: boolean) => void;
    setLaunchGateOpen: (v: boolean) => void;
  };
}

export function LazyRouteOverlays({
  view,
  setView,
  goHome,
  openLanding,
  isArabic,
  sourceLang,
  targetLang,
  guideMode,
  setGuideMode,
  setPair,
  profile,
  saveProfile,
  progress,
  updateAndSaveProgress,
  progression,
  updateProgression,
  activeLessonNode,
  setActiveLessonNode,
  onCompleteLessonSession,
  onCompletePlacement,
  onBlitzXpEarned,
  onScenarioXpEarned,
  onToast,
  onRawToast,
  modals,
}: LazyRouteOverlaysProps) {
  return (
    <Suspense fallback={<InlineFallback />}>
      {view.name === 'voice' && (
        <VoicePracticeView
          onBack={goHome}
          onOpenPreferences={() => setView({ name: 'preferences' })}
          progress={progress}
          profile={profile}
          updateAndSaveProgress={updateAndSaveProgress}
          onToast={onRawToast}
          sourceLang={sourceLang as any}
          targetLang={targetLang}
        />
      )}

      {view.name === 'flashcards' && (
        <FlashcardsView
          profile={profile}
          progress={progress}
          updateAndSaveProgress={updateAndSaveProgress}
          onBack={goHome}
          onToast={onRawToast}
          sourceLang={sourceLang as any}
          targetLang={targetLang}
          initialDeckId={view.deckId}
        />
      )}

      {view.name === 'corporate' && (
        <CorporateBridgeView
          onBack={goHome}
          onToast={onRawToast}
          preferredVoice={progress.preferredVoice}
          targetLang={targetLang}
          isArabic={isArabic}
        />
      )}

      {view.name === 'clarifying' && (
        <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0B1120] text-[#F8FAFC] px-4 pt-safe pb-safe flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="mb-4 px-4 py-2 min-h-[48px] bg-[#1B2742] rounded-xl text-sm font-bold self-start cursor-pointer">
            {isArabic ? '→ العودة' : '← Back'}
          </button>
          <ClarifyingCoachView onClose={goHome} />
        </div>
      )}

      {view.name === 'admin' && <AdminFeedbackView onBack={goHome} isArabic={isArabic} />}

      {view.name === 'maintenance' && (
        <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0B1120] text-[#F8FAFC] px-4 pt-safe pb-safe" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="mb-4 px-4 py-2 min-h-[48px] bg-[#1B2742] rounded-xl text-sm font-bold cursor-pointer">
            {isArabic ? '→ العودة' : '← Back'}
          </button>
          <MaintenanceGuide />
        </div>
      )}

      {view.name === 'pronunciation' && (
        <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0B1120] text-[#F8FAFC] px-4 pt-safe pb-safe flex flex-col items-center justify-start gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
          <button onClick={goHome} className="px-4 py-2 min-h-[48px] bg-[#1B2742] rounded-xl text-sm font-bold self-start cursor-pointer">
            {isArabic ? '→ العودة' : '← Back'}
          </button>
          <PronunciationRecorder
            targetLang={targetLang}
            isArabic={isArabic}
            onBackToLessons={goHome}
            onToast={onRawToast}
          />
        </div>
      )}

      {view.name === 'preferences' && (
        <PreferencesView
          onBack={goHome}
          profile={profile}
          onSaveProfile={saveProfile}
          progress={progress}
          onToast={onRawToast}
          sourceLang={sourceLang as any}
          targetLang={targetLang}
          isArabic={isArabic}
          onOpenLanguageSelector={() => modals.setLangSelectorOpen(true)}
          onOpenLaunchGate={() => {
            setView({ name: 'shell' });
            modals.setLaunchGateOpen(true);
          }}
          onOpenHome={!Capacitor.isNativePlatform() ? openLanding : undefined}
        />
      )}

      {view.name === 'studio' && <StudioDashboard onBack={goHome} isArabic={isArabic} />}

      {view.name === 'language-game' && (
        <LanguageGame targetLang={targetLang} sourceLang={sourceLang as any} onBack={goHome} />
      )}

      {view.name === 'story' && (
        <StoryEngineLoader
          sourceLang={sourceLang as import('../types/story').LanguageCode}
          targetLang={targetLang as import('../types/story').LanguageCode}
          onComplete={() => {
            onToast('🎉 أكملت الفصل الأول!', '🎉 Chapter 1 completed!');
            setView({ name: 'shell' });
          }}
          onBack={goHome}
        />
      )}

      {view.name === 'hacker-terminal' && <HackerTerminal onComplete={goHome} />}
      {view.name === 'teacher' && <TeacherView onBack={goHome} />}
      {view.name === 'exam' && <ExamPage onBack={goHome} />}
      {view.name === 'dictionary' && <DictionaryView onBack={goHome} isArabic={isArabic} targetLang={targetLang} />}
      {view.name === 'quran' && (
        <QuranSanctuaryView
          isArabic={isArabic}
          onBack={() => {
            try {
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState({}, '', '/app');
              }
            } catch {}
            setView({ name: 'shell' });
            modals.setLaunchGateOpen(true);
          }}
          onSwitchToLanguages={() => {
            try {
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState({}, '', '/app');
              }
            } catch {}
            modals.setLaunchGateOpen(false);
            setView({ name: 'shell' });
          }}
        />
      )}

      {activeLessonNode && (
        <LessonRunner
          lesson={activeLessonNode}
          onCompleteSession={onCompleteLessonSession}
          onClose={() => setActiveLessonNode(null)}
          isArabic={isArabic}
          targetLang={targetLang}
          sourceLang={sourceLang as any}
        />
      )}

      {modals.lightningBlitzOpen && (
        <LightningBlitzModal
          isArabic={isArabic}
          userAlias={progression.anonymousAlias || profile?.name || (isArabic ? 'بطل الجسر' : 'Bridge Hero')}
          streak={progression.streak || 0}
          leagueOptOut={progression.leagueOptOut || progression.isUnder13}
          onClose={() => modals.setLightningBlitzOpen(false)}
          onXpEarned={onBlitzXpEarned}
        />
      )}

      {modals.langSelectorOpen && (
        <LanguageSelectorModal
          isOpen={modals.langSelectorOpen}
          onClose={() => modals.setLangSelectorOpen(false)}
          currentSource={sourceLang as any}
          currentTarget={targetLang}
          isArabic={isArabic}
          onSelectPair={(source, target) => {
            const targetChanged = target !== targetLang;
            setPair(source, target);
            if (source.startsWith('ar')) {
              setGuideMode(guideMode === 'standard_ar' ? 'standard_ar' : 'egyptian_ar');
            } else {
              setGuideMode('english_guided');
            }
            if (targetChanged) {
              updateProgression((prev) => ({ ...prev, currentStage: 'A0', currentUnitId: 'a0-unit-1' }));
            }
          }}
          onToast={onRawToast}
        />
      )}

      {modals.placementModalOpen && (
        <PlacementTestModal
          isOpen={modals.placementModalOpen}
          onClose={() => {
            modals.setPlacementModalOpen(false);
            try {
              localStorage.setItem('tb.placementDone', 'true');
            } catch {}
          }}
          state={progression}
          onCompletePlacement={onCompletePlacement}
          isArabic={isArabic}
        />
      )}

      {modals.travelSprintOpen && (
        <TravelSprintModal
          isOpen={modals.travelSprintOpen}
          onClose={() => modals.setTravelSprintOpen(false)}
          targetLang={targetLang}
          isArabic={isArabic}
          onStartDayLesson={(lesson) => setActiveLessonNode(lesson)}
        />
      )}

      {modals.liveTranslatorOpen && (
        <LiveTranslatorModal
          isOpen={modals.liveTranslatorOpen}
          onClose={() => modals.setLiveTranslatorOpen(false)}
          targetLang={targetLang}
          isArabic={isArabic}
          onToast={onRawToast}
        />
      )}

      {modals.travelScenariosOpen && (
        <TravelScenariosModal
          isOpen={modals.travelScenariosOpen}
          onClose={() => modals.setTravelScenariosOpen(false)}
          targetLang={targetLang}
          isArabic={isArabic}
          onXpEarned={onScenarioXpEarned}
          onToast={onRawToast}
        />
      )}

      {modals.wordBankOpen && (
        <WordBankModal
          isOpen={modals.wordBankOpen}
          onClose={() => modals.setWordBankOpen(false)}
          isArabic={isArabic}
        />
      )}

      {modals.privacyOpen && (
        <PrivacyPolicyModal isOpen={modals.privacyOpen} onClose={() => modals.setPrivacyOpen(false)} isArabic={isArabic} />
      )}

      {modals.feedbackOpen && (
        <FeedbackModal
          isOpen={modals.feedbackOpen}
          onClose={() => modals.setFeedbackOpen(false)}
          onSubmit={() => {}}
          onToast={onRawToast}
          profile={profile}
        />
      )}
    </Suspense>
  );
}
