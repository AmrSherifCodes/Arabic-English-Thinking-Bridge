import React, { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clickCount?: number;
  onIncrementClick?: () => void;
}

/**
 * Pure text Battle of Mu'tah poem modal unlocked at CV Click #111.
 * Strictly free of SVG illustrations, animations, blurs, or heavy visual effects
 * for instant zero-lag rendering.
 */
export function MutahEasterEggModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mutah-poem-title"
      data-testid="mutah-poem-modal"
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/85"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-800 bg-[#0B0F14] p-6 sm:p-8 text-center">
        <button
          onClick={onClose}
          type="button"
          aria-label="إغلاق"
          data-testid="mutah-poem-close-btn"
          className="absolute top-3 right-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stone-700 bg-stone-900 text-stone-200 hover:bg-stone-800 hover:text-white text-base font-bold cursor-pointer"
        >
          ✕
        </button>

        <h2
          id="mutah-poem-title"
          className="text-lg sm:text-xl font-black text-amber-200 mb-5 font-arabic pt-2"
          dir="rtl"
        >
          عبد الله بن رواحة — غزوة مؤتة
        </h2>

        <div
          dir="rtl"
          className="space-y-4 py-4 px-4 sm:px-6 rounded-xl bg-[#070A0E] border border-stone-800 text-lg sm:text-2xl font-black text-amber-100 leading-relaxed"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-stone-800 pb-3">
            <div className="sm:text-right">أَقْسَمْتُ يَا نَفْسُ لَتَنْزِلِنَّهْ</div>
            <div className="sm:text-left text-amber-300">لَتَنْزِلِنَّ أَوْ لَتُكْرَهِنَّهْ</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-stone-800 pb-3">
            <div className="sm:text-right">إنْ أَجْلَبَ النَّاسُ وَشَدُّوا الرَّنَّهْ</div>
            <div className="sm:text-left text-amber-300">مَا لِي أَرَاكِ تَكْرَهِينَ الجَنَّهْ</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="sm:text-right">قَدْ طَالَ مَا قَدْ كُنْتِ مُطْمَئِنَّهْ</div>
            <div className="sm:text-left text-amber-300">هَلْ أَنْتِ إلَّا نُطْفَةٌ فِي شَنَّهْ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
