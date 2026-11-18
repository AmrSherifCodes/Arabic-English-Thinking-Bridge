import React, { useEffect, useState } from 'react';
import { X, Check, ArrowLeft, ArrowRight, Share2, Globe, Sparkles } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, TARGET_LANGUAGE_META, getPairConfig } from '../data/languages';
import { LanguageFlag } from './LanguageFlag';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: SourceLanguage;
  currentTarget: TargetLanguage;
  onSelectPair: (source: SourceLanguage, target: TargetLanguage) => void;
  onToast?: (msg: string) => void;
}

// Canonical source dialect/language options for a clean, uncluttered list.
const CANONICAL_SOURCE_OPTIONS: SourceLanguage[] = [
  'arz',  // عامية مصرية
  'ar',   // العربية (الفصحى)
  'apc',  // لهجة شامية
  'afb',  // لهجة خليجية
  'ary',  // دارجة مغربية
  'en',   // English
];

// Fully supported target languages.
const SUPPORTED_TARGET_OPTIONS: TargetLanguage[] = [
  'en',
  'de',
  'es',
  'fr',
  'tr',
  'ja',
  'ar',
  'zh',
];

export function LanguageSelectorModal({
  isOpen,
  onClose,
  currentSource,
  currentTarget,
  onSelectPair,
  onToast
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

  const isAr = selectedSource.startsWith('ar');
  const activePairConfig = getPairConfig(selectedSource, selectedTarget);

  const handleApply = () => {
    onSelectPair(selectedSource, selectedTarget);
    onClose();
    onToast?.(
      isAr
        ? `🚀 تم تفعيل مسار: ${TARGET_LANGUAGE_META[selectedTarget]?.nameAr || selectedTarget} بنجاح!`
        : `🚀 Switched to: ${TARGET_LANGUAGE_META[selectedTarget]?.nameEn || selectedTarget} track!`
    );
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?from=${selectedSource}&to=${selectedTarget}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      onToast?.(isAr ? '🔗 تم نسخ رابط المشاركة المباشر!' : '🔗 Shareable link copied to clipboard!');
    }).catch(() => {
      onToast?.(shareUrl);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-surface text-text shadow-2xl md:max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </span>
            <div className="text-start">
              <h2 id="lang-modal-title" className="text-base sm:text-lg font-black text-text">
                {step === 1
                  ? (isAr ? '١. اختر لغتك الأم / لهجتك (L1)' : '1. Select your native language / dialect (L1)')
                  : (isAr ? '٢. اختر اللغة التي تريد التفكير بها (L2)' : '2. Select target learning language (L2)')}
              </h2>
              <p className="text-xs text-muted font-bold">
                {step === 1
                  ? (isAr ? 'ما لغتك الحالية أو لهجتك التي تفكر بها تلقائياً؟' : 'Which language or dialect do you think in naturally?')
                  : (isAr ? 'أي لغة تريد بناء بديهتها والتوقف عن ترجمتها؟' : 'Which language do you want to build direct reflexes in?')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-muted hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 space-y-5">
          {/* STEP 1: Source / Native Language (L1) */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                        if (selectedTarget === langKey) {
                          const nextTarget = SUPPORTED_TARGET_OPTIONS.find((t) => t !== langKey) || 'en';
                          setSelectedTarget(nextTarget);
                        }
                        setStep(2);
                      }}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border text-start transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/20 text-primary shadow-md ring-1 ring-primary/40'
                          : 'border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-2/80 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <LanguageFlag code={langKey} size={22} />
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <span className="font-black text-text text-xs sm:text-sm block truncate w-full">
                        {isAr ? meta.nameAr : meta.nameEn}
                      </span>
                      <span className="text-[10px] text-muted font-semibold block truncate w-full">
                        {meta.nameNative}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Target / Learning Goal (L2) */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {SUPPORTED_TARGET_OPTIONS
                  .filter((code) => code !== selectedSource && TARGET_LANGUAGE_META[code])
                  .map((code) => {
                    const meta = TARGET_LANGUAGE_META[code];
                    const isSelected = selectedTarget === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedTarget(code)}
                        className={`flex flex-col items-start p-3.5 rounded-2xl border text-start transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md ring-1 ring-emerald-500/40'
                            : 'border-border bg-surface-2 hover:border-emerald-500/50 text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <LanguageFlag code={code} size={22} />
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <span className="font-black text-text text-xs sm:text-sm block truncate w-full">
                          {meta.nameNative}
                        </span>
                        <span className="text-[10px] text-muted font-semibold block truncate w-full">
                          {isAr ? meta.nameAr : meta.nameEn}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Active Bridge Preview Card */}
              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2 text-start">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    {isAr ? 'المسار المحدد:' : 'Active Cognitive Bridge:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-text underline"
                    title="Share this link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {isAr ? 'رابط مشاركة المبادرة' : 'Share link'}
                  </button>
                </div>
                <div className="text-xs font-black text-text flex items-center gap-2 flex-wrap">
                  <LanguageFlag code={selectedSource} size={18} />
                  <span>{SOURCE_LANGUAGES[selectedSource]?.nameNative || selectedSource}</span>
                  <span className="text-amber-400 font-bold">➔</span>
                  <LanguageFlag code={selectedTarget} size={18} />
                  <span>{TARGET_LANGUAGE_META[selectedTarget]?.nameNative} ({isAr ? TARGET_LANGUAGE_META[selectedTarget]?.nameAr : TARGET_LANGUAGE_META[selectedTarget]?.nameEn})</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {isAr ? activePairConfig.bridgeConceptAr : activePairConfig.bridgeConceptEn}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border p-5 bg-surface-2/50 shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface border border-border text-text hover:bg-surface-2 transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{isAr ? 'رجوع للخطوة ١' : 'Back to Step 1'}</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-primary text-on-primary shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <span>{isArabicLanguage(selectedSource) ? 'التالي: اختر اللغة الهدف ←' : 'Next: Select Target Language →'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 min-h-[44px]"
            >
              <span>{isArabicLanguage(selectedSource) ? 'تأكيد وبدء التعلّم 🚀' : 'Confirm & Start 🚀'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function isArabicLanguage(lang: string): boolean {
  return lang.startsWith('ar');
}
