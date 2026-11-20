import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META } from '../data/languages';
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
  className = ''
}: LanguagePairBannerProps) {
  const isArUI = sourceLang.startsWith('ar') || sourceLang === 'arz' || sourceLang === 'apc' || sourceLang === 'afb' || sourceLang === 'ary';
  const sourceMeta = SOURCE_LANGUAGES[sourceLang] || SOURCE_LANGUAGES['arz'];
  const targetMeta = TARGET_LANGUAGE_META[targetLang] || TARGET_LANGUAGE_META['en'];

  const sourceName = isArUI ? (sourceMeta.nameAr || sourceMeta.nameNative) : sourceMeta.nameEn;
  const targetName = isArUI ? (targetMeta.nameAr || targetMeta.nameNative) : targetMeta.nameEn;

  return (
    <section
      className={`flex items-center justify-between p-2 sm:p-2.5 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#0B1C33] via-[#0E2746] to-[#081527] border border-cyan-500/30 shadow-md text-white ${className}`}
      dir={isArUI ? 'rtl' : 'ltr'}
      aria-label="مسار التعلم النشط"
    >
      {/* Single-row Language Selector Display */}
      <div className="flex items-center gap-2 text-xs font-bold text-white min-w-0">
        <div className="flex items-center gap-1.5 shrink-0 max-w-[110px] sm:max-w-none">
          <LanguageFlag code={sourceLang} size={18} />
          <span className="truncate text-slate-200 font-bold">{sourceName}</span>
        </div>

        <span className="text-amber-400 font-black text-xs shrink-0">➔</span>

        <div className="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-none">
          <LanguageFlag code={targetLang} size={18} />
          <span className="truncate text-cyan-300 font-extrabold">{targetName}</span>
        </div>
      </div>

      {/* Single Change Button */}
      <button
        type="button"
        onClick={onOpenSelector}
        className="px-3 py-1.5 rounded-xl text-xs font-black bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition flex items-center gap-1.5 shrink-0 ms-2 shadow-sm active:scale-95 cursor-pointer"
        title={isArUI ? 'تغيير لغة المسار التعليمي' : 'Change Learning Language'}
      >
        <Globe size={14} className="text-cyan-400 shrink-0" />
        <span>{isArUI ? 'تغيير' : 'Change'}</span>
        <ChevronDown size={13} className="shrink-0" />
      </button>
    </section>
  );
}
