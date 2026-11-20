import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DualSpeedAudio } from './DualSpeedAudio';
import { triggerHapticImpact } from '../utils/fx';

interface NameForgeProps {
  onComplete: (forgedName: string) => void;
}

const COMMON_NAMES: Record<string, { en: string; chunks: string[] }> = {
  'محمد': { en: 'Mohamed', chunks: ['Mo', 'ha', 'med'] },
  'احمد': { en: 'Ahmed', chunks: ['Ah', 'med'] },
  'أحمد': { en: 'Ahmed', chunks: ['Ah', 'med'] },
  'عمرو': { en: 'Amr', chunks: ['Am', 'r'] },
  'عمر': { en: 'Omar', chunks: ['O', 'mar'] },
  'يوسف': { en: 'Youssef', chunks: ['Yous', 'sef'] },
  'مصطفي': { en: 'Mostafa', chunks: ['Mos', 'ta', 'fa'] },
  'مصطفى': { en: 'Mostafa', chunks: ['Mos', 'ta', 'fa'] },
  'محمود': { en: 'Mahmoud', chunks: ['Mah', 'moud'] },
  'علي': { en: 'Ali', chunks: ['A', 'li'] },
  'حسن': { en: 'Hassan', chunks: ['Has', 'san'] },
  'حسين': { en: 'Hussein', chunks: ['Hus', 'sein'] },
  'كريم': { en: 'Karim', chunks: ['Ka', 'rim'] },
  'خالد': { en: 'Khaled', chunks: ['Kha', 'led'] },
  'طارق': { en: 'Tarek', chunks: ['Ta', 'rek'] },
  'ابراهيم': { en: 'Ibrahim', chunks: ['Ib', 'ra', 'him'] },
  'إبراهيم': { en: 'Ibrahim', chunks: ['Ib', 'ra', 'him'] },
  'عبدالرحمن': { en: 'Abdelrahman', chunks: ['Abdel', 'rah', 'man'] },
  'عبد الرحمن': { en: 'Abdelrahman', chunks: ['Abdel', 'rah', 'man'] },
  'عبدالله': { en: 'Abdallah', chunks: ['Ab', 'dal', 'lah'] },
  'عبد الله': { en: 'Abdallah', chunks: ['Ab', 'dal', 'lah'] },
  'زياد': { en: 'Ziad', chunks: ['Zi', 'ad'] },
  'سيف': { en: 'Seif', chunks: ['Se', 'if'] },
  'ادم': { en: 'Adam', chunks: ['A', 'dam'] },
  'آدم': { en: 'Adam', chunks: ['A', 'dam'] },
  'مروان': { en: 'Marwan', chunks: ['Mar', 'wan'] },
  'شريف': { en: 'Sherif', chunks: ['She', 'rif'] },
  'وليد': { en: 'Walid', chunks: ['Wa', 'lid'] },
  'هشام': { en: 'Hesham', chunks: ['He', 'sham'] },
  'ايمن': { en: 'Ayman', chunks: ['Ay', 'man'] },
  'أيمن': { en: 'Ayman', chunks: ['Ay', 'man'] },
  'ساره': { en: 'Sara', chunks: ['Sa', 'ra'] },
  'سارة': { en: 'Sara', chunks: ['Sa', 'ra'] },
  'مريم': { en: 'Mariam', chunks: ['Ma', 'riam'] },
  'فاطمه': { en: 'Fatma', chunks: ['Fat', 'ma'] },
  'فاطمة': { en: 'Fatma', chunks: ['Fat', 'ma'] },
  'نور': { en: 'Nour', chunks: ['No', 'ur'] },
  'سلمي': { en: 'Salma', chunks: ['Sal', 'ma'] },
  'سلمى': { en: 'Salma', chunks: ['Sal', 'ma'] },
  'ياسمين': { en: 'Yasmine', chunks: ['Yas', 'mine'] },
  'منه': { en: 'Menna', chunks: ['Men', 'na'] },
  'منة': { en: 'Menna', chunks: ['Men', 'na'] },
  'هبه': { en: 'Heba', chunks: ['He', 'ba'] },
  'هبة': { en: 'Heba', chunks: ['He', 'ba'] },
  'دينا': { en: 'Dina', chunks: ['Di', 'na'] },
  'ندي': { en: 'Nada', chunks: ['Na', 'da'] },
  'ندى': { en: 'Nada', chunks: ['Na', 'da'] },
  'رنا': { en: 'Rana', chunks: ['Ra', 'na'] },
  'ملك': { en: 'Malak', chunks: ['Ma', 'lak'] },
  'حبيبه': { en: 'Habiba', chunks: ['Ha', 'bi', 'ba'] },
  'حبيبة': { en: 'Habiba', chunks: ['Ha', 'bi', 'ba'] },
  'ايه': { en: 'Aya', chunks: ['A', 'ya'] },
  'آية': { en: 'Aya', chunks: ['A', 'ya'] },
  'اسراء': { en: 'Esraa', chunks: ['Es', 'raa'] },
  'إسراء': { en: 'Esraa', chunks: ['Es', 'raa'] },
  'اميره': { en: 'Amira', chunks: ['A', 'mi', 'ra'] },
  'أميرة': { en: 'Amira', chunks: ['A', 'mi', 'ra'] },
  'مي': { en: 'Mai', chunks: ['Ma', 'i'] },
  'هاجر': { en: 'Hagar', chunks: ['Ha', 'gar'] },
  'شهد': { en: 'Shahd', chunks: ['Sha', 'hd'] },
  'جني': { en: 'Jana', chunks: ['Ja', 'na'] },
  'جنة': { en: 'Jana', chunks: ['Ja', 'na'] },
  'ليلي': { en: 'Laila', chunks: ['Lai', 'la'] },
  'ليلى': { en: 'Laila', chunks: ['Lai', 'la'] },
  'تامر': { en: 'Tamer', chunks: ['Ta', 'mer'] },
  'ياسين': { en: 'Yassin', chunks: ['Yas', 'sin'] },
  'بلال': { en: 'Bilal', chunks: ['Bi', 'lal'] },
  'حمزة': { en: 'Hamza', chunks: ['Ham', 'za'] },
  'مازن': { en: 'Mazen', chunks: ['Ma', 'zen'] },
  'إياد': { en: 'Eyad', chunks: ['Ey', 'ad'] },
  'فارس': { en: 'Fares', chunks: ['Fa', 'res'] },
  'حازم': { en: 'Hazem', chunks: ['Ha', 'zem'] },
  'إسلام': { en: 'Islam', chunks: ['Is', 'lam'] },
  'حسام': { en: 'Hossam', chunks: ['Hos', 'sam'] },
  'جمال': { en: 'Gamal', chunks: ['Ga', 'mal'] },
  'سامح': { en: 'Sameh', chunks: ['Sa', 'meh'] },
  'أشرف': { en: 'Ashraf', chunks: ['Ash', 'raf'] },
  'عادل': { en: 'Adel', chunks: ['A', 'del'] },
  'أسامة': { en: 'Osama', chunks: ['O', 'sa', 'ma'] },
  'رامي': { en: 'Rami', chunks: ['Ra', 'mi'] },
  'مينا': { en: 'Mina', chunks: ['Mi', 'na'] },
  'جورج': { en: 'George', chunks: ['Ge', 'orge'] },
  'بيتر': { en: 'Peter', chunks: ['Pe', 'ter'] },
  'مارينا': { en: 'Marina', chunks: ['Ma', 'ri', 'na'] },
  'يارا': { en: 'Yara', chunks: ['Ya', 'ra'] },
  'فرح': { en: 'Farah', chunks: ['Fa', 'rah'] },
  'ريم': { en: 'Reem', chunks: ['Re', 'em'] },
  'نورهان': { en: 'Nourhan', chunks: ['Nour', 'han'] },
  'دعاء': { en: 'Doaa', chunks: ['Do', 'aa'] },
  'إيمان': { en: 'Eman', chunks: ['E', 'man'] },
  'أسماء': { en: 'Asmaa', chunks: ['As', 'maa'] },
  'روان': { en: 'Rawan', chunks: ['Ra', 'wan'] },
  'بسمة': { en: 'Basma', chunks: ['Bas', 'ma'] },
  'غادة': { en: 'Ghada', chunks: ['Gha', 'da'] },
  'هدى': { en: 'Hoda', chunks: ['Ho', 'da'] },
  'مها': { en: 'Maha', chunks: ['Ma', 'ha'] },
  'منى': { en: 'Mona', chunks: ['Mo', 'na'] },
  'علا': { en: 'Ola', chunks: ['O', 'la'] },
  'سمر': { en: 'Samar', chunks: ['Sa', 'mar'] },
  'شيماء': { en: 'Shaimaa', chunks: ['Shai', 'maa'] }
};

