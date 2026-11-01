import type { UserProfile } from '../hooks/useUserProfile';
import i18n from '../i18n';
export { useTranslation } from 'react-i18next';
export { default as i18n } from '../i18n';

export type UILang = 'en' | 'ar';

/**
 * Determines the UI display language from the learner's target language:
 * - Learning Arabic (`language === 'arabic'`) -> UI is in English (`'en'`)
 * - Learning English (`language === 'english'`) -> UI is in Arabic (`'ar'`)
 */
export function getUILang(learningLanguage?: UserProfile['language'] | null): UILang {
  if (learningLanguage === 'english') return 'ar';
  if (learningLanguage === 'arabic') return 'en';
  return (i18n.language === 'en' ? 'en' : 'ar') as UILang;
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

/**
 * Direct typed translation lookup helper backed by i18next dictionary
 */
export function translateKey(key: string, defaultValue?: string): string {
  return i18n.t(key, defaultValue || key);
}
