import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ProgressionState } from '../../progression/types';
import { getDueSrsQueue } from '../../progression/srs';
import { MessageSquare, Layers, Briefcase, Zap, HelpCircle, Sparkles } from 'lucide-react';
import { buildCourseStructure } from '../../progression/courseData';
import { FeatureUnlockDefinition } from '../../progression/featureUnlocks';
import { FeatureUnlockModal } from './FeatureUnlockModal';
import { TargetLanguage } from '../../types';
import { useUiMode } from '../../utils/uiMode';

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
  onNavigateToCoursePath,
  targetLang = 'en',
  isArabic = true,
}: PracticeHubViewProps) {
  const dueItems = getDueSrsQueue(state.srsItems, state.dailyCardsCap);
  const isNative = Capacitor.isNativePlatform();

  const [selectedLockedFeature, setSelectedLockedFeature] = useState<FeatureUnlockDefinition | null>(null);
  const [uiMode, setUiMode] = useUiMode();

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
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition border border-amber-500/40 cursor-pointer"
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
              <span className="text-xl">←</span>
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
              <span className="text-xl">←</span>
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
            <span className="text-xl">←</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setUiMode('pro')}
            className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer p-2"
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

        {/* Mode 3: Corporate Bridge Translator */}
        <button
          onClick={() => handleFeatureClick('corporate', onOpenCorporate)}
          className="btn-shiny p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-blue-500/40 hover:border-blue-400 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
              <Briefcase size={14} />
              <span>{isArabic ? 'ميزة خاصة · Corporate' : 'Executive Phrasing'}</span>
            </div>
            <h3 className="font-black text-sm text-white">
              {isArabic ? 'من البلدي إلى Corporate' : 'Egyptian to Corporate English'}
            </h3>
            <p className="text-xs text-stone-400">
              {isArabic ? 'تحويل الأفكار العامية إلى صياغة احترافية' : 'Transform raw thoughts into workplace English'}
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

        {/* Mode 5: Local Pronunciation Recorder */}
        {onOpenPronunciation && (
          <button
            onClick={() => handleFeatureClick('pronunciation', onOpenPronunciation)}
            className="p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between bg-stone-900 border border-purple-500/40 hover:border-purple-400 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <Zap size={14} />
                <span>{isArabic ? 'بدون إنترنت · Offline' : 'Local Only'}</span>
              </div>
              <h3 className="font-black text-sm text-white">
                {isArabic ? 'مُسجّل النطق المحلّي' : 'Local Pronunciation Recorder'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? 'سجّل صوتك واستمع إليه محلياً بدون إرساله لأي خادم' : 'Record and check your voice on-device'}
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
