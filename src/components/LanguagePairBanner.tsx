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
  const isAr = sourceLang.startsWith('ar');
  const sourceMeta = SOURCE_LANGUAGES[sourceLang] || SOURCE_LANGUAGES['ar'];
  const targetMeta = TARGET_LANGUAGE_META[targetLang] || TARGET_LANGUAGE_META['en'];

  return (
    <section
      className={`flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#0B1C33] via-[#0E2746] to-[#081527] border border-cyan-500/30 shadow-md text-white ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
      aria-label="Active Language Learning Bridge"
    >
      {/* Left side: Flag ➔ Flag & Language Names */}
      <div className="flex items-center gap-2 text-xs font-bold text-white min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageFlag code={sourceLang} size={16} />
          <span className="truncate text-slate-200">{sourceMeta.nameNative}</span>
        </div>
        <span className="text-cyan-400/80 font-black text-[11px] shrink-0">➔</span>
        <div className="flex items-center gap-1.5 min-w-0">
          <LanguageFlag code={targetLang} size={16} />
          <span className="truncate text-cyan-300 font-extrabold">{targetMeta.nameNative}</span>
        </div>
      </div>

      {/* Right side: Compact Change Button */}
      <button
        type="button"
        onClick={onOpenSelector}
        className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 transition flex items-center gap-1 shrink-0 ms-2 shadow-sm"
      >
        <Globe size={13} className="text-cyan-400 shrink-0" />
        <span>{isAr ? 'تغيير' : 'Change'}</span>
        <ChevronDown size={12} className="shrink-0" />
      </button>
    </section>
  );
}
