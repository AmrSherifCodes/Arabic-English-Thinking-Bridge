// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Link2,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Sun,
  Volume2,
} from 'lucide-react';
import { getApiBaseUrl } from '../../utils/api';
import {
  AyahBridgeLink,
  AyahChunk,
  EchoPauseSeconds,
  EchoRepeatCount,
  FadeStage,
  MushafFontSize,
  QURAN_RECITERS,
  QuranAyah,
  QuranHifzStoreState,
  QuranReciterId,
  QuranSurahData,
  SurahMeta,
  SURAH_INDEX,
  WirdQuality,
  advanceEchoShadowing,
  buildAyahAudioUrls,
  buildAyahBridgeChain,
  chunkAyahs,
  computeWordMask,
  fetchSurahWithCache,
  getDueWirdItems,
  getPinnedSurahs,
  getSurahMeta,
  listCachedSurahNumbers,
  loadHifzState,
  recordWirdReview,
  saveHifzState,
  searchSurahs,
  toggleBookmark,
  tokenizeAyahWords,
} from './hifzEngine';
import { HIFZ_PSYCHOLOGY_TIPS, getTipOfTheDay } from './hifzPsychologyTips';

interface QuranSanctuaryViewProps {
  onBack: () => void;
  isArabic?: boolean;
}

type SanctuaryTab = 'surahs' | 'studio' | 'wird';
type StudioDrillMode = 'mushaf' | 'fade' | 'bridge';

const DEDICATION_AR = 'صدقة جارية على جميع أموات المسلمين — مجاني بالكامل مدى الحياة';
const DEDICATION_EN = 'Sadaqah Jariyah for all deceased Muslims — 100% Free Forever';

const FONT_SIZE_CLASSES: Record<MushafFontSize, string> = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-[1.75rem]',
  lg: 'text-[1.75rem] sm:text-3xl',
};

