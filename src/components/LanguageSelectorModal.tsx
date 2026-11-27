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
  isArabic?: boolean;
}

const CANONICAL_SOURCE_OPTIONS: SourceLanguage[] = ['arz', 'en'];

// Top 5 Global Flagship Languages pinned first (complete Pre-A0 -> C1 + 21-Day Travel Sprint)
const TOP5_GLOBAL_FLAGSHIP: TargetLanguage[] = ['en', 'de', 'es', 'it', 'fr'];
// Additional Offline Flagship Courses preserved intact underneath
const SECONDARY_OFFLINE_TARGETS: TargetLanguage[] = ['tr', 'ja', 'pt'];
const UNIVERSAL_TARGETS: TargetLanguage[] = ['zh', 'hi', 'ru', 'el', 'he', 'ar'];

const isTop5FlagshipCourse = (source: SourceLanguage, target: TargetLanguage) => {
  if (source === 'arz' || source === 'ar') {
    return TOP5_GLOBAL_FLAGSHIP.includes(target);
  }
  if (source === 'en') {
    return target === 'ar' || (target as string) === 'arz';
  }
  return false;
};

const isFlagshipCourse = (source: SourceLanguage, target: TargetLanguage) => {
  if (isTop5FlagshipCourse(source, target)) return true;
  if (source === 'arz' || source === 'ar') {
    return SECONDARY_OFFLINE_TARGETS.includes(target);
  }
  return false;
};

