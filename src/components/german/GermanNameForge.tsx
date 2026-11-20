import React, { useState } from 'react';
import { Sparkles, Volume2, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakGerman } from '../../utils/germanAudio';

interface GermanNameForgeProps {
  onComplete: (germanName: string, xpEarned: number) => void;
}

/**
 * Maps Arabic names to German phonetic equivalents and highlights German letter sounds.
 */
function mapArabicNameToGerman(arabicName: string): { germanName: string; soundNotesAr: string[] } {
  const trimmed = arabicName.trim();
  if (!trimmed) {
    return {
      germanName: 'Amr',
      soundNotesAr: ['حرف A يُنطق مفتوحاً مثل "أمـر"'],
    };
  }

  const nameMap: Record<string, { de: string; notes: string[] }> = {
    'عمرو': { de: 'Amr', notes: ['حرف A مفتوح صريح بدون عين صعبة.'] },
    'محمد': { de: 'Mohamed', notes: ['حرف J ينطق ياء، فتصاير Mohamed أو Mohammad.'] },
    'مريم': { de: 'Mariam', notes: ['حرف R مرقق خفيف بأعلى الحلق.'] },
    'سارة': { de: 'Sarah', notes: ['حرف S قبل المتحرك ينطق "زاي" زاره أو Sarah.'] },
    'أحمد': { de: 'Ahmed', notes: ['حرف h ينطق هاء خفيفة وصريحة.'] },
    'علي': { de: 'Ali', notes: ['ينطق ألي بحرف A صريح.'] },
    'عمر': { de: 'Omar', notes: ['ينطق أومار بحرف O صريح.'] },
    'فاطمة': { de: 'Fatima', notes: ['تكتب وتنطق فتيما بأعلى درجات الوضوح.'] },
    'ياسمين': { de: 'Jasmine', notes: ['حرف J ينطق ياء دائماً بالالمانية: ياسـمين!'] },
    'شريف': { de: 'Scherif', notes: ['تكتب SCH لتنطق "شين" صريحة Scherif!'] },
  };

  if (nameMap[trimmed]) {
    return {
      germanName: nameMap[trimmed].de,
      soundNotesAr: nameMap[trimmed].notes,
    };
  }

  // General transliteration rules
  let deName = trimmed
    .replace(/ش/g, 'Sch')
    'خ'.split('').forEach(() => {})
  deName = deName
    .replace(/خ/g, 'Ch')
    .replace(/ج/g, 'Dsch')
    .replace(/ي/g, 'J')
    .replace(/ع/g, 'A')
    .replace(/ح/g, 'H');

  return {
    germanName: deName || trimmed,
    soundNotesAr: ['حرف SCH ينطق ش، و CH ينطق خ، و J ينطق ياء!'],
  };
}

export function GermanNameForge({ onComplete }: GermanNameForgeProps) {
  const [arabicInput, setArabicInput] = useState('');
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const { germanName, soundNotesAr } = mapArabicNameToGerman(arabicInput || 'عمرو');

  const targetSentence = `Hallo, ich heiße ${germanName}!`;
  const targetTokens = ['Hallo,', 'ich', 'heiße', `${germanName}!`];

  // Scrambled pool
  const allPoolTokens = ['heiße', 'Hallo,', `${germanName}!`, 'ich', 'bin', 'ist']
    .sort(() => (germanName.length % 2 === 0 ? 0.5 : -0.5));

  const handleAddToken = (token: string) => {
    if (assembledTokens.includes(token)) return;
    const next = [...assembledTokens, token];
    setAssembledTokens(next);

    if (next.join(' ') === targetTokens.join(' ')) {
      setIsCompleted(true);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
    }
  };

  const handleReset = () => {
    setAssembledTokens([]);
    setIsCompleted(false);
  };

  const handleFinishStep = () => {
    onComplete(germanName, 50);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-amber-500/30 bg-surface text-text shadow-xl space-y-6 text-start" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <Sparkles className="w-6 h-6" />
        </span>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-text">
            🇩🇪 مصنع اسمك بالألمانية (Name Forge)
          </h3>
          <p className="text-xs text-muted font-bold mt-0.5">
            اكتب اسمك بالعربي وشوف بيتنطق وينكتب إزاي بالألماني مع الشفرة الصوتية!
          </p>
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-text">
          اكتب اسمك بالعربي:
        </label>
        <input
          type="text"
          value={arabicInput}
          onChange={(e) => {
            setArabicInput(e.target.value);
            handleReset();
          }}
          placeholder="مثال: عمرو، شريف، مريم، ياسمين"
          className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-2 text-text font-bold text-sm focus:outline-none focus:border-amber-500 transition-all"
        />
      </div>

      {/* German Phonetic Name Display */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-400">اسمك بالألمانية:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => speakGerman(`Hallo, ich heiße ${germanName}!`, 1.0)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs shadow-md flex items-center gap-1.5 hover:bg-amber-400 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>1.0x</span>
            </button>
            <button
              type="button"
              onClick={() => speakGerman(`Hallo, ich heiße ${germanName}!`, 0.75)}
              className="px-3 py-1.5 rounded-xl bg-surface border border-amber-500/40 text-amber-300 font-black text-xs shadow-md flex items-center gap-1.5 hover:bg-surface-2 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>0.75x بطيء</span>
            </button>
          </div>
        </div>

        <div className="text-2xl font-black text-text tracking-wide font-mono" dir="ltr" lang="de">
          Hallo, ich heiße <span className="text-amber-400 underline decoration-amber-400">{germanName}</span>!
        </div>

        <div className="space-y-1 text-xs text-muted font-medium pt-1 border-t border-amber-500/20">
          {soundNotesAr.map((note, idx) => (
            <p key={idx}>💡 {note}</p>
          ))}
        </div>
      </div>

      {/* Assembly Mini-Game */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-text">
            ركّب جملة التقديم بنفسك بالألمانية:
          </span>
          {assembledTokens.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted hover:text-text flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة ترتيب</span>
            </button>
          )}
        </div>

        {/* Assembly Slot */}
        <div className="min-h-[56px] p-3 rounded-2xl border-2 border-dashed border-border bg-surface-2 flex items-center flex-wrap gap-2" dir="ltr">
          {assembledTokens.length === 0 ? (
            <span className="text-xs text-muted font-bold italic">
              اضغط الكلمات بالترتيب الصحيح لتكوين الجملة...
            </span>
          ) : (
            assembledTokens.map((token, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-sm shadow-md animate-in zoom-in-95 font-mono"
              >
                {token}
              </span>
            ))
          )}
        </div>

        {/* Word Chips Pool */}
        <div className="flex items-center flex-wrap gap-2 pt-1" dir="ltr">
          {allPoolTokens.map((token, idx) => {
            const isUsed = assembledTokens.includes(token);
            return (
              <button
                key={idx}
                type="button"
                disabled={isUsed}
                onClick={() => handleAddToken(token)}
                className={`px-3.5 py-2 rounded-xl text-sm font-black border transition-all font-mono ${
                  isUsed
                    ? 'opacity-30 border-border bg-surface-2 text-muted cursor-not-allowed'
                    : 'border-border bg-surface hover:border-amber-500 text-text shadow-sm hover:scale-105 active:scale-95'
                }`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>ممتاز! نطقك وتركيبك واسمك بالألماني مظبوط ١٠٠٪ (+50 XP) 🚀</span>
          </div>
          <button
            type="button"
            onClick={handleFinishStep}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm shadow-lg transition-all"
          >
            الانتقال للمرحلة التالية ←
          </button>
        </div>
      )}
    </div>
  );
}
