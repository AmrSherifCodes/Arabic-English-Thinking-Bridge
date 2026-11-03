import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Download, Share, X, PlusSquare } from 'lucide-react';

export function PwaInstallBanner() {
  const { isInstallable, triggerInstall, showIosHint, isStandalone } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isStandalone || dismissed || (!isInstallable && !showIosHint)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto p-4 rounded-2xl bg-stone-900 border border-teal-500/40 text-stone-100 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0 mt-0.5">
            <Download size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white">
              ثبّت التطبيق على جهازك
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {showIosHint
                ? 'على آيفون: اضغط على زر المشاركة (Share) ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                : 'احصل على تجربة سريعة بدون إنترنت وتصفح مباشر من الشاشة الرئيسية.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-stone-400 hover:text-white shrink-0"
          aria-label="إغلاق الإشعار"
        >
          <X size={16} />
        </button>
      </div>

      {!showIosHint && isInstallable && (
        <div className="mt-3 pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => void triggerInstall()}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-black text-xs transition flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>تثبيت الآن</span>
          </button>
        </div>
      )}

      {showIosHint && (
        <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center gap-2 text-[11px] text-teal-400 font-bold">
          <Share size={14} />
          <span>مشاركة ➔ </span>
          <PlusSquare size={14} />
          <span>إضافة إلى الشاشة الرئيسية</span>
        </div>
      )}
    </div>
  );
}
