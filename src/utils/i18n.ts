import type { UserProfile } from '../hooks/useUserProfile';

export type UILang = 'en' | 'ar';

/**
 * Determines the UI display language from the learner's target language:
 * - Learning Arabic (`language === 'arabic'`) -> UI is in English (`'en'`)
 * - Learning English (`language === 'english'`) -> UI is in Arabic (`'ar'`)
 */
export function getUILang(learningLanguage?: UserProfile['language'] | null): UILang {
  return learningLanguage === 'english' ? 'ar' : 'en';
}

export function isArabicUI(learningLanguage?: UserProfile['language'] | null): boolean {
  return getUILang(learningLanguage) === 'ar';
}

/**
 * Returns `enText` when the user is learning Arabic (English UI),
 * and `arText` when the user is learning English (Arabic UI).
 */
export function uiText(
  learningLanguage: UserProfile['language'] | null | undefined,
  enText: string,
  arText: string
): string {
  return getUILang(learningLanguage) === 'ar' ? arText : enText;
}

