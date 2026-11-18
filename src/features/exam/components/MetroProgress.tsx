/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React from 'react';

export const STATIONS = [
  { nameAr: 'الرمل', questions: 4 },
  { nameAr: 'سيدي جابر', questions: 4 },
  { nameAr: 'العطارين', questions: 4 },
  { nameAr: 'محطة مصر', questions: 4 },
  { nameAr: 'المنصورة', questions: 4 },
] as const;

interface MetroProgressProps {
  answeredCount: number; // 0 to 20
  supporterMode?: boolean;
}

export const MetroProgress: React.FC<MetroProgressProps> = ({
  answeredCount,
  supporterMode = false,
}) => {
  const totalQuestions = 20;
  const currentStationIndex = Math.min(
    Math.floor(answeredCount / 4),
    STATIONS.length - 1
  );
  const isFinished = answeredCount >= totalQuestions;

  return (
    <div className="w-full bg-stone-900/90 rounded-2xl p-3 border border-teal-900/40 backdrop-blur-md shadow-lg font-arabic">
      {/* Metro Line Header */}
      <div className="flex items-center justify-between text-xs text-stone-400 mb-2 px-1">
        <span className="font-bold text-teal-400">خط مترو الإسكندرية 🚉</span>
        <span className="font-mono text-stone-300">
          {answeredCount} / {totalQuestions}
        </span>
      </div>

      {/* Metro Station Nodes Bar */}
      <div className="relative flex items-center justify-between px-2 my-2">
        {/* Track Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1.5 -translate-y-1/2 bg-stone-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              supporterMode
                ? 'bg-gradient-to-r from-teal-500 via-amber-400 to-amber-300 shadow-[0_0_8px_#D4A94A]'
                : 'bg-teal-500'
            }`}
            style={{
              width: `${Math.min((answeredCount / totalQuestions) * 100, 100)}%`,
            }}
            data-supporter={supporterMode ? 'true' : undefined}
          />
        </div>

        {/* 5 Alexandrian Stations */}
        {STATIONS.map((station, idx) => {
          const stationTarget = (idx + 1) * 4;
          const isPassed = answeredCount >= stationTarget;
          const isCurrent = currentStationIndex === idx && !isFinished;

          return (
            <div
              key={station.nameAr}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isPassed
                    ? 'bg-teal-500 text-stone-950 ring-4 ring-teal-950 font-bold text-[10px]'
                    : isCurrent
                    ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-950/80 animate-pulse font-bold text-[10px]'
                    : 'bg-stone-800 text-stone-500 border border-stone-700'
                }`}
              >
                {isPassed ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-arabic transition-colors ${
                  isCurrent || isPassed
                    ? 'text-teal-300 font-bold'
                    : 'text-stone-500'
                }`}
              >
                {station.nameAr}
              </span>
            </div>
          );
        })}

        {/* Destination Node: القاهرة (Cairo Arrival) */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
              isFinished
                ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/50 shadow-[0_0_12px_#D4A94A] font-bold text-xs animate-bounce'
                : 'bg-stone-800 text-stone-500 border border-amber-900/40'
            }`}
          >
            {isFinished ? '🏆' : '📍'}
          </div>
          <span
            className={`text-xs mt-1 font-arabic transition-colors ${
              isFinished
                ? 'text-amber-300 font-black tracking-wide'
                : 'text-stone-500'
            }`}
          >
            {isFinished ? 'وصلت القاهرة 🚉' : 'القاهرة'}
          </span>
        </div>
      </div>
    </div>
  );
};
