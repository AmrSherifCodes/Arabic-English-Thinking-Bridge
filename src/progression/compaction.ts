import { ProgressionState, SrsItemRecord } from './types';

export const MAX_STATE_SIZE_BYTES = 65536; // 64 KB limit

export interface CompactSrsItem {
  id: string;
  s: number; // stability
  d: number; // difficulty
  l: number; // lapses
  r: number; // reviews
  due: number; // dueAt timestamp
}

export interface CompactUserState {
  v: number;
  lvl: number;
  xp: number;
  strk: number;
  shlds: number;
  stg: string;
  crowns: Record<string, number>;
  skills: { st: number; vo: number; li: number; sp: number; wr: number };
  srs: CompactSrsItem[];
  ts: number;
}

/**
 * Compacts full ProgressionState into an ultra-lean JSON payload.
 * Only reviewed SRS cards are stored. Card definitions & unreviewed cards are EXCLUDED.
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

  const compact: CompactUserState = {
    v: state.version || 2,
    lvl: state.overallLevel,
    xp: state.xp,
    strk: state.streak,
    shlds: state.streakShields,
    stg: state.currentStage,
    crowns: state.lessonCrowns,
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
 * Decompacts payload back into ProgressionState.
 */
export function decompactUserState(
  compact: CompactUserState,
  baseState: ProgressionState
): ProgressionState {
  const srsItems: Record<string, SrsItemRecord> = { ...baseState.srsItems };

  (compact.srs || []).forEach((c) => {
    srsItems[c.id] = {
      id: c.id,
      term: c.id,
      sourceText: c.id,
      targetText: c.id,
      targetLang: 'en',
      stability: c.s,
      difficulty: c.d,
      lapses: c.l,
      reviews: c.r,
      lastReviewedAt: compact.ts,
      dueAt: c.due,
    };
  });

  return {
    ...baseState,
    overallLevel: compact.lvl || baseState.overallLevel,
    xp: compact.xp || baseState.xp,
    streak: compact.strk || baseState.streak,
    streakShields: compact.shlds || baseState.streakShields,
    currentStage: (compact.stg as any) || baseState.currentStage,
    lessonCrowns: compact.crowns || baseState.lessonCrowns,
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
