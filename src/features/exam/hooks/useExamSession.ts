/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ExamQuestion,
  ExamState,
  ExamSessionResult,
  TargetLang,
  Skill,
  STORAGE_KEYS,
  CEFR,
} from '../types';
import { englishQuestions } from '../data/englishQuestions';
import { germanQuestions } from '../data/germanQuestions';
import { hebrewQuestions } from '../data/hebrewQuestions';
import { nextQuestionLevel } from '../engine/adaptiveEngine';
import { estimateCEFR } from '../engine/scoring';
import { awardXP, checkBadges } from '../engine/gamification';

function getQuestionPool(lang: TargetLang): ExamQuestion[] {
  if (lang === 'de') return germanQuestions;
  if (lang === 'he') return hebrewQuestions;
  return englishQuestions;
}

const LEVEL_MAP: Record<number, CEFR> = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
};

export function useExamSession(
  targetLang: TargetLang,
  isPlacementMode: boolean = true,
  supporterMode: boolean = false
) {
  const pool = useMemo(() => getQuestionPool(targetLang), [targetLang]);

  const [state, setState] = useState<ExamState>(() => ({
    answered: [],
    currentLevel: 2, // Start at A2
    consecutiveCorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
    teaCups: 3, // 3 lives
    xpGained: 0,
    skillsCorrect: new Set<Skill>(),
    unlockedBadges: [],
    isFinished: false,
    isPlacementMode,
    targetLang,
    supporterMode,
  }));

  // Select next question based on current level and pool
  const currentQuestion = useMemo(() => {
    if (state.isFinished || state.answered.length >= 20 || state.teaCups <= 0) {
      return null;
    }

    const targetCefr = LEVEL_MAP[state.currentLevel] || 'A2';
    const answeredIds = new Set(state.answered.map((a) => a.question.id));

    // Attempt matching CEFR level
    const available = pool.filter(
      (q) => q.cefr === targetCefr && !answeredIds.has(q.id)
    );

    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      return available[idx];
    }

    // Fallback to any unanswered question in pool
    const anyAvailable = pool.filter((q) => !answeredIds.has(q.id));
    if (anyAvailable.length > 0) {
      return anyAvailable[Math.floor(Math.random() * anyAvailable.length)];
    }

    return null;
  }, [pool, state.currentLevel, state.answered, state.isFinished, state.teaCups]);

  const answerQuestion = useCallback(
    (selectedOptionIndex: number) => {
      if (!currentQuestion || state.isFinished) return;

      const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;

      setState((prev) => {
        const nextAnswered = [
          ...prev.answered,
          { question: currentQuestion, selectedOptionIndex, isCorrect },
        ];

        const nextConsecutive = isCorrect ? prev.consecutiveCorrect + 1 : 0;
        const nextCurrentStreak = isCorrect ? prev.currentStreak + 1 : 0;
        const nextBestStreak = Math.max(prev.bestStreak, nextCurrentStreak);

        const nextTeaCups = isCorrect ? prev.teaCups : prev.teaCups - 1;
        const gainedXP = awardXP(isCorrect, nextCurrentStreak);
        const nextXp = prev.xpGained + gainedXP;

        const nextSkillsCorrect = new Set(prev.skillsCorrect);
        if (isCorrect) {
          nextSkillsCorrect.add(currentQuestion.skill);
        }

        const nextLevel = nextQuestionLevel(
          prev.currentLevel,
          isCorrect,
          nextConsecutive
        );

        const isFinished = nextAnswered.length >= 20 || nextTeaCups <= 0;

        const updatedState: ExamState = {
          ...prev,
          answered: nextAnswered,
          currentLevel: nextLevel,
          consecutiveCorrect: nextConsecutive,
          currentStreak: nextCurrentStreak,
          bestStreak: nextBestStreak,
          teaCups: nextTeaCups,
          xpGained: nextXp,
          skillsCorrect: nextSkillsCorrect,
          isFinished,
        };

        if (isFinished) {
          // Persist progress to local storage
          try {
            const currentTotalXP =
              parseInt(localStorage.getItem(STORAGE_KEYS.XP) || '0', 10) + nextXp;
            localStorage.setItem(STORAGE_KEYS.XP, currentTotalXP.toString());

            const existingBestStreak = parseInt(
              localStorage.getItem(STORAGE_KEYS.STREAK_BEST) || '0',
              10
            );
            if (nextBestStreak > existingBestStreak) {
              localStorage.setItem(
                STORAGE_KEYS.STREAK_BEST,
                nextBestStreak.toString()
              );
            }

            const rawBadges = localStorage.getItem(STORAGE_KEYS.BADGES);
            const savedBadges: string[] = rawBadges ? JSON.parse(rawBadges) : [];
            const newBadges = checkBadges(updatedState, savedBadges);
            localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(newBadges));
            updatedState.unlockedBadges = newBadges;

            const finalCefr = estimateCEFR(
              nextAnswered.map((a) => ({
                level: (['A1', 'A2', 'B1', 'B2', 'C1'].indexOf(a.question.cefr) + 1),
                correct: a.isCorrect,
              }))
            );

            const result: ExamSessionResult = {
              lang: targetLang,
              estimatedCefr: finalCefr,
              scorePercentage: Math.round(
                (nextAnswered.filter((a) => a.isCorrect).length /
                  nextAnswered.length) *
                  100
              ),
              totalQuestions: nextAnswered.length,
              correctCount: nextAnswered.filter((a) => a.isCorrect).length,
              xpEarned: nextXp,
              bestStreak: nextBestStreak,
              unlockedBadges: newBadges,
              date: new Date().toISOString(),
            };

            localStorage.setItem(
              STORAGE_KEYS.LAST_RESULT,
              JSON.stringify(result)
            );
          } catch (err) {
            console.warn('Failed to persist exam session results.', err);
          }
        }

        return updatedState;
      });
    },
    [currentQuestion, state.isFinished, targetLang]
  );

  const skipQuestion = useCallback(() => {
    if (!currentQuestion || state.isFinished) return;

    // Skipping does NOT cost tea cups, but is marked as unanswered/incorrect for staircase
    setState((prev) => {
      const nextAnswered = [
        ...prev.answered,
        { question: currentQuestion, selectedOptionIndex: -1, isCorrect: false },
      ];

      const nextLevel = nextQuestionLevel(prev.currentLevel, false, 0);
      const isFinished = nextAnswered.length >= 20;

      return {
        ...prev,
        answered: nextAnswered,
        currentLevel: nextLevel,
        consecutiveCorrect: 0,
        currentStreak: 0,
        isFinished,
      };
    });
  }, [currentQuestion, state.isFinished]);

  const restartSession = useCallback(() => {
    setState({
      answered: [],
      currentLevel: 2,
      consecutiveCorrect: 0,
      bestStreak: 0,
      currentStreak: 0,
      teaCups: 3,
      xpGained: 0,
      skillsCorrect: new Set<Skill>(),
      unlockedBadges: [],
      isFinished: false,
      isPlacementMode,
      targetLang,
      supporterMode,
    });
  }, [isPlacementMode, targetLang, supporterMode]);

  const result = useMemo<ExamSessionResult | null>(() => {
    if (!state.isFinished || state.answered.length === 0) return null;
    const finalCefr = estimateCEFR(
      state.answered.map((a) => ({
        level: ['A1', 'A2', 'B1', 'B2', 'C1'].indexOf(a.question.cefr) + 1,
        correct: a.isCorrect,
      }))
    );
    const correctCount = state.answered.filter((a) => a.isCorrect).length;

    return {
      lang: targetLang,
      estimatedCefr: finalCefr,
      scorePercentage: Math.round((correctCount / state.answered.length) * 100),
      totalQuestions: state.answered.length,
      correctCount,
      xpEarned: state.xpGained,
      bestStreak: state.bestStreak,
      unlockedBadges: state.unlockedBadges,
      date: new Date().toISOString(),
    };
  }, [state.isFinished, state.answered, state.xpGained, state.bestStreak, state.unlockedBadges, targetLang]);

  return {
    state,
    currentQuestion,
    answerQuestion,
    skipQuestion,
    restartSession,
    result,
  };
}
