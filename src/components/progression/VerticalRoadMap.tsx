import React from 'react';
import { PROGRESSION_LEVELS } from '../../data/progressionLevels';
import { LockKeyhole, MapPin } from 'lucide-react';
import { ProgressionState } from '../../progression/types';

interface VerticalRoadMapProps {
  currentLevelId: number; // 1 to 10
  isArabic: boolean;
  state: ProgressionState;
}

export function VerticalRoadMap({ currentLevelId, isArabic, state }: VerticalRoadMapProps) {
  // We'll calculate the 3-pip stage tracker (● ● ○) based on the level's completion.
  // Assuming each level has 3 stages (Stage 1, Stage 2, Stage 3).
  // For now, we mock the progress based on currentLevelId.
  const getPips = (levelId: number) => {
    if (levelId < currentLevelId) return [true, true, true]; // Completed
    if (levelId === currentLevelId) {
      // Logic for current level pips can be derived from state, assuming 0 to 3 stages.
      return [true, false, false]; // Mock: 1 out of 3
    }
    return [false, false, false]; // Locked
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto py-8 space-y-6 relative">
      {/* Background connector line */}
      <div className="absolute top-12 bottom-12 left-1/2 w-1.5 -translate-x-1/2 bg-stone-800 z-0"></div>

      {PROGRESSION_LEVELS.map((level, index) => {
        const isCurrent = level.id === currentLevelId;
        const isCompleted = level.id < currentLevelId;
        const isLocked = level.id > currentLevelId;
        const pips = getPips(level.id);

        return (
          <div key={level.id} className="relative z-10 w-full flex flex-col items-center">
            {/* Glowing active node beacon */}
            {isCurrent && (
              <div className="mb-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
                <MapPin size={14} />
                <span>📍 أنت هنا الآن (المستوى {level.id} من 10)</span>
              </div>
            )}

            {/* Circular node with line */}
            <div className="relative flex justify-center items-center overflow-visible p-3 my-1">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-4 transition-all duration-300 ${
                  isCurrent
                    ? 'bg-amber-500 border-amber-300 text-stone-900 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-110'
                    : isCompleted
                    ? 'bg-emerald-500 border-emerald-300 text-stone-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-stone-800 border-stone-600 text-stone-400'
                }`}
              >
                {isLocked ? <LockKeyhole size={20} /> : level.id}
              </div>
            </div>

            {/* Titled Preview Card */}
            <div
              className={`mt-3 w-full sm:w-[90%] p-4 rounded-3xl border ${
                isCurrent
                  ? 'bg-stone-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : isCompleted
                  ? 'bg-stone-900/80 border-emerald-500/30'
                  : 'bg-stone-950/60 border-stone-800'
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-base font-black ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-50' : 'text-stone-300'} break-words whitespace-normal`}>
                  {level.titleAr}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full shrink-0 ml-2">
                  {level.cefr}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium mb-3 dir-ltr text-left">
                {level.subtitleEn}
              </p>

              {/* 3-pip stage tracker */}
              <div className="flex items-center justify-between border-t border-stone-800/50 pt-3">
                <span className="text-[10px] font-bold text-stone-500">
                  {isArabic ? 'المراحل:' : 'Stages:'}
                </span>
                <div className="flex gap-1.5">
                  {pips.map((filled, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        filled
                          ? isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.6)]'
                          : 'bg-stone-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
