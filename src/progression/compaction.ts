import { ProgressionState, SrsItemRecord, Quest } from './types';
import { PREBUILT_DECKS } from '../data/prebuiltDecks';
import { GERMAN_DICTIONARY } from '../data/dictionaries/germanDictionary';
import { JAPANESE_DICTIONARY } from '../data/dictionaries/japaneseDictionary';

export const MAX_STATE_SIZE_BYTES = 65536; // 64 KB limit

export interface CompactSrsItem {
  id: string;
  s: number; // stability
  d: number; // difficulty
  l: number; // lapses
  r: number; // reviews
  due: number; // dueAt timestamp
}

export interface CompactQuest {
  id: string;
  c: number; // current count
  comp: boolean; // is completed
}

export interface CompactUserState {
  v: number;
  lvl: number;
  xp: number;
  strk: number;
  shlds: number;
  stg: string;
  crowns: Record<string, number>;
  cls: string[]; // completed lesson ids
  q: CompactQuest[]; // quest progress
  ach: string[]; // unlocked achievement ids
  lad: string; // last active date
  wp: boolean; // weekend pause active
  cap: number; // daily cards cap
  skills: { st: number; vo: number; li: number; sp: number; wr: number };
  srs: CompactSrsItem[];
  ts: number;
}

/**
 * Resolves real card term and translations for SRS card IDs from bundled dictionaries.
 */
export function resolveRealSrsCardText(cardId: string): { term: string; sourceText: string; targetText: string } {
  // 1. Search PREBUILT_DECKS
  for (const deck of PREBUILT_DECKS) {
    const card = deck.cards.find((c) => c.ar === cardId || c.en === cardId || `${c.ar}-${c.en}` === cardId);
    if (card) {
      return { term: card.en, sourceText: card.ar, targetText: card.en };
    }
  }

  // 2. Search GERMAN_DICTIONARY
  const deEntry = GERMAN_DICTIONARY.find((e) => e.id === cardId || e.term === cardId);
  if (deEntry) {
    return {
      term: deEntry.term,
      sourceText: deEntry.sourceMeanings.ar || deEntry.sourceMeanings.en || deEntry.term,
      targetText: deEntry.term,
    };
  }

  // 3. Search JAPANESE_DICTIONARY
  const jaEntry = JAPANESE_DICTIONARY.find((e) => e.id === cardId || e.term === cardId);
  if (jaEntry) {
    return {
      term: jaEntry.term,
      sourceText: jaEntry.sourceMeanings.ar || jaEntry.sourceMeanings.en || jaEntry.term,
      targetText: jaEntry.term,
    };
  }

  // Fallback
  return { term: cardId, sourceText: cardId, targetText: cardId };
}

/**
 * Compacts full ProgressionState into an ultra-lean JSON payload (<= 64 KB).
 * Preserves completed lessons, quests, achievements, streak state, and reviewed SRS items.
 */
export function compactProgressionState(state: ProgressionState): CompactUserState {
  // Filter SRS items: Keep ONLY cards that have actually been reviewed at least once
  const compactSrs: CompactSrsItem[] = Object.values(state.srsItems)
    .filter((item) => item.reviews > 0 || item.lapses > 0)
    .map((item) => ({
      id: item.id,
      s: item.stability,
      d: item.difficulty,
      l: item.lapses,
      r: item.reviews,
      due: item.dueAt,
    }));

  const compactQuests: CompactQuest[] = (state.quests || []).map((q) => ({
    id: q.id,
    c: q.currentCount,
    comp: q.isCompleted,
  }));

  const unlockedAchIds = (state.achievements || [])
    .filter((a) => a.unlockedAt !== null)
    .map((a) => a.id);

  const compact: CompactUserState = {
    v: state.version || 2,
    lvl: state.overallLevel,
    xp: state.xp,
    strk: state.streak,
    shlds: state.streakShields,
    stg: state.currentStage,
    crowns: state.lessonCrowns || {},
    cls: state.completedLessonIds || [],
    q: compactQuests,
    ach: unlockedAchIds,
    lad: state.lastActiveDate || new Date().toISOString().split('T')[0],
    wp: Boolean(state.weekendPauseActive),
    cap: state.dailyCardsCap || 30,
    skills: {
      st: state.skills.structure,
      vo: state.skills.vocabulary,
      li: state.skills.listening,
      sp: state.skills.speaking,
      wr: state.skills.writing,
    },
    srs: compactSrs,
    ts: Date.now(),
  };

  const jsonStr = JSON.stringify(compact);
  const sizeBytes = new TextEncoder().encode(jsonStr).length;

  if (sizeBytes > MAX_STATE_SIZE_BYTES) {
    throw new Error(`State size (${sizeBytes} bytes) exceeds maximum cap of 64 KB (65,536 bytes)`);
  }

  return compact;
}

/**
 * Decompacts payload back into ProgressionState, restoring real card texts from bundled decks.
 */
export function decompactUserState(
  compact: CompactUserState,
  baseState: ProgressionState
): ProgressionState {
  const srsItems: Record<string, SrsItemRecord> = { ...baseState.srsItems };

  (compact.srs || []).forEach((c) => {
    const existing = baseState.srsItems[c.id];
    const realText = existing
      ? { term: existing.term, sourceText: existing.sourceText, targetText: existing.targetText }
      : resolveRealSrsCardText(c.id);

    srsItems[c.id] = {
      id: c.id,
      term: realText.term,
      sourceText: realText.sourceText,
      targetText: realText.targetText,
      targetLang: existing?.targetLang || 'en',
      stability: c.s,
      difficulty: c.d,
      lapses: c.l,
      reviews: c.r,
      lastReviewedAt: compact.ts,
      dueAt: c.due,
    };
  });

  // Restore Quests
  const restoredQuests = (baseState.quests || []).map((q) => {
    const match = (compact.q || []).find((cq) => cq.id === q.id);
    if (match) {
      return { ...q, currentCount: match.c, isCompleted: match.comp };
    }
    return q;
  });

  // Restore Achievements
  const restoredAchievements = (baseState.achievements || []).map((a) => {
    const isUnlocked = (compact.ach || []).includes(a.id);
    return { ...a, unlockedAt: isUnlocked ? (a.unlockedAt || compact.ts) : null };
  });

  return {
    ...baseState,
    overallLevel: compact.lvl || baseState.overallLevel,
    xp: compact.xp || baseState.xp,
    streak: compact.strk || baseState.streak,
    streakShields: compact.shlds ?? baseState.streakShields,
    currentStage: (compact.stg as any) || baseState.currentStage,
    lessonCrowns: compact.crowns || baseState.lessonCrowns,
    completedLessonIds: compact.cls || baseState.completedLessonIds,
    lastActiveDate: compact.lad || baseState.lastActiveDate,
    weekendPauseActive: compact.wp ?? baseState.weekendPauseActive,
    dailyCardsCap: compact.cap || baseState.dailyCardsCap,
    quests: restoredQuests,
    achievements: restoredAchievements,
    skills: {
      structure: compact.skills?.st || baseState.skills.structure,
      vocabulary: compact.skills?.vo || baseState.skills.vocabulary,
      listening: compact.skills?.li || baseState.skills.listening,
      speaking: compact.skills?.sp || baseState.skills.speaking,
      writing: compact.skills?.wr || baseState.skills.writing,
    },
    srsItems,
  };
}
