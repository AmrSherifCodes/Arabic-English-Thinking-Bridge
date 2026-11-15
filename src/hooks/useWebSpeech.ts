import { useState, useCallback, useRef } from 'react';

export function useWebSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!synth) return;

    synth.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, [synth]);

  const stopSpeaking = useCallback(() => {
    if (synth && isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth, isSpeaking]);

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

  return { speak, stopSpeaking, isSpeaking, listen, isSupported: !!synth && !!recognition };
}
