import { SourceLanguage, TargetLanguage, LanguagePair } from '../types';

export interface LanguageMeta {
  code: string;
  nameEn: string;
  nameNative: string;
  nameAr: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  descriptionEn: string;
  descriptionAr: string;
  badge: string;
}

export interface LanguageConfig {
  code: string;
  nameEn: string;
  nameAr: string;
  flag: string;
  defaultVoice: string;
}

export const SOURCE_LANGUAGES: Record<SourceLanguage, LanguageMeta> = {
  ar: {
    code: 'ar',
    nameEn: 'Arabic',
    nameNative: 'العربية',
    nameAr: 'العربية',
    flag: '🇪🇬',
    direction: 'rtl',
    descriptionEn: 'I currently think in Arabic',
    descriptionAr: 'لغتي الأم والتفكير التلقائي بالعربية',
    badge: 'الأم'
  },
  en: {
    code: 'en',
    nameEn: 'English',
    nameNative: 'English',
    nameAr: 'الإنجليزية',
    flag: '🇬🇧',
    direction: 'ltr',
    descriptionEn: 'I currently think in English',
    descriptionAr: 'أفكر حالياً بالإنجليزية',
    badge: 'Fluent'
  },
  de: {
    code: 'de',
    nameEn: 'German',
    nameNative: 'Deutsch',
    nameAr: 'الألمانية',
    flag: '🇩🇪',
    direction: 'ltr',
    descriptionEn: 'I currently think in German',
    descriptionAr: 'أفكر حالياً بالألمانية',
    badge: 'Native'
  },
  es: {
    code: 'es',
    nameEn: 'Spanish',
    nameNative: 'Español',
    nameAr: 'الإسبانية',
    flag: '🇪🇸',
    direction: 'ltr',
    descriptionEn: 'I currently think in Spanish',
    descriptionAr: 'أفكر حالياً بالإسبانية',
    badge: 'Native'
  },
  ja: {
    code: 'ja',
    nameEn: 'Japanese',
    nameNative: '日本語',
    nameAr: 'اليابانية',
    flag: '🇯🇵',
    direction: 'ltr',
    descriptionEn: 'I currently think in Japanese',
    descriptionAr: 'أفكر حالياً باليابانية',
    badge: 'Native'
  },
  fr: {
    code: 'fr',
    nameEn: 'French',
    nameNative: 'Français',
    nameAr: 'الفرنسية',
    flag: '🇫🇷',
    direction: 'ltr',
    descriptionEn: 'I currently think in French',
    descriptionAr: 'أفكر حالياً بالفرنسية',
    badge: 'Native'
  },
  zh: {
    code: 'zh',
    nameEn: 'Chinese',
    nameNative: '中文',
    nameAr: 'الصينية',
    flag: '🇨🇳',
    direction: 'ltr',
    descriptionEn: 'I currently think in Chinese',
    descriptionAr: 'أفكر حالياً بالصينية',
    badge: 'Native'
  },
  hi: {
    code: 'hi',
    nameEn: 'Hindi',
    nameNative: 'हिन्दी',
    nameAr: 'الهندية',
    flag: '🇮🇳',
    direction: 'ltr',
    descriptionEn: 'I currently think in Hindi',
    descriptionAr: 'أفكر حالياً بالهندية',
    badge: 'Native'
  },
  ru: {
    code: 'ru',
    nameEn: 'Russian',
    nameNative: 'Русский',
    nameAr: 'الروسية',
    flag: '🇷🇺',
    direction: 'ltr',
    descriptionEn: 'I currently think in Russian',
    descriptionAr: 'أفكر حالياً بالروسية',
    badge: 'Native'
  },
  pt: {
    code: 'pt',
    nameEn: 'Portuguese',
    nameNative: 'Português',
    nameAr: 'البرتغالية',
    flag: '🇧🇷',
    direction: 'ltr',
    descriptionEn: 'I currently think in Portuguese',
    descriptionAr: 'أفكر حالياً بالبرتغالية',
    badge: 'Native'
  },
  it: {
    code: 'it',
    nameEn: 'Italian',
    nameNative: 'Italiano',
    nameAr: 'الإيطالية',
    flag: '🇮🇹',
    direction: 'ltr',
    descriptionEn: 'I currently think in Italian',
    descriptionAr: 'أفكر حالياً بالإيطالية',
    badge: 'Native'
  }
};

