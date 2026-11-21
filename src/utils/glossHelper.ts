import { ChunkMapping } from '../types';
import { EGYPTIAN_WORD_GLOSSES } from '../data/egyptianLexicon';
import { getTargetDictionary } from '../data/dictionaries';

const COMMON_WORD_GLOSSES: Record<string, string> = {
  // English
  'hi': 'أهلاً',
  'hello': 'أهلاً',
  'is': 'يكون',
  'am': 'أكون',
  'are': 'تكون / يكونون',
  'عن': 'about / of',
  'عنها': 'about it / her',
  'عنه': 'about it / him',
  'في': 'in / at',
  'فيها': 'in it / her',
  'من': 'from / of',
  'منها': 'from it / her',
  'على': 'on / upon',
  'عليها': 'on it / her',
  'إلى': 'to / towards',
  'إليها': 'to it / her',
  'ما زلت': 'still',
  'زلت': 'still',
  'ما زال': 'still',
  'ما زالت': 'still',
  'بإمكانه': 'can / able',
  'بإمكاني': 'can / able',
  'بإمكانك': 'can / able',
  'بإمكانها': 'can / able',
  'بإمكاننا': 'can / able',
  'بإمكانهم': 'can / able',
  'تطبيق': 'application',
  'للتطبيق': 'for application',
  'تؤثر': 'affects',
  'يؤثر': 'affects',
  'تأثير': 'effect',
  'evening': 'مساء',
  'night': 'ليل',
  'a': 'واحد / مفرد',
  'an': 'واحد / مفرد',
  'the': 'الـ',
  'lot': 'كثير',
  'bike': 'دراجة',
  'make': 'يجعل / يصنع',
  'at': 'في / عند',
  'don\'t': 'لا',
  'doesn\'t': 'لا',
  'can\'t': 'لا يستطيع',
  'fluent': 'طلاقة',
  'lives': 'يعيش',
  'needed': 'مطلوب',
  'helping': 'مساعدة',
  'learning': 'تعلم',
  'leaving': 'مغادرة',
  'of': 'من',
  'house': 'بيت',
  'big': 'كبير',
  'house big': 'بيت كبير',
  'friend': 'صديق',
  'old': 'قديم',
  'friend old': 'صديق قديم',
  'smart': 'ذكي',
  'plan': 'خطة',
  'clever': 'ذكي',
  'plan clever': 'خطة ذكية',
  'wake': 'يستيقظ',
  'lose': 'يخسر',
  'had': 'كان لديه',
  'visit': 'يزور',
  'it': 'هو / هي',
  'him': 'هو',
  'spoke him': 'تحدث معه',
  'will': 'سوف',
  'accepted': 'مقبول',
  'traveled': 'سافر',
  'would': 'سوف / كان سيـ',
  'rained': 'أمطرت',
  'however': 'ومع ذلك',
  'therefore': 'ولذلك',
  'although': 'بالرغم من',
  'shut': 'يغلق',
  'out': 'خارج',
  'petrol': 'بنزين',
  'surrender': 'استسلام',
  'down': 'أسفل',
  'advices': 'نصائح',
  'tips': 'نصائح',
  'informations': 'معلومات',
  'furnitures': 'أثاث',
  'meet': 'يلتقي',
  'to meet': 'أن يلتقي',
  'broke': 'كسر / مفلس',
  'is building': 'يبني',
  'builded': 'مبني',
  'we see': 'نرى',
  'i knew': 'عرفت',
  'this policy should': 'هذه السياسة يجب',
  'forgot': 'نسي',
  'anticipate': 'يتوقع',
  'attends': 'يحضر',
  'should': 'يجب',
  'resigns': 'يستقيل',
  'resigned': 'استقال',
  'moreover': 'علاوة على ذلك',
  'conclusive': 'حاسم',
  'obstacle': 'عقبة',
  'currently': 'حالياً',
  'agreeing': 'موافق',
  'actually': 'في الحقيقة',
  'live': 'يعيش',
  'friendly': 'ودود',
  'kind': 'طيب / نوع',
  'solve': 'يحل',
  'made': 'صنع',
  'arrived': 'وصل',
  'cool': 'بارد / رائع',
  'crush': 'يسحق',
  'wish': 'يتمنى',
  'arm': 'ذراع',
  'too': 'أيضاً',
  'proves': 'يثبت',
  'definitely': 'بالتأكيد',
  'shows': 'يظهر',
  'everyone': 'الجميع',
  'knows': 'يعرف',
  'surely': 'بالتأكيد',
  'prove': 'يثبت',
  'absolute': 'مطلق',

  // Spanish Core Distractors & Words
  'jugar': 'يلعب',
  'pequeña': 'صغيرة',
  'pequeño': 'صغير',
  'blanco': 'أبيض',
  'blanca': 'بيضاء',
  'el': 'الـ (مذكر)',
  'la': 'الـ (مؤنث)',
  'es': 'يكون',
  'casa': 'بيت',
  'niño': 'ولد',
  'juega': 'يلعب',
  'grande': 'كبير',
  'perro': 'كلب',
  'gato': 'قط',
  'comer': 'يأكل',
  'beber': 'يشرب',
  'comimos': 'أكلنا',
  'comí': 'أكلت',
  'hablar': 'يتحدث',
  'hablo': 'أتحدث',
  'habla': 'يتحدث',
  'hablamos': 'نتحدث',
  'vivir': 'يعيش',
  'vivo': 'أعيش',
  'vive': 'يعيش',
  'trabajar': 'يعمل',
  'trabajo': 'أعمل',
  'ir': 'يذهب',
  'voy': 'أذهب',
  'va': 'يذهب',
  'ser': 'يكون',
  'soy': 'أكون',
  'somos': 'نكون',
  'estar': 'يكون',
  'estoy': 'أكون',
  'está': 'يكون',
  'tengo': 'عندي',
  'tiene': 'عنده',
  'tienes': 'عندك',
  'podría': 'هل يمكن / يستطيع',
  'puedo': 'أستطيع',
  'puede': 'يستطيع',

  // French Core Distractors & Words
  'parler': 'يتكلم',
  'parle': 'أتكلم',
  'parles': 'تتحدث',
  'parlons': 'نتحدث',
  'petit': 'صغير',
  'petite': 'صغيرة',
  'le': 'الـ (مذكر)',
  'les': 'الـ (جمع)',
  'un': 'واحد',
  'une': 'واحدة',
  'maison': 'بيت',
  'garçon': 'ولد',
  'fille': 'بنت',
  'est': 'يكون',
  'ne': 'لا / ليس',
  'ne est': 'ليس',
  'n\'est': 'ليس',
  'pas': 'ليس',
  'manger': 'يأكل',
  'mange': 'آكل',
  'mangé': 'أكلت',
  'suis': 'أكون',
  'sommes': 'نكون',
  'ai': 'عندي',
  'm\'a': 'لي / عنده',
  't\'a': 'لك',
  's\'a': 'له',
  'l\'a': 'له / لها',
  's\'est': 'يكون / أصبح',
  'c\'est': 'هذا يكون',
  'j\'ai': 'عندي',
  'j\'habite': 'أعيش',
  'j\'aime': 'أحب',
  'qu\'il': 'أنه',
  'qu\'elle': 'أنها',
  'non': 'لا',
  'oui': 'نعم',
  'moi': 'أنا',
  'toi': 'أنت',
  'lui': 'هو',
  'elle': 'هي',
  'nous': 'نحن',
  'vous': 'أنتم',
  'ils': 'هم',
  'elles': 'هن',
  'ce': 'هذا',
  't\'appelles': 'تُدعى',
  'm\'appelle': 'اسمي',
  's\'appelle': 'اسمه',
  'comment': 'كيف',
  'tu': 'أنت',
  'je': 'أنا',
  'l\'école': 'المدرسة',
  'école': 'مدرسة',
  'joué': 'لعبت',
  'jouer': 'يلعب',

  // Italian Core Distractors & Words
  'parlare': 'يتحدث',
  'parlo': 'أتحدث',
  'parli': 'تتحدث',
  'parliamo': 'نتحدث',
  'piccolo': 'صغير',
  'piccola': 'صغيرة',
  'ragazzo': 'ولد',
  'ragazza': 'بنت',
  'mangiare': 'يأكل',
  'mangio': 'آكل',
  'sono': 'أكون',
  'è': 'يكون',
  'siamo': 'نكون',
  'chiami': 'تُدعى',
  'chiamo': 'اسمي',
  'come': 'كيف',
  'ti': 'لك / نفسك',
  'l\'scuola': 'المدرسة',
  'scuola': 'مدرسة',
  'ho': 'عندي',
  'hai': 'عندك',
  'ha': 'عنده',
  'abbiamo': 'عندنا',
  'avete': 'عندكم',
  'hanno': 'عندهم',
  'comprato': 'اشتريت',
  'visto': 'رأيت',
  'letto': 'قرأت',
  'tazza': 'فنجان',
  'tazze': 'فناجين',
  'puoi': 'يمكنك / تستطيع',
  'posso': 'أستطيع',
  'può': 'يستطيع',
  'possiamo': 'نستطيع',
  'potete': 'تستطيعون',
  'possono': 'يستطيعون',
  'potrei': 'هل يمكنني',
  'potrebbe': 'هل يمكنه',

  // Portuguese Core Distractors & Words
  'falar': 'يتحدث',
  'falo': 'أتحدث',
  'fala': 'يتحدث',
  'falamos': 'نتحدث',
  'pequeno': 'صغير',
  'pequena': 'صغيرة',
  'o': 'الـ',
  'menino': 'ولد',
  'menina': 'بنت',
  'como': 'آكل / كيف',
  'sou': 'أكون',
  'é': 'يكون',
  'tem': 'عنده',
  'chamas': 'تُدعى',
  'chamo': 'اسمي',

  // Turkish Core Distractors & Words
  'çok': 'جداً / كثيراً',
  'sıkça': 'غالباً / كثيراً',
  'sık': 'كثيراً',
  'geniş': 'واسع / عريض',
  'büyük': 'كبير',
  'küçük': 'صغير',
  'güzel': 'جميل',
  'merhaba': 'أهلاً',
  'evet': 'نعم',
  'hayır': 'لا',
  'teşekkürler': 'شكراً',
  'ben': 'أنا',
  'sen': 'أنت',
  'biz': 'نحن',
  'siz': 'أنتم',
  'onlar': 'هم',
  'iyi': 'جيد',
  'günler': 'أيام',
  'günaydın': 'صباح الخير',
  'ev': 'منزل',
  'oda': 'غرفة',
  'araba': 'سيارة',
  'kitap': 'كتاب',
  'su': 'ماء',
  'çay': 'شاي',
  'kahve': 'قهوة',
  'okul': 'مدرسة',
  'öğrenci': 'طالب',
  'öğretmen': 'معلم',
  'için': 'لأجل / لـ',
  've': 'و',
  'de': 'أيضاً / في',
  'da': 'أيضاً / في',
  'ile': 'مع / بـ',
  'bu': 'هذا',
  'şu': 'ذاك',
  'var': 'يوجد',
  'yok': 'لا يوجد',
  'rüya': 'حلم',
  'rüyalar': 'أحلام',
  'üniversite': 'جامعة',
  'üniversitede': 'في الجامعة',

  // Japanese Core Distractors & Words
  'は': 'أداة المبتدأ',
  'が': 'أداة الفاعل',
  'を': 'أداة المفعول',
  'に': 'إلى / في',
  'で': 'في / بواسطة',
  'と': 'مع / و',
  'へ': 'إلى',
  'から': 'من',
  'まで': 'حتى',
  'より': 'من',
  'や': 'و',
  'も': 'أيضاً',
  'の': 'الملكية',
  'か': 'سؤال',
  'ね': 'تأكيد',
  'よ': 'إخبار',
  'だ': 'يكون',
  'あなた': 'أنت',
  'お茶': 'شاي',
  '食べる': 'يأكل',
  '飲む': 'يشرب',
  '飲みます': 'يشرب',
  '食べます': 'يأكل',
  '見ます': 'يرى',
  '行きます': 'يذهب',
  '来ます': 'يأتي',
  '話します': 'يتحدث',
  '飲んで': 'يشرب و',
  '勉強しました': 'درست',
  '食べました': 'أكلت',
  '行きました': 'ذهبت',
  '読めます': 'أستطيع قراءة',
  'できます': 'أستطيع / يمكن',
  '読みます': 'يقرأ',
  '読む': 'يقرأ',
  '書きます': 'يكتب',
  '書く': 'يكتب',
  '聞きます': 'يسمع',
  '聞く': 'يسمع',
  '来ること': 'المجيء',
  '走ること': 'الجري',
  '飛ぶこと': 'الطيران',
  '行くこと': 'الذهاب',
  '食べること': 'الأكل',
  '飲むこと': 'الشرب',
  '勉強すること': 'الدراسة',
  '来る': 'يأتي',
  '行く': 'يذهب',
  '見る': 'يرى',
  '話す': 'يتحدث',
  '泳ぐこと': 'السباحة',
  'コーヒー': 'قهوة',
  '日本語': 'اليابانية',
  '英語': 'الإنجليزية',
  '中国語': 'الصينية',
  'ドイツ語': 'الألمانية',
  'フランス語': 'الفرنسية',
  'スペイン語': 'الإسبانية',
  'イタリア語': 'الإيطالية',
  '先生': 'معلم',
  '学生': 'طالب',
  '学校': 'مدرسة',
  '会社': 'شركة',
  '病院': 'مستشفى',
  '家': 'منزل',
  '部屋': 'غرفة',
  '水': 'ماء',
  'ラーメン': 'رامن',
  'パン': 'خبز',
  '今日': 'اليوم',
  '明日': 'غداً',
  '昨日': 'أمس',
  '今': 'الآن',
  '毎日': 'كل يوم',
  'それ': 'ذلك',
  'あれ': 'ذلك البعيد',
  'この': 'هذا',
  'その': 'ذلك',
  'あの': 'ذلك البعيد',
  '漢字': 'كانجي',
  '新聞': 'جريدة',
  '泳ぐ': 'يسبح',
  '走る': 'يجري',
  '飛ぶ': 'يطير',
};

