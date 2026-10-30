export type ChunkRole = 'subject' | 'verb' | 'object' | 'connector' | 'modifier' | 'auxiliary';

export interface ChunkMapping {
  arabicText: string;
  englishText: string;
  role: ChunkRole;
  explanation: string;
}

export interface SpecificMisconception {
  pattern: string; // Regex string to test against user submission
  diagnosis: string; // Tailored Socratic explanation
}

export interface Exercise {
  id: string;
  arabicThought: string;
  arabicContext?: string;
  englishTarget: string;
  acceptableAlternatives: string[];
  wordChips: string[];
  breakdownChunks: ChunkMapping[];
  habitHint: string;
  specificMisconceptions?: SpecificMisconception[];
}

export interface Lesson {
  id: string;
  phaseId: 1 | 2 | 3;
  phaseTitle: string;
  phaseLevel: string;
  number: number;
  title: string;
  titleAr: string;
  transferConcept: string;
  transferConceptAr: string;
  weakSpotTag: string;
  exercises: Exercise[];
}

export interface Phase {
  id: 1 | 2 | 3;
  title: string;
  titleAr: string;
  level: string;
  tagline: string;
  lessons: Lesson[];
}

export interface SavedNote {
  id: string;
  lessonId: string;
  lessonTitle: string;
  note: string;
  createdAt: string;
}

export interface CardSchedule {
  ease: number;
  int: number;
  reps: number;
  due: number;
  nextReviewDate: number;
}

export interface CustomCard {
  id: string;
  ar: string;
  en: string;
  deckId?: string;
}

export interface UserProgress {
  completedExerciseIds: string[];
  completedLessonIds: string[];
  score: number;
  streak: number;
  bestStreak: number;
  soundOn: boolean;
  preferredVoice?: string;
  generalNotes?: string;
  askedMentor?: boolean;
  lastActiveDate: string;
  weakSpotCounts: Record<string, number>;
  savedNotes: SavedNote[];
  cards?: Record<string, CardSchedule>;
  customCards?: CustomCard[];
  importedDecks?: string[];
  reviewHistory?: Record<string, number>;
  beginnerMode?: boolean;
  dailyGoalCount?: number;
  dailyGoalDate?: string;
  comboCount?: number;
  streakShields?: number;
}

export interface MentorReply {
  id: string;
  author: string;
  replyText: string;
  createdAt: string;
}

export interface MentorQuestion {
  id: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  category: string;
  questionText: string;
  voiceAudioBase64?: string; // Stored as base64 data URI in LocalStorage
  voiceAudioDurationSec?: number;
  createdAt: string;
  replies: MentorReply[];
}

export interface TeacherBroadcast {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  targetHabit: string;
  date: string;
}
