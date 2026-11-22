import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LessonNode, ExerciseItem } from '../../progression/types';
import { CheckCircle2, XCircle, ArrowRight, Zap, Timer, Sparkles, Brain, Shuffle, X, Eye, EyeOff, Volume2, RotateCcw } from 'lucide-react';
import { computeNextHintWord } from '../../utils/habitPsychology';
import {
  WordBankTile,
  appendPlacedTileId,
  computeSentenceDiff,
  createWordBankTiles,
  ensureRequiredWordBankTokens,
  normalizeAnswerForComparison,
  selectNextHintTile,
  tokenizeTargetSentence,
} from '../../utils/sentenceBuilderHelper';
import { soundFX } from '../../utils/soundFX';
import { updateCognitiveProfile, runLocalTrainingStep, getDifficultyKnob } from '../../utils/OnlineLearningEngine';
import { getDynamicExerciseOptions } from '../../utils/adaptiveCurriculum';
import { getGlossForWord } from '../../utils/glossHelper';
import { checkAnswerMatch, diagnoseL1TransferHint } from '../../utils/transferLogic';
import { speakWithRate } from '../../utils/audio';
import { useLanguagePair } from '../../hooks/useLanguagePair';
import { getTargetDictionaryAsync } from '../../data/dictionaries';
import { LevelVisualIllustration } from './LevelVisualIllustration';
import { NameForge } from '../NameForge';
import { DualSpeedAudio } from '../DualSpeedAudio';
import { useUiMode } from '../../utils/uiMode';

