import React, { useEffect, useState } from 'react';
import { X, Check, ArrowLeft, ArrowRight, Share2, Globe, Sparkles } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, TARGET_LANGUAGE_META, SUPPORTED_PAIRS, getPairConfig } from '../data/languages';
import { LanguageFlag } from './LanguageFlag';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: SourceLanguage;
  currentTarget: TargetLanguage;
  onSelectPair: (source: SourceLanguage, target: TargetLanguage) => void;
  onToast?: (msg: string) => void;
}

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
        ? `🚀 تم تفعيل مسار: ${TARGET_LANGUAGE_META[selectedTarget].nameAr} بنجاح!`
        : `🚀 Switched to: ${TARGET_LANGUAGE_META[selectedTarget].nameEn} track!`
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl text-text">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h2 id="lang-modal-title" className="text-sm sm:text-base font-black text-text">
                {step === 1
                  ? (isAr ? '١. اختر لغتك الأم / لهجتك (L1)' : '1. Select your native language / dialect (L1)')
                  : (isAr ? '٢. اختر اللغة التي تريد التفكير بها (L2)' : '2. Select target learning language (L2)')}
              </h2>
              <p className="text-[11px] text-muted font-bold">
                {step === 1
                  ? (isAr ? 'ما لغتك الحالية أو لهجتك التي تفكر بها تلقائياً؟' : 'Which language or dialect do you think in naturally?')
                  : (isAr ? 'أي لغة تريد بناء بديهتها والتوقف عن ترجمتها؟' : 'Which language do you want to build direct reflexes in?')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Source / Native Language (L1) */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(SOURCE_LANGUAGES) as SourceLanguage[]).map((langKey) => {
                  const meta = SOURCE_LANGUAGES[langKey];
                  const isSelected = selectedSource === langKey;
                  return (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => {
                        setSelectedSource(langKey);
                        if (selectedTarget === langKey) {
                          const nextTarget = (Object.keys(TARGET_LANGUAGE_META) as TargetLanguage[]).find((t) => t !== langKey);
                          if (nextTarget) setSelectedTarget(nextTarget);
                        }
                        setStep(2);
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-start transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/20 text-primary shadow-md ring-1 ring-primary/40'
                          : 'border-border bg-surface-2 hover:border-primary/50 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <LanguageFlag code={langKey} size={20} />
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <span className="font-extrabold text-text text-xs block truncate w-full">
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
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(TARGET_LANGUAGE_META) as TargetLanguage[])
                  .filter((code) => code !== selectedSource)
                  .map((code) => {
                    const meta = TARGET_LANGUAGE_META[code];
                    const isSelected = selectedTarget === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedTarget(code)}
                        className={`flex flex-col items-start p-3 rounded-2xl border text-start transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md ring-1 ring-amber-500/40'
                            : 'border-border bg-surface-2 hover:border-amber-500/50 text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <LanguageFlag code={code} size={20} />
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <span className="font-extrabold text-text text-xs block truncate w-full">
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
              <div className="p-3.5 rounded-2xl bg-surface-2 border border-border space-y-1.5 text-start">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-black text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAr ? 'المسار المحدد:' : 'Active Cognitive Bridge:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-text underline"
                    title="Share this link"
                  >
                    <Share2 className="w-3 h-3" />
                    {isAr ? 'رابط مباشر' : 'Share link'}
                  </button>
                </div>
                <div className="text-xs font-black text-text flex items-center gap-1.5 flex-wrap">
                  <LanguageFlag code={selectedSource} size={16} />
                  <span>{SOURCE_LANGUAGES[selectedSource]?.nameNative || selectedSource}</span>
                  <span className="text-amber-400 font-bold">➔</span>
                  <LanguageFlag code={selectedTarget} size={16} />
                  <span>{TARGET_LANGUAGE_META[selectedTarget].nameNative} ({isAr ? TARGET_LANGUAGE_META[selectedTarget].nameAr : TARGET_LANGUAGE_META[selectedTarget].nameEn})</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {isAr ? activePairConfig.bridgeConceptAr : activePairConfig.bridgeConceptEn}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border p-4 bg-surface-2/50">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface border border-border text-text hover:bg-surface-2 transition-colors flex items-center gap-1.5"
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
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-primary text-on-primary shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span>{isArabicLanguage(selectedSource) ? 'التالي: اختر اللغة الهدف ←' : 'Next: Select Target Language →'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
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
