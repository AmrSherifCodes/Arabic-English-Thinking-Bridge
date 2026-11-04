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
  const isAr = sourceLang === 'ar';
  const sourceMeta = SOURCE_LANGUAGES[sourceLang] || SOURCE_LANGUAGES['ar'];
  const targetMeta = TARGET_LANGUAGE_META[targetLang] || TARGET_LANGUAGE_META['en'];

  return (
    <section
      className={`flex items-center justify-between p-2 px-3 rounded-xl bg-surface border border-border shadow-sm text-text ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
      aria-label="Active Language Learning Bridge"
    >
      {/* Left side: Flag ➔ Flag & Language Names */}
      <div className="flex items-center gap-2 text-xs font-bold text-text min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageFlag code={sourceLang} size={16} />
          <span className="truncate">{sourceMeta.nameNative}</span>
        </div>
        <span className="text-muted font-normal text-[11px] shrink-0">➔</span>
        <div className="flex items-center gap-1.5 min-w-0">
          <LanguageFlag code={targetLang} size={16} />
          <span className="truncate text-primary font-extrabold">{targetMeta.nameNative}</span>
        </div>
      </div>

      {/* Right side: Compact Change Button */}
      <button
        type="button"
        onClick={onOpenSelector}
        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text transition flex items-center gap-1 shrink-0 ms-2"
      >
        <Globe size={13} className="text-primary shrink-0" />
        <span>{isAr ? 'تغيير' : 'Change'}</span>
        <ChevronDown size={12} className="shrink-0" />
      </button>
    </section>
  );
}
