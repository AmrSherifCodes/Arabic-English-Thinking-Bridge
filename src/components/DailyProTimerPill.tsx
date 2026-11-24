// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';
import { BookOpen, Clock, KeyRound } from 'lucide-react';
import { formatRemainingTimer } from '../hooks/useDailyProTimer';

export interface DailyProTimerPillProps {
  visible: boolean;
  remainingSeconds: number;
  isArabic?: boolean;
  onClick?: () => void;
}

/**
 * Calm, non-intrusive corner pill shown ONLY to free users while actively
 * inside a Pro feature. Safe-area aware and positioned above bottom dock / below HUD.
 */
export const DailyProTimerPill: React.FC<DailyProTimerPillProps> = ({
  visible,
  remainingSeconds,
  isArabic = true,
  onClick,
}) => {
  if (!visible || remainingSeconds <= 0) return null;

  const formatted = formatRemainingTimer(remainingSeconds);
  const isLow = remainingSeconds <= 120;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="off"
      aria-label={
        isArabic
          ? `متبقي ${formatted} من الـ 15 دقيقة المجانية اليومية`
          : `${formatted} remaining of your daily 15-minute free Pro pass`
      }
      className={`fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] end-3 z-[45] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md text-[11px] font-bold shadow-md transition active:scale-95 ${
        onClick ? 'cursor-pointer' : 'pointer-events-none'
      } ${
        isLow
          ? 'bg-amber-950/85 border-amber-400/45 text-amber-200'
          : 'bg-slate-900/80 border-teal-400/35 text-teal-200'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <span aria-hidden="true">⏱</span>
      <span dir="ltr" className="font-mono tabular-nums font-black">
        {formatted}
      </span>
      <span className="opacity-90">{isArabic ? 'مجاني' : 'Free'}</span>
    </button>
  );
};

export interface DailyProExpiredCardProps {
  isArabic?: boolean;
  onOpenActivateCode?: () => void;
  onBackToLessons?: () => void;
}

/**
 * Warm, respectful expiry card shown at 00:00 instead of a harsh paywall.
 */
export const DailyProExpiredCard: React.FC<DailyProExpiredCardProps> = ({
  isArabic = true,
  onOpenActivateCode,
  onBackToLessons,
}) => {
  return (
    <div
      className="p-5 rounded-3xl border space-y-4 text-start shadow-lg"
      style={{
        backgroundColor: 'var(--surface, #111827)',
        borderColor: 'rgba(45, 212, 191, 0.35)',
        color: 'var(--ink, #EEF2F5)',
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 text-xs font-black text-teal-400">
        <Clock size={16} className="shrink-0" />
        <span>
          {isArabic
            ? 'انتهت الـ 15 دقيقة المجانية للنهاردة'
            : "Today's 15 Free Pro Minutes Are Up"}
        </span>
      </div>

      <p className="text-sm font-bold leading-relaxed" style={{ color: 'var(--ink, #EEF2F5)' }}>
        {isArabic
          ? 'استخدمت الـ 15 دقيقة المجانية للنهاردة — هتتجدد تلقائياً بكرة! وتقدر تكمل الدروس الأساسية وملاذ القرآن مجاناً بلا حدود، أو تفعّل النسخة الكاملة بـ 50 ج/شهر.'
          : "You've used today's 15 free Pro minutes — they reset automatically tomorrow! Keep using core lessons & Quran Hifz free forever, or unlock unlimited Pro for 50 EGP/mo."}
      </p>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        {onOpenActivateCode && (
          <button
            type="button"
            onClick={onOpenActivateCode}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-md"
            style={{
              backgroundColor: 'var(--gold, #F59E0B)',
              color: 'var(--gold-ink, #0A0E13)',
            }}
          >
            <KeyRound size={16} className="shrink-0" />
            <span>
              {isArabic
                ? 'تفعيل النسخة الكاملة (50 ج/شهر)'
                : 'Unlock Unlimited Pro (50 EGP/mo)'}
            </span>
          </button>
        )}

        {onBackToLessons && (
          <button
            type="button"
            onClick={onBackToLessons}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl border font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--bg, #0A0E13)',
              borderColor: 'var(--border, rgba(255,255,255,0.14))',
              color: 'var(--ink, #EEF2F5)',
            }}
          >
            <BookOpen size={16} className="shrink-0" />
            <span>{isArabic ? 'العودة للدروس المجانية' : 'Back to Free Lessons'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
