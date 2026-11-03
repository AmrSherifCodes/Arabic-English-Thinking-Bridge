import React, { useState } from 'react';
import { X, Check, ArrowRight, Share2, Globe, Sparkles } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, SUPPORTED_PAIRS, getPairConfig } from '../data/languages';
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
  const [selectedSource, setSelectedSource] = useState<SourceLanguage>(currentSource);
  const [selectedTarget, setSelectedTarget] = useState<TargetLanguage>(currentTarget);

  if (!isOpen) return null;

  const isAr = selectedSource === 'ar';
  const activePairConfig = getPairConfig(selectedSource, selectedTarget);

  const handleApply = () => {
    onSelectPair(selectedSource, selectedTarget);
    onClose();
    onToast?.(
      isAr
        ? `🚀 تم تفعيل مسار: ${TARGET_LANGUAGES[selectedTarget].nameAr} بنجاح!`
        : `🚀 Switched to: ${TARGET_LANGUAGES[selectedTarget].nameEn} track!`
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h2 id="lang-modal-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isAr ? 'اختر مسار التحول اللغوي' : 'Select Thinking Language Pair'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isAr ? 'تعلّم التفكير مباشرة باللغة الهدف' : 'Learn to think in the target language'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Step 1: Source Language (I currently think in) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              {isAr ? '١. لغة التفكير الحالية (لغة الشرح والواجهة):' : '1. I currently think in (Source / UI Language):'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(SOURCE_LANGUAGES) as SourceLanguage[]).map((langKey) => {
                const meta = SOURCE_LANGUAGES[langKey];
                const isSelected = selectedSource === langKey;
                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => setSelectedSource(langKey)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <LanguageFlag code={langKey} size={22} />
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {isAr ? meta.nameAr : meta.nameEn}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {meta.nameNative}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Step 2: Target Language (I want to learn to think in) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              {isAr ? '٢. اللغة التي أريد أن أفكّر بها (اللغة الهدف):' : '2. I want to learn to think in (Target Language):'}
            </label>
            <div className="space-y-2.5">
              {(Object.keys(TARGET_LANGUAGES) as TargetLanguage[]).map((langKey) => {
                const meta = TARGET_LANGUAGES[langKey];
                const isSelected = selectedTarget === langKey;
                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => setSelectedTarget(langKey)}
                    className={`flex items-center justify-between w-full p-3.5 rounded-xl border transition-all text-start ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-400 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LanguageFlag code={langKey} size={28} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            {meta.nameNative}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            ({isAr ? meta.nameAr : meta.nameEn})
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {meta.badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {isAr ? meta.descriptionAr : meta.descriptionEn}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-amber-500 text-white shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Bridge Preview Card */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'المسار المحدد:' : 'Active Cognitive Bridge:'}
              </span>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 underline decoration-dotted"
                title="Share this link"
              >
                <Share2 className="w-3 h-3" />
                {isAr ? 'رابط مباشر' : 'Share link'}
              </button>
            </div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <LanguageFlag code={selectedSource} size={18} />
              <span>{SOURCE_LANGUAGES[selectedSource].nameNative}</span>
              <span className="text-amber-500">➔</span>
              <LanguageFlag code={selectedTarget} size={18} />
              <span>{TARGET_LANGUAGES[selectedTarget].nameNative} ({isAr ? TARGET_LANGUAGES[selectedTarget].nameAr : TARGET_LANGUAGES[selectedTarget].nameEn})</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              {isAr ? activePairConfig.bridgeConceptAr : activePairConfig.bridgeConceptEn}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-100 dark:border-stone-800 p-4 bg-stone-50/50 dark:bg-stone-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md hover:shadow-lg transition-all"
          >
            {isAr ? 'تأكيد وبدء التعلّم ←' : 'Start Thinking Now →'}
          </button>
        </div>
      </div>
    </div>
  );
}

