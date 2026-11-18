/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface ExplanationPanelProps {
  explanationArz: string;
  tags?: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  explanationArz,
  tags,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="w-full mt-3 font-arabic">
      {!isOpen ? (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span>ليه الإجابة دي؟</span>
        </button>
      ) : (
        <div className="bg-stone-900/95 border border-amber-500/40 rounded-2xl p-4 text-right shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
            <button
              onClick={onToggle}
              className="text-stone-400 hover:text-stone-200 p-1 rounded-lg"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" /> التوضيح بالمصري
            </span>
          </div>

          <p className="text-sm text-stone-200 leading-relaxed font-arabic">
            {explanationArz}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-stone-800/60">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
