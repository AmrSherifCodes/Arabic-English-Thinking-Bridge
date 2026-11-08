import type { UserProfile } from '../hooks/useUserProfile';
import i18n from '../i18n';
export { useTranslation } from 'react-i18next';
export { default as i18n } from '../i18n';

export type UILang = 'en' | 'ar';

/**
 * Determines the UI display language from the learner's native language:
 * - Native Arabic (`language === 'arabic'`) -> Arabic UI (`'ar'`)
 * - Non-Arabic native (`language === 'english'`) -> English UI (`'en'`)
 */
export function getUILang(learningLanguage?: UserProfile['language'] | null): UILang {
  if (learningLanguage === 'arabic') return 'ar';
  if (learningLanguage === 'english') return 'en';
  return (i18n.language === 'en' ? 'en' : 'ar') as UILang;
}

export function isArabicUI(learningLanguage?: UserProfile['language'] | null): boolean {
  return getUILang(learningLanguage) === 'ar';
}

/**
 * Returns `arText` for Arabic-native learners and `enText` for everyone else.
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
