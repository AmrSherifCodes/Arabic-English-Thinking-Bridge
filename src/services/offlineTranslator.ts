import { ALL_LESSONS } from '../data/lessons';
import { EXPANDED_DECKS } from '../data/expandedDecks';
import { PREBUILT_DECKS } from '../data/prebuiltDecks';
import { STATIC_DICTIONARY } from '../data/staticDictionary';
import { EGYPTIAN_WORD_GLOSSES } from '../data/egyptianLexicon';
import { ARABIC_WORD_LEXICON, stripTashkeel } from '../utils/arabicWordLexicon';

/**
 * Deterministic, 100% offline Arabic ↔ English translation engine.
 *
 * Layers, in order of confidence:
 *  1. Phrase memory — every lesson sentence, flashcard, dictionary entry and
 *     dictionary example sentence is indexed in both directions.
 *  2. Morphology-aware word lookup — strips Egyptian/MSA clitics (و، بـ، ال، لل…)
 *     and possessive suffixes, then folds verb conjugations back to a root.
 *  3. Structural composition — rebuilds an English skeleton (subject, copula,
 *     tense, negation, question) instead of dumping word glosses.
 *
 * No network calls, no API keys, no model download.
 */

export type TranslationDirection = 'ar-en' | 'en-ar';
export type TranslationConfidence = 'exact' | 'close' | 'composed' | 'approximate';

export interface OfflineTranslationResult {
  text: string;
  direction: TranslationDirection;
  confidence: TranslationConfidence;
  score: number;
  /** Source phrase that produced an exact/close match, if any. */
  matchedSource?: string;
  /** Fraction of source tokens the engine understood (0..1). */
  coverage: number;
}

interface PhraseEntry {
  ar: string;
  en: string;
  arNorm: string;
  enNorm: string;
  enRaw: string;
}

let phraseEntries: PhraseEntry[] | null = null;
let arExact: Map<string, PhraseEntry> | null = null;
let enExact: Map<string, PhraseEntry> | null = null;
let enRawExact: Map<string, PhraseEntry> | null = null;
let arWord: Map<string, string> | null = null;
let enWord: Map<string, string> | null = null;
let verbRoots: Map<string, VerbForms> | null = null;
let enVerbRoots: Map<string, string> | null = null;

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u0640]/g;

