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
  className = 'w-full h-auto aspect-[400/220] max-h-[180px] sm:max-h-[220px]',
}: LevelVisualIllustrationProps) {
  const imageDataUrl = useMemo(
    () =>
      getLocalLevelImageDataUrl({
        stage,
        levelNumber,
        promptAr,
        englishTarget,
        category,
      }),
    [stage, levelNumber, promptAr, englishTarget, category]
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg border border-stone-800 bg-stone-950/80 flex items-center justify-center ${className}`}>
      <img
        src={imageDataUrl}
        alt={`Local Python visual artwork for Level ${levelNumber} (${stage})`}
        className="w-full h-full object-contain select-none"
        loading="lazy"
      />
    </div>
  );
}
