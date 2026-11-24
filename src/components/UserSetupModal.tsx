// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Sparkles, X } from 'lucide-react';
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
  initialTrack: LearnerTrack;
  onClose: () => void;
  onComplete: (guideMode: GuideMode, learnerTrack: LearnerTrack) => void;
}

const GUIDE_OPTIONS: ReadonlyArray<{
  id: GuideMode;
  icon: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}> = [
  {
    id: 'egyptian_ar',
    icon: '🇪🇬',
    titleAr: 'عربي مصري بسيط',
    titleEn: 'Everyday Egyptian Arabic',
    subtitleAr: 'شرح دافي وبسيط بالمصري بدون مصطلحات معقدة + أزرار نطق واضحة',
    subtitleEn: 'Warm, zero-jargon Egyptian Arabic + big audio buttons',
  },
  {
    id: 'standard_ar',
    icon: '📖',
    titleAr: 'عربي فصيح',
    titleEn: 'Modern Standard Arabic',
    subtitleAr: 'عربية فصيحة واضحة وسلسة لمتعلمي العالم العربي',
    subtitleEn: 'Clean formal Arabic for learners across the Arab world',
  },
  {
    id: 'english_guided',
    icon: '🌍',
    titleAr: 'English-Guided (للإنجليزي فقط)',
    titleEn: 'English-Guided (LTR + Phonetics)',
    subtitleAr: '100% English UI + Latin phonetics & audio for Arabic phrases (IGCSE / Diaspora)',
    subtitleEn: '100% English LTR + Latin phonetics (e.g. Ana gahez) & audio for any Arabic phrase',
  },
];

const TRACK_OPTIONS: ReadonlyArray<{
  id: LearnerTrack;
  icon: string;
  titleEg: string;
  titleMsa: string;
  titleEn: string;
  descEg: string;
  descMsa: string;
  descEn: string;
}> = [
  {
    id: 'starter',
    icon: '🌱',
    titleEg: 'بداية من الصفر',
    titleMsa: 'مبتدئ من الصفر',
    titleEn: 'Complete Beginner',
    descEg: 'ابدأ من المرحلة 1 بالوضع البسيط خطوة بخطوة',
    descMsa: 'ابدأ من المستوى الأول بالوضع المبسط خطوة بخطوة',
    descEn: 'Start at Level 1 with Simple Mode, step by step',
  },
  {
    id: 'school_igcse',
    icon: '🎒',
    titleEg: 'مدرسة / IGCSE',
    titleMsa: 'المدرسة / IGCSE',
    titleEn: 'School & IGCSE',
    descEg: 'مسار A2 لتقوية القواعد والكتابة وتجنب أخطاء الترجمة',
    descMsa: 'مسار A2 لتقوية القواعد والكتابة وتجنب الترجمة الحرفية',
    descEn: 'A2 bridge for grammar accuracy, writing & L1 traps',
  },
  {
    id: 'uni_career',
    icon: '🚀',
    titleEg: 'جامعة وشغل',
    titleMsa: 'الجامعة والعمل',
    titleEn: 'Uni & Career',
    descEg: 'مسار B1 للطلاقة والإنترفيو وإنجليزي الشركات',
    descMsa: 'مسار B1 للطلاقة والمقابلات ولغة العمل الاحترافية',
    descEn: 'B1 track for fluency, interviews & workplace English',
  },
  {
    id: 'teacher',
    icon: '🏫',
    titleEg: 'معلم / سنتر تعليمي',
    titleMsa: 'معلم / مركز تعليمي',
    titleEn: 'Teacher / Center',
    descEg: 'افتح وضع الفصل والبروجيكتور ومتابعة الطلاب مباشرة',
    descMsa: 'افتح وضع الفصل الدراسي وشاشة العرض للطلاب مباشرة',
    descEn: 'Jump straight into Classroom & Projector Mode (/teacher)',
  },
];

