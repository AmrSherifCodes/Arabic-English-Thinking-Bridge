import React, { useEffect, useMemo, useState } from 'react';
import {
  ProgressionState,
  StageNode,
  LessonNode,
  CefrLevelId,
  PhaseId,
  ModuleId,
} from '../../progression/types';
import {
  buildCourseStructure,
  getCefrLevelHierarchy,
  isHierarchicalLessonUnlocked,
  isHierarchicalUnitUnlocked,
  isHierarchicalModuleUnlocked,
  isHierarchicalPhaseUnlocked,
  isHierarchicalLevelUnlocked,
  calculateLevelSkillNodes,
} from '../../progression/courseData';
import { getTargetDictionary, getTargetDictionaryAsync } from '../../data/dictionaries';
import { Play, Crown, LockKeyhole, Star, Mic, Layers, Sparkles, Compass, Award, Map, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { TargetLanguage, UserProgress } from '../../types';
import { TARGET_LANGUAGE_META } from '../../data/languages';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  FEATURE_UNLOCKS,
  FeatureUnlockDefinition,
  getUnlocksForStage,
  isFeatureUnlocked,
} from '../../progression/featureUnlocks';
import { FeatureUnlockModal } from './FeatureUnlockModal';
import { SkillRadar } from './SkillRadar';
import { CanDoPanelModal } from './CanDoPanelModal';
import { LevelMapViewModal } from './LevelMapViewModal';
import { PlacementTestModal } from './PlacementTestModal';
import { CapstoneRunnerModal } from './CapstoneRunnerModal';
import { NameForge } from '../NameForge';
import { useUiMode } from '../../utils/uiMode';

const langNamesAr: Record<string, string> = {
  en: 'الإنجليزية',
  de: 'الألمانية',
  es: 'الإسبانية',
  fr: 'الفرنسية',
  ja: 'اليابانية',
  it: 'الإيطالية',
  tr: 'التركية',
  ru: 'الروسية',
  zh: 'الصينية',
};

interface PathViewProps {
  state: ProgressionState;
  targetLang: TargetLanguage;
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectUnitCheckpoint: (unitId: string) => void;
  onUpdateState?: (updater: (prev: ProgressionState) => ProgressionState) => void;
  onOpenVoice?: () => void;
  onOpenFlashcards?: (deckId?: string) => void;
  onOpenCorporate?: () => void;
  onOpenClarifying?: () => void;
  onOpenMaintenance?: () => void;
  onOpenPronunciation?: () => void;
  onOpenStory?: () => void;
  onOpenHackerTerminal?: () => void;
  onOpenTeacherMode?: () => void;
  onOpenExam?: () => void;
  isArabic?: boolean;
  progress?: UserProgress;
  flashcardDeckIds?: string[];
  onOpenLanguageSelector?: () => void;
}

