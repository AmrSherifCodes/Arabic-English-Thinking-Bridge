import { useState, useCallback, useEffect, useRef } from 'react';

const SESSION_CLICK_KEY = 'tb.amrSessionClickCount';
const INACTIVITY_RESET_MS = 6000;

export function useAmrClickEasterEgg() {
  const [clickCount, setClickCount] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem(SESSION_CLICK_KEY);
        return stored ? parseInt(stored, 10) : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [showPoemModal, setShowPoemModal] = useState(false);
  const [showErwinModal, setShowErwinModal] = useState(false);
  const [showAlexandrianModal, setShowAlexandrianModal] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setClickCount(0);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(SESSION_CLICK_KEY, '0');
        }
      } catch {}
    }, INACTIVITY_RESET_MS);
  }, []);

  const registerClick = useCallback(() => {
    resetInactivityTimer();
    setClickCount((prev) => {
      const next = prev + 1;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(SESSION_CLICK_KEY, next.toString());
        }
      } catch {}

      if (next === 99 || (next > 99 && next % 99 === 0)) {
        // 99-click Captain Erwin video checkpoint
        setShowErwinModal(true);
      } else if (next === 7 || next === 21) {
        // Coastal Alexandrian sea breeze easter egg
        setShowAlexandrianModal(true);
      }

      return next;
    });
  }, [resetInactivityTimer]);

  // Global listener for portrait clicks outside CV/Dev modals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastTapTime = 0;

    const isAmrTarget = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      if (target.closest('[data-cv-modal="true"]') || target.closest('[data-dev-modal="true"]')) {
        return false;
      }
      const src = (target as HTMLImageElement).src || '';
      const alt = (target as HTMLImageElement).alt || '';
      return (
        src.includes('amr') ||
        src.includes('pose') ||
        alt.toLowerCase().includes('amr') ||
        Boolean(target.closest('[data-amr-avatar="true"]'))
      );
    };

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (isAmrTarget(target)) {
        const now = Date.now();
        if (now - lastTapTime > 40) {
          lastTapTime = now;
          registerClick();
        }
      }
    };

    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [registerClick]);

  const closePoemModal = useCallback(() => setShowPoemModal(false), []);
  const closeErwinModal = useCallback(() => setShowErwinModal(false), []);
  const closeAlexandrianModal = useCallback(() => setShowAlexandrianModal(false), []);

  return {
    clickCount,
    registerClick,
    showPoemModal,
    closePoemModal,
    showErwinModal,
    closeErwinModal,
    showAlexandrianModal,
    closeAlexandrianModal,
  };
}
