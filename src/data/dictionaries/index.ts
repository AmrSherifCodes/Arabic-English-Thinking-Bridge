import { SourceLanguage, TargetLanguage } from '../../types';
import { normalizeTtsLang } from '../../utils/offlineTts';

export * from './types';
import { DictWordEntry } from './types';
import { ARABIC_DICTIONARY } from './arabicDictionary';

const loadedDictionaryCache: Record<string, DictWordEntry[]> = {};

const CORE_TOP5_DICTIONARY_ENTRIES: Record<string, Array<{
  word: string;
  arabicTranslation: string;
  englishTranslation: string;
  phoneticAr: string;
  partOfSpeech: string;
  isCore: boolean;
}>> = {
  en: [
    { word: 'water', arabicTranslation: 'ماء / مية', englishTranslation: 'water', phoneticAr: 'ووتر', partOfSpeech: 'noun', isCore: true },
    { word: 'book', arabicTranslation: 'كتاب', englishTranslation: 'book', phoneticAr: 'بوك', partOfSpeech: 'noun', isCore: true },
    { word: 'house', arabicTranslation: 'منزل / بيت', englishTranslation: 'house', phoneticAr: 'هاوس', partOfSpeech: 'noun', isCore: true },
    { word: 'hello', arabicTranslation: 'مرحباً / أهلاً', englishTranslation: 'hello', phoneticAr: 'هالو', partOfSpeech: 'phrase', isCore: true },
    { word: 'thank you', arabicTranslation: 'شكراً جزيلاً', englishTranslation: 'thank you', phoneticAr: 'ثانك يو', partOfSpeech: 'phrase', isCore: true },
    { word: 'friend', arabicTranslation: 'صديق', englishTranslation: 'friend', phoneticAr: 'فريند', partOfSpeech: 'noun', isCore: true },
    { word: 'time', arabicTranslation: 'وقت', englishTranslation: 'time', phoneticAr: 'تايم', partOfSpeech: 'noun', isCore: true },
    { word: 'good', arabicTranslation: 'جيد / كويس', englishTranslation: 'good', phoneticAr: 'جود', partOfSpeech: 'adjective', isCore: true },
    { word: 'eat', arabicTranslation: 'يأكل', englishTranslation: 'eat', phoneticAr: 'إيت', partOfSpeech: 'verb', isCore: true },
    { word: 'go', arabicTranslation: 'يذهب', englishTranslation: 'go', phoneticAr: 'جو', partOfSpeech: 'verb', isCore: true },
  ],
  de: [
    { word: 'Wasser', arabicTranslation: 'ماء', englishTranslation: 'water', phoneticAr: 'ڤاسر', partOfSpeech: 'noun', isCore: true },
    { word: 'Buch', arabicTranslation: 'كتاب', englishTranslation: 'book', phoneticAr: 'بوخ', partOfSpeech: 'noun', isCore: true },
    { word: 'Haus', arabicTranslation: 'منزل / بيت', englishTranslation: 'house', phoneticAr: 'هاوس', partOfSpeech: 'noun', isCore: true },
    { word: 'Hallo', arabicTranslation: 'مرحباً / أهلاً', englishTranslation: 'hello', phoneticAr: 'هالو', partOfSpeech: 'phrase', isCore: true },
    { word: 'Danke', arabicTranslation: 'شكراً', englishTranslation: 'thank you', phoneticAr: 'دانكه', partOfSpeech: 'phrase', isCore: true },
    { word: 'Freund', arabicTranslation: 'صديق', englishTranslation: 'friend', phoneticAr: 'فرويند', partOfSpeech: 'noun', isCore: true },
    { word: 'Zeit', arabicTranslation: 'وقت', englishTranslation: 'time', phoneticAr: 'تسايت', partOfSpeech: 'noun', isCore: true },
    { word: 'gut', arabicTranslation: 'جيد', englishTranslation: 'good', phoneticAr: 'جوت', partOfSpeech: 'adjective', isCore: true },
    { word: 'essen', arabicTranslation: 'يأكل', englishTranslation: 'eat', phoneticAr: 'إيسن', partOfSpeech: 'verb', isCore: true },
    { word: 'gehen', arabicTranslation: 'يذهب', englishTranslation: 'go', phoneticAr: 'جيهن', partOfSpeech: 'verb', isCore: true },
  ],
  fr: [
    { word: 'eau', arabicTranslation: 'ماء', englishTranslation: 'water', phoneticAr: 'أو', partOfSpeech: 'noun', isCore: true },
    { word: 'livre', arabicTranslation: 'كتاب', englishTranslation: 'book', phoneticAr: 'ليڤر', partOfSpeech: 'noun', isCore: true },
    { word: 'maison', arabicTranslation: 'منزل / بيت', englishTranslation: 'house', phoneticAr: 'ميزون', partOfSpeech: 'noun', isCore: true },
    { word: 'bonjour', arabicTranslation: 'مرحباً / صباح الخير', englishTranslation: 'hello', phoneticAr: 'بونجور', partOfSpeech: 'phrase', isCore: true },
    { word: 'merci', arabicTranslation: 'شكراً', englishTranslation: 'thank you', phoneticAr: 'ميرسي', partOfSpeech: 'phrase', isCore: true },
    { word: 'ami', arabicTranslation: 'صديق', englishTranslation: 'friend', phoneticAr: 'أمي', partOfSpeech: 'noun', isCore: true },
    { word: 'temps', arabicTranslation: 'وقت', englishTranslation: 'time', phoneticAr: 'تون', partOfSpeech: 'noun', isCore: true },
    { word: 'bon', arabicTranslation: 'جيد', englishTranslation: 'good', phoneticAr: 'بون', partOfSpeech: 'adjective', isCore: true },
    { word: 'manger', arabicTranslation: 'يأكل', englishTranslation: 'eat', phoneticAr: 'مونجيه', partOfSpeech: 'verb', isCore: true },
    { word: 'aller', arabicTranslation: 'يذهب', englishTranslation: 'go', phoneticAr: 'أليه', partOfSpeech: 'verb', isCore: true },
  ],
  es: [
    { word: 'agua', arabicTranslation: 'ماء', englishTranslation: 'water', phoneticAr: 'أغوا', partOfSpeech: 'noun', isCore: true },
    { word: 'libro', arabicTranslation: 'كتاب', englishTranslation: 'book', phoneticAr: 'ليبرو', partOfSpeech: 'noun', isCore: true },
    { word: 'casa', arabicTranslation: 'منزل / بيت', englishTranslation: 'house', phoneticAr: 'كاسا', partOfSpeech: 'noun', isCore: true },
    { word: 'hola', arabicTranslation: 'مرحباً / أهلاً', englishTranslation: 'hello', phoneticAr: 'أولا', partOfSpeech: 'phrase', isCore: true },
    { word: 'gracias', arabicTranslation: 'شكراً', englishTranslation: 'thank you', phoneticAr: 'جراثياس', partOfSpeech: 'phrase', isCore: true },
    { word: 'amigo', arabicTranslation: 'صديق', englishTranslation: 'friend', phoneticAr: 'أميغو', partOfSpeech: 'noun', isCore: true },
    { word: 'tiempo', arabicTranslation: 'وقت', englishTranslation: 'time', phoneticAr: 'تييمبو', partOfSpeech: 'noun', isCore: true },
    { word: 'bueno', arabicTranslation: 'جيد', englishTranslation: 'good', phoneticAr: 'بوينو', partOfSpeech: 'adjective', isCore: true },
    { word: 'comer', arabicTranslation: 'يأكل', englishTranslation: 'eat', phoneticAr: 'كومير', partOfSpeech: 'verb', isCore: true },
    { word: 'ir', arabicTranslation: 'يذهب', englishTranslation: 'go', phoneticAr: 'إير', partOfSpeech: 'verb', isCore: true },
    { word: 'hablar', arabicTranslation: 'يتحدث / يتكلم', englishTranslation: 'speak', phoneticAr: 'أبلار', partOfSpeech: 'verb', isCore: true },
  ],
  tr: [
    { word: 'su', arabicTranslation: 'ماء / مية', englishTranslation: 'water', phoneticAr: 'سو', partOfSpeech: 'noun', isCore: true },
    { word: 'kitap', arabicTranslation: 'كتاب', englishTranslation: 'book', phoneticAr: 'كيتاب', partOfSpeech: 'noun', isCore: true },
    { word: 'ev', arabicTranslation: 'منزل / بيت', englishTranslation: 'house', phoneticAr: 'إيڤ', partOfSpeech: 'noun', isCore: true },
    { word: 'merhaba', arabicTranslation: 'مرحباً / أهلاً', englishTranslation: 'hello', phoneticAr: 'مرحبا', partOfSpeech: 'phrase', isCore: true },
    { word: 'teşekkür ederim', arabicTranslation: 'شكراً جزيلاً', englishTranslation: 'thank you', phoneticAr: 'تيشكور إيديريم', partOfSpeech: 'phrase', isCore: true },
    { word: 'arkadaş', arabicTranslation: 'صديق', englishTranslation: 'friend', phoneticAr: 'أركاداش', partOfSpeech: 'noun', isCore: true },
    { word: 'zaman', arabicTranslation: 'وقت', englishTranslation: 'time', phoneticAr: 'زامان', partOfSpeech: 'noun', isCore: true },
    { word: 'iyi', arabicTranslation: 'جيد', englishTranslation: 'good', phoneticAr: 'إيي', partOfSpeech: 'adjective', isCore: true },
    { word: 'yemek', arabicTranslation: 'يأكل / طعام', englishTranslation: 'eat', phoneticAr: 'ييميك', partOfSpeech: 'verb', isCore: true },
    { word: 'gitmek', arabicTranslation: 'يذهب', englishTranslation: 'go', phoneticAr: 'جيتميك', partOfSpeech: 'verb', isCore: true },
  ],
};

