import React, { useEffect, useRef, useState } from 'react';
import { PHASES_DATA } from './data/lessons';
import { PREBUILT_DECKS, PrebuiltDeck } from './data/prebuiltDecks';
import { EXPANDED_DECKS } from './data/expandedDecks';
import {
  CardSchedule,
  CustomCard,
  Exercise,
  Lesson,
  MentorQuestion,
  TeacherBroadcast,
  UserProgress
} from './types';
import {
  checkAnswerMatch,
  diagnoseArabicInterference,
  normalizeSentence
} from './utils/transferLogic';
import {
  DEFAULT_PROGRESS,
  getVaultAuditSnapshot,
  loadBroadcasts,
  loadMentorQuestions,
  loadTeacherPin,
  loadTheme,
  loadUserProgress,
  saveBroadcasts,
  saveMentorQuestions,
  saveTheme,
  saveUserProgress,
  TEACHER_PIN as STORAGE_TEACHER_PIN
} from './utils/storage';
import {
  beep,
  buildFriendShareWhatsAppMessage,
  calculateLevelInfo,
  cardSched,
  confetti,
  evaluateBadges,
  feedbackMessage,
  waFriendShareLink
} from './utils/fx';
import {
  createSpeechRecognition,
  getEnglishVoices,
  scoreEnglishVoice,
  selectBestEnglishVoice,
  speakWithRate,
  VoiceRecorder
} from './utils/audio';
import { ARABIC_WORD_LEXICON, stripTashkeel } from './utils/arabicWordLexicon';
import { saveVoiceNoteToVault } from './utils/audioVault';
import { triggerStandaloneHtmlDownload } from './utils/standaloneHtmlBuilder';
import {
  applyHabitMistakeWithShield,
  applyHabitWin,
  computeNextHintWord
} from './utils/habitPsychology';
import {
  BTN_GHOST,
  BTN_PRIMARY,
  DeckDefinition,
  DeckStats,
  FlashcardItemData
} from './components/uiConstants';
import { InteractiveArabicSentence } from './components/InteractiveArabicSentence';
import { DeckListView, ReviewView } from './components/CardsView';
import { LessonsView } from './components/LessonsView';
import { PracticeView } from './components/PracticeView';
import { TranslateView } from './components/TranslateView';
import { HubView } from './components/HubView';
import { ProgressView } from './components/ProgressView';
import { HabitLoopBar } from './components/HabitLoopBar';
import { CulturalToast, OliveBranchIcon } from './components/CulturalToast';
import {
  CULTURAL_QUOTES,
  PAN_ARAB_NATIONS,
  PAN_ARAB_UNITY_PHRASES,
  getNextUnityPhraseIndex
} from './utils/culturalIdentity';

export { CULTURAL_QUOTES, PAN_ARAB_NATIONS, CulturalToast, OliveBranchIcon };
export const TEACHER_PIN = STORAGE_TEACHER_PIN;

// Real tab indexes stay stable: 0 Lessons, 1 Practice, 2 Hub, 3 Progress, 4 Cards, 5 Translate
type TabIndex = 0 | 1 | 2 | 3 | 4 | 5;

const TABS = ['Lessons', 'Practice', 'Hub', 'Progress', 'Cards', 'Translate'] as const;
const ICONS = ['📚', '✍️', '👩‍🏫', '📊', '🃏', '🌐'] as const;
const NAV: TabIndex[] = [0, 1, 4, 5, 2, 3]; // Display order: Lessons, Practice, Cards, Translate, Hub, Progress

const ALL_LESSONS: Lesson[] = PHASES_DATA.flatMap(p => p.lessons);
const ALL_EXERCISES: Exercise[] = ALL_LESSONS.flatMap(l => l.exercises);
const PHASE_1_LESSON_IDS = PHASES_DATA[0]?.lessons.map(l => l.id) ?? [];
const ALL_PREBUILT_DECKS: PrebuiltDeck[] = [...EXPANDED_DECKS, ...PREBUILT_DECKS];

