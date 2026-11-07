import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

export interface OfflineSTTPlugin {
  init(options: { modelPath: string; sampleRate: number }): Promise<void>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  addListener(eventName: 'onPartialResult', listenerFunc: (result: { text: string }) => void): any;
  addListener(eventName: 'onFinalResult', listenerFunc: (result: { text: string }) => void): any;
}

const OfflineSTT = registerPlugin<OfflineSTTPlugin>('OfflineSTT');

export function useOfflineSpeech() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let partialListener: any;
    let finalListener: any;

    const initEngine = async () => {
      try {
        await OfflineSTT.init({ modelPath: 'models/vosk-model-small-ar-mgb2', sampleRate: 16000 });
        setIsReady(true);

        partialListener = await OfflineSTT.addListener('onPartialResult', (res: any) => {
          setTranscript(res.text);
        });

        finalListener = await OfflineSTT.addListener('onFinalResult', (res: any) => {
          setTranscript(res.text);
          setIsListening(false);
        });
      } catch (err) {
        console.error('Failed to init Offline STT:', err);
      }
    };

    initEngine();

    return () => {
      if (partialListener) partialListener.remove();
      if (finalListener) finalListener.remove();
    };
  }, []);

  const startListening = async () => {
    if (!isReady || !Capacitor.isNativePlatform()) return;
    try {
      setTranscript('');
      setIsListening(true);
      await OfflineSTT.startListening();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!isReady || !Capacitor.isNativePlatform()) return;
    try {
      await OfflineSTT.stopListening();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  return { transcript, isListening, startListening, stopListening, isReady };
}
