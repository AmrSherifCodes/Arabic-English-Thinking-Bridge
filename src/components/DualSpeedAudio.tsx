import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { unlockAudio } from '../utils/audio';
import { speakUnified } from '../utils/offlineTts';
import { useUiMode } from '../utils/uiMode';

interface DualSpeedAudioProps {
  text: string;
  preferredVoice?: string;
  targetLang?: string;
  className?: string;
  btnClassName?: string;
  showLabels?: boolean;
  isArabic?: boolean;
  autoPlayInEasyMode?: boolean;
}

export function DualSpeedAudio({
  text,
  preferredVoice,
  targetLang,
  className = 'grid grid-cols-2 gap-2 w-full max-w-md mx-auto',
  btnClassName = 'px-3 py-2 rounded-2xl bg-[#1B2742] hover:bg-[#233254] text-[#F8FAFC] border border-slate-400/20 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold active:translate-y-0.5 whitespace-nowrap',
  showLabels = true,
  isArabic = true,
  autoPlayInEasyMode = false,
}: DualSpeedAudioProps) {
  const [uiMode] = useUiMode();
  const isSimple = uiMode === 'simple';
  const normalRate = isSimple ? 0.85 : 1.0;
  const slowRate = isSimple ? 0.65 : 0.75;

  useEffect(() => {
    if (!autoPlayInEasyMode || !isSimple || !text.trim()) return;
    const timer = window.setTimeout(() => {
      void speakUnified({
        text,
        lang: targetLang,
        rate: normalRate,
        preferredVoiceName: preferredVoice,
      });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [autoPlayInEasyMode, isSimple, text, targetLang, normalRate, preferredVoice]);

  const handleNormal = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    void speakUnified({
      text,
      lang: targetLang,
      rate: normalRate,
      preferredVoiceName: preferredVoice,
    });
  };

  const handleSlow = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    void speakUnified({
      text,
      lang: targetLang,
      rate: slowRate,
      preferredVoiceName: preferredVoice,
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleNormal}
        title={isArabic ? `اسمع النطق (${normalRate}x)` : `Listen (${normalRate}x)`}
        className={`${btnClassName} ${isSimple ? 'min-h-[56px] px-4 text-sm font-black' : 'min-h-[48px]'} bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#F8FAFC] border border-[#10B981]/50 cursor-pointer`}
        aria-label={isArabic ? `اسمع النطق (${normalRate}x)` : `Listen (${normalRate}x)`}
      >
        <Volume2 size={isSimple ? 20 : 16} className="text-[#10B981] shrink-0" />
        {showLabels && <span>{isArabic ? `اسمع (${normalRate}x)` : `Listen (${normalRate}x)`}</span>}
      </button>
      <button
        type="button"
        onClick={handleSlow}
        title={isArabic ? `بطيء وواضح (${slowRate}x)` : `Slow (${slowRate}x)`}
        className={`${btnClassName} ${isSimple ? 'min-h-[56px] px-4 text-sm font-black' : 'min-h-[48px]'} text-[#FBBF24] border-[#F59E0B]/40 bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 cursor-pointer`}
        aria-label={isArabic ? `بطيء وواضح (${slowRate}x)` : `Slow (${slowRate}x)`}
      >
        <span aria-hidden="true" className="text-sm leading-none">🐢</span>
        <span>{showLabels ? (isArabic ? `بطيء (${slowRate}x)` : `Slow (${slowRate}x)`) : `${slowRate}x`}</span>
      </button>
    </div>
  );
}