export function LanguageSelectorModal({
  isOpen,
  onClose,
  currentSource,
  currentTarget,
  onSelectPair,
  onToast,
  isArabic = true,
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

  const isSourceArabic = selectedSource === 'arz' || selectedSource === 'ar';

  // Auto-exclude Step 1 native language (including ar when arz is selected) from Step 2 targets
  const filteredTargets = [...TOP5_GLOBAL_FLAGSHIP, ...SECONDARY_OFFLINE_TARGETS, ...UNIVERSAL_TARGETS]
    .filter((code, idx, arr) => arr.indexOf(code) === idx)
    .filter((code) => {
      if (!TARGET_LANGUAGE_META[code]) return false;
      if (isSourceArabic && (code === 'ar' || (code as string) === 'arz')) return false;
      if (selectedSource === 'en' && code === 'en') return false;
      return true;
    })
    .sort((a, b) => {
      const aTop5 = isTop5FlagshipCourse(selectedSource, a) ? 0 : isFlagshipCourse(selectedSource, a) ? 1 : 2;
      const bTop5 = isTop5FlagshipCourse(selectedSource, b) ? 0 : isFlagshipCourse(selectedSource, b) ? 1 : 2;
      return aTop5 - bTop5;
    });

  const activePairConfig = getPairConfig(selectedSource, selectedTarget);

  const handleApply = () => {
    onSelectPair(selectedSource, selectedTarget);
    onClose();
    const targetMeta = TARGET_LANGUAGE_META[selectedTarget];
    onToast?.(
      isSourceArabic
        ? `🚀 تم تفعيل مسار: ${targetMeta?.nameAr || selectedTarget} بنجاح!`
        : `🚀 Activated track: ${targetMeta?.nameEn || selectedTarget} successfully!`
    );
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?from=${selectedSource}&to=${selectedTarget}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      onToast?.(isArabic ? '🔗 تم نسخ رابط المشاركة المباشر!' : '🔗 Share link copied!');
    }).catch(() => {
      onToast?.(shareUrl);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 pt-safe pb-safe bg-black/80 backdrop-blur-sm"
      dir={isArabic ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div
        className="relative flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border shadow-2xl md:max-w-2xl lg:max-w-3xl"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between border-b px-5 py-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-2xl bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/35 shrink-0">
              <Globe className="w-5 h-5" />
            </span>
            <div className="text-start min-w-0">
              <h2 id="lang-modal-title" className="text-base sm:text-lg font-black text-[#F8FAFC]">
                {step === 1
                  ? isArabic
                    ? '١. اختر لغتك الأم'
                    : '1. Choose your native language'
                  : isArabic
                    ? '٢. اختر اللغة التي تريد تعلمها'
                    : '2. Choose the language you want to learn'}
              </h2>
              <p className="text-xs text-[#CBD5E1] font-medium mt-0.5">
                {step === 1
                  ? isArabic
                    ? 'ما هي لغتك الحالية التي تفكر بها تلقائياً؟'
                    : 'Which language do you naturally think in?'
                  : isArabic
                    ? 'كل المسارات مجانية 100% — مسارات أوفلاين كاملة + الوضع العالمي.'
                    : '100% Free — Full Offline Flagship Courses + Universal Mode.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl text-[#CBD5E1] hover:text-white shrink-0 cursor-pointer"
            style={{ backgroundColor: 'var(--surface-2)' }}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
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
                      const nextDefault: TargetLanguage = langKey === 'en' ? 'ar' : 'en';
                      setSelectedTarget(nextDefault);
                      setStep(2);
                    }}
                    className="flex flex-col items-start p-4 rounded-2xl border text-start transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg)',
                      borderColor: isSelected ? '#10B981' : 'var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <LanguageFlag code={langKey} size={28} />
                      {isSelected && <Check className="w-5 h-5 text-[#10B981] shrink-0" />}
                    </div>
                    <span className="font-black text-[#F8FAFC] text-base block">
                      {langKey === 'arz' ? (isArabic ? 'العربية' : 'Arabic') : 'English'}
                    </span>
                    <span className="text-xs text-[#CBD5E1] font-medium block mt-0.5">
                      {langKey === 'arz'
                        ? isArabic ? 'العربية (اللغة الأم)' : 'Arabic (Native)'
                        : isArabic ? 'الإنجليزية (English)' : 'English (Native)'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredTargets.map((code) => {
                const meta = TARGET_LANGUAGE_META[code];
                const isSelected = selectedTarget === code;
                const isTop5 = isTop5FlagshipCourse(selectedSource, code);
                const isFlagship = isFlagshipCourse(selectedSource, code);
                const primaryLabel = isArabic ? meta.nameAr : meta.nameEn;
                const secondaryLabel =
                  meta.nameNative === meta.nameEn
                    ? meta.nameEn
                    : `${meta.nameNative} (${meta.nameEn})`;

                return (
                  <button
                    key={code}
                    type="button"
                    data-testid={`lang-target-${code}`}
                    onClick={() => setSelectedTarget(code)}
                    className="flex flex-col items-start p-3 rounded-2xl border text-start transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg)',
                      borderColor: isSelected ? '#10B981' : isTop5 ? 'rgba(245, 158, 11, 0.45)' : 'var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <LanguageFlag code={code} size={22} />
                      {isSelected && <Check className="w-4 h-4 text-[#10B981] shrink-0" />}
                    </div>
                    <span className="font-black text-[#F8FAFC] text-xs sm:text-sm block w-full break-words">
                      {primaryLabel}
                    </span>
                    <span className="text-[10px] text-[#CBD5E1] font-medium block w-full mt-0.5 break-words">
                      {secondaryLabel}
                    </span>
                    <span
                      className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border"
                      style={
                        isTop5
                          ? { backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#FBBF24', borderColor: 'rgba(245, 158, 11, 0.5)' }
                          : isFlagship
                            ? { backgroundColor: 'rgba(16, 185, 129, 0.16)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.4)' }
                            : { backgroundColor: 'rgba(34, 211, 238, 0.14)', color: '#22D3EE', borderColor: 'rgba(34, 211, 238, 0.35)' }
                      }
                    >
                      {isTop5
                        ? isArabic ? '★ مسار كامل A0 → C1' : '★ Full A0 → C1'
                        : isFlagship
                          ? isArabic ? '⭐ أوفلاين كامل' : '⭐ Full Offline'
                          : isArabic ? '🌐 الوضع العالمي' : '🌐 Universal Mode'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Unclipped Sticky Summary + Footer Actions */}
        <div
          className="shrink-0 border-t p-4 space-y-3"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          {step === 2 && (
            <div
              className="p-3 rounded-2xl border flex items-center justify-between gap-2 flex-wrap"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 flex-wrap text-xs font-black text-[#F8FAFC]">
                <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span className="text-[#CBD5E1]">{isArabic ? 'المسار المحدد:' : 'Selected:'}</span>
                <span>{selectedSource === 'arz' ? (isArabic ? 'العربية' : 'Arabic') : 'English'}</span>
                <ArrowRight size={14} className={`text-[#F59E0B] shrink-0 ${isArabic ? 'rotate-180' : ''}`} />
                <span className="text-[#10B981]">
                  {isArabic ? TARGET_LANGUAGE_META[selectedTarget]?.nameAr : TARGET_LANGUAGE_META[selectedTarget]?.nameEn}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#22D3EE] font-bold underline cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isArabic ? 'مشاركة' : 'Share'}</span>
              </button>
              <p className="w-full text-[11px] text-[#CBD5E1] leading-snug">
                {isArabic ? activePairConfig.bridgeConceptAr : activePairConfig.bridgeConceptEn}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border text-[#F8FAFC] flex items-center justify-center gap-1.5 min-h-[46px] cursor-pointer shrink-0 whitespace-nowrap"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <ArrowRight size={14} className={isArabic ? '' : 'rotate-180'} />
                <span>{isArabic ? 'العودة للخطوة ١' : 'Back to Step 1'}</span>
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full px-5 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer tb-btn-3d tb-btn-emerald"
              >
                <span>{isArabic ? 'التالي: اختر اللغة الهدف ←' : 'Next: Choose Target Language →'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="w-full sm:flex-1 px-5 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer tb-btn-3d tb-btn-gold"
              >
                <span>{isArabic ? 'تأكيد وبدء التعلّم 🚀' : 'Confirm & Start Learning 🚀'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
