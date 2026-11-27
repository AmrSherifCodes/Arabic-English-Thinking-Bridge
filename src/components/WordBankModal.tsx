// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useMemo } from 'react';
import { Volume2, BookmarkCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWordBank } from '../utils/wordBank';
import { useUiMode } from '../utils/uiMode';
import { AmrGuide } from './AmrGuide';
import { loadAdaptiveProfile, optimizeSessionItems } from '../engine/orAdaptiveEngine';

export interface WordBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

function speakText(text: string, rate = 1.0) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch { }
}

export const WordBankModal: React.FC<WordBankModalProps> = ({
  isOpen,
  onClose,
  isArabic = true,
}) => {
  const { words } = useWordBank();
  const [uiMode] = useUiMode();
  const isSimple = uiMode === 'simple';
  const defaultRate = isSimple ? 0.85 : 1.0;

  const prioritizedIds = useMemo(() => {
    if (words.length === 0) return new Set<string>();
    const adaptive = loadAdaptiveProfile();
    const now = Date.now();
    const candidates = words.map((w) => ({
      id: w.id,
      word: w.word,
      skill: 'vocab' as const,
      isNew: w.masteredCount <= 1,
      stabilityDays: Math.max(1, adaptive.itemStabilities[w.id] ?? w.masteredCount * 2),
      elapsedDays: Math.max(0.2, (now - (typeof w.unlockedAt === 'number' ? w.unlockedAt : Date.parse(String(w.unlockedAt || '')) || now)) / 86400000),
      frequency: 0.85,
      estTimeSec: 10,
    }));
    const plan = optimizeSessionItems(candidates, { uiMode, skills: adaptive.skills });
    return new Set(plan.orderedItems.map((i) => i.id));
  }, [words, uiMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[88dvh] rounded-t-3xl sm:rounded-3xl border flex flex-col overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Anchor 1: Large High-Contrast Back Button */}
        <div
          className="px-4 py-3.5 border-b flex items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'رجوع' : 'Back'}
            className="min-h-[52px] px-4 rounded-2xl border-2 border-slate-500/40 bg-[#1B2742] text-[#F8FAFC] font-black text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <BookmarkCheck size={20} className="text-[#F59E0B] shrink-0" />
            <div className="min-w-0 text-start">
              <h2 className="text-base font-black text-[#F8FAFC] truncate">
                {isArabic ? 'بنك الكلمات' : 'Word Bank'}
              </h2>
              <p className="text-xs font-medium text-[#CBD5E1]">
                {isArabic
                  ? `${words.length} كلمة محفوظة · اضغط للاستماع`
                  : `${words.length} collected words · tap to hear`}
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Anchor 2: Center Stage */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {words.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center gap-3">
              <AmrGuide mood="study" isArabic={isArabic} size={96} />
              <p className="text-sm font-black text-[#F8FAFC]">
                {isArabic ? 'بنك الكلمات لسه فاضي!' : 'Your Word Bank is empty!'}
              </p>
              <p className="text-xs text-[#CBD5E1] max-w-xs">
                {isArabic
                  ? 'ابدأ أول درس وكل كلمة جديدة هتتضاف هنا تلقائياً بصوتها العادي والبطيء.'
                  : 'Start your first lesson and every new word you unlock will appear here automatically.'}
              </p>
            </div>
          ) : (
            words.map((item) => {
              const isPriority = prioritizedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${isPriority ? 'border-[#10B981]/50' : ''
                    }`}
                  style={{ backgroundColor: 'var(--surface)', borderColor: isPriority ? 'rgba(16,185,129,0.5)' : 'var(--border)' }}
                >
                  <div className="min-w-0 text-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span dir="ltr" className="text-base font-black text-[#F8FAFC]">
                        {item.word}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981]">
                        ×{item.masteredCount}
                      </span>
                      {isPriority && !isSimple && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#22D3EE]/15 text-[#22D3EE]">
                          {isArabic ? 'أولوية مراجعة' : 'Priority'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#FBBF24]">{item.translationAr}</p>
                    {item.egyptianHook && !isSimple && (
                      <p className="text-[11px] text-[#CBD5E1] truncate">{item.egyptianHook}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakText(item.word, defaultRate)}
                      aria-label={`${defaultRate}x`}
                      className={`${isSimple ? 'min-h-[56px] min-w-[56px] px-4' : 'min-h-[48px] px-3'} rounded-xl border text-xs font-black text-[#F8FAFC] flex items-center justify-center gap-1 cursor-pointer active:scale-95`}
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'rgba(16,185,129,0.45)' }}
                    >
                      <Volume2 size={isSimple ? 22 : 15} className="text-[#10B981]" />
                      <span>{defaultRate}x</span>
                    </button>
                    {!isSimple && (
                      <button
                        type="button"
                        onClick={() => speakText(item.word, 0.75)}
                        aria-label="0.75x"
                        className="min-h-[48px] px-2.5 rounded-xl border text-xs font-black text-[#F8FAFC] flex items-center gap-1 cursor-pointer active:scale-95"
                        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                      >
                        <span aria-hidden="true">🐢</span>
                        <span>0.75x</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Fixed Anchor 3: Bottom Thumb-Zone Primary CTA */}
        <div
          className="p-4 border-t pb-safe"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[60px] rounded-2xl font-black text-base tb-btn-3d tb-btn-emerald cursor-pointer"
          >
            {isArabic ? 'تمام ✓' : 'Done ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};
