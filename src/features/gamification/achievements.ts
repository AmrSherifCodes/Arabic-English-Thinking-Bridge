export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface SteamAchievement {
  id: string;
  rarity: AchievementRarity;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  xpReward: number;
  proOnly: boolean;
}

export interface GamificationStore {
  unlocked: Record<string, number>;
  bonusXp: number;
  blitzBestScore: number;
  blitzMaxCombo: number;
  bossesDefeated: string[];
  flawlessBossWins: number;
  streakFreezeShields: number;
  proTeaserUsed: boolean;
}

export interface RpgRankInfo {
  level: number;
  titleAr: string;
  titleEn: string;
  tierColor: string;
  totalXp: number;
  currentLevelStartXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpRequiredForNext: number;
  progressPercent: number;
}

export const GAMIFICATION_STORAGE_KEY = 'tb.gamification.v1';
export const ACHIEVEMENT_UNLOCKED_EVENT = 'tb:achievement-unlocked';
export const GAMIFICATION_UPDATED_EVENT = 'tb:gamification-updated';

export const STEAM_ACHIEVEMENTS: readonly SteamAchievement[] = [
  // --- First 4: Starter Achievements (100% Free Forever) ---
  {
    id: 'name_forged',
    rarity: 'Common',
    titleAr: 'اسمك على الجسر',
    titleEn: 'Name Forged',
    descAr: 'ابدأ رحلتك وحدد ملفك الشخصي على جسر التفكير.',
    descEn: 'Begin your Thinking Bridge journey with a learner profile.',
    icon: '🪪',
    xpReward: 50,
    proOnly: false,
  },
  {
    id: 'first_bridge',
    rarity: 'Common',
    titleAr: 'أول خطوة على الجسر',
    titleEn: 'First Bridge Crossed',
    descAr: 'أكمل أول درس تفاعلي بدون ترجمة حرفية.',
    descEn: 'Complete your first interactive thinking lesson.',
    icon: '🌉',
    xpReward: 75,
    proOnly: false,
  },
  {
    id: 'daily_spark',
    rarity: 'Common',
    titleAr: 'شرارة 3 أيام',
    titleEn: '3-Day Spark',
    descAr: 'حافظ على سلسلة تعلم لمدة 3 أيام متتالية.',
    descEn: 'Maintain a 3-day learning streak.',
    icon: '🔥',
    xpReward: 100,
    proOnly: false,
  },
  {
    id: 'flashcard_initiate',
    rarity: 'Common',
    titleAr: 'حارس الذاكرة',
    titleEn: 'Memory Keeper',
    descAr: 'راجع 10 بطاقات ذكية بنظام SM-2.',
    descEn: 'Review 10 spaced-repetition SM-2 flashcards.',
    icon: '🃏',
    xpReward: 100,
    proOnly: false,
  },

  // --- Pro Trophy Cabinet: Rare, Epic & Legendary Achievements ---
  {
    id: 'copula_slayer',
    rarity: 'Rare',
    titleAr: 'قاتل الرابط الخفي — 10 متتالية',
    titleEn: 'Copula Slayer — 10 Streak',
    descAr: 'حقق سلسلة 10 إجابات صحيحة بدون نسيان (am / is / are).',
    descEn: 'Land a 10-answer streak without missing English copula traps.',
    icon: '⚔️',
    xpReward: 200,
    proOnly: true,
  },
  {
    id: 'midnight_scholar',
    rarity: 'Rare',
    titleAr: 'باحث منتصف الليل',
    titleEn: 'Midnight Scholar',
    descAr: 'أكمل تمريناً بعد الساعة 11 مساءً بتوقيتك المحلي.',
    descEn: 'Complete a study session after 11:00 PM local time.',
    icon: '🌙',
    xpReward: 150,
    proOnly: true,
  },
  {
    id: 'shadow_master',
    rarity: 'Rare',
    titleAr: 'سيد الـ Shadowing',
    titleEn: 'Shadow Master',
    descAr: 'درّب نطقك في استوديو الصوت المحلي.',
    descEn: 'Practice shadowing in the local Voice Studio.',
    icon: '🎙️',
    xpReward: 200,
    proOnly: true,
  },
  {
    id: 'blitz_survivor',
    rarity: 'Rare',
    titleAr: 'ناجي قناص الأخطاء (60ث)',
    titleEn: '60s Blitz Survivor',
    descAr: 'أكمل جولة كاملة في تحدي قناص الأخطاء (60 ثانية) بنتيجة 500+.',
    descEn: 'Survive a full 60-second L1 Trap Blitz round with 500+ score.',
    icon: '⚡',
    xpReward: 250,
    proOnly: true,
  },
  {
    id: 'week_warrior',
    rarity: 'Rare',
    titleAr: 'محارب 7 أيام',
    titleEn: '7-Day Nile Streak',
    descAr: 'استمر في التدريب 7 أيام متتالية بلا انقطاع.',
    descEn: 'Keep your learning streak alive for 7 straight days.',
    icon: '🛡️',
    xpReward: 250,
    proOnly: true,
  },
  {
    id: 'shield_bearer',
    rarity: 'Rare',
    titleAr: 'حامل درع السلسلة',
    titleEn: 'Shield Bearer',
    descAr: 'فعّل باقة Pro واحصل على دروع حماية السلسلة.',
    descEn: 'Activate Pro and equip Streak-Freeze Shields.',
    icon: '🔰',
    xpReward: 200,
    proOnly: true,
  },
  {
    id: 'combo_king',
    rarity: 'Epic',
    titleAr: 'قناص كومبو x5',
    titleEn: 'x5 Combo Sniper',
    descAr: 'اوصل لمضاعف كومبو x5 في تحدي قناص الأخطاء.',
    descEn: 'Reach the maximum x5 combo multiplier in L1 Trap Blitz.',
    icon: '🎯',
    xpReward: 300,
    proOnly: true,
  },
  {
    id: 'boss_vanquisher',
    rarity: 'Epic',
    titleAr: 'قاهر الزعماء',
    titleEn: 'Boss Vanquisher',
    descAr: 'اهزم أول زعيم في معركة الزعيم (RPG Boss Duel).',
    descEn: 'Defeat your first guardian in Level Boss Duel.',
    icon: '🐉',
    xpReward: 350,
    proOnly: true,
  },
  {
    id: 'lesson_decathlon',
    rarity: 'Epic',
    titleAr: 'بطل الـ 10 دروس',
    titleEn: '10 Lessons Mastered',
    descAr: 'أكمل 10 دروس تفاعلية في مسار التفكير.',
    descEn: 'Master 10 interactive lessons along the Thinking Path.',
    icon: '📚',
    xpReward: 400,
    proOnly: true,
  },
  {
    id: 'xp_titan',
    rarity: 'Epic',
    titleAr: 'عملاق الـ 2500 نقطة',
    titleEn: '2,500 XP Titan',
    descAr: 'اجمع 2,500 نقطة خبرة XP إجمالية.',
    descEn: 'Accumulate 2,500 total XP across lessons and arcade.',
    icon: '💎',
    xpReward: 350,
    proOnly: true,
  },
  {
    id: 'zero_hit_duel',
    rarity: 'Epic',
    titleAr: 'مبارز بلا خدش',
    titleEn: 'Flawless Duelist',
    descAr: 'اهزم زعيماً في معركة الزعيم بدون خسارة أي نقطة HP.',
    descEn: 'Defeat a Level Boss without taking a single point of damage.',
    icon: '✨',
    xpReward: 450,
    proOnly: true,
  },
  {
    id: 'alexandria_polyglot',
    rarity: 'Legendary',
    titleAr: 'طلاقة إسكندرية',
    titleEn: 'Alexandria Fluency',
    descAr: 'حقق 1,500+ نقطة في قناص الأخطاء أو أكمل 20 درساً.',
    descEn: 'Score 1,500+ in L1 Trap Blitz or complete 20 lessons.',
    icon: '🏛️',
    xpReward: 600,
    proOnly: true,
  },
  {
    id: 'boss_slayer_supreme',
    rarity: 'Legendary',
    titleAr: 'قاهر كل الزعماء',
    titleEn: 'Grand Boss Slayer',
    descAr: 'اهزم جميع زعماء المستويات الثلاثة في أركيد Pro.',
    descEn: 'Defeat all 3 Level Bosses in Pro Arcade.',
    icon: '👑',
    xpReward: 750,
    proOnly: true,
  },
  {
    id: 'bridge_legend',
    rarity: 'Legendary',
    titleAr: 'أسطورة الطلاقة C1',
    titleEn: 'C1 Fluency Legend',
    descAr: 'اوصل للمستوى 25+ في سلم الرتب الإدراكية.',
    descEn: 'Reach RPG Rank Level 25+ on the Fluency Ladder.',
    icon: '🏆',
    xpReward: 1000,
    proOnly: true,
  },
];

