import { ChunkMapping } from '../types';
import { EGYPTIAN_WORD_GLOSSES } from '../data/egyptianLexicon';

const COMMON_WORD_GLOSSES: Record<string, string> = {
  'hi': 'أهلاً',
  'hello': 'أهلاً',
  'is': 'يكون',
  'am': 'أكون',
  'are': 'يكونوا',
  'evening': 'مساء',
  'night': 'ليل',
  'a': 'أداة نكرة',
  'an': 'أداة نكرة',
  'the': 'الـ',
  'lot': 'كثير',
  'bike': 'دراجة',
  'make': 'يجعل / يصنع',
  'at': 'في / عند',
  'don\'t': 'لا',
  'doesn\'t': 'لا',
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
  'builded': 'مبني (خطأ)',
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
  'absolute': 'مطلق'
};

export function getGlossForWord(word: string, chunks: ChunkMapping[], targetLang: string, sourceLang: string): string {
    if (!word) return '';
    const clean = word.toLowerCase().trim();

    // 1. Check COMMON_WORD_GLOSSES
    if (COMMON_WORD_GLOSSES[clean]) {
      return COMMON_WORD_GLOSSES[clean];
    }

    // 2. Exact match in chunks
    const exactChunk = chunks.find(c => c.englishText.toLowerCase() === clean || c.targetText?.toLowerCase() === clean);
    if (exactChunk) return exactChunk.arabicText || exactChunk.sourceText || '';

    // 3. Partial match in chunks
    const partialChunk = chunks.find(c => {
        const enWords = (c.englishText || c.targetText || '').toLowerCase().split(/[\s.,!?]+/);
        return enWords.includes(clean);
    });
    if (partialChunk) return partialChunk.arabicText || partialChunk.sourceText || '';

    // 4. Fallback to Egyptian Lexicon if target is English and source is Arabic
    if (targetLang === 'en' && (sourceLang === 'ar' || sourceLang === 'arz')) {
        const found = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([ar, en]) => en.toLowerCase() === clean);
        if (found) return found[0];
    }

    return '';
}
