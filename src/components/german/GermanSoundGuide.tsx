import React from 'react';
import { X, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { speakGerman } from '../../utils/germanAudio';

interface GermanSoundGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SoundRule {
  symbol: string;
  arabicName: string;
  ruleExplanationAr: string;
  exampleDe: string;
  examplePhoneticAr: string;
  exampleMeaningAr: string;
}

export const GERMAN_SOUND_RULES: SoundRule[] = [
  {
    symbol: 'ei',
    arabicName: 'آي (مفتوحة)',
    ruleExplanationAr: 'حرف E يتبعه I يُنطق دايماً مثل كلمة "آي!" مثل My الإنجليزية.',
    exampleDe: 'Nein (لا) / heiße (اسمي)',
    examplePhoneticAr: 'ناين / هايسه',
    exampleMeaningAr: 'لا / اسمي'
  },
  {
    symbol: 'ie',
    arabicName: 'إي (ممدودة)',
    ruleExplanationAr: 'حرف I يتبعه E يُنطق ياء ممدودة مثل See بالإنجليزي.',
    exampleDe: 'Sie (حضرتك) / wie (كيف)',
    examplePhoneticAr: 'زي / في',
    exampleMeaningAr: 'أنت / كيف'
  },
  {
    symbol: 'sch',
    arabicName: 'ش (صريحة)',
    ruleExplanationAr: 'الثلاث حروف sch تُنطق حرف "شين" مشدد وصريح جداً.',
    exampleDe: 'Schule (مدرسة) / schnell (سريع)',
    examplePhoneticAr: 'شوله / شنيل',
    exampleMeaningAr: 'مدرسة / سريع'
  },
  {
    symbol: 'ch',
    arabicName: 'خ أو ش خفيفة',
    ruleExplanationAr: 'تنطق "خ" بعد a, o, u (مثل Buch) وتُنطق "ش خفيفة" بعد e, i (مثل Ich).',
    exampleDe: 'Buch (كتاب) / Ich (أنا)',
    examplePhoneticAr: 'بوخ / إيخ',
    exampleMeaningAr: 'كتاب / أنا'
  },
  {
    symbol: 'w',
    arabicName: 'ڤ (V English)',
    ruleExplanationAr: 'حرف W في الألماني يُنطق حرف "ڤ" (V) دائماً وليس واو!',
    exampleDe: 'Wasser (ماء) / wo (أين)',
    examplePhoneticAr: 'ڤاسر / ڤو',
    exampleMeaningAr: 'ماء / أين'
  },
  {
    symbol: 'v',
    arabicName: 'ف (F English)',
    ruleExplanationAr: 'حرف V في الألماني يُنطق حرف "فاء" (F) دائماً وليس ڤ!',
    exampleDe: 'Vater (أب) / viel (كثير)',
    examplePhoneticAr: 'فاتر / فيل',
    exampleMeaningAr: 'أب / كثير'
  },
  {
    symbol: 'z',
    arabicName: 'تس (TS)',
    ruleExplanationAr: 'حرف Z بالألماني يُنطق مركّب "تس" دائماً مثل Cats.',
    exampleDe: 'Zucker (سكر) / zusammen (معاً)',
    examplePhoneticAr: 'تسوكر / تسوزامن',
    exampleMeaningAr: 'سكر / معاً'
  },
  {
    symbol: 's',
    arabicName: 'ز (قبل المتحرك)',
    ruleExplanationAr: 'حرف S قبل الحروف المتحركة يُنطق "زاي" ز مثل Zero.',
    exampleDe: 'Sonne (شمس) / sagen (يقول)',
    examplePhoneticAr: 'زونه / زاجن',
    exampleMeaningAr: 'شمس / يقول'
  },
  {
    symbol: 'ä / ö / ü',
    arabicName: 'الأوملاوت (Umlaut)',
    ruleExplanationAr: 'النقطتان تغيران الصوت: ä (إيه ممدودة)، ö (بين الأو والإي)، ü (بين الأو والياء).',
    exampleDe: 'Mädchen / schön / über',
    examplePhoneticAr: 'ميدخين / شون / أُوبر',
    exampleMeaningAr: 'بنت / جميل / عن'
  },
  {
    symbol: 'ß',
    arabicName: 'إس تسِت (SS)',
    ruleExplanationAr: 'حرف خاص بالألماني يُنطق سين مشددة ss.',
    exampleDe: 'groß (كبير) / heiße (اسمي)',
    examplePhoneticAr: 'جروس / هايسه',
    exampleMeaningAr: 'كبير / اسمي'
  }
];

export function GermanSoundGuide({ isOpen, onClose }: GermanSoundGuideProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in transition-all"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sound-guide-title"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-surface text-text shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 id="sound-guide-title" className="text-base sm:text-lg font-black text-text">
                دليل نطق الألمانية المباشر (الشفرات الست)
              </h3>
              <p className="text-xs text-muted font-bold mt-0.5">
                اضغط على أي صوت لسماع نطقه بالألمانية بالفم والصوت الطبيعي 🔊
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 text-start">
          {GERMAN_SOUND_RULES.map((rule) => (
            <div
              key={rule.symbol}
              className="p-3.5 rounded-2xl border border-border bg-surface-2 hover:border-amber-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-xl text-sm font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono"
                    dir="ltr"
                  >
                    {rule.symbol}
                  </span>
                  <span className="text-xs font-black text-text">
                    ← ينطق: <span className="text-amber-400">{rule.arabicName}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => speakGerman(rule.exampleDe, 0.75)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="استمع للنطق البطيء الواضح"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>اسمع</span>
                </button>
              </div>

              <p className="text-xs text-muted font-medium leading-relaxed">
                {rule.ruleExplanationAr}
              </p>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-text/90">
                <span dir="ltr" className="font-bold text-amber-300">
                  {rule.exampleDe}
                </span>
                <span className="text-muted text-[11px] font-semibold">
                  ({rule.examplePhoneticAr}) = {rule.exampleMeaningAr}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface-2 text-center text-xs font-bold text-muted flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>الألمانية لغة صوتية بنسبة ٩٥٪ — اعرف القاعدة وهتنطق أي كلمة صح من أول مرة!</span>
        </div>
      </div>
    </div>
  );
}
