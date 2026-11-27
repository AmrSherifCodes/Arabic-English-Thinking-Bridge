// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useMemo, useState } from 'react';
import { ProgressionState } from '../../progression/types';
import {
  Trophy,
  EyeOff,
  Globe,
  RefreshCw,
  Share2,
  Sparkles,
  Lock,
  TrendingUp,
  Youtube,
  Crown,
  Flame,
  Zap,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { sanitizeDisplayText } from '../../utils/sanitize';
import {
  FLEX_TITLES,
  FLEX_STATS_EVENT,
  equipFlexTitle,
  getActiveFlexTitle,
  getUnlockedFlexTitles,
  loadFlexStats,
  shareFlexCard,
} from '../../features/gamification/flexTitles';
import { loadGamificationStore } from '../../features/gamification/achievements';
import { getDailySelfBattleSnapshot } from '../../utils/dailySelfBattle';
import { useWordBank } from '../../utils/wordBank';

interface LeagueViewProps {
  state: ProgressionState;
  onToggleOptOut: () => void;
  onUpdateAlias?: (alias: string) => void;
  isArabic?: boolean;
}

interface GlobalEntry {
  display_name: string;
  country: string;
  xp: number;
  streak: number;
}

interface ScoreboardRow {
  id: string;
  name: string;
  country: string;
  xp: number;
  streak: number;
  titleAr: string;
  titleEn: string;
  isUser: boolean;
}

const LEADERBOARD_CACHE_KEY = 'tb.leaderboardCache.v10_2';
const PLAYER_NAME_STORAGE_KEY = 'tb.scoreboardDisplayName.v10_2';
const CACHE_TTL_MS = 8 * 60 * 1000; // 8-minute client cache to stay inside Supabase free tier

function getRankTierBadge(rankNumber: number, isArabic: boolean) {
  if (rankNumber <= 10) {
    return {
      tier: 'top10' as const,
      label: isArabic ? '👑 النخبة - Top 10' : '👑 Elite - Top 10',
      rewardTitle: isArabic ? 'أسطورة الجسر 👑' : 'Bridge Legend 👑',
      frameColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.16)',
    };
  }
  if (rankNumber <= 50) {
    return {
      tier: 'top50' as const,
      label: isArabic ? '💎 المحترفين - Top 50' : '💎 Pros - Top 50',
      rewardTitle: isArabic ? 'قناص اللغات 🎯' : 'Language Sniper 🎯',
      frameColor: '#22D3EE',
      bgColor: 'rgba(34, 211, 238, 0.15)',
    };
  }
  return {
    tier: 'top100' as const,
    label: isArabic ? '🔥 المتحدين - Top 100' : '🔥 Challengers - Top 100',
    rewardTitle: isArabic ? 'سريع البديهة ⚡' : 'Quick Reflex ⚡',
    frameColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  };
}

