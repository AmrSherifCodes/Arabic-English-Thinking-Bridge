import React, { useState } from 'react';

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
  zh: 'cn',
  hi: 'in',
  ru: 'ru',
  pt: 'br',
  it: 'it',
  ar: 'eg',
  arz: 'eg',
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
  zh: 'bg-rose-600 text-white',
  hi: 'bg-orange-600 text-white',
  ru: 'bg-sky-600 text-white',
  pt: 'bg-emerald-600 text-white',
  it: 'bg-green-600 text-white',
  ar: 'bg-teal-600 text-white',
  arz: 'bg-teal-600 text-white',
  he: 'bg-emerald-800 text-white',
};

export function LanguageFlag({ code, size = 20, className = '', showCodePill = false }: LanguageFlagProps) {
  const [failed, setFailed] = useState(false);
  const cleanCode = (code || 'ar').toLowerCase();

  if (cleanCode === 'he') {
    return (
      <span className={`inline-flex items-center gap-1.5 shrink-0 select-none ${className}`}>
        <svg
          width={Math.round(size * 1.35)}
          height={size}
          viewBox="0 0 900 600"
          className="rounded-sm object-cover shadow-sm shrink-0 border border-stone-700/50"
          aria-label="Palestinian flag"
        >
          <rect width="900" height="200" fill="#000000" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#007A3D" />
          <polygon points="0,0 0,600 450,300" fill="#CE1126" />
        </svg>
        {showCodePill && (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-800 text-white">
            HE
          </span>
        )}
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
