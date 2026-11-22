import React, { useState, useEffect, useRef } from 'react';
import { StoryChapter, LanguageCode } from '../../types/story';
import { useAgeSliderStore } from '../../store/useAgeSliderStore';
import { useWebSpeech } from '../../hooks/useWebSpeech';
import { storyDb } from '../../db/StoryDB';

interface StoryEngineProps {
  chapter: StoryChapter;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  onComplete: () => void;
  onBack: () => void;
}

export const StoryEngine: React.FC<StoryEngineProps> = ({ chapter, sourceLang, targetLang, onComplete, onBack }) => {
  const { ageGroup } = useAgeSliderStore();
  const { speak } = useWebSpeech();
  const [currentSceneId, setCurrentSceneId] = useState<string>(chapter.startSceneId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [autoRead, setAutoRead] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('tb.story.autoRead') === 'true';
      }
    } catch {}
    return false;
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<{ word: string; x: number; y: number } | null>(null);
  const [dictCache, setDictCache] = useState<Record<string, any>>({});

  const lookupWord = async (word: string) => {
    if (dictCache[word]) return dictCache[word];
    try {
      // Fetch a single entry from the lazy dict chunk for targetLang
      const { getTargetDictionaryAsync } = await import('../../data/dictionaries');
      const dict = await getTargetDictionaryAsync(targetLang);
      const match = dict.find((e: any) =>
        targetLang === 'en'
          ? (e.englishTranslation || '').toLowerCase() === word || (e.translation || '').toLowerCase() === word
          : e.arabicWord === word
      );
      if (match) setDictCache(prev => ({ ...prev, [word]: match }));
      return match;
    } catch {
      return null;
    }
  };

  const currentScene = chapter.scenes[currentSceneId];

  const hoverTimer = useRef<number | null>(null);
  const handleWordEnter = (word: string, x: number, y: number) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setHoveredWord({ word, x, y });
      lookupWord(word);
    }, 100);
  };
  const handleWordLeave = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    setHoveredWord(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem('tb.story.autoRead', String(autoRead));
    } catch {}
  }, [autoRead]);

  useEffect(() => {
    const scene = chapter.scenes[currentSceneId];
    if (autoRead && hasInteracted && scene?.text?.[targetLang]) {
      speak(scene.text[targetLang], targetLang);
    }
  }, [currentSceneId, autoRead, hasInteracted, targetLang, chapter]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const saved = await storyDb.progress.where({ chapterId: chapter.id }).first();
        if (saved && saved.sceneId) {
          setCurrentSceneId(saved.sceneId);
        }
      } catch (e) {
        console.error("Failed to load story progress", e);
      }
    };
    loadProgress();
  }, [chapter.id]);

  useEffect(() => {
    const saveProgress = async () => {
      try {
        const existing = await storyDb.progress.where({ chapterId: chapter.id }).first();
        if (existing && existing.id) {
          await storyDb.progress.update(existing.id, { sceneId: currentSceneId, lastUpdated: Date.now() });
        } else {
          await storyDb.progress.add({ chapterId: chapter.id, sceneId: currentSceneId, choicesMade: {}, lastUpdated: Date.now() });
        }
      } catch (e) {
        console.error("Failed to save story progress", e);
      }
    };
    saveProgress();
  }, [currentSceneId, chapter.id]);

  const handleChoice = (choiceId: string) => {
    setHasInteracted(true);
    const choice = currentScene.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    if (choice.feedback) {
      setFeedback(choice.feedback[targetLang] || choice.feedback['en']);
      setIsCorrect(choice.isCorrect ?? null);
    }

    const nextSceneId = (choice as any).nextSceneIdByAge?.[ageGroup] || choice.nextSceneId;
    if (nextSceneId) {
      setCurrentSceneId(nextSceneId);
    } else {
      onComplete();
    }
  };

  const handleSpeak = () => {
    const textToSpeak = currentScene.text[targetLang] || currentScene.text['en'];
    speak(textToSpeak, targetLang);
  };

  if (!currentScene) return <div>Scene not found.</div>;

  return (
    <div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex flex-col relative overflow-hidden pt-safe pb-safe" dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-500"
        style={{ backgroundImage: `url(${currentScene.imageUrl})`, filter: 'blur(2px) brightness(0.7)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E13] via-[#0A0E13]/80 to-transparent" />

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <button onClick={onBack} className="px-4 py-2 bg-stone-800/80 rounded-xl text-sm font-bold backdrop-blur-md hover:bg-stone-700 transition">
          {sourceLang === 'ar' ? '← خروج' : '← Exit'}
        </button>
        <div className="flex gap-2 items-center">
          <button onClick={() => { setAutoRead(!autoRead); setHasInteracted(true); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition border shadow-lg ${autoRead ? 'bg-amber-500 text-[#0A0E13] border-amber-600' : 'bg-stone-800/80 text-stone-300 border-stone-700 backdrop-blur-md hover:bg-stone-700'}`}>
            {sourceLang === 'ar' ? '🔊 قراءة تلقائية' : '🔊 Auto-read'}
          </button>
          <div className="px-3 py-1.5 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-500/30 shadow-lg shadow-teal-900/20">
            {chapter.title[targetLang] || chapter.title['en']}
          </div>
        </div>
      </div>

      {/* Scene Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-12 max-w-4xl mx-auto w-full">
        {/* Character Name */}
        <div className="mb-2">
          <span className="px-4 py-1.5 bg-gradient-to-r from-teal-600 to-teal-800 text-white text-sm font-bold rounded-t-xl inline-block shadow-lg border-t border-x border-teal-500/50">
            {currentScene.characterName[targetLang] || currentScene.characterName['en']}
          </span>
        </div>

        {/* Dialogue Box */}
        <div className="bg-[#1A1F26]/95 border-2 border-teal-500/30 rounded-2xl rounded-tl-none p-6 shadow-2xl backdrop-blur-xl relative transition-all duration-300">
          <p className="text-xl sm:text-2xl font-bold leading-relaxed mb-6" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
            {(currentScene.text[targetLang] || currentScene.text['en']).split(' ').map((word, i) => {
              const cleanWord = word.replace(/[^\w\s\u0600-\u06FF]/gi, '').toLowerCase();
              return (
                <span
                  key={i}
                  className="relative inline-block cursor-pointer hover:text-amber-400 transition-colors mr-1 border-b border-transparent hover:border-amber-400/50"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleWordEnter(cleanWord, rect.left + rect.width / 2, rect.top - 10);
                  }}
                  onMouseLeave={handleWordLeave}
                  onTouchStart={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleWordEnter(cleanWord, rect.left + rect.width / 2, rect.top - 10);
                  }}
                >
                  {word}{' '}
                </span>
              );
            })}
          </p>

          {/* Audio Button */}
          <button
            onClick={handleSpeak}
            className="absolute top-4 right-4 p-2.5 bg-stone-800 rounded-full hover:bg-teal-600 transition text-teal-400 hover:text-white shadow-lg border border-stone-700"
            aria-label="Listen"
          >
            🔊
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`mb-4 p-4 rounded-xl border-2 font-bold animate-in fade-in slide-in-from-top-2 ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
              {feedback}
            </div>
          )}

          {/* Choices */}
          <div className="space-y-3 mt-4">
            {currentScene.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="w-full text-left p-4 rounded-xl bg-stone-800/80 hover:bg-teal-900/40 border-2 border-transparent hover:border-teal-500/70 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md group"
                dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="text-lg font-semibold group-hover:text-teal-100 transition-colors">
                  {choice.text[targetLang] || choice.text['en']}
                </span>
                {sourceLang !== targetLang && (
                  <span className="block text-sm text-stone-400 mt-1.5 group-hover:text-stone-300 transition-colors" dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}>
                    {choice.text[sourceLang]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredWord && (
        <div
          className="fixed z-50 bg-[#1A222C] border border-amber-500/30 rounded-xl p-3 shadow-xl shadow-black/50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ top: hoveredWord.y, left: hoveredWord.x }}
        >
          <div className="text-amber-400 font-bold mb-1 text-sm">{hoveredWord.word}</div>
          {(() => {
            const match = dictCache[hoveredWord.word];
            if (match) {
              return (
                <div className="flex flex-col gap-1">
                  <div className="text-[#EEF2F5] text-sm max-w-[200px] leading-tight line-clamp-3">
                    {sourceLang === 'ar' ? match.arabicWord : (match.englishTranslation || match.translation)}
                  </div>
                  {match.partOfSpeech && <div className="text-stone-400 text-xs italic opacity-80">{match.partOfSpeech}</div>}
                </div>
              );
            }
            return <div className="text-stone-500 text-xs italic">{sourceLang === 'ar' ? 'جاري البحث...' : 'Searching...'}</div>;
          })()}
        </div>
      )}
    </div>
  );
};
