import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_LIMIT_MS = 30 * 60 * 1000; const STORAGE_KEY = 'tb.timeLimit.v1'; const SAVE_EVERY_MS = 5000;
interface Stored { usedMs: number; unlocked: boolean; }
interface Options { limitMs?: number; permanentUnlock?: boolean; }
let memoryStore: Stored = { usedMs: 0, unlocked: false };

function read(): Stored {
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return memoryStore; const p = JSON.parse(raw) as Partial<Stored>;
    return { usedMs: Math.max(0, Number(p.usedMs) || 0), unlocked: p.unlocked === true }; } catch { return memoryStore; }
}
function write(s: Stored) { memoryStore = s; try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

export function useTimeLimit({ limitMs = DEFAULT_LIMIT_MS, permanentUnlock = false }: Options = {}) {
  const [usedMs, setUsedMs] = useState(() => read().usedMs);
  const [unlocked, setUnlocked] = useState(() => read().unlocked);
  const usedRef = useRef(usedMs); const unlockedRef = useRef(unlocked); const lastTickRef = useRef(Date.now()); const lastSaveRef = useRef(0);
  const limitReached = usedMs >= limitMs; const isBlocked = !unlocked && limitReached;

  const save = useCallback(() => { lastSaveRef.current = Date.now(); write({ usedMs: Math.floor(usedRef.current), unlocked: unlockedRef.current }); }, []);

  useEffect(() => {
    if (unlocked || limitReached) return; lastTickRef.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now(); const delta = Math.min(now - lastTickRef.current, 2000); lastTickRef.current = now;
      if (document.visibilityState !== 'visible') return;
      usedRef.current += delta; setUsedMs(usedRef.current);
      if (usedRef.current >= limitMs || now - lastSaveRef.current >= SAVE_EVERY_MS) save();
    }, 1000);
    return () => window.clearInterval(id);
  }, [unlocked, limitReached, limitMs, save]);

  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'hidden') save(); else lastTickRef.current = Date.now(); };
    document.addEventListener('visibilitychange', onVisibility); window.addEventListener('pagehide', save);
    return () => { document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('pagehide', save); save(); };
  }, [save]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return; const s = read(); usedRef.current = s.usedMs; unlockedRef.current = s.unlocked; setUsedMs(s.usedMs); setUnlocked(s.unlocked);
    };
    window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage);
  }, []);

  const unlock = useCallback(() => {
    usedRef.current = 0; 
    unlockedRef.current = permanentUnlock; 
    lastTickRef.current = Date.now(); 
    setUsedMs(0); 
    setUnlocked(permanentUnlock); 
    save();
  }, [permanentUnlock, save]);

  return { isBlocked, usedMs, remainingMs: unlocked ? Infinity : Math.max(0, limitMs - usedMs), unlock };
}