export const TARGET_LANGUAGE_META: Record<TargetLanguage, LanguageMeta> = {
  en: {
    code: 'en',
    nameEn: 'English',
    nameNative: 'English',
    nameAr: 'الإنجليزية',
    flag: '🇬🇧',
    direction: 'ltr',
    descriptionEn: 'Think directly in English without internal translation',
    descriptionAr: 'تعلّم التفكير بالإنجليزية مباشرة بدون ترجمة في الدماغ',
    badge: 'Popular'
  },
  de: {
    code: 'de',
    nameEn: 'German',
    nameNative: 'Deutsch',
    nameAr: 'الألمانية',
    flag: '🇩🇪',
    direction: 'ltr',
    descriptionEn: 'Master German syntax (V2 rule, der/die/das & cases)',
    descriptionAr: 'أتقن البناء الألماني (قاعدة الفعل الثاني، أدوات التعريف، والحالات الإعرابية)',
    badge: 'Neu'
  },
  ja: {
    code: 'ja',
    nameEn: 'Japanese',
    nameNative: '日本語',
    nameAr: 'اليابانية',
    flag: '🇯🇵',
    direction: 'ltr',
    descriptionEn: 'Think in SOV structure, particles (は, を, に), and natural context',
    descriptionAr: 'فكر بمنطق (الفاعل - المفعول - الفعل)، أدوات الجملة، وسياق الحديث الطبيعي',
    badge: '人気'
  },
  es: {
    code: 'es',
    nameEn: 'Spanish',
    nameNative: 'Español',
    nameAr: 'الإسبانية',
    flag: '🇪🇸',
    direction: 'ltr',
    descriptionEn: 'Master Spanish grammar and vocabulary',
    descriptionAr: 'أتقن قواعد ومفردات اللغة الإسبانية',
    badge: 'Global'
  },
  fr: {
    code: 'fr',
    nameEn: 'French',
    nameNative: 'Français',
    nameAr: 'الفرنسية',
    flag: '🇫🇷',
    direction: 'ltr',
    descriptionEn: 'Learn French pronunciation and phrasing',
    descriptionAr: 'تعلم النطق والتراكيب الفرنسية',
    badge: 'Global'
  },
  zh: {
    code: 'zh',
    nameEn: 'Chinese (Mandarin)',
    nameNative: '中文',
    nameAr: 'الصينية (الماندرين)',
    flag: '🇨🇳',
    direction: 'ltr',
    descriptionEn: 'Master Chinese characters and tones',
    descriptionAr: 'أتقن الرموز الصينية والنغمات',
    badge: 'Global'
  },
  hi: {
    code: 'hi',
    nameEn: 'Hindi',
    nameNative: 'हिन्दी',
    nameAr: 'الهندية',
    flag: '🇮🇳',
    direction: 'ltr',
    descriptionEn: 'Think in Hindi syntax and phrasing',
    descriptionAr: 'فكر بمنطق البناء والجمل الهندية',
    badge: 'Global'
  },
  ru: {
    code: 'ru',
    nameEn: 'Russian',
    nameNative: 'Русский',
    nameAr: 'الروسية',
    flag: '🇷🇺',
    direction: 'ltr',
    descriptionEn: 'Master Russian cases and cyrillic',
    descriptionAr: 'أتقن الحالات الإعرابية والأبجدية السيريلية',
    badge: 'Global'
  },
  pt: {
    code: 'pt',
    nameEn: 'Portuguese',
    nameNative: 'Português',
    nameAr: 'البرتغالية',
    flag: '🇧🇷',
    direction: 'ltr',
    descriptionEn: 'Learn Portuguese vocabulary and grammar',
    descriptionAr: 'تعلم المفردات والقواعد البرتغالية',
    badge: 'Global'
  },
  it: {
    code: 'it',
    nameEn: 'Italian',
    nameNative: 'Italiano',
    nameAr: 'الإيطالية',
    flag: '🇮🇹',
    direction: 'ltr',
    descriptionEn: 'Think natively in Italian',
    descriptionAr: 'فكر مباشرة باللغة الإيطالية',
    badge: 'Global'
  }
};

