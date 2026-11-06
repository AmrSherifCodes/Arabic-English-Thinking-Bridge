import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';

/**
 * Detect browser language:
 * Defaults to Arabic ('ar') if browser language is Arabic or if in Arab region.
 */
export function getInitialLanguage(): 'ar' | 'en' | 'tr' {
  if (typeof window === 'undefined') return 'ar';
  try {
    const stored = window.localStorage.getItem('tb.language');
    if (stored === 'ar' || stored === 'en' || stored === 'tr') return stored as 'ar' | 'en' | 'tr';
    
    // Check user profile if set
    const userProfileStr = window.localStorage.getItem('tb.userProfile');
    if (userProfileStr) {
      const parsed = JSON.parse(userProfileStr);
      if (parsed?.language === 'english') return 'ar'; // English learner uses Arabic UI
      if (parsed?.language === 'arabic') return 'en';
    }

    const navLang = (navigator.language || (navigator as { userLanguage?: string }).userLanguage || '').toLowerCase();
    if (navLang.startsWith('ar')) return 'ar';
    return 'ar'; // Default to Arabic-first as per Constitution
  } catch {
    return 'ar';
  }
}

const initialLang = getInitialLanguage();

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      tr: { translation: tr }
    },
    lng: initialLang,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

// Keep document direction aligned with language
if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    window.localStorage.setItem('tb.language', lng);
  }
});

export default i18n;