export const DEFAULT_GAMIFICATION_STORE: GamificationStore = {
  unlocked: {},
  bonusXp: 0,
  blitzBestScore: 0,
  blitzMaxCombo: 1,
  bossesDefeated: [],
  flawlessBossWins: 0,
  streakFreezeShields: 0,
  proTeaserUsed: false,
};

function getSafeStorage(storageOverride?: Storage | null): Storage | null {
  if (storageOverride !== undefined) return storageOverride;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadGamificationStore(storageOverride?: Storage | null): GamificationStore {
  const storage = getSafeStorage(storageOverride);
  if (!storage) return { ...DEFAULT_GAMIFICATION_STORE, unlocked: {}, bossesDefeated: [] };
  try {
    const raw = storage.getItem(GAMIFICATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GAMIFICATION_STORE, unlocked: {}, bossesDefeated: [] };
    const parsed = JSON.parse(raw) as Partial<GamificationStore>;
    return {
      unlocked: parsed && typeof parsed.unlocked === 'object' && parsed.unlocked ? { ...parsed.unlocked } : {},
      bonusXp: typeof parsed?.bonusXp === 'number' && Number.isFinite(parsed.bonusXp) ? Math.max(0, parsed.bonusXp) : 0,
      blitzBestScore: typeof parsed?.blitzBestScore === 'number' ? Math.max(0, parsed.blitzBestScore) : 0,
      blitzMaxCombo: typeof parsed?.blitzMaxCombo === 'number' ? Math.max(1, parsed.blitzMaxCombo) : 1,
      bossesDefeated: Array.isArray(parsed?.bossesDefeated)
        ? parsed.bossesDefeated.filter((x): x is string => typeof x === 'string')
        : [],
      flawlessBossWins: typeof parsed?.flawlessBossWins === 'number' ? Math.max(0, parsed.flawlessBossWins) : 0,
      streakFreezeShields: typeof parsed?.streakFreezeShields === 'number' ? Math.max(0, parsed.streakFreezeShields) : 0,
      proTeaserUsed: Boolean(parsed?.proTeaserUsed),
    };
  } catch {
    return { ...DEFAULT_GAMIFICATION_STORE, unlocked: {}, bossesDefeated: [] };
  }
}

export function saveGamificationStore(
  store: GamificationStore,
  storageOverride?: Storage | null
): void {
  const storage = getSafeStorage(storageOverride);
  if (storage) {
    try {
      storage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignore quota errors
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(GAMIFICATION_UPDATED_EVENT, { detail: store }));
    } catch {
      // Ignore
    }
  }
}

