/**
 * Audio, Natural Voice Selection, and Speech Recognition Utilities
 */
import { createVoiPiVoice, resolveTargetLangAndNeuralVoice } from '../hooks/useSpeech';

let activeSpeakAbortController: AbortController | null = null;
export let cloudTtsUnavailable = false;

export function setCloudTtsUnavailable(val: boolean): void {
  cloudTtsUnavailable = val;
}

export function getCloudTtsUnavailable(): boolean {
  return cloudTtsUnavailable;
}

export function scoreEnglishVoice(v: { name: string; lang: string; localService?: boolean }): number {
  return (
    (/natural|neural|online/i.test(v.name) ? 50 : 0) +
    (/aria|jenny|guy|ava|andrew|emma|samantha|allison|serena|daniel|karen|google/i.test(v.name) ? 20 : 0) +
    (/en-US/i.test(v.lang) ? 10 : /en-GB/i.test(v.lang) ? 6 : 0)
  );
}

export function scoreArabicVoice(v: { name: string; lang: string; localService?: boolean }): number {
  const normLang = (v.lang || '').toLowerCase().replace('_', '-');
  return (
    (/natural|neural|online|google|samsung|android/i.test(v.name) ? 50 : 0) +
    (/salma|shakir|hamed|zariyah|maged|tarik|laila|naayf/i.test(v.name) ? 25 : 0) +
    (normLang.startsWith('ar-eg') ? 20 : normLang.startsWith('ar-sa') ? 15 : normLang.startsWith('ar') ? 10 : 0)
  );
}

export function scoreVoiceForLang(
  v: { name: string; lang: string; localService?: boolean },
  targetLang: string = 'en-US',
  forceLocalOnly: boolean = false
): number {
  const normLang = (v.lang || '').toLowerCase().replace('_', '-');
  const langPrefix = targetLang.split('-')[0].toLowerCase();

  let score = 0;
  if (normLang.startsWith(langPrefix)) {
    score += 100;
    if (normLang === targetLang.toLowerCase()) score += 20;
  } else if (/arabic/i.test(v.name) && (langPrefix === 'ar' || langPrefix === 'arz')) {
    score += 80;
  } else if (/german/i.test(v.name) && langPrefix === 'de') {
    score += 80;
  } else if (/spanish/i.test(v.name) && langPrefix === 'es') {
    score += 80;
  } else if (/french/i.test(v.name) && langPrefix === 'fr') {
    score += 80;
  } else if (/japanese/i.test(v.name) && langPrefix === 'ja') {
    score += 80;
  } else {
    return -10000;
  }

  if (forceLocalOnly) {
    if (v.localService === true) {
      score += 1000;
    } else if (v.localService === false) {
      score -= 5000;
    }
  } else {
    if (/natural|neural|online/i.test(v.name)) score += 50;
    if (/aria|jenny|guy|ava|andrew|emma|samantha|allison|serena|daniel|karen|google|salma|shakir|hamed|zariyah/i.test(v.name)) score += 20;
    if (v.localService === true) score += 10;
  }

  return score;
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
    return window.speechSynthesis.getVoices().filter(v => {
      const normLang = (v.lang || '').toLowerCase().replace('_', '-');
      return normLang.startsWith('ar') || /arabic/i.test(v.name);
    });
  } catch {
    return [];
  }
}

export function selectBestVoiceForLang(
  voices: SpeechSynthesisVoice[],
  targetLang: string = 'en-US',
  preferredVoiceName?: string,
  forceLocalOnly: boolean = false
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;
  if (preferredVoiceName && preferredVoiceName !== CLOUD_AI_VOICE_ID) {
    const found = voices.find(v => v.name === preferredVoiceName);
    if (found && (!forceLocalOnly || found.localService === true)) return found;
  }
  const scored = [...voices]
    .map(v => ({ voice: v, score: scoreVoiceForLang(v, targetLang, forceLocalOnly) }))
    .filter(item => item.score > -5000)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice ?? voices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase()));
}

export function selectBestEnglishVoice(
  voices: SpeechSynthesisVoice[],
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;
  if (preferredVoiceName && preferredVoiceName !== CLOUD_AI_VOICE_ID) {
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

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        window.speechSynthesis.getVoices();
      } catch {}
    };
  } catch {}
}

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

function showOfflineVoiceToast(lang: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const existing = document.getElementById('tb-offline-voice-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'tb-offline-voice-toast';
  toast.className = 'fixed bottom-20 start-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-amber-950/90 text-amber-200 border border-amber-500/50 shadow-2xl text-xs font-bold text-center animate-in fade-in';
  toast.innerText = `الصوت أوفلاين غير مثبت لهذه اللغة (${lang}) — حمّل حزمة الصوت من إعدادات الجهاز`;

  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 4000);
}

