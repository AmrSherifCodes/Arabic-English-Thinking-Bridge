import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

interface UseNativeSpeechOptions {
  onSpeechEnd?: (finalTranscript: string) => void;
  silenceTimeoutMs?: number;
}

export function useNativeSpeech({
  onSpeechEnd,
  silenceTimeoutMs = 1200,
}: UseNativeSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef('');
  const finalizedRef = useRef(false);
  const webRecognizerRef = useRef<any>(null);
  const partialListenerRef = useRef<PluginListenerHandle | null>(null);
  const stateListenerRef = useRef<PluginListenerHandle | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const triggerSpeechEnd = useCallback(
    (text: string) => {
      clearSilenceTimer();
      const clean = text.trim();
      if (clean && !finalizedRef.current) {
        finalizedRef.current = true;
        setTranscript(clean);
        setInterimTranscript('');
        onSpeechEnd?.(clean);
      }
    },
    [clearSilenceTimer, onSpeechEnd]
  );

  const resetSilenceTimer = useCallback(
    (currentText: string) => {
      clearSilenceTimer();
      if (!currentText.trim()) return;

      silenceTimerRef.current = setTimeout(async () => {
        const textToFinalize = latestTranscriptRef.current;
        if (isNative) {
          try {
            await SpeechRecognition.stop();
          } catch {
            /* noop */
          }
        } else if (webRecognizerRef.current) {
          try {
            webRecognizerRef.current.stop();
          } catch {
            /* noop */
          }
        }
        setIsListening(false);
        triggerSpeechEnd(textToFinalize);
      }, silenceTimeoutMs);
    },
    [clearSilenceTimer, isNative, silenceTimeoutMs, triggerSpeechEnd]
  );

  const startListening = useCallback(
    async (lang = 'en-US') => {
      setError(null);
      finalizedRef.current = false;
      setTranscript('');
      setInterimTranscript('');
      latestTranscriptRef.current = '';
      clearSilenceTimer();

      if (isNative) {
        try {
          const perm = await SpeechRecognition.checkPermissions();
          if (perm.speechRecognition !== 'granted') {
            const req = await SpeechRecognition.requestPermissions();
            if (req.speechRecognition !== 'granted') {
              setError('Microphone permission denied.');
              return;
            }
          }

          const hasFeature = await SpeechRecognition.available();
          if (!hasFeature.available) {
            setError('Speech recognition not available on device.');
            return;
          }

          // Cleanup previous listeners
          if (partialListenerRef.current) await partialListenerRef.current.remove();
          if (stateListenerRef.current) await stateListenerRef.current.remove();

          partialListenerRef.current = await SpeechRecognition.addListener(
            'partialResults',
            (data: { matches: string[] }) => {
              const match = data.matches?.[0] || '';
              if (match) {
                latestTranscriptRef.current = match;
                setInterimTranscript(match);
                resetSilenceTimer(match);
              }
            }
          );

          stateListenerRef.current = await SpeechRecognition.addListener(
            'listeningState',
            (data: { status: 'started' | 'stopped' }) => {
              if (data.status === 'stopped') {
                if (latestTranscriptRef.current.trim()) {
                  console.log('[useNativeSpeech] stopped-finalize');
                  triggerSpeechEnd(latestTranscriptRef.current);
                }
                setIsListening(false);
              }
            }
          );

          await SpeechRecognition.start({
            language: lang,
            maxResults: 1,
            prompt: 'Say something...',
            partialResults: true,
            popup: false,
          });

          setIsListening(true);
        } catch (err) {
          console.error('[useNativeSpeech] Native start error:', err);
          setError('Failed to start native microphone.');
          setIsListening(false);
        }
      } else {
        // Web Speech API Fallback
        const SpeechRec =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (!SpeechRec) {
          setError('Speech recognition not supported in this browser.');
          return;
        }

        try {
          // Explicitly check/request browser media permission if supported
          if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(t => t.stop());
            } catch (permErr: any) {
              if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
                setError('Microphone permission denied (not-allowed). Tap lock icon in browser bar to allow access.');
                setIsListening(false);
                return;
              }
            }
          }

          if (webRecognizerRef.current) {
            try {
              webRecognizerRef.current.abort();
            } catch {
              /* noop */
            }
          }

          const rec = new SpeechRec();
          rec.lang = lang;
          rec.continuous = true;
          rec.interimResults = true;
          rec.maxAlternatives = 1;

          rec.onstart = () => {
            setIsListening(true);
          };

          rec.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                latestTranscriptRef.current += res[0].transcript + ' ';
              } else {
                interim += res[0].transcript;
              }
            }
            const currentCombined = (latestTranscriptRef.current + interim).trim();
            setInterimTranscript(currentCombined);
            resetSilenceTimer(currentCombined);
          };

          rec.onerror = (e: any) => {
            if (e.error !== 'no-speech') {
              console.warn('[useNativeSpeech] Web speech error:', e.error);
              if (e.error === 'not-allowed') {
                setError('Microphone permission denied (not-allowed). Tap lock icon in browser bar to allow access.');
              } else {
                setError(`Voice input error (${e.error})`);
              }
            }
            setIsListening(false);
          };

          rec.onend = () => {
            setIsListening(false);
            if (latestTranscriptRef.current.trim()) {
              triggerSpeechEnd(latestTranscriptRef.current);
            }
          };

          webRecognizerRef.current = rec;
          rec.start();
        } catch (err) {
          console.error('[useNativeSpeech] Browser speech start failed:', err);
          setError('Microphone access blocked or failed.');
          setIsListening(false);
        }
      }
    },
    [clearSilenceTimer, isNative, resetSilenceTimer, triggerSpeechEnd]
  );

  const stopListening = useCallback(async () => {
    clearSilenceTimer();
    setIsListening(false);

    if (isNative) {
      try {
        await SpeechRecognition.stop();
      } catch {
        /* noop */
      }
    } else if (webRecognizerRef.current) {
      try {
        webRecognizerRef.current.stop();
      } catch {
        /* noop */
      }
    }

    if (latestTranscriptRef.current.trim()) {
      triggerSpeechEnd(latestTranscriptRef.current);
    }
  }, [clearSilenceTimer, isNative, triggerSpeechEnd]);

  const abortListening = useCallback(async () => {
    clearSilenceTimer();
    setIsListening(false);
    latestTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    if (isNative) {
      try {
        await SpeechRecognition.stop();
      } catch {
        /* noop */
      }
    } else if (webRecognizerRef.current) {
      try {
        webRecognizerRef.current.abort();
      } catch {
        /* noop */
      }
    }
  }, [clearSilenceTimer, isNative]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (partialListenerRef.current) partialListenerRef.current.remove();
      if (stateListenerRef.current) stateListenerRef.current.remove();
      if (webRecognizerRef.current) {
        try {
          webRecognizerRef.current.abort();
        } catch {
          /* noop */
        }
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
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

