import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LessonNode, ExerciseItem } from '../../progression/types';
import { CheckCircle2, XCircle, ArrowRight, Zap, Timer, Sparkles, Brain, Shuffle, X, Eye, EyeOff } from 'lucide-react';
import { computeNextHintWord } from '../../utils/habitPsychology';
import { soundFX } from '../../utils/soundFX';
import { updateCognitiveProfile, runLocalTrainingStep, getDifficultyKnob } from '../../utils/OnlineLearningEngine';
import { getDynamicExerciseOptions } from '../../utils/adaptiveCurriculum';
import { getGlossForWord } from '../../utils/glossHelper';
import { speakWithRate } from '../../utils/audio';
import { useLanguagePair } from '../../hooks/useLanguagePair';
import { LevelVisualIllustration } from './LevelVisualIllustration';
import { NameForge } from '../NameForge';
import { DualSpeedAudio } from '../DualSpeedAudio';
import { useUiMode } from '../../utils/uiMode';

function getSmartGrammarClue(exercise: ExerciseItem, isArabic: boolean): string {
  const arExplanation = exercise.explanationAr || (exercise as any).hintAr || '';
  if (isArabic && arExplanation) return arExplanation;
  if (!isArabic && exercise.explanationEn) return exercise.explanationEn;

  const target = (exercise.targetSentence || '').toLowerCase();

  if (/\b(a|an)\b\s+\w+\s+\w+/.test(target) || target.includes('a new') || target.includes('a big') || target.includes('a fast') || target.includes('a red')) {
    return isArabic
      ? 'في الإنجليزي الصفة بتيجي قبل الاسم (new bicycle مش bicycle new)، ولازم نضيف a أو an قبل المفرد النكرة.'
      : 'In English, adjectives come before nouns (new bicycle), and indefinite singular nouns require "a" or "an".';
  }
  if (/\b(am|is|are)\b/.test(target)) {
    return isArabic
      ? 'الإنجليزي بيحتاج فعل ربط (am / is / are) بين الفاعل والصفة أو الاسم — زي: I am a student.'
      : 'English requires a linking verb (am / is / are) between subject and adjective or noun.';
  }
  if (/\b(bought|went|ate|saw|took|made|was|were|did)\b|\w+ed\b/.test(target)) {
    return isArabic
      ? 'الجملة في الماضي — بنبدأ بالفاعل وبعده الفعل في صيغة الماضي مباشرة.'
      : 'The sentence is in past tense — subject followed immediately by past verb form.';
  }
  if (/^(hello|hi|good|how are|nice to|thank|please|excuse)/i.test(target)) {
    return isArabic
      ? 'دي عبارة ترحيب أو ذوق يومية جاهزة — ركّبها كقطعة واحدة زي ما بتتقال.'
      : 'This is a standard daily greeting or polite expression — assemble it as a fixed phrase.';
  }
  if (target.endsWith('?')) {
    return isArabic
      ? 'في السؤال بالإنجليزي بنبدأ بأداة السؤال أو الفعل المساعد (Do / Are / What / Where) قبل الفاعل.'
      : 'In English questions, start with the question word or auxiliary verb before the subject.';
  }
  return isArabic
    ? 'رتّب الجملة بالنظام الإنجليزي: الفاعل الأول ← بعده الفعل ← بعده باقي المعنى.'
    : 'Order the sentence natively: Subject first ← then Verb ← then remaining meaning.';
}

function getNextHintWord(targetSentence: string, currentWordsStr: string) {
  const targetWords = (targetSentence || '').replace(/[.,?!]/g, '').split(/\s+/).filter(Boolean);
  const currentWords = (currentWordsStr || '').replace(/[.,?!]/g, '').split(/\s+/).filter(Boolean);

  for (let i = 0; i < targetWords.length; i++) {
    if (i >= currentWords.length || currentWords[i].toLowerCase() !== targetWords[i].toLowerCase()) {
      return {
        nextWord: targetWords[i],
        position: i + 1,
        total: targetWords.length,
        allMatched: false,
      };
    }
  }
  return {
    nextWord: null,
    position: targetWords.length,
    total: targetWords.length,
    allMatched: true,
  };
}