function getCoreEntriesForLang(targetLang: string): DictWordEntry[] {
  const list = CORE_TOP5_DICTIONARY_ENTRIES[targetLang] || [];
  return list.map((item, idx) =>
    normalizeDictEntry(
      {
        ...item,
        translation: `${item.arabicTranslation} (${item.englishTranslation})`,
        arabicWord: item.arabicTranslation,
      },
      targetLang,
      idx
    )
  );
}

// Script & Transliteration Mappings
const RU_MAP: Record<string, string> = {
  а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'yo', ж:'zh', з:'z', и:'i', й:'y',
  к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f',
  х:'kh', ц:'ts', ч:'ch', ш:'sh', щ:'shch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya',
  А:'A', Б:'B', В:'V', Г:'G', Д:'D', Е:'E', Ё:'Yo', Ж:'Zh', З:'Z', И:'I', Й:'Y',
  К:'K', Л:'L', М:'M', Н:'N', О:'O', Π:'P', Р:'R', С:'S', Т:'T', У:'U', Ф:'F',
  Х:'Kh', Ц:'Ts', Ч:'Ch', Ш:'Sh', Щ:'Shch', Ъ:'', Ы:'Y', Ь:'', Э:'E', Ю:'Yu', Я:'Ya'
};

const HI_MAP: Record<string, string> = {
  'अ':'a', 'आ':'aa', 'इ':'i', 'ई':'ee', 'उ':'u', 'ऊ':'oo', 'ए':'e', 'ऐ':'ai', 'ओ':'o', 'औ':'au',
  'क':'ka', 'ख':'kha', 'ग':'ga', 'घ':'gha', 'च':'cha', 'छ':'chha', 'ج':'ja', 'झ':'jha',
  'ट':'ta', 'ठ':'tha', 'ड':'da', 'ढ':'dha', 'ण':'na', 'त':'ta', 'थ':'tha', 'द':'da',
  'ध':'dha', 'न':'na', 'प':'pa', 'फ':'pha', 'ब':'ba', 'भ':'bha', 'म':'ma', 'य':'ya',
  'र':'ra', 'ल':'la', 'व':'va', 'श':'sha', 'ष':'sha', 'स':'sa', 'ह':'ha', 'ा':'a',
  'ि':'i', 'ी':'ee', 'ु':'u', 'ू':'oo', 'े':'e', 'ै':'ai', 'ो':'o', 'ौ':'au', '्':''
};

