import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../utils/api';

/**
 * Hook to manage concurrent presence (live visitors) counting.
 * Zen of Python: Flat is better than nested. Simple is better than complex.
 */
export function usePresence() {
  const [liveCount, setLiveCount] = useState<number>(1);
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate an ephemeral, privacy-friendly UUID for this session (never stored on disk)
    if (!clientIdRef.current) {
      clientIdRef.current = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    }

    let isMounted = true;
    let timer: number | null = null;

    const pingPresence = async () => {
      if (!isMounted) return;
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

      if (isMounted) {
        timer = window.setTimeout(pingPresence, 25000); // Ping every 25 seconds
      }
    };

    pingPresence();

    return () => {
      isMounted = false;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return { liveCount };
}