interface LessonRunnerProps {
  lesson: LessonNode;
  onCompleteSession: (earnedXp: number, accuracyPercent: number) => void;
  onClose: () => void;
  isArabic?: boolean;
  targetLang?: string;
  sourceLang?: string;
}

export function LessonRunner({
  lesson,
  onCompleteSession,
  onClose,
  isArabic = true,
  targetLang,
  sourceLang,
}: LessonRunnerProps) {
  const { sourceLang: pairSource, targetLang: pairTarget } = useLanguagePair();
  const activeTargetLang = targetLang || pairTarget || 'en';
  const activeSourceLang = sourceLang || pairSource || 'ar';

  const [uiMode] = useUiMode();
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    const list = [...lesson.exercises];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndices, setSelectedOptionIndices] = useState<number[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const selectedChips = selectedOptionIndices.map((idx) => shuffledOptions[idx] || '').filter(Boolean);

  const handleShuffleExercises = () => {
    const list = [...exercises];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setExercises(list);
    setCurrentIndex(0);
    setSelectedOptionIndices([]);
    setUserInput('');
    setIsAnswered(false);
    setAutoHintPill(isArabic ? '🔀 تم خلط التمارين بنجاح!' : '🔀 Exercises shuffled!');
    soundFX.playChipSelect();
  };
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showGlosses, setShowGlosses] = useState<boolean>(true);

  // Hint Drawer & Stage State
  const [hintDrawerOpen, setHintDrawerOpen] = useState(false);
  const [hintStage, setHintStage] = useState<1 | 2 | 3>(1);
  const [lastAddedHintWord, setLastAddedHintWord] = useState<string | null>(null);

  // Variable-Ratio Rewards & Streak Micro-Celebrations State
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
  const [lastExerciseXp, setLastExerciseXp] = useState(10);
  const [isCriticalHit, setIsCriticalHit] = useState(false);

  // Automaticity Timer Tracking (Reflex Speed in Seconds)
  const exerciseStartTimeRef = useRef<number>(Date.now());
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([]);

  const [autoHintPill, setAutoHintPill] = useState<string | null>(null);
  const [showNameForge, setShowNameForge] = useState(lesson.stage === 'Pre-A0');
  const [inputMode, setInputMode] = useState<'tiles' | 'keyboard'>('tiles');

  useEffect(() => {
    setInputMode('tiles');
    setHintDrawerOpen(false);
    setHintStage(1);
  }, [currentIndex]);

  const currentExercise: ExerciseItem = exercises[currentIndex] || exercises[0];
  const isJapaneseExercise = /[\u3040-\u30ff\u3400-\u9fff]/u.test(currentExercise.targetSentence);
  const isTargetRtl = /[\u0600-\u06FF]/u.test(currentExercise?.targetSentence || '');

  useEffect(() => {
    const rawOptions = currentExercise.options && currentExercise.options.length > 0
      ? currentExercise.options
      : currentExercise.wordChips && currentExercise.wordChips.length > 0
      ? currentExercise.wordChips
      : currentExercise.targetSentence ? currentExercise.targetSentence.split(/\s+/) : [];

    const difficulty = getDifficultyKnob();
    const { wordChips: dynamicChips } = getDynamicExerciseOptions(
      rawOptions,
      currentExercise.targetSentence,
      difficulty
    );

    const options = [...dynamicChips];
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }
    setShuffledOptions(options);
    setSelectedOptionIndices([]);
  }, [currentExercise.id, currentIndex]);

  useEffect(() => {
    exerciseStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const triggerAutoHelper = useCallback((customPillMessage?: string): string | null => {
    if (isAnswered || showSummary) return null;

    const targetSentence = currentExercise.targetSentence || '';
    const targetTokens = targetSentence.replace(/[.,?!。、「」]/g, '').split(/\s+/).filter(Boolean);

    if (inputMode === 'tiles') {
      const currentChoice = selectedChips.join(' ');
      const { nextWord } = computeNextHintWord(targetSentence, currentChoice);

      let candidateOption: string | undefined = undefined;
      const availablePool = [...shuffledOptions, ...(currentExercise.options || [])];
      if (nextWord) {
        candidateOption = availablePool.find(
          (opt) => opt.toLowerCase() === nextWord.toLowerCase()
        );
      }

      if (!candidateOption && targetTokens[selectedOptionIndices.length]) {
        candidateOption = targetTokens[selectedOptionIndices.length];
      }

      if (candidateOption) {
        let optIdx = shuffledOptions.findIndex(
          (opt, idx) => opt.toLowerCase() === candidateOption!.toLowerCase() && !selectedOptionIndices.includes(idx)
        );

        if (optIdx !== -1) {
          setSelectedOptionIndices((prev) => [...prev, optIdx]);
        } else {
          const newIdx = shuffledOptions.length;
          setShuffledOptions((prev) => [...prev, candidateOption!]);
          setSelectedOptionIndices((prev) => [...prev, newIdx]);
        }

        setAutoHintPill(
          customPillMessage ?? (
            isArabic
              ? `💡 أضفنا الكلمة: "${candidateOption}"`
              : `💡 Added word: "${candidateOption}"`
          )
        );
        return candidateOption;
      }
    } else {
      const { nextWord } = computeNextHintWord(targetSentence, userInput);
      if (nextWord) {
        const updatedInput = userInput ? `${userInput} ${nextWord}` : nextWord;
        setUserInput(updatedInput);
        setAutoHintPill(
          customPillMessage ?? (
            isArabic
              ? `💡 أضفنا الكلمة: "${nextWord}"`
              : `💡 Added word: "${nextWord}"`
          )
        );
        return nextWord;
      }
    }
    return null;
  }, [isAnswered, showSummary, currentExercise, selectedChips, selectedOptionIndices, userInput, shuffledOptions, isArabic, inputMode]);

  // Automatic 30-second Idle Guard
  useEffect(() => {
    if (isAnswered || showSummary) return;
    const timer = window.setTimeout(() => {
      const msg = isArabic
        ? '💡 تجاوزت 30 ثانية — إليك تلميح تلقائي'
        : '💡 Over 30s — auto hint triggered';
      triggerAutoHelper(msg);
    }, 30000);
    return () => window.clearTimeout(timer);
  }, [currentIndex, isAnswered, showSummary, triggerAutoHelper, isArabic]);

  useEffect(() => {
    if (autoHintPill) {
      const t = window.setTimeout(() => setAutoHintPill(null), 2500);
      return () => window.clearTimeout(t);
    }
  }, [autoHintPill]);

  const handleCheckAnswer = () => {
    if (isAnswered) return;

    const rawTimeSpentMs = Math.max(1000, Date.now() - exerciseStartTimeRef.current);
    const timeSpentMs = Math.min(30000, rawTimeSpentMs);
    setResponseTimesMs((prev) => [...prev, timeSpentMs]);

    let userSentence = '';
    if (inputMode === 'tiles') {
      userSentence = selectedChips.join(' ').trim();
    } else {
      userSentence = userInput.trim();
    }

    const normalizeAnswer = (value: string) => {
      const normalized = value.toLowerCase().replace(/['".,?!。、「」]/g, '');
      return isJapaneseExercise
        ? normalized.replace(/\s+/g, '')
        : normalized.trim().replace(/\s+/g, ' ');
    };
    const normUser = normalizeAnswer(userSentence);
    const normTarget = normalizeAnswer(currentExercise.targetSentence);

    const isMatch =
      normUser === normTarget ||
      (currentExercise.acceptableAlternatives || []).some(
        (alt) => normalizeAnswer(alt) === normUser
      );

    const category = currentExercise.weakSpotTag || 'general';
    updateCognitiveProfile(timeSpentMs, isMatch, category);
    runLocalTrainingStep('answer_exercise', isMatch, category, timeSpentMs);

    setIsCorrect(isMatch);

    if (isMatch) {
      const rand = Math.random();
      let awardedXp = 15;
      let critical = false;
      if (rand < 0.10) {
        awardedXp = 50;
        critical = true;
      } else if (rand < 0.20) {
        awardedXp = 10;
      } else {
        awardedXp = 15;
      }

      setLastExerciseXp(awardedXp);
      setIsCriticalHit(critical);
      setSessionXpEarned((prev) => prev + awardedXp);

      const nextStreak = sessionStreak + 1;
      setSessionStreak(nextStreak);

      soundFX.playComboChord(correctAnswersCount + 1);
      if ((correctAnswersCount + 1) % 5 === 0) {
        soundFX.playFanfare();
      }

      if (nextStreak % 3 === 0 || critical) {
        confetti({
          particleCount: critical ? 120 : 60,
          spread: critical ? 100 : 70,
          origin: { y: 0.6 },
          colors: critical ? ['#FFD700', '#FF4500', '#00E676'] : undefined,
        });
      }
    } else {
      soundFX.playError();
      setSessionStreak(0);
      setIsCriticalHit(false);
      setLastExerciseXp(0);
    }

    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(isMatch ? [30, 40, 50] : [70]);
      }
    } catch {}
    setAutoHintPill(null);
    setHintDrawerOpen(false);
    setIsAnswered(true);

    if (isMatch) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextExercise = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedOptionIndices([]);
    setUserInput('');
    setAutoHintPill(null);
    setHintDrawerOpen(false);

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  if (showNameForge) {
    return (
      <div className="fixed inset-0 z-[100] bg-bg/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6">
        <NameForge onComplete={() => setShowNameForge(false)} />
      </div>
    );
  }

  if (showSummary) {
    const accuracy = Math.round((correctAnswersCount / exercises.length) * 100);
    const totalTimeMs = responseTimesMs.reduce((a, b) => a + b, 0);
    const avgSecPerExercise = responseTimesMs.length > 0
      ? Number((totalTimeMs / responseTimesMs.length / 1000).toFixed(1))
      : 0;

    let automaticityTierAr = '⚡ طلاقة فورية بدون ترجمة!';
    let automaticityTierEn = '⚡ Instant Reflexes!';
    if (avgSecPerExercise > 8 || accuracy < 70) {
      automaticityTierAr = '💡 سرعة جيدة مع حاجة للمزيد من الممارسة';
      automaticityTierEn = '💡 Good speed, keep practicing!';
    }

    const earnedXp = sessionXpEarned + (accuracy > 80 ? 20 : 0);

    return (
      <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="w-full h-full sm:h-auto sm:max-h-[88vh] sm:max-w-[520px] md:max-w-xl sm:rounded-3xl bg-bg border border-border shadow-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="space-y-6 w-full max-w-sm">
            <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center text-4xl mx-auto shadow-2xl">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-text">
                {isArabic ? 'درس مكتمل بنجاح! 🎉' : 'Lesson Completed! 🎉'}
              </h2>
              <p className="text-xs text-muted">
                {isArabic ? lesson.titleAr : lesson.titleEn}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-surface border border-border grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-surface-2">
                <span className="text-xl font-black text-success block">+{earnedXp} XP</span>
                <span className="text-[10px] text-muted font-bold">{isArabic ? 'نقاط مكتسبة' : 'Earned XP'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-2">
                <span className="text-xl font-black text-primary block">{accuracy}%</span>
                <span className="text-[10px] text-muted font-bold">{isArabic ? 'نسبة الدقة' : 'Accuracy'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-2 border border-border flex items-center justify-between text-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-success/20 text-success">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">
                    {isArabic ? 'معدل سرعة التفكير والبديهة' : 'Cognitive Reflex Speed'}
                  </span>
                  <span className="text-xs font-black text-text">
                    {isArabic ? automaticityTierAr : automaticityTierEn}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-success dir-ltr">
                {avgSecPerExercise}s/ex
              </span>
            </div>

            <button
              onClick={() => {
                onCompleteSession(earnedXp, accuracy);
                onClose();
              }}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-base transition active:scale-95 shadow-lg cursor-pointer"
            >
              {isArabic ? 'استمرار والعودة للمسار 🚀' : 'Continue to Path 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / exercises.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full h-[100dvh] flex flex-col sm:h-auto sm:max-h-[88vh] sm:max-w-xl md:max-w-2xl lg:max-w-4xl sm:rounded-3xl bg-bg border border-border shadow-2xl overflow-hidden relative">
        {/* Top Header Progress Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-surface/50">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-surface-2 text-muted hover:text-text font-bold transition cursor-pointer"
            aria-label={isArabic ? 'إغلاق الدرس' : 'Close Lesson'}
          >
            <X size={20} />
          </button>
          <div className="flex-1 bg-surface-2 h-3 rounded-full overflow-hidden border border-border">
            <div
              className="bg-success h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const addedWord = triggerAutoHelper();
                if (addedWord) setLastAddedHintWord(addedWord);
                setHintDrawerOpen(true);
              }}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold transition active:scale-95 cursor-pointer ${
                !isAnswered && !hintDrawerOpen ? 'ring-2 ring-amber-400/70 animate-pulse' : ''
              }`}
              title={isArabic ? 'تلميح ذكي' : 'Smart Hint'}
              aria-label={isArabic ? 'تلميح ذكي' : 'Smart Hint'}
            >
              💡 <span className="hidden sm:inline ms-1">{uiMode === 'simple' ? (isArabic ? 'ساعدني' : 'Help') : (isArabic ? 'تلميح' : 'Hint')}</span>
            </button>
            <button
              type="button"
              onClick={handleShuffleExercises}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition active:scale-95 cursor-pointer"
              title={isArabic ? 'إعادة ترتيب التمارين عشوائياً' : 'Randomize exercise order'}
              aria-label={isArabic ? 'إعادة ترتيب التمارين عشوائياً' : 'Randomize exercise order'}
            >
              <Shuffle size={16} />
            </button>
            <div className="flex items-center gap-1 text-xs font-black text-muted">
              <Timer size={14} className="text-primary" />
              <span>{currentIndex + 1}/{exercises.length}</span>
            </div>
          </div>
        </div>

        {/* Floating Side-Popup Smart Hint Drawer */}
        {hintDrawerOpen && (
          <div className="fixed top-20 end-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-3xl bg-[#0B1C33] border-2 border-cyan-500/50 shadow-2xl p-4 space-y-3 text-start animate-in fade-in slide-in-from-top-2" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <h3 className="text-sm font-black text-white">{isArabic ? 'المساعد الذكي' : 'Smart Hint Assistant'}</h3>
              </div>
              <button
                onClick={() => setHintDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {lastAddedHintWord && (
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30">
                <span className="text-xs font-bold text-emerald-300">✅ أضفنا الكلمة:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-300 text-sm px-2 py-0.5 bg-amber-500/15 rounded-lg">
                    {lastAddedHintWord}
                  </span>
                  <DualSpeedAudio text={lastAddedHintWord} showLabels={false} />
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span>🧠 القاعدة وسر التركيب:</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-medium">
                {getSmartGrammarClue(currentExercise, isArabic)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextAdded = triggerAutoHelper();
                if (nextAdded) setLastAddedHintWord(nextAdded);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <span>➕ ضيف الكلمة الجاية</span>
            </button>
          </div>
        )}

        {/* Exercise Body */}
        <motion.div
          key={currentIndex}
          animate={isAnswered && isCorrect
            ? { scale: [1, 1.02, 1], boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }
            : { scale: 1, boxShadow: '0 0 0 rgba(16, 185, 129, 0)' }}
          transition={{ duration: 0.4 }}
          className={`flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-6 relative transition-all duration-300 ${
            isAnswered && isCorrect ? 'ring-4 ring-success/50 rounded-2xl' : ''
          }`}
        >
          {isAnswered && isCorrect && (
            <motion.div
              key={`xp-${currentIndex}`}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              aria-live="polite"
              className={`pointer-events-none absolute end-5 top-6 z-10 rounded-full border px-3 py-1 text-sm font-black shadow-lg ${
                isCriticalHit
                  ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-bounce'
                  : 'bg-success/20 border-success/40 text-success'
              }`}
            >
              {isCriticalHit ? '💥 +50 XP CRITICAL HIT!' : `+${lastExerciseXp} XP`}
            </motion.div>
          )}

          {/* Compact Visual Illustration (only shown after answered, otherwise omitted to save vertical space) */}
          {isAnswered && (
            <LevelVisualIllustration
              stage={lesson.stage || 'A0'}
              levelNumber={currentIndex + 1}
              promptAr={currentExercise.promptAr}
              englishTarget={currentExercise.targetSentence}
              className="w-full h-auto max-h-[120px]"
            />
          )}

          {/* Source Thought Prompt */}
          <div className="p-4 rounded-3xl bg-surface border border-border space-y-2 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-success block">
                {isArabic ? 'عَبّر عن الفكرة بترتيب اللغة المستهدفة:' : 'Express the thought in the target language:'}
              </span>
              <h2 className="text-lg font-black text-text" dir="auto">
                "{isArabic ? currentExercise.promptAr : currentExercise.promptEn}"
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {inputMode === 'tiles' && (
                <button
                  type="button"
                  onClick={() => setShowGlosses((v) => !v)}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-2 text-text text-xs font-bold border border-border flex items-center gap-1 cursor-pointer"
                  title={showGlosses ? (isArabic ? 'إخفاء المعاني' : 'Hide Glosses') : (isArabic ? 'إظهار المعاني' : 'Show Glosses')}
                >
                  {showGlosses ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span className="hidden sm:inline">{showGlosses ? (isArabic ? 'إخفاء المعاني' : 'Hide Glosses') : (isArabic ? 'إظهار المعاني' : 'Show Glosses')}</span>
                </button>
              )}
              {uiMode === 'pro' && (
                <button
                  type="button"
                  onClick={() => setInputMode(m => m === 'tiles' ? 'keyboard' : 'tiles')}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 text-text text-xs font-bold border border-border shrink-0 cursor-pointer"
                >
                  {inputMode === 'tiles' ? (isArabic ? '⌨️ كيبورد' : 'Keyboard') : (isArabic ? '🧩 كلمات' : 'Word Tiles')}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <DualSpeedAudio text={currentExercise.targetSentence} showLabels={true} />
          </div>

          {/* Structure Builder / Word Chips Mode */}
          {inputMode === 'tiles' && (
            <div className="space-y-4">
              {/* Selected Chips Slot */}
              <div
                dir={isTargetRtl ? 'rtl' : 'ltr'}
                style={{ direction: isTargetRtl ? 'rtl' : 'ltr', textAlign: isTargetRtl ? 'right' : 'left', justifyContent: isTargetRtl ? 'flex-end' : 'flex-start' }}
                className="p-4 rounded-2xl bg-surface-2 border border-border min-h-[72px] flex flex-wrap flex-row items-center gap-2"
              >
                {selectedOptionIndices.length === 0 ? (
                  <span className="text-xs text-muted font-bold" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic ? 'اضغط الكلمات أدناه للترتيب الصحيح' : 'Tap words below to arrange'}
                  </span>
                ) : (
                  selectedOptionIndices.map((optionIdx, selectedIdx) => {
                    const chip = shuffledOptions[optionIdx] || '';
                    const gloss = getGlossForWord(chip, currentExercise.breakdownChunks || [], activeTargetLang, activeSourceLang);
                    return (
                      <button
                        key={selectedIdx}
                        onClick={() => {
                          if (!isAnswered) {
                            speakWithRate(chip);
                            setSelectedOptionIndices((prev) => prev.filter((_, i) => i !== selectedIdx));
                          }
                        }}
                        dir={isTargetRtl ? 'rtl' : 'ltr'}
                        className="px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 font-black text-sm flex flex-col items-center justify-center active:scale-95 shadow-sm cursor-pointer"
                      >
                        <span>{chip}</span>
                        {showGlosses && gloss && <span className="text-[10px] opacity-70 mt-0.5 leading-none" dir={!isTargetRtl ? 'rtl' : 'ltr'}>{gloss}</span>}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Available Word Chips Bank */}
              <div className="flex flex-wrap gap-2 justify-center pt-2" dir={isTargetRtl ? 'rtl' : 'ltr'}>
                {shuffledOptions.map((chip, idx) => {
                  const isSelected = selectedOptionIndices.includes(idx);
                  const gloss = getGlossForWord(chip, currentExercise.breakdownChunks || [], activeTargetLang, activeSourceLang);
                  return (
                    <button
                      key={idx}
                      disabled={isSelected || isAnswered}
                      data-testid="word-chip"
                      data-word={chip}
                      onClick={() => {
                        soundFX.playChipSelect();
                        speakWithRate(chip);
                        setSelectedOptionIndices((prev) => [...prev, idx]);
                      }}
                      dir={isTargetRtl ? 'rtl' : 'ltr'}
                      className={`px-4 py-2.5 min-h-[48px] rounded-xl font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'opacity-30 bg-surface border border-border text-muted cursor-not-allowed'
                          : 'bg-surface border border-border text-text hover:bg-surface-2 active:scale-95 shadow-sm'
                      }`}
                    >
                      <span>{chip}</span>
                      {showGlosses && gloss && <span className="text-[10px] opacity-60 mt-0.5 leading-none" dir={!isTargetRtl ? 'rtl' : 'ltr'}>{gloss}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text Input Mode */}
          {inputMode === 'keyboard' && (
            <div className="space-y-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isAnswered}
                dir={isTargetRtl ? 'rtl' : 'ltr'}
                placeholder={isArabic ? 'اكتب الجملة باللغة المستهدفة هنا...' : 'Type the sentence in the target language...'}
                className="w-full p-4 rounded-2xl bg-surface-2 border border-border text-text text-base font-bold placeholder:text-muted focus:outline-none focus:border-success min-h-[100px] resize-none"
              />
            </div>
          )}

          {/* Rule Explanation "WHY" Feedback Card */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-start ${
                isCorrect
                  ? 'bg-success/15 border-success text-text animate-pulse'
                  : 'bg-danger/15 border-danger text-text'
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="text-success" size={20} />
                    <span>{isArabic ? 'إجابة ممتازة وبناء صحيح! 🎉' : 'Great Job! Perfect Structure! 🎉'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-danger" size={20} />
                    <span>{isArabic ? 'إجابة تحتاج تعديل بسيط' : 'Needs adjustment'}</span>
                  </>
                )}
              </div>

              <p className="text-xs font-semibold text-text-soft leading-relaxed mt-1" dir={isArabic ? 'rtl' : 'ltr'}>
                <strong>{isArabic ? 'الجملة الصحيحة:' : 'Target:'}</strong>{' '}
                <span dir="ltr" className="font-bold text-text">{currentExercise.targetSentence}</span>
              </p>

              {currentExercise.explanationAr && (
                <p className="text-xs text-muted mt-2 border-t border-border/50 pt-2 leading-relaxed" dir={isArabic ? 'rtl' : 'ltr'}>
                  💡 <strong>{isArabic ? 'سبب القاعدة:' : 'Rule Explanation:'}</strong>{' '}
                  {isArabic ? currentExercise.explanationAr : currentExercise.explanationEn}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Sticky Bottom Action Bar (60px Height, High Contrast) */}
        <div className="sticky bottom-0 bg-stone-950 p-4 border-t border-stone-800 z-10 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              disabled={
                inputMode === 'tiles'
                  ? selectedChips.length === 0
                  : !userInput.trim()
              }
              aria-label={isArabic ? 'تحقق من البناء' : 'Check Structure'}
              className="w-full min-h-[60px] py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-lg transition disabled:opacity-70 disabled:bg-slate-700 disabled:text-slate-200 disabled:border-slate-500 disabled:cursor-not-allowed shadow-2xl active:scale-[0.99] border-2 border-amber-300 focus-visible:ring-4 focus-visible:ring-amber-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isArabic ? 'تحقق من البناء 🚀' : 'Check Structure 🚀'}</span>
            </button>
          ) : (
            <button
              onClick={handleNextExercise}
              aria-label={isArabic ? 'السؤال التالي' : 'Next Question'}
              className="w-full min-h-[60px] py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-lg transition shadow-2xl active:scale-[0.99] border-2 border-emerald-300 focus-visible:ring-4 focus-visible:ring-emerald-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isArabic ? 'السؤال التالي' : 'Next Question'}</span>
              <span className="text-xs font-sans font-bold opacity-80">· Next</span>
              <ArrowRight size={22} className={isArabic ? 'rotate-180' : ''} />
            </button>
          )}
        </div>

        {showExitConfirm && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 text-center space-y-4 shadow-2xl">
              <h3 className="text-base font-black text-text">
                {isArabic ? 'إنهاء الدرس؟' : 'Leave the lesson?'}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {isArabic
                  ? 'سيتم فقدان تقدمك في هذا الدرس. هل تريد الخروج؟'
                  : 'Your progress in this lesson will be lost. Leave anyway?'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-sm transition active:scale-95 cursor-pointer"
                >
                  {isArabic ? 'متابعة التعلم' : 'Keep learning'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 min-h-[48px] rounded-2xl bg-surface-2 border border-border text-text font-black text-sm transition active:scale-95 cursor-pointer"
                >
                  {isArabic ? 'خروج' : 'Leave'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