export function PathView({
  state,
  targetLang,
  onSelectLesson,
  onSelectUnitCheckpoint,
  onUpdateState,
  onOpenVoice,
  onOpenFlashcards,
  onOpenCorporate,
  onOpenClarifying,
  onOpenMaintenance,
  onOpenPronunciation,
  onOpenStory,
  onOpenHackerTerminal,
  onOpenTeacherMode,
  isArabic = true,
  progress,
  flashcardDeckIds,
  onOpenLanguageSelector,
}: PathViewProps) {
  const [uiMode, setUiMode] = useUiMode();
  const [dictionaryVersion, setDictionaryVersion] = useState(0);
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<FeatureUnlockDefinition | null>(null);

  // Modal Visibility States
  const [canDoOpen, setCanDoOpen] = useState(false);
  const [levelMapOpen, setLevelMapOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
  const [nameForgeOpen, setNameForgeOpen] = useState(false);
  const [capstoneModalTarget, setCapstoneModalTarget] = useState<{ levelId?: CefrLevelId; phaseId?: PhaseId } | null>(null);

  // Active CEFR Level and Phase selection state
  const activeLevelId: CefrLevelId = state.currentLevelId || 'A1';
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>(state.currentPhaseId || 'A1.1');

  useEffect(() => {
    let cancelled = false;
    if (getTargetDictionary(targetLang).length > 0) return;
    void getTargetDictionaryAsync(targetLang).then(() => {
      if (!cancelled) setDictionaryVersion((version) => version + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [targetLang]);

  const hierarchy = useMemo(() => getCefrLevelHierarchy(targetLang), [targetLang, dictionaryVersion]);

  const currentLevelNode = useMemo(
    () => hierarchy?.find((l) => l.level === activeLevelId) || hierarchy?.[0] || getCefrLevelHierarchy('en')[0],
    [hierarchy, activeLevelId]
  );

  // Synchronize active phase if level changes
  useEffect(() => {
    if (currentLevelNode?.phases && !currentLevelNode.phases.some((p) => p.id === selectedPhaseId)) {
      setSelectedPhaseId(currentLevelNode.phases[0]?.id || 'A1.1');
    }
  }, [currentLevelNode, selectedPhaseId]);

  const activePhaseNode = useMemo(
    () => currentLevelNode?.phases?.find((p) => p.id === selectedPhaseId) || currentLevelNode?.phases?.[0] || getCefrLevelHierarchy('en')[0].phases[0],
    [currentLevelNode, selectedPhaseId]
  );

  // Calculate Level Skills
  const levelSkillNodes = useMemo(
    () => calculateLevelSkillNodes(state, activeLevelId),
    [state, activeLevelId]
  );

  // Calculate Overall Level Completion Ratio
  const allLevelLessons = useMemo(
    () => (currentLevelNode?.phases || []).flatMap((p) => (p.modules || []).flatMap((m) => (m.units || []).flatMap((u) => u.lessons || []))),
    [currentLevelNode]
  );
  const completedLevelCount = useMemo(
    () => allLevelLessons.filter((l) => state.completedLessonIds?.includes(l.id)).length,
    [allLevelLessons, state.completedLessonIds]
  );
  const levelProgressPct = allLevelLessons.length > 0 ? Math.round((completedLevelCount / allLevelLessons.length) * 100) : 0;

  // Find Next Unfinished Lesson in Current Level
  const nextLessonToPlay = useMemo(
    () => allLevelLessons.find((l) => !state.completedLessonIds?.includes(l.id)) || allLevelLessons[0],
    [allLevelLessons, state.completedLessonIds]
  );

  const handleToggleCanDo = (canDoId: string) => {
    if (onUpdateState) {
      onUpdateState((prev) => ({
        ...prev,
        canDoProgress: {
          ...prev.canDoProgress,
          [canDoId]: !prev.canDoProgress?.[canDoId],
        },
      }));
    }
  };

  const handleCompletePlacement = (levelId: CefrLevelId, phaseId: PhaseId, score: number) => {
    if (onUpdateState) {
      // Find all lessons up to this phase and auto-complete them
      const allLessons = hierarchy.flatMap((l) => l.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons))));
      const levelsOrder: CefrLevelId[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
      const targetLevelIndex = levelsOrder.indexOf(levelId);

      const autoCompletedIds = allLessons
        .filter((l) => {
          const lLevelIndex = levelsOrder.indexOf((l.levelId || 'A1') as CefrLevelId);
          return lLevelIndex < targetLevelIndex;
        })
        .map((l) => l.id);

      onUpdateState((prev) => ({
        ...prev,
        currentLevelId: levelId,
        currentPhaseId: phaseId,
        placementResult: { levelId, phaseId, score, dateISO: new Date().toISOString() },
        completedLessonIds: Array.from(new Set([...prev.completedLessonIds, ...autoCompletedIds])),
      }));
    }
  };

  const handleCompleteCapstone = (targetId: string, passed: boolean, score: number) => {
    if (onUpdateState) {
      onUpdateState((prev) => ({
        ...prev,
        capstoneResults: {
          ...prev.capstoneResults,
          [targetId]: { passed, score, dateISO: new Date().toISOString() },
        },
      }));
    }
  };

  const [statsExpanded, setStatsExpanded] = useState(false);
  const hasCompletedAny = (state.completedLessonIds?.length || 0) > 0;

  const targetNameAr = langNamesAr[targetLang] || TARGET_LANGUAGE_META[targetLang]?.nameAr || targetLang;
  const targetNameEn = TARGET_LANGUAGE_META[targetLang]?.nameEn || targetLang;
  const nameForgeBtnLabel = targetLang === 'en'
    ? (isArabic ? 'اكتب اسمك بالإنجليزي (30 ثانية)' : 'Name Forge (30s)')
    : (isArabic ? `اكتب اسمك بـ${targetNameAr} (30 ثانية)` : `${targetNameEn} Name Forge (30s)`);

  if (uiMode === 'simple') {
    return (
      <div className="relative space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* 1 Giant Friendly Hero Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-[#0B1C33] to-[#0E2746] border-2 border-emerald-500/50 shadow-2xl text-start space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Obvious 1-Tap Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#061224] border border-emerald-500/40 shadow-inner">
              <button
                type="button"
                onClick={() => setUiMode('simple')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  uiMode === 'simple'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🟢</span>
                <span>{isArabic ? 'البسيط' : 'Simple'}</span>
              </button>
              <button
                type="button"
                onClick={() => setUiMode('pro')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  (uiMode as string) === 'pro'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡</span>
                <span>{isArabic ? 'المتقدم' : 'Pro'}</span>
              </button>
            </div>
            <span className="text-xs font-bold text-slate-300">
              {completedLevelCount} من {allLevelLessons.length} دروس
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            {hasCompletedAny ? (isArabic ? 'عاش يا بطل! كمّل درسك الجاي 🚀' : 'Keep it up! Continue next lesson 🚀') : (isArabic ? 'أهلاً بيك! جاهز تتعلم أول جملة؟ 🎯' : 'Welcome! Ready for your first sentence? 🎯')}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isArabic ? 'اضغط الزر الأخضر وهنبدأ سوا خطوة بخطوة — مفيش أي قواعد معقدة أو توتر.' : 'Tap the green button to start step-by-step with zero stress.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                if (nextLessonToPlay) onSelectLesson(nextLessonToPlay);
              }}
              className="w-full min-h-[60px] px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>▶ {isArabic ? 'ابدأ الدرس التالي دلوقتي' : 'Start Next Lesson Now'}</span>
            </button>
            <button
              onClick={() => setNameForgeOpen(true)}
              className="px-4 py-3 rounded-2xl bg-[#0B1C33] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 font-bold text-xs transition cursor-pointer text-center"
            >
              ✨ {nameForgeBtnLabel}
            </button>
          </div>
        </div>

        {nameForgeOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
            <div className="relative w-full max-w-lg">
              <button
                onClick={() => setNameForgeOpen(false)}
                className="absolute top-3 end-3 p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white z-10 cursor-pointer"
              >
                ✕
              </button>
              <NameForge onComplete={() => {
                setNameForgeOpen(false);
                if (onUpdateState) {
                  onUpdateState(prev => ({ ...prev, xp: prev.xp + 50 }));
                }
              }} />
            </div>
          </div>
        )}

        {/* Simple Flat Lesson Path */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-cyan-300 px-1">{isArabic ? 'قائمة الدروس:' : 'Lesson List:'}</h3>
          <div className="grid grid-cols-1 gap-3">
            {allLevelLessons.map((lesson, idx) => {
              const isCompleted = state.completedLessonIds.includes(lesson.id);
              const isNext = nextLessonToPlay?.id === lesson.id;

              return (
                <div
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    isNext
                      ? 'bg-gradient-to-r from-emerald-500/20 to-[#0B1C33] border-emerald-400 shadow-lg ring-1 ring-emerald-400/50'
                      : isCompleted
                      ? 'bg-[#0B1C33]/90 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#0B1C33]/70 border-[#1E3A5F] hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : isNext ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">{isArabic ? lesson.titleAr : lesson.titleEn}</h4>
                      <span className="text-[11px] text-slate-400">~{lesson.estimatedMinutes || 5} {isArabic ? 'دقائق' : 'mins'}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-black border border-emerald-500/40 transition">
                    {isCompleted ? (isArabic ? 'راجع' : 'Review') : (isArabic ? 'ابدأ' : 'Start')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Hero Action Card (Above the Fold) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/90 via-[#0B1C33] to-[#0E2746] border-2 border-amber-400/60 shadow-2xl text-start space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {isArabic ? '🚀 الخطوة الأولى' : '🚀 First Step'}
          </span>
          <button
            onClick={() => setLevelMapOpen(true)}
            className="text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Map size={14} />
            <span>{isArabic ? 'خريطة المستويات' : 'Level Map'}</span>
          </button>
        </div>
        <h2 className="text-xl font-black text-white">
          {hasCompletedAny
            ? (isArabic ? 'كمّل من مكان ما وقفت 🚀' : 'Continue Where You Left Off 🚀')
            : (isArabic ? `جاهز لأول جملة ${targetNameAr}؟ 🎯` : `Ready for Your First ${targetNameEn} Sentence? 🎯`)}
        </h2>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => {
              if (nextLessonToPlay) onSelectLesson(nextLessonToPlay);
            }}
            className="flex-1 min-h-[52px] px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{hasCompletedAny ? (isArabic ? 'كمّل الدرس التالي ←' : 'Continue Next Lesson ←') : (isArabic ? 'ابدأ الدرس الأول الآن ←' : 'Start First Lesson Now ←')}</span>
          </button>
          <button
            onClick={() => setNameForgeOpen(true)}
            className="px-4 py-3 rounded-2xl bg-[#0B1C33] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 font-bold text-xs transition cursor-pointer"
          >
            ✨ {nameForgeBtnLabel}
          </button>
        </div>
      </div>

      {nameForgeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setNameForgeOpen(false)}
              className="absolute top-3 end-3 p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white z-10 cursor-pointer"
            >
              ✕
            </button>
            <NameForge onComplete={() => {
              setNameForgeOpen(false);
              if (onUpdateState) {
                onUpdateState(prev => ({ ...prev, xp: prev.xp + 50 }));
              }
            }} />
          </div>
        </div>
      )}

      {/* Level Header Card - Alexandrian Deep Sea Glass */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0B1C33]/95 via-[#0E2746]/90 to-[#071325]/95 border border-cyan-500/30 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xl shadow-lg shadow-amber-500/30 border border-amber-300 overflow-visible">
              {currentLevelNode.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {isArabic ? currentLevelNode.titleAr : currentLevelNode.titleEn}
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full">
                  {levelProgressPct}% {isArabic ? 'مكتمل' : 'Done'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                {isArabic ? currentLevelNode.descriptionAr : currentLevelNode.descriptionEn}
              </p>
            </div>
          </div>
        </div>

        {/* Collapsed Stats & Skills Radar Accordion */}
        <div className="bg-[#061224]/80 rounded-2xl border border-cyan-500/30 overflow-hidden">
          <button
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="w-full p-3 px-4 flex items-center justify-between text-xs font-black text-cyan-300 hover:bg-cyan-500/10 transition cursor-pointer"
          >
            <span>📊 {isArabic ? 'تفاصيل مستواك وخريطة المهارات' : 'Your Level Details & Skill Map'}</span>
            <span>{statsExpanded ? '▴' : '▾'}</span>
          </button>
          {statsExpanded && (
            <div className="p-4 border-t border-cyan-500/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <SkillRadar branchData={levelSkillNodes} isArabic={isArabic} />
                <div className="space-y-3 bg-[#0B1C33] p-4 rounded-2xl border border-cyan-500/20 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isArabic ? 'الوقت التقديري للمستوى:' : 'Estimated Level Time:'}</span>
                    <span className="font-black text-cyan-300">~{currentLevelNode.estimatedMinutes} {isArabic ? 'دقيقة' : 'mins'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isArabic ? 'المرحلة النشطة:' : 'Active Phase:'}</span>
                    <span className="font-black text-amber-400">{selectedPhaseId}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${levelProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setCanDoOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer"
                >
                  {isArabic ? 'أقدر أعمل إيه؟ (5/5)' : 'Can-Do Statements'}
                </button>
                <button
                  onClick={() => setPlacementOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-xl cursor-pointer"
                >
                  {isArabic ? 'تحديد المستوى' : 'Placement Test'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {currentLevelNode.phases.map((phase) => {
          const isSelected = phase.id === selectedPhaseId;
          const isPhaseUnlocked = true;

          return (
            <button
              key={phase.id}
              onClick={() => {
                if (isPhaseUnlocked) setSelectedPhaseId(phase.id);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/30'
                  : 'bg-[#0B1C33] text-slate-300 border-[#1E3A5F] hover:border-cyan-500/40 hover:bg-[#122846]'
              }`}
            >
              <span>{phase.id}</span>
              <span className="truncate max-w-[120px]">{isArabic ? phase.titleAr : phase.titleEn}</span>
            </button>
          );
        })}
      </div>

      {/* Modules & Units Tree inside Active Phase */}
      <div className="space-y-6">
        {activePhaseNode.modules.map((mod) => {
          const isModUnlocked = true;

          return (
            <div key={mod.id} className="space-y-3">
              {/* Module Header */}
              <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0B1C33]/90 to-[#0E2746]/90 border border-cyan-500/20 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <h3 className="text-sm font-black text-white">
                    {isArabic ? mod.titleAr : mod.titleEn}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {mod.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Units List */}
              <div className="grid grid-cols-1 gap-4">
                {mod.units.map((unit) => {
                  const isUnitUnlocked = true;

                  return (
                    <div
                      key={unit.id}
                      className="p-4 sm:p-5 rounded-3xl border bg-[#0B1C33]/85 border-[#1E3A5F] shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-base font-black text-white">
                            {isArabic ? unit.titleAr : unit.titleEn}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {isArabic ? unit.descriptionAr : unit.descriptionEn}
                          </p>
                        </div>
                      </div>

                      {/* Lessons Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {unit.lessons.map((lesson) => {
                          const isUnlocked = true;
                          const isCompleted = state.completedLessonIds.includes(lesson.id);
                          const isNext = nextLessonToPlay?.id === lesson.id;

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (isUnlocked) onSelectLesson(lesson);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                                isNext
                                  ? 'bg-gradient-to-r from-cyan-500/20 via-[#0B1C33] to-[#0B1C33] border-cyan-400/80 shadow-lg shadow-cyan-500/15 cursor-pointer ring-1 ring-cyan-400/50'
                                  : isCompleted
                                  ? 'bg-[#0B1C33]/90 border-emerald-500/40 text-emerald-300 cursor-pointer'
                                  : isUnlocked
                                  ? 'bg-[#0B1C33]/70 border-[#1E3A5F] hover:border-cyan-500/40 cursor-pointer'
                                  : 'bg-[#061224]/40 border-slate-900 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                      isNext
                                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md animate-pulse font-black'
                                        : isCompleted
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : isUnlocked
                                        ? 'bg-[#122846] text-slate-200 border border-cyan-500/20'
                                        : 'bg-slate-950 text-slate-600'
                                    }`}
                                  >
                                    {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : isUnlocked ? <Crown className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-black text-white line-clamp-2 leading-snug">
                                      {isArabic ? lesson.titleAr : lesson.titleEn}
                                    </h5>
                                    <span className="text-[10px] text-slate-400">
                                      ~{lesson.estimatedMinutes || 5} {isArabic ? 'دقيقة' : 'mins'}
                                    </span>
                                  </div>
                                </div>

                                {isUnlocked && (
                                  <button className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition-colors border border-amber-500/30">
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CanDoPanelModal
        isOpen={canDoOpen}
        onClose={() => setCanDoOpen(false)}
        levelId={activeLevelId}
        state={state}
        onToggleCanDo={handleToggleCanDo}
        isArabic={isArabic}
      />

      <LevelMapViewModal
        isOpen={levelMapOpen}
        onClose={() => setLevelMapOpen(false)}
        state={state}
        targetLang={targetLang}
        onSelectPhase={(phaseId) => setSelectedPhaseId(phaseId)}
        onOpenPlacementTest={() => {
          setLevelMapOpen(false);
          setPlacementOpen(true);
        }}
        onOpenCapstone={(lvl) => {
          setLevelMapOpen(false);
          setCapstoneModalTarget({ levelId: lvl });
        }}
        isArabic={isArabic}
      />

      <PlacementTestModal
        isOpen={placementOpen}
        onClose={() => setPlacementOpen(false)}
        state={state}
        onCompletePlacement={handleCompletePlacement}
        isArabic={isArabic}
      />

      {capstoneModalTarget && (
        <CapstoneRunnerModal
          isOpen={!!capstoneModalTarget}
          onClose={() => setCapstoneModalTarget(null)}
          levelId={capstoneModalTarget.levelId}
          phaseId={capstoneModalTarget.phaseId}
          state={state}
          onCompleteCapstone={handleCompleteCapstone}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
