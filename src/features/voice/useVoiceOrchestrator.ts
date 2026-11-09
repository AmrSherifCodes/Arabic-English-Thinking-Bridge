import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getUserGeminiKey } from '../../services/geminiLexicon';
import { API_BASE_URL } from '../../utils/api';
import { consumeDailyApiQuota } from '../../utils/apiQuota';
import {
  generateSmartConversationReply,
  extractFeedbackDraft,
  isFeedbackConfirmation,
  isFeedbackCancellation,
  recognizeVoiceCommand,
  extractLastSentence,
  FeedbackDraft
} from '../../services/smartConversation';
import { translateEnglishToArabic } from '../../services/offlineTranslator';
import { isOnline } from '../../utils/connectivity';
import { useNativeSpeech } from './useNativeSpeech';
import { usePreferences } from '../preferences/usePreferences';
import { unlockAudio, speakWithNativeSpeechSynthesis } from '../../utils/audio';
import { saveFeedback } from '../../services/feedback';
import { fetchAIContext, getAICompanionPrompt } from '../../services/aiContextFetcher';
import { SourceLanguage, TargetLanguage } from '../../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, TARGET_LANGUAGE_LOCALES } from '../../data/languages';

export type VoiceState = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  feedbackDraft?: FeedbackDraft;
  feedbackStatus?: 'pending' | 'sent' | 'cancelled';
}

export const VOICE_V2_MARKER = 'voice-v2-profile';

function getStoredProfile() {
  let profile: Record<string, unknown> = {};
  let activeConfig: Record<string, unknown> = {};
  try {
    if (typeof localStorage !== 'undefined') {
      const readRecord = (key: string): Record<string, unknown> => {
        const raw = localStorage.getItem(key);
        if (!raw) return {};
        const value: unknown = JSON.parse(raw);
        return typeof value === 'object' && value !== null && !Array.isArray(value)
          ? value as Record<string, unknown>
          : {};
      };
      profile = readRecord('tb.userProfile');
      activeConfig = readRecord('tb.activeProfileConfig');
    }
  } catch (error) {
    console.warn('Unable to read stored voice profile.', error);
  }

  const sourceLang = (activeConfig.sourceLang || profile.sourceLanguage || 'ar') as SourceLanguage;
  const targetLang = (activeConfig.targetLang || profile.targetLanguage || 'en') as TargetLanguage;
  const cefrLevel = typeof activeConfig.cefrLevel === 'string' ? activeConfig.cefrLevel : 'A0';

  const sourceMeta = SOURCE_LANGUAGES[sourceLang] || SOURCE_LANGUAGES['ar'];
  const dialectName = sourceMeta ? sourceMeta.nameEn : 'Arabic';

  return {
    name: typeof profile.name === 'string' ? profile.name.trim() : '',
    goal: typeof activeConfig.goal === 'string'
      ? activeConfig.goal
      : typeof profile.goal === 'string' ? profile.goal : 'general',
    focusArea: typeof profile.focusArea === 'string' ? profile.focusArea : 'daily-speech',
    level: cefrLevel,
    cefrLevel,
    domainFocus: typeof activeConfig.domainFocus === 'string' ? activeConfig.domainFocus : null,
    dialect: dialectName,
    sourceLang,
    targetLang,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    pipeline: VOICE_V2_MARKER,
  };
}

export interface PlayableAudioSlot {
  play: () => Promise<void>;
  pause: () => void;
  duration: number;
  currentTime: number;
  onended?: () => void;
  onerror?: (err?: any) => void;
  __words?: string[];
  __startWordIndex?: number;
  __locale?: string;
  __isPiper?: boolean;
  __rate?: number;
}

const PIPER_VOICES: Partial<Record<TargetLanguage | 'ar', string>> = {
  ar: 'ar_JO-kareem-medium',
  en: 'en_US-lessac-high',
  de: 'de_DE-thorsten-high',
  es: 'es_ES-sharvard-medium',
  fr: 'fr_FR-siwis-medium',
  zh: 'zh_CN-huayan-medium',
  ru: 'ru_RU-irina-medium',
  pt: 'pt_BR-faber-medium',
  it: 'it_IT-riccardo-x_low',
};