const EL_MAP: Record<string, string> = {
  α:'a', β:'v', γ:'g', δ:'d', ε:'e', ζ:'z', η:'i', θ:'th', ι:'i', κ:'k', λ:'l',
  μ:'m', ν:'n', ξ:'x', ο:'o', π:'p', ρ:'r', σ:'s', ς:'s', τ:'t', υ:'y', φ:'f',
  χ:'ch', ψ:'ps', ω:'o', Α:'A', Β:'V', Γ:'G', Δ:'D', Ε:'E', Ζ:'Z', Η:'I', Θ:'Th',
  Ι:'I', Κ:'K', Λ:'L', Μ:'M', Ν:'N', Ξ:'X', Ο:'O', Π:'P', Ρ:'R', Σ:'S', Τ:'T',
  Υ:'Y', Φ:'F', Χ:'Ch', Ψ:'Ps', Ω:'O'
};

const HE_MAP: Record<string, string> = {
  'א':'a', 'ב':'b', 'ג':'g', 'ד':'d', 'ה':'h', 'ו':'v', 'ז':'z', 'ח':'ch', 'ט':'t',
  'י':'y', 'כ':'k', 'ך':'k', 'ל':'l', 'מ':'m', 'ם':'m', 'נ':'n', 'ן':'n', 'ס':'s',
  'ע':'a', 'פ':'p', 'ף':'f', 'צ':'tz', 'ץ':'tz', 'ק':'k', 'ר':'r', 'ש':'sh', 'ת':'t'
};

