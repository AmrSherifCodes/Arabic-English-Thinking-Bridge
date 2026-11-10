import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { soundFX } from '../utils/soundFX';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clickCount?: number;
  onIncrementClick?: () => void;
}

export function MutahEasterEggModal({ isOpen, onClose, clickCount = 8, onIncrementClick }: Props) {
  useEffect(() => {
    if (isOpen) {
      soundFX.playMutahChime();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mutah-poem-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      style={{
        backgroundColor: '#050307',
        backgroundImage: 'radial-gradient(ellipse at center, rgba(35, 15, 25, 0.45) 0%, rgba(5, 3, 7, 0.98) 75%)',
      }}
    >
      <div className="relative w-full max-w-4xl rounded-3xl border border-rose-950/40 bg-[#070409]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="إغلاق"
          className="absolute top-5 left-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-rose-200/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Header / Sub-badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 px-3.5 py-1 text-xs font-semibold text-rose-200 tracking-wide">
            <Sparkles size={13} className="text-rose-300" />
            سنة ٨ هجرية · غزوة مؤتة (Battle of Mu&apos;tah)
          </span>
        </div>

        <h2
          id="mutah-poem-title"
          className="text-lg sm:text-xl font-bold text-rose-200/90 mb-6 font-arabic"
          dir="rtl"
        >
          من شعر الصحابي الجليل عبد الله بن رواحة رضي الله عنه
        </h2>

        {/* Poem Image (if present) */}
        <div className="mx-auto max-w-2xl mb-8 overflow-hidden rounded-2xl border border-rose-900/30 shadow-2xl">
          <img
            src="/mutah-poem.png"
            alt="أبيات عبد الله بن رواحة في غزوة مؤتة"
            className="w-full h-auto object-cover max-h-[260px] sm:max-h-[340px]"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* 3 Couplets Two-Column RTL Layout */}
        <div
          dir="rtl"
          className="mx-auto max-w-2xl space-y-6 sm:space-y-8 py-2"
          style={{
            fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', 'Readex Pro', serif",
            color: '#FFF1F5',
            textShadow: '0 0 18px rgba(245, 190, 215, 0.85), 0 0 38px rgba(245, 190, 215, 0.45)',
          }}
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8 items-center text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
            <div className="text-right sm:text-right text-rose-100">
              أقسمتُ يا نفسُ لَتَنْزِلِنَّهْ
            </div>
            <div className="text-right sm:text-left text-rose-200/90">
              لَتَنْزِلِنَّ أَوْ لَتُكْرَهِنَّهْ
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8 items-center text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
            <div className="text-right sm:text-right text-rose-100">
              إنْ أَجْلَبَ الناسُ وشَدّوا الرَّنَّهْ
            </div>
            <div className="text-right sm:text-left text-rose-200/90">
              ما لي أراكِ تَكْرَهينَ الجَنَّهْ
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8 items-center text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
            <div className="text-right sm:text-right text-rose-100">
              قد طالَ ما قدْ كُنْتِ مُطْمَئِنَّهْ
            </div>
            <div className="text-right sm:text-left text-rose-200/90">
              هلْ أنتِ إلا نُطْفَةٌ في شَنَّهْ
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-rose-950/50 flex flex-col items-center gap-3">
          {onIncrementClick && (
            <button
              onClick={onIncrementClick}
              type="button"
              className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-3 text-xs sm:text-sm font-black text-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 animate-pulse"
            >
              <span>⚡ واصل الضغط للوصول إلى السر التالي 99!</span>
              <span className="bg-black/40 text-white px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                {clickCount}/99
              </span>
            </button>
          )}

          <p className="text-xs sm:text-sm text-rose-300/60 font-arabic" dir="rtl">
            سِرٌّ تاريخي محفوظ في جسر التفكير · ٨ نقرات تخليداً لسنة ٨ هـ
          </p>
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-rose-900/40 hover:bg-rose-800/60 border border-rose-600/40 px-6 py-2 text-xs font-semibold text-rose-100 transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

