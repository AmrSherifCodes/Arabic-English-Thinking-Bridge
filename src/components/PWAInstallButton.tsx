import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="Install Thinking Bridge App"
        className="rounded-full bg-indigo-600 text-white px-3 py-1 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-indigo-700 cursor-pointer"
      >
        📲 Install
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Install on iPhone or iPad"
          className="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
        >
          📲 iOS App
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Install on iPhone or iPad"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Install Thinking Bridge on iOS
              </h3>
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                1. Tap the <strong>Share</strong> button in Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-teal-700 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
