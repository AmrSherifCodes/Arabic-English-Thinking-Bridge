import { useEffect, useState } from 'react';
import type { DifficultyLevel, LexiconEntry, Situation } from './geminiLexicon';
import type { UserProfile } from '../hooks/useUserProfile';
import { isValidEntry } from '../data/staticDictionary';

export const MASTER_DICTIONARY_STORAGE_KEY = 'tb.masterDictionary.v2';
const MAX_LOCALSTORAGE_ENTRIES = 1500;
const DICTIONARY_FETCH_TIMEOUT_MS = 15_000;

const LEVEL_RANK: Record<DifficultyLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function getSituationForGoal(goal: UserProfile['goal']): Situation {
  if (goal === 'work') return 'call-center';
  if (goal === 'travel') return 'public-matter';
  return 'student';
}

/**
 * Strictly filters dictionary entries so `entry.dialect === profile.dialect` is NEVER violated.
 * - First matches dialect + level + situation.
 * - If no entries match the narrow level+situation slice, widens to any entry of the SAME `profile.dialect`
 *   (never falling back to MSA when `profile.dialect === 'egyptian'`, or vice-versa).
 */
export function filterDictionaryForProfile(
  entries: LexiconEntry[],
  profile: UserProfile
): LexiconEntry[] {
  const levelLimit = LEVEL_RANK[profile.level];
  const situation = getSituationForGoal(profile.goal);

  const sameDialectEntries = entries.filter(
    entry => entry.dialect === profile.dialect
  );

  const strictMatches = sameDialectEntries.filter(
    entry =>
      (entry.level === undefined || LEVEL_RANK[entry.level] <= levelLimit) &&
      entry.situations.includes(situation)
  );

  if (strictMatches.length > 0) {
    return strictMatches;
  }

  return sameDialectEntries;
}

function readCachedDictionary(): LexiconEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MASTER_DICTIONARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Cached master dictionary is not an array; ignoring it.');
      return [];
    }

    const validEntries = parsed.filter(isValidEntry);
    if (validEntries.length !== parsed.length) {
      console.warn(`Ignored ${parsed.length - validEntries.length} invalid cached dictionary entries.`);
    }
    return validEntries;
  } catch (error) {
    console.warn('Could not read the cached master dictionary.', error);
    return [];
  }
}

function cacheDictionary(entries: LexiconEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const halfCap = Math.floor(MAX_LOCALSTORAGE_ENTRIES / 2);
    const egyptianSlice = entries.filter(e => e.dialect === 'egyptian').slice(0, halfCap);
    const msaSlice = entries.filter(e => e.dialect === 'msa').slice(0, MAX_LOCALSTORAGE_ENTRIES - egyptianSlice.length);
    const sliceToCache = [...egyptianSlice, ...msaSlice];
    window.localStorage.setItem(MASTER_DICTIONARY_STORAGE_KEY, JSON.stringify(sliceToCache));
  } catch (error) {
    console.warn('Could not save the master dictionary to localStorage.', error);
  }
}

export function useMasterDictionary(): { entries: LexiconEntry[] } {
  const [entries, setEntries] = useState<LexiconEntry[]>(readCachedDictionary);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), DICTIONARY_FETCH_TIMEOUT_MS);

    async function loadDictionary() {
      try {
        const response = await fetch('/dictionary.json', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Dictionary request failed: ${response.status} ${response.statusText}`);
        }

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error('Dictionary response must be a JSON array.');
        }

        const validEntries = payload.filter(isValidEntry);
        if (payload.length > 0 && validEntries.length === 0) {
          throw new Error('Dictionary response contained no valid lexicon entries.');
        }
        if (validEntries.length !== payload.length) {
          console.warn(`Ignored ${payload.length - validEntries.length} invalid dictionary entries.`);
        }

        cacheDictionary(validEntries);
        setEntries(validEntries);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('Could not load the master dictionary; using cached or static entries.', error);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadDictionary();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return { entries };
}
