import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, User, Sparkles, Volume2, ShieldCheck, Zap, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { setLearnerMode, LearnerMode } from '../utils/learnerMode';
import { soundFX } from '../utils/soundFX';
import { triggerHapticImpact } from '../utils/fx';
import { speakUnified } from '../utils/offlineTts';

interface AgeGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
  onSelectMode?: (mode: LearnerMode) => void;
}

export function AgeGateModal({
  isOpen,
  onClose,
  isArabic = true,
  onSelectMode,
}: AgeGateModalProps) {
  if (!isOpen) return null;

  const handleSelect = (mode: LearnerMode) => {
    soundFX.playChipSelect();
    triggerHapticImpact();
    setLearnerMode(mode);
    if (mode === 'kids') {
      try {
        localStorage.setItem('tb.ageTrack', 'kg_primary');
        localStorage.setItem('tb.ageBand', '4-11');
      } catch {}
    } else {
      try {
        localStorage.setItem('tb.ageTrack', 'street_starter');
        localStorage.setItem('tb.ageBand', '18-30');
      } catch {}
    }
    onSelectMode?.(mode);
    onClose();
  };

  const playSampleAudio = (e: React.MouseEvent, type: 'kids' | 'regular') => {
    e.stopPropagation();
    soundFX.playChipSelect();
    const text = type === 'kids'
      ? (isArabic ? 'أهلاً بك في عالم الأطفال السريع والممتع!' : 'Welcome to the fun kids learning adventure!')
      : (isArabic ? 'أهلاً بك في فكّر إنجليزي! التفكير المباشر بدون ترجمة.' : 'Welcome to Thinking Bridge! Think directly in English.');
    void speakUnified({
      text,
      lang: isArabic ? 'ar-EG' : 'en-US',
      rate: type === 'kids' ? 0.9 : 1.0,
    });
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl overflow-y-auto"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-2xl bg-[#091526] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-6 text-start"
        >
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-teal-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black shadow-sm">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <span>{isArabic ? 'اختر وضع التعلم المناسب لك' : 'Choose Your Learner Mode'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isArabic ? 'مرحباً بك في "فكّر إنجليزي" ⚓' : 'Welcome to Thinking Bridge ⚓'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-bold leading-relaxed">
              {isArabic
                ? 'تطبيق تعليمي تفاعلي 100% بدون إنترنت. اختر تجربة التعلم المناسبة لسنّك لبدء الرحلة فوراً!'
                : '100% Offline-first learning bridge. Select your learner age mode to customize your experience!'}
            </p>
          </div>

          {/* Selector Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* 1. Kids Mode Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelect('kids')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect('kids'); }}
              className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-[#0C1B30] border-2 border-pink-500/50 hover:border-pink-400 text-white transition-all duration-200 cursor-pointer shadow-lg hover:shadow-pink-500/20 active:scale-98 min-h-[260px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40">
                    {isArabic ? 'الأعمار ٤ – ١٢ سنة' : 'Ages 4–12'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => playSampleAudio(e, 'kids')}
                    className="p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 border border-pink-500/40 transition active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                    title={isArabic ? 'اسمع عيّنة صوتية' : 'Listen to audio sample'}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    🎈
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white group-hover:text-pink-300 transition">
                      {isArabic ? 'نسخة الأطفال (Ages 4–12)' : 'Kids Mode (Ages 4–12)'}
                    </h3>
                    <span className="text-[11px] text-pink-300/80 font-bold block">
                      {isArabic ? 'ألوان ممتعة وتكبير الخط 1.2x 🎨' : 'Playful colors & 1.2x font scale 🎨'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  {isArabic
                    ? 'تجربة مخصصة للأطفال: نطق صوتي تلقائي، مصنع الأسماء، الحيوانات، الألوان، وبدون أي قواعد جافة أو معقدة!'
                    : 'Tailored for young learners: auto-play audio, Name Forge, animals, colors, and zero academic grammar jargon!'}
                </p>

                <ul className="space-y-1.5 pt-1 text-[11px] text-pink-200 font-extrabold">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-pink-400 shrink-0" />
                    <span>{isArabic ? 'أزرار لمس كبيرة وحماية من التشتت' : 'Oversized touch targets (min 44px)'}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-pink-400 shrink-0" />
                    <span>{isArabic ? 'إخفاء التبويبات والمصطلحات المعقدة' : 'Simplified child-friendly tabs'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-2 border-t border-pink-500/20 flex items-center justify-between text-xs font-black text-pink-300">
                <span>{isArabic ? 'اختر وضع الأطفال 🎈' : 'Select Kids Mode 🎈'}</span>
                {isArabic ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </div>
            </div>

            {/* 2. Regular Mode Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelect('regular')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect('regular'); }}
              className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-teal-950/30 to-[#0C1B30] border-2 border-cyan-500/50 hover:border-cyan-400 text-white transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-98 min-h-[260px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {isArabic ? 'الأعمار ١٣ سنة فما فوق' : 'Ages 13+ & Adults'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => playSampleAudio(e, 'regular')}
                    className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 transition active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                    title={isArabic ? 'اسمع عيّنة صوتية' : 'Listen to audio sample'}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    👤
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white group-hover:text-cyan-300 transition">
                      {isArabic ? 'النسخة العادية (Ages 13+)' : 'Regular Mode (Ages 13+)'}
                    </h3>
                    <span className="text-[11px] text-cyan-300/80 font-bold block">
                      {isArabic ? 'زر التبديل السريع: بسيط | متقدم ⚡' : '1-Tap Simple | Pro toggle ⚡'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  {isArabic
                    ? 'التجربة الكاملة لجسر التفكير: مسارات CEFR الشاملة، المدرب الذكي، وضع الشارع، واختيار العرض البسيط أو المتقدم.'
                    : 'Full Thinking Bridge experience: CEFR progression, Smart Trainer, Street Mode, and 1-tap Simple/Pro UI toggle.'}
                </p>

                <ul className="space-y-1.5 pt-1 text-[11px] text-cyan-200 font-extrabold">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>{isArabic ? 'جميع المستويات والتخطي والاختبارات' : 'Full CEFR levels & placement tests'}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <span>{isArabic ? 'أدوات الشارع والمحادثة الصوتية' : 'Street Mode & Smart Audio Trainer'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs font-black text-cyan-300">
                <span>{isArabic ? 'اختر النسخة العادية 👤' : 'Select Regular Mode 👤'}</span>
                {isArabic ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </div>
            </div>
          </div>

          {/* Footer note & Privacy pledge */}
          <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400 font-bold">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>
              {isArabic
                ? 'يمكنك التبديل بين وضع الأطفال والوضع العادي في أي وقت من أعلى الشاشة أو الإعدادات.'
                : 'You can toggle between Kids Mode and Regular Mode anytime from header or settings.'}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
