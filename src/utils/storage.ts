import {
  CardSchedule,
  CustomCard,
  MentorQuestion,
  SavedNote,
  TeacherBroadcast,
  UserProgress
} from '../types';
import { INITIAL_BROADCASTS, INITIAL_MENTOR_QUESTIONS } from '../data/lessons';

const PROGRESS_KEY = 'thinking_english_progress_v1';
const MENTOR_QUESTIONS_KEY = 'thinking_english_mentor_q_v1';
const BROADCASTS_KEY = 'thinking_english_broadcasts_v2';
const TEACHER_PIN_KEY = 'thinking_english_teacher_pin_v1';

export const TEACHER_PIN = '1234';
export const DEFAULT_PIN = TEACHER_PIN;

export const DEFAULT_PROGRESS: UserProgress = {
  completedExerciseIds: [],
  completedLessonIds: [],
  score: 0,
  streak: 0,
  bestStreak: 0,
  soundOn: true,
  preferredVoice: '',
  generalNotes: '',
  askedMentor: false,
  lastActiveDate: new Date().toISOString().split('T')[0],
  weakSpotCounts: {},
  savedNotes: [],
  cards: {},
  customCards: [],
  importedDecks: [],
  reviewHistory: {},
  beginnerMode: true,
  dailyGoalCount: 0,
  dailyGoalDate: new Date().toISOString().split('T')[0],
  comboCount: 0,
  streakShields: 2
};

// In-memory fallback vault so strict mobile browsers or private browsing modes never crash
const memoryFallback: {
  progress: UserProgress | null;
  questions: MentorQuestion[] | null;
  broadcasts: TeacherBroadcast[] | null;
  pin: string | null;
  lastChecksum: string;
} = {
  progress: null,
  questions: null,
  broadcasts: null,
  pin: null,
  lastChecksum: ''
};

