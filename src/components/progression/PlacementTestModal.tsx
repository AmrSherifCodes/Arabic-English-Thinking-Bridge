// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CefrLevelId, PhaseId, ProgressionState } from '../../progression/types';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  FastForward,
  Sparkles,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { DualSpeedAudio } from '../DualSpeedAudio';
import { AmrGuide } from '../AmrGuide';
import { speakUnified } from '../../utils/offlineTts';
import { unlockAudio } from '../../utils/audio';
import { useUiMode } from '../../utils/uiMode';
import { getCefrLevelHierarchy } from '../../progression/courseData';
import {
  MAX_PLACEMENT_ITEMS,
  OR_BAND_DESCRIPTIONS,
  PlacementFinalResult,
  PlacementSessionState,
  calibrateCurriculumGraph,
  createInitialPlacementSession,
  finalizePlacement,
  loadAdaptiveProfile,
  mapLessonsToCurriculumNodes,
  saveAdaptiveProfile,
  selectNextDiagnosticItem,
  shouldStopPlacement,
  updatePlacementPosterior,
} from '../../engine/orAdaptiveEngine';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProgressionState;
  onCompletePlacement: (
    levelId: CefrLevelId,
    phaseId: PhaseId,
    score: number,
    meta?: {
      theta: number;
      band: string;
      masteredCount: number;
      startingNodeIndex: number;
      masteredViaPlacementIds: string[];
      activeNodeId: string | null;
    }
  ) => void;
  isArabic?: boolean;
}

