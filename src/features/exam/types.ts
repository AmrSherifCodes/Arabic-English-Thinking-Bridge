/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type Skill = 'grammar' | 'vocabulary' | 'reading' | 'listening';
export type TargetLang = 'en' | 'de' | 'he';
export type QuestionType = 'mcq' | 'fill' | 'order' | 'match';

export interface ExamQuestion {
  id: string;                    // e.g. 'en-a2-grammar-001'
  lang: TargetLang;
  cefr: CEFR;
  skill: Skill;
  type: QuestionType;
  promptArz: string;             // Egyptian Arabic instruction / context
  promptEn?: string;             // optional gloss
  stem: string;                  // sentence with gap or reading text
  options: string[];             // options
  correctIndex: number;
  explanationArz: string;        // explanation in Egyptian Arabic
  audioText?: string;            // text for speech synthesis on listening questions
  tags?: string[];
}

export interface Badge {
  id: string;
  nameAr: string;
  descAr: string;
  emoji: string;
}

export interface AnswerRecord {
  question: ExamQuestion;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentMs?: number;
}

export interface ExamState {
  answered: AnswerRecord[];
  currentLevel: number; // 1=A1, 2=A2, 3=B1, 4=B2, 5=C1
  consecutiveCorrect: number;
  bestStreak: number;
  currentStreak: number;
  teaCups: number; // starts at 3
  xpGained: number;
  skillsCorrect: Set<Skill>;
  unlockedBadges: string[];
  isFinished: boolean;
  isPlacementMode: boolean;
  targetLang: TargetLang;
  supporterMode: boolean;
}

export interface ExamSessionResult {
  lang: TargetLang;
  estimatedCefr: CEFR;
  scorePercentage: number;
  totalQuestions: number;
  correctCount: number;
  xpEarned: number;
  bestStreak: number;
  unlockedBadges: string[];
  date: string; // ISO date string
}

export const STORAGE_KEYS = {
  XP: 'te_exam_xp',
  STREAK_BEST: 'te_exam_streak_best',
  BADGES: 'te_exam_badges',
  LAST_RESULT: 'te_exam_last_result',
  DAILY_DONE: 'te_exam_daily_done',
  SUPPORTER_MODE: 'te_exam_supporter_mode',
} as const;
