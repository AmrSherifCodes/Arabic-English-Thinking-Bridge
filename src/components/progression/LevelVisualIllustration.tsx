import React, { useMemo } from 'react';
import { getSceneContextForExercise } from '../../utils/emojiMapper';
import { LevelVisualProps } from '../../utils/localLevelImageGenerator';

interface LevelVisualIllustrationProps extends LevelVisualProps {
  className?: string;
  isArabic?: boolean;
}

export function LevelVisualIllustration({
  stage,
  levelNumber,
  promptAr,
  englishTarget,
  revealTarget = false,
  isArabic = true,
  className = '',
}: LevelVisualIllustrationProps) {
  const scene = useMemo(
    () => getSceneContextForExercise(englishTarget || '', promptAr || '', stage || 'A1', levelNumber),
    [englishTarget, promptAr, stage, levelNumber]
  );

  const cleanPrompt = (promptAr || '').replace(/["']/g, '').trim();
  const cleanTarget = revealTarget ? (englishTarget || '').replace(/["']/g, '').trim() : '';
  const displayTitle = isArabic
    ? scene.categoryTitleAr || 'التواصل اليومي'
    : scene.categoryTitleEn || 'Everyday English';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`relative w-full max-w-[360px] mx-auto overflow-hidden rounded-2xl shadow-lg border border-stone-800 px-3.5 py-3 flex flex-col justify-between gap-2.5 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${scene.theme.primaryBg} 0%, ${scene.theme.secondaryBg} 75%, #05080d 100%)`,
      }}
      aria-label={`Visual illustration for Level ${levelNumber} (${stage})`}
    >
      {/* Top Status Strip */}
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
        <span
          className="px-2.5 py-0.5 rounded-full border truncate"
          style={{
            backgroundColor: scene.theme.badgeBg,
            borderColor: scene.theme.accentColor,
            color: scene.theme.badgeText,
          }}
        >
          {isArabic ? `تمرين ${levelNumber}` : `Step ${levelNumber}`}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-black/45 border border-white/15 text-slate-200 truncate">
          {displayTitle}
        </span>
      </div>

      {/* Central Visual Scene Orbs */}
      <div className="relative flex items-center justify-center gap-5 py-1.5" aria-hidden="true">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl border bg-white/5 shrink-0"
          style={{ borderColor: scene.theme.accentColor }}
        >
          {scene.leftEmoji}
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 bg-black/55 shadow-lg shrink-0"
          style={{
            borderColor: scene.theme.accentColor,
            boxShadow: `0 0 24px ${scene.theme.glowColor}`,
          }}
        >
          {scene.mainEmoji}
        </div>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl border bg-white/5 shrink-0"
          style={{ borderColor: scene.theme.accentColor }}
        >
          {scene.rightEmoji}
        </div>
      </div>

      {/* Revealed Answer (only after answering) */}
      {revealTarget && cleanTarget && (
        <p
          dir="ltr"
          className="text-center text-sm font-black leading-snug break-words"
          style={{ color: scene.theme.accentColor }}
        >
          {cleanTarget}
        </p>
      )}

      {/* Prompt Footer (only when non-empty — never empty quotes) */}
      {cleanPrompt && (
        <div className="px-3 py-2 rounded-xl bg-black/65 border border-white/15 text-center">
          <p className="text-xs sm:text-sm font-extrabold text-[#F7F0E0] leading-snug break-words">
            {cleanPrompt}
          </p>
        </div>
      )}
    </div>
  );
}
