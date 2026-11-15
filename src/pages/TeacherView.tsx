import React, { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { chapter1 } from '../data/storyData';
import { useAgeSliderStore } from '../store/useAgeSliderStore';
import { TeacherQRCode } from '../components/story/TeacherQRCode';
import type { LanguageCode } from '../types/story';

interface Props {
  onBack: () => void;
}

export const TeacherView: React.FC<Props> = ({ onBack }) => {
  const { ageGroup } = useAgeSliderStore();
  const sourceLang: LanguageCode = 'ar';
  const targetLang: LanguageCode = 'en';
  const [currentSceneId, setCurrentSceneId] = useState(chapter1.startSceneId);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const scene = chapter1.scenes[currentSceneId];
  const sceneKeys = Object.keys(chapter1.scenes);
  const currentIndex = sceneKeys.indexOf(currentSceneId);
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/teacher?scene=${currentSceneId}`
    : `https://tb-eg.vercel.app/teacher?scene=${currentSceneId}`;

  useEffect(() => {
    setRevealed(false);
  }, [currentSceneId]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setToast('تم نسخ الرابط');
      } else {
        setToast('النسخ غير متاح — حدد الرابط يدوياً');
      }
    } catch {
      setToast('النسخ غير متاح — حدد الرابط يدوياً');
    }
    setTimeout(() => setToast(null), 2500);
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentSceneId(sceneKeys[currentIndex - 1]);
    }
  };

  const goNext = () => {
    if (currentIndex < sceneKeys.length - 1) {
      setCurrentSceneId(sceneKeys[currentIndex + 1]);
    }
  };

  if (!scene) {
    return (
      <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center p-6" dir="rtl">
        <p className="text-xl">المشهد غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] flex flex-col font-arabic" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:px-8 border-b border-stone-800 bg-[#121820]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          <span>إغلاق</span>
        </button>

        <h1 className="text-lg md:text-2xl font-black text-amber-500 flex items-center gap-2">
          <span>🏫</span>
          <span>وضع المعلّم · Teacher Mode</span>
        </h1>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold rounded-xl transition-colors text-sm"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">نسخ الرابط</span>
        </button>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold shadow-2xl border border-teal-400 animate-bounce text-sm">
          {toast}
        </div>
      )}

      {/* Main Grid */}
      <main className="flex-1 grid md:grid-cols-[1fr_auto] gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full items-start">
        {/* Primary Projector Section */}
        <section className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold rounded-t-xl text-base border-t border-x border-teal-500/50 shadow-md">
              {scene.characterName[targetLang] || scene.characterName['en']}
            </span>
            <span className="text-xs font-mono text-stone-400">
              المشهد {currentIndex + 1} من {sceneKeys.length}
            </span>
          </div>

          <div
            className="bg-black/50 rounded-3xl rounded-tr-none p-8 md:p-12 min-h-[45vh] flex flex-col items-center justify-center relative overflow-hidden border-2 border-stone-800 shadow-2xl"
            style={{
              backgroundImage: `url(${scene.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
              backgroundColor: 'rgba(10, 14, 19, 0.88)'
            }}
          >
            {revealed ? (
              <div className="space-y-6 text-center relative z-10 max-w-3xl">
                <p className="text-3xl md:text-5xl font-extrabold leading-relaxed text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" dir="ltr">
                  {scene.text[targetLang] || scene.text['en']}
                </p>
                <p className="text-xl md:text-3xl font-bold leading-relaxed text-amber-300/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" dir="rtl">
                  {scene.text[sourceLang]}
                </p>
              </div>
            ) : (
              <div className="text-center relative z-10 bg-black/70 px-8 py-6 rounded-2xl backdrop-blur-md border border-stone-700/50 shadow-xl">
                <EyeOff className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
                <p className="text-xl md:text-2xl text-stone-300 font-bold">
                  اضغط "اكشف" لعرض النص للتلاميذ
                </p>
                <p className="text-xs text-stone-500 mt-1 font-mono">
                  Dialogue hidden for presentation mode
                </p>
              </div>
            )}
          </div>

          {/* Teacher Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setRevealed(!revealed)}
              className="py-4 px-6 text-lg bg-amber-500 hover:bg-amber-400 text-[#0A0E13] font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {revealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{revealed ? 'اخفاء النص' : 'اكشف النص'}</span>
            </button>

            <button
              onClick={goPrev}
              disabled={currentIndex <= 0}
              className="py-4 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              <span>المشهد السابق</span>
            </button>

            <button
              onClick={goNext}
              disabled={currentIndex >= sceneKeys.length - 1}
              className="py-4 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <span>المشهد التالي</span>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Classroom QR Sidebar */}
        <aside className="bg-[#141A22] border border-stone-800 p-6 rounded-3xl flex flex-col items-center justify-start gap-4 shadow-xl">
          <div className="text-center">
            <h2 className="text-lg font-bold text-amber-400 mb-1">رمز المتابعة الفورية</h2>
            <p className="text-xs text-stone-400">Scan to follow lesson live</p>
          </div>

          <TeacherQRCode url={shareUrl} size={240} />

          <div className="w-full text-center space-y-2 pt-2">
            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-mono font-bold transition-colors border border-stone-700"
            >
              نسخ رابط المشهد
            </button>
            <p className="text-[11px] text-stone-500 leading-tight">
              يعمل بدون إنترنت بعد التحميل الأول لدى الطلاب.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};
