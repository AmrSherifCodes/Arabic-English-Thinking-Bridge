// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  AVATAR_FRAME_MAP,
  ChestReward,
  ChestTier,
  openMilestoneChest,
} from './economy';
import { THEME_MAP } from './themeStore';

interface ChestModalProps {
  isOpen: boolean;
  chestId: string | null;
  tier: ChestTier;
  isPro?: boolean;
  isArabic?: boolean;
  onClose: () => void;
  onClaimed?: (reward: ChestReward) => void;
}

const CHEST_META: Record<
  ChestTier,
  {
    nameAr: string;
    nameEn: string;
    bodyFill: string;
    lidFill: string;
    trimFill: string;
    badgeBg: string;
  }
> = {
  wooden: {
    nameAr: 'صندوق خشبي',
    nameEn: 'Wooden Chest',
    bodyFill: '#92400E',
    lidFill: '#B45309',
    trimFill: '#F59E0B',
    badgeBg: 'rgba(180, 83, 9, 0.18)',
  },
  silver: {
    nameAr: 'صندوق فضي',
    nameEn: 'Silver Chest',
    bodyFill: '#475569',
    lidFill: '#64748B',
    trimFill: '#E2E8F0',
    badgeBg: 'rgba(148, 163, 184, 0.2)',
  },
  golden: {
    nameAr: 'صندوق ذهبي',
    nameEn: 'Golden Chest',
    bodyFill: '#B45309',
    lidFill: '#D97706',
    trimFill: '#FDE047',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
  },
  crown: {
    nameAr: 'صندوق التاج الأسطوري',
    nameEn: 'Crown Chest',
    bodyFill: '#581C87',
    lidFill: '#7E22CE',
    trimFill: '#FACC15',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
  },
};

