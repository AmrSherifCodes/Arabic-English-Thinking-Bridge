export interface STTModelConfig {
  language: string;
  modelPath: string;
  sampleRate: number;
}

export const STT_CONFIG: Record<string, STTModelConfig> = {
  ar: { language: 'ar', modelPath: 'models/vosk-model-small-ar-mgb2', sampleRate: 16000 },
  en: { language: 'en', modelPath: 'models/vosk-model-small-en-us', sampleRate: 16000 },
};

// 1-Line Config Change to switch target acoustic model:
export const ACTIVE_STT_LANG: keyof typeof STT_CONFIG = 'ar';
