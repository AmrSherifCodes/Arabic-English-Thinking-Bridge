/**
 * German Dual-Speed Text-To-Speech (TTS) Engine
 */

let selectedGermanVoice: SpeechSynthesisVoice | null = null;

function getGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Prefer Google Deutsch or high quality German voices
  const googleGerman = voices.find(
    (v) => (v.lang.startsWith('de') || v.lang === 'de-DE') && v.name.includes('Google')
  );
  if (googleGerman) return googleGerman;

  // 2. Prefer any de-DE voice
  const deDeVoice = voices.find((v) => v.lang === 'de-DE');
  if (deDeVoice) return deDeVoice;

  // 3. Prefer any German-locale voice
  const deVoice = voices.find((v) => v.lang.startsWith('de'));
  if (deVoice) return deVoice;

  return null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    selectedGermanVoice = getGermanVoice();
  };
}

/**
 * Speaks German text at normal (1.0x) or slow/clear (0.75x) speed.
 */
export function speakGerman(text: string, speed: 1.0 | 0.75 = 1.0): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    // Cancel previous audio to avoid queue overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = speed === 0.75 ? 0.72 : 1.0;
    utterance.pitch = 1.0;

    const voice = selectedGermanVoice || getGermanVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Fail gracefully without interrupting UI flow
  }
}
