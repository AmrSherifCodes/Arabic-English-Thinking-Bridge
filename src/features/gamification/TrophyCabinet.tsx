import React, { useEffect, useState } from 'react';
import { Trophy, Lock, Share2, Copy, Check, Shield, Crown, Sparkles } from 'lucide-react';
import {
  AchievementRarity,
  GAMIFICATION_UPDATED_EVENT,
  STEAM_ACHIEVEMENTS,
  buildTrophyShareText,
  evaluateAndUnlockAchievements,
  getRpgRankProgress,
  loadGamificationStore,
  GamificationStore,
} from './achievements';
import { ProgressionState } from '../../progression/types';

interface TrophyCabinetProps {
  state: ProgressionState;
  playerName: string;
  isPro: boolean;
  isArabic?: boolean;
  onOpenActivateCode?: () => void;
  onToast?: (msg: string) => void;
}

const RARITY_CARD_STYLES: Record<
  AchievementRarity,
  { unlocked: string; pill: string; labelAr: string }
> = {
  Common: {
    unlocked: 'bg-stone-900/90 border-slate-500/40',
    pill: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
    labelAr: 'شائع',
  },
  Rare: {
    unlocked: 'bg-cyan-950/35 border-cyan-400/50',
    pill: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    labelAr: 'نادر',
  },
  Epic: {
    unlocked: 'bg-purple-950/35 border-purple-400/55',
    pill: 'bg-purple-500/20 text-purple-200 border-purple-400/45',
    labelAr: 'ملحمي',
  },
  Legendary: {
    unlocked: 'bg-amber-950/35 border-amber-400/70',
    pill: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
    labelAr: 'أسطوري',
  },
};

