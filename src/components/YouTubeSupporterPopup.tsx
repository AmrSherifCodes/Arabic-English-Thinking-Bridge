import React, { useEffect } from 'react';
import { X, Youtube, Sparkles, CheckCircle2 } from 'lucide-react';
import { openSafeExternalUrl } from '../utils/safeExternalUrl';
import {
  dismissSupporterPopupWithPromise,
  markSupporterSubscribed,
} from '../utils/youtubeSupporter';

interface YouTubeSupporterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@sciamrsherif';

export function YouTubeSupporterPopup({
  isOpen,
  onClose,
  isArabic = true,
}: YouTubeSupporterPopupProps) {
  const handleDismiss = () => {
    dismissSupporterPopupWithPromise();
    onClose();
  };

  const handleSubscribe = () => {
    openSafeExternalUrl(YOUTUBE_CHANNEL_URL);
    markSupporterSubscribed();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 pt-safe pb-safe bg-black/75 backdrop-blur-sm animate-in fade-in"
      dir={isArabic ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="yt-supporter-popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border-2 border-amber-400/60 bg-[#0B1C33] text-white shadow-[0_0_50px_rgba(251,191,36,0.22)] p-6 pt-14 space-y-5 text-center">
        {/* Big, unmistakable X button in the top corner */}
        <button
          type="button"
          onClick={handleDismiss}
          data-testid="yt-popup-close-x"
          aria-label={isArabic ? 'إغلاق — أوعد إني مشترك' : 'Close — I promise I am subscribed'}
          className="absolute top-3 end-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 border-2 border-white/40 text-white shadow-lg transition active:scale-95 cursor-pointer"
        >
          <X size={24} strokeWidth={3} />
        </button>

        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-lg">
          <Sparkles size={28} />
        </div>

        <div className="space-y-2">
          <h2 id="yt-supporter-popup-title" className="text-lg sm:text-xl font-black text-amber-300 leading-snug">
            {isArabic ? 'فكّر إنجليزي مجاني 100% للأبد ☀️' : 'Thinking Bridge is 100% Free Forever ☀️'}
          </h2>
          <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
            {isArabic
              ? 'عايز التطبيق ينوّر ويكمل مجاناً؟ اشترك في قناة @sciamrsherif — أو اضغط X وأنت بتوعد إنك مشترك بالفعل 😉'
              : "Want the app to stay bright & 100% free? Subscribe to @sciamrsherif — or tap X and promise you're already subscribed 😉"}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleSubscribe}
            data-testid="yt-popup-subscribe-btn"
            className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Youtube size={20} />
            <span>
              {isArabic ? 'اشترك في قناة @sciamrsherif على يوتيوب ↗' : 'Subscribe to @sciamrsherif on YouTube ↗'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            data-testid="yt-popup-promise-btn"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-black text-sm transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>
              {isArabic ? 'أنا مشترك بالفعل (وعد!)' : "I'm already subscribed (promise!)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
