import React, { useState, useEffect } from 'react';
import { chapter1 } from '../data/storyData';
import { TeacherQRCode } from '../components/story/TeacherQRCode';
import { useAgeSliderStore } from '../store/useAgeSliderStore';
import { useLanguagePair } from '../hooks/useLanguagePair';
import { LanguageCode } from '../types/story';

export const TeacherView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { ageGroup } = useAgeSliderStore();
  const { sourceLang, targetLang } = useLanguagePair();
  const [currentSceneId, setCurrentSceneId] = useState(chapter1.startSceneId);
  const [revealed, setRevealed] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [toast, setToast] = useState('');

  const currentScene = chapter1.scenes[currentSceneId];
  // Flattening scenes linearly for simple prev/next navigation in Teacher Mode
  const sceneKeys = Object.keys(chapter1.scenes);
  const currentIndex = sceneKeys.indexOf(currentSceneId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/app?chapter=${chapter1.id}&scene=${currentSceneId}`);
    }
    setRevealed(false);
  }, [currentSceneId]);

  const handleCopyLink = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => showToast('تم نسخ الرابط'))
        .catch(() => showToast('فشل النسخ'));
    } else {
      // Fallback for older browsers
      showToast('النسخ التلقائي غير مدعوم');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentSceneId(sceneKeys[currentIndex - 1]);
  };

  const goNext = () => {
    if (currentIndex < sceneKeys.length - 1) setCurrentSceneId(sceneKeys[currentIndex + 1]);
  };

  if (!currentScene) return <div className="text-white">Scene not found</div>;

  return (
    <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] font-arabic" dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex justify-between items-center p-4 border-b border-stone-800">
        <button onClick={onBack} className="px-4 py-2 bg-stone-800/80 rounded-xl text-sm font-bold hover:bg-stone-700 transition">
          {sourceLang === 'ar' ? '← خروج' : '← Exit'}
        </button>
        <h1 className="text-xl font-bold text-amber-500">وضع المعلّم · Teacher Mode</h1>
        <button onClick={handleCopyLink} className="px-4 py-2 bg-teal-500/20 text-teal-300 rounded-xl text-sm font-bold border border-teal-500/30 hover:bg-teal-500/40 transition">
          {sourceLang === 'ar' ? '📋 نسخ الرابط' : '📋 Copy Link'}
        </button>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-6 py-2 rounded-full font-bold shadow-lg z-50">
          {toast}
        </div>
      )}

      <main className="grid md:grid-cols-[1fr_auto] gap-6 p-6 max-w-7xl mx-auto w-full">
        <section className="space-y-4 flex flex-col">
          <div className="inline-block mb-2">
            <span className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white text-lg font-bold rounded-t-xl shadow-lg border-t border-x border-teal-500/50">
              {currentScene.characterName[targetLang as LanguageCode] || currentScene.characterName['en']}
            </span>
          </div>

          <div
            className="bg-black/40 rounded-2xl rounded-tr-none p-8 min-h-[40vh] flex items-center justify-center relative overflow-hidden border border-stone-800"
            style={{
              backgroundImage: `url(${currentScene.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
              backgroundColor: 'rgba(10, 14, 19, 0.85)'
            }}
          >
            {revealed ? (
              <p className="text-3xl md:text-5xl font-bold leading-relaxed relative z-10 text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                {currentScene.text[targetLang as LanguageCode] || currentScene.text['en']}
              </p>
            ) : (
              <p className="text-2xl text-stone-500 italic text-center relative z-10 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md">
                {sourceLang === 'ar' ? 'اضغط "اكشف" لعرض النص للتلاميذ' : 'Press "Reveal" to show text'}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setRevealed(!revealed)}
              className="flex-1 py-4 text-xl bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              {revealed
                ? (sourceLang === 'ar' ? '👁️ اخفاء' : '👁️ Hide')
                : (sourceLang === 'ar' ? '👁️ اكشف' : '👁️ Reveal')}
            </button>
            <button
              onClick={goPrev}
              disabled={currentIndex <= 0}
              className="px-8 bg-stone-800 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {sourceLang === 'ar' ? '← السابق' : '← Prev'}
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex >= sceneKeys.length - 1}
              className="px-8 bg-stone-800 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {sourceLang === 'ar' ? 'التالي →' : 'Next →'}
            </button>
          </div>
        </section>

        <aside className="space-y-4 flex flex-col items-center justify-start pt-14">
          <TeacherQRCode url={shareUrl} size={280} />
          <p className="text-sm text-stone-400 text-center font-bold">
            {sourceLang === 'ar' ? 'امسح الرمز لمتابعة الدرس على هاتفك' : 'Scan to follow on your phone'}
          </p>
        </aside>
      </main>
    </div>
  );
};