export function TrophyCabinet({
  state,
  playerName,
  isPro,
  isArabic = true,
  onOpenActivateCode,
  onToast,
}: TrophyCabinetProps) {
  const [store, setStore] = useState<GamificationStore>(() => loadGamificationStore());
  const [copiedCard, setCopiedCard] = useState(false);

  useEffect(() => {
    const reviewedCardsCount = Object.values(state.srsItems || {}).reduce(
      (sum, item) => sum + (item.reviews || 0),
      0
    );
    evaluateAndUnlockAchievements({
      baseXp: state.xp || 0,
      streak: state.streak || 0,
      completedLessons: state.completedLessonIds?.length || 0,
      reviewedCardsCount,
      hasProfileName: Boolean(playerName && playerName.trim().length > 0),
      isPro,
    });
    setStore(loadGamificationStore());
  }, [state.xp, state.streak, state.completedLessonIds, state.srsItems, playerName, isPro]);

  useEffect(() => {
    const handleUpdate = () => setStore(loadGamificationStore());
    window.addEventListener(GAMIFICATION_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(GAMIFICATION_UPDATED_EVENT, handleUpdate);
  }, []);

  const totalXp = (state.xp || 0) + store.bonusXp;
  const rank = getRpgRankProgress(totalXp);
  const unlockedCount = STEAM_ACHIEVEMENTS.filter((a) => Boolean(store.unlocked[a.id])).length;

  const shareText = buildTrophyShareText({
    playerName: playerName || (isArabic ? 'بطل جسر التفكير' : 'Thinking Bridge Learner'),
    rank,
    unlockedCount,
    totalCount: STEAM_ACHIEVEMENTS.length,
    streak: state.streak || 0,
    blitzBestScore: store.blitzBestScore,
    isArabic,
  });

  const handleCopyTrophyCard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedCard(true);
      onToast?.(isArabic ? '✅ تم نسخ بطاقة الإنجازات!' : '✅ Trophy Card copied!');
      window.setTimeout(() => setCopiedCard(false), 2400);
    } catch {
      onToast?.(shareText);
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <section
      className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl text-start"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* RPG Rank Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1C33] via-stone-950 to-stone-900 border border-amber-500/35 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center font-black text-amber-300 text-base">
              L{rank.level}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                {isArabic ? 'سلم الرتب (Level 1 → 50)' : 'RPG Rank Progression (Lv 1 → 50)'}
              </span>
              <h4 className={`text-base font-black ${rank.tierColor}`}>
                {isArabic ? rank.titleAr : rank.titleEn}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-200 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              {rank.totalXp.toLocaleString()} XP
            </span>
            {isPro && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-cyan-500/15 text-cyan-200 border border-cyan-500/35">
                <Shield className="w-3.5 h-3.5" />
                {isArabic
                  ? `${store.streakFreezeShields} درع`
                  : `${store.streakFreezeShields} Shields`}
              </span>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
            <span>
              {isArabic ? `المستوى ${rank.level}` : `Level ${rank.level}`}
            </span>
            <span className="font-mono text-amber-300">
              {rank.level >= 50
                ? isArabic
                  ? 'الحد الأقصى 🏆'
                  : 'MAX RANK 🏆'
                : `${rank.xpIntoLevel} / ${rank.xpRequiredForNext} XP (${rank.progressPercent}%)`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-stone-950 border border-stone-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${rank.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trophy Cabinet Title & Share Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-black text-white">
              {isArabic
                ? `خزانة الجوائز (${unlockedCount} / ${STEAM_ACHIEVEMENTS.length})`
                : `Steam-Style Trophy Cabinet (${unlockedCount} / ${STEAM_ACHIEVEMENTS.length})`}
            </h4>
            <p className="text-[11px] text-stone-400">
              {isPro
                ? isArabic
                  ? 'كل الإنجازات النادرة والملحمية والأسطورية مفتوحة لك!'
                  : 'Full Trophy Cabinet unlocked with Rare, Epic & Legendary badges.'
                : isArabic
                ? 'أول 4 إنجازات مجانية للجميع — باقة Pro تفتح الخزانة الكاملة ودروع السلسلة.'
                : 'First 4 starter achievements are free — Pro unlocks all 18 badges & streak shields.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مشاركة واتساب' : 'WhatsApp Card'}</span>
          </a>
          <button
            type="button"
            onClick={handleCopyTrophyCard}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCard ? (isArabic ? 'تم النسخ' : 'Copied') : isArabic ? 'نسخ البطاقة' : 'Copy Card'}</span>
          </button>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STEAM_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = Boolean(store.unlocked[ach.id]);
          const isProLocked = ach.proOnly && !isPro && !isUnlocked;
          const style = RARITY_CARD_STYLES[ach.rarity];

          return (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex items-start gap-3 transition ${
                isUnlocked
                  ? style.unlocked
                  : 'bg-stone-950/70 border-stone-800/80 opacity-65'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                  isUnlocked
                    ? 'bg-stone-900 border-white/15'
                    : 'bg-stone-950 border-stone-800 grayscale opacity-60'
                }`}
              >
                {isProLocked ? <Lock className="w-4 h-4 text-amber-400" /> : ach.icon}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-black text-white truncate">
                    {isArabic ? ach.titleAr : ach.titleEn}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border shrink-0 ${style.pill}`}>
                    {isArabic ? style.labelAr : ach.rarity}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  {isArabic ? ach.descAr : ach.descEn}
                </p>
                <div className="flex items-center justify-between pt-0.5 text-[10px] font-bold">
                  <span className="text-emerald-300">+{ach.xpReward} XP</span>
                  {isUnlocked ? (
                    <span className="text-teal-300">{isArabic ? '✅ مفتوح' : '✅ Unlocked'}</span>
                  ) : isProLocked ? (
                    <span className="text-amber-300 inline-flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro
                    </span>
                  ) : (
                    <span className="text-stone-500">{isArabic ? '🔒 مغلق' : '🔒 Locked'}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Upsell Banner for Free Users */}
      {!isPro && onOpenActivateCode && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-950 to-teal-500/15 border border-amber-500/35 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs font-bold text-amber-100">
            {isArabic
              ? 'افتح الـ 14 إنجاز النادر والأسطوري + 3 دروع حماية للسلسلة بداية من 50 ج.م/شهر.'
              : 'Unlock all 14 Rare/Epic/Legendary badges + 3 Streak-Freeze Shields starting at 50 EGP/mo.'}
          </p>
          <button
            type="button"
            onClick={onOpenActivateCode}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black cursor-pointer transition shrink-0"
          >
            {isArabic ? 'افتح خزانة Pro 👑' : 'Unlock Pro Cabinet 👑'}
          </button>
        </div>
      )}
    </section>
  );
}