export function PlacementTestModal({
  isOpen,
  onClose,
  state: _state,
  onCompletePlacement,
  isArabic = true,
}: PlacementTestModalProps) {
  const [uiMode] = useUiMode();
  const isSimple = uiMode === 'simple';

  const [session, setSession] = useState<PlacementSessionState>(() =>
    createInitialPlacementSession(0)
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [result, setResult] = useState<PlacementFinalResult | null>(null);
  const [calibrationSummary, setCalibrationSummary] = useState<{
    masteredCount: number;
    startingNodeIndex: number;
    startingNodeTitleAr: string;
    startingNodeTitleEn: string;
    masteredViaPlacementIds: string[];
    activeNodeId: string | null;
  } | null>(null);

  const itemStartTimeRef = useRef<number>(Date.now());

  const currentItem = useMemo(
    () => (result ? null : selectNextDiagnosticItem(session)),
    [session, result]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSession(createInitialPlacementSession(0));
    setSelectedOptionId(null);
    setResult(null);
    setCalibrationSummary(null);
    itemStartTimeRef.current = Date.now();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentItem || result) return;
    itemStartTimeRef.current = Date.now();
    // Auto-speak audio or prompt in Easy Mode
    if (isSimple) {
      const toSpeak = currentItem.audioText || (isArabic ? currentItem.promptAr : currentItem.promptEn);
      const lang = currentItem.audioText ? 'en-US' : isArabic ? 'ar-EG' : 'en-US';
      const timer = window.setTimeout(() => {
        void speakUnified({ text: toSpeak, lang, rate: 0.85 });
      }, 260);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, currentItem, result, isSimple, isArabic]);

  if (!isOpen) return null;

  const computeCalibrationForResult = (finalRes: PlacementFinalResult) => {
    try {
      const hierarchy = getCefrLevelHierarchy('en');
      const allLessons = hierarchy.flatMap((l) =>
        l.phases.flatMap((p) =>
          p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons))
        )
      );

      // Build unified difficulty-ordered DAG across levels
      const levelsOrder: CefrLevelId[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
      const targetLevelIdx = levelsOrder.indexOf(finalRes.levelId);
      const priorLevelLessonIds = allLessons
        .filter((l) => levelsOrder.indexOf((l.levelId || 'A1') as CefrLevelId) < targetLevelIdx)
        .map((l) => l.id);

      const levelNode = hierarchy.find((l) => l.level === finalRes.levelId) || hierarchy[0];
      const levelLessons = levelNode.phases
        .flatMap((p) => p.modules.flatMap((m) => m.units.flatMap((u) => u.lessons)))
        .slice(0, 10);

      const curriculumNodes = mapLessonsToCurriculumNodes(levelLessons, finalRes.levelId);
      const calibrated = calibrateCurriculumGraph(finalRes.theta, curriculumNodes, []);

      const masteredViaPlacementIds = Array.from(
        new Set([...priorLevelLessonIds, ...calibrated.masteredViaPlacementIds])
      );

      const activeCalibrated =
        calibrated.nodes.find((n) => n.id === calibrated.activeNodeId) || calibrated.nodes[0];
      const activeLessonObj = levelLessons.find((l) => l.id === activeCalibrated?.id) || levelLessons[0];

      return {
        masteredCount: masteredViaPlacementIds.length,
        startingNodeIndex: activeCalibrated?.index ?? 1,
        startingNodeTitleAr: activeLessonObj?.titleAr || `المرحلة ${activeCalibrated?.index ?? 1}`,
        startingNodeTitleEn: activeLessonObj?.titleEn || `Level ${activeCalibrated?.index ?? 1}`,
        masteredViaPlacementIds,
        activeNodeId: activeCalibrated?.id ?? null,
      };
    } catch {
      return {
        masteredCount: 0,
        startingNodeIndex: 1,
        startingNodeTitleAr: 'المرحلة 1',
        startingNodeTitleEn: 'Level 1',
        masteredViaPlacementIds: [],
        activeNodeId: null,
      };
    }
  };

  const handleConfirmChoice = () => {
    if (!currentItem || !selectedOptionId) return;
    const chosen = currentItem.options.find((o) => o.id === selectedOptionId);
    if (!chosen) return;

    const latencyMs = Math.max(400, Date.now() - itemStartTimeRef.current);
    const nextSession = updatePlacementPosterior(
      session,
      currentItem,
      chosen.isCorrect,
      latencyMs
    );

    setSelectedOptionId(null);

    if (shouldStopPlacement(nextSession) || !selectNextDiagnosticItem(nextSession)) {
      const finalRes = finalizePlacement(nextSession);
      const summary = computeCalibrationForResult(finalRes);

      // Persist OR adaptive profile locally
      const prevProfile = loadAdaptiveProfile();
      saveAdaptiveProfile({
        ...prevProfile,
        theta: finalRes.theta,
        sigma: finalRes.sigma,
        band: finalRes.band,
        skills: finalRes.skills,
        masteredViaPlacementIds: summary.masteredViaPlacementIds,
        activeNodeId: summary.activeNodeId,
        weakL1Patterns: finalRes.detectedWeakPatterns,
        updatedAtISO: new Date().toISOString(),
      });

      try {
        localStorage.setItem('tb.placementBand', finalRes.band);
        localStorage.setItem('tb.placementDone', 'true');
      } catch {
        // Ignore storage errors
      }

      setSession(nextSession);
      setResult(finalRes);
      setCalibrationSummary(summary);
    } else {
      setSession(nextSession);
    }
  };

  const handleFinishAndStart = () => {
    if (!result) return;
    onCompletePlacement(result.levelId, result.phaseId, result.scorePercent, {
      theta: result.theta,
      band: result.band,
      masteredCount: calibrationSummary?.masteredCount ?? 0,
      startingNodeIndex: calibrationSummary?.startingNodeIndex ?? 1,
      masteredViaPlacementIds: calibrationSummary?.masteredViaPlacementIds ?? [],
      activeNodeId: calibrationSummary?.activeNodeId ?? null,
    });
    onClose();
  };

  const handleRestart = () => {
    setSession(createInitialPlacementSession(0));
    setSelectedOptionId(null);
    setResult(null);
    setCalibrationSummary(null);
    itemStartTimeRef.current = Date.now();
  };

  const speakCurrentPrompt = () => {
    if (!currentItem) return;
    unlockAudio();
    const text = currentItem.audioText || (isArabic ? currentItem.promptAr : currentItem.promptEn);
    const lang = currentItem.audioText ? 'en-US' : isArabic ? 'ar-EG' : 'en-US';
    void speakUnified({ text, lang, rate: isSimple ? 0.85 : 0.95 });
  };

  const stepNumber = Math.min(MAX_PLACEMENT_ITEMS, session.responses.length + 1);
  const progressPct = Math.round((session.responses.length / MAX_PLACEMENT_ITEMS) * 100);

  return (
    <div
      data-testid="placement-test-modal"
      className="fixed inset-0 z-[210] bg-[#0B1120] flex flex-col h-[100dvh] w-full overflow-hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Fixed Anchor 1: Large High-Contrast Back Button + Clean Progress */}
      <header
        className="w-full border-b px-4 pt-safe pb-3 shrink-0"
        style={{ backgroundColor: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            data-testid="placement-back-btn"
            onClick={onClose}
            aria-label={isArabic ? 'رجوع' : 'Back'}
            className="min-h-[52px] px-4 rounded-2xl border-2 border-slate-500/40 bg-[#1B2742] text-[#F8FAFC] font-black text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>

          {!result ? (
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between text-xs font-black text-[#CBD5E1]">
                <span className="flex items-center gap-1.5">
                  <Compass size={14} className="text-[#10B981]" />
                  {isArabic ? 'تحديد المستوى الذكي' : 'Adaptive Placement'}
                </span>
                <span dir="ltr" className="tabular-nums text-[#10B981]">
                  {stepNumber} / {MAX_PLACEMENT_ITEMS}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#0B1120] overflow-hidden border border-slate-500/20">
                <div
                  className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                  style={{ width: `${Math.max(14, progressPct)}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRestart}
              className="min-h-[52px] px-3.5 rounded-2xl border border-slate-500/40 bg-[#0B1120] text-[#CBD5E1] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>{isArabic ? 'إعادة' : 'Retry'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Fixed Anchor 2: Center Stage Focus Card */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col justify-center">
        {!result && currentItem ? (
          <div className="w-full max-w-lg mx-auto space-y-4">
            {/* Single Clean Prompt Card + Giant Audio Button */}
            <div
              className="p-5 rounded-3xl border space-y-4 shadow-xl text-start"
              style={{ backgroundColor: '#131C31', borderColor: 'rgba(148, 163, 184, 0.2)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40">
                  {isArabic ? currentItem.badgeAr : currentItem.badgeEn}
                </span>
                <button
                  type="button"
                  onClick={speakCurrentPrompt}
                  aria-label={isArabic ? 'استمع للسؤال' : 'Listen to prompt'}
                  className="min-h-[56px] min-w-[56px] rounded-2xl bg-[#10B981]/20 border-2 border-[#10B981] text-[#10B981] flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                >
                  <Volume2 size={26} />
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-[#F8FAFC] leading-snug">
                {isArabic ? currentItem.promptAr : currentItem.promptEn}
              </h2>

              {currentItem.audioText && (
                <div className="pt-1 flex justify-center">
                  <DualSpeedAudio
                    text={currentItem.audioText}
                    targetLang="en"
                    isArabic={isArabic}
                    showLabels={true}
                    autoPlayInEasyMode={true}
                  />
                </div>
              )}
            </div>

            {/* Oversized Thumb-Zone Options */}
            <div className="space-y-3" role="radiogroup" aria-label={isArabic ? 'الاختيارات' : 'Options'}>
              {currentItem.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    data-testid={`placement-option-${opt.id}`}
                    data-correct={opt.isCorrect ? 'true' : 'false'}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full min-h-[60px] px-4 py-3.5 rounded-2xl border-2 text-start font-black text-base transition cursor-pointer active:scale-[0.98] flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#F8FAFC] shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : 'bg-[#131C31] border-slate-500/30 text-[#F8FAFC] hover:border-[#22D3EE]/60'
                    }`}
                  >
                    <span dir="auto" className="leading-snug flex-1">
                      {opt.text}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs ${
                        isSelected
                          ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]'
                          : 'border-slate-500/60'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : result ? (
          /* Transparent 1-Screen Placement Result Card */
          <div
            data-testid="placement-result-card"
            className="w-full max-w-lg mx-auto p-5 sm:p-6 rounded-3xl border-2 border-[#10B981]/60 bg-[#131C31] shadow-2xl space-y-5 text-center tb-pop-bounce"
          >
            <div className="flex justify-center">
              <AmrGuide mood="celebrate" isArabic={isArabic} size={110} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#10B981] text-[#0B1120]">
                <Sparkles size={14} />
                {isArabic ? 'تم تحديد مستواك بدقة!' : 'Your Level Is Ready!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
                {isArabic
                  ? OR_BAND_DESCRIPTIONS[result.band].labelAr
                  : OR_BAND_DESCRIPTIONS[result.band].labelEn}
              </h2>
              <p className="text-sm font-medium text-[#CBD5E1] leading-relaxed">
                {isArabic ? result.whyAr : result.whyEn}
              </p>
            </div>

            {/* Key Tailoring Metrics */}
            <div className="grid grid-cols-2 gap-3 text-start">
              <div className="p-3.5 rounded-2xl bg-[#0B1120] border border-slate-500/25 space-y-1">
                <span className="text-[11px] font-bold text-[#CBD5E1] block">
                  📍 {isArabic ? 'نقطة البداية المثالية' : 'Exact Starting Node'}
                </span>
                <span className="text-base font-black text-[#10B981] block">
                  {isArabic
                    ? `المرحلة ${calibrationSummary?.startingNodeIndex ?? 1}`
                    : `Level ${calibrationSummary?.startingNodeIndex ?? 1}`}
                </span>
                <span className="text-xs font-bold text-[#F8FAFC] block leading-snug">
                  {isArabic
                    ? calibrationSummary?.startingNodeTitleAr
                    : calibrationSummary?.startingNodeTitleEn}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1120] border border-[#F59E0B]/40 space-y-1">
                <span className="text-[11px] font-bold text-[#CBD5E1] flex items-center gap-1">
                  <FastForward size={13} className="text-[#FBBF24]" />
                  {isArabic ? 'دروس تم تجاوزها' : 'Auto-Mastered'}
                </span>
                <span className="text-base font-black text-[#FBBF24] block">
                  {calibrationSummary?.masteredCount ?? 0}{' '}
                  {isArabic ? 'درس تأسيسي' : 'Lessons'}
                </span>
                <span className="text-xs font-medium text-[#CBD5E1] block">
                  {isArabic ? 'متاحة للمراجعة بأي وقت' : 'Clickable anytime'}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Fixed Anchor 3: Single Giant Glowing Emerald 3D Thumb-Zone Primary Button */}
      <footer
        className="w-full border-t px-4 pt-3 pb-safe shrink-0"
        style={{ backgroundColor: '#131C31', borderColor: 'rgba(148, 163, 184, 0.16)' }}
      >
        <div className="max-w-lg mx-auto">
          {!result ? (
            <button
              type="button"
              data-testid="placement-continue-btn"
              disabled={!selectedOptionId}
              onClick={handleConfirmChoice}
              className={`w-full min-h-[60px] rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald disabled:bg-[#1B2742] disabled:text-[#CBD5E1]/60 disabled:border-slate-500/30 disabled:cursor-not-allowed ${
                selectedOptionId ? 'animate-anticipate' : ''
              }`}
            >
              <span>{isArabic ? 'التالي' : 'Continue'}</span>
              {isArabic ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
          ) : (
            <button
              type="button"
              data-testid="placement-start-journey-btn"
              onClick={handleFinishAndStart}
              className="w-full min-h-[62px] rounded-2xl font-black text-lg flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald animate-anticipate"
            >
              <span>{isArabic ? 'ابدأ رحلتك الآن 🚀' : 'Start Your Journey Now 🚀'}</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
