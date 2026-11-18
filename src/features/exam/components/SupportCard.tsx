/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 *
 * Honor-system channel support card. Zero network calls, zero paywall, zero gating.
 */

import React from 'react';
import { Youtube } from 'lucide-react';

interface SupportCardProps {
  onEnableSupporterMode: () => void;
  onProceed: () => void;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  onEnableSupporterMode,
  onProceed,
}) => {
  return (
    <div className="w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl font-arabic text-stone-100 flex flex-col gap-5 text-right backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
          CC0 1.0 — مجاني للأبد
        </span>
        <h3 className="text-xl font-bold text-amber-400">الامتحان مجاني بالكامل — CC0</h3>
      </div>

      {/* Body text */}
      <p className="text-sm text-stone-300 leading-relaxed">
        مفيش حساب، مفيش اشتراك إجباري، مفيش تتبع.
        <br />
        بس لو حاب تدعم القناة، اشترك في{' '}
        <a
          href="https://www.youtube.com/@SciAmrSherif"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-red-400 underline hover:text-red-300 font-bold"
        >
          <Youtube className="w-4 h-4 inline" /> @SciAmrSherif
        </a>{' '}
        على يوتيوب.
        <br />
        واللي يشترك — هياخد Supporter Mode: شكل أحلى، كارت مذهّب، كونفيتي، ولمسة القاهرة في النتيجة. المحتوى نفسه واحد للكل.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={() => {
            onEnableSupporterMode();
            onProceed();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          ✅ اشتركت — فعّل Supporter Mode
        </button>

        <button
          onClick={onProceed}
          className="w-full py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm transition-all"
        >
          بعدين (الامتحان زي ما هو، يا باشا)
        </button>
      </div>
    </div>
  );
};
