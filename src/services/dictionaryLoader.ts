import { useEffect, useState } from 'react';
import type { DifficultyLevel, LexiconEntry, Situation } from './geminiLexicon';
import type { UserProfile } from '../hooks/useUserProfile';
import { isValidEntry } from '../data/staticDictionary';

export const MASTER_DICTIONARY_STORAGE_KEY = 'tb.masterDictionary';

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

export function filterDictionaryForProfile(
  entries: LexiconEntry[],
  profile: UserProfile
): LexiconEntry[] {
  const levelLimit = LEVEL_RANK[profile.level];
  const situation = getSituationForGoal(profile.goal);
  return entries.filter(
    entry =>
      (entry.level === undefined || LEVEL_RANK[entry.level] <= levelLimit) &&
      (entry.dialect ?? 'msa') === profile.dialect &&
      entry.situations.includes(situation)
  );
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
    window.localStorage.setItem(MASTER_DICTIONARY_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Could not save the master dictionary to localStorage.', error);
  }
}

export function useMasterDictionary(): { entries: LexiconEntry[] } {
  const [entries, setEntries] = useState<LexiconEntry[]>(readCachedDictionary);

  useEffect(() => {
    const controller = new AbortController();

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
      }
    }

    void loadDictionary();
    return () => controller.abort();
  }, []);

  return { entries };
}