export const TARGET_LANGUAGES: LanguageConfig[] = [
  { code: 'en', nameEn: 'English', nameAr: 'الإنجليزية', flag: '🇬🇧', defaultVoice: 'en-US-AvaNeural' },
  { code: 'de', nameEn: 'German', nameAr: 'الألمانية', flag: '🇩🇪', defaultVoice: 'de-DE-KatjaNeural' },
  { code: 'ja', nameEn: 'Japanese', nameAr: 'اليابانية', flag: '🇯🇵', defaultVoice: 'ja-JP-NanamiNeural' },
  { code: 'es', nameEn: 'Spanish', nameAr: 'الإسبانية', flag: '🇪🇸', defaultVoice: 'es-ES-ElviraNeural' },
  { code: 'fr', nameEn: 'French', nameAr: 'الفرنسية', flag: '🇫🇷', defaultVoice: 'fr-FR-DeniseNeural' },
  { code: 'zh', nameEn: 'Chinese', nameAr: 'الصينية (الماندرين)', flag: '🇨🇳', defaultVoice: 'zh-CN-XiaoxiaoNeural' },
  { code: 'hi', nameEn: 'Hindi', nameAr: 'الهندية', flag: '🇮🇳', defaultVoice: 'hi-IN-SwaraNeural' },
  { code: 'ru', nameEn: 'Russian', nameAr: 'الروسية', flag: '🇷🇺', defaultVoice: 'ru-RU-SvetlanaNeural' },
  { code: 'pt', nameEn: 'Portuguese', nameAr: 'البرتغالية', flag: '🇧🇷', defaultVoice: 'pt-BR-FranciscaNeural' },
  { code: 'it', nameEn: 'Italian', nameAr: 'الإيطالية', flag: '🇮🇹', defaultVoice: 'it-IT-IsabellaNeural' },
];

export const TARGET_LANGUAGE_LOCALES: Record<TargetLanguage, string> = {
  en: 'en-US',
  de: 'de-DE',
  ja: 'ja-JP',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
};

export interface LanguagePairConfig {
  id: string;
  source: SourceLanguage;
  target: TargetLanguage;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  bridgeConceptAr: string;
  bridgeConceptEn: string;
}

