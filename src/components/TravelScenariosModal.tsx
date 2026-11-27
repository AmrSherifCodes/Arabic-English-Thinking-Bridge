// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  Eye,
  EyeOff,
  CheckCircle2,
  BookmarkPlus,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Award,
} from 'lucide-react';
import type { TargetLanguage } from '../types';
import {
  TRAVEL_SCENARIOS,
  TravelScenario,
  ScenarioChoice,
  ScenarioLang,
  VoiceGradeResult,
  resolveScenarioLang,
  gradeVoiceReply,
  loadCompletedTravelScenarios,
  markTravelScenarioCompleted,
} from '../data/travelScenariosData';
import { listenOnceForSpeech, stopActiveSpeechListening } from '../native/travelSpeech';
import { speakUnified } from '../utils/offlineTts';
import { unlockWordInBank, playPentatonicChime, playSoftRetryTone } from '../utils/wordBank';

interface TravelScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLang: TargetLanguage;
  isArabic?: boolean;
  onXpEarned?: (xp: number) => void;
  onToast?: (msg: string) => void;
}

const LANG_PILL: Record<ScenarioLang, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'EN' },
  de: { flag: '🇩🇪', label: 'DE' },
  es: { flag: '🇪🇸', label: 'ES' },
  it: { flag: '🇮🇹', label: 'IT' },
  fr: { flag: '🇫🇷', label: 'FR' },
  ar: { flag: '🇪🇬', label: 'AR' },
};

const TONE_BADGE: Record<
  'polite' | 'natural' | 'survival',
  { ar: string; en: string; color: string; bg: string }
> = {
  polite: { ar: 'مهذّب', en: 'Polite', color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.14)' },
  natural: { ar: 'طبيعي', en: 'Natural Native', color: '#10B981', bg: 'rgba(16, 185, 129, 0.16)' },
  survival: { ar: 'سريع', en: 'Quick Survival', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.16)' },
};

