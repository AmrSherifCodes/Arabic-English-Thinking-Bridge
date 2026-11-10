export type ChunkRole = 'subject' | 'verb' | 'object' | 'connector' | 'modifier' | 'auxiliary';

export type SourceLanguage =
  | 'ar'
  | 'arz'
  | 'apc'
  | 'afb'
  | 'ary'
  | 'ar-EG'
  | 'ar-MA'
  | 'ar-SD'
  | 'ar-SA'
  | 'ar-SY'
  | 'ar-IQ'
  | 'ar-YE'
  | 'en'
  | 'de'
  | 'es'
  | 'ja'
  | 'fr'
  | 'zh'
  | 'hi'
  | 'ru'
  | 'pt'
  | 'it'
  | 'el'
  | 'tr';

export type TargetLanguage = 'ar' | 'en' | 'de' | 'ja' | 'es' | 'fr' | 'zh' | 'hi' | 'ru' | 'pt' | 'it' | 'el' | 'tr';

export interface LanguagePair {
  source: SourceLanguage;
  target: TargetLanguage;
}

export interface ChunkMapping {
  arabicText: string;
  englishText: string;
  sourceText?: string;
  targetText?: string;
  role: ChunkRole;
  explanation: string;
  explanationAr?: string;
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
  sourceThought?: string;
  targetSentence?: string;
  romajiTarget?: string;
  furiganaTarget?: string;
  acceptableAlternatives: string[];
  wordChips: string[];
  breakdownChunks: ChunkMapping[];
  habitHint: string;
  habitHintAr?: string;
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
  lapses?: number;
  lastReviewed?: number;
}

export interface CustomCard {
  id: string;
  ar: string;
  en: string;
  deckId?: string;
}

export type LearningGoal = 'academic' | 'travel' | 'business' | 'work' | 'general' | 'daily';
export type LearningStyle = 'visual' | 'audio' | 'text';
export type FocusArea = 'chemistry' | 'daily-speech' | 'business' | 'general' | string;

export interface UserProfile {
  name?: string;
  goal: LearningGoal;
  learningStyle?: LearningStyle;
  focusArea?: FocusArea;
  language: 'english' | 'arabic';
  dialect: 'egyptian' | 'msa';
  level:
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'zero' // 🌱 من تحت الصفر
    | 'kids' // 🎒 كي جي وابتدائي
    | 'middle' // 📘 إعدادي
    | 'high' // 🎓 ثانوي عام
    | 'career'; // 🚀 جامعة، شغل، وسفر
  sourceLanguage?: SourceLanguage;
  targetLanguage?: TargetLanguage;
  age?: number;
  isStudent?: boolean;
  computedStage?: string;
  highSchoolTrack?: string;
}

export interface UserProgress {
  completedExerciseIds: string[];
  completedLessonIds: string[];
  completedExerciseCount?: number;
  feedbackDismissed?: boolean;
  feedbackSubmitted?: boolean;
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
  todayWins?: number;
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