const AR_MAP: Record<string, string> = {
  'ا':'a', 'أ':'a', 'إ':'i', 'آ':'aa', 'ب':'b', 'ت':'t', 'ث':'th', 'ج':'j', 'ح':'h', 'خ':'kh',
  'د':'d', 'ذ':'dh', 'ر':'r', 'ز':'z', 'س':'s', 'ش':'sh', 'ص':'s', 'ض':'d', 'ط':'t', 'ظ':'z',
  'ع':'a', 'غ':'gh', 'ف':'f', 'ق':'q', 'ك':'k', 'ل':'l', 'م':'m', 'ن':'n', 'ه':'h', 'و':'w',
  'ي':'y', 'ة':'h', 'ى':'a', 'ء':'a'
};

function transliterateString(str: string, map: Record<string, string>): string {
  if (!str) return '';
  return str.split('').map(c => map[c] ?? c).join('');
}

export function derivePhonetic(word: string, lang: string): string {
  if (!word) return '';
  if (lang === 'ru') return transliterateString(word, RU_MAP);
  if (lang === 'hi') return transliterateString(word, HI_MAP);
  if (lang === 'el') return transliterateString(word, EL_MAP);
  if (lang === 'he') return transliterateString(word, HE_MAP);
  if (['ar', 'arz', 'apc', 'afb', 'ary'].includes(lang)) return transliterateString(word, AR_MAP);
  if (lang === 'zh') return `Pinyin: ${word}`;
  if (lang === 'ja') return `Kana: ${word}`;
  return `[${word}]`;
}

export function sanitizeDictionaryTranslation(raw: string): string {
  if (!raw) return '';
  const cleaned = raw
    .replace(/\bverbal noun of\b/gi, 'act/noun')
    .replace(/\bplural of\b/gi, 'multiple')
    .replace(/\binflection of\b/gi, 'form')
    .replace(/\bdiminutive of\b/gi, 'small')
    .replace(/\balternative (?:form|spelling) of\b/gi, 'variant')
    .replace(/\bapocopic form of\b/gi, 'short form')
    .replace(/\bpast participle of\b/gi, 'past form')
    .replace(/\bpresent participle of\b/gi, 'active form')
    .replace(/\b(?:first|second|third)-person singular\b/gi, 'conjugated')
    .replace(/\b(?:feminine|masculine) singular of\b/gi, 'singular')
    .replace(/;\s*;/g, ';')
    .replace(/^[;,\s]+|[;,\s]+$/g, '')
    .trim();
  return cleaned || 'meaning';
}

export function suppressRedundantPhonetic(rawPhonetic: string, word: string): string {
  if (!rawPhonetic || !word) return '';
  const cleanWord = word.trim();
  let p = rawPhonetic.trim();
  const wLower = cleanWord.toLowerCase();
  const pLower = p.toLowerCase();
  if (
    pLower === wLower ||
    pLower === `[${wLower}]` ||
    pLower === `(${wLower})` ||
    pLower === `([${wLower}])`
  ) {
    return '';
  }
  // Strip trailing "(word)" or "[word]" if already shown next to word
  const escapedWord = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  p = p
    .replace(new RegExp(`\\s*\\(${escapedWord}\\)\\s*$`, 'i'), '')
    .replace(new RegExp(`\\s*\\[${escapedWord}\\]\\s*$`, 'i'), '')
    .trim();
  if (!p || p.toLowerCase() === wLower || p.toLowerCase() === `[${wLower}]`) {
    return '';
  }
  return p;
}