export function UserSetupModal({
  isOpen,
  initialGuideMode,
  initialTrack,
  onClose,
  onComplete,
}: UserSetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGuide, setSelectedGuide] = useState<GuideMode>(initialGuideMode);
  const [selectedTrack, setSelectedTrack] = useState<LearnerTrack>(initialTrack);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setSelectedGuide(initialGuideMode);
    setSelectedTrack(initialTrack);
    // Reset only when modal opens; changing guideMode inside Step 1 updates initialGuideMode via parent
    // and must not snap the user back from Step 2 to Step 1.
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

  const handleSkip = () => {
    markUserSetupCompleted();
    onClose();
  };

  const handlePickGuide = (mode: GuideMode) => {
    setSelectedGuide(mode);
    // Apply immediately so Step 2 renders in the user's chosen language & direction
    saveGuidePreferences({ guideMode: mode });
    setStep(2);
  };

  const handlePickTrack = (track: LearnerTrack) => {
    setSelectedTrack(track);
    saveGuidePreferences({
      guideMode: selectedGuide,
      learnerTrack: track,
      setupCompleted: true,
    });
    onComplete(selectedGuide, track);
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
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 pb-safe border shadow-2xl space-y-4"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header with step pills & 1-tap skip */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              <Sparkles size={12} />
              <span>{isAr ? `الخطوة ${step} من 2` : `Step ${step} of 2`}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSkip}
              className="min-h-[48px] px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink-muted)',
              }}
            >
              {isAr ? 'تخطي' : 'Skip'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              aria-label={isAr ? 'إغلاق' : 'Close'}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border cursor-pointer"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink-muted)',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Step 1: Guidance Mode */}
        {step === 1 && (
          <div className="space-y-3 text-start">
            <div>
              <h2
                id="user-setup-modal-title"
                className="text-lg font-black leading-snug"
                style={{ color: 'var(--ink)' }}
              >
                {isAr
                  ? isMsa
                    ? 'كيف تفضل أن نرشدك داخل التطبيق؟'
                    : 'تحب التطبيق يكلمك إزاي؟'
                  : 'How should the app guide you?'}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                {isAr
                  ? isMsa
                    ? 'اختيار واحد يضبط لغة الواجهة والشرح — يمكنك تغييره في أي وقت.'
                    : 'ضغطة واحدة تظبط لغة التطبيق والشرح — تقدر تغيرها في أي وقت.'
                  : 'One tap sets UI language, hints & Arabic phonetics — switch anytime.'}
              </p>
            </div>

            <div className="space-y-2.5">
              {GUIDE_OPTIONS.map((opt) => {
                const active = selectedGuide === opt.id;
                const showEn = opt.id === 'english_guided' || !isAr;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePickGuide(opt.id)}
                    className="w-full min-h-[68px] p-3.5 rounded-2xl border-2 text-start flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.98]"
                    style={{
                      backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg)',
                      borderColor: active ? 'var(--accent)' : 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0 leading-none mt-0.5">{opt.icon}</span>
                      <div className="min-w-0" dir={showEn ? 'ltr' : undefined}>
                        <span className="text-sm font-black block leading-snug">
                          {showEn ? opt.titleEn : opt.titleAr}
                        </span>
                        <span
                          className="text-[11px] font-medium block leading-relaxed mt-0.5"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {showEn ? opt.subtitleEn : opt.subtitleAr}
                        </span>
                      </div>
                    </div>
                    {active && <Check size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Role / Track */}
        {step === 2 && (
          <div className="space-y-3 text-start">
            <div>
              <h2
                id="user-setup-modal-title"
                className="text-lg font-black leading-snug"
                style={{ color: 'var(--ink)' }}
              >
                {isAr
                  ? isMsa
                    ? 'اختر مسارك التعليمي'
                    : 'اختار المسار اللي يناسبك'
                  : 'Pick your learning track'}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                {isAr
                  ? isMsa
                    ? 'سنقترح لك نقطة البداية الأنسب لهدفك.'
                    : 'هنجهزلك أنسب نقطة بداية ليك في ثانية.'
                  : 'We will tailor your recommended starting point instantly.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {TRACK_OPTIONS.map((opt) => {
                const active = selectedTrack === opt.id;
                const title = isAr ? (isMsa ? opt.titleMsa : opt.titleEg) : opt.titleEn;
                const desc = isAr ? (isMsa ? opt.descMsa : opt.descEg) : opt.descEn;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePickTrack(opt.id)}
                    className="w-full min-h-[64px] p-3.5 rounded-2xl border-2 text-start flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.98]"
                    style={{
                      backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg)',
                      borderColor: opt.id === 'teacher' ? 'var(--gold)' : active ? 'var(--accent)' : 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0 leading-none mt-0.5">{opt.icon}</span>
                      <div className="min-w-0">
                        <span className="text-sm font-black block leading-snug">{title}</span>
                        <span
                          className="text-[11px] font-medium block leading-relaxed mt-0.5"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {desc}
                        </span>
                      </div>
                    </div>
                    {active && <Check size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[48px] px-3.5 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink-muted)',
              }}
            >
              <ArrowLeft size={14} className={isAr ? 'rotate-180' : ''} />
              <span>{isAr ? 'رجوع لاختيار اللغة' : 'Back to language'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
