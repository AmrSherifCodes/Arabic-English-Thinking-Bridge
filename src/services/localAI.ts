import { Capacitor } from '@capacitor/core';
import { Gemma3n, DownloadProgressEvent } from 'capacitor-gemma-3n';

export interface LocalAIProgress {
  status: string;
  progress: number;
}

type ProgressListener = (status: LocalAIProgress) => void;

let isInitialized = false;
let isInitializing = false;
const listeners = new Set<ProgressListener>();

export function isLocalAIReady(): boolean {
  return isInitialized;
}

/**
 * Subscribe to model download / boot progress events.
 */
export function subscribeLocalAIProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyProgress(status: string, progress: number): void {
  const payload: LocalAIProgress = { status, progress };
  listeners.forEach(cb => {
    try {
      cb(payload);
    } catch (e) {
      console.warn('[localAI] Progress callback error:', e);
    }
  });
}

/**
 * Memory Safety Check:
 * Enforces a strict 3GB RAM minimum on devices before loading Gemma 3n.
 * On lower-end devices (< 3GB RAM), gracefully skips the model to prevent OOM/freezes.
 */
export async function checkDeviceMemorySafety(): Promise<{ safe: boolean; reason?: string }> {
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    const ramGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof ramGb === 'number' && ramGb < 3) {
      return {
        safe: false,
        reason: `Device RAM (${ramGb}GB) is below the 3GB minimum required for on-device Gemma SLM.`
      };
    }
  }

  try {
    const info = await Gemma3n.getModelInfo();
    const availMB = info?.deviceInfo?.availableMemoryMB;
    if (typeof availMB === 'number' && availMB > 0 && availMB < 3000) {
      return {
        safe: false,
        reason: `Available device memory (${Math.round(availMB)}MB) is under 3GB threshold.`
      };
    }
  } catch {
    // ModelInfo may not be ready prior to initialization
  }

  return { safe: true };
}

/**
 * Initialize on-device Gemma 3n model.
 * LAZY LOADED: ONLY called when user is offline and actively requests AI Tutor/Voice AI.
 */
export async function initLocalAI(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('On-device Gemma 3n AI is only supported on native Android devices.');
  }

  if (isInitialized) return true;
  if (isInitializing) return false;

  // Enforce 3GB RAM minimum check
  const mem = await checkDeviceMemorySafety();
  if (!mem.safe) {
    console.warn('[localAI] Memory check failed:', mem.reason);
    throw new Error(mem.reason);
  }

  isInitializing = true;
  try {
    notifyProgress('Checking device compatibility...', 10);
    const availability = await Gemma3n.isAvailable();
    if (!availability.available) {
      throw new Error(`Device not supported for local Gemma 3n: ${availability.message}`);
    }

    notifyProgress('Preparing on-device Gemma model...', 20);
    await Gemma3n.addListener('downloadProgress', (event: DownloadProgressEvent) => {
      const pct = event.progress ?? 0;
      notifyProgress(`Downloading model weights (${pct}%)...`, pct);
    });

    notifyProgress('Booting local Gemma 3n engine...', 60);
    const initResult = await Gemma3n.initialize({
      variant: 'e2b',
      maxTokens: 512,
      temperature: 0.7,
      topK: 40,
    });

    if (!initResult.success) {
      throw new Error(initResult.message || 'Failed to initialize local model.');
    }

    isInitialized = true;
    notifyProgress('Local AI model ready!', 100);
    return true;
  } catch (err) {
    notifyProgress(`Local AI initialization failed: ${err instanceof Error ? err.message : String(err)}`, 0);
    throw err;
  } finally {
    isInitializing = false;
  }
}

/**
 * Generate a tutor response using on-device Gemma 3n Small Language Model (SLM).
 */
export async function generateLocalTutorResponse(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('On-device Gemma 3n AI is only supported on native Android devices.');
  }

  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error('Prompt cannot be empty.');
  }

  if (!isInitialized) {
    await initLocalAI();
  }

  notifyProgress('Generating response with on-device Gemma 3n...', 80);

  const defaultSystemPrompt =
    'You are an offline English-Arabic thinking tutor. Explain grammar and vocabulary simply and concisely in under 3 sentences.';

  const response = await Gemma3n.generateText({
    prompt: cleanPrompt,
    systemPrompt: systemPrompt || defaultSystemPrompt,
    maxTokens: 512,
    temperature: 0.7,
  });

  notifyProgress('Done', 100);

  const text = (response?.text || '').trim();
  if (!text) {
    throw new Error('Local Gemma model returned an empty response.');
  }

  return text;
}