const CURATED_SUPPORTED_PAIRS: LanguagePairConfig[] = [
  {
    id: 'ar-en',
    source: 'ar',
    target: 'en',
    titleAr: 'فكّر إنجليزي · Thinking English',
    titleEn: 'Think English · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from Arabic to English',
    bridgeConceptAr: 'التخلص من فخ الأفعال المخفية وحروف الجر المباشرة',
    bridgeConceptEn: 'Overcoming hidden copula omission and preposition interference'
  },
  {
    id: 'ar-de',
    source: 'ar',
    target: 'de',
    titleAr: 'فكّر ألماني · Denke auf Deutsch',
    titleEn: 'Think German · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الألمانية',
    taglineEn: 'The cognitive transfer bridge from Arabic to German',
    bridgeConceptAr: 'إتقان مكان الفعل الصارم (V2)، أدوات التعريف الثلاث، وتصريف المفعول به',
    bridgeConceptEn: 'Mastering the strict V2 verb position, 3 genders, and accusative shifts'
  },
  {
    id: 'ar-ja',
    source: 'ar',
    target: 'ja',
    titleAr: 'فكّر ياباني · 日本語で考えよう',
    titleEn: 'Think Japanese · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى اليابانية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Japanese',
    bridgeConceptAr: 'وضع الفعل دائماً في نهاية الجملة (SOV)، وإتقان حروف المعاني (は / を / に)',
    bridgeConceptEn: 'Placing the verb strictly at the end (SOV) and mastering particle mechanics'
  },
  {
    id: 'ar-es',
    source: 'ar',
    target: 'es',
    titleAr: 'فكّر إسباني · Piensa en Español',
    titleEn: 'Think Spanish · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الإسبانية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Spanish',
    bridgeConceptAr: 'التكيف مع تصريفات الأفعال وتوافق الجنس والرقم في الإسبانية',
    bridgeConceptEn: 'Adapting to verb conjugations and gender/number agreement in Spanish'
  },
  {
    id: 'ar-fr',
    source: 'ar',
    target: 'fr',
    titleAr: 'فكّر فرنسي · Pense en Français',
    titleEn: 'Think French · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الفرنسية',
    taglineEn: 'The cognitive transfer bridge from Arabic to French',
    bridgeConceptAr: 'إتقان نطق اللغة الفرنسية وبناء الجمل المركبة',
    bridgeConceptEn: 'Mastering French pronunciation and complex sentence structure'
  },
  {
    id: 'ar-zh',
    source: 'ar',
    target: 'zh',
    titleAr: 'فكّر صيني · 用中文思考',
    titleEn: 'Think Chinese · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الصينية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Chinese',
    bridgeConceptAr: 'فهم النغمات وبناء الجمل بدون تصريف أفعال',
    bridgeConceptEn: 'Understanding tones and building sentences without verb conjugation'
  },
  {
    id: 'ar-hi',
    source: 'ar',
    target: 'hi',
    titleAr: 'فكّر هندي · हिंदी में सोचें',
    titleEn: 'Think Hindi · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الهندية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Hindi',
    bridgeConceptAr: 'بناء الجمل (SOV) واستخدام الحروف المساعدة بعد الاسم',
    bridgeConceptEn: 'SOV structure and using postpositions'
  },
  {
    id: 'ar-ru',
    source: 'ar',
    target: 'ru',
    titleAr: 'فكّر روسي · Думай по-русски',
    titleEn: 'Think Russian · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الروسية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Russian',
    bridgeConceptAr: 'التكيف مع الحالات الإعرابية الستة ونظام الأفعال المكتملة/غير المكتملة',
    bridgeConceptEn: 'Adapting to the six cases and the aspect system of verbs'
  },
  {
    id: 'ar-pt',
    source: 'ar',
    target: 'pt',
    titleAr: 'فكّر برتغالي · Pense em Português',
    titleEn: 'Think Portuguese · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى البرتغالية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Portuguese',
    bridgeConceptAr: 'إتقان الأزمنة المعقدة والأصوات الأنفية',
    bridgeConceptEn: 'Mastering complex tenses and nasal sounds'
  },
  {
    id: 'ar-it',
    source: 'ar',
    target: 'it',
    titleAr: 'فكّر إيطالي · Pensa in Italiano',
    titleEn: 'Think Italian · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الإيطالية',
    taglineEn: 'The cognitive transfer bridge from Arabic to Italian',
    bridgeConceptAr: 'التكيف مع التوافق وإسقاط الفاعل كما في العربية',
    bridgeConceptEn: 'Adapting to agreement and pro-drop similar to Arabic'
  },
  {
    id: 'en-de',
    source: 'en',
    target: 'de',
    titleAr: 'من الإنجليزية للألمانية · Think German',
    titleEn: 'Think German · From English',
    taglineAr: 'جسر الانتقال الإدراكي من الإنجليزية إلى الألمانية',
    taglineEn: 'The cognitive transfer bridge from English to German',
    bridgeConceptAr: 'الانتقال من ترتيب SVO المرن إلى قاعدة الفعل الثاني (V2) وتصريف الحالات',
    bridgeConceptEn: 'Moving from rigid SVO to German V2 verb placement and grammatical cases'
  },
  {
    id: 'en-ja',
    source: 'en',
    target: 'ja',
    titleAr: 'من الإنجليزية لليابانية · Think Japanese',
    titleEn: 'Think Japanese · From English',
    taglineAr: 'جسر الانتقال الإدراكي من الإنجليزية إلى اليابانية',
    taglineEn: 'The cognitive transfer bridge from English to Japanese',
    bridgeConceptAr: 'التحول من ترتيب SVO إلى SOV وحذف الضمائر الزائدة في السياق الطبيعي',
    bridgeConceptEn: 'Switching from SVO to SOV order, topic markers (wa vs ga), and natural pronoun dropping'
  },
  {
    id: 'en-es',
    source: 'en',
    target: 'es',
    titleAr: 'من الإنجليزية للإسبانية · Piensa en Español',
    titleEn: 'Think Spanish · From English',
    taglineAr: 'دماغك يفكر إسباني من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to Spanish',
    bridgeConceptAr: 'التكيف مع التصريفات والتوافق',
    bridgeConceptEn: 'Adapting to verb conjugations and agreement'
  },
  {
    id: 'en-fr',
    source: 'en',
    target: 'fr',
    titleAr: 'من الإنجليزية للفرنسية · Pense en Français',
    titleEn: 'Think French · From English',
    taglineAr: 'دماغك يفكر فرنسي من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to French',
    bridgeConceptAr: 'إتقان نطق اللغة الفرنسية وبناء الجمل',
    bridgeConceptEn: 'Mastering French pronunciation and sentence structure'
  },
  {
    id: 'en-zh',
    source: 'en',
    target: 'zh',
    titleAr: 'من الإنجليزية للصينية · 用中文思考',
    titleEn: 'Think Chinese · From English',
    taglineAr: 'دماغك يفكر صيني من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to Chinese',
    bridgeConceptAr: 'فهم النغمات وبناء الجمل',
    bridgeConceptEn: 'Understanding tones and building sentences'
  },
  {
    id: 'en-hi',
    source: 'en',
    target: 'hi',
    titleAr: 'من الإنجليزية للهندية · हिंदी में सोचें',
    titleEn: 'Think Hindi · From English',
    taglineAr: 'دماغك يفكر هندي من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to Hindi',
    bridgeConceptAr: 'بناء الجمل (SOV)',
    bridgeConceptEn: 'SOV structure and using postpositions'
  },
  {
    id: 'en-ru',
    source: 'en',
    target: 'ru',
    titleAr: 'من الإنجليزية للروسية · Думай по-русски',
    titleEn: 'Think Russian · From English',
    taglineAr: 'دماغك يفكر روسي من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to Russian',
    bridgeConceptAr: 'التكيف مع الحالات الإعرابية',
    bridgeConceptEn: 'Adapting to the six cases and aspect system'
  },
  {
    id: 'en-pt',
    source: 'en',
    target: 'pt',
    titleAr: 'من الإنجليزية للبرتغالية · Pense em Português',
    titleEn: 'Think Portuguese · From English',
    taglineAr: 'دماغك يفكر برتغالي من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to Portuguese',
    bridgeConceptAr: 'إتقان الأزمنة المعقدة',
    bridgeConceptEn: 'Mastering complex tenses and nasal sounds'
  },
  {
    id: 'en-it',
    source: 'en',
    target: 'it',
    titleAr: 'من الإنجليزية للإيطالية · Pensa in Italiano',
    titleEn: 'Think Italian · From English',
    taglineAr: 'دماغك يفكر إيطالي من الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from English to Italian',
    bridgeConceptAr: 'التكيف مع التوافق وإسقاط الفاعل',
    bridgeConceptEn: 'Adapting to agreement and pro-drop'
  }
];

