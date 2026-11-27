// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import type { TranslatorLangCode } from './localTranslator';

const STT_LOCALE_MAP: Record<TranslatorLangCode, string> = {
  ar: 'ar-EG',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  fr: 'fr-FR',
};

export function getSttLocale(lang: TranslatorLangCode): string {
  return STT_LOCALE_MAP[lang] || 'en-US';
}

interface WebSpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: { results: ArrayLike<{ 0?: { transcript?: string } }> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/**
 * One-shot speech recognition helper:
 * - On Android Capacitor: uses native Android SpeechRecognizer via @capacitor-community/speech-recognition
 * - On Web / PWA: uses standard Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 */
export async function listenOnceForSpeech(options: {
  lang: TranslatorLangCode;
  prompt?: string;
  onPartial?: (text: string) => void;
}): Promise<{ transcript: string; error?: string }> {
  const locale = getSttLocale(options.lang);

  if (Capacitor.isNativePlatform()) {
    try {
      const avail = await SpeechRecognition.available();
      if (!avail.available) {
        return { transcript: '', error: 'التعرف الصوتي غير متاح على هذا الجهاز — استخدم الكتابة.' };
      }

      const perm = await SpeechRecognition.checkPermissions();
      if (perm.speechRecognition !== 'granted') {
        const req = await SpeechRecognition.requestPermissions();
        if (req.speechRecognition !== 'granted') {
          return { transcript: '', error: 'يرجى السماح بصلاحية الميكروفون للتحدث.' };
        }
      }

      const result = await SpeechRecognition.start({
        language: locale,
        maxResults: 1,
        prompt: options.prompt || '',
        partialResults: false,
        popup: false,
      });

      const best = result?.matches?.[0]?.trim() || '';
      if (!best) {
        return { transcript: '', error: 'لم نسمع صوتاً واضحاً — حاول مرة أخرى أو اكتب.' };
      }
      return { transcript: best };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر بدء الميكروفون';
      return { transcript: '', error: msg };
    }
  }

  // Web Speech API fallback
  if (typeof window === 'undefined') {
    return { transcript: '', error: 'Speech recognition unavailable.' };
  }

  const w = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRecognitionLike;
    webkitSpeechRecognition?: new () => WebSpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) {
    return { transcript: '', error: 'المتصفح لا يدعم الميكروفون — استخدم الكتابة السريعة.' };
  }

  return new Promise((resolve) => {
    let settled = false;
    let latest = '';
    const rec = new Ctor();
    rec.lang = locale;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const finish = (transcript: string, error?: string) => {
      if (settled) return;
      settled = true;
      resolve({ transcript: transcript.trim(), error });
    };

    const timeout = window.setTimeout(() => {
      try {
        rec.stop();
      } catch {}
      finish(latest, latest ? undefined : 'انتهى وقت الاستماع — حاول مرة أخرى.');
    }, 9000);

    rec.onresult = (ev) => {
      let text = '';
      for (let i = 0; i < ev.results.length; i += 1) {
        text += `${ev.results[i]?.[0]?.transcript || ''} `;
      }
      latest = text.trim();
      if (latest) options.onPartial?.(latest);
    };

    rec.onerror = (ev) => {
      window.clearTimeout(timeout);
      if (ev.error === 'no-speech') {
        finish('', 'لم نسمع صوتاً — جرّب مرة أخرى.');
      } else if (ev.error === 'not-allowed') {
        finish('', 'تم رفض صلاحية الميكروفون.');
      } else {
        finish(latest, latest ? undefined : `خطأ ميكروفون (${ev.error || 'unknown'})`);
      }
    };

    rec.onend = () => {
      window.clearTimeout(timeout);
      finish(latest, latest ? undefined : 'لم يتم التقاط كلام واضح.');
    };

    try {
      rec.start();
    } catch {
      window.clearTimeout(timeout);
      finish('', 'تعذر تشغيل الميكروفون.');
    }
  });
}

export async function stopActiveSpeechListening(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await SpeechRecognition.stop();
    } catch {}
  }
}
