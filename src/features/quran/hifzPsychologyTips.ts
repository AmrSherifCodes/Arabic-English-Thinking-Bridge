// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

export interface HifzPsychologyTip {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  actionAr: string;
  actionEn: string;
}

export const HIFZ_PSYCHOLOGY_TIPS: ReadonlyArray<HifzPsychologyTip> = [
  {
    id: 'sleep-consolidation',
    icon: '🌙',
    titleAr: 'قاعدة تثبيت النوم (Sleep-Consolidation Rule)',
    titleEn: 'Sleep-Consolidation Rule',
    summaryAr:
      'احفظ ٣ آيات قبل النوم بـ ١٥ دقيقة، ثم راجعها بعد الفجر مباشرة حيث تبلغ كفاءة نقل الذاكرة في الحُصين ذروتها.',
    summaryEn:
      'Memorize 3 Ayahs 15 minutes before sleep, then review right after Fajr when hippocampal memory transfer peaks.',
    actionAr: 'اختم يومك بمقطع واحد قبل النوم وراجعه فور الاستيقاظ.',
    actionEn: 'End your night with one 3-Ayah chunk and review it after Fajr.',
  },
  {
    id: 'salah-lock',
    icon: '🕌',
    titleAr: 'طريقة القفل بالصلاة (Salah-Lock Method)',
    titleEn: 'Salah-Lock Method',
    summaryAr:
      'اقرأ الآيات التي حفظتها اليوم في صلواتك النافلة والسنن القادمة؛ فالاسترجاع داخل الصلاة يرسّخ الحفظ في الذاكرة طويلة المدى.',
    summaryEn:
      "Recite today's newly memorized Ayahs in your next Sunnah prayers to cement long-term recall under real focus.",
    actionAr: 'جرّب تمرين «ربط رؤوس الآيات» قبل أن تصلي بالآيات الجديدة.',
    actionEn: 'Run the Ayah-Bridge Chain drill right before praying with your new Ayahs.',
  },
  {
    id: 'two-minute-rule',
    icon: '🌱',
    titleAr: 'قاعدة الدقيقتين بلا ضغط (2-Minute Zero-Friction Rule)',
    titleEn: '2-Minute Zero-Friction Rule',
    summaryAr:
      'في أيام التعب أو الانشغال، التزم بآية واحدة فقط لتبقى عادة الحفظ متصلة دون انقطاع أو شعور بالتقصير.',
    summaryEn:
      'On low-energy or busy days, commit to just 1 Ayah so your daily Hifz identity habit stays unbroken.',
    actionAr: 'بدّل العرض إلى «آية واحدة» وكررها ٣ مرات مع الحصري.',
    actionEn: 'Switch chunk size to 1 Ayah and echo it 3 times with Al-Husary.',
  },
  {
    id: 'visual-page-anchor',
    icon: '📐',
    titleAr: 'قانون المرساة البصرية (Visual Page Anchor Law)',
    titleEn: 'Visual Page Anchor Law',
    summaryAr:
      'التزم بحجم خط واحد وتنسيق مصحف ثابت؛ لأن الذاكرة المكانية تربط موضع الآية بشكلها في السطر والصفحة.',
    summaryEn:
      'Stick to one consistent Mushaf layout and font size so spatial memory locks each verse position effortlessly.',
    actionAr: 'اختر حجم الخط المريح لك من الإعدادات وحافظ عليه دائماً.',
    actionEn: 'Pick your comfortable Mushaf font size once and keep it consistent.',
  },
  {
    id: 'emotional-meaning-anchor',
    icon: '💡',
    titleAr: 'مرساة المعنى والشعور (Emotional Meaning Anchor)',
    titleEn: 'Emotional Meaning Anchor',
    summaryAr:
      'اقرأ سطر التفسير الميسر قبل التكرار؛ فالجمل المفهومة المعنى تثبت في الدماغ أسرع بـ ٣ أضعاف من المقاطع المجردة.',
    summaryEn:
      'Read the 1-line Tafsir meaning before repeating—meaningful phrases stick 3x faster than raw syllables.',
    actionAr: 'فعّل «التفسير الميسر» لدقيقة واحدة قبل بدء التعتيم التدريجي.',
    actionEn: 'Toggle Tafsir Muyassar for one minute before starting Progressive Fade-Out.',
  },
];

export function getTipOfTheDay(nowMs = Date.now()): HifzPsychologyTip {
  const safeNow = Number.isFinite(nowMs) ? nowMs : Date.now();
  const dayIndex = Math.floor(Math.max(0, safeNow) / 86_400_000);
  return HIFZ_PSYCHOLOGY_TIPS[dayIndex % HIFZ_PSYCHOLOGY_TIPS.length];
}
