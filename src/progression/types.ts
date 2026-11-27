import { ChunkMapping, SourceLanguage, TargetLanguage } from '../types';

export type CefrStage = 'Pre-A0' | 'A0' | 'A1' | 'A1+' | 'A2' | 'B1' | 'B1+' | 'B2' | 'C1' | 'C1+';

export type CefrLevelId = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type PhaseId = string; // e.g. 'A1.1'
export type ModuleId = string;
export type SkillBranch = 'grammar' | 'vocabulary' | 'pronunciation' | 'listening';

export type SkillAxis = 'structure' | 'vocabulary' | 'listening' | 'speaking' | 'writing';

export interface CanDoStatement {
  id: string;
  textAr: string;
  textEn: string;
}

export interface SkillNode {
  branch: SkillBranch;
  xp: number;
  mastery: number; // 0..1
}

export type ExerciseType =
  | 'structure_builder'
  | 'translate_thought'
  | 'listening_pick'
  | 'speaking_repeat'
  | 'fill_gap'
  | 'error_spotting'
  | 'corporate_rewrite'
  | 'conversation_turn';

export interface ExerciseItem {
  id: string;
  type: ExerciseType;
  promptAr: string;
  promptEn: string;
  targetSentence: string;
  acceptableAlternatives?: string[];
  audioUrl?: string;
  wordChips?: string[];
  breakdownChunks?: ChunkMapping[];
  options?: string[];
  correctOptionIndex?: number;
  explanationAr: string;
  explanationEn: string;
  skillAxes: SkillAxis[];
  weakSpotTag?: string;
}

export interface LessonNode {
  id: string;
  unitId: string;
  stage: CefrStage;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  exercises: ExerciseItem[];
  // Hierarchy fields
  levelId?: CefrLevelId;
  phaseId?: PhaseId;
  moduleId?: ModuleId;
  skills?: SkillBranch[];
  estimatedMinutes?: number;
  canDoIds?: string[];
  isBossGate?: boolean;
}

export interface UnitNode {
  id: string;
  stage: CefrStage;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  color: string;
  lessons: LessonNode[];
  checkpointTest: ExerciseItem[];
  // Hierarchy fields
  moduleId?: ModuleId;
  skills?: SkillBranch[];
  reviewDeckId?: string;
  estimatedMinutes?: number;
}

export interface ModuleNode {
  id: ModuleId;
  phaseId: PhaseId;
  titleAr: string;
  titleEn: string;
  skills: SkillBranch[];
  units: UnitNode[];
}

export interface PhaseNode {
  id: PhaseId;
  level: CefrLevelId;
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  modules: ModuleNode[];
  masteryCheckId?: string;
  estimatedMinutes: number;
}

export interface LevelNode {
  level: CefrLevelId;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  icon: string;
  canDo: CanDoStatement[];
  phases: PhaseNode[];
  capstoneLessonId?: string;
  estimatedMinutes: number;
}

export interface StageNode {
  stage: CefrStage;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  units: UnitNode[];
  stageExam: ExerciseItem[];
}

export interface SrsItemRecord {
  id: string;
  term: string;
  sourceText: string;
  targetText: string;
  targetLang: TargetLanguage;
  stability: number; // in days
  difficulty: number; // 1 to 10
  lapses: number;
  reviews: number;
  lastReviewedAt: number; // timestamp
  dueAt: number; // timestamp
  level?: string;
}

export interface SkillLevels {
  structure: number; // 1 to 50
  vocabulary: number; // 1 to 50
  listening: number; // 1 to 50
  speaking: number; // 1 to 50
  writing: number; // 1 to 50
}

export interface Quest {
  id: string;
  titleAr: string;
  titleEn: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  type: 'daily' | 'weekly';
}

export interface Achievement {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  unlockedAt: number | null;
}

export interface LeagueMember {
  id: string;
  alias: string;
  avatarIcon: string;
  weeklyXp: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  isUser?: boolean;
}

export interface ProgressionState {
  version: number; // e.g. 2
  overallLevel: number;
  xp: number;
  streak: number;
  streakShields: number;
  weekendPauseActive: boolean;
  lastActiveDate: string; // YYYY-MM-DD
  dailyDailyTargetMin: number; // 5, 10, 15, 20
  dailyCardsCap: number; // default 30

  // Legacy & Compatibility Stage
  currentStage: CefrStage;
  currentUnitId: string;
  lessonCrowns: Record<string, number>; // lessonId -> crowns (0 to 5)
  completedLessonIds: string[];
  testedOutUnitIds: string[];
  testedOutStageIds: CefrStage[];

  // Hierarchical A1-C1 Progression State
  currentLevelId?: CefrLevelId;
  currentPhaseId?: PhaseId;
  currentModuleId?: ModuleId;
  skillTree?: Record<CefrLevelId, SkillNode[]>;
  canDoProgress?: Record<string, boolean>;
  capstoneResults?: Record<string, { passed: boolean; score: number; dateISO: string } | undefined>;
  placementResult?: { levelId: CefrLevelId; phaseId: PhaseId; score: number; dateISO: string };

  // Skill Axes
  skills: SkillLevels;

  // SRS Engine
  srsItems: Record<string, SrsItemRecord>;

  // Quests & Achievements
  quests: Quest[];
  achievements: Achievement[];

  // League
  leagueOptOut: boolean;
  leagueTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  weeklyXp: number;
  leagueMembers: LeagueMember[];

  // Safety & Privacy
  isUnder13: boolean;
  anonymousAlias: string;
}
