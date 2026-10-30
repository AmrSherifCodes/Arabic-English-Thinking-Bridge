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

function speakWithNativeSpeechSynthesis(
  text: string,
  requestedRate: number = 1,
  preferredVoiceName?: string
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isArabic = /[\u0600-\u06FF]/.test(text);

    if (isArabic) {
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

    utterance.rate = requestedRate * 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
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

  activeSpeakAbortController?.abort();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  const isArabic = /[\u0600-\u06FF]/.test(clean);
  const defaultLang = isArabic ? 'ar-EG' : 'en-US';
  const { targetLang, neuralVoice } = resolveTargetLangAndNeuralVoice(clean, defaultLang);
  const controller = new AbortController();
  activeSpeakAbortController = controller;

  const voipi = createVoiPiVoice();
  void voipi
    .speak(clean, {
      lang: targetLang,
      voice: neuralVoice,
      rate: requestedRate * 0.95,
      signal: controller.signal,
    })
    .catch(() => {
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

/**
 * Helper to record audio via MediaRecorder and convert to base64 Data URL
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  async start(): Promise<boolean> {
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

    this.mediaRecorder.start();
    return true;
  }

  stop(): Promise<{ audioBlob: Blob; audioUrl: string; base64: string; durationSec: number }> {
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

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
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
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function createSpeechRecognition(): any | null {
  if (typeof window === 'undefined') return null;
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