/**
 * Quadratic XP threshold curve from Level 1 (0 XP) to Level 50.
 */
export function xpThresholdForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(50, Math.floor(level)));
  if (clamped <= 1) return 0;
  const n = clamped - 1;
  return Math.round(35 * n * n + 85 * n);
}

interface RankBand {
  minLevel: number;
  titleAr: string;
  titleEn: string;
  tierColor: string;
}

const RANK_BANDS: readonly RankBand[] = [
  { minLevel: 50, titleAr: 'أسطورة الطلاقة C1', titleEn: 'C1 Fluency Legend', tierColor: 'text-amber-300' },
  { minLevel: 44, titleAr: 'سفير الإنجليزية', titleEn: 'English Ambassador', tierColor: 'text-amber-400' },
  { minLevel: 37, titleAr: 'قائد الجسر B2', titleEn: 'B2 Bridge Commander', tierColor: 'text-purple-300' },
  { minLevel: 30, titleAr: 'حكيم القواعد', titleEn: 'Syntax Sage', tierColor: 'text-purple-400' },
  { minLevel: 23, titleAr: 'فارس المحادثة', titleEn: 'Fluency Knight', tierColor: 'text-cyan-300' },
  { minLevel: 17, titleAr: 'قناص الأخطاء', titleEn: 'L1 Trap Sniper', tierColor: 'text-teal-300' },
  { minLevel: 11, titleAr: 'بنّاء الجمل', titleEn: 'Structure Builder', tierColor: 'text-emerald-300' },
  { minLevel: 6, titleAr: 'مستكشف الكورنيش', titleEn: 'Corniche Explorer', tierColor: 'text-sky-300' },
  { minLevel: 1, titleAr: 'مبتدئ الجسر', titleEn: 'Bridge Initiate', tierColor: 'text-stone-200' },
];

