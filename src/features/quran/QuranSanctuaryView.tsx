// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Gauge,
  Globe,
  Heart,
  Link2,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Sun,
  Volume2,
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
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
  buildAyahAudioFallbackChain,
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
  onSwitchToLanguages?: () => void;
  isArabic?: boolean;
}

type SanctuaryTab = 'surahs' | 'studio' | 'wird';
type StudioDrillMode = 'mushaf' | 'fade' | 'bridge';
type PlaybackSpeed = 0.75 | 1.0;

const DEDICATION_AR = 'صدقة جارية على جميع أموات المسلمين — مجاني بالكامل مدى الحياة';
const DEDICATION_EN = 'Sadaqah Jariyah for all deceased Muslims — 100% Free Forever';

const FONT_SCALE_STEPS = [1.0, 1.15, 1.3, 1.5, 1.65, 1.8] as const;

const FONT_SIZE_CLASSES: Record<MushafFontSize, string> = {
  sm: '',
  md: '',
  lg: '',
};

export function QuranSanctuaryView({
  onBack,
  onSwitchToLanguages,
  isArabic = true,
}: QuranSanctuaryViewProps) {
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
  const [toolsOpen, setToolsOpen] = useState(false);
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
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [echoActive, setEchoActive] = useState(false);
  const [echoPaused, setEchoPaused] = useState(false);
  const [echoAyahIdx, setEchoAyahIdx] = useState(0);
  const [echoRepeatIdx, setEchoRepeatIdx] = useState(0);
  const [echoSilenceLeft, setEchoSilenceLeft] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [singleAyahPlaying, setSingleAyahPlaying] = useState<number | null>(null);

  // Coach tip rotation & Wird confirmation feedback
  const [tipIndex, setTipIndex] = useState(() => {
    const todayTip = getTipOfTheDay();
    const idx = HIFZ_PSYCHOLOGY_TIPS.findIndex((t) => t.id === todayTip.id);
    return idx >= 0 ? idx : 0;
  });
  const [wirdBannerMsg, setWirdBannerMsg] = useState<string | null>(null);

  // Refs for managed audio, race-condition guard & auto-scroll
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playSessionIdRef = useRef<number>(0);
  const pendingEchoResumeRef = useRef<{
    nextAyahIndex: number;
    nextRepeatIndex: number;
    chunkAyahsList: QuranAyah[];
  } | null>(null);
  const ayahCardRefs = useRef<Record<number, HTMLElement | null>>({});
  const playbackSpeedRef = useRef<PlaybackSpeed>(1.0);
  const revealTimersRef = useRef<Record<string, number>>({});
  const echoPauseTimerRef = useRef<number | null>(null);
  const echoCountdownRef = useRef<number | null>(null);
  const echoBridgeQueueRef = useRef<string[]>([]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const currentFontScale = hifzState.fontScale || 1.0;

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

  const handleDecreaseFontScale = useCallback(() => {
    updateHifzState((prev) => {
      const cur = prev.fontScale || 1.0;
      const lower = [...FONT_SCALE_STEPS].reverse().find((s) => s < cur - 0.01);
      return { ...prev, fontScale: lower ?? FONT_SCALE_STEPS[0] };
    });
  }, [updateHifzState]);

  const handleIncreaseFontScale = useCallback(() => {
    updateHifzState((prev) => {
      const cur = prev.fontScale || 1.0;
      const higher = FONT_SCALE_STEPS.find((s) => s > cur + 0.01);
      return { ...prev, fontScale: higher ?? FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1] };
    });
  }, [updateHifzState]);

  const clearAllRevealTimers = useCallback(() => {
    for (const timerId of Object.values(revealTimersRef.current)) {
      window.clearTimeout(timerId);
    }
    revealTimersRef.current = {};
    setRevealedWordKeys({});
  }, []);

  const clearEchoTimers = useCallback(() => {
    if (echoPauseTimerRef.current !== null) {
      window.clearTimeout(echoPauseTimerRef.current);
      echoPauseTimerRef.current = null;
    }
    if (echoCountdownRef.current !== null) {
      window.clearInterval(echoCountdownRef.current);
      echoCountdownRef.current = null;
    }
    setEchoSilenceLeft(null);
  }, []);

  const stopAllAudio = useCallback(() => {
    playSessionIdRef.current += 1;
    pendingEchoResumeRef.current = null;
    clearEchoTimers();
    echoBridgeQueueRef.current = [];
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
    setEchoActive(false);
    setEchoPaused(false);
    setSingleAyahPlaying(null);
    setMushafContinuousPlaying(false);
  }, [clearEchoTimers]);

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
      setSelectedMushafAyah(1);
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
          apiBaseUrl: API_BASE_URL,
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
    const savedAyah = hifzState.lastAyahNumber || 1;
    void loadSurah(selectedSurahNumber).then(() => {
      if (savedAyah > 1) {
        setSelectedMushafAyah(savedAyah);
        setChunkIndex(Math.max(0, Math.floor((savedAyah - 1) / chunkSize)));
      }
    });
    // Initial load for saved Surah & last Ayah position only
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

  const playAudioChain = useCallback(
    (urls: string[], onFinished: () => void, ayahNumberForScroll?: number) => {
      if (urls.length === 0) {
        setAudioError(
          isArabic
            ? 'رابط التلاوة غير متوفر لهذه الآية حالياً.'
            : 'Recitation audio URL is unavailable for this Ayah.'
        );
        stopAllAudio();
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setAudioError(
          isArabic
            ? 'أنت بدون إنترنت — النص العثماني والتفسير يعملان بالكامل، والتلاوة الصوتية تحتاج اتصالاً بالإنترنت.'
            : 'You are offline — Uthmani text & Tafsir work 100% offline; audio streaming needs internet.'
        );
        stopAllAudio();
        return;
      }

      if (ayahNumberForScroll && ayahCardRefs.current[ayahNumberForScroll]) {
        try {
          ayahCardRefs.current[ayahNumberForScroll]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } catch {
          // Ignore scroll errors
        }
      }

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
            const rec = QURAN_RECITERS.find((r) => r.id === hifzState.reciterId) || QURAN_RECITERS[0];
            navigator.mediaSession.metadata = new MediaMetadata({
              title: meta ? `سورة ${meta.nameAr} · ${meta.nameEn}` : 'القرآن الكريم',
              artist: isArabic ? rec.nameAr : rec.nameEn,
              album: 'ملاذ حفظ القرآن · Thinking Bridge',
            });
          }
        } catch {
          // Ignore mediaSession errors on unsupported WebViews
        }
      };

      const tryCurrentUrl = () => {
        if (sessionId !== playSessionIdRef.current) return;
        const src = urls[urlIdx];
        if (!src) {
          setAudioLoading(false);
          setAudioError(
            isArabic
              ? 'تعذّر تشغيل التلاوة حالياً. تأكد من الاتصال بالإنترنت واضغط تشغيل مرة أخرى.'
              : 'Unable to play recitation right now. Check your connection and tap Play again.'
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
              : 'Unable to stream recitation. Please check your internet connection and retry.'
          );
          stopAllAudio();
        };

        audio.src = src;
        audio.playbackRate = playbackSpeedRef.current;
        void audio.play().catch((err) => {
          if (sessionId !== playSessionIdRef.current) return;
          const errName = err && typeof err === 'object' && 'name' in err ? String((err as { name: unknown }).name) : '';
          if (errName === 'NotAllowedError') {
            setAudioLoading(false);
            setAudioError(
              isArabic
                ? 'اضغط على زر التشغيل مرة أخرى للسماح بالصوت.'
                : 'Tap Play once more to allow audio playback.'
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
                : 'Unable to play recitation. Please check your connection and retry.'
            );
            stopAllAudio();
          }
        });
      };

      tryCurrentUrl();
    },
    [hifzState.reciterId, isArabic, selectedSurahNumber, stopAllAudio]
  );

  const getAyahAudioChain = useCallback(
    (ayah: QuranAyah): string[] => {
      return buildAyahAudioFallbackChain(selectedSurahNumber, ayah, hifzState.reciterId);
    },
    [hifzState.reciterId, selectedSurahNumber]
  );

  const runEchoStep = useCallback(
    (ayahIdx: number, repeatIdx: number, chunkAyahsList: QuranAyah[]) => {
      const targetAyah = chunkAyahsList[ayahIdx];
      if (!targetAyah) {
        stopAllAudio();
        return;
      }

      pendingEchoResumeRef.current = null;
      setEchoActive(true);
      setEchoPaused(false);
      setEchoSilenceLeft(null);
      setEchoAyahIdx(ayahIdx);
      setEchoRepeatIdx(repeatIdx);
      setSingleAyahPlaying(null);

      const urls = getAyahAudioChain(targetAyah);
      playAudioChain(
        urls,
        () => {
          const stepSessionId = playSessionIdRef.current;
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
                if (stepSessionId !== playSessionIdRef.current) return;
                secs -= 1;
                setEchoSilenceLeft(secs > 0 ? secs : null);
              }, 1000);
              echoPauseTimerRef.current = window.setTimeout(() => {
                if (stepSessionId !== playSessionIdRef.current) return;
                stopAllAudio();
              }, step.pauseMs);
            } else {
              stopAllAudio();
            }
            return;
          }

          if (step.pauseMs > 0) {
            pendingEchoResumeRef.current = {
              nextAyahIndex: step.nextAyahIndex,
              nextRepeatIndex: step.nextRepeatIndex,
              chunkAyahsList,
            };
            let secs = Math.ceil(step.pauseMs / 1000);
            setEchoSilenceLeft(secs);
            echoCountdownRef.current = window.setInterval(() => {
              if (stepSessionId !== playSessionIdRef.current) return;
              secs -= 1;
              setEchoSilenceLeft(secs > 0 ? secs : null);
            }, 1000);
            echoPauseTimerRef.current = window.setTimeout(() => {
              if (stepSessionId !== playSessionIdRef.current) return;
              clearEchoTimers();
              runEchoStep(step.nextAyahIndex, step.nextRepeatIndex, chunkAyahsList);
            }, step.pauseMs);
          } else {
            runEchoStep(step.nextAyahIndex, step.nextRepeatIndex, chunkAyahsList);
          }
        },
        targetAyah.numberInSurah
      );
    },
    [clearEchoTimers, getAyahAudioChain, pauseSeconds, playAudioChain, repeatCount, stopAllAudio]
  );

  const handleToggleEchoPlay = () => {
    if (!activeChunk || activeChunk.ayahs.length === 0) return;

    if (echoActive) {
      if (echoPaused) {
        setEchoPaused(false);
        if (pendingEchoResumeRef.current) {
          const pending = pendingEchoResumeRef.current;
          pendingEchoResumeRef.current = null;
          runEchoStep(pending.nextAyahIndex, pending.nextRepeatIndex, pending.chunkAyahsList);
          return;
        }
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackSpeedRef.current;
          void audioRef.current.play().catch(() => {});
        }
      } else {
        setEchoPaused(true);
        clearEchoTimers();
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
      return;
    }

    runEchoStep(0, 0, activeChunk.ayahs);
  };

  const handlePlaySingleAyah = (ayah: QuranAyah) => {
    stopAllAudio();
    setSingleAyahPlaying(ayah.numberInSurah);
    updateHifzState((prev) => ({ ...prev, lastAyahNumber: ayah.numberInSurah }));
    playAudioChain(
      getAyahAudioChain(ayah),
      () => {
        setSingleAyahPlaying(null);
      },
      ayah.numberInSurah
    );
  };

  const handlePlayMushafFrom = useCallback(
    (startAyahNumberInSurah: number) => {
      if (!surahData) return;
      stopAllAudio();
      const startIdx = surahData.ayahs.findIndex(
        (a) => a.numberInSurah === startAyahNumberInSurah
      );
      if (startIdx < 0) return;

      const playAt = (idx: number) => {
        const ayah = surahData.ayahs[idx];
        if (!ayah) {
          stopAllAudio();
          return;
        }
        setMushafContinuousPlaying(true);
        setSelectedMushafAyah(ayah.numberInSurah);
        setSingleAyahPlaying(ayah.numberInSurah);
        updateHifzState((prev) => ({ ...prev, lastAyahNumber: ayah.numberInSurah }));
        playAudioChain(
          getAyahAudioChain(ayah),
          () => {
            if (idx + 1 < surahData.ayahs.length) {
              playAt(idx + 1);
            } else {
              stopAllAudio();
            }
          },
          ayah.numberInSurah
        );
      };

      playAt(startIdx);
    },
    [getAyahAudioChain, playAudioChain, stopAllAudio, surahData, updateHifzState]
  );

  const handleToggleAyahBookmark = (ayah: QuranAyah) => {
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

  const handlePlayBridgePair = (link: AyahBridgeLink) => {
    stopAllAudio();
    const urls = [link.fromAudioUrl, link.toAudioUrl].filter((u): u is string => Boolean(u));
    if (urls.length === 0) return;
    echoBridgeQueueRef.current = urls.slice(1);
    setSingleAyahPlaying(link.fromAyahNumber);

    const playNextInPair = (url: string, ayahNum: number) => {
      setSingleAyahPlaying(ayahNum);
      playAudioChain([url], () => {
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
        setSelectedMushafAyah(targetStartAyah);
        const targetIdx = Math.floor((targetStartAyah - 1) / chunkSize);
        setChunkIndex(Math.max(0, targetIdx));
      }
    });
  };

  const savedBookmarks = useMemo(
    () => Object.values(hifzState.bookmarks || {}).sort((a, b) => b.savedAt - a.savedAt),
    [hifzState.bookmarks]
  );

  const activeReciterMeta = useMemo(
    () => QURAN_RECITERS.find((r) => r.id === hifzState.reciterId) || QURAN_RECITERS[0],
    [hifzState.reciterId]
  );

  const selectedMushafAyahObj = useMemo(() => {
    if (!surahData || surahData.ayahs.length === 0) return null;
    return (
      surahData.ayahs.find((a) => a.numberInSurah === selectedMushafAyah) || surahData.ayahs[0]
    );
  }, [selectedMushafAyah, surahData]);

  const dueWirdItems = useMemo(() => getDueWirdItems(hifzState), [hifzState]);
  const allWirdItems = useMemo(
    () =>
      Object.values(hifzState.wirdEntries).sort((a, b) => a.nextReviewAt - b.nextReviewAt),
    [hifzState.wirdEntries]
  );

  const currentTip = HIFZ_PSYCHOLOGY_TIPS[tipIndex % HIFZ_PSYCHOLOGY_TIPS.length];
  const currentSurahMeta: SurahMeta | undefined = getSurahMeta(selectedSurahNumber);

  const isDarkMushaf = hifzState.mushafTheme === 'dark';
  const ayahInkColor = isDarkMushaf ? '#F8FAFC' : '#141D17';
  const isAnyAudioPlaying = (echoActive && !echoPaused) || mushafContinuousPlaying || singleAyahPlaying !== null;
  const isMaskingActive = fadeStage > 0;

  const handleDockPlayPause = () => {
    if (studioDrill === 'mushaf') {
      if (mushafContinuousPlaying || singleAyahPlaying !== null) {
        stopAllAudio();
      } else {
        handlePlayMushafFrom(selectedMushafAyah || 1);
      }
      return;
    }
    handleToggleEchoPlay();
  };

  const handleToggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1.0 ? 0.75 : 1.0));
  };

  const handleCycleRepeat = () => {
    setRepeatCount((prev) => (prev === 1 ? 3 : prev === 3 ? 5 : 1));
  };

  const handleOneTapHifzMask = () => {
    if (studioDrill !== 'fade') {
      setStudioDrill('fade');
      setFadeStage(100);
      return;
    }
    setFadeStage((prev) => (prev === 0 ? 100 : 0));
  };

  return (
    <div
      data-testid="quran-sanctuary-view"
      className="quran-sanctuary min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip flex flex-col"
      data-qs-theme={isDarkMushaf ? 'dark' : 'light'}
      style={{ ['--quran-scale' as string]: String(currentFontScale) }}
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={isArabic ? 'ar' : 'en'}
    >
      {/* Top Serene Header (Midnight Navy + Warm Gold) */}
      <header
        className="sticky top-0 z-40 border-b px-3 sm:px-6 pb-3 pt-safe"
        style={{
          backgroundColor: 'var(--qs-surface)',
          borderColor: 'var(--qs-border)',
        }}
      >
        <div className="max-w-4xl mx-auto space-y-2.5 pt-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="quran-back-btn"
                onClick={() => {
                  stopAllAudio();
                  onBack();
                }}
                aria-label={isArabic ? 'رجوع' : 'Back'}
                className="min-h-[52px] px-4 py-2 rounded-2xl border-2 text-sm font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition active:scale-95"
                style={{
                  backgroundColor: 'var(--qs-surface-alt)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-ink)',
                }}
              >
                {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                <span>{isArabic ? 'رجوع' : 'Back'}</span>
              </button>

              {onSwitchToLanguages && (
                <button
                  type="button"
                  data-testid="quran-switch-languages-btn"
                  onClick={() => {
                    stopAllAudio();
                    onSwitchToLanguages();
                  }}
                  aria-label={isArabic ? 'تعلم اللغات' : 'Learn Languages'}
                  className="min-h-[52px] px-3 py-2 rounded-2xl border text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition active:scale-95"
                  style={{
                    backgroundColor: 'var(--qs-accent-soft)',
                    borderColor: 'var(--qs-accent)',
                    color: 'var(--qs-accent)',
                  }}
                >
                  <Globe size={16} />
                  <span className="hidden sm:inline">{isArabic ? 'اللغات' : 'Languages'}</span>
                </button>
              )}
            </div>

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

            {/* Effortless A- / A+ Uthmani Font Scaler (1.0x -> 1.8x) + Lighting Toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="inline-flex items-center rounded-2xl border p-0.5 gap-0.5"
                role="group"
                aria-label={isArabic ? 'تكبير وتصغير الخط العثماني' : 'Uthmani font scale'}
                style={{
                  backgroundColor: 'var(--qs-surface-alt)',
                  borderColor: 'var(--qs-border)',
                }}
              >
                <button
                  type="button"
                  data-testid="quran-font-dec"
                  onClick={handleDecreaseFontScale}
                  disabled={currentFontScale <= FONT_SCALE_STEPS[0] + 0.01}
                  aria-label={isArabic ? 'تصغير الخط' : 'Decrease font size'}
                  className="min-h-[48px] min-w-[48px] px-2 rounded-xl text-xs font-black cursor-pointer disabled:opacity-40 transition active:scale-95"
                  style={{ color: 'var(--qs-ink)' }}
                >
                  A-
                </button>
                <span
                  dir="ltr"
                  data-testid="quran-font-scale-label"
                  className="px-1.5 text-xs font-black tabular-nums select-none"
                  style={{ color: 'var(--qs-gold)' }}
                >
                  {`${Math.round(currentFontScale * 100)}%`}
                </span>
                <button
                  type="button"
                  data-testid="quran-font-inc"
                  onClick={handleIncreaseFontScale}
                  disabled={currentFontScale >= FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1] - 0.01}
                  aria-label={isArabic ? 'تكبير الخط' : 'Increase font size'}
                  className="min-h-[48px] min-w-[48px] px-2 rounded-xl text-xs font-black cursor-pointer disabled:opacity-40 transition active:scale-95"
                  style={{ color: 'var(--qs-ink)' }}
                >
                  A+
                </button>
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
                className="min-h-[48px] min-w-[48px] px-2.5 py-2 rounded-2xl border inline-flex items-center justify-center cursor-pointer shrink-0 transition active:scale-95"
                style={{
                  backgroundColor: 'var(--qs-surface-alt)',
                  borderColor: 'var(--qs-border)',
                  color: 'var(--qs-gold)',
                }}
              >
                {isDarkMushaf ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
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
            {savedBookmarks.length > 0 && (
              <section
                className="p-4 rounded-3xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--qs-surface)',
                  borderColor: 'var(--qs-border)',
                }}
              >
                <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5" style={{ color: 'var(--qs-ink)' }}>
                  <Bookmark size={16} style={{ color: 'var(--qs-gold)' }} />
                  <span>{isArabic ? 'الآيات المحفوظة (العلامات المرجعية)' : 'Saved Ayah Bookmarks'}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedBookmarks.map((bm) => (
                    <button
                      key={bm.key}
                      type="button"
                      onClick={() => {
                        setStudioDrill('mushaf');
                        handleSelectSurahFromList(bm.surahNumber, bm.ayahNumber);
                      }}
                      className="min-h-[48px] p-3 rounded-2xl border text-start flex items-center justify-between gap-2 cursor-pointer transition active:scale-[0.99]"
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-border)',
                        color: 'var(--qs-ink)',
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--qs-gold)' }}>
                          {isArabic
                            ? `سورة ${bm.surahNameAr} · آية ${bm.ayahNumber}`
                            : `${bm.surahNameEn} · Ayah ${bm.ayahNumber}`}
                        </p>
                        <p className="quran-uthmani-text text-sm truncate" style={{ color: 'var(--qs-ink)' }}>
                          {bm.excerpt}...
                        </p>
                      </div>
                      <Bookmark size={15} className="shrink-0" style={{ color: 'var(--qs-gold)' }} />
                    </button>
                  ))}
                </div>
              </section>
            )}

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
          <div className="space-y-3">
            {/* Compact Surah Header + Single Collapsible Toolbar Trigger (keeps Ayah 1 above the fold) */}
            <section
              className="p-3 sm:p-4 rounded-3xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--qs-surface)',
                borderColor: 'var(--qs-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      data-testid="quran-surah-picker-btn"
                      onClick={() => setActiveTab('surahs')}
                      className="min-h-[44px] px-3 py-1 rounded-2xl border text-start inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                      style={{
                        backgroundColor: 'var(--qs-surface-alt)',
                        borderColor: 'var(--qs-gold)',
                        color: ayahInkColor,
                      }}
                    >
                      <span className="text-sm sm:text-base font-black leading-snug">
                        {currentSurahMeta
                          ? `${currentSurahMeta.number}. سورة ${currentSurahMeta.nameAr}`
                          : surahData?.name || ''}
                      </span>
                      <ChevronDown size={16} style={{ color: 'var(--qs-gold)' }} />
                    </button>
                    {loadedFromCache && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: 'var(--qs-accent-soft)',
                          borderColor: 'var(--qs-accent)',
                          color: 'var(--qs-accent)',
                        }}
                      >
                        {isArabic ? 'بدون إنترنت ✓' : 'Offline ✓'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeChunk && (
                    <button
                      type="button"
                      onClick={handleToggleEchoPlay}
                      className="min-h-[44px] px-3 py-1.5 rounded-2xl text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                      style={{
                        backgroundColor: 'var(--qs-accent)',
                        color: 'var(--qs-accent-ink)',
                      }}
                    >
                      {echoActive && !echoPaused ? <Pause size={15} /> : <Play size={15} />}
                      <span>
                        {echoActive && !echoPaused
                          ? isArabic ? 'إيقاف مؤقت' : 'Pause'
                          : isArabic ? 'استمع' : 'Play'}
                      </span>
                    </button>
                  )}

                  {echoActive && (
                    <button
                      type="button"
                      onClick={stopAllAudio}
                      aria-label={isArabic ? 'إيقاف التلاوة' : 'Stop playback'}
                      className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-2xl border inline-flex items-center justify-center text-xs font-bold cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-surface-alt)',
                        borderColor: 'var(--qs-border)',
                        color: ayahInkColor,
                      }}
                    >
                      <Square size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setToolsOpen((v) => !v)}
                    aria-expanded={toolsOpen}
                    className="min-h-[44px] px-3 py-1.5 rounded-2xl border text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                    style={
                      toolsOpen
                        ? {
                            backgroundColor: 'var(--qs-accent-soft)',
                            borderColor: 'var(--qs-accent)',
                            color: 'var(--qs-accent)',
                          }
                        : {
                            backgroundColor: 'var(--qs-surface-alt)',
                            borderColor: 'var(--qs-border)',
                            color: ayahInkColor,
                          }
                    }
                  >
                    <SlidersHorizontal size={14} />
                    <span>{isArabic ? '⚙️ أدوات الحفظ' : '⚙️ Hifz Tools'}</span>
                    {toolsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {echoSilenceLeft !== null && (
                <div
                  role="status"
                  className="p-2.5 rounded-2xl border text-xs font-black text-center"
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

              {/* Unified Collapsible Hifz Controls Drawer */}
              {toolsOpen && (
                <div
                  className="pt-3 mt-1 border-t space-y-3"
                  style={{ borderColor: 'var(--qs-border)' }}
                >
                  {/* 1. Drill Mode Selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStudioDrill('mushaf')}
                      className="min-h-[44px] px-2 py-2 rounded-xl border text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                      style={
                        studioDrill === 'mushaf'
                          ? {
                              backgroundColor: 'var(--qs-accent)',
                              borderColor: 'var(--qs-accent)',
                              color: 'var(--qs-accent-ink)',
                            }
                          : {
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                              color: ayahInkColor,
                            }
                      }
                    >
                      <BookOpen size={14} />
                      <span>{isArabic ? 'المصحف' : 'Mushaf'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioDrill('fade')}
                      className="min-h-[44px] px-2 py-2 rounded-xl border text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                      style={
                        studioDrill === 'fade'
                          ? {
                              backgroundColor: 'var(--qs-accent)',
                              borderColor: 'var(--qs-accent)',
                              color: 'var(--qs-accent-ink)',
                            }
                          : {
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                              color: ayahInkColor,
                            }
                      }
                    >
                      <EyeOff size={14} />
                      <span>{isArabic ? 'التعتيم' : 'Fade-Out'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioDrill('bridge')}
                      className="min-h-[44px] px-2 py-2 rounded-xl border text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                      style={
                        studioDrill === 'bridge'
                          ? {
                              backgroundColor: 'var(--qs-accent)',
                              borderColor: 'var(--qs-accent)',
                              color: 'var(--qs-accent-ink)',
                            }
                          : {
                              backgroundColor: 'var(--qs-bg)',
                              borderColor: 'var(--qs-border)',
                              color: ayahInkColor,
                            }
                      }
                    >
                      <Link2 size={14} />
                      <span>{isArabic ? 'ربط الآيات' : 'Bridges'}</span>
                    </button>
                  </div>

                  {/* 2. Reciter + Change Surah */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      aria-label={isArabic ? 'اختر القارئ' : 'Select Reciter'}
                      value={hifzState.reciterId}
                      onChange={(e) => {
                        const nextId = e.target.value as QuranReciterId;
                        stopAllAudio();
                        updateHifzState((prev) => ({ ...prev, reciterId: nextId }));
                      }}
                      className="flex-1 min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-border)',
                        color: ayahInkColor,
                      }}
                    >
                      {QURAN_RECITERS.map((rec) => (
                        <option key={rec.id} value={rec.id}>
                          {isArabic ? `${rec.nameAr} (${rec.styleAr})` : `${rec.nameEn} (${rec.styleEn})`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setActiveTab('surahs')}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer shrink-0"
                      style={{
                        backgroundColor: 'var(--qs-surface-alt)',
                        borderColor: 'var(--qs-border)',
                        color: ayahInkColor,
                      }}
                    >
                      {isArabic ? 'تغيير السورة' : 'Change Surah'}
                    </button>
                  </div>

                  {/* 3. Quick-Start Surah Pills */}
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
                          className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer transition"
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
                                  color: ayahInkColor,
                                }
                          }
                        >
                          {isArabic ? meta.nameAr : meta.nameEn}
                        </button>
                      );
                    })}
                  </div>

                  {/* 4. Chunk Size + Font Size + Repeater Controls */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setChunkSize(1);
                          setChunkIndex(0);
                        }}
                        className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer"
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
                        className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer"
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
                        {isArabic ? '٣ آيات' : '3 Ayahs'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1" role="group" aria-label={isArabic ? 'حجم خط المصحف' : 'Mushaf font size'}>
                      {(['sm', 'md', 'lg'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => updateHifzState((prev) => ({ ...prev, fontSize: sz }))}
                          className="min-h-[40px] min-w-[40px] px-2 py-1 rounded-xl border text-xs font-black cursor-pointer"
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

                    <div className="flex items-center gap-1" role="group" aria-label={isArabic ? 'عدد التكرار' : 'Repeat count'}>
                      {([1, 3, 5] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setRepeatCount(cnt)}
                          className="min-h-[40px] min-w-[40px] px-2 py-1 rounded-xl border text-xs font-black cursor-pointer"
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

                    <div className="flex items-center gap-1" role="group" aria-label={isArabic ? 'فترة صمت الترديد' : 'Echo pause gap'}>
                      {([0, 3, 5] as const).map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setPauseSeconds(sec)}
                          className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-black cursor-pointer"
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
                            ? isArabic ? 'بلا صمت' : '0s'
                            : isArabic ? `${sec}ث` : `${sec}s`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. 4-Stage Progressive Fade-Out + Meaning Toggles */}
                  {studioDrill === 'fade' && (
                    <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--qs-border)' }}>
                      <div className="grid grid-cols-4 gap-1.5">
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
                              className="min-h-[40px] px-2 py-1.5 rounded-xl border text-[11px] font-black cursor-pointer transition"
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
                                      color: ayahInkColor,
                                    }
                              }
                            >
                              {isArabic ? item.ar : item.en}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowTafsir((v) => !v)}
                          className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer"
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
                          className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer"
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
                          className="min-h-[40px] px-2.5 py-1 rounded-xl border text-xs font-bold cursor-pointer"
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
                          {isArabic ? 'النطق الصوتي' : 'Transliteration'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {/* DRILL 0: FULL MUSHAF CONTINUOUS READER */}
                {studioDrill === 'mushaf' && (
                  <section
                    className="p-4 sm:p-7 rounded-3xl border space-y-5"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                    }}
                  >
                    {/* Mushaf Header Controls */}
                    <div className="flex items-center justify-between gap-2 flex-wrap border-b pb-3" style={{ borderColor: 'var(--qs-border)' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold border"
                          style={{
                            backgroundColor: 'var(--qs-surface-alt)',
                            borderColor: 'var(--qs-border)',
                            color: 'var(--qs-gold)',
                          }}
                        >
                          {isArabic
                            ? `الجزء ${surahData.ayahs[0]?.juz ?? 1} · صفحة ${selectedMushafAyahObj?.page ?? surahData.ayahs[0]?.page ?? 1}`
                            : `Juz ${surahData.ayahs[0]?.juz ?? 1} · Page ${selectedMushafAyahObj?.page ?? surahData.ayahs[0]?.page ?? 1}`}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--qs-ink-muted)' }}>
                          {isArabic
                            ? `${surahData.numberOfAyahs} آية · اضغط على أي آية للتفسير أو التلاوة`
                            : `${surahData.numberOfAyahs} Ayahs · Tap any Ayah for Tafsir & Audio`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {mushafContinuousPlaying ? (
                          <button
                            type="button"
                            onClick={stopAllAudio}
                            className="min-h-[48px] px-3.5 py-2 rounded-2xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--qs-gold-soft)',
                              borderColor: 'var(--qs-gold)',
                              color: 'var(--qs-gold)',
                            }}
                          >
                            <Square size={14} />
                            <span>{isArabic ? 'إيقاف التلاوة' : 'Stop Recitation'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePlayMushafFrom(selectedMushafAyah || 1)}
                            className="min-h-[48px] px-3.5 py-2 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--qs-accent)',
                              color: 'var(--qs-accent-ink)',
                            }}
                          >
                            <Play size={15} />
                            <span>{isArabic ? 'تلاوة متواصلة' : 'Play Surah'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ornate Bismillah Banner (skip on Surah 1 where Bismillah is Ayah 1, and Surah 9) */}
                    {surahData.number !== 1 && surahData.number !== 9 && (
                      <div
                        dir="rtl"
                        lang="ar"
                        className="py-3 px-4 rounded-2xl border text-center quran-uthmani-text text-2xl sm:text-3xl"
                        style={{
                          backgroundColor: 'var(--qs-surface-alt)',
                          borderColor: 'var(--qs-border)',
                          color: 'var(--qs-accent)',
                        }}
                      >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </div>
                    )}

                    {/* Flowing Mushaf Page */}
                    <div
                      dir="rtl"
                      lang="ar"
                      className={`quran-uthmani-text ${FONT_SIZE_CLASSES[hifzState.fontSize]} text-justify leading-[2.4] p-4 sm:p-6 rounded-2xl border break-words`}
                      style={{
                        backgroundColor: 'var(--qs-bg)',
                        borderColor: 'var(--qs-border)',
                        color: ayahInkColor,
                        fontSize: `${(1.55 * currentFontScale).toFixed(3)}rem`,
                        lineHeight: 2.35,
                        opacity: 1,
                        visibility: 'visible',
                      }}
                    >
                      {surahData.ayahs.map((ayah) => {
                        const isSelected = selectedMushafAyah === ayah.numberInSurah;
                        const isPlaying = singleAyahPlaying === ayah.numberInSurah;
                        const isBookmarked = Boolean(
                          hifzState.bookmarks?.[`${surahData.number}:${ayah.numberInSurah}`]
                        );
                        return (
                          <span
                            key={ayah.numberInSurah}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedMushafAyah(ayah.numberInSurah)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedMushafAyah(ayah.numberInSurah);
                              }
                            }}
                            className="inline rounded-lg px-1 transition cursor-pointer"
                            style={
                              isPlaying || isSelected
                                ? {
                                    backgroundColor: 'var(--qs-accent-soft)',
                                    boxShadow: 'inset 0 -2px 0 var(--qs-accent)',
                                  }
                                : undefined
                            }
                          >
                            {ayah.textUthmani}{' '}
                            <span
                              className="inline-flex items-center justify-center mx-1 px-1.5 py-0.5 rounded-full text-sm font-bold align-middle"
                              style={{
                                color: isBookmarked ? 'var(--qs-accent)' : 'var(--qs-gold)',
                              }}
                            >
                              ﴿{ayah.numberInSurah}﴾
                            </span>{' '}
                          </span>
                        );
                      })}
                    </div>

                    {/* Selected Ayah Inspector Drawer */}
                    {selectedMushafAyahObj && (
                      <div
                        className="p-4 rounded-2xl border space-y-3"
                        style={{
                          backgroundColor: 'var(--qs-surface-alt)',
                          borderColor: 'var(--qs-border)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--qs-gold)' }}>
                            {isArabic
                              ? `الآية ${selectedMushafAyahObj.numberInSurah} · ${activeReciterMeta.nameAr}`
                              : `Ayah ${selectedMushafAyahObj.numberInSurah} · ${activeReciterMeta.nameEn}`}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handlePlaySingleAyah(selectedMushafAyahObj)}
                              className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--qs-surface)',
                                borderColor: 'var(--qs-border)',
                                color: 'var(--qs-accent)',
                              }}
                            >
                              <Volume2 size={15} />
                              <span>{isArabic ? 'استمع للآية' : 'Listen'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePlayMushafFrom(selectedMushafAyahObj.numberInSurah)}
                              className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--qs-surface)',
                                borderColor: 'var(--qs-border)',
                                color: 'var(--qs-ink)',
                              }}
                            >
                              <Play size={15} />
                              <span>{isArabic ? 'أكمل من هنا' : 'Play From Here'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAyahBookmark(selectedMushafAyahObj)}
                              aria-label={isArabic ? 'حفظ علامة مرجعية' : 'Toggle bookmark'}
                              className="min-h-[48px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: hifzState.bookmarks?.[`${surahData.number}:${selectedMushafAyahObj.numberInSurah}`]
                                  ? 'var(--qs-gold-soft)'
                                  : 'var(--qs-surface)',
                                borderColor: hifzState.bookmarks?.[`${surahData.number}:${selectedMushafAyahObj.numberInSurah}`]
                                  ? 'var(--qs-gold)'
                                  : 'var(--qs-border)',
                                color: hifzState.bookmarks?.[`${surahData.number}:${selectedMushafAyahObj.numberInSurah}`]
                                  ? 'var(--qs-gold)'
                                  : 'var(--qs-ink)',
                              }}
                            >
                              <Bookmark size={15} />
                              <span>
                                {hifzState.bookmarks?.[`${surahData.number}:${selectedMushafAyahObj.numberInSurah}`]
                                  ? isArabic
                                    ? 'محفوظة'
                                    : 'Saved'
                                  : isArabic
                                    ? 'علامة'
                                    : 'Bookmark'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {selectedMushafAyahObj.tafsirMuyassar && (
                          <p dir="rtl" lang="ar" className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--qs-ink)' }}>
                            <strong style={{ color: 'var(--qs-accent)' }}>التفسير الميسر: </strong>
                            {selectedMushafAyahObj.tafsirMuyassar}
                          </p>
                        )}
                        {selectedMushafAyahObj.translationEn && (
                          <p dir="ltr" lang="en" className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--qs-ink-muted)' }}>
                            <strong style={{ color: 'var(--qs-accent)' }}>Sahih International: </strong>
                            {selectedMushafAyahObj.translationEn}
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* DRILL A: 4-Stage Progressive Word Fade-Out */}
                {studioDrill === 'fade' && (
                  <section
                    className="p-3.5 sm:p-5 rounded-3xl border space-y-3.5"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black" style={{ color: 'var(--qs-accent)' }}>
                        {isArabic
                          ? `الآيات ${activeChunk.startAyah}–${activeChunk.endAyah} من ${surahData.numberOfAyahs}`
                          : `Ayah ${activeChunk.startAyah}–${activeChunk.endAyah} of ${surahData.numberOfAyahs}`}
                      </span>
                      {echoActive && (
                        <span
                          className="px-2 py-0.5 rounded-xl text-[11px] font-black"
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

                    {/* Inline Hifz Masking Helper Strip (Zero Friction for Kids & Adults) */}
                    {isMaskingActive && (
                      <div
                        data-testid="quran-mask-helper"
                        className="p-3 rounded-2xl border flex items-center justify-between gap-2 flex-wrap"
                        style={{
                          backgroundColor: 'var(--qs-gold-soft)',
                          borderColor: 'var(--qs-gold)',
                        }}
                      >
                        <p className="text-xs font-black" style={{ color: 'var(--qs-gold)' }}>
                          {isArabic
                            ? '👆 اضغط على أي كلمة مخفية لتتذكرها (تظهر ثانيتين)'
                            : '👆 Tap any hidden word to peek for 2 seconds'}
                        </p>
                        <div className="flex items-center gap-1">
                          {([30, 70, 100, 0] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setFadeStage(st)}
                              className="min-h-[38px] px-2.5 py-1 rounded-xl border text-[11px] font-black cursor-pointer"
                              style={
                                fadeStage === st
                                  ? {
                                      backgroundColor: 'var(--qs-gold)',
                                      borderColor: 'var(--qs-gold)',
                                      color: '#0B1120',
                                    }
                                  : {
                                      backgroundColor: 'var(--qs-surface)',
                                      borderColor: 'var(--qs-border)',
                                      color: 'var(--qs-ink)',
                                    }
                              }
                            >
                              {st === 0 ? (isArabic ? 'إظهار' : 'Show') : `${st}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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
                            ref={(el) => {
                              ayahCardRefs.current[ayah.numberInSurah] = el;
                            }}
                            className="p-4 sm:p-5 rounded-2xl border space-y-3 overflow-x-clip"
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

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAyahBookmark(ayah)}
                                  aria-label={isArabic ? 'حفظ علامة مرجعية' : 'Toggle bookmark'}
                                  className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-xl border inline-flex items-center justify-center cursor-pointer"
                                  style={{
                                    backgroundColor: hifzState.bookmarks?.[`${surahData.number}:${ayah.numberInSurah}`]
                                      ? 'var(--qs-gold-soft)'
                                      : 'var(--qs-surface)',
                                    borderColor: hifzState.bookmarks?.[`${surahData.number}:${ayah.numberInSurah}`]
                                      ? 'var(--qs-gold)'
                                      : 'var(--qs-border)',
                                    color: hifzState.bookmarks?.[`${surahData.number}:${ayah.numberInSurah}`]
                                      ? 'var(--qs-gold)'
                                      : 'var(--qs-ink-muted)',
                                  }}
                                >
                                  <Bookmark size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePlaySingleAyah(ayah)}
                                  aria-label={
                                    isArabic
                                      ? `استماع للآية ${ayah.numberInSurah}`
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
                            </div>

                            {/* Uthmani Verse Text with Tap-to-Reveal Masked Words */}
                            <div
                              dir="rtl"
                              lang="ar"
                              className={`quran-uthmani-text ${FONT_SIZE_CLASSES[hifzState.fontSize]} flex flex-wrap items-center gap-x-2 gap-y-2 text-right break-words`}
                              style={{
                                color: ayahInkColor,
                                fontSize: `${(1.55 * currentFontScale).toFixed(3)}rem`,
                                lineHeight: 2.35,
                                opacity: 1,
                                visibility: 'visible',
                              }}
                            >
                              {maskedWords.length > 0 ? (
                                maskedWords.map((mw) =>
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
                                              color: ayahInkColor,
                                              opacity: 1,
                                              visibility: 'visible',
                                            }
                                      }
                                    >
                                      {mw.word}
                                    </button>
                                  ) : (
                                    <span
                                      key={mw.index}
                                      style={{
                                        color: ayahInkColor,
                                        opacity: 1,
                                        visibility: 'visible',
                                      }}
                                    >
                                      {mw.word}
                                    </span>
                                  )
                                )
                              ) : (
                                <span
                                  style={{
                                    color: ayahInkColor,
                                    opacity: 1,
                                    visibility: 'visible',
                                  }}
                                >
                                  {ayah.textUthmani}
                                </span>
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
                      const nextIdx = Math.max(0, safeChunkIndex - 1);
                      setChunkIndex(nextIdx);
                      const nextChunk = chunks[nextIdx];
                      if (nextChunk) {
                        updateHifzState((prev) => ({ ...prev, lastAyahNumber: nextChunk.startAyah }));
                      }
                    }}
                    className="min-h-[52px] px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    style={{
                      backgroundColor: 'var(--qs-surface)',
                      borderColor: 'var(--qs-border)',
                      color: 'var(--qs-ink)',
                    }}
                  >
                    {isArabic ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    <span>{isArabic ? 'المقطع السابق' : 'Previous'}</span>
                  </button>

                  <span className="text-xs font-black tabular-nums" style={{ color: 'var(--qs-ink-muted)' }}>
                    {safeChunkIndex + 1} / {chunks.length}
                  </span>

                  <button
                    type="button"
                    disabled={safeChunkIndex >= chunks.length - 1}
                    onClick={() => {
                      stopAllAudio();
                      const nextIdx = Math.min(chunks.length - 1, safeChunkIndex + 1);
                      setChunkIndex(nextIdx);
                      const nextChunk = chunks[nextIdx];
                      if (nextChunk) {
                        updateHifzState((prev) => ({ ...prev, lastAyahNumber: nextChunk.startAyah }));
                      }
                    }}
                    className="min-h-[52px] px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
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
        className={`border-t px-4 py-5 text-center space-y-1.5 ${
          activeTab === 'studio' ? 'pb-[calc(7rem+env(safe-area-inset-bottom,0px))]' : 'pb-safe'
        }`}
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
            ? 'النص العثماني الموثّق والتلاوات التعليمية المفتوحة (AlQuran.cloud / Islamic Network / EveryAyah) — بدون إعلانات أو اشتراكات.'
            : `${DEDICATION_EN} · Verified Uthmani text & open non-commercial recitations via AlQuran.cloud / Islamic Network / EveryAyah`}
        </p>
      </footer>

      {/* Ergonomic Bottom Thumb Dock (Kids & Adults — Zero Friction) */}
      {activeTab === 'studio' && surahData && (
        <div
          data-testid="quran-thumb-dock"
          className="fixed bottom-0 left-0 right-0 z-50 border-t-2 px-3 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] shadow-2xl"
          style={{
            backgroundColor: 'var(--qs-surface)',
            borderColor: 'var(--qs-gold)',
          }}
        >
          <div className="max-w-3xl mx-auto grid grid-cols-12 gap-2 items-center">
            {/* Primary >= 60px Play / Pause Button */}
            <button
              type="button"
              data-testid="quran-dock-play"
              onClick={handleDockPlayPause}
              aria-label={isAnyAudioPlaying ? (isArabic ? 'إيقاف مؤقت' : 'Pause') : (isArabic ? 'تشغيل التلاوة' : 'Play recitation')}
              className="col-span-4 min-h-[60px] px-3 py-2 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-gold active:scale-95 transition"
              style={{
                backgroundColor: isAnyAudioPlaying ? 'var(--qs-accent)' : 'var(--qs-gold)',
                color: '#0B1120',
              }}
            >
              {audioLoading ? (
                <RefreshCw size={22} className="animate-spin" />
              ) : isAnyAudioPlaying ? (
                <Pause size={22} />
              ) : (
                <Play size={22} />
              )}
              <span className="truncate">
                {audioLoading
                  ? isArabic
                    ? 'جاري...'
                    : 'Loading'
                  : isAnyAudioPlaying
                    ? isArabic
                      ? 'إيقاف'
                      : 'Pause'
                    : isArabic
                      ? 'تشغيل'
                      : 'Play'}
              </span>
            </button>

            {/* Speed Toggle: 0.75x / 1.0x */}
            <button
              type="button"
              data-testid="quran-dock-speed"
              onClick={handleToggleSpeed}
              aria-label={isArabic ? 'تبديل سرعة التلاوة' : 'Toggle recitation speed'}
              className="col-span-2 min-h-[56px] px-2 py-2 rounded-2xl border-2 text-xs font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition"
              style={
                playbackSpeed === 0.75
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
              <Gauge size={16} />
              <span className="tabular-nums">{playbackSpeed === 0.75 ? '0.75×' : '1.0×'}</span>
            </button>

            {/* Simple Ayah Repeat Loop: 1x / 3x / 5x */}
            <button
              type="button"
              data-testid="quran-dock-repeat"
              onClick={handleCycleRepeat}
              aria-label={isArabic ? 'تكرار الآية' : 'Ayah repeat loop'}
              className="col-span-2 min-h-[56px] px-2 py-2 rounded-2xl border-2 text-xs font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition"
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
              <Repeat size={16} />
              <span className="tabular-nums">{repeatCount}×</span>
            </button>

            {/* 1-Tap Hifz Masking: إخفاء للتسميع */}
            <button
              type="button"
              data-testid="quran-dock-mask"
              onClick={handleOneTapHifzMask}
              aria-pressed={isMaskingActive}
              aria-label={isArabic ? 'إخفاء للتسميع' : 'Hide to recite'}
              className="col-span-4 min-h-[56px] px-2.5 py-2 rounded-2xl border-2 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
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
              {isMaskingActive ? <Eye size={18} /> : <EyeOff size={18} />}
              <span className="truncate">
                {isMaskingActive
                  ? isArabic
                    ? 'إظهار الآيات'
                    : 'Show Ayahs'
                  : isArabic
                    ? 'إخفاء للتسميع'
                    : 'Hide to Recite'}
              </span>
            </button>
          </div>
        </div>
      )}
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