export function derivePartOfSpeech(word: string, translation: string, lang: string): string {
  const w = (word || '').toLowerCase();
  const t = (translation || '').toLowerCase();
  if (w.startsWith('to ') || w.endsWith('en') || w.endsWith('ar') || w.endsWith('er') || w.endsWith('ir') || w.endsWith('mak') || w.endsWith('mek') || w.startsWith('ל')) {
    return 'verb';
  }
  if (w.endsWith('ly') || w.endsWith('mente') || w.endsWith('ment')) {
    return 'adverb';
  }
  if (w.endsWith('ful') || w.endsWith('ous') || w.endsWith('able') || w.endsWith('isch') || w.endsWith('oso') || w.endsWith('al')) {
    return 'adjective';
  }
  if (w.includes(' ') || t.includes(' ')) {
    return 'phrase';
  }
  return 'noun';
}

export function deriveCefrLevel(index: number, total: number = 2000): string {
  const ratio = index / Math.max(total, 1);
  if (ratio < 0.15) return 'A0';
  if (ratio < 0.40) return 'A1';
  if (ratio < 0.70) return 'A2';
  if (ratio < 0.90) return 'B1';
  if (ratio < 0.98) return 'B2';
  return 'C1';
}

function generateExampleTarget(word: string, lang: string): string {
  switch (lang) {
    case 'de': return `Das Wort "${word}" ist wichtig im Alltag.`;
    case 'es': return `La palabra "${word}" es muy importante.`;
    case 'fr': return `Le mot "${word}" est très important dans la vie.`;
    case 'it': return `La parola "${word}" è molto importante.`;
    case 'pt': return `A palavra "${word}" é muito importante.`;
    case 'ja': return `「${word}」をよく使います。`;
    case 'zh': return `这个词“${word}”在日常生活中很有用。`;
    case 'ru': return `Слово «${word}» очень полезно в общении.`;
    case 'hi': return `यह शब्द "${word}" बहुत उपयोगी है।`;
    case 'el': return `Η λέξη "${word}" είναι πολύ χρήσιμη.`;
    case 'he': return `המילה "${word}" שימושית מאוד.`;
    case 'tr': return `"${word}" kelimesi günlük hayatta çok kullanılır.`;
    case 'ar': case 'arz': case 'apc': case 'afb': case 'ary':
      return `كلمة "${word}" مستخدمة كثيراً في المحادثات.`;
    default: return `The word "${word}" is essential in everyday practice.`;
  }
}

function generateExampleSource(translation: string, lang: string): string {
  return `استحضر المعنى: "${translation}" في سياق الجملة.`;
}

function generateCognitiveHint(word: string, translation: string, phonetic: string, lang: string): string {
  const pStr = phonetic ? ` (نطق: ${phonetic})` : '';
  return `استحضر المعنى المباشر لـ ${word}${pStr} = "${translation}" دون ترجمة حرفية.`;
}

