import { ConceptNode, LearnerState } from './types';
import { getUserCefrLevel } from './srs';

export interface SelectNextOptions {
  activeTrack?: 'general' | 'academic' | 'sustainability';
  now?: number;
  userLevel?: string;
}

/**
 * Deterministic concept selector:
 * Strictly filters or prioritizes cards by the user's current CEFR level.
 * 1. Due reviews first, ranked by risk (lowest ease * highest transfer_weight).
 * 2. The Frontier: prerequisites mastered (>= 0.7), current mastery < 0.7.
 * Prioritizes concepts that match the user's active track.
 */
export function selectNext(
  concepts: ConceptNode[],
  learnerStates: Record<string, LearnerState>,
  options: SelectNextOptions = {}
): ConceptNode | null {
  if (!concepts || concepts.length === 0) {
    return null;
  }

  const activeTrack = options.activeTrack || 'general';
  const now = options.now ?? Date.now();
  const targetLevel = (options.userLevel || getUserCefrLevel()).toUpperCase();

  // Strictly filter concepts by level if matching concepts exist
  const levelFiltered = concepts.filter((c) => {
    if (!c.cefr_band) return true;
    return c.cefr_band.toUpperCase().startsWith(targetLevel) || targetLevel.startsWith(c.cefr_band.toUpperCase().substring(0, 2));
  });

  const candidatePool = levelFiltered.length > 0 ? levelFiltered : concepts;

  // Helper to check if a concept belongs to the active track
  const matchesTrack = (c: ConceptNode): boolean => c.tracks.includes(activeTrack);

  // 1. DUE REVIEWS
  // A concept is due if it has been encountered before (interval > 0) and next_due <= now
  const dueReviews: { concept: ConceptNode; risk: number; trackMatch: boolean }[] = [];

  for (const concept of candidatePool) {
    const state = learnerStates[concept.id];
    if (state && state.interval > 0 && state.next_due <= now) {
      // Risk formula: highest risk = lowest ease * highest transfer_weight
      const safeEase = Math.max(state.ease, 0.1);
      const risk = concept.transfer_weight / safeEase;
      dueReviews.push({
        concept,
        risk,
        trackMatch: matchesTrack(concept)
      });
    }
  }

  if (dueReviews.length > 0) {
    dueReviews.sort((a, b) => {
      if (a.trackMatch !== b.trackMatch) {
        return a.trackMatch ? -1 : 1;
      }
      return b.risk - a.risk;
    });

    return dueReviews[0].concept;
  }

  // 2. THE FRONTIER
  // Concepts where prerequisites have mastery >= 0.7, but current concept is not yet mastered (< 0.7)
  const frontier: { concept: ConceptNode; trackMatch: boolean; weight: number }[] = [];

  for (const concept of candidatePool) {
    const currentMastery = learnerStates[concept.id]?.mastery ?? 0;
    if (currentMastery >= 0.7) {
      continue;
    }

    const prereqsMet = concept.prerequisites.every((preId) => {
      const preState = learnerStates[preId];
      return preState && preState.mastery >= 0.7;
    });

    if (prereqsMet) {
      frontier.push({
        concept,
        trackMatch: matchesTrack(concept),
        weight: concept.transfer_weight
      });
    }
  }

  if (frontier.length > 0) {
    frontier.sort((a, b) => {
      if (a.trackMatch !== b.trackMatch) {
        return a.trackMatch ? -1 : 1;
      }
      return b.weight - a.weight;
    });

    return frontier[0].concept;
  }

  // 3. Fallback
  const allCandidates = [...candidatePool].sort((a, b) => {
    const aTrack = matchesTrack(a);
    const bTrack = matchesTrack(b);
    if (aTrack !== bTrack) return aTrack ? -1 : 1;
    const aMastery = learnerStates[a.id]?.mastery ?? 0;
    const bMastery = learnerStates[b.id]?.mastery ?? 0;
    return aMastery - bMastery;
  });

  return allCandidates[0] || null;
}