export function QuranSanctuaryView({ onBack, isArabic = true }: QuranSanctuaryViewProps) {
  const [hifzState, setHifzState] = useState<QuranHifzStoreState>(() => loadHifzState());
  const [activeTab, setActiveTab] = useState<SanctuaryTab>('studio');
  const [studioDrill, setStudioDrill] = useState<StudioDrillMode>('fade');

  // Surah catalog & search
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSurahs, setShowAllSurahs] = useState(false);
  const [cachedSurahNumbers, setCachedSurahNumbers] = useState<number[]>([]);

  // Active Surah data & fetch status
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(
    () => loadHifzState().lastSurahNumber || 1
  );
  const [surahData, setSurahData] = useState<QuranSurahData | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [surahError, setSurahError] = useState<string | null>(null);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  // Studio chunk & masking controls
  const [chunkSize, setChunkSize] = useState<1 | 3>(3);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [fadeStage, setFadeStage] = useState<FadeStage>(0);
  const [revealedWordKeys, setRevealedWordKeys] = useState<Record<string, boolean>>({});
  const [selectedMushafAyah, setSelectedMushafAyah] = useState<number>(1);
  const [mushafContinuousPlaying, setMushafContinuousPlaying] = useState(false);

  // Ayah-Bridge Chain controls
  const [bridgeScope, setBridgeScope] = useState<'chunk' | 'surah'>('chunk');
  const [hideBridgeHeads, setHideBridgeHeads] = useState(true);
  const [revealedBridgeLinks, setRevealedBridgeLinks] = useState<Record<string, boolean>>({});

  // Meaning & Weak-Arabic support toggles
  const [showTafsir, setShowTafsir] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);

  // Echo-Shadowing audio state (Sheikh Mahmoud Khalil Al-Husary)
  const [repeatCount, setRepeatCount] = useState<EchoRepeatCount>(3);
  const [pauseSeconds, setPauseSeconds] = useState<EchoPauseSeconds>(3);
  const [echoActive, setEchoActive] = useState(false);
  const [echoPaused, setEchoPaused] = useState(false);
  const [echoAyahIdx, setEchoAyahIdx] = useState(0);
  const [echoRepeatIdx, setEchoRepeatIdx] = useState(0);
  const [echoSilenceLeft, setEchoSilenceLeft] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [singleAyahPlaying, setSingleAyahPlaying] = useState<number | null>(null);

  // Coach tip rotation & Wird confirmation feedback
  const [tipIndex, setTipIndex] = useState(() => {
    const todayTip = getTipOfTheDay();
    const idx = HIFZ_PSYCHOLOGY_TIPS.findIndex((t) => t.id === todayTip.id);
    return idx >= 0 ? idx : 0;
  });
  const [wirdBannerMsg, setWirdBannerMsg] = useState<string | null>(null);

  // Refs for managed audio & timers
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const revealTimersRef = useRef<Record<string, number>>({});
  const echoPauseTimerRef = useRef<number | null>(null);
  const echoCountdownRef = useRef<number | null>(null);
  const echoBridgeQueueRef = useRef<string[]>([]);

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

  const stopAllAudio = useCallback(() => {
    if (echoPauseTimerRef.current !== null) {
      window.clearTimeout(echoPauseTimerRef.current);
      echoPauseTimerRef.current = null;
    }
    if (echoCountdownRef.current !== null) {
      window.clearInterval(echoCountdownRef.current);
      echoCountdownRef.current = null;
    }
    echoBridgeQueueRef.current = [];
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setEchoActive(false);
    setEchoPaused(false);
    setEchoSilenceLeft(null);
    setSingleAyahPlaying(null);
    setMushafContinuousPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllRevealTimers();
      stopAllAudio();
    };
  }, [clearAllRevealTimers, stopAllAudio]);

  const refreshCachedList = useCallback(async () => {
    const nums = await listCachedSurahNumbers();
    setCachedSurahNumbers(nums);
  }, []);

  const loadSurah = useCallback(
    async (surahNum: number, forceRefresh = false) => {
      stopAllAudio();
      clearAllRevealTimers();
      setSelectedSurahNumber(surahNum);
      setChunkIndex(0);
      setRevealedBridgeLinks({});
      setWirdBannerMsg(null);
      setAudioError(null);
      setSurahError(null);
      setLoadingSurah(true);

      updateHifzState((prev) => ({
        ...prev,
        lastSurahNumber: surahNum,
      }));

      try {
        const result = await fetchSurahWithCache(surahNum, {
          apiBaseUrl: getApiBaseUrl(),
          forceRefresh,
        });
        setSurahData(result.data);
        setLoadedFromCache(result.fromCache);
        await refreshCachedList();
      } catch {
        setSurahData(null);
        setSurahError(
          isArabic
            ? 'تعذّر تحميل السورة حالياً. تأكد من الاتصال بالإنترنت للتحميل الأول، وبعدها ستعمل السورة بدون إنترنت دائماً.'
            : 'Could not load this Surah right now. An internet connection is needed for the first load; once loaded, it stays cached offline.'
        );
      } finally {
        setLoadingSurah(false);
      }
    },
    [clearAllRevealTimers, isArabic, refreshCachedList, stopAllAudio, updateHifzState]
  );

  useEffect(() => {
    void loadSurah(selectedSurahNumber);
    // Initial load for saved Surah only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chunks: AyahChunk[] = useMemo(() => {
    if (!surahData) return [];
    return chunkAyahs(surahData.ayahs, chunkSize, surahData.number);
  }, [surahData, chunkSize]);

  const safeChunkIndex = chunks.length > 0 ? Math.min(chunkIndex, chunks.length - 1) : 0;
  const activeChunk: AyahChunk | null = chunks[safeChunkIndex] ?? null;

  useEffect(() => {
    clearAllRevealTimers();
    setRevealedBridgeLinks({});
  }, [safeChunkIndex, fadeStage, chunkSize, clearAllRevealTimers]);

  const bridgeLinks: AyahBridgeLink[] = useMemo(() => {
    if (!surahData) return [];
    if (bridgeScope === 'surah') {
      return buildAyahBridgeChain(surahData.ayahs, 2);
    }
    if (!activeChunk) return [];
    // Include transition to the first Ayah of the next chunk so learners don't freeze between chunks
    const endAyah = activeChunk.endAyah;
    const nextAyah = surahData.ayahs.find((a) => a.numberInSurah === endAyah + 1);
    const bridgeSource = nextAyah ? [...activeChunk.ayahs, nextAyah] : activeChunk.ayahs;
    return buildAyahBridgeChain(bridgeSource, 2);
  }, [activeChunk, bridgeScope, surahData]);

  const { featured, juzAmma } = useMemo(() => getPinnedSurahs(), []);
  const filteredSurahs = useMemo(() => searchSurahs(searchQuery), [searchQuery]);
  const cachedSet = useMemo(() => new Set(cachedSurahNumbers), [cachedSurahNumbers]);

  const playAudioUrl = useCallback(
    (primaryUrl: string | null, fallbackUrl: string | null, onFinished: () => void) => {
      if (!primaryUrl && !fallbackUrl) {
        setAudioError(
          isArabic
            ? 'رابط تلاوة الشيخ الحصري غير متوفر لهذه الآية حالياً.'
            : 'Al-Husary audio URL is unavailable for this Ayah.'
        );
        stopAllAudio();
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      let triedFallback = false;

      const startSrc = primaryUrl || fallbackUrl!;
      setAudioError(null);

      audio.onended = () => {
        onFinished();
      };
      audio.onerror = () => {
        if (!triedFallback && fallbackUrl && audio.src !== fallbackUrl) {
          triedFallback = true;
          audio.src = fallbackUrl;
          void audio.play().catch(() => {
            setAudioError(
              isArabic
                ? 'تعذّر تشغيل تلاوة الشيخ الحصري. تأكد من الاتصال بالإنترنت.'
                : 'Unable to play Al-Husary audio. Please check your connection.'
            );
            stopAllAudio();
          });
          return;
        }
        setAudioError(
          isArabic
            ? 'تعذّر تشغيل تلاوة الشيخ الحصري. تأكد من الاتصال بالإنترنت.'
            : 'Unable to play Al-Husary audio. Please check your connection.'
        );
        stopAllAudio();
      };

      audio.src = startSrc;
      void audio.play().catch(() => {
        setAudioError(
          isArabic
            ? 'اضغط مرة أخرى لتشغيل الصوت في متصفحك.'
            : 'Tap play again to start audio playback.'
        );
        stopAllAudio();
      });
    },
    [isArabic, stopAllAudio]
  );

  const runEchoStep = useCallback(
    (ayahIdx: number, repeatIdx: number, chunkAyahsList: QuranAyah[]) => {
      const targetAyah = chunkAyahsList[ayahIdx];
      if (!targetAyah) {
        stopAllAudio();
        return;
      }

      setEchoActive(true);
      setEchoPaused(false);
      setEchoSilenceLeft(null);
      setEchoAyahIdx(ayahIdx);
      setEchoRepeatIdx(repeatIdx);
      setSingleAyahPlaying(null);

      playAudioUrl(targetAyah.audioUrl, targetAyah.audioFallbackUrl, () => {
        const step = advanceEchoShadowing(
          ayahIdx,
          repeatIdx,
          chunkAyahsList.length,
          repeatCount,
          pauseSeconds
        );

        if (step.action === 'complete') {
          if (step.pauseMs > 0) {
            let secs = Math.ceil(step.pauseMs / 1000);
            setEchoSilenceLeft(secs);
            echoCountdownRef.current = window.setInterval(() => {
              secs -= 1;
              setEchoSilenceLeft(secs > 0 ? secs : null);
            }, 1000);
            echoPauseTimerRef.current = window.setTimeout(() => {
              stopAllAudio();
            }, step.pauseMs);
          } else {
            stopAllAudio();
          }
          return;
        }

        if (step.pauseMs > 0) {
          let secs = Math.ceil(step.pauseMs / 1000);
          setEchoSilenceLeft(secs);
          echoCountdownRef.current = window.setInterval(() => {
            secs -= 1;
            setEchoSilenceLeft(secs > 0 ? secs : null);
          }, 1000);
          echoPauseTimerRef.current = window.setTimeout(() => {
            if (echoCountdownRef.current !== null) {
              window.clearInterval(echoCountdownRef.current);
              echoCountdownRef.current = null;
            }
            setEchoSilenceLeft(null);
            runEchoStep(step.nextAyahIndex, step.nextRepeatIndex, chunkAyahsList);
          }, step.pauseMs);
        } else {
          runEchoStep(step.nextAyahIndex, step.nextRepeatIndex, chunkAyahsList);
        }
      });
    },
    [pauseSeconds, playAudioUrl, repeatCount, stopAllAudio]
  );

  const handleToggleEchoPlay = () => {
    if (!activeChunk || activeChunk.ayahs.length === 0) return;

    if (echoActive && audioRef.current) {
      if (echoPaused) {
        setEchoPaused(false);
        void audioRef.current.play().catch(() => {});
      } else {
        setEchoPaused(true);
        audioRef.current.pause();
      }
      return;
    }

    runEchoStep(0, 0, activeChunk.ayahs);
  };

  const handlePlaySingleAyah = (ayah: QuranAyah) => {
    stopAllAudio();
    setSingleAyahPlaying(ayah.numberInSurah);
    playAudioUrl(ayah.audioUrl, ayah.audioFallbackUrl, () => {
      setSingleAyahPlaying(null);
    });
  };

  const handlePlayBridgePair = (link: AyahBridgeLink) => {
    stopAllAudio();
    const urls = [link.fromAudioUrl, link.toAudioUrl].filter((u): u is string => Boolean(u));
    if (urls.length === 0) return;
    echoBridgeQueueRef.current = urls.slice(1);
    setSingleAyahPlaying(link.fromAyahNumber);

    const playNextInPair = (url: string, ayahNum: number) => {
      setSingleAyahPlaying(ayahNum);
      playAudioUrl(url, null, () => {
        const nextUrl = echoBridgeQueueRef.current.shift();
        if (nextUrl) {
          playNextInPair(nextUrl, link.toAyahNumber);
        } else {
          setSingleAyahPlaying(null);
        }
      });
    };

    playNextInPair(urls[0], link.fromAyahNumber);
  };

  const handleTapMaskedWord = (ayahNumber: number, wordIdx: number) => {
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

  const handleRecordWird = (quality: WirdQuality) => {
    if (!surahData || !activeChunk) return;
    const meta = getSurahMeta(surahData.number);
    const updated = recordWirdReview(hifzState, {
      chunkKey: activeChunk.chunkKey,
      surahNumber: surahData.number,
      surahNameAr: meta?.nameAr || surahData.name,
      surahNameEn: meta?.nameEn || surahData.englishName,
      startAyah: activeChunk.startAyah,
      endAyah: activeChunk.endAyah,
      quality,
    });
    saveHifzState(updated);
    setHifzState(updated);

    const savedEntry = updated.wirdEntries[activeChunk.chunkKey];
    if (savedEntry) {
      setWirdBannerMsg(
        isArabic
          ? `✅ تم تسجيل المقطع (آية ${activeChunk.startAyah}–${activeChunk.endAyah}) — المراجعة القادمة بعد ${savedEntry.intervalDays} يوم`
          : `✅ Chunk (Ayah ${activeChunk.startAyah}–${activeChunk.endAyah}) scheduled — next review in ${savedEntry.intervalDays} day(s)`
      );
    }
  };

  const handleSelectSurahFromList = (surahNum: number, targetStartAyah?: number) => {
    setActiveTab('studio');
    void loadSurah(surahNum).then(() => {
      if (targetStartAyah && targetStartAyah > 1) {
        const targetIdx = Math.floor((targetStartAyah - 1) / chunkSize);
        setChunkIndex(Math.max(0, targetIdx));
      }
    });
  };

  const dueWirdItems = useMemo(() => getDueWirdItems(hifzState), [hifzState]);
  const allWirdItems = useMemo(
    () =>
      Object.values(hifzState.wirdEntries).sort((a, b) => a.nextReviewAt - b.nextReviewAt),
    [hifzState.wirdEntries]
  );

  const currentTip = HIFZ_PSYCHOLOGY_TIPS[tipIndex % HIFZ_PSYCHOLOGY_TIPS.length];
  const currentSurahMeta: SurahMeta | undefined = getSurahMeta(selectedSurahNumber);

  const isDarkMushaf = hifzState.mushafTheme === 'dark';

  return (
    <div
      className="quran-sanctuary min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip flex flex-col"
      data-qs-theme={isDarkMushaf ? 'dark' : 'light'}
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={isArabic ? 'ar' : 'en'}
    >
      {/* Top Serene Header */}
      <header
        className="sticky top-0 z-40 border-b px-3 sm:px-6 pb-3 pt-safe"
        style={{
          backgroundColor: 'var(--qs-surface)',
          borderColor: 'var(--qs-border)',
        }}
      >
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                stopAllAudio();
                onBack();
              }}
              className="min-h-[48px] px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition active:scale-95"
              style={{
                backgroundColor: 'var(--qs-surface-alt)',
                borderColor: 'var(--qs-border)',
                color: 'var(--qs-ink)',
              }}
            >
              {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span>{isArabic ? 'العودة' : 'Back'}</span>
            </button>

            <div className="text-center min-w-0 flex-1">
              <h1
                className="text-base sm:text-lg font-black leading-tight break-words"
                style={{ color: 'var(--qs-ink)' }}
              >
                📖 {isArabic ? 'ملاذ حفظ القرآن' : 'Quran Hifz Sanctuary'}
              </h1>
              <p
                className="text-[11px] font-bold leading-snug break-words"
                style={{ color: 'var(--qs-gold)' }}
              >
                {isArabic ? DEDICATION_AR : `${DEDICATION_AR} · ${DEDICATION_EN}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateHifzState((prev) => ({
                  ...prev,
                  mushafTheme: prev.mushafTheme === 'dark' ? 'light' : 'dark',
                }))
              }
              aria-label={isArabic ? 'تبديل إضاءة المصحف' : 'Toggle Mushaf lighting'}
              className="min-h-[48px] min-w-[48px] px-3 py-2 rounded-2xl border inline-flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer shrink-0 transition active:scale-95"
              style={{
                backgroundColor: 'var(--qs-surface-alt)',
                borderColor: 'var(--qs-border)',
                color: 'var(--qs-ink)',
              }}
            >
              {isDarkMushaf ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">
                {isDarkMushaf
                  ? isArabic
                    ? 'رقّ دافئ'
                    : 'Parchment'
                  : isArabic
                    ? 'وضع ليلي'
                    : 'Night'}
              </span>
            </button>
          </div>

          {/* 3-Tab Sub-Navigation */}
          <nav
            aria-label={isArabic ? 'أقسام ملاذ القرآن' : 'Sanctuary sections'}
            className="grid grid-cols-3 gap-2"
          >
            {(
              [
                { id: 'surahs', ar: 'السور', en: 'Surahs' },
                { id: 'studio', ar: 'المُصحف والحفظ', en: 'Hifz Studio' },
                {
                  id: 'wird',
                  ar: `الورد (${dueWirdItems.length})`,
                  en: `Wird (${dueWirdItems.length})`,
                },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="min-h-[48px] px-2 py-2 rounded-2xl border text-xs sm:text-sm font-black cursor-pointer transition"
                  style={
                    active
                      ? {
                          backgroundColor: 'var(--qs-accent)',
                          borderColor: 'var(--qs-accent)',
                          color: 'var(--qs-accent-ink)',
                        }
                      : {
                          backgroundColor: 'var(--qs-surface-alt)',
                          borderColor: 'var(--qs-border)',
                          color: 'var(--qs-ink-muted)',
                        }
                  }
                >
                  {isArabic ? tab.ar : tab.en}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-5 overflow-x-clip">
        {/* TAB 1: SURAHS & QUICK START */}
        {activeTab === 'surahs' && (
          <div className="space-y-5">
            {/* Search bar across all 114 Surahs */}
            <section
              className="p-4 rounded-3xl border space-y-3"
              style={{
                backgroundColor: 'var(--qs-surface)',
                borderColor: 'var(--qs-border)',
              }}
            >
              <label
                htmlFor="quran-surah-search"
                className="text-xs sm:text-sm font-black block"
                style={{ color: 'var(--qs-ink)' }}
              >
                {isArabic
                  ? 'ابحث في ١١٤ سورة (بالاسم العربي أو الإنجليزي أو رقم السورة)'
                  : 'Search all 114 Surahs (Arabic, English, or Surah number)'}
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--qs-ink-muted)' }}
                />
                <input
                  id="quran-surah-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'مثال: الملك، الكهف، 112...' : 'e.g. Al-Mulk, Kahf, 112...'}
                  className="w-full min-h-[48px] ps-10 pe-10 py-2.5 rounded-2xl border text-sm font-bold focus:outline-none"
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
                    className="absolute end-1 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center text-sm font-bold cursor-pointer"
                    style={{ color: 'var(--qs-ink-muted)' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {searchQuery.trim() && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                  {filteredSurahs.length === 0 ? (
                    <p className="text-xs font-bold col-span-full" style={{ color: 'var(--qs-ink-muted)' }}>
                      {isArabic ? 'لا توجد سورة مطابقة لبحثك.' : 'No matching Surah found.'}
                    </p>
                  ) : (
                    filteredSurahs.map((s) => (
                      <SurahQuickCard
                        key={s.number}
                        surah={s}
                        isArabic={isArabic}
                        isSelected={s.number === selectedSurahNumber}
                        isCached={cachedSet.has(s.number)}
                        onSelect={() => handleSelectSurahFromList(s.number)}
                      />
                    ))
                  )}
                </div>
              )}
            </section>

            {/* Pinned Featured Surahs */}
            <section className="space-y-2.5">
              <h2 className="text-sm sm:text-base font-black" style={{ color: 'var(--qs-ink)' }}>
                🌟 {isArabic ? 'سور مختارة للبدء الفوري' : 'Quick-Start Featured Surahs'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {featured.map((s) => (
                  <SurahQuickCard
                    key={s.number}
                    surah={s}
                    isArabic={isArabic}
                    isSelected={s.number === selectedSurahNumber}
                    isCached={cachedSet.has(s.number)}
                    onSelect={() => handleSelectSurahFromList(s.number)}
                  />
                ))}
              </div>
            </section>

            {/* Pinned Juz Amma (78-114) */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black" style={{ color: 'var(--qs-ink)' }}>
                  📿 {isArabic ? 'جزء عمّ (السور ٧٨ – ١١٤)' : "Juz 'Amma (Surahs 78–114)"}
                </h2>
                <span className="text-xs font-bold" style={{ color: 'var(--qs-ink-muted)' }}>
                  {isArabic ? 'اضغط على أي سورة للبدء' : 'Tap any Surah to begin'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {juzAmma.map((s) => (
                  <SurahQuickCard
                    key={s.number}
                    surah={s}
                    isArabic={isArabic}
                    isSelected={s.number === selectedSurahNumber}
                    isCached={cachedSet.has(s.number)}
                    onSelect={() => handleSelectSurahFromList(s.number)}
                  />
                ))}
              </div>
            </section>

            {/* Expandable Full 114-Surah Catalog */}
            <section
              className="p-4 rounded-3xl border space-y-3"
              style={{
                backgroundColor: 'var(--qs-surface)',
                borderColor: 'var(--qs-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAllSurahs((v) => !v)}
                className="w-full min-h-[48px] px-4 py-2 rounded-2xl border flex items-center justify-between gap-2 text-sm font-black cursor-pointer"
                style={{
                  backgroundColor: 'var(--qs-surface-alt)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-ink)',
                }}
              >
                <span>
                  {isArabic
                    ? `فهرس المصحف الكامل (١١٤ سورة)`
                    : 'Full 114-Surah Mushaf Index'}
                </span>
                <span>{showAllSurahs ? '▲' : '▼'}</span>
              </button>

              {showAllSurahs && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                  {SURAH_INDEX.map((s) => (
                    <SurahQuickCard
                      key={s.number}
                      surah={s}
                      isArabic={isArabic}
                      isSelected={s.number === selectedSurahNumber}
                      isCached={cachedSet.has(s.number)}
                      onSelect={() => handleSelectSurahFromList(s.number)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: ACTIVE HIFZ STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            {/* Surah Title & Quick Controls Bar */}
            <section
              className="p-4 rounded-3xl border space-y-3"
              style={{
                backgroundColor: 'var(--qs-surface)',
                borderColor: 'var(--qs-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black" style={{ color: 'var(--qs-ink)' }}>
                      {currentSurahMeta
                        ? `${currentSurahMeta.number}. سورة ${currentSurahMeta.nameAr} · ${currentSurahMeta.nameEn}`
                        : surahData?.name || ''}
                    </h2>
                    {loadedFromCache && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                        style={{
                          backgroundColor: 'var(--qs-accent-soft)',
                          borderColor: 'var(--qs-accent)',
                          color: 'var(--qs-accent)',
                        }}
                      >
                        {isArabic ? 'متاح بدون إنترنت ✓' : 'Cached Offline ✓'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--qs-ink-muted)' }}>
                    {isArabic
                      ? `القارئ: الشيخ محمود خليل الحصري · النص العثماني الموثّق`
                      : 'Reciter: Sheikh Mahmoud Khalil Al-Husary · Verified Uthmani Script'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('surahs')}
                  className="min-h-[48px] px-3.5 py-2 rounded-2xl border text-xs font-black cursor-pointer shrink-0"
                  style={{
                    backgroundColor: 'var(--qs-surface-alt)',
                    borderColor: 'var(--qs-border)',
                    color: 'var(--qs-ink)',
                  }}
                >
                  {isArabic ? 'تغيير السورة' : 'Change Surah'}
                </button>
              </div>

              {/* Quick-Start Surah Pills right inside Studio */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 18, 36, 67, 78, 112, 113, 114].map((num) => {
                  const meta = getSurahMeta(num);
                  if (!meta) return null;
                  const active = num === selectedSurahNumber;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => void loadSurah(num)}
                      className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition"
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--qs-accent)',
                              borderColor: 'var(--qs-accent)',
                              color: 'var(--qs-accent-ink)',
                            }
                          : {
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                              color: 'var(--qs-ink)',
                            }
                      }
                    >
                      {isArabic ? meta.nameAr : meta.nameEn}
                    </button>
                  );
                })}
              </div>

              {/* Chunk Size + Visual Page Anchor Font Size + Drill Mode */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t" style={{ borderColor: 'var(--qs-border)' }}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setChunkSize(1);
                      setChunkIndex(0);
                    }}
                    className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                    style={
                      chunkSize === 1
                        ? {
                            backgroundColor: 'var(--qs-accent-soft)',
                            borderColor: 'var(--qs-accent)',
                            color: 'var(--qs-accent)',
                          }
                        : {
                            backgroundColor: 'var(--qs-bg)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-ink-muted)',
                          }
                    }
                  >
                    {isArabic ? 'آية واحدة' : '1 Ayah'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChunkSize(3);
                      setChunkIndex(0);
                    }}
                    className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                    style={
                      chunkSize === 3
                        ? {
                            backgroundColor: 'var(--qs-accent-soft)',
                            borderColor: 'var(--qs-accent)',
                            color: 'var(--qs-accent)',
                          }
                        : {
                            backgroundColor: 'var(--qs-bg)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-ink-muted)',
                          }
                    }
                  >
                    {isArabic ? '٣ آيات (مقطع)' : '3-Ayah Chunk'}
                  </button>
                </div>

                {/* Visual Page Anchor Law: consistent font size */}
                <div className="flex items-center gap-1" role="group" aria-label={isArabic ? 'حجم خط المصحف' : 'Mushaf font size'}>
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateHifzState((prev) => ({ ...prev, fontSize: sz }))}
                      className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-xl border text-xs font-black cursor-pointer"
                      style={
                        hifzState.fontSize === sz
                          ? {
                              backgroundColor: 'var(--qs-gold-soft)',
                              borderColor: 'var(--qs-gold)',
                              color: 'var(--qs-gold)',
                            }
                          : {
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                              color: 'var(--qs-ink-muted)',
                            }
                      }
                    >
                      {sz === 'sm' ? 'أ-' : sz === 'md' ? 'أ' : 'أ+'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Loading / Error Handling */}
            {loadingSurah && (
              <div
                className="p-8 rounded-3xl border text-center space-y-2"
                style={{
                  backgroundColor: 'var(--qs-surface)',
                  borderColor: 'var(--qs-border)',
                }}
              >
                <RefreshCw size={24} className="mx-auto animate-spin" style={{ color: 'var(--qs-accent)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--qs-ink)' }}>
                  {isArabic ? 'جاري جلب النص العثماني الموثّق وتلاوة الحصري...' : 'Loading verified Uthmani script & Al-Husary audio...'}
                </p>
              </div>
            )}

            {!loadingSurah && surahError && (
              <div
                className="p-6 rounded-3xl border text-center space-y-3"
                style={{
                  backgroundColor: 'var(--qs-surface)',
                  borderColor: 'var(--qs-gold)',
                }}
              >
                <p className="text-sm font-bold" style={{ color: 'var(--qs-ink)' }}>
                  {surahError}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => void loadSurah(selectedSurahNumber, true)}
                    className="min-h-[48px] px-4 py-2 rounded-2xl text-xs font-black cursor-pointer"
                    style={{
                      backgroundColor: 'var(--qs-accent)',
                      color: 'var(--qs-accent-ink)',
                    }}
                  >
                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                  </button>
                  {cachedSurahNumbers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void loadSurah(cachedSurahNumbers[0])}
                      className="min-h-[48px] px-4 py-2 rounded-2xl border text-xs font-black cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-surface-alt)',
                        borderColor: 'var(--qs-border)',
                        color: 'var(--qs-ink)',
                      }}
                    >
                      {isArabic
                        ? `فتح سورة محفوظة (${getSurahMeta(cachedSurahNumbers[0])?.nameAr || cachedSurahNumbers[0]})`
                        : `Open cached Surah (${getSurahMeta(cachedSurahNumbers[0])?.nameEn || cachedSurahNumbers[0]})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loaded Studio Content */}
            {!loadingSurah && !surahError && surahData && activeChunk && (
              <>
                {/* Drill Mode Selector: Progressive Fade vs Ayah-Bridge Chain */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStudioDrill('fade')}
                    className="min-h-[48px] px-3 py-2.5 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer transition"
                    style={
                      studioDrill === 'fade'
                        ? {
                            backgroundColor: 'var(--qs-accent)',
                            borderColor: 'var(--qs-accent)',
                            color: 'var(--qs-accent-ink)',
                          }
                        : {
                            backgroundColor: 'var(--qs-surface)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-ink)',
                          }
                    }
                  >
                    <EyeOff size={16} />
                    <span>{isArabic ? 'التعتيم التدريجي (الاسترجاع)' : 'Progressive Fade-Out'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioDrill('bridge')}
                    className="min-h-[48px] px-3 py-2.5 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer transition"
                    style={
                      studioDrill === 'bridge'
                        ? {
                            backgroundColor: 'var(--qs-accent)',
                            borderColor: 'var(--qs-accent)',
                            color: 'var(--qs-accent-ink)',
                          }
                        : {
                            backgroundColor: 'var(--qs-surface)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-ink)',
                          }
                    }
                  >
                    <Link2 size={16} />
                    <span>{isArabic ? 'ربط رؤوس الآيات (منع النسيان)' : 'Ayah-Bridge Chain'}</span>
                  </button>
                </div>

                {/* Method 3: 3-3-3 Echo-Shadowing Audio Bar (Al-Husary) */}
                <section
                  className="p-4 rounded-3xl border space-y-3"
                  style={{
                    backgroundColor: 'var(--qs-surface)',
                    borderColor: 'var(--qs-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Volume2 size={18} style={{ color: 'var(--qs-accent)' }} className="shrink-0" />
                      <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--qs-ink)' }}>
                        {isArabic ? 'التكرار الذكي مع صمت الترديد — الحصري' : 'Echo-Shadowing Loop — Al-Husary'}
                      </span>
                    </div>
                    {echoActive && (
                      <span
                        className="px-2.5 py-1 rounded-xl text-xs font-black"
                        style={{
                          backgroundColor: 'var(--qs-gold-soft)',
                          color: 'var(--qs-gold)',
                        }}
                      >
                        {isArabic
                          ? `آية ${activeChunk.ayahs[echoAyahIdx]?.numberInSurah ?? ''} · تكرار ${echoRepeatIdx + 1}/${repeatCount}`
                          : `Ayah ${activeChunk.ayahs[echoAyahIdx]?.numberInSurah ?? ''} · Loop ${echoRepeatIdx + 1}/${repeatCount}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleToggleEchoPlay}
                      className="min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-black inline-flex items-center gap-2 cursor-pointer transition active:scale-95"
                      style={{
                        backgroundColor: 'var(--qs-accent)',
                        color: 'var(--qs-accent-ink)',
                      }}
                    >
                      {echoActive && !echoPaused ? <Pause size={16} /> : <Play size={16} />}
                      <span>
                        {echoActive
                          ? echoPaused
                            ? isArabic
                              ? 'استئناف'
                              : 'Resume'
                            : isArabic
                              ? 'إيقاف مؤقت'
                              : 'Pause'
                          : isArabic
                            ? 'تشغيل المقطع'
                            : 'Play Chunk'}
                      </span>
                    </button>

                    {echoActive && (
                      <button
                        type="button"
                        onClick={stopAllAudio}
                        aria-label={isArabic ? 'إيقاف التلاوة' : 'Stop playback'}
                        className="min-h-[48px] min-w-[48px] px-3 py-2 rounded-2xl border inline-flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
                        style={{
                          backgroundColor: 'var(--qs-surface-alt)',
                          borderColor: 'var(--qs-border)',
                          color: 'var(--qs-ink)',
                        }}
                      >
                        <Square size={14} />
                        <span>{isArabic ? 'إيقاف' : 'Stop'}</span>
                      </button>
                    )}

                    {/* Repeat Count 1x / 3x / 5x */}
                    <div className="flex items-center gap-1" role="group" aria-label={isArabic ? 'عدد التكرار' : 'Repeat count'}>
                      {([1, 3, 5] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setRepeatCount(cnt)}
                          className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-xl border text-xs font-black cursor-pointer"
                          style={
                            repeatCount === cnt
                              ? {
                                  backgroundColor: 'var(--qs-accent-soft)',
                                  borderColor: 'var(--qs-accent)',
                                  color: 'var(--qs-accent)',
                                }
                              : {
                                  backgroundColor: 'var(--qs-bg)',
                                  borderColor: 'var(--qs-border)',
                                  color: 'var(--qs-ink-muted)',
                                }
                          }
                        >
                          {cnt}×
                        </button>
                      ))}
                    </div>

                    {/* Echo Silence Gap 0s / 3s / 5s */}
                    <div className="flex items-center gap-1" role="group" aria-label={isArabic ? 'فترة صمت الترديد' : 'Echo pause gap'}>
                      {([0, 3, 5] as const).map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setPauseSeconds(sec)}
                          className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-xl border text-xs font-black cursor-pointer"
                          style={
                            pauseSeconds === sec
                              ? {
                                  backgroundColor: 'var(--qs-gold-soft)',
                                  borderColor: 'var(--qs-gold)',
                                  color: 'var(--qs-gold)',
                                }
                              : {
                                  backgroundColor: 'var(--qs-bg)',
                                  borderColor: 'var(--qs-border)',
                                  color: 'var(--qs-ink-muted)',
                                }
                          }
                        >
                          {sec === 0
                            ? isArabic
                              ? 'بلا صمت'
                              : '0s gap'
                            : isArabic
                              ? `${sec}ث صمت`
                              : `${sec}s echo`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {echoSilenceLeft !== null && (
                    <div
                      role="status"
                      className="p-3 rounded-2xl border text-xs sm:text-sm font-black text-center"
                      style={{
                        backgroundColor: 'var(--qs-gold-soft)',
                        borderColor: 'var(--qs-gold)',
                        color: 'var(--qs-gold)',
                      }}
                    >
                      {isArabic
                        ? `🗣️ ردّد الآية بصوتك الآن... (${echoSilenceLeft} ث)`
                        : `🗣️ Repeat aloud in the silence... (${echoSilenceLeft}s)`}
                    </div>
                  )}

                  {audioError && (
                    <p className="text-xs font-bold" style={{ color: 'var(--qs-gold)' }}>
                      {audioError}
                    </p>
                  )}
                </section>

                {/* DRILL A: 4-Stage Progressive Word Fade-Out */}
                {studioDrill === 'fade' && (
                  <section
                    className="p-4 sm:p-6 rounded-3xl border space-y-4"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                    }}
                  >
                    {/* 4-Stage Fade Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-black" style={{ color: 'var(--qs-ink-muted)' }}>
                          {isArabic
                            ? 'التعتيم التدريجي (اضغط على أي كلمة مخفية لكشفها ثانيتين)'
                            : 'Progressive Fade-Out (tap any hidden word to peek for 2s)'}
                        </span>
                        <span className="text-xs font-black" style={{ color: 'var(--qs-accent)' }}>
                          {isArabic
                            ? `الآيات ${activeChunk.startAyah}–${activeChunk.endAyah} من ${surahData.numberOfAyahs}`
                            : `Ayah ${activeChunk.startAyah}–${activeChunk.endAyah} of ${surahData.numberOfAyahs}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                          [
                            { stage: 0, ar: '١٠٠٪ ظاهر', en: '100% Visible' },
                            { stage: 30, ar: 'تعتيم ٣٠٪', en: '30% Faded' },
                            { stage: 70, ar: 'تعتيم ٧٠٪', en: '70% Faded' },
                            { stage: 100, ar: 'إخفاء ١٠٠٪', en: '100% Hidden' },
                          ] as const
                        ).map((item) => {
                          const selected = fadeStage === item.stage;
                          return (
                            <button
                              key={item.stage}
                              type="button"
                              onClick={() => setFadeStage(item.stage)}
                              className="min-h-[48px] px-3 py-2 rounded-2xl border text-xs font-black cursor-pointer transition"
                              style={
                                selected
                                  ? {
                                      backgroundColor: 'var(--qs-accent)',
                                      borderColor: 'var(--qs-accent)',
                                      color: 'var(--qs-accent-ink)',
                                    }
                                  : {
                                      backgroundColor: 'var(--qs-bg)',
                                      borderColor: 'var(--qs-border)',
                                      color: 'var(--qs-ink)',
                                    }
                              }
                            >
                              {isArabic ? item.ar : item.en}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Meaning & Weak-Arabic Support Toggles */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowTafsir((v) => !v)}
                        className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                        style={
                          showTafsir
                            ? {
                                backgroundColor: 'var(--qs-accent-soft)',
                                borderColor: 'var(--qs-accent)',
                                color: 'var(--qs-accent)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                                color: 'var(--qs-ink-muted)',
                              }
                        }
                      >
                        {isArabic ? 'التفسير الميسر' : 'Tafsir Muyassar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEnglish((v) => !v)}
                        className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                        style={
                          showEnglish
                            ? {
                                backgroundColor: 'var(--qs-accent-soft)',
                                borderColor: 'var(--qs-accent)',
                                color: 'var(--qs-accent)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                                color: 'var(--qs-ink-muted)',
                              }
                        }
                      >
                        {isArabic ? 'الترجمة الإنجليزية' : 'English Meaning'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTranslit((v) => !v)}
                        className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                        style={
                          showTranslit
                            ? {
                                backgroundColor: 'var(--qs-accent-soft)',
                                borderColor: 'var(--qs-accent)',
                                color: 'var(--qs-accent)',
                              }
                            : {
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                                color: 'var(--qs-ink-muted)',
                              }
                        }
                      >
                        {isArabic ? 'النطق الصوتي (Transliteration)' : 'Phonetic Transliteration'}
                      </button>
                    </div>

                    {/* Ayah Cards */}
                    <div className="space-y-4">
                      {activeChunk.ayahs.map((ayah) => {
                        const tokens = tokenizeAyahWords(ayah.textUthmani);
                        const revealedSet = new Set<number>();
                        for (let i = 0; i < tokens.length; i += 1) {
                          if (revealedWordKeys[`${ayah.numberInSurah}:${i}`]) {
                            revealedSet.add(i);
                          }
                        }
                        const maskedWords = computeWordMask(
                          tokens,
                          fadeStage,
                          surahData.number * 1000 + ayah.numberInSurah,
                          revealedSet
                        );
                        const isCurrentlyPlaying =
                          (echoActive &&
                            activeChunk.ayahs[echoAyahIdx]?.numberInSurah === ayah.numberInSurah) ||
                          singleAyahPlaying === ayah.numberInSurah;

                        return (
                          <article
                            key={ayah.numberInSurah}
                            className="p-4 sm:p-5 rounded-2xl border space-y-3"
                            style={{
                              backgroundColor: isCurrentlyPlaying
                                ? 'var(--qs-accent-soft)'
                                : 'var(--qs-bg)',
                              borderColor: isCurrentlyPlaying
                                ? 'var(--qs-accent)'
                                : 'var(--qs-border)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-black border"
                                style={{
                                  backgroundColor: 'var(--qs-surface)',
                                  borderColor: 'var(--qs-border)',
                                  color: 'var(--qs-gold)',
                                }}
                              >
                                {isArabic ? `الآية ${ayah.numberInSurah}` : `Ayah ${ayah.numberInSurah}`}
                              </span>

                              <button
                                type="button"
                                onClick={() => handlePlaySingleAyah(ayah)}
                                aria-label={
                                  isArabic
                                    ? `استماع للآية ${ayah.numberInSurah} بصوت الحصري`
                                    : `Listen to Ayah ${ayah.numberInSurah}`
                                }
                                className="min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl border inline-flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--qs-surface)',
                                  borderColor: 'var(--qs-border)',
                                  color: 'var(--qs-accent)',
                                }}
                              >
                                <Volume2 size={16} />
                                <span>{isArabic ? 'استمع' : 'Listen'}</span>
                              </button>
                            </div>

                            {/* Uthmani Verse Text with Tap-to-Reveal Masked Words */}
                            <div
                              dir="rtl"
                              lang="ar"
                              className={`quran-uthmani-text ${FONT_SIZE_CLASSES[hifzState.fontSize]} flex flex-wrap items-center gap-x-2 gap-y-2 text-right`}
                            >
                              {maskedWords.map((mw) =>
                                mw.isMaskedByStage ? (
                                  <button
                                    key={mw.index}
                                    type="button"
                                    onClick={() =>
                                      handleTapMaskedWord(ayah.numberInSurah, mw.index)
                                    }
                                    aria-label={
                                      mw.isHidden
                                        ? isArabic
                                          ? 'كلمة مخفية — اضغط للكشف ثانيتين'
                                          : 'Hidden word — tap to peek'
                                        : mw.word
                                    }
                                    className={`min-h-[48px] px-2 py-0.5 rounded-lg transition cursor-pointer ${
                                      mw.isHidden ? 'quran-word-faded' : ''
                                    }`}
                                    style={
                                      mw.isHidden
                                        ? undefined
                                        : {
                                            backgroundColor: 'var(--qs-gold-soft)',
                                            color: 'var(--qs-ink)',
                                          }
                                    }
                                  >
                                    {mw.word}
                                  </button>
                                ) : (
                                  <span key={mw.index} style={{ color: 'var(--qs-ink)' }}>
                                    {mw.word}
                                  </span>
                                )
                              )}
                              <span
                                className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-bold border"
                                style={{
                                  borderColor: 'var(--qs-gold)',
                                  color: 'var(--qs-gold)',
                                }}
                              >
                                ﴿{ayah.numberInSurah}﴾
                              </span>
                            </div>

                            {/* Optional Meaning & Transliteration Support */}
                            {(showTafsir || showEnglish || showTranslit) && (
                              <div
                                className="pt-3 border-t space-y-2 text-start"
                                style={{ borderColor: 'var(--qs-border)' }}
                              >
                                {showTafsir && ayah.tafsirMuyassar && (
                                  <p
                                    dir="rtl"
                                    lang="ar"
                                    className="text-xs sm:text-sm leading-relaxed"
                                    style={{ color: 'var(--qs-ink-muted)' }}
                                  >
                                    <strong style={{ color: 'var(--qs-accent)' }}>
                                      التفسير الميسر:{' '}
                                    </strong>
                                    {ayah.tafsirMuyassar}
                                  </p>
                                )}
                                {showEnglish && ayah.translationEn && (
                                  <p
                                    dir="ltr"
                                    lang="en"
                                    className="text-xs sm:text-sm leading-relaxed"
                                    style={{ color: 'var(--qs-ink-muted)' }}
                                  >
                                    <strong style={{ color: 'var(--qs-accent)' }}>Meaning: </strong>
                                    {ayah.translationEn}
                                  </p>
                                )}
                                {showTranslit && ayah.transliterationEn && (
                                  <p
                                    dir="ltr"
                                    lang="en"
                                    className="text-xs italic leading-relaxed"
                                    style={{ color: 'var(--qs-gold)' }}
                                  >
                                    {ayah.transliterationEn}
                                  </p>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* DRILL B: Ayah-Bridge Chain (Anti-Freeze Drill) */}
                {studioDrill === 'bridge' && (
                  <section
                    className="p-4 sm:p-6 rounded-3xl border space-y-4"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="space-y-0.5">
                        <h3 className="text-sm sm:text-base font-black" style={{ color: 'var(--qs-ink)' }}>
                          🔗 {isArabic ? 'تمرين ربط رؤوس الآيات' : 'Ayah-Bridge Chain Drill'}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--qs-ink-muted)' }}>
                          {isArabic
                            ? 'يظهر آخر كلمتين من الآية مع أول كلمتين من الآية التالية لمنع التوقف أثناء الصلاة.'
                            : 'Shows the last 2 words of Ayah N linked to the first 2 words of Ayah N+1 so you never freeze in Salah.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            setBridgeScope((s) => (s === 'chunk' ? 'surah' : 'chunk'))
                          }
                          className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                          style={{
                            backgroundColor: 'var(--qs-surface-alt)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-ink)',
                          }}
                        >
                          {bridgeScope === 'chunk'
                            ? isArabic
                              ? 'عرض السورة كلها'
                              : 'Full Surah Bridges'
                            : isArabic
                              ? 'المقطع الحالي فقط'
                              : 'Current Chunk Only'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHideBridgeHeads((v) => !v);
                            setRevealedBridgeLinks({});
                          }}
                          className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          style={{
                            backgroundColor: hideBridgeHeads
                              ? 'var(--qs-accent-soft)'
                              : 'var(--qs-surface-alt)',
                            borderColor: hideBridgeHeads
                              ? 'var(--qs-accent)'
                              : 'var(--qs-border)',
                            color: hideBridgeHeads ? 'var(--qs-accent)' : 'var(--qs-ink)',
                          }}
                        >
                          {hideBridgeHeads ? <Eye size={15} /> : <EyeOff size={15} />}
                          <span>
                            {hideBridgeHeads
                              ? isArabic
                                ? 'اختبار رأس الآية: مفعّل'
                                : 'Quiz Head: On'
                              : isArabic
                                ? 'إظهار رأس الآية'
                                : 'Quiz Head: Off'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {bridgeLinks.length === 0 ? (
                      <p className="text-xs font-bold" style={{ color: 'var(--qs-ink-muted)' }}>
                        {isArabic
                          ? 'هذه السورة أو المقطع لا يحتوي على آية تالية للربط.'
                          : 'No consecutive Ayah pair available for this selection.'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {bridgeLinks.map((link) => {
                          const linkKey = `${link.fromAyahNumber}-${link.toAyahNumber}`;
                          const isHeadHidden = hideBridgeHeads && !revealedBridgeLinks[linkKey];

                          return (
                            <div
                              key={linkKey}
                              className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              style={{
                                backgroundColor: 'var(--qs-bg)',
                                borderColor: 'var(--qs-border)',
                              }}
                            >
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <span
                                  className="text-[11px] font-black block"
                                  style={{ color: 'var(--qs-gold)' }}
                                >
                                  {isArabic
                                    ? `ربط الآية ${link.fromAyahNumber} ← الآية ${link.toAyahNumber}`
                                    : `Ayah ${link.fromAyahNumber} → Ayah ${link.toAyahNumber}`}
                                </span>
                                <div
                                  dir="rtl"
                                  lang="ar"
                                  className="quran-uthmani-text text-xl sm:text-2xl flex items-center flex-wrap gap-2"
                                >
                                  <span style={{ color: 'var(--qs-ink)' }}>
                                    ... {link.tailWords.join(' ')}
                                  </span>
                                  <span style={{ color: 'var(--qs-gold)' }}>⬅</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedBridgeLinks((prev) => ({
                                        ...prev,
                                        [linkKey]: !prev[linkKey],
                                      }))
                                    }
                                    className={`min-h-[48px] px-3 py-1 rounded-xl border transition cursor-pointer ${
                                      isHeadHidden ? 'quran-word-faded' : ''
                                    }`}
                                    style={
                                      isHeadHidden
                                        ? undefined
                                        : {
                                            backgroundColor: 'var(--qs-accent-soft)',
                                            borderColor: 'var(--qs-accent)',
                                            color: 'var(--qs-accent)',
                                          }
                                    }
                                  >
                                    {link.headWords.join(' ')} ...
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handlePlayBridgePair(link)}
                                className="min-h-[48px] px-3.5 py-2 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--qs-surface)',
                                  borderColor: 'var(--qs-border)',
                                  color: 'var(--qs-accent)',
                                }}
                              >
                                <Volume2 size={16} />
                                <span>{isArabic ? 'تلاوة الوصل' : 'Hear Link'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

                {/* Chunk Navigation (Prev / Next) */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={safeChunkIndex <= 0}
                    onClick={() => {
                      stopAllAudio();
                      setChunkIndex((idx) => Math.max(0, idx - 1));
                    }}
                    className="min-h-[48px] px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                      color: 'var(--qs-ink)',
                    }}
                  >
                    {isArabic ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    <span>{isArabic ? 'المقطع السابق' : 'Previous'}</span>
                  </button>

                  <span className="text-xs font-black" style={{ color: 'var(--qs-ink-muted)' }}>
                    {safeChunkIndex + 1} / {chunks.length}
                  </span>

                  <button
                    type="button"
                    disabled={safeChunkIndex >= chunks.length - 1}
                    onClick={() => {
                      stopAllAudio();
                      setChunkIndex((idx) => Math.min(chunks.length - 1, idx + 1));
                    }}
                    className="min-h-[48px] px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                      color: 'var(--qs-ink)',
                    }}
                  >
                    <span>{isArabic ? 'المقطع التالي' : 'Next'}</span>
                    {isArabic ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>

                {/* Method 5: Log Chunk to Daily Wird (SM-2) */}
                <section
                  className="p-4 sm:p-5 rounded-3xl border space-y-3"
                  style={{
                    backgroundColor: 'var(--qs-surface)',
                    borderColor: 'var(--qs-border)',
                  }}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black" style={{ color: 'var(--qs-ink)' }}>
                      🗓️ {isArabic ? 'سجّل هذا المقطع في ورد المراجعة اليومي (SM-2)' : 'Schedule This Chunk in Daily Wird (SM-2)'}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--qs-ink-muted)' }}>
                      {isArabic
                        ? 'تتجدد المراجعة تلقائياً على سُلّم: ١ يوم ← ٣ أيام ← ٧ أيام ← ٢١ يوماً ليثبت الحفظ بإذن الله.'
                        : 'Automatically schedules consolidation reviews at 1 day → 3 days → 7 days → 21 days.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRecordWird('hard')}
                      className="min-h-[48px] px-3 py-2 rounded-2xl border text-xs font-black cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-surface-alt)',
                        borderColor: 'var(--qs-border)',
                        color: 'var(--qs-ink)',
                      }}
                    >
                      {isArabic ? '🔁 أحتاج تكرار غداً (١ يوم)' : '🔁 Needs Repeat (1d)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordWird('good')}
                      className="min-h-[48px] px-3 py-2 rounded-2xl text-xs font-black cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-accent)',
                        color: 'var(--qs-accent-ink)',
                      }}
                    >
                      {isArabic ? '✓ حفظته جيداً' : '✓ Memorized Well'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordWird('easy')}
                      className="min-h-[48px] px-3 py-2 rounded-2xl border text-xs font-black cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-gold-soft)',
                        borderColor: 'var(--qs-gold)',
                        color: 'var(--qs-gold)',
                      }}
                    >
                      {isArabic ? '🌟 متقن بفضل الله' : '🌟 Effortless Recall'}
                    </button>
                  </div>

                  {wirdBannerMsg && (
                    <p role="status" className="text-xs font-black" style={{ color: 'var(--qs-accent)' }}>
                      {wirdBannerMsg}
                    </p>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* TAB 3: DAILY WIRD & PSYCHOLOGICAL COACH */}
        {activeTab === 'wird' && (
          <div className="space-y-5">
            {/* Due Reviews Today */}
            <section
              className="p-4 sm:p-5 rounded-3xl border space-y-3"
              style={{
                backgroundColor: 'var(--qs-surface)',
                borderColor: 'var(--qs-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-base font-black" style={{ color: 'var(--qs-ink)' }}>
                  🗓️ {isArabic ? 'ورد المراجعة المستحق اليوم' : "Today's Due Hifz Wird"}
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-xs font-black"
                  style={{
                    backgroundColor: 'var(--qs-accent-soft)',
                    color: 'var(--qs-accent)',
                  }}
                >
                  {dueWirdItems.length} {isArabic ? 'مقطع للمراجعة' : 'due'}
                </span>
              </div>

              {dueWirdItems.length === 0 ? (
                <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--qs-ink-muted)' }}>
                  {isArabic
                    ? 'لا توجد مقاطع مستحقة الآن. ابدأ بحفظ مقطع من «المُصحف والحفظ» وسجّله في الورد.'
                    : 'No chunks due right now. Memorize a chunk in Hifz Studio and log it to start your Daily Wird.'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {dueWirdItems.map((entry) => (
                    <div
                      key={entry.chunkKey}
                      className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 flex-wrap"
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-accent)',
                      }}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-black" style={{ color: 'var(--qs-ink)' }}>
                          {isArabic
                            ? `سورة ${entry.surahNameAr} · الآيات ${entry.startAyah}–${entry.endAyah}`
                            : `${entry.surahNameEn} · Ayah ${entry.startAyah}–${entry.endAyah}`}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--qs-ink-muted)' }}>
                          {isArabic
                            ? `التكرارات: ${entry.repetitions} · الفاصل الحالي: ${entry.intervalDays} يوم`
                            : `Repetitions: ${entry.repetitions} · Current interval: ${entry.intervalDays}d`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectSurahFromList(entry.surahNumber, entry.startAyah)}
                        className="min-h-[48px] px-4 py-2 rounded-2xl text-xs font-black cursor-pointer"
                        style={{
                          backgroundColor: 'var(--qs-accent)',
                          color: 'var(--qs-accent-ink)',
                        }}
                      >
                        {isArabic ? 'راجع الآن' : 'Review Now'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {allWirdItems.length > 0 && (
                <div className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--qs-border)' }}>
                  <h3 className="text-xs font-black" style={{ color: 'var(--qs-ink-muted)' }}>
                    {isArabic
                      ? `كل المقاطع المحفوظة في الورد (${allWirdItems.length})`
                      : `All Tracked Chunks (${allWirdItems.length})`}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allWirdItems.map((entry) => {
                      const daysUntil = Math.max(
                        0,
                        Math.ceil((entry.nextReviewAt - Date.now()) / 86_400_000)
                      );
                      return (
                        <button
                          key={entry.chunkKey}
                          type="button"
                          onClick={() =>
                            handleSelectSurahFromList(entry.surahNumber, entry.startAyah)
                          }
                          className="min-h-[48px] p-3 rounded-2xl border text-start flex items-center justify-between gap-2 cursor-pointer"
                          style={{
                            backgroundColor: 'var(--qs-surface-alt)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-ink)',
                          }}
                        >
                          <span className="text-xs font-black truncate">
                            {isArabic
                              ? `${entry.surahNameAr} (${entry.startAyah}–${entry.endAyah})`
                              : `${entry.surahNameEn} (${entry.startAyah}–${entry.endAyah})`}
                          </span>
                          <span
                            className="text-[11px] font-bold shrink-0"
                            style={{ color: 'var(--qs-gold)' }}
                          >
                            {daysUntil === 0
                              ? isArabic
                                ? 'مستحق اليوم'
                                : 'Due today'
                              : isArabic
                                ? `بعد ${daysUntil} يوم`
                                : `In ${daysUntil}d`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Psychological Hifz Coach Card (Always accessible below main studio / wird) */}
        <section
          className="p-4 sm:p-5 rounded-3xl border space-y-3"
          style={{
            backgroundColor: 'var(--qs-surface)',
            borderColor: 'var(--qs-border)',
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: 'var(--qs-gold)' }} />
              <h3 className="text-xs sm:text-sm font-black" style={{ color: 'var(--qs-gold)' }}>
                {isArabic ? 'مدرب الحفظ النفسي والعصبي' : 'Psychological Hifz Coach'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setTipIndex(
                    (idx) =>
                      (idx - 1 + HIFZ_PSYCHOLOGY_TIPS.length) % HIFZ_PSYCHOLOGY_TIPS.length
                  )
                }
                aria-label={isArabic ? 'النصيحة السابقة' : 'Previous tip'}
                className="min-h-[48px] min-w-[48px] rounded-xl border flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: 'var(--qs-bg)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-ink)',
                }}
              >
                {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <button
                type="button"
                onClick={() =>
                  setTipIndex((idx) => (idx + 1) % HIFZ_PSYCHOLOGY_TIPS.length)
                }
                aria-label={isArabic ? 'النصيحة التالية' : 'Next tip'}
                className="min-h-[48px] min-w-[48px] rounded-xl border flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: 'var(--qs-bg)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-ink)',
                }}
              >
                {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm sm:text-base font-black" style={{ color: 'var(--qs-ink)' }}>
              {currentTip.icon} {isArabic ? currentTip.titleAr : currentTip.titleEn}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--qs-ink-muted)' }}>
              {isArabic ? currentTip.summaryAr : currentTip.summaryEn}
            </p>
            <p className="text-xs font-bold" style={{ color: 'var(--qs-accent)' }}>
              ✦ {isArabic ? currentTip.actionAr : currentTip.actionEn}
            </p>
          </div>
        </section>
      </main>

      {/* Dignified Sadaqah Jariyah Footer */}
      <footer
        className="border-t px-4 py-5 text-center space-y-1.5"
        style={{
          backgroundColor: 'var(--qs-surface)',
          borderColor: 'var(--qs-border)',
        }}
      >
        <p
          className="text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1.5 flex-wrap"
          style={{ color: 'var(--qs-gold)' }}
        >
          <Heart size={14} />
          <span>{DEDICATION_AR}</span>
        </p>
        <p className="text-[11px]" style={{ color: 'var(--qs-ink-muted)' }}>
          {isArabic
            ? 'النص العثماني الموثّق وتلاوة الشيخ محمود خليل الحصري عبر AlQuran.cloud — بدون إعلانات أو اشتراكات.'
            : `${DEDICATION_EN} · Verified Uthmani text & Sheikh Al-Husary audio via AlQuran.cloud`}
        </p>
      </footer>
    </div>
  );
}

function SurahQuickCard({
  surah,
  isArabic,
  isSelected,
  isCached,
  onSelect,
}: {
  surah: SurahMeta;
  isArabic: boolean;
  isSelected: boolean;
  isCached: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="min-h-[56px] p-3 rounded-2xl border text-start flex flex-col justify-between gap-1 cursor-pointer transition active:scale-95"
      style={
        isSelected
          ? {
              backgroundColor: 'var(--qs-accent-soft)',
              borderColor: 'var(--qs-accent)',
              color: 'var(--qs-ink)',
            }
          : {
              backgroundColor: 'var(--qs-surface)',
              borderColor: 'var(--qs-border)',
              color: 'var(--qs-ink)',
            }
      }
    >
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-[11px] font-black" style={{ color: 'var(--qs-gold)' }}>
          {surah.number}
        </span>
        {isCached && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-bold"
            style={{ color: 'var(--qs-accent)' }}
          >
            <Check size={12} />
            <span>{isArabic ? 'محفوظ' : 'Offline'}</span>
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black truncate">{surah.nameAr}</p>
        <p className="text-[11px] truncate" style={{ color: 'var(--qs-ink-muted)' }}>
          {surah.nameEn} · {surah.ayahCount} {isArabic ? 'آية' : 'Ayahs'}
        </p>
      </div>
    </button>
  );
}
