import { useCallback, useState } from 'react';

export interface UserProfile {
  language: 'english' | 'arabic';
  dialect: 'egyptian' | 'msa';
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'travel' | 'work' | 'general';
}

const STORAGE_KEY = 'tb.userProfile';

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;

  const profile = value as Record<string, unknown>;
  return (
    (profile.language === 'english' || profile.language === 'arabic') &&
    (profile.dialect === undefined ||
      profile.dialect === 'egyptian' ||
      profile.dialect === 'msa') &&
    (profile.level === 'beginner' ||
      profile.level === 'intermediate' ||
      profile.level === 'advanced') &&
    (profile.goal === 'travel' || profile.goal === 'work' || profile.goal === 'general')
  );
}

function readUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedProfile = window.localStorage.getItem(STORAGE_KEY);
    if (!storedProfile) return null;

    const parsed: unknown = JSON.parse(storedProfile);
    return isUserProfile(parsed)
      ? { ...parsed, dialect: parsed.dialect ?? 'egyptian' }
      : null;
  } catch {
    return null;
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(readUserProfile);

  const saveProfile = useCallback((nextProfile: UserProfile) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
  }, []);

  const clearProfile = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  return { profile, saveProfile, clearProfile };
}
