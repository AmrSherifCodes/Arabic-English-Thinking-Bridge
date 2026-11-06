import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePWAInstall';
import { Download, Share, X, PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PwaInstallBanner() {
  const { isInstallable, triggerInstall, showIosHint, isStandalone } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();

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
              {t('pwa.install')}
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {showIosHint ? t('pwa.iosHint') : t('pwa.hint')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-stone-400 hover:text-white shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          aria-label={t('nav.close', 'Close')}
        >
          <X size={16} />
        </button>
      </div>

      {!showIosHint && isInstallable && (
        <div className="mt-3 pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => void triggerInstall()}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-black text-xs transition flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <Download size={14} />
            <span>{t('pwa.installNow')}</span>
          </button>
        </div>
      )}

      {showIosHint && (
        <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center gap-2 text-[11px] text-teal-400 font-bold">
          <Share size={14} />
          <span>{t('pwa.shareTitle')} ➔ </span>
          <PlusSquare size={14} />
          <span>{t('pwa.addToHome')}</span>
        </div>
      )}
    </div>
  );
}