export function normalizeDictEntry(entry: any, targetLang: string, index: number = 0): DictWordEntry {
  const word = (
    entry.word ||
    entry.term ||
    entry.germanWord ||
    entry.kanji ||
    entry.tr ||
    entry.spanishWord ||
    entry.frenchWord ||
    entry.arabicWord ||
    entry.targetTerm ||
    ''
  ).trim();

  const rawTranslation = (
    entry.translation ||
    entry.arabicWord ||
    entry.arabicTranslation ||
    entry.englishTranslation ||
    entry.ar ||
    entry.en ||
    entry.sourceTerm ||
    ''
  ).trim();
  const translation = sanitizeDictionaryTranslation(rawTranslation);

  let phonetic = (
    entry.phonetic ||
    entry.phoneticAr ||
    entry.reading ||
    entry.romaji ||
    entry.pinyin ||
    entry.transliteration ||
    entry.readingFurigana ||
    ''
  ).trim();

  if (!phonetic && word) {
    phonetic = derivePhonetic(word, targetLang);
  }

  let partOfSpeech = (entry.partOfSpeech || entry.pos || '').toLowerCase().trim();
  if (!partOfSpeech) {
    partOfSpeech = derivePartOfSpeech(word, translation, targetLang);
  }

  let cefrLevel = deriveCefrLevel(index, 2000);

  let exampleTarget = (
    entry.exampleTarget ||
    entry.exampleDe ||
    entry.exampleSentenceGerman ||
    entry.exampleSentenceJapanese ||
    entry.exampleSentence ||
    (entry.examples?.[0]?.targetSentence) ||
    ''
  ).trim();

  let exampleSource = (
    entry.exampleSource ||
    entry.exampleAr ||
    entry.exampleSentenceEnglish ||
    (entry.examples?.[0]?.sourceSentences?.ar || entry.examples?.[0]?.sourceSentences?.en) ||
    ''
  ).trim();

  if (!exampleTarget && word) {
    exampleTarget = generateExampleTarget(word, targetLang);
  }
  if (!exampleSource && translation) {
    exampleSource = generateExampleSource(translation, targetLang);
  }

  let cognitiveHint = (
    entry.cognitiveHint ||
    entry.usageHint ||
    entry.habitHint ||
    entry.suffixRule ||
    entry.egyptianMeaning ||
    ''
  ).trim();

  if (!cognitiveHint && word) {
    cognitiveHint = generateCognitiveHint(word, translation, phonetic, targetLang);
  }

  return {
    ...entry,
    word,
    translation,
    term: word,
    phonetic,
    phoneticAr: phonetic,
    reading: phonetic,
    romaji: phonetic,
    partOfSpeech,
    cefrLevel,
    cefr: cefrLevel,
    exampleTarget,
    exampleSource,
    exampleDe: exampleTarget,
    exampleAr: exampleSource,
    exampleSentence: exampleTarget,
    cognitiveHint,
    usageHint: cognitiveHint,
    habitHint: cognitiveHint,
    arabicWord: targetLang === 'en' ? translation : entry.arabicWord || translation,
    englishTranslation: targetLang === 'en' ? word : entry.englishTranslation || translation,
  };
}

export const DICTIONARY_LOADERS: Record<string, () => Promise<DictWordEntry[]>> = {
  de: async () => {
    const mainDict = (await import('./germanDictionary')).GERMAN_DICTIONARY as unknown as DictWordEntry[];
    const { GERMAN_BRIDGE_LEXICON } = await import('../germanBridgeLexicon');
    const bridgeEntries = GERMAN_BRIDGE_LEXICON.map((item) => ({
      word: item.article ? `${item.article} ${item.de}` : item.de,
      translation: item.ar,
      term: item.de,
      germanWord: item.de,
      arabicWord: item.ar,
      article: item.article,
      plural: item.plural,
      phoneticAr: item.phoneticAr,
      englishCognate: item.englishCognate,
      exampleDe: item.exampleDe,
      exampleAr: item.exampleAr,
    })) as unknown as DictWordEntry[];
    return [...bridgeEntries, ...mainDict].map((e, idx) => normalizeDictEntry(e, 'de', idx));
  },
  ja: async () => ((await import('./japaneseDictionary')).JAPANESE_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'ja', idx)),
  es: async () => ((await import('./spanishDictionary')).SPANISH_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'es', idx)),
  fr: async () => ((await import('./frenchDictionary')).FRENCH_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'fr', idx)),
  zh: async () => ((await import('./chineseDictionary')).CHINESE_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'zh', idx)),
  hi: async () => ((await import('./hindiDictionary')).HINDI_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'hi', idx)),
  ru: async () => ((await import('./russianDictionary')).RUSSIAN_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'ru', idx)),
  pt: async () => ((await import('./portugueseDictionary')).PORTUGUESE_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'pt', idx)),
  it: async () => ((await import('./italianDictionary')).ITALIAN_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'it', idx)),
  el: async () => ((await import('./greekDictionary')).GREEK_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'el', idx)),
  tr: async () => ((await import('./trDictionary')).trDictionary as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'tr', idx)),
  he: async () => ((await import('./hebrewDictionary')).HEBREW_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'he', idx)),
  en: async () => ((await import('./arabicDictionary')).ARABIC_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'en', idx)),
  ar: async () => ((await import('./arabicDictionary')).ARABIC_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'ar', idx)),
  arz: async () => ((await import('./egyptianArabicDictionary')).EGYPTIANARABIC_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'arz', idx)),
  apc: async () => ((await import('./levantineArabicDictionary')).LEVANTINEARABIC_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'apc', idx)),
  afb: async () => ((await import('./gulfArabicDictionary')).GULFARABIC_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'afb', idx)),
  ary: async () => ((await import('./moroccanArabicDictionary')).MOROCCANARABIC_DICTIONARY as unknown as DictWordEntry[]).map((e, idx) => normalizeDictEntry(e, 'ary', idx)),
};