async function createPiperAudioSlot(
  sentence: string,
  words: string[],
  startWordIndex: number,
  rate: number,
  targetLang: TargetLanguage | 'ar',
  signal?: AbortSignal
): Promise<PlayableAudioSlot | null> {
  const voiceId = PIPER_VOICES[targetLang];
  if (!voiceId) return null;

  const piper = await import('@mintplex-labs/piper-tts-web');
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const storedVoices = await piper.stored();
    if (!storedVoices.includes(voiceId)) return null;
  }
  if (signal?.aborted) return null;

  const blob = await piper.predict({ text: sentence, voiceId });
  if (signal?.aborted) return null;
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.playbackRate = rate;
  const revokeUrl = () => URL.revokeObjectURL(url);
  let onendedHandler: (() => void) | undefined;
  let onerrorHandler: ((err?: any) => void) | undefined;

  return {
    play: () => audio.play(),
    pause: () => {
      audio.pause();
      revokeUrl();
    },
    get duration() { return audio.duration || 0; },
    get currentTime() { return audio.currentTime || 0; },
    set onended(handler) {
      onendedHandler = handler;
      audio.onended = () => {
        revokeUrl();
        onendedHandler?.();
      };
    },
    get onended() { return onendedHandler; },
    set onerror(handler) {
      onerrorHandler = handler;
      audio.onerror = (event) => {
        revokeUrl();
        onerrorHandler?.(event);
      };
    },
    get onerror() { return onerrorHandler; },
    __words: words,
    __startWordIndex: startWordIndex,
    __locale: targetLang === 'ar' ? 'ar-EG' : TARGET_LANGUAGE_LOCALES[targetLang],
    __isPiper: true,
    __rate: rate,
  };
}

