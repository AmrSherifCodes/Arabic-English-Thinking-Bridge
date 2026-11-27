// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { GuideMode } from '../utils/guideMode';
import { UiMode, useUiMode } from '../utils/uiMode';
import { useThemeStore } from '../features/gamification/themeStore';
import { isSoundMuted, setSoundMuted } from '../utils/wordBank';

export interface DialectModePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  guideMode: GuideMode;
  onChangeGuideMode: (mode: GuideMode) => void;
  isArabic?: boolean;
  onOpenLaunchGate?: () => void;
  onOpenPlacementTest?: () => void;
}

export const DialectModePopover: React.FC<DialectModePopoverProps> = ({
  isOpen,
  onClose,
  guideMode,
  onChangeGuideMode,
  isArabic = true,
  onOpenLaunchGate,
  onOpenPlacementTest,
}) => {
  const [uiMode, changeUiMode] = useUiMode();
  const isSimple = uiMode === 'simple';
  const btnH = isSimple ? 'min-h-[56px]' : 'min-h-[48px]';
  const { themeId, selectTheme } = useThemeStore();
  const [muted, setMutedState] = React.useState(() => isSoundMuted());

  if (!isOpen) return null;

  const toggleMute = () => {
    const next = !muted;
    setSoundMuted(next);
    setMutedState(next);
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/65 backdrop-blur-sm flex items-start justify-center sm:justify-end p-3 pt-16 sm:pe-6"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border p-4 space-y-4 shadow-2xl tb-pop-bounce"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-[#F8FAFC]">
            {isArabic ? 'اللهجة ونمط الواجهة' : 'Dialect & UI Mode'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className={`${isSimple ? 'min-h-[56px] min-w-[56px]' : 'min-h-[48px] min-w-[48px]'} rounded-xl flex items-center justify-center text-[#CBD5E1] cursor-pointer`}
            style={{ backgroundColor: 'var(--surface-2)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Dialect / Style (3 uniform single-line buttons) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#CBD5E1] block">
            {isArabic ? 'أسلوب الشرح' : 'Guide Style'}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'egyptian_ar' as GuideMode, label: '🇪🇬 مصري' },
                { id: 'standard_ar' as GuideMode, label: '🌍 فصحى' },
                { id: 'english_guided' as GuideMode, label: '🇬🇧 English' },
              ]
            ).map((item) => {
              const active = guideMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeGuideMode(item.id)}
                  className={`${btnH} px-2 rounded-xl border text-xs font-black whitespace-nowrap flex items-center justify-center cursor-pointer transition`}
                  style={{
                    backgroundColor: active ? '#10B981' : 'var(--bg)',
                    borderColor: active ? '#10B981' : 'var(--border)',
                    color: active ? '#0B1120' : '#F8FAFC',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. UI Complexity Mode */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#CBD5E1] block">
            {isArabic ? 'حجم وكثافة الواجهة' : 'UI Complexity'}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'simple' as UiMode, ar: 'بسيط', en: 'Easy' },
                { id: 'standard' as UiMode, ar: 'عادي', en: 'Standard' },
                { id: 'pro' as UiMode, ar: 'متقدم', en: 'Pro' },
              ]
            ).map((item) => {
              const active = uiMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeUiMode(item.id)}
                  className={`${btnH} px-2 rounded-xl border text-xs font-black whitespace-nowrap flex items-center justify-center cursor-pointer transition`}
                  style={{
                    backgroundColor: active ? '#22D3EE' : 'var(--bg)',
                    borderColor: active ? '#22D3EE' : 'var(--border)',
                    color: active ? '#0B1120' : '#F8FAFC',
                  }}
                >
                  {isArabic ? item.ar : item.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Dark Theme Toggle + Sound Mute */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => selectTheme(themeId === 'midnight-navy' ? 'amoled-obsidian' : 'midnight-navy')}
            className={`${btnH} px-3 rounded-xl border text-xs font-black text-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer`}
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <span>{themeId === 'amoled-obsidian' ? '🌑 AMOLED' : '🌌 Navy'}</span>
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={`${btnH} px-3 rounded-xl border text-xs font-black text-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer`}
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            {muted ? <VolumeX size={15} className="text-amber-400" /> : <Volume2 size={15} className="text-[#10B981]" />}
            <span>{muted ? (isArabic ? 'صامت' : 'Muted') : (isArabic ? 'الصوت يعمل' : 'Sound On')}</span>
          </button>
        </div>

        {/* 4. Quick Shortcuts: Adaptive Placement + Launch Gate */}
        {(onOpenPlacementTest || onOpenLaunchGate) && (
          <div className="space-y-2 pt-1 border-t border-slate-500/20">
            {onOpenPlacementTest && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPlacementTest();
                }}
                className="w-full min-h-[52px] px-3 rounded-xl border border-[#10B981]/50 bg-[#10B981]/15 text-xs font-black text-[#10B981] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡ {isArabic ? 'اختبار تحديد المستوى الذكي' : 'Adaptive Placement Test'}</span>
              </button>
            )}
            {onOpenLaunchGate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLaunchGate();
                }}
                className="w-full min-h-[52px] px-3 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/15 text-xs font-black text-[#FBBF24] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🚪 {isArabic ? 'بوابة البداية (اللغات / القرآن)' : 'Launch Gate (Languages / Quran)'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
