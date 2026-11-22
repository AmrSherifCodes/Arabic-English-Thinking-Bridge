import { UserProfile, UserProgress, Phase, Lesson, Exercise, SourceLanguage, TargetLanguage } from '../../types';
import { PHASES_DATA } from '../../data/lessons';
import { EXPANDED_DECKS } from '../../data/expandedDecks';
import { PREBUILT_DECKS } from '../../data/prebuiltDecks';
import { GERMAN_PREBUILT_DECKS } from '../../data/curriculum/germanDecks';
import { JAPANESE_PREBUILT_DECKS } from '../../data/curriculum/japaneseDecks';
import { SPANISH_PREBUILT_DECKS } from '../../data/curriculum/spanishDecks';
import { FRENCH_PREBUILT_DECKS } from '../../data/curriculum/frenchDecks';
import { ITALIAN_PREBUILT_DECKS } from '../../data/curriculum/italianDecks';
import { PORTUGUESE_PREBUILT_DECKS } from '../../data/curriculum/portugueseDecks';
import { getCurriculum } from '../../data/curriculumRegistry';
import { LexiconEntry } from '../../services/geminiLexicon';
import { DeckStats, FlashcardItemData } from '../../components/uiConstants';
import { getTargetDictionary } from '../../data/dictionaries';
import { detectDynamicCefrLevel } from '../../brain/dynamicCefrDetector';

function findTranslation(targetLang: TargetLanguage, englishWord: string): string {
  const dict = getTargetDictionary(targetLang);
  if (!englishWord || !dict || dict.length === 0) return '';
  const cleanEng = englishWord.toLowerCase().trim();
  const match = dict.find(entry => {
    const en = (entry.englishTranslation || entry.translation || '').toLowerCase();
    return en === cleanEng || en.split(/[;,]/).map((s: string) => s.trim()).includes(cleanEng);
  });
  if (match) {
    return match.word || match.term || match.germanWord || match.spanishWord || match.frenchWord || match.arabicWord || match.translation || '';
  }
  return '';
}

function enrichCardData(card: FlashcardItemData, targetLang: TargetLanguage): FlashcardItemData {
  const engWord = targetLang === 'en' ? card.en : card.ar; // Simplistic approach
  card.arabicFallback = findTranslation('ar', engWord);
  card.german = findTranslation('de', engWord);
  card.spanish = findTranslation('es', engWord);
  card.french = findTranslation('fr', engWord);
  return card;
}

const ALL_LESSONS = PHASES_DATA.flatMap(p => p.lessons);
const ALL_PREBUILT_DECKS = [...EXPANDED_DECKS, ...PREBUILT_DECKS, ...GERMAN_PREBUILT_DECKS, ...JAPANESE_PREBUILT_DECKS, ...SPANISH_PREBUILT_DECKS, ...FRENCH_PREBUILT_DECKS, ...ITALIAN_PREBUILT_DECKS, ...PORTUGUESE_PREBUILT_DECKS];

