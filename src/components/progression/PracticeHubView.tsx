import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ProgressionState } from '../../progression/types';
import { getDueSrsQueue } from '../../progression/srs';
import { MessageSquare, Layers, Briefcase, Zap, HelpCircle, LockKeyhole, Sparkles } from 'lucide-react';
import { buildCourseStructure } from '../../progression/courseData';
import { FEATURE_UNLOCKS, FeatureUnlockDefinition, isFeatureUnlocked } from '../../progression/featureUnlocks';
import { FeatureUnlockModal } from './FeatureUnlockModal';
import { TargetLanguage } from '../../types';

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
  onNavigateToCoursePath,
  targetLang = 'en',
  isArabic = true,
}: PracticeHubViewProps) {
  const dueItems = getDueSrsQueue(state.srsItems, state.dailyCardsCap);
  const isNative = Capacitor.isNativePlatform();

  const [selectedLockedFeature, setSelectedLockedFeature] = useState<FeatureUnlockDefinition | null>(null);

  const courseStructure = buildCourseStructure(targetLang);
  const currentStageIndex = courseStructure.findIndex((s) => s.stage === state.currentStage);
  const currentLevelNumber = (currentStageIndex >= 0 ? currentStageIndex : 0) + 1;
  const currentStageNode = courseStructure[currentStageIndex >= 0 ? currentStageIndex : 0];

  const handleFeatureClick = (featureId: string, openCallback?: () => void) => {
    if (!openCallback) return;
    const unlocked = isFeatureUnlocked(featureId, state, targetLang);
    if (unlocked) {
      openCallback();
    } else {
      const featDef = FEATURE_UNLOCKS.find((f) => f.id === featureId);
      if (featDef) setSelectedLockedFeature(featDef);
    }
  };

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
        {(() => {
          const unlocked = isFeatureUnlocked('story', state, targetLang);
          return (
            <button
              type="button"
              onClick={() => handleFeatureClick('story', onOpenStory)}
              className={`flex-1 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-md relative ${
                unlocked
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 active:scale-95'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-500 hover:border-amber-500/30'
              }`}
            >
              {!unlocked && (
                <div className="absolute top-2.5 end-2.5 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <LockKeyhole size={12} />
                </div>
              )}
              <span className={`text-3xl filter drop-shadow-md ${!unlocked ? 'grayscale opacity-60' : ''}`}>📖</span>
              <div className="text-center">
                <span className={`font-bold text-sm block ${unlocked ? 'text-amber-200' : 'text-stone-400'}`}>
                  {isArabic ? 'القصة التفاعلية' : 'Story Engine'}
                </span>
                <span className="text-[10px] text-amber-400/80 font-semibold block mt-0.5">
                  {unlocked ? (isArabic ? 'مفتوح' : 'Unlocked') : (isArabic ? 'ينفتح مـ 5' : 'Lvl 5')}
                </span>
              </div>
            </button>
          );
        })()}

        {/* Hacker Terminal */}
        {(() => {
          const unlocked = isFeatureUnlocked('hacker_terminal', state, targetLang);
          return (
            <button
              type="button"
              onClick={() => handleFeatureClick('hacker_terminal', onOpenHackerTerminal)}
              className={`flex-1 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-md relative ${
                unlocked
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 active:scale-95'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-500 hover:border-green-500/30'
              }`}
            >
              {!unlocked && (
                <div className="absolute top-2.5 end-2.5 w-6 h-6 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center">
                  <LockKeyhole size={12} />
                </div>
              )}
              <span className={`text-3xl filter drop-shadow-md ${!unlocked ? 'grayscale opacity-60' : ''}`}>💻</span>
              <div className="text-center">
                <span className={`font-bold text-sm block ${unlocked ? 'text-green-300' : 'text-stone-400'}`}>
                  {isArabic ? 'الطرفية (Pyodide)' : 'Hacker Terminal'}
                </span>
                <span className="text-[10px] text-green-400/80 font-semibold block mt-0.5">
                  {unlocked ? (isArabic ? 'مفتوح' : 'Unlocked') : (isArabic ? 'ينفتح مـ 8' : 'Lvl 8')}
                </span>
              </div>
            </button>
          );
        })()}
      </div>

      {/* Classroom Mode / Teacher Mode */}
      {(() => {
        const unlocked = isFeatureUnlocked('teacher_mode', state, targetLang);
        return (
          <button
            onClick={() => handleFeatureClick('teacher_mode', onOpenTeacherMode)}
            className={`w-full mt-4 p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between relative ${
              unlocked
                ? 'bg-stone-900 border border-indigo-500/40 hover:border-indigo-400'
                : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-indigo-500/30'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                <span>🏫</span>
                <span>{unlocked ? (isArabic ? 'وضع المعلّم · Offline-Ready' : 'Classroom Mode') : (isArabic ? '🔒 ينفتح في المستوى 6 (B1)' : '🔒 Requires Level 6')}</span>
              </div>
              <h3 className={`font-black text-sm ${unlocked ? 'text-white' : 'text-stone-300'}`}>
                {isArabic ? 'وضع الفصل الدراسي' : 'Classroom Mode'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? 'QR للطلاب + عرض تكبير للبروجيكتور' : 'Student QR + Projector Mode'}
              </p>
            </div>
            {unlocked ? (
              <span className="text-3xl">🏫</span>
            ) : (
              <LockKeyhole className="text-stone-500 shrink-0" size={24} />
            )}
          </button>
        );
      })()}

      {/* Gamified CEFR Exam: اختبار يا باشا */}
      {onOpenExam && (
        <button
          onClick={onOpenExam}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-stone-900 border border-amber-500/50 hover:border-amber-400 transition text-start shadow-xl flex items-center justify-between group"
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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
        {/* Mode 1: AI Voice Conversation Practice */}
        {(() => {
          const unlocked = isFeatureUnlocked('ai_voice', state, targetLang);
          return (
            <button
              onClick={() => handleFeatureClick('ai_voice', onOpenVoice)}
              className={`p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between ${
                unlocked
                  ? 'bg-stone-900 border border-teal-500/40 hover:border-teal-400'
                  : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-teal-500/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
                  {unlocked ? <Zap size={14} /> : <LockKeyhole size={14} />}
                  <span>{unlocked ? (isArabic ? 'صوت مباشر · AI Voice' : 'Live Voice · AI Coach') : (isArabic ? '🔒 ينفتح في المستوى 3 (A1)' : '🔒 Requires Level 3')}</span>
                </div>
                <h3 className={`font-black text-sm ${unlocked ? 'text-white' : 'text-stone-300'}`}>
                  {isArabic ? 'تدريب المحادثة مع عمرو شريف' : 'Conversation Practice with Amr'}
                </h3>
                <p className="text-xs text-stone-400">
                  {isArabic ? 'تحدث بصوتك واحصل على تصحيحات فورية بلباقة' : 'Speak naturally with live voice feedback'}
                </p>
              </div>
              <MessageSquare className={`${unlocked ? 'text-teal-400' : 'text-stone-600'} shrink-0`} size={28} />
            </button>
          );
        })()}

        {/* Mode 2: Daily Spaced Repetition SRS Review */}
        {(() => {
          const unlocked = isFeatureUnlocked('srs_flashcards', state, targetLang);
          return (
            <button
              onClick={() => handleFeatureClick('srs_flashcards', onOpenFlashcards)}
              className={`p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between ${
                unlocked
                  ? 'bg-stone-900 border border-amber-500/40 hover:border-amber-400'
                  : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-amber-500/30'
              }`}
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
          );
        })()}

        {/* Mode 3: Corporate Bridge Translator */}
        {(() => {
          const unlocked = isFeatureUnlocked('corporate', state, targetLang);
          return (
            <button
              onClick={() => handleFeatureClick('corporate', onOpenCorporate)}
              className={`btn-shiny p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between ${
                unlocked
                  ? 'bg-stone-900 border border-blue-500/40 hover:border-blue-400'
                  : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-blue-500/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                  {unlocked ? <Briefcase size={14} /> : <LockKeyhole size={14} />}
                  <span>{unlocked ? (isArabic ? 'ميزة خاصة · Corporate' : 'Executive Phrasing') : (isArabic ? '🔒 ينفتح في المستوى 4 (A1+)' : '🔒 Requires Level 4')}</span>
                </div>
                <h3 className={`font-black text-sm ${unlocked ? 'text-white' : 'text-stone-300'}`}>
                  {isArabic ? 'من البلدي إلى Corporate' : 'Egyptian to Corporate English'}
                </h3>
                <p className="text-xs text-stone-400">
                  {isArabic ? 'تحويل الأفكار العامية إلى صياغة احترافية' : 'Transform raw thoughts into workplace English'}
                </p>
              </div>
              <Briefcase className={`${unlocked ? 'text-blue-400' : 'text-stone-600'} shrink-0`} size={28} />
            </button>
          );
        })()}

        {/* Mode 4: Socratic CQE AI Coach / Guided Practice */}
        {onOpenClarifying && (() => {
          const unlocked = isFeatureUnlocked('guided_questions', state, targetLang);
          return (
            <button
              onClick={() => handleFeatureClick('guided_questions', onOpenClarifying)}
              className={`p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between ${
                unlocked
                  ? 'bg-stone-900 border border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-emerald-500/30'
              }`}
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
          );
        })()}

        {/* Mode 5: Local Pronunciation Recorder */}
        {onOpenPronunciation && (() => {
          const unlocked = isFeatureUnlocked('pronunciation', state, targetLang);
          return (
            <button
              onClick={() => handleFeatureClick('pronunciation', onOpenPronunciation)}
              className={`p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between ${
                unlocked
                  ? 'bg-stone-900 border border-purple-500/40 hover:border-purple-400'
                  : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-purple-500/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                  {unlocked ? <Zap size={14} /> : <LockKeyhole size={14} />}
                  <span>{unlocked ? (isArabic ? 'بدون إنترنت · Offline' : 'Local Only') : (isArabic ? '🔒 ينفتح في المستوى 2 (A0)' : '🔒 Requires Level 2')}</span>
                </div>
                <h3 className={`font-black text-sm ${unlocked ? 'text-white' : 'text-stone-300'}`}>
                  {isArabic ? 'مُسجّل النطق المحلّي' : 'Local Pronunciation Recorder'}
                </h3>
                <p className="text-xs text-stone-400">
                  {isArabic ? 'سجّل صوتك واستمع إليه محلياً بدون إرساله لأي خادم' : 'Record and check your voice on-device'}
                </p>
              </div>
              {unlocked ? (
                <span className="text-2xl">🎙️</span>
              ) : (
                <LockKeyhole className="text-stone-600 shrink-0" size={24} />
              )}
            </button>
          );
        })()}

        {/* Mode 6: Low-End Phone Maintenance Guide */}
        {onOpenMaintenance && (() => {
          const unlocked = isFeatureUnlocked('maintenance', state, targetLang);
          return (
            <button
              onClick={() => handleFeatureClick('maintenance', onOpenMaintenance)}
              className={`p-4 rounded-3xl transition text-start shadow-md flex items-center justify-between ${
                unlocked
                  ? 'bg-stone-900 border border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-stone-900/60 border border-stone-800 opacity-80 hover:border-emerald-500/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  {unlocked ? <Zap size={14} /> : <LockKeyhole size={14} />}
                  <span>{unlocked ? (isArabic ? 'تحسين الأداء · Optimization' : 'Phone Maintenance') : (isArabic ? '🔒 ينفتح في المستوى 7 (B1+)' : '🔒 Requires Level 7')}</span>
                </div>
                <h3 className={`font-black text-sm ${unlocked ? 'text-white' : 'text-stone-300'}`}>
                  {isArabic ? 'دليل صيانة وتسريع الهاتف' : 'Low-End Device Maintenance'}
                </h3>
                <p className="text-xs text-stone-400">
                  {isArabic ? '7 خطوات تفاعلية لإطالة عمر هاتفك وتسريعه' : '7 interactive steps to optimize low-end phones'}
                </p>
              </div>
              {unlocked ? (
                <span className="text-2xl">🛠️</span>
              ) : (
                <LockKeyhole className="text-stone-600 shrink-0" size={24} />
              )}
            </button>
          );
        })()}
      </div>

      {/* Feature Unlock Modal */}
      {selectedLockedFeature && (
        <FeatureUnlockModal
          feature={selectedLockedFeature}
          currentLevelNumber={currentLevelNumber}
          currentStageTitleAr={currentStageNode?.titleAr || state.currentStage}
          currentStageTitleEn={currentStageNode?.titleEn || state.currentStage}
          isArabic={isArabic}
          onClose={() => setSelectedLockedFeature(null)}
          onContinueCourse={() => {
            setSelectedLockedFeature(null);
            if (onNavigateToCoursePath) onNavigateToCoursePath();
          }}
        />
      )}
    </div>
  );
}
