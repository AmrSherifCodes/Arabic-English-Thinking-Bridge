import React, { useEffect, useRef } from 'react';
import { Clock, Loader2, Youtube } from 'lucide-react';

const YOUTUBE_URL = 'https://www.youtube.com/@SciAmrSherif?sub_confirmation=1';

interface Props {
  isBlocked: boolean; onUnlock: () => void | Promise<void>;
  busy?: boolean; error?: string | null; hint?: string; youtubeUrl?: string;
}

export function BlockScreen({ isBlocked, onUnlock, busy = false, error = null, hint, youtubeUrl = YOUTUBE_URL }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isBlocked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [isBlocked]);

  if (!isBlocked) return null;

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const items = rootRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!items?.length) return;
    const first = items[0]; const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="block-title" onKeyDown={trapFocus}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/95 p-6 backdrop-blur-sm"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="w-full max-w-sm text-center text-white">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <Clock size={32} />
        </div>
        <h1 id="block-title" className="text-2xl font-bold">Time&apos;s Up!</h1>
        <p className="mt-2 text-lg text-slate-200">Please subscribe to continue.</p>
        <p className="mt-1 text-sm text-slate-400" dir="rtl">انتهى الوقت! اشترك للمتابعة</p>

        <div className="mt-8 flex flex-col gap-3">
          <a ref={firstRef} href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <Youtube size={20} /> Subscribe on YouTube
          </a>
          <button type="button" onClick={() => void onUnlock()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60">
            {busy && <Loader2 size={18} className="animate-spin" />} I&apos;ve Subscribed, Unlock App
          </button>
          {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
        </div>
      </div>
    </div>
  );
}
