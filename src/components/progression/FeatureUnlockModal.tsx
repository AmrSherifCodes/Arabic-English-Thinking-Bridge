import React from 'react';
import { LockKeyhole, X, Play, ShieldAlert } from 'lucide-react';
import { FeatureUnlockDefinition } from '../../progression/featureUnlocks';

interface FeatureUnlockModalProps {
  feature: FeatureUnlockDefinition;
  currentLevelNumber: number;
  currentStageTitleAr: string;
  currentStageTitleEn: string;
  isArabic?: boolean;
  onClose: () => void;
  onContinueCourse: () => void;
}

export function FeatureUnlockModal({
  feature,
  currentLevelNumber,
  currentStageTitleAr,
  currentStageTitleEn,
  isArabic = true,
  onClose,
  onContinueCourse,
}: FeatureUnlockModalProps) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-stone-800 bg-[#0F141C] p-6 text-center shadow-2xl space-y-5">
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
          className="absolute end-4 top-4 rounded-xl p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-lg relative">
          <span>{feature.icon}</span>
          <div className="absolute -bottom-2 -end-2 w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
            <LockKeyhole size={18} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
            {isArabic ? `🔒 ميزة مقفلة · المستوى ${feature.requiredLevelNumber}` : `🔒 Locked Feature · Level ${feature.requiredLevelNumber}`}
          </span>
          <h2 className="text-xl font-black text-white pt-1">
            {isArabic ? feature.titleAr : feature.titleEn}
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed max-w-xs mx-auto">
            {isArabic ? feature.descriptionAr : feature.descriptionEn}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-start space-y-2">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-bold">
            <ShieldAlert size={14} className="text-amber-400 shrink-0" />
            <span>{isArabic ? 'شرط الفتح عبر مسار التفكير:' : 'Unlock Requirement:'}</span>
          </div>
          <div className="text-xs text-stone-200 font-bold leading-normal">
            {isArabic
              ? `تتطلب هذه الميزة الوصول إلى المستوى ${feature.requiredLevelNumber} (${feature.requiredStage}).`
              : `Requires reaching Level ${feature.requiredLevelNumber} (${feature.requiredStage}).`}
          </div>
          <div className="text-[11px] text-teal-300/90 font-medium">
            {isArabic
              ? `موقعك الحالي: المستوى ${currentLevelNumber} (${currentStageTitleAr})`
              : `Current progress: Level ${currentLevelNumber} (${currentStageTitleEn})`}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onContinueCourse}
            className="w-full min-h-[48px] rounded-2xl bg-emerald-500 text-stone-950 font-black text-xs shadow-lg hover:bg-emerald-400 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>{isArabic ? 'تابع الدروس لفتح الميزة 🚀' : 'Continue Course to Unlock 🚀'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-stone-400 hover:text-white font-bold transition"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
