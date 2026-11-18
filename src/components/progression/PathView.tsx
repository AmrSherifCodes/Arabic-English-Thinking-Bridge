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
}: PathViewProps) {
  const [dictionaryVersion, setDictionaryVersion] = useState(0);
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<FeatureUnlockDefinition | null>(null);

  // Modal Visibility States
  const [canDoOpen, setCanDoOpen] = useState(false);
  const [levelMapOpen, setLevelMapOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
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
    () => hierarchy.find((l) => l.level === activeLevelId) || hierarchy[0],
    [hierarchy, activeLevelId]
  );

  // Synchronize active phase if level changes
  useEffect(() => {
    if (!currentLevelNode.phases.some((p) => p.id === selectedPhaseId)) {
      setSelectedPhaseId(currentLevelNode.phases[0]?.id || 'A1.1');
    }
  }, [currentLevelNode, selectedPhaseId]);

  const activePhaseNode = useMemo(
    () => currentLevelNode.phases.find((p) => p.id === selectedPhaseId) || currentLevelNode.phases[0],
    [currentLevelNode, selectedPhaseId]
  );

  // Calculate Level Skills
  const levelSkillNodes = useMemo(
    () => calculateLevelSkillNodes(state, activeLevelId),
    [state, activeLevelId]
  );

  // Calculate Overall Level Completion Ratio
  const allLevelLessons = useMemo(
    () => currentLevelNode.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons))),
    [currentLevelNode]
  );
  const completedLevelCount = useMemo(
    () => allLevelLessons.filter((l) => state.completedLessonIds.includes(l.id)).length,
    [allLevelLessons, state.completedLessonIds]
  );
  const levelProgressPct = allLevelLessons.length > 0 ? Math.round((completedLevelCount / allLevelLessons.length) * 100) : 0;

  // Find Next Unfinished Lesson in Current Level
  const nextLessonToPlay = useMemo(
    () => allLevelLessons.find((l) => !state.completedLessonIds.includes(l.id)) || allLevelLessons[0],
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

  return (
    <div className="relative space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Alexandrian Welcome Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-teal-950/40 to-stone-900 border border-amber-500/30 text-start flex items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
            <span>⚓</span>
            <span>{isArabic ? 'نظام التفكير التراكمي CEFR A1 → C1' : '5-Tier CEFR Cognitive Bridge'}</span>
          </div>
          <p className="text-[11px] text-stone-300 font-bold leading-snug truncate">
            {isArabic ? 'فكّر بالإنجليزي مباشرة، دون ترجمة حرفية أو عقد' : 'Think directly in English without mental translation'}
          </p>
        </div>
        <button
          onClick={() => setLevelMapOpen(true)}
          className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1 shrink-0"
        >
          <Map className="w-3.5 h-3.5" />
          <span>{isArabic ? 'خريطة المستويات' : 'Level Map'}</span>
        </button>
      </div>

      {/* Level Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black text-xl shadow-lg shadow-amber-500/20">
              {currentLevelNode.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {isArabic ? currentLevelNode.titleAr : currentLevelNode.titleEn}
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  {levelProgressPct}% {isArabic ? 'مكتمل' : 'Done'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 max-w-md">
                {isArabic ? currentLevelNode.descriptionAr : currentLevelNode.descriptionEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setCanDoOpen(true)}
              className="px-3 py-2 text-xs font-bold text-amber-300 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isArabic ? 'Can-Do (5/5)' : 'Can-Do Statements'}</span>
            </button>
            <button
              onClick={() => setPlacementOpen(true)}
              className="px-3 py-2 text-xs font-bold text-teal-300 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-teal-400" />
              <span>{isArabic ? 'اختبار تحديد المستوى' : 'Placement Test'}</span>
            </button>
          </div>
        </div>

        {/* Skill Radar & Level Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-t border-stone-800/80 pt-4">
          <SkillRadar branchData={levelSkillNodes} isArabic={isArabic} />

          <div className="space-y-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">{isArabic ? 'الوقت التقديري للمستوى:' : 'Estimated Level Time:'}</span>
              <span className="font-bold text-white">~{currentLevelNode.estimatedMinutes} {isArabic ? 'دقيقة' : 'mins'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">{isArabic ? 'المرحلة النشطة:' : 'Active Phase:'}</span>
              <span className="font-bold text-amber-400">{selectedPhaseId}</span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Primary CTA */}
      <div className="sticky top-14 z-20 p-4 rounded-3xl bg-stone-900/98 border-2 border-amber-500/60 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="space-y-1 text-start min-w-0">
          <span className="text-xs font-black text-amber-400 block">
            {isArabic ? `المستوى الحالي: ${currentLevelNode.level} · المرحلة ${selectedPhaseId}` : `Level: ${currentLevelNode.level} · Phase ${selectedPhaseId}`}
          </span>
          <h3 className="text-base font-black text-white truncate">
            {isArabic ? nextLessonToPlay?.titleAr || 'متابعة التعلم' : nextLessonToPlay?.titleEn || 'Continue Learning'}
          </h3>
          <p className="text-xs text-stone-300">
            {isArabic ? 'اضغط الزر الذهبي لبدء الدرس مباشرة' : 'Tap the gold button to launch lesson'}
          </p>
        </div>

        <button
          onClick={() => {
            if (nextLessonToPlay) onSelectLesson(nextLessonToPlay);
          }}
          aria-label="ابدأ الدرس الحالي"
          className="min-h-[56px] px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-sm shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 shrink-0 border-2 border-amber-300 cursor-pointer"
        >
          <Play size={18} fill="currentColor" />
          <div className="flex flex-col items-center">
            <span>ابدأ الدرس 🚀</span>
            <span className="text-[9px] font-sans font-bold opacity-90">Start Lesson</span>
          </div>
        </button>
      </div>

      {/* Phase Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {currentLevelNode.phases.map((phase) => {
          const isSelected = phase.id === selectedPhaseId;
          const isPhaseUnlocked = isHierarchicalPhaseUnlocked(state, phase.id);

          return (
            <button
              key={phase.id}
              onClick={() => {
                if (isPhaseUnlocked) setSelectedPhaseId(phase.id);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                  : isPhaseUnlocked
                  ? 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                  : 'bg-stone-950/60 text-stone-600 border-stone-900 cursor-not-allowed opacity-50'
              }`}
            >
              <span>{phase.id}</span>
              <span className="truncate max-w-[120px]">{isArabic ? phase.titleAr : phase.titleEn}</span>
              {!isPhaseUnlocked && <LockKeyhole className="w-3.5 h-3.5 text-stone-600" />}
            </button>
          );
        })}
      </div>

      {/* Modules & Units Tree inside Active Phase */}
      <div className="space-y-6">
        {activePhaseNode.modules.map((mod) => {
          const isModUnlocked = isHierarchicalModuleUnlocked(state, mod.id, activePhaseNode.id);

          return (
            <div key={mod.id} className="space-y-3">
              {/* Module Header */}
              <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isArabic ? mod.titleAr : mod.titleEn}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {mod.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[9px] font-bold text-stone-400 bg-stone-800 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Units List */}
              <div className="grid grid-cols-1 gap-4">
                {mod.units.map((unit) => {
                  const isUnitUnlocked = isHierarchicalUnitUnlocked(state, unit.id, mod.id, activePhaseNode.id);

                  return (
                    <div
                      key={unit.id}
                      className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                        isUnitUnlocked
                          ? 'bg-stone-900/80 border-stone-800'
                          : 'bg-stone-950/40 border-stone-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-base font-bold text-white">
                            {isArabic ? unit.titleAr : unit.titleEn}
                          </h4>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {isArabic ? unit.descriptionAr : unit.descriptionEn}
                          </p>
                        </div>
                        {!isUnitUnlocked && (
                          <span className="px-2.5 py-1 text-[10px] font-bold text-stone-400 bg-stone-800/80 rounded-xl flex items-center gap-1">
                            <LockKeyhole className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'يتطلب إكمال الوحدة السابقة' : 'Complete previous unit'}</span>
                          </span>
                        )}
                      </div>

                      {/* Lessons Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {unit.lessons.map((lesson) => {
                          const isUnlocked = isHierarchicalLessonUnlocked(state, lesson);
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
                                  ? 'bg-gradient-to-r from-amber-500/20 via-stone-900 to-stone-900 border-amber-500/60 shadow-lg shadow-amber-500/10 cursor-pointer ring-1 ring-amber-500/40'
                                  : isCompleted
                                  ? 'bg-stone-900/90 border-emerald-500/30 cursor-pointer'
                                  : isUnlocked
                                  ? 'bg-stone-900/60 border-stone-800 hover:border-stone-700 cursor-pointer'
                                  : 'bg-stone-950/40 border-stone-900 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                      isNext
                                        ? 'bg-amber-500 text-stone-950 shadow-md animate-pulse'
                                        : isCompleted
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : isUnlocked
                                        ? 'bg-stone-800 text-stone-200'
                                        : 'bg-stone-950 text-stone-600'
                                    }`}
                                  >
                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : isUnlocked ? <Crown className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-white truncate max-w-[160px]">
                                      {isArabic ? lesson.titleAr : lesson.titleEn}
                                    </h5>
                                    <span className="text-[10px] text-stone-400">
                                      ~{lesson.estimatedMinutes || 5} {isArabic ? 'دقيقة' : 'mins'}
                                    </span>
                                  </div>
                                </div>

                                {isUnlocked && (
                                  <button className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors">
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