export function useVoiceOrchestrator(
  propTargetLang?: TargetLanguage,
  propSourceLang?: SourceLanguage
) {
  const savedProfile = getStoredProfile();
  const effectiveTargetLang: TargetLanguage =
    propTargetLang ||
    (TARGET_LANGUAGES.some((language) => language.code === savedProfile.targetLang)
      ? savedProfile.targetLang as TargetLanguage
      : 'en');
  const effectiveSourceLang: SourceLanguage =
    propSourceLang ||
    (savedProfile.sourceLang === 'en' ? 'en' : 'ar');

  const { values } = usePreferences();
  const voiceModel = String(values.voiceModel || 'ar-EG-SalmaNeural');
  const targetLanguageConfig = TARGET_LANGUAGES.find((language) => language.code === effectiveTargetLang);
  const targetVoice = effectiveTargetLang === 'en'
    ? String(values.englishVoice || targetLanguageConfig?.defaultVoice || 'en-US-AvaNeural')
    : targetLanguageConfig?.defaultVoice || 'en-US-AvaNeural';
  const targetLocale = TARGET_LANGUAGE_LOCALES[effectiveTargetLang];
  const speechRate = Number(values.speechRate || 1.0);
  const autoListen = Boolean(values.autoListen ?? true);

  const [state, setState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAssistantText, setCurrentAssistantText] = useState('');
  const [latencyMetrics, setLatencyMetrics] = useState<{ ttft?: number; ttfa?: number; total?: number }>({});
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentSpokenWordIndex, setCurrentSpokenWordIndex] = useState(-1);
  const [pendingFeedbackDraft, setPendingFeedbackDraft] = useState<FeedbackDraft | null>(null);

  const stateRef = useRef<VoiceState>('idle');
  stateRef.current = state;

  const abortControllerRef = useRef<AbortController | null>(null);

  // Parallel prefetch & sequenced playback queue
  const audioSlotsRef = useRef<Map<number, PlayableAudioSlot>>(new Map());
  const nextPlayIndexRef = useRef(0);
  const totalDispatchedRef = useRef(0);
  const streamDoneRef = useRef(false);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef<PlayableAudioSlot | null>(null);
  const syncAnimFrameRef = useRef<number | null>(null);

  // Stop any active audio immediately
  const stopAudio = useCallback(() => {
    if (syncAnimFrameRef.current) {
      cancelAnimationFrame(syncAnimFrameRef.current);
      syncAnimFrameRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {
        /* noop */
      }
      currentAudioRef.current = null;
    }
    audioSlotsRef.current.forEach((audio) => {
      try {
        audio.pause();
      } catch {
        /* noop */
      }
    });
    audioSlotsRef.current.clear();
    nextPlayIndexRef.current = 0;
    totalDispatchedRef.current = 0;
    isPlayingRef.current = false;
    streamDoneRef.current = false;
    setAudioProgress(0);
    setCurrentSpokenWordIndex(-1);
  }, []);

  // Sequentially play next audio in queue as soon as slot is ready
  const checkAndPlayQueue = useCallback(() => {
    if (isPlayingRef.current) return;

    const nextIndex = nextPlayIndexRef.current;
    if (audioSlotsRef.current.has(nextIndex)) {
      const nextAudio = audioSlotsRef.current.get(nextIndex)!;
      audioSlotsRef.current.delete(nextIndex);
      nextPlayIndexRef.current++;

      isPlayingRef.current = true;
      currentAudioRef.current = nextAudio;
      setState('speaking');

      const chunkWords: string[] = (nextAudio as any).__words || [];
      const chunkStart: number = (nextAudio as any).__startWordIndex ?? 0;
      let nativeFallbackAttempted = false;

      const fallBackToNativeSpeech = () => {
        if (nativeFallbackAttempted) return;
        nativeFallbackAttempted = true;
        if (syncAnimFrameRef.current) {
          cancelAnimationFrame(syncAnimFrameRef.current);
          syncAnimFrameRef.current = null;
        }
        console.warn('[useVoiceOrchestrator] Audio playback failed; retrying with native speech synthesis.');
        const words = chunkWords.length > 0 ? chunkWords : [];
        const isArabic = /[\u0600-\u06FF]/.test(words.join(' '));
        const locale = nextAudio.__locale || (isArabic ? 'ar-EG' : targetLocale);
        const spoken = speakWithNativeSpeechSynthesis(
          words.join(' '),
          nextAudio.__rate ?? speechRate,
          isArabic ? voiceModel : targetVoice,
          (charIndex) => {
            const spokenText = words.join(' ');
            const completedWords = spokenText.slice(0, charIndex).split(/\s+/).filter(Boolean).length;
            setCurrentSpokenWordIndex(chunkStart + Math.min(words.length - 1, Math.max(0, completedWords)));
          },
          () => nextAudio.onended?.(),
          locale
        );
        if (!spoken) nextAudio.onended?.();
      };

      const fallBackToPiper = async () => {
        if (nextAudio.__isPiper) {
          fallBackToNativeSpeech();
          return;
        }
        try {
          const isArabic = /[\u0600-\u06FF]/.test(chunkWords.join(' '));
          const piperSlot = await createPiperAudioSlot(
            chunkWords.join(' '),
            chunkWords,
            chunkStart,
            nextAudio.__rate ?? speechRate,
            isArabic ? 'ar' : effectiveTargetLang,
            abortControllerRef.current?.signal
          );
          if (piperSlot) {
            audioSlotsRef.current.set(nextIndex, piperSlot);
            nextPlayIndexRef.current = nextIndex;
            isPlayingRef.current = false;
            currentAudioRef.current = null;
            checkAndPlayQueue();
            return;
          }
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            console.warn('[useVoiceOrchestrator] Local Piper TTS failed; using browser speech synthesis.', error);
          }
        }
        fallBackToNativeSpeech();
      };

      // Sub-frame word synchronization loop matching exact audio timestamp
      const updateWordSync = () => {
        if (!isPlayingRef.current || currentAudioRef.current !== nextAudio) return;
        if (nextAudio.duration > 0) {
          const progress = Math.min(1, Math.max(0, nextAudio.currentTime / nextAudio.duration));
          setAudioProgress(progress);
          if (chunkWords.length > 0) {
            const offset = Math.min(
              chunkWords.length - 1,
              Math.max(0, Math.floor(progress * chunkWords.length))
            );
            setCurrentSpokenWordIndex(chunkStart + offset);
          }
        }
        syncAnimFrameRef.current = requestAnimationFrame(updateWordSync);
      };
      syncAnimFrameRef.current = requestAnimationFrame(updateWordSync);

      nextAudio.onended = () => {
        if (syncAnimFrameRef.current) {
          cancelAnimationFrame(syncAnimFrameRef.current);
          syncAnimFrameRef.current = null;
        }
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        setAudioProgress(0);
        checkAndPlayQueue();
      };

      nextAudio.onerror = () => {
        void fallBackToPiper();
      };

      const handlePlaybackFailure = (err: unknown) => {
        console.warn('[useVoiceOrchestrator] Audio play rejected:', err);
        void fallBackToPiper();
      };
      try {
        nextAudio.play().catch(handlePlaybackFailure);
      } catch (error) {
        handlePlaybackFailure(error);
      }
      return;
    }

    // If stream is done and all dispatched slots have been played:
    if (streamDoneRef.current && nextIndex >= totalDispatchedRef.current) {
      if (syncAnimFrameRef.current) {
        cancelAnimationFrame(syncAnimFrameRef.current);
        syncAnimFrameRef.current = null;
      }
      isPlayingRef.current = false;
      currentAudioRef.current = null;
      setAudioProgress(0);
      setCurrentSpokenWordIndex(-1);
      if (stateRef.current === 'speaking') {
        if (autoListen) {
          setTimeout(() => {
            if (stateRef.current === 'speaking' || stateRef.current === 'idle') {
              startTurn();
            }
          }, 300);
        } else {
          setState('idle');
        }
      }
    }
  },   [autoListen, effectiveTargetLang, speechRate, targetLocale, targetVoice, voiceModel]);

  // Helper to create a fallback slot powered by on-device SpeechSynthesis
  const createFallbackAudioSlot = useCallback(
    (
      sentenceText: string,
      wordsList: string[],
      startWordIdx: number,
      rate: number,
      preferredVoice?: string,
      locale?: string
    ): PlayableAudioSlot => {
      let isEnded = false;
      let startTime = 0;
      const estimatedDuration = Math.max(1.0, (wordsList.length * 0.35) / Math.max(0.7, rate));
      let fallbackTimer: any = null;

      const slot: PlayableAudioSlot = {
        duration: estimatedDuration,
        get currentTime() {
          if (!startTime) return 0;
          return Math.min(estimatedDuration, (Date.now() - startTime) / 1000);
        },
        __words: wordsList,
        __startWordIndex: startWordIdx,
        __locale: locale,
        play: () => {
          return new Promise<void>((resolve) => {
            startTime = Date.now();
            const spoken = speakWithNativeSpeechSynthesis(
              sentenceText,
              rate,
              preferredVoice,
              (charIndex) => {
                const before = sentenceText.slice(0, charIndex);
                const count = before.split(/\s+/).filter(Boolean).length;
                const wordIdx = Math.min(wordsList.length - 1, Math.max(0, count));
                setCurrentSpokenWordIndex(startWordIdx + wordIdx);
              },
              () => {
                if (!isEnded) {
                  isEnded = true;
                  if (fallbackTimer) clearTimeout(fallbackTimer);
                  if (slot.onended) slot.onended();
                }
                resolve();
              },
              locale
            );

            if (!spoken) {
              fallbackTimer = setTimeout(() => {
                if (!isEnded) {
                  isEnded = true;
                  if (slot.onended) slot.onended();
                }
                resolve();
              }, estimatedDuration * 1000);
            }
          });
        },
        pause: () => {
          try {
            window.speechSynthesis.cancel();
          } catch {}
          isEnded = true;
          if (fallbackTimer) clearTimeout(fallbackTimer);
        },
      };
      return slot;
    },
    []
  );

  // Parallel prefetch for a single sentence
  const prefetchSentence = useCallback(
    async (
      sentence: string,
      signal: AbortSignal,
      chunkIndex: number,
      startWordIndex: number = 0,
      rateOverride?: number
    ) => {
      const clean = sentence.trim();
      if (!clean) return;

      const rate = rateOverride ?? speechRate;
      const isArabic = /[\u0600-\u06FF]/.test(clean);
      const speechLocale = isArabic ? 'ar-EG' : targetLocale;
      const speechVoice = isArabic ? voiceModel : targetVoice;
      const words = clean.split(/\s+/).filter(Boolean);
      let slotCreated = false;

      try {
        const requestController = new AbortController();
        const timeoutId = setTimeout(() => requestController.abort(), 3500);
        const abortRequest = () => requestController.abort();
        signal?.addEventListener('abort', abortRequest, { once: true });
        if (signal?.aborted) requestController.abort();

        const res = await fetch(`${API_BASE_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: clean,
            lang: speechLocale,
            voice: speechVoice,
            rate,
            pitch: '+1Hz',
          }),
          signal: requestController.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
          signal?.removeEventListener('abort', abortRequest);
        });

        if (!res.ok) throw new Error(`TTS failed with status ${res.status}`);

        const blob = await res.blob();
        if (blob.size >= 50) {
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          audio.playbackRate = 1;
          (audio as any).__words = words;
          (audio as any).__startWordIndex = startWordIndex;

          const playableSlot: PlayableAudioSlot = {
            play: () => audio.play(),
            pause: () => {
              try { audio.pause(); } catch {}
            },
            get duration() { return audio.duration || 0; },
            get currentTime() { return audio.currentTime || 0; },
            set onended(fn: any) { audio.onended = fn; },
            get onended() { return audio.onended as any; },
            set onerror(fn: any) { audio.onerror = fn; },
            get onerror() { return audio.onerror as any; },
            __words: words,
            __startWordIndex: startWordIndex,
            __locale: speechLocale,
            __rate: rate,
          };

          if (chunkIndex === 0) {
            performance.mark('tts-first-chunk');
            try {
              performance.measure('ttfa', 'speech-end', 'tts-first-chunk');
              const entries = performance.getEntriesByName('ttfa');
              const ttfa = Math.round(entries[entries.length - 1]?.duration || 0);
              setLatencyMetrics((prev) => ({ ...prev, ttfa }));
            } catch {
              /* noop */
            }
          }

          audioSlotsRef.current.set(chunkIndex, playableSlot);
          slotCreated = true;
          checkAndPlayQueue();
        }
      } catch (err: any) {
        if (signal?.aborted) return;
        console.warn('[TTS] Edge-TTS failed, switching to local Piper fallback');
        console.warn('[useVoiceOrchestrator] Remote TTS prefetch failed, engaging on-device speech:', err);
      }

      if (signal?.aborted) return;
      if (!slotCreated) {
        try {
          const piperSlot = await createPiperAudioSlot(
            clean,
            words,
            startWordIndex,
            rate,
            isArabic ? 'ar' : effectiveTargetLang,
            signal
          );
          if (piperSlot) {
            audioSlotsRef.current.set(chunkIndex, piperSlot);
            slotCreated = true;
            checkAndPlayQueue();
          }
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            console.warn('[useVoiceOrchestrator] Local Piper TTS failed; engaging browser speech synthesis:', error);
          }
        }
      }

      if (!slotCreated) {
        const fallbackSlot = createFallbackAudioSlot(
          clean,
          words,
          startWordIndex,
          rate,
          speechVoice,
          speechLocale
        );
        audioSlotsRef.current.set(chunkIndex, fallbackSlot);
        checkAndPlayQueue();
      }
    },
    [checkAndPlayQueue, createFallbackAudioSlot, effectiveTargetLang, speechRate, targetLocale, targetVoice, voiceModel]
  );

  // Submit confirmed feedback directly to PostgreSQL/Supabase backend
  const submitPendingFeedback = useCallback(
    async (draft: FeedbackDraft, editedText?: string) => {
      try {
        const stored = getStoredProfile();
        const success = await saveFeedback({
          originalText: draft.originalThought,
          draftedMessage: (editedText || draft.polishedMessage).trim(),
          category: draft.category,
          rating: 5,
          userName: stored.name || 'AI Coach Learner',
          profileGoal: stored.goal,
          focusArea: `${effectiveSourceLang}->${effectiveTargetLang} (Amr Voice Coach)`,
          dialect: stored.dialect,
          timestamp: Date.now(),
          status: 'confirmed'
        });

        setPendingFeedbackDraft(null);

        // Mark messages with this draft as sent
        setMessages((prev) =>
          prev.map((m) =>
            m.feedbackDraft ? { ...m, feedbackStatus: 'sent' } : m
          )
        );

        const isAr = effectiveSourceLang === 'ar';
        const thankText = isAr
          ? 'تسلم يا بطل! تم إرسال رسالتك لفريق التطوير مباشرة 🚀 ملاحظاتك بتفرق جداً في تطوير التطبيق. يلا نرجع لتمريننا!'
          : "Thank you so much! Your feedback has been sent directly to the development team 🚀 Let's resume our practice!";

        const thankMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: thankText,
          timestamp: Date.now(),
          feedbackStatus: 'sent'
        };

        setMessages((prev) => [...prev, thankMsg]);
        setCurrentAssistantText(thankText);

        const idx = totalDispatchedRef.current++;
        prefetchSentence(thankText, new AbortController().signal, idx);
        return success;
      } catch (err) {
        console.error('Failed to submit feedback from coach:', err);
        return false;
      }
    },
    [effectiveSourceLang, effectiveTargetLang, prefetchSentence]
  );

  // Cancel feedback submission
  const cancelPendingFeedback = useCallback(
    (draft?: FeedbackDraft) => {
      setPendingFeedbackDraft(null);
      setMessages((prev) =>
        prev.map((m) =>
          m.feedbackDraft ? { ...m, feedbackStatus: 'cancelled' } : m
        )
      );

      const isAr = effectiveSourceLang === 'ar';
      const cancelText = isAr
        ? 'تمام ولا يهمك خالص يا بطل! لغيت الإرسال. تحب نكمل تمريننا في إيه؟'
        : 'No problem at all! Cancelled. What would you like to practice next?';

      const cancelMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: cancelText,
        timestamp: Date.now(),
        feedbackStatus: 'cancelled'
      };

      setMessages((prev) => [...prev, cancelMsg]);
      setCurrentAssistantText(cancelText);

      const idx = totalDispatchedRef.current++;
      prefetchSentence(cancelText, new AbortController().signal, idx);
    },
    [effectiveSourceLang, prefetchSentence]
  );

  // Handle incoming final speech from user
  const handleUserSpeech = useCallback(
    async (userText: string) => {
      if (!userText.trim()) {
        setState('idle');
        return;
      }

      const voiceCommand = recognizeVoiceCommand(userText);
      const previousAssistantText =
        [...messages].reverse().find((message) => message.role === 'assistant')?.text ||
        currentAssistantText;
      const previousAssistantSentence = extractLastSentence(previousAssistantText);
      const requestText =
        voiceCommand === 'translate-arabic' && previousAssistantSentence
          ? `Translate this sentence into natural Arabic. Return only the Arabic translation: ${JSON.stringify(previousAssistantSentence)}`
          : userText;

      performance.mark('speech-end');
      stopAudio();

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: userText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setCurrentAssistantText('');
      setState('thinking');

      // 1. Check if user is confirming or cancelling an active feedback draft
      if (pendingFeedbackDraft) {
        if (isFeedbackConfirmation(userText)) {
          await submitPendingFeedback(pendingFeedbackDraft);
          setState('idle');
          return;
        }
        if (isFeedbackCancellation(userText)) {
          cancelPendingFeedback(pendingFeedbackDraft);
          setState('idle');
          return;
        }
      }

      if (voiceCommand === 'repeat' || voiceCommand === 'slower') {
        if (!previousAssistantSentence) {
          setState('idle');
          return;
        }
        totalDispatchedRef.current = 1;
        nextPlayIndexRef.current = 0;
        streamDoneRef.current = false;
        setCurrentAssistantText(previousAssistantSentence);
        prefetchSentence(
          previousAssistantSentence,
          new AbortController().signal,
          0,
          0,
          voiceCommand === 'slower' ? 0.8 : undefined
        );
        streamDoneRef.current = true;
        checkAndPlayQueue();
        return;
      }

      // 2. Check if userText expresses feedback/suggestion
      const newFeedbackDraft = extractFeedbackDraft(userText);
      if (newFeedbackDraft) {
        setPendingFeedbackDraft(newFeedbackDraft);
      }

      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      totalDispatchedRef.current = 0;
      nextPlayIndexRef.current = 0;
      streamDoneRef.current = false;

      // 0. Offline-first: never wait on a doomed network round-trip.
      const buildOfflineReply = (): string => {
        if (voiceCommand === 'translate-arabic') {
          const source = previousAssistantSentence || userText;
          const translated = translateEnglishToArabic(source);
          if (translated.text) return translated.text;
        }
        return generateSmartConversationReply(
          userText,
          messages.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          getStoredProfile() as any,
          effectiveTargetLang
        );
      };

      if (!isOnline()) {
        const offlineReply = buildOfflineReply();
        setCurrentAssistantText(offlineReply);
        const idx = totalDispatchedRef.current++;
        streamDoneRef.current = true;
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: offlineReply,
            timestamp: Date.now(),
            feedbackDraft: newFeedbackDraft || undefined,
            feedbackStatus: newFeedbackDraft ? 'pending' : undefined,
          },
        ]);
        prefetchSentence(offlineReply, abortCtrl.signal, idx);
        return;
      }

      const userKey = getUserGeminiKey();

      if (!consumeDailyApiQuota()) {
        setState('idle');
        return;
      }

      // 1. Try direct client-side Gemini SDK streaming if user key exists
      if (userKey) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: userKey });
          const profile = getStoredProfile();
          const targetLanguage = TARGET_LANGUAGES.find((language) => language.code === profile.targetLang)?.nameEn || 'English';
          const sourceLanguage = SOURCE_LANGUAGES[profile.sourceLanguage]?.nameNative || 'Arabic';
          const learnerDialect = profile.sourceLanguage === 'ar' ? profile.dialect : sourceLanguage;
          const domainFocus = profile.domainFocus === 'tech' || profile.goal === 'tech' || profile.goal === 'corporate'
            ? 'software engineering and technology'
            : profile.domainFocus === 'travel' || profile.goal === 'travel'
              ? 'travel and everyday life'
              : 'daily life';
          const translationInstruction = voiceCommand === 'translate-arabic'
            ? 'The learner explicitly requested an Arabic translation. Return only the natural Arabic translation, overriding the usual target-language response preference.'
            : '';

          const aiContext = await fetchAIContext();
          const companionPrompt = getAICompanionPrompt();
          const systemInstructionText = (aiContext.systemPromptTemplate || '')
            .replace('{dialect}', String(learnerDialect))
            .replace('{targetLanguage}', targetLanguage)
            .replace('{level}', String(profile.level))
            .replace('{goal}', String(profile.goal))
            .replace('{domainFocus}', domainFocus) +
            `\n${translationInstruction}` +
            companionPrompt;

          const resultStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [
              ...messages.slice(-6).map((m) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
              })),
              { role: 'user', parts: [{ text: requestText }] },
            ],
            config: {
              systemInstruction: systemInstructionText,
              maxOutputTokens: 250,
              temperature: 0.7,
            },
          });

          let clientAccumulated = '';
          let clientBuffer = '';
          let clientWordIdx = 0;

          for await (const chunk of resultStream) {
            const textChunk = chunk.text || '';
            if (!textChunk) continue;

            clientAccumulated += textChunk;
            clientBuffer += textChunk;

            setCurrentAssistantText(clientAccumulated);

            const sentences = clientBuffer.match(/[^.!?]+[.!?]+/g);
            if (sentences) {
              for (const s of sentences) {
                clientBuffer = clientBuffer.slice(s.length);
                const cleanSent = s.trim();
                if (cleanSent) {
                  const wList = cleanSent.split(/\s+/);
                  prefetchSentence(cleanSent, abortCtrl.signal, totalDispatchedRef.current++, clientWordIdx);
                  clientWordIdx += wList.length;
                }
              }
            }
          }

          if (clientBuffer.trim()) {
            const cleanSent = clientBuffer.trim();
            prefetchSentence(cleanSent, abortCtrl.signal, totalDispatchedRef.current++, clientWordIdx);
          }

          streamDoneRef.current = true;
          checkAndPlayQueue();

          if (clientAccumulated.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                text: clientAccumulated.trim(),
                timestamp: Date.now(),
                feedbackDraft: newFeedbackDraft || undefined,
                feedbackStatus: newFeedbackDraft ? 'pending' : undefined,
              },
            ]);
          }
          return;
        } catch (clientChatErr: any) {
          if (clientChatErr.name === 'AbortError') {
            console.log('[useVoiceOrchestrator] Interrupted by user (barge-in).');
            return;
          }
          console.warn('[useVoiceOrchestrator] Direct client-side Gemini Chat stream failed, falling back to the BYOK server route:', clientChatErr);
        }
      }

      // 2. Server route fallback

      let accumulatedReply = '';
      let sentenceBuffer = '';
      let runningWordIndex = 0;

      try {
        const historyPayload = messages.slice(-6).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

        const response = await fetch(`${API_BASE_URL}/api/gemini`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            'x-user-api-key': userKey,
            'X-User-Gemini-Key': userKey,
          },
          body: JSON.stringify({
            operation: 'conversation',
            prompt: requestText,
            history: historyPayload,
            profile: getStoredProfile(),
            stream: true,
          }),
          signal: abortCtrl.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Gemini stream returned HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let firstTokenReceived = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                if (!firstTokenReceived) {
                  firstTokenReceived = true;
                  performance.mark('llm-first-token');
                  try {
                    performance.measure('ttft', 'speech-end', 'llm-first-token');
                    const entries = performance.getEntriesByName('ttft');
                    const ttft = Math.round(entries[entries.length - 1]?.duration || 0);
                    setLatencyMetrics((prev) => ({ ...prev, ttft }));
                    console.log(`[VoiceLatency] Time-to-First-Token (TTFT): ${ttft} ms`);
                  } catch {
                    /* noop */
                  }
                }

                accumulatedReply += parsed.text;
                sentenceBuffer += parsed.text;

                // Hide [SUBMIT_FEEDBACK] token from UI
                setCurrentAssistantText(accumulatedReply.replace('[SUBMIT_FEEDBACK]', '').trim());

                // Sentence chunking regex: split by punctuation followed by space or line end
                const sentenceMatch = sentenceBuffer.match(/^([\s\S]+?[.!?؟\n])(?:\s+|$)([\s\S]*)$/);
                if (sentenceMatch) {
                  let completedSentence = sentenceMatch[1].trim();
                  sentenceBuffer = sentenceMatch[2] || '';

                  // Prevent speaking the system token
                  if (completedSentence.includes('[SUBMIT_FEEDBACK]')) {
                    completedSentence = completedSentence.replace('[SUBMIT_FEEDBACK]', '').trim();
                  }

                  if (completedSentence) {
                    const idx = totalDispatchedRef.current++;
                    const wordCount = completedSentence.split(/\s+/).filter(Boolean).length;
                    const startWordIdx = runningWordIndex;
                    runningWordIndex += wordCount;
                    prefetchSentence(completedSentence, abortCtrl.signal, idx, startWordIdx);
                  }
                }
              }
            } catch {
              /* ignore parse error on partial line */
            }
          }
        }

        // Flush remaining buffer text if any
        if (sentenceBuffer.trim()) {
          let remaining = sentenceBuffer.trim();
          if (remaining.includes('[SUBMIT_FEEDBACK]')) {
              remaining = remaining.replace('[SUBMIT_FEEDBACK]', '').trim();
          }
          if (remaining) {
            const idx = totalDispatchedRef.current++;
            prefetchSentence(remaining, abortCtrl.signal, idx, runningWordIndex);
          }
        }

        streamDoneRef.current = true;

        let finalReply = accumulatedReply.trim();

        if (finalReply.includes('[SUBMIT_FEEDBACK]')) {
           finalReply = finalReply.replace('[SUBMIT_FEEDBACK]', '').trim();
           // Find the last drafted message from assistant history
           const recentAssistantDrafts = messages.filter(m => m.role === 'assistant' && m.text.includes('عايز أبعتها كفيدباك دلوقتي؟'));
           let draft = "User feedback";
           if (recentAssistantDrafts.length > 0) {
               const lastDraftMsg = recentAssistantDrafts[recentAssistantDrafts.length - 1].text;
               // Extract the drafted feedback content loosely
               const parts = lastDraftMsg.split('عايز أبعتها كفيدباك دلوقتي؟');
               if (parts.length > 0) {
                   draft = parts[0].trim();
               }
           }

           saveFeedback({
               originalText: userText,
               draftedMessage: draft,
               timestamp: Date.now(),
               status: 'confirmed'
           });
        }

        checkAndPlayQueue();

        if (finalReply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              text: finalReply,
              timestamp: Date.now(),
              feedbackDraft: newFeedbackDraft || undefined,
              feedbackStatus: newFeedbackDraft ? 'pending' : undefined
            },
          ]);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('[useVoiceOrchestrator] Interrupted by user (barge-in).');
          return;
        }

        console.warn('[useVoiceOrchestrator] Stream fallback engaged:', err);
        // Fallback to deterministic offline conversational engine
        const fallbackReply =
          voiceCommand === 'translate-arabic'
            ? translateEnglishToArabic(previousAssistantSentence || userText).text ||
              generateSmartConversationReply(
                userText,
                messages.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
                getStoredProfile() as any,
                effectiveTargetLang
              )
            : generateSmartConversationReply(
                userText,
                messages.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
                getStoredProfile() as any,
                effectiveTargetLang
              );

        setCurrentAssistantText(fallbackReply);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: fallbackReply,
            timestamp: Date.now(),
            feedbackDraft: newFeedbackDraft || undefined,
            feedbackStatus: newFeedbackDraft ? 'pending' : undefined
          },
        ]);
        const idx = totalDispatchedRef.current++;
        streamDoneRef.current = true;
        prefetchSentence(fallbackReply, abortCtrl.signal, idx);
      }
    },
    [
      cancelPendingFeedback,
      checkAndPlayQueue,
      currentAssistantText,
      effectiveTargetLang,
      messages,
      pendingFeedbackDraft,
      prefetchSentence,
      stopAudio,
      submitPendingFeedback,
    ]
  );

  const {
    isListening,
    interimTranscript,
    micVolume,
    error: sttError,
    clearError,
    startListening,
    stopListening,
    abortListening,
  } = useNativeSpeech({
    onSpeechStart: () => {
      // Automatic Barge-in: if AI is speaking when user speaks, interrupt AI immediately!
      if (stateRef.current === 'speaking' || stateRef.current === 'thinking') {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        stopAudio();
        setState('listening');
      }
    },
    onSpeechEnd: (text) => {
      setState('transcribing');
      setTimeout(() => {
        handleUserSpeech(text);
      }, 50);
    },
    onError: (_err) => {
      setState('idle');
    },
    silenceTimeoutMs: 1500,
  });

  // Ensure state resets to idle if speech recognition encounters an error
  useEffect(() => {
    if (sttError && stateRef.current === 'listening') {
      setState('idle');
    }
  }, [sttError]);

  // Start turn / tap to speak
  const startTurn = useCallback(() => {
    // If speaking or thinking -> BARGE-IN!
    if (stateRef.current === 'speaking' || stateRef.current === 'thinking') {
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      stopAudio();
    } else {
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
    }

    unlockAudio();
    stopAudio();
    setState('listening');
    const sttLang = TARGET_LANGUAGE_LOCALES[effectiveTargetLang] || 'ar-SA';
    startListening(sttLang).catch(() => {
      setState('idle');
    });
  }, [effectiveTargetLang, startListening, stopAudio]);

  // Stop turn manually
  const stopTurn = useCallback(() => {
    if (stateRef.current === 'listening') {
      stopListening();
    } else {
      stopAudio();
    }
    setState('idle');
  }, [stopAudio, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopAudio();
      abortListening();
    };
  }, [abortListening, stopAudio]);

  return {
    state,
    isListening,
    interimTranscript,
    micVolume,
    currentAssistantText,
    messages,
    error: sttError,
    clearError,
    latencyMetrics,
    startTurn,
    stopTurn,
    handleManualText: handleUserSpeech,
    audioProgress,
    currentSpokenWordIndex,
    voiceMarker: VOICE_V2_MARKER,
    pendingFeedbackDraft,
    submitPendingFeedback,
    cancelPendingFeedback,
  };
}