export function ChestModal({
  isOpen,
  chestId,
  tier,
  isPro = false,
  isArabic = true,
  onClose,
  onClaimed,
}: ChestModalProps) {
  const [phase, setPhase] = useState<'ready' | 'shaking' | 'revealed'>('ready');
  const [reward, setReward] = useState<ChestReward | null>(null);
  const [alreadyOpened, setAlreadyOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhase('ready');
      setReward(null);
      setAlreadyOpened(false);
    }
  }, [isOpen, chestId]);

  if (!isOpen || !chestId) return null;

  const meta = CHEST_META[tier];

  const handleTapChest = () => {
    if (phase !== 'ready') return;
    setPhase('shaking');

    window.setTimeout(() => {
      const result = openMilestoneChest(chestId, tier, isPro);
      if (result.alreadyOpened) {
        setAlreadyOpened(true);
        setPhase('revealed');
        return;
      }
      if (result.ok && result.reward) {
        setReward(result.reward);
        setPhase('revealed');
        onClaimed?.(result.reward);
      } else {
        setPhase('ready');
      }
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pt-safe pb-safe"
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? meta.nameAr : meta.nameEn}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
          className="absolute top-3 end-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl border cursor-pointer"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--ink-muted)',
          }}
        >
          <X size={20} />
        </button>

        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-3 border"
          style={{
            backgroundColor: meta.badgeBg,
            borderColor: meta.trimFill,
            color: 'var(--ink)',
          }}
        >
          <Sparkles size={14} />
          <span>{isArabic ? meta.nameAr : meta.nameEn}</span>
        </div>

        {/* Lightweight inline SVG chest with pure CSS shake & pop */}
        <div className="my-4 flex justify-center">
          <button
            type="button"
            onClick={handleTapChest}
            disabled={phase !== 'ready'}
            aria-label={isArabic ? 'افتح الصندوق' : 'Open Chest'}
            className={`relative p-3 rounded-3xl transition-transform cursor-pointer focus-visible:outline-2 ${
              phase === 'shaking'
                ? 'tb-chest-shaking'
                : phase === 'revealed'
                ? 'tb-chest-revealed'
                : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              backgroundColor: 'var(--accent-soft)',
              border: '2px solid var(--gold)',
            }}
          >
            <svg
              width="104"
              height="92"
              viewBox="0 0 104 92"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Chest Lid */}
              <rect
                x="10"
                y={phase === 'revealed' ? '6' : '16'}
                width="84"
                height="28"
                rx="10"
                fill={meta.lidFill}
                stroke={meta.trimFill}
                strokeWidth="3.5"
              />
              {/* Chest Body */}
              <rect
                x="12"
                y="42"
                width="80"
                height="40"
                rx="8"
                fill={meta.bodyFill}
                stroke={meta.trimFill}
                strokeWidth="3.5"
              />
              {/* Horizontal Gold Band */}
              <rect x="12" y="39" width="80" height="8" fill={meta.trimFill} />
              {/* Center Lock */}
              <rect
                x="44"
                y="34"
                width="16"
                height="22"
                rx="4"
                fill={meta.trimFill}
                stroke="#0B1220"
                strokeWidth="2"
              />
              <circle cx="52" cy="45" r="3" fill="#0B1220" />
            </svg>
          </button>
        </div>

        {phase !== 'revealed' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-black" style={{ color: 'var(--ink)' }}>
              {phase === 'shaking'
                ? isArabic
                  ? 'جاري فتح الصندوق...'
                  : 'Opening Chest...'
                : isArabic
                ? 'مبروك! وصلت لمحطة الكنز 🎁'
                : 'Milestone Chest Unlocked! 🎁'}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {isArabic
                ? 'اضغط على الصندوق عشان تستلم عملات الجسر ودروع حماية السلسلة!'
                : 'Tap the chest to claim Bridge Coins, Streak Shields, and exclusive rewards!'}
            </p>
            <button
              type="button"
              onClick={handleTapChest}
              disabled={phase === 'shaking'}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl font-black text-sm cursor-pointer transition active:scale-95"
              style={{
                backgroundColor: 'var(--gold)',
                color: '#0B1220',
              }}
            >
              {isArabic ? '🎁 افتح الصندوق الآن' : '🎁 Tap to Open Chest'}
            </button>
          </div>
        ) : alreadyOpened ? (
          <div className="space-y-4">
            <p className="text-sm font-bold" style={{ color: 'var(--ink-muted)' }}>
              {isArabic ? 'لقد فتحت هذا الصندوق من قبل!' : 'You already opened this chest!'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl font-black text-sm cursor-pointer"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              {isArabic ? 'العودة للخريطة' : 'Back to Map'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-black" style={{ color: 'var(--ink)' }}>
              {isArabic ? '🎉 غنائم الصندوق!' : '🎉 Chest Rewards!'}
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--gold)',
                }}
              >
                <span className="text-2xl block">🪙</span>
                <span className="text-base font-black block" style={{ color: 'var(--gold)' }}>
                  +{reward?.coins ?? 0}
                </span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic ? 'عملة الجسر' : 'Bridge Coins'}
                </span>
              </div>

              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--accent)',
                }}
              >
                <span className="text-2xl block">🛡️</span>
                <span className="text-base font-black block" style={{ color: 'var(--accent)' }}>
                  +{reward?.shields ?? 0}
                </span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic ? 'درع السلسلة' : 'Streak Shield'}
                </span>
              </div>
            </div>

            {reward?.unlockedFrame && (
              <div
                className="p-3 rounded-2xl border text-xs font-black"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  borderColor: 'var(--accent)',
                  color: 'var(--ink)',
                }}
              >
                {AVATAR_FRAME_MAP[reward.unlockedFrame]?.badge}{' '}
                {isArabic
                  ? `فتحت إطار جديد: ${AVATAR_FRAME_MAP[reward.unlockedFrame]?.nameAr}`
                  : `Unlocked Frame: ${AVATAR_FRAME_MAP[reward.unlockedFrame]?.nameEn}`}
              </div>
            )}

            {reward?.unlockedTheme && (
              <div
                className="p-3 rounded-2xl border text-xs font-black"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  borderColor: 'var(--gold)',
                  color: 'var(--ink)',
                }}
              >
                🎨{' '}
                {isArabic
                  ? `فتحت ثيم جديد: ${THEME_MAP[reward.unlockedTheme]?.nameAr}`
                  : `Unlocked Theme: ${THEME_MAP[reward.unlockedTheme]?.nameEn}`}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl font-black text-sm cursor-pointer transition active:scale-95"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              {isArabic ? 'استلام والعودة للخريطة ✓' : 'Claim & Return to Map ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
