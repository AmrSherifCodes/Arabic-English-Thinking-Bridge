import { SourceLanguage, TargetLanguage } from '../../types';

export * from './types';
import { DictWordEntry } from './types';
import { ARABIC_DICTIONARY } from './arabicDictionary';

const loadedDictionaryCache: Record<string, DictWordEntry[]> = {};

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

  const translation = (
    entry.translation ||
    entry.arabicWord ||
    entry.arabicTranslation ||
    entry.englishTranslation ||
    entry.ar ||
    entry.en ||
    entry.sourceTerm ||
    ''
  ).trim();

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
  if (targetLang === 'en' || targetLang === 'ar') {
    const dict = ARABIC_DICTIONARY.map((e, idx) => normalizeDictEntry(e, targetLang, idx));
    loadedDictionaryCache[targetLang] = dict;
    return dict;
  }
  const loader = DICTIONARY_LOADERS[targetLang];
  if (loader) {
    try {
      const dict = await loader();
      loadedDictionaryCache[targetLang] = dict;
      return dict;
    } catch (err) {
      console.warn(`[DictionaryLoader] Failed to load dictionary for ${targetLang}`, err);
    }
  }
  return [];
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

function scoreDictionaryMatch(word: string, translation: string, clean: string): number {
  const w = word.toLowerCase().trim();
  const t = translation.toLowerCase().trim();
  if (!w && !t) return 0;
  if (w === clean || t === clean) return 100;

  const senses = t
    .split(/[;,]/)
    .map((s) => s.replace(/^\([^)]*\)\s*/, '').replace(/^to\s+/, '').trim())
    .filter(Boolean);

  if (senses[0] === clean) return 95;
  if (senses.includes(clean)) return 85 - Math.min(20, Math.floor(t.length / 20));
  if (w.startsWith(clean)) return 75;
  if (senses.some((s) => s.startsWith(clean))) return 65 - Math.min(20, Math.floor(t.length / 20));
  if (w.includes(clean)) return 50;
  if (t.includes(clean)) return 30 - Math.min(20, Math.floor(t.length / 15));
  return 0;
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
    .filter((entry) => {
      const word = extractEntryWord(entry);
      const translation = extractEntryTranslation(entry, sourceLang);
      return word.toLowerCase().includes(clean) || translation.toLowerCase().includes(clean);
    })
    .sort((a, b) => {
      const scoreA = scoreDictionaryMatch(extractEntryWord(a), extractEntryTranslation(a, sourceLang), clean);
      const scoreB = scoreDictionaryMatch(extractEntryWord(b), extractEntryTranslation(b, sourceLang), clean);
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
    .filter((entry) => {
      const word = extractEntryWord(entry);
      const translation = extractEntryTranslation(entry, sourceLang);
      return word.toLowerCase().includes(clean) || translation.toLowerCase().includes(clean);
    })
    .sort((a, b) => {
      const scoreA = scoreDictionaryMatch(extractEntryWord(a), extractEntryTranslation(a, sourceLang), clean);
      const scoreB = scoreDictionaryMatch(extractEntryWord(b), extractEntryTranslation(b, sourceLang), clean);
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
