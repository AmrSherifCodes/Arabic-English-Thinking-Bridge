// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useEffect, useState } from 'react';
import i18n from '../i18n';

export type GuideMode = 'egyptian_ar' | 'standard_ar' | 'english_guided';
export type LearnerTrack = 'starter' | 'school_igcse' | 'uni_career' | 'teacher';

export interface GuidePreferences {
  guideMode: GuideMode;
  learnerTrack: LearnerTrack;
  setupCompleted: boolean;
}

export const GUIDE_MODE_STORAGE_KEY = 'tb.guideMode.v1';
export const GUIDE_MODE_CHANGE_EVENT = 'tb:guide-mode-changed';

const VALID_GUIDE_MODES: readonly GuideMode[] = [
  'egyptian_ar',
  'standard_ar',
  'english_guided',
];

const VALID_TRACKS: readonly LearnerTrack[] = [
  'starter',
  'school_igcse',
  'uni_career',
  'teacher',
];

function isValidGuideMode(v: unknown): v is GuideMode {
  return typeof v === 'string' && (VALID_GUIDE_MODES as readonly string[]).includes(v);
}

function isValidTrack(v: unknown): v is LearnerTrack {
  return typeof v === 'string' && (VALID_TRACKS as readonly string[]).includes(v);
}

function inferDefaultGuideMode(): GuideMode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const lang = window.localStorage.getItem('tb.language');
      if (lang === 'en') return 'english_guided';
      const userProfileStr = window.localStorage.getItem('tb.userProfile');
      if (userProfileStr) {
        const parsed = JSON.parse(userProfileStr) as { language?: string; dialect?: string } | null;
        if (parsed?.language === 'english') return 'english_guided';
        if (parsed?.dialect === 'msa') return 'standard_ar';
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return 'egyptian_ar';
}

let _inMemoryPrefs: GuidePreferences | null = null;

export function getGuidePreferences(): GuidePreferences {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(GUIDE_MODE_STORAGE_KEY);
      if (raw) {
        // Support both JSON object and plain string (for resilience)
        if (isValidGuideMode(raw)) {
          return {
            guideMode: raw,
            learnerTrack: 'starter',
            setupCompleted: true,
          };
        }
        const parsed = JSON.parse(raw) as Partial<GuidePreferences> | null;
        if (parsed && typeof parsed === 'object') {
          return {
            guideMode: isValidGuideMode(parsed.guideMode)
              ? parsed.guideMode
              : inferDefaultGuideMode(),
            learnerTrack: isValidTrack(parsed.learnerTrack)
              ? parsed.learnerTrack
              : 'starter',
            setupCompleted: Boolean(parsed.setupCompleted),
          };
        }
      }
    }
  } catch {
    // Ignore malformed localStorage
  }

  if (_inMemoryPrefs) return _inMemoryPrefs;
  return {
    guideMode: inferDefaultGuideMode(),
    learnerTrack: 'starter',
    setupCompleted: false,
  };
}

export function getGuideMode(): GuideMode {
  return getGuidePreferences().guideMode;
}

export function getLearnerTrack(): LearnerTrack {
  return getGuidePreferences().learnerTrack;
}

export function hasCompletedUserSetup(): boolean {
  return getGuidePreferences().setupCompleted;
}

export function isArabicGuideMode(mode: GuideMode): boolean {
  return mode !== 'english_guided';
}

export function syncGuideDocumentDirection(mode: GuideMode): void {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const isAr = isArabicGuideMode(mode);
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  document.documentElement.lang = isAr ? 'ar' : 'en';
  document.documentElement.dataset.guideMode = mode;
}

export function saveGuidePreferences(
  patch: Partial<GuidePreferences>
): GuidePreferences {
  const current = getGuidePreferences();
  const next: GuidePreferences = {
    guideMode: isValidGuideMode(patch.guideMode) ? patch.guideMode : current.guideMode,
    learnerTrack: isValidTrack(patch.learnerTrack) ? patch.learnerTrack : current.learnerTrack,
    setupCompleted:
      typeof patch.setupCompleted === 'boolean'
        ? patch.setupCompleted
        : current.setupCompleted,
  };

  _inMemoryPrefs = next;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(GUIDE_MODE_STORAGE_KEY, JSON.stringify(next));
      window.localStorage.setItem(
        'tb.language',
        next.guideMode === 'english_guided' ? 'en' : 'ar'
      );
    }
  } catch {
    // Ignore storage quota errors
  }

  syncGuideDocumentDirection(next.guideMode);

  // Sync i18next language cleanly without triggering loops
  const targetI18nLang = next.guideMode === 'english_guided' ? 'en' : 'ar';
  if (i18n.language !== targetI18nLang) {
    void i18n.changeLanguage(targetI18nLang);
  }

  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent(GUIDE_MODE_CHANGE_EVENT, { detail: next })
      );
    }
  } catch {
    // Ignore dispatch errors
  }

  return next;
}

