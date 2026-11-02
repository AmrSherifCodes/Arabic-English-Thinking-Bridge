/**
 * arabicPhonetics.ts
 *
 * High-accuracy phonetic transliteration engine that converts English words and sentences
 * into their literal, natural Arabic phonetic spelling (التعريب الصوتي / النطق بالعربي).
 * 
 * Examples:
 *   "Hello" -> "هيلو"
 *   "Thinking Bridge" -> "ثينكينج بريدج"
 *   "Because" -> "بيكوز"
 *   "I understand" -> "آي أندرستاند"
 */

// 1. Curated Dictionary of Frequent Conversational English Words -> Authentic Arabic Spelling
export const ENGLISH_TO_ARABIC_PHONETICS: Record<string, string> = {
  // Pronouns & Contractions
  i: 'آي',
  im: 'آي آم',
  "i'm": 'آي آم',
  you: 'يو',
  youre: 'يور',
  "you're": 'يور',
  he: 'هي',
  hes: 'هيز',
  "he's": 'هيز',
  she: 'شي',
  shes: 'شيز',
  "she's": 'شيز',
  it: 'إت',
  its: 'إتس',
  "it's": 'إتس',
  we: 'وي',
  were: 'وير',
  "we're": 'وير',
  they: 'ذي',
  theyre: 'ذير',
  "they're": 'ذير',
  me: 'مي',
  him: 'هِم',
  her: 'هير',
  us: 'آس',
  them: 'ذيم',
  my: 'ماي',
  your: 'يور',
  his: 'هيز',
  our: 'آوَر',
  their: 'ذير',

  // Auxiliaries & Verbs
  am: 'آم',
  is: 'إز',
  are: 'آر',
  was: 'واز',
  be: 'بي',
  been: 'بين',
  being: 'بيينج',
  have: 'هاف',
  has: 'هاز',
  had: 'هاد',
  do: 'دو',
  does: 'داز',
  did: 'ديد',
  doing: 'دوينج',
  done: 'دان',
  can: 'كان',
  cant: 'كانت',
  "can't": 'كانت',
  could: 'كود',
  couldnt: 'كودنت',
  "couldn't": 'كودنت',
  will: 'ويل',
  wont: 'وونت',
  "won't": 'وونت',
  would: 'وود',
  wouldnt: 'وودنت',
  "wouldn't": 'وودنت',
  shall: 'شال',
  should: 'شود',
  shouldnt: 'شودنت',
  "shouldn't": 'شودنت',
  must: 'ماست',
  may: 'ماي',
  might: 'مايت',

  // Common Action Verbs
  go: 'جو',
  goes: 'جوز',
  going: 'جوينج',
  went: 'وينت',
  gone: 'جون',
  come: 'كام',
  comes: 'كامز',
  coming: 'كامنغ',
  came: 'كيم',
  see: 'سي',
  saw: 'سو',
  seen: 'سين',
  look: 'لوك',
  know: 'نو',
  knew: 'نيو',
  known: 'نون',
  think: 'ثينك',
  thinking: 'ثينكينج',
  thought: 'ثوت',
  get: 'جيت',
  got: 'جوت',
  getting: 'جيتينج',
  make: 'ميك',
  making: 'ميكينج',
  made: 'ميد',
  take: 'تيك',
  took: 'توك',
  taken: 'تيكن',
  say: 'ساي',
  said: 'سيد',
  tell: 'تيل',
  told: 'تولد',
  speak: 'سبيك',
  speaking: 'سبيكينج',
  spoke: 'سبوك',
  spoken: 'سبوكن',
  talk: 'توك',
  talking: 'توكينج',
  listen: 'ليسن',
  hear: 'هير',
  understand: 'أندرستاند',
  understanding: 'أندرستاندينج',
  understood: 'أندرستود',
  learn: 'ليرن',
  learning: 'ليرنينج',
  read: 'ريد',
  write: 'رايت',
  writing: 'رايتينج',
  study: 'ستادي',
  work: 'ورك',
  working: 'وركينج',
  live: 'ليف',
  living: 'ليفينج',
  help: 'هيلب',
  need: 'نيد',
  want: 'وانت',
  like: 'لايك',
  love: 'لاف',
  feel: 'فيل',
  try: 'تراي',
  ask: 'آسك',
  answer: 'آنـسر',
  remember: 'ريميمبر',
  forget: 'فورجيت',
  start: 'ستارت',
  stop: 'ستوب',
  wait: 'ويت',

  // Question Words & Connectors
  what: 'وات',
  why: 'واي',
  where: 'وير',
  when: 'وين',
  who: 'هو',
  whom: 'هوم',
  whose: 'هوز',
  how: 'هاو',
  which: 'ويتش',
  because: 'بيكوز',
  and: 'أند',
  but: 'بات',
  or: 'أور',
  so: 'سو',
  if: 'إف',
  that: 'ذات',
  this: 'ذيس',
  these: 'ذيز',
  those: 'ذوز',
  then: 'ذين',
  than: 'ذان',
  there: 'ذير',
  here: 'هير',
  also: 'أولسو',
  too: 'تو',
  very: 'فيري',
  really: 'ريلي',

  // Prepositions & Articles
  the: 'ذا',
  a: 'أ',
  an: 'آن',
  to: 'تو',
  in: 'إن',
  on: 'أون',
  at: 'أت',
  for: 'فور',
  from: 'فروم',
  with: 'ويذ',
  without: 'ويذاوت',
  about: 'أباوت',
  into: 'إنتو',
  by: 'باي',
  after: 'أفتر',
  before: 'بيفور',
  between: 'بيتوين',
  under: 'أندر',
  over: 'أوفر',
  up: 'آب',
  down: 'داون',

  // Greetings, Social & Common Vocab
  hello: 'هيلو',
  hi: 'هاي',
  hey: 'هاي',
  bye: 'باي',
  goodbye: 'جود باي',
  good: 'جود',
  morning: 'مورنينج',
  night: 'نايت',
  evening: 'إيفنينج',
  afternoon: 'أفترنون',
  please: 'بليز',
  thanks: 'ثانكس',
  thank: 'ثانك',
  welcome: 'ويلكم',
  sorry: 'سوري',
  yes: 'يس',
  no: 'نو',
  not: 'نوت',
  okay: 'أوكيه',
  ok: 'أوكيه',
  fine: 'فاين',
  great: 'جريت',
  well: 'ويل',
  now: 'ناو',
  today: 'توداي',
  tomorrow: 'تومورو',
  yesterday: 'يسترداي',

  // Core App Concepts
  bridge: 'بريدج',
  english: 'إنجلش',
  arabic: 'أرابيك',
  language: 'لانجويج',
  word: 'وورد',
  words: 'ووردز',
  practice: 'براكتس',
  lesson: 'ليسن',
  lessons: 'ليسنز',
  flashcard: 'فلاش كارد',
  flashcards: 'فلاش كاردز',
  card: 'كارد',
  cards: 'كاردز',
  level: 'ليفل',
  beginner: 'بيجينر',
  intermediate: 'إنترميديت',
  advanced: 'أدفانسد',
  voice: 'فويس',
  speed: 'سبيد',
  master: 'ماستر',
  water: 'ووتر',
  food: 'فود',
  book: 'بوك',
  car: 'كار',
  house: 'هاوس',
  home: 'هوم',
  time: 'تايم',
  friend: 'فريند',
  family: 'فاميلي',
  school: 'سكول',
  student: 'ستيودنت',
  teacher: 'تيتشر',
  people: 'بيبول',
  world: 'وورلد',
  money: 'ماني',
  job: 'جوب',
  center: 'سنتر',
  problem: 'بروبلم',
  idea: 'آيديا',
  question: 'كويستشن',
  important: 'إمبورتانت',
  different: 'ديفرينت',
  easy: 'إيزي',
  hard: 'هارد',
  simple: 'سيمبل',
  smart: 'سمارت',
  free: 'فري'
};

