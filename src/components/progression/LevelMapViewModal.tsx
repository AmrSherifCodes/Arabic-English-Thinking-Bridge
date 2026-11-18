import React, { useState } from 'react';
import { CefrLevelId, PhaseId, ProgressionState } from '../../progression/types';
import {
  getCefrLevelHierarchy,
  isHierarchicalLevelUnlocked,
  isHierarchicalPhaseUnlocked,
  calculateLevelSkillNodes,
} from '../../progression/cefrHierarchy';
import { X, Lock, CheckCircle, ChevronDown, ChevronUp, Compass, Award, Crown, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelMapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProgressionState;
  onSelectPhase: (phaseId: PhaseId) => void;
  onOpenPlacementTest: () => void;
  onOpenCapstone: (levelId: CefrLevelId) => void;
  isArabic?: boolean;
}

export function LevelMapViewModal({
  isOpen,
  onClose,
  state,
  onSelectPhase,
  onOpenPlacementTest,
  onOpenCapstone,
  isArabic = true,
}: LevelMapViewModalProps) {
  const [expandedLevel, setExpandedLevel] = useState<CefrLevelId | null>(state.currentLevelId || 'A1');

  if (!isOpen) return null;

  const hierarchy = getCefrLevelHierarchy();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-2xl overflow-hidden bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/70">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">
                  {isArabic ? 'خريطة المستويات الخمسة (CEFR A1 → C1)' : '5-Tier CEFR Level Map (A1 → C1)'}
                </h2>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {isArabic ? 'مسار تعلم التفكير التراكمي بدون ترجمة' : 'Cumulative cognitive immersion roadmap'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPlacementTest}
                className="px-3 py-1.5 text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>{isArabic ? 'اختبار تحديد المستوى' : 'Placement Test'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vertical Roadmap Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {hierarchy.map((levelNode) => {
              const isUnlocked = isHierarchicalLevelUnlocked(state, levelNode.level);
              const isCurrent = state.currentLevelId === levelNode.level;
              const capResult = state.capstoneResults?.[levelNode.level];
              const isPassed = capResult?.passed || false;
              const isExpanded = expandedLevel === levelNode.level;

              // Calculate overall level completion
              const allLevelLessons = levelNode.phases.flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons)));
              const completedLessons = allLevelLessons.filter((l) => state.completedLessonIds.includes(l.id)).length;
              const completionRatio = allLevelLessons.length > 0 ? completedLessons / allLevelLessons.length : 0;
              const completionPct = Math.round(completionRatio * 100);

              const skillNodes = calculateLevelSkillNodes(state, levelNode.level);

              return (
                <div
                  key={levelNode.level}
                  className={`relative rounded-3xl border transition-all overflow-hidden ${
                    isCurrent
                      ? 'bg-stone-900 border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : isPassed
                      ? 'bg-stone-900/80 border-emerald-500/40'
                      : isUnlocked
                      ? 'bg-stone-900/50 border-stone-800 hover:border-stone-700'
                      : 'bg-stone-950/40 border-stone-800/50 opacity-60'
                  }`}
                >
                  {/* Level Header Banner */}
                  <div
                    onClick={() => setExpandedLevel(isExpanded ? null : levelNode.level)}
                    className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Level Badge */}
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-base border shadow-inner ${
                          isPassed
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isCurrent
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                            : isUnlocked
                            ? 'bg-stone-800 text-stone-200 border-stone-700'
                            : 'bg-stone-950 text-stone-600 border-stone-800'
                        }`}
                      >
                        {isUnlocked ? levelNode.level : <Lock className="w-5 h-5 text-stone-600" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">
                            {isArabic ? levelNode.titleAr : levelNode.titleEn}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full">
                              {isArabic ? 'الحالي' : 'Current'}
                            </span>
                          )}
                          {isPassed && (
                            <span className="px-2 py-0.5 text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>{isArabic ? 'مكتمل' : 'Passed'}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5 max-w-md line-clamp-1">
                          {isArabic ? levelNode.descriptionAr : levelNode.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left hidden sm:block">
                        <div className="text-xs font-bold text-white">{completionPct}%</div>
                        <div className="text-[10px] text-stone-400">
                          {isArabic ? `${completedLessons}/${allLevelLessons.length} درس` : `${completedLessons}/${allLevelLessons.length} lessons`}
                        </div>
                      </div>

                      <div className="p-1.5 text-stone-400 hover:text-white rounded-full bg-stone-800/50">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="w-full h-1 bg-stone-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>

                  {/* Expanded Level Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-stone-800/80 bg-stone-950/40 space-y-4">
                      {/* Skill Radar summary strip */}
                      <div className="grid grid-cols-4 gap-2 bg-stone-900/80 p-3 rounded-2xl border border-stone-800">
                        {(['grammar', 'vocabulary', 'pronunciation', 'listening'] as const).map((branch) => {
                          const pct = Math.round((skillNodes[branch]?.mastery || 0) * 100);
                          const labels: Record<string, string> = {
                            grammar: isArabic ? 'القواعد' : 'Grammar',
                            vocabulary: isArabic ? 'المفردات' : 'Vocab',
                            pronunciation: isArabic ? 'النطق' : 'Pronunciation',
                            listening: isArabic ? 'الاستماع' : 'Listening',
                          };
                          return (
                            <div key={branch} className="text-center">
                              <div className="text-[10px] text-stone-400">{labels[branch]}</div>
                              <div className="text-xs font-bold text-amber-400 mt-0.5">{pct}%</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Can-Do count & Capstone action */}
                      <div className="flex items-center justify-between text-xs text-stone-300">
                        <span className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>{isArabic ? `5 معايير إتقان (Can-Do)` : `5 Can-Do Competencies`}</span>
                        </span>

                        {isUnlocked && (
                          <button
                            onClick={() => onOpenCapstone(levelNode.level)}
                            className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl transition-all flex items-center gap-1"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'اختبار الإتقان الختامي' : 'Capstone Exam'}</span>
                          </button>
                        )}
                      </div>

                      {/* Phase List */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                          {isArabic ? 'مراحل المستوى (Phases)' : 'Level Phases'}
                        </h4>

                        <div className="grid grid-cols-1 gap-2">
                          {levelNode.phases.map((phase) => {
                            const isPhaseUnlocked = isHierarchicalPhaseUnlocked(state, phase.id);
                            const isPhaseCurrent = state.currentPhaseId === phase.id;

                            const phaseLessons = phase.modules.flatMap((m) => m.units.flatMap((u) => u.lessons));
                            const phaseCompleted = phaseLessons.filter((l) => state.completedLessonIds.includes(l.id)).length;

                            return (
                              <div
                                key={phase.id}
                                onClick={() => {
                                  if (isPhaseUnlocked) {
                                    onSelectPhase(phase.id);
                                    onClose();
                                  }
                                }}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                  isPhaseUnlocked
                                    ? 'bg-stone-900 border-stone-800 hover:border-amber-500/40 hover:bg-stone-850 cursor-pointer'
                                    : 'bg-stone-950/60 border-stone-900 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                      isPhaseCurrent
                                        ? 'bg-amber-500 text-stone-950 font-black'
                                        : isPhaseUnlocked
                                        ? 'bg-stone-800 text-amber-400'
                                        : 'bg-stone-950 text-stone-600'
                                    }`}
                                  >
                                    {isPhaseUnlocked ? phase.id : <Lock className="w-3.5 h-3.5" />}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-white">
                                      {isArabic ? phase.titleAr : phase.titleEn}
                                    </div>
                                    <div className="text-[11px] text-stone-400">
                                      {isArabic ? `${phase.modules.length} موديول · ~${phase.estimatedMinutes} دقيقة` : `${phase.modules.length} modules · ~${phase.estimatedMinutes} mins`}
                                    </div>
                                  </div>
                                </div>

                                {isPhaseUnlocked && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-stone-400">
                                      {phaseCompleted}/{phaseLessons.length}
                                    </span>
                                    <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/80 text-center">
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
