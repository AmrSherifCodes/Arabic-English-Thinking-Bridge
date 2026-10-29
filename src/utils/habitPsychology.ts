import { UserProgress } from '../types';
import { normalizeSentence } from './transferLogic';

export const DAILY_GOAL_TARGET = 5;
export const MYSTERY_CHEST_THRESHOLD = 3;
export const MAX_STREAK_SHIELDS = 3;

export interface MysteryChestOutcome {
  triggered: boolean;
  bonusXp: number;
  label: string;
}

export interface HabitWinTransition {
  nextProgress: UserProgress;
  totalEarnedXp: number;
  mysteryChest: MysteryChestOutcome;
  dailyGoalJustCompleted: boolean;
  shieldAwarded: boolean;
  stepsToNextChest: number;
}

export interface HabitMistakeTransition {
  nextProgress: UserProgress;
  shieldUsed: boolean;
  preservedStreak: number;
}

/**
 * Variable-Ratio / Variable-Magnitude Reward (Skinner Box Dopamine Loop):
 * Every 3rd correct action pops a Mystery XP Chest with a deterministic surprise reward tier.
 */
export function rollMysteryChestReward(seed: number): MysteryChestOutcome {
  const bucket = Math.abs(Math.floor(seed)) % 3;
  if (bucket === 2) {
    return {
      triggered: true,
      bonusXp: 50,
      label: '🎁 JACKPOT MYSTERY CHEST! +50 Bonus XP! 🔥'
    };
  }
  if (bucket === 1) {
    return {
      triggered: true,
      bonusXp: 25,
      label: '🎁 Super Mystery Chest! +25 Bonus XP! ✨'
    };
  }
  return {
    triggered: true,
    bonusXp: 15,
    label: '🎁 Mystery Chest Unlocked! +15 Bonus XP! 🎉'
  };
}

/**
 * Noob-Friendly Scaffolding:
 * Given the target English sentence and the learner's current words, returns the exact
 * next English word needed so a beginner never feels stuck or frustrated.
 */
export function computeNextHintWord(
  englishTarget: string,
  currentAnswer: string
): { nextWord: string | null; prefixToKeep: string } {
  const targetTokens = englishTarget
    .replace(/[.,?!]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (targetTokens.length === 0) {
    return { nextWord: null, prefixToKeep: '' };
  }

  const userTokens = currentAnswer
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let matchedCount = 0;
  for (let i = 0; i < Math.min(targetTokens.length, userTokens.length); i++) {
    if (normalizeSentence(userTokens[i]) === normalizeSentence(targetTokens[i])) {
      matchedCount++;
    } else {
      break;
    }
  }

  if (matchedCount >= targetTokens.length) {
    return {
      nextWord: null,
      prefixToKeep: targetTokens.join(' ')
    };
  }

  const validPrefix = targetTokens.slice(0, matchedCount).join(' ');
  return {
    nextWord: targetTokens[matchedCount],
    prefixToKeep: validPrefix
  };
}

/**
 * Applies human psychology habit loops on any correct exercise or card review:
 * - Tiny Habits Daily Goal (5 quick wins/day)
 * - Variable Ratio Mystery Chest every 3 wins
 * - Hot Streak Combo Bonus (+5 XP when streak >= 3)
 * - Recharges 1 Streak Shield when daily goal is reached
 */
export function applyHabitWin(
  prev: UserProgress,
  basePoints: number,
  todayKey: string = new Date().toISOString().split('T')[0]
): HabitWinTransition {
  const prevDailyCount = prev.dailyGoalDate === todayKey ? (prev.dailyGoalCount ?? 0) : 0;
  const nextDailyCount = prevDailyCount + 1;
  const dailyGoalJustCompleted =
    prevDailyCount < DAILY_GOAL_TARGET && nextDailyCount === DAILY_GOAL_TARGET;

  const rawNextCombo = ((prev.comboCount ?? 0) + 1);
  const chestTriggered = rawNextCombo >= MYSTERY_CHEST_THRESHOLD;
  const nextComboCount = chestTriggered ? 0 : rawNextCombo;
  const stepsToNextChest = MYSTERY_CHEST_THRESHOLD - nextComboCount;

  const newStreak = (prev.streak || 0) + 1;
  const comboStreakBonus = newStreak >= 3 && basePoints > 0 ? 5 : 0;

  const mysteryChest: MysteryChestOutcome = chestTriggered
    ? rollMysteryChestReward((prev.score || 0) + newStreak + nextDailyCount)
    : { triggered: false, bonusXp: 0, label: '' };

  const currentShields = prev.streakShields ?? 2;
  const shieldAwarded = dailyGoalJustCompleted && currentShields < MAX_STREAK_SHIELDS;
  const nextShields = shieldAwarded ? currentShields + 1 : currentShields;

  const totalEarnedXp = basePoints + comboStreakBonus + mysteryChest.bonusXp;

  const nextProgress: UserProgress = {
    ...prev,
    score: (prev.score || 0) + totalEarnedXp,
    streak: newStreak,
    bestStreak: Math.max(prev.bestStreak || 0, newStreak),
    dailyGoalCount: nextDailyCount,
    dailyGoalDate: todayKey,
    comboCount: nextComboCount,
    streakShields: nextShields
  };

  return {
    nextProgress,
    totalEarnedXp,
    mysteryChest,
    dailyGoalJustCompleted,
    shieldAwarded,
    stepsToNextChest
  };
}

/**
 * Loss-Aversion Protection:
 * When a learner makes a mistake, if they have an active streak (>= 2) and at least 1 Streak Shield,
 * automatically consume 1 Streak Shield to save their streak instead of wiping it to 0!
 */
export function applyHabitMistakeWithShield(prev: UserProgress): HabitMistakeTransition {
  const currentStreak = prev.streak || 0;
  const currentShields = prev.streakShields ?? 2;

  if (currentStreak >= 2 && currentShields > 0) {
    return {
      nextProgress: {
        ...prev,
        streak: currentStreak,
        streakShields: currentShields - 1,
        comboCount: 0
      },
      shieldUsed: true,
      preservedStreak: currentStreak
    };
  }

  return {
    nextProgress: {
      ...prev,
      streak: 0,
      comboCount: 0
    },
    shieldUsed: false,
    preservedStreak: 0
  };
}
