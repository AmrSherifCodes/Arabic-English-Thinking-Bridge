// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useState } from 'react';
import { X, Check, Lock, Palette, Award } from 'lucide-react';
import {
  AVATAR_FRAMES,
  AvatarFrameId,
  equipAvatarFrame,
  purchaseAvatarFrame,
  purchaseThemeUnlock,
  useEconomy,
} from './economy';
import { ThemeId, useThemeStore } from './themeStore';

interface ThemeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
  isArabic?: boolean;
  onToast?: (msg: string) => void;
}

export function ThemeShopModal({
  isOpen,
  onClose,
  isPro = false,
  isArabic = true,
  onToast,
}: ThemeShopModalProps) {
  const [tab, setTab] = useState<'themes' | 'frames'>('themes');
  const { economy } = useEconomy();
  const { themeId, themes, selectTheme } = useThemeStore();

  if (!isOpen) return null;

  const handleThemeAction = (targetId: ThemeId) => {
    const isUnlocked = economy.unlockedThemes.includes(targetId);
    if (isUnlocked) {
      selectTheme(targetId);
      onToast?.(isArabic ? '🎨 تم تطبيق الثيم بنجاح' : '🎨 Theme equipped');
      return;
    }

    const res = purchaseThemeUnlock(targetId, isPro);
    if (res.ok) {
      onToast?.(isArabic ? '🎉 تم فتح وتفعيل الثيم!' : '🎉 Theme unlocked & equipped!');
    } else {
      onToast?.(
        isArabic
          ? '🪙 عملات الجسر غير كافية — أكمل الدروس وافتح الصناديق لكسب المزيد!'
          : '🪙 Not enough Bridge Coins — complete levels & chests to earn more!'
      );
    }
  };

  const handleFrameAction = (frameId: AvatarFrameId) => {
    const isUnlocked = economy.unlockedFrames.includes(frameId);
    if (isUnlocked) {
      equipAvatarFrame(frameId);
      onToast?.(isArabic ? '✨ تم تركيب الإطار' : '✨ Avatar frame equipped');
      return;
    }

    const res = purchaseAvatarFrame(frameId);
    if (res.ok) {
      onToast?.(isArabic ? '🎉 تم فتح وتركيب الإطار!' : '🎉 Avatar frame unlocked!');
    } else {
      onToast?.(
        isArabic
          ? '🪙 عملات الجسر غير كافية لهذا الإطار'
          : '🪙 Not enough Bridge Coins for this frame'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 pt-safe pb-safe"
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'متجر الثيمات والإطارات' : 'Themes & Frames Shop'}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 space-y-4 border shadow-2xl"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-start">
            <h2 className="text-lg font-black" style={{ color: 'var(--ink)' }}>
              {isArabic ? '🎨 متجر الثيمات والمظهر' : '🎨 Cosmetic Shop'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {isArabic
                ? 'خصص تجربتك بعملات الجسر التي تكسبها من التعلم'
                : 'Customize your look with Bridge Coins earned from learning'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl border cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--ink-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Balance Bar */}
        <div
          className="flex items-center justify-between gap-2 p-3 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2 font-black text-sm">
            <span>🪙</span>
            <span style={{ color: 'var(--gold)' }}>{economy.coins}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
              {isArabic ? 'عملة جسر' : 'Bridge Coins'}
            </span>
          </div>
          {isPro && (
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-black border"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              2× Pro
            </span>
          )}
        </div>

        {/* Tabs */}
        <div
          className="grid grid-cols-2 gap-2 p-1 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('themes')}
            className="min-h-[48px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition"
            style={
              tab === 'themes'
                ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                : { color: 'var(--ink-muted)' }
            }
          >
            <Palette size={15} />
            <span>{isArabic ? 'الثيمات (4)' : 'Themes (4)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('frames')}
            className="min-h-[48px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition"
            style={
              tab === 'frames'
                ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                : { color: 'var(--ink-muted)' }
            }
          >
            <Award size={15} />
            <span>{isArabic ? 'إطارات الصورة (4)' : 'Avatar Frames (4)'}</span>
          </button>
        </div>

        {/* Themes List */}
        {tab === 'themes' && (
          <div className="space-y-3">
            {themes.map((t) => {
              const isUnlocked = economy.unlockedThemes.includes(t.id) || Boolean(t.freeForPro && isPro);
              const isEquipped = themeId === t.id;
              const effectiveCost = t.freeForPro && isPro ? 0 : t.cost;

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-start"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: isEquipped ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Swatch Preview */}
                    <div
                      className="w-12 h-12 rounded-2xl border-2 shrink-0 flex items-center justify-center gap-1 p-1.5"
                      style={{
                        backgroundColor: t.tokens.bg,
                        borderColor: t.tokens.accent,
                      }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: t.tokens.accent }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: t.tokens.gold }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-black" style={{ color: 'var(--ink)' }}>
                          {isArabic ? t.nameAr : t.nameEn}
                        </h3>
                        {t.freeForPro && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-black"
                            style={{
                              backgroundColor: 'var(--accent-soft)',
                              color: 'var(--accent)',
                            }}
                          >
                            {isArabic ? 'مجاني لـ Pro' : 'Free for Pro'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                        {isArabic ? t.descAr : t.descEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleThemeAction(t.id)}
                    className="min-h-[48px] px-3.5 py-2 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 cursor-pointer transition active:scale-95 border"
                    style={
                      isEquipped
                        ? {
                            backgroundColor: 'var(--accent)',
                            color: '#FFFFFF',
                            borderColor: 'var(--accent)',
                          }
                        : isUnlocked
                        ? {
                            backgroundColor: 'var(--surface)',
                            color: 'var(--ink)',
                            borderColor: 'var(--border)',
                          }
                        : {
                            backgroundColor: 'var(--gold)',
                            color: '#0B1220',
                            borderColor: 'var(--gold)',
                          }
                    }
                  >
                    {isEquipped ? (
                      <>
                        <Check size={14} />
                        <span>{isArabic ? 'مفعّل' : 'Active'}</span>
                      </>
                    ) : isUnlocked ? (
                      <span>{isArabic ? 'تفعيل' : 'Equip'}</span>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>🪙 {effectiveCost}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Frames List */}
        {tab === 'frames' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVATAR_FRAMES.map((frame) => {
              const isUnlocked = economy.unlockedFrames.includes(frame.id);
              const isEquipped = economy.equippedFrame === frame.id;

              return (
                <div
                  key={frame.id}
                  className="p-3.5 rounded-2xl border flex flex-col justify-between gap-3 text-center"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: isEquipped ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
                      style={{
                        border: `3px solid ${frame.ringColor}`,
                        backgroundColor: frame.accentBg,
                      }}
                    >
                      {frame.badge}
                    </div>
                    <h3 className="text-sm font-black" style={{ color: 'var(--ink)' }}>
                      {isArabic ? frame.nameAr : frame.nameEn}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFrameAction(frame.id)}
                    className="w-full min-h-[48px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 border"
                    style={
                      isEquipped
                        ? {
                            backgroundColor: 'var(--accent)',
                            color: '#FFFFFF',
                            borderColor: 'var(--accent)',
                          }
                        : isUnlocked
                        ? {
                            backgroundColor: 'var(--surface)',
                            color: 'var(--ink)',
                            borderColor: 'var(--border)',
                          }
                        : {
                            backgroundColor: 'var(--gold)',
                            color: '#0B1220',
                            borderColor: 'var(--gold)',
                          }
                    }
                  >
                    {isEquipped ? (
                      <>
                        <Check size={14} />
                        <span>{isArabic ? 'مركّب' : 'Equipped'}</span>
                      </>
                    ) : isUnlocked ? (
                      <span>{isArabic ? 'تركيب' : 'Equip'}</span>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>🪙 {frame.cost}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
