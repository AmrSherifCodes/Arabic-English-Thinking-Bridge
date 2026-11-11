import { Capacitor } from '@capacitor/core';

// @ts-ignore
let smolPipeline: any = null;
let isLoading = false;
let modelFailed = false;

export async function loadModel(): Promise<boolean> {
  try {
    let isNative = false;
    try {
      isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
    } catch {
      isNative = false;
    }

    // Web constraint: NEVER load transformers.js or ONNX on Web (0 MB on web)
    if (!isNative) {
      return false;
    }

    if (smolPipeline) return true;
    if (modelFailed) return false;

    if (isLoading) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (smolPipeline) {
            clearInterval(check);
            resolve(true);
          } else if (modelFailed) {
            clearInterval(check);
            resolve(false);
          }
        }, 100);
      });
    }

    isLoading = true;

    let transformersModule: any = null;
    try {
      const moduleName = '@huggingface/transformers';
      transformersModule = await import(/* @vite-ignore */ moduleName);
    } catch (importErr) {
      console.warn('Failed to dynamically import @huggingface/transformers:', importErr);
      modelFailed = true;
      return false;
    }

    if (!transformersModule || !transformersModule.pipeline) {
      modelFailed = true;
      return false;
    }

    const { pipeline, env } = transformersModule;

    if (env) {
      env.allowRemoteModels = false;
      env.localModelPath = 'models/';
    }

    smolPipeline = await pipeline('text-generation', 'smollm2-135m', {
      dtype: 'q4',
    });
    return true;
  } catch (err) {
    console.warn('Failed to load local Android model smollm2-135m, falling back to rule-based bank:', err);
    modelFailed = true;
    return false;
  } finally {
    isLoading = false;
  }
}

export async function generateResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
): Promise<string> {
  try {
    if (!smolPipeline) {
      return '';
    }

    const out = await smolPipeline(messages, {
      max_new_tokens: 100,
      temperature: 0.6,
      do_sample: true,
    });

    // Output format depends on Transformers.js version.
    if (Array.isArray(out) && out[0] && Array.isArray(out[0].generated_text)) {
      const generatedMessages = out[0].generated_text;
      return generatedMessages[generatedMessages.length - 1].content;
    } else if (Array.isArray(out) && out[0] && out[0].generated_text) {
      return out[0].generated_text;
    }

    return '';
  } catch (err) {
    console.warn('generateResponse failed, returning empty fallback:', err);
    return '';
  }
}

export function isModelLoaded() {
  return !!smolPipeline;
}

