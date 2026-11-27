import React, { useEffect, useState } from 'react';

interface LanguageFlagProps {
  code: string;
  size?: number;
  className?: string;
  showCodePill?: boolean;
}

const ISO_MAP: Record<string, string> = {
  en: 'gb',
  de: 'de',
  ja: 'jp',
  es: 'es',
  fr: 'fr',
  tr: 'tr',
  el: 'gr',
  ko: 'kr',
  zh: 'cn',
  hi: 'in',
  ru: 'ru',
  pt: 'br',
  it: 'it',
  ar: 'eg',
  arz: 'eg',
  apc: 'lb',
  afb: 'sa',
  ary: 'ma',
  'ar-eg': 'eg',
  egyptian: 'eg',
  msa: 'un',
  he: 'ps',
};

const LANG_COLORS: Record<string, string> = {
  en: 'bg-indigo-600 text-white',
  de: 'bg-amber-600 text-white',
  ja: 'bg-red-600 text-white',
  es: 'bg-yellow-600 text-stone-950',
  fr: 'bg-blue-600 text-white',
  tr: 'bg-red-700 text-white',
  el: 'bg-sky-700 text-white',
  ko: 'bg-indigo-700 text-white',
  zh: 'bg-rose-600 text-white',
  hi: 'bg-orange-600 text-white',
  ru: 'bg-sky-600 text-white',
  pt: 'bg-emerald-600 text-white',
  it: 'bg-green-600 text-white',
  ar: 'bg-teal-600 text-white',
  arz: 'bg-teal-600 text-white',
  apc: 'bg-teal-700 text-white',
  afb: 'bg-emerald-700 text-white',
  ary: 'bg-red-700 text-white',
  he: 'bg-emerald-800 text-white',
};

export function LanguageFlag({ code, size = 20, className = '', showCodePill = false }: LanguageFlagProps) {
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const [failed, setFailed] = useState(isOffline);
  const cleanCode = (code || 'ar').toLowerCase();

  useEffect(() => {
    setFailed(typeof navigator !== 'undefined' && navigator.onLine === false);
  }, [cleanCode]);

  if (cleanCode === 'he') {
    return (
      <span className={`inline-flex items-center gap-1.5 shrink-0 select-none ${className}`}>
        <span
          className="inline-flex items-center justify-center rounded-md font-black text-[11px] tracking-wider bg-[#1B2742] text-[#22D3EE] border border-[#22D3EE]/50 shadow-sm"
          style={{ minWidth: Math.round(size * 1.35), height: size }}
          aria-label="Hebrew (HE)"
        >
          HE
        </span>
      </span>
    );
  }

  const iso = ISO_MAP[cleanCode] || 'un';
  const colorClass = LANG_COLORS[cleanCode] || 'bg-stone-700 text-stone-200';

  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 select-none ${className}`}>
      {!failed ? (
        <img
          src={`https://flagcdn.com/w40/${iso}.png`}
          srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
          width={Math.round(size * 1.35)}
          height={size}
          alt={`${code} flag`}
          className="rounded-sm object-cover shadow-sm shrink-0 border border-stone-700/50"
          loading="eager"
          onError={() => setFailed(true)}
        />
      ) : null}

      {(failed || showCodePill) && (
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${colorClass}`}>
          {code.slice(0, 2)}
        </span>
      )}
    </span>
  );
}