/**
 * Phonetically transliterates a single English word into Arabic letters using phonetic rules.
 */
function transliterateWordToPhonetics(word: string): string {
  const clean = word.toLowerCase().trim();
  if (!clean) return '';

  // 1. Direct dictionary match
  if (ENGLISH_TO_ARABIC_PHONETICS[clean]) {
    return ENGLISH_TO_ARABIC_PHONETICS[clean];
  }

  // 2. Rule-based phoneme-to-Arabic mapping
  let str = clean;

  // Suffix patterns
  str = str.replace(/tion$/g, 'شن');
  str = str.replace(/sion$/g, 'شن');
  str = str.replace(/ture$/g, 'تشر');
  str = str.replace(/ing$/g, 'ينج');
  str = str.replace(/ed$/g, 'د');
  str = str.replace(/ness$/g, 'نس');
  str = str.replace(/able$/g, 'ابل');
  str = str.replace(/ible$/g, 'يبل');
  str = str.replace(/ment$/g, 'منت');
  str = str.replace(/ous$/g, 'اس');
  str = str.replace(/ful$/g, 'فول');
  str = str.replace(/less$/g, 'لس');
  str = str.replace(/ly$/g, 'لي');

  // Digraphs & consonant clusters
  str = str.replace(/ph/g, 'ف');
  str = str.replace(/ch/g, 'تش');
  str = str.replace(/sh/g, 'ش');
  str = str.replace(/th/g, 'ث');
  str = str.replace(/ck/g, 'ك');
  str = str.replace(/qu/g, 'كو');
  str = str.replace(/wh/g, 'و');
  str = str.replace(/wr/g, 'ر');
  str = str.replace(/kn/g, 'ن');
  str = str.replace(/ee/g, 'ي');
  str = str.replace(/ea/g, 'ي');
  str = str.replace(/oo/g, 'و');
  str = str.replace(/ou/g, 'او');
  str = str.replace(/ow/g, 'او');
  str = str.replace(/ai/g, 'اي');
  str = str.replace(/ay/g, 'اي');

  // Soft/hard c and g
  str = str.replace(/c([eiy])/g, 'س$1');
  str = str.replace(/c/g, 'ك');
  str = str.replace(/g([eiy])/g, 'ج$1');
  str = str.replace(/g/g, 'ج');

  // Vowels and initial positions
  str = str.replace(/^a/g, 'أ');
  str = str.replace(/^e/g, 'إ');
  str = str.replace(/^i/g, 'إ');
  str = str.replace(/^o/g, 'أو');
  str = str.replace(/^u/g, 'أو');

  // Consonants
  const consonantMap: Record<string, string> = {
    b: 'ب',
    p: 'ب',
    d: 'د',
    t: 'ت',
    f: 'ف',
    v: 'ف',
    k: 'ك',
    q: 'ك',
    l: 'ل',
    m: 'م',
    n: 'ن',
    r: 'ر',
    s: 'س',
    z: 'ز',
    j: 'ج',
    h: 'ه',
    w: 'و',
    y: 'ي',
    x: 'كس'
  };

  let out = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (consonantMap[char]) {
      out += consonantMap[char];
    } else if (char === 'a') {
      out += 'ا';
    } else if (char === 'e' || char === 'i') {
      out += 'ي';
    } else if (char === 'o' || char === 'u') {
      out += 'و';
    } else {
      out += char;
    }
  }

  // Deduplicate consecutive identical vowels in Arabic transliteration (e.g. يي -> ي, وو -> و)
  out = out.replace(/ي{2,}/g, 'ي').replace(/و{2,}/g, 'و').replace(/ا{2,}/g, 'ا');

  return out;
}

/**
 * Converts any English text (word, phrase, or sentence) into its literal Arabic pronunciation.
 * E.g., "Hello! How are you?" -> "هيلو! هاو آر يو؟"
 */
export function getArabicPhoneticSpelling(englishText: string): string {
  if (!englishText || !englishText.trim()) return '';

  // Preserve punctuation while transliterating words
  return englishText.replace(/[a-zA-Z0-9']+/g, (matched) => {
    return transliterateWordToPhonetics(matched);
  });
}

