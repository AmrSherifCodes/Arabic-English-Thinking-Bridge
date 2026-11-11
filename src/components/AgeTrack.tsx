import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';

type LearnerTrack = NonNullable<UserProfile['learnerTrack']>;
type AgeBand = NonNullable<UserProfile['ageBand']>;

export interface AgeTrackSliderProps {
  value: LearnerTrack | null;
  ageBand: AgeBand | null;
  onChange: (track: LearnerTrack, ageBand: AgeBand | null) => void;
  isArabic: boolean;
}

const STOPS = [
  {
    index: 1,
    track: 'kg_primary' as LearnerTrack,
    ageBand: '4-11' as AgeBand,
    emoji: '🧒',
    labelAr: 'طفل',
    labelEn: 'KG & Primary',
    hintEn: 'Family, colors, animals',
    fontScale: 1.15,
    audio: 'Auto-play ON',
    grammar: 'Zero terminology',
    ageRange: '(4-11)'
  },
  {
    index: 2,
    track: 'prep_stage' as LearnerTrack,
    ageBand: '12-14' as AgeBand,
    emoji: '🎒',
    labelAr: 'إعدادي',
    labelEn: 'Prep',
    hintEn: 'Sentence building',
    fontScale: 1.0,
    audio: 'Tap-to-hear',
    grammar: 'Minimal terms',
    ageRange: '(12-14)'
  },
  {
    index: 3,
    track: 'thanawiya_igcse' as LearnerTrack,
    ageBand: '15-18' as AgeBand,
    emoji: '🎓',
    labelAr: 'ثانوي',
    labelEn: 'Thanawiya',
    hintEn: 'Connectors, aspect',
    fontScale: 1.0,
    audio: 'Tap-to-hear',
    grammar: 'Connectors, aspect',
    ageRange: '(15-18)'
  },
  {
    index: 4,
    track: 'uni_career' as LearnerTrack,
    ageBand: '18-30' as AgeBand,
    emoji: '🚀',
    labelAr: 'جامعة وشغل',
    labelEn: 'Uni / Career',
    hintEn: 'Workplace, tech',
    fontScale: 1.0,
    audio: 'Tap-to-hear',
    grammar: 'Full terminology',
    ageRange: '(18-30)'
  },
  {
    index: 5,
    track: 'uni_career' as LearnerTrack,
    ageBand: '30+' as AgeBand,
    emoji: '🏛',
    labelAr: 'محترف وأسرة',
    labelEn: 'Pro / Parent',
    hintEn: 'Career + travel',
    fontScale: 1.05,
    audio: 'Tap-to-hear',
    grammar: 'Full terminology',
    ageRange: '(30+)'
  }
];

export function AgeTrackSlider({ value, ageBand, onChange, isArabic }: AgeTrackSliderProps) {
  const currentIndex = STOPS.find(s => s.ageBand === ageBand)?.index || 3;
  const [sliderValue, setSliderValue] = useState<number>(currentIndex);

  useEffect(() => {
    if (ageBand) {
      const stop = STOPS.find(s => s.ageBand === ageBand);
      if (stop) setSliderValue(stop.index);
    }
  }, [ageBand]);

  const selectedStop = STOPS[sliderValue - 1];

  const handlePointerUp = () => {
    onChange(selectedStop.track, selectedStop.ageBand);
  };

  const handleSkip = () => {
    onChange('street_starter', null);
  };

  const fillPercentage = ((sliderValue - 1) / (STOPS.length - 1)) * 100;
  const fillStyle = isArabic
    ? { right: 0, width: `${fillPercentage}%`, left: 'auto' }
    : { left: 0, width: `${fillPercentage}%`, right: 'auto' };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center space-y-6 select-none" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="relative w-full px-4 mt-2">
        <div className="flex justify-between relative z-10 w-full mb-3">
          {STOPS.map((stop) => {
            const isSelected = stop.index === sliderValue;
            return (
              <div
                key={stop.index}
                onClick={() => {
                  setSliderValue(stop.index);
                  onChange(stop.track, stop.ageBand);
                }}
                className={`flex flex-col items-center justify-end cursor-pointer group min-w-[48px] transition-all
                  ${isSelected ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-100'}`}
                aria-label={`${stop.labelAr} ${stop.ageRange}`}
              >
                <span className="text-2xl mb-1 filter drop-shadow-md">{stop.emoji}</span>
                <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap ${isSelected ? 'text-amber-400' : 'text-stone-300'}`}>
                  {isArabic ? stop.labelAr : stop.labelEn}
                </span>
                <span className="text-[9px] text-stone-500 font-mono mt-0.5">{stop.ageRange}</span>
              </div>
            );
          })}
        </div>

        <div className="relative h-3 w-full bg-stone-800 rounded-full shadow-inner overflow-visible">
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all duration-200"
            style={fillStyle}
          />
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
            onPointerUp={handlePointerUp}
            onTouchEnd={handlePointerUp}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing"
            aria-valuetext={`${selectedStop.labelAr} ${selectedStop.ageRange}`}
            style={{ direction: isArabic ? 'rtl' : 'ltr' }}
          />
        </div>
      </div>

      <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-col space-y-3 transition-all duration-300">
        <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
          <span>{selectedStop.emoji}</span>
          <span>{isArabic ? `نمط: ${selectedStop.labelAr}` : `Mode: ${selectedStop.labelEn}`}</span>
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-stone-300">
          <div className="bg-stone-950/50 p-2.5 rounded-xl border border-stone-800/50">
            <span className="block text-stone-500 mb-1">{isArabic ? 'الخط' : 'Font Scale'}</span>
            <span className="font-semibold text-stone-200">{selectedStop.fontScale}x</span>
          </div>
          <div className="bg-stone-950/50 p-2.5 rounded-xl border border-stone-800/50">
            <span className="block text-stone-500 mb-1">{isArabic ? 'الصوت' : 'Audio'}</span>
            <span className="font-semibold text-stone-200">{selectedStop.audio}</span>
          </div>
          <div className="col-span-2 bg-stone-950/50 p-2.5 rounded-xl border border-stone-800/50">
            <span className="block text-stone-500 mb-1">{isArabic ? 'التركيز' : 'Focus'}</span>
            <span className="font-semibold text-stone-200">{selectedStop.hintEn}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="text-stone-500 hover:text-stone-300 text-sm font-medium transition-colors underline underline-offset-4 decoration-stone-700/50 pt-2"
      >
        {isArabic ? 'تخطي / أبدأ من تحت الصفر' : 'Skip / Start from absolute zero'}
      </button>
    </div>
  );
}