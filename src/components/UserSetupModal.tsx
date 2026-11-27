// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  GuideMode,
  LearnerTrack,
  isArabicGuideMode,
  markUserSetupCompleted,
  saveGuidePreferences,
} from '../utils/guideMode';
import { UiMode, useUiMode } from '../utils/uiMode';
import { AmrGuide } from './AmrGuide';

interface UserSetupModalProps {
  isOpen: boolean;
  initialGuideMode: GuideMode;
  initialTrack?: LearnerTrack;
  onClose: () => void;
  onComplete: (
    guideMode: GuideMode,
    learnerTrack: LearnerTrack,
    launchPlacement?: boolean
  ) => void;
}

const LANGUAGE_PILLS: ReadonlyArray<{
  id: GuideMode;
  label: string;
}> = [
  { id: 'egyptian_ar', label: '🇪🇬 مصري' },
  { id: 'standard_ar', label: '🌍 فصحى' },
  { id: 'english_guided', label: '🇬🇧 English' },
];

const UI_MODES: ReadonlyArray<{
  id: UiMode;
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
}> = [
  { id: 'simple', ar: 'بسيط', en: 'Easy', descAr: 'أزرار كبيرة وخط واضح', descEn: 'Big buttons & clear audio' },
  { id: 'standard', ar: 'عادي', en: 'Standard', descAr: 'متوازن وسريع للموبايل', descEn: 'Balanced mobile UI' },
  { id: 'pro', ar: 'متقدم', en: 'Pro', descAr: 'قواعد ومراجعة ذكية', descEn: 'Grammar & smart review' },
];

export function UserSetupModal({
  isOpen,
  initialGuideMode,
  initialTrack = 'starter',
  onClose,
  onComplete,
}: UserSetupModalProps) {
  const [selectedGuide, setSelectedGuide] = useState<GuideMode>(initialGuideMode);
  const [uiMode, setUiMode] = useUiMode();

  useEffect(() => {
    if (!isOpen) return;
    setSelectedGuide(initialGuideMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markUserSetupCompleted();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAr = isArabicGuideMode(selectedGuide);
  const isMsa = selectedGuide === 'standard_ar';

  const handleClose = () => {
    markUserSetupCompleted();
    onClose();
  };

  const handlePickGuide = (mode: GuideMode) => {
    setSelectedGuide(mode);
    saveGuidePreferences({ guideMode: mode });
  };

  const handleFinish = (launchPlacement: boolean) => {
    saveGuidePreferences({
      guideMode: selectedGuide,
      learnerTrack: initialTrack || 'starter',
      setupCompleted: true,
    });
    onComplete(selectedGuide, initialTrack || 'starter', launchPlacement);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 pt-safe"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-setup-modal-title"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-safe border shadow-2xl space-y-5 tb-pop-bounce"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Welcome Header with 2D Guide Avatar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AmrGuide mood="welcome" isArabic={isAr} size={68} />
            <div className="space-y-0.5 text-start min-w-0">
              <h2
                id="user-setup-modal-title"
                className="text-lg sm:text-xl font-black leading-snug text-[#F8FAFC]"
              >
                {isAr
                  ? isMsa
                    ? 'أهلاً بك في جسر التفكير'
                    : 'أهلاً بيك في جسر التفكير'
                  : 'Welcome to Thinking Bridge'}
              </h2>
              <p className="text-xs font-medium text-[#CBD5E1] leading-snug">
                {isAr
                  ? 'مجاني 100% ويعمل بدون إنترنت — ظبّط واجهتك في ثانية.'
                  : '100% free & offline — tailor your experience in 1 tap.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className={`${uiMode === 'simple' ? 'min-h-[56px] min-w-[56px]' : 'min-h-[48px] min-w-[48px]'} flex items-center justify-center rounded-2xl border cursor-pointer shrink-0 transition active:scale-95`}
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: '#CBD5E1',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Question 1: Guide Language / Dialect (3 uniform single-line buttons) */}
        <div className="space-y-2 text-start">
          <span className="text-xs font-bold block text-[#CBD5E1]">
            {isAr ? '١. أسلوب الشرح المفضل' : '1. Preferred Guide Style'}
          </span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={isAr ? 'أسلوب الشرح' : 'Guide Style'}>
            {LANGUAGE_PILLS.map((pill) => {
              const active = selectedGuide === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handlePickGuide(pill.id)}
                  className={`${uiMode === 'simple' ? 'min-h-[56px]' : 'min-h-[48px]'} px-1.5 py-2 rounded-2xl border-2 text-xs font-black text-center flex items-center justify-center cursor-pointer transition active:scale-[0.97] min-w-0`}
                  style={{
                    backgroundColor: active ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg)',
                    borderColor: active ? '#10B981' : 'var(--border)',
                    color: active ? '#10B981' : '#F8FAFC',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: UI Complexity Mode (Easy / Standard / Pro) */}
        <div className="space-y-2 text-start">
          <span className="text-xs font-bold block text-[#CBD5E1]">
            {isAr ? '٢. شكل الواجهة المناسب ليك' : '2. Choose UI Complexity'}
          </span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={isAr ? 'شكل الواجهة' : 'UI Mode'}>
            {UI_MODES.map((m) => {
              const active = uiMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setUiMode(m.id)}
                  className={`${uiMode === 'simple' ? 'min-h-[76px]' : 'min-h-[68px]'} p-2.5 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition active:scale-[0.97]`}
                  style={{
                    backgroundColor: active ? 'rgba(34, 211, 238, 0.16)' : 'var(--bg)',
                    borderColor: active ? '#22D3EE' : 'var(--border)',
                    color: '#F8FAFC',
                  }}
                >
                  <span className="text-xs font-black">{isAr ? m.ar : m.en}</span>
                  <span className="text-xs font-medium text-[#CBD5E1] leading-tight">
                    {isAr ? m.descAr : m.descEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Clear Thumb-Zone Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleFinish(false)}
            data-testid="setup-start-level1"
            className="w-full min-h-[58px] px-5 py-3 rounded-2xl font-black text-sm cursor-pointer flex items-center justify-center gap-2 tb-btn-3d tb-btn-emerald"
          >
            <span>
              {isAr ? '🚀 ابدأ أول درس الآن' : '🚀 Start First Lesson Now'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFinish(true)}
            data-testid="setup-start-placement"
            className={`w-full ${uiMode === 'simple' ? 'min-h-[56px]' : 'min-h-[50px]'} px-5 py-2.5 rounded-2xl border font-bold text-xs cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-2 text-[#F8FAFC]`}
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <span>
              {isAr ? '⚡ أو حدّد مستواك في 60 ثانية' : '⚡ Or take the 60s Placement Test'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