export const SUPPORTED_PAIRS: LanguagePairConfig[] = Object.keys(SOURCE_LANGUAGES)
  .flatMap((sourceCode) => Object.keys(TARGET_LANGUAGE_META)
    .filter((targetCode) => targetCode !== sourceCode)
    .map((targetCode) => {
      const source = sourceCode as SourceLanguage;
      const target = targetCode as TargetLanguage;
      const curatedPair = CURATED_SUPPORTED_PAIRS.find(
        (pair) => pair.source === source && pair.target === target
      );
      if (curatedPair) return curatedPair;

      const sourceMeta = SOURCE_LANGUAGES[source];
      const targetMeta = TARGET_LANGUAGE_META[target];
      return {
        id: `${source}-${target}`,
        source,
        target,
        titleAr: `من ${sourceMeta.nameAr} إلى ${targetMeta.nameAr}`,
        titleEn: `Think ${targetMeta.nameEn} · From ${sourceMeta.nameEn}`,
        taglineAr: `جسر التحول الذهني من ${sourceMeta.nameAr} إلى ${targetMeta.nameAr}`,
        taglineEn: `Build direct thinking habits from ${sourceMeta.nameEn} into ${targetMeta.nameEn}`,
        bridgeConceptAr: `قارن تركيب ${targetMeta.nameAr} بلغتك الحالية وتدرّب على بناء الجمل مباشرة.`,
        bridgeConceptEn: `Compare ${targetMeta.nameEn} structures with your current language and practice building sentences directly.`,
      };
    }));

export function isValidPair(source: string, target: string): boolean {
  return SUPPORTED_PAIRS.some(p => p.source === source && p.target === target);
}

export function getPairConfig(source: SourceLanguage, target: TargetLanguage): LanguagePairConfig {
  const match = SUPPORTED_PAIRS.find(p => p.source === source && p.target === target);
  if (match) return match;
  // Fallback to default
  return SUPPORTED_PAIRS[0];
}
