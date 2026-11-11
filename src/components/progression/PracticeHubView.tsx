import React from 'react';
import { Capacitor } from '@capacitor/core';
import { ProgressionState } from '../../progression/types';
import { getDueSrsQueue } from '../../progression/srs';
import { MessageSquare, Layers, Briefcase, Zap, HelpCircle } from 'lucide-react';

interface PracticeHubViewProps {
  state: ProgressionState;
  onOpenVoice: () => void;
  onOpenFlashcards: () => void;
  onOpenCorporate: () => void;
  onOpenClarifying?: () => void;
  onOpenMaintenance?: () => void;
  onOpenPronunciation?: () => void;
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
  isArabic = true,
}: PracticeHubViewProps) {
  const dueItems = getDueSrsQueue(state.srsItems, state.dailyCardsCap);
  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="text-start space-y-1">
        <h2 className="text-xl font-black text-white">
          {isArabic ? 'مركز التدريب التفاعلي 🎯' : 'Interactive Practice Hub 🎯'}
        </h2>
        <p className="text-xs text-stone-400">
          {isArabic ? 'اختر النمط المناسب لتثبيت التفكير والطلاقة' : 'Select a practice mode to build instant reflexes'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
        {/* Mode 1: AI Voice Conversation Practice */}
        <button
          onClick={onOpenVoice}
          className="p-4 rounded-3xl bg-stone-900 border border-teal-500/40 hover:border-teal-400 transition text-start shadow-md flex items-center justify-between"
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
          onClick={onOpenFlashcards}
          className="p-4 rounded-3xl bg-stone-900 border border-amber-500/40 hover:border-amber-400 transition text-start shadow-md flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Layers size={14} />
              <span>
                {isArabic
                  ? `${dueItems.length} بطاقة مستحقة اليوم (حد أقصى ${state.dailyCardsCap})`
                  : `${dueItems.length} cards due today (cap ${state.dailyCardsCap})`}
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
          onClick={onOpenCorporate}
          className="btn-shiny p-4 rounded-3xl bg-stone-900 border border-blue-500/40 hover:border-blue-400 transition text-start shadow-md flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
              <Briefcase size={14} />
              <span>{isArabic ? 'ميزة خاصة · Corporate Translator' : 'Niche Tool · Executive Phrasing'}</span>
            </div>
            <h3 className="font-black text-sm text-white">
              {isArabic ? 'من البلدي إلى Corporate' : 'Egyptian to Corporate English'}
            </h3>
            <p className="text-xs text-stone-400">
              {isArabic ? 'تحويل الأفكار العامية إلى صياغة احترافية' : 'Transform raw thoughts into polished workplace English'}
            </p>
          </div>
          <Briefcase className="text-blue-400 shrink-0" size={28} />
        </button>

        {/* Mode 4: Socratic CQE AI Coach */}
        {onOpenClarifying && (
          <button
            onClick={onOpenClarifying}
            className="p-4 rounded-3xl bg-stone-900 border border-emerald-500/40 hover:border-emerald-400 transition text-start shadow-md flex items-center justify-between"
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

        {/* Mode 4: Local Pronunciation Recorder */}
        {onOpenPronunciation && (
          <button
            onClick={onOpenPronunciation}
            className="p-4 rounded-3xl bg-stone-900 border border-purple-500/40 hover:border-purple-400 transition text-start shadow-md flex items-center justify-between"
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
          </button>
        )}

        {/* Mode 5: Low-End Phone Maintenance Guide */}
        {onOpenMaintenance && (
          <button
            onClick={onOpenMaintenance}
            className="p-4 rounded-3xl bg-stone-900 border border-emerald-500/40 hover:border-emerald-400 transition text-start shadow-md flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Zap size={14} />
                <span>{isArabic ? 'تحسين الأداء · Hardware Optimization' : 'Phone Maintenance'}</span>
              </div>
              <h3 className="font-black text-sm text-white">
                {isArabic ? 'دليل صيانة وتسريع الهاتف' : 'Low-End Device Maintenance'}
              </h3>
              <p className="text-xs text-stone-400">
                {isArabic ? '7 خطوات تفاعلية لإطالة عمر هاتفك وتسريعه' : '7 interactive steps to optimize low-end phones'}
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
