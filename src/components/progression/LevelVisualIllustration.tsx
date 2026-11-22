import React, { useMemo } from 'react';
import { getLocalLevelImageDataUrl, LevelVisualProps } from '../../utils/localLevelImageGenerator';

interface LevelVisualIllustrationProps extends LevelVisualProps {
  className?: string;
}

export function LevelVisualIllustration({
  stage,
  levelNumber,
  promptAr,
  englishTarget,
  category,
  revealTarget = false,
  className = '',
}: LevelVisualIllustrationProps) {
  const svgDataUrl = useMemo(
    () =>
      getLocalLevelImageDataUrl({
        stage,
        levelNumber,
        promptAr,
        englishTarget,
        category,
        revealTarget,
      }),
    [stage, levelNumber, promptAr, englishTarget, category, revealTarget]
  );

  return (
    <div
      className={`relative w-full max-w-[360px] mx-auto aspect-[400/220] overflow-hidden rounded-2xl shadow-lg border border-stone-800 bg-stone-950/80 flex items-center justify-center ${className}`}
    >
      <img
        src={svgDataUrl}
        alt={`Visual illustration for Level ${levelNumber} (${stage})`}
        className="w-full h-full object-contain block"
        draggable={false}
      />
    </div>
  );
}
