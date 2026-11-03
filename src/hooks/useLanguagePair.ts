import { useState, useEffect, useCallback, useMemo } from 'react';
import { SourceLanguage, TargetLanguage, LanguagePair } from '../types';
import { getPairConfig, isValidPair, SUPPORTED_PAIRS } from '../data/languages';
import i18n from '../i18n';

const SOURCE_STORAGE_KEY = 'tb.sourceLang';
const TARGET_STORAGE_KEY = 'tb.targetLang';

function getInitialPair(): LanguagePair {
  let source: SourceLanguage = 'ar';
  let target: TargetLanguage = 'en';

  if (typeof window !== 'undefined') {
    try {
      // 1. Check URL query parameters (e.g. ?from=ar&to=de or ?source=en&target=ja)
      const params = new URLSearchParams(window.location.search);
      const urlFrom = (params.get('from') || params.get('source') || '').toLowerCase();
      const urlTo = (params.get('to') || params.get('target') || '').toLowerCase();

      if (urlFrom === 'ar' || urlFrom === 'en') {
        source = urlFrom;
      }
      if (urlTo === 'en' || urlTo === 'de' || urlTo === 'ja') {
        target = urlTo;
      }

      // If URL had valid parameters, return immediately
      if (urlFrom || urlTo) {
        return { source, target };
      }

      // 2. Check localStorage
      const storedSource = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      const storedTarget = window.localStorage.getItem(TARGET_STORAGE_KEY);

      if (storedSource === 'ar' || storedSource === 'en') {
        source = storedSource;
      }
      if (storedTarget === 'en' || storedTarget === 'de' || storedTarget === 'ja') {
        target = storedTarget;
      } else {
        // Check old tb.language or tb.userProfile
        const legacyLang = window.localStorage.getItem('tb.language');
        if (legacyLang === 'en') {
          source = 'en';
        }
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
    setPairState({ source: newSource, target: newTarget });

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SOURCE_STORAGE_KEY, newSource);
        window.localStorage.setItem(TARGET_STORAGE_KEY, newTarget);
        window.localStorage.setItem('tb.language', newSource);

        // Sync URL query params without page reload for sharing
        const url = new URL(window.location.href);
        if (newSource === 'ar' && newTarget === 'en') {
          // Clean default params for clean aesthetics
          url.searchParams.delete('from');
          url.searchParams.delete('to');
          url.searchParams.delete('source');
          url.searchParams.delete('target');
        } else {
          url.searchParams.set('from', newSource);
          url.searchParams.set('to', newTarget);
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Storage / URL fallback
      }
    }

    // Sync i18n & HTML dir
    void i18n.changeLanguage(newSource);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newSource === 'ar' ? 'rtl' : 'ltr';
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
    void i18n.changeLanguage(pair.source);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = pair.source === 'ar' ? 'rtl' : 'ltr';
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

