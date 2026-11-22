import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../utils/api';

const PRESENCE_POLL_INTERVAL_MS = 60_000;

/**
 * Hook to manage concurrent presence (live visitors) counting.
 * Pauses polling when the document tab is hidden to conserve serverless quota.
 */
export function usePresence() {
  const [liveCount, setLiveCount] = useState<number>(1);
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate an ephemeral, privacy-friendly UUID for this session (never stored on disk)
    if (!clientIdRef.current) {
      clientIdRef.current = typeof crypto !== 'undefined' && crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    }

    let isMounted = true;
    let timer: number | null = null;
    const isDocumentHidden = () => typeof document !== 'undefined' && document.hidden;

    const clearTimer = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const pingPresence = async () => {
      if (!isMounted || isDocumentHidden()) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: clientIdRef.current }),
        });

        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === 'number' && isMounted) {
            setLiveCount(data.count);
          }
        }
      } catch (err) {
        // Errors should never pass silently, but we don't want to crash the UI.
        console.warn('Live visitor ping failed:', err);
      }

      if (isMounted && !isDocumentHidden()) {
        clearTimer();
        timer = window.setTimeout(() => {
          void pingPresence();
        }, PRESENCE_POLL_INTERVAL_MS);
      }
    };

    const handleVisibilityChange = () => {
      if (isDocumentHidden()) {
        clearTimer();
        return;
      }
      if (isMounted) {
        clearTimer();
        void pingPresence();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (!isDocumentHidden()) {
      void pingPresence();
    }

    return () => {
      isMounted = false;
      clearTimer();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  return { liveCount };
}
