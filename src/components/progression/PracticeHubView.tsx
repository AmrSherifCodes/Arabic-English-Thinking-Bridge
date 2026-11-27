import React, { Suspense, lazy, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ProgressionState } from '../../progression/types';
import { getDueSrsQueue } from '../../progression/srs';
import { MessageSquare, Layers, Briefcase, Zap, HelpCircle, Sparkles, Swords, Crown } from 'lucide-react';
import { buildCourseStructure } from '../../progression/courseData';
import { FeatureUnlockDefinition } from '../../progression/featureUnlocks';
import { FeatureUnlockModal } from './FeatureUnlockModal';
import { TargetLanguage } from '../../types';
import { useUiMode } from '../../utils/uiMode';
import { useEntitlement } from '../../hooks/useEntitlement';

const LazyProArcadeView = lazy(() =>
  import('../../features/gamification/ProArcadeView').then((m) => ({ default: m.ProArcadeView }))
);

interface PracticeHubViewProps {
  state: ProgressionState;
  onOpenVoice: () => void;
  onOpenFlashcards: () => void;
  onOpenCorporate: () => void;
  onOpenClarifying?: () => void;
  onOpenMaintenance?: () => void;
  onOpenPronunciation?: () => void;
  onOpenStory?: () => void;
  onOpenHackerTerminal?: () => void;
  onOpenTeacherMode?: () => void;
  onOpenExam?: () => void;
  onOpenDictionary?: () => void;
  onOpenLightningBlitz?: () => void;
  onOpenTravelSprint?: () => void;
  onOpenLiveTranslator?: () => void;
  onOpenTravelScenarios?: () => void;
  travelReadinessPct?: number;
  onOpenActivateCode?: () => void;
  onXpEarned?: (xp: number) => void;
  onNavigateToCoursePath?: () => void;
  targetLang?: TargetLanguage;
  isArabic?: boolean;
}

