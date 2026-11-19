import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, Anchor, Waves } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AlexandrianEasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlexandrianEasterEggModal({ isOpen, onClose }: AlexandrianEasterEggModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 } });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#060E1A]/90 backdrop-blur-xl text-white font-arabic">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md rounded-3xl border-2 border-cyan-400/80 bg-gradient-to-br from-[#0B1C33]/98 via-[#0E2746]/95 to-[#060E1A]/98 p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-center space-y-4"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 border border-cyan-300 text-slate-950 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30 font-black">
            🌊
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-cyan-300 uppercase block">
              سر إسكندراني خالص · ALEXANDRIA EASTER EGG ⚓
            </span>
            <h2 className="text-xl font-black text-white">
              يا عسل إسكندراني! البحر بيسلم عليك 🌊⚓
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#061224]/90 border border-cyan-500/30 text-start space-y-2 text-xs leading-relaxed text-slate-200">
            <p className="font-black text-cyan-300 flex items-center gap-1.5">
              <Waves size={14} className="text-teal-400" />
              من محطة الرمل لقلعة قايتباي وكورنيش الشاطبي.. 🍦
            </p>
            <p className="font-medium">
              التطبيق ده اتصمم برمجة وكوداً في مكتبة إسكندرية وعلى البحر بكل إخلاص وجدعنة، عشان كل طالب وشاب مصري يتعلم بطلاقة وبدون أي مصاريف أو إعلانات مدى الحياة!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-slate-950 font-black text-xs shadow-xl hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2 border border-cyan-200"
          >
            <Anchor size={16} />
            <span>حبيبي يا إسكندراني! كمل الرحلة 🚀</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
