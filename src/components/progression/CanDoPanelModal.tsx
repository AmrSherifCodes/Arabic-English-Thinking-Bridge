import React from 'react';
import { CefrLevelId, ProgressionState } from '../../progression/types';
import { getCefrLevelHierarchy } from '../../progression/cefrHierarchy';
import { X, CheckCircle2, Circle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CanDoPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelId: CefrLevelId;
  state: ProgressionState;
  onToggleCanDo?: (canDoId: string) => void;
  isArabic?: boolean;
}

export function CanDoPanelModal({
  isOpen,
  onClose,
  levelId,
  state,
  onToggleCanDo,
  isArabic = true,
}: CanDoPanelModalProps) {
  if (!isOpen) return null;

  const hierarchy = getCefrLevelHierarchy();
  const levelNode = hierarchy.find((l) => l.level === levelId) || hierarchy[0];
  const canDoProgress = state.canDoProgress || {};

  const total = levelNode.canDo.length;
  const completed = levelNode.canDo.filter((item) => canDoProgress[item.id]).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[85dvh]"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-900/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? `معايير الإتقان (Can-Do) — ${levelNode.level}` : `Can-Do Statements — ${levelNode.level}`}
                </h3>
                <p className="text-xs text-stone-400">
                  {isArabic ? `${completed} من ${total} محققة (${percent}%)` : `${completed} of ${total} achieved (${percent}%)`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Ring Bar */}
          <div className="px-5 py-3 bg-stone-950/60 border-b border-stone-800/80">
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Statements List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {levelNode.canDo.map((item) => {
              const isChecked = !!canDoProgress[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleCanDo && onToggleCanDo(item.id)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-stone-800/40 border-stone-800/80 text-stone-300 hover:border-stone-700 hover:bg-stone-800/60'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-amber-400 focus:outline-none">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-500" />
                    )}
                  </button>
                  <div className="flex-1 text-sm leading-relaxed">
                    <p className="font-medium text-white">{isArabic ? item.textAr : item.textEn}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{isArabic ? item.textEn : item.textAr}</p>
                  </div>
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
              {isArabic ? 'إغلاق المعايير' : 'Close Panel'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
