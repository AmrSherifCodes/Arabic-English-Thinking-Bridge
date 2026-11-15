import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Star, Flame, Trophy, PlayCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOCAB, VocabWord } from './vocab';

// --- Types ---
type AgeBand = '5-7' | '8-9' | '10-12';
type Direction = 'ar-en' | 'en-ar';
type Step = 'AGE_SELECT' | 'DIR_SELECT' | 'HOME' | 'PLAYING';

interface GameState {
  ageBand: AgeBand | null;
  direction: Direction | null;
  streakDays: number;
  lastPlayDate: string | null;
  dailyChallengeLastCompleted: string | null;
  lastScore: number;
  sessionRounds: number;
  sessionStats: { accuracy: number; time: number }[];
}

interface CardData {
  uniqueId: string;
  wordId: string;
  isSource: boolean;
  content: string; // Emoji, Arabic word, or English word
  subContent?: string; // For 5-7 band (small text)
  lang: 'ar' | 'en'; // For TTS
  ttsText: string;
}

// --- Audio Effects ---
const playTone = (freq: number, type: OscillatorType, duration: number, vol: number) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

const playPop = () => {
  playTone(600, 'sine', 0.1, 0.5);
  setTimeout(() => playTone(800, 'sine', 0.15, 0.5), 50);
};

const playError = () => {
  playTone(300, 'triangle', 0.3, 0.3);
};

const playVictory = () => {
  playTone(400, 'sine', 0.1, 0.5);
  setTimeout(() => playTone(500, 'sine', 0.1, 0.5), 100);
  setTimeout(() => playTone(600, 'sine', 0.1, 0.5), 200);
  setTimeout(() => playTone(800, 'sine', 0.4, 0.5), 300);
};

