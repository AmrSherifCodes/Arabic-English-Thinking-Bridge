import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ErwinChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clickCount?: number;
}

export function ErwinChargeModal({ isOpen, onClose, clickCount = 99 }: ErwinChargeModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl text-white font-arabic"
        role="dialog"
        aria-modal="true"
        aria-label="Erwin Charge 2nd Checkpoint Modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.35, type: 'spring' }}
          className="relative w-full max-w-2xl rounded-3xl border-2 border-amber-500 bg-stone-950 p-5 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.5)] overflow-hidden text-center space-y-4"
        >
          {/* Background Fiery Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-400 hover:text-white transition"
            aria-label="Close Erwin Charge Modal"
          >
            <X size={20} />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase">
            <Flame size={14} />
            <span>2ND CHECKPOINT UNLOCKED ({clickCount} CLICKS!) 🎬</span>
          </div>

          {/* Video Embed Player */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-amber-500/40 bg-black shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/RCHJNffHrKY?autoplay=1&rel=0&enablejsapi=1"
              title="MY SOLDIERS RAGE - Attack on Titan Motivational Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Quote Details */}
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-start space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300" dir="rtl">
                ⚔️ SHINZO WO SASAGEYO! 心臓を捧げよ
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">Captain Erwin Smith</span>
            </div>
            <p className="text-[11px] font-mono text-stone-300 dir-ltr text-start">
              &quot;MY SOLDIERS, RAGE! MY SOLDIERS, SCREAM! MY SOLDIERS, FIGHT!&quot;
            </p>
            <p className="text-[11px] text-teal-400 font-bold pt-1 border-t border-stone-800/80" dir="rtl">
              🌊 رسالة صمود من قلب الإسكندرية: القلب والروح للحرية والعلم والكرامة!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-stone-950 font-black text-xs shadow-xl hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Shield size={16} />
            <span>واصل المسيرة يا بطل! (SHINZO WO SASAGEYO ⚔️)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