export async function getTargetDictionaryAsync(targetLang: string): Promise<DictWordEntry[]> {
  const match = loadedDictionaryCache[targetLang];
  if (match) return match;
  const coreEntries = getCoreEntriesForLang(targetLang);
  if (targetLang === 'en' || targetLang === 'ar') {
    const dict = [
      ...coreEntries,
      ...ARABIC_DICTIONARY.map((e, idx) => normalizeDictEntry(e, targetLang, idx + coreEntries.length)),
    ];
    loadedDictionaryCache[targetLang] = dict;
    return dict;
  }
  const loader = DICTIONARY_LOADERS[targetLang];
  if (loader) {
    try {
      const loaded = await loader();
      const dict = [...coreEntries, ...loaded];
      loadedDictionaryCache[targetLang] = dict;
      return dict;
    } catch (err) {
      console.warn(`[DictionaryLoader] Failed to load dictionary for ${targetLang}`, err);
    }
  }
  return coreEntries;
}

export function getTargetDictionary(targetLang: string): DictWordEntry[] {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV && typeof window !== 'undefined' && !(window as any)._dictProbe) {
    (window as any)._dictProbe = true;
    console.log('[DICT-PROBE] getTargetDictionary called:', targetLang);
  }
  const match = loadedDictionaryCache[targetLang];
  if (match) return match;
  void getTargetDictionaryAsync(targetLang);
  return [];
}

export async function preloadDictionaries(langs: string[]): Promise<void> {
  await Promise.all(langs.map((l) => getTargetDictionaryAsync(l)));
}

function extractEntryWord(entry: any): string {
  return entry.word || entry.term || entry.germanWord || entry.kanji || entry.romaji || '';
}

function extractEntryTranslation(entry: any, sourceLang: string): string {
  return (
    entry.translation ||
    entry.englishTranslation ||
    entry.arabicTranslation ||
    (entry.sourceMeanings?.[sourceLang] ?? '')
  );
}

export function scoreDictionaryMatch(
  word: string,
  translation: string,
  clean: string,
  entry?: any
): number {
  const q = clean.toLowerCase().trim();
  if (!q) return 0;
  const w = (word || '').toLowerCase().trim();
  const wNoArticle = w.replace(/^(der|die|das|el|la|los|las|le|les|un|une)\s+/i, '').trim();
  const t = (translation || '').toLowerCase().trim();
  const enT = (entry?.englishTranslation || '').toLowerCase().trim();
  const arT = (entry?.arabicTranslation || entry?.arabicWord || '').toLowerCase().trim();
  const isCore = Boolean(entry?.isCore);

  if (!w && !t && !enT && !arT) return 0;

  if (w === q || wNoArticle === q || t === q || enT === q || arT === q) {
    return isCore ? 110 : 100;
  }

  const allSenses: string[] = ([t, enT, arT] as string[])
    .filter(Boolean)
    .flatMap((str: string) =>
      str
        .split(/[;,/|]/)
        .map((s: string) => s.replace(/\([^)]*\)/g, '').replace(/^to\s+/, '').trim())
        .filter(Boolean)
    );

  if (allSenses[0] === q || enT.replace(/^to\s+/, '') === q) {
    return isCore ? 105 : 95;
  }
  if (allSenses.includes(q)) {
    return (isCore ? 95 : 85) - Math.min(20, Math.floor(t.length / 20));
  }
  if (w.startsWith(q) || wNoArticle.startsWith(q)) return isCore ? 80 : 75;
  if (allSenses.some((s: string) => s.startsWith(q))) {
    return 65 - Math.min(20, Math.floor(t.length / 20));
  }
  if (w.includes(q)) return 50;
  if (t.includes(q) || enT.includes(q) || arT.includes(q)) {
    return 30 - Math.min(20, Math.floor(t.length / 15));
  }
  return 0;
}

export interface FormattedDictionaryUiEntry {
  word: string;
  targetTerm: string;
  translation: string;
  phonetic: string;
  audioText: string;
  ttsLocale: string;
}