const NORMALIZED_NAMES: Record<string, { en: string; chunks: string[] }> = Object.fromEntries(
  Object.entries(COMMON_NAMES).map(([k, v]) => [normalizeArabic(k), v])
);

const AR_TO_EN_FALLBACK: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'g', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'k', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 'a', 'و': 'o', 'ي': 'y', 'ى': 'a'
};

function normalizeArabic(str: string): string {
  return str
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

function resolveEnglishName(raw: string): { en: string; chunks: string[] } {
  const norm = normalizeArabic(raw);
  if (NORMALIZED_NAMES[norm]) {
    return NORMALIZED_NAMES[norm];
  }
  let roman = '';
  for (const ch of norm) {
    roman += AR_TO_EN_FALLBACK[ch] || ch;
  }
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let processed = '';
  for (let i = 0; i < roman.length; i++) {
    processed += roman[i];
    if (
      i < roman.length - 1 &&
      !vowels.has(roman[i].toLowerCase()) &&
      !vowels.has(roman[i + 1].toLowerCase()) &&
      roman[i] !== ' ' && roman[i + 1] !== ' '
    ) {
      processed += 'a';
    }
  }
  const capitalized = processed.charAt(0).toUpperCase() + processed.slice(1).toLowerCase();
  const chunks: string[] = [];
  for (let i = 0; i < capitalized.length; i += 3) {
    chunks.push(capitalized.slice(i, i + 3));
  }
  if (chunks.length === 0) chunks.push(capitalized || 'Friend');
  return { en: capitalized || 'Friend', chunks };
}

export function NameForge({ onComplete }: NameForgeProps) {
  const [nameInput, setNameInput] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [resolved, setResolved] = useState<{ en: string; chunks: string[] } | null>(null);
  const [scrambledTiles, setScrambledTiles] = useState<{ id: number; chunk: string }[]>([]);
  const [assembledTiles, setAssembledTiles] = useState<{ id: number; chunk: string }[]>([]);

  const quickChips = ['محمد', 'أحمد', 'عمرو', 'سارة', 'مريم', 'يوسف'];

  const handleSelectName = (name: string) => {
    setNameInput(name);
    setResolved(resolveEnglishName(name));
  };

  const handleInputChange = (val: string) => {
    setNameInput(val);
    if (val.trim()) {
      setResolved(resolveEnglishName(val));
    } else {
      setResolved(null);
    }
  };

  const startPuzzle = () => {
    if (!resolved) return;
    const tiles = resolved.chunks.map((c, i) => ({ id: i, chunk: c }));
    const decoyChunk = resolved.chunks.some(c => c.toLowerCase() === 'ka') ? 'zo' : 'ka';
    const decoy = { id: 99, chunk: decoyChunk };
    const scrambled = [...tiles, decoy].sort(() => Math.random() - 0.5);
    setScrambledTiles(scrambled);
    setAssembledTiles([]);
    setStep(2);
  };

  const handleTileClick = (tile: { id: number; chunk: string }) => {
    triggerHapticImpact();
    setScrambledTiles(prev => prev.filter(t => t.id !== tile.id));
    setAssembledTiles(prev => [...prev, tile]);
  };

  const handleAssembledTileClick = (tile: { id: number; chunk: string }) => {
    triggerHapticImpact();
    setAssembledTiles(prev => prev.filter(t => t.id !== tile.id));
    setScrambledTiles(prev => [...prev, tile]);
  };

  const handleResetTiles = () => {
    if (!resolved) return;
    const tiles = resolved.chunks.map((c, i) => ({ id: i, chunk: c }));
    const decoyChunk = resolved.chunks.some(c => c.toLowerCase() === 'ka') ? 'zo' : 'ka';
    const decoy = { id: 99, chunk: decoyChunk };
    setScrambledTiles([...tiles, decoy].sort(() => Math.random() - 0.5));
    setAssembledTiles([]);
  };

  const isCompleted = resolved && assembledTiles.map(t => t.chunk).join('').toLowerCase() === resolved.en.toLowerCase();

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0B1C33] rounded-3xl p-6 border-2 border-amber-400/60 text-center shadow-2xl" dir="rtl">
      <h2 className="text-xl font-black text-amber-400 mb-1">✨ مصنع الاسم بالإنجليزي</h2>
      <p className="text-xs text-slate-300 mb-5">اكتب اسمك بالعربي وتعلّم تنطقه بالإنجليزي في ثوانٍ معدودة.</p>

      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            value={nameInput}
            onChange={e => handleInputChange(e.target.value)}
            className="w-full p-4 text-center rounded-2xl bg-[#061224] border border-cyan-500/40 text-white text-lg focus:border-amber-400 outline-none font-bold"
            placeholder="مثلاً: محمد، سارة، عمرو..."
          />
          <div className="flex justify-center gap-2 flex-wrap">
            {quickChips.map(n => (
              <button
                key={n}
                onClick={() => handleSelectName(n)}
                className="px-3.5 py-1.5 bg-[#061224] hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-300 transition cursor-pointer"
              >
                {n}
              </button>
            ))}
          </div>

          {resolved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-500/40 space-y-3">
              <span className="text-xs text-amber-300 font-bold block">اسمك بالإنجليزي:</span>
              <div className="text-2xl font-black text-white font-sans tracking-wide" dir="ltr">
                {resolved.en}
              </div>
              <div className="flex justify-center">
                <DualSpeedAudio text={resolved.en} showLabels={true} />
              </div>
              <button
                onClick={startPuzzle}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 cursor-pointer mt-2"
              >
                يلا نركّب اسمك بالإنجليزي ←
              </button>
            </motion.div>
          )}
        </div>
      )}

      {step === 2 && resolved && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#061224] border border-cyan-500/30 space-y-2">
            <span className="text-xs text-slate-400">رتب المقاطع لتكوين الاسم:</span>
            <div className="flex flex-wrap justify-center gap-2 min-h-[54px] p-3 bg-stone-950 rounded-xl items-center cursor-pointer" dir="ltr">
              {assembledTiles.length === 0 ? (
                <span className="text-xs text-slate-500 font-sans">Tap tiles below...</span>
              ) : (
                assembledTiles.map(t => (
                  <motion.div
                    layoutId={`tile-${t.id}`}
                    key={t.id}
                    onClick={() => handleAssembledTileClick(t)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl text-slate-950 font-black text-lg cursor-pointer hover:opacity-80 transition"
                    title="Click to return"
                  >
                    {t.chunk}
                  </motion.div>
                ))
              )}
            </div>
            <div className="flex justify-between items-center px-1 pt-1">
              <span className="text-[10px] text-slate-400">اضغط على أي مقطع لرجوعه</span>
              <button
                onClick={handleResetTiles}
                className="text-xs text-amber-300 hover:underline font-bold cursor-pointer"
              >
                إعادة ترتيب ↺
              </button>
            </div>
          </div>

          {!isCompleted ? (
            <div className="flex flex-wrap justify-center gap-2.5" dir="ltr">
              {scrambledTiles.map(t => (
                <motion.button
                  layoutId={`tile-${t.id}`}
                  key={t.id}
                  onClick={() => handleTileClick(t)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 rounded-xl text-white font-black text-lg transition cursor-pointer shadow-md"
                >
                  {t.chunk}
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 space-y-3">
              <h3 className="text-lg font-black text-emerald-300">🎉 أول جملة إنجليزي ليك!</h3>
              <p className="text-base font-bold text-white font-sans" dir="ltr">
                "My name is {resolved.en}"
              </p>
              <div className="flex justify-center">
                <DualSpeedAudio text={`My name is ${resolved.en}`} showLabels={true} />
              </div>
              <button
                onClick={() => onComplete(resolved.en)}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm shadow-lg hover:bg-emerald-400 transition cursor-pointer mt-2"
              >
                كمل على الدرس الأول (+50 XP) 🚀
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