export function PracticeHubView({
  state,
  onOpenVoice,
  onOpenFlashcards,
  onOpenCorporate,
  onOpenClarifying,
  onOpenMaintenance,
  onOpenPronunciation,
  onOpenStory,
  onOpenHackerTerminal,
  onOpenTeacherMode,
  onOpenExam,
  onOpenDictionary,
  onOpenLightningBlitz,
  onOpenTravelSprint,
  onOpenLiveTranslator,
  onOpenTravelScenarios,
  travelReadinessPct = 0,
  onOpenActivateCode,
  onXpEarned,
  onNavigateToCoursePath,
  targetLang = 'en',
  isArabic = true,
}: PracticeHubViewProps) {
  const dueItems = getDueSrsQueue(state.srsItems, state.dailyCardsCap);
  const isNative = Capacitor.isNativePlatform();
  const { isPro } = useEntitlement();

  const [selectedLockedFeature, setSelectedLockedFeature] = useState<FeatureUnlockDefinition | null>(null);
  const [proArcadeOpen, setProArcadeOpen] = useState(false);
  const [uiMode, setUiMode] = useUiMode();

  if (proArcadeOpen) {
    return (
      <Suspense
        fallback={
          <div className="min-h-[60dvh] flex items-center justify-center text-amber-300 font-bold text-sm">
            {isArabic ? 'جاري تحميل الأركيد التفاعلي...' : 'Loading Interactive Arcade...'}
          </div>
        }
      >
        <LazyProArcadeView
          isPro={isPro}
          isArabic={isArabic}
          onBack={() => setProArcadeOpen(false)}
          onOpenActivateCode={onOpenActivateCode}
          onXpEarned={onXpEarned}
        />
      </Suspense>
    );
  }

  if (uiMode === 'simple') {
    return (
      <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-[#0B1C33] to-[#0E2746] border-2 border-emerald-500/50 shadow-2xl text-start space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              🟢 الوضع البسيط — القاموس والتدريب
            </span>
            <button
              onClick={() => setUiMode('pro')}
              className="min-h-[48px] px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition border border-amber-500/40 cursor-pointer"
            >
              ⚡ الوضع المتقدم
            </button>
          </div>
          <h2 className="text-xl font-black text-white">أدوات التعلم الأساسية</h2>
          <p className="text-xs text-slate-300">أدوات سهلة ومباشرة لممارسة النطق والكلمات.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="p-5 rounded-3xl bg-[#0B1C33] border border-cyan-500/30 hover:border-cyan-400 transition text-start flex items-center justify-between cursor-pointer shadow-lg"
            >
              <div className="space-y-1">
                <span className="text-2xl">📖</span>
                <h3 className="font-black text-base text-white">القاموس الناطق</h3>
                <p className="text-xs text-slate-300">بحث سريع في الكلمات مع الصوت والمعنى.</p>
              </div>
              <span className="text-xl text-cyan-300 font-bold">←</span>
            </button>
          )}

          {onOpenPronunciation && (
            <button
              onClick={onOpenPronunciation}
              className="p-5 rounded-3xl bg-[#0B1C33] border border-cyan-500/30 hover:border-cyan-400 transition text-start flex items-center justify-between cursor-pointer shadow-lg"
            >
              <div className="space-y-1">
                <span className="text-2xl">🎙️</span>
                <h3 className="font-black text-base text-white">تمرين النطق البسيط</h3>
                <p className="text-xs text-slate-300">سجّل صوتك وقارن نطقك محلياً.</p>
              </div>
              <span className="text-xl text-cyan-300 font-bold">←</span>
            </button>
          )}

          <button
            onClick={onOpenFlashcards}
            className="p-5 rounded-3xl bg-[#0B1C33] border border-cyan-500/30 hover:border-cyan-400 transition text-start flex items-center justify-between cursor-pointer shadow-lg"
          >
            <div className="space-y-1">
              <span className="text-2xl">🃏</span>
              <h3 className="font-black text-base text-white">بطاقات المراجعة السريعة</h3>
              <p className="text-xs text-slate-300">راجع الكلمات وحافظ على الذاكرة.</p>
            </div>
            <span className="text-xl text-cyan-300 font-bold">←</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setUiMode('pro')}
            className="min-h-[48px] inline-flex items-center justify-center text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer p-2"
          >
            عرض كل أدوات الوضع المتقدم (المحادثة، Corporate، القصة...) ⚡
          </button>
        </div>
      </div>
    );
  }

  const courseStructure = buildCourseStructure(targetLang);
  const currentStageIndex = courseStructure.findIndex((s) => s.stage === state.currentStage);
  const currentLevelNumber = Math.min(10, Math.max(1, state?.overallLevel ?? ((currentStageIndex >= 0 ? currentStageIndex : 0) + 1)));
  const currentStageNode = courseStructure[currentStageIndex >= 0 ? currentStageIndex : 0];

  const handleFeatureClick = (_featureId: string, openCallback?: () => void) => {
    if (openCallback) openCallback();
  };

  const unlocked = true;

  return (
    <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="text-start space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>مركز التدريب التفاعلي 🎯</span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {isArabic ? `المستوى ${currentLevelNumber} من 10` : `Level ${currentLevelNumber} of 10`}
          </span>
        </div>
        <p className="text-xs text-stone-400">
          {isArabic
            ? 'تتفتح الأدوات التفاعلية تدرجياً مع تقدمك في مسار التفكير'
            : 'Interactive features unlock progressively as you advance through checkpoints'}
        </p>
      </div>

      {/* Prominent 1-Tap Face-to-Face Real-Time Local Translator & Stranger Roleplay (v10.3) */}
      {(onOpenLiveTranslator || onOpenTravelScenarios) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onOpenLiveTranslator && (
            <button
              type="button"
              data-testid="launch-live-translator-practice"
              onClick={onOpenLiveTranslator}
              className="w-full min-h-[76px] p-4 rounded-3xl border-2 transition text-start shadow-xl flex items-center justify-between gap-3 cursor-pointer tb-btn-3d active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(16, 185, 129, 0.16))',
                borderColor: '#F59E0B',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl shrink-0">🎙️</span>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-[#F8FAFC] leading-snug">
                    {isArabic ? 'مترجم السفر الفوري — بدون إنترنت' : 'Live Travel Translator — Offline'}
                  </h3>
                  <p className="text-[11px] text-[#CBD5E1] leading-snug">
                    {isArabic
                      ? 'اتكلم عربي ← يترجم وينطق فوراً للأجنبي مع قلب الشاشة 180°'
                      : 'Face-to-face on-device ML Kit translation + 180° flip'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1.5 rounded-xl bg-[#F59E0B] text-[#0B1120] font-black text-xs shrink-0">
                {isArabic ? 'ترجم' : 'LIVE'}
              </span>
            </button>
          )}

          {onOpenTravelScenarios && (
            <button
              type="button"
              data-testid="launch-travel-scenarios-practice"
              onClick={onOpenTravelScenarios}
              className="w-full min-h-[76px] p-4 rounded-3xl border-2 transition text-start shadow-xl flex items-center justify-between gap-3 cursor-pointer tb-btn-3d active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(16, 185, 129, 0.2))',
                borderColor: '#22D3EE',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl shrink-0">🎭</span>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-[#F8FAFC] leading-snug">
                    {isArabic ? 'محاكي التحدث مع أجنبي ✈️🎭' : 'Talk to a Stranger Abroad ✈️🎭'}
                  </h3>
                  <p className="text-[11px] text-[#CBD5E1] leading-snug">
                    {isArabic
                      ? '8 مواقف سفر حقيقية بالصوت والأزرار (مطار، تاكسي، فندق، مطعم...)'
                      : '8 branching voice + tap roleplays across EN, DE, ES, IT, FR & AR'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1.5 rounded-xl bg-[#22D3EE] text-[#0B1120] font-black text-xs shrink-0">
                {isArabic ? 'تدرّب' : 'PLAY'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Prominent 1-Tap 21-Day Travel Abroad Sprint */}
      {onOpenTravelSprint && (
        <button
          type="button"
          data-testid="launch-travel-sprint-practice"
          onClick={onOpenTravelSprint}
          className="w-full min-h-[68px] p-4 rounded-3xl border-2 transition text-start shadow-xl flex items-center justify-between gap-3 cursor-pointer tb-btn-3d active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 211, 238, 0.16))',
            borderColor: '#10B981',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">✈️</span>
            <div className="min-w-0">
              <h3 className="font-black text-base text-[#F8FAFC]">
                {isArabic ? 'تحدي السفر في 21 يوم ✈️' : '21-Day Travel Abroad Sprint ✈️'}
              </h3>
              <p className="text-xs text-[#CBD5E1]">
                {isArabic
                  ? `جاهزيتك للسفر: ${travelReadinessPct}% · 15 دقيقة يومياً (Anki + حوارات سفر)`
                  : `Travel Readiness: ${travelReadinessPct}% · 15 min/day (Anki + Native Roleplay)`}
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#10B981] text-[#0B1120] font-black text-xs shrink-0">
            {isArabic ? 'افتح' : 'OPEN'}
          </span>
        </button>
      )}

      {/* Prominent 1-Tap 60-Second Lightning Blitz (Standard/Pro only) */}
      {onOpenLightningBlitz && (
        <button
          type="button"
          data-testid="launch-lightning-blitz-practice"
          onClick={onOpenLightningBlitz}
          className="w-full min-h-[68px] p-4 rounded-3xl border-2 transition text-start shadow-xl flex items-center justify-between gap-3 cursor-pointer tb-btn-3d active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(245, 158, 11, 0.14))',
            borderColor: '#22D3EE',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">⚡</span>
            <div className="min-w-0">
              <h3 className="font-black text-base text-[#F8FAFC]">
                {isArabic ? 'تحدي الـ 60 ثانية ⚡ (Lightning Blitz)' : '60-Second Lightning Blitz ⚡'}
              </h3>
              <p className="text-xs text-[#CBD5E1]">
                {isArabic ? 'جولات سريعة بـ 4 أزرار · مضاعف كومبو x2 → x5 · مزامنة فورية للمتصدرين' : 'Rapid-fire 4-button pad · x2 → x5 combo · instant Leaderboard XP'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#22D3EE] text-[#0B1120] font-black text-xs shrink-0">
            {isArabic ? 'ابدأ!' : 'GO!'}
          </span>
        </button>
      )}

      {/* Talking Dictionary Quick Launch (Always visible at top) */}
      {onOpenDictionary && (
        <button
          type="button"
          onClick={onOpenDictionary}
          className="w-full min-h-[64px] p-4 rounded-3xl bg-[#131C31] border-2 border-[#22D3EE]/50 hover:border-[#22D3EE] transition text-start shadow-xl flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">📖</span>
            <div className="min-w-0">
              <h3 className="font-black text-base text-[#F8FAFC]">
                {isArabic ? 'القاموس الناطق (بدون إنترنت)' : 'Talking Dictionary (Offline)'}
              </h3>
              <p className="text-xs text-[#CBD5E1]">
                {isArabic ? 'ابحث عن أي كلمة واسمع نطقها عادي وبطيء فوراً.' : 'Search any word with instant normal & slow audio.'}
              </p>
            </div>
          </div>
          <span className="text-lg font-black text-[#22D3EE] shrink-0">{isArabic ? '←' : '→'}</span>
        </button>
      )}

      {/* Interactive Arcade: 60s L1 Trap Blitz & Level Boss Duel */}
      <button
        type="button"
        onClick={() => setProArcadeOpen(true)}
        className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#131C31] via-[#1B2742] to-[#0B1120] border-2 border-amber-500/60 hover:border-amber-400 transition text-start shadow-2xl flex items-center justify-between gap-3 group cursor-pointer"
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
              <Crown size={12} />
              <span>{isArabic ? 'مجاني 100%' : '100% Free'}</span>
            </span>
            <span className="text-[11px] font-bold text-cyan-300">
              {isArabic ? 'قناص الأخطاء (60ث) + معركة الزعيم' : '60s L1 Trap Blitz + Boss Duel'}
            </span>
          </div>
          <h3 className="font-black text-base text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
            <Swords size={16} className="text-amber-400 shrink-0" />
            <span>{isArabic ? 'الأركيد التفاعلي — تحدّي الأخطاء والزعماء' : 'Interactive Arcade — Blitz & Boss Duels'}</span>
          </h3>
          <p className="text-xs text-stone-300">
            {isArabic
              ? 'كومبو x2 → x5، دروع 🛡️، ضربات CRIT!، وجوائز Steam في خزانة ملفك.'
              : 'x2 → x5 combos, 3 shields 🛡️, fast CRIT! strikes, and Steam-style Boss Trophies.'}
          </p>
        </div>
        <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">🎮</span>
      </button>

      {/* Story Engine & Hacker Terminal Quick Launch */}
      <div className="flex gap-4">
        {/* Story Engine */}
        <button
          type="button"
          onClick={() => handleFeatureClick('story', onOpenStory)}
          className="flex-1 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-md relative bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 active:scale-95 cursor-pointer"
        >
          <span className="text-3xl filter drop-shadow-md">📖</span>
          <div className="text-center">
            <span className="font-bold text-sm block text-amber-200">
              {isArabic ? 'القصة التفاعلية' : 'Story Engine'}
            </span>
            <span className="text-[10px] text-amber-400/80 font-semibold block mt-0.5">
              {isArabic ? 'مفتوح 100%' : '100% Unlocked'}
            </span>
          </div>
        </button>

        {/* Hacker Terminal */}
        <button
          type="button"
          onClick={() => handleFeatureClick('hacker_terminal', onOpenHackerTerminal)}
          className="flex-1 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-md relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 active:scale-95 cursor-pointer"
        >
          <span className="text-3xl filter drop-shadow-md">💻</span>
          <div className="text-center">
            <span className="font-bold text-sm block text-green-300">
              {isArabic ? 'الطرفية (Pyodide)' : 'Hacker Terminal'}
            </span>
            <span className="text-[10px] text-green-400/80 font-semibold block mt-0.5">
              {isArabic ? 'مفتوح 100%' : '100% Unlocked'}
            </span>
          </div>
        </button>
      </div>

      {/* Classroom Mode / Teacher Mode */}
      <button
        onClick={() => handleFeatureClick('teacher_mode', onOpenTeacherMode)}
        className="w-full mt-4 p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between relative bg-stone-900 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
            <span>🏫</span>
            <span>{isArabic ? 'وضع المعلّم · Offline-Ready' : 'Classroom Mode'}</span>
          </div>
          <h3 className="font-black text-sm text-white">
            {isArabic ? 'وضع الفصل الدراسي' : 'Classroom Mode'}
          </h3>
          <p className="text-xs text-stone-400">
            {isArabic ? 'QR للطلاب + عرض تكبير للبروجيكتور' : 'Student QR + Projector Mode'}
          </p>
        </div>
        <span className="text-3xl">🏫</span>
      </button>

      {/* Gamified CEFR Exam: اختبار يا باشا */}
      {onOpenExam && (
        <button
          onClick={onOpenExam}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-stone-900 border border-amber-500/50 hover:border-amber-400 transition text-start shadow-xl flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Sparkles size={14} />
              <span>{isArabic ? 'اختبار تكيّفي · CEFR Assessment' : 'Adaptive CEFR Check'}</span>
            </div>
            <h3 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
              {isArabic ? 'اختبار يا باشا — اعرف مستواك' : 'Ya Basha Check — CEFR Exam'}
            </h3>
            <p className="text-xs text-stone-300">
              {isArabic ? '٢٠ سؤال، خط مترو الإسكندرية، ونتيجة فورية وبدون حسابات' : '20 adaptive questions, Alexandria metro progress, 100% local'}
            </p>
          </div>
          <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">☕</span>
        </button>
      )}

      {/* Smart Dictionary Card */}
      {onOpenDictionary && (
        <button
          onClick={onOpenDictionary}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-teal-950/70 via-stone-900 to-stone-900 border border-teal-500/50 hover:border-teal-400 transition text-start shadow-xl flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
              <span>📖</span>
              <span>{isArabic ? 'القاموس الذكي التفاعلي · Smart Dictionary' : 'Interactive Smart Dictionary'}</span>
            </div>
            <h3 className="font-black text-sm text-white group-hover:text-teal-300 transition-colors">
              {isArabic ? 'ابحث عن أي كلمة بالصوت والمعنى' : 'Search any word with instant audio'}
            </h3>
            <p className="text-xs text-stone-300">
              {isArabic ? 'قاموس ثنائي ومترجم فوري يعمل 100% بدون إنترنت' : 'Bilingual offline-first dictionary'}
            </p>
          </div>
          <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">📚</span>
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
        {/* Mode 1: AI Voice Conversation Practice */}
        <button
          onClick={() => handleFeatureClick('ai_voice', onOpenVoice)}
          className="p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-teal-500/40 hover:border-teal-400 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
              <Zap size={14} />
              <span>{isArabic ? 'صوت مباشر · AI Voice' : 'Live Voice · AI Coach'}</span>
            </div>
            <h3 className="font-black text-sm text-white">
              {isArabic ? 'تدريب المحادثة مع عمرو شريف' : 'Conversation Practice with Amr'}
            </h3>
            <p className="text-xs text-stone-400">
              {isArabic ? 'تحدث بصوتك واحصل على تصحيحات فورية بلباقة' : 'Speak naturally with live voice feedback'}
            </p>
          </div>
          <MessageSquare className="text-teal-400 shrink-0" size={28} />
        </button>

        {/* Mode 2: Daily Spaced Repetition SRS Review */}
        <button
          onClick={() => handleFeatureClick('srs_flashcards', onOpenFlashcards)}
          className="p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-amber-500/40 hover:border-amber-400 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Layers size={14} />
              <span>
                {isArabic
                  ? `${dueItems.length} بطاقة مستحقة اليوم`
                  : `${dueItems.length} cards due today`}
              </span>
            </div>
            <h3 className="font-black text-sm text-white">
              {isArabic ? 'المراجعة الذكية اليومية (SM-2 SRS)' : 'Daily SRS Flashcard Review'}
            </h3>
            <p className="text-xs text-stone-400">
              {isArabic ? 'مراجعة الملاحظات والكلمات قبل نسيانها' : 'Review items right before memory decay'}
            </p>
          </div>
          <Layers className="text-amber-400 shrink-0" size={28} />
        </button>

        {/* Mode 3: Corporate Bridge & Egyptian Pro Track */}
        <button
          onClick={() => handleFeatureClick('corporate', onOpenCorporate)}
          className="btn-shiny p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-blue-500/40 hover:border-blue-400 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
              <Briefcase size={14} />
              <span>{isArabic ? 'Corporate · إنترفيو وكول سنتر' : 'Interview & Call-Center Track'}</span>
            </div>
            <h3 className="font-black text-sm text-white">
              {isArabic ? 'من البلدي لـ Corporate + مسار الثقة' : 'Corporate, Interview & Call-Center'}
            </h3>
            <p className="text-xs text-stone-400">
              {isArabic ? 'صياغة احترافية + سيناريوهات إنترفيو وكول سنتر مع تنبيهات L1' : 'Workplace phrasing + Egyptian interview & call-center coaching'}
            </p>
          </div>
          <Briefcase className="text-blue-400 shrink-0" size={28} />
        </button>

        {/* Mode 4: Socratic CQE AI Coach / Guided Practice */}
        {onOpenClarifying && (
          <button
            onClick={() => handleFeatureClick('guided_questions', onOpenClarifying)}
            className="p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <HelpCircle size={14} />
                <span>
                  {isNative
                    ? (isArabic ? 'ذكاء اصطناعي محلي · Local AI' : 'Socratic Coach')
                    : (isArabic ? 'أسئلة جاهزة · Guided Practice' : 'Guided Questions')}
                </span>
              </div>
              <h3 className="font-black text-sm text-white">
                {isNative
                  ? (isArabic ? 'اسألني أسئلة (المدرب الذكي)' : 'Socratic AI Coach')
                  : (isArabic ? 'أسئلة تدريبية' : 'Guided Clarifying Questions')}
              </h3>
              <p className="text-xs text-stone-400">
                {isNative
                  ? (isArabic ? 'مدرب سقراطي محلي لتشخيص نقاط القوة والضعف' : 'Local AI coach to diagnose your level')
                  : (isArabic ? 'أسئلة تفاعلية لتنشيط فكرك وتحسين أسلوبك' : 'Interactive Socratic questions for reflection')}
              </p>
            </div>
            <HelpCircle className="text-emerald-400 shrink-0" size={28} />
          </button>
        )}

        {/* Mode 5: Pro Voice Shadowing Studio & Local Recorder */}
        {onOpenPronunciation && (
          <button
            onClick={() => handleFeatureClick('pronunciation', onOpenPronunciation)}
            className="p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-purple-500/40 hover:border-purple-400 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <Zap size={14} />
                <span>{isArabic ? 'محلّي 100% · A/B Shadowing' : 'Local Only · A/B Shadowing'}</span>
              </div>
              <h3 className="font-black text-sm text-white">
                {isArabic ? 'استوديو النطق و Shadowing' : 'Voice Shadowing Studio'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? 'سجّل صوتك وقارنه بالصوت الأصلي (1.0x / 0.75x) بدون رفع أي ملفات' : 'Record & A/B compare against 1.0x / 0.75x native audio locally'}
              </p>
            </div>
            <span className="text-2xl">🎙️</span>
          </button>
        )}

        {/* Mode 6: Low-End Phone Maintenance Guide */}
        {onOpenMaintenance && (
          <button
            onClick={() => handleFeatureClick('maintenance', onOpenMaintenance)}
            className="p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Zap size={14} />
                <span>{isArabic ? 'تحسين الأداء · Optimization' : 'Phone Maintenance'}</span>
              </div>
              <h3 className="font-black text-sm text-white">
                {isArabic ? 'دليل صيانة وتسريع الهاتف' : 'Low-End Device Maintenance'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? '7 خطوات تفاعلية لإطالة عمر هاتفك وتسريعه' : '7 interactive steps to optimize low-end phones'}
              </p>
            </div>
            <span className="text-2xl">🛠️</span>
          </button>
        )}
      </div>
    </div>
  );
}
