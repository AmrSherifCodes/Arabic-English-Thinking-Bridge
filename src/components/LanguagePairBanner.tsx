import React from 'react';
import { ArrowLeftRight, ChevronDown, Sparkles, Globe, Share2 } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META, getPairConfig } from '../data/languages';
import { LanguageFlag } from './LanguageFlag';

interface LanguagePairBannerProps {
  sourceLang: SourceLanguage;
  targetLang: TargetLanguage;
  onOpenSelector: () => void;
  onQuickSwitchTarget?: (target: TargetLanguage) => void;
  onToast?: (msg: string) => void;
  className?: string;
}

export function LanguagePairBanner({
  sourceLang,
  targetLang,
  onOpenSelector,
  onQuickSwitchTarget,
  onToast,
  className = ''
}: LanguagePairBannerProps) {
  const isAr = sourceLang === 'ar';
  const sourceMeta = SOURCE_LANGUAGES[sourceLang];
  const targetMeta = TARGET_LANGUAGE_META[targetLang];
  const pairConfig = getPairConfig(sourceLang, targetLang);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?from=${sourceLang}&to=${targetLang}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      onToast?.(isAr ? '🔗 تم نسخ رابط المشاركة المباشر!' : '🔗 Shareable link copied!');
    }).catch(() => {
      onToast?.(shareUrl);
    });
  };

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white border border-stone-800 shadow-xl p-3 sm:p-4 ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
      aria-label="Active Language Learning Bridge"
    >
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        {/* Top bar: Badge & Quick modal trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full flex-wrap">
          <span className="inline-flex items-center gap-1.5 flex-wrap px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{isAr ? 'مسار التحول الذهني النشط' : 'Active Thinking Bridge'}</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
              title={isAr ? 'مشاركة هذا المسار' : 'Share this track'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSelector}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'تغيير اللغات' : 'Change'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Center: Language transfer visualization */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 min-w-0">
          <div className="flex min-w-0 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex w-full sm:w-auto min-w-0 items-center gap-2 p-2 rounded-xl bg-stone-800/90 border border-stone-700">
              <LanguageFlag code={sourceLang} size={20} />
              <div className="text-start">
                <span className="block text-[10px] text-stone-400 uppercase font-medium">
                  {isAr ? 'أفكر بـ' : 'I think in'}
                </span>
                <span className="text-sm font-bold text-stone-100 break-words">
                  {sourceMeta.nameNative}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center w-8 h-8 self-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <span className="text-xs font-bold">➔</span>
            </div>

            <div className="flex w-full sm:w-auto min-w-0 items-center gap-2 p-2 rounded-xl bg-amber-950/40 border border-amber-500/40">
              <LanguageFlag code={targetLang} size={20} />
              <div className="text-start">
                <span className="block text-[10px] text-amber-300 uppercase font-medium">
                  {isAr ? 'أتعلّم التفكير بـ' : 'Learn to think in'}
                </span>
                <span className="text-sm font-bold text-amber-200 break-words">
                  {targetMeta.nameNative} ({isAr ? targetMeta.nameAr : targetMeta.nameEn})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Switch Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <span className="text-xs text-stone-400 hidden md:inline">
              {isAr ? 'تبديل سريع:' : 'Quick target:'}
            </span>
            {(['en', 'de', 'ja', 'es', 'fr', 'zh'] as TargetLanguage[]).map((tCode) => {
              const meta = TARGET_LANGUAGE_META[tCode];
              const isActive = targetLang === tCode;
              return (
                <button
                  key={tCode}
                  type="button"
                  onClick={() => onQuickSwitchTarget?.(tCode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                  }`}
                  title={`${isAr ? meta.nameAr : meta.nameEn}`}
                >
                  <LanguageFlag code={tCode} size={14} />
                  <span>{meta.code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pedagogical Bridge Insight */}
        <p className="text-xs text-stone-300/90 bg-stone-800/40 border border-stone-800 rounded-xl px-3 py-2 text-start">
          💡 <span className="font-semibold text-amber-400">{isAr ? 'الهدف الإدراكي:' : 'Focus:'}</span>{' '}
          {isAr ? pairConfig.bridgeConceptAr : pairConfig.bridgeConceptEn}
        </p>
      </div>
    </section>
  );
}
