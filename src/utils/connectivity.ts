import { Capacitor } from '@capacitor/core';

type ConnectivityListener = (online: boolean) => void;

let cachedOnline =
  typeof navigator === 'undefined' ? true : navigator.onLine !== false;
let initialized = false;
const listeners = new Set<ConnectivityListener>();

function setOnline(next: boolean): void {
  if (cachedOnline === next) return;
  cachedOnline = next;
  listeners.forEach((listener) => {
    try {
      listener(next);
    } catch (error) {
      console.warn('[connectivity] listener failed', error);
    }
  });
}

/**
 * Synchronous, zero-latency connectivity check.
 * Never probes the network (that would add lag to every AI call).
 */
export function isOnline(): boolean {
  return cachedOnline;
}

/** Test/entry-point helper for callers that already know the state. */
export function setOnlineState(next: boolean): void {
  setOnline(next);
}

/**
 * Resolves the current connectivity state, using the native Network plugin on
 * Capacitor builds so airplane mode is detected immediately.
 */
export async function refreshConnectivity(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Network } = await import('@capacitor/network');
      const status = await Network.getStatus();
      setOnline(Boolean(status.connected));
      return cachedOnline;
    } catch (error) {
      console.warn('[connectivity] native status unavailable', error);
    }
  }
  if (typeof navigator !== 'undefined') {
    setOnline(navigator.onLine !== false);
  }
  return cachedOnline;
}

export function subscribeConnectivity(listener: ConnectivityListener): () => void {
  listeners.add(listener);
  initConnectivity();
  return () => listeners.delete(listener);
}

/**
 * Starts listening for connectivity changes once. Safe to call many times.
 * Returns a cleanup function (mainly for tests).
 */
export function initConnectivity(): () => void {
  if (initialized) {
    return () => {};
  }
  initialized = true;

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
  }

  if (Capacitor.isNativePlatform()) {
    void import('@capacitor/network')
      .then(async ({ Network }) => {
        const status = await Network.getStatus();
        setOnline(Boolean(status.connected));
        await Network.addListener('networkStatusChange', (next) => {
          setOnline(Boolean(next.connected));
        });
      })
      .catch((error) => {
        console.warn('[connectivity] native listener unavailable', error);
      });
  }

  return () => {
    listeners.clear();
    initialized = false;
  };
}
