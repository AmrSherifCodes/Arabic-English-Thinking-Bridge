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

export const SOURCE_LANGUAGES: Record<SourceLanguage, LanguageMeta> = {
  ar: {
    code: 'ar',
    nameEn: 'Arabic',
    nameNative: 'العربية',
    nameAr: 'العربية',
    flag: '🇪🇬',
    direction: 'rtl',
    descriptionEn: 'I currently think in Arabic (Mother Tongue)',
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
  }
};

export const TARGET_LANGUAGES: Record<TargetLanguage, LanguageMeta> = {
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
  }
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

export const SUPPORTED_PAIRS: LanguagePairConfig[] = [
  {
    id: 'ar-en',
    source: 'ar',
    target: 'en',
    titleAr: 'فكّر إنجليزي · Thinking English',
    titleEn: 'Think English · From Arabic',
    taglineAr: 'جسر التحول الذهني من العربية إلى الإنجليزية',
    taglineEn: 'The cognitive transfer bridge from Arabic to English',
    bridgeConceptAr: 'التخلص من فخ الكينونة المحذوفة وحروف الجر المباشرة',
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
  }
];

export function isValidPair(source: string, target: string): boolean {
  return SUPPORTED_PAIRS.some(p => p.source === source && p.target === target);
}

export function getPairConfig(source: SourceLanguage, target: TargetLanguage): LanguagePairConfig {
  const match = SUPPORTED_PAIRS.find(p => p.source === source && p.target === target);
  if (match) return match;
  // Fallback to default
  return SUPPORTED_PAIRS[0];
}

