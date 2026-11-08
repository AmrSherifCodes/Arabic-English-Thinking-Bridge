import { useState, useEffect, useCallback, useMemo } from 'react';
import { SourceLanguage, TargetLanguage, LanguagePair } from '../types';
import { getPairConfig, isValidPair, SOURCE_LANGUAGES, SUPPORTED_PAIRS, TARGET_LANGUAGES } from '../data/languages';
import i18n from '../i18n';

const SOURCE_STORAGE_KEY = 'tb.sourceLang';
const TARGET_STORAGE_KEY = 'tb.targetLang';

function isTargetLanguage(code: string): code is TargetLanguage {
  return TARGET_LANGUAGES.some((language) => language.code === code);
}

function isSourceLanguage(code: string): code is SourceLanguage {
  return Object.prototype.hasOwnProperty.call(SOURCE_LANGUAGES, code);
}

/** Arabic and all of its dialects share the Arabic UI direction. */
function isArabicSource(code: string): boolean {
  return code.startsWith('ar');
}

function getInitialPair(): LanguagePair {
  let source: SourceLanguage = 'ar';
  let target: TargetLanguage = 'en';

  if (typeof window !== 'undefined') {
    try {
      // 1. Check URL query parameters (e.g. ?from=ar&to=de or ?source=en&target=ja)
      const params = new URLSearchParams(window.location.search);
      const urlFrom = (params.get('from') || params.get('source') || '').toLowerCase();
      const urlTo = (params.get('to') || params.get('target') || '').toLowerCase();

      if (isSourceLanguage(urlFrom)) {
        source = urlFrom;
      }
      if (isTargetLanguage(urlTo)) {
        target = urlTo;
      }

      // If URL had valid parameters, return immediately
      if (urlFrom || urlTo) {
        if (!isValidPair(source, target)) {
          target = SUPPORTED_PAIRS.find((pair) => pair.source === source)?.target || 'en';
        }
        return { source, target };
      }

      // 2. Check localStorage
      const storedSource = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      const storedTarget = window.localStorage.getItem(TARGET_STORAGE_KEY);

      // Fall back to the onboarding profile so the header matches the dialect
      // the learner picked (for example Egyptian Arabic -> arz).
      let profileSource: unknown;
      let profileTarget: unknown;
      try {
        const profileRaw = window.localStorage.getItem('tb.userProfile');
        const activeRaw = window.localStorage.getItem('tb.activeProfileConfig');
        const profile = profileRaw ? JSON.parse(profileRaw) : null;
        const active = activeRaw ? JSON.parse(activeRaw) : null;
        profileSource = profile?.sourceLanguage ?? active?.sourceLang;
        profileTarget = profile?.targetLanguage ?? active?.targetLang;
      } catch {
        // Ignore malformed profile data
      }

      if (storedSource && isSourceLanguage(storedSource)) {
        source = storedSource;
      } else if (typeof profileSource === 'string' && isSourceLanguage(profileSource)) {
        source = profileSource;
      }
      if (storedTarget && isTargetLanguage(storedTarget)) {
        target = storedTarget;
      } else if (typeof profileTarget === 'string' && isTargetLanguage(profileTarget)) {
        target = profileTarget;
      } else {
        // Check old tb.language
        const legacyLang = window.localStorage.getItem('tb.language');
        if (legacyLang === 'en') {
          source = 'en';
        }
      }
      if (!isValidPair(source, target)) {
        target = SUPPORTED_PAIRS.find((pair) => pair.source === source)?.target || 'en';
      }
    } catch {
      // Non-browser fallback
    }
  }

  return { source, target };
}

export function useLanguagePair() {
  const [pair, setPairState] = useState<LanguagePair>(getInitialPair);

  // Sync to document, i18n, localStorage, and URL
  const applyPair = useCallback((newSource: SourceLanguage, newTarget: TargetLanguage) => {
    const target = isValidPair(newSource, newTarget)
      ? newTarget
      : SUPPORTED_PAIRS.find((pair) => pair.source === newSource)?.target || 'en';
    setPairState({ source: newSource, target });

    if (typeof window !== 'undefined') {
      try {
        const uiLang = isArabicSource(newSource) ? 'ar' : 'en';
        window.localStorage.setItem(SOURCE_STORAGE_KEY, newSource);
        window.localStorage.setItem(TARGET_STORAGE_KEY, target);
        window.localStorage.setItem('tb.language', uiLang);

        const activeProfileRaw = window.localStorage.getItem('tb.activeProfileConfig');
        if (activeProfileRaw) {
          try {
            const activeProfile: unknown = JSON.parse(activeProfileRaw);
            if (typeof activeProfile === 'object' && activeProfile !== null && !Array.isArray(activeProfile)) {
              window.localStorage.setItem(
                'tb.activeProfileConfig',
                JSON.stringify({ ...activeProfile, sourceLang: newSource, targetLang: target })
              );
            }
          } catch (error) {
            console.warn('Unable to sync the active profile language pair.', error);
          }
        }

        // Sync URL query params without page reload for sharing
        const url = new URL(window.location.href);
        if (newSource === 'ar' && target === 'en') {
          // Clean default params for clean aesthetics
          url.searchParams.delete('from');
          url.searchParams.delete('to');
          url.searchParams.delete('source');
          url.searchParams.delete('target');
        } else {
          url.searchParams.set('from', newSource);
          url.searchParams.set('to', target);
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Storage / URL fallback
      }
    }

    // Sync i18n & HTML dir
    const uiLang = isArabicSource(newSource) ? 'ar' : 'en';
    void i18n.changeLanguage(uiLang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newSource;
    }
  }, []);

  const setSourceLang = useCallback((source: SourceLanguage) => {
    applyPair(source, pair.target);
  }, [applyPair, pair.target]);

  const setTargetLang = useCallback((target: TargetLanguage) => {
    applyPair(pair.source, target);
  }, [applyPair, pair.source]);

  const setPair = useCallback((source: SourceLanguage, target: TargetLanguage) => {
    applyPair(source, target);
  }, [applyPair]);

  // Initial mount sync for direction and i18n
  useEffect(() => {
    const uiLang = isArabicSource(pair.source) ? 'ar' : 'en';
    void i18n.changeLanguage(uiLang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = pair.source;
    }
  }, [pair.source]);

  const pairConfig = useMemo(() => {
    return getPairConfig(pair.source, pair.target);
  }, [pair.source, pair.target]);

  return {
    sourceLang: pair.source,
    targetLang: pair.target,
    pair,
    pairConfig,
    setPair,
    setSourceLang,
    setTargetLang,
    isArabicUI: pair.source === 'ar',
    isJapaneseTarget: pair.target === 'ja',
    isGermanTarget: pair.target === 'de',
    isEnglishTarget: pair.target === 'en',
    supportedPairs: SUPPORTED_PAIRS
  };
}
