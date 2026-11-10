import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';

let constitutionEn = '# Channel Constitution';
let constitutionAr = '# دستور القناة';

try {
  const enModule = await import('../channelConstitution.md?raw');
  const arModule = await import('../channelConstitution.ar.md?raw');
  constitutionEn = enModule.default || constitutionEn;
  constitutionAr = arModule.default || constitutionAr;
} catch {
  /* Fallback for Node.js test runner where ?raw is unhandled */
}

interface ConstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

export function ConstitutionModal({ isOpen, onClose, isArabic = true }: ConstitutionModalProps) {
  const [showArabic, setShowArabic] = useState(isArabic);

  useEffect(() => {
    setShowArabic(isArabic);
  }, [isArabic]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = showArabic ? constitutionAr : constitutionEn;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir={isArabic ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArabic(!showArabic)}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold flex items-center gap-1.5 transition text-teal-400"
            >
              <Globe size={14} />
              <span>{showArabic ? 'English' : 'عربي'}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto font-sans leading-relaxed text-sm whitespace-pre-wrap text-stone-300">
          {content}
        </div>
      </div>
    </div>
  );
}
