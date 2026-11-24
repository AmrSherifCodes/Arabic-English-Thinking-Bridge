// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useMemo, useState } from 'react';
import {
  ProgressionState,
  LessonNode,
  CefrLevelId,
  PhaseId,
} from '../../progression/types';
import {
  getCefrLevelHierarchy,
  calculateLevelSkillNodes,
} from '../../progression/courseData';
import { getTargetDictionary, getTargetDictionaryAsync } from '../../data/dictionaries';
import { Map, CheckCircle, Play, Sparkles, X } from 'lucide-react';
import { TargetLanguage, UserProgress } from '../../types';
import { TARGET_LANGUAGE_META } from '../../data/languages';
import { SkillRadar } from './SkillRadar';
import { CanDoPanelModal } from './CanDoPanelModal';
import { LevelMapViewModal } from './LevelMapViewModal';
import { PlacementTestModal } from './PlacementTestModal';
import { CapstoneRunnerModal } from './CapstoneRunnerModal';
import { NameForge } from '../NameForge';
import { useUiMode } from '../../utils/uiMode';
import { GuideMode, LearnerTrack, getLearnerTrackMeta } from '../../utils/guideMode';
import { ChestTier, StarRating, useEconomy } from '../../features/gamification/economy';
import { ChestModal } from '../../features/gamification/ChestModal';
import { JourneyBiomeBackdrop } from './JourneyBiomeBackdrop';

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

const COACH_DISMISSED_KEY = 'tb.mapCoachDismissed.v1';

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
  learnerTrack?: LearnerTrack;
  guideMode?: GuideMode;
  progress?: UserProgress;
  flashcardDeckIds?: string[];
  onOpenLanguageSelector?: () => void;
  isPro?: boolean;
  onToast?: (msg: string) => void;
}

type MapItem =
  | {
      kind: 'lesson';
      id: string;
      index: number; // 1-based lesson number
      lesson: LessonNode;
      isBoss: boolean;
      xPct: number;
      yPx: number;
    }
  | {
      kind: 'chest';
      id: string;
      tier: ChestTier;
      unlockAfterLessonIndex: number;
      unlocked: boolean;
      opened: boolean;
      xPct: number;
      yPx: number;
    };

// S-curve horizontal pattern (in % of viewBox width 360) alternating center -> right -> center -> left
const S_CURVE_X_PCT = [50, 74, 50, 26];

function getChestTierForMilestone(milestoneNum: number): ChestTier {
  if (milestoneNum === 1) return 'wooden';
  if (milestoneNum === 2) return 'silver';
  if (milestoneNum === 3) return 'golden';
  return 'crown';
}