export function setGuideMode(mode: GuideMode): GuidePreferences {
  return saveGuidePreferences({ guideMode: mode });
}

export function setLearnerTrack(track: LearnerTrack): GuidePreferences {
  return saveGuidePreferences({ learnerTrack: track });
}

export function markUserSetupCompleted(): GuidePreferences {
  return saveGuidePreferences({ setupCompleted: true });
}

export function useGuidePreferences() {
  const [prefs, setPrefs] = useState<GuidePreferences>(() => getGuidePreferences());

  useEffect(() => {
    const onCustomChange = (e: Event) => {
      const detail = (e as CustomEvent<GuidePreferences>).detail;
      if (detail && isValidGuideMode(detail.guideMode)) {
        setPrefs(detail);
      } else {
        setPrefs(getGuidePreferences());
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === GUIDE_MODE_STORAGE_KEY || e.key === 'tb.language') {
        setPrefs(getGuidePreferences());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(GUIDE_MODE_CHANGE_EVENT, onCustomChange);
      window.addEventListener('storage', onStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(GUIDE_MODE_CHANGE_EVENT, onCustomChange);
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  return {
    guideMode: prefs.guideMode,
    learnerTrack: prefs.learnerTrack,
    setupCompleted: prefs.setupCompleted,
    isArabicGuide: isArabicGuideMode(prefs.guideMode),
    isEnglishGuided: prefs.guideMode === 'english_guided',
    isStandardArabic: prefs.guideMode === 'standard_ar',
    isEgyptianArabic: prefs.guideMode === 'egyptian_ar',
    setGuideMode: (mode: GuideMode) => setPrefs(saveGuidePreferences({ guideMode: mode })),
    setLearnerTrack: (track: LearnerTrack) =>
      setPrefs(saveGuidePreferences({ learnerTrack: track })),
    savePreferences: (patch: Partial<GuidePreferences>) =>
      setPrefs(saveGuidePreferences(patch)),
  };
}

export function getGuideModeBadge(mode: GuideMode): {
  icon: string;
  shortLabel: string;
  fullLabelAr: string;
  fullLabelEn: string;
} {
  switch (mode) {
    case 'standard_ar':
      return {
        icon: '📖',
        shortLabel: 'فصيح',
        fullLabelAr: 'عربي فصيح',
        fullLabelEn: 'Standard Arabic',
      };
    case 'english_guided':
      return {
        icon: '🌍',
        shortLabel: 'EN',
        fullLabelAr: 'English-Guided',
        fullLabelEn: 'English-Guided',
      };
    case 'egyptian_ar':
    default:
      return {
        icon: '🇪🇬',
        shortLabel: 'مصري',
        fullLabelAr: 'مصري بسيط',
        fullLabelEn: 'Everyday Egyptian',
      };
  }
}

export function getLearnerTrackMeta(track: LearnerTrack): {
  icon: string;
  labelEg: string;
  labelMsa: string;
  labelEn: string;
  recommendedLevel: 'A1' | 'A2' | 'B1';
} {
  switch (track) {
    case 'school_igcse':
      return {
        icon: '🎒',
        labelEg: 'مدرسة / IGCSE',
        labelMsa: 'المدرسة / IGCSE',
        labelEn: 'School & IGCSE',
        recommendedLevel: 'A2',
      };
    case 'uni_career':
      return {
        icon: '🚀',
        labelEg: 'جامعة وشغل',
        labelMsa: 'الجامعة والعمل',
        labelEn: 'Uni & Career',
        recommendedLevel: 'B1',
      };
    case 'teacher':
      return {
        icon: '🏫',
        labelEg: 'معلم / سنتر',
        labelMsa: 'معلم / مركز تعليمي',
        labelEn: 'Teacher / Center',
        recommendedLevel: 'A1',
      };
    case 'starter':
    default:
      return {
        icon: '🌱',
        labelEg: 'بداية من الصفر',
        labelMsa: 'مبتدئ من الصفر',
        labelEn: 'Complete Beginner',
        recommendedLevel: 'A1',
      };
  }
}