export const TravelScenariosModal: React.FC<TravelScenariosModalProps> = ({
  isOpen,
  onClose,
  targetLang,
  isArabic = true,
  onXpEarned,
  onToast,
}) => {
  const [activeLang, setActiveLang] = useState<ScenarioLang>(() => resolveScenarioLang(targetLang));
  const [completedIds, setCompletedIds] = useState<string[]>(() => loadCompletedTravelScenarios());
  const [activeScenario, setActiveScenario] = useState<TravelScenario | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [showPeekTranslation, setShowPeekTranslation] = useState(false);

  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceGrade, setVoiceGrade] = useState<VoiceGradeResult | null>(null);
  const [voiceBonusXp, setVoiceBonusXp] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedAllPhrases, setSavedAllPhrases] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveLang(resolveScenarioLang(targetLang));
      setCompletedIds(loadCompletedTravelScenarios());
    } else {
      void stopActiveSpeechListening();
      setIsListeningVoice(false);
    }
  }, [isOpen, targetLang]);

  const currentTurn = useMemo(
    () => (activeScenario ? activeScenario.turns[turnIndex] || null : null),
    [activeScenario, turnIndex]
  );

  const speakLine = useCallback(
    (text: string, rate = 1.0) => {
      if (!text.trim()) return;
      void speakUnified({ text, lang: activeLang, rate });
    },
    [activeLang]
  );

  // Auto-play stranger's native line when entering a turn
  useEffect(() => {
    if (!isOpen || !activeScenario || !currentTurn || isCompleted) return;
    setShowPeekTranslation(false);
    setSelectedChoice(null);
    setVoiceGrade(null);
    const line = currentTurn.strangerLine[activeLang];
    const timer = window.setTimeout(() => {
      speakLine(line, 1.0);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [isOpen, activeScenario, currentTurn, turnIndex, activeLang, isCompleted, speakLine]);

  const startScenario = (scenario: TravelScenario) => {
    setActiveScenario(scenario);
    setTurnIndex(0);
    setSelectedChoice(null);
    setVoiceGrade(null);
    setVoiceBonusXp(0);
    setIsCompleted(false);
    setSavedAllPhrases(false);
    setShowPeekTranslation(false);
  };

  const exitScenario = () => {
    void stopActiveSpeechListening();
    setIsListeningVoice(false);
    setActiveScenario(null);
    setIsCompleted(false);
  };

  const handleChooseReply = (choice: ScenarioChoice) => {
    setSelectedChoice(choice);
    playPentatonicChime(turnIndex + 1);
    speakLine(choice.strangerReaction[activeLang], 1.0);
  };

  const handleVoiceReply = async () => {
    if (!currentTurn) return;
    if (isListeningVoice) {
      await stopActiveSpeechListening();
      setIsListeningVoice(false);
      return;
    }

    setIsListeningVoice(true);
    setVoiceGrade(null);
    const result = await listenOnceForSpeech({
      lang: activeLang,
      prompt: isArabic ? 'جاوب بصوتك...' : 'Speak your reply...',
    });
    setIsListeningVoice(false);

    const expectedPhrases = currentTurn.choices.map((c) => c.text[activeLang]);
    const graded = gradeVoiceReply(result.transcript, expectedPhrases);
    setVoiceGrade(graded);

    if (graded.passed) {
      playPentatonicChime(4);
      setVoiceBonusXp((prev) => prev + graded.xpEarned);
      const matched = currentTurn.choices[graded.matchedChoiceIndex] || currentTurn.choices[1];
      setSelectedChoice(matched);
      speakLine(matched.strangerReaction[activeLang], 1.0);
    } else {
      playSoftRetryTone();
    }
  };

  const handleAdvanceTurn = () => {
    if (!activeScenario) return;
    if (turnIndex + 1 < activeScenario.turns.length) {
      setTurnIndex((i) => i + 1);
      return;
    }
    // Scenario completed! Award +50 XP + voice bonus XP
    const totalXp = 50 + voiceBonusXp;
    const updatedCompleted = markTravelScenarioCompleted(activeScenario.id);
    setCompletedIds(updatedCompleted);
    onXpEarned?.(totalXp);
    playPentatonicChime(6);
    setIsCompleted(true);
  };

  const handleSaveAllScenarioPhrases = () => {
    if (!activeScenario) return;
    let savedCount = 0;
    for (const turn of activeScenario.turns) {
      // Save the Natural Native reply + Stranger key phrase
      const natural = turn.choices[1] || turn.choices[0];
      unlockWordInBank({
        word: natural.text[activeLang],
        translationAr: natural.meaningAr,
        targetLang: activeLang,
      });
      savedCount += 1;
    }
    setSavedAllPhrases(true);
    playPentatonicChime(5);
    onToast?.(
      isArabic
        ? `✅ تم حفظ ${savedCount} جمل سفر جديدة في بنك الكلمات!`
        : `✅ Saved ${savedCount} travel phrases to your Word Bank!`
    );
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="travel-scenarios-modal"
      className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#0B1120', borderColor: 'rgba(245, 158, 11, 0.45)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="shrink-0 px-4 py-3.5 border-b flex items-center justify-between gap-2"
          style={{ backgroundColor: '#131C31', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {activeScenario && (
              <button
                type="button"
                onClick={exitScenario}
                aria-label={isArabic ? 'رجوع' : 'Back'}
                className="min-h-[38px] min-w-[38px] rounded-xl bg-[#1B2742] text-[#F8FAFC] flex items-center justify-center cursor-pointer shrink-0"
              >
                <ChevronLeft size={18} className={isArabic ? 'rotate-180' : ''} />
              </button>
            )}
            <div className="min-w-0 text-start">
              <h2 className="text-base font-black text-[#F8FAFC] truncate">
                {activeScenario
                  ? `${activeScenario.icon} ${isArabic ? activeScenario.titleAr : activeScenario.titleEn}`
                  : isArabic
                    ? 'محاكي التحدث مع أجنبي ✈️🎭'
                    : 'Talk to a Stranger Abroad ✈️🎭'}
              </h2>
              <p className="text-[11px] text-[#CBD5E1] truncate">
                {activeScenario
                  ? isArabic
                    ? `الدور ${Math.min(turnIndex + 1, activeScenario.turns.length)} من ${activeScenario.turns.length} · صوت أو ضغطة زر`
                    : `Turn ${Math.min(turnIndex + 1, activeScenario.turns.length)} of ${activeScenario.turns.length} · Voice or Tap`
                  : isArabic
                    ? `${completedIds.length} / ${TRAVEL_SCENARIOS.length} مواقف مكتملة · 100% بدون إنترنت`
                    : `${completedIds.length} / ${TRAVEL_SCENARIOS.length} scenarios cleared · 100% Offline`}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="travel-scenarios-close"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[40px] min-w-[40px] rounded-xl bg-[#1B2742] text-[#CBD5E1] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Quick Bar (when choosing a scenario) */}
        {!activeScenario && (
          <div
            className="shrink-0 px-4 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto"
            style={{ backgroundColor: '#0E172A', borderColor: 'var(--border)' }}
          >
            {(['en', 'de', 'es', 'it', 'fr', 'ar'] as ScenarioLang[]).map((code) => {
              const selected = activeLang === code;
              const pill = LANG_PILL[code];
              return (
                <button
                  key={code}
                  type="button"
                  data-testid={`scenario-lang-${code}`}
                  onClick={() => setActiveLang(code)}
                  className="min-h-[34px] px-3 rounded-xl text-xs font-black border cursor-pointer shrink-0 transition"
                  style={
                    selected
                      ? { backgroundColor: '#F59E0B', color: '#0B1120', borderColor: '#F59E0B' }
                      : { backgroundColor: '#131C31', color: '#CBD5E1', borderColor: 'rgba(148,163,184,0.25)' }
                  }
                >
                  {pill.flag} {pill.label}
                </button>
              );
            })}
          </div>
        )}

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {/* 1. Scenario List View (8 Famous Real-World Scenarios) */}
          {!activeScenario && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="travel-scenarios-grid">
              {TRAVEL_SCENARIOS.map((sc) => {
                const done = completedIds.includes(sc.id);
                return (
                  <button
                    key={sc.id}
                    type="button"
                    data-testid={`travel-scenario-card-${sc.id}`}
                    onClick={() => startScenario(sc)}
                    className="p-3.5 rounded-2xl border text-start flex flex-col justify-between gap-2.5 cursor-pointer transition active:scale-[0.98]"
                    style={{
                      backgroundColor: done ? 'rgba(16, 185, 129, 0.12)' : '#131C31',
                      borderColor: done ? '#10B981' : 'rgba(148, 163, 184, 0.25)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-11 h-11 rounded-2xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                        {sc.icon}
                      </span>
                      {done ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-black">
                          <CheckCircle2 size={12} />
                          <span>{isArabic ? 'مكتمل' : 'Cleared'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#FBBF24] text-[10px] font-black">
                          +50 XP
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-black text-[#F8FAFC] leading-snug">
                        {isArabic ? sc.titleAr : sc.titleEn}
                      </h3>
                      <p className="text-[11px] text-[#CBD5E1] leading-snug">
                        {isArabic ? sc.subtitleAr : sc.subtitleEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Completion Reward Screen */}
          {activeScenario && isCompleted && (
            <div
              data-testid="scenario-completion-screen"
              className="py-4 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] text-[#0B1120] flex items-center justify-center text-4xl shadow-2xl">
                {activeScenario.icon}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] text-xs font-black">
                <Award size={14} />
                <span>{isArabic ? activeScenario.badgeAr : activeScenario.badgeEn}</span>
              </div>

              <h3 className="text-xl font-black text-[#F8FAFC]">
                {isArabic ? 'عاش يا بطل! خلّصت الموقف بطلاقة!' : 'Mission Accomplished!'}
              </h3>

              <div className="flex items-center justify-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-[#131C31] border border-[#F59E0B]/40">
                  <div className="text-lg font-black text-[#FBBF24]">+{50 + voiceBonusXp} XP</div>
                  <div className="text-[10px] font-bold text-[#CBD5E1]">
                    {isArabic ? 'اتضافت لرصيدك والمتصدرين' : 'Added to Daily Battle & League'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                data-testid="scenario-save-all-wordbank"
                disabled={savedAllPhrases}
                onClick={handleSaveAllScenarioPhrases}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[#131C31] border-2 border-[#22D3EE]/60 text-[#22D3EE] font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                <BookmarkPlus size={18} />
                <span>
                  {savedAllPhrases
                    ? isArabic
                      ? '✅ تم حفظ كل الجمل في بنك الكلمات'
                      : '✅ All Phrases Saved to Word Bank'
                    : isArabic
                      ? '+ حفظ كل جمل الموقف في بنك الكلمات'
                      : '+ Save All Scenario Phrases to Word Bank'}
                </span>
              </button>

              <button
                type="button"
                onClick={exitScenario}
                className="w-full min-h-[48px] rounded-2xl font-black text-sm tb-btn-3d tb-btn-emerald cursor-pointer"
              >
                {isArabic ? 'اختار موقف سفر تاني ✈️' : 'Pick Another Travel Scenario ✈️'}
              </button>
            </div>
          )}

          {/* 3. Active Interactive Roleplay Turn */}
          {activeScenario && !isCompleted && currentTurn && (
            <div className="space-y-4" data-testid="scenario-active-turn">
              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-[#1B2742] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#F59E0B] transition-all duration-300"
                  style={{ width: `${((turnIndex + 1) / activeScenario.turns.length) * 100}%` }}
                />
              </div>

              {/* Stranger Speech Card */}
              <div
                className="p-4 rounded-3xl border space-y-3"
                style={{ backgroundColor: '#131C31', borderColor: 'rgba(34, 211, 238, 0.35)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-11 h-11 rounded-2xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-2xl">
                      {activeScenario.strangerAvatar}
                    </span>
                    <div>
                      <div className="text-xs font-black text-[#22D3EE]">
                        {isArabic ? activeScenario.strangerRoleAr : activeScenario.strangerRoleEn}
                      </div>
                      <div className="text-[10px] font-bold text-[#94A3B8]">
                        {LANG_PILL[activeLang].flag} {LANG_PILL[activeLang].label}
                      </div>
                    </div>
                  </div>

                  {/* Audio Controls (1.0x & 0.75x) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="scenario-stranger-audio-normal"
                      onClick={() => speakLine(currentTurn.strangerLine[activeLang], 1.0)}
                      className="min-h-[36px] px-2.5 rounded-xl bg-[#0B1120] border border-[#10B981]/50 text-[#10B981] text-xs font-black inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 size={14} />
                      <span>1.0x</span>
                    </button>
                    <button
                      type="button"
                      data-testid="scenario-stranger-audio-slow"
                      onClick={() => speakLine(currentTurn.strangerLine[activeLang], 0.75)}
                      className="min-h-[36px] px-2.5 rounded-xl bg-[#0B1120] border border-[#22D3EE]/50 text-[#22D3EE] text-xs font-black cursor-pointer"
                    >
                      🐢 0.75x
                    </button>
                  </div>
                </div>

                {/* Native Stranger Line */}
                <p
                  data-testid="scenario-stranger-line"
                  dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                  className="text-lg font-black text-[#F8FAFC] leading-relaxed"
                >
                  {currentTurn.strangerLine[activeLang]}
                </p>

                {/* Optional 1-Tap Peek Translation Toggle (Hidden by default to train real ears!) */}
                <div>
                  <button
                    type="button"
                    data-testid="scenario-peek-translation-btn"
                    onClick={() => setShowPeekTranslation((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1120] border border-slate-700 text-[#CBD5E1] text-xs font-bold cursor-pointer"
                  >
                    {showPeekTranslation ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>
                      {showPeekTranslation
                        ? isArabic
                          ? 'إخفاء الترجمة'
                          : 'Hide Translation'
                        : isArabic
                          ? 'ترجمة عربية (اختياري)'
                          : 'Peek Meaning'}
                    </span>
                  </button>
                  {showPeekTranslation && (
                    <p
                      data-testid="scenario-peek-translation-text"
                      className="mt-2 text-xs font-bold text-[#FBBF24] bg-[#0B1120]/80 rounded-xl p-2.5 border border-[#F59E0B]/30"
                    >
                      {activeLang === 'ar' ? currentTurn.strangerMeaningEn : currentTurn.strangerMeaningAr}
                    </p>
                  )}
                </div>
              </div>

              {/* Voice Reply Grader Feedback */}
              {voiceGrade && (
                <div
                  data-testid="scenario-voice-feedback"
                  className={`p-3 rounded-2xl border text-xs font-black flex items-center gap-2 ${
                    voiceGrade.passed
                      ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#10B981] animate-bounce'
                      : 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#FBBF24]'
                  }`}
                >
                  <Sparkles size={16} className="shrink-0" />
                  <span>{isArabic ? voiceGrade.feedbackAr : voiceGrade.feedbackEn}</span>
                </div>
              )}

              {/* Stranger Distinct Reaction Bubble (after replying) */}
              {selectedChoice ? (
                <div className="space-y-3">
                  <div
                    data-testid="scenario-stranger-reaction"
                    className="p-4 rounded-2xl border space-y-1.5"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.14)',
                      borderColor: '#10B981',
                    }}
                  >
                    <div className="text-[11px] font-black text-[#10B981]">
                      {activeScenario.strangerAvatar}{' '}
                      {isArabic ? 'رد الشخص قدامك:' : 'Stranger replies:'}
                    </div>
                    <p
                      dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                      className="text-base font-black text-[#F8FAFC]"
                    >
                      {selectedChoice.strangerReaction[activeLang]}
                    </p>
                    <p className="text-xs text-[#CBD5E1]">
                      {activeLang === 'ar'
                        ? selectedChoice.strangerReactionEn
                        : selectedChoice.strangerReactionAr}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid="scenario-next-turn-btn"
                    onClick={handleAdvanceTurn}
                    className="w-full min-h-[50px] rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald"
                  >
                    <span>
                      {turnIndex + 1 < activeScenario.turns.length
                        ? isArabic
                          ? 'كمّل الحوار'
                          : 'Next Turn'
                        : isArabic
                          ? 'استلم الوسام و +50 XP 🏆'
                          : 'Claim Badge & +50 XP 🏆'}
                    </span>
                    <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
                  </button>
                </div>
              ) : (
                /* Your Reply Turn: Voice OR 3 Realistic Thumb-Zone Choices */
                <div className="space-y-3">
                  {/* Giant Voice Reply Button */}
                  <button
                    type="button"
                    data-testid="scenario-voice-reply-btn"
                    onClick={() => void handleVoiceReply()}
                    className={`w-full min-h-[52px] px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-lg ${
                      isListeningVoice
                        ? 'bg-rose-500 text-white border-2 border-rose-300 animate-pulse'
                        : 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-[#0B1120] border-b-4 border-[#B45309]'
                    }`}
                  >
                    <Mic size={18} />
                    <span>
                      {isListeningVoice
                        ? isArabic
                          ? '🎙️ بسمع إجابتك الآن...'
                          : '🎙️ Listening to your reply...'
                        : isArabic
                          ? '🎙️ جاوب بصوتك (+20 XP إضافي)'
                          : '🎙️ Speak Your Reply (+20 Bonus XP)'}
                    </span>
                  </button>

                  <div className="text-center text-[11px] font-bold text-[#94A3B8]">
                    {isArabic ? '— أو اختار رد بضغطة إبهام —' : '— or pick a thumb-zone reply —'}
                  </div>

                  {/* 3 Realistic Branching Choices */}
                  <div className="space-y-2">
                    {currentTurn.choices.map((choice, idx) => {
                      const badge = TONE_BADGE[choice.tone];
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          data-testid={`scenario-choice-${idx}`}
                          onClick={() => handleChooseReply(choice)}
                          className="w-full p-3.5 rounded-2xl bg-[#131C31] border border-slate-700/80 hover:border-[#22D3EE] text-start space-y-1 cursor-pointer transition active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-black"
                              style={{ backgroundColor: badge.bg, color: badge.color }}
                            >
                              {isArabic ? badge.ar : badge.en}
                            </span>
                            <Volume2 size={14} className="text-[#94A3B8]" />
                          </div>
                          <p
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            className="text-sm font-black text-[#F8FAFC] leading-snug"
                          >
                            {choice.text[activeLang]}
                          </p>
                          <p className="text-[11px] text-[#94A3B8]">
                            {activeLang === 'ar' ? choice.meaningEn : choice.meaningAr}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