export function getRpgRankProgress(totalXp: number): RpgRankInfo {
  const safeXp = Math.max(0, Math.floor(Number.isFinite(totalXp) ? totalXp : 0));
  let level = 1;
  for (let lvl = 2; lvl <= 50; lvl += 1) {
    if (safeXp >= xpThresholdForLevel(lvl)) {
      level = lvl;
    } else {
      break;
    }
  }

  const band = RANK_BANDS.find((b) => level >= b.minLevel) || RANK_BANDS[RANK_BANDS.length - 1];
  const currentLevelStartXp = xpThresholdForLevel(level);
  const nextLevelXp = level >= 50 ? currentLevelStartXp : xpThresholdForLevel(level + 1);
  const xpIntoLevel = safeXp - currentLevelStartXp;
  const xpRequiredForNext = Math.max(1, nextLevelXp - currentLevelStartXp);
  const progressPercent =
    level >= 50 ? 100 : Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpRequiredForNext) * 100)));

  return {
    level,
    titleAr: band.titleAr,
    titleEn: band.titleEn,
    tierColor: band.tierColor,
    totalXp: safeXp,
    currentLevelStartXp,
    nextLevelXp,
    xpIntoLevel,
    xpRequiredForNext,
    progressPercent,
  };
}

export function unlockAchievement(
  achievementId: string,
  options?: {
    isPro?: boolean;
    storage?: Storage | null;
    nowMs?: number;
  }
): { unlockedNow: boolean; achievement: SteamAchievement | null; store: GamificationStore } {
  const achievement = STEAM_ACHIEVEMENTS.find((a) => a.id === achievementId) || null;
  const store = loadGamificationStore(options?.storage);
  if (!achievement) {
    return { unlockedNow: false, achievement: null, store };
  }
  if (achievement.proOnly && !options?.isPro) {
    return { unlockedNow: false, achievement, store };
  }
  if (store.unlocked[achievement.id]) {
    return { unlockedNow: false, achievement, store };
  }

  const updated: GamificationStore = {
    ...store,
    unlocked: {
      ...store.unlocked,
      [achievement.id]: options?.nowMs ?? Date.now(),
    },
    bonusXp: store.bonusXp + achievement.xpReward,
  };
  saveGamificationStore(updated, options?.storage);

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(ACHIEVEMENT_UNLOCKED_EVENT, { detail: achievement }));
    } catch {
      // Ignore
    }
  }

  return { unlockedNow: true, achievement, store: updated };
}

export interface AchievementEvalContext {
  baseXp: number;
  streak: number;
  completedLessons: number;
  reviewedCardsCount: number;
  hasProfileName: boolean;
  isPro: boolean;
  localHour?: number;
}

export function evaluateAndUnlockAchievements(
  ctx: AchievementEvalContext,
  storageOverride?: Storage | null
): SteamAchievement[] {
  let store = loadGamificationStore(storageOverride);
  const newlyUnlocked: SteamAchievement[] = [];

  // Grant 3 Streak-Freeze Shields when Pro is active for the first time
  if (ctx.isPro && store.streakFreezeShields === 0 && !store.unlocked['shield_bearer']) {
    store = { ...store, streakFreezeShields: 3 };
    saveGamificationStore(store, storageOverride);
  }

  const totalXp = ctx.baseXp + store.bonusXp;
  const rank = getRpgRankProgress(totalXp);
  const hour = ctx.localHour ?? new Date().getHours();

  const candidates: Array<{ id: string; condition: boolean }> = [
    { id: 'name_forged', condition: ctx.hasProfileName },
    { id: 'first_bridge', condition: ctx.completedLessons >= 1 },
    { id: 'daily_spark', condition: ctx.streak >= 3 },
    { id: 'flashcard_initiate', condition: ctx.reviewedCardsCount >= 10 },
    { id: 'midnight_scholar', condition: hour >= 23 || hour < 4 },
    { id: 'week_warrior', condition: ctx.streak >= 7 },
    { id: 'shield_bearer', condition: ctx.isPro },
    { id: 'lesson_decathlon', condition: ctx.completedLessons >= 10 },
    { id: 'xp_titan', condition: totalXp >= 2500 },
    { id: 'alexandria_polyglot', condition: ctx.completedLessons >= 20 || store.blitzBestScore >= 1500 },
    { id: 'boss_slayer_supreme', condition: store.bossesDefeated.length >= 3 },
    { id: 'bridge_legend', condition: rank.level >= 25 },
  ];

  for (const c of candidates) {
    if (!c.condition) continue;
    const res = unlockAchievement(c.id, { isPro: ctx.isPro, storage: storageOverride });
    if (res.unlockedNow && res.achievement) {
      newlyUnlocked.push(res.achievement);
    }
  }

  return newlyUnlocked;
}

