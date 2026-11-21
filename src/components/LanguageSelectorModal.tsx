import React, { useEffect, useState } from 'react';
import { X, Check, ArrowRight, Share2, Globe, Sparkles } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META, getPairConfig } from '../data/languages';
import { LanguageFlag } from './LanguageFlag';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: SourceLanguage;
  currentTarget: TargetLanguage;
  onSelectPair: (source: SourceLanguage, target: TargetLanguage) => void;
  onToast?: (msg: string) => void;
  onOpenSupporterGate?: () => void;
}

// Canonical home languages (L1) - kept strictly to Arabic & English only.
const CANONICAL_SOURCE_OPTIONS: SourceLanguage[] = [
  'arz',   // العربية (عامية مصرية / فصحى)
  'en',    // الإنجليزية (English)
];

// All available target languages (L2).
const SUPPORTED_TARGET_OPTIONS: TargetLanguage[] = [
  'en',
  'de',
  'es',
  'fr',
  'tr',
  'ja',
  'ar',
  'zh',
  'hi',
  'ru',
  'pt',
  'it',
  'el',
  'he',
];

const isChannelActive = (source: SourceLanguage, target: TargetLanguage) => {
  if (source === 'arz' || source === 'ar') return ['en'].includes(target);
  if (source === 'en') return ['ar', 'arz'].includes(target);
  return false;
};

export function LanguageSelectorModal({
  isOpen,
  onClose,
  currentSource,
  currentTarget,
  onSelectPair,
  onToast,
}: LanguageSelectorModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSource, setSelectedSource] = useState<SourceLanguage>(currentSource);
  const [selectedTarget, setSelectedTarget] = useState<TargetLanguage>(currentTarget);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setSelectedSource(currentSource);
    setSelectedTarget(currentTarget);
  }, [isOpen, currentSource, currentTarget]);

  if (!isOpen) return null;

  const activePairConfig = getPairConfig(selectedSource, selectedTarget);

  const handleApply = () => {
    onSelectPair(selectedSource, selectedTarget);
    onClose();
    const targetMeta = TARGET_LANGUAGE_META[selectedTarget];
    onToast?.(`🚀 تم تفعيل مسار: ${targetMeta?.nameAr || selectedTarget} بنجاح!`);
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?from=${selectedSource}&to=${selectedTarget}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      onToast?.('🔗 تم نسخ رابط المشاركة المباشر!');
    }).catch(() => {
      onToast?.(shareUrl);
    });
  };

  const renderAccessPill = (code: TargetLanguage) => {
    const isActive = isChannelActive(selectedSource, code);
    if (!isActive) {
      return (
        <span className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-500/15 text-stone-400 border border-stone-500/30">
          🚧 قريباً
        </span>
      );
    }
    return (
      <span className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        مجاني 100%
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-surface text-text shadow-2xl md:max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 sm:px-6 py-4 sm:py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Globe className="w-5 h-5" />
            </span>
            <div className="text-start">
              <h2 id="lang-modal-title" className="text-base sm:text-lg font-black text-text">
                {step === 1
                  ? '١. اختر لغتك الأم (L1)'
                  : '٢. اختر اللغة التي تريد التفكير بها (L2)'}
              </h2>
              <p className="text-xs text-muted font-bold mt-0.5">
                {step === 1
                  ? 'ما هي لغتك الحالية التي تفكر بها تلقائياً؟'
                  : 'أي لغة تريد بناء بديهتك والتوقف عن ترجمتها في عقلك؟'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-muted hover:text-text hover:bg-surface-2 transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
          {/* STEP 1: Source / Native Language (L1) - Exactly 2 options: Arabic & English */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                {CANONICAL_SOURCE_OPTIONS.map((langKey) => {
                  const meta = SOURCE_LANGUAGES[langKey];
                  if (!meta) return null;
                  const isSelected = selectedSource === langKey;
                  return (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => {
                        setSelectedSource(langKey);
                        if (!isChannelActive(langKey, selectedTarget)) {
                          const nextTarget = SUPPORTED_TARGET_OPTIONS.find((t) => isChannelActive(langKey, t)) || 'en';
                          setSelectedTarget(nextTarget);
                        }
                        setStep(2);
                      }}
                      className={`flex flex-col items-start p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/20 text-primary shadow-lg ring-2 ring-primary/40'
                          : 'border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-2/80 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <LanguageFlag code={langKey} size={28} />
                        {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                      <span className="font-black text-text text-base sm:text-lg block truncate w-full">
                        {langKey === 'arz' ? 'العربية' : 'English'}
                      </span>
                      <span className="text-xs text-muted font-semibold block truncate w-full mt-0.5">
                        {langKey === 'arz' ? 'العربية (اللغة الأم)' : 'English (Home Language)'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Target / Learning Goal (L2) - 100% Unlocked */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {SUPPORTED_TARGET_OPTIONS
                  .filter((code) => (code as string) !== (selectedSource as string) && TARGET_LANGUAGE_META[code])
                  .map((code) => {
                    const meta = TARGET_LANGUAGE_META[code];
                    const isSelected = selectedTarget === code;
                    const isActive = isChannelActive(selectedSource, code as TargetLanguage);
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={!isActive}
                        onClick={() => setSelectedTarget(code as TargetLanguage)}
                        className={`flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border text-start transition-all ${isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-60 grayscale'} ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md ring-1 ring-emerald-500/40'
                            : isActive ? 'border-border bg-surface-2 hover:border-emerald-500/50 text-text' : 'border-border bg-surface-2 text-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <LanguageFlag code={code} size={22} />
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <span className="font-black text-text text-xs sm:text-sm block truncate w-full">
                          {meta.nameAr}
                        </span>
                        <span className="text-[10px] text-muted font-semibold block truncate w-full mt-0.5">
                          {meta.nameNative} ({meta.nameEn})
                        </span>
                        {renderAccessPill(code)}
                      </button>
                    );
                  })}
              </div>

              {/* Active Bridge Preview Card */}
              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3 text-start">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>المسار التعليمي المحدد:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-text underline cursor-pointer"
                    title="مشاركة رابط المسار"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>رابط مشاركة</span>
                  </button>
                </div>
                <div className="text-xs font-black text-text flex items-center gap-2 flex-wrap" dir="ltr">
                  <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-xl border border-border">
                    <LanguageFlag code={selectedSource} size={18} />
                    <span>{selectedSource === 'arz' ? 'العربية' : 'English'}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">➔</span>
                  <div className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    <LanguageFlag code={selectedTarget} size={18} />
                    <span>{TARGET_LANGUAGE_META[selectedTarget]?.nameAr} ({TARGET_LANGUAGE_META[selectedTarget]?.nameNative})</span>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {activePairConfig.bridgeConceptAr}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border p-4 sm:p-5 bg-surface-2/50 shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface border border-border text-text hover:bg-surface-2 transition-colors flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <ArrowRight size={14} />
              <span>العودة للخطوة ١</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-primary text-on-primary shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <span>التالي: اختر اللغة الهدف ←</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 min-h-[44px] cursor-pointer"
            >
              <span>تأكيد وبدء التعلّم 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
