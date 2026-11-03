import {
  ProgressionState,
  CefrStage,
  SkillLevels,
  SkillAxis,
  Quest,
  Achievement,
  LeagueMember
} from './types';

export const XP_PER_EXERCISE = 10;
export const COMBO_BONUS_XP = 5;
export const PERFECT_LESSON_BONUS_XP = 20;

/**
 * Calculates Overall Player Level from total XP using a smooth quadratic curve.
 */
export function calculatePlayerLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(Math.sqrt(totalXp / 50)) + 1;
}

/**
 * Calculates Skill Axis levels (1 to 50) based on accumulated XP in each skill.
 */
export function calculateSkillAxisLevel(skillXp: number): number {
  if (skillXp <= 0) return 1;
  return Math.min(50, Math.floor(Math.sqrt(skillXp / 20)) + 1);
}

/**
 * Default Initial Progression State for new users.
 */
export function createInitialProgressionState(): ProgressionState {
  const today = new Date().toISOString().split('T')[0];

  return {
    version: 2,
    overallLevel: 1,
    xp: 0,
    streak: 0,
    streakShields: 2,
    weekendPauseActive: false,
    lastActiveDate: today,
    dailyDailyTargetMin: 10,
    dailyCardsCap: 30,

    currentStage: 'A0',
    currentUnitId: 'a0-unit-1',
    lessonCrowns: {},
    completedLessonIds: [],
    testedOutUnitIds: [],
    testedOutStageIds: [],

    skills: {
      structure: 1,
      vocabulary: 1,
      listening: 1,
      speaking: 1,
      writing: 1,
    },

    srsItems: {},

    quests: [
      {
        id: 'q-lesson-1',
        titleAr: 'إكمال درس واحد اليوم',
        titleEn: 'Complete 1 lesson today',
        targetCount: 1,
        currentCount: 0,
        xpReward: 25,
        isCompleted: false,
        type: 'daily',
      },
      {
        id: 'q-speaking-10',
        titleAr: 'نطق 5 جمل بصوت عالٍ',
        titleEn: 'Speak 5 sentences aloud',
        targetCount: 5,
        currentCount: 0,
        xpReward: 30,
        isCompleted: false,
        type: 'daily',
      },
      {
        id: 'q-review-15',
        titleAr: 'مراجعة 15 بطاقة ذكية',
        titleEn: 'Review 15 flashcards',
        targetCount: 15,
        currentCount: 0,
        xpReward: 35,
        isCompleted: false,
        type: 'daily',
      },
    ],

    achievements: [
      {
        id: 'ach-first-step',
        titleAr: 'الخطوة الأولى',
        titleEn: 'First Step',
        descAr: 'أكملت أول درس في رحلة التفكير بالإنجليزية',
        descEn: 'Completed your first immersion lesson',
        icon: '🚀',
        unlockedAt: null,
      },
      {
        id: 'ach-streak-3',
        titleAr: 'حماسة متواصلة',
        titleEn: '3-Day Streak',
        descAr: 'حافظت على التمارين لمده 3 أيام متتالية',
        descEn: 'Maintained a 3-day continuous practice streak',
        icon: '🔥',
        unlockedAt: null,
      },
      {
        id: 'ach-crown-master',
        titleAr: 'جامع التاج الأول',
        titleEn: 'First Crown Master',
        descAr: 'وصلت درس إلى المستوى 5 من إتقان التاج',
        descEn: 'Reached Crown level 5 on any lesson',
        icon: '👑',
        unlockedAt: null,
      },
    ],

    leagueOptOut: false,
    leagueTier: 'Bronze',
    weeklyXp: 0,
    leagueMembers: generateDefaultLeagueMembers(),

    isUnder13: false,
    anonymousAlias: 'Champion' + Math.floor(1000 + Math.random() * 9000),
  };
}

/**
 * Handles streak update and shield auto-consumption around date changes.
 */
export function updateStreakAndShields(
  state: ProgressionState,
  currentDateStr: string = new Date().toISOString().split('T')[0]
): ProgressionState {
  const { lastActiveDate, streak, streakShields, weekendPauseActive } = state;

  if (lastActiveDate === currentDateStr) {
    return state; // Already active today
  }

  const lastDate = new Date(lastActiveDate);
  const currDate = new Date(currentDateStr);
  const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    const newStreak = streak + 1;
    return {
      ...state,
      streak: newStreak,
      lastActiveDate: currentDateStr,
    };
  }

  if (diffDays === 2) {
    const isWeekend = currDate.getDay() === 0 || currDate.getDay() === 6;
    if (weekendPauseActive && isWeekend) {
      // Protected by weekend pause
      return {
        ...state,
        streak: streak + 1,
        lastActiveDate: currentDateStr,
      };
    }

    if (streakShields > 0) {
      // Auto-consume shield to preserve streak
      return {
        ...state,
        streakShields: streakShields - 1,
        streak: streak + 1,
        lastActiveDate: currentDateStr,
      };
    }
  }

  // Streak broken if diffDays > 1 and no shield/pause
  return {
    ...state,
    streak: 1,
    lastActiveDate: currentDateStr,
  };
}

/**
 * Generates default anonymous league members for safe competition.
 */
export function generateDefaultLeagueMembers(): LeagueMember[] {
  const names = ['Explorer', 'Learner', 'Thinker', 'Polyglot', 'BridgeBuilder', 'NileVoyager', 'PharaohCode'];
  return names.map((n, idx) => ({
    id: `m-${idx}`,
    alias: `${n}_${Math.floor(100 + Math.random() * 900)}`,
    avatarIcon: ['🦁', '🦅', '🐬', '🦉', '🐺', '🦊', '🐯'][idx % 7],
    weeklyXp: Math.floor(150 + Math.random() * 400),
    tier: 'Bronze',
  }));
}