function getSmartGrammarClue(exercise: ExerciseItem, isArabic: boolean, targetLang: string = 'en'): string {
  const arExplanation = exercise.explanationAr || (exercise as any).hintAr || '';
  if (isArabic && arExplanation && /[\u0600-\u06FF]/.test(arExplanation)) return arExplanation;
  if (!isArabic && exercise.explanationEn) return exercise.explanationEn;

  if (targetLang === 'de') {
    return isArabic
      ? 'في الألمانية: انتبه لمكان الفعل الثاني V2 وحالة الإعراب (النصب والجر).'
      : 'In German: Note strict V2 verb position and noun cases.';
  }
  if (targetLang === 'ja') {
    return isArabic
      ? 'في اليابانية: يأتي الفعل دائماً في نهاية الجملة (SOV).'
      : 'In Japanese: The verb comes at the end of the sentence (SOV).';
  }
  if (targetLang === 'tr') {
    return isArabic
      ? 'في التركية: يأتي الفعل في النهاية وتُضاف اللاحقات للتعبير عن الفاعل والزمن.'
      : 'In Turkish: Verbs come at the end with suffixes for subject and tense.';
  }
  if (targetLang === 'es' || targetLang === 'fr' || targetLang === 'it' || targetLang === 'pt') {
    return isArabic
      ? 'تأكد من توافق الصفة في الجنس والعدد مع الاسم.'
      : 'Ensure adjective agreement in gender and number with the noun.';
  }

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
  if (/\b(do not|don't|does not|doesn't|did not|didn't)\b/.test(target)) {
    return isArabic
      ? 'في النفي بالإنجليزي بنستعمل فعل مساعد (do not / does not / did not) قبل الفعل الأساسي بدل النفي المباشر.'
      : 'In English negation, place an auxiliary verb (do not / does not / did not) before the main verb.';
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
    ? 'رتّب الجملة بالنظام الصحيح: الفاعل الأول ← بعده الفعل ← بعده باقي المعنى.'
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

function buildWordBankForExercise(exercise: ExerciseItem, idx: number): WordBankTile[] {
  const rawOptions =
    exercise.options && exercise.options.length > 0
      ? exercise.options
      : exercise.wordChips && exercise.wordChips.length > 0
        ? exercise.wordChips
        : tokenizeTargetSentence(exercise.targetSentence || '');

  const difficulty = getDifficultyKnob();
  const { wordChips: dynamicChips } = getDynamicExerciseOptions(
    rawOptions,
    exercise.targetSentence,
    difficulty
  );

  const options = ensureRequiredWordBankTokens(dynamicChips, exercise.targetSentence);
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }
  return createWordBankTiles(`${exercise.id}-${idx}`, options);
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

  useEffect(() => {
    void getTargetDictionaryAsync(activeTargetLang);
  }, [activeTargetLang]);

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
  const [placedTileIds, setPlacedTileIds] = useState<string[]>([]);
  const [wordBankTiles, setWordBankTiles] = useState<WordBankTile[]>([]);
  const selectedChips = placedTileIds
    .map((id) => wordBankTiles.find((tile) => tile.id === id)?.word || '')
    .filter(Boolean);

  const handleShuffleExercises = () => {
    const list = [...exercises];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setExercises(list);
    setCurrentIndex(0);
    setPlacedTileIds([]);
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

  // Automaticity Timer & Mastery Loop Tracking (Zero Heart Paywall)
  const exerciseStartTimeRef = useRef<number>(Date.now());
  const initialExerciseCountRef = useRef<number>(lesson.exercises.length);
  const queuedRetryIdsRef = useRef<Set<string>>(new Set());
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([]);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [repairedMistakesCount, setRepairedMistakesCount] = useState(0);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState('');

  const [autoHintPill, setAutoHintPill] = useState<string | null>(null);
  const [showNameForge, setShowNameForge] = useState(lesson.stage === 'Pre-A0');
  const [inputMode, setInputMode] = useState<'tiles' | 'keyboard'>('tiles');

  useEffect(() => {
    setHintDrawerOpen(false);
    setHintStage(1);
  }, [currentIndex]);

  // Desktop Keyboard Shortcuts (Enter to Check / Next, Backspace to undo last placed tile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSummary || showExitConfirm) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!isAnswered) {
            if (userInput.trim()) handleCheckAnswer();
          } else {
            handleNextExercise();
          }
        }
        return;
      }
      if (e.key === 'Backspace' && !isAnswered && inputMode === 'tiles') {
        e.preventDefault();
        setPlacedTileIds((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isAnswered) {
          const hasInput = inputMode === 'tiles' ? selectedChips.length > 0 : !!userInput.trim();
          if (hasInput) {
            handleCheckAnswer();
          }
        } else {
          handleNextExercise();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, selectedChips, userInput, inputMode, showSummary, showExitConfirm]);

  const currentExercise: ExerciseItem | undefined = exercises[currentIndex] || exercises[0];
  const isJapaneseExercise = /[\u3040-\u30ff\u3400-\u9fff]/u.test(currentExercise?.targetSentence || '');
  const isTargetRtl = /[\u0600-\u06FF]/u.test(currentExercise?.targetSentence || '');

  useEffect(() => {
    if (!currentExercise) return;
    setWordBankTiles(buildWordBankForExercise(currentExercise, currentIndex));
    setPlacedTileIds([]);
  }, [currentExercise?.id, currentIndex]);

  useEffect(() => {
    exerciseStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const currentTargetTokens = tokenizeTargetSentence(currentExercise?.targetSentence || '');
  const isSentenceSlotsFull = inputMode === 'tiles' && placedTileIds.length >= currentTargetTokens.length;

  const triggerAutoHelper = useCallback((customPillMessage?: string): string | null => {
    if (isAnswered || showSummary || !currentExercise) return null;

    const targetSentence = currentExercise.targetSentence || '';
    const targetTokens = tokenizeTargetSentence(targetSentence);

    if (inputMode === 'tiles') {
      if (placedTileIds.length >= targetTokens.length) {
        return null;
      }

      const nextTile = selectNextHintTile(targetSentence, placedTileIds, wordBankTiles);
      if (!nextTile) {
        return null;
      }

      setPlacedTileIds((prev) => appendPlacedTileId(prev, nextTile.id, targetTokens.length));
      setAutoHintPill(
        customPillMessage ?? (
          isArabic
            ? `💡 أضفنا الكلمة: "${nextTile.word}"`
            : `💡 Added word: "${nextTile.word}"`
        )
      );
      return nextTile.word;
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
  }, [isAnswered, showSummary, currentExercise, placedTileIds, wordBankTiles, userInput, isArabic, inputMode]);

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
    if (isAnswered || !currentExercise) return;

    const rawTimeSpentMs = Math.max(1000, Date.now() - exerciseStartTimeRef.current);
    const timeSpentMs = Math.min(30000, rawTimeSpentMs);
    setResponseTimesMs((prev) => [...prev, timeSpentMs]);

    let userSentence = '';
    if (inputMode === 'tiles') {
      userSentence = selectedChips.join(' ').trim();
    } else {
      userSentence = userInput.trim();
    }

    const normalizeAnswer = (value: string) =>
      normalizeAnswerForComparison(value, isJapaneseExercise);
    const normUser = normalizeAnswer(userSentence);
    const normTarget = normalizeAnswer(currentExercise.targetSentence);

    const transferMatch = checkAnswerMatch(userSentence, {
      ...currentExercise,
      englishTarget: currentExercise.targetSentence,
      arabicThought: currentExercise.promptAr,
      acceptableAlternatives: currentExercise.acceptableAlternatives || [],
    } as any);

    const isMatch =
      normUser === normTarget ||
      (currentExercise.acceptableAlternatives || []).some(
        (alt) => normalizeAnswer(alt) === normUser
      ) ||
      transferMatch.isCorrect;

    setLastSubmittedAnswer(userSentence);

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
      speakWithRate(currentExercise.targetSentence, 1.0, undefined, activeTargetLang);

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
      if (!currentExercise.id.endsWith('__retry') && !queuedRetryIdsRef.current.has(currentExercise.id)) {
        queuedRetryIdsRef.current.add(currentExercise.id);
        setExercises((prev) => [...prev, { ...currentExercise, id: `${currentExercise.id}__retry` }]);
      }
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
      if (currentExercise.id.endsWith('__retry')) {
        setRepairedMistakesCount((prev) => prev + 1);
      } else {
        setFirstTryCorrectCount((prev) => prev + 1);
      }
    }
  };

  const handleNextExercise = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setPlacedTileIds([]);
    setUserInput('');
    setAutoHintPill(null);
    setHintDrawerOpen(false);
    setLastAddedHintWord(null);

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  if (!currentExercise) {
    return (
      <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-xl flex items-center justify-center p-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md rounded-3xl bg-surface border border-border p-6 text-center space-y-4 shadow-2xl">
          <p className="text-base font-black text-text">
            {isArabic ? '🚧 جاري بناء تمارين هذا الدرس يومياً' : '🚧 Exercises for this lesson are being built daily'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 min-h-[44px] rounded-2xl bg-primary text-on-primary font-black text-sm cursor-pointer"
          >
            {isArabic ? '← العودة للمسار' : '← Back to Path'}
          </button>
        </div>
      </div>
    );
  }

  if (showNameForge) {
    return (
      <div className="fixed inset-0 z-[100] bg-bg/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6">
        <NameForge onComplete={() => setShowNameForge(false)} />
      </div>
    );
  }

  if (showSummary) {
    const accuracy = Math.min(100, Math.round((firstTryCorrectCount / Math.max(1, initialExerciseCountRef.current)) * 100));
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
      <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center p-2 pt-safe pb-safe sm:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="w-full h-full sm:h-auto sm:max-h-[88dvh] sm:max-w-[520px] md:max-w-xl sm:rounded-3xl bg-bg border border-border shadow-2xl flex flex-col items-center justify-center p-6 text-center">
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

            {repairedMistakesCount > 0 && (
              <div className="px-3.5 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-black">
                🔄 {isArabic ? `أصلحت ${repairedMistakesCount} أخطاء بمهارة!` : `Mastered ${repairedMistakesCount} past mistake(s)!`}
              </div>
            )}

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
      <div className="w-full h-full flex flex-col sm:h-auto sm:max-h-[88dvh] sm:max-w-xl md:max-w-2xl lg:max-w-4xl sm:rounded-3xl bg-bg border border-border shadow-2xl overflow-hidden relative">
        {/* Top Header Progress Bar */}
        <div className="sticky top-0 z-40 px-3 sm:px-4 pb-3 pt-safe border-b border-border flex items-center gap-2 sm:gap-3 bg-[#06101c]/95 backdrop-blur-md shrink-0">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-surface-2 text-muted hover:text-text font-bold transition cursor-pointer shrink-0"
            aria-label={isArabic ? 'إغلاق الدرس' : 'Close Lesson'}
          >
            <X size={20} />
          </button>
          <div className="flex-1 min-w-[32px] bg-surface-2 h-3 rounded-full overflow-hidden border border-border">
            <div
              className="bg-success h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span
              data-testid="unlimited-hearts-badge"
              className="px-2 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black flex items-center gap-1 whitespace-nowrap"
              title={isArabic ? 'قلوب لا محدودة مجاناً — أخطئ وتعلم بحرية' : 'Unlimited free hearts — zero paywalls'}
            >
              <span>❤️</span>
              <span>∞</span>
              <span className="hidden sm:inline">{isArabic ? 'مجاناً' : 'Free'}</span>
            </span>
            {sessionStreak >= 2 && (
              <span
                data-testid="combo-flame"
                className="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black whitespace-nowrap"
              >
                🔥 x{sessionStreak}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const addedWord = triggerAutoHelper();
                if (addedWord) setLastAddedHintWord(addedWord);
                setHintDrawerOpen(true);
              }}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold transition active:scale-95 cursor-pointer"
              title={isArabic ? 'تلميح ذكي' : 'Smart Hint'}
              aria-label={isArabic ? 'تلميح ذكي' : 'Smart Hint'}
            >
              <Brain size={16} className="text-cyan-400 shrink-0" />
              <span className="hidden sm:inline ms-1.5">{uiMode === 'simple' ? (isArabic ? 'ساعدني' : 'Help') : (isArabic ? 'تلميح' : 'Hint')}</span>
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
            <div className="flex items-center gap-1 text-xs font-black text-muted whitespace-nowrap" dir="ltr">
              <Timer size={14} className="text-primary shrink-0" />
              <span>{currentIndex + 1}/{exercises.length}</span>
            </div>
          </div>
        </div>

        {/* Exercise Body */}
        <motion.div
          key={`${lesson.id}-${currentExercise.id}-${currentIndex}`}
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

          {currentExercise.id.endsWith('__retry') && (
            <div className="flex justify-center">
              <span
                data-testid="mistake-repair-badge"
                className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 text-xs font-black"
              >
                🔄 {isArabic ? 'إصلاح خطأ سابق · Mistake Repair' : 'Mistake Repair · Master It Now'}
              </span>
            </div>
          )}

          {/* Always-visible unclipped scene card; reveals target only after answered */}
          <LevelVisualIllustration
            stage={lesson.stage || 'A0'}
            levelNumber={currentIndex + 1}
            promptAr={currentExercise.promptAr}
            englishTarget={currentExercise.targetSentence}
            revealTarget={isAnswered}
            className="max-w-[360px]"
          />

          {/* Source Thought Prompt */}
          <div className="p-4 rounded-3xl bg-surface border border-border space-y-2 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-success block">
                {isArabic ? 'عَبّر عن الفكرة بترتيب اللغة المستهدفة:' : 'Express the thought in the target language:'}
              </span>
              <h2 className="text-lg font-black text-text" dir={!isArabic ? 'ltr' : 'auto'}>
                "{isArabic ? currentExercise.promptAr : (currentExercise.promptEn || currentExercise.promptAr)}"
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {inputMode === 'tiles' && (
                <button
                  type="button"
                  onClick={() => setShowGlosses((v) => !v)}
                  className="px-2.5 py-1.5 min-h-[48px] min-w-[48px] justify-center rounded-xl bg-surface-2 text-text text-xs font-bold border border-border flex items-center gap-1 cursor-pointer"
                  title={showGlosses ? (isArabic ? 'إخفاء المعاني' : 'Hide Glosses') : (isArabic ? 'إظهار المعاني' : 'Show Glosses')}
                >
                  {showGlosses ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span className="hidden sm:inline">{showGlosses ? (isArabic ? 'إخفاء المعاني' : 'Hide Glosses') : (isArabic ? 'إظهار المعاني' : 'Show Glosses')}</span>
                </button>
              )}
              <button
                type="button"
                data-testid="toggle-input-mode"
                onClick={() => setInputMode((m) => (m === 'tiles' ? 'keyboard' : 'tiles'))}
                className="px-3 py-1.5 min-h-[48px] rounded-xl bg-surface-2 text-text text-xs font-bold border border-border shrink-0 cursor-pointer"
              >
                {inputMode === 'tiles' ? (isArabic ? '⌨️ كيبورد' : 'Keyboard') : (isArabic ? '🧩 كلمات' : 'Word Tiles')}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <DualSpeedAudio text={currentExercise.targetSentence} showLabels={true} targetLang={activeTargetLang} isArabic={isArabic} />
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
                {placedTileIds.length === 0 ? (
                  <span className="text-xs text-muted font-bold" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic ? 'اضغط الكلمات أدناه للترتيب الصحيح' : 'Tap words below to arrange'}
                  </span>
                ) : (
                  placedTileIds.map((tileId) => {
                    const tile = wordBankTiles.find((t) => t.id === tileId);
                    const chip = tile?.word || '';
                    const gloss = getGlossForWord(chip, currentExercise.breakdownChunks || [], activeTargetLang, activeSourceLang);
                    return (
                      <button
                        key={tileId}
                        onClick={() => {
                          if (!isAnswered) {
                            speakWithRate(chip, 1.0, undefined, activeTargetLang);
                            setPlacedTileIds((prev) => prev.filter((id) => id !== tileId));
                          }
                        }}
                        dir={isTargetRtl ? 'rtl' : 'ltr'}
                        style={{ unicodeBidi: 'isolate', touchAction: 'manipulation' }}
                        className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 font-black text-sm flex flex-col items-center justify-center active:scale-95 shadow-sm cursor-pointer"
                      >
                        <span>{chip}</span>
                        {showGlosses && gloss && <span className="text-[11px] sm:text-xs font-medium text-purple-300 dark:text-purple-300 opacity-90 mt-0.5 leading-none" dir={!isTargetRtl ? 'rtl' : 'ltr'}>{gloss}</span>}
                      </button>
                    );
                  })
                )}
                {placedTileIds.length > 0 && !isAnswered && (
                  <button
                    type="button"
                    data-testid="clear-placed-tiles"
                    onClick={() => setPlacedTileIds([])}
                    aria-label={isArabic ? 'مسح الكلمات المختارة' : 'Clear selected words'}
                    className="ms-auto px-2.5 py-2 min-h-[44px] rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw size={13} />
                    <span>{isArabic ? 'مسح' : 'Clear'}</span>
                  </button>
                )}
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

          {/* Rule Explanation "WHY" Feedback Card + Word-by-Word Diff + Interactive Sentence Map */}
          {isAnswered && (
            <div
              ref={(el) => {
                if (el && typeof el.scrollIntoView === 'function') {
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              className={`p-4 rounded-2xl border text-start pb-3 space-y-3 ${
                isCorrect
                  ? 'bg-success/15 border-success text-text'
                  : 'bg-danger/15 border-danger text-text'
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="text-success shrink-0" size={20} />
                      <span>{isArabic ? 'إجابة ممتازة وبناء صحيح! 🎉' : 'Great Job! Perfect Structure! 🎉'}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-danger shrink-0" size={20} />
                      <span>{isArabic ? 'إجابة تحتاج تعديل بسيط' : 'Needs adjustment'}</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => speakWithRate(currentExercise.targetSentence, 1.0, undefined, activeTargetLang)}
                  className="px-3 py-2 min-h-[48px] min-w-[48px] rounded-xl bg-surface-2 border border-border text-text hover:bg-surface text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  aria-label={isArabic ? 'استمع للجملة الصحيحة' : 'Listen to target sentence'}
                >
                  <Volume2 size={14} className="text-cyan-400" />
                  <span>{isArabic ? 'اسمع' : 'Listen'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-text-soft leading-normal sm:leading-relaxed pb-0.5" dir={isArabic ? 'rtl' : 'ltr'}>
                <strong>{isArabic ? 'الجملة الصحيحة:' : 'Target:'}</strong>{' '}
                <span dir="ltr" className="font-bold text-text inline-block pb-0.5">{currentExercise.targetSentence}</span>
              </p>

              {!isCorrect && (() => {
                const diffTokens = computeSentenceDiff(lastSubmittedAnswer, currentExercise.targetSentence);
                const l1Hint = diagnoseL1TransferHint(lastSubmittedAnswer, currentExercise.targetSentence, activeTargetLang, isArabic);
                return (
                  <div className="space-y-2.5 border-t border-border/50 pt-2.5">
                    {diffTokens.length > 0 && (
                      <div className="space-y-1.5" data-testid="mistake-diff">
                        <span className="text-[11px] font-black text-amber-300 block">
                          {isArabic ? '🔍 مقارنة كلمة بكلمة:' : '🔍 Word-by-word diff:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5" dir={isTargetRtl ? 'rtl' : 'ltr'}>
                          {diffTokens.map((tok, idx) => (
                            <span
                              key={`${tok.word}-${idx}`}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 ${
                                tok.status === 'match'
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                              }`}
                            >
                              {tok.status === 'wrong' && tok.userWord && (
                                <span className="line-through text-rose-300 opacity-90">{tok.userWord}</span>
                              )}
                              <span>{tok.word}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {l1Hint && (
                      <div
                        data-testid="l1-diagnosis"
                        className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-100 leading-relaxed"
                      >
                        🧠 <strong>{isArabic ? 'مدرب التفكير (مجاناً):' : 'Free L1 Coach:'}</strong> {l1Hint}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Interactive Tap-to-Hear Sentence Map */}
              {(() => {
                const mapTokens = tokenizeTargetSentence(currentExercise.targetSentence);
                if (mapTokens.length === 0) return null;
                return (
                  <div className="space-y-1.5 border-t border-border/50 pt-2.5" data-testid="sentence-map">
                    <span className="text-[11px] font-black text-cyan-300 block">
                      🧩 {isArabic ? 'خريطة الجملة (اضغط أي كلمة للنطق):' : 'Sentence Map (tap any word to hear):'}
                    </span>
                    <div className="flex flex-wrap gap-1.5" dir={isTargetRtl ? 'rtl' : 'ltr'}>
                      {mapTokens.map((tok, idx) => {
                        const gloss = getGlossForWord(tok, currentExercise.breakdownChunks || [], activeTargetLang, activeSourceLang);
                        return (
                          <button
                            key={`${tok}-${idx}`}
                            type="button"
                            onClick={() => speakWithRate(tok, 1.0, undefined, activeTargetLang)}
                            className="px-3 py-2 min-h-[48px] min-w-[48px] rounded-xl bg-surface-2 border border-border hover:border-cyan-400/60 text-text text-xs font-bold flex flex-col items-center justify-center cursor-pointer active:scale-95 transition"
                          >
                            <span>{tok}</span>
                            {gloss && (
                              <span className="text-[10px] font-medium text-muted leading-none mt-0.5" dir={!isTargetRtl ? 'rtl' : 'ltr'}>
                                {gloss}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const arHasArabic = /[\u0600-\u06FF]/.test(currentExercise.explanationAr || '');
                const displayExplanation = isArabic
                  ? (arHasArabic ? currentExercise.explanationAr : getSmartGrammarClue(currentExercise, true, activeTargetLang))
                  : (currentExercise.explanationEn || (arHasArabic ? '' : currentExercise.explanationAr) || getSmartGrammarClue(currentExercise, false, activeTargetLang));
                if (!displayExplanation) return null;
                return (
                  <p className="text-xs text-muted border-t border-border/50 pt-2 pb-1 leading-relaxed" dir={isArabic ? 'rtl' : 'ltr'}>
                    💡 <strong>{isArabic ? 'سبب القاعدة:' : 'Rule Explanation:'}</strong>{' '}
                    {displayExplanation}
                  </p>
                );
              })()}
            </div>
          )}

          {/* Available Word Chips Bank */}
          {inputMode === 'tiles' && (
            <div className="flex flex-wrap gap-2 justify-center pt-1" dir={isTargetRtl ? 'rtl' : 'ltr'}>
              {wordBankTiles.map((tile) => {
                const chip = tile.word;
                const isSelected = placedTileIds.includes(tile.id);
                const gloss = getGlossForWord(chip, currentExercise.breakdownChunks || [], activeTargetLang, activeSourceLang);
                return (
                  <button
                    key={tile.id}
                    disabled={isSelected || isAnswered}
                    data-testid="word-chip"
                    data-word={chip}
                    onClick={() => {
                      soundFX.playChipSelect();
                      speakWithRate(chip, 1.0, undefined, activeTargetLang);
                      setPlacedTileIds((prev) =>
                        prev.includes(tile.id) ? prev : [...prev, tile.id]
                      );
                    }}
                    dir={isTargetRtl ? 'rtl' : 'ltr'}
                    style={{ unicodeBidi: 'isolate', touchAction: 'manipulation' }}
                    className={`px-4 py-2.5 min-h-[48px] rounded-xl font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                      isSelected
                        ? 'opacity-30 bg-surface border border-border text-muted cursor-not-allowed'
                        : 'bg-surface border border-border text-text hover:bg-surface-2 active:scale-95 shadow-sm'
                    }`}
                  >
                    <span>{chip}</span>
                    {showGlosses && gloss && <span className="text-[11px] sm:text-xs font-medium text-slate-300 dark:text-slate-300 opacity-85 mt-0.5 leading-none" dir={!isTargetRtl ? 'rtl' : 'ltr'}>{gloss}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Docked Non-Overlapping Smart Assistant Bottom Sheet */}
        {hintDrawerOpen && (
          <div
            role="region"
            aria-label={isArabic ? 'المساعد الذكي' : 'Smart Hint Assistant'}
            className="shrink-0 max-h-[42dvh] overflow-y-auto bg-[#0B1C33] border-t-2 border-cyan-500/50 shadow-[0_-8px_28px_rgba(0,0,0,0.45)] px-4 py-3 space-y-2.5 text-start"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">💡</span>
                <h3 className="text-sm font-black text-white">{isArabic ? 'المساعد الذكي' : 'Smart Hint Assistant'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setHintDrawerOpen(false)}
                aria-label={isArabic ? 'إغلاق المساعد الذكي' : 'Close Smart Assistant'}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 cursor-pointer text-sm font-black shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {lastAddedHintWord && (
              <div className="flex items-center justify-between gap-2 bg-slate-950/90 p-2.5 rounded-xl border border-cyan-500/30">
                <span className="text-xs font-bold text-emerald-300 shrink-0">✅ أضفنا الكلمة:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-black text-amber-300 text-sm px-2 py-0.5 bg-amber-500/15 rounded-lg" dir="ltr">
                    {lastAddedHintWord}
                  </span>
                  <DualSpeedAudio text={lastAddedHintWord} showLabels={false} targetLang={activeTargetLang} className="flex items-center gap-1.5" />
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span>🧠 القاعدة وسر التركيب:</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-medium">
                {getSmartGrammarClue(currentExercise, isArabic, activeTargetLang)}
              </p>
            </div>

            <button
              type="button"
              disabled={isAnswered || isSentenceSlotsFull}
              onClick={() => {
                const nextAdded = triggerAutoHelper();
                if (nextAdded) setLastAddedHintWord(nextAdded);
              }}
              className="w-full py-2.5 min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <span>{isSentenceSlotsFull ? (isArabic ? '✅ اكتملت كلمات الجملة' : '✅ All words placed') : '➕ ضيف الكلمة الجاية'}</span>
            </button>
          </div>
        )}

        {/* Sticky Bottom Action Bar (60px Height, High Contrast) */}
        <div className="sticky bottom-0 bg-stone-950 p-4 border-t border-stone-800 z-10 shrink-0 pb-safe">
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
