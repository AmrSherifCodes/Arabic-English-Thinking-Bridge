import { useState, useCallback } from 'react';
import { speakUnified, stopUnifiedTts } from '../utils/offlineTts';

export function useWebSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    setIsSpeaking(true);
    void speakUnified({
      text,
      lang,
      rate: 1.0,
      onEnd: () => setIsSpeaking(false),
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    void stopUnifiedTts();
    setIsSpeaking(false);
  }, []);

  const listen = useCallback((lang: string = 'en-US'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!recognition) {
        reject(new Error('Speech recognition not supported in this browser.'));
        return;
      }

      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(event.error);
      };

      recognition.start();
    });
  }, [recognition]);

  return { speak, stopSpeaking, isSpeaking, listen, isSupported: true };
}
