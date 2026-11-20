export interface NameSoundTile {
  arChar: string;
  enLetter: string;
  hintAr: string;
}

const EGYPTIAN_NAME_OVERRIDES: Record<string, string> = {
  عمرو: 'AMR',
  شريف: 'SHERIF',
  محمد: 'MOHAMED',
  أحمد: 'AHMED',
  احمد: 'AHMED',
  محمود: 'MAHMOUD',
  مصطفى: 'MOSTAFA',
  يوسف: 'YOUSSEF',
  إبراهيم: 'IBRAHIM',
  ابراهيم: 'IBRAHIM',
  فاطمة: 'FATMA',
  مريم: 'MARIAM',
  سارة: 'SARA',
  ساره: 'SARA',
  نور: 'NOUR',
  حبيبة: 'HABIBA',
  ملك: 'MALAK',
};

const CHAR_MAP: Record<string, { en: string; hintAr: string }> = {
  أ: { en: 'A', hintAr: 'فتحة خفيفة مثل "أهلاً"' },
  ا: { en: 'A', hintAr: 'مد خفيف واضح' },
  إ: { en: 'E', hintAr: 'كسرة خفيفة في البداية' },
  ع: { en: 'A', hintAr: 'تُكتب غالباً A في الأسماء بالإنجليزي' },
  ب: { en: 'B', hintAr: 'صوت الباء من الشفتين' },
  ت: { en: 'T', hintAr: 'صوت التاء الخفيف' },
  ط: { en: 'T', hintAr: 'تُكتب T في الإنجليزية' },
  ث: { en: 'TH', hintAr: 'طرف اللسان بين الأسنان' },
  ج: { en: 'G', hintAr: 'الجيم المصرية القريبة من G' },
  ح: { en: 'H', hintAr: 'هواء خفيف مثل H' },
  خ: { en: 'KH', hintAr: 'صوت الخاء' },
  د: { en: 'D', hintAr: 'صوت الدال' },
  ض: { en: 'D', hintAr: 'تُكتب D في الإنجليزية' },
  ذ: { en: 'Z', hintAr: 'قريبة من Z أو TH' },
  ز: { en: 'Z', hintAr: 'صوت الزاي' },
  ظ: { en: 'Z', hintAr: 'تُكتب Z في الإنجليزية' },
  ر: { en: 'R', hintAr: 'صوت الراء' },
  س: { en: 'S', hintAr: 'صوت السين' },
  ص: { en: 'S', hintAr: 'صوت الصاد ويُكتب S' },
  ش: { en: 'SH', hintAr: 'صوت الشين الواضح' },
  غ: { en: 'GH', hintAr: 'تُكتب GH في الأسماء' },
  ف: { en: 'F', hintAr: 'صوت الفاء' },
  ق: { en: 'K', hintAr: 'تُكتب غالباً K أو Q' },
  ك: { en: 'K', hintAr: 'صوت الكاف' },
  ل: { en: 'L', hintAr: 'صوت اللام' },
  م: { en: 'M', hintAr: 'صوت الميم' },
  ن: { en: 'N', hintAr: 'صوت النون' },
  و: { en: 'O', hintAr: 'صوت الواو/الضم' },
  ي: { en: 'Y', hintAr: 'صوت الياء' },
  ى: { en: 'A', hintAr: 'ألف لينة في آخر الاسم' },
  ة: { en: 'A', hintAr: 'تاء مربوطة تُنطق A في آخر الاسم' },
  ه: { en: 'H', hintAr: 'هاء خفيفة' },
  ةـ: { en: 'A', hintAr: 'تاء مربوطة' },
};

export function forgeEnglishName(rawInput: string) {
  const cleaned = rawInput.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return { englishName: '', tiles: [] as NameSoundTile[] };
  }

  const tiles: NameSoundTile[] = [];
  for (const ch of cleaned) {
    if (ch === ' ') continue;
    const mapped = CHAR_MAP[ch] ?? { en: 'A', hintAr: 'حرف صوتي مساعد' };
    tiles.push({
      arChar: ch,
      enLetter: mapped.en,
      hintAr: mapped.hintAr,
    });
  }

  const override = EGYPTIAN_NAME_OVERRIDES[cleaned];
  const fallbackName = tiles.map((t) => t.enLetter).join('');

  return {
    englishName: override ?? fallbackName,
    tiles,
  };
}

export interface TransliterationTile {
  arabicChar: string;
  englishChunk: string;
  phoneticHintAr: string;
}

export interface TransliterationResult {
  original: string;
  assembled: string;
  tiles: TransliterationTile[];
}

export function transliterateName(arabicName: string): TransliterationResult {
  const forged = forgeEnglishName(arabicName);
  return {
    original: arabicName.trim(),
    assembled: forged.englishName,
    tiles: forged.tiles.map((t) => ({
      arabicChar: t.arChar,
      englishChunk: t.enLetter,
      phoneticHintAr: t.hintAr,
    })),
  };
}