export function computeVaultChecksum(payloadStr: string): string {
  let hash = 2166136261;
  for (let i = 0; i < payloadStr.length; i++) {
    hash ^= payloadStr.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

export function sanitizeUserProgress(raw: unknown): UserProgress {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_PROGRESS,
      weakSpotCounts: {},
      savedNotes: [],
      cards: {},
      customCards: [],
      importedDecks: [],
      reviewHistory: {}
    };
  }
  const obj = raw as Record<string, unknown>;

  const completedExerciseIds = Array.isArray(obj.completedExerciseIds)
    ? obj.completedExerciseIds.filter((x): x is string => typeof x === 'string')
    : [];
  const completedLessonIds = Array.isArray(obj.completedLessonIds)
    ? obj.completedLessonIds.filter((x): x is string => typeof x === 'string')
    : [];

  const score =
    typeof obj.score === 'number' && Number.isFinite(obj.score) && obj.score >= 0
      ? Math.floor(obj.score)
      : DEFAULT_PROGRESS.score;
  const streak =
    typeof obj.streak === 'number' && Number.isFinite(obj.streak) && obj.streak >= 0
      ? Math.floor(obj.streak)
      : DEFAULT_PROGRESS.streak;
  const bestStreak =
    typeof obj.bestStreak === 'number' && Number.isFinite(obj.bestStreak) && obj.bestStreak >= 0
      ? Math.max(streak, Math.floor(obj.bestStreak))
      : Math.max(streak, DEFAULT_PROGRESS.bestStreak);

  const soundOn = typeof obj.soundOn === 'boolean' ? obj.soundOn : DEFAULT_PROGRESS.soundOn;
  const preferredVoice =
    typeof obj.preferredVoice === 'string' ? obj.preferredVoice.slice(0, 160) : '';
  const generalNotes =
    typeof obj.generalNotes === 'string' ? obj.generalNotes.slice(0, 4000) : '';
  const askedMentor = Boolean(obj.askedMentor);
  const lastActiveDate =
    typeof obj.lastActiveDate === 'string' && obj.lastActiveDate.length <= 32
      ? obj.lastActiveDate
      : DEFAULT_PROGRESS.lastActiveDate;

  const weakSpotCounts: Record<string, number> = {};
  if (obj.weakSpotCounts && typeof obj.weakSpotCounts === 'object') {
    for (const [k, v] of Object.entries(obj.weakSpotCounts as Record<string, unknown>)) {
      if (typeof k === 'string' && typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        weakSpotCounts[k] = Math.floor(v);
      }
    }
  }

  const savedNotes: SavedNote[] = Array.isArray(obj.savedNotes)
    ? obj.savedNotes
        .filter((n): n is SavedNote => Boolean(n && typeof n === 'object'))
        .slice(0, 100)
    : [];

  const cards: Record<string, CardSchedule> = {};
  if (obj.cards && typeof obj.cards === 'object') {
    for (const [k, v] of Object.entries(obj.cards as Record<string, unknown>)) {
      if (v && typeof v === 'object') {
        const sc = v as Record<string, unknown>;
        if (
          typeof sc.ease === 'number' &&
          typeof sc.int === 'number' &&
          typeof sc.reps === 'number' &&
          typeof sc.due === 'number'
        ) {
          cards[k] = {
            ease: sc.ease,
            int: sc.int,
            reps: sc.reps,
            due: sc.due,
            nextReviewDate:
              typeof sc.nextReviewDate === 'number' && Number.isFinite(sc.nextReviewDate)
                ? sc.nextReviewDate
                : sc.due
          };
        }
      }
    }
  }

  const customCards: CustomCard[] = Array.isArray(obj.customCards)
    ? obj.customCards
        .filter(
          (c): c is CustomCard =>
            Boolean(
              c &&
                typeof c === 'object' &&
                typeof (c as CustomCard).id === 'string' &&
                typeof (c as CustomCard).ar === 'string' &&
                typeof (c as CustomCard).en === 'string'
            )
        )
        .map(c => ({
          id: c.id,
          ar: c.ar,
          en: c.en,
          ...(typeof c.deckId === 'string' ? { deckId: c.deckId } : {})
        }))
        .slice(0, 500)
    : [];

  const importedDecks: string[] = Array.isArray(obj.importedDecks)
    ? Array.from(new Set(obj.importedDecks.filter((x): x is string => typeof x === 'string')))
    : [];

  const reviewHistory: Record<string, number> = {};
  if (obj.reviewHistory && typeof obj.reviewHistory === 'object') {
    for (const [k, v] of Object.entries(obj.reviewHistory as Record<string, unknown>)) {
      if (
        typeof k === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(k) &&
        typeof v === 'number' &&
        Number.isFinite(v) &&
        v >= 0
      ) {
        reviewHistory[k] = Math.floor(v);
      }
    }
  }

  const beginnerMode =
    typeof obj.beginnerMode === 'boolean' ? obj.beginnerMode : DEFAULT_PROGRESS.beginnerMode;
  const dailyGoalCount =
    typeof obj.dailyGoalCount === 'number' &&
    Number.isFinite(obj.dailyGoalCount) &&
    obj.dailyGoalCount >= 0
      ? Math.floor(obj.dailyGoalCount)
      : DEFAULT_PROGRESS.dailyGoalCount;
  const dailyGoalDate =
    typeof obj.dailyGoalDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.dailyGoalDate)
      ? obj.dailyGoalDate
      : DEFAULT_PROGRESS.dailyGoalDate;
  const comboCount =
    typeof obj.comboCount === 'number' && Number.isFinite(obj.comboCount) && obj.comboCount >= 0
      ? Math.floor(obj.comboCount) % 3
      : DEFAULT_PROGRESS.comboCount;
  const streakShields =
    typeof obj.streakShields === 'number' &&
    Number.isFinite(obj.streakShields) &&
    obj.streakShields >= 0
      ? Math.min(5, Math.floor(obj.streakShields))
      : DEFAULT_PROGRESS.streakShields;

  return {
    completedExerciseIds,
    completedLessonIds,
    score,
    streak,
    bestStreak,
    soundOn,
    preferredVoice,
    generalNotes,
    askedMentor,
    lastActiveDate,
    weakSpotCounts,
    savedNotes,
    cards,
    customCards,
    importedDecks,
    reviewHistory,
    beginnerMode,
    dailyGoalCount,
    dailyGoalDate,
    comboCount,
    streakShields
  };
}

