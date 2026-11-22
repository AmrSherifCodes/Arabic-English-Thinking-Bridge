import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { soundFX } from '../utils/soundFX';

interface DemoDrill {
  ar: string;
  en: string;
  chips: string[];
  explanationAr: string;
  explanationEn: string;
}

const DEMO_DRILLS: DemoDrill[] = [
  {
    ar: 'أنا مهندس',
    en: 'I am an engineer',
    chips: ['I', 'am', 'an', 'engineer', 'is', 'a'],
    explanationAr: 'الكوبولا (am) هي فعل الربط الواصل بين المبتدأ والخبر غير الموجود في الاسمية العربية.',
    explanationEn: 'The copula (am) links subject and predicate, omitted in Arabic nominal sentences.',
  },
  {
    ar: 'هو طالب',
    en: 'He is a student',
    chips: ['He', 'is', 'a', 'student', 'am', 'an'],
    explanationAr: 'أداة النكرة (a) ضرورية قبل الأسماء المفردة المعدودة بالإنجليزي.',
    explanationEn: 'The indefinite article (a) is mandatory before singular countable nouns.',
  },
  {
    ar: 'هي جاهزة',
    en: 'She is ready',
    chips: ['She', 'is', 'ready', 'are', 'a'],
    explanationAr: 'الصفة للإنجليزي بتحتاج فعل ربط (is) قبلها بعكس العربية.',
    explanationEn: 'English adjectives require a linking verb (is) unlike Arabic.',
  },
];

export function LandingPhoneMockup({ isArabic = true }: { isArabic?: boolean }) {
  const [drillIndex, setDrillIndex] = useState(0);
  const currentDrill = DEMO_DRILLS[drillIndex];

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [availableChips, setAvailableChips] = useState<string[]>(() => [...currentDrill.chips].sort(() => Math.random() - 0.5));
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChipClick = (chip: string, index: number) => {
    soundFX.playChipSelect();
    const newSelected = [...selectedChips, chip];
    const newAvailable = availableChips.filter((_, i) => i !== index);

    setSelectedChips(newSelected);
    setAvailableChips(newAvailable);

    const formedSentence = newSelected.join(' ');
    if (formedSentence === currentDrill.en) {
      soundFX.playCorrect();
      setIsSuccess(true);
    }
  };

  const handleRemoveChip = (chip: string, index: number) => {
    soundFX.playChipSelect();
    const newSelected = selectedChips.filter((_, i) => i !== index);
    setSelectedChips(newSelected);
    setAvailableChips([...availableChips, chip]);
    setIsSuccess(false);
  };

  const handleReset = () => {
    soundFX.playChipSelect();
    setSelectedChips([]);
    setAvailableChips([...currentDrill.chips].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
  };

  const handleNextDrill = () => {
    soundFX.playChipSelect();
    const nextIdx = (drillIndex + 1) % DEMO_DRILLS.length;
    setDrillIndex(nextIdx);
    setSelectedChips([]);
    setAvailableChips([...DEMO_DRILLS[nextIdx].chips].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] rounded-[40px] border-[8px] border-[#1E293B] bg-[#0F172A] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-white font-arabic">
      {/* Notch & Speaker */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1E293B] rounded-b-xl z-20 flex items-center justify-center">
        <div className="w-8 h-1 bg-[#334155] rounded-full"></div>
      </div>

      {/* Screen Content */}
      <div className="pt-6 pb-2 space-y-4">
        {/* App Title & Level */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-stone-800 pb-2 px-1 text-xs">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold">
            <Sparkles size={14} />
            <span>{isArabic ? 'فكّر بالإنجليزي · معاينة حية' : 'Thinking Bridge · Live Demo'}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-mono text-[10px] font-bold">
            A0 - Copula Bridge
          </span>
        </div>

        {/* Prompt Card */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-stone-700/60 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-teal-400 font-bold block">
            {isArabic ? 'الجملة العربية (الفكرة الأصلية)' : 'Arabic Thought'}
          </span>
          <div className="flex items-center justify-center gap-2 text-xl font-black text-cyan-300" dir="rtl">
            <span>"{currentDrill.ar}"</span>
            <button
              onClick={() => soundFX.playChipSelect()}
              className="p-1 rounded-full bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              aria-label="استمع"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>

        {/* Constructed Target Sentence Slot */}
        <div className="min-h-[56px] p-2.5 rounded-2xl bg-[#020617] border border-stone-800 flex flex-wrap items-center justify-center gap-1.5 transition-all">
          {selectedChips.length === 0 ? (
            <span className="text-xs text-stone-500 italic">
              {isArabic ? 'اضغط الكلمات بالترتيب الإنجليزي الصحيح...' : 'Tap words in correct English order...'}
            </span>
          ) : (
            selectedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveChip(chip, idx)}
                className="px-3 py-1.5 rounded-xl bg-teal-500 text-stone-950 font-bold text-xs shadow hover:bg-teal-400 active:scale-95 transition"
              >
                {chip}
              </button>
            ))
          )}
        </div>

        {/* Success Feedback Banner */}
        {isSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 size={16} />
              <span>{isArabic ? 'ممتاز! التركيب التفكيري صحيح 100%' : 'Perfect! Structural mapping 100%'}</span>
            </div>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed font-sans">
              {isArabic ? currentDrill.explanationAr : currentDrill.explanationEn}
            </p>
          </div>
        )}

        {/* Available Word Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {availableChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip, idx)}
              disabled={isSuccess}
              className="px-3.5 py-1.5 rounded-xl bg-[#334155] border border-stone-600 text-stone-100 font-bold text-xs hover:bg-[#475569] active:scale-95 transition disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-stone-400 hover:text-white transition font-bold"
          >
            <RotateCcw size={14} />
            <span>{isArabic ? 'إعادة' : 'Reset'}</span>
          </button>

          <button
            onClick={handleNextDrill}
            className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[11px] transition active:scale-95 shadow-md shadow-cyan-500/20"
          >
            {isArabic ? 'تمرين آخر ⚡' : 'Next Demo ⚡'}
          </button>
        </div>
      </div>
    </div>
  );
}
