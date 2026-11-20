/**
 * Complete 10-Level German Thinking Bridge Progression Curriculum
 * Custom-built for Egyptian Arabic speakers transitioning to German thinking.
 */

export interface GermanSmartCard {
  id: string;
  frontAr: string;
  backDe: string;
  arabicPhonetic: string;
  thinkingHintAr: string;
  englishCognate?: string;
  gender?: 'der' | 'die' | 'das';
  suffixRule?: string;
  exampleDe: string;
  exampleAr: string;
}

export interface GermanSentenceBuilder {
  id: string;
  promptAr: string;
  correctTokens: string[];
  distractors: string[];
  verbSeatIndex?: number; // 0-based index of verb in correctTokens (usually 1 for position #2)
  sandwichPair?: [number, number]; // [helperIndex, mainVerbIndex]
  cognitiveCoachHints?: Record<string, string>; // Egyptian Arabic hints keyed by misconception pattern
}

export interface GermanLightningMatchPair {
  id: string;
  arabicThought: string;
  germanPhrase: string;
}

export interface GermanProgressionLevelData {
  id: number;
  titleAr: string;
  subtitleEn: string;
  cefr: string;
  descriptionAr: string;
  cards: GermanSmartCard[];
  sentenceBuilders: GermanSentenceBuilder[];
  lightningMatches: GermanLightningMatchPair[];
}