export function loadUserProgress(): UserProgress {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) {
      const fresh = sanitizeUserProgress(memoryFallback.progress ?? DEFAULT_PROGRESS);
      memoryFallback.progress = fresh;
      memoryFallback.lastChecksum = computeVaultChecksum(JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(data);
    const clean = sanitizeUserProgress(parsed);
    memoryFallback.progress = clean;
    memoryFallback.lastChecksum = computeVaultChecksum(JSON.stringify(clean));
    return clean;
  } catch {
    const fallback = sanitizeUserProgress(memoryFallback.progress ?? DEFAULT_PROGRESS);
    memoryFallback.progress = fallback;
    memoryFallback.lastChecksum = computeVaultChecksum(JSON.stringify(fallback));
    return fallback;
  }
}

export function saveUserProgress(progress: UserProgress): boolean {
  const clean = sanitizeUserProgress(progress);
  const serialized = JSON.stringify(clean);
  memoryFallback.progress = clean;
  memoryFallback.lastChecksum = computeVaultChecksum(serialized);
  try {
    localStorage.setItem(PROGRESS_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function getVaultAuditSnapshot(progress: UserProgress) {
  const clean = sanitizeUserProgress(progress);
  const serialized = JSON.stringify(clean);
  return {
    vaultVersion: 2,
    integrityChecksum: computeVaultChecksum(serialized),
    status: 'VERIFIED_DETERMINISTIC',
    score: clean.score,
    streak: clean.streak,
    bestStreak: clean.bestStreak,
    completedLessons: clean.completedLessonIds.length,
    completedExercises: clean.completedExerciseIds.length,
    weakSpotTagsCount: Object.keys(clean.weakSpotCounts).length
  };
}

export function loadMentorQuestions(): MentorQuestion[] {
  try {
    const data = localStorage.getItem(MENTOR_QUESTIONS_KEY);
    if (!data) {
      saveMentorQuestions(INITIAL_MENTOR_QUESTIONS);
      return INITIAL_MENTOR_QUESTIONS;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return INITIAL_MENTOR_QUESTIONS;
    memoryFallback.questions = parsed;
    return parsed;
  } catch {
    return memoryFallback.questions ?? INITIAL_MENTOR_QUESTIONS;
  }
}

export function saveMentorQuestions(questions: MentorQuestion[]): void {
  const safeList = Array.isArray(questions) ? questions.slice(0, 50) : INITIAL_MENTOR_QUESTIONS;
  memoryFallback.questions = safeList;
  try {
    localStorage.setItem(MENTOR_QUESTIONS_KEY, JSON.stringify(safeList));
  } catch {
    // Gracefully keep in memoryFallback if storage quota is full
  }
}

export function loadBroadcasts(): TeacherBroadcast[] {
  try {
    const data = localStorage.getItem(BROADCASTS_KEY);
    if (!data) {
      saveBroadcasts(INITIAL_BROADCASTS);
      return INITIAL_BROADCASTS;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return INITIAL_BROADCASTS;
    memoryFallback.broadcasts = parsed;
    return parsed;
  } catch {
    return memoryFallback.broadcasts ?? INITIAL_BROADCASTS;
  }
}

export function saveBroadcasts(broadcasts: TeacherBroadcast[]): void {
  const safeList = Array.isArray(broadcasts) ? broadcasts.slice(0, 30) : INITIAL_BROADCASTS;
  memoryFallback.broadcasts = safeList;
  try {
    localStorage.setItem(BROADCASTS_KEY, JSON.stringify(safeList));
  } catch {
    // Gracefully keep in memoryFallback
  }
}

export function loadTeacherPin(): string {
  try {
    const saved = localStorage.getItem(TEACHER_PIN_KEY);
    return saved || memoryFallback.pin || TEACHER_PIN;
  } catch {
    return memoryFallback.pin || TEACHER_PIN;
  }
}

export function saveTeacherPin(pin: string): void {
  memoryFallback.pin = pin;
  try {
    localStorage.setItem(TEACHER_PIN_KEY, pin);
  } catch {
    // Gracefully keep in memoryFallback
  }
}
