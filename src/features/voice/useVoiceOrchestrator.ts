import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { API_BASE_URL } from '../../utils/api';
import { generateSmartConversationReply } from '../../services/smartConversation';
import { useNativeSpeech } from './useNativeSpeech';
import { usePreferences } from '../preferences/usePreferences';
import { unlockAudio, speakWithNativeSpeechSynthesis } from '../../utils/audio';

export type VoiceState = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export const VOICE_V2_MARKER = 'voice-v2-profile';

function getStoredProfile() {
  try {
    const raw = localStorage.getItem('tb.userProfile');
    if (raw) {
      const p = JSON.parse(raw);
      return {
        name: typeof p.name === 'string' ? p.name.trim() : '',
        goal: typeof p.goal === 'string' ? p.goal : 'general',
        focusArea: typeof p.focusArea === 'string' ? p.focusArea : 'daily-speech',
        level: typeof p.level === 'string' ? p.level : 'beginner',
        dialect: p.dialect === 'msa' ? 'Modern Standard Arabic' : 'Egyptian Arabic',
        pipeline: VOICE_V2_MARKER,
      };
    }
  } catch {
    /* noop */
  }
  return {
    name: '',
    goal: 'general',
    focusArea: 'daily-speech',
    level: 'beginner',
    dialect: 'Egyptian Arabic',
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
}

export function useVoiceOrchestrator() {
  const { values } = usePreferences();
  const voiceModel = String(values.voiceModel || 'ar-EG-SalmaNeural');
  const englishVoice = String(values.englishVoice || 'en-US-AvaNeural');
  const speechRate = Number(values.speechRate || 1.0);
  const autoListen = Boolean(values.autoListen ?? true);

  const [state, setState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAssistantText, setCurrentAssistantText] = useState('');
  const [latencyMetrics, setLatencyMetrics] = useState<{ ttft?: number; ttfa?: number; total?: number }>({});
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentSpokenWordIndex, setCurrentSpokenWordIndex] = useState(-1);

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
        if (syncAnimFrameRef.current) {
          cancelAnimationFrame(syncAnimFrameRef.current);
          syncAnimFrameRef.current = null;
        }
        console.warn('[useVoiceOrchestrator] Audio playback chunk error, checking next.');
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        setAudioProgress(0);
        checkAndPlayQueue();
      };

      nextAudio.play().catch((err) => {
        if (syncAnimFrameRef.current) {
          cancelAnimationFrame(syncAnimFrameRef.current);
          syncAnimFrameRef.current = null;
        }
        console.warn('[useVoiceOrchestrator] Audio play rejected:', err);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        checkAndPlayQueue();
      });
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
  }, [autoListen]);

  // Helper to create a fallback slot powered by on-device SpeechSynthesis
  const createFallbackAudioSlot = useCallback(
    (
      sentenceText: string,
      wordsList: string[],
      startWordIdx: number,
      rate: number,
      preferredVoice?: string
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
              }
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
    async (sentence: string, signal: AbortSignal, chunkIndex: number, startWordIndex: number = 0) => {
      const clean = sentence.trim();
      if (!clean) return;

      const isArabic = /[\u0600-\u06FF]/.test(clean);
      const targetLang = isArabic ? 'ar-EG' : 'en-US';
      const targetVoice = isArabic ? voiceModel : englishVoice;
      const words = clean.split(/\s+/).filter(Boolean);
      let slotCreated = false;

      try {
        const timeoutCtrl = new AbortController();
        const timeoutId = setTimeout(() => timeoutCtrl.abort(), 3500);

        const res = await fetch(`${API_BASE_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: clean,
            lang: targetLang,
            voice: targetVoice,
            rate: speechRate,
          }),
          signal: signal || timeoutCtrl.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (!res.ok) throw new Error(`TTS failed with status ${res.status}`);

        const blob = await res.blob();
        if (blob.size >= 50) {
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          audio.playbackRate = speechRate;
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
        if (err.name === 'AbortError') return;
        console.warn('[useVoiceOrchestrator] Remote TTS prefetch failed, engaging on-device speech:', err);
      }

      // If remote Edge TTS did not create a slot, immediately engage native speech synthesis fallback!
      if (!slotCreated) {
        const fallbackSlot = createFallbackAudioSlot(
          clean,
          words,
          startWordIndex,
          speechRate,
          targetVoice
        );
        audioSlotsRef.current.set(chunkIndex, fallbackSlot);
        checkAndPlayQueue();
      }
    },
    [checkAndPlayQueue, createFallbackAudioSlot, englishVoice, speechRate, voiceModel]
  );

  // Handle incoming final speech from user
  const handleUserSpeech = useCallback(
    async (userText: string) => {
      if (!userText.trim()) {
        setState('idle');
        return;
      }

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

      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      let accumulatedReply = '';
      let sentenceBuffer = '';
      let runningWordIndex = 0;
      totalDispatchedRef.current = 0;
      nextPlayIndexRef.current = 0;
      streamDoneRef.current = false;

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
          },
          body: JSON.stringify({
            operation: 'conversation',
            prompt: userText,
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
                setCurrentAssistantText(accumulatedReply);

                // Sentence chunking regex: split by punctuation followed by space or line end
                const sentenceMatch = sentenceBuffer.match(/^([\s\S]+?[.!?؟\n])(?:\s+|$)([\s\S]*)$/);
                if (sentenceMatch) {
                  const completedSentence = sentenceMatch[1].trim();
                  sentenceBuffer = sentenceMatch[2] || '';

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
          const remaining = sentenceBuffer.trim();
          const idx = totalDispatchedRef.current++;
          prefetchSentence(remaining, abortCtrl.signal, idx, runningWordIndex);
        }

        streamDoneRef.current = true;
        checkAndPlayQueue();

        if (accumulatedReply.trim()) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              text: accumulatedReply.trim(),
              timestamp: Date.now(),
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
        const fallbackReply = generateSmartConversationReply(
          userText,
          messages.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          {} as any
        );

        setCurrentAssistantText(fallbackReply);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: fallbackReply,
            timestamp: Date.now(),
          },
        ]);
        const idx = totalDispatchedRef.current++;
        streamDoneRef.current = true;
        prefetchSentence(fallbackReply, abortCtrl.signal, idx);
      }
    },
    [checkAndPlayQueue, messages, prefetchSentence, stopAudio]
  );

  const {
    isListening,
    interimTranscript,
    error: sttError,
    clearError,
    startListening,
    stopListening,
    abortListening,
  } = useNativeSpeech({
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
    startListening('en-US').catch(() => {
      setState('idle');
    });
  }, [startListening, stopAudio]);

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
  };
}
