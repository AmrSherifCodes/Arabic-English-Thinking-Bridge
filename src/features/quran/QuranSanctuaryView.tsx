// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Gauge,
  Heart,
  Loader2,
  Moon,
  Pause,
  Play,
  Repeat,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import {
  EchoPauseSeconds,
  EchoRepeatCount,
  FadeStage,
  JUZ_INDEX,
  QURAN_RECITERS,
  QuranAyah,
  QuranHifzStoreState,
  QuranReciterId,
  QuranSurahData,
  QuranVerseSearchHit,
  SURAH_INDEX,
  SurahMeta,
  advanceEchoShadowing,
  buildAyahAudioFallbackChain,
  clampFontScale,
  computeWordMask,
  fetchSurahWithCache,
  getSurahMeta,
  loadHifzState,
  saveHifzState,
  searchQuranVersesOffline,
  searchSurahs,
  stripBismillahPrefix,
  toggleBookmark,
  tokenizeAyahWords,
} from './hifzEngine';

interface QuranSanctuaryViewProps {
  onBack: () => void;
  onSwitchToLanguages?: () => void;
  isArabic?: boolean;
}

type PlaybackSpeed = 0.75 | 1.0 | 1.25;
type IndexSheetTab = 'surahs' | 'juz' | 'jump';

const BISMILLAH_UTHMANI = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const DEDICATION_AR = 'صدقة جارية على جميع أموات المسلمين — مجاني بالكامل مدى الحياة';
const DEDICATION_EN = 'Sadaqah Jariyah for all deceased Muslims — 100% Free Forever';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] ?? d);
}

