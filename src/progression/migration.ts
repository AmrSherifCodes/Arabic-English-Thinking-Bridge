import { ProgressionState, SrsItemRecord, CefrStage, CefrLevelId, PhaseId } from './types';
import { createInitialProgressionState, calculatePlayerLevel, calculateSkillAxisLevel } from './engine';
import { loadUserProgress } from '../utils/storage';

const STAGE_TO_HIERARCHY_MAP: Record<CefrStage, { levelId: CefrLevelId; phaseId: PhaseId; moduleId: string }> = {
  'Pre-A0': { levelId: 'A1', phaseId: 'A1.1', moduleId: 'a1.1-m1' },
  'A0': { levelId: 'A1', phaseId: 'A1.2', moduleId: 'a1.2-m1' },
  'A1': { levelId: 'A1', phaseId: 'A1.3', moduleId: 'a1.3-m1' },
  'A1+': { levelId: 'A2', phaseId: 'A2.1', moduleId: 'a2.1-m1' },
  'A2': { levelId: 'A2', phaseId: 'A2.2', moduleId: 'a2.2-m1' },
  'B1': { levelId: 'B1', phaseId: 'B1.1', moduleId: 'b1.1-m1' },
  'B1+': { levelId: 'B1', phaseId: 'B1.2', moduleId: 'b1.2-m1' },
  'B2': { levelId: 'B2', phaseId: 'B2.1', moduleId: 'b2.1-m1' },
  'C1': { levelId: 'C1', phaseId: 'C1.1', moduleId: 'c1.1-m1' },
  'C1+': { levelId: 'C1', phaseId: 'C1.2', moduleId: 'c1.2-m1' },
};

/**
 * Migration function converting old ProgressionState or legacy storage into Schema V2 with hierarchy.
 */
export function migrateProgressionState(rawState: any): ProgressionState {
  const base = createInitialProgressionState();
  if (!rawState || typeof rawState !== 'object') return base;

  try {
    const stage: CefrStage = rawState.currentStage && STAGE_TO_HIERARCHY_MAP[rawState.currentStage as CefrStage]
      ? (rawState.currentStage as CefrStage)
      : 'A0';

    const mapped = STAGE_TO_HIERARCHY_MAP[stage] || STAGE_TO_HIERARCHY_MAP['A0'];

    const currentLevelId: CefrLevelId = rawState.currentLevelId || mapped.levelId;
    const currentPhaseId: PhaseId = rawState.currentPhaseId || mapped.phaseId;
    const currentModuleId: string = rawState.currentModuleId || mapped.moduleId;

    const safeNumber = (val: unknown, fallback: number): number =>
      typeof val === 'number' && Number.isFinite(val) && val >= 0 ? val : fallback;
    const safeObject = <T extends Record<string, any>>(val: unknown, fallback: T): T =>
      val && typeof val === 'object' && !Array.isArray(val) ? (val as T) : fallback;

    return {
      ...base,
      ...rawState,
      version: 2,
      xp: safeNumber(rawState.xp, base.xp),
      overallLevel: Math.max(1, Math.floor(safeNumber(rawState.overallLevel, base.overallLevel))),
      streak: Math.floor(safeNumber(rawState.streak, base.streak)),
      streakShields: Math.floor(safeNumber(rawState.streakShields, base.streakShields)),
      dailyCardsCap: Math.max(1, Math.floor(safeNumber(rawState.dailyCardsCap, base.dailyCardsCap))),
      currentStage: stage,
      currentLevelId,
      currentPhaseId,
      currentModuleId,
      skills: safeObject(rawState.skills, base.skills),
      quests: Array.isArray(rawState.quests) ? rawState.quests : base.quests,
      skillTree: safeObject(rawState.skillTree, base.skillTree || {}),
      canDoProgress: safeObject(rawState.canDoProgress, base.canDoProgress || {}),
      capstoneResults: safeObject(rawState.capstoneResults, base.capstoneResults || {}),
      completedLessonIds: Array.isArray(rawState.completedLessonIds)
        ? rawState.completedLessonIds.filter((id: unknown): id is string => typeof id === 'string')
        : [],
      lessonCrowns: safeObject(rawState.lessonCrowns, {}),
      srsItems: safeObject(rawState.srsItems, {}),
    };
  } catch (err) {
    console.warn('[ProgressionMigration] Migration error, returning fallback:', err);
    return base;
  }
}

/**
 * Legacy migration from tb.userProgress / tb.cardSchedules
 */
export function migrateLegacyStorageToProgression(): ProgressionState {
  const initialState = createInitialProgressionState();

  try {
    // 1. Check if tb.progressionState exists
    if (typeof localStorage !== 'undefined') {
      const storedStateRaw = localStorage.getItem('tb.progressionState');
      if (storedStateRaw) {
        const parsed = JSON.parse(storedStateRaw);
        return migrateProgressionState(parsed);
      }
    }

    // 2. Load legacy user progress if available
    const oldProgress = loadUserProgress();
    if (!oldProgress) return initialState;

    const xp = typeof oldProgress.score === 'number' ? Math.max(0, oldProgress.score) : 0;
    const streak = typeof oldProgress.streak === 'number' ? Math.max(0, oldProgress.streak) : 0;
    const streakShields = typeof oldProgress.streakShields === 'number' ? Math.max(0, oldProgress.streakShields) : 2;

    const completedLessonIds = Array.isArray(oldProgress.completedLessonIds)
      ? oldProgress.completedLessonIds
      : [];

    const lessonCrowns: Record<string, number> = {};
    completedLessonIds.forEach((id) => {
      lessonCrowns[id] = 1;
    });

    const overallLevel = calculatePlayerLevel(xp);
    const skillLevel = calculateSkillAxisLevel(xp);

    const srsItems: Record<string, SrsItemRecord> = {};
    try {
      const rawSchedules = typeof localStorage !== 'undefined' ? localStorage.getItem('tb.cardSchedules') : null;
      if (rawSchedules) {
        const parsedSchedules = JSON.parse(rawSchedules);
        if (typeof parsedSchedules === 'object' && parsedSchedules !== null) {
          Object.entries(parsedSchedules).forEach(([cardId, sched]: [string, any]) => {
            if (sched && typeof sched === 'object') {
              srsItems[cardId] = {
                id: cardId,
                term: cardId,
                sourceText: cardId,
                targetText: cardId,
                targetLang: 'en',
                stability: Number(sched.interval || 1.0),
                difficulty: Number(sched.easeFactor || 2.5),
                lapses: Number(sched.lapses || 0),
                reviews: Number(sched.repetitions || 1),
                lastReviewedAt: Number(sched.lastReviewed || Date.now()),
                dueAt: Number(sched.nextDue || Date.now()),
              };
            }
          });
        }
      }
    } catch {
      /* ignore parse error */
    }

    const state = {
      ...initialState,
      xp,
      overallLevel,
      streak,
      streakShields,
      completedLessonIds,
      lessonCrowns,
      currentLevelId: 'A1' as CefrLevelId,
      currentPhaseId: 'A1.1' as PhaseId,
      currentModuleId: 'a1.1-m1',
      skills: {
        structure: skillLevel,
        vocabulary: skillLevel,
        listening: Math.max(1, skillLevel - 1),
        speaking: Math.max(1, skillLevel - 1),
        writing: skillLevel,
      },
      srsItems,
    };

    return migrateProgressionState(state);
  } catch (err) {
    console.warn('[ProgressionMigration] Migration encountered an issue, returning safe fallback:', err);
    return initialState;
  }
}
