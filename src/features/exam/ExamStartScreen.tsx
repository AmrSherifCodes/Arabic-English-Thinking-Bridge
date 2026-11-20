/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React, { useState, useEffect } from 'react';
import { TargetLang, STORAGE_KEYS } from './types';
import { englishQuestions } from './data/englishQuestions';
import { germanQuestions } from './data/germanQuestions';
import { hebrewQuestions } from './data/hebrewQuestions';
import { pickDailyQuestion } from './engine/gamification';
import { Sparkles, Calendar, Heart, ArrowLeft } from 'lucide-react';

interface ExamStartScreenProps {
  onStartSession: (lang: TargetLang, isPlacement: boolean) => void;
  supporterMode: boolean;
  onToggleSupporterMode: (val: boolean) => void;
  onBack?: () => void;
}

export const ExamStartScreen: React.FC<ExamStartScreenProps> = ({
  onStartSession,
  supporterMode,
  onToggleSupporterMode,
  onBack,
}) => {
  const [selectedLang, setSelectedLang] = useState<TargetLang>('en');
  const [isPlacement, setIsPlacement] = useState<boolean>(true);
  const [hasCompletedDaily, setHasCompletedDaily] = useState<boolean>(false);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const doneDate = localStorage.getItem(STORAGE_KEYS.DAILY_DONE);
      if (doneDate === today) {
        setHasCompletedDaily(true);
      }
    } catch {
      setHasCompletedDaily(false);
    }
  }, []);

  const currentPool =
    selectedLang === 'de'
      ? germanQuestions
      : selectedLang === 'he'
      ? hebrewQuestions
      : englishQuestions;

  const dailyQuestion = pickDailyQuestion(currentPool, selectedLang);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 p-4 font-arabic text-right text-stone-100">
      {/* Header Title & Subtitle */}
      <div className="text-center flex flex-col items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="العودة للمسار · Back to path"
            className="self-start text-xs font-bold text-stone-300 hover:text-white bg-stone-900 px-4 py-2 rounded-full border border-stone-800 mb-2 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للمسار · Back to path</span>
          </button>
        )}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>اختبار يا باشا · Ya Basha CEFR Check</span>
        </div>
        <h1 className="text-3xl font-black text-amber-400">يا باشا، جاهز نعرف مستواك؟</h1>
        <p className="text-sm text-stone-300 max-w-md leading-relaxed">
          مش امتحان وزارة. ٢٠ سؤال، كوباية شاي، ونتيجة على طول.
          <br />
          <span className="text-xs text-stone-400 font-sans" dir="ltr">20 سؤال • 100% بدون إنترنت</span>
        </p>
      </div>

      {/* Step 1: Language Selector (English / Deutsch / عبري) */}
      <div className="w-full bg-stone-900/95 border border-stone-800 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
        <label className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
          <span>١. اختار اللغة</span>
          <span className="text-xs text-stone-400 font-normal">· Choose Target Language</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setSelectedLang('en')}
            aria-label="English Language"
            className={`min-h-[60px] py-3 px-2 rounded-2xl font-bold text-base transition-all flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 ${
              selectedLang === 'en'
                ? 'bg-amber-500 text-stone-950 shadow-lg font-sans ring-2 ring-amber-300'
                : 'bg-stone-800 hover:bg-stone-750 text-stone-200 font-sans border border-stone-700'
            }`}
          >
            <span className="font-sans">EN</span>
            <span className="text-[10px] opacity-90 font-bold">الإنجليزية</span>
          </button>

          <button
            onClick={() => setSelectedLang('de')}
            aria-label="Deutsch Language"
            className={`min-h-[60px] py-3 px-2 rounded-2xl font-bold text-base transition-all flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 ${
              selectedLang === 'de'
                ? 'bg-amber-500 text-stone-950 shadow-lg font-sans ring-2 ring-amber-300'
                : 'bg-stone-800 hover:bg-stone-750 text-stone-200 font-sans border border-stone-700'
            }`}
          >
            <span className="font-sans">DE</span>
            <span className="text-[10px] opacity-90 font-bold">الألمانية</span>
          </button>

          <button
            onClick={() => setSelectedLang('he')}
            aria-label="Hebrew Language"
            className={`min-h-[60px] py-3 px-2 rounded-2xl font-bold text-base transition-all flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 ${
              selectedLang === 'he'
                ? 'bg-amber-500 text-stone-950 shadow-lg ring-2 ring-amber-300'
                : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700'
            }`}
          >
            <span className="font-sans">HE</span>
            <span className="text-[10px] opacity-90 font-bold">العبرية</span>
          </button>
        </div>
      </div>

      {/* Step 2: Mode Selector */}
      <div className="w-full bg-stone-900/95 border border-stone-800 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
        <label className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
          <span>٢. اختار نوع الاختبار</span>
          <span className="text-xs text-stone-400 font-normal">· Select Session Type</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsPlacement(true)}
            aria-label="اعرف مستواي · CEFR Placement Exam"
            className={`min-h-[70px] p-4 rounded-2xl border text-right transition-all flex flex-col justify-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-400 ${
              isPlacement
                ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold ring-2 ring-teal-400/50'
                : 'bg-stone-800/60 border-stone-750 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <span className="text-base font-bold text-teal-300">اعرف مستواي · CEFR Test</span>
            <span className="text-xs text-stone-300">امتحان تكيّفي لتقدير المستوى</span>
          </button>

          <button
            onClick={() => setIsPlacement(false)}
            aria-label="أتمرن بس · Practice Mode"
            className={`min-h-[70px] p-4 rounded-2xl border text-right transition-all flex flex-col justify-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-400 ${
              !isPlacement
                ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold ring-2 ring-teal-400/50'
                : 'bg-stone-800/60 border-stone-750 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <span className="text-base font-bold text-teal-300">أتمرن بس · Practice</span>
            <span className="text-xs text-stone-300">تمارين بدون تقييم مستوى</span>
          </button>
        </div>
      </div>

      {/* Daily Challenge Card (only if not completed today) */}
      {!hasCompletedDaily && dailyQuestion && (
        <div className="w-full bg-gradient-to-r from-amber-950/70 to-stone-900 border border-amber-500/40 rounded-3xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex flex-col text-right">
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> سؤال اليوم (+15 XP) · Daily Question
            </span>
            <span className="text-xs text-stone-200 mt-1">{dailyQuestion.promptArz}</span>
          </div>
          <button
            onClick={() => onStartSession(selectedLang, false)}
            aria-label="حِل سؤال النهاردة · Solve Daily Question"
            className="min-h-[44px] py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            حِل سؤال اليوم
          </button>
        </div>
      )}

      {/* Step 3: Main Start CTA Button (64px Height, WCAG AA Contrast) */}
      <button
        onClick={() => onStartSession(selectedLang, isPlacement)}
        aria-label="ابدأ الاختبار · Start Assessment"
        className="w-full min-h-[64px] py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-xl transition-all shadow-xl active:scale-[0.99] flex flex-col items-center justify-center border-2 border-amber-300 focus-visible:ring-4 focus-visible:ring-amber-300 cursor-pointer"
      >
        <span>ابدأ الاختبار 🚀</span>
        <span className="text-xs font-sans font-bold opacity-85">Start Assessment Now</span>
      </button>

      {/* Supporter Mode Toggle */}
      <div className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-stone-900/80 border border-stone-800">
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-amber-300" /> 💚 Supporter Mode — شكل أحلى بس
          </span>
          <span className="text-[11px] text-stone-300">
            (لو اشتركت في القناة، فعّله من هنا — إحنا بنثق فيك)
          </span>
        </div>
        <input
          type="checkbox"
          aria-label="Supporter Mode Toggle"
          checked={supporterMode}
          onChange={(e) => onToggleSupporterMode(e.target.checked)}
          className="w-6 h-6 accent-amber-500 cursor-pointer rounded"
        />
      </div>

      {/* Attribution & Open Source Footer */}
      <div className="text-center text-xs text-stone-400 mt-2 border-t border-stone-800/80 pt-4 w-full flex flex-col items-center gap-1">
        <p>مفيش حساب، مفيش تتبع، مفيش كلام كبير. بياناتك على جهازك.</p>
        <a
          href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline font-bold"
        >
          الكود مفتوح المصدر · Open Source Repository ↗
        </a>
        <p className="mt-1 font-sans text-[11px] text-stone-400">
          Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
        </p>
      </div>
    </div>
  );
};
