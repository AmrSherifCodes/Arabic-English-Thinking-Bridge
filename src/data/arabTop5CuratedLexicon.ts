/**
 * src/data/arabTop5CuratedLexicon.ts
 *
 * 100% Arabic-Explained Curated Lexicon for the Top 5 Languages in the Arab World:
 * 1. English (en)
 * 2. German (de)
 * 3. French (fr)
 * 4. Spanish (es)
 * 5. Turkish (tr) - Shared Egyptian/Arabic-Turkish bridge
 */

import type { PedagogicalStage } from '../features/preferences/usePreferences';

export interface CuratedLexiconEntry {
  id: string;
  lang: 'en' | 'de' | 'fr' | 'es' | 'tr';
  targetWord: string;
  arabicMeaning: string;
  arabicPhonetics: string;
  thinkingTipAr: string;
  emoji: string;
  ageTracks: PedagogicalStage[];
  cefr: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  category?: 'kids_basics' | 'school' | 'connectors' | 'street' | 'academic' | 'shared_roots';
}

export const ARAB_TOP_5_LEXICON: CuratedLexiconEntry[] = [
  // ==========================================
  // 1. ENGLISH (en)
  // ==========================================
  {
    id: 'en-a0-1',
    lang: 'en',
    targetWord: 'Hello',
    arabicMeaning: 'أهلاً / مرحباً / سلام عليكم',
    arabicPhonetics: 'هَالُّو',
    thinkingTipAr: '💡 ابدأ بيها أي محادثة في أي وقت في اليوم مع ابتسامة لطيفة.',
    emoji: '👋',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'en-a0-2',
    lang: 'en',
    targetWord: 'Cat',
    arabicMeaning: 'قطة / بسة',
    arabicPhonetics: 'كَاتْ',
    thinkingTipAr: '💡 حرف C هنا بيتنطق كاف مفخمة وسريعة.',
    emoji: '🐱',
    ageTracks: ['kg_kids', 'elementary'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'en-a0-3',
    lang: 'en',
    targetWord: 'Apple',
    arabicMeaning: 'تفاحة',
    arabicPhonetics: 'أَبِلْ',
    thinkingTipAr: '💡 أول كلمة بنتعلم بيها حرف A في كل مدارس العالم.',
    emoji: '🍎',
    ageTracks: ['kg_kids', 'elementary'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'en-a0-4',
    lang: 'en',
    targetWord: 'I am happy',
    arabicMeaning: 'أنا فرحان ومبسوط',
    arabicPhonetics: 'آي آم هَابِي',
    thinkingTipAr: '💡 الإنجليزي لازم يحط فعل (am) مع الوصف، مفيش جملة اسمية بدون فعل.',
    emoji: '😄',
    ageTracks: ['kg_kids', 'elementary', 'prep_school'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'en-a1-1',
    lang: 'en',
    targetWord: 'Location',
    arabicMeaning: 'الموقع / اللوكيشن / المكان',
    arabicPhonetics: 'لُوكَيْشَن',
    thinkingTipAr: '💡 نفس الكلمة اللي بنستعملها في أوبر والواتساب في مصر: "ابعتلي اللوكيشن".',
    emoji: '📍',
    ageTracks: ['everyday_street', 'prep_school', 'university'],
    cefr: 'A1',
    category: 'street',
  },
  {
    id: 'en-a1-2',
    lang: 'en',
    targetWord: 'Order',
    arabicMeaning: 'طلب / أوردر',
    arabicPhonetics: 'أُورْدَرْ',
    thinkingTipAr: '💡 بنقولها في المطاعم والكافيهات: "الأوردر جاهز يا كابتن".',
    emoji: '🍔',
    ageTracks: ['everyday_street', 'prep_school'],
    cefr: 'A1',
    category: 'street',
  },
  {
    id: 'en-b1-1',
    lang: 'en',
    targetWord: 'Although',
    arabicMeaning: 'على الرغم من / بالرغم من إن...',
    arabicPhonetics: 'أُولْذُو',
    thinkingTipAr: '💡 رابط جمل سحري بيربط بين فكرتين متناقضتين، سر الدرجات العالية في الامتحانات.',
    emoji: '⚖️',
    ageTracks: ['high_school', 'university'],
    cefr: 'B1',
    category: 'connectors',
  },
  {
    id: 'en-b1-2',
    lang: 'en',
    targetWord: 'However',
    arabicMeaning: 'ومع ذلك / إلا أنه',
    arabicPhonetics: 'هَاوْ إيڤَرْ',
    thinkingTipAr: '💡 بتيجي دايماً بعدها فاصلة (comma) لتغيير مسار الكلام بأسلوب راقي.',
    emoji: '🔄',
    ageTracks: ['high_school', 'university'],
    cefr: 'B1',
    category: 'connectors',
  },
  {
    id: 'en-b2-1',
    lang: 'en',
    targetWord: 'Hypothesis',
    arabicMeaning: 'فرضية علمية',
    arabicPhonetics: 'هَايْبُوثِسِيسْ',
    thinkingTipAr: '💡 فكرة علمية قابلة للتجربة والاختبار في الأبحاث والجامعة.',
    emoji: '🔬',
    ageTracks: ['university', 'high_school'],
    cefr: 'B2',
    category: 'academic',
  },

  // ==========================================
  // 2. GERMAN (de)
  // ==========================================
  {
    id: 'de-a0-1',
    lang: 'de',
    targetWord: 'Hallo',
    arabicMeaning: 'أهلاً / مرحباً',
    arabicPhonetics: 'هَالُو',
    thinkingTipAr: '💡 التحية الودودة اليومية بين الأصدقاء في كل ألمانيا والنمسا.',
    emoji: '👋',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'de-a0-2',
    lang: 'de',
    targetWord: 'Guten Tag',
    arabicMeaning: 'نهارك سعيد / مرحباً بالنهار',
    arabicPhonetics: 'جُوتِن تَاك',
    thinkingTipAr: '💡 حرف g في نهاية الكلمة يميل لصوت الكاف الخفيفة، Tag تعني يوم.',
    emoji: '☀️',
    ageTracks: ['elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'de-a0-3',
    lang: 'de',
    targetWord: 'Danke schön',
    arabicMeaning: 'شكراً جزيلاً',
    arabicPhonetics: 'دَانْكِه شُون',
    thinkingTipAr: '💡 كلمة الذوق الأولى في ألمانيا، خليك دايماً مبتسم وأنت بتقولها.',
    emoji: '🙏',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'de-a1-1',
    lang: 'de',
    targetWord: 'Ich bin',
    arabicMeaning: 'أنا أكون (أنا...)',
    arabicPhonetics: 'إِيخْ بِنْ',
    thinkingTipAr: '💡 في الألماني الـ ch رقيقة جداً زي هواء الشفايف الخفيف بعد حرف i.',
    emoji: '👤',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A1',
    category: 'kids_basics',
  },
  {
    id: 'de-b1-1',
    lang: 'de',
    targetWord: 'Weil',
    arabicMeaning: 'لأنّ / بسبب إن...',
    arabicPhonetics: 'ڤَايْل',
    thinkingTipAr: '💡 قاعدة ذهبية: كلمة weil بتشوط الفعل لآخر الجملة تماماً!',
    emoji: '🎯',
    ageTracks: ['high_school', 'university'],
    cefr: 'B1',
    category: 'connectors',
  },

  // ==========================================
  // 3. FRENCH (fr)
  // ==========================================
  {
    id: 'fr-a0-1',
    lang: 'fr',
    targetWord: 'Bonjour',
    arabicMeaning: 'صباح الخير / أهلاً',
    arabicPhonetics: 'بُونْجُور',
    thinkingTipAr: '💡 bon يعني خير أو حلو، و jour يعني يوم.. يومك حلو!',
    emoji: '🥐',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'fr-a0-2',
    lang: 'fr',
    targetWord: 'Merci',
    arabicMeaning: 'شكراً ليك',
    arabicPhonetics: 'مِيرْسِي',
    thinkingTipAr: '💡 نفس الكلمة اللي كل المصريين بيقولوها كل يوم في الشارع والبيت!',
    emoji: '🤝',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'shared_roots',
  },
  {
    id: 'fr-a1-1',
    lang: 'fr',
    targetWord: 'Ascenseur',
    arabicMeaning: 'المصعد / الأسانسير',
    arabicPhonetics: 'أَسَانْسِير',
    thinkingTipAr: '💡 كلمة مصرية أصيلة واخدينها نصاً من الفرنسية بمعنى المصعد الكهربائي.',
    emoji: '🛗',
    ageTracks: ['everyday_street', 'prep_school'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'fr-a1-2',
    lang: 'fr',
    targetWord: 'Douche',
    arabicMeaning: 'استحمام / الدوش',
    arabicPhonetics: 'دُوش',
    thinkingTipAr: '💡 "أنا هاخد دوش".. كلمة فرنسية دخلت العامية المصرية واستقرت فيها.',
    emoji: '🚿',
    ageTracks: ['everyday_street', 'elementary'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'fr-b1-1',
    lang: 'fr',
    targetWord: 'Cependant',
    arabicMeaning: 'ومع ذلك / غير أن',
    arabicPhonetics: 'سُوبَانْدَان',
    thinkingTipAr: '💡 نطق أنفي جميل، بتستعمل في المقالات الفرنسية لربط الأفكار.',
    emoji: '✍️',
    ageTracks: ['high_school', 'university'],
    cefr: 'B1',
    category: 'connectors',
  },

  // ==========================================
  // 4. SPANISH (es)
  // ==========================================
  {
    id: 'es-a0-1',
    lang: 'es',
    targetWord: 'Hola',
    arabicMeaning: 'أهلاً / سلام',
    arabicPhonetics: 'أُولَا',
    thinkingTipAr: '💡 حرف H في الإسباني صامت تماماً مابيتنطقش أبداً!',
    emoji: '👋',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'es-a0-2',
    lang: 'es',
    targetWord: 'Gracias',
    arabicMeaning: 'شكراً',
    arabicPhonetics: 'جْرَاثِيَاسْ',
    thinkingTipAr: '💡 في إسبانيا حرف c بيتنطق ثاء، وفي أمريكا اللاتينية بيتنطق سين.',
    emoji: '🌟',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'es-a1-1',
    lang: 'es',
    targetWord: 'Azúcar',
    arabicMeaning: 'السكر',
    arabicPhonetics: 'أَثُوكَار',
    thinkingTipAr: '💡 أصلها العربي المباشر: (السكر).. الإسبانية فيها أكثر من ٤٠٠٠ كلمة عربية!',
    emoji: '🍬',
    ageTracks: ['elementary', 'prep_school', 'everyday_street'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'es-a1-2',
    lang: 'es',
    targetWord: 'Arroz',
    arabicMeaning: 'الأرز / الرز',
    arabicPhonetics: 'أَرُّوث',
    thinkingTipAr: '💡 منقولة مباشرة من الأندلس من كلمة (الرُّز)، والـ rr بتترعش في اللسان.',
    emoji: '🍚',
    ageTracks: ['elementary', 'prep_school', 'everyday_street'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'es-a1-3',
    lang: 'es',
    targetWord: 'Camisa',
    arabicMeaning: 'القميص',
    arabicPhonetics: 'كَامِيسَا',
    thinkingTipAr: '💡 كلمة عربية أصيلة: (القميص)، بنفس المعنى الإسباني حرفياً.',
    emoji: '👔',
    ageTracks: ['elementary', 'prep_school', 'everyday_street'],
    cefr: 'A1',
    category: 'shared_roots',
  },

  // ==========================================
  // 5. TURKISH (tr) - Shared Egyptian Bridge
  // ==========================================
  {
    id: 'tr-a0-1',
    lang: 'tr',
    targetWord: 'Merhaba',
    arabicMeaning: 'مرحباً / أهلاً',
    arabicPhonetics: 'مَرْحَبَا',
    thinkingTipAr: '💡 نفس كلمة مرحباً العربية، بتتقال في كل تركيا بابتسامة.',
    emoji: '🇹🇷',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'kids_basics',
  },
  {
    id: 'tr-a0-2',
    lang: 'tr',
    targetWord: 'Köprü',
    arabicMeaning: 'الكوبري / الجسر',
    arabicPhonetics: 'كُوبْرِي',
    thinkingTipAr: '💡 كلمة مصرية تركية مشتركة 100%! بنقول "كوبري ستانلي أو كوبري أكتوبر".',
    emoji: '🌉',
    ageTracks: ['elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'shared_roots',
  },
  {
    id: 'tr-a0-3',
    lang: 'tr',
    targetWord: 'Oda',
    arabicMeaning: 'الأوضة / الغرفة',
    arabicPhonetics: 'أُوضَا',
    thinkingTipAr: '💡 "أوضة النوم" في مصر أصلها تركي مباشر من oda!',
    emoji: '🚪',
    ageTracks: ['kg_kids', 'elementary', 'prep_school', 'everyday_street'],
    cefr: 'A0',
    category: 'shared_roots',
  },
  {
    id: 'tr-a0-4',
    lang: 'tr',
    targetWord: 'Çanta',
    arabicMeaning: 'الشنطة / الحقيبة',
    arabicPhonetics: 'شَانْطَا',
    thinkingTipAr: '💡 حرف Ç بيتنطق (تش) أو (ش)، والكلمة هي الشنطة اللي بنشيلها في إيدنا.',
    emoji: '🎒',
    ageTracks: ['kg_kids', 'elementary', 'everyday_street'],
    cefr: 'A0',
    category: 'shared_roots',
  },
  {
    id: 'tr-a1-1',
    lang: 'tr',
    targetWord: 'Taze',
    arabicMeaning: 'طازة / طازج',
    arabicPhonetics: 'تَازَه',
    thinkingTipAr: '💡 "عيش طازة.. فاكهة طازة".. نفس اللفظ والمعنى في مصر وإسطنبول.',
    emoji: '🥖',
    ageTracks: ['elementary', 'everyday_street'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'tr-a1-2',
    lang: 'tr',
    targetWord: 'Doğru',
    arabicMeaning: 'دغري / صح / على طول في وشك',
    arabicPhonetics: 'دُوغْرِي',
    thinkingTipAr: '💡 "امشي دغري على طول".. حرف ğ صامت وبيمد الضمة (دُو-رو).',
    emoji: '➡️',
    ageTracks: ['prep_school', 'everyday_street'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'tr-a1-3',
    lang: 'tr',
    targetWord: 'Hesap',
    arabicMeaning: 'الحساب / الفاتورة',
    arabicPhonetics: 'هِيسَابْ',
    thinkingTipAr: '💡 في المطعم: "الحساب يا كابتن".. كلمة عربية أصيلة متداولة يومياً في تركيا.',
    emoji: '🧾',
    ageTracks: ['everyday_street', 'university'],
    cefr: 'A1',
    category: 'shared_roots',
  },
  {
    id: 'tr-a1-4',
    lang: 'tr',
    targetWord: 'Cadde',
    arabicMeaning: 'الشارع الكبير / الجادّة',
    arabicPhonetics: 'جَادَّه',
    thinkingTipAr: '💡 مثل شارع الاستقلال في إسطنبول İstiklal Caddesi.',
    emoji: '🛣️',
    ageTracks: ['everyday_street', 'prep_school'],
    cefr: 'A1',
    category: 'shared_roots',
  },
];

/**
 * Filter and sort curated lexicon according to user profile
 */
export function getProfileSortedLexicon(
  lang: 'en' | 'de' | 'fr' | 'es' | 'tr',
  profile: {
    age?: number;
    isStudent?: boolean;
    stage?: PedagogicalStage;
    cefr?: string;
  }
): CuratedLexiconEntry[] {
  const entries = ARAB_TOP_5_LEXICON.filter((e) => e.lang === lang);
  const userAge = profile.age ?? 22;
  const isStudent = profile.isStudent ?? false;
  const stage = profile.stage ?? 'everyday_street';

  return [...entries].sort((a, b) => {
    // 1. Kids & Elementary prioritizes kids_basics & elementary
    if (userAge <= 11) {
      const aIsKid = a.ageTracks.includes('kg_kids') || a.ageTracks.includes('elementary');
      const bIsKid = b.ageTracks.includes('kg_kids') || b.ageTracks.includes('elementary');
      if (aIsKid && !bIsKid) return -1;
      if (!aIsKid && bIsKid) return 1;
    }

    // 2. High school prioritizes connectors & academic
    if (stage === 'high_school') {
      const aIsHigh = a.category === 'connectors' || a.ageTracks.includes('high_school');
      const bIsHigh = b.category === 'connectors' || b.ageTracks.includes('high_school');
      if (aIsHigh && !bIsHigh) return -1;
      if (!aIsHigh && bIsHigh) return 1;
    }

    // 3. Street / Non-student prioritizes shared_roots & street
    if (!isStudent || stage === 'everyday_street') {
      const aIsStreet = a.category === 'street' || a.category === 'shared_roots';
      const bIsStreet = b.category === 'street' || b.category === 'shared_roots';
      if (aIsStreet && !bIsStreet) return -1;
      if (!aIsStreet && bIsStreet) return 1;
    }

    return 0;
  });
}