function StarArc({ stars }: { stars: StarRating }) {
  return (
    <div
      className="flex items-end justify-center gap-0.5 mb-1 pointer-events-none select-none"
      aria-label={`${stars} of 3 stars`}
    >
      {[1, 2, 3].map((slot) => {
        const earned = stars >= slot;
        const lift = slot === 2 ? '-translate-y-1' : '';
        return (
          <svg
            key={slot}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className={lift}
            aria-hidden="true"
          >
            <path
              d="M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.11 6.47L12 17.3l-5.81 3.07 1.11-6.47-4.7-4.58 6.5-.94L12 2.5z"
              fill={earned ? 'var(--gold)' : 'transparent'}
              stroke={earned ? 'var(--gold)' : 'var(--border)'}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

export function PathView({
  state,
  targetLang,
  onSelectLesson,
  onUpdateState,
  onOpenTeacherMode,
  isArabic = true,
  learnerTrack = 'starter',
  guideMode = 'egyptian_ar',
  isPro = false,
  onToast,
}: PathViewProps) {
  const trackMeta = getLearnerTrackMeta(learnerTrack);
  const trackLabel = isArabic
    ? guideMode === 'standard_ar'
      ? trackMeta.labelMsa
      : trackMeta.labelEg
    : trackMeta.labelEn;
  const [uiMode, setUiMode] = useUiMode();
  const { economy } = useEconomy();
  const [dictionaryVersion, setDictionaryVersion] = useState(0);

  // Modal Visibility States
  const [canDoOpen, setCanDoOpen] = useState(false);
  const [levelMapOpen, setLevelMapOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
  const [nameForgeOpen, setNameForgeOpen] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [capstoneModalTarget, setCapstoneModalTarget] = useState<{
    levelId?: CefrLevelId;
    phaseId?: PhaseId;
  } | null>(null);
  const [activeChest, setActiveChest] = useState<{ id: string; tier: ChestTier } | null>(null);

  const [coachDismissed, setCoachDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COACH_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

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

  useEffect(() => {
    if (state.currentPhaseId) {
      setSelectedPhaseId(state.currentPhaseId);
    }
  }, [state.currentPhaseId]);

  useEffect(() => {
    if (currentLevelNode?.phases && !currentLevelNode.phases.some((p) => p.id === selectedPhaseId)) {
      setSelectedPhaseId(currentLevelNode.phases[0]?.id || 'A1.1');
    }
  }, [currentLevelNode, selectedPhaseId]);

  const activePhaseNode = useMemo(
    () =>
      currentLevelNode?.phases?.find((p) => p.id === selectedPhaseId) ||
      currentLevelNode?.phases?.[0] ||
      getCefrLevelHierarchy('en')[0].phases[0],
    [currentLevelNode, selectedPhaseId]
  );

  const levelSkillNodes = useMemo(
    () => calculateLevelSkillNodes(state, activeLevelId),
    [state, activeLevelId]
  );

  const allLevelLessons = useMemo(
    () =>
      (currentLevelNode?.phases || []).flatMap((p) =>
        (p.modules || []).flatMap((m) => (m.units || []).flatMap((u) => u.lessons || []))
      ),
    [currentLevelNode]
  );

  const activePhaseLessons = useMemo(
    () =>
      (activePhaseNode?.modules || []).flatMap((m) =>
        (m.units || []).flatMap((u) => u.lessons || [])
      ),
    [activePhaseNode]
  );

  // Use up to 10 lessons for the crisp S-curve journey road (Levels 1->10)
  const roadLessons = useMemo(() => {
    const source = activePhaseLessons.length > 0 ? activePhaseLessons : allLevelLessons;
    return source.slice(0, 10);
  }, [activePhaseLessons, allLevelLessons]);

  const completedLevelCount = useMemo(
    () => allLevelLessons.filter((l) => state.completedLessonIds?.includes(l.id)).length,
    [allLevelLessons, state.completedLessonIds]
  );
  const levelProgressPct =
    allLevelLessons.length > 0 ? Math.round((completedLevelCount / allLevelLessons.length) * 100) : 0;

  const nextLessonToPlay = useMemo(
    () =>
      roadLessons.find((l) => !state.completedLessonIds?.includes(l.id)) ||
      allLevelLessons.find((l) => !state.completedLessonIds?.includes(l.id)) ||
      roadLessons[0] ||
      allLevelLessons[0],
    [roadLessons, allLevelLessons, state.completedLessonIds]
  );

  const hasCompletedAny = (state.completedLessonIds?.length || 0) > 0;

  // Build winding S-curve items (lessons + milestone chests after every 3rd node + final crown chest)
  const { mapItems, totalHeight, svgPathD, completedPathD } = useMemo(() => {
    const items: MapItem[] = [];
    const ROW_STEP = 124;
    const TOP_PAD = 76;
    let rowIdx = 0;
    let milestoneCount = 0;

    roadLessons.forEach((lesson, idx) => {
      const lessonNum = idx + 1;
      const isBoss = lessonNum === 5 || lessonNum === roadLessons.length;
      const xPct = S_CURVE_X_PCT[rowIdx % S_CURVE_X_PCT.length];
      const yPx = TOP_PAD + rowIdx * ROW_STEP;

      items.push({
        kind: 'lesson',
        id: lesson.id,
        index: lessonNum,
        lesson,
        isBoss,
        xPct,
        yPx,
      });
      rowIdx += 1;

      // Insert a Milestone Chest after every 3rd node (3, 6, 9) and Crown Chest after the final node
      const isThirdMilestone = lessonNum % 3 === 0;
      const isFinalCrown = lessonNum === roadLessons.length && !isThirdMilestone && roadLessons.length >= 4;

      if (isThirdMilestone || isFinalCrown) {
        milestoneCount += 1;
        const tier: ChestTier = isFinalCrown ? 'crown' : getChestTierForMilestone(milestoneCount);
        const chestId = `chest-${selectedPhaseId}-${lessonNum}-${tier}`;
        const unlocked = state.completedLessonIds.includes(lesson.id);
        const opened = economy.openedChests.includes(chestId);
        const chestXPct = S_CURVE_X_PCT[rowIdx % S_CURVE_X_PCT.length];
        const chestYPx = TOP_PAD + rowIdx * ROW_STEP;

        items.push({
          kind: 'chest',
          id: chestId,
          tier,
          unlockAfterLessonIndex: lessonNum,
          unlocked,
          opened,
          xPct: chestXPct,
          yPx: chestYPx,
        });
        rowIdx += 1;
      }
    });

    const height = TOP_PAD + Math.max(1, rowIdx) * ROW_STEP + 32;
    const VIEW_W = 360;

    const buildBezier = (pts: Array<{ x: number; y: number }>) => {
      if (pts.length < 2) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i += 1) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
      return d;
    };

    const allPts = items.map((it) => ({ x: (it.xPct / 100) * VIEW_W, y: it.yPx }));

    // Determine furthest completed point index for glowing progress line
    let lastCompletedIdx = -1;
    items.forEach((it, idx) => {
      if (it.kind === 'lesson' && state.completedLessonIds.includes(it.lesson.id)) {
        lastCompletedIdx = idx;
      } else if (it.kind === 'chest' && it.unlocked) {
        lastCompletedIdx = idx;
      }
    });

    const completedPts =
      lastCompletedIdx >= 0 ? allPts.slice(0, Math.min(allPts.length, lastCompletedIdx + 2)) : [];

    return {
      mapItems: items,
      totalHeight: height,
      svgPathD: buildBezier(allPts),
      completedPathD: buildBezier(completedPts),
    };
  }, [roadLessons, selectedPhaseId, state.completedLessonIds, economy.openedChests]);

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
      const allLessons = hierarchy.flatMap((l) =>
        l.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons)))
      );
      const levelsOrder: CefrLevelId[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
      const targetLevelIndex = levelsOrder.indexOf(levelId);
      const autoCompletedIds = allLessons
        .filter((l) => levelsOrder.indexOf((l.levelId || 'A1') as CefrLevelId) < targetLevelIndex)
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

  const dismissCoach = () => {
    setCoachDismissed(true);
    try {
      localStorage.setItem(COACH_DISMISSED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const targetNameAr = langNamesAr[targetLang] || TARGET_LANGUAGE_META[targetLang]?.nameAr || targetLang;
  const targetNameEn = TARGET_LANGUAGE_META[targetLang]?.nameEn || targetLang;
  const nameForgeBtnLabel =
    targetLang === 'en'
      ? isArabic
        ? 'اكتب اسمك بالإنجليزي'
        : 'Name Forge'
      : isArabic
      ? `اكتب اسمك باللغة ${targetNameAr}`
      : `${targetNameEn} Name Forge`;

  return (
    <div
      className="relative w-full max-w-[480px] mx-auto pb-28 space-y-4 overflow-x-clip"
      style={{ maxWidth: 'min(480px, 100vw)' }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Compact Journey Header Card */}
      <section
        className="tb-card-surface p-4 rounded-[20px] border space-y-3.5 text-start"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--ink)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderColor: 'var(--accent)',
              }}
            >
              {currentLevelNode.level}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black leading-tight break-words" style={{ color: 'var(--ink)' }}>
                {isArabic ? currentLevelNode.titleAr : currentLevelNode.titleEn}
              </h2>
              <span className="text-[11px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                {isArabic
                  ? `${completedLevelCount} من ${allLevelLessons.length} دروس · ${levelProgressPct}%`
                  : `${completedLevelCount} of ${allLevelLessons.length} lessons · ${levelProgressPct}%`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setUiMode(uiMode === 'simple' ? 'pro' : 'simple')}
              className="min-h-[48px] px-3 py-1.5 rounded-2xl text-xs font-black border cursor-pointer"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            >
              {uiMode === 'simple' ? (isArabic ? 'بسيط' : 'Simple') : isArabic ? 'متقدم' : 'Pro'}
            </button>
            <button
              type="button"
              onClick={() => setLevelMapOpen(true)}
              aria-label={isArabic ? 'خريطة المستويات' : 'Level Map'}
              className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-2xl text-xs font-black border flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--accent)',
              }}
            >
              <Map size={16} />
            </button>
          </div>
        </div>

        {/* Clean Single-Line Free Forever Advantage Strip */}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold px-1"
          style={{ color: 'var(--ink-muted)' }}
          data-testid="path-advantage-strip"
        >
          <span>❤️ {isArabic ? '∞ قلوب مجانية' : '∞ Free Hearts'}</span>
          <span>✈️ {isArabic ? '100% بدون إنترنت' : '100% Offline'}</span>
          <span>🚫 {isArabic ? 'بدون إعلانات' : 'No Ads'}</span>
          <span style={{ color: 'var(--accent)' }}>
            {trackMeta.icon} {trackLabel}
          </span>
          {learnerTrack === 'teacher' && onOpenTeacherMode && (
            <button
              type="button"
              onClick={onOpenTeacherMode}
              className="px-2.5 py-1 rounded-full text-[11px] font-black border cursor-pointer"
              style={{ backgroundColor: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--gold-ink)' }}
            >
              {isArabic ? 'افتح وضع المعلم 🏫' : 'Open Teacher Mode 🏫'}
            </button>
          )}
        </div>

        {/* Primary Play CTA + Compact Secondary Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              if (nextLessonToPlay) onSelectLesson(nextLessonToPlay);
            }}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-ink)',
            }}
          >
            <Play size={16} className="fill-current shrink-0" />
            <span>
              {hasCompletedAny
                ? isArabic
                  ? 'كمّل التحدي التالي'
                  : 'Continue Next Challenge'
                : isArabic
                ? 'ابدأ المرحلة 1 الآن'
                : 'Start Level 1 Now'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPlacementOpen(true)}
              className="min-h-[48px] px-3 py-2 rounded-2xl text-xs font-bold border cursor-pointer flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            >
              <span>🎯</span>
              <span className="truncate">{isArabic ? 'اختبار 60 ثانية' : '60s Level Test'}</span>
            </button>
            <button
              type="button"
              onClick={() => setNameForgeOpen(true)}
              title={nameForgeBtnLabel}
              className="min-h-[48px] px-3 py-2 rounded-2xl text-xs font-bold border cursor-pointer flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            >
              <Sparkles size={14} className="shrink-0" style={{ color: 'var(--gold)' }} />
              <span className="truncate">{nameForgeBtnLabel}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Level Skill Radar */}
        {uiMode !== 'simple' && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setStatsExpanded((v) => !v)}
              className="w-full min-h-[48px] px-3.5 py-2 flex items-center justify-between text-xs font-black cursor-pointer"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--accent)' }}
            >
              <span>📊 {isArabic ? 'خريطة المهارات وتحديد المستوى' : 'Skill Map & Placement'}</span>
              <span>{statsExpanded ? '▴' : '▾'}</span>
            </button>
            {statsExpanded && (
              <div className="p-3.5 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <SkillRadar branchData={levelSkillNodes} isArabic={isArabic} />
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setCanDoOpen(true)}
                    className="min-h-[48px] px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    {isArabic ? 'أقدر أعمل إيه؟' : 'Can-Do'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlacementOpen(true)}
                    className="min-h-[48px] px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer"
                    style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    {isArabic ? 'تحديد المستوى' : 'Placement Test'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Phase Selector Pills */}
      {currentLevelNode.phases.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {currentLevelNode.phases.map((phase) => {
            const isSelected = phase.id === selectedPhaseId;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhaseId(phase.id)}
                className="min-h-[48px] px-3.5 py-2 rounded-2xl text-xs font-black border cursor-pointer transition"
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-ink)',
                        borderColor: 'var(--accent)',
                      }
                    : {
                        backgroundColor: 'var(--surface)',
                        color: 'var(--ink)',
                        borderColor: 'var(--border)',
                      }
                }
              >
                {phase.id} · {isArabic ? phase.titleAr : phase.titleEn}
              </button>
            );
          })}
        </div>
      )}

      {/* ============================================================
          CANDY CRUSH WINDING S-CURVE SVG JOURNEY MAP (Levels 1 -> 10)
          ============================================================ */}
      <section
        aria-label={isArabic ? 'خريطة الرحلة التفاعلية' : 'Interactive Journey Map'}
        className="tb-card-surface relative rounded-[20px] border px-2 py-4"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          overflow: 'visible',
        }}
      >
        {/* 3-Biome Eye-Soothing Theme-Adaptive SVG Backdrop */}
        <JourneyBiomeBackdrop totalHeight={totalHeight} />

        {/* Dismissible 1-sentence floating coach bubble for first-time learners */}
        {!hasCompletedAny && !coachDismissed && (
          <div
            role="status"
            className="relative z-10 mx-2 mb-2 px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs font-black"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--accent)',
              color: 'var(--ink)',
            }}
          >
            <span>
              💡{' '}
              {isArabic
                ? 'اضغط على المرحلة 1 لبدء أول تحدي!'
                : 'Tap Level 1 to start your first challenge!'}
            </span>
            <button
              type="button"
              onClick={dismissCoach}
              aria-label={isArabic ? 'إخفاء التلميح' : 'Dismiss tip'}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl cursor-pointer shrink-0"
              style={{ color: 'var(--ink-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Winding Road Canvas */}
        <div
          className="relative w-full mx-auto"
          style={{ height: `${totalHeight}px`, overflow: 'visible' }}
        >
          {/* SVG Winding S-Curve Road */}
          <svg
            viewBox={`0 0 360 ${totalHeight}`}
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            {/* Road outer track */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="var(--border)"
                strokeWidth="16"
                strokeLinecap="round"
              />
            )}
            {/* Road inner dashed lane */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="var(--bg)"
                strokeWidth="6"
                strokeDasharray="10 10"
                strokeLinecap="round"
              />
            )}
            {/* Completed progress path */}
            {completedPathD && (
              <path
                d={completedPathD}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="10"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Interactive Stepped Nodes & Milestone Chests */}
          {mapItems.map((item) => {
            if (item.kind === 'chest') {
              const tierLabel =
                item.tier === 'wooden'
                  ? isArabic
                    ? 'صندوق خشبي'
                    : 'Wooden Chest'
                  : item.tier === 'silver'
                  ? isArabic
                    ? 'صندوق فضي'
                    : 'Silver Chest'
                  : item.tier === 'golden'
                  ? isArabic
                    ? 'صندوق ذهبي'
                    : 'Golden Chest'
                  : isArabic
                  ? 'صندوق التاج'
                  : 'Crown Chest';

              return (
                <div
                  key={item.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{
                    left: `${item.xPct}%`,
                    top: `${item.yPx}px`,
                    overflow: 'visible',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.unlocked) {
                        onToast?.(
                          isArabic
                            ? `🔒 أكمل المرحلة ${item.unlockAfterLessonIndex} لفتح ${tierLabel}`
                            : `🔒 Complete Level ${item.unlockAfterLessonIndex} to unlock ${tierLabel}`
                        );
                        return;
                      }
                      if (item.opened) {
                        onToast?.(isArabic ? '✅ تم فتح هذا الصندوق بالفعل' : '✅ Chest already claimed');
                        return;
                      }
                      setActiveChest({ id: item.id, tier: item.tier });
                    }}
                    aria-label={tierLabel}
                    className={`relative min-h-[60px] min-w-[60px] w-[62px] h-[62px] rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 ${
                      item.unlocked && !item.opened ? 'tb-active-node-glow' : ''
                    }`}
                    style={{
                      backgroundColor: item.opened
                        ? 'var(--bg)'
                        : item.unlocked
                        ? 'var(--gold)'
                        : 'var(--surface)',
                      borderColor: item.opened
                        ? 'var(--border)'
                        : item.unlocked
                        ? 'var(--gold)'
                        : 'var(--border)',
                      color: item.unlocked && !item.opened ? 'var(--gold-ink)' : 'var(--ink-muted)',
                      opacity: item.opened ? 0.65 : 1,
                    }}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {item.opened ? '📭' : '🎁'}
                    </span>
                  </button>
                  <span
                    className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black border text-center max-w-[136px] break-words leading-snug"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: item.unlocked && !item.opened ? 'var(--gold)' : 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    {item.opened ? (isArabic ? 'تم الفتح ✓' : 'Claimed ✓') : tierLabel}
                  </span>
                </div>
              );
            }

            // Lesson Node
            const isCompleted = state.completedLessonIds.includes(item.lesson.id);
            const isActive = nextLessonToPlay?.id === item.lesson.id;
            const recordedStars = economy.levelStars[item.lesson.id] || 0;
            const displayStars: StarRating = (
              recordedStars > 0 ? recordedStars : isCompleted ? 1 : 0
            ) as StarRating;

            return (
              <div
                key={item.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{
                  left: `${item.xPct}%`,
                  top: `${item.yPx}px`,
                  overflow: 'visible',
                  zIndex: isActive ? 20 : 10,
                }}
              >
                {/* Active "You are here" pill */}
                {isActive && (
                  <div
                    className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap border"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-ink)',
                      borderColor: 'var(--accent)',
                    }}
                  >
                    📍 {isArabic ? 'أنت هنا الآن' : 'You are here'}
                  </div>
                )}

                {/* Boss Gate Marker */}
                {item.isBoss && !isActive && (
                  <div
                    className="mb-0.5 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap border"
                    style={{
                      backgroundColor: 'var(--gold)',
                      color: 'var(--gold-ink)',
                      borderColor: 'var(--gold)',
                    }}
                  >
                    ⚔️ {isArabic ? 'بوابة الزعيم' : 'Boss Gate'}
                  </div>
                )}

                {/* 0-3 Star Arc */}
                <StarArc stars={displayStars} />

                {/* Circular Level Node Button (min 64x64 touch target, overflow: visible) */}
                <button
                  type="button"
                  onClick={() => onSelectLesson(item.lesson)}
                  aria-label={`${isArabic ? 'المرحلة' : 'Level'} ${item.index}: ${
                    isArabic ? item.lesson.titleAr : item.lesson.titleEn
                  }`}
                  className={`relative min-h-[64px] min-w-[64px] w-[66px] h-[66px] rounded-full border-[3px] flex flex-col items-center justify-center font-black cursor-pointer transition active:scale-95 ${
                    isActive ? 'tb-active-node-glow' : ''
                  }`}
                  style={{
                    overflow: 'visible',
                    backgroundColor: isActive
                      ? 'var(--accent)'
                      : isCompleted
                      ? 'var(--surface)'
                      : item.isBoss
                      ? 'var(--surface)'
                      : 'var(--bg)',
                    borderColor: isActive
                      ? 'var(--accent)'
                      : isCompleted
                      ? 'var(--accent)'
                      : item.isBoss
                      ? 'var(--gold)'
                      : 'var(--border)',
                    color: isActive ? 'var(--accent-ink)' : 'var(--ink)',
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="tb-active-node-pulse absolute -inset-2 rounded-full border-2 pointer-events-none"
                      style={{ borderColor: 'var(--accent)' }}
                    />
                  )}
                  <span className="text-lg leading-none">
                    {item.isBoss ? '⚔️' : isCompleted ? <CheckCircle size={22} style={{ color: isActive ? 'var(--accent-ink)' : 'var(--accent)' }} /> : item.index}
                  </span>
                  <span className="text-[10px] font-black leading-none mt-0.5">
                    {isArabic ? `م${item.index}` : `L${item.index}`}
                  </span>
                </button>

                {/* Lesson Title Pill */}
                <div
                  className="mt-1 px-2.5 py-0.5 rounded-xl border text-[11px] font-bold text-center max-w-[144px] leading-snug"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                    color: 'var(--ink)',
                  }}
                >
                  <span className="break-words">
                    {isArabic ? item.lesson.titleAr : item.lesson.titleEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NameForge Modal */}
      {nameForgeOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 pt-safe pb-safe"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setNameForgeOpen(false)}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
              className="absolute top-3 end-3 min-h-[48px] min-w-[48px] flex items-center justify-center p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white z-10 cursor-pointer"
            >
              ✕
            </button>
            <NameForge
              onComplete={() => {
                setNameForgeOpen(false);
                if (onUpdateState) {
                  onUpdateState((prev) => ({ ...prev, xp: prev.xp + 50 }));
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Milestone Chest Modal */}
      <ChestModal
        isOpen={Boolean(activeChest)}
        chestId={activeChest?.id ?? null}
        tier={activeChest?.tier ?? 'wooden'}
        isPro={isPro}
        isArabic={isArabic}
        onClose={() => setActiveChest(null)}
        onClaimed={(reward) => {
          onToast?.(
            isArabic
              ? `🎁 استلمت +${reward.coins} عملة و +${reward.shields} درع!`
              : `🎁 Claimed +${reward.coins} Coins & +${reward.shields} Shields!`
          );
        }}
      />

      {/* Existing Modals */}
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
