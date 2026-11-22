/**
 * Unified Offline-First Text-to-Speech (TTS) Engine
 *
 * - Native Capacitor (Android/iOS): uses @capacitor-community/text-to-speech
 *   with strict BCP-47 locale mapping, language availability verification,
 *   automatic base-language fallback (e.g. de-DE -> de), and a non-intrusive
 *   Egyptian Arabic guidance toast if the offline voice pack is missing.
 * - Web / PWA browsers: uses window.speechSynthesis with explicit voice
 *   matching (waiting for voiceschanged if the voice list is not yet ready)
 *   and cancel() before every speak().
 */
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export interface UnifiedSpeakOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  preferredVoiceName?: string;
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
}

const STRICT_LANG_MAP: Record<string, string> = {
  de: 'de-DE',
  en: 'en-US',
  ar: 'ar-EG',
  arz: 'ar-EG',
  apc: 'ar-EG',
  afb: 'ar-EG',
  ary: 'ar-EG',
  tr: 'tr-TR',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-BR',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ru: 'ru-RU',
  ko: 'ko-KR',
  hi: 'hi-IN',
};

const LANGUAGE_NAME_AR: Record<string, string> = {
  de: 'الألماني',
  en: 'الإنجليزي',
  ar: 'العربي',
  tr: 'التركي',
  es: 'الإسباني',
  fr: 'الفرنسي',
  it: 'الإيطالي',
  pt: 'البرتغالي',
  ja: 'الياباني',
};

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let lastToastAt = 0;

/**
 * Strictly maps short language codes to BCP-47 locales:
 * de -> de-DE, en -> en-US, ar -> ar-EG, tr -> tr-TR.
 */
export function normalizeTtsLang(lang?: string, text?: string): string {
  const raw = (lang || '').trim().replace('_', '-');
  if (raw) {
    const lower = raw.toLowerCase();
    if (STRICT_LANG_MAP[lower]) {
      return STRICT_LANG_MAP[lower];
    }
    const base = lower.split('-')[0];
    if (raw.includes('-')) {
      const parts = raw.split('-');
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }
    if (STRICT_LANG_MAP[base]) {
      return STRICT_LANG_MAP[base];
    }
    return raw;
  }

  const sample = (text || '').trim();
  if (sample) {
    if (/[\u0600-\u06FF]/.test(sample)) return 'ar-EG';
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(sample)) return 'ja-JP';
    if (
      /[äöüßÄÖÜ]/.test(sample) ||
      /\b(ich|sie|wir|das|der|die|heute|jetzt|morgen|deutsch|danke|bitte|hallo|guten|freund|wasser|kaffee|restaurant|essen)\b/i.test(sample)
    ) {
      return 'de-DE';
    }
    if (/[çğışöüÇĞİŞÖÜ]/.test(sample)) return 'tr-TR';
    if (/[áéíóúñ¿¡]/i.test(sample)) return 'es-ES';
    if (/[éèêëàâùûçîï]/i.test(sample)) return 'fr-FR';
  }

  return 'en-US';
}

export function showMissingVoiceToast(lang: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const now = Date.now();
  if (now - lastToastAt < 2500) return;
  lastToastAt = now;

  const existing = document.getElementById('tb-offline-voice-toast');
  if (existing) existing.remove();

  const base = lang.split('-')[0].toLowerCase();
  const langLabel = LANGUAGE_NAME_AR[base] || lang;

  const toast = document.createElement('div');
  toast.id = 'tb-offline-voice-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('dir', 'rtl');
  toast.className =
    'fixed bottom-24 start-1/2 -translate-x-1/2 z-[120] max-w-[92vw] sm:max-w-md px-4 py-3 rounded-2xl bg-[#0B1C33]/95 text-amber-200 border border-amber-400/60 shadow-2xl text-xs font-bold text-center leading-relaxed backdrop-blur-md';
  toast.innerText =
    base === 'de'
      ? '🔊 صوت الألماني أوفلاين غير متاح على جهازك — فعّل Google Speech Services وحمّل حزمة اللغة الألمانية (Deutsch) من إعدادات أندرويد.'
      : `🔊 حزمة الصوت ${langLabel} أوفلاين غير مثبتة — فعّل Google Speech Services وحمّل اللغة (${lang}) من إعدادات أندرويد.`;

  document.body.appendChild(toast);
  window.setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 5000);
}

function loadWebVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  try {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      cachedVoices = immediate;
      return Promise.resolve(immediate);
    }
  } catch {
    return Promise.resolve([]);
  }

  if (voicesReadyPromise) {
    return voicesReadyPromise;
  }

  voicesReadyPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let settled = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      cachedVoices = voices;
      voicesReadyPromise = null;
      resolve(voices);
    };

    const timer = window.setTimeout(() => {
      try {
        finish(window.speechSynthesis.getVoices() || cachedVoices);
      } catch {
        finish(cachedVoices);
      }
    }, 600);

    const onVoicesChanged = () => {
      try {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          window.clearTimeout(timer);
          window.speechSynthesis.removeEventListener?.('voiceschanged', onVoicesChanged);
          finish(list);
        }
      } catch {
        window.clearTimeout(timer);
        finish(cachedVoices);
      }
    };

    try {
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      } else {
        window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      }
    } catch {
      window.clearTimeout(timer);
      finish(cachedVoices);
    }
  });

  return voicesReadyPromise;
}

