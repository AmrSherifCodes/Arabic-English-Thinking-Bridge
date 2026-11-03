/**
 * Audio, Natural Voice Selection, and Speech Recognition Utilities
 */
import { createVoiPiVoice, resolveTargetLangAndNeuralVoice } from '../hooks/useSpeech';

let activeSpeakAbortController: AbortController | null = null;

export function scoreEnglishVoice(v: { name: string; lang: string }): number {
  return (
    (/natural|neural|online/i.test(v.name) ? 50 : 0) +
    (/aria|jenny|guy|ava|andrew|emma|samantha|allison|serena|daniel|karen|google/i.test(v.name) ? 20 : 0) +
    (/en-US/i.test(v.lang) ? 10 : /en-GB/i.test(v.lang) ? 6 : 0)
  );
}

export function scoreArabicVoice(v: { name: string; lang: string }): number {
  return (
    (/natural|neural|online/i.test(v.name) ? 50 : 0) +
    (/salma|shakir|hamed|zariyah|maged|tarik|laila|google/i.test(v.name) ? 25 : 0) +
    (/ar-EG/i.test(v.lang) ? 15 : /^ar/i.test(v.lang) ? 8 : 0)
  );
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    return window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  } catch {
    return [];
  }
}

export function getArabicVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    return window.speechSynthesis.getVoices().filter(v => /^ar/i.test(v.lang));
  } catch {
    return [];
  }
}

export function selectBestEnglishVoice(
  voices: SpeechSynthesisVoice[],
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;
  if (preferredVoiceName) {
    const found = voices.find(v => v.name === preferredVoiceName);
    if (found) return found;
  }
  return [...voices].sort((a, b) => scoreEnglishVoice(b) - scoreEnglishVoice(a))[0];
}

export function selectBestArabicVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;
  return [...voices].sort((a, b) => scoreArabicVoice(b) - scoreArabicVoice(a))[0];
}

export const CLOUD_AI_VOICE_ID = 'cloud-ai';