export function QuranSanctuaryView({
  onBack,
  isArabic = true,
}: QuranSanctuaryViewProps) {
  const [hifzState, setHifzState] = useState<QuranHifzStoreState>(() => loadHifzState());

  // Active Surah & Ayah state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(
    () => loadHifzState().lastSurahNumber || 1
  );
  const [surahData, setSurahData] = useState<QuranSurahData | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [surahError, setSurahError] = useState<string | null>(null);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(
    () => loadHifzState().lastAyahNumber || 1
  );

  // Sheets (Settings Bottom Sheet & Index/Search Sheet)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [indexTab, setIndexTab] = useState<IndexSheetTab>('surahs');

  // Instant Surah + Offline Verse Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [verseHits, setVerseHits] = useState<QuranVerseSearchHit[]>([]);
  const [searchingVerses, setSearchingVerses] = useState(false);

  // Direct Ayah Jumper state
  const [jumpSurah, setJumpSurah] = useState<number>(selectedSurahNumber);
  const [jumpAyah, setJumpAyah] = useState<number>(1);

  // Hifz & Study settings (controlled cleanly from Settings Sheet & 4-button Bottom Dock)
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [repeatCount, setRepeatCount] = useState<EchoRepeatCount>(3);
  const [pauseSeconds, setPauseSeconds] = useState<EchoPauseSeconds>(0);
  const [chunkSize, setChunkSize] = useState<1 | 3>(3);
  const [fadeStage, setFadeStage] = useState<FadeStage>(0);
  const [revealedWordKeys, setRevealedWordKeys] = useState<Record<string, boolean>>({});
  const [showTafsir, setShowTafsir] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [silenceLeft, setSilenceLeft] = useState<number | null>(null);
  const [currentRepeatNum, setCurrentRepeatNum] = useState<number>(1);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playSessionIdRef = useRef<number>(0);
  const playbackSpeedRef = useRef<PlaybackSpeed>(1.0);
  const repeatCountRef = useRef<EchoRepeatCount>(3);
  const pauseSecondsRef = useRef<EchoPauseSeconds>(0);
  const reciterIdRef = useRef<QuranReciterId>(hifzState.reciterId);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const revealTimersRef = useRef<Record<string, number>>({});
  const pauseTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const pendingResumeRef = useRef<{
    ayahs: QuranAyah[];
    ayahIdx: number;
    repeatIdx: number;
  } | null>(null);
  const pendingScrollAyahRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    repeatCountRef.current = repeatCount;
  }, [repeatCount]);

  useEffect(() => {
    pauseSecondsRef.current = pauseSeconds;
  }, [pauseSeconds]);

  useEffect(() => {
    reciterIdRef.current = hifzState.reciterId;
  }, [hifzState.reciterId]);

  const updateHifzState = useCallback(
    (updater: (prev: QuranHifzStoreState) => QuranHifzStoreState) => {
      setHifzState((prev) => {
        const next = updater(prev);
        saveHifzState(next);
        return next;
      });
    },
    []
  );

  const clearAllRevealTimers = useCallback(() => {
    for (const timerId of Object.values(revealTimersRef.current)) {
      window.clearTimeout(timerId);
    }
    revealTimersRef.current = {};
    setRevealedWordKeys({});
  }, []);

  const clearEchoTimers = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setSilenceLeft(null);
  }, []);

  const stopAllAudio = useCallback(() => {
    playSessionIdRef.current += 1;
    pendingResumeRef.current = null;
    clearEchoTimers();
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onwaiting = null;
      audioRef.current.onplaying = null;
      audioRef.current.oncanplay = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setAudioLoading(false);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentRepeatNum(1);
  }, [clearEchoTimers]);

  useEffect(() => {
    return () => {
      clearAllRevealTimers();
      stopAllAudio();
    };
  }, [clearAllRevealTimers, stopAllAudio]);

  const scrollToAyah = useCallback((ayahNumber: number, instant = false) => {
    const el = ayahRefs.current[ayahNumber];
    if (!el) return;
    try {
      el.scrollIntoView({
        behavior: instant ? 'auto' : 'smooth',
        block: 'center',
      });
    } catch {
      // Ignore WebView scroll errors
    }
  }, []);

  const loadSurah = useCallback(
    async (surahNum: number, targetAyah = 1) => {
      stopAllAudio();
      clearAllRevealTimers();
      setSelectedSurahNumber(surahNum);
      setActiveAyahNumber(targetAyah);
      setJumpSurah(surahNum);
      setJumpAyah(targetAyah);
      setAudioError(null);
      setSurahError(null);
      setLoadingSurah(true);
      pendingScrollAyahRef.current = targetAyah > 1 ? targetAyah : null;

      updateHifzState((prev) => ({
        ...prev,
        lastSurahNumber: surahNum,
        lastAyahNumber: targetAyah,
      }));

      try {
        const result = await fetchSurahWithCache(surahNum, {
          apiBaseUrl: API_BASE_URL,
        });
        setSurahData(result.data);
      } catch {
        setSurahData(null);
        setSurahError(
          isArabic
            ? 'تعذّر تحميل السورة حالياً. حاول مرة أخرى.'
            : 'Could not load this Surah right now. Please retry.'
        );
      } finally {
        setLoadingSurah(false);
      }
    },
    [clearAllRevealTimers, isArabic, stopAllAudio, updateHifzState]
  );

  // Initial load of saved Surah & Ayah
  useEffect(() => {
    const initial = loadHifzState();
    void loadSurah(initial.lastSurahNumber || 1, initial.lastAyahNumber || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to target Ayah after Surah renders
  useEffect(() => {
    if (!surahData) return;
    const target = pendingScrollAyahRef.current;
    if (target && target > 1) {
      pendingScrollAyahRef.current = null;
      const timer = window.setTimeout(() => scrollToAyah(target, false), 120);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    return undefined;
  }, [surahData, scrollToAyah]);

  // Debounced offline verse search across all 114 Surah JSONs
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!indexOpen || trimmed.length < 2 || /^\d+$/.test(trimmed)) {
      setVerseHits([]);
      setSearchingVerses(false);
      return undefined;
    }

    let cancelled = false;
    setSearchingVerses(true);
    const timer = window.setTimeout(() => {
      void searchQuranVersesOffline(trimmed, { limit: 30 }).then((hits) => {
        if (!cancelled) {
          setVerseHits(hits);
          setSearchingVerses(false);
        }
      });
    }, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [indexOpen, searchQuery]);

  // Audio playback engine with 3-reciter fallback chain (Islamic Network + EveryAyah)
  const playAudioChain = useCallback(
    (urls: string[], onFinished: () => void, ayahNumberForScroll: number) => {
      if (urls.length === 0) {
        setAudioError(
          isArabic
            ? 'رابط التلاوة غير متوفر لهذه الآية.'
            : 'Recitation URL unavailable for this Ayah.'
        );
        stopAllAudio();
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setAudioError(
          isArabic
            ? 'أنت بدون إنترنت — النص العثماني والبحث يعملان بدون إنترنت، والتلاوة الصوتية تحتاج اتصالاً.'
            : 'Offline mode — Mushaf text & search work offline; audio streaming needs internet.'
        );
        stopAllAudio();
        return;
      }

      scrollToAyah(ayahNumberForScroll);
      const sessionId = ++playSessionIdRef.current;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
      }
      const audio = audioRef.current;
      let urlIdx = 0;

      setAudioError(null);
      setAudioLoading(true);

      const updateMediaSession = () => {
        try {
          if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
            const meta = getSurahMeta(selectedSurahNumber);
            const rec =
              QURAN_RECITERS.find((r) => r.id === reciterIdRef.current) || QURAN_RECITERS[0];
            navigator.mediaSession.metadata = new MediaMetadata({
              title: meta ? `سورة ${meta.nameAr} · آية ${ayahNumberForScroll}` : 'القرآن الكريم',
              artist: isArabic ? rec.nameAr : rec.nameEn,
              album: 'Thinking Bridge · المصحف',
            });
          }
        } catch {
          // Ignore unsupported WebViews
        }
      };

      const tryCurrentUrl = () => {
        if (sessionId !== playSessionIdRef.current) return;
        const src = urls[urlIdx];
        if (!src) {
          setAudioLoading(false);
          setAudioError(
            isArabic
              ? 'تعذّر تشغيل التلاوة حالياً. تأكد من الاتصال بالإنترنت وحاول مجدداً.'
              : 'Unable to play recitation right now. Check your connection and retry.'
          );
          stopAllAudio();
          return;
        }

        audio.onwaiting = () => {
          if (sessionId === playSessionIdRef.current) setAudioLoading(true);
        };
        audio.oncanplay = () => {
          if (sessionId === playSessionIdRef.current) setAudioLoading(false);
        };
        audio.onplaying = () => {
          if (sessionId === playSessionIdRef.current) {
            setAudioLoading(false);
            updateMediaSession();
          }
        };
        audio.onended = () => {
          if (sessionId !== playSessionIdRef.current) return;
          setAudioLoading(false);
          onFinished();
        };
        audio.onerror = () => {
          if (sessionId !== playSessionIdRef.current) return;
          urlIdx += 1;
          if (urlIdx < urls.length) {
            tryCurrentUrl();
            return;
          }
          setAudioLoading(false);
          setAudioError(
            isArabic
              ? 'تعذّر تشغيل التلاوة من الخادم. تأكد من الاتصال بالإنترنت وحاول مجدداً.'
              : 'Unable to stream recitation. Check your internet connection and retry.'
          );
          stopAllAudio();
        };

        audio.src = src;
        audio.playbackRate = playbackSpeedRef.current;
        void audio.play().catch((err) => {
          if (sessionId !== playSessionIdRef.current) return;
          const errName =
            err && typeof err === 'object' && 'name' in err
              ? String((err as { name: unknown }).name)
              : '';
          if (errName === 'NotAllowedError') {
            setAudioLoading(false);
            setAudioError(
              isArabic
                ? 'اضغط تشغيل مرة أخرى للسماح بالصوت.'
                : 'Tap Play once more to allow audio.'
            );
            stopAllAudio();
            return;
          }
          urlIdx += 1;
          if (urlIdx < urls.length) {
            tryCurrentUrl();
          } else {
            setAudioLoading(false);
            setAudioError(
              isArabic
                ? 'تعذّر تشغيل التلاوة. تأكد من الاتصال بالإنترنت وحاول مجدداً.'
                : 'Unable to play recitation. Check your connection and retry.'
            );
            stopAllAudio();
          }
        });
      };

      tryCurrentUrl();
    },
    [isArabic, scrollToAyah, selectedSurahNumber, stopAllAudio]
  );

  const runPlaybackQueue = useCallback(
    (ayahs: QuranAyah[], ayahIdx: number, repeatIdx: number) => {
      const target = ayahs[ayahIdx];
      if (!target) {
        stopAllAudio();
        return;
      }

      pendingResumeRef.current = null;
      setIsPlaying(true);
      setIsPaused(false);
      setSilenceLeft(null);
      setActiveAyahNumber(target.numberInSurah);
      setCurrentRepeatNum(repeatIdx + 1);
      updateHifzState((prev) => ({ ...prev, lastAyahNumber: target.numberInSurah }));

      const urls = buildAyahAudioFallbackChain(selectedSurahNumber, target, reciterIdRef.current);
      playAudioChain(
        urls,
        () => {
          const stepSessionId = playSessionIdRef.current;
          const step = advanceEchoShadowing(
            ayahIdx,
            repeatIdx,
            ayahs.length,
            repeatCountRef.current,
            pauseSecondsRef.current
          );

          if (step.action === 'complete') {
            if (step.pauseMs > 0) {
              let secs = Math.ceil(step.pauseMs / 1000);
              setSilenceLeft(secs);
              countdownTimerRef.current = window.setInterval(() => {
                if (stepSessionId !== playSessionIdRef.current) return;
                secs -= 1;
                setSilenceLeft(secs > 0 ? secs : null);
              }, 1000);
              pauseTimerRef.current = window.setTimeout(() => {
                if (stepSessionId !== playSessionIdRef.current) return;
                stopAllAudio();
              }, step.pauseMs);
            } else {
              stopAllAudio();
            }
            return;
          }

          if (step.pauseMs > 0) {
            pendingResumeRef.current = {
              ayahs,
              ayahIdx: step.nextAyahIndex,
              repeatIdx: step.nextRepeatIndex,
            };
            let secs = Math.ceil(step.pauseMs / 1000);
            setSilenceLeft(secs);
            countdownTimerRef.current = window.setInterval(() => {
              if (stepSessionId !== playSessionIdRef.current) return;
              secs -= 1;
              setSilenceLeft(secs > 0 ? secs : null);
            }, 1000);
            pauseTimerRef.current = window.setTimeout(() => {
              if (stepSessionId !== playSessionIdRef.current) return;
              clearEchoTimers();
              runPlaybackQueue(ayahs, step.nextAyahIndex, step.nextRepeatIndex);
            }, step.pauseMs);
          } else {
            runPlaybackQueue(ayahs, step.nextAyahIndex, step.nextRepeatIndex);
          }
        },
        target.numberInSurah
      );
    },
    [clearEchoTimers, playAudioChain, selectedSurahNumber, stopAllAudio, updateHifzState]
  );

  const startFromAyah = useCallback(
    (ayahNumberInSurah: number) => {
      if (!surahData || surahData.ayahs.length === 0) return;
      stopAllAudio();
      const idx = surahData.ayahs.findIndex((a) => a.numberInSurah === ayahNumberInSurah);
      const safeIdx = idx >= 0 ? idx : 0;
      const queue =
        repeatCountRef.current > 1 && chunkSize === 1
          ? [surahData.ayahs[safeIdx]]
          : surahData.ayahs.slice(safeIdx);
      runPlaybackQueue(queue, 0, 0);
    },
    [chunkSize, runPlaybackQueue, stopAllAudio, surahData]
  );

  const handleDockPlayPause = () => {
    if (!surahData || surahData.ayahs.length === 0) return;
    if (isPlaying) {
      if (isPaused) {
        setIsPaused(false);
        if (pendingResumeRef.current) {
          const pending = pendingResumeRef.current;
          pendingResumeRef.current = null;
          runPlaybackQueue(pending.ayahs, pending.ayahIdx, pending.repeatIdx);
          return;
        }
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackSpeedRef.current;
          void audioRef.current.play().catch(() => {});
        }
      } else {
        setIsPaused(true);
        clearEchoTimers();
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
      return;
    }
    startFromAyah(activeAyahNumber || 1);
  };

  const handleCycleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 0.75 ? 1.0 : prev === 1.0 ? 1.25 : 0.75));
  };

  const handleCycleRepeat = () => {
    setRepeatCount((prev) => (prev === 1 ? 3 : prev === 3 ? 5 : 1));
  };

  const handleCycleMask = () => {
    clearAllRevealTimers();
    setFadeStage((prev) => (prev === 0 ? 30 : prev === 30 ? 70 : prev === 70 ? 100 : 0));
  };

  const handleTapMaskedWord = (
    e: React.MouseEvent,
    ayahNumber: number,
    wordIdx: number
  ) => {
    e.stopPropagation();
    const key = `${ayahNumber}:${wordIdx}`;
    setRevealedWordKeys((prev) => ({ ...prev, [key]: true }));
    if (revealTimersRef.current[key]) {
      window.clearTimeout(revealTimersRef.current[key]);
    }
    revealTimersRef.current[key] = window.setTimeout(() => {
      setRevealedWordKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete revealTimersRef.current[key];
    }, 2000);
  };

  const handleToggleAyahBookmark = (e: React.MouseEvent, ayah: QuranAyah) => {
    e.stopPropagation();
    if (!surahData) return;
    const meta = getSurahMeta(surahData.number);
    updateHifzState((prev) => {
      const { nextState } = toggleBookmark(prev, {
        surahNumber: surahData.number,
        ayahNumber: ayah.numberInSurah,
        surahNameAr: meta?.nameAr || surahData.name,
        surahNameEn: meta?.nameEn || surahData.englishName,
        textUthmani: ayah.textUthmani,
      });
      return nextState;
    });
  };

  const handleSelectReciter = (reciterId: QuranReciterId) => {
    stopAllAudio();
    setAudioError(null);
    updateHifzState((prev) => ({ ...prev, reciterId }));
  };

  const handleJumpTo = (surahNum: number, ayahNum = 1) => {
    setIndexOpen(false);
    setSearchQuery('');
    setVerseHits([]);
    if (surahNum === selectedSurahNumber && surahData) {
      setActiveAyahNumber(ayahNum);
      updateHifzState((prev) => ({ ...prev, lastAyahNumber: ayahNum }));
      window.setTimeout(() => scrollToAyah(ayahNum, false), 80);
    } else {
      void loadSurah(surahNum, ayahNum);
    }
  };

  const filteredSurahs = useMemo(() => searchSurahs(searchQuery), [searchQuery]);
  const currentSurahMeta: SurahMeta | undefined = getSurahMeta(selectedSurahNumber);
  const jumpSurahMeta = getSurahMeta(jumpSurah);
  const maxJumpAyah = jumpSurahMeta?.ayahCount ?? 7;

  const isDarkMushaf = hifzState.mushafTheme === 'dark';
  const currentFontScale = clampFontScale(hifzState.fontScale || 1.0);
  const isActivelyPlaying = isPlaying && !isPaused;
  const isMaskingActive = fadeStage > 0;
  const showBismillahBanner = selectedSurahNumber !== 1 && selectedSurahNumber !== 9;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div
      data-testid="quran-sanctuary-view"
      dir={isArabic ? 'rtl' : 'ltr'}
      className="quran-sanctuary min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip flex flex-col"
      data-qs-theme={isDarkMushaf ? 'dark' : 'light'}
      style={{ ['--quran-scale' as string]: String(currentFontScale) }}
    >
      {/* 1. SINGLE-ROW SLIM 56px TOP BAR */}
      <header
        data-testid="quran-top-bar"
        className="sticky top-0 z-40 border-b pt-[env(safe-area-inset-top,0px)]"
        style={{
          backgroundColor: 'var(--qs-surface)',
          borderColor: 'var(--qs-border)',
        }}
      >
        <div className="max-w-3xl mx-auto h-14 px-2.5 flex items-center justify-between gap-2">
          {/* Right (RTL start): Compact Back Button (48px) */}
          <button
            type="button"
            data-testid="quran-back-btn"
            onClick={() => {
              stopAllAudio();
              onBack();
            }}
            aria-label={isArabic ? 'رجوع' : 'Back'}
            className="h-10 min-w-[48px] px-2.5 rounded-xl border text-xs font-extrabold inline-flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer active:scale-95 transition"
            style={{
              backgroundColor: 'var(--qs-surface-alt)',
              borderColor: 'var(--qs-border)',
              color: 'var(--qs-ink)',
            }}
          >
            {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>

          {/* Center: Single-line Tappable Surah Pill (NEVER wraps) */}
          <button
            type="button"
            data-testid="quran-surah-pill"
            onClick={() => {
              setIndexOpen(true);
              setJumpSurah(selectedSurahNumber);
              setJumpAyah(activeAyahNumber);
            }}
            aria-label={isArabic ? 'فهرس السور والبحث في الآيات' : 'Surah index & verse search'}
            className="h-10 max-w-[60vw] sm:max-w-xs px-3.5 rounded-full border text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden cursor-pointer active:scale-95 transition"
            style={{
              backgroundColor: 'var(--qs-gold-soft)',
              borderColor: 'var(--qs-gold)',
              color: 'var(--qs-ink)',
            }}
          >
            <span className="truncate whitespace-nowrap">
              {currentSurahMeta
                ? isArabic
                  ? `سورة ${currentSurahMeta.nameAr}`
                  : currentSurahMeta.nameEn
                : isArabic
                  ? 'القرآن الكريم'
                  : 'Holy Quran'}
            </span>
            <ChevronDown size={15} className="shrink-0" style={{ color: 'var(--qs-gold)' }} />
            {currentSurahMeta && (
              <span
                className="text-[11px] font-bold shrink-0 whitespace-nowrap"
                style={{ color: 'var(--qs-ink-muted)' }}
              >
                · {currentSurahMeta.ayahCount} {isArabic ? 'آية' : 'v'}
              </span>
            )}
          </button>

          {/* Left (RTL end): Single Settings Button */}
          <button
            type="button"
            data-testid="quran-settings-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label={isArabic ? 'إعدادات المصحف والقارئ' : 'Mushaf & reciter settings'}
            className="h-10 w-10 rounded-xl border inline-flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
            style={{
              backgroundColor: 'var(--qs-surface-alt)',
              borderColor: 'var(--qs-border)',
              color: 'var(--qs-ink)',
            }}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      {/* 2. MUSHAF-FIRST READING CANVAS (Verses own 75%+ of the screen immediately above the fold) */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-5 pt-2.5 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]">
        {/* Ornamental Surah Header — Compact so 4-6 verses sit immediately above the fold */}
        {currentSurahMeta && (
          <div
            data-testid="quran-surah-header"
            className="quran-surah-ornament rounded-2xl px-4 py-2 text-center mb-1.5"
          >
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="text-xs" style={{ color: 'var(--qs-gold)' }}>
                ✦
              </span>
              <h1
                className="text-base sm:text-lg font-black tracking-tight"
                style={{ color: 'var(--qs-ink)' }}
              >
                {isArabic
                  ? `سورة ${currentSurahMeta.nameAr}`
                  : `Surah ${currentSurahMeta.nameEn}`}
              </h1>
              <span
                className="text-[11px] font-bold"
                style={{ color: 'var(--qs-ink-muted)' }}
              >
                ·{' '}
                {currentSurahMeta.revelationType === 'Meccan'
                  ? isArabic
                    ? 'مكية'
                    : 'Meccan'
                  : isArabic
                    ? 'مدنية'
                    : 'Medinan'}
              </span>
              <span className="text-xs" style={{ color: 'var(--qs-gold)' }}>
                ✦
              </span>
            </div>
          </div>
        )}

        {/* Bismillah (for all Surahs except Al-Fatihah & At-Tawbah) */}
        {showBismillahBanner && (
          <p
            dir="rtl"
            lang="ar"
            className="quran-bismillah text-center py-1 mb-1 select-none"
            style={{ color: 'var(--qs-gold)' }}
          >
            {BISMILLAH_UTHMANI}
          </p>
        )}

        {/* Thin 1-Line Masking Status Pill — ONLY visible when masking is active */}
        {isMaskingActive && (
          <div
            data-testid="quran-mask-pill"
            className="mb-2 px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold"
            style={{
              backgroundColor: 'var(--qs-gold-soft)',
              borderColor: 'var(--qs-gold)',
              color: 'var(--qs-gold)',
            }}
          >
            <span className="truncate">
              {isArabic
                ? `وضع التسميع (${fadeStage}%) · اضغط على أي كلمة لكشفها`
                : `Hifz Mask (${fadeStage}%) · Tap any word to peek`}
            </span>
            <button
              type="button"
              onClick={() => {
                clearAllRevealTimers();
                setFadeStage(0);
              }}
              className="px-2 py-0.5 rounded-lg text-[11px] font-black shrink-0 cursor-pointer"
              style={{
                backgroundColor: 'var(--qs-gold)',
                color: 'var(--qs-gold-ink)',
              }}
            >
              {isArabic ? 'إظهار' : 'Show'}
            </button>
          </div>
        )}

        {/* Thin Echo-Silence Countdown Pill — ONLY visible during silence gap */}
        {silenceLeft !== null && (
          <div
            className="mb-2 px-3 py-1.5 rounded-xl border text-center text-xs font-black"
            style={{
              backgroundColor: 'var(--qs-accent-soft)',
              borderColor: 'var(--qs-accent)',
              color: 'var(--qs-accent)',
            }}
          >
            {isArabic
              ? `ردّد الآية الآن… (${silenceLeft}ث) · تكرار ${currentRepeatNum}/${repeatCount}`
              : `Repeat aloud… (${silenceLeft}s) · ${currentRepeatNum}/${repeatCount}`}
          </div>
        )}

        {/* Dismissible Audio Error Banner — ONLY visible if an error occurs */}
        {audioError && (
          <div
            role="alert"
            className="mb-2 px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderColor: 'rgba(239, 68, 68, 0.45)',
              color: isDarkMushaf ? '#FCA5A5' : '#B91C1C',
            }}
          >
            <span>{audioError}</span>
            <button
              type="button"
              onClick={() => setAudioError(null)}
              aria-label={isArabic ? 'إغلاق' : 'Dismiss'}
              className="p-1 shrink-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Loading / Error State */}
        {loadingSurah && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--qs-gold)' }} />
            <p className="text-xs font-bold" style={{ color: 'var(--qs-ink-muted)' }}>
              {isArabic ? 'جاري فتح السورة…' : 'Loading Surah…'}
            </p>
          </div>
        )}

        {!loadingSurah && surahError && (
          <div
            className="my-6 p-5 rounded-2xl border text-center space-y-3"
            style={{
              backgroundColor: 'var(--qs-surface)',
              borderColor: 'var(--qs-border)',
            }}
          >
            <p className="text-sm font-bold">{surahError}</p>
            <button
              type="button"
              onClick={() => void loadSurah(selectedSurahNumber, activeAyahNumber)}
              className="px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
              style={{
                backgroundColor: 'var(--qs-gold)',
                color: 'var(--qs-gold-ink)',
              }}
            >
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}

        {/* Crisp Uthmani Ayahs — Tap any Ayah to play from that exact Ayah */}
        {!loadingSurah && surahData && (
          <div data-testid="quran-ayah-list" className="divide-y divide-transparent">
            {surahData.ayahs.map((ayah) => {
              const displayText = stripBismillahPrefix(
                surahData.number,
                ayah.numberInSurah,
                ayah.textUthmani
              );
              const isActive = activeAyahNumber === ayah.numberInSurah;
              const isBookmarked = Boolean(
                hifzState.bookmarks?.[`${surahData.number}:${ayah.numberInSurah}`]
              );
              const words = isMaskingActive ? tokenizeAyahWords(displayText) : [];
              const revealedSet = isMaskingActive
                ? new Set(
                    words
                      .map((_, idx) =>
                        revealedWordKeys[`${ayah.numberInSurah}:${idx}`] ? idx : -1
                      )
                      .filter((idx) => idx >= 0)
                  )
                : undefined;
              const maskedWords = isMaskingActive
                ? computeWordMask(words, fadeStage, ayah.number * 31 + fadeStage, revealedSet)
                : null;

              return (
                <div
                  key={ayah.number}
                  ref={(el) => {
                    ayahRefs.current[ayah.numberInSurah] = el;
                  }}
                  data-testid={`quran-ayah-${ayah.numberInSurah}`}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => startFromAyah(ayah.numberInSurah)}
                  className="quran-ayah-row px-2.5 py-2.5 sm:px-3.5 sm:py-3 rounded-xl cursor-pointer select-text"
                >
                  <div className="flex items-start gap-2">
                    <div
                      dir="rtl"
                      lang="ar"
                      className="quran-uthmani-text flex-1 min-w-0 text-right"
                      style={{ color: 'var(--qs-ink)' }}
                    >
                      {maskedWords ? (
                        <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                          {maskedWords.map((mw) =>
                            mw.isHidden ? (
                              <button
                                key={mw.index}
                                type="button"
                                onClick={(e) =>
                                  handleTapMaskedWord(e, ayah.numberInSurah, mw.index)
                                }
                                className="quran-word-faded px-1.5 cursor-pointer"
                                aria-label={isArabic ? 'كشف الكلمة' : 'Reveal word'}
                              >
                                {mw.word}
                              </button>
                            ) : (
                              <span
                                key={mw.index}
                                style={
                                  mw.temporarilyRevealed
                                    ? { color: 'var(--qs-accent)' }
                                    : undefined
                                }
                              >
                                {mw.word}
                              </span>
                            )
                          )}
                          <span className="quran-ayah-badge">
                            {toArabicNumeral(ayah.numberInSurah)}
                          </span>
                        </span>
                      ) : (
                        <>
                          <span>{displayText}</span>
                          <span className="quran-ayah-badge">
                            {toArabicNumeral(ayah.numberInSurah)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Discreet bookmark button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleAyahBookmark(e, ayah)}
                      aria-label={isArabic ? 'حفظ علامة' : 'Bookmark Ayah'}
                      className="mt-1.5 p-1.5 rounded-lg shrink-0 opacity-60 hover:opacity-100 transition cursor-pointer"
                      style={{
                        color: isBookmarked ? 'var(--qs-gold)' : 'var(--qs-ink-muted)',
                      }}
                    >
                      <Bookmark
                        size={15}
                        fill={isBookmarked ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  {/* Optional Study Overlays (toggled in Settings Sheet) */}
                  {(showTafsir || showEnglish || showTranslit) && (
                    <div className="mt-2 pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--qs-border)' }}>
                      {showTranslit && ayah.transliterationEn && (
                        <p
                          dir="ltr"
                          className="text-xs italic leading-relaxed"
                          style={{ color: 'var(--qs-gold)' }}
                        >
                          {ayah.transliterationEn}
                        </p>
                      )}
                      {showEnglish && ayah.translationEn && (
                        <p
                          dir="ltr"
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{ color: 'var(--qs-ink-muted)' }}
                        >
                          {ayah.translationEn}
                        </p>
                      )}
                      {showTafsir && ayah.tafsirMuyassar && (
                        <p
                          dir="rtl"
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{ color: 'var(--qs-ink-muted)' }}
                        >
                          <span className="font-black" style={{ color: 'var(--qs-accent)' }}>
                            التفسير الميسّر:{' '}
                          </span>
                          {ayah.tafsirMuyassar}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Prev / Next Surah Footer Navigation */}
            <div className="pt-5 pb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={selectedSurahNumber <= 1}
                onClick={() => void loadSurah(selectedSurahNumber - 1, 1)}
                className="h-11 px-3.5 rounded-xl border text-xs font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-35"
                style={{
                  backgroundColor: 'var(--qs-surface)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-ink)',
                }}
              >
                {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                <span>{isArabic ? 'السورة السابقة' : 'Prev Surah'}</span>
              </button>

              <button
                type="button"
                disabled={selectedSurahNumber >= 114}
                onClick={() => void loadSurah(selectedSurahNumber + 1, 1)}
                className="h-11 px-3.5 rounded-xl border text-xs font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-35"
                style={{
                  backgroundColor: 'var(--qs-surface)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-ink)',
                }}
              >
                <span>{isArabic ? 'السورة التالية' : 'Next Surah'}</span>
                {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>

            {/* Discreet Sadaqah Jariyah Dedication */}
            <p
              className="pt-2 pb-2 text-center text-[11px] font-bold flex items-center justify-center gap-1.5"
              style={{ color: 'var(--qs-ink-muted)' }}
            >
              <Heart size={12} style={{ color: 'var(--qs-gold)' }} />
              <span>{isArabic ? DEDICATION_AR : DEDICATION_EN}</span>
            </p>
          </div>
        )}
      </main>

      {/* 3. CLEAN, NON-TRUNCATED 4-BUTTON BOTTOM DOCK (64px) */}
      <nav
        data-testid="quran-thumb-dock"
        aria-label={isArabic ? 'شريط التحكم بالتلاوة' : 'Recitation controls'}
        className="fixed bottom-0 left-0 right-0 z-40 border-t pb-[env(safe-area-inset-bottom,0px)] shadow-2xl"
        style={{
          backgroundColor: 'var(--qs-surface)',
          borderColor: 'var(--qs-border)',
        }}
      >
        <div className="max-w-3xl mx-auto h-16 px-2.5 grid grid-cols-4 gap-2 items-center">
          {/* Button 1: Gold Primary Play/Pause + Buffering Spinner */}
          <button
            type="button"
            data-testid="quran-dock-play"
            onClick={handleDockPlayPause}
            aria-label={
              isActivelyPlaying
                ? isArabic
                  ? 'إيقاف مؤقت'
                  : 'Pause'
                : isArabic
                  ? 'تشغيل'
                  : 'Play'
            }
            className="h-12 px-2 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 transition shadow-md"
            style={{
              backgroundColor: isActivelyPlaying ? 'var(--qs-accent)' : 'var(--qs-gold)',
              color: '#0A101D',
            }}
          >
            {audioLoading ? (
              <Loader2 size={18} className="animate-spin shrink-0" />
            ) : isActivelyPlaying ? (
              <Pause size={18} className="shrink-0" />
            ) : (
              <Play size={18} className="shrink-0" />
            )}
            <span>
              {audioLoading
                ? isArabic
                  ? 'جاري'
                  : 'Wait'
                : isActivelyPlaying
                  ? isArabic
                    ? 'إيقاف'
                    : 'Pause'
                  : isArabic
                    ? 'تشغيل'
                    : 'Play'}
            </span>
          </button>

          {/* Button 2: Speed (0.75× / 1.0× / 1.25×) */}
          <button
            type="button"
            data-testid="quran-dock-speed"
            onClick={handleCycleSpeed}
            aria-label={isArabic ? 'سرعة التلاوة' : 'Playback speed'}
            className="h-12 px-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer active:scale-95 transition"
            style={
              playbackSpeed !== 1.0
                ? {
                    backgroundColor: 'var(--qs-accent-soft)',
                    borderColor: 'var(--qs-accent)',
                    color: 'var(--qs-accent)',
                  }
                : {
                    backgroundColor: 'var(--qs-surface-alt)',
                    borderColor: 'var(--qs-border)',
                    color: 'var(--qs-ink)',
                  }
            }
          >
            <Gauge size={16} className="shrink-0" />
            <span className="tabular-nums">{playbackSpeed.toFixed(playbackSpeed === 1.0 ? 1 : 2)}×</span>
          </button>

          {/* Button 3: Repeat (×1 / ×3 / ×5) */}
          <button
            type="button"
            data-testid="quran-dock-repeat"
            onClick={handleCycleRepeat}
            aria-label={isArabic ? 'تكرار الآية' : 'Repeat count'}
            className="h-12 px-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer active:scale-95 transition"
            style={
              repeatCount > 1
                ? {
                    backgroundColor: 'var(--qs-accent-soft)',
                    borderColor: 'var(--qs-accent)',
                    color: 'var(--qs-accent)',
                  }
                : {
                    backgroundColor: 'var(--qs-surface-alt)',
                    borderColor: 'var(--qs-border)',
                    color: 'var(--qs-ink)',
                  }
            }
          >
            <Repeat size={16} className="shrink-0" />
            <span className="tabular-nums">×{repeatCount}</span>
          </button>

          {/* Button 4: Masking (ظاهر / 30% / 70% / 100%) — Never truncated */}
          <button
            type="button"
            data-testid="quran-dock-mask"
            onClick={handleCycleMask}
            aria-pressed={isMaskingActive}
            aria-label={isArabic ? 'إخفاء للتسميع' : 'Mask verses'}
            className="h-12 px-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer active:scale-95 transition"
            style={
              isMaskingActive
                ? {
                    backgroundColor: 'var(--qs-gold-soft)',
                    borderColor: 'var(--qs-gold)',
                    color: 'var(--qs-gold)',
                  }
                : {
                    backgroundColor: 'var(--qs-surface-alt)',
                    borderColor: 'var(--qs-border)',
                    color: 'var(--qs-ink)',
                  }
            }
          >
            {isMaskingActive ? (
              <EyeOff size={16} className="shrink-0" />
            ) : (
              <Eye size={16} className="shrink-0" />
            )}
            <span>
              {isMaskingActive ? `${fadeStage}%` : isArabic ? 'إخفاء' : 'Hide'}
            </span>
          </button>
        </div>
      </nav>

      {/* 4. ADVANCED INDEX & INSTANT VERSE SEARCH SHEET */}
      {indexOpen && (
        <div
          data-testid="quran-index-sheet"
          className="fixed inset-0 z-50 flex items-end justify-center quran-sheet-backdrop"
          onClick={() => setIndexOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-[92%] max-h-full rounded-t-3xl border-t flex flex-col overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--qs-surface)',
              borderColor: 'var(--qs-border)',
            }}
          >
            {/* Sheet Handle & Header */}
            <div className="shrink-0 px-4 pt-3 pb-2.5 border-b space-y-2.5" style={{ borderColor: 'var(--qs-border)' }}>
              <div className="w-10 h-1 rounded-full mx-auto opacity-30 bg-current" />
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-black">
                  {isArabic ? 'فهرس المصحف والبحث الفوري' : 'Quran Index & Instant Search'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIndexOpen(false)}
                  aria-label={isArabic ? 'إغلاق' : 'Close'}
                  className="w-9 h-9 rounded-xl border inline-flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: 'var(--qs-surface-alt)',
                    borderColor: 'var(--qs-border)',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Instant Diacritic-Insensitive Search Bar */}
              <div className="relative">
                <Search
                  size={17}
                  className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                    isArabic ? 'right-3.5' : 'left-3.5'
                  }`}
                  style={{ color: 'var(--qs-ink-muted)' }}
                />
                <input
                  ref={searchInputRef}
                  data-testid="quran-search-input"
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'ابحث باسم السورة، رقمها، أو أي آية (مثل: ن والقلم)'
                      : 'Search Surah name, number, or any Arabic verse...'
                  }
                  className={`w-full h-11 rounded-2xl border text-xs sm:text-sm font-bold outline-none ${
                    isArabic ? 'pr-10 pl-9' : 'pl-10 pr-9'
                  }`}
                  style={{
                    backgroundColor: 'var(--qs-bg)',
                    borderColor: 'var(--qs-border)',
                    color: 'var(--qs-ink)',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
                    className={`absolute top-1/2 -translate-y-1/2 p-1 cursor-pointer ${
                      isArabic ? 'left-2.5' : 'right-2.5'
                    }`}
                    style={{ color: 'var(--qs-ink-muted)' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* 3 Clean Tabs (hidden while actively searching) */}
              {!isSearching && (
                <div
                  className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl"
                  style={{ backgroundColor: 'var(--qs-bg)' }}
                >
                  {(
                    [
                      { id: 'surahs', ar: 'السور (114)', en: 'Surahs (114)' },
                      { id: 'juz', ar: 'الأجزاء (30)', en: 'Juz (30)' },
                      { id: 'jump', ar: 'الانتقال لآية', en: 'Go to Ayah' },
                    ] as const
                  ).map((tab) => {
                    const active = indexTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        data-testid={`quran-index-tab-${tab.id}`}
                        onClick={() => setIndexTab(tab.id)}
                        className="h-9 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition"
                        style={
                          active
                            ? {
                                backgroundColor: 'var(--qs-gold)',
                                color: '#0A101D',
                              }
                            : {
                                color: 'var(--qs-ink-muted)',
                              }
                        }
                      >
                        {isArabic ? tab.ar : tab.en}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sheet Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-2.5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              {isSearching ? (
                <div className="space-y-4">
                  {/* Surah matches */}
                  {filteredSurahs.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-black px-1" style={{ color: 'var(--qs-gold)' }}>
                        {isArabic
                          ? `السور المطابقة (${filteredSurahs.length})`
                          : `Matching Surahs (${filteredSurahs.length})`}
                      </p>
                      <div className="space-y-1">
                        {filteredSurahs.slice(0, 8).map((surah) => (
                          <button
                            key={surah.number}
                            type="button"
                            onClick={() => handleJumpTo(surah.number, 1)}
                            className="w-full px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 text-start cursor-pointer"
                            style={{
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-7 h-7 rounded-lg text-xs font-black inline-flex items-center justify-center shrink-0 tabular-nums"
                                style={{
                                  backgroundColor: 'var(--qs-gold-soft)',
                                  color: 'var(--qs-gold)',
                                }}
                              >
                                {surah.number}
                              </span>
                              <span className="text-sm font-black truncate">
                                {isArabic ? `سورة ${surah.nameAr}` : surah.nameEn}
                              </span>
                            </div>
                            <span
                              className="text-[11px] font-bold shrink-0 whitespace-nowrap"
                              style={{ color: 'var(--qs-ink-muted)' }}
                            >
                              {surah.revelationType === 'Meccan'
                                ? isArabic
                                  ? 'مكية'
                                  : 'Meccan'
                                : isArabic
                                  ? 'مدنية'
                                  : 'Medinan'}{' '}
                              · {surah.ayahCount} {isArabic ? 'آية' : 'v'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instant Offline Verse Matches */}
                  {searchQuery.trim().length >= 2 && !/^\d+$/.test(searchQuery.trim()) && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[11px] font-black" style={{ color: 'var(--qs-accent)' }}>
                          {isArabic
                            ? `نتائج الآيات (${verseHits.length})`
                            : `Matching Verses (${verseHits.length})`}
                        </p>
                        {searchingVerses && (
                          <Loader2
                            size={14}
                            className="animate-spin"
                            style={{ color: 'var(--qs-gold)' }}
                          />
                        )}
                      </div>

                      {!searchingVerses && verseHits.length === 0 ? (
                        <p
                          className="text-xs font-bold px-2 py-4 text-center"
                          style={{ color: 'var(--qs-ink-muted)' }}
                        >
                          {isArabic
                            ? 'لا توجد آية مطابقة لهذا البحث.'
                            : 'No matching verses found.'}
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {verseHits.map((hit) => (
                            <button
                              key={`${hit.surahNumber}:${hit.ayahNumber}`}
                              type="button"
                              data-testid={`quran-verse-hit-${hit.surahNumber}-${hit.ayahNumber}`}
                              onClick={() => handleJumpTo(hit.surahNumber, hit.ayahNumber)}
                              className="w-full p-3 rounded-xl border text-start space-y-1 cursor-pointer active:scale-[0.99] transition"
                              style={{
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className="text-[11px] font-black"
                                  style={{ color: 'var(--qs-gold)' }}
                                >
                                  {isArabic
                                    ? `سورة ${hit.surahNameAr} · آية ${hit.ayahNumber}`
                                    : `${hit.surahNameEn} · Ayah ${hit.ayahNumber}`}
                                </span>
                              </div>
                              <p
                                dir="rtl"
                                lang="ar"
                                className="font-serif text-base leading-loose line-clamp-2"
                                style={{
                                  fontFamily: "'Amiri', serif",
                                  color: 'var(--qs-ink)',
                                }}
                              >
                                {hit.textUthmani}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : indexTab === 'surahs' ? (
                /* TAB 1: 114 Surahs — Clean Single-Line Rows */
                <div className="space-y-1">
                  {SURAH_INDEX.map((surah) => {
                    const isSelected = surah.number === selectedSurahNumber;
                    return (
                      <button
                        key={surah.number}
                        type="button"
                        data-testid={`quran-surah-row-${surah.number}`}
                        onClick={() => handleJumpTo(surah.number, 1)}
                        className="w-full px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 text-start cursor-pointer transition"
                        style={
                          isSelected
                            ? {
                                backgroundColor: 'var(--qs-gold-soft)',
                                borderColor: 'var(--qs-gold)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                              }
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-7 h-7 rounded-lg text-xs font-black inline-flex items-center justify-center shrink-0 tabular-nums"
                            style={{
                              backgroundColor: isSelected
                                ? 'var(--qs-gold)'
                                : 'var(--qs-surface-alt)',
                              color: isSelected ? '#0A101D' : 'var(--qs-gold)',
                            }}
                          >
                            {surah.number}
                          </span>
                          <span className="text-sm font-black truncate">
                            {isArabic ? `سورة ${surah.nameAr}` : `${surah.nameEn}`}
                          </span>
                        </div>
                        <span
                          className="text-[11px] font-bold shrink-0 whitespace-nowrap"
                          style={{ color: 'var(--qs-ink-muted)' }}
                        >
                          {surah.revelationType === 'Meccan'
                            ? isArabic
                              ? 'مكية'
                              : 'Meccan'
                            : isArabic
                              ? 'مدنية'
                              : 'Medinan'}{' '}
                          · {surah.ayahCount} {isArabic ? 'آية' : 'v'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : indexTab === 'juz' ? (
                /* TAB 2: 30 Juz */
                <div className="space-y-1.5">
                  {JUZ_INDEX.map((j) => (
                    <button
                      key={j.juz}
                      type="button"
                      data-testid={`quran-juz-row-${j.juz}`}
                      onClick={() => handleJumpTo(j.startSurah, j.startAyah)}
                      className="w-full px-3.5 py-3 rounded-xl border flex items-center justify-between gap-2 text-start cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-border)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-8 h-8 rounded-lg text-xs font-black inline-flex items-center justify-center shrink-0 tabular-nums"
                          style={{
                            backgroundColor: 'var(--qs-gold-soft)',
                            color: 'var(--qs-gold)',
                          }}
                        >
                          {j.juz}
                        </span>
                        <span className="text-sm font-black truncate">
                          {isArabic ? `الجزء ${toArabicNumeral(j.juz)}` : `Juz ${j.juz}`}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold shrink-0 whitespace-nowrap"
                        style={{ color: 'var(--qs-ink-muted)' }}
                      >
                        {isArabic
                          ? `سورة ${j.surahNameAr} · آية ${j.startAyah}`
                          : `${j.surahNameEn} · v.${j.startAyah}`}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                /* TAB 3: Direct Surah + Ayah Jumper */
                <div className="p-2 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="quran-jump-surah"
                      className="text-xs font-black block"
                      style={{ color: 'var(--qs-ink-muted)' }}
                    >
                      {isArabic ? 'اختر السورة' : 'Select Surah'}
                    </label>
                    <select
                      id="quran-jump-surah"
                      value={jumpSurah}
                      onChange={(e) => {
                        const s = Number(e.target.value);
                        setJumpSurah(s);
                        setJumpAyah(1);
                      }}
                      className="w-full h-12 px-3 rounded-xl border text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-border)',
                        color: 'var(--qs-ink)',
                      }}
                    >
                      {SURAH_INDEX.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {isArabic ? `سورة ${s.nameAr}` : s.nameEn} ({s.ayahCount})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="quran-jump-ayah"
                      className="text-xs font-black block"
                      style={{ color: 'var(--qs-ink-muted)' }}
                    >
                      {isArabic
                        ? `رقم الآية (1 إلى ${maxJumpAyah})`
                        : `Ayah Number (1 to ${maxJumpAyah})`}
                    </label>
                    <input
                      id="quran-jump-ayah"
                      type="number"
                      min={1}
                      max={maxJumpAyah}
                      value={jumpAyah}
                      onChange={(e) => {
                        const val = Number.parseInt(e.target.value, 10);
                        setJumpAyah(
                          Number.isFinite(val) ? Math.max(1, Math.min(maxJumpAyah, val)) : 1
                        );
                      }}
                      className="w-full h-12 px-3 rounded-xl border text-base font-black tabular-nums"
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-border)',
                        color: 'var(--qs-ink)',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    data-testid="quran-jump-submit"
                    onClick={() => handleJumpTo(jumpSurah, jumpAyah)}
                    className="w-full h-12 rounded-2xl text-sm font-black cursor-pointer active:scale-95 transition"
                    style={{
                      backgroundColor: 'var(--qs-gold)',
                      color: '#0A101D',
                    }}
                  >
                    {isArabic
                      ? `الانتقال إلى ${jumpSurahMeta?.nameAr ?? ''} · آية ${jumpAyah}`
                      : `Go to ${jumpSurahMeta?.nameEn ?? ''} · Ayah ${jumpAyah}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CLEAN SETTINGS BOTTOM SHEET (All Secondary Controls Consolidated Here) */}
      {settingsOpen && (
        <div
          data-testid="quran-settings-sheet"
          className="fixed inset-0 z-50 flex items-end justify-center quran-sheet-backdrop"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90%] rounded-t-3xl border-t flex flex-col overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--qs-surface)',
              borderColor: 'var(--qs-border)',
            }}
          >
            <div
              className="shrink-0 px-4 pt-3 pb-2.5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--qs-border)' }}
            >
              <h2 className="text-sm sm:text-base font-black">
                {isArabic ? 'إعدادات المصحف والتلاوة' : 'Mushaf & Recitation Settings'}
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label={isArabic ? 'إغلاق' : 'Close'}
                className="w-9 h-9 rounded-xl border inline-flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: 'var(--qs-surface-alt)',
                  borderColor: 'var(--qs-border)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))] space-y-5">
              {/* 1. Reciter Selector (Strictly 3 Live-Verified Reciters) */}
              <div className="space-y-2">
                <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                  {isArabic ? 'القارئ' : 'Reciter'}
                </p>
                <div className="space-y-1.5">
                  {QURAN_RECITERS.map((rec) => {
                    const active = hifzState.reciterId === rec.id;
                    return (
                      <button
                        key={rec.id}
                        type="button"
                        data-testid={`quran-reciter-${rec.id}`}
                        onClick={() => handleSelectReciter(rec.id)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-2 text-start cursor-pointer transition"
                        style={
                          active
                            ? {
                                backgroundColor: 'var(--qs-accent-soft)',
                                borderColor: 'var(--qs-accent)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                              }
                        }
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-black truncate">
                            {isArabic ? rec.nameAr : rec.nameEn}
                          </p>
                          <p className="text-[11px]" style={{ color: 'var(--qs-ink-muted)' }}>
                            {isArabic ? rec.styleAr : rec.styleEn}
                          </p>
                        </div>
                        {active && (
                          <Check size={18} className="shrink-0" style={{ color: 'var(--qs-accent)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Uthmani Font Size Slider (A- / A+) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                    {isArabic ? 'حجم الخط العثماني' : 'Uthmani Font Size'}
                  </p>
                  <span
                    className="text-xs font-black tabular-nums"
                    style={{ color: 'var(--qs-ink-muted)' }}
                  >
                    {Math.round(currentFontScale * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateHifzState((prev) => ({
                        ...prev,
                        fontScale: clampFontScale((prev.fontScale || 1.0) - 0.1),
                      }))
                    }
                    className="w-10 h-10 rounded-xl border text-xs font-black shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--qs-bg)',
                      borderColor: 'var(--qs-border)',
                    }}
                  >
                    {isArabic ? 'أ-' : 'A-'}
                  </button>
                  <input
                    type="range"
                    min={1.0}
                    max={1.8}
                    step={0.05}
                    value={currentFontScale}
                    onChange={(e) =>
                      updateHifzState((prev) => ({
                        ...prev,
                        fontScale: clampFontScale(Number(e.target.value)),
                      }))
                    }
                    aria-label={isArabic ? 'تغيير حجم الخط' : 'Adjust font size'}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateHifzState((prev) => ({
                        ...prev,
                        fontScale: clampFontScale((prev.fontScale || 1.0) + 0.1),
                      }))
                    }
                    className="w-10 h-10 rounded-xl border text-sm font-black shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--qs-bg)',
                      borderColor: 'var(--qs-border)',
                    }}
                  >
                    {isArabic ? 'أ+' : 'A+'}
                  </button>
                </div>
              </div>

              {/* 3. Theme Toggle: Midnight Navy / Warm Parchment */}
              <div className="space-y-2">
                <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                  {isArabic ? 'مظهر المصحف' : 'Mushaf Theme'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateHifzState((prev) => ({ ...prev, mushafTheme: 'dark' }))
                    }
                    className="h-11 rounded-2xl border text-xs font-black inline-flex items-center justify-center gap-2 cursor-pointer"
                    style={
                      isDarkMushaf
                        ? {
                            backgroundColor: 'var(--qs-gold-soft)',
                            borderColor: 'var(--qs-gold)',
                            color: 'var(--qs-gold)',
                          }
                        : {
                            backgroundColor: 'var(--qs-bg)',
                            borderColor: 'var(--qs-border)',
                          }
                    }
                  >
                    <Moon size={16} />
                    <span>{isArabic ? 'كحلي ليلي' : 'Midnight Navy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateHifzState((prev) => ({ ...prev, mushafTheme: 'light' }))
                    }
                    className="h-11 rounded-2xl border text-xs font-black inline-flex items-center justify-center gap-2 cursor-pointer"
                    style={
                      !isDarkMushaf
                        ? {
                            backgroundColor: 'var(--qs-gold-soft)',
                            borderColor: 'var(--qs-gold)',
                            color: 'var(--qs-gold)',
                          }
                        : {
                            backgroundColor: 'var(--qs-bg)',
                            borderColor: 'var(--qs-border)',
                          }
                    }
                  >
                    <Sun size={16} />
                    <span>{isArabic ? 'ورق مصحف دافئ' : 'Warm Parchment'}</span>
                  </button>
                </div>
              </div>

              {/* 4. Echo-Silence Gap (0s / 3s / 5s) & Ayah Chunk Size (1 / 3) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                    {isArabic ? 'سكتة الترديد' : 'Echo Silence'}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([0, 3, 5] as const).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setPauseSeconds(sec)}
                        className="h-10 rounded-xl border text-xs font-black tabular-nums cursor-pointer"
                        style={
                          pauseSeconds === sec
                            ? {
                                backgroundColor: 'var(--qs-accent-soft)',
                                borderColor: 'var(--qs-accent)',
                                color: 'var(--qs-accent)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                              }
                        }
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                    {isArabic ? 'مقطع الحفظ' : 'Ayah Chunk'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([1, 3] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setChunkSize(sz)}
                        className="h-10 rounded-xl border text-xs font-black cursor-pointer"
                        style={
                          chunkSize === sz
                            ? {
                                backgroundColor: 'var(--qs-accent-soft)',
                                borderColor: 'var(--qs-accent)',
                                color: 'var(--qs-accent)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                              }
                        }
                      >
                        {sz === 1
                          ? isArabic
                            ? '1 آية'
                            : '1 Ayah'
                          : isArabic
                            ? '3 آيات'
                            : '3 Ayahs'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Study Overlays: Tafsir / Translation / Phonetics */}
              <div className="space-y-2">
                <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                  {isArabic ? 'المعاني والتفسير' : 'Tafsir & Translation'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        labelAr: 'التفسير',
                        labelEn: 'Tafsir',
                        active: showTafsir,
                        toggle: () => setShowTafsir((v) => !v),
                      },
                      {
                        labelAr: 'الترجمة',
                        labelEn: 'English',
                        active: showEnglish,
                        toggle: () => setShowEnglish((v) => !v),
                      },
                      {
                        labelAr: 'النطق',
                        labelEn: 'Phonetics',
                        active: showTranslit,
                        toggle: () => setShowTranslit((v) => !v),
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.labelEn}
                      type="button"
                      onClick={item.toggle}
                      className="h-11 rounded-2xl border text-xs font-black cursor-pointer transition"
                      style={
                        item.active
                          ? {
                              backgroundColor: 'var(--qs-accent-soft)',
                              borderColor: 'var(--qs-accent)',
                              color: 'var(--qs-accent)',
                            }
                          : {
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                            }
                      }
                    >
                      {isArabic ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
