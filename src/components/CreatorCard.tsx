import React, { useState } from 'react';
import { MutahEasterEggModal } from './MutahEasterEggModal';

export function CreatorCard() {
  const [tapCount, setTapCount] = useState(0);
  const [isPoemOpen, setIsPoemOpen] = useState(false);

  const handlePhotoClick = () => {
    const nextCount = tapCount + 1;
    if (nextCount >= 8) {
      setTapCount(0);
      setIsPoemOpen(true);
    } else {
      setTapCount(nextCount);
    }
  };

  return (
    <>
      <section
        className="my-10 mx-auto max-w-xl px-4"
        dir="rtl"
        aria-label="بطاقة مؤسس المشروع"
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-[#0E151D]/90 p-6 sm:p-7 shadow-[0_0_35px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all hover:border-emerald-400/60">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            {/* Interactive Portrait with 8-tap Battle of Mu'tah Easter Egg */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={handlePhotoClick}>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
              <img
                src="/amr.jpg"
                data-amr-avatar="true"
                onError={(e) => {
                  e.currentTarget.src = '/amr-avatar.png';
                }}
                alt="عمرو شريف - مؤسس جسر التفكير"
                className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-emerald-400 shadow-md select-none active:scale-95 transition-transform"
                title="عمرو شريف · اضغط للتعرف على المزيد"
              />
              {tapCount > 0 && tapCount < 8 && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-black shadow-lg animate-pulse">
                  {tapCount}
                </span>
              )}
            </div>

            {/* Creator Bio */}
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                مؤسس المشروع والمطور
              </div>
              <h3 className="text-xl font-bold text-[#EEF2F5] font-arabic">
                عمرو شريف
              </h3>
              <p className="text-sm leading-relaxed text-[#9AA7B2] font-arabic">
                عمرو شريف · باحث ومطور من الإسكندرية — مشروع مجاني 100% ومفتوح المصدر لكل إنسان.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Tap Battle of Mu'tah Easter Egg Modal */}
      <MutahEasterEggModal
        isOpen={isPoemOpen}
        onClose={() => {
          setIsPoemOpen(false);
          setTapCount(0);
        }}
      />
    </>
  );
}