export function recordArcadeResult(
  payload: {
    mode: 'blitz' | 'boss';
    score?: number;
    maxCombo?: number;
    correctStreak?: number;
    bossId?: string;
    bossDefeated?: boolean;
    flawless?: boolean;
    xpEarned: number;
    markTeaserUsed?: boolean;
  },
  options?: {
    isPro?: boolean;
    storage?: Storage | null;
  }
): { store: GamificationStore; unlocked: SteamAchievement[] } {
  const current = loadGamificationStore(options?.storage);
  const nextBosses =
    payload.bossDefeated && payload.bossId && !current.bossesDefeated.includes(payload.bossId)
      ? [...current.bossesDefeated, payload.bossId]
      : current.bossesDefeated;

  const updated: GamificationStore = {
    ...current,
    bonusXp: current.bonusXp + Math.max(0, Math.round(payload.xpEarned)),
    blitzBestScore: Math.max(current.blitzBestScore, payload.score ?? 0),
    blitzMaxCombo: Math.max(current.blitzMaxCombo, payload.maxCombo ?? 1),
    bossesDefeated: nextBosses,
    flawlessBossWins: current.flawlessBossWins + (payload.bossDefeated && payload.flawless ? 1 : 0),
    proTeaserUsed: current.proTeaserUsed || Boolean(payload.markTeaserUsed),
  };

  saveGamificationStore(updated, options?.storage);

  const unlocked: SteamAchievement[] = [];
  const tryUnlock = (id: string, condition: boolean) => {
    if (!condition) return;
    const res = unlockAchievement(id, { isPro: options?.isPro, storage: options?.storage });
    if (res.unlockedNow && res.achievement) unlocked.push(res.achievement);
  };

  if (payload.mode === 'blitz') {
    tryUnlock('blitz_survivor', (payload.score ?? 0) >= 500);
    tryUnlock('combo_king', (payload.maxCombo ?? 1) >= 5);
    tryUnlock('copula_slayer', (payload.correctStreak ?? 0) >= 10);
    tryUnlock('alexandria_polyglot', (payload.score ?? 0) >= 1500);
  } else if (payload.mode === 'boss') {
    tryUnlock('boss_vanquisher', Boolean(payload.bossDefeated));
    tryUnlock('zero_hit_duel', Boolean(payload.bossDefeated && payload.flawless));
    tryUnlock('boss_slayer_supreme', nextBosses.length >= 3);
  }

  return { store: loadGamificationStore(options?.storage), unlocked };
}

export function buildTrophyShareText(params: {
  playerName: string;
  rank: RpgRankInfo;
  unlockedCount: number;
  totalCount: number;
  streak: number;
  blitzBestScore: number;
  isArabic: boolean;
}): string {
  const { playerName, rank, unlockedCount, totalCount, streak, blitzBestScore, isArabic } = params;
  if (isArabic) {
    return [
      `🏆 بطاقة إنجازات فكّر إنجليزي (Thinking Bridge)`,
      `👤 المتعلم: ${playerName}`,
      `🎖️ الرتبة: المستوى ${rank.level} — ${rank.titleAr}`,
      `⭐ نقاط الخبرة: ${rank.totalXp.toLocaleString()} XP`,
      `🏅 الإنجازات المفتوحة: ${unlockedCount} / ${totalCount}`,
      `🔥 السلسلة: ${streak} يوم | ⚡ أعلى نتيجة قناص الأخطاء: ${blitzBestScore}`,
      `🌉 فكّر بالإنجليزي، مش تترجم: https://tb-eg.vercel.app`,
    ].join('\n');
  }
  return [
    `🏆 Thinking Bridge Trophy Card`,
    `👤 Learner: ${playerName}`,
    `🎖️ Rank: Level ${rank.level} — ${rank.titleEn}`,
    `⭐ Total XP: ${rank.totalXp.toLocaleString()} XP`,
    `🏅 Achievements: ${unlockedCount} / ${totalCount}`,
    `🔥 Streak: ${streak}d | ⚡ L1 Blitz Best: ${blitzBestScore}`,
    `🌉 Think in English, don't translate: https://tb-eg.vercel.app`,
  ].join('\n');
}