function stripTashkeelAndPunctuation(str: string): string {
  if (!str) return '';
  return str
    .replace(/[’‘`]/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[()（）\[\]{}.,!?،؛:()"¿¡]/g, '')
    .trim()
    .toLowerCase();
}

export function getGlossForWord(
  word: string,
  chunks: ChunkMapping[] = [],
  targetLang: string = 'en',
  sourceLang: string = 'ar'
): string {
  if (!word) return '';
  const rawWord = word.replace(/[’‘`]/g, "'").trim();
  const clean = stripTashkeelAndPunctuation(word);
  if (!clean) return '';

  const isSourceEnglish = sourceLang === 'en' || sourceLang.startsWith('en');

  // Priority 1: Exact or partial match in exercise.breakdownChunks
  if (chunks && chunks.length > 0) {
    const exactChunk = chunks.find((c) => {
      const srcMatch = stripTashkeelAndPunctuation(c.arabicText || c.sourceText || '') === clean;
      const tgtMatch = stripTashkeelAndPunctuation(c.englishText || c.targetText || '') === clean;
      return srcMatch || tgtMatch;
    });
    if (exactChunk) {
      if (isSourceEnglish) {
        return exactChunk.englishText || exactChunk.sourceText || '';
      }
      return exactChunk.arabicText || exactChunk.sourceText || '';
    }

    const partialChunk = chunks.find((c) => {
      const srcWords = (c.arabicText || c.sourceText || '').toLowerCase().split(/[\s.,!?،]+/);
      const tgtWords = (c.englishText || c.targetText || '').toLowerCase().split(/[\s.,!?]+/);
      return srcWords.includes(clean) || tgtWords.includes(clean);
    });
    if (partialChunk) {
      if (isSourceEnglish) {
        return partialChunk.englishText || partialChunk.sourceText || '';
      }
      return partialChunk.arabicText || partialChunk.sourceText || '';
    }
  }

  // Priority 2: COMMON_WORD_GLOSSES & EGYPTIAN_WORD_GLOSSES fallback
  if (isSourceEnglish) {
    const foundCommon = Object.entries(COMMON_WORD_GLOSSES).find(([, arVal]) => {
      const normAr = stripTashkeelAndPunctuation(arVal);
      if (normAr === clean) return true;
      const parts = arVal.toLowerCase().split(/[\s/]+/).map(stripTashkeelAndPunctuation);
      return parts.includes(clean);
    });
    if (foundCommon) return foundCommon[0];

    if (EGYPTIAN_WORD_GLOSSES[rawWord]) return EGYPTIAN_WORD_GLOSSES[rawWord];
    if (EGYPTIAN_WORD_GLOSSES[clean]) return EGYPTIAN_WORD_GLOSSES[clean];
    const foundEg = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([ar]) => stripTashkeelAndPunctuation(ar) === clean);
    if (foundEg) return foundEg[1];
  } else {
    if (COMMON_WORD_GLOSSES[rawWord.toLowerCase()]) {
      return COMMON_WORD_GLOSSES[rawWord.toLowerCase()];
    }
    if (COMMON_WORD_GLOSSES[clean]) {
      return COMMON_WORD_GLOSSES[clean];
    }
    const foundByNormKey = Object.entries(COMMON_WORD_GLOSSES).find(([k]) => stripTashkeelAndPunctuation(k) === clean);
    if (foundByNormKey) return foundByNormKey[1];

    const foundEg = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([, en]) => stripTashkeelAndPunctuation(en) === clean);
    if (foundEg) return foundEg[0];
  }

  // Priority 3: Target dictionary matching target word or source translation
  try {
    const dict = getTargetDictionary(targetLang);
    if (dict && dict.length > 0) {
      let matchedEntry = dict.find((entry) => {
        const entryWord = stripTashkeelAndPunctuation(entry.word || entry.term || '');
        const entryTrans = stripTashkeelAndPunctuation(entry.translation || entry.arabicWord || entry.englishTranslation || '');
        return entryWord === clean || entryTrans === clean;
      });

      // CJK Substring Match (Japanese/Chinese unspaced compound chips)
      if (!matchedEntry && (targetLang === 'ja' || targetLang === 'zh' || /[\u3040-\u30ff\u4e00-\u9faf]/.test(clean))) {
        matchedEntry = dict.find((entry) => {
          const entryWord = stripTashkeelAndPunctuation(entry.word || entry.term || entry.kanji || entry.romaji || '');
          return entryWord && entryWord.length >= 1 && (clean.includes(entryWord) || entryWord.includes(clean));
        });
      }

      // Elision prefix stripping for French/Italian/English (e.g. l'école -> école, d'eau -> eau, j'étudiais -> étudiais)
      if (!matchedEntry && (rawWord.includes("'") || rawWord.includes("’"))) {
        const parts = rawWord.split(/['’]/);
        const tailWord = stripTashkeelAndPunctuation(parts[parts.length - 1]);
        if (tailWord && tailWord.length >= 2) {
          matchedEntry = dict.find((entry) => {
            const entryWord = stripTashkeelAndPunctuation(entry.word || entry.term || '');
            return entryWord === tailWord || entryWord.startsWith(tailWord) || tailWord.startsWith(entryWord.slice(0, 4));
          });
        }
      }

      if (!matchedEntry) {
        const candidateStems: string[] = [];
        // Arabic prefixes (waw, fa, ba, ka, la, al, lil)
        if (clean.startsWith('لل') && clean.length >= 4) candidateStems.push(clean.slice(2));
        if (clean.startsWith('و') && clean.length >= 3) candidateStems.push(clean.slice(1));
        if (clean.startsWith('ف') && clean.length >= 3) candidateStems.push(clean.slice(1));
        if (clean.startsWith('ب') && clean.length >= 3) candidateStems.push(clean.slice(1));
        if (clean.startsWith('ك') && clean.length >= 3) candidateStems.push(clean.slice(1));
        if (clean.startsWith('ل') && clean.length >= 3) candidateStems.push(clean.slice(1));
        if (clean.startsWith('ال') && clean.length >= 4) candidateStems.push(clean.slice(2));

        // Arabic pronominal suffixes (-ha, -hum, -kum, -na, -ni, -hu, -ka)
        if (clean.endsWith('ها') && clean.length >= 3) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('هم') && clean.length >= 3) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('كم') && clean.length >= 3) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('نا') && clean.length >= 3) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('ني') && clean.length >= 3) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('ه') && clean.length >= 3) candidateStems.push(clean.slice(0, -1));
        if (clean.endsWith('ك') && clean.length >= 3) candidateStems.push(clean.slice(0, -1));

        // Turkish case suffixes
        if (clean.endsWith('lar') && clean.length > 4) candidateStems.push(clean.slice(0, -3));
        if (clean.endsWith('ler') && clean.length > 4) candidateStems.push(clean.slice(0, -3));
        if (clean.endsWith('de') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('da') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('te') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('ta') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('den') && clean.length > 5) candidateStems.push(clean.slice(0, -3));
        if (clean.endsWith('dan') && clean.length > 5) candidateStems.push(clean.slice(0, -3));
        if (clean.endsWith('ten') && clean.length > 5) candidateStems.push(clean.slice(0, -3));
        if (clean.endsWith('tan') && clean.length > 5) candidateStems.push(clean.slice(0, -3));

        // Italian plural endings
        if (clean.endsWith('ze') && clean.length > 3) candidateStems.push(clean.slice(0, -1) + 'a');

        // Romance adjective/plural endings
        if (clean.endsWith('a') && clean.length > 3) candidateStems.push(clean.slice(0, -1) + 'o');
        if (clean.endsWith('as') && clean.length > 4) candidateStems.push(clean.slice(0, -2) + 'o', clean.slice(0, -2) + 'a', clean.slice(0, -1));
        if (clean.endsWith('os') && clean.length > 4) candidateStems.push(clean.slice(0, -2) + 'o', clean.slice(0, -1));
        if (clean.endsWith('s') && clean.length > 3) candidateStems.push(clean.slice(0, -1));
        if (clean.endsWith('es') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('e') && clean.length > 3) candidateStems.push(clean.slice(0, -1) + 'o');

        for (const stem of candidateStems) {
          matchedEntry = dict.find((entry) => {
            const entryWord = stripTashkeelAndPunctuation(entry.word || entry.term || '');
            return entryWord === stem;
          });
          if (matchedEntry) break;
        }
      }

      if (!matchedEntry && clean.length >= 3) {
        const prefix = clean.slice(0, Math.min(clean.length, 4));
        matchedEntry = dict.find((entry) => {
          const entryWord = stripTashkeelAndPunctuation(entry.word || entry.term || '');
          if (!entryWord || entryWord.length < 3) return false;
          return entryWord.startsWith(prefix) || clean.startsWith(entryWord.slice(0, 3));
        });
      }

      if (matchedEntry) {
        if (isSourceEnglish) {
          return matchedEntry.englishTranslation || matchedEntry.word || matchedEntry.term || '';
        }
        return matchedEntry.translation || matchedEntry.arabicWord || '';
      }
    }
  } catch {}

  // Priority 4: Multi-word phrase chip fallback (e.g. "ai joué" -> combined glosses)
  if (clean.includes(' ')) {
    const wordParts = clean.split(/\s+/).filter(Boolean);
    const subGlosses = wordParts
      .map((p) => getGlossForWord(p, chunks, targetLang, sourceLang))
      .filter(Boolean);
    if (subGlosses.length > 0) {
      return subGlosses.join(' ');
    }
  }

  return '';
}
