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
  hello: 'هيلو',
  happy: 'هَابِي',
  // Multilingual Top 5 Overrides (German, French, Spanish, Turkish)
  guten: 'جُوتِن',
  tag: 'تَاك',
  morgen: 'مُورجِن',
  danke: 'دَانْكِه',
  bonjour: 'بُونْجُور',
  merci: 'مِيرْسِي',
  salut: 'سَالُو',
  hola: 'أُولَا',
  gracias: 'جْرَاثِيَاس',
  merhaba: 'مَرْحَبَا',
  nasilsin: 'نَاصِلسِين',
  nasılsın: 'نَاصِلسِين',
  köprü: 'كُوبْرِي',
  kopru: 'كُوبْرِي',
  oda: 'أُوضَا',
  çanta: 'شَانْطَا',
  canta: 'شَانْطَا',
  taze: 'تَازَه',
  doğru: 'دُوغْرِي',
  dogru: 'دُوغْرِي',
  hesap: 'هِيسَابْ',
  cadde: 'جَادَّه',
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
 * Curated German -> Authentic Arabic Phonetic Dictionary
 * Follows standard German pronunciation:
 *   ch (after e/i/ä/ö/ü/consonants) -> ش, ch (after a/o/u/au) -> خ
 *   eu/äu -> وي, sch -> ش, ei -> اي, ie -> ي, w/v -> ف, z -> تس, j -> ي
 */
export const GERMAN_TO_ARABIC_PHONETICS: Record<string, string> = {
  ich: 'إيش',
  du: 'دو',
  er: 'إير',
  sie: 'زي',
  es: 'إس',
  wir: 'فير',
  ihr: 'إير',
  mein: 'ماين',
  meine: 'ماينه',
  meinen: 'ماينن',
  dein: 'داين',
  deine: 'داينه',
  sein: 'زاين',
  seine: 'زاينه',
  unser: 'أونزر',
  der: 'دير',
  die: 'دي',
  das: 'داس',
  den: 'دين',
  dem: 'ديم',
  ein: 'أين',
  eine: 'أينه',
  einen: 'أينن',
  einer: 'أينر',
  einem: 'أينم',
  ist: 'إست',
  bin: 'بين',
  bist: 'بيست',
  sind: 'زيند',
  war: 'فار',
  haben: 'هابن',
  habe: 'هابه',
  hat: 'هات',
  lerne: 'ليرنه',
  lernen: 'ليرنن',
  deutsch: 'دويتش',
  deutschland: 'دويتشلاند',
  hallo: 'هالو',
  guten: 'جوتن',
  morgen: 'مورجن',
  abend: 'أبند',
  tag: 'تاج',
  nacht: 'ناخت',
  danke: 'دانكه',
  vielen: 'فيلن',
  dank: 'دانك',
  bitte: 'بيته',
  ja: 'يا',
  nein: 'ناين',
  nicht: 'نيشت',
  und: 'أوند',
  aber: 'أبر',
  oder: 'أودر',
  weil: 'فايل',
  dass: 'داس',
  auch: 'أوخ',
  sehr: 'زير',
  gut: 'جوت',
  gute: 'جوته',
  gutes: 'جوتس',
  schön: 'شون',
  schöne: 'شونه',
  schöner: 'شونر',
  schönen: 'شونن',
  schönes: 'شونس',
  heute: 'هويته',
  jetzt: 'يتست',
  hier: 'هير',
  dort: 'دورت',
  wie: 'في',
  wo: 'فو',
  was: 'فاس',
  wer: 'فير',
  wann: 'فان',
  warum: 'فاروم',
  geht: 'جيت',
  dir: 'دير',
  mir: 'مير',
  dich: 'ديش',
  mich: 'ميش',
  wohne: 'فونه',
  wohnt: 'فونت',
  wohnen: 'فونن',
  berlin: 'برلين',
  wetter: 'فيتر',
  bahnhof: 'بانهوف',
  brauche: 'براوخه',
  hilfe: 'هيلفه',
  viel: 'فيل',
  kostet: 'كوستت',
  trinke: 'ترينكه',
  trinken: 'ترينكن',
  wasser: 'فاسر',
  kaffee: 'كافيه',
  tee: 'تي',
  brot: 'بروت',
  essen: 'إسن',
  frisches: 'فريشس',
  leckeres: 'ليكرس',
  restaurant: 'ريستوران',
  bietet: 'بيتت',
  freund: 'فرويند',
  familie: 'فاميليا',
  bruder: 'برودر',
  mann: 'مان',
  frau: 'فراو',
  kind: 'كيند',
  haus: 'هاوس',
  auto: 'أوتو',
  buch: 'بوخ',
  stadt: 'شتات',
  schule: 'شوله',
  arbeit: 'أربايت',
  straße: 'شتراسه',
  strasse: 'شتراسه',
  heiße: 'هايسه',
  heisse: 'هايسه',
  auf: 'أوف',
  wiedersehen: 'فيدرزين',
  tschüss: 'تشوس',
  entschuldigung: 'إنتشولديجونج',
  sprechen: 'شبريشن',
  langsam: 'لانجزام',
  verstehe: 'فرشتيهه',
  können: 'كونن',
  kann: 'كان',
  möchte: 'موشته',
  helfen: 'هيلفن',
  rechnung: 'ريشنونج',
  tisch: 'تيش',
  zug: 'تسوج',
  ticket: 'تيكت',
  kaufen: 'كاوفن',
  reise: 'رايزه',
  groß: 'جروس',
  nett: 'نيت',
  warm: 'فارم',
  kalt: 'كالت',
  nah: 'ناه',
  pünktlich: 'بونكتليش',
  rufe: 'روفه',
  an: 'أن',
  lieben: 'ليبن',
  in: 'إن',
  mit: 'ميت',
  für: 'فور',
  nach: 'ناخ',
  zu: 'تسو',
  von: 'فون',
};

