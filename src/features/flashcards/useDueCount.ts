import { useMemo } from 'react';
import { useMasterDictionary, filterDictionaryForProfile } from '../../services/dictionaryLoader';
import { STATIC_DICTIONARY } from '../../data/staticDictionary';
import { UserProfile, UserProgress } from '../../types';
import { getDeckStats } from './deckUtils';

export function useDueCount(profile: UserProfile | null, progress: UserProgress): number {
  const { entries: masterDictionary } = useMasterDictionary();

  return useMemo(() => {
    const profileMatchedMaster = profile ? filterDictionaryForProfile(masterDictionary, profile) : masterDictionary;
    const profileMatchedStatic = profile ? filterDictionaryForProfile(STATIC_DICTIONARY, profile) : STATIC_DICTIONARY;
    const dictionaryEntries = masterDictionary.length > 0 ? profileMatchedMaster : profileMatchedStatic;
    const stats = getDeckStats('all', progress, dictionaryEntries, profile);
    return stats.newCount + stats.learningCount + stats.dueCount;
  }, [masterDictionary, profile, progress]);
}