const OFFLINE_FALLBACK_RIVALS: Array<Omit<ScoreboardRow, 'isUser'>> = [
  { id: 'rival-1', name: 'أحمد الإسكندراني', country: 'EG', xp: 1450, streak: 21, titleAr: 'أسطورة الجسر 👑', titleEn: 'Bridge Legend 👑' },
  { id: 'rival-2', name: 'مريم طارق', country: 'EG', xp: 1180, streak: 16, titleAr: 'أسطورة الجسر 👑', titleEn: 'Bridge Legend 👑' },
  { id: 'rival-3', name: 'يوسف الحربي', country: 'SA', xp: 940, streak: 14, titleAr: 'أسطورة الجسر 👑', titleEn: 'Bridge Legend 👑' },
  { id: 'rival-4', name: 'سارة العتيبي', country: 'JO', xp: 720, streak: 11, titleAr: 'قناص اللغات 🎯', titleEn: 'Language Sniper 🎯' },
  { id: 'rival-5', name: 'عمر المنصوري', country: 'AE', xp: 540, streak: 9, titleAr: 'قناص اللغات 🎯', titleEn: 'Language Sniper 🎯' },
  { id: 'rival-6', name: 'نور الهدى', country: 'MA', xp: 390, streak: 7, titleAr: 'قناص اللغات 🎯', titleEn: 'Language Sniper 🎯' },
  { id: 'rival-7', name: 'كريم شريف', country: 'EG', xp: 260, streak: 5, titleAr: 'سريع البديهة ⚡', titleEn: 'Quick Reflex ⚡' },
  { id: 'rival-8', name: 'ليلى حسن', country: 'LB', xp: 150, streak: 4, titleAr: 'سريع البديهة ⚡', titleEn: 'Quick Reflex ⚡' },
  { id: 'rival-9', name: 'طارق فؤاد', country: 'TN', xp: 90, streak: 3, titleAr: 'سريع البديهة ⚡', titleEn: 'Quick Reflex ⚡' },
  { id: 'rival-10', name: 'سلمى عادل', country: 'EG', xp: 40, streak: 2, titleAr: 'سريع البديهة ⚡', titleEn: 'Quick Reflex ⚡' },
];

