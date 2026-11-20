import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface GenderColorBadgeProps {
  article?: 'der' | 'die' | 'das';
  noun: string;
  plural?: string;
  suffixRule?: string;
  showHint?: boolean;
  className?: string;
}

export function GenderColorBadge({
  article,
  noun,
  plural,
  suffixRule,
  showHint = true,
  className = '',
}: GenderColorBadgeProps) {
  const [isRuleExpanded, setIsRuleExpanded] = useState(false);

  if (!article) {
    return (
      <span className={`font-mono font-bold text-text ${className}`} dir="ltr" lang="de">
        {noun}
      </span>
    );
  }

  const badgeStyles = {
    der: 'bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-950/90 dark:text-blue-200 dark:border-blue-700',
    die: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-700',
    das: 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-700',
  };

  const articleLabels = {
    der: 'der (مذكر 🟦)',
    die: 'die (مؤنث 🟥)',
    das: 'das (محياد 🟩)',
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs sm:text-sm font-black transition-all ${badgeStyles[article]} ${className}`}>
        <span dir="ltr" lang="de" className="font-mono tracking-tight">
          <span className="underline decoration-2 font-black">{article}</span> {noun}
        </span>
        {plural && (
          <span dir="ltr" lang="de" className="text-[10px] opacity-75 font-normal">
            (Pl: {plural})
          </span>
        )}
        {suffixRule && showHint && (
          <button
            type="button"
            onClick={() => setIsRuleExpanded(!isRuleExpanded)}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-1"
            title="ليه الأداة دي؟ (اضغط لمعرفة القاعدة 💡)"
            aria-label="عرض قاعدة الأداة"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          </button>
        )}
      </div>

      {suffixRule && isRuleExpanded && (
        <div className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 p-2 rounded-xl text-start animate-in fade-in transition-all max-w-xs">
          💡 <span className="font-extrabold text-text">{articleLabels[article]}:</span> {suffixRule}
        </div>
      )}
    </div>
  );
}
