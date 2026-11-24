// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  GuideMode,
  LearnerTrack,
  isArabicGuideMode,
  markUserSetupCompleted,
  saveGuidePreferences,
} from '../utils/guideMode';

interface UserSetupModalProps {
  isOpen: boolean;
  initialGuideMode: GuideMode;
  initialTrack?: LearnerTrack;
  onClose: () => void;
  onComplete: (
    guideMode: GuideMode,
    learnerTrack: LearnerTrack,
    quranInterested?: boolean,
    launchPlacement?: boolean
  ) => void;
}

const LANGUAGE_PILLS: ReadonlyArray<{
  id: GuideMode;
  label: string;
}> = [
  { id: 'egyptian_ar', label: '🇪🇬 عربي مصري' },
  { id: 'standard_ar', label: '📖 فصيح' },
  { id: 'english_guided', label: '🌍 English' },
];

export function UserSetupModal({
  isOpen,
  initialGuideMode,
  initialTrack = 'starter',
  onClose,
  onComplete,
}: UserSetupModalProps) {
  const [selectedGuide, setSelectedGuide] = useState<GuideMode>(initialGuideMode);
  const [quranInterested, setQuranInterested] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem('tb.quranInterest') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedGuide(initialGuideMode);
    // Sync only when modal opens; switching language pills updates live.
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
    // Update UI language & direction live
    saveGuidePreferences({ guideMode: mode });
  };

  const handleFinish = (launchPlacement: boolean) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('tb.quranInterest', quranInterested ? 'true' : 'false');
      }
    } catch {
      // Ignore storage errors
    }
    saveGuidePreferences({
      guideMode: selectedGuide,
      learnerTrack: initialTrack || 'starter',
      setupCompleted: true,
    });
    onComplete(selectedGuide, initialTrack || 'starter', quranInterested, launchPlacement);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 pt-safe"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-setup-modal-title"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 pb-safe border shadow-2xl space-y-6"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Clean Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 text-start">
            <h2
              id="user-setup-modal-title"
              className="text-xl font-black leading-snug"
              style={{ color: 'var(--ink)' }}
            >
              {isAr
                ? isMsa
                  ? 'أهلاً بك في جسر التفكير'
                  : 'أهلاً بيك في فكّر إنجليزي'
                : 'Welcome to Thinking Bridge'}
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {isAr
                ? isMsa
                  ? 'اختر لغة الشرح ثم ابدأ فوراً — مجاناً وبدون إنترنت.'
                  : 'اختار لغة الشرح وابدأ فوراً — مجاني وشغّال بدون نت.'
                : 'Pick your guide language and jump straight in — free & offline.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl border cursor-pointer shrink-0 transition active:scale-95"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--ink-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Compact 3-Pill Live Language Selector */}
        <div className="space-y-2 text-start">
          <span className="text-xs font-bold block" style={{ color: 'var(--ink-muted)' }}>
            {isAr ? (isMsa ? 'لغة الشرح' : 'لغة الشرح') : 'Guide Language'}
          </span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={isAr ? 'لغة الشرح' : 'Guide Language'}>
            {LANGUAGE_PILLS.map((pill) => {
              const active = selectedGuide === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handlePickGuide(pill.id)}
                  className="min-h-[48px] px-2 py-2.5 rounded-2xl border-2 text-xs font-black text-center cursor-pointer transition active:scale-[0.97] leading-tight"
                  style={{
                    backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg)',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                    color: active ? 'var(--accent)' : 'var(--ink)',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Quiet Optional 1-Tap Quran Hifz Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={quranInterested}
          onClick={() => setQuranInterested((v) => !v)}
          className="w-full min-h-[48px] px-3.5 py-3 rounded-2xl border text-start flex items-center gap-3 cursor-pointer transition"
          style={{
            backgroundColor: quranInterested ? 'rgba(16, 185, 129, 0.10)' : 'var(--bg)',
            borderColor: quranInterested ? '#10B981' : 'var(--border)',
            color: 'var(--ink)',
          }}
        >
          <span
            className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition"
            style={{
              backgroundColor: quranInterested ? '#10B981' : 'transparent',
              borderColor: quranInterested ? '#10B981' : 'var(--border)',
              color: '#ffffff',
            }}
          >
            {quranInterested && <Check size={14} strokeWidth={3} />}
          </span>
          <span className="text-xs font-bold leading-snug">
            {isAr
              ? '📖 مهتم أيضاً بحفظ القرآن الكريم (مجاني — صدقة جارية)'
              : '📖 Also interested in memorizing the Quran (Free Forever)'}
          </span>
        </button>

        {/* 3. Two Clear Full-Width Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleFinish(true)}
            data-testid="setup-start-placement"
            className="w-full min-h-[52px] px-5 py-3 rounded-2xl font-black text-sm shadow-lg cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-ink)',
            }}
          >
            <span>
              {isAr
                ? '⚡ اختبار مستوى سريع (60 ثانية)'
                : '⚡ Quick Level Test (60 seconds)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFinish(false)}
            data-testid="setup-start-level1"
            className="w-full min-h-[52px] px-5 py-3 rounded-2xl border font-black text-sm cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
          >
            <span>
              {isAr
                ? '🌱 ابدأ من المستوى 1 مباشرة'
                : '🌱 Start from Level 1 directly'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
