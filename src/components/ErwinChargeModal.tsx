import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, X, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ErwinChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clickCount?: number;
}

export function ErwinChargeModal({ isOpen, onClose, clickCount = 99 }: ErwinChargeModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl text-white font-arabic">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="relative w-full max-w-lg rounded-3xl border-2 border-amber-500 bg-stone-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.5)] overflow-hidden text-center space-y-5"
        >
          {/* Background Fiery Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase">
            <Flame size={16} />
            <span>SECRET EASTER EGG UNLOCKED ({clickCount} CLICKS!)</span>
          </div>

          {/* Captain Erwin Image Illustration Card */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-stone-900 shadow-2xl group">
            <div className="p-8 bg-gradient-to-b from-rose-950/80 via-stone-900 to-amber-950/80 text-center space-y-3">
              <div className="text-6xl animate-bounce">⚔️🔥</div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-wide">
                SHINZO WO SASAGEYO!
              </h2>
              <p className="text-xs sm:text-sm font-extrabold text-stone-200 tracking-widest uppercase">
                心臓を捧げよ · GAVE YOUR HEART FOR FREEDOM!
              </p>
            </div>
          </div>

          {/* Quote Details */}
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-start space-y-2">
            <p className="text-xs sm:text-sm font-black text-amber-300 leading-relaxed" dir="rtl">
              &quot;تقدموا يا رجال! القلب والروح للحرية والعلم والكرامة! لن نستسلم ولن نتوقف أبداً!&quot;
            </p>
            <p className="text-[11px] font-mono text-stone-400 dir-ltr text-start">
              &quot;MY SOLDIERS, RAGE! MY SOLDIERS, SCREAM! MY SOLDIERS, FIGHT!&quot;
            </p>
            <p className="text-[11px] text-teal-400 font-bold pt-1 border-t border-stone-800" dir="rtl">
              🌊 رسالة صمود إسكندرانية: إهداء لكل طالب وشاب بيحارب عشان مستقبله وحريته.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-stone-950 font-black text-sm shadow-xl hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Shield size={18} />
            <span>واصل المسيرة يا بطل! (SHINZO WO SASAGEYO)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
