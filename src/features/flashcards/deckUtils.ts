import { UserProfile, UserProgress } from '../../types';
import { PHASES_DATA } from '../../data/lessons';
import { EXPANDED_DECKS } from '../../data/expandedDecks';
import { PREBUILT_DECKS } from '../../data/prebuiltDecks';
import { LexiconEntry } from '../../services/geminiLexicon';
import { DeckStats, FlashcardItemData } from '../../components/uiConstants';

const ALL_LESSONS = PHASES_DATA.flatMap(p => p.lessons);
const ALL_EXERCISES = ALL_LESSONS.flatMap(l => l.exercises);
const ALL_PREBUILT_DECKS = [...EXPANDED_DECKS, ...PREBUILT_DECKS];
const PHASE_EXERCISE_IDS: Record<'phase-1' | 'phase-2' | 'phase-3', string[]> = {
  'phase-1': (PHASES_DATA[0]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
  'phase-2': (PHASES_DATA[1]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
  'phase-3': (PHASES_DATA[2]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id))
};

export const getMasterDictionaryCardKey = (entry: LexiconEntry): string =>
  `md:${encodeURIComponent(entry.arabicWord)}:${encodeURIComponent(entry.englishTranslation)}` +
  (entry.dialect === 'egyptian' ? ':egyptian' : '');

export const getDeckCardKeys = (
  deckId: string | null,
  currentProgress: UserProgress,
  dictionaryEntries: LexiconEntry[],
  profile: UserProfile | null
): string[] => {
  const solvedSet = new Set(currentProgress.completedExerciseIds);
  const sortSolvedFirst = (ids: string[]) =>
    [...ids].sort((a, b) => (solvedSet.has(b) ? 1 : 0) - (solvedSet.has(a) ? 1 : 0));

  if (deckId === 'master-dictionary') return dictionaryEntries.map(getMasterDictionaryCardKey);
  if (deckId === 'custom') {
    return (currentProgress.customCards || [])
      .filter(c => !c.deckId || c.deckId === 'custom')
      .map(c => 'c:' + c.id);
  }

  if (profile?.dialect === 'egyptian') {
    if (deckId === 'all' || deckId === null) {
      const masterDictionaryIds = dictionaryEntries.map(getMasterDictionaryCardKey);
      const userCustomIds = (currentProgress.customCards || [])
        .filter(c => !c.deckId || c.deckId === 'custom')
        .map(c => 'c:' + c.id);
      return Array.from(new Set([...masterDictionaryIds, ...userCustomIds]));
    }
    return [];
  }

  if (deckId === 'phase-1' || deckId === 'phase-2' || deckId === 'phase-3') {
    return sortSolvedFirst(PHASE_EXERCISE_IDS[deckId]);
  }

  const prebuilt = ALL_PREBUILT_DECKS.find(d => d.id === deckId);
  if (prebuilt) {
    const fromCustom = (currentProgress.customCards || [])
      .filter(c => c.deckId === prebuilt.id)
      .map(c => 'c:' + c.id);
    if (fromCustom.length > 0) return fromCustom;
    return prebuilt.cards.map((_, idx) => `c:${prebuilt.id}-${idx}`);
  }

  const allPhaseIds = sortSolvedFirst([
    ...PHASE_EXERCISE_IDS['phase-1'],
    ...PHASE_EXERCISE_IDS['phase-2'],
    ...PHASE_EXERCISE_IDS['phase-3']
  ]);
  const masterDictionaryIds = dictionaryEntries.map(getMasterDictionaryCardKey);
  const expandedIds = EXPANDED_DECKS.flatMap(d => d.cards.map((_, idx) => `c:${d.id}-${idx}`));
  const customIds = (currentProgress.customCards || []).map(c => 'c:' + c.id);
  return Array.from(new Set([...masterDictionaryIds, ...customIds, ...allPhaseIds, ...expandedIds]));
};

export const getCardData = (
  k: string,
  currentProgress: UserProgress,
  dictionaryEntries: LexiconEntry[],
  profile: UserProfile | null
): FlashcardItemData | null => {
  if (k.startsWith('md:')) {
    const [, arabicWord, englishTranslation, dialectKey] = k.split(':');
    if (!arabicWord || !englishTranslation) return null;
    const dialect = dialectKey === undefined ? 'msa' : dialectKey;
    if (dialect !== 'msa' && dialect !== 'egyptian') return null;
    if (profile && dialect !== profile.dialect) return null;

    let decodedArabicWord = '';
    let decodedEnglishTranslation = '';
    try {
      decodedArabicWord = decodeURIComponent(arabicWord);
      decodedEnglishTranslation = decodeURIComponent(englishTranslation);
    } catch { return null; }

    const entry = dictionaryEntries.find(
      candidate =>
        candidate.arabicWord === decodedArabicWord &&
        candidate.englishTranslation === decodedEnglishTranslation &&
        candidate.dialect === dialect
    );
    if (!entry || (profile && entry.dialect !== profile.dialect)) return null;
    return {
      ar: entry.arabicWord,
      en: entry.englishTranslation,
      breakdownChunks: null,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
    };
  }

  if (k.startsWith('c:')) {
    const custom = (currentProgress.customCards || []).find(x => 'c:' + x.id === k);
    if (custom) {
      if (profile?.dialect === 'egyptian' && custom.deckId && custom.deckId !== 'custom') return null;
      return {
        ar: custom.ar,
        en: custom.en,
        breakdownChunks: null,
        nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
      };
    }
    if (profile?.dialect === 'egyptian') return null;
    for (const deck of ALL_PREBUILT_DECKS) {
      const idxMatch = k.replace(`c:${deck.id}-`, '');
      const idx = Number(idxMatch);
      if (Number.isInteger(idx) && deck.cards[idx]) {
        return {
          ar: deck.cards[idx].ar,
          en: deck.cards[idx].en,
          breakdownChunks: null,
          nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
        };
      }
    }
    return null;
  }

  if (profile?.dialect === 'egyptian') return null;

  const exById = ALL_EXERCISES.find(x => x.id === k);
  if (exById) {
    return {
      ar: exById.arabicThought,
      en: exById.englishTarget,
      breakdownChunks: exById.breakdownChunks,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now(),
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
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now(),
      exercise: exByIdx
    };
  }
  return null;
};

export const getDeckStats = (
  deckId: string,
  currentProgress: UserProgress,
  dictionaryEntries: LexiconEntry[],
  profile: UserProfile | null
): DeckStats => {
  const keys = getDeckCardKeys(deckId, currentProgress, dictionaryEntries, profile);
  const cardsMap = currentProgress.cards || {};
  const now = Date.now();
  let newCount = 0;
  let learningCount = 0;
  let dueCount = 0;

  for (const k of keys) {
    const sched = cardsMap[k];
    if (!sched) {
      newCount++;
    } else if ((sched.nextReviewDate ?? sched.due) <= now) {
      dueCount++;
    } else if (sched.reps === 0 || sched.int < 1) {
      learningCount++;
    }
  }
  return { newCount, learningCount, dueCount, totalCards: keys.length };
};
