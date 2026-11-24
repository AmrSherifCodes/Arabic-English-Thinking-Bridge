import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import {
  ACHIEVEMENT_UNLOCKED_EVENT,
  AchievementRarity,
  SteamAchievement,
} from './achievements';

interface AchievementToastProps {
  isArabic?: boolean;
}

const RARITY_STYLES: Record<
  AchievementRarity,
  { border: string; badge: string; glow: string; labelAr: string }
> = {
  Common: {
    border: 'border-slate-400/50',
    badge: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
    glow: 'shadow-[0_12px_36px_rgba(148,163,184,0.22)]',
    labelAr: 'شائع',
  },
  Rare: {
    border: 'border-cyan-400/60',
    badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    glow: 'shadow-[0_12px_36px_rgba(34,211,238,0.28)]',
    labelAr: 'نادر',
  },
  Epic: {
    border: 'border-purple-400/65',
    badge: 'bg-purple-500/20 text-purple-200 border-purple-400/45',
    glow: 'shadow-[0_12px_36px_rgba(192,132,252,0.32)]',
    labelAr: 'ملحمي',
  },
  Legendary: {
    border: 'border-amber-400/80',
    badge: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
    glow: 'shadow-[0_12px_40px_rgba(251,191,36,0.38)]',
    labelAr: 'أسطوري',
  },
};

export function AchievementToast({ isArabic = true }: AchievementToastProps) {
  const [queue, setQueue] = useState<SteamAchievement[]>([]);

  useEffect(() => {
    const handleUnlock = (event: Event) => {
      const detail = (event as CustomEvent<SteamAchievement>).detail;
      if (!detail || !detail.id) return;
      setQueue((prev) => (prev.some((item) => item.id === detail.id) ? prev : [...prev, detail]));
    };

    window.addEventListener(ACHIEVEMENT_UNLOCKED_EVENT, handleUnlock);
    return () => window.removeEventListener(ACHIEVEMENT_UNLOCKED_EVENT, handleUnlock);
  }, []);

  const current = queue[0] || null;

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, 4400);
    return () => window.clearTimeout(timer);
  }, [current]);

  if (!current) return null;

  const style = RARITY_STYLES[current.rarity];

  return (
    <div
      role="status"
      aria-live="polite"
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed top-[calc(3.75rem+env(safe-area-inset-top,0px))] end-3 sm:end-5 z-[55] w-[calc(100vw-1.5rem)] max-w-sm pointer-events-auto animate-in slide-in-from-top duration-300"
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#0B1220]/95 backdrop-blur-xl border-2 ${style.border} ${style.glow} p-3 flex items-center gap-2.5`}
      >
        <div className="w-11 h-11 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center text-2xl shrink-0">
          {current.icon}
        </div>

        <div className="min-w-0 flex-1 text-start">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
              <Trophy className="w-3 h-3 shrink-0" />
              <span>{isArabic ? 'تم فتح إنجاز جديد!' : 'Achievement Unlocked!'}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border ${style.badge}`}>
              {isArabic ? style.labelAr : current.rarity}
            </span>
          </div>

          <p className="text-sm font-black text-white break-words leading-snug mt-0.5">
            {isArabic ? current.titleAr : current.titleEn}
          </p>

          <div className="flex items-center justify-between gap-2 flex-wrap mt-0.5">
            <p className="text-[11px] text-stone-200 break-words leading-snug">
              {isArabic ? current.descAr : current.descEn}
            </p>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-emerald-300 shrink-0">
              <Sparkles className="w-3 h-3" />+{current.xpReward} XP
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setQueue((prev) => prev.slice(1))}
          aria-label={isArabic ? 'إغلاق الإشعار' : 'Dismiss'}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition cursor-pointer shrink-0 self-start"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
