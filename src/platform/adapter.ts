export type PlatformOS = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';

export interface PlatformInfo {
  os: PlatformOS;
  isPWA: boolean;
  isCapacitor: boolean;
  isTauri: boolean;
}

interface ExtendedWindow extends Window {
  Capacitor?: { isNativePlatform?: () => boolean };
  __TAURI_INTERNALS__?: unknown;
  __TAURI__?: unknown;
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
}

interface ExtendedNavigator extends Navigator {
  userAgentData?: { platform?: string };
}

function getWindow(): ExtendedWindow | undefined {
  return typeof window === 'undefined' ? undefined : window as ExtendedWindow;
}

function getNavigator(): ExtendedNavigator | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator as ExtendedNavigator;
}

export function getPlatformInfo(): PlatformInfo {
  const browserWindow = getWindow();
  if (!browserWindow) {
    return { os: 'web', isPWA: false, isCapacitor: false, isTauri: false };
  }
  const browserNavigator = getNavigator();
  const userAgent = browserNavigator?.userAgent || '';
  const platform = browserNavigator?.userAgentData?.platform || browserNavigator?.platform || '';
  const isIPadOS = platform === 'MacIntel' && (browserNavigator?.maxTouchPoints || 0) > 1;

  let os: PlatformOS = 'web';
  if (/android/i.test(userAgent) || /android/i.test(platform)) {
    os = 'android';
  } else if (/iphone|ipad|ipod/i.test(userAgent) || /^ios$/i.test(platform) || isIPadOS) {
    os = 'ios';
  } else if (/win/i.test(platform) || /windows/i.test(userAgent)) {
    os = 'windows';
  } else if (/mac/i.test(platform) || /macintosh/i.test(userAgent)) {
    os = 'macos';
  } else if (/linux/i.test(platform) || /linux/i.test(userAgent)) {
    os = 'linux';
  }

  let isPWA = false;
  try {
    isPWA = browserWindow?.matchMedia('(display-mode: standalone)').matches ?? false;
  } catch {
    isPWA = false;
  }

  let isCapacitor = false;
  try {
    isCapacitor = Boolean(browserWindow?.Capacitor?.isNativePlatform?.());
  } catch {
    isCapacitor = false;
  }

  return {
    os,
    isPWA,
    isCapacitor,
    isTauri: Boolean(browserWindow?.__TAURI_INTERNALS__ || browserWindow?.__TAURI__),
  };
}

const memoryStorage = new Map<string, string>();

function getLocalStorage(): Storage | undefined {
  try {
    return getWindow()?.localStorage;
  } catch {
    return undefined;
  }
}

export const storageAdapter = {
  getItem(key: string): string | null {
    try {
      const value = getLocalStorage()?.getItem(key);
      if (value !== null && value !== undefined) {
        memoryStorage.set(key, value);
        return value;
      }
    } catch {
      return memoryStorage.get(key) ?? null;
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    memoryStorage.set(key, value);
    try {
      getLocalStorage()?.setItem(key, value);
    } catch {
      // Keep the in-memory copy when storage is unavailable or full.
    }
  },

  removeItem(key: string): void {
    memoryStorage.delete(key);
    try {
      getLocalStorage()?.removeItem(key);
    } catch {
      // Memory fallback is already cleared.
    }
  },
};

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export interface ShareStatus {
  method: 'native' | 'clipboard' | 'unsupported';
  ok: boolean;
}

export async function shareAdapter(payload: SharePayload): Promise<ShareStatus> {
  const browserNavigator = getNavigator();
  if (!browserNavigator) return { method: 'unsupported', ok: false };

  if (typeof browserNavigator.share === 'function') {
    try {
      await browserNavigator.share(payload);
      return { method: 'native', ok: true };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { method: 'native', ok: false };
      }
    }
  }

  try {
    if (!browserNavigator.clipboard?.writeText) return { method: 'unsupported', ok: false };
    await browserNavigator.clipboard.writeText(payload.url);
    return { method: 'clipboard', ok: true };
  } catch {
    return { method: 'unsupported', ok: false };
  }
}

export interface SpeechCapabilities {
  sttSupported: boolean;
  ttsSupported: boolean;
  isNative: boolean;
}

export function getSpeechCapabilities(): SpeechCapabilities {
  const browserWindow = getWindow();
  const browserNavigator = getNavigator();
  const platform = getPlatformInfo();
  const hasWebSpeechRecognition = Boolean(
    browserWindow?.SpeechRecognition || browserWindow?.webkitSpeechRecognition
  );
  const hasRecordingFallback = Boolean(
    browserNavigator?.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
  );

  return {
    sttSupported: platform.isCapacitor || hasWebSpeechRecognition || hasRecordingFallback,
    ttsSupported: Boolean(
      browserWindow && ('speechSynthesis' in browserWindow || typeof Audio !== 'undefined')
    ),
    isNative: platform.isCapacitor,
  };
}

export const speechAdapter = { getSpeechCapabilities };