const speak = (text: string, lang: 'ar' | 'en') => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const ut = new SpeechSynthesisUtterance(text);
  ut.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
  window.speechSynthesis.speak(ut);
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- Main Component ---
export const LanguageGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Storage
  const [state, setState] = useState<GameState>(() => {
    try {
      const stored = localStorage.getItem('wa3i_game_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      ageBand: null,
      direction: null,
      streakDays: 0,
      lastPlayDate: null,
      dailyChallengeLastCompleted: null,
      lastScore: 0,
      sessionRounds: 0,
      sessionStats: []
    };
  });

  const saveState = (newState: Partial<GameState>) => {
    setState(prev => {
      const merged = { ...prev, ...newState };
      try {
        localStorage.setItem('wa3i_game_v1', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  const [step, setStep] = useState<Step>(() => {
    if (!state.ageBand) return 'AGE_SELECT';
    if (!state.direction) return 'DIR_SELECT';
    return 'HOME';
  });

  // Game state
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongShakeId, setWrongShakeId] = useState<string | null>(null);

  const [isDaily, setIsDaily] = useState(false);
  const [roundTimer, setRoundTimer] = useState<number | null>(null);

  // Stats for current round
  const [clicks, setClicks] = useState(0);
  const [matches, setMatches] = useState(0);
  const startTime = useRef<number>(0);

  // Timer effect
  useEffect(() => {
    if (step === 'PLAYING' && roundTimer !== null && roundTimer > 0 && matchedPairs.size * 2 < cards.length) {
      const tid = setTimeout(() => setRoundTimer(r => (r ? r - 1 : 0)), 1000);
      return () => clearTimeout(tid);
    } else if (step === 'PLAYING' && roundTimer === 0 && matchedPairs.size * 2 < cards.length) {
      handleTimeOut();
    }
  }, [step, roundTimer, matchedPairs, cards]);

  const handleTimeOut = () => {
    if (state.ageBand === '8-9') {
      // 8-9: Try again (reset round but keep same cards)
      setMatchedPairs(new Set());
      setSelectedId(null);
      setRoundTimer(45);
      setClicks(0);
      setMatches(0);
      startTime.current = Date.now();
      playError();
    } else if (state.ageBand === '10-12') {
      // 10-12: Lose points, end round
      finishRound(true);
    }
  };

  const startRound = (daily: boolean) => {
    setIsDaily(daily);
    let pairCount = 3;
    let timeLimit = null;
    const band = state.ageBand;

    if (daily) {
      pairCount = 7;
      timeLimit = 30; // Daily always has a bit of pressure
    } else {
      if (band === '5-7') { pairCount = 3; timeLimit = null; }
      if (band === '8-9') { pairCount = 5; timeLimit = 45; }
      if (band === '10-12') { pairCount = 7; timeLimit = 25; }
    }

    // Pick words
    const available = VOCAB.filter(v => daily || v.bands.includes(band || '5-7'));
    const selectedVocab = shuffle(available).slice(0, pairCount);

    const newCards: CardData[] = [];
    const dir = state.direction || 'ar-en';
    const isArSource = dir === 'ar-en';

    selectedVocab.forEach((v, idx) => {
      let sourceCard: CardData;
      let targetCard: CardData;

      const sourceText = isArSource ? v.ar : v.en;
      const targetText = isArSource ? v.en : v.ar;
      const sourceLang = isArSource ? 'ar' : 'en';
      const targetLang = isArSource ? 'en' : 'ar';

      if (band === '5-7' && !daily) {
        sourceCard = { uniqueId: `${v.id}-src`, wordId: v.id, isSource: true, content: v.emoji, subContent: sourceText, lang: sourceLang, ttsText: sourceText };
        targetCard = { uniqueId: `${v.id}-tgt`, wordId: v.id, isSource: false, content: v.emoji, subContent: targetText, lang: targetLang, ttsText: targetText };
      } else if (band === '8-9' && !daily) {
        sourceCard = { uniqueId: `${v.id}-src`, wordId: v.id, isSource: true, content: v.emoji, lang: sourceLang, ttsText: sourceText };
        targetCard = { uniqueId: `${v.id}-tgt`, wordId: v.id, isSource: false, content: targetText, lang: targetLang, ttsText: targetText };
      } else {
        sourceCard = { uniqueId: `${v.id}-src`, wordId: v.id, isSource: true, content: sourceText, lang: sourceLang, ttsText: sourceText };
        targetCard = { uniqueId: `${v.id}-tgt`, wordId: v.id, isSource: false, content: targetText, lang: targetLang, ttsText: targetText };
      }

      newCards.push(sourceCard, targetCard);
    });

    setCards(shuffle(newCards));
    setMatchedPairs(new Set());
    setSelectedId(null);
    setRoundTimer(timeLimit);
    setClicks(0);
    setMatches(0);
    setStep('PLAYING');
    startTime.current = Date.now();
  };

  const handleCardClick = (card: CardData) => {
    if (matchedPairs.has(card.wordId)) return;
    if (selectedId === card.uniqueId) return;

    speak(card.ttsText, card.lang);
    setClicks(c => c + 1);

    if (!selectedId) {
      setSelectedId(card.uniqueId);
      return;
    }

    const firstCard = cards.find(c => c.uniqueId === selectedId)!;
    if (firstCard.wordId === card.wordId && firstCard.isSource !== card.isSource) {
      // Match!
      playPop();
      setMatchedPairs(prev => {
        const next = new Set(prev);
        next.add(card.wordId);
        if (next.size * 2 === cards.length) {
          setTimeout(() => finishRound(false), 500);
        }
        return next;
      });
      setMatches(m => m + 1);
      setSelectedId(null);
      // Combo confetti
      if (matches > 1) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#F0B84C', '#6FCF97'] });
      }
    } else {
      // Wrong
      playError();
      setWrongShakeId(card.uniqueId);
      setTimeout(() => setWrongShakeId(null), 400);
      setSelectedId(null);
    }
  };

  const finishRound = (timeout: boolean) => {
    const timeSpent = (Date.now() - startTime.current) / 1000;
    const accuracy = clicks === 0 ? 0 : (matchedPairs.size * 2) / clicks;

    let score = matchedPairs.size * 10;
    if (accuracy >= 0.8) score += 20;
    if (isDaily) score = Math.floor(score * 1.5);
    if (timeout) score = Math.floor(score / 2);

    playVictory();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#F0B84C', '#6FCF97', '#E8886B'] });

    // Update streak
    const today = getTodayString();
    let newStreak = state.streakDays;
    if (state.lastPlayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (state.lastPlayDate === yesterday) newStreak += 1;
      else newStreak = 1;
    }

    const newStats = [...state.sessionStats, { accuracy, time: timeSpent }];
    let newBand = state.ageBand;

    // Adaptive logic every 3 rounds
    if (newStats.length >= 3) {
      const avgAcc = newStats.reduce((s, x) => s + x.accuracy, 0) / newStats.length;
      const avgTime = newStats.reduce((s, x) => s + x.time, 0) / newStats.length;
      const expectedTime = state.ageBand === '8-9' ? 45 : state.ageBand === '10-12' ? 25 : 60;

      if (avgAcc >= 0.9 && avgTime < expectedTime / 2) {
        if (newBand === '5-7') newBand = '8-9';
        else if (newBand === '8-9') newBand = '10-12';
        alert('شكلك جاهز لمستوى أعلى! 🌟');
      } else if (avgAcc < 0.5) {
        if (newBand === '10-12') newBand = '8-9';
        else if (newBand === '8-9') newBand = '5-7';
        alert('يلا نلعب مستوى أهدى شوية 🌱');
      }
      newStats.length = 0; // reset
    }

    saveState({
      streakDays: newStreak,
      lastPlayDate: today,
      dailyChallengeLastCompleted: isDaily ? today : state.dailyChallengeLastCompleted,
      lastScore: score,
      sessionRounds: state.sessionRounds + 1,
      sessionStats: newStats,
      ageBand: newBand
    });

    setStep('HOME');
  };

  if (step === 'AGE_SELECT') {
    return (
      <div className="min-h-screen bg-[#0A1E3F] text-[#F5F0E6] flex flex-col items-center justify-center p-6 font-arabic rtl" dir="rtl">
        <h1 className="text-3xl font-bold mb-10 text-[#F0B84C]">إنت عندك كام سنة؟</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {['٥-٧ سنين', '٨-٩ سنين', '١٠-١٢ سنة'].map((label, idx) => (
            <button
              key={label}
              onClick={() => {
                const band: AgeBand = idx === 0 ? '5-7' : idx === 1 ? '8-9' : '10-12';
                saveState({ ageBand: band });
                setStep('DIR_SELECT');
              }}
              className="bg-[#143A6B] hover:bg-[#1a4a8a] text-2xl font-bold py-6 rounded-2xl border-2 border-[#A8B2C9]/20 transition-transform active:scale-95"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'DIR_SELECT') {
    return (
      <div className="min-h-screen bg-[#0A1E3F] text-[#F5F0E6] flex flex-col items-center justify-center p-6 font-arabic rtl" dir="rtl">
        <button onClick={() => setStep('AGE_SELECT')} className="absolute top-4 right-4 p-2 text-[#A8B2C9]">
          <ChevronRight size={32} />
        </button>
        <h1 className="text-3xl font-bold mb-10 text-[#F0B84C] text-center">إنت عايز تتعلم إيه النهارده؟</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => { saveState({ direction: 'ar-en' }); setStep('HOME'); }}
            className="bg-[#143A6B] hover:bg-[#1a4a8a] text-xl font-bold py-8 rounded-2xl border-2 border-[#A8B2C9]/20 transition-transform active:scale-95"
          >
            عربي ← إنجليزي
          </button>
          <button
            onClick={() => { saveState({ direction: 'en-ar' }); setStep('HOME'); }}
            className="bg-[#143A6B] hover:bg-[#1a4a8a] text-xl font-bold py-8 rounded-2xl border-2 border-[#A8B2C9]/20 transition-transform active:scale-95"
          >
            إنجليزي ← عربي
          </button>
        </div>
      </div>
    );
  }

  if (step === 'HOME') {
    const today = getTodayString();
    const canDoDaily = state.dailyChallengeLastCompleted !== today;

    return (
      <div className="min-h-screen bg-[#0A1E3F] text-[#F5F0E6] flex flex-col items-center p-6 font-arabic rtl" dir="rtl">
        <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
          <button onClick={onBack} className="p-2 bg-[#143A6B] rounded-full text-[#A8B2C9]">
            <ChevronRight size={24} />
          </button>
          <div className="flex items-center gap-2 bg-[#143A6B] px-4 py-2 rounded-full font-bold text-[#F0B84C]">
            <Flame size={20} className={state.streakDays > 0 ? "text-[#E8886B]" : "text-[#A8B2C9]"} />
            <span>{state.streakDays} أيام</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-[#F5F0E6]">لعبة الكلمات 🐟</h1>
        <p className="text-[#A8B2C9] mb-10 text-lg">ملتقى اللغات</p>

        {state.lastScore > 0 && (
          <div className="mb-8 flex items-center gap-2 text-[#6FCF97] font-bold text-xl bg-[#143A6B]/50 px-6 py-3 rounded-2xl">
            <Trophy size={24} />
            <span>آخر سكور: {state.lastScore}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {canDoDaily && (
            <button
              onClick={() => startRound(true)}
              className="bg-gradient-to-r from-[#F0B84C] to-[#E8886B] text-[#0A1E3F] text-2xl font-bold py-6 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Star size={28} className="fill-current" />
              تحدي اليوم (بونص ٥٠٪)
            </button>
          )}

          <button
            onClick={() => startRound(false)}
            className="bg-[#143A6B] hover:bg-[#1a4a8a] text-[#F5F0E6] text-2xl font-bold py-6 rounded-2xl border-2 border-[#A8B2C9]/20 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            <PlayCircle size={28} />
            🚀 يلا نلعب!
          </button>
        </div>

        <button
          onClick={() => setStep('AGE_SELECT')}
          className="mt-auto text-[#A8B2C9] underline py-4"
        >
          تغيير المستوى أو اللغة
        </button>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="min-h-screen bg-[#0A1E3F] text-[#F5F0E6] flex flex-col p-4 font-arabic rtl" dir="rtl">
      <div className="flex justify-between items-center mb-6 mt-2">
        <button onClick={() => setStep('HOME')} className="p-2 bg-[#143A6B] rounded-full text-[#A8B2C9]">
          <ChevronRight size={24} />
        </button>
        {roundTimer !== null && (
          <div className={`font-bold text-xl px-4 py-1 rounded-full ${roundTimer <= 10 ? 'bg-[#E8886B] text-[#0A1E3F] animate-pulse' : 'bg-[#143A6B] text-[#F0B84C]'}`}>
            ⏳ {roundTimer} ث
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {cards.map(card => {
            const isMatched = matchedPairs.has(card.wordId);
            const isSelected = selectedId === card.uniqueId;
            const isWrongShake = wrongShakeId === card.uniqueId;

            return (
              <button
                key={card.uniqueId}
                onClick={() => handleCardClick(card)}
                disabled={isMatched}
                className={`
                  relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300
                  ${state.ageBand === '5-7' && !isDaily ? 'min-h-[140px]' : state.ageBand === '8-9' && !isDaily ? 'min-h-[100px]' : 'min-h-[80px]'}
                  ${isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
                  ${isSelected ? 'bg-[#1a4a8a] border-[#F0B84C] shadow-[0_0_15px_rgba(240,184,76,0.5)]' : 'bg-[#143A6B] border-[#A8B2C9]/20 hover:border-[#A8B2C9]/50'}
                  ${isWrongShake ? 'animate-[shake_0.4s_ease-in-out] border-[#E8886B] bg-[#E8886B]/20' : ''}
                `}
              >
                {/* 5-7 shows large emoji and small text */}
                {card.subContent ? (
                  <>
                    <span className="text-5xl mb-2">{card.content}</span>
                    <span className="text-sm text-[#A8B2C9]">{card.subContent}</span>
                  </>
                ) : (
                  // Others show just content
                  <span className={`text-center px-2 ${card.content.length > 8 ? 'text-xl' : 'text-3xl'} font-bold`}>
                    {card.content}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}} />
    </div>
  );
};