export const GERMAN_PROGRESSION_LEVELS: GermanProgressionLevelData[] = [
  // ==========================================
  // LEVEL 1: Pre-A0 — Name Forge & Sound Keys
  // ==========================================
  {
    id: 1,
    titleAr: '١. مصنع الاسم وسر نطق الألماني',
    subtitleEn: 'Name Forge & The 6 Sound Keys',
    cefr: 'Pre-A0',
    descriptionAr: 'مصنع الأسماء التفاعلي من العربية إلى الألمانية + مفاتيح النطق الستة (ei, ie, sch, ch, w, z).',
    cards: [
      {
        id: 'de-l1-c1',
        frontAr: 'مرحباً (أهلاً)',
        backDe: 'Hallo',
        arabicPhonetic: 'هَالُو',
        thinkingHintAr: 'نفس Hello الإنجليزية ولكن بحرف a مفتوح!',
        englishCognate: 'Hello',
        exampleDe: 'Hallo! Wie geht es dir?',
        exampleAr: 'أهلاً! كيف حالك؟'
      },
      {
        id: 'de-l1-c2',
        frontAr: 'صباح الخير',
        backDe: 'Guten Morgen',
        arabicPhonetic: 'جُوتِن مُورْجِن',
        thinkingHintAr: 'Guten تعني "خير / طيب" و Morgen تعني "صباح / غداً".',
        englishCognate: 'Good Morning',
        exampleDe: 'Guten Morgen, mein Freund!',
        exampleAr: 'صباح الخير يا صديقي!'
      },
      {
        id: 'de-l1-c3',
        frontAr: 'أنا اسمي...',
        backDe: 'Ich heiße...',
        arabicPhonetic: 'إِيخْ هَايْسِه...',
        thinkingHintAr: 'لاحظ تركيب ei يُنطق "آي" دايماً! والرمز ß يُنطق ss مشددة.',
        exampleDe: 'Ich heiße Amr.',
        exampleAr: 'أنا اسمي عمرو.'
      },
      {
        id: 'de-l1-c4',
        frontAr: 'أنا أكون (أنا...)',
        backDe: 'Ich bin',
        arabicPhonetic: 'إِيخْ بِنْ',
        thinkingHintAr: 'صيغة المتكلم من فعل الكينونة (مثل I am بالإنجليزية).',
        englishCognate: 'I am (bin ~ be)',
        exampleDe: 'Ich bin Student.',
        exampleAr: 'أنا طالب.'
      },
      {
        id: 'de-l1-c5',
        frontAr: 'شكراً جزيلاً',
        backDe: 'Vielen Dank',
        arabicPhonetic: 'فِيلِن دَانْك',
        thinkingHintAr: 'حرف V بالألماني يُنطق "ف" وليس "ڤ"! و Dank مثل Thanks.',
        englishCognate: 'Many Thanks',
        exampleDe: 'Vielen Dank für deine Hilfe!',
        exampleAr: 'شكراً جزيلاً على مساعدتك!'
      },
      {
        id: 'de-l1-c6',
        frontAr: 'من فضلك / عفواً',
        backDe: 'Bitte',
        arabicPhonetic: 'بِتِه',
        thinkingHintAr: 'تُستخدم للتأدب عند الطلب، وللرد على شكراً!',
        exampleDe: 'Ein Kaffee, bitte.',
        exampleAr: 'قهوة واحدة من فضلك.'
      },
      {
        id: 'de-l1-c7',
        frontAr: 'مع السلامة',
        backDe: 'Auf Wiedersehen',
        arabicPhonetic: 'أَوْف فِيدَرْ زِيهِين',
        thinkingHintAr: 'تعني حرفياً "حتى نتقابل مجدداً"! ie يُنطق إي ممدودة.',
        exampleDe: 'Tschüss! Auf Wiedersehen!',
        exampleAr: 'باي! مع السلامة!'
      },
      {
        id: 'de-l1-c8',
        frontAr: 'نعم',
        backDe: 'Ja',
        arabicPhonetic: 'يَا',
        thinkingHintAr: 'حرف J باللغة الألمانية يُنطق "ياء" دائماً مثل Yes.',
        englishCognate: 'Yes (Ja ~ Yeah)',
        exampleDe: 'Ja, ich verstehe.',
        exampleAr: 'نعم، أنا أفهم.'
      },
      {
        id: 'de-l1-c9',
        frontAr: 'لا',
        backDe: 'Nein',
        arabicPhonetic: 'نَايْن',
        thinkingHintAr: 'تذكر شفرة ei: تنطق "آي" فتحصل على Nein (ناين).',
        englishCognate: 'No / Nine',
        exampleDe: 'Nein, danke.',
        exampleAr: 'لا، شكراً.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l1-sb1',
        promptAr: 'أهلاً، أنا اسمي عمرو.',
        correctTokens: ['Hallo,', 'ich', 'heiße', 'Amr.'],
        distractors: ['bin', 'du', 'ist'],
        verbSeatIndex: 2,
        cognitiveCoachHints: {
          'hallo ich bin amr': 'ممكن تقول Ich bin Amr بس لما تستخدم heiße يبقى الترتيب: ich heiße Amr.',
        }
      },
      {
        id: 'de-l1-sb2',
        promptAr: 'صباح الخير، أنا طالب.',
        correctTokens: ['Guten', 'Morgen,', 'ich', 'bin', 'Student.'],
        distractors: ['ist', 'heiße', 'wir'],
        verbSeatIndex: 3,
        cognitiveCoachHints: {
          'ich student bin': 'في الألمانية، فعل الكينونة bin بييجي بعد الفاعل ich فوراً!',
        }
      },
      {
        id: 'de-l1-sb3',
        promptAr: 'قهوة من فضلك.',
        correctTokens: ['Ein', 'Kaffee,', 'bitte.'],
        distractors: ['danke', 'ja', 'nein'],
      },
      {
        id: 'de-l1-sb4',
        promptAr: 'شكراً جزيلاً ومع السلامة.',
        correctTokens: ['Vielen', 'Dank', 'und', 'auf', 'Wiedersehen.'],
        distractors: ['bitte', 'ja', 'ich'],
      },
      {
        id: 'de-l1-sb5',
        promptAr: 'نعم، أنا أفهم.',
        correctTokens: ['Ja,', 'ich', 'verstehe.'],
        distractors: ['nein', 'nicht', 'du'],
        verbSeatIndex: 2,
      }
    ],
    lightningMatches: [
      { id: 'de-l1-m1', arabicThought: 'أهلاً', germanPhrase: 'Hallo' },
      { id: 'de-l1-m2', arabicThought: 'شكراً جزيلاً', germanPhrase: 'Vielen Dank' },
      { id: 'de-l1-m3', arabicThought: 'من فضلك', germanPhrase: 'Bitte' },
      { id: 'de-l1-m4', arabicThought: 'أنا اسمي', germanPhrase: 'Ich heiße' },
      { id: 'de-l1-m5', arabicThought: 'مع السلامة', germanPhrase: 'Auf Wiedersehen' },
      { id: 'de-l1-m6', arabicThought: 'نعم / لا', germanPhrase: 'Ja / Nein' },
    ]
  },

  // ==========================================
  // LEVEL 2: A0 — 35+ Arabic & English Cognates
  // ==========================================
  {
    id: 2,
    titleAr: '٢. كلمات ألماني إنت أصلاً عارفها',
    subtitleEn: '35+ Arabic & English Cognates',
    cefr: 'A0',
    descriptionAr: 'بناء الثقة الفورية باستخدام الكلمات المشتركة بين العربية والألمانية والإنجليزية.',
    cards: [
      {
        id: 'de-l2-c1',
        frontAr: 'قهوة',
        backDe: 'der Kaffee',
        arabicPhonetic: 'دِير كَافِيه',
        thinkingHintAr: 'كلمة كافيه مشتقة من العربية (قهوة) وموجودة بالإنجليزي Kaffee!',
        englishCognate: 'Coffee',
        gender: 'der',
        exampleDe: 'Der Kaffee ist heiß.',
        exampleAr: 'القهوة سخنة.'
      },
      {
        id: 'de-l2-c2',
        frontAr: 'سكر',
        backDe: 'der Zucker',
        arabicPhonetic: 'دِير تْسُوكَرْ',
        thinkingHintAr: 'Zucker جاية من "سكر" العربية وحرف Z يُنطق "تس"!',
        englishCognate: 'Sugar',
        gender: 'der',
        exampleDe: 'Ich nehme Zucker.',
        exampleAr: 'أنا آخذ سكراً.'
      },
      {
        id: 'de-l2-c3',
        frontAr: 'سيارة (عربية)',
        backDe: 'das Auto',
        arabicPhonetic: 'دَاسْ أُوتُو',
        thinkingHintAr: 'نفس كلمة Auto بالإنجليزي والعامية المصرية!',
        englishCognate: 'Auto / Car',
        gender: 'das',
        exampleDe: 'Das Auto ist neu.',
        exampleAr: 'السيارة جديدة.'
      },
      {
        id: 'de-l2-c4',
        frontAr: 'كتاب',
        backDe: 'das Buch',
        arabicPhonetic: 'دَاسْ بُوخْ',
        thinkingHintAr: 'شبه Book بالإنجليزي، وحرف ch يُنطق "خ" بعد حرف u!',
        englishCognate: 'Book',
        gender: 'das',
        exampleDe: 'Das Buch ist interessant.',
        exampleAr: 'الكتاب ممتع.'
      },
      {
        id: 'de-l2-c5',
        frontAr: 'ماء (مية)',
        backDe: 'das Wasser',
        arabicPhonetic: 'دَاسْ ڤَاسَرْ',
        thinkingHintAr: 'نفس Water بالإنجليزي، وحرف W يُنطق "ڤ" بالألماني!',
        englishCognate: 'Water',
        gender: 'das',
        exampleDe: 'Das Wasser ist kalt.',
        exampleAr: 'المية سقعة.'
      },
      {
        id: 'de-l2-c6',
        frontAr: 'يد',
        backDe: 'die Hand',
        arabicPhonetic: 'دِي هَانْد',
        thinkingHintAr: 'نفس Hand الإنجليزية تماماً!',
        englishCognate: 'Hand',
        gender: 'die',
        exampleDe: 'Meine Hand ist warm.',
        exampleAr: 'إيدي دافية.'
      },
      {
        id: 'de-l2-c7',
        frontAr: 'اسم',
        backDe: 'der Name',
        arabicPhonetic: 'دِير نَامِه',
        thinkingHintAr: 'نفس Name بالإنجليزي مع نطق حرف e في النهاية!',
        englishCognate: 'Name',
        gender: 'der',
        exampleDe: 'Mein Name ist Omar.',
        exampleAr: 'اسمي عمر.'
      },
      {
        id: 'de-l2-c8',
        frontAr: 'مشكلة',
        backDe: 'das Problem',
        arabicPhonetic: 'دَاسْ بْرُوبْلِيم',
        thinkingHintAr: 'نفس كلمة Problem الشائعة بالأنجليزي والمصري!',
        englishCognate: 'Problem',
        gender: 'das',
        exampleDe: 'Kein Problem!',
        exampleAr: 'ولا يهمك! (مفيش مشكلة!)'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l2-sb1',
        promptAr: 'القهوة سخنة.',
        correctTokens: ['Der', 'Kaffee', 'ist', 'heiß.'],
        distractors: ['das', 'die', 'sind'],
        verbSeatIndex: 2,
        cognitiveCoachHints: {
          'das kaffee ist heiß': 'كلمة Kaffee مذكر بالألماني وبتآخد der مش das!',
        }
      },
      {
        id: 'de-l2-sb2',
        promptAr: 'هذا يكون كتاب.',
        correctTokens: ['Das', 'ist', 'ein', 'Buch.'],
        distractors: ['der', 'die', 'eine'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l2-sb3',
        promptAr: 'المية سقعة.',
        correctTokens: ['Das', 'Wasser', 'ist', 'kalt.'],
        distractors: ['der', 'die', 'heiß'],
        verbSeatIndex: 2,
      },
      {
        id: 'de-l2-sb4',
        promptAr: 'السيارة جديدة.',
        correctTokens: ['Das', 'Auto', 'ist', 'neu.'],
        distractors: ['der', 'die', 'alt'],
        verbSeatIndex: 2,
      },
      {
        id: 'de-l2-sb5',
        promptAr: 'مفيش مشكلة!',
        correctTokens: ['Kein', 'Problem!'],
        distractors: ['nicht', 'nein', 'der'],
      }
    ],
    lightningMatches: [
      { id: 'de-l2-m1', arabicThought: 'قهوة', germanPhrase: 'der Kaffee' },
      { id: 'de-l2-m2', arabicThought: 'سكر', germanPhrase: 'der Zucker' },
      { id: 'de-l2-m3', arabicThought: 'سيارة', germanPhrase: 'das Auto' },
      { id: 'de-l2-m4', arabicThought: 'ماء', germanPhrase: 'das Wasser' },
      { id: 'de-l2-m5', arabicThought: 'كتاب', germanPhrase: 'das Buch' },
      { id: 'de-l2-m6', arabicThought: 'ولا يهمك', germanPhrase: 'Kein Problem' },
    ]
  },

  // ==========================================
  // LEVEL 3: A1 — Verb = King in Seat #2
  // ==========================================
  {
    id: 3,
    titleAr: '٣. سر الكرسي التاني (هندسة الجملة)',
    subtitleEn: 'Verb = King in Seat #2',
    cefr: 'A1',
    descriptionAr: 'قاعدة موقع الفعل الصارمة V2 في الألماني: الفعل دايماً قاعد على الكرسي التاني.',
    cards: [
      {
        id: 'de-l3-c1',
        frontAr: 'اليوم',
        backDe: 'heute',
        arabicPhonetic: 'هُويْتِه',
        thinkingHintAr: 'تركيب eu يُنطق "أوي" مثل Boy! لما تأتي في الكرسي الأول، الفعل يتبادل مع الفاعل فوراً.',
        exampleDe: 'Heute lerne ich Deutsch.',
        exampleAr: 'اليوم بتعلم ألماني.'
      },
      {
        id: 'de-l3-c2',
        frontAr: 'أشرب',
        backDe: 'trinke',
        arabicPhonetic: 'تْرِينْكِه',
        thinkingHintAr: 'تصريف المتكلم ich trinke. النهاية e مع أنا.',
        englishCognate: 'drink',
        exampleDe: 'Ich trinke Tee.',
        exampleAr: 'أنا أشرب شاي.'
      },
      {
        id: 'de-l3-c3',
        frontAr: 'الآن',
        backDe: 'jetzt',
        arabicPhonetic: 'يِتْسْت',
        thinkingHintAr: 'حرف j ينطق ياء وحرف z ينطق تس.',
        exampleDe: 'Jetzt gehe ich nach Hause.',
        exampleAr: 'الآن أنا أذهب للبيت.'
      },
      {
        id: 'de-l3-c4',
        frontAr: 'نتعلم',
        backDe: 'lernen',
        arabicPhonetic: 'لِيرْنِين',
        thinkingHintAr: 'نفس Learn بالإنجليزية! المصدر ينتهي بـ en وتصريف wir lernen.',
        englishCognate: 'learn',
        exampleDe: 'Wir lernen zusammen.',
        exampleAr: 'نحن نتعلم معاً.'
      },
      {
        id: 'de-l3-c5',
        frontAr: 'أنا أذهب',
        backDe: 'ich gehe',
        arabicPhonetic: 'إِيخْ جِيهِه',
        thinkingHintAr: 'فعل الذهاب مثل go بالإنجليزي.',
        englishCognate: 'go (gehe)',
        exampleDe: 'Ich gehe jetzt.',
        exampleAr: 'أنا رايح دقتي.'
      },
      {
        id: 'de-l3-c6',
        frontAr: 'ليس (نفي الأسماء بدون أداة)',
        backDe: 'kein / keine',
        arabicPhonetic: 'كَاين / كَاينِه',
        thinkingHintAr: 'نفي الأسماء: kein للمذكر والمحياد، وkeine للمؤنث والجمع.',
        exampleDe: 'Ich habe keinen Hunger.',
        exampleAr: 'ليس عندي جوع (مش جعان).'
      },
      {
        id: 'de-l3-c7',
        frontAr: 'ليس (نفي الأفعال والصفات)',
        backDe: 'nicht',
        arabicPhonetic: 'نِيخْت',
        thinkingHintAr: 'تستخدم لنفي الأفعال والصفات (مش/ليس).',
        englishCognate: 'not',
        exampleDe: 'Das ist nicht gut.',
        exampleAr: 'هذا ليس جيداً.'
      },
      {
        id: 'de-l3-c8',
        frontAr: 'غداً',
        backDe: 'morgen',
        arabicPhonetic: 'مُورْجِن',
        thinkingHintAr: 'تأتي بمعنى غداً (بخط صغير) وتوضع في الكرسي الأول لتقديم الزمن.',
        englishCognate: 'tomorrow (morning)',
        exampleDe: 'Morgen reise ich.',
        exampleAr: 'بكرة سأسافر.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l3-sb1',
        promptAr: 'اليوم بتعلم ألماني.',
        correctTokens: ['Heute', 'lerne', 'ich', 'Deutsch.'],
        distractors: ['ich', 'lernen', 'ist'],
        verbSeatIndex: 1,
        cognitiveCoachHints: {
          'heute ich lerne deutsch': 'خلي بالك! كلمة Heute خدت الكرسي الأول، فلازم الفعل lerne يقعد في الكرسي التاني فوراً: Heute lerne ich!',
        }
      },
      {
        id: 'de-l3-sb2',
        promptAr: 'الآن أشرب قهوة.',
        correctTokens: ['Jetzt', 'trinke', 'ich', 'Kaffee.'],
        distractors: ['ich', 'trinken', 'der'],
        verbSeatIndex: 1,
        cognitiveCoachHints: {
          'jetzt ich trinke kaffee': 'الفعل دايماً في الكرسي التاني! الترتيب الصحيح: Jetzt trinke ich Kaffee.',
        }
      },
      {
        id: 'de-l3-sb3',
        promptAr: 'هذا ليس جيداً.',
        correctTokens: ['Das', 'ist', 'nicht', 'gut.'],
        distractors: ['kein', 'nein', 'sehr'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l3-sb4',
        promptAr: 'غداً أسافر إلى برلين.',
        correctTokens: ['Morgen', 'reise', 'ich', 'nach', 'Berlin.'],
        distractors: ['ich', 'reisen', 'in'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l3-sb5',
        promptAr: 'نحن نتعلم الألمانية الآن.',
        correctTokens: ['Wir', 'lernen', 'jetzt', 'Deutsch.'],
        distractors: ['lernt', 'ist', 'heute'],
        verbSeatIndex: 1,
      }
    ],
    lightningMatches: [
      { id: 'de-l3-m1', arabicThought: 'اليوم أدرس', germanPhrase: 'Heute lerne ich' },
      { id: 'de-l3-m2', arabicThought: 'الآن أذهب', germanPhrase: 'Jetzt gehe ich' },
      { id: 'de-l3-m3', arabicThought: 'غداً أسافر', germanPhrase: 'Morgen reise ich' },
      { id: 'de-l3-m4', arabicThought: 'ليس جيدا', germanPhrase: 'nicht gut' },
      { id: 'de-l3-m5', arabicThought: 'لا مشكلة', germanPhrase: 'kein Problem' },
      { id: 'de-l3-m6', arabicThought: 'أشرب قهوة', germanPhrase: 'ich trinke Kaffee' },
    ]
  },

  // ==========================================
  // LEVEL 4: A1+ — Color-Coded Gender & 80/20 Endings
  // ==========================================
  {
    id: 4,
    titleAr: '٤. شفرة الألوان (der / die / das)',
    subtitleEn: 'Color-Coded Gender & 80/20 Endings',
    cefr: 'A1+',
    descriptionAr: 'الأزرق للمذكر der، الوردي للمؤنث die، والأخضر للمحياد das مع نهايات التسهيل 80/20.',
    cards: [
      {
        id: 'de-l4-c1',
        frontAr: 'الرجل (مذكر - أزرق 🟦)',
        backDe: 'der Mann',
        arabicPhonetic: 'دِير مَان',
        thinkingHintAr: '🟦 der للمذكر. النهاية -er غالباً مذكر مثل der Lehrer.',
        englishCognate: 'Man',
        gender: 'der',
        exampleDe: 'Der Mann arbeitet hier.',
        exampleAr: 'الرجل يعمل هنا.'
      },
      {
        id: 'de-l4-c2',
        frontAr: 'السيدة (مؤنث - وردي 🟥)',
        backDe: 'die Frau',
        arabicPhonetic: 'دِي فْرَاو',
        thinkingHintAr: '🟥 die للمؤنث. جميع الكلمات المنتهية بـ -ung أو -heit أو -keit هي die دايماً!',
        suffixRule: 'كل كلمة آخرها -ung أو -heit أو -keit هي die دايماً!',
        gender: 'die',
        exampleDe: 'Die Frau ist freundlich.',
        exampleAr: 'السيدة لطيفة.'
      },
      {
        id: 'de-l4-c3',
        frontAr: 'الشقة (مؤنث - نهاية -ung)',
        backDe: 'die Wohnung',
        arabicPhonetic: 'دِي ڤُونُونْج',
        thinkingHintAr: '🟥 قاعدة 80/20: النهاية -ung تعني مؤنث die بدون أي استثناء!',
        suffixRule: '-ung -> die (دايماً مؤنث)',
        gender: 'die',
        exampleDe: 'Die Wohnung ist groß.',
        exampleAr: 'الشقة كبيرة.'
      },
      {
        id: 'de-l4-c4',
        frontAr: 'الطفل (محياد - أخضر 🟩)',
        backDe: 'das Kind',
        arabicPhonetic: 'دَاسْ كِينْد',
        thinkingHintAr: '🟩 das للمحياد. النهاية -chen تعني التصغير ومحياد das دايماً!',
        englishCognate: 'Kind (Child)',
        gender: 'das',
        exampleDe: 'Das Kind spielt.',
        exampleAr: 'الطفل يلعب.'
      },
      {
        id: 'de-l4-c5',
        frontAr: 'الحرية (مؤنث - نهاية -heit)',
        backDe: 'die Freiheit',
        arabicPhonetic: 'دِي فْرَايْ هَايْت',
        thinkingHintAr: '🟥 النهاية -heit تعني اسم مؤنث die دايماً!',
        suffixRule: '-heit -> die (دايماً مؤنث)',
        gender: 'die',
        exampleDe: 'Freiheit ist wichtig.',
        exampleAr: 'الحرية مهمة.'
      },
      {
        id: 'de-l4-c6',
        frontAr: 'المعلم (مذكر - نهاية -er)',
        backDe: 'der Lehrer',
        arabicPhonetic: 'دِير لِيرِر',
        thinkingHintAr: '🟦 الوظائف المذكرة المنتهية بـ -er تأخذ der.',
        suffixRule: '-er (وظائف) -> der',
        gender: 'der',
        exampleDe: 'Der Lehrer erklärt gut.',
        exampleAr: 'المعلم يشرح جيداً.'
      },
      {
        id: 'de-l4-c7',
        frontAr: 'الفتاة (محياد - نهاية -chen)',
        backDe: 'das Mädchen',
        arabicPhonetic: 'دَاسْ مِيدْخِين',
        thinkingHintAr: '🟩 كسر القاعدة التقليدية: التصغير بـ -chen يفرض das حتى لو كانت فتاة!',
        suffixRule: '-chen -> das (دايماً محياد)',
        gender: 'das',
        exampleDe: 'Das Mädchen liest ein Buch.',
        exampleAr: 'البنت تقرأ كتاباً.'
      },
      {
        id: 'de-l4-c8',
        frontAr: 'واحد / واحدة (أداة نكرة)',
        backDe: 'ein / eine',
        arabicPhonetic: 'آين / آينِه',
        thinkingHintAr: 'ein للمذكر والمحياد (der/das)، وeine للمؤنث (die).',
        exampleDe: 'Ich habe einen Hund und eine Katze.',
        exampleAr: 'عندي كلب وقطة.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l4-sb1',
        promptAr: 'الشقة كبيرة.',
        correctTokens: ['Die', 'Wohnung', 'ist', 'groß.'],
        distractors: ['Der', 'Das', 'ein'],
        verbSeatIndex: 2,
        cognitiveCoachHints: {
          'der wohnung ist groß': 'افتكر الشفرة: أي كلمة آخرها -ung زي Wohnung بتاخد die دايماً!',
        }
      },
      {
        id: 'de-l4-sb2',
        promptAr: 'الرجل يعمل هنا.',
        correctTokens: ['Der', 'Mann', 'arbeitet', 'hier.'],
        distractors: ['Die', 'Das', 'arbeiten'],
        verbSeatIndex: 2,
      },
      {
        id: 'de-l4-sb3',
        promptAr: 'الطفل يلعب في الحديقة.',
        correctTokens: ['Das', 'Kind', 'spielt', 'im', 'Garten.'],
        distractors: ['Der', 'Die', 'spielen'],
        verbSeatIndex: 2,
      },
      {
        id: 'de-l4-sb4',
        promptAr: 'البنت تقرأ كتاباً.',
        correctTokens: ['Das', 'Mädchen', 'liest', 'ein', 'Buch.'],
        distractors: ['Die', 'Der', 'lesen'],
        verbSeatIndex: 2,
        cognitiveCoachHints: {
          'die mädchen liest ein buch': 'خلي بالك! الكلمات المنتهية بـ -chen زي Mädchen بتاخد das محياد!',
        }
      },
      {
        id: 'de-l4-sb5',
        promptAr: 'المعلم تشريحه ممتاز.',
        correctTokens: ['Der', 'Lehrer', 'erklärt', 'sehr', 'gut.'],
        distractors: ['Die', 'Das', 'erklären'],
        verbSeatIndex: 2,
      }
    ],
    lightningMatches: [
      { id: 'de-l4-m1', arabicThought: 'الشقة (مؤنث)', germanPhrase: 'die Wohnung' },
      { id: 'de-l4-m2', arabicThought: 'الرجل (مذكر)', germanPhrase: 'der Mann' },
      { id: 'de-l4-m3', arabicThought: 'الطفل (محياد)', germanPhrase: 'das Kind' },
      { id: 'de-l4-m4', arabicThought: 'الفتاة (محياد -chen)', germanPhrase: 'das Mädchen' },
      { id: 'de-l4-m5', arabicThought: 'المعلم (مذكر -er)', germanPhrase: 'der Lehrer' },
      { id: 'de-l4-m6', arabicThought: 'الحرية (مؤنث -heit)', germanPhrase: 'die Freiheit' },
    ]
  },

  // ==========================================
  // LEVEL 5: A2 — Verb Sandwich & Akkusativ
  // ==========================================
  {
    id: 5,
    titleAr: '٥. ساندويتش الفعل وسر الـ Akkusativ',
    subtitleEn: 'The Verb Sandwich & Only der → den',
    cefr: 'A2',
    descriptionAr: 'الأفعال المساعدة وساندويتش الفعل + شفرة Akkusativ: الوحيدة اللي بتتغير هي der بتبقى den!',
    cards: [
      {
        id: 'de-l5-c1',
        frontAr: 'أستطيع (يمكنني)',
        backDe: 'ich kann',
        arabicPhonetic: 'إِيخْ كَانْ',
        thinkingHintAr: 'فعل مساعد modal verb! يأتي في الكرسي التاني، والفعل الأساسي برابط الساندويتش في آخر الجملة!',
        englishCognate: 'can',
        exampleDe: 'Ich kann Deutsch sprechen.',
        exampleAr: 'أقدر أتكلم ألماني.'
      },
      {
        id: 'de-l5-c2',
        frontAr: 'أريد / أرغب',
        backDe: 'ich möchte',
        arabicPhonetic: 'إِيخْ مُوشْتِه',
        thinkingHintAr: 'صيغة الطلب المؤدب. الفعل الآخر يذهب لآخر الجملة بصيغة المصدر.',
        exampleDe: 'Ich möchte einen Kaffee trinken.',
        exampleAr: 'أود أن أشرب قهوة.'
      },
      {
        id: 'de-l5-c3',
        frontAr: 'المفعول المذكر (der → den)',
        backDe: 'den / einen',
        arabicPhonetic: 'دِين / آينِين',
        thinkingHintAr: 'في حالة المفعول المباشر Akkusativ: die و das و الجمع لا يتغيرون إطلاقاً! فقط der تتحول إلى den.',
        suffixRule: 'الوحيدة اللي بتتغير في المفعول هي der -> den (و ein -> einen)!',
        exampleDe: 'Ich sehe den Mann.',
        exampleAr: 'أنا أرى الرجل.'
      },
      {
        id: 'de-l5-c4',
        frontAr: 'يتكلم (يتحدث)',
        backDe: 'sprechen',
        arabicPhonetic: 'شْبْرِيخِين',
        thinkingHintAr: 'شفرة sch: ينطق ش! ومع الأفعال المساعدة يوضع في الخانة الأخيرة بالمصدر.',
        englishCognate: 'speak',
        exampleDe: 'Können Sie Deutsch sprechen?',
        exampleAr: 'هل يمكنك التحدث بالألمانية؟'
      },
      {
        id: 'de-l5-c5',
        frontAr: 'يشرب',
        backDe: 'trinken',
        arabicPhonetic: 'تْرِينْكِين',
        thinkingHintAr: 'فعل يشرب المصدر مع ساندويتش الأفعال المساعدة.',
        englishCognate: 'drink',
        exampleDe: 'Er möchte Wasser trinken.',
        exampleAr: 'هو يريد شرب ماء.'
      },
      {
        id: 'de-l5-c6',
        frontAr: 'يجب أن',
        backDe: 'müssen',
        arabicPhonetic: 'مُوسِين',
        thinkingHintAr: 'فعل الوجوب مثل Must بالإنجليزي.',
        englishCognate: 'must',
        exampleDe: 'Ich muss heute arbeiten.',
        exampleAr: 'يجب أن أعمل اليوم.'
      },
      {
        id: 'de-l5-c7',
        frontAr: 'مفتاح (مذكر der Schlüssel)',
        backDe: 'den Schlüssel',
        arabicPhonetic: 'دِين شْلُوسِل',
        thinkingHintAr: 'لأن المفتاح مذكر der، في المفعول به يصبح den Schlüssel!',
        gender: 'der',
        exampleDe: 'Ich suche den Schlüssel.',
        exampleAr: 'أبحث عن المفتاح.'
      },
      {
        id: 'de-l5-c8',
        frontAr: 'تفاحة (مذكر der Apfel)',
        backDe: 'einen Apfel',
        arabicPhonetic: 'آينِين أَبْفِل',
        thinkingHintAr: 'تفاحة مذكر der -> في المفعول النكرة تأخذ einen Apfel!',
        englishCognate: 'Apple',
        gender: 'der',
        exampleDe: 'Ich esse einen Apfel.',
        exampleAr: 'آكل تفاحة.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l5-sb1',
        promptAr: 'أود أن أشرب قهوة.',
        correctTokens: ['Ich', 'möchte', 'einen', 'Kaffee', 'trinken.'],
        distractors: ['ein', 'der', 'trinke'],
        verbSeatIndex: 1,
        sandwichPair: [1, 4],
        cognitiveCoachHints: {
          'ich möchte trinken einen kaffee': 'افتكر ساندويتش الفعل! الفعل المساعد möchte في الكرسي التاني، والفعل الأساسي trinken في آخر الجملة خالص!',
          'ich möchte ein kaffee trinken': 'في المفعول به Akkusativ، كلمة Kaffee مذكر فتتحول ein إلى einen!',
        }
      },
      {
        id: 'de-l5-sb2',
        promptAr: 'أستطيع التحدث بالألمانية.',
        correctTokens: ['Ich', 'kann', 'Deutsch', 'sprechen.'],
        distractors: ['spreche', 'können', 'ist'],
        verbSeatIndex: 1,
        sandwichPair: [1, 3],
      },
      {
        id: 'de-l5-sb3',
        promptAr: 'أنا أرى الرجل.',
        correctTokens: ['Ich', 'sehe', 'den', 'Mann.'],
        distractors: ['der', 'das', 'dem'],
        verbSeatIndex: 1,
        cognitiveCoachHints: {
          'ich sehe der mann': 'في الـ Akkusativ، الوحيدة اللي بتتغير هي der بتبقى den!',
        }
      },
      {
        id: 'de-l5-sb4',
        promptAr: 'يجب أن أعمل اليوم.',
        correctTokens: ['Ich', 'muss', 'heute', 'arbeiten.'],
        distractors: ['arbeite', 'müssen', 'zu'],
        verbSeatIndex: 1,
        sandwichPair: [1, 3],
      },
      {
        id: 'de-l5-sb5',
        promptAr: 'هو يأكل تفاحة.',
        correctTokens: ['Er', 'isst', 'einen', 'Apfel.'],
        distractors: ['ein', 'der', 'eine'],
        verbSeatIndex: 1,
      }
    ],
    lightningMatches: [
      { id: 'de-l5-m1', arabicThought: 'أستطيع التحدث', germanPhrase: 'kann sprechen' },
      { id: 'de-l5-m2', arabicThought: 'أرغب في الشرب', germanPhrase: 'möchte trinken' },
      { id: 'de-l5-m3', arabicThought: 'أرى الرجل (Akkusativ)', germanPhrase: 'sehe den Mann' },
      { id: 'de-l5-m4', arabicThought: 'آكل تفاحة', germanPhrase: 'esse einen Apfel' },
      { id: 'de-l5-m5', arabicThought: 'أبحث عن المفتاح', germanPhrase: 'suche den Schlüssel' },
      { id: 'de-l5-m6', arabicThought: 'يجب أن أعمل', germanPhrase: 'muss arbeiten' },
    ]
  },

  // ==========================================
  // LEVEL 6: A2+ — Spoken Past & Separable Verbs
  // ==========================================
  {
    id: 6,
    titleAr: '٦. احكي يومك بالماضي والأفعال المنقسمة',
    subtitleEn: 'Perfekt Storytelling & Separable Verbs',
    cefr: 'A2+',
    descriptionAr: 'التحدث بالماضي المحكي (Perfekt) + الأفعال المنقسمة (trennbare Verben).',
    cards: [
      {
        id: 'de-l6-c1',
        frontAr: 'تعلمتُ (في الماضي)',
        backDe: 'habe gelernt',
        arabicPhonetic: 'ฮَابِه جِيلِيرْنْت',
        thinkingHintAr: 'الماضي المحكي Perfekt: habe في الكرسي التاني + التصريف الثالث ge-...-t في آخر الجملة!',
        exampleDe: 'Ich habe Deutsch gelernt.',
        exampleAr: 'أنا اتعلمت ألماني.'
      },
      {
        id: 'de-l6-c2',
        frontAr: 'يستيقظ (فعل منقسم aufstehen)',
        backDe: 'stehe ... auf',
        arabicPhonetic: 'شْتِيهِه ... أَوْف',
        thinkingHintAr: 'الأفعال المنقسمة ينفصل مقطعها الأمامي auf ويذهب لآخر الجملة!',
        exampleDe: 'Ich stehe um 7 Uhr auf.',
        exampleAr: 'أنا بصحى الساعة 7.'
      },
      {
        id: 'de-l6-c3',
        frontAr: 'سافرتُ / ذهبتُ (ماضي الحركة مع sein)',
        backDe: 'bin gereist / bin gegangen',
        arabicPhonetic: 'بِنْ جِيرَايْسْت / بِنْ جِيجَانْجِن',
        thinkingHintAr: 'أفعال الانتقال والحركة تأخذ sein (bin) بدلاً من haben!',
        exampleDe: 'Ich bin nach Berlin gefahren.',
        exampleAr: 'أنا سافرت لبرلين.'
      },
      {
        id: 'de-l6-c4',
        frontAr: 'يتسوق (einkaufen)',
        backDe: 'kaufe ... ein',
        arabicPhonetic: 'كَاوفِه ... آيْن',
        thinkingHintAr: 'فعل منقسم: ein تذهب إلى نهاية الجملة.',
        exampleDe: 'Ich kaufe im Supermarkt ein.',
        exampleAr: 'أنا بتسوق من السوبرماركت.'
      },
      {
        id: 'de-l6-c5',
        frontAr: 'شربتُ (ماضي)',
        backDe: 'habe getrunken',
        arabicPhonetic: 'ฮَابِه جِيتْرُونْكِين',
        thinkingHintAr: 'habe + getrunken في ساندويتش الماضي.',
        exampleDe: 'Ich habe einen Tee getrunken.',
        exampleAr: 'أنا شربت شاي.'
      },
      {
        id: 'de-l6-c6',
        frontAr: 'وصل (تصل الطائرة/القطار)',
        backDe: 'kommt ... an',
        arabicPhonetic: 'كُومْت ... أَن',
        thinkingHintAr: 'ankommen فعل منقسم: an في نهاية الجملة.',
        exampleDe: 'Der Zug kommt um 8 Uhr an.',
        exampleAr: 'القطار بيوصل الساعة 8.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l6-sb1',
        promptAr: 'أنا اتعلمت ألماني.',
        correctTokens: ['Ich', 'habe', 'Deutsch', 'gelernt.'],
        distractors: ['bin', 'lernen', 'lerne'],
        verbSeatIndex: 1,
        sandwichPair: [1, 3],
      },
      {
        id: 'de-l6-sb2',
        promptAr: 'أنا بصحى الساعة 7 صباحاً.',
        correctTokens: ['Ich', 'stehe', 'um', '7', 'Uhr', 'auf.'],
        distractors: ['aufstehen', 'bist', 'an'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l6-sb3',
        promptAr: 'أنا سافرت إلى برلين.',
        correctTokens: ['Ich', 'bin', 'nach', 'Berlin', 'gefahren.'],
        distractors: ['habe', 'fahren', 'ist'],
        verbSeatIndex: 1,
        sandwichPair: [1, 4],
      },
      {
        id: 'de-l6-sb4',
        promptAr: 'القطار يصل الآن.',
        correctTokens: ['Der', 'Zug', 'kommt', 'jetzt', 'an.'],
        distractors: ['ankommen', 'ist', 'gekommen'],
        verbSeatIndex: 2,
      }
    ],
    lightningMatches: [
      { id: 'de-l6-m1', arabicThought: 'اتعلمت (ماضي)', germanPhrase: 'habe gelernt' },
      { id: 'de-l6-m2', arabicThought: 'استيقظ (منقسم)', germanPhrase: 'stehe auf' },
      { id: 'de-l6-m3', arabicThought: 'سافرت (مع sein)', germanPhrase: 'bin gefahren' },
      { id: 'de-l6-m4', arabicThought: 'يتسوق', germanPhrase: 'kaufe ein' },
      { id: 'de-l6-m5', arabicThought: 'يصل القطار', germanPhrase: 'kommt an' },
    ]
  },

  // ==========================================
  // LEVEL 7: B1 — Dativ Recipients & Connectors
  // ==========================================
  {
    id: 7,
    titleAr: '٧. سر الـ Dativ ومغناطيس الروابط',
    subtitleEn: 'Dativ Recipients & Verb-to-End Connectors',
    cefr: 'B1',
    descriptionAr: 'حالة Dativ للمتلقي والموقع + روابط مثل weil و dass التي تسحب الفعل لآخر الجملة.',
    cards: [
      {
        id: 'de-l7-c1',
        frontAr: 'لي / معي (Dativ)',
        backDe: 'mir / mit mir',
        arabicPhonetic: 'مِير / مِت مِير',
        thinkingHintAr: 'Dativ هو درع المتلقي أو الشخص المستفيد (إليّ / معي).',
        exampleDe: 'Du hilfst mir.',
        exampleAr: 'أنت تساعدني.'
      },
      {
        id: 'de-l7-c2',
        frontAr: 'لأن (روابط تسحب الفعل للآخر)',
        backDe: 'weil',
        arabicPhonetic: 'ڤَايْل',
        thinkingHintAr: 'weil تعمل مثل المغناطيس القوي! تسحب الفعل المصرف إلى نهاية الجملة تماماً.',
        exampleDe: 'Ich lerne Deutsch, weil es wichtig ist.',
        exampleAr: 'بتعلم ألماني لأنه مهم.'
      },
      {
        id: 'de-l7-c3',
        frontAr: 'أن (رابطة dass)',
        backDe: 'dass',
        arabicPhonetic: 'دَاس',
        thinkingHintAr: 'تسحب الفعل المصرف إلى نهاية الجملة.',
        exampleDe: 'Ich weiß, dass du recht hast.',
        exampleAr: 'أعرف أنك على حق.'
      },
      {
        id: 'de-l7-c4',
        frontAr: 'مع الرجل (Dativ mit dem)',
        backDe: 'mit dem Mann',
        arabicPhonetic: 'مِت دِيم مَان',
        thinkingHintAr: 'حرف الجر mit يفرض Dativ دائماً! فتتحول der إلى dem.',
        exampleDe: 'Ich spreche mit dem Mann.',
        exampleAr: 'أتحدث مع الرجل.'
      },
      {
        id: 'de-l7-c5',
        frontAr: 'على الطاولة (موقع Dativ)',
        backDe: 'auf dem Tisch',
        arabicPhonetic: 'أَوْف دِيم تِيش',
        thinkingHintAr: 'عند تحديد المكان الثابت (أين؟)، der Tisch تتحول إلى dem Tisch.',
        exampleDe: 'Das Buch liegt auf dem Tisch.',
        exampleAr: 'الكتاب موضوع على الطاولة.'
      },
      {
        id: 'de-l7-c6',
        frontAr: 'برغم أن',
        backDe: 'obwohl',
        arabicPhonetic: 'أُوبْ فُول',
        thinkingHintAr: 'رابط تناقض مغناطيسي يسحب الفعل للنهاية.',
        exampleDe: 'Ich gehe spazieren, obwohl es regnet.',
        exampleAr: 'أمشي برغم أنها تمطر.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l7-sb1',
        promptAr: 'بتعلم ألماني لأنه مهم.',
        correctTokens: ['Ich', 'lerne', 'Deutsch,', 'weil', 'es', 'wichtig', 'ist.'],
        distractors: ['ist', 'weil', 'sehr'],
        verbSeatIndex: 1,
        cognitiveCoachHints: {
          'ich lerne deutsch weil es ist wichtig': 'افتكر مغناطيس weil! الرابطة weil بتسحب الفعل ist لآخر الجملة خالص: weil es wichtig ist!',
        }
      },
      {
        id: 'de-l7-sb2',
        promptAr: 'أتحدث مع الرجل.',
        correctTokens: ['Ich', 'spreche', 'mit', 'dem', 'Mann.'],
        distractors: ['den', 'der', 'das'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l7-sb3',
        promptAr: 'أعرف أنك قادم.',
        correctTokens: ['Ich', 'weiß,', 'dass', 'du', 'kommst.'],
        distractors: ['kommst', 'dass', 'ist'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l7-sb4',
        promptAr: 'الكتاب موضوع على الطاولة.',
        correctTokens: ['Das', 'Buch', 'liegt', 'auf', 'dem', 'Tisch.'],
        distractors: ['den', 'der', 'das'],
        verbSeatIndex: 2,
      }
    ],
    lightningMatches: [
      { id: 'de-l7-m1', arabicThought: 'تساعدني (Dativ)', germanPhrase: 'hilfst mir' },
      { id: 'de-l7-m2', arabicThought: 'لأنه مهم (weil... ist)', germanPhrase: 'weil es wichtig ist' },
      { id: 'de-l7-m3', arabicThought: 'مع الرجل (mit dem)', germanPhrase: 'mit dem Mann' },
      { id: 'de-l7-m4', arabicThought: 'على الطاولة (auf dem)', germanPhrase: 'auf dem Tisch' },
      { id: 'de-l7-m5', arabicThought: 'رغم أنها تمطر', germanPhrase: 'obwohl es regnet' },
    ]
  },

  // ==========================================
  // LEVEL 8: B1+ / B2 — Real Life & Konjunktiv II
  // ==========================================
  {
    id: 8,
    titleAr: '٨. ألماني الحياة والشغل والجامعة',
    subtitleEn: 'Real Life in Germany & Polite Konjunktiv II',
    cefr: 'B1+ / B2',
    descriptionAr: 'اللباقة والطلب المؤدب würd/könnt + سيناريوهات الدراسة والعمل والأوراق الرسمية.',
    cards: [
      {
        id: 'de-l8-c1',
        frontAr: 'كنت أود (طلب مؤدب جداً)',
        backDe: 'Ich hätte gern ...',
        arabicPhonetic: 'إِيخْ هِيتِه جِيرْن',
        thinkingHintAr: 'أرقى وألطف طريقة لطلب أي شيء في المطاعم والمكاتب في ألمانيا.',
        exampleDe: 'Ich hätte gern eine Information.',
        exampleAr: 'كنت أود الحصول على معلومة.'
      },
      {
        id: 'de-l8-c2',
        frontAr: 'هل يمكنك مساعدتي؟ (مؤدب)',
        backDe: 'Könnten Sie mir helfen?',
        arabicPhonetic: 'كُونْتِين زِي مِير هِيلْفِين',
        thinkingHintAr: 'Konjunktiv II لطلب المساعدة بلباقة عالية في ألمانيا.',
        exampleDe: 'Entschuldigung, könnten Sie mir helfen?',
        exampleAr: 'عذراً، هل يمكنك مساعدتي؟'
      },
      {
        id: 'de-l8-c3',
        frontAr: 'تسجيل الشقة / الإقامة (Anmeldung)',
        backDe: 'die Anmeldung',
        arabicPhonetic: 'دِي آنْمِيلْدُونْج',
        thinkingHintAr: 'أهم خطوة رسمية عند الاستقرار في ألمانيا (تسجيل العنوان الرسمي).',
        gender: 'die',
        exampleDe: 'Ich brauche einen Termin für die Anmeldung.',
        exampleAr: 'أحتاج موعداً لتسجيل الإقامة.'
      },
      {
        id: 'de-l8-c4',
        frontAr: 'سيرة ذاتية / التقديم للشغل',
        backDe: 'die Bewerbung',
        arabicPhonetic: 'دِي بِيڤِيرْبُونْج',
        thinkingHintAr: 'النهاية -ung تعني مؤنث die.',
        gender: 'die',
        exampleDe: 'Ich habe meine Bewerbung geschickt.',
        exampleAr: 'أرسلت طلب التقديم الخاص بي.'
      },
      {
        id: 'de-l8-c5',
        frontAr: 'يتم كتابة التقرير (المبني للمجهول Passiv)',
        backDe: 'wird geschrieben',
        arabicPhonetic: 'ڤِيرْد جِيشْرِيبِين',
        thinkingHintAr: 'المبني للمجهول في بيئة العمل: wird + التصريف الثالث.',
        exampleDe: 'Der Bericht wird heute geschrieben.',
        exampleAr: 'التقرير يُكتب اليوم.'
      },
      {
        id: 'de-l8-c6',
        frontAr: 'كنت سأفعل (لو...)',
        backDe: 'würde machen',
        arabicPhonetic: 'ڤُورْدِه مَاخِين',
        thinkingHintAr: 'التفكير الشرطي والفرضيات بالإسبانية والألمانية.',
        exampleDe: 'Ich würde das gerne machen.',
        exampleAr: 'كنت سأفعل ذلك بسرور.'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l8-sb1',
        promptAr: 'كنت أود الحصول على معلومة من فضلك.',
        correctTokens: ['Ich', 'hätte', 'gern', 'eine', 'Information,', 'bitte.'],
        distractors: ['habe', 'will', 'einen'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l8-sb2',
        promptAr: 'هل يمكنك مساعدتي من فضلك؟',
        correctTokens: ['Könnten', 'Sie', 'mir', 'bitte', 'helfen?'],
        distractors: ['können', 'mich', 'geholfen'],
        verbSeatIndex: 0,
      },
      {
        id: 'de-l8-sb3',
        promptAr: 'أحتاج موعداً لتسجيل الإقامة.',
        correctTokens: ['Ich', 'brauche', 'einen', 'Termin', 'für', 'die', 'Anmeldung.'],
        distractors: ['ein', 'der', 'dem'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l8-sb4',
        promptAr: 'التقرير يُكتب اليوم.',
        correctTokens: ['Der', 'Bericht', 'wird', 'heute', 'geschrieben.'],
        distractors: ['ist', 'schreiben', 'hat'],
        verbSeatIndex: 2,
      }
    ],
    lightningMatches: [
      { id: 'de-l8-m1', arabicThought: 'كنت أود (طلب مؤدب)', germanPhrase: 'Ich hätte gern' },
      { id: 'de-l8-m2', arabicThought: 'هل يمكنك مساعدتي؟', germanPhrase: 'Könnten Sie helfen?' },
      { id: 'de-l8-m3', arabicThought: 'تسجيل السكن', germanPhrase: 'die Anmeldung' },
      { id: 'de-l8-m4', arabicThought: 'التقديم للوظيفة', germanPhrase: 'die Bewerbung' },
      { id: 'de-l8-m5', arabicThought: 'يُكتب اليوم (Passiv)', germanPhrase: 'wird geschrieben' },
    ]
  },

  // ==========================================
  // LEVEL 9: C1 — Academic & Technical Fluency
  // ==========================================
  {
    id: 9,
    titleAr: '٩. طلاقة الأكاديميين والمهندسين (C1)',
    subtitleEn: 'Academic & Technical German Fluency',
    cefr: 'C1',
    descriptionAr: 'الصياغة الأكاديمية والتركيبات الاسميّة المتطورة ومناقشة الأبحاث والحلول الهندسية.',
    cards: [
      {
        id: 'de-l9-c1',
        frontAr: 'بناءً على / استناداً إلى',
        backDe: 'aufgrund von',
        arabicPhonetic: 'أَوْف جْرُونْد فُون',
        thinkingHintAr: 'تركيب أكاديمي راقٍ للتعبير عن السبب والنتائج في الأبحاث والتقارير.',
        exampleDe: 'Aufgrund von neuen Daten ändern wir den Plan.',
        exampleAr: 'بناءً على بيانات جديدة سنغير الخطة.'
      },
      {
        id: 'de-l9-c2',
        frontAr: 'التحول إلى اسم (Nominalisierung)',
        backDe: 'das Entwickeln / die Entwicklung',
        arabicPhonetic: 'دَاس إِينْتڤِيكِلْن / دِي إِينْتڤِيكْلُونْج',
        thinkingHintAr: 'في اللغة الألمانية الأكاديمية C1 يتم تحويل الأفعال إلى أسماء دقيقة.',
        exampleDe: 'Die Entwicklung neuer Technologien ist essenziell.',
        exampleAr: 'تطوير تقنيات جديدة أمر جوهري.'
      },
      {
        id: 'de-l9-c3',
        frontAr: 'من المستحسن أن...',
        backDe: 'Es empfiehlt sich, zu ...',
        arabicPhonetic: 'إِس إِيمْبْفِيلْت زِيخْ، تْسُو',
        thinkingHintAr: 'صياغة علمية محايدة للتوصيات الأكاديمية الهندسية.',
        exampleDe: 'Es empfiehlt sich, diese Methode zu nutzen.',
        exampleAr: 'من المستحسن استخدام هذه الطريقة.'
      },
      {
        id: 'de-l9-c4',
        frontAr: 'مع مراعاة / أخذ العلم',
        backDe: 'unter Berücksichtigung von',
        arabicPhonetic: 'أُونْتِر بَيْرُوكْسِيخْتِيغُونْج فُون',
        thinkingHintAr: 'تعبير C1 دقيق في التقارير الهندسية والعلمية.',
        exampleDe: 'Unter Berücksichtigung aller Faktoren.',
        exampleAr: 'مع مراعاة جميع العوامل.'
      },
      {
        id: 'de-l9-c5',
        frontAr: 'الحل المقترح',
        backDe: 'die vorgeschlagene Lösung',
        arabicPhonetic: 'دِي فُورْجِيشْلَاجِنِه لُوزُونْج',
        thinkingHintAr: 'استخدام الصفات المشتقة من اسم المفعول Partizip II.',
        exampleDe: 'Die vorgeschlagene Lösung ist effizient.',
        exampleAr: 'الحل المقترح كفء للغاية.'
      },
      {
        id: 'de-l9-c6',
        frontAr: 'باختصار / ختاماً',
        backDe: 'Zusammenfassend lässt sich sagen',
        arabicPhonetic: 'تْسُوزَامِنْ فَاسِينْد لِسْت زِيخْ زَاجِين',
        thinkingHintAr: 'العبارة القياسية لختام الأوراق والمناقشات العلمية.',
        exampleDe: 'Zusammenfassend lässt sich sagen, dass...',
        exampleAr: 'ختاماً يمكن القول أن...'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l9-sb1',
        promptAr: 'بناءً على البيانات نغير الخطة.',
        correctTokens: ['Aufgrund', 'von', 'neuen', 'Daten', 'ändern', 'wir', 'den', 'Plan.'],
        distractors: ['weil', 'geändert', 'der'],
        verbSeatIndex: 4,
      },
      {
        id: 'de-l9-sb2',
        promptAr: 'من المستحسن استخدام هذه الطريقة.',
        correctTokens: ['Es', 'empfiehlt', 'sich,', 'diese', 'Methode', 'zu', 'nutzen.'],
        distractors: ['ist', 'genutzt', 'dass'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l9-sb3',
        promptAr: 'تطوير تقنيات جديدة أمر حاسم.',
        correctTokens: ['Die', 'Entwicklung', 'neuer', 'Technologien', 'ist', 'essenziell.'],
        distractors: ['das', 'entwickeln', 'sind'],
        verbSeatIndex: 4,
      },
      {
        id: 'de-l9-sb4',
        promptAr: 'ختاماً يمكن القول أن النتيجة ممتازة.',
        correctTokens: ['Zusammenfassend', 'lässt', 'sich', 'sagen,', 'dass', 'das', 'Ergebnis', 'gut', 'ist.'],
        distractors: ['ist', 'weil', 'hat'],
        verbSeatIndex: 1,
      }
    ],
    lightningMatches: [
      { id: 'de-l9-m1', arabicThought: 'بناءً على (أكاديمي)', germanPhrase: 'aufgrund von' },
      { id: 'de-l9-m2', arabicThought: 'من المستحسن أن', germanPhrase: 'Es empfiehlt sich' },
      { id: 'de-l9-m3', arabicThought: 'مع مراعاة', germanPhrase: 'unter Berücksichtigung' },
      { id: 'de-l9-m4', arabicThought: 'الحل المقترح', germanPhrase: 'vorgeschlagene Lösung' },
      { id: 'de-l9-m5', arabicThought: 'ختاماً يمكن القول', germanPhrase: 'Zusammenfassend lässt sich sagen' },
    ]
  },

  // ==========================================
  // LEVEL 10: C1+ — The German Bridge Master
  // ==========================================
  {
    id: 10,
    titleAr: '١. قمة الإتقان: حكيم الجسر الألماني',
    subtitleEn: 'C1+ Greatness — The German Bridge Master',
    cefr: 'C1+',
    descriptionAr: 'اختبار طلاقة التفكير الفوري بالألمانية بدون ترجمة، والتحدث والتفاوض القيادي المتقدم.',
    cards: [
      {
        id: 'de-l10-c1',
        frontAr: 'طلاقة التفكير الفوري',
        backDe: 'spontane Sprachkompetenz',
        arabicPhonetic: 'شْبُونْتَانِه شْبْرَاخْ كُومْبِيتِينْتْس',
        thinkingHintAr: 'الوصول إلى البناء التلقائي المباشر باللغة الألمانية.',
        exampleDe: 'Er verfügt über spontane Sprachkompetenz.',
        exampleAr: 'يمتلك كفاءة لغوية تلقائية.'
      },
      {
        id: 'de-l10-c2',
        frontAr: 'بلا أدنى شك',
        backDe: 'ohne jeden Zweifel',
        arabicPhonetic: 'أُونِه يِيدِين تْسڤَايْفِل',
        thinkingHintAr: 'تعبير تفاوضي وإقناعي عالي المستوى.',
        exampleDe: 'Das ist ohne jeden Zweifel die beste Option.',
        exampleAr: 'هذا بلا أدنى شك الخيار الأفضل.'
      },
      {
        id: 'de-l10-c3',
        frontAr: 'تحقيق الهدف الإستراتيجي',
        backDe: 'das strategische Ziel erreichen',
        arabicPhonetic: 'دَاسْ شْتْرَاتِيجِيشِه تْسِيل أَيْرَايْخِين',
        thinkingHintAr: 'مصطلحات التفكير القيادي والتنفيذي بالألمانية.',
        exampleDe: 'Wir haben das strategische Ziel erreicht.',
        exampleAr: 'حقّقنا الهدف الإستراتيجي.'
      },
      {
        id: 'de-l10-c4',
        frontAr: 'التفكير بدون ترجمة داخلية',
        backDe: 'Denken ohne innere Übersetzung',
        arabicPhonetic: 'دِينْكِين أُونِه إنِرِه أُوبِرْسِتْسُونْج',
        thinkingHintAr: 'الهدف الأسمى لجسر التفكير العربي ↔ الألماني!',
        exampleDe: 'Das Ziel ist das Denken ohne innere Übersetzung.',
        exampleAr: 'الهدف هو التفكير المباشر بدون ترجمة داخلية.'
      },
      {
        id: 'de-l10-c5',
        frontAr: 'قدرة التفاوض العالية',
        backDe: 'die Verhandlungsstärke',
        arabicPhonetic: 'دِي فِيرْهَانْدْلُونْجْس شْتِيرْكِه',
        thinkingHintAr: 'اسم مؤنث -ung تعني die.',
        gender: 'die',
        exampleDe: 'Verhandlungsstärke ist im Beruf wichtig.',
        exampleAr: 'قوة التفاوض مهمة في العمل.'
      },
      {
        id: 'de-l10-c6',
        frontAr: 'حكيم الجسر الألمانية',
        backDe: 'der Meister der deutschen Brücke',
        arabicPhonetic: 'دِير مَاايْسْتِر دِير دُويْتِشِين بْرُوكِه',
        thinkingHintAr: 'لقب وسام الإتقان النهائي لمستوى C1+!',
        exampleDe: 'Herzlichen Glückwunsch! Du bist der Meister!',
        exampleAr: 'مبروك! أنت الآن حكيم الجسر الألماني!'
      }
    ],
    sentenceBuilders: [
      {
        id: 'de-l10-sb1',
        promptAr: 'هذا بلا أدنى شك الخيار الأفضل.',
        correctTokens: ['Das', 'ist', 'ohne', 'jeden', 'Zweifel', 'die', 'beste', 'Option.'],
        distractors: ['kein', 'der', 'nicht'],
        verbSeatIndex: 1,
      },
      {
        id: 'de-l10-sb2',
        promptAr: 'حقّقنا الهدف الإستراتيجي بنجاح.',
        correctTokens: ['Wir', 'haben', 'das', 'strategische', 'Ziel', 'erfolgreich', 'erreicht.'],
        distractors: ['sind', 'der', 'erreichen'],
        verbSeatIndex: 1,
        sandwichPair: [1, 6],
      },
      {
        id: 'de-l10-sb3',
        promptAr: 'الهدف هو التفكير بدون ترجمة داخلية.',
        correctTokens: ['Das', 'Ziel', 'ist', 'das', 'Denken', 'ohne', 'innere', 'Übersetzung.'],
        distractors: ['der', 'nicht', 'mit'],
        verbSeatIndex: 2,
      },
      {
        id: 'de-l10-sb4',
        promptAr: 'مبروك! أنت حكيم الجسر الألماني.',
        correctTokens: ['Glückwunsch!', 'Du', 'bist', 'der', 'Meister', 'der', 'Brücke.'],
        distractors: ['das', 'die', 'ist'],
        verbSeatIndex: 2,
      }
    ],
    lightningMatches: [
      { id: 'de-l10-m1', arabicThought: 'بلا أدنى شك', germanPhrase: 'ohne jeden Zweifel' },
      { id: 'de-l10-m2', arabicThought: 'الهدف الإستراتيجي', germanPhrase: 'strategisches Ziel' },
      { id: 'de-l10-m3', arabicThought: 'التفكير بدون ترجمة', germanPhrase: 'Denken ohne Übersetzung' },
      { id: 'de-l10-m4', arabicThought: 'قوة التفاوض', germanPhrase: 'die Verhandlungsstärke' },
      { id: 'de-l10-m5', arabicThought: 'حكيم الجسر الألماني', germanPhrase: 'Meister der deutschen Brücke' },
    ]
  }
];
