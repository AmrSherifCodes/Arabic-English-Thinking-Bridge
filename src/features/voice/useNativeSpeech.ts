import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface OfflineSTTPlugin {
  init(options: { modelPath: string; sampleRate: number }): Promise<void>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  addListener(eventName: 'onPartialResult', listenerFunc: (result: { text: string }) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'onFinalResult', listenerFunc: (result: { text: string }) => void): Promise<PluginListenerHandle>;
}
const OfflineSTT = registerPlugin<OfflineSTTPlugin>('OfflineSTT');

interface BrowserSpeechResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface BrowserSpeechEvent {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechResult>;
}

interface BrowserSpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface BrowserSpeechWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognizer;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognizer;
}

export function isBraveBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean((navigator as Navigator & { brave?: unknown }).brave);
}

interface UseNativeSpeechOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (finalTranscript: string) => void;
  onError?: (errorMessage: string) => void;
  silenceTimeoutMs?: number;
}

export function useNativeSpeech({
  onSpeechStart,
  onSpeechEnd,
  onError,
  silenceTimeoutMs = 1200,
}: UseNativeSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTranscriptRef = useRef('');
  const finalizedRef = useRef(false);
  const abortedRef = useRef(false);
  const webRecognizerRef = useRef<BrowserSpeechRecognizer | null>(null);
  const stateListenerRef = useRef<PluginListenerHandle | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const updateListening = useCallback((value: boolean) => {
    setIsListening(value);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }, []);

  const triggerSpeechEnd = useCallback((text: string) => {
    clearSilenceTimer();
    const clean = text.trim();
    updateListening(false);
    if (abortedRef.current || finalizedRef.current) return;
    if (!clean) {
      setInterimTranscript('');
      setError('No words recognized. Try speaking again or type below.');
      onError?.('No words recognized');
      return;
    }

    finalizedRef.current = true;
    latestTranscriptRef.current = clean;
    setTranscript(clean);
    setInterimTranscript('');
    onSpeechEnd?.(clean);
  }, [clearSilenceTimer, onError, onSpeechEnd, updateListening]);

  const resetSilenceTimer = useCallback((text: string) => {
    clearSilenceTimer();
    if (!text.trim()) return;
    silenceTimerRef.current = setTimeout(() => {
      try {
        webRecognizerRef.current?.stop();
      } catch (stopError) {
        console.warn('[useNativeSpeech] Could not stop browser recognition after silence.', stopError);
        triggerSpeechEnd(latestTranscriptRef.current || text);
      }
    }, silenceTimeoutMs);
  }, [clearSilenceTimer, silenceTimeoutMs, triggerSpeechEnd]);

  const startListening = useCallback(async (language = 'en-US') => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    finalizedRef.current = false;
    abortedRef.current = false;
    clearSilenceTimer();

    if (isNative) {
      try {
        await OfflineSTT.init({ modelPath: 'models/vosk-model-small-ar-mgb2', sampleRate: 16000 });

        await stateListenerRef.current?.remove();

        const partialListener = await OfflineSTT.addListener('onPartialResult', (res: any) => {
          if (res.text) {
            latestTranscriptRef.current = res.text.trim();
            setInterimTranscript(latestTranscriptRef.current);
          }
        });

        const finalListener = await OfflineSTT.addListener('onFinalResult', (res: any) => {
          if (abortedRef.current) return;
          const finalMatch = res.text?.trim() || latestTranscriptRef.current || '';
          latestTranscriptRef.current = finalMatch;
          partialListener.remove();
          finalListener.remove();
          triggerSpeechEnd(finalMatch);
        });

        updateListening(true);
        onSpeechStart?.();
        setInterimTranscript('Listening…');

        await OfflineSTT.startListening();
      } catch (recognitionError) {
        if (abortedRef.current) return;
        console.error('[useNativeSpeech] Native speech recognition failed.', recognitionError);
        const message = recognitionError instanceof Error
          ? recognitionError.message
          : 'Could not start offline speech recognition. Check microphone permission or use text input.';
        setError(message);
        setInterimTranscript('');
        updateListening(false);
        onError?.(message);
      }
      return;
    }

    if (isBraveBrowser()) {
      const message = 'Speech recognition is blocked in this browser. Use a supported browser or type your message.';
      setError(message);
      onError?.(message);
      return;
    }

    const SpeechRecognitionConstructor =
      (window as BrowserSpeechWindow).SpeechRecognition ||
      (window as BrowserSpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      const message = 'Speech recognition is not supported in this browser. Type your message instead.';
      setError(message);
      onError?.(message);
      return;
    }

    try {
      webRecognizerRef.current?.abort();
      const recognizer = new SpeechRecognitionConstructor();
      recognizer.lang = language;
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 1;
      recognizer.onstart = () => {
        updateListening(true);
        onSpeechStart?.();
      };
      recognizer.onresult = (event) => {
        let completeText = '';
        for (let index = 0; index < event.results.length; index += 1) {
          completeText += `${event.results[index][0]?.transcript || ''} `;
        }
        latestTranscriptRef.current = completeText.trim();
        setInterimTranscript(latestTranscriptRef.current);
        resetSilenceTimer(latestTranscriptRef.current);
      };
      recognizer.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        const message = event.error === 'not-allowed'
          ? 'Microphone permission denied. Allow microphone access in browser settings.'
          : `Voice input error (${event.error}). Type your message instead.`;
        setError(message);
        updateListening(false);
        onError?.(message);
      };
      recognizer.onend = () => {
        updateListening(false);
        if (!abortedRef.current) triggerSpeechEnd(latestTranscriptRef.current);
      };
      webRecognizerRef.current = recognizer;
      setInterimTranscript('Listening…');
      recognizer.start();
    } catch (recognitionError) {
      console.error('[useNativeSpeech] Browser speech recognition failed.', recognitionError);
      const message = 'Could not start speech recognition. Check microphone permission or use text input.';
      setError(message);
      updateListening(false);
      onError?.(message);
    }
  }, [
    clearSilenceTimer,
    isNative,
    onError,
    onSpeechStart,
    resetSilenceTimer,
    triggerSpeechEnd,
    updateListening,
  ]);

  const stopListening = useCallback(async () => {
    clearSilenceTimer();
    if (isNative) {
      try {
        await OfflineSTT.stopListening();
      } catch (stopError) {
        console.warn('[useNativeSpeech] Native recognition stop failed.', stopError);
        triggerSpeechEnd(latestTranscriptRef.current);
      }
      return;
    }

    try {
      webRecognizerRef.current?.stop();
    } catch (stopError) {
      console.warn('[useNativeSpeech] Browser recognition stop failed.', stopError);
      triggerSpeechEnd(latestTranscriptRef.current);
    }
  }, [clearSilenceTimer, isNative, triggerSpeechEnd]);

  const abortListening = useCallback(async () => {
    abortedRef.current = true;
    clearSilenceTimer();
    if (isNative) {
      try {
        await OfflineSTT.stopListening();
      } catch (stopError) {
        console.warn('[useNativeSpeech] Native recognition abort failed.', stopError);
      }
    } else {
      try {
        webRecognizerRef.current?.abort();
      } catch (stopError) {
        console.warn('[useNativeSpeech] Browser recognition abort failed.', stopError);
      }
    }
    updateListening(false);
    setInterimTranscript('');
  }, [clearSilenceTimer, isNative, updateListening]);

  useEffect(() => () => {
    clearSilenceTimer();
    void stateListenerRef.current?.remove();
    try {
      webRecognizerRef.current?.abort();
    } catch (recognitionError) {
      console.warn('[useNativeSpeech] Could not clean up browser recognition.', recognitionError);
    }
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    micVolume,
    error,
    clearError: () => setError(null),
    startListening,
    stopListening,
    abortListening,
    resetTranscript: () => {
      latestTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
    },
  };
}
