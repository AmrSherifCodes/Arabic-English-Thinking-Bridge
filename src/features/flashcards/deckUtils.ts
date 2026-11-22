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
import { DictWordEntry, getCachedTargetDictionary } from '../../data/dictionaries';
import { detectDynamicCefrLevel } from '../../brain/dynamicCefrDetector';

const translationIndexCache = new WeakMap<DictWordEntry[], Map<string, string>>();
const masterDictIndexCache = new WeakMap<LexiconEntry[], Map<string, LexiconEntry>>();
const exerciseIndexCache = new Map<
  string,
  { phases: Phase[]; allExercises: Exercise[]; byId: Map<string, Exercise>; byPhase: Record<string, string[]> }
>();

function getTranslationMap(dict: DictWordEntry[]): Map<string, string> {
  let map = translationIndexCache.get(dict);
  if (map) return map;
  map = new Map<string, string>();
  for (let i = 0; i < dict.length; i++) {
    const entry = dict[i] as any;
    const en = (entry.englishTranslation || entry.translation || '').toLowerCase();
    if (!en) continue;
    const targetWord =
      entry.word ||
      entry.term ||
      entry.germanWord ||
      entry.spanishWord ||
      entry.frenchWord ||
      entry.arabicWord ||
      entry.translation ||
      '';
    if (!targetWord) continue;
    if (!map.has(en)) map.set(en, targetWord);
    const parts = en.split(/[;,]/);
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j].trim();
      if (part && !map.has(part)) map.set(part, targetWord);
    }
  }
  translationIndexCache.set(dict, map);
  return map;
}

function findTranslation(targetLang: TargetLanguage, englishWord: string): string {
  const dict = getCachedTargetDictionary(targetLang);
  if (!englishWord || !dict || dict.length === 0) return '';
  const cleanEng = englishWord.toLowerCase().trim();
  return getTranslationMap(dict).get(cleanEng) || '';
}