export function normalizeArabic(text: string): string {
  return stripTashkeel(String(text || ''))
    .replace(/[أإآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeEnglish(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Article-insensitive English key so "a book" and "book" collide. */
function englishKey(text: string): string {
  return normalizeEnglish(text)
    .split(' ')
    .filter(Boolean)
    .filter((word) => !['a', 'an', 'the', 'to'].includes(word))
    .join(' ');
}

function cleanGloss(value: string): string {
  return String(value || '')
    .replace(/\(.*?\)/g, '')
    .split('/')[0]
    .replace(/\s+/g, ' ')
    .trim();
}

function addPhrase(ar: string, en: string): void {
  if (!phraseEntries) return;
  const arNorm = normalizeArabic(ar);
  const enNorm = englishKey(en);
  if (!arNorm || !enNorm) return;
  phraseEntries.push({
    ar: String(ar).trim(),
    en: String(en).trim(),
    arNorm,
    enNorm,
    enRaw: normalizeEnglish(en),
  });
}

/* ------------------------------------------------------------------ */
/* Verb tables                                                        */
/* ------------------------------------------------------------------ */

interface VerbForms {
  base: string;
  ing: string;
  past: string;
}

function verb(base: string, ing: string, past?: string): VerbForms {
  return { base, ing, past: past || `${base}ed` };
}

const VERBS: Record<string, VerbForms> = {
  // ── Core Egyptian / MSA verbs keyed by a common conjugation ──────────
  يقرا: verb('read', 'reading'),
  يقرأ: verb('read', 'reading'),
  بيقرا: verb('read', 'reading'),
  اقرا: verb('read', 'reading'),
  يكتب: verb('write', 'writing', 'wrote'),
  بيكتب: verb('write', 'writing', 'wrote'),
  اكتب: verb('write', 'writing', 'wrote'),
  يتعلم: verb('learn', 'learning', 'learned'),
  بيتعلم: verb('learn', 'learning', 'learned'),
  اتعلم: verb('learn', 'learning', 'learned'),
  يشرح: verb('explain', 'explaining'),
  بيشرح: verb('explain', 'explaining'),
  اشرح: verb('explain', 'explaining'),
  يسال: verb('ask', 'asking'),
  بيسال: verb('ask', 'asking'),
  اسال: verb('ask', 'asking'),
  يجيب: verb('answer', 'answering'),
  بيجيب: verb('answer', 'answering'),
  ينجح: verb('pass', 'passing'),
  يحب: verb('love', 'loving', 'loved'),
  بيحب: verb('love', 'loving', 'loved'),
  احب: verb('love', 'loving', 'loved'),
  بحب: verb('love', 'loving', 'loved'),
  حب: verb('love', 'loving', 'loved'),
  يريد: verb('want', 'wanting', 'wanted'),
  عايز: verb('want', 'wanting', 'wanted'),
  عاوز: verb('want', 'wanting', 'wanted'),
  محتاج: verb('need', 'needing', 'needed'),
  يحتاج: verb('need', 'needing', 'needed'),
  يعمل: verb('do', 'doing', 'did'),
  بيعمل: verb('do', 'doing', 'did'),
  اعمل: verb('do', 'doing', 'did'),
  بعمل: verb('do', 'doing', 'did'),
  يذهب: verb('go', 'going', 'went'),
  يروح: verb('go', 'going', 'went'),
  بيروح: verb('go', 'going', 'went'),
  اروح: verb('go', 'going', 'went'),
  بروح: verb('go', 'going', 'went'),
  ياكل: verb('eat', 'eating', 'ate'),
  بياكل: verb('eat', 'eating', 'ate'),
  اكل: verb('eat', 'eating', 'ate'),
  باكل: verb('eat', 'eating', 'ate'),
  يشرب: verb('drink', 'drinking', 'drank'),
  بيشرب: verb('drink', 'drinking', 'drank'),
  اشرب: verb('drink', 'drinking', 'drank'),
  بشرب: verb('drink', 'drinking', 'drank'),
  يدرس: verb('study', 'studying', 'studied'),
  بيدرس: verb('study', 'studying', 'studied'),
  ادرس: verb('study', 'studying', 'studied'),
  بدرس: verb('study', 'studying', 'studied'),
  يشتغل: verb('work', 'working', 'worked'),
  بيشتغل: verb('work', 'working', 'worked'),
  اشتغل: verb('work', 'working', 'worked'),
  بشتغل: verb('work', 'working', 'worked'),
  يتكلم: verb('speak', 'speaking', 'spoke'),
  بيتكلم: verb('speak', 'speaking', 'spoke'),
  اتكلم: verb('speak', 'speaking', 'spoke'),
  بتكلم: verb('speak', 'speaking', 'spoke'),
  يسمع: verb('listen', 'listening', 'listened'),
  بيسمع: verb('listen', 'listening', 'listened'),
  اسمع: verb('listen', 'listening', 'listened'),
  بسمع: verb('listen', 'listening', 'listened'),
  يشوف: verb('see', 'seeing', 'saw'),
  بيشوف: verb('see', 'seeing', 'saw'),
  اشوف: verb('see', 'seeing', 'saw'),
  بشوف: verb('see', 'seeing', 'saw'),
  يقول: verb('say', 'saying', 'said'),
  بيقول: verb('say', 'saying', 'said'),
  اقول: verb('say', 'saying', 'said'),
  بقول: verb('say', 'saying', 'said'),
  يفهم: verb('understand', 'understanding', 'understood'),
  بيفهم: verb('understand', 'understanding', 'understood'),
  افهم: verb('understand', 'understanding', 'understood'),
  بفهم: verb('understand', 'understanding', 'understood'),
  يعرف: verb('know', 'knowing', 'knew'),
  بعرف: verb('know', 'knowing', 'knew'),
  اعرف: verb('know', 'knowing', 'knew'),
  يساعد: verb('help', 'helping', 'helped'),
  بيساعد: verb('help', 'helping', 'helped'),
  اساعد: verb('help', 'helping', 'helped'),
  يبدا: verb('start', 'starting', 'started'),
  يبدأ: verb('start', 'starting', 'started'),
  بيبدا: verb('start', 'starting', 'started'),
  يخلص: verb('finish', 'finishing', 'finished'),
  بيخلص: verb('finish', 'finishing', 'finished'),
  اخلص: verb('finish', 'finishing', 'finished'),
  ارجع: verb('return', 'returning', 'returned'),
  يرجع: verb('return', 'returning', 'returned'),
  بيرجع: verb('return', 'returning', 'returned'),
  ياخد: verb('take', 'taking', 'took'),
  بياخد: verb('take', 'taking', 'took'),
  يدي: verb('give', 'giving', 'gave'),
  يعطي: verb('give', 'giving', 'gave'),
  يفتح: verb('open', 'opening', 'opened'),
  بيفتح: verb('open', 'opening', 'opened'),
  يقفل: verb('close', 'closing', 'closed'),
  بيقفل: verb('close', 'closing', 'closed'),
  ينام: verb('sleep', 'sleeping', 'slept'),
  بينام: verb('sleep', 'sleeping', 'slept'),
  يشتري: verb('buy', 'buying', 'bought'),
  بيشتري: verb('buy', 'buying', 'bought'),
  يبيع: verb('sell', 'selling', 'sold'),
  يمشي: verb('walk', 'walking', 'walked'),
  بيمشي: verb('walk', 'walking', 'walked'),
  يحاول: verb('try', 'trying', 'tried'),
  بيحاول: verb('try', 'trying', 'tried'),
  يقدر: verb('can', 'being able to', 'could'),
  ينزل: verb('go down', 'going down', 'went down'),
  يقوم: verb('get up', 'getting up', 'got up'),
  يوصل: verb('arrive', 'arriving', 'arrived'),
  نكمل: verb('continue', 'continuing', 'continued'),
  يكمل: verb('continue', 'continuing', 'continued'),
  يحكي: verb('tell', 'telling', 'told'),
  يجري: verb('run', 'running', 'ran'),
  يلعب: verb('play', 'playing', 'played'),
  بيلعب: verb('play', 'playing', 'played'),
  يسوق: verb('drive', 'driving', 'drove'),
  يتفرج: verb('watch', 'watching', 'watched'),
  يخطط: verb('plan', 'planning', 'planned'),
  يراجع: verb('review', 'reviewing', 'reviewed'),
  يقرر: verb('decide', 'deciding', 'decided'),
  يبعت: verb('send', 'sending', 'sent'),
  يبعث: verb('send', 'sending', 'sent'),
};

/** Past-tense forms that do not derive cleanly from the tables above. */
const PAST_VERBS: Record<string, VerbForms> = {
  كان: verb('be', 'being', 'was'),
  كتب: verb('write', 'writing', 'wrote'),
  راح: verb('go', 'going', 'went'),
  شاف: verb('see', 'seeing', 'saw'),
  قال: verb('say', 'saying', 'said'),
  عمل: verb('do', 'doing', 'did'),
  جاب: verb('bring', 'bringing', 'brought'),
  خد: verb('take', 'taking', 'took'),
  اكل: verb('eat', 'eating', 'ate'),
  شرب: verb('drink', 'drinking', 'drank'),
  نام: verb('sleep', 'sleeping', 'slept'),
  فهم: verb('understand', 'understanding', 'understood'),
  درس: verb('study', 'studying', 'studied'),
  اتعلم: verb('learn', 'learning', 'learned'),
  اشتغل: verb('work', 'working', 'worked'),
  خلص: verb('finish', 'finishing', 'finished'),
  بدا: verb('start', 'starting', 'started'),
  عرف: verb('know', 'knowing', 'knew'),
  سمع: verb('hear', 'hearing', 'heard'),
  باع: verb('sell', 'selling', 'sold'),
  اشترى: verb('buy', 'buying', 'bought'),
  فتح: verb('open', 'opening', 'opened'),
  قفل: verb('close', 'closing', 'closed'),
  ساعد: verb('help', 'helping', 'helped'),
  حب: verb('love', 'loving', 'loved'),
  كره: verb('hate', 'hating', 'hated'),
  سافر: verb('travel', 'traveling', 'traveled'),
  وصل: verb('arrive', 'arriving', 'arrived'),
};

type Subject = 'I' | 'we' | 'you' | 'he' | 'she' | 'they';

interface VerbHit {
  forms: VerbForms;
  subject: Subject | null;
  progressive: boolean;
  future: boolean;
  past: boolean;
}

interface VerbParts {
  aux: string | null;
  main: string;
  base: string;
  past: boolean;
}

const BE: Record<string, string> = {
  I: 'am',
  we: 'are',
  you: 'are',
  he: 'is',
  she: 'is',
  they: 'are',
};

const PERSON_PREFIXES: Array<[string, Subject]> = [
  ['بي', 'he'],
  ['بت', 'you'],
  ['بن', 'we'],
  ['ب', 'I'],
  ['هي', 'she'],
  ['ي', 'he'],
  ['ت', 'you'],
  ['أ', 'I'],
  ['ا', 'I'],
  ['ن', 'we'],
];

const FUTURE_PREFIXES = ['هي', 'ه'];

function buildVerbIndexes(): void {
  if (verbRoots) return;
  verbRoots = new Map();
  enVerbRoots = new Map();

  const register = (root: string, forms: VerbForms) => {
    if (!root) return;
    if (!verbRoots!.has(root)) verbRoots!.set(root, forms);
    const key = forms.base;
    if (key && !enVerbRoots!.has(key)) enVerbRoots!.set(key, root);
  };

  for (const [key, forms] of Object.entries(VERBS)) {
    let stripped = false;
    for (const [prefix] of PERSON_PREFIXES) {
      if (key.startsWith(prefix) && key.length > prefix.length + 1) {
        register(key.slice(prefix.length), forms);
        stripped = true;
      }
    }
    if (!stripped) register(key, forms);
  }

  // Past forms also feed the English reverse map.
  for (const [key, forms] of Object.entries(PAST_VERBS)) {
    register(key, forms);
    if (!enVerbRoots!.has(forms.base)) enVerbRoots!.set(forms.base, key);
  }
}

function analyzeVerb(rawToken: string): VerbHit | null {
  buildVerbIndexes();
  const norm = normalizeArabic(rawToken);
  if (!norm || norm.length < 2) return null;

  const directPast = PAST_VERBS[norm];
  if (directPast) {
    return { forms: directPast, subject: null, progressive: false, future: false, past: true };
  }

  const pastWithSubject = PAST_SUBJECT_FORMS[norm];
  if (pastWithSubject) {
    return { forms: pastWithSubject.forms, subject: pastWithSubject.subject, progressive: false, future: false, past: true };
  }

  const direct = verbRoots?.get(norm);
  if (direct) {
    return { forms: direct, subject: null, progressive: false, future: false, past: false };
  }

  // Future: هروح (I will go), هيكتب (he will write).
  for (const prefix of FUTURE_PREFIXES) {
    if (norm.startsWith(prefix) && norm.length > prefix.length + 1) {
      const stem = norm.slice(prefix.length);
      const forms = verbRoots?.get(stem) || verbRoots?.get(`ي${stem}`);
      if (forms) {
        return { forms, subject: prefix === 'هي' ? 'she' : null, progressive: false, future: true, past: false };
      }
    }
  }

  // Present progressive / imperfect with a person prefix.
  for (const [prefix, subject] of PERSON_PREFIXES) {
    if (norm.startsWith(prefix) && norm.length > prefix.length + 1) {
      const stem = norm.slice(prefix.length);
      const forms = verbRoots?.get(stem);
      if (forms) {
        return {
          forms,
          subject,
          progressive: prefix === 'بي' || prefix === 'بت' || prefix === 'بن' || prefix === 'ب',
          future: false,
          past: false,
        };
      }
    }
  }

  return null;
}

const PARTICIPLES: Record<string, string> = {
  فاهم: 'understand',
  فاهمه: 'understand',
  عارف: 'know',
  عارفه: 'know',
  شايف: 'see',
  شايفه: 'see',
  سامع: 'hear',
  رايح: 'go',
  رايحه: 'go',
  جاي: 'come',
  جايه: 'come',
  عامل: 'do',
  عامله: 'do',
  مستني: 'wait for',
  مستنيه: 'wait for',
  نازل: 'go down',
  طالع: 'go up',
  قاعد: 'sitting',
  واقف: 'standing',
  نايم: 'sleep',
  مأخر: 'delay',
  ماخر: 'delay',
  ماطل: 'stall',
  بيماطل: 'stall',
  بيوعد: 'promise',
};

/** Verb forms that must never take the progressive ("I love", not "I am loving"). */
const STATIVE_VERBS = new Set([
  'love', 'like', 'want', 'need', 'know', 'understand', 'see', 'hear', 'hate', 'believe', 'remember',
]);

/** Participles that read as an ongoing action ("the client is delaying"). */
const VERBAL_ADJECTIVES = new Set(['delay', 'stall', 'promise']);

/** English nouns that need an indefinite article when used as a predicate. */
const JOB_NOUNS = new Set([
  'engineer', 'architect', 'doctor', 'teacher', 'student', 'manager', 'accountant', 'programmer',
  'employee', 'driver', 'seller', 'nurse', 'lawyer', 'pilot', 'chef', 'artist', 'writer', 'farmer',
]);

/** English question words mapped to their Egyptian equivalents. */
const EN_QUESTION_WORDS: Record<string, string> = {
  where: 'فين',
  what: 'ايه',
  why: 'ليه',
  how: 'ازاي',
  when: 'امتي',
  who: 'مين',
  which: 'انهي',
};

/** High-frequency English words missing from the dictionary-derived lexicon. */
const EN_EXTRA_GLOSSES: Record<string, string> = {
  home: 'البيت',
  enough: 'كفاية',
  everyone: 'كل الناس',
  everybody: 'كل الناس',
  someone: 'حد',
  somebody: 'حد',
  nobody: 'محدش',
  thing: 'حاجة',
  things: 'حاجات',
  something: 'حاجة',
  anything: 'أي حاجة',
  nothing: 'ولا حاجة',
  again: 'تاني',
  too: 'كمان',
  only: 'بس',
  maybe: 'يمكن',
  tomorrow: 'بكرة',
  today: 'النهاردة',
  now: 'دلوقتي',
  yesterday: 'امبارح',
};

/** English modals → Egyptian equivalents (avoids literal verb conjugation). */
const EN_MODALS: Record<string, string> = {
  can: 'ممكن',
  could: 'ممكن',
  may: 'ممكن',
  might: 'ممكن',
  should: 'لازم',
  must: 'لازم',
  ought: 'لازم',
  would: 'كان',
};

const EN_OBJECT_PRONOUNS: Record<string, string> = {
  me: 'لي',
  us: 'لنا',
  him: 'له',
  her: 'لها',
  them: 'لهم',
  you: 'لك',
};

/** Curated Arabic→English glosses for high-frequency words the lexicon misses. */
const ARABIC_EXTRA_GLOSSES: Record<string, string> = {
  موجود: 'available',
  موجودة: 'available',
  كمان: 'also',
  برضه: 'also',
  خلاص: 'already',
  لسه: 'still',
  غالبا: 'probably',
  أكيد: 'definitely',
  اكيد: 'definitely',
};

/** Head nouns that bind the following noun with "of" in English (idafa). */
const IDAFA_HEADS = new Set([
  'price', 'name', 'manager', 'owner', 'date', 'number', 'address', 'color', 'size', 'count',
  'type', 'part', 'problem', 'reason', 'result', 'plan', 'budget', 'meeting', 'team', 'client',
  'salary', 'cost', 'value', 'level', 'goal', 'title', 'start', 'end',
]);

/** First/second-person past forms that carry their own subject. */
const PAST_SUBJECT_FORMS: Record<string, { forms: VerbForms; subject: Subject }> = {
  كنت: { forms: verb('be', 'being', 'was'), subject: 'I' },
  كنا: { forms: verb('be', 'being', 'were'), subject: 'we' },
  كانوا: { forms: verb('be', 'being', 'were'), subject: 'they' },
  كانت: { forms: verb('be', 'being', 'was'), subject: 'she' },
  رحت: { forms: verb('go', 'going', 'went'), subject: 'I' },
  رحنا: { forms: verb('go', 'going', 'went'), subject: 'we' },
  شفت: { forms: verb('see', 'seeing', 'saw'), subject: 'I' },
  قلت: { forms: verb('say', 'saying', 'said'), subject: 'I' },
  عملت: { forms: verb('do', 'doing', 'did'), subject: 'I' },
};

/** Turn a participle gloss into a natural English gerund. */
function participleGloss(gloss: string): string {
  if (['late', 'sitting', 'standing'].includes(gloss)) return gloss;
  if (gloss === 'go down') return 'going down';
  if (gloss === 'go up') return 'going up';
  if (gloss === 'wait for') return 'waiting for';
  return `${gloss}ing`;
}

/** Common Egyptian negated verbs (ما…ش pattern) with their English meaning. */
const NEGATED_EGYPTIAN: Record<string, { gloss: string; subject: Subject }> = {
  مشوفتش: { gloss: 'did not see', subject: 'I' },
  معرفش: { gloss: 'do not know', subject: 'I' },
  مقدرش: { gloss: 'cannot', subject: 'I' },
  مجاش: { gloss: 'did not come', subject: 'he' },
  مخلصش: { gloss: 'did not finish', subject: 'I' },
  مفهومش: { gloss: 'did not understand', subject: 'I' },
  مسالتش: { gloss: 'did not ask', subject: 'I' },
  مردتش: { gloss: 'did not reply', subject: 'I' },
};

const PRONOUNS: Record<string, Subject> = {
  انا: 'I',
  احنا: 'we',
  نحن: 'we',
  انت: 'you',
  انتي: 'you',
  انتم: 'you',
  انتو: 'you',
  هو: 'he',
  هي: 'she',
  هما: 'they',
  هم: 'they',
};

const QUESTIONS: Record<string, string> = {
  ايه: 'what',
  ايوه: 'what',
  ايش: 'what',
  شنو: 'what',
  ماذا: 'what',
  ليه: 'why',
  لماذا: 'why',
  ازاي: 'how',
  كيف: 'how',
  فين: 'where',
  اين: 'where',
  وين: 'where',
  امتي: 'when',
  متي: 'when',
  مين: 'who',
  كام: 'how many',
  بكام: 'how much',
  انهي: 'which',
};

const NEGATIONS = new Set(['مش', 'مو', 'ما', 'لا', 'مفيش', 'مجاش', 'مش']);

const FUNCTION_WORDS: Record<string, string> = {
  في: 'in',
  علي: 'on',
  على: 'on',
  مع: 'with',
  من: 'from',
  الي: 'to',
  إلى: 'to',
  عن: 'about',
  قبل: 'before',
  بعد: 'after',
  تحت: 'under',
  فوق: 'above',
  جنب: 'next to',
  عند: 'at',
  النهارده: 'today',
  النهاردة: 'today',
  دلوقتي: 'right now',
  بكره: 'tomorrow',
  بكرة: 'tomorrow',
  امبارح: 'yesterday',
  هنا: 'here',
  هناك: 'there',
  جدا: 'very',
  اوي: 'very',
  كتير: 'a lot',
  شويه: 'a little',
  و: 'and',
  او: 'or',
  لكن: 'but',
  بس: 'but',
  لان: 'because',
  عشان: 'because',
  علشان: 'because',
  لو: 'if',
  كان: 'was',
  كانت: 'was',
  كانوا: 'were',
  ده: 'this',
  دا: 'this',
  دي: 'this',
  دول: 'these',
  فيه: 'there is',
  مفيش: 'there is no',
  ممكن: 'can',
  لازم: 'must',
  عايز: 'want',
  عاوز: 'want',
  محتاج: 'need',
  نفسي: 'I want to',
  يعني: 'means',
  خلاص: 'already',
  لسه: 'still',
  لسة: 'still',
  تاني: 'again',
  برضه: 'also',
  كمان: 'also',
  زي: 'like',
  اسم: 'name',
  اسمي: 'my name',
  اسمك: 'your name',
  اسمه: 'his name',
  اسمها: 'her name',
};

const PREFIXES = ['وال', 'بال', 'كال', 'فال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك'];

const POSSESSIVES: Array<[string, string]> = [
  ['هم', 'their'],
  ['نا', 'our'],
  ['ها', 'her'],
  ['ه', 'his'],
  ['ك', 'your'],
  ['ي', 'my'],
];

/* ------------------------------------------------------------------ */
/* Index building                                                     */
/* ------------------------------------------------------------------ */

function buildIndexes(): void {
  if (phraseEntries) return;

  phraseEntries = [];
  arExact = new Map();
  enExact = new Map();
  enRawExact = new Map();
  arWord = new Map();
  enWord = new Map();

  // 1. Curriculum sentences (highest-quality bridge structures).
  for (const lesson of ALL_LESSONS) {
    for (const exercise of lesson.exercises) {
      addPhrase(exercise.arabicThought, exercise.englishTarget);
      for (const alternative of exercise.acceptableAlternatives || []) {
        addPhrase(exercise.arabicThought, alternative);
      }
    }
  }

  // 2. Flashcard decks (curated real-world phrases).
  for (const deck of [...EXPANDED_DECKS, ...PREBUILT_DECKS]) {
    for (const card of deck.cards) addPhrase(card.ar, card.en);
  }

  // 3. Static dictionary + its bilingual example sentences.
  for (const entry of STATIC_DICTIONARY) {
    addPhrase(entry.arabicWord, entry.englishTranslation);
    addPhrase(entry.exampleSentenceArabic, entry.exampleSentenceEnglish);
  }

  // 4. Curated Egyptian lexicon (highest-priority word glosses).
  for (const [key, gloss] of Object.entries(EGYPTIAN_WORD_GLOSSES)) {
    const arNorm = normalizeArabic(key);
    const clean = cleanGloss(gloss);
    if (!arNorm || !clean) continue;
    if (!arWord.has(arNorm)) arWord.set(arNorm, clean);
    const reverse = englishKey(clean);
    if (reverse && !enWord.has(reverse)) enWord.set(reverse, key);
    addPhrase(key, clean);
  }

  // 5. Word-level dictionary entries (student / call-center / public desks).
  for (const entry of STATIC_DICTIONARY) {
    const arNorm = normalizeArabic(entry.arabicWord);
    const gloss = cleanGloss(entry.englishTranslation);
    if (!arNorm || !gloss) continue;
    if (!arWord.has(arNorm)) arWord.set(arNorm, gloss);
    const reverse = englishKey(gloss);
    if (reverse && !enWord.has(reverse)) enWord.set(reverse, entry.arabicWord);
  }

  // 6. Curated word lexicon from the lesson curriculum.
  for (const [key, value] of Object.entries(ARABIC_WORD_LEXICON)) {
    const arNorm = normalizeArabic(key);
    const gloss = cleanGloss(value.en);
    if (!arNorm || !gloss) continue;
    if (!arWord.has(arNorm)) arWord.set(arNorm, gloss);
    const reverse = englishKey(gloss);
    if (reverse && !enWord.has(reverse)) enWord.set(reverse, key);
    addPhrase(key, gloss);
  }

  for (const entry of phraseEntries) {
    if (!arExact.has(entry.arNorm)) arExact.set(entry.arNorm, entry);
    if (!enExact.has(entry.enNorm)) enExact.set(entry.enNorm, entry);
    if (!enRawExact!.has(entry.enRaw)) enRawExact!.set(entry.enRaw, entry);
  }
}

/* ------------------------------------------------------------------ */
/* Arabic → English                                                   */
/* ------------------------------------------------------------------ */

function isArabicNoun(rawToken: string): boolean {
  buildIndexes();
  const norm = normalizeArabic(rawToken);
  if (!norm) return false;
  if (PRONOUNS[norm] || FUNCTION_WORDS[norm] || QUESTIONS[norm] || PARTICIPLES[norm]) return false;
  if (NEGATED_EGYPTIAN[norm]) return false;
  if (analyzeVerb(rawToken)) return false;
  if (norm.startsWith('ال')) return true;
  return Boolean(arWord?.has(norm));
}

function lookupArabicToken(rawToken: string): { gloss: string; matched: boolean } {
  buildIndexes();
  const norm = normalizeArabic(rawToken);
  if (!norm) return { gloss: '', matched: false };

  const negatedEgyptian = NEGATED_EGYPTIAN[norm];
  if (negatedEgyptian) return { gloss: negatedEgyptian.gloss, matched: true };
  if (PRONOUNS[norm]) return { gloss: PRONOUNS[norm], matched: true };
  if (FUNCTION_WORDS[norm]) return { gloss: FUNCTION_WORDS[norm], matched: true };
  if (ARABIC_EXTRA_GLOSSES[norm]) return { gloss: ARABIC_EXTRA_GLOSSES[norm], matched: true };

  // Normalisation folds both ة and ه to ه, so كتابه ("his book") and كتابة
  // ("writing") collide. Use the original final letter to disambiguate: a word
  // ending in a real ه is a possessive, so try the suffix split first.
  const rawFinal = rawToken.trim().slice(-1);
  const endsWithTaMarbuta = rawFinal === 'ة';
  const endsWithPossessiveHa = rawFinal === 'ه';

  if (endsWithPossessiveHa) {
    for (const [suffix, english] of POSSESSIVES) {
      if (suffix === 'ه' && norm.length > suffix.length + 1 && norm.endsWith(suffix)) {
        const stem = norm.slice(0, -suffix.length);
        const candidate = arWord?.get(stem);
        if (candidate) return { gloss: `${english} ${candidate}`, matched: true };
      }
    }
  }

  if (arWord?.has(norm)) return { gloss: arWord.get(norm) as string, matched: true };

  // Possessive suffixes: كتابي = my book, كتابك = your book …
  if (endsWithTaMarbuta) {
    // Feminine form: drop the ta-marbuta and gloss the masculine stem.
    const bare = norm.replace(/ه$/, '');
    const feminineStem = bare !== norm ? arWord?.get(bare) : undefined;
    if (feminineStem) return { gloss: feminineStem, matched: true };
  } else {
    for (const [suffix, english] of POSSESSIVES) {
      if (norm.length > suffix.length + 1 && norm.endsWith(suffix)) {
        const stem = norm.slice(0, -suffix.length);
        const candidate = arWord?.get(stem);
        if (candidate) return { gloss: `${english} ${candidate}`, matched: true };
      }
    }
  }

  for (const prefix of PREFIXES) {
    if (norm.length > prefix.length + 1 && norm.startsWith(prefix)) {
      const stem = norm.slice(prefix.length);
      const negatedStem = NEGATED_EGYPTIAN[stem];
      if (negatedStem) {
        return { gloss: prefix === 'و' ? `and ${negatedStem.gloss}` : negatedStem.gloss, matched: true };
      }
      if (PRONOUNS[stem]) return { gloss: PRONOUNS[stem], matched: true };
      if (FUNCTION_WORDS[stem]) return { gloss: FUNCTION_WORDS[stem], matched: true };
      if (arWord?.has(stem)) return { gloss: arWord.get(stem) as string, matched: true };
      const clean = ARABIC_WORD_LEXICON[stem];
      if (clean) return { gloss: cleanGloss(clean.en), matched: true };
    }
  }

  // Participles: فاهم = understanding, عارف = knowing.
  if (PARTICIPLES[norm]) return { gloss: PARTICIPLES[norm], matched: true };

  // Unknown conjugated verb → use its base gloss rather than leaving Arabic.
  const verbHit = analyzeVerb(rawToken);
  if (verbHit) return { gloss: verbHit.forms.base, matched: true };

  return { gloss: '', matched: false };
}

function conjugate(forms: VerbForms, subject: Subject | null): string {
  if (subject === 'he' || subject === 'she') {
    if (forms.base === 'can') return 'can';
    if (/(s|ch|sh|x)$/.test(forms.base)) return `${forms.base}es`;
    if (/[^aeiou]y$/.test(forms.base)) return `${forms.base.slice(0, -1)}ies`;
    return `${forms.base}s`;
  }
  return forms.base;
}

function realizeVerb(hit: VerbHit, subject: Subject | null): VerbParts {
  const who = hit.subject || subject;
  if (hit.future) return { aux: 'will', main: hit.forms.base, base: hit.forms.base, past: false };
  if (hit.progressive && who && !STATIVE_VERBS.has(hit.forms.base)) {
    return { aux: BE[who] || 'is', main: hit.forms.ing, base: hit.forms.base, past: false };
  }
  if (hit.past) return { aux: null, main: hit.forms.past, base: hit.forms.base, past: true };
  return { aux: null, main: conjugate(hit.forms, who), base: hit.forms.base, past: false };
}

function capitalize(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function finishSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim();
  if (!cleaned) return '';
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

/** Tightens common literal calques produced by the word-by-word composer. */
function polishEnglishOutput(text: string): string {
  return text
    .replace(/\bgo (?:to )?the house\b/gi, 'go home')
    .replace(/\b(?:in|at) the work\b/gi, 'at work')
    .replace(/\bthe work\b/gi, 'work')
    .replace(/\bhelp me in\b/gi, 'help me with')
    .replace(
      /\b(a|an|the) ([a-z]+) (big|small|new|old|good|bad|hot|cold|nice|beautiful|large|important|easy|hard)\b/gi,
      '$1 $3 $2'
    )
    .replace(/\b(She|He|It) are\b/g, '$1 is')
    .replace(/\b(They|We|You) is\b/g, '$1 are')
    .replace(/\bI is\b/g, 'I am');
}

function tokenize(text: string): string[] {
  return String(text || '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

interface Composition {
  text: string;
  coverage: number;
}

function composeArabicToEnglish(input: string): Composition {
  buildIndexes();
  const tokens = tokenize(input);
  if (tokens.length === 0) return { text: '', coverage: 0 };

  const consumed = new Set<number>();
  const normOf = (index: number) => normalizeArabic(tokens[index]);
  const total = tokens.length;
  let matched = 0;

  // ── Question word ────────────────────────────────────────────────────
  let question: string | null = null;
  if (tokens.length > 1 && QUESTIONS[normOf(0)]) {
    question = QUESTIONS[normOf(0)];
    consumed.add(0);
    matched += 1;
  } else if (tokens.length > 1) {
    const last = tokens.length - 1;
    if (['ايه', 'إيه', 'ايش', 'ماذا'].includes(tokens[last].replace(/[؟?]+$/g, ''))) {
      question = 'what';
      consumed.add(last);
      matched += 1;
    }
  }

  // ── Negation ─────────────────────────────────────────────────────────
  let negated = false;
  tokens.forEach((token, index) => {
    if (consumed.has(index)) return;
    const norm = normOf(index);
    if (NEGATIONS.has(norm)) {
      negated = true;
      consumed.add(index);
      matched += 1;
    }
  });

  // ── Subject pronoun ──────────────────────────────────────────────────
  let subject: Subject | null = null;
  for (let index = 0; index < Math.min(tokens.length, 3); index += 1) {
    if (consumed.has(index)) continue;
    const pronoun = PRONOUNS[normOf(index)];
    if (pronoun) {
      subject = pronoun;
      consumed.add(index);
      matched += 1;
      break;
    }
  }

  // ── "there is / there is no" ─────────────────────────────────────────
  let existential: 'there is' | 'there is no' | null = null;
  for (let index = 0; index < tokens.length; index += 1) {
    if (consumed.has(index)) continue;
    const norm = normOf(index);
    if (norm === 'فيه') {
      existential = negated ? 'there is no' : 'there is';
      consumed.add(index);
      matched += 1;
      break;
    }
    if (norm === 'مفيش') {
      existential = 'there is no';
      negated = true;
      consumed.add(index);
      matched += 1;
      break;
    }
  }

  // ── Main verb ────────────────────────────────────────────────────────
  let verbHit: VerbHit | null = null;
  let verbIndex = -1;
  for (let index = 0; index < tokens.length; index += 1) {
    if (consumed.has(index)) continue;
    const hit = analyzeVerb(tokens[index]);
    if (hit) {
      verbHit = hit;
      verbIndex = index;
      consumed.add(index);
      matched += 1;
      break;
    }
  }

  // ── Noun subject in a nominal sentence (الجو حر = the weather is hot) ──
  let nounSubject: string | null = null;
  if (!verbHit && !subject) {
    const firstIdx = tokens.findIndex((_, i) => !consumed.has(i));
    if (firstIdx >= 0 && tokens.length > 1 && isArabicNoun(tokens[firstIdx])) {
      nounSubject = lookupArabicToken(tokens[firstIdx]).gloss;
      consumed.add(firstIdx);
      matched += 1;
    }
  }

  // ── Manageable Egyptian negated verbs (مشوفتش، معرفش…) ───────────────
  if (!verbHit) {
    for (let index = 0; index < tokens.length; index += 1) {
      if (consumed.has(index)) continue;
      const entry = NEGATED_EGYPTIAN[normOf(index)];
      if (entry) {
        subject = subject || entry.subject;
        negated = true;
        verbHit = {
          forms: verb(entry.gloss.replace(/^(did not|do not|cannot)\s*/, ''), 'doing', entry.gloss),
          subject: entry.subject,
          progressive: false,
          future: false,
          past: entry.gloss.startsWith('did'),
        };
        consumed.add(index);
        matched += 1;
        break;
      }
    }
  }

  // ── Participle negation: مش فاهم = I do not understand ───────────────
  if (!verbHit && negated) {
    for (let index = 0; index < tokens.length; index += 1) {
      if (consumed.has(index)) continue;
      const participle = PARTICIPLES[normOf(index)];
      if (participle) {
        verbHit = {
          forms: verb(participle, `${participle}ing`, participle),
          subject: subject || 'I',
          progressive: false,
          future: false,
          past: false,
        };
        subject = subject || 'I';
        consumed.add(index);
        matched += 1;
        break;
      }
    }
  }

  // ── Subject implied by the verb (بحب = I love, هيكتب = he will write) ─
  if (!subject && verbHit?.subject) subject = verbHit.subject;

  // Egyptian modals are first-person by default (عايز / محتاج = I want / need).
  if (!subject && verbHit && ['want', 'need', 'love', 'try', 'start', 'finish'].includes(verbHit.forms.base)) {
    subject = 'I';
  }

  // ── "want/need/love to + verb" ───────────────────────────────────────
  let infinitiveVerb: VerbHit | null = null;
  let infinitiveIndex = -1;
  if (verbHit && ['want', 'need', 'love', 'like', 'try', 'start', 'finish'].includes(verbHit.forms.base)) {
    for (let index = verbIndex + 1; index < tokens.length; index += 1) {
      if (consumed.has(index)) continue;
      const next = analyzeVerb(tokens[index]);
      if (next) {
        infinitiveVerb = next;
        infinitiveIndex = index;
        consumed.add(index);
        matched += 1;
      }
      break;
    }
  }

  // ── Clock time: الساعة عشرة = at ten ─────────────────────────────────
  let timePhrase = '';
  const timeIndex = tokens.findIndex((token, i) => !consumed.has(i) && /^الساع/.test(normOf(i)));
  if (timeIndex >= 0) {
    const next = tokens[timeIndex + 1];
    if (next && !consumed.has(timeIndex + 1)) {
      const nextGloss = lookupArabicToken(next);
      if (nextGloss.matched && /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)$/i.test(nextGloss.gloss)) {
        timePhrase = `at ${nextGloss.gloss}`;
        consumed.add(timeIndex);
        consumed.add(timeIndex + 1);
        matched += 2;
      }
    }
  }

  // ── Remaining words: multi-word phrases first, then tokens ───────────
  const rest: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    if (consumed.has(index)) {
      index += 1;
      continue;
    }

    let handled = false;
    for (let size = Math.min(4, tokens.length - index); size >= 2; size -= 1) {
      if (Array.from({ length: size }, (_, offset) => consumed.has(index + offset)).some(Boolean)) continue;
      const phrase = normalizeArabic(tokens.slice(index, index + size).join(' '));
      const hit = arExact?.get(phrase);
      if (hit) {
        rest.push(hit.en.replace(/[.!?]+$/, ''));
        for (let offset = 0; offset < size; offset += 1) consumed.add(index + offset);
        matched += size;
        handled = true;
        index += size;
        break;
      }
    }
    if (handled) continue;

    const norm = normOf(index);

    // Bare participle after a noun subject reads as a gerund: is delaying.
    if (PARTICIPLES[norm] && !negated) {
      rest.push(participleGloss(PARTICIPLES[norm]));
      consumed.add(index);
      matched += 1;
      index += 1;
      continue;
    }

    const { gloss, matched: tokenMatched } = lookupArabicToken(tokens[index]);
    if (tokenMatched) {
      const glossKey = englishKey(gloss);
      const nextIndex = index + 1;
      // Idafa: سعر المنتج = the price of the product.
      if (
        IDAFA_HEADS.has(glossKey) &&
        nextIndex < tokens.length &&
        !consumed.has(nextIndex) &&
        isArabicNoun(tokens[nextIndex])
      ) {
        const nextGloss = lookupArabicToken(tokens[nextIndex]).gloss;
        const head = /^the\s/i.test(gloss) ? gloss : `the ${gloss}`;
        const tail = /^the\s/i.test(nextGloss) ? nextGloss : `the ${nextGloss}`;
        rest.push(`${head} of ${tail}`);
        consumed.add(nextIndex);
        matched += 2;
        index += 2;
        continue;
      }
      rest.push(gloss);
      matched += 1;
    } else {
      // Keep proper nouns / borrowed words intact instead of dropping them.
      rest.push(tokens[index]);
    }
    index += 1;
  }

  if (timePhrase) rest.push(timePhrase);

  let predicate = rest.join(' ').replace(/\s+/g, ' ').trim();

  // Degree adverbs come before the adjective in English (very hot, not hot very).
  const degreeWords = new Set(['very', 'really', 'so', 'too']);
  const predicateWords = predicate.split(' ').filter(Boolean);
  for (let i = 1; i < predicateWords.length; i += 1) {
    if (degreeWords.has(predicateWords[i].toLowerCase())) {
      const previous = predicateWords[i - 1];
      if (!['the', 'a', 'an', 'and', 'in', 'on', 'is', 'are', 'was', 'were'].includes(previous.toLowerCase())) {
        predicateWords[i - 1] = predicateWords[i];
        predicateWords[i] = previous;
      }
    }
  }
  predicate = predicateWords.join(' ');

  // "in meeting" → "in a meeting" for countable singular nouns.
  const COUNTABLE_NOUNS = new Set([
    'meeting', 'office', 'car', 'room', 'house', 'city', 'bank', 'restaurant', 'cafe', 'market',
    'shop', 'school', 'university', 'lesson', 'exam', 'question', 'problem', 'report', 'project',
    'plan', 'budget', 'email', 'message', 'phone', 'file', 'team', 'client', 'company', 'mistake',
    'solution', 'result', 'goal', 'request', 'order', 'invoice', 'contract', 'payment',
  ]);
  const PREPOSITIONS = new Set(['in', 'on', 'at', 'with', 'from', 'to', 'of', 'about', 'for']);
  const withArticles: string[] = [];
  for (let i = 0; i < predicateWords.length; i += 1) {
    const word = predicateWords[i];
    const previous = i > 0 ? predicateWords[i - 1].toLowerCase() : '';
    if (
      PREPOSITIONS.has(previous) &&
      COUNTABLE_NOUNS.has(word.toLowerCase()) &&
      !['the', 'a', 'an'].includes(predicateWords[i - 1]?.toLowerCase())
    ) {
      withArticles.push(/^[aeiou]/i.test(word) ? 'an' : 'a');
    }
    withArticles.push(word);
  }
  predicate = withArticles.join(' ');
  const verbParts = verbHit ? realizeVerb(verbHit, subject) : null;
  const infinitive =
    infinitiveVerb && verbParts ? realizeVerb(infinitiveVerb, null).base : '';

  let text = '';

  if (existential) {
    const body = [predicate].filter(Boolean).join(' ');
    text = `${existential}${body ? ` ${body}` : ''}`;
    if (verbParts) text = `${existential} ${verbParts.main} ${predicate}`.trim();
  } else if (verbParts) {
    const who = subject || '';
    if (negated) {
      const aux = verbParts.past
        ? 'did'
        : who === 'he' || who === 'she' || who === 'they'
          ? 'does'
          : 'do';
      const baseVerb = infinitive || verbParts.base;
      text = [who, aux, 'not', baseVerb, predicate].filter(Boolean).join(' ');
    } else {
      const verbPhrase = infinitive ? `${verbParts.main} to ${infinitive}` : verbParts.main;
      text = [who, verbParts.aux, verbPhrase, predicate].filter(Boolean).join(' ');
    }
  } else if (nounSubject) {
    text = [nounSubject, negated ? 'is not' : 'is', predicate].filter(Boolean).join(' ');
  } else if (subject) {
    const be = BE[subject] || 'is';
    // Predicate adjective / profession article: "He is an engineer".
    const single = predicate.split(' ').filter(Boolean);
    if (!negated && single.length === 1 && JOB_NOUNS.has(single[0].toLowerCase())) {
      predicate = `${/^[aeiou]/i.test(single[0]) ? 'an' : 'a'} ${single[0]}`;
    } else if (!negated && single.length === 1 && VERBAL_ADJECTIVES.has(single[0])) {
      predicate = single[0] === 'stall' ? 'stalling' : single[0] === 'delay' ? 'delaying' : `${single[0]}ing`;
    }
    text = [subject, negated ? `${be} not` : be, predicate].filter(Boolean).join(' ');
  } else if (existential === null && predicate) {
    text = predicate;
  }

  if (question) {
    const body = text.trim();
    const auxMatch = body.match(/^(\w+)\s+(am|is|are|was|were|will|can|do|does|did)\b/i);
    if (auxMatch && !/^(I|we|you|he|she|they)\b/i.test(body)) {
      text = `${question} ${body}`;
    } else {
      const leadingPronoun = body.match(/^(I|we|you|he|she|they)\b\s*(.*)$/i);
      const pronoun = leadingPronoun ? leadingPronoun[1] : subject;
      let remainder = leadingPronoun ? leadingPronoun[2] : body;
      const beLike = pronoun ? BE[pronoun.toLowerCase()] || 'is' : 'is';
      if (verbParts) {
        if (verbParts.aux) {
          text = `${question} ${verbParts.aux} ${pronoun ? `${pronoun.toLowerCase()} ` : ''}${verbParts.main}${predicate ? ` ${predicate}` : ''}`;
        } else {
          const aux = verbParts.past ? 'did' : pronoun === 'he' || pronoun === 'she' ? 'does' : 'do';
          text = `${question} ${aux} ${pronoun ? `${pronoun.toLowerCase()} ` : ''}${infinitive || verbParts.base}${predicate ? ` ${predicate}` : ''}`;
        }
      } else {
        remainder = remainder
          .replace(/^(am|is|are|was|were|will|can|do|does|did)\b\s*/i, '')
          .replace(/^(I|we|you|he|she|they)\b\s*/i, '');
        if (nounSubject) {
          text = `${question} ${negated ? 'is not' : 'is'} ${nounSubject}${predicate ? ` ${predicate}` : ''}`;
        } else {
          text = `${question} ${beLike}${pronoun ? ` ${pronoun.toLowerCase()}` : ''}${remainder ? ` ${remainder}` : ''}`;
        }
      }
    }
  }

  const finished = finishSentence(capitalize(text));
  return {
    text: question ? finished.replace(/[.]$/, '?') : finished,
    coverage: total > 0 ? Math.min(1, matched / total) : 0,
  };
}

/* ------------------------------------------------------------------ */
/* English → Arabic                                                   */
/* ------------------------------------------------------------------ */

const ACTIVE_PARTICIPLES: Record<string, string> = {
  فهم: 'فاهم',
  عرف: 'عارف',
  شوف: 'شايف',
  سمع: 'سامع',
  حب: 'بيحب',
  ريد: 'عايز',
  حتاج: 'محتاج',
};

function conjugateArabic(root: string, subject: Subject | null, progressive = false): string {
  if (!root) return '';
  if (progressive) {
    const prefix = subject === 'he' || subject === 'they' ? 'بي' : subject === 'we' ? 'بن' : subject === 'I' ? 'ب' : 'بت';
    return `${prefix}${root}`;
  }
  if (!subject) return root;
  if (subject === 'he' || subject === 'they') return `ي${root}`;
  if (subject === 'she' || subject === 'you') return `ت${root}`;
  if (subject === 'we') return `ن${root}`;
  return `أ${root}`;
}

function composeEnglishToArabic(input: string): Composition {
  buildIndexes();
  buildVerbIndexes();
  const tokens = tokenize(input);
  if (tokens.length === 0) return { text: '', coverage: 0 };

  const out: string[] = [];
  let matched = 0;
  let subject: Subject | null = null;
  let definite = false;
  let demonstrative: string | null = null;

  const emit = (word: string) => {
    if (word) out.push(word);
  };

  const emitNoun = (word: string) => {
    if (definite) {
      const words = word.split(' ');
      emit(words.map((part) => (/^ال/.test(part) ? part : `ال${part}`)).join(' '));
    } else {
      emit(word);
    }
    definite = false;
    if (demonstrative) {
      emit(demonstrative);
      demonstrative = null;
    }
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const raw = tokens[index];
    const norm = normalizeEnglish(raw);
    if (!norm) continue;

    // Multi-word phrase memory (4 → 2 words). Skip when the phrase would
    // swallow a pronoun/determiner/question word that we realize structurally.
    const firstNorm = normalizeEnglish(tokens[index]);
    const structuralLead = [
      'a', 'an', 'the', 'this', 'that', 'these', 'those',
      'i', 'me', 'we', 'us', 'he', 'him', 'she', 'her', 'they', 'them', 'you', 'your',
      'where', 'what', 'why', 'how', 'when', 'who', 'which',
      'do', 'does', 'did',
    ].includes(firstNorm);
    let phraseHandled = false;
    if (!structuralLead) {
      for (let size = Math.min(4, tokens.length - index); size >= 2; size -= 1) {
        const phrase = normalizeEnglish(tokens.slice(index, index + size).join(' '));
        const hit = enRawExact?.get(phrase);
        if (hit) {
          emit(hit.ar);
          matched += size;
          index += size - 1;
          phraseHandled = true;
          break;
        }
      }
    }
    if (phraseHandled) continue;

    if (norm === 'the') {
      definite = true;
      continue;
    }
    if (['a', 'an'].includes(norm)) continue;

    if (norm === 'this' || norm === 'that') {
      definite = true;
      demonstrative = 'ده';
      matched += 1;
      continue;
    }
    if (norm === 'these' || norm === 'those') {
      definite = true;
      demonstrative = 'دول';
      matched += 1;
      continue;
    }

    // High-frequency words that the dictionary-derived lexicon lacks.
    if (EN_EXTRA_GLOSSES[norm]) {
      emitNoun(EN_EXTRA_GLOSSES[norm]);
      matched += 1;
      continue;
    }

    // Object pronouns follow the verb as a separate particle in Egyptian.
    if (subject && EN_OBJECT_PRONOUNS[norm]) {
      emit(EN_OBJECT_PRONOUNS[norm]);
      matched += 1;
      continue;
    }

    // "do not / does not / did not" → Egyptian "مش" + participle/verb.
    if (
      ['do', 'does', 'did'].includes(norm) &&
      ['not', "n't", 'no'].includes(normalizeEnglish(tokens[index + 1] || ''))
    ) {
      emit('مش');
      matched += 2;
      index += 1;
      continue;
    }

    if (['i', 'me'].includes(norm)) {
      subject = 'I';
      emit('أنا');
      matched += 1;
      continue;
    }
    if (['we', 'us'].includes(norm)) {
      subject = 'we';
      emit('احنا');
      matched += 1;
      continue;
    }
    if (['he', 'him'].includes(norm)) {
      subject = 'he';
      emit('هو');
      matched += 1;
      continue;
    }
    if (['she', 'her'].includes(norm)) {
      subject = 'she';
      emit('هي');
      matched += 1;
      continue;
    }
    if (['they', 'them'].includes(norm)) {
      subject = 'they';
      emit('هم');
      matched += 1;
      continue;
    }
    if (['you', 'your'].includes(norm)) {
      subject = 'you';
      emit('انت');
      matched += 1;
      continue;
    }

    if (['am', 'is', 'are', 'be', 'been', 'being'].includes(norm)) continue;
    if (norm === 'was' || norm === 'were') {
      emit('كان');
      matched += 1;
      continue;
    }
    if (['will', 'shall', 'going'].includes(norm)) {
      if (norm === 'going') continue;
      emit('ه');
      matched += 1;
      continue;
    }
    if (['not', "n't", 'dont', "don't", 'doesnt', "doesn't", 'didnt', "didn't", 'no'].includes(norm)) {
      emit('مش');
      matched += 1;
      continue;
    }
    if (norm === 'to') continue;

    // Modals are realized as Egyptian particles, not conjugated verbs.
    if (EN_MODALS[norm]) {
      emit(EN_MODALS[norm]);
      matched += 1;
      continue;
    }

    // Object pronouns follow the verb as a separate particle in Egyptian.
    if (subject && EN_OBJECT_PRONOUNS[norm]) {
      emit(EN_OBJECT_PRONOUNS[norm]);
      matched += 1;
      continue;
    }

    if (EN_QUESTION_WORDS[norm]) {
      if (['am', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'will'].includes(normalizeEnglish(tokens[index + 1] || ''))) {
        index += 1;
      }
      emit(EN_QUESTION_WORDS[norm]);
      matched += 1;
      continue;
    }

    if (['my', 'mine'].includes(norm)) {
      emit('بتاعي');
      matched += 1;
      continue;
    }

    // Prefer the Egyptian modal forms used in everyday speech.
    const EGYPTIAN_MODALS: Record<string, string> = {
      want: 'عايز',
      need: 'محتاج',
      love: 'بحب',
      like: 'بحب',
    };
    if (EGYPTIAN_MODALS[norm]) {
      emit(EGYPTIAN_MODALS[norm]);
      matched += 1;
      continue;
    }

    // English verb → Arabic conjugated verb.
    const singular = norm.endsWith('ies')
      ? `${norm.slice(0, -3)}y`
      : norm.endsWith('ing')
        ? norm.slice(0, -3)
        : norm.endsWith('ed')
          ? norm.slice(0, -2)
          : norm.endsWith('s')
            ? norm.slice(0, -1)
            : norm;

    const verbRoot = enVerbRoots?.get(norm) || enVerbRoots?.get(singular);
    if (verbRoot) {
      // Egyptian negation uses the active participle: "أنا مش فاهم".
      const participle = ACTIVE_PARTICIPLES[verbRoot];
      if (out[out.length - 1] === 'مش' && participle) {
        emit(participle);
      } else {
        emit(conjugateArabic(verbRoot, subject));
      }
      matched += 1;
      continue;
    }

    const direct = enWord?.get(norm);
    if (direct) {
      emitNoun(direct);
      matched += 1;
      continue;
    }
    if (singular !== norm) {
      const singularHit = enWord?.get(singular);
      if (singularHit) {
        emitNoun(singularHit);
        matched += 1;
        continue;
      }
    }

    // Keep proper nouns / brand names untouched.
    emit(raw);
  }

  // If a phrase-memory hit swallowed the subject pronoun, restore it.
  const AR_PRONOUNS = ['أنا', 'احنا', 'هو', 'هي', 'هم', 'انت'];
  const hasPronoun = out.slice(0, 3).some((word) => AR_PRONOUNS.includes(word));
  if (subject && out.length > 0 && !hasPronoun) {
    const pronoun =
      subject === 'I' ? 'أنا'
      : subject === 'we' ? 'احنا'
      : subject === 'he' ? 'هو'
      : subject === 'she' ? 'هي'
      : subject === 'they' ? 'هم'
      : 'انت';
    out.unshift(pronoun);
  }

  return {
    text: out.join(' ').replace(/\s+/g, ' ').trim(),
    coverage: tokens.length > 0 ? Math.min(1, matched / tokens.length) : 0,
  };
}
/* ------------------------------------------------------------------ */
/* Phrase similarity (for "close" matches)                            */
/* ------------------------------------------------------------------ */

function topPhraseMatch(
  normalized: string,
  index: Map<string, PhraseEntry> | null,
  tokens: string[]
): { entry: PhraseEntry; score: number } | null {
  if (!index) return null;
  const exact = index.get(normalized);
  if (exact) return { entry: exact, score: 1 };

  const queryTokens = new Set(tokens);
  if (queryTokens.size === 0) return null;

  let best: { entry: PhraseEntry; score: number } | null = null;
  for (const entry of phraseEntries || []) {
    const candidateTokens =
      index === arExact
        ? entry.arNorm.split(' ').filter(Boolean)
        : entry.enNorm.split(' ').filter(Boolean);
    if (candidateTokens.length === 0) continue;
    const overlap = candidateTokens.filter((token) => queryTokens.has(token)).length;
    const score = overlap / Math.max(queryTokens.size, candidateTokens.length);
    if (score >= 0.8 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/** Translate an Arabic sentence into English entirely offline. */
export function translateArabicToEnglish(input: string): OfflineTranslationResult {
  buildIndexes();
  const raw = String(input || '').trim();
  if (!raw) {
    return { text: '', direction: 'ar-en', confidence: 'exact', score: 1, coverage: 1 };
  }

  const normalized = normalizeArabic(raw);
  const tokens = normalized.split(' ').filter(Boolean);

  const exact = arExact?.get(normalized);
  if (exact) {
    return {
      text: finishSentence(capitalize(exact.en)),
      direction: 'ar-en',
      confidence: 'exact',
      score: 0.99,
      matchedSource: exact.ar,
      coverage: 1,
    };
  }

  const close = topPhraseMatch(normalized, arExact, tokens);
  if (close && close.score >= 0.9) {
    return {
      text: finishSentence(capitalize(close.entry.en)),
      direction: 'ar-en',
      confidence: 'close',
      score: 0.7 + close.score * 0.2,
      matchedSource: close.entry.ar,
      coverage: close.score,
    };
  }

  const composed = composeArabicToEnglish(raw);
  const confidence: TranslationConfidence =
    composed.coverage >= 0.65 ? 'composed' : 'approximate';

  return {
    text: finishSentence(polishEnglishOutput(composed.text)),
    direction: 'ar-en',
    confidence,
    score: composed.coverage,
    coverage: composed.coverage,
  };
}

/** Translate an English sentence into Arabic entirely offline. */
export function translateEnglishToArabic(input: string): OfflineTranslationResult {
  buildIndexes();
  const raw = String(input || '').trim();
  if (!raw) {
    return { text: '', direction: 'en-ar', confidence: 'exact', score: 1, coverage: 1 };
  }

  const normalized = englishKey(raw);
  const tokens = normalized.split(' ').filter(Boolean);

  const exact = enExact?.get(normalized);
  if (exact) {
    return {
      text: exact.ar,
      direction: 'en-ar',
      confidence: 'exact',
      score: 0.99,
      matchedSource: exact.en,
      coverage: 1,
    };
  }

  const close = topPhraseMatch(normalized, enExact, tokens);
  if (close && close.score >= 0.9) {
    return {
      text: close.entry.ar,
      direction: 'en-ar',
      confidence: 'close',
      score: 0.7 + close.score * 0.2,
      matchedSource: close.entry.en,
      coverage: close.score,
    };
  }

  const composed = composeEnglishToArabic(raw);
  const confidence: TranslationConfidence =
    composed.coverage >= 0.6 ? 'composed' : 'approximate';

  return {
    text: composed.text,
    direction: 'en-ar',
    confidence,
    score: composed.coverage,
    coverage: composed.coverage,
  };
}

/** Auto-detects direction and translates. */
export function translateOffline(input: string): OfflineTranslationResult {
  const hasArabic = /[\u0600-\u06FF]/.test(input);
  return hasArabic ? translateArabicToEnglish(input) : translateEnglishToArabic(input);
}

/** Single-word / short-phrase lookup used by tap-to-translate UIs. */
export function lookupOfflineWord(word: string, from: 'ar' | 'en'): string | null {
  buildIndexes();
  if (from === 'ar') {
    const norm = normalizeArabic(word);
    if (!norm) return null;
    const exact = arExact?.get(norm);
    if (exact) return exact.en;
    const token = lookupArabicToken(word);
    return token.matched ? token.gloss : null;
  }
  const norm = englishKey(word);
  if (!norm) return null;
  const exact = enExact?.get(norm);
  if (exact) return exact.ar;
  return enWord?.get(norm) || null;
}

export function getOfflineTranslationCorpusSize(): number {
  buildIndexes();
  return phraseEntries?.length || 0;
}