export function speakWithNativeSpeechSynthesis(
  text: string,
  requestedRate: number = 1,
  preferredVoiceName?: string,
  onBoundary?: (charIndex: number) => void,
  onEnd?: () => void,
  preferredLocale?: string,
  forceLocalOnly: boolean = false
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    const allVoices = window.speechSynthesis.getVoices();

    const isArabic = /[\u0600-\u06FF]/.test(text);
    const isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
    const isGerman = /[äöüßÄÖÜ]/.test(text) || /\b(ich|sie|wir|das|der|die|heute|jetzt|morgen)\b/i.test(text);
    const isSpanish = /[áéíóúñ¿¡]/i.test(text);
    const isFrench = /[éèêëàâùûçîï]/i.test(text);

    let targetLang = preferredLocale || 'en-US';
    if (!preferredLocale) {
      if (isArabic) targetLang = 'ar-EG';
      else if (isJapanese) targetLang = 'ja-JP';
      else if (isGerman) targetLang = 'de-DE';
      else if (isSpanish) targetLang = 'es-ES';
      else if (isFrench) targetLang = 'fr-FR';
    }

    const isOffline = forceLocalOnly || (typeof navigator !== 'undefined' && navigator.onLine === false);
    const bestVoice = selectBestVoiceForLang(allVoices, targetLang, preferredVoiceName, isOffline);

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = targetLang;
      if (isOffline && allVoices.length > 0) {
        const localVoices = allVoices.filter(v => v.localService === true && v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase()));
        if (localVoices.length === 0) {
          showOfflineVoiceToast(targetLang);
        }
      }
    }

    utterance.rate = Math.max(0.7, Math.min(1.5, requestedRate * 0.95));
    utterance.pitch = 1;

    if (onBoundary) {
      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        onBoundary(e.charIndex);
      };
    }

    let retried = false;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e: any) => {
      if (!retried && (e?.error === 'network' || e?.error === 'synthesis-failed' || e?.error === 'audio-busy')) {
        retried = true;
        const retryVoice = allVoices.find(v => v.localService === true && v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase()));
        if (retryVoice) {
          try {
            const retryUtterance = new SpeechSynthesisUtterance(text);
            retryUtterance.voice = retryVoice;
            retryUtterance.lang = retryVoice.lang;
            retryUtterance.rate = utterance.rate;
            if (onEnd) retryUtterance.onend = onEnd;
            window.speechSynthesis.speak(retryUtterance);
            return;
          } catch {}
        }
      }
      if (onEnd) onEnd();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[speechSynthesis] speak invocation error:', err);
    }

    return true;
  } catch (err) {
    console.warn('[speechSynthesis] Setup error:', err);
    return false;
  }
}

export function speakWithRate(
  text: string,
  requestedRate: number = 1,
  preferredVoiceName?: string,
  targetLang?: string
): boolean {
  const clean = text.trim();
  if (!clean) return false;

  unlockAudio();
  activeSpeakAbortController?.abort();

  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const isNativeMobile = typeof window !== 'undefined' && Boolean((window as any)?.Capacitor?.isNativePlatform?.());

  if (isOffline || isNativeMobile || cloudTtsUnavailable) {
    return speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName, undefined, undefined, targetLang, isOffline);
  }

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

  if (wantsSpecificBrowserVoice) {
    return speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName, undefined, undefined, targetLang);
  }

  const defaultLang = targetLang || (isArabic ? 'ar-EG' : 'en-US');
  const { targetLang: resolvedLang, neuralVoice } = resolveTargetLangAndNeuralVoice(clean, defaultLang);
  const controller = new AbortController();
  activeSpeakAbortController = controller;

  const timeoutId = setTimeout(() => {
    controller.abort();
    cloudTtsUnavailable = true;
    speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName, undefined, undefined, resolvedLang);
  }, 1200);

  const voipi = createVoiPiVoice();
  void voipi
    .speak(clean, {
      lang: resolvedLang,
      voice: neuralVoice,
      rate: requestedRate * 0.95,
      signal: controller.signal,
    })
    .then(() => {
      clearTimeout(timeoutId);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      cloudTtsUnavailable = true;
      if (controller.signal.aborted) return;
      speakWithNativeSpeechSynthesis(clean, requestedRate, preferredVoiceName, undefined, undefined, resolvedLang);
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
  if (typeof navigator !== 'undefined' && Boolean((navigator as any).brave)) {
    return false;
  }
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function createSpeechRecognition(lang: string = 'en-US'): any | null {
  if (typeof window === 'undefined') return null;
  if (typeof navigator !== 'undefined' && Boolean((navigator as any).brave)) {
    return null;
  }
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;
  const recognizer = new SpeechRecognition();
  recognizer.lang = lang;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  return recognizer;
}
