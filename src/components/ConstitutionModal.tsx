import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import constitutionEn from '../channelConstitution.md?raw';
import constitutionAr from '../channelConstitution.ar.md?raw';

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
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={-1}
      aria-labelledby="constitution-title"
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#0F151C] border border-[#1E2933] p-6 space-y-4 text-start max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-teal-400 font-black text-sm">
            <Globe size={18} />
            <span id="constitution-title">{showArabic ? 'دستور القناة' : 'Channel Constitution'}</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white font-bold text-xs">
            <X size={18} />
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center shrink-0">
          <div className="inline-flex bg-stone-900 rounded-lg p-1 border border-stone-800">
            <button
              onClick={() => setShowArabic(true)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                showArabic ? 'bg-teal-500/20 text-teal-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setShowArabic(false)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                !showArabic ? 'bg-teal-500/20 text-teal-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <pre className={`whitespace-pre-wrap font-sans text-xs text-stone-300 leading-relaxed ${showArabic ? 'text-right' : 'text-left'}`} dir={showArabic ? 'rtl' : 'ltr'}>
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}