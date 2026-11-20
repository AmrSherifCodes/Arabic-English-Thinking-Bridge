import React from 'react';
import { Volume2, Turtle } from 'lucide-react';
import { speakWithRate, unlockAudio } from '../utils/audio';

interface DualSpeedAudioProps {
  text: string;
  preferredVoice?: string;
  className?: string;
  btnClassName?: string;
  showLabels?: boolean;
}

export function DualSpeedAudio({ text, preferredVoice, className = 'flex flex-wrap justify-center gap-2 mt-3', btnClassName = 'px-4 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center gap-2 text-xs font-bold active:translate-y-1', showLabels = true }: DualSpeedAudioProps) {
  const handleNormal = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    speakWithRate(text, 1.0, preferredVoice);
  };

  const handleSlow = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    speakWithRate(text, 0.75, preferredVoice);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleNormal}
        title="اسمع النطق (1.0x)"
        className={`${btnClassName} min-h-[44px] bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/50 shadow-md animate-pulse focus:animate-none hover:animate-none`}
        aria-label="Play normal speed"
      >
        <Volume2 size={16} />
        {showLabels && <span>🔊 اسمع (1.0x)</span>}
      </button>
      <button
        type="button"
        onClick={handleSlow}
        title="بطيء وواضح (0.75x)"
        className={`${btnClassName} min-h-[44px] text-amber-400 border-amber-500/30 hover:bg-amber-950/40`}
        aria-label="Play slow speed"
      >
        <Turtle size={16} />
        {showLabels && <span>🐢 بالراحة (0.75x)</span>}
      </button>
    </div>
  );
}
