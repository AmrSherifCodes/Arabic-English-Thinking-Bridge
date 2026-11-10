import { useState, useCallback, useEffect } from 'react';

const EASTER_EGG_KEY = 'tb.amrClickCount';

export function useAmrClickEasterEgg() {
  const [clickCount, setClickCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(EASTER_EGG_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [showErwinModal, setShowErwinModal] = useState(false);
  const [showAlexandrianModal, setShowAlexandrianModal] = useState(false);

  const registerClick = useCallback(() => {
    setClickCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(EASTER_EGG_KEY, next.toString());
      } catch {
        /* noop */
      }
      if (next === 99 || (next > 0 && next % 99 === 0)) {
        setShowErwinModal(true);
      } else if (next === 7 || next === 21) {
        setShowAlexandrianModal(true);
      }
      return next;
    });
  }, []);

  // Global event listener on any image of Amr (e.g. amr.jpg, amr-avatar.png, pose1.png)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const src = (target as HTMLImageElement).src || '';
      const alt = (target as HTMLImageElement).alt || '';
      if (
        src.includes('amr') ||
        src.includes('pose') ||
        alt.toLowerCase().includes('amr') ||
        target.closest('[data-amr-avatar="true"]')
      ) {
        registerClick();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [registerClick]);

  const closeErwinModal = useCallback(() => {
    setShowErwinModal(false);
  }, []);

  const closeAlexandrianModal = useCallback(() => {
    setShowAlexandrianModal(false);
  }, []);

  return {
    clickCount,
    registerClick,
    showErwinModal,
    closeErwinModal,
    showAlexandrianModal,
    closeAlexandrianModal,
  };
}
