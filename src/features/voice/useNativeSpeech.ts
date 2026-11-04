import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { GoogleGenAI } from '@google/genai';
import { getUserGeminiKey } from '../../services/geminiLexicon';
import { API_BASE_URL } from '../../utils/api';

export function isBraveBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as any;
  return Boolean(nav.brave);
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
  const isListeningRef = useRef(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef('');
  const finalizedRef = useRef(false);
  const webRecognizerRef = useRef<any>(null);
  const partialListenerRef = useRef<PluginListenerHandle | null>(null);
  const stateListenerRef = useRef<PluginListenerHandle | null>(null);

  // Audio Recording (MediaRecorder + Web Audio Silence Detection) for Brave & privacy browsers
  const isAudioModeRef = useRef<boolean>(isBraveBrowser());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // Detect Brave Browser upfront so we never hit Google's blocked speech proxy
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const nav = navigator as any;
      if (nav.brave) {
        isAudioModeRef.current = true;
        if (typeof nav.brave.isBrave === 'function') {
          nav.brave
            .isBrave()
            .then((isB: boolean) => {
              if (isB) {
                console.log('[useNativeSpeech] Brave browser verified. Direct audio engine engaged.');
                isAudioModeRef.current = true;
              }
            })
            .catch(() => {});
        }
      }
    }
  }, []);

  const updateListening = (val: boolean) => {
    isListeningRef.current = val;
    setIsListening(val);
  };

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopAudioTracks = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setMicVolume(0);
  }, []);

  const triggerSpeechEnd = useCallback(
    (text: string) => {
      clearSilenceTimer();
      stopAudioTracks();
      const clean = text.trim();
      if (clean && !finalizedRef.current) {
        finalizedRef.current = true;
        setTranscript(clean);
        setInterimTranscript('');
        onSpeechEnd?.(clean);
      }
    },
    [clearSilenceTimer, onSpeechEnd, stopAudioTracks]
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
        updateListening(false);
        triggerSpeechEnd(textToFinalize);
      }, silenceTimeoutMs);
    },
    [clearSilenceTimer, isNative, silenceTimeoutMs, triggerSpeechEnd]
  );

  // Fallback Audio Recording using standard MediaRecorder with smart silence detection
  const startAudioRecording = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording not supported in this browser.');
      }
      stopAudioTracks();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => {
        updateListening(true);
        setError(null);
        setInterimTranscript('🎙️ Listening... speak naturally');
        onSpeechStart?.();
      };

      // Set up real-time silence analysis and volume calculation
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.25;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let silenceStart = Date.now();
          let userHasSpoken = false;

          const checkAudioLevel = () => {
            if (!isListeningRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
              setMicVolume(0);
              return;
            }
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round(average * 2.5)));

            if (average > 10) {
              if (!userHasSpoken) {
                onSpeechStart?.();
              }
              userHasSpoken = true;
              silenceStart = Date.now();
            } else if (userHasSpoken && Date.now() - silenceStart > 1650) {
              console.log('[useNativeSpeech] Silence detected in audio mode. Finalizing turn.');
              stopListening();
              return;
            }

            rafIdRef.current = requestAnimationFrame(checkAudioLevel);
          };

          rafIdRef.current = requestAnimationFrame(checkAudioLevel);
        }
      } catch (audioCtxErr) {
        console.warn('[useNativeSpeech] Silence analyzer skipped:', audioCtxErr);
      }

      recorder.start(250);
      updateListening(true);
    } catch (err: any) {
      console.warn('[useNativeSpeech] Audio recording failed:', err);
      const msg =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Tap the lock icon in your browser address bar to allow microphone access.'
          : 'Microphone access failed. Please use text input below to practice.';
      setError(msg);
      onError?.(msg);
      updateListening(false);
      stopAudioTracks();
    }
  }, [onError, onSpeechStart, stopAudioTracks]);

  const stopAudioRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      updateListening(false);
      stopAudioTracks();
      return;
    }

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        try {
          stopAudioTracks();

          const blob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });

          if (blob.size < 300) {
            updateListening(false);
            setInterimTranscript('');
            resolve();
            return;
          }

          setInterimTranscript('Transcribing speech…');
          updateListening(false);

          // Convert blob to base64 for client-side or server transcription
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = (reader.result as string) || '';
              let transcriptText = '';

              // 1. Try direct client-side Gemini SDK STT if user key exists
              const userKey = getUserGeminiKey();
              if (userKey) {
                try {
                  const ai = new GoogleGenAI({ apiKey: userKey });
                  const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
                  const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                      {
                        role: 'user',
                        parts: [
                          {
                            inlineData: {
                              data: base64Clean,
                              mimeType: blob.type || 'audio/webm',
                            },
                          },
                          {
                            text: 'Transcribe the spoken audio accurately into English or Arabic text. Output ONLY the raw transcript text with zero preamble or commentary.',
                          },
                        ],
                      },
                    ],
                  });
                  transcriptText = (response.text || '').trim();
                } catch (clientSttErr) {
                  console.warn('[useNativeSpeech] Client-side Gemini STT failed, falling back to server route:', clientSttErr);
                }
              }

              // 2. Fall back to server route if client-side STT did not return text
              if (!transcriptText) {
                const response = await fetch(`${API_BASE_URL}/api/gemini`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    operation: 'transcribe',
                    audioData: base64Data,
                    mimeType: blob.type || 'audio/webm',
                  }),
                });

                if (response.ok) {
                  const resJson = await response.json();
                  transcriptText = (resJson.data || '').trim();
                }
              }

              if (transcriptText.trim()) {
                triggerSpeechEnd(transcriptText.trim());
              } else {
                setError('No words recognized. Try speaking again or type below!');
                onError?.('No words recognized');
              }
            } catch (transcribeErr: any) {
              console.warn('[useNativeSpeech] Base64 transcription failed:', transcribeErr);
              setError('Transcription unavailable. Please type your message below!');
              onError?.('Transcription failed');
            } finally {
              resolve();
            }
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          console.warn('[useNativeSpeech] Error in recorder onstop:', err);
          updateListening(false);
          resolve();
        }
      };

      try {
        recorder.stop();
      } catch {
        resolve();
      }
    });
  }, [onError, stopAudioTracks, triggerSpeechEnd]);

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
              const msg = 'Microphone permission denied.';
              setError(msg);
              onError?.(msg);
              return;
            }
          }

          const hasFeature = await SpeechRecognition.available();
          if (!hasFeature.available) {
            const msg = 'Speech recognition not available on device.';
            setError(msg);
            onError?.(msg);
            return;
          }

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
                  triggerSpeechEnd(latestTranscriptRef.current);
                }
                updateListening(false);
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

          updateListening(true);
          onSpeechStart?.();
        } catch (err: any) {
          console.error('[useNativeSpeech] Native start error:', err);
          const msg = 'Failed to start native microphone.';
          setError(msg);
          onError?.(msg);
          updateListening(false);
        }
      } else {
        if (isAudioModeRef.current || isBraveBrowser()) {
          isAudioModeRef.current = true;
          await startAudioRecording();
          return;
        }

        const SpeechRec =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (!SpeechRec) {
          isAudioModeRef.current = true;
          await startAudioRecording();
          return;
        }

        try {
          if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach((t) => t.stop());
            } catch (permErr: any) {
              if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
                const msg = 'Microphone permission denied. Tap the lock icon in your browser address bar to allow access.';
                setError(msg);
                onError?.(msg);
                updateListening(false);
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
            updateListening(true);
            onSpeechStart?.();
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
            console.warn('[useNativeSpeech] Web speech error:', e.error);

            if (e.error === 'network' || e.error === 'service-not-allowed') {
              console.log('[useNativeSpeech] Speech recognition blocked by browser (Brave/privacy shield). Engaging Audio Recording fallback.');
              isAudioModeRef.current = true;
              if (webRecognizerRef.current) {
                webRecognizerRef.current.onend = null;
                webRecognizerRef.current.onerror = null;
                webRecognizerRef.current.onresult = null;
                try {
                  webRecognizerRef.current.abort();
                } catch {
                  /* noop */
                }
                webRecognizerRef.current = null;
              }
              startAudioRecording();
              return;
            }

            if (e.error === 'not-allowed') {
              const msg = 'Microphone permission denied (not-allowed). Tap the lock icon in your browser address bar to allow access.';
              setError(msg);
              onError?.(msg);
            } else if (e.error !== 'no-speech') {
              const msg = `Voice input error (${e.error})`;
              setError(msg);
              onError?.(msg);
            }
            updateListening(false);
          };

          rec.onend = () => {
            updateListening(false);
            if (latestTranscriptRef.current.trim()) {
              triggerSpeechEnd(latestTranscriptRef.current);
            }
          };

          webRecognizerRef.current = rec;
          rec.start();
        } catch (err: any) {
          console.error('[useNativeSpeech] Browser speech start failed:', err);
          isAudioModeRef.current = true;
          await startAudioRecording();
        }
      }
    },
    [clearSilenceTimer, isNative, onError, onSpeechStart, resetSilenceTimer, startAudioRecording, triggerSpeechEnd]
  );

  const stopListening = useCallback(async () => {
    clearSilenceTimer();

    if (isAudioModeRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      await stopAudioRecording();
      return;
    }

    updateListening(false);

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
  }, [clearSilenceTimer, isNative, stopAudioRecording]);

  const abortListening = useCallback(async () => {
    clearSilenceTimer();
    stopAudioTracks();

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* noop */
      }
      mediaRecorderRef.current = null;
    }

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
  }, [clearSilenceTimer, isNative, stopAudioTracks]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      stopAudioTracks();
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
  }, [clearSilenceTimer, stopAudioTracks]);

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
