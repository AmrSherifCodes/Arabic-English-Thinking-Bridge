import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { generateSmartConversationReply } from '../../services/smartConversation';
import { useNativeSpeech } from './useNativeSpeech';
import { usePreferences } from '../preferences/usePreferences';

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

  const stateRef = useRef<VoiceState>('idle');
  stateRef.current = state;

  const abortControllerRef = useRef<AbortController | null>(null);
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const sentenceQueueRef = useRef<string[]>([]);
  const isFetchingTtsRef = useRef(false);

  // Stop any active audio immediately
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {
        /* noop */
      }
      currentAudioRef.current = null;
    }
    audioQueueRef.current.forEach((audio) => {
      try {
        audio.pause();
      } catch {
        /* noop */
      }
    });
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  // Play next audio in queue seamlessly
  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      currentAudioRef.current = null;

      // If we are still synthesizing sentences or streaming tokens, stay in speaking
      if (sentenceQueueRef.current.length === 0 && !isFetchingTtsRef.current) {
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
      return;
    }

    isPlayingRef.current = true;
    const nextAudio = audioQueueRef.current.shift()!;
    currentAudioRef.current = nextAudio;

    nextAudio.onended = () => {
      playNextInQueue();
    };

    nextAudio.onerror = () => {
      console.warn('[useVoiceOrchestrator] Audio playback chunk error, playing next.');
      playNextInQueue();
    };

    nextAudio.play().catch((err) => {
      console.warn('[useVoiceOrchestrator] Audio play rejected:', err);
      playNextInQueue();
    });
  }, [autoListen]);

  // Fetch TTS for a single sentence and queue it
  const synthesizeSentence = useCallback(
    async (sentence: string, signal: AbortSignal, isFirstSentence: boolean) => {
      const clean = sentence.trim();
      if (!clean) return;

      const isArabic = /[\u0600-\u06FF]/.test(clean);
      const targetLang = isArabic ? 'ar-EG' : 'en-US';
      const targetVoice = isArabic ? voiceModel : englishVoice;

      try {
        isFetchingTtsRef.current = true;
        const res = await fetch(`${API_BASE_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: clean,
            lang: targetLang,
            voice: targetVoice,
            rate: speechRate,
          }),
          signal,
        });

        if (!res.ok) throw new Error(`TTS failed with status ${res.status}`);

        const blob = await res.blob();
        if (blob.size < 50) return;

        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);

        if (isFirstSentence) {
          performance.mark('tts-first-chunk');
          try {
            performance.measure('ttfa', 'speech-end', 'tts-first-chunk');
            const entries = performance.getEntriesByName('ttfa');
            const ttfa = Math.round(entries[entries.length - 1]?.duration || 0);
            setLatencyMetrics((prev) => ({ ...prev, ttfa }));
            console.log(`[VoiceLatency] Time-to-First-Audio (TTFA): ${ttfa} ms`);
          } catch {
            /* noop */
          }

          setState('speaking');
        }

        audioQueueRef.current.push(audio);
        if (!isPlayingRef.current) {
          playNextInQueue();
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[useVoiceOrchestrator] Sentence TTS error:', err);
          if (!isPlayingRef.current && audioQueueRef.current.length === 0) {
            setState('idle');
          }
        }
      } finally {
        isFetchingTtsRef.current = false;
        // Process next queued sentence if any
        if (sentenceQueueRef.current.length > 0) {
          const next = sentenceQueueRef.current.shift()!;
          synthesizeSentence(next, signal, false);
        }
      }
    },
    [englishVoice, playNextInQueue, speechRate, voiceModel]
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
      let isFirstChunkDispatched = false;

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
                    if (!isFirstChunkDispatched) {
                      isFirstChunkDispatched = true;
                      synthesizeSentence(completedSentence, abortCtrl.signal, true);
                    } else if (isFetchingTtsRef.current) {
                      sentenceQueueRef.current.push(completedSentence);
                    } else {
                      synthesizeSentence(completedSentence, abortCtrl.signal, false);
                    }
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
          if (!isFirstChunkDispatched) {
            synthesizeSentence(remaining, abortCtrl.signal, true);
          } else if (isFetchingTtsRef.current) {
            sentenceQueueRef.current.push(remaining);
          } else {
            synthesizeSentence(remaining, abortCtrl.signal, false);
          }
        }

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
        synthesizeSentence(fallbackReply, abortCtrl.signal, true);
      }
    },
    [messages, stopAudio, synthesizeSentence]
  );

  const {
    isListening,
    interimTranscript,
    error: sttError,
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
    silenceTimeoutMs: 500,
  });

  // Start turn / tap to speak
  const startTurn = useCallback(() => {
    // If speaking or thinking -> BARGE-IN!
    if (stateRef.current === 'speaking' || stateRef.current === 'thinking') {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      stopAudio();
    }

    stopAudio();
    setState('listening');
    startListening('en-US');
  }, [startListening, stopAudio]);

  // Stop turn manually
  const stopTurn = useCallback(() => {
    if (stateRef.current === 'listening') {
      stopListening();
    } else {
      stopAudio();
      setState('idle');
    }
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
    latencyMetrics,
    startTurn,
    stopTurn,
    handleManualText: handleUserSpeech,
    voiceMarker: VOICE_V2_MARKER,
  };
}