function getMasterDictLookup(dictionaryEntries: LexiconEntry[]): Map<string, LexiconEntry> {
  let map = masterDictIndexCache.get(dictionaryEntries);
  if (map) return map;
  map = new Map<string, LexiconEntry>();
  for (let i = 0; i < dictionaryEntries.length; i++) {
    const entry = dictionaryEntries[i];
    const lookupKey = `${entry.arabicWord}\0${entry.englishTranslation}\0${entry.dialect}`;
    if (!map.has(lookupKey)) map.set(lookupKey, entry);
  }
  masterDictIndexCache.set(dictionaryEntries, map);
  return map;
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
): { phases: Phase[]; allExercises: Exercise[]; byId: Map<string, Exercise>; byPhase: Record<string, string[]> } {
  const cacheKey = `${sourceLang}:${targetLang}:${getCachedTargetDictionary(targetLang).length > 0 ? 1 : 0}`;
  const cached = exerciseIndexCache.get(cacheKey);
  if (cached) return cached;

  const phases = getCurriculum(sourceLang, targetLang);
  const allExercises = phases.flatMap(p => p.lessons.flatMap(l => l.exercises));
  const byId = new Map<string, Exercise>();
  for (let i = 0; i < allExercises.length; i++) {
    const ex = allExercises[i];
    if (!byId.has(ex.id)) byId.set(ex.id, ex);
  }
  const byPhase: Record<string, string[]> = {
    'phase-1': (phases[0]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
    'phase-2': (phases[1]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
    'phase-3': (phases[2]?.lessons ?? []).flatMap(l => l.exercises.map(e => e.id)),
  };
  const result = { phases, allExercises, byId, byPhase };
  exerciseIndexCache.set(cacheKey, result);
  return result;
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
  targetLang: TargetLanguage = 'en',
  skipSort: boolean = false
): string[] => {
  if (deckId === 'master-dictionary') {
    if (skipSort) {
      return dictionaryEntries.map(getMasterDictionaryCardKey);
    }

    // Dynamically detect user's CEFR level once outside sort
    const userDynamicCefr = detectDynamicCefrLevel(currentProgress);
    const now = Date.now();
    const cardsMap = currentProgress.cards;

    const decorated = dictionaryEntries.map(entry => {
      const key = getMasterDictionaryCardKey(entry);
      const dueTs = cardsMap?.[key]?.due;
      return {
        key,
        notDue: dueTs && dueTs <= now ? 0 : 1,
        cefrMismatch: entry.cefrLevel === userDynamicCefr ? 0 : 1,
        len: entry.arabicWord?.length || 0,
      };
    });

    decorated.sort((a, b) => (a.notDue - b.notDue) || (a.cefrMismatch - b.cefrMismatch) || (a.len - b.len));
    return decorated.map(item => item.key);
  }
  if (deckId === 'custom') {
    return (currentProgress.customCards || [])
      .filter(c => !c.deckId || c.deckId === 'custom')
      .map(c => 'c:' + c.id);
  }

  const solvedSet = skipSort ? null : new Set(currentProgress.completedExerciseIds);
  const sortSolvedFirst = (ids: string[]) =>
    !solvedSet ? ids : [...ids].sort((a, b) => (solvedSet.has(b) ? 1 : 0) - (solvedSet.has(a) ? 1 : 0));

  if (targetLang === 'en' && profile?.dialect === 'egyptian') {
    if (deckId === 'all' || deckId === null) {
      const masterDictionaryIds = skipSort
        ? dictionaryEntries.map(getMasterDictionaryCardKey)
        : (() => {
            const userCefr = detectDynamicCefrLevel(currentProgress);
            return [...dictionaryEntries]
              .sort((a, b) => (a.cefrLevel === userCefr ? 0 : 1) - (b.cefrLevel === userCefr ? 0 : 1))
              .map(getMasterDictionaryCardKey);
          })();
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
  const masterDictionaryIds = skipSort
    ? dictionaryEntries.map(getMasterDictionaryCardKey)
    : (() => {
        const userDynamicCefr = detectDynamicCefrLevel(currentProgress);
        return [...dictionaryEntries]
          .sort((a, b) => (a.cefrLevel === userDynamicCefr ? 0 : 1) - (b.cefrLevel === userDynamicCefr ? 0 : 1))
          .map(getMasterDictionaryCardKey);
      })();
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
  targetLang: TargetLanguage = 'en',
  options?: { enrich?: boolean }
): FlashcardItemData | null => {
  const shouldEnrich = options?.enrich !== false;
  const finalize = (card: FlashcardItemData): FlashcardItemData =>
    shouldEnrich ? enrichCardData(card, targetLang) : card;

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

    const lookupKey = `${decodedArabicWord}\0${decodedEnglishTranslation}\0${dialect}`;
    const entry = getMasterDictLookup(dictionaryEntries).get(lookupKey);
    if (!entry || (profile && entry.dialect !== profile.dialect)) return null;
    return finalize({
      ar: entry.arabicWord,
      en: entry.englishTranslation,
      breakdownChunks: null,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
    });
  }

  if (k.startsWith('c:')) {
    const custom = (currentProgress.customCards || []).find(x => 'c:' + x.id === k);
    if (custom) {
      if (profile?.dialect === 'egyptian' && custom.deckId && custom.deckId !== 'custom') return null;
      return finalize({
        ar: custom.ar,
        en: custom.en,
        breakdownChunks: null,
        nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
      });
    }
    if (targetLang === 'en' && profile?.dialect === 'egyptian') return null;
    for (const deck of ALL_PREBUILT_DECKS) {
      const idxMatch = k.replace(`c:${deck.id}-`, '');
      const idx = Number(idxMatch);
      if (Number.isInteger(idx) && deck.cards[idx]) {
        return finalize({
          ar: deck.cards[idx].ar,
          en: deck.cards[idx].en,
          breakdownChunks: null,
          nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now()
        });
      }
    }
    return null;
  }

  if (targetLang === 'en' && profile?.dialect === 'egyptian') return null;

  const { byId, phases } = getExerciseIndex(sourceLang, targetLang);
  const exById = byId.get(k);
  if (exById) {
    return finalize({
      ar: exById.arabicThought,
      en: exById.englishTarget,
      breakdownChunks: exById.breakdownChunks,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now(),
      exercise: exById
    });
  }
  const allLessons = phases.flatMap(p => p.lessons);
  const [li, ei] = k.split('-').map(Number);
  const exByIdx = allLessons[li]?.exercises[ei];
  if (exByIdx) {
    return finalize({
      ar: exByIdx.arabicThought,
      en: exByIdx.englishTarget,
      breakdownChunks: exByIdx.breakdownChunks,
      nextReviewDate: currentProgress.cards?.[k]?.nextReviewDate ?? Date.now(),
      exercise: exByIdx
    });
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
  const keys = getDeckCardKeys(deckId, currentProgress, dictionaryEntries, profile, sourceLang, targetLang, true);
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
