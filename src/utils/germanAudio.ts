/**
 * German Dual-Speed Text-To-Speech (TTS) Engine
 * Delegates to the unified offline-first TTS engine (Capacitor native TTS + Web Speech).
 */
import { speakUnified } from './offlineTts';

/**
 * Speaks German text at normal (1.0x) or slow/clear (0.75x) speed.
 */
export function speakGerman(text: string, speed: 1.0 | 0.75 = 1.0): void {
  const clean = (text || '').trim();
  if (!clean) return;
  void speakUnified({
    text: clean,
    lang: 'de-DE',
    rate: speed,
    pitch: 1.0,
    volume: 1.0,
  });
}