export function formatDictionaryEntryForUi(
  entry: any,
  targetLang: string = 'en'
): FormattedDictionaryUiEntry {
  const rawWord = (entry?.word || entry?.term || entry?.germanWord || entry?.arabicWord || '').trim();
  const rawTranslation = sanitizeDictionaryTranslation(
    (entry?.translation || entry?.arabicWord || entry?.englishTranslation || '').trim()
  );
  const isWordArabic = /[\u0600-\u06FF]/.test(rawWord);

  let targetTerm = rawWord;
  if (targetLang === 'en' && isWordArabic) {
    const candidateEn = (entry?.englishTranslation && !/[\u0600-\u06FF]/.test(entry.englishTranslation)
      ? entry.englishTranslation
      : rawTranslation
    )
      .split(/[;,()]/)[0]
      .replace(/^to\s+/i, '')
      .trim();
    if (candidateEn) {
      targetTerm = candidateEn;
    }
  }

  const rawPhonetic = (
    entry?.phoneticAr ||
    entry?.phonetic ||
    entry?.reading ||
    entry?.romaji ||
    ''
  ).trim();
  const phonetic = suppressRedundantPhonetic(rawPhonetic, rawWord)
    ? suppressRedundantPhonetic(rawPhonetic, targetTerm)
    : '';

  const audioText = (targetTerm || rawWord)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .trim();

  const ttsLocale = normalizeTtsLang(targetLang, audioText);

  return {
    word: rawWord,
    targetTerm,
    translation: rawTranslation,
    phonetic,
    audioText,
    ttsLocale,
  };
}

function entryMatchesSearch(entry: any, clean: string, sourceLang: string): boolean {
  const word = extractEntryWord(entry).toLowerCase();
  const translation = extractEntryTranslation(entry, sourceLang).toLowerCase();
  const enTrans = (entry.englishTranslation || entry.englishCognate || '').toLowerCase();
  const arTrans = (entry.arabicTranslation || entry.arabicWord || '').toLowerCase();
  return (
    word.includes(clean) ||
    translation.includes(clean) ||
    enTrans.includes(clean) ||
    arTrans.includes(clean)
  );
}

export async function searchTargetDictionaryAsync(
  query: string,
  targetLang: TargetLanguage,
  sourceLang: SourceLanguage = 'ar'
): Promise<DictWordEntry[]> {
  const dict = await getTargetDictionaryAsync(targetLang);
  if (!query || !query.trim()) return [];
  const clean = query.trim().toLowerCase();

  return dict
    .filter((entry) => entryMatchesSearch(entry, clean, sourceLang))
    .sort((a, b) => {
      const scoreA = scoreDictionaryMatch(extractEntryWord(a), extractEntryTranslation(a, sourceLang), clean, a);
      const scoreB = scoreDictionaryMatch(extractEntryWord(b), extractEntryTranslation(b, sourceLang), clean, b);
      return scoreB - scoreA;
    });
}

export function searchTargetDictionary(
  query: string,
  targetLang: TargetLanguage,
  sourceLang: SourceLanguage = 'ar'
): DictWordEntry[] {
  if (!query || !query.trim()) return [];
  const clean = query.trim().toLowerCase();
  const dict = getTargetDictionary(targetLang);

  return dict
    .filter((entry) => entryMatchesSearch(entry, clean, sourceLang))
    .sort((a, b) => {
      const scoreA = scoreDictionaryMatch(extractEntryWord(a), extractEntryTranslation(a, sourceLang), clean, a);
      const scoreB = scoreDictionaryMatch(extractEntryWord(b), extractEntryTranslation(b, sourceLang), clean, b);
      return scoreB - scoreA;
    });
}

export function lookupTargetTerm(
  term: string,
  targetLang: TargetLanguage
): DictWordEntry | null {
  if (!term || !term.trim()) return null;
  const clean = term.trim().toLowerCase();
  const dict = getTargetDictionary(targetLang);

  return (
    dict.find((e) => {
      const w = extractEntryWord(e).toLowerCase();
      const t = (e.translation || '').toLowerCase();
      if (w === clean || t === clean) return true;
      const parts = t.split(/[;,]/).map((p) => p.replace(/^to\s+/, '').trim());
      return parts.includes(clean) || parts.some((p) => p.includes(clean)) || w.startsWith(clean);
    }) || null
  );
}
