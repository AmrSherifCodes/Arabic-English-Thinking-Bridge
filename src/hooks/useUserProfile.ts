import { useCallback, useState } from 'react';
import type { FocusArea, LearningGoal, LearningStyle, UserProfile } from '../types';

export type { FocusArea, LearningGoal, LearningStyle, UserProfile };

const STORAGE_KEY = 'tb.userProfile';

const VALID_GOALS: readonly string[] = ['academic', 'travel', 'business', 'work', 'general'];
const VALID_STYLES: readonly string[] = ['visual', 'audio', 'text'];

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;

  const profile = value as Record<string, unknown>;
  const hasValidLang = profile.language === undefined || profile.language === 'english' || profile.language === 'arabic';
  const hasValidDialect = profile.dialect === undefined || profile.dialect === 'egyptian' || profile.dialect === 'msa';
  const hasValidLevel = profile.level === undefined || profile.level === 'beginner' || profile.level === 'intermediate' || profile.level === 'advanced';
  const hasValidGoal = typeof profile.goal === 'string' && VALID_GOALS.includes(profile.goal);

  return hasValidLang && hasValidDialect && hasValidLevel && hasValidGoal;
}

function readUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedProfile = window.localStorage.getItem(STORAGE_KEY);
    if (!storedProfile) return null;

    const parsed: unknown = JSON.parse(storedProfile);
    if (!isUserProfile(parsed)) return null;

    const record = parsed as unknown as UserProfile;
    return {
      ...record,
      name: typeof record.name === 'string' ? record.name.trim() : undefined,
      language: record.language ?? 'arabic',
      dialect: record.dialect ?? 'egyptian',
      level: record.level ?? 'beginner',
      learningStyle: typeof record.learningStyle === 'string' && VALID_STYLES.includes(record.learningStyle)
        ? (record.learningStyle as LearningStyle)
        : 'visual',
      focusArea: typeof record.focusArea === 'string' ? record.focusArea : 'daily-speech'
    };
  } catch {
    return null;
  }
}

export function detectBrowserLanguage(): 'arabic' | 'english' {
  if (typeof window === 'undefined') return 'arabic';
  const navLang = (navigator.language || (navigator as { userLanguage?: string }).userLanguage || '').toLowerCase();
  if (navLang.startsWith('ar')) return 'arabic';
  return 'english';
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
