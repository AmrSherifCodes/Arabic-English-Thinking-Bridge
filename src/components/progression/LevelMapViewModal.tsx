import React from 'react';
import { CefrLevelId, PhaseId, ProgressionState } from '../../progression/types';
import { X, Map, MapPin, LockKeyhole } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROGRESSION_LEVELS } from '../../data/progressionLevels';
import { GERMAN_PROGRESSION_LEVELS } from '../../data/germanProgressionLevels';
import { TargetLanguage } from '../../types';

interface LevelMapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProgressionState;
  onSelectPhase: (phaseId: PhaseId) => void;
  onOpenPlacementTest: () => void;
  onOpenCapstone: (levelId: CefrLevelId) => void;
  isArabic?: boolean;
  targetLang?: TargetLanguage;
}

export function LevelMapViewModal({
  isOpen,
  onClose,
  state,
  isArabic = true,
  targetLang = 'en',
}: LevelMapViewModalProps) {
  if (!isOpen) return null;

  const levelsToRender = targetLang === 'de' ? GERMAN_PROGRESSION_LEVELS : PROGRESSION_LEVELS;

  // Let's derive a current level index based on the 10 stages
  // mapped from state.currentStage or state.completedLessonIds
  const currentStageIndex = (() => {
    const stageMap: Record<string, number> = {
      'Pre-A0': 1,
      'A0': 2,
      'A1': 3,
      'A1+': 4,
      'A2': 5,
      'B1': 6,
      'B1+': 7,
      'B2': 8,
      'C1': 9,
      'C1+': 10
    };
    return stageMap[state.currentStage || 'Pre-A0'] || 1;
  })();

  const getPips = (levelId: number) => {
    if (levelId < currentStageIndex) return [true, true, true];
    if (levelId === currentStageIndex) return [true, false, false];
    return [false, false, false];
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-2xl overflow-hidden bg-[#0B1C33] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-[#061224]/90 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">
                  {isArabic ? 'خريطة جسر التفكير (10 مستويات) ⚓' : '10-Level Thinking Bridge Map ⚓'}
                </h2>
              </div>
              <p className="text-xs text-cyan-300/80 mt-0.5">
                {isArabic ? 'مسار تعلم التفكير التراكمي بدون ترجمة' : 'Cumulative cognitive immersion roadmap'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vertical Roadmap Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 relative">
            {/* Background connector line */}
            <div className="absolute top-12 bottom-12 left-1/2 w-1.5 -translate-x-1/2 bg-stone-800 z-0 hidden sm:block"></div>

            <div className="flex flex-col items-center space-y-6 sm:space-y-12">
              {levelsToRender.map((level) => {
                const isCurrent = level.id === currentStageIndex;
                const isCompleted = level.id < currentStageIndex;
                const isLocked = level.id > currentStageIndex;
                const pips = getPips(level.id);

                return (
                  <div key={level.id} className="relative z-10 w-full flex flex-col items-center">
                    {/* Glowing active node beacon */}
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
                      >
                        <MapPin size={16} />
                        <span>📍 {isArabic ? 'أنت هنا الآن' : 'You are here'} (المستوى {level.id} من 10)</span>
                      </motion.div>
                    )}

                    {/* Circular node with line */}
                    <div className="relative flex justify-center items-center overflow-visible p-3 my-1">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 transition-all duration-300 ${
                          isCurrent
                            ? 'bg-amber-500 border-amber-300 text-stone-900 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-110 z-20'
                            : isCompleted
                            ? 'bg-emerald-500 border-emerald-300 text-stone-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-stone-800 border-stone-600 text-stone-400 opacity-80'
                        }`}
                      >
                        {isLocked ? <LockKeyhole size={24} /> : level.id}
                      </div>
                    </div>

                    {/* Titled Preview Card */}
                    <div
                      className={`mt-4 w-full sm:w-[85%] p-5 rounded-3xl border transition-all ${
                        isCurrent
                          ? 'bg-stone-900 border-amber-500/50 shadow-xl shadow-amber-500/10'
                          : isCompleted
                          ? 'bg-stone-900/80 border-emerald-500/30'
                          : 'bg-stone-950/60 border-stone-800 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2.5 gap-2">
                        <h3 className={`text-base font-black leading-snug ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-50' : 'text-stone-300'} break-words whitespace-normal`}>
                          {level.titleAr}
                        </h3>
                        <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full shrink-0 ${
                          isCurrent ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                          : 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30'
                        }`}>
                          {level.cefr}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 font-medium mb-4 dir-ltr text-left">
                        {level.subtitleEn}
                      </p>

                      {/* 3-pip stage tracker */}
                      <div className="flex items-center justify-between border-t border-stone-800/50 pt-3.5 mt-2">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                          {isArabic ? 'المراحل (Stages):' : 'Stages:'}
                        </span>
                        <div className="flex gap-2">
                          {pips.map((filled, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                filled
                                  ? isCompleted
                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                  : 'bg-stone-800 inset-shadow-sm'
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
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/80 text-center relative z-20">
            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-2xl transition-all shadow-lg shadow-amber-500/20"
            >
              {isArabic ? 'العودة للمسار' : 'Back to Roadmap'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