const GERMAN_DETECTION_RE =
  /[äöüßÄÖÜ]|\b(ich|deutsch|lerne|heute|wohne|wohnt|freund|schön|schöner|schöne|schönen|vielen|dank|guten|morgen|abend|bahnhof|brauche|hilfe|kostet|trinke|wasser|kaffee|restaurant|bietet|leckeres|essen|wetter|wie|geht|bitte|danke|hallo|heiße|wiedersehen|entschuldigung|sprechen|verstehe|können|möchte|rechnung|nicht|weil|dass|auch|mein|meine|der|die|das|den|dem|einen|einer|wir|sie)\b/i;

/**
 * Phonetically transliterates a single German word into Arabic letters.
 */
function transliterateGermanWordToPhonetics(word: string): string {
  const clean = word.toLowerCase().trim();
  if (!clean) return '';

  if (GERMAN_TO_ARABIC_PHONETICS[clean]) {
    return GERMAN_TO_ARABIC_PHONETICS[clean];
  }

  let str = clean;

  // Multi-letter German digraphs/trigraphs (order matters!)
  str = str.replace(/tsch/g, 'تش');
  str = str.replace(/sch/g, 'ش');
  str = str.replace(/^sp/g, 'شب');
  str = str.replace(/^st/g, 'شت');
  str = str.replace(/tion$/g, 'تسيون');
  str = str.replace(/([aou]|au)ch/g, '$1خ');
  str = str.replace(/ch/g, 'ش');
  str = str.replace(/ck/g, 'ك');
  str = str.replace(/ph/g, 'ف');
  str = str.replace(/qu/g, 'كف');
  str = str.replace(/eu|äu/g, 'وي');
  str = str.replace(/ei|ai/g, 'اي');
  str = str.replace(/ie/g, 'ي');
  str = str.replace(/au/g, 'او');
  str = str.replace(/ß/g, 'س');
  str = str.replace(/e$/g, 'ه');

  // Initial vowels
  str = str.replace(/^a/g, 'أ');
  str = str.replace(/^e/g, 'إ');
  str = str.replace(/^i/g, 'إ');
  str = str.replace(/^o/g, 'أو');
  str = str.replace(/^u/g, 'أو');
  str = str.replace(/^ä/g, 'إي');
  str = str.replace(/^ö/g, 'أو');
  str = str.replace(/^ü/g, 'أو');

  const germanMap: Record<string, string> = {
    b: 'ب',
    c: 'ك',
    d: 'د',
    f: 'ف',
    g: 'ج',
    h: 'ه',
    j: 'ي',
    k: 'ك',
    l: 'ل',
    m: 'م',
    n: 'ن',
    p: 'ب',
    q: 'ك',
    r: 'ر',
    s: 'س',
    t: 'ت',
    v: 'ف',
    w: 'ف',
    x: 'كس',
    y: 'ي',
    z: 'تس',
    a: 'ا',
    e: 'ي',
    i: 'ي',
    o: 'و',
    u: 'و',
    ä: 'ي',
    ö: 'و',
    ü: 'و',
  };

  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    out += germanMap[ch] ?? ch;
  }

  return out.replace(/ي{2,}/g, 'ي').replace(/و{2,}/g, 'و').replace(/ا{2,}/g, 'ا');
}

/**
 * Converts text (word, phrase, or sentence) into its literal Arabic pronunciation.
 * Supports English (default) and accurate German-to-Arabic phonetics when
 * targetLang === 'de' or German text is detected.
 * E.g., "Hello! How are you?" -> "هيلو! هاو آر يو?"
 * E.g., "Ich lerne Deutsch" -> "إيش ليرنه دويتش"
 */
export function getArabicPhoneticSpelling(text: string, targetLang?: string): string {
  if (!text || !text.trim()) return '';

  const isGerman =
    targetLang?.toLowerCase().startsWith('de') ||
    (!targetLang && GERMAN_DETECTION_RE.test(text));

  if (isGerman) {
    return text.replace(/[a-zA-ZäöüßÄÖÜ0-9']+/g, (matched) => {
      return transliterateGermanWordToPhonetics(matched);
    });
  }

  // Preserve punctuation while transliterating English words
  return text.replace(/[a-zA-Z0-9']+/g, (matched) => {
    return transliterateWordToPhonetics(matched);
  });
}