export function pickWebVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: string,
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;

  const normTarget = targetLang.toLowerCase().replace('_', '-');
  const prefix = normTarget.split('-')[0];

  if (preferredVoiceName && preferredVoiceName !== 'cloud-ai') {
    const preferred = voices.find(
      (v) =>
        v.name === preferredVoiceName &&
        (v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix)
    );
    if (preferred) return preferred;
  }

  const matching = voices.filter((v) => {
    const vLang = (v.lang || '').toLowerCase().replace('_', '-');
    return vLang.startsWith(prefix);
  });

  if (matching.length === 0) return undefined;

  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  const score = (v: SpeechSynthesisVoice): number => {
    const vLang = (v.lang || '').toLowerCase().replace('_', '-');
    let s = 0;
    if (vLang === normTarget) s += 40;
    if (isOffline) {
      s += v.localService ? 100 : -100;
    } else {
      if (/google|natural|neural|anna|petra|markus|helena|katja|conrad/i.test(v.name)) s += 30;
      if (v.localService) s += 10;
    }
    return s;
  };

  return [...matching].sort((a, b) => score(b) - score(a))[0];
}

export async function speakWithWebSpeech(options: UnifiedSpeakOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return false;
  }

  const clean = options.text.trim();
  if (!clean) {
    options.onEnd?.();
    return false;
  }

  const resolvedLang = normalizeTtsLang(options.lang, clean);
  const clampedRate = Math.max(0.5, Math.min(1.5, options.rate ?? 1.0));

  try {
    const voices = await loadWebVoices();

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();
    } catch {
      /* ignore */
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = resolvedLang;
    utterance.rate = clampedRate;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    const chosenVoice = pickWebVoice(voices, resolvedLang, options.preferredVoiceName);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || resolvedLang;
    } else if (typeof navigator !== 'undefined' && navigator.onLine === false && voices.length > 0) {
      showMissingVoiceToast(resolvedLang);
    }

    if (options.onBoundary) {
      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        options.onBoundary?.(e.charIndex);
      };
    }
    utterance.onend = () => {
      options.onEnd?.();
    };
    utterance.onerror = () => {
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('[offlineTts] Web Speech error:', err);
    options.onEnd?.();
    return false;
  }
}

async function resolveNativeSupportedLang(requestedLang: string): Promise<string | null> {
  const baseLang = requestedLang.split('-')[0].toLowerCase();

  try {
    const exact = await TextToSpeech.isLanguageSupported({ lang: requestedLang });
    if (exact?.supported) return requestedLang;
  } catch {
    /* fall through to base check */
  }

  if (baseLang && baseLang !== requestedLang.toLowerCase()) {
    try {
      const baseCheck = await TextToSpeech.isLanguageSupported({ lang: baseLang });
      if (baseCheck?.supported) return baseLang;
    } catch {
      /* fall through to list check */
    }
  }

  try {
    const { languages } = await TextToSpeech.getSupportedLanguages();
    if (Array.isArray(languages) && languages.length > 0) {
      const exactMatch = languages.find(
        (l) => l.toLowerCase().replace('_', '-') === requestedLang.toLowerCase()
      );
      if (exactMatch) return exactMatch;

      const prefixMatch = languages.find((l) =>
        l.toLowerCase().replace('_', '-').startsWith(baseLang)
      );
      if (prefixMatch) return prefixMatch;
    }
  } catch {
    /* ignore */
  }

  return null;
}

export async function stopUnifiedTts(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.stop();
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Primary unified TTS entrypoint for Web, PWA, Android, and iOS.
 */
export async function speakUnified(options: UnifiedSpeakOptions): Promise<boolean> {
  const clean = (options.text || '').trim();
  if (!clean) {
    options.onEnd?.();
    return false;
  }

  const resolvedLang = normalizeTtsLang(options.lang, clean);
  const clampedRate = Math.max(0.5, Math.min(1.5, options.rate ?? 1.0));

  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.stop().catch(() => {});

      const supportedLang = await resolveNativeSupportedLang(resolvedLang);
      if (!supportedLang) {
        showMissingVoiceToast(resolvedLang);
        if (typeof navigator === 'undefined' || navigator.onLine !== false) {
          return speakWithWebSpeech({ ...options, lang: resolvedLang, rate: clampedRate });
        }
        options.onEnd?.();
        return false;
      }

      await TextToSpeech.speak({
        text: clean,
        lang: supportedLang,
        rate: clampedRate,
        pitch: options.pitch ?? 1.0,
        volume: options.volume ?? 1.0,
        category: 'ambient',
      });
      options.onEnd?.();
      return true;
    } catch (err) {
      console.warn('[offlineTts] Native TTS error:', err);
      showMissingVoiceToast(resolvedLang);
      if (typeof navigator === 'undefined' || navigator.onLine !== false) {
        return speakWithWebSpeech({ ...options, lang: resolvedLang, rate: clampedRate });
      }
      options.onEnd?.();
      return false;
    }
  }

  return speakWithWebSpeech({ ...options, lang: resolvedLang, rate: clampedRate });
}

// Pre-warm voices on browser load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  void loadWebVoices();
}