function getExerciseIndex(
  sourceLang: SourceLanguage,
  targetLang: TargetLanguage
): { phases: Phase[]; allExercises: Exercise[]; byPhase: Record<string, string[]> } {
  const phases = getCurriculum(sourceLang, targetLang);
  const allExercises = phases.flatMap(p => p.lessons.flatMap(l => l.exercises));
  const byPhase: Record<string, string[]> = {
    'phase-1': (phases[0]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
    'phase-2': (phases[1]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
    'phase-3': (phases[2]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
  };
  return { phases, allExercises, byPhase };
}

export const getMasterDictionaryCardKey = (entry: LexiconEntry): string =>
  `md:${encodeURIComponent(entry.arabicWord)}:${encodeURIComponent(entry.englishTranslation)}` +
  (entry.dialect === 'egyptian' ? ':egyptian' : '');

export const getDeckCardKeys = (
  deckId: string | null,
  currentProgress: UserProgress,
  dictionaryEntries: LexiconEntry[],
  profile: UserProfile | null,
  sourceLang: SourceLanguage = 'ar',
  targetLang: TargetLanguage = 'en'
): string[] => {
  const solvedSet = new Set(currentProgress.completedExerciseIds);
  const sortSolvedFirst = (ids: string[]) =>
    [...ids].sort((a, b) => (solvedSet.has(b) ? 1 : 0) - (solvedSet.has(a) ? 1 : 0));

  if (deckId === 'master-dictionary') {
    // Dynamically detect user's CEFR level
    const userDynamicCefr = detectDynamicCefrLevel(currentProgress);

    // Sort dictionary entries dynamically:
    // 1. Unsolved / Due cards first
    // 2. CEFR level matching the user's current detected level
    // 3. Fallback to frequency
    const sortedDictionary = [...dictionaryEntries].sort((a, b) => {
      const keyA = getMasterDictionaryCardKey(a);
      const keyB = getMasterDictionaryCardKey(b);

      const isDueA = currentProgress.cards?.[keyA]?.due && currentProgress.cards[keyA].due <= Date.now();
      const isDueB = currentProgress.cards?.[keyB]?.due && currentProgress.cards[keyB].due <= Date.now();

      if (isDueA && !isDueB) return -1;
      if (!isDueA && isDueB) return 1;

      // CEFR matching
      const aMatchesCefr = a.cefrLevel === userDynamicCefr;
      const bMatchesCefr = b.cefrLevel === userDynamicCefr;

      if (aMatchesCefr && !bMatchesCefr) return -1;
      if (!aMatchesCefr && bMatchesCefr) return 1;

      // Sort by length/frequency implicitly or random if equal
      return (a.arabicWord?.length || 0) - (b.arabicWord?.length || 0);
    });

    return sortedDictionary.map(getMasterDictionaryCardKey);
  }
  if (deckId === 'custom') {
    return (currentProgress.customCards || [])
      .filter(c => !c.deckId || c.deckId === 'custom')
      .map(c => 'c:' + c.id);
  }

  if (targetLang === 'en' && profile?.dialect === 'egyptian') {
    if (deckId === 'all' || deckId === null) {
      const masterDictionaryIds = [...dictionaryEntries]
        .sort((a, b) => (a.cefrLevel === detectDynamicCefrLevel(currentProgress) ? -1 : 1))
        .map(getMasterDictionaryCardKey);
      const userCustomIds = (currentProgress.customCards || [])
        .filter(c => !c.deckId || c.deckId === 'custom')
        .map(c => 'c:' + c.id);
      return Array.from(new Set([...masterDictionaryIds, ...userCustomIds]));
    }
    return [];
  }

  const { byPhase } = getExerciseIndex(sourceLang, targetLang);

  if (deckId === 'phase-1' || deckId === 'phase-2' || deckId === 'phase-3') {
    return sortSolvedFirst(byPhase[deckId] ?? []);
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
    ...(byPhase['phase-1'] ?? []),
    ...(byPhase['phase-2'] ?? []),
    ...(byPhase['phase-3'] ?? [])
  ]);
  const userDynamicCefr = detectDynamicCefrLevel(currentProgress);
  const masterDictionaryIds = [...dictionaryEntries]
    .sort((a, b) => (a.cefrLevel === userDynamicCefr ? -1 : 1))
    .map(getMasterDictionaryCardKey);
  const expandedIds = EXPANDED_DECKS.flatMap(d => d.cards.map((_, idx) => `c:${d.id}-${idx}`));
  const customIds = (currentProgress.customCards || []).map(c => 'c:' + c.id);
  return Array.from(new Set([...masterDictionaryIds, ...customIds, ...allPhaseIds, ...expandedIds]));
};

export const getCardData = (
  k: string,
  currentProgress: UserProgress,
  dictionaryEntries: LexiconEntry[],
  profile: UserProfile | null,
  sourceLang: SourceLanguage = 'ar',
  targetLang: TargetLanguage = 'en'
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
    return enrichCardData({
      ar: entry.arabicWord,
      en: entry.englishTranslation,
      breakdownChunks: null,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
    }, targetLang);
  }

  if (k.startsWith('c:')) {
    const custom = (currentProgress.customCards || []).find(x => 'c:' + x.id === k);
    if (custom) {
      if (profile?.dialect === 'egyptian' && custom.deckId && custom.deckId !== 'custom') return null;
      return enrichCardData({
        ar: custom.ar,
        en: custom.en,
        breakdownChunks: null,
        nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
      }, targetLang);
    }
    if (targetLang === 'en' && profile?.dialect === 'egyptian') return null;
    for (const deck of ALL_PREBUILT_DECKS) {
      const idxMatch = k.replace(`c:${deck.id}-`, '');
      const idx = Number(idxMatch);
      if (Number.isInteger(idx) && deck.cards[idx]) {
        return enrichCardData({
          ar: deck.cards[idx].ar,
          en: deck.cards[idx].en,
          breakdownChunks: null,
          nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
        }, targetLang);
      }
    }
    return null;
  }

  if (targetLang === 'en' && profile?.dialect === 'egyptian') return null;

  const { allExercises, phases } = getExerciseIndex(sourceLang, targetLang);
  const exById = allExercises.find(x => x.id === k);
  if (exById) {
    return enrichCardData({
      ar: exById.arabicThought,
      en: exById.englishTarget,
      breakdownChunks: exById.breakdownChunks,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now(),
      exercise: exById
    }, targetLang);
  }
  const allLessons = phases.flatMap(p => p.lessons);
  const [li, ei] = k.split('-').map(Number);
  const exByIdx = allLessons[li]?.exercises[ei];
  if (exByIdx) {
    return enrichCardData({
      ar: exByIdx.arabicThought,
      en: exByIdx.englishTarget,
      breakdownChunks: exByIdx.breakdownChunks,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now(),
      exercise: exByIdx
    }, targetLang);
  }
  return null;
};

export const getDeckStats = (
  deckId: string,
  currentProgress: UserProgress,
  dictionaryEntries: LexiconEntry[],
  profile: UserProfile | null,
  sourceLang: SourceLanguage = 'ar',
  targetLang: TargetLanguage = 'en'
): DeckStats => {
  const keys = getDeckCardKeys(deckId, currentProgress, dictionaryEntries, profile, sourceLang, targetLang);
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
      if (sched.reps === 0 || sched.int < 1) {
        learningCount++;
      } else {
        dueCount++;
      }
    } else if (sched.reps === 0 || sched.int < 1) {
      learningCount++;
    }
  }

  const cappedLearningCount = Math.min(learningCount, 20);
  const cappedDueCount = Math.min(dueCount, 100);
  const cappedNewCount = Math.min(newCount, 20);

  const totalDue = dueCount + learningCount;
  let cappedTotal = 0;
  if (totalDue > 0) {
    cappedTotal = Math.min(totalDue, 100);
  } else if (newCount > 0) {
    cappedTotal = Math.min(newCount, 20);
  }

  return {
    newCount,
    learningCount,
    dueCount,
    totalCards: keys.length,
    cappedNewCount,
    cappedLearningCount,
    cappedDueCount,
    cappedTotal
  };
};
