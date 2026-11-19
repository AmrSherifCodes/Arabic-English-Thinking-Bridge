import React, { useEffect } from 'react';
import { X, Sparkles, Shield, Swords, Flame } from 'lucide-react';
import { soundFX } from '../utils/soundFX';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clickCount?: number;
  onIncrementClick?: () => void;
}

export function MutahEasterEggModal({ isOpen, onClose, clickCount = 3, onIncrementClick }: Props) {
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
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(159, 18, 57, 0.35) 0%, rgba(10, 3, 5, 0.98) 80%)',
      }}
    >
      <div className="relative w-full max-w-3xl rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#1C0A0E] via-[#120508] to-[#0A0305] p-5 sm:p-8 shadow-[0_0_60px_rgba(159,18,57,0.4)] text-center my-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="إغلاق"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/60 px-4 py-1.5 text-xs font-black text-amber-300 shadow-md mb-4">
          <Swords size={15} className="text-amber-400 animate-pulse" />
          <span>سنة ٨ هجرية · غزوة مؤتة العظيمة (Battle of Mu&apos;tah)</span>
        </div>

        {/* Hand-Drawn War Scene Illustration SVG */}
        <div className="relative mx-auto max-w-xl mb-6 rounded-2xl border border-amber-500/30 bg-[#080204] p-4 overflow-hidden shadow-2xl group">
          {/* Background Ambient Glow inside illustration */}
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-amber-900/20 pointer-events-none" />

          <svg
            viewBox="0 0 600 240"
            className="w-full h-auto max-h-[220px] sm:max-h-[260px] mx-auto filter drop-shadow-lg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A080C" />
                <stop offset="60%" stopColor="#4A121A" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
              <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="bladeGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>

            {/* Dramatic Battle Sky */}
            <rect width="600" height="240" fill="url(#skyGrad)" rx="12" />
            <circle cx="300" cy="180" r="140" fill="url(#sunGlow)" />

            {/* Distant Battle Smoke & Dust Particles */}
            <path d="M0,190 Q150,160 300,185 T600,175 L600,240 L0,240 Z" fill="#1C0509" opacity="0.9" />
            <path d="M0,205 Q200,180 400,210 T600,195 L600,240 L0,240 Z" fill="#0F0204" />

            {/* Distant Army Banners & Spears Silhouettes */}
            <g stroke="#9F1239" strokeWidth="1.5" opacity="0.6">
              <line x1="40" y1="160" x2="40" y2="210" />
              <line x1="55" y1="150" x2="55" y2="210" />
              <path d="M55,150 L75,160 L55,170 Z" fill="#9F1239" />
              <line x1="80" y1="165" x2="80" y2="210" />
              <line x1="110" y1="155" x2="110" y2="210" />
              <line x1="125" y1="145" x2="125" y2="210" />
              <path d="M125,145 L145,155 L125,165 Z" fill="#9F1239" />

              <line x1="480" y1="150" x2="480" y2="210" />
              <line x1="500" y1="140" x2="500" y2="210" />
              <path d="M500,140 L520,150 L500,160 Z" fill="#B91C1C" />
              <line x1="530" y1="155" x2="530" y2="210" />
              <line x1="560" y1="145" x2="560" y2="210" />
            </g>

            {/* Center Desert Dune / Peak */}
            <path d="M120,240 L300,140 L480,240 Z" fill="#1A0408" stroke="#F59E0B" strokeWidth="0.5" />

            {/* Hand-Drawn Hero Warrior (Abdullah ibn Rawahah) holding Sword & Banner */}
            <g transform="translate(260, 50)">
              {/* Flowing Cape */}
              <path
                d="M30,70 C10,80 -10,100 -25,120 C-5,115 15,100 25,85 Z"
                fill="#F59E0B"
                opacity="0.8"
              />

              {/* Warrior Body & Armor */}
              <path
                d="M30,65 L45,65 L50,110 L25,110 Z"
                fill="#0F0204"
                stroke="#D97706"
                strokeWidth="2"
              />

              {/* Warrior Head & Turban */}
              <circle cx="37" cy="50" r="12" fill="#0F0204" stroke="#FACC15" strokeWidth="2" />
              <path d="M28,48 C37,42 45,42 48,50 Z" fill="#F59E0B" />

              {/* Left Arm holding Islamic Battle Banner */}
              <line x1="28" y1="70" x2="5" y2="30" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
              <path d="M5,30 Q-25,15 -45,35 Q-20,45 5,45 Z" fill="#10B981" stroke="#34D399" strokeWidth="1" />
              <text x="-28" y="34" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">الله</text>

              {/* Right Arm Raised High Holding the Sword */}
              <line x1="42" y1="65" x2="65" y2="35" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

              {/* The Unsheathed Raised Sword */}
              <line x1="65" y1="35" x2="95" y2="-5" stroke="url(#bladeGlow)" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="60" y1="40" x2="70" y2="30" stroke="#F59E0B" strokeWidth="3" />
              {/* Sword Gleam / Sparkle */}
              <circle cx="95" cy="-5" r="5" fill="#FFFFFF" className="animate-ping" />
              <path d="M95,-15 L95,5 M85,-5 L105,-5" stroke="#FACC15" strokeWidth="1.5" />
            </g>

            {/* Arabic Calligraphy Title on Scene */}
            <text x="300" y="225" fill="#FDE68A" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              الصحابي الشاعر عبد الله بن رواحة رضي الله عنه · مؤتة ٨ هـ
            </text>
          </svg>
        </div>

        {/* Title */}
        <h2
          id="mutah-poem-title"
          className="text-xl sm:text-2xl font-black text-amber-300 mb-2 font-arabic"
          dir="rtl"
        >
          أبيات الثبات والبطولة الشامخة
        </h2>
        <p className="text-xs text-amber-100/80 mb-6 max-w-xl mx-auto leading-relaxed font-arabic" dir="rtl">
          أنشدها الصحابي الجليل وهو يحمل الراية والسيف على كثبان مؤتة قبل استشهاده:
        </p>

        {/* 3 Couplets RTL Clean Layout - NO duplicate images, NO blurry text shadow */}
        <div
          dir="rtl"
          className="mx-auto max-w-2xl space-y-4 sm:space-y-6 py-4 px-4 sm:px-8 rounded-2xl bg-[#080204]/90 border border-amber-500/30 shadow-inner"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 items-center text-lg sm:text-2xl font-black text-amber-100 border-b border-amber-500/20 pb-3">
            <div className="text-right sm:text-right text-amber-200 leading-snug">
              أَقْسَمْتُ يَا نَفْسُ لَتَنْزِلِنَّهْ
            </div>
            <div className="text-right sm:text-left text-amber-400 leading-snug">
              لَتَنْزِلِنَّ أَوْ لَتُكْرَهِنَّهْ
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 items-center text-lg sm:text-2xl font-black text-amber-100 border-b border-amber-500/20 pb-3">
            <div className="text-right sm:text-right text-amber-200 leading-snug">
              إنْ أَجْلَبَ النَّاسُ وَشَدُّوا الرَّنَّهْ
            </div>
            <div className="text-right sm:text-left text-amber-400 leading-snug">
              مَا لِي أَرَاكِ تَكْرَهِينَ الجَنَّهْ
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 items-center text-lg sm:text-2xl font-black text-amber-100">
            <div className="text-right sm:text-right text-amber-200 leading-snug">
              قَدْ طَالَ مَا قَدْ كُنْتِ مُطْمَئِنَّهْ
            </div>
            <div className="text-right sm:text-left text-amber-400 leading-snug">
              هَلْ أَنْتِ إلَّا نُطْفَةٌ فِي شَنَّهْ
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-5 border-t border-amber-500/20 flex flex-col items-center gap-3">
          {onIncrementClick && (
            <button
              onClick={onIncrementClick}
              type="button"
              className="rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-amber-300"
            >
              <Flame size={16} className="text-slate-950" />
              <span>واصل الضغط للوصول إلى السر التالي 99!</span>
              <span className="bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                {clickCount}/99
              </span>
            </button>
          )}

          <p className="text-xs text-amber-200/70 font-arabic" dir="rtl">
            ⚔️ سر تاريخي محفوظ في جسر التفكير · تخليداً لأبطال غزوة مؤتة سنة ٨ هـ
          </p>
          <button
            onClick={onClose}
            type="button"
            className="rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-8 py-2.5 text-xs font-black text-amber-300 transition-all shadow-md"
          >
            إغلاق Window ✕
          </button>
        </div>
      </div>
    </div>
  );
}

