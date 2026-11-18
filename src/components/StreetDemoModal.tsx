import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { triggerHapticImpact, triggerHapticNotification, confetti } from '../utils/fx';

interface StreetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchFullApp: () => void;
  isArabic?: boolean;
}

const STREET_EXAMPLES = [
  {
    arabicThought: 'أنا متفق معاك 100%',
    literalMistake: '❌ I am agree with you',
    structuralBridge: 'I agree with you',
    explanationAr: 'في الإنجليزي: agree فعل مش صفة، فمش بنحتاج (am). الجسر: الفاعل + الفعل فوراً.',
    explanationEn: 'In English: "agree" is a verb, not an adjective. No copula "am" needed.',
  },
  {
    arabicThought: 'أنا عطشان وبدور على مية',
    literalMistake: '❌ I thirsty and search water',
    structuralBridge: 'I am thirsty and looking for water',
    explanationAr: 'في الإنجليزي: الصفة (thirsty) محتاجة (am)، والبحث عن شيء بياخد (look for).',
    explanationEn: 'Adjectives need copula "am", and searching requires "look for".',
  },
  {
    arabicThought: 'هو بيشتغل مهندس في الشركة',
    literalMistake: '❌ He work engineer in company',
    structuralBridge: 'He works as an engineer at the company',
    explanationAr: 'المهنة بتاخد (an)، والفعل مع He بياخد (s)، ومكان الشغل بياخد (at).',
    explanationEn: 'Professions take "a/an", 3rd person gets "s", and workplaces take "at".',
  },
];

export function StreetDemoModal({
  isOpen,
  onClose,
  onLaunchFullApp,
  isArabic = true,
}: StreetDemoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!isOpen) return null;

  const current = STREET_EXAMPLES[currentIndex];

  const handleNext = () => {
    triggerHapticImpact();
    setRevealed(false);
    if (currentIndex === STREET_EXAMPLES.length - 1) {
      confetti();
      triggerHapticNotification();
    }
    setCurrentIndex((prev) => (prev + 1) % STREET_EXAMPLES.length);
  };

  const handleSpeak = (text: string) => {
    triggerHapticImpact();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isArabic ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0F172A] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-white flex flex-col space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-sm flex items-center gap-1.5">
                <Zap size={18} />
                <span>{isArabic ? 'وضع عرض الشارع 🚶‍♂️⚡' : 'Street Presentation Mode 🚶‍♂️⚡'}</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Card Body */}
          <div className="space-y-4">
            {/* 1. Thought Prompt */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
                {isArabic ? '🗣️ الفكرة بالعربي (عايز تقول إيه؟):' : '🗣️ Arabic Thought Prompt:'}
              </span>
              <p className="text-xl font-black text-amber-300">
                "{current.arabicThought}"
              </p>
            </div>

            {/* 2. Common Mistake vs Bridge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <div className="text-sm font-bold text-red-400/90 line-through">
                {current.literalMistake}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                    {isArabic ? '✨ الجسر التركيبي الصح:' : '✨ The Structural Bridge:'}
                  </span>
                  <p className="text-2xl font-black text-emerald-300 tracking-wide font-sans-en">
                    {current.structuralBridge}
                  </p>
                </div>

                <button
                  onClick={() => handleSpeak(current.structuralBridge)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 active:scale-95 transition shadow-lg cursor-pointer"
                >
                  <Volume2 size={18} />
                  <span>{isArabic ? 'اسمع 🔊' : 'Listen 🔊'}</span>
                </button>
              </div>
            </div>

            {/* 3. socratic Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p>{isArabic ? current.explanationAr : current.explanationEn}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isArabic ? 'مثال تاني 🔄' : 'Next Example 🔄'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onLaunchFullApp();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isArabic ? 'فتح التطبيق الكامل 🚀' : 'Open Full App 🚀'}</span>
              <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
