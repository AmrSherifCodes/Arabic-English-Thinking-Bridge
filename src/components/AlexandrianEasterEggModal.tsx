import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, Anchor } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AlexandrianEasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlexandrianEasterEggModal({ isOpen, onClose }: AlexandrianEasterEggModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-white font-arabic">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md rounded-3xl border border-teal-500/50 bg-stone-900 p-6 shadow-[0_0_40px_rgba(20,184,166,0.3)] text-center space-y-4"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/20 border border-teal-400 text-teal-300 flex items-center justify-center text-3xl shadow-inner">
            🌊
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-teal-400 uppercase">
              سر إسكندراني خالص · ALEXANDRIA EASTER EGG
            </span>
            <h2 className="text-xl font-black text-white">
              يا عسل إسكندراني! البحر بيسلم عليك 🌊⚓
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-start space-y-2 text-xs leading-relaxed text-stone-300">
            <p className="font-bold text-teal-300">
              من محطة الرمل لقلعة قايتباي وكورنيش الشاطبي.. 🍦
            </p>
            <p>
              التطبيق ده اتصمم برمجة وكوداً في مكتبة إسكندرية وعلى البحر بكل إخلاص وجدعنة، عشان كل طالب وشاب مصري يتعلم بطلاقة وبدون أي مصاريف أو إعلانات مدى الحياة!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Anchor size={16} />
            <span>حبيبي يا إسكندراني! كمل الرحلة</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