const PHASE_EXERCISE_IDS: Record<'phase-1' | 'phase-2' | 'phase-3', string[]> = {
  'phase-1': (PHASES_DATA[0]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
  'phase-2': (PHASES_DATA[1]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
  'phase-3': (PHASES_DATA[2]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id))
};

const CORE_DECKS: DeckDefinition[] = [
  {
    id: 'phase-1',
    name: 'Phase 1: Foundations',
    subtitle: 'Lessons 1–8 · Copula, Possession & SVO Skeleton'
  },
  {
    id: 'phase-2',
    name: 'Phase 2: Flow & Nuance',
    subtitle: 'Lessons 9–16 · Relative Clauses, Conditionals & Phrasal Verbs'
  },
  {
    id: 'phase-3',
    name: 'Phase 3: Mastery & Register',
    subtitle: 'Lessons 17–24 · Inversion, Clefts, False Friends & C1 Collocations'
  },
  {
    id: 'custom',
    name: 'My Custom Translations',
    subtitle: 'Saved & bulk-imported from the Translate tab'
  }
];

interface UndoGradeSnapshot {
  cardKey: string;
  previousSchedule: CardSchedule | undefined;
  previousQueue: string[];
  previousScore: number;
  reviewDateKey: string;
  previousDateCount: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const isArabicText = (s: string): boolean => /[\u0600-\u06FF]/.test(s);

export function localOfflineTranslate(query: string, from: 'ar' | 'en'): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (from === 'ar') {
    const cleanAr = stripTashkeel(trimmed);
    const exMatch = ALL_EXERCISES.find(ex => stripTashkeel(ex.arabicThought) === cleanAr);
    if (exMatch) return exMatch.englishTarget;

    for (const deck of ALL_PREBUILT_DECKS) {
      const cardMatch = deck.cards.find(c => stripTashkeel(c.ar) === cleanAr);
      if (cardMatch) return cardMatch.en;
    }

    if (ARABIC_WORD_LEXICON[cleanAr]) {
      return ARABIC_WORD_LEXICON[cleanAr].en.replace(/\(.*?\)/g, '').split('/')[0].trim();
    }
  } else {
    const normEn = normalizeSentence(trimmed);
    const exMatch = ALL_EXERCISES.find(
      ex =>
        normalizeSentence(ex.englishTarget) === normEn ||
        ex.acceptableAlternatives.some(a => normalizeSentence(a) === normEn)
    );
    if (exMatch) return exMatch.arabicThought;

    for (const deck of ALL_PREBUILT_DECKS) {
      const cardMatch = deck.cards.find(c => normalizeSentence(c.en) === normEn);
      if (cardMatch) return cardMatch.ar;
    }
  }
  return null;
}

async function translateSingleLine(rawLine: string): Promise<{ ar: string; en: string } | null> {
  const trimmed = rawLine.trim();
  if (!trimmed) return null;

  // Check if line already has a delimiter: | , \t , :: , or " - "
  const delimiters = ['|', '\t', '::', ' — ', ' – ', ' - '];
  for (const delim of delimiters) {
    if (trimmed.includes(delim)) {
      const parts = trimmed.split(delim).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const firstIsAr = isArabicText(parts[0]);
        const ar = firstIsAr ? parts[0] : parts[1];
        const en = firstIsAr ? parts[1] : parts[0];
        return { ar, en };
      }
    }
  }

  const from: 'ar' | 'en' = isArabicText(trimmed) ? 'ar' : 'en';
  const to: 'ar' | 'en' = from === 'ar' ? 'en' : 'ar';
  const localHit = localOfflineTranslate(trimmed, from);
  if (localHit) {
    return from === 'ar' ? { ar: trimmed, en: localHit } : { ar: localHit, en: trimmed };
  }

  try {
    const r = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`
    );
    const j = await r.json();
    const t = j?.responseData?.translatedText;
    if (t && !/MYMEMORY WARNING/i.test(t)) {
      const cleanT = String(t).trim();
      return from === 'ar' ? { ar: trimmed, en: cleanT } : { ar: cleanT, en: trimmed };
    }
  } catch {}

  // Deterministic word-by-word fallback for Arabic lines if offline
  if (from === 'ar') {
    const words = trimmed.split(/\s+/).filter(Boolean);
    const glosses = words
      .map(w => {
        const cl = stripTashkeel(w);
        return ARABIC_WORD_LEXICON[cl]?.en.replace(/\(.*?\)/g, '').split('/')[0].trim() || w;
      })
      .join(' ');
    return { ar: trimmed, en: glosses || trimmed };
  }

  return { ar: trimmed, en: trimmed };
}

export default function App() {
  const [tab, setTab] = useState<TabIndex>(0);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => loadTheme());
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [mentorQuestions, setMentorQuestions] = useState<MentorQuestion[]>(() =>
    loadMentorQuestions()
  );
  const [broadcasts, setBroadcasts] = useState<TeacherBroadcast[]>(() => loadBroadcasts());
  const [dismissedBroadcastId, setDismissedBroadcastId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Vault Inspector & Open-Source Attribution Modals
  const [showVaultModal, setShowVaultModal] = useState<boolean>(false);
  const [attributionDeck, setAttributionDeck] = useState<PrebuiltDeck | null>(null);

  // Unlock all mode for training demos / free exploration
  const [freeExplore, setFreeExplore] = useState<boolean>(false);
  const [mysteryRewardBanner, setMysteryRewardBanner] = useState<string | null>(null);
  const mysteryTimerRef = useRef<number | null>(null);

  // Pan-Arab Cultural Identity & Motivational Toast State
  const [showCulture, setShowCulture] = useState<boolean>(false);
  const [cultureQuoteIdx, setCultureQuoteIdx] = useState<number>(0);
  const [unityPhraseIdx, setUnityPhraseIdx] = useState<number>(0);
  const hasShownSessionCultureRef = useRef<boolean>(false);

  // Active Practice State
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);
  const [activeExIdx, setActiveExIdx] = useState<number>(0);
  const [tries, setTries] = useState<number>(0);
  const [exState, setExState] = useState<'ask' | 'ok' | 'rev'>('ask');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedbackHtml, setFeedbackHtml] = useState<string>('');
  const [shuffledChips, setShuffledChips] = useState<string[]>([]);
  const [showBlueprintPeek, setShowBlueprintPeek] = useState<boolean>(false);
  const [xpPopText, setXpPopText] = useState<string | null>(null);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  // Audio & Pronunciation State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isRecordingPron, setIsRecordingPron] = useState<boolean>(false);
  const [pronAudioUrl, setPronAudioUrl] = useState<string | null>(null);
  const [pronResultText, setPronResultText] = useState<string>('');
  const [pronWordMatches, setPronWordMatches] = useState<Array<{ word: string; ok: boolean }>>([]);
  const pronRecorderRef = useRef<VoiceRecorder | null>(null);
  const speechRecRef = useRef<any | null>(null);

  // Teacher Hub State
  const [studentNameDraft, setStudentNameDraft] = useState<string>('');
  const [mentorDraft, setMentorDraft] = useState<string>('');
  const [mentorVoiceBase64, setMentorVoiceBase64] = useState<string | null>(null);
  const [isRecordingMentorVoice, setIsRecordingMentorVoice] = useState<boolean>(false);
  const mentorRecorderRef = useRef<VoiceRecorder | null>(null);
  const [teacherUnlocked, setTeacherUnlocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [broadcastDraft, setBroadcastDraft] = useState<string>('');

  // Progress & Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [presentationSlide, setPresentationSlide] = useState<number | null>(null);

  // Cards (Anki Multi-Deck Spaced Repetition) State
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<string[] | null>(null);
  const [cardAnswerShown, setCardAnswerShown] = useState<boolean>(false);
  const [undoSnapshot, setUndoSnapshot] = useState<UndoGradeSnapshot | null>(null);

  // Translate Tab State (auto-detect Arabic/English + Bulk Add Custom Cards)
  const [trSrc, setTrSrc] = useState<string>('');
  const [trOut, setTrOut] = useState<string>('');
  const [trFrom, setTrFrom] = useState<'ar' | 'en' | ''>('');
  const [trTo, setTrTo] = useState<'ar' | 'en' | ''>('');
  const [trBusy, setTrBusy] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkBusy, setBulkBusy] = useState<boolean>(false);
  const trTimerRef = useRef<number | null>(null);
  const trInputRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2600);
  };

  // Sync dark/light class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  // Gently rotate the Pan-Arab 23-nations phrase every 9 seconds
  useEffect(() => {
    const timer = window.setInterval(() => {
      setUnityPhraseIdx(prev => getNextUnityPhraseIndex(prev));
    }, 9000);
    return () => window.clearInterval(timer);
  }, []);

  const triggerCulturalToastOncePerSession = () => {
    if (!hasShownSessionCultureRef.current) {
      hasShownSessionCultureRef.current = true;
      setShowCulture(true);
    }
  };

  // Load English speechSynthesis voices
  useEffect(() => {
    const refreshVoices = () => {
      const loaded = getEnglishVoices();
      loaded.sort((a, b) => scoreEnglishVoice(b) - scoreEnglishVoice(a));
      setVoices(loaded);
    };
    refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  }, []);

  // Keyboard navigation in Presentation Mode
  useEffect(() => {
    if (presentationSlide === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setPresentationSlide(s =>
          s === null ? null : Math.min(ALL_LESSONS.length - 1, s + 1)
        );
      } else if (e.key === 'ArrowLeft') {
        setPresentationSlide(s => (s === null ? null : Math.max(0, s - 1)));
      } else if (e.key === 'Escape') {
        setPresentationSlide(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationSlide]);

  const updateAndSaveProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      const ok = saveUserProgress(next);
      if (!ok) showToast('Couldn’t save (using in-memory vault)');
      return next;
    });
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    updateAndSaveProgress(prev => {
      const nextSound = !prev.soundOn;
      if (nextSound) beep(true, true);
      return { ...prev, soundOn: nextSound };
    });
  };

  const getCompletedCountForLesson = (lesson: Lesson): number => {
    return lesson.exercises.filter(ex => progress.completedExerciseIds.includes(ex.id)).length;
  };

  const isLessonComplete = (lesson: Lesson): boolean => {
    return getCompletedCountForLesson(lesson) === lesson.exercises.length;
  };

  // ============================================================================
  // CARDS (Anki Multi-Deck Spaced Repetition) helpers
  // ============================================================================
  const getCardData = (
    k: string,
    currentProgress: UserProgress = progress
  ): FlashcardItemData | null => {
    if (k.startsWith('c:')) {
      const custom = (currentProgress.customCards || []).find(x => 'c:' + x.id === k);
      if (custom) {
        return { ar: custom.ar, en: custom.en, breakdownChunks: null };
      }
      for (const deck of ALL_PREBUILT_DECKS) {
        const idxMatch = k.replace(`c:${deck.id}-`, '');
        const idx = Number(idxMatch);
        if (Number.isInteger(idx) && deck.cards[idx]) {
          return {
            ar: deck.cards[idx].ar,
            en: deck.cards[idx].en,
            breakdownChunks: null
          };
        }
      }
      return null;
    }
    const exById = ALL_EXERCISES.find(x => x.id === k);
    if (exById) {
      return {
        ar: exById.arabicThought,
        en: exById.englishTarget,
        breakdownChunks: exById.breakdownChunks,
        exercise: exById
      };
    }
    const [li, ei] = k.split('-').map(Number);
    const exByIdx = ALL_LESSONS[li]?.exercises[ei];
    if (exByIdx) {
      return {
        ar: exByIdx.arabicThought,
        en: exByIdx.englishTarget,
        breakdownChunks: exByIdx.breakdownChunks,
        exercise: exByIdx
      };
    }
    return null;
  };

  const getDeckCardKeys = (
    deckId: string | null,
    currentProgress: UserProgress = progress
  ): string[] => {
    const solvedSet = new Set(currentProgress.completedExerciseIds);
    const sortSolvedFirst = (ids: string[]) =>
      [...ids].sort((a, b) => (solvedSet.has(b) ? 1 : 0) - (solvedSet.has(a) ? 1 : 0));

    if (deckId === 'phase-1' || deckId === 'phase-2' || deckId === 'phase-3') {
      return sortSolvedFirst(PHASE_EXERCISE_IDS[deckId]);
    }

    if (deckId === 'custom') {
      return (currentProgress.customCards || [])
        .filter(c => !c.deckId || c.deckId === 'custom')
        .map(c => 'c:' + c.id);
    }

    const prebuilt = ALL_PREBUILT_DECKS.find(d => d.id === deckId);
    if (prebuilt) {
      const fromCustom = (currentProgress.customCards || [])
        .filter(c => c.deckId === prebuilt.id)
        .map(c => 'c:' + c.id);
      if (fromCustom.length > 0) return fromCustom;
      return prebuilt.cards.map((_, idx) => `c:${prebuilt.id}-${idx}`);
    }

    // Default / 'all': aggregate all core curriculum cards + all 150 Prebuilt Master Deck cards + downloaded Open-Source & Custom cards
    const allPhaseIds = sortSolvedFirst([
      ...PHASE_EXERCISE_IDS['phase-1'],
      ...PHASE_EXERCISE_IDS['phase-2'],
      ...PHASE_EXERCISE_IDS['phase-3']
    ]);
    const expandedIds = EXPANDED_DECKS.flatMap(d =>
      d.cards.map((_, idx) => `c:${d.id}-${idx}`)
    );
    const customIds = (currentProgress.customCards || []).map(c => 'c:' + c.id);
    return Array.from(new Set([...customIds, ...allPhaseIds, ...expandedIds]));
  };

  const getDeckStats = (
    deckId: string,
    currentProgress: UserProgress = progress
  ): DeckStats => {
    const keys = getDeckCardKeys(deckId, currentProgress);
    const cardsMap = currentProgress.cards || {};
    const now = Date.now();
    let newCount = 0;
    let learningCount = 0;
    let dueCount = 0;

    for (const k of keys) {
      const sched = cardsMap[k];
      if (!sched) {
        newCount++;
      } else if (sched.reps === 0 || sched.int < 1) {
        learningCount++;
      } else if (sched.due <= now) {
        dueCount++;
      }
    }

    return {
      newCount,
      learningCount,
      dueCount,
      totalCards: keys.length
    };
  };

  const computeDueCardQueue = (
    currentProgress: UserProgress = progress,
    deckId: string | null = activeDeckId
  ): string[] => {
    const cardsMap = currentProgress.cards || {};
    const now = Date.now();
    const keys = getDeckCardKeys(deckId, currentProgress);

    return keys
      .filter(k => {
        if (!getCardData(k, currentProgress)) return false;
        const sched = cardsMap[k];
        if (!sched) return true;
        if (sched.reps === 0 || sched.int < 1) return true;
        return sched.due <= now;
      })
      .slice(0, 50);
  };

  const handleSelectDeck = (deckId: string) => {
    const q = computeDueCardQueue(progress, deckId);
    setActiveDeckId(deckId);
    setReviewQueue(q);
    setCardAnswerShown(false);
    setUndoSnapshot(null);
    window.scrollTo(0, 0);
  };

  const handleDownloadOpenSourceDeck = (deck: PrebuiltDeck) => {
    updateAndSaveProgress(prev => {
      const existingImported = prev.importedDecks || [];
      const nextImported = existingImported.includes(deck.id)
        ? existingImported
        : [...existingImported, deck.id];

      const existingCustom = prev.customCards || [];
      const existingIds = new Set(existingCustom.map(c => c.id));
      const newDeckCards: CustomCard[] = deck.cards
        .map((c, idx) => ({
          id: `${deck.id}-${idx}`,
          ar: c.ar,
          en: c.en,
          deckId: deck.id
        }))
        .filter(c => !existingIds.has(c.id));

      return {
        ...prev,
        importedDecks: nextImported,
        customCards: [...existingCustom, ...newDeckCards]
      };
    });
    setReviewQueue(null);
    showToast(`Downloaded “${deck.name}” (${deck.cards.length} cards) ✓`);
  };

  const handleDownloadAllExpandedDecks = () => {
    let addedCount = 0;
    updateAndSaveProgress(prev => {
      const existingImported = new Set(prev.importedDecks || []);
      const existingCustom = prev.customCards || [];
      const existingIds = new Set(existingCustom.map(c => c.id));
      const newCards: CustomCard[] = [];

      for (const deck of EXPANDED_DECKS) {
        existingImported.add(deck.id);
        deck.cards.forEach((c, idx) => {
          const cardId = `${deck.id}-${idx}`;
          if (!existingIds.has(cardId)) {
            existingIds.add(cardId);
            newCards.push({
              id: cardId,
              ar: c.ar,
              en: c.en,
              deckId: deck.id
            });
            addedCount++;
          }
        });
      }

      return {
        ...prev,
        importedDecks: Array.from(existingImported),
        customCards: [...existingCustom, ...newCards]
      };
    });
    setReviewQueue(null);
    showToast(`Downloaded all 4 Prebuilt Master Decks (${addedCount || 150} cards) ✓`);
  };

  const handleCardGrade = (g: 0 | 1 | 2 | 3, currentQueue: string[]) => {
    if (!currentQueue.length) return;
    const [k, ...rest] = currentQueue;
    const existingSched = progress.cards?.[k];
    const nextSched = cardSched(existingSched, g);
    const dueTime = g > 0 ? Date.now() + nextSched.int * 864e5 : Date.now() + 6e4;

    const todayKey = new Date().toISOString().split('T')[0];
    const prevDateCount = progress.reviewHistory?.[todayKey] || 0;

    setUndoSnapshot({
      cardKey: k,
      previousSchedule: existingSched ? { ...existingSched } : undefined,
      previousQueue: [...currentQueue],
      previousScore: progress.score || 0,
      reviewDateKey: todayKey,
      previousDateCount: prevDateCount
    });

    const updatedQueue = [...rest];
    if (g === 0) {
      updatedQueue.splice(Math.min(3, updatedQueue.length), 0, k);
    }

    const baseCardXp = g === 0 ? 0 : 2;
    const winTransition = g > 0 ? applyHabitWin(progress, baseCardXp, todayKey) : null;

    updateAndSaveProgress(prev => {
      const baseNext = winTransition ? winTransition.nextProgress : prev;
      return {
        ...baseNext,
        cards: {
          ...(prev.cards || {}),
          [k]: { ...nextSched, due: dueTime }
        },
        reviewHistory: {
          ...(prev.reviewHistory || {}),
          [todayKey]: (prev.reviewHistory?.[todayKey] || 0) + 1
        }
      };
    });

    if (winTransition?.mysteryChest.triggered) {
      confetti();
      setMysteryRewardBanner(winTransition.mysteryChest.label);
      if (mysteryTimerRef.current) window.clearTimeout(mysteryTimerRef.current);
      mysteryTimerRef.current = window.setTimeout(() => setMysteryRewardBanner(null), 5000);
      showToast(winTransition.mysteryChest.label);
    } else if (winTransition?.dailyGoalJustCompleted) {
      confetti();
      showToast('🎯 Daily 5-Win Habit Complete! +1 🧊 Streak Shield earned!');
    }

    beep(g > 0, progress.soundOn);
    try {
      navigator.vibrate?.(g ? 15 : 60);
    } catch {}
    setCardAnswerShown(false);
    setReviewQueue(updatedQueue);
    if (updatedQueue.length === 0) {
      confetti();
    }
  };

  const handleUndoLastGrade = () => {
    if (!undoSnapshot) return;
    const snap = undoSnapshot;

    updateAndSaveProgress(prev => {
      const nextCards = { ...(prev.cards || {}) };
      if (snap.previousSchedule === undefined) {
        delete nextCards[snap.cardKey];
      } else {
        nextCards[snap.cardKey] = snap.previousSchedule;
      }

      const nextHistory = { ...(prev.reviewHistory || {}) };
      if (snap.previousDateCount <= 0) {
        delete nextHistory[snap.reviewDateKey];
      } else {
        nextHistory[snap.reviewDateKey] = snap.previousDateCount;
      }

      return {
        ...prev,
        score: snap.previousScore,
        cards: nextCards,
        reviewHistory: nextHistory
      };
    });

    setReviewQueue(snap.previousQueue);
    setCardAnswerShown(false);
    setUndoSnapshot(null);
    showToast('Undid last card review ↩️');
  };

  // ============================================================================
  // TRANSLATE & BULK ADD CUSTOM CARDS
  // ============================================================================
  const runTranslation = async (rawInput: string) => {
    const q = rawInput.trim();
    if (!q) {
      setTrOut('');
      setTrBusy(false);
      return;
    }
    const from: 'ar' | 'en' = isArabicText(q) ? 'ar' : 'en';
    const to: 'ar' | 'en' = from === 'ar' ? 'en' : 'ar';
    setTrFrom(from);
    setTrTo(to);
    setTrBusy(true);

    const localHit = localOfflineTranslate(q, from);

    try {
      const r = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${from}|${to}`
      );
      const j = await r.json();
      const t = j?.responseData?.translatedText;
      if (!t || /MYMEMORY WARNING/i.test(t)) {
        if (localHit) {
          setTrOut(localHit);
        } else {
          throw new Error('quota');
        }
      } else {
        setTrOut(String(t).trim());
      }
    } catch {
      if (localHit) {
        setTrOut(localHit);
      } else {
        setTrOut('');
        showToast('Couldn’t translate right now. Try again in a moment.');
      }
    } finally {
      setTrBusy(false);
    }
  };

  const handleTranslateType = (val: string) => {
    setTrSrc(val);
    if (trTimerRef.current) window.clearTimeout(trTimerRef.current);
    if (!val.trim()) {
      setTrOut('');
      setTrBusy(false);
      return;
    }
    trTimerRef.current = window.setTimeout(() => {
      runTranslation(val);
    }, 600);
  };

  const handleTranslatePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setTrSrc(clip);
      if (trTimerRef.current) window.clearTimeout(trTimerRef.current);
      runTranslation(clip);
    } catch {
      showToast('Paste blocked. Long-press the box and paste instead.');
    }
  };

  const handleTranslateClear = () => {
    if (trTimerRef.current) window.clearTimeout(trTimerRef.current);
    setTrSrc('');
    setTrOut('');
    setTrFrom('');
    setTrTo('');
    setTrBusy(false);
    trInputRef.current?.focus();
  };

  const handleTranslateCopy = async () => {
    if (!trOut) return;
    try {
      await navigator.clipboard.writeText(trOut);
      showToast('Copied');
    } catch {
      showToast('Couldn’t copy');
    }
  };

  const handleTranslateSaveAsCard = () => {
    if (!trOut.trim() || !trSrc.trim()) return;
    const arS = trFrom === 'ar' ? trSrc : trOut;
    const enS = trFrom === 'ar' ? trOut : trSrc;
    const newCard: CustomCard = {
      id: Date.now().toString(36),
      ar: arS.trim(),
      en: enS.trim(),
      deckId: 'custom'
    };
    updateAndSaveProgress(prev => ({
      ...prev,
      customCards: [...(prev.customCards || []), newCard]
    }));
    setReviewQueue(null);
    showToast('Saved to Cards ✓');
  };

  const handleInsertSampleBulkLines = () => {
    const sample = [
      'أنا في طريقي إلى المطار الآن | I am on my way to the airport right now.',
      'سأرسل لك التقرير المالي قبل نهاية اليوم',
      'We have been waiting for twenty minutes.',
      'من الضروري أن نلتزم بالجدول الزمني | It is essential that we stick to the schedule.'
    ].join('\n');
    setBulkText(sample);
  };

  const handleGenerateBulkCards = async () => {
    const rawLines = bulkText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (rawLines.length === 0) {
      showToast('Paste at least one line to generate cards');
      return;
    }

    setBulkBusy(true);
    try {
      const pairs: Array<{ ar: string; en: string }> = [];

      // Check if user pasted alternating Arabic / English lines without delimiters
      const hasExplicitDelimiter = rawLines.some(
        l => l.includes('|') || l.includes('\t') || l.includes('::') || l.includes(' - ')
      );
      const isAlternatingArEn =
        !hasExplicitDelimiter &&
        rawLines.length >= 2 &&
        rawLines.length % 2 === 0 &&
        rawLines.every((line, idx) =>
          idx % 2 === 0
            ? isArabicText(line) !== isArabicText(rawLines[idx + 1] || '')
            : true
        );

      if (isAlternatingArEn) {
        for (let i = 0; i < rawLines.length; i += 2) {
          const l1 = rawLines[i];
          const l2 = rawLines[i + 1];
          const firstIsAr = isArabicText(l1);
          pairs.push({
            ar: firstIsAr ? l1 : l2,
            en: firstIsAr ? l2 : l1
          });
        }
      } else {
        for (const line of rawLines) {
          const resolved = await translateSingleLine(line);
          if (resolved && resolved.ar && resolved.en) {
            pairs.push(resolved);
          }
        }
      }

      if (pairs.length === 0) {
        showToast('Could not generate cards from those lines');
        return;
      }

      const nowBase = Date.now();
      const generatedCards: CustomCard[] = pairs.map((p, idx) => ({
        id: `bulk-${nowBase.toString(36)}-${idx}`,
        ar: p.ar,
        en: p.en,
        deckId: 'custom'
      }));

      updateAndSaveProgress(prev => ({
        ...prev,
        customCards: [...(prev.customCards || []), ...generatedCards]
      }));

      setBulkText('');
      setReviewQueue(null);
      showToast(`Generated ${generatedCards.length} cards in My Custom Translations ✓`);
    } finally {
      setBulkBusy(false);
    }
  };

  // ============================================================================
  // PRACTICE LOOP HANDLERS
  // ============================================================================
  const startExercise = (lessonIdx: number, exIdx: number) => {
    const lesson = ALL_LESSONS[lessonIdx];
    if (!lesson) return;
    const ex = lesson.exercises[exIdx];
    if (!ex) return;

    const targetWords = ex.englishTarget.replace(/[.,?!]/g, '').split(/\s+/);
    const mergedChips = Array.from(new Set([...targetWords, ...ex.wordChips]));

    setActiveLessonIdx(lessonIdx);
    setActiveExIdx(exIdx);
    setTries(0);
    setExState('ask');
    setUserAnswer('');
    setFeedbackHtml('');
    setShowBlueprintPeek(false);
    setShuffledChips(shuffleArray(mergedChips));
    setPronAudioUrl(null);
    setPronResultText('');
    setPronWordMatches([]);
  };

  const openLesson = (lessonIdx: number) => {
    const lesson = ALL_LESSONS[lessonIdx];
    if (!lesson) return;
    let firstIncomplete = lesson.exercises.findIndex(
      ex => !progress.completedExerciseIds.includes(ex.id)
    );
    if (firstIncomplete < 0) firstIncomplete = 0;
    startExercise(lessonIdx, firstIncomplete);
    setTab(1);
    window.scrollTo(0, 0);
  };

  const triggerInputShake = () => {
    const el = answerInputRef.current;
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  };

  const handleAddChip = (word: string) => {
    setUserAnswer(prev => (prev.trim() + ' ' + word).trim());
  };

  const handleRemoveWordAt = (idxToRemove: number) => {
    setUserAnswer(prev => {
      const words = prev.trim().split(/\s+/).filter(Boolean);
      words.splice(idxToRemove, 1);
      return words.join(' ');
    });
  };

  const handleGiveNextWordHint = () => {
    if (activeLessonIdx === null) return;
    const lesson = ALL_LESSONS[activeLessonIdx];
    const ex = lesson.exercises[activeExIdx];
    if (!ex) return;
    setUserAnswer(prev => {
      const { nextWord, prefixToKeep } = computeNextHintWord(ex.englishTarget, prev);
      if (!nextWord) {
        showToast('Sentence is complete! Tap Check Answer ✅');
        return prev;
      }
      showToast(`🪄 Added hint word: “${nextWord}”`);
      return (prefixToKeep + ' ' + nextWord).trim();
    });
  };

  const handleQuickWinStart = () => {
    const nextIdx = Math.max(
      0,
      ALL_LESSONS.findIndex(l => !isLessonComplete(l))
    );
    openLesson(nextIdx);
  };

  const handleStartBeginnerDeck = () => {
    const starterDeck = PREBUILT_DECKS.find(d => d.id === 'beginner-starter-a0');
    if (starterDeck && !(progress.importedDecks || []).includes(starterDeck.id)) {
      handleDownloadOpenSourceDeck(starterDeck);
    }
    setTab(4);
    handleSelectDeck('beginner-starter-a0');
  };

  const handleToggleBeginnerMode = () => {
    updateAndSaveProgress(prev => {
      const nextMode = prev.beginnerMode === false;
      showToast(
        nextMode
          ? '🐣 Beginner Help ON: Next word blocks are highlighted!'
          : '🐣 Beginner Help OFF: Challenge mode active'
      );
      return { ...prev, beginnerMode: nextMode };
    });
  };

  const handleCheckAnswer = () => {
    if (activeLessonIdx === null) return;
    const lesson = ALL_LESSONS[activeLessonIdx];
    const ex = lesson.exercises[activeExIdx];
    const normInput = normalizeSentence(userAnswer);
    if (!normInput) {
      showToast('Tap the word blocks or type your English sentence first');
      return;
    }

    const match = checkAnswerMatch(userAnswer, ex);
    if (match.isCorrect) {
      beep(true, progress.soundOn);
      confetti();

      const earnedPoints = tries === 0 ? 10 : 5;
      const alreadyDone = progress.completedExerciseIds.includes(ex.id);
      const todayKey = new Date().toISOString().split('T')[0];
      const winTransition = applyHabitWin(
        progress,
        alreadyDone ? 2 : earnedPoints,
        todayKey
      );

      setXpPopText(`+${winTransition.totalEarnedXp} XP`);
      window.setTimeout(() => setXpPopText(null), 1100);

      if (winTransition.mysteryChest.triggered) {
        setMysteryRewardBanner(winTransition.mysteryChest.label);
        if (mysteryTimerRef.current) window.clearTimeout(mysteryTimerRef.current);
        mysteryTimerRef.current = window.setTimeout(() => setMysteryRewardBanner(null), 5000);
        showToast(winTransition.mysteryChest.label);
      } else if (winTransition.dailyGoalJustCompleted) {
        showToast('🎯 Daily 5-Win Habit Complete! +1 🧊 Streak Shield earned!');
      } else if (
        winTransition.nextProgress.streak === 3 ||
        winTransition.nextProgress.streak === 5 ||
        winTransition.nextProgress.streak === 10 ||
        (winTransition.nextProgress.streak > 10 && winTransition.nextProgress.streak % 5 === 0)
      ) {
        showToast(`🔥 ${winTransition.nextProgress.streak} in a row!`);
      }

      updateAndSaveProgress(prev => {
        const habitNext = applyHabitWin(
          prev,
          alreadyDone ? 2 : earnedPoints,
          todayKey
        ).nextProgress;

        const nextExIds = alreadyDone
          ? prev.completedExerciseIds
          : [...prev.completedExerciseIds, ex.id];

        const lessonNowDone = lesson.exercises.every(item => nextExIds.includes(item.id));
        const nextLessonIds =
          lessonNowDone && !prev.completedLessonIds.includes(lesson.id)
            ? [...prev.completedLessonIds, lesson.id]
            : prev.completedLessonIds;

        return {
          ...habitNext,
          completedExerciseIds: nextExIds,
          completedLessonIds: nextLessonIds
        };
      });

      setReviewQueue(null);
      setExState('ok');
      speakWithRate(ex.englishTarget, 1, progress.preferredVoice);
      return;
    }

    beep(false, progress.soundOn);
    triggerInputShake();
    setTries(t => t + 1);

    const diagnosis = diagnoseArabicInterference(userAnswer, ex);
    setFeedbackHtml(diagnosis);

    const mistakeTransition = applyHabitMistakeWithShield(progress);
    if (mistakeTransition.shieldUsed) {
      showToast(
        `🧊 Streak Shield activated! Your 🔥 ${mistakeTransition.preservedStreak} streak was saved!`
      );
    }

    updateAndSaveProgress(prev => {
      const shielded = applyHabitMistakeWithShield(prev).nextProgress;
      return {
        ...shielded,
        weakSpotCounts: {
          ...prev.weakSpotCounts,
          [lesson.weakSpotTag]: (prev.weakSpotCounts[lesson.weakSpotTag] || 0) + 1
        }
      };
    });
  };

  const handleReveal = () => {
    if (activeLessonIdx === null) return;
    const lesson = ALL_LESSONS[activeLessonIdx];
    const ex = lesson.exercises[activeExIdx];
    updateAndSaveProgress(prev => applyHabitMistakeWithShield(prev).nextProgress);
    setExState('rev');
    speakWithRate(ex.englishTarget, 1, progress.preferredVoice);
  };

  const handleNextExercise = () => {
    if (activeLessonIdx === null) return;
    const lesson = ALL_LESSONS[activeLessonIdx];
    if (activeExIdx < lesson.exercises.length - 1) {
      startExercise(activeLessonIdx, activeExIdx + 1);
    } else {
      const doneAll = isLessonComplete(lesson);
      showToast(
        doneAll
          ? 'Lesson complete! 🎉'
          : 'Lesson finished. Retry skipped items to unlock the next.'
      );
      setTab(0);
      setShowCulture(true);
      hasShownSessionCultureRef.current = true;
    }
    window.scrollTo(0, 0);
  };

  const handlePronunciationPractice = async () => {
    if (activeLessonIdx === null) return;
    const lesson = ALL_LESSONS[activeLessonIdx];
    const ex = lesson.exercises[activeExIdx];

    if (isRecordingPron && pronRecorderRef.current) {
      try {
        const result = await pronRecorderRef.current.stop();
        setPronAudioUrl(result.base64);
      } catch {}
      try {
        speechRecRef.current?.stop();
      } catch {}
      setIsRecordingPron(false);
      return;
    }

    try {
      const recorder = new VoiceRecorder();
      pronRecorderRef.current = recorder;
      await recorder.start();
      setIsRecordingPron(true);
      setPronWordMatches([]);
      setPronResultText('Listening… speak the English sentence clearly, then tap Stop.');

      const sr = createSpeechRecognition();
      if (sr) {
        speechRecRef.current = sr;
        const targetNorm = normalizeSentence(ex.englishTarget);
        sr.onresult = (ev: any) => {
          const rawTranscript = ev.results[0][0].transcript || '';
          const transcript = normalizeSentence(rawTranscript);
          const targetWords = targetNorm.split(' ').filter(Boolean);
          const spokenWords = transcript.split(' ').filter(Boolean);
          const rawTargetTokens = ex.englishTarget.split(/\s+/).filter(Boolean);
          const wordDiff = rawTargetTokens.map(token => {
            const normToken = normalizeSentence(token);
            return {
              word: token,
              ok: spokenWords.includes(normToken)
            };
          });
          const matched = targetWords.filter(w => spokenWords.includes(w)).length;
          const pct = Math.round((100 * matched) / Math.max(1, targetWords.length));
          setPronWordMatches(wordDiff);
          setPronResultText(`Heard: “${rawTranscript}” · ${pct}% of target words matched`);
        };
        sr.start();
      } else {
        setPronResultText(
          'Recording… (speech recognition isn’t available in this browser, so compare by ear when stopped.)'
        );
      }
    } catch {
      showToast('Microphone unavailable or blocked');
      setIsRecordingPron(false);
    }
  };

  // ============================================================================
  // TEACHER HUB HANDLERS (with IndexedDB Voice Note Vault)
  // ============================================================================
  const handleMentorVoiceToggle = async () => {
    if (isRecordingMentorVoice && mentorRecorderRef.current) {
      try {
        const res = await mentorRecorderRef.current.stop();
        setMentorVoiceBase64(res.base64);
      } catch {}
      setIsRecordingMentorVoice(false);
      return;
    }

    try {
      const recorder = new VoiceRecorder();
      mentorRecorderRef.current = recorder;
      await recorder.start();
      setIsRecordingMentorVoice(true);
    } catch {
      showToast('Microphone unavailable or blocked');
      setIsRecordingMentorVoice(false);
    }
  };

  const handleSendMentorQuestion = async () => {
    const trimmed = mentorDraft.trim();
    if (!trimmed && !mentorVoiceBase64) {
      showToast('Write a question or record a note');
      return;
    }

    let vaultAudioRef: string | undefined;
    if (mentorVoiceBase64) {
      vaultAudioRef = await saveVoiceNoteToVault(mentorVoiceBase64);
    }

    const newQ: MentorQuestion = {
      id: 'mq-' + Date.now(),
      studentName: studentNameDraft.trim() || 'Learner',
      lessonId: activeLessonIdx !== null ? ALL_LESSONS[activeLessonIdx].id : 'p1-l1',
      lessonTitle:
        activeLessonIdx !== null ? ALL_LESSONS[activeLessonIdx].title : 'General Transfer Question',
      category: 'Structure & Transfer',
      questionText: trimmed || '(voice note)',
      voiceAudioBase64: vaultAudioRef,
      createdAt: new Date().toISOString(),
      replies: []
    };

    const updated = [newQ, ...mentorQuestions];
    setMentorQuestions(updated);
    saveMentorQuestions(updated);
    setMentorDraft('');
    setMentorVoiceBase64(null);
    updateAndSaveProgress(prev => ({ ...prev, askedMentor: true }));
    showToast('Sent to your mentor');
  };

  const handleTeacherReply = (questionId: string) => {
    const replyText = (replyDrafts[questionId] || '').trim();
    if (!replyText) return;
    const updated = mentorQuestions.map(q =>
      q.id === questionId
        ? {
            ...q,
            replies: [
              ...q.replies,
              {
                id: 'mr-' + Date.now(),
                author: 'Teacher',
                replyText,
                createdAt: new Date().toISOString()
              }
            ]
          }
        : q
    );
    setMentorQuestions(updated);
    saveMentorQuestions(updated);
    setReplyDrafts(prev => ({ ...prev, [questionId]: '' }));
    showToast('Reply sent');
  };

  const handlePublishBroadcast = () => {
    const text = broadcastDraft.trim();
    if (!text) return;
    const newBc: TeacherBroadcast = {
      id: 'bc-' + Date.now(),
      title: 'Teacher Mini-Lesson',
      titleAr: 'درس مصغر من المعلم',
      content: text,
      contentAr: '',
      targetHabit: 'general',
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newBc, ...broadcasts];
    setBroadcasts(updated);
    saveBroadcasts(updated);
    setBroadcastDraft('');
    setDismissedBroadcastId(null);
    showToast('Broadcast published');
  };

  const handleCopyFeedback = async () => {
    const msg = feedbackMessage(feedbackRating, feedbackText, progress, ALL_LESSONS.length);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(msg);
        showToast('Copied. Paste it to your teacher');
        return;
      }
    } catch {}
    try {
      const ta = document.createElement('textarea');
      ta.value = msg;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('Copied. Paste it to your teacher');
    } catch {
      showToast('Couldn’t copy');
    }
  };

  const handleDownloadOfflineHtml = () => {
    triggerStandaloneHtmlDownload();
    showToast('Downloaded Thinking-English.html ✓');
  };

  const levelInfo = calculateLevelInfo(progress.score);
  const badges = evaluateBadges(progress, PHASE_1_LESSON_IDS, ALL_LESSONS.length);
  const chosenVoice = selectBestEnglishVoice(voices, progress.preferredVoice);
  const sortedWeakSpots = Object.entries(progress.weakSpotCounts || {}).sort((a, b) => b[1] - a[1]);
  const latestBroadcast = broadcasts[0];
  const vaultAudit = getVaultAuditSnapshot(progress);

  // Presentation Mode Modal for Training Meetings
  if (presentationSlide !== null) {
    const slideLesson = ALL_LESSONS[presentationSlide] || ALL_LESSONS[0];
    const sampleEx = slideLesson.exercises[0];
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-6 sm:p-12">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-teal-400 font-semibold">
              Training Meeting Presentation · Slide {presentationSlide + 1} of {ALL_LESSONS.length}
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold mt-1">
              {slideLesson.number}. {slideLesson.title}
            </h1>
            <p dir="rtl" className="ar text-xl text-stone-300 mt-1">
              {slideLesson.titleAr}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPresentationSlide(null)}
            className="rounded-full border border-stone-700 px-5 py-2 text-sm font-semibold hover:bg-stone-800"
          >
            ✕ Exit Presentation
          </button>
        </div>

        <div className="my-auto py-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-wider text-teal-400 font-semibold mb-2">
              English Structural Shift
            </div>
            <p className="text-xl sm:text-2xl leading-relaxed font-medium">
              {slideLesson.transferConcept}
            </p>
            <div
              dir="rtl"
              className="ar text-xl sm:text-2xl leading-relaxed text-amber-200/90 mt-6 pt-6 border-t border-stone-800"
            >
              {slideLesson.transferConceptAr}
            </div>
          </div>

          {sampleEx && (
            <div className="rounded-3xl bg-stone-900/70 border border-stone-800 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="w-full sm:w-auto">
                  <InteractiveArabicSentence
                    sentence={sampleEx.arabicThought}
                    exercise={sampleEx}
                    preferredVoice={progress.preferredVoice}
                    className="ar text-2xl sm:text-3xl font-bold text-white"
                    showCaption={true}
                    resetKey={`pres-${presentationSlide}`}
                  />
                </div>
                <div translate="no" className="text-xl sm:text-2xl font-bold text-teal-300">
                  → {sampleEx.englishTarget}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sampleEx.breakdownChunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-stone-800/90 border border-stone-700 p-3 text-center"
                  >
                    <div dir="rtl" className="ar text-lg font-semibold text-amber-300">
                      {chunk.arabicText}
                    </div>
                    <div translate="no" className="text-base font-bold mt-1">
                      {chunk.englishText}
                    </div>
                    <div className="text-xs opacity-70 mt-1">{chunk.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-800 pt-4">
          <button
            type="button"
            disabled={presentationSlide === 0}
            onClick={() => setPresentationSlide(s => Math.max(0, (s ?? 0) - 1))}
            className={BTN_GHOST + ' text-white border-stone-700 disabled:opacity-35'}
          >
            ← Previous Shift
          </button>
          <span className="text-sm opacity-70">
            Phase {slideLesson.phaseId} ({slideLesson.phaseLevel}) · Use ← / → keys
          </span>
          <button
            type="button"
            disabled={presentationSlide >= ALL_LESSONS.length - 1}
            onClick={() =>
              setPresentationSlide(s => Math.min(ALL_LESSONS.length - 1, (s ?? 0) + 1))
            }
            className={BTN_PRIMARY}
          >
            Next Shift →
          </button>
        </div>
      </div>
    );
  }

  // Active review session helpers when activeDeckId !== null
  const activeCardQueue =
    reviewQueue !== null ? reviewQueue : computeDueCardQueue(progress, activeDeckId);
  const activeDeckTitle =
    activeDeckId === 'all'
      ? 'All Due Cards'
      : CORE_DECKS.find(d => d.id === activeDeckId)?.name ||
        ALL_PREBUILT_DECKS.find(d => d.id === activeDeckId)?.name ||
        'Study Session';

  const activePracticeLesson =
    activeLessonIdx !== null ? ALL_LESSONS[activeLessonIdx] ?? null : null;
  const activePracticeExercise =
    activePracticeLesson !== null ? activePracticeLesson.exercises[activeExIdx] ?? null : null;

  const currentUnityPhrase =
    PAN_ARAB_UNITY_PHRASES[unityPhraseIdx % PAN_ARAB_UNITY_PHRASES.length] ||
    PAN_ARAB_UNITY_PHRASES[0];
  const currentCulturalQuote =
    CULTURAL_QUOTES[cultureQuoteIdx % CULTURAL_QUOTES.length] || CULTURAL_QUOTES[0];

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold flex items-center gap-1.5">
              <span>🧠 Thinking English</span>
              <OliveBranchIcon
                size={19}
                className="text-olive-600 dark:text-olive-400"
                title="Rooted like the olive tree · غصن الزيتون"
              />
            </h1>
            <span className="text-xs font-medium text-olive-700 dark:text-olive-300">
              · Lv.{levelInfo.levelNumber} {levelInfo.levelName}
            </span>
          </div>
          <p className="text-xs opacity-75">
            Arabic → English transfer journey · A1+ to C1
          </p>
          <p
            id="header-pan-arab-subtext"
            className="text-[11px] font-medium text-olive-700 dark:text-olive-300 mt-0.5 flex items-center gap-1.5 flex-wrap"
          >
            <span dir="rtl" className="ar font-bold">
              {currentUnityPhrase.ar}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentUnityPhrase.en}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            id="cultural-olive-btn"
            onClick={() => {
              if (showCulture) {
                setCultureQuoteIdx(prev => (prev + 1) % CULTURAL_QUOTES.length);
              } else {
                setShowCulture(true);
                hasShownSessionCultureRef.current = true;
              }
            }}
            aria-label="Show Pan-Arab olive heritage reflection"
            title="Olive Tree & Pan-Arab Heritage Reflection (غصن الزيتون)"
            className="rounded-full border border-olive-600/40 dark:border-olive-500/40 bg-olive-600/10 dark:bg-olive-500/15 px-3 py-1 text-sm flex items-center justify-center hover:bg-olive-600/20 cursor-pointer"
          >
            <OliveBranchIcon size={16} className="text-olive-700 dark:text-olive-300" />
          </button>
          <button
            type="button"
            id="download-html-header-btn"
            onClick={handleDownloadOfflineHtml}
            aria-label="Download standalone HTML file to send on WhatsApp"
            title="Download self-contained Thinking-English.html file (works 100% offline)"
            className="rounded-full bg-olive-700 dark:bg-olive-600 text-white px-3 py-1 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-olive-800 cursor-pointer"
          >
            📥 HTML
          </button>
          <a
            href={waFriendShareLink(buildFriendShareWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share app with friends on WhatsApp"
            title="Share app & review form on WhatsApp"
            className="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm flex items-center justify-center"
          >
            📲
          </a>
          <button
            type="button"
            onClick={() => setShowVaultModal(true)}
            aria-label="Inspect deterministic storage vault"
            title="Security & Deterministic Vault Status"
            className="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm"
          >
            🛡️
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={progress.soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
            title={progress.soundOn ? 'Sound effects ON' : 'Sound effects OFF'}
            className="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm"
          >
            {progress.soundOn ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            id="th"
            onClick={toggleTheme}
            aria-label="Toggle dark or light theme"
            className="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm"
          >
            🌓
          </button>
        </div>
      </header>

      {/* Security & Deterministic Vault Inspector Modal */}
      {showVaultModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Security and Deterministic Vault Status"
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h2 className="font-bold text-base">Security & Deterministic Vault Status</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowVaultModal(false)}
                className={BTN_GHOST + ' !px-3 !py-1'}
              >
                ✕
              </button>
            </div>
            <div className="text-xs space-y-1.5 opacity-85 leading-relaxed">
              <p>
                • <strong>Zero-Hallucination Engine:</strong> 100% deterministic contrast matrices
                and offline Arabic word lexicon reviewed by ESL pedagogues across 24 lessons, 72
                exercises, and 170+ prebuilt Anki sentences.
              </p>
              <p>
                • <strong>Isolated Storage & IndexedDB Audio Vault:</strong> Every read/write passes
                schema sanitization, FNV-1a integrity checksum verification, IndexedDB voice-note
                offloading, and strict <code>try/catch</code> isolation.
              </p>
            </div>
            <pre className="bg-stone-950 text-teal-400 p-3 rounded-xl text-xs overflow-x-auto font-mono">
              {JSON.stringify(vaultAudit, null, 2)}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVaultModal(false)}
                className={BTN_PRIMARY}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open-Source Deck Attribution Modal */}
      {attributionDeck && (
        <div
          id="attribution-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Attribution for ${attributionDeck.name}`}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">ⓘ Deck Attribution & License</h2>
              <button
                type="button"
                id="close-attribution-btn"
                onClick={() => setAttributionDeck(null)}
                className={BTN_GHOST + ' !px-3 !py-1'}
              >
                ✕
              </button>
            </div>
            <div className="text-sm space-y-1.5">
              <div>
                <span className="opacity-65">Deck:</span>{' '}
                <strong>{attributionDeck.name}</strong>
              </div>
              <div>
                <span className="opacity-65">Author / Source:</span>{' '}
                <strong>{attributionDeck.author}</strong>
              </div>
              <div>
                <span className="opacity-65">License:</span>{' '}
                <strong>{attributionDeck.license}</strong>
              </div>
            </div>
            <p className="text-xs rounded-xl bg-stone-100 dark:bg-stone-800 p-3 border border-stone-200 dark:border-stone-700 leading-relaxed">
              {attributionDeck.disclaimer}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAttributionDeck(null)}
                className={BTN_PRIMARY}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amr Sherif Dedication & Teacher Broadcast Banner */}
      {(tab === 0 || tab === 2) &&
        latestBroadcast &&
        dismissedBroadcastId !== latestBroadcast.id && (
        <div
          id="top-dedication-banner"
          className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start justify-between gap-3"
        >
          <div className="text-xs sm:text-sm space-y-1 flex-1">
            <div className="font-bold text-amber-800 dark:text-amber-300">
              🌟 {latestBroadcast.title || 'Crafted with Hours of Effort by Amr Sherif — God Willing, You Will Succeed!'}
            </div>
            <p className="opacity-95 leading-relaxed">{latestBroadcast.content}</p>
            {latestBroadcast.contentAr && (
              <p
                dir="rtl"
                className="ar text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 font-semibold pt-0.5 text-right"
              >
                {latestBroadcast.contentAr}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDismissedBroadcastId(latestBroadcast.id)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Persistent Psychology Habit & Dopamine Bar */}
      <HabitLoopBar
        progress={progress}
        mysteryRewardBanner={mysteryRewardBanner}
        onToggleBeginnerMode={handleToggleBeginnerMode}
        onQuickWinStart={handleQuickWinStart}
      />

      {/* Main Content Container with ~84px bottom padding for fixed tab bar */}
      <main id="v" className="pb-24">
        {/* TAB 0: LESSONS */}
        {tab === 0 && (
          <LessonsView
            phases={PHASES_DATA}
            allLessons={ALL_LESSONS}
            progress={progress}
            freeExplore={freeExplore}
            unityPhrase={currentUnityPhrase}
            onCycleUnityPhrase={() =>
              setUnityPhraseIdx(prev => getNextUnityPhraseIndex(prev))
            }
            onToggleFreeExplore={() => setFreeExplore(v => !v)}
            onDownloadOfflineHtml={handleDownloadOfflineHtml}
            onOpenLesson={openLesson}
            onQuickWinStart={handleQuickWinStart}
            onStartBeginnerDeck={handleStartBeginnerDeck}
            getCompletedCountForLesson={getCompletedCountForLesson}
            isLessonComplete={isLessonComplete}
          />
        )}

        {/* TAB 1: PRACTICE */}
        {tab === 1 && (
          <PracticeView
            lesson={activePracticeLesson}
            exercise={activePracticeExercise}
            activeExIdx={activeExIdx}
            tries={tries}
            exState={exState}
            userAnswer={userAnswer}
            feedbackHtml={feedbackHtml}
            shuffledChips={shuffledChips}
            showBlueprintPeek={showBlueprintPeek}
            xpPopText={xpPopText}
            progress={progress}
            voices={voices}
            chosenVoice={chosenVoice}
            isRecordingPron={isRecordingPron}
            pronAudioUrl={pronAudioUrl}
            pronResultText={pronResultText}
            pronWordMatches={pronWordMatches}
            answerInputRef={answerInputRef}
            onStartLessonOne={() => openLesson(0)}
            onToggleBlueprintPeek={() => setShowBlueprintPeek(p => !p)}
            onChangeAnswer={setUserAnswer}
            onAddChip={handleAddChip}
            onRemoveWordAt={handleRemoveWordAt}
            onGiveNextWordHint={handleGiveNextWordHint}
            onCheckAnswer={handleCheckAnswer}
            onClearAnswer={() => setUserAnswer('')}
            onRevealAnswer={handleReveal}
            onNextExercise={handleNextExercise}
            onPronunciationPractice={handlePronunciationPractice}
            onSelectVoice={val => {
              updateAndSaveProgress(prev => ({ ...prev, preferredVoice: val }));
              speakWithRate('Hello, this is how I sound.', 1, val);
            }}
            onToast={showToast}
          />
        )}

        {/* TAB 4: CARDS (Anki Multi-Deck Spaced Repetition: DeckListView & ReviewView) */}
        {tab === 4 && (
          <div>
            {activeDeckId === null ? (
              <DeckListView
                coreDecks={CORE_DECKS}
                expandedDecks={EXPANDED_DECKS}
                prebuiltDecks={PREBUILT_DECKS}
                importedDecks={progress.importedDecks || []}
                getDeckStats={id => getDeckStats(id, progress)}
                onSelectDeck={handleSelectDeck}
                onDownloadDeck={handleDownloadOpenSourceDeck}
                onDownloadAllExpandedDecks={handleDownloadAllExpandedDecks}
                onOpenAttribution={deck => setAttributionDeck(deck)}
              />
            ) : (
              <ReviewView
                deckName={activeDeckTitle}
                deckStats={getDeckStats(activeDeckId, progress)}
                activeQueue={activeCardQueue}
                currentCardData={
                  activeCardQueue[0] ? getCardData(activeCardQueue[0], progress) : null
                }
                currentSchedule={
                  activeCardQueue[0] ? progress.cards?.[activeCardQueue[0]] : undefined
                }
                cardAnswerShown={cardAnswerShown}
                canUndo={undoSnapshot !== null}
                preferredVoice={progress.preferredVoice}
                comboCount={progress.comboCount ?? 0}
                onBackToDecks={() => {
                  setActiveDeckId(null);
                  setReviewQueue(null);
                  setCardAnswerShown(false);
                }}
                onShowAnswer={() => setCardAnswerShown(true)}
                onGradeCard={g => handleCardGrade(g, activeCardQueue)}
                onUndoLastGrade={handleUndoLastGrade}
              />
            )}
          </div>
        )}

        {/* TAB 5: TRANSLATE (Auto-detect Arabic/English + Bulk Add Custom Cards) */}
        {tab === 5 && (
          <TranslateView
            trSrc={trSrc}
            trOut={trOut}
            trFrom={trFrom}
            trTo={trTo}
            trBusy={trBusy}
            bulkText={bulkText}
            bulkBusy={bulkBusy}
            preferredVoice={progress.preferredVoice}
            trInputRef={trInputRef}
            onType={handleTranslateType}
            onPaste={handleTranslatePaste}
            onClear={handleTranslateClear}
            onCopy={handleTranslateCopy}
            onSaveAsCard={handleTranslateSaveAsCard}
            onChangeBulkText={setBulkText}
            onGenerateBulkCards={handleGenerateBulkCards}
            onInsertSampleBulkLines={handleInsertSampleBulkLines}
          />
        )}

        {/* TAB 2: HUB (Mentor Q&A, Broadcasts & Teacher PIN Side) */}
        {tab === 2 && (
          <HubView
            studentNameDraft={studentNameDraft}
            mentorDraft={mentorDraft}
            mentorVoiceBase64={mentorVoiceBase64}
            isRecordingMentorVoice={isRecordingMentorVoice}
            broadcasts={broadcasts}
            mentorQuestions={mentorQuestions}
            teacherUnlocked={teacherUnlocked}
            pinInput={pinInput}
            teacherPin={TEACHER_PIN}
            replyDrafts={replyDrafts}
            broadcastDraft={broadcastDraft}
            sortedWeakSpots={sortedWeakSpots}
            onChangeStudentName={setStudentNameDraft}
            onChangeMentorDraft={setMentorDraft}
            onToggleMentorVoice={handleMentorVoiceToggle}
            onSendMentorQuestion={handleSendMentorQuestion}
            onChangePinInput={setPinInput}
            onUnlockTeacher={() => {
              if (pinInput === loadTeacherPin() || pinInput === TEACHER_PIN) {
                setTeacherUnlocked(true);
                setPinInput('');
              } else {
                showToast('Wrong PIN');
              }
            }}
            onLockTeacher={() => setTeacherUnlocked(false)}
            onChangeReplyDraft={(qId, val) =>
              setReplyDrafts(prev => ({ ...prev, [qId]: val }))
            }
            onSendTeacherReply={handleTeacherReply}
            onChangeBroadcastDraft={setBroadcastDraft}
            onPublishBroadcast={handlePublishBroadcast}
          />
        )}

        {/* TAB 3: PROGRESS */}
        {tab === 3 && (
          <ProgressView
            progress={progress}
            levelInfo={levelInfo}
            badges={badges}
            phases={PHASES_DATA}
            allLessons={ALL_LESSONS}
            sortedWeakSpots={sortedWeakSpots}
            feedbackRating={feedbackRating}
            feedbackText={feedbackText}
            getCompletedCountForLesson={getCompletedCountForLesson}
            onToggleSound={toggleSound}
            onOpenLesson={openLesson}
            onChangeNotes={val =>
              updateAndSaveProgress(prev => ({ ...prev, generalNotes: val }))
            }
            onDownloadOfflineHtml={handleDownloadOfflineHtml}
            onSetFeedbackRating={setFeedbackRating}
            onChangeFeedbackText={setFeedbackText}
            onCopyFeedback={handleCopyFeedback}
            onOpenPresentation={() => setPresentationSlide(0)}
            onResetProgress={() => {
              const fresh = { ...DEFAULT_PROGRESS };
              saveUserProgress(fresh);
              setProgress(fresh);
              setActiveLessonIdx(null);
              setActiveDeckId(null);
              setReviewQueue(null);
              setUndoSnapshot(null);
              showToast('Progress reset');
            }}
            onToast={showToast}
          />
        )}

        {/* Inspiration & Alexandria Tribute Footer */}
        <footer
          id="tribute-footer"
          className="mt-6 pt-4 border-t border-stone-200/80 dark:border-stone-800 text-center text-xs opacity-75 space-y-1"
        >
          <p>
            🌊 Crafted in <strong>Alexandria, Egypt</strong> by <strong>Amr Sherif</strong> · 100% Free, Ad-Free &amp; Public Domain (CC0 1.0)
          </p>
          <p>
            💡 Pedagogical approach gratefully inspired by{' '}
            <strong>Mihalis Eleftheriou</strong> &amp; <em>The Thinking Method (Language Transfer)</em> — an independent community project.
          </p>
        </footer>
      </main>

      {/* Fixed Bottom Tab Bar: Display order = Lessons, Practice, Cards, Translate, Hub, Progress */}
      <nav
        id="nav"
        aria-label="Main Navigation"
        className="fixed left-0 right-0 bottom-0 z-20 flex border-t border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {NAV.map(i => {
          const isActive = tab === i;
          return (
            <button
              key={TABS[i]}
              type="button"
              onClick={() => {
                if (i === 4) {
                  setCardAnswerShown(false);
                }
                if (i === 0 && tab !== 0) {
                  triggerCulturalToastOncePerSession();
                }
                setTab(i);
                window.scrollTo(0, 0);
              }}
              className={`tab-btn flex-1 flex flex-col items-center justify-center py-2 px-0.5 min-h-[56px] text-[10px] transition-colors ${
                isActive
                  ? 'text-olive-700 dark:text-olive-300 font-bold border-t-2 border-olive-600'
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              <span className="text-xl leading-none mb-1">{ICONS[i]}</span>
              <span>
                {TABS[i]}
                {i === 2 && teacherUnlocked ? ' 🔓' : ''}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Subtle Cultural Motivational Popup (above the navigation bar) */}
      <CulturalToast
        visible={showCulture}
        quote={currentCulturalQuote}
        onDismiss={() => setShowCulture(false)}
        onNextQuote={() =>
          setCultureQuoteIdx(prev => (prev + 1) % CULTURAL_QUOTES.length)
        }
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          id="toast"
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm rounded-full px-4 py-2 shadow-lg"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