export function LeagueView({ state, onToggleOptOut, onUpdateAlias, isArabic = true }: LeagueViewProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'self'>('global');
  const [globalEntries, setGlobalEntries] = useState<GlobalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [flexStats, setFlexStats] = useState(() => loadFlexStats());
  const [shareToast, setShareToast] = useState<string | null>(null);
  const { count: wordBankCount } = useWordBank();

  const [savedName, setSavedName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
      if (stored && stored.trim()) return sanitizeDisplayText(stored, 28);
    } catch {}
    return sanitizeDisplayText(state.anonymousAlias || '', 28);
  });
  const [nameDraft, setNameDraft] = useState<string>(savedName);
  const [nameSavedPulse, setNameSavedPulse] = useState(false);

  useEffect(() => {
    const refresh = () => setFlexStats(loadFlexStats());
    window.addEventListener(FLEX_STATS_EVENT, refresh);
    return () => window.removeEventListener(FLEX_STATS_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (state.leagueOptOut || state.isUnder13) return;
    let active = true;

    try {
      const cachedRaw = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as { fetchedAt: number; entries: GlobalEntry[] };
        if (Date.now() - cached.fetchedAt < CACHE_TTL_MS && Array.isArray(cached.entries)) {
          setGlobalEntries(cached.entries);
          return;
        }
      }
    } catch { }

    setLoading(true);
    fetch('/api/leaderboard', { cache: 'default' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data?.ok || !Array.isArray(data.entries)) return;
        setGlobalEntries(data.entries);
        try {
          localStorage.setItem(
            LEADERBOARD_CACHE_KEY,
            JSON.stringify({ fetchedAt: Date.now(), entries: data.entries })
          );
        } catch { }
      })
      .catch(() => { })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [state.leagueOptOut, state.isUnder13]);

  const userAlias = sanitizeDisplayText(savedName || state.anonymousAlias || (isArabic ? 'بطل الجسر' : 'Bridge Hero'), 28);
  const unlockedTitles = getUnlockedFlexTitles(state, flexStats);
  const activeTitle = getActiveFlexTitle(state, flexStats);
  const blitzBest = loadGamificationStore().blitzBestScore;
  const selfBattle = useMemo(() => getDailySelfBattleSnapshot(), [state.xp, wordBankCount]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeDisplayText(nameDraft, 28);
    if (!cleaned) return;
    setSavedName(cleaned);
    setNameDraft(cleaned);
    try {
      localStorage.setItem(PLAYER_NAME_STORAGE_KEY, cleaned);
    } catch {}
    onUpdateAlias?.(cleaned);
    setNameSavedPulse(true);
    window.setTimeout(() => setNameSavedPulse(false), 1800);
  };

  const rows: ScoreboardRow[] = useMemo(() => {
    const userRow: ScoreboardRow = {
      id: 'user-self',
      name: userAlias,
      country: 'EG',
      xp: state.xp || 0,
      streak: state.streak || 0,
      titleAr: activeTitle?.labelAr || 'سريع البديهة ⚡',
      titleEn: activeTitle?.labelEn || 'Quick Reflex ⚡',
      isUser: true,
    };

    if (globalEntries.length > 0) {
      const mapped = globalEntries.slice(0, 100).map((e, i) => ({
        id: `global-${i}`,
        name: sanitizeDisplayText(e.display_name, 28) || 'Learner',
        country: e.country || 'EG',
        xp: Number(e.xp) || 0,
        streak: Number(e.streak) || 0,
        titleAr: i < 10 ? 'أسطورة الجسر 👑' : i < 50 ? 'قناص اللغات 🎯' : 'سريع البديهة ⚡',
        titleEn: i < 10 ? 'Bridge Legend 👑' : i < 50 ? 'Language Sniper 🎯' : 'Quick Reflex ⚡',
        isUser: sanitizeDisplayText(e.display_name, 28).toLowerCase() === userAlias.toLowerCase(),
      }));
      if (!mapped.some((m) => m.isUser) && !state.leagueOptOut) {
        mapped.push(userRow);
      }
      return mapped.sort((a, b) => b.xp - a.xp).slice(0, 100);
    }

    const combined = [
      ...OFFLINE_FALLBACK_RIVALS.map((r) => ({ ...r, isUser: false })),
      ...(state.leagueOptOut ? [] : [userRow]),
    ];
    return combined.sort((a, b) => b.xp - a.xp);
  }, [globalEntries, userAlias, state.xp, state.streak, state.leagueOptOut, activeTitle]);

  const userRankIdx = rows.findIndex((r) => r.isUser);
  const userRankNumber = userRankIdx >= 0 ? userRankIdx + 1 : rows.length + 1;
  const userTier = getRankTierBadge(userRankNumber, isArabic);

  const nextTargetRank = userRankNumber > 50 ? 50 : userRankNumber > 10 ? 10 : userRankNumber > 3 ? 3 : 1;
  const targetRow = rows[Math.min(rows.length - 1, Math.max(0, nextTargetRank - 1))];
  const xpGapToNextTier = Math.max(0, (targetRow?.xp || 0) - (state.xp || 0) + (userRankNumber > 1 ? 5 : 0));

  const podium = rows.slice(0, 3);
  const maxBarXp = Math.max(20, ...selfBattle.last7Days.map((d) => d.xp));

  const handleShareFlex = async () => {
    const res = await shareFlexCard({
      alias: userAlias,
      xp: state.xp || 0,
      streak: state.streak || 0,
      blitzBest,
      titleLabel: activeTitle ? (isArabic ? activeTitle.labelAr : activeTitle.labelEn) : userTier.rewardTitle,
      isArabic,
    });
    if (res === 'copied') {
      setShareToast(isArabic ? '✅ تم نسخ بطاقتك — الصقها في واتساب!' : '✅ Flex card copied — paste in WhatsApp!');
    } else if (res === 'shared') {
      setShareToast(isArabic ? '✅ تمت مشاركة إنجازك!' : '✅ Score shared!');
    }
    window.setTimeout(() => setShareToast(null), 2600);
  };

  return (
    <div data-testid="scoreboard-arena" className="space-y-4 w-full pb-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Arena Header + 2-Tab Switcher */}
      <div
        className="p-4 rounded-3xl border space-y-3 shadow-xl"
        style={{ backgroundColor: '#131C31', borderColor: 'rgba(245, 158, 11, 0.45)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-start">
            <h2 className="text-base font-black text-[#F8FAFC] flex items-center gap-2">
              <Trophy size={18} className="text-[#F59E0B]" />
              <span>{isArabic ? 'لوحة الصدارة والتحدي 🏆' : 'Scoreboard & Self-Battle 🏆'}</span>
            </h2>
            <p className="text-[11px] text-[#CBD5E1]">
              {isArabic
                ? 'أفضل 10 / 50 / 100 متعلم بالاسم فقط + تحدي يومي أوفلاين'
                : 'Name-Only Top 10 / 50 / 100 + 100% Offline Daily Self-Battle'}
            </p>
          </div>
          <button
            type="button"
            data-testid="toggle-anonymous-btn"
            onClick={onToggleOptOut}
            aria-label={isArabic ? 'إخفاء / إظهار اسمي' : 'Anonymous / Hide Me'}
            className="min-h-[42px] px-3 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 cursor-pointer shrink-0"
            style={{
              backgroundColor: state.leagueOptOut ? 'rgba(245, 158, 11, 0.18)' : '#0B1120',
              borderColor: state.leagueOptOut ? '#F59E0B' : 'var(--border)',
              color: state.leagueOptOut ? '#FBBF24' : '#CBD5E1',
            }}
          >
            <EyeOff size={14} />
            <span>{state.leagueOptOut ? (isArabic ? 'مخفي' : 'Hidden') : (isArabic ? 'إخفاء' : 'Hide Me')}</span>
          </button>
        </div>

        {/* 2-Tab Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            data-testid="scoreboard-tab-global"
            onClick={() => setActiveTab('global')}
            className="min-h-[46px] px-3 py-2 rounded-2xl text-xs font-black border flex items-center justify-center gap-1.5 cursor-pointer transition"
            style={
              activeTab === 'global'
                ? { backgroundColor: '#F59E0B', color: '#0B1120', borderColor: '#F59E0B' }
                : { backgroundColor: '#0B1120', color: '#CBD5E1', borderColor: 'var(--border)' }
            }
          >
            <Globe size={15} />
            <span>{isArabic ? 'أفضل 100 متعلم 🏆' : 'Top 100 Global 🏆'}</span>
          </button>
          <button
            type="button"
            data-testid="scoreboard-tab-self"
            onClick={() => setActiveTab('self')}
            className="min-h-[46px] px-3 py-2 rounded-2xl text-xs font-black border flex items-center justify-center gap-1.5 cursor-pointer transition"
            style={
              activeTab === 'self'
                ? { backgroundColor: '#22D3EE', color: '#0B1120', borderColor: '#22D3EE' }
                : { backgroundColor: '#0B1120', color: '#CBD5E1', borderColor: 'var(--border)' }
            }
          >
            <TrendingUp size={15} />
            <span>{isArabic ? 'تحدي نفسك يومياً 📈' : 'Daily Self-Battle 📈'}</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: GLOBAL TOP 10 / 50 / 100 ================= */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          {/* Zero-Friction Name-Only Onboarding */}
          <form
            onSubmit={handleSaveName}
            className="p-3.5 rounded-2xl border space-y-2 text-start"
            style={{ backgroundColor: '#131C31', borderColor: 'var(--border)' }}
          >
            <label htmlFor="scoreboard-display-name" className="text-xs font-black text-[#F8FAFC] block">
              {isArabic
                ? 'اسمك على لوحة الصدارة (الاسم فقط — بدون إيميل أو هاتف)'
                : 'Your Scoreboard Name (Name only — zero email or phone)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="scoreboard-display-name"
                type="text"
                maxLength={28}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={isArabic ? 'اكتب اسمك المستعار...' : 'Enter display name...'}
                className="flex-1 min-w-0 min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
                style={{ backgroundColor: '#0B1120', borderColor: 'var(--border)' }}
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl font-black text-xs cursor-pointer tb-btn-3d tb-btn-emerald shrink-0 flex items-center gap-1"
              >
                {nameSavedPulse ? <Check size={14} /> : null}
                <span>{nameSavedPulse ? (isArabic ? 'تم!' : 'Saved!') : (isArabic ? 'حفظ' : 'Save')}</span>
              </button>
            </div>
          </form>

          {state.leagueOptOut || state.isUnder13 ? (
            <div
              className="p-5 rounded-3xl border text-center space-y-3"
              style={{ backgroundColor: '#131C31', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              <EyeOff className="mx-auto text-[#F59E0B]" size={28} />
              <h3 className="text-sm font-black text-[#F8FAFC]">
                {isArabic ? 'وضع الخصوصية مُفعّل (مخفي من اللوحة العالمية)' : 'Anonymous Mode Active (Hidden from Global Board)'}
              </h3>
              <p className="text-xs text-[#CBD5E1]">
                {isArabic
                  ? 'اسمك غير ظاهر للآخرين حالياً. يمكنك المتابعة في تبويب "تحدي نفسك يومياً" أو الظهور في أي وقت.'
                  : 'Your name is hidden. Use Daily Self-Battle offline or re-join anytime.'}
              </p>
              {!state.isUnder13 && (
                <button
                  type="button"
                  onClick={onToggleOptOut}
                  className="px-5 py-2.5 min-h-[46px] rounded-2xl font-black text-xs cursor-pointer tb-btn-3d tb-btn-emerald"
                >
                  {isArabic ? 'إظهار اسمي في أفضل 100' : 'Show Me on Top 100'}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Live "Next Rank" Motivator Bar + Active Tier Badge */}
              <div
                data-testid="next-rank-motivator"
                className="p-3.5 rounded-2xl border space-y-2 text-start"
                style={{ backgroundColor: userTier.bgColor, borderColor: userTier.frameColor }}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-[#F8FAFC]">
                    {userTier.label}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black border"
                    style={{
                      backgroundColor: '#0B1120',
                      borderColor: userTier.frameColor,
                      color: userTier.frameColor,
                    }}
                  >
                    {userTier.rewardTitle}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#F8FAFC]">
                  {userRankNumber === 1
                    ? isArabic
                      ? '👑 أنت في المركز #1 — أسطورة الجسر بلا منازع!'
                      : '👑 You are #1 — Undisputed Bridge Legend!'
                    : isArabic
                      ? `ترتيبك #${userRankNumber} · باقي ${xpGapToNextTier} XP وتدخل الـ Top ${nextTargetRank}! 🚀`
                      : `Your Rank #${userRankNumber} · ${xpGapToNextTier} XP away from Top ${nextTargetRank}! 🚀`}
                </p>
              </div>

              {/* Top 3 Podium Cards */}
              {podium.length >= 3 && (
                <div data-testid="scoreboard-podium" className="grid grid-cols-3 gap-2 items-end">
                  {[
                    { idx: 1, medal: '🥈', rank: '#2', border: '#94A3B8', bg: 'rgba(148, 163, 184, 0.14)', lift: '' },
                    { idx: 0, medal: '🥇', rank: '#1', border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)', lift: '-translate-y-1.5' },
                    { idx: 2, medal: '🥉', rank: '#3', border: '#D97706', bg: 'rgba(217, 119, 6, 0.14)', lift: '' },
                  ].map(({ idx, medal, rank, border, bg, lift }) => {
                    const player = podium[idx];
                    return (
                      <div
                        key={player.id}
                        className={`p-2.5 rounded-2xl border text-center space-y-1 ${lift}`}
                        style={{ backgroundColor: bg, borderColor: border }}
                      >
                        <div className="text-xl leading-none">{medal}</div>
                        <div className="text-[10px] font-black text-[#FBBF24]">{rank}</div>
                        <div className="text-xs font-black text-[#F8FAFC] truncate">{player.name}</div>
                        <div className="text-[9px] font-bold text-[#CBD5E1] truncate">
                          {isArabic ? player.titleAr : player.titleEn}
                        </div>
                        <div className="text-[11px] font-black text-[#22D3EE] tabular-nums">
                          {player.xp} XP
                        </div>
                        <div className="text-[10px] font-bold text-[#F59E0B]">🔥 {player.streak}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rank Tier Legend (Top 10 / Top 50 / Top 100 Cosmetic Rewards) */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-2 rounded-xl border border-[#F59E0B]/50 bg-[#F59E0B]/10">
                  <div className="text-[10px] font-black text-[#FBBF24]">👑 Top 10</div>
                  <div className="text-[9px] font-bold text-[#CBD5E1]">{isArabic ? 'أسطورة الجسر' : 'Bridge Legend'}</div>
                </div>
                <div className="p-2 rounded-xl border border-[#22D3EE]/50 bg-[#22D3EE]/10">
                  <div className="text-[10px] font-black text-[#22D3EE]">💎 Top 50</div>
                  <div className="text-[9px] font-bold text-[#CBD5E1]">{isArabic ? 'قناص اللغات' : 'Lang Sniper'}</div>
                </div>
                <div className="p-2 rounded-xl border border-[#10B981]/50 bg-[#10B981]/10">
                  <div className="text-[10px] font-black text-[#10B981]">🔥 Top 100</div>
                  <div className="text-[9px] font-bold text-[#CBD5E1]">{isArabic ? 'سريع البديهة' : 'Quick Reflex'}</div>
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#22D3EE]">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>{isArabic ? 'جاري تحديث المتصدرين...' : 'Refreshing leaderboard...'}</span>
                </div>
              )}

              {/* Ranked List */}
              <div className="space-y-1.5">
                {rows.map((member, idx) => {
                  const rankNum = idx + 1;
                  const tier = getRankTierBadge(rankNum, isArabic);
                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-2xl border flex items-center justify-between gap-2 transition"
                      style={{
                        backgroundColor: member.isUser ? 'rgba(16, 185, 129, 0.16)' : '#131C31',
                        borderColor: member.isUser ? '#10B981' : rankNum <= 10 ? 'rgba(245, 158, 11, 0.35)' : 'var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 border"
                          style={{
                            backgroundColor: '#0B1120',
                            borderColor: tier.frameColor,
                            color: tier.frameColor,
                          }}
                        >
                          #{rankNum}
                        </span>
                        <div className="min-w-0 text-start">
                          <div className="text-xs font-black text-[#F8FAFC] truncate">
                            {member.name} {member.isUser ? (isArabic ? '(أنت)' : '(You)') : ''} · {member.country}
                          </div>
                          <div className="text-[10px] font-bold text-[#CBD5E1] flex items-center gap-2">
                            <span>{isArabic ? member.titleAr : member.titleEn}</span>
                            <span>· 🔥 {member.streak}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#FBBF24] shrink-0 tabular-nums">
                        {member.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Unlockable Flex Titles & Share Card */}
          <div
            className="p-4 rounded-3xl border space-y-3 text-start shadow-xl"
            style={{ backgroundColor: '#131C31', borderColor: 'rgba(34, 211, 238, 0.35)' }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#22D3EE]" />
                <h3 className="text-xs font-black text-[#F8FAFC]">
                  {isArabic ? 'ألقابك القتالية القابلة للفتح' : 'Unlockable Flex Titles'}
                </h3>
              </div>
              {activeTitle && (
                <span
                  data-testid="active-flex-title"
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black border"
                  style={{
                    backgroundColor: 'rgba(34, 211, 238, 0.14)',
                    borderColor: activeTitle.accentColor,
                    color: activeTitle.accentColor,
                  }}
                >
                  {isArabic ? activeTitle.labelAr : activeTitle.labelEn}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {FLEX_TITLES.map((title) => {
                const isUnlocked = unlockedTitles.some((u) => u.id === title.id);
                const isEquipped = activeTitle?.id === title.id;
                return (
                  <button
                    key={title.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      setFlexStats(equipFlexTitle(title.id));
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 min-h-[68px] ${
                      isUnlocked ? 'cursor-pointer active:scale-95' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: isEquipped ? 'rgba(34, 211, 238, 0.14)' : '#0B1120',
                      borderColor: isEquipped ? title.accentColor : 'var(--border)',
                    }}
                  >
                    <span className="text-base leading-none">{isUnlocked ? title.icon : <Lock size={14} className="text-[#94A3B8]" />}</span>
                    <span className="text-[11px] font-black text-[#F8FAFC] leading-tight">
                      {isArabic ? title.labelAr.replace(/\s+[⚡🎯👑]$/u, '') : title.labelEn.replace(/\s+[⚡🎯👑]$/u, '')}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              data-testid="share-flex-card-btn"
              onClick={handleShareFlex}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl font-black text-xs inline-flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-gold"
            >
              <Share2 size={15} />
              <span>
                {isArabic
                  ? `شارك ترتيبك (#${userRankNumber} · ${state.streak || 0}🔥 · ${state.xp || 0} XP)`
                  : `Share My Rank (#${userRankNumber} · ${state.streak || 0}🔥 · ${state.xp || 0} XP)`}
              </span>
            </button>

            {shareToast && (
              <p className="text-center text-xs font-black text-[#10B981]">{shareToast}</p>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: LOCAL DAILY SELF-BATTLE (100% OFFLINE) ================= */}
      {activeTab === 'self' && (
        <div data-testid="daily-self-battle-panel" className="space-y-4">
          {/* Today vs Yesterday vs All-Time Best */}
          <div
            className="p-4 rounded-3xl border space-y-3 text-start shadow-xl"
            style={{ backgroundColor: '#131C31', borderColor: 'rgba(34, 211, 238, 0.45)' }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-black text-[#F8FAFC] flex items-center gap-1.5">
                <Flame size={16} className="text-[#F59E0B]" />
                <span>{isArabic ? 'تحدي اليوم ضد إمبارح (أوفلاين 100%)' : 'Today vs. Yesterday (100% Offline)'}</span>
              </h3>
              {selfBattle.deltaVsYesterdayPct !== null && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black"
                  style={{
                    backgroundColor: selfBattle.deltaVsYesterdayPct >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: selfBattle.deltaVsYesterdayPct >= 0 ? '#10B981' : '#FBBF24',
                  }}
                >
                  {selfBattle.deltaVsYesterdayPct >= 0
                    ? isArabic
                      ? `+${selfBattle.deltaVsYesterdayPct}% أفضل من إمبارح! 🔥`
                      : `+${selfBattle.deltaVsYesterdayPct}% better than yesterday! 🔥`
                    : isArabic
                      ? `${selfBattle.deltaVsYesterdayPct}% عن إمبارح — كمّل درس دلوقتي!`
                      : `${selfBattle.deltaVsYesterdayPct}% vs yesterday — beat it now!`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl border text-center" style={{ backgroundColor: '#0B1120', borderColor: '#22D3EE' }}>
                <div className="text-[10px] font-bold text-[#CBD5E1]">{isArabic ? 'اليوم' : 'Today'}</div>
                <div className="text-lg font-black text-[#22D3EE] tabular-nums">{selfBattle.todayXp}</div>
                <div className="text-[10px] font-bold text-[#94A3B8]">XP</div>
              </div>
              <div className="p-3 rounded-2xl border text-center" style={{ backgroundColor: '#0B1120', borderColor: 'var(--border)' }}>
                <div className="text-[10px] font-bold text-[#CBD5E1]">{isArabic ? 'إمبارح' : 'Yesterday'}</div>
                <div className="text-lg font-black text-[#F8FAFC] tabular-nums">{selfBattle.yesterdayXp}</div>
                <div className="text-[10px] font-bold text-[#94A3B8]">XP</div>
              </div>
              <div className="p-3 rounded-2xl border text-center" style={{ backgroundColor: '#0B1120', borderColor: '#F59E0B' }}>
                <div className="text-[10px] font-bold text-[#FBBF24] flex items-center justify-center gap-0.5">
                  <Crown size={11} />
                  <span>{isArabic ? 'رقمك القياسي' : 'All-Time Best'}</span>
                </div>
                <div className="text-lg font-black text-[#FBBF24] tabular-nums">{selfBattle.allTimeBestXp}</div>
                <div className="text-[10px] font-bold text-[#94A3B8]">XP</div>
              </div>
            </div>

            {/* Word Bank & Lightning Blitz Personal Best */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl border flex items-center gap-2.5" style={{ backgroundColor: '#0B1120', borderColor: 'var(--border)' }}>
                <BookmarkCheck size={20} className="text-[#10B981] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-[#CBD5E1]">{isArabic ? 'كلمات اليوم / بنكك' : 'Words Today / Bank'}</div>
                  <div className="text-sm font-black text-[#F8FAFC] tabular-nums">
                    +{selfBattle.wordsMasteredToday} · {wordBankCount}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-2xl border flex items-center gap-2.5" style={{ backgroundColor: '#0B1120', borderColor: 'var(--border)' }}>
                <Zap size={20} className="text-[#F59E0B] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-[#CBD5E1]">{isArabic ? 'قياسي الـ 60 ثانية' : '60s Blitz Best'}</div>
                  <div className="text-sm font-black text-[#FBBF24] tabular-nums">
                    {blitzBest} {isArabic ? 'نقطة' : 'pts'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Daily Bar Chart (100% localStorage) */}
          <div
            className="p-4 rounded-3xl border space-y-3 text-start shadow-xl"
            style={{ backgroundColor: '#131C31', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#F8FAFC]">
                {isArabic ? '📊 نشاط آخر 7 أيام (يعمل في وضع الطيران)' : '📊 7-Day Daily XP Chart (Works in Airplane Mode)'}
              </h3>
              <span className="text-[10px] font-bold text-[#10B981]">{isArabic ? 'محلي 100%' : 'Local 100%'}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 items-end h-32 pt-2">
              {selfBattle.last7Days.map((day) => {
                const pct = Math.max(8, Math.round((day.xp / maxBarXp) * 100));
                return (
                  <div key={day.dateKey} className="flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[9px] font-black text-[#CBD5E1] tabular-nums">{day.xp}</span>
                    <div className="w-full flex-1 flex items-end justify-center">
                      <div
                        className="w-full max-w-[26px] rounded-t-xl transition-all duration-300"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: day.isToday ? '#22D3EE' : day.xp > 0 ? '#10B981' : '#1B2742',
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-black ${day.isToday ? 'text-[#22D3EE]' : 'text-[#94A3B8]'}`}>
                      {isArabic ? day.labelAr : day.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tasteful @sciamrsherif YouTube Discovery Card */}
      <a
        href="https://youtube.com/@sciamrsherif"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="scoreboard-youtube-card"
        className="block p-4 rounded-3xl border transition hover:border-rose-400/70"
        style={{ backgroundColor: '#131C31', borderColor: 'rgba(244, 63, 94, 0.35)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 text-start">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <Youtube size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-[#F8FAFC]">
                {isArabic ? 'تعلّم أسرار اللغات على قناة عمرو الشريف ▶️' : 'Watch Language Tutorials on YouTube (@sciamrsherif) ▶️'}
              </div>
              <div className="text-[11px] font-bold text-[#CBD5E1]">
                {isArabic ? 'شروحات مجانية وتطبيقات عملية · youtube.com/@sciamrsherif' : 'Built by Amr Sherif · youtube.com/@sciamrsherif'}
              </div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-black shrink-0">
            @sciamrsherif
          </span>
        </div>
      </a>
    </div>
  );
}
