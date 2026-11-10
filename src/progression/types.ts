import { ChunkMapping, SourceLanguage, TargetLanguage } from '../types';

export type CefrStage = 'Pre-A0' | 'A0' | 'A1' | 'A1+' | 'A2' | 'B1' | 'B1+' | 'B2' | 'C1' | 'C1+';

export type SkillAxis = 'structure' | 'vocabulary' | 'listening' | 'speaking' | 'writing';

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

  // Stages & Lessons Progress
  currentStage: CefrStage;
  currentUnitId: string;
  lessonCrowns: Record<string, number>; // lessonId -> crowns (0 to 5)
  completedLessonIds: string[];
  testedOutUnitIds: string[];
  testedOutStageIds: CefrStage[];

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
