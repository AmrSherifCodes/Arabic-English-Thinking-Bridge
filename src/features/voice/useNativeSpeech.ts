import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { API_BASE_URL } from '../../utils/api';

interface UseNativeSpeechOptions {
  onSpeechEnd?: (finalTranscript: string) => void;
  onError?: (errorMessage: string) => void;
  silenceTimeoutMs?: number;
}

export function useNativeSpeech({
  onSpeechEnd,
  onError,
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

  // Audio Recording (MediaRecorder) fallback for Brave/privacy browsers
  const isAudioModeRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  // Fallback Audio Recording using standard MediaRecorder (Supported 100% in Brave/Firefox/Safari)
  const startAudioRecording = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        setIsListening(true);
        setError(null);
        setInterimTranscript('🎙️ Speak now... tap mic when done');
      };

      recorder.start(250);
      setIsListening(true);
    } catch (err: any) {
      console.warn('[useNativeSpeech] Audio recording fallback failed:', err);
      const msg =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Tap the lock icon in your browser address bar to allow microphone access.'
          : 'Microphone access failed. Please use text input below to practice.';
      setError(msg);
      onError?.(msg);
      setIsListening(false);
    }
  }, [onError]);

  const stopAudioRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setIsListening(false);
      return;
    }

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        try {
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }

          const blob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });

          if (blob.size < 1200) {
            // Empty or instant tap without speaking
            setIsListening(false);
            setInterimTranscript('');
            resolve();
            return;
          }

          setInterimTranscript('Transcribing speech…');
          setIsListening(false);

          // Convert blob to base64 for /api/gemini transcription
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = (reader.result as string) || '';
              const response = await fetch(`${API_BASE_URL}/api/gemini`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  operation: 'transcribe',
                  audioData: base64Data,
                  mimeType: blob.type || 'audio/webm',
                }),
              });

              if (!response.ok) {
                throw new Error(`Transcribe returned HTTP ${response.status}`);
              }

              const resJson = await response.json();
              const transcriptText = resJson.data || '';
              if (transcriptText.trim()) {
                triggerSpeechEnd(transcriptText.trim());
              } else {
                setError('No words recognized. Try speaking again or type below!');
                onError?.('No words recognized');
              }
            } catch (transcribeErr: any) {
              console.warn('[useNativeSpeech] Audio transcribe failed:', transcribeErr);
              const errMsg = 'Could not transcribe audio. You can continue by typing below!';
              setError(errMsg);
              onError?.(errMsg);
            } finally {
              resolve();
            }
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          console.warn('[useNativeSpeech] Error in recorder onstop:', err);
          setIsListening(false);
          resolve();
        }
      };

      try {
        recorder.stop();
      } catch {
        resolve();
      }
    });
  }, [onError, triggerSpeechEnd]);

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
        } catch (err: any) {
          console.error('[useNativeSpeech] Native start error:', err);
          const msg = 'Failed to start native microphone.';
          setError(msg);
          onError?.(msg);
          setIsListening(false);
        }
      } else {
        // If Brave/browser previously blocked Web Speech, go straight to Audio Recording
        if (isAudioModeRef.current) {
          await startAudioRecording();
          return;
        }

        // Web Speech API
        const SpeechRec =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (!SpeechRec) {
          // No SpeechRecognition support -> use Audio Recording directly
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
            console.warn('[useNativeSpeech] Web speech error:', e.error);

            // In Brave browser or restricted networks, Google Speech is blocked
            if (e.error === 'network') {
              console.log('[useNativeSpeech] Web Speech API blocked by browser (Brave/privacy shield). Engaging Audio Recording fallback.');
              isAudioModeRef.current = true;
              try {
                rec.abort();
              } catch {
                /* noop */
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
        } catch (err: any) {
          console.error('[useNativeSpeech] Browser speech start failed:', err);
          // If browser speech constructor throws, fall back to Audio Recording
          isAudioModeRef.current = true;
          await startAudioRecording();
        }
      }
    },
    [clearSilenceTimer, isNative, onError, resetSilenceTimer, startAudioRecording, triggerSpeechEnd]
  );

  const stopListening = useCallback(async () => {
    clearSilenceTimer();

    // If recording via MediaRecorder, finalize it
    if (isAudioModeRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      await stopAudioRecording();
      return;
    }

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
  }, [clearSilenceTimer, isNative, stopAudioRecording, triggerSpeechEnd]);

  const abortListening = useCallback(async () => {
    clearSilenceTimer();
    setIsListening(false);
    latestTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* noop */
      }
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
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
  }, [clearSilenceTimer, isNative]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (partialListenerRef.current) partialListenerRef.current.remove();
      if (stateListenerRef.current) stateListenerRef.current.remove();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
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