/**
 * Prime and unlock audio playback on mobile browsers, WebView and iOS Safari.
 * Call this on any initial user touch/click.
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
    // Also unlock HTML5 Audio element
    const silent = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silent.volume = 0.01;
    silent.play().then(() => silent.pause()).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function speakWithNativeSpeechSynthesis(
  text: string,
  requestedRate: number = 1,
  preferredVoiceName?: string,
  onBoundary?: (charIndex: number) => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    const allVoices = window.speechSynthesis.getVoices();
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
    const isGerman = /[äöüßÄÖÜ]/.test(text) || /\b(ich|sie|wir|das|der|die|heute|jetzt|morgen)\b/i.test(text);

    // 1. Find the exact voice object the user selected
    const exactVoice =
      preferredVoiceName && preferredVoiceName !== CLOUD_AI_VOICE_ID
        ? allVoices.find(v => v.name === preferredVoiceName)
        : undefined;

    if (exactVoice) {
      utterance.voice = exactVoice;
      utterance.lang = exactVoice.lang;
    } else if (isJapanese) {
      const jaVoice = allVoices.find(v => /^ja/i.test(v.lang));
      if (jaVoice) {
        utterance.voice = jaVoice;
        utterance.lang = jaVoice.lang;
      } else {
        utterance.lang = 'ja-JP';
      }
    } else if (isGerman) {
      const deVoice = allVoices.find(v => /^de/i.test(v.lang));
      if (deVoice) {
        utterance.voice = deVoice;
        utterance.lang = deVoice.lang;
      } else {
        utterance.lang = 'de-DE';
      }
    } else if (isArabic) {
      const arVoices = getArabicVoices();
      const chosenAr = selectBestArabicVoice(arVoices);
      if (chosenAr) {
        utterance.voice = chosenAr;
        utterance.lang = chosenAr.lang;
      } else {
        utterance.lang = 'ar-EG';
      }
    } else {
      const enVoices = getEnglishVoices();
      const chosenEn = selectBestEnglishVoice(enVoices, preferredVoiceName);
      if (chosenEn) {
        utterance.voice = chosenEn;
        utterance.lang = chosenEn.lang;
      } else {
        utterance.lang = 'en-US';
      }
    }

    utterance.rate = Math.max(0.7, Math.min(1.5, requestedRate * 0.95));
    utterance.pitch = 1;

    if (onBoundary) {
      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        onBoundary(e.charIndex);
      };
    }
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    // Workaround Chromium speech cancellation bug by canceling and deferring speak 15ms
    try {
      window.speechSynthesis.cancel();
    } catch {}

    setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[speechSynthesis] speak invocation error:', err);
      }
    }, 15);

    return true;
  } catch (err) {
    console.warn('[speechSynthesis] Setup error:', err);
    return false;
  }
}

export function speakWithRate(
  text: string,
  requestedRate: number = 1,
  preferredVoiceName?: string
): boolean {
  const clean = text.trim();
  if (!clean) return false;

  unlockAudio();
  activeSpeakAbortController?.abort();

  const isArabic = /[\u0600-\u06FF]/.test(clean);
  const enVoices = !isArabic ? getEnglishVoices() : [];
  const wantsSpecificBrowserVoice =
    !isArabic &&
    preferredVoiceName !== CLOUD_AI_VOICE_ID &&
    enVoices.length > 0 &&
    Boolean(
      preferredVoiceName
        ? enVoices.some(v => v.name === preferredVoiceName)
        : enVoices.length > 0
    );

  // If the user picked a specific browser voice (e.g. Zira, David, Samantha),
  // attach that exact SpeechSynthesisVoice object and play it immediately.
  if (wantsSpecificBrowserVoice) {
    return speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName);
  }

  const defaultLang = isArabic ? 'ar-EG' : 'en-US';
  const { targetLang, neuralVoice } = resolveTargetLangAndNeuralVoice(clean, defaultLang);
  const controller = new AbortController();
  activeSpeakAbortController = controller;

  // Set a safety timeout for remote TTS so the user is never left in silence
  const timeoutId = setTimeout(() => {
    controller.abort();
    speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName);
  }, 3500);

  const voipi = createVoiPiVoice();
  void voipi
    .speak(clean, {
      lang: targetLang,
      voice: neuralVoice,
      rate: requestedRate * 0.95,
      signal: controller.signal,
    })
    .then(() => {
      clearTimeout(timeoutId);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      if (controller.signal.aborted) return;
      speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName);
    });

  return (
    typeof window !== 'undefined' &&
    ('speechSynthesis' in window || typeof Audio !== 'undefined')
  );
}

export function speakEnglishText(text: string, isSlow: boolean = false, preferredVoiceName?: string): void {
  speakWithRate(text, isSlow ? 0.6 : 1, preferredVoiceName);
}

export const MAX_VOICE_NOTE_DURATION_SEC = 15;
export const VOICE_NOTE_LIMIT_MESSAGE = 'Voice notes are limited to 15 seconds to save storage.';

/**
 * Helper to record audio via MediaRecorder and convert to base64 Data URL.
 * Automatically enforces a strict 15-second cap to prevent localStorage quota exhaustion.
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private timeoutId: any = null;

  async start(options?: {
    maxDurationSec?: number;
    onTimeLimitReached?: () => void;
  }): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser environment.');
    }
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];
    this.startTime = Date.now();
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    const maxSec = options?.maxDurationSec ?? MAX_VOICE_NOTE_DURATION_SEC;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (maxSec > 0) {
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        if (options?.onTimeLimitReached) {
          options.onTimeLimitReached();
        } else if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          try {
            this.mediaRecorder.stop();
          } catch {}
        }
      }, maxSec * 1000);
    }

    this.mediaRecorder.start();
    return true;
  }

  stop(): Promise<{ audioBlob: Blob; audioUrl: string; base64: string; durationSec: number }> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not started'));
      }

      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve({ audioBlob, audioUrl, base64, durationSec });
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);

        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    } catch {}
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // Brave blocks Google Speech API servers by default for privacy
  if (typeof navigator !== 'undefined' && Boolean((navigator as any).brave)) {
    return false;
  }
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function createSpeechRecognition(): any | null {
  if (typeof window === 'undefined') return null;
  // In Brave, webkitSpeechRecognition triggers network errors; do not instantiate
  if (typeof navigator !== 'undefined' && Boolean((navigator as any).brave)) {
    return null;
  }
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;
  const recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  return recognizer;
}
