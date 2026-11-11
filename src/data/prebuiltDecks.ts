export interface PrebuiltDeckCard {
  ar: string;
  en: string;
  level?: string;
}

export interface PrebuiltDeck {
  id: string;
  name: string;
  description: string;
  author: string;
  license: 'CC0 1.0 Public Domain' | 'CC BY 4.0' | 'CC BY-SA 4.0';
  disclaimer: string;
  level?: string;
  cards: PrebuiltDeckCard[];
}

export const PUBLIC_DOMAIN_DISCLAIMER =
  '100% Copyright-Free (CC0 1.0 Universal Public Domain Dedication). You can copy, modify, distribute, and study this deck freely without any copyright restrictions.';

export const LEXICORE_DISCLAIMER =
  '100% Copyright-Free (CC0 1.0 Public Domain / Creative Commons Attribution 4.0 Compatible). Original pedagogical sentences dedicated to the public domain for unrestricted learning.';

export const TATOEBA_DISCLAIMER =
  '100% Copyright-Free (CC0 1.0 Public Domain / Creative Commons Attribution-ShareAlike 4.0 Compatible). Structural Arabic–English bridging sentences dedicated to the public domain.';

export const PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'beginner-starter-a0',
    name: 'Ultra-Beginner 2-Word Starter (Zero Stress A0)',
    description:
      '15 bite-sized 2–4 word sentences designed for absolute beginners. Master "am / is / are" and "have" in seconds with zero stress!',
    author: 'Thinking English Public Domain Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: PUBLIC_DOMAIN_DISCLAIMER,
    level: 'A1',
    cards: [
      { ar: 'أنا جاهز الآن', en: 'I am ready now.', level: 'A1' },
      { ar: 'أنا هنا اليوم', en: 'I am here today.', level: 'A1' },
      { ar: 'هو مشغول جداً', en: 'He is very busy.', level: 'A1' },
      { ar: 'هي سعيدة اليوم', en: 'She is happy today.', level: 'A1' },
      { ar: 'نحن في البيت', en: 'We are at home.', level: 'A1' },
      { ar: 'الجو جميل اليوم', en: 'It is nice today.', level: 'A1' },
      { ar: 'عندي فكرة جيدة', en: 'I have a good idea.', level: 'A1' },
      { ar: 'عندي سؤال بسيط', en: 'I have a simple question.', level: 'A1' },
      { ar: 'هذا سهل جداً', en: 'This is very easy.', level: 'A1' },
      { ar: 'القهوة جاهزة الآن', en: 'The coffee is ready now.', level: 'A1' },
      { ar: 'أنا متأكد تماماً', en: 'I am completely sure.', level: 'A1' },
      { ar: 'هم أصدقائي', en: 'They are my friends.', level: 'A1' },
      { ar: 'المحل مفتوح الآن', en: 'The shop is open now.', level: 'A1' },
      { ar: 'أريد كوب ماء', en: 'I want a glass of water.', level: 'A1' },
      { ar: 'شكراً على مساعدتك', en: 'Thank you for your help.', level: 'A1' }
    ]
  },
  {
    id: 'lexicore-daily',
    name: 'LexiCore Daily English',
    description:
      'High-frequency daily Arabic-to-English structural sentences focusing on natural collocations, time prepositions, and everyday spoken flow.',
    author: 'Public Domain Language Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: LEXICORE_DISCLAIMER,
    level: 'A2',
    cards: [
      { ar: 'أنا في طريقي إلى الاجتماع الآن', en: 'I am on my way to the meeting right now.', level: 'A2' },
      { ar: 'الأمر يعتمد على الظروف', en: 'It depends on the circumstances.', level: 'A2' },
      { ar: 'لم أقصد مقاطعتك', en: 'I did not mean to interrupt you.', level: 'A2' },
      { ar: 'هل يمكنك إرسال التفاصيل لي عبر البريد الإلكتروني؟', en: 'Could you send me the details by email?', level: 'A2' },
      { ar: 'استغرق المشروع وقتاً أطول مما توقعنا', en: 'The project took longer than we expected.', level: 'A2' },
      { ar: 'أفضل العمل في الصباح الباكر', en: 'I prefer working in the early morning.', level: 'A2' },
      { ar: 'هذا القرار منطقي تماماً', en: 'This decision makes complete sense.', level: 'A2' },
      { ar: 'دعنا نبقى على تواصل هذا الأسبوع', en: 'Let us stay in touch this week.', level: 'A2' },
      { ar: 'لدي خبرة خمس سنوات في هذا المجال', en: 'I have five years of experience in this field.', level: 'A2' },
      { ar: 'من الضروري أن نصل في الموعد المحدد', en: 'It is essential that we arrive on time.', level: 'A2' }
    ]
  },
  {
    id: 'tatoeba-bridging',
    name: 'Tatoeba Structural Bridges',
    description:
      'Community-curated Arabic–English sentence pairs targeting tense contrast, indirect questions, and idiomatic prepositions.',
    author: 'Public Domain Sentence Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: TATOEBA_DISCLAIMER,
    level: 'B1',
    cards: [
      { ar: 'منذ متى وأنت تنتظر هنا؟', en: 'How long have you been waiting here?', level: 'B1' },
      { ar: 'أتطلع إلى سماع رأيك قريباً', en: 'I look forward to hearing your opinion soon.', level: 'B1' },
      { ar: 'لو كنت مكانك، لقبلت العرض فوراً', en: 'If I were you, I would accept the offer immediately.', level: 'B1' },
      { ar: 'لا علاقة لهذا الأمر بالميزانية', en: 'This has nothing to do with the budget.', level: 'B1' },
      { ar: 'هل تمانع في فتح النافذة قليلاً؟', en: 'Would you mind opening the window a little?', level: 'B1' },
      { ar: 'من الصعب التنبؤ بالنتيجة النهائية', en: 'It is hard to predict the final outcome.', level: 'B1' },
      { ar: 'اعتدت على الاستيقاظ مبكراً كل يوم', en: 'I am used to waking up early every day.', level: 'B1' },
      { ar: 'كلما تدربت أكثر، أصبحت أكثر ثقة', en: 'The more you practice, the more confident you become.', level: 'B1' },
      { ar: 'كان ينبغي لنا أن نتحقق من الجدول مسبقاً', en: 'We should have checked the schedule in advance.', level: 'B1' },
      { ar: 'بغض النظر عن النتيجة، لقد بذلنا قصارى جهدنا', en: 'Regardless of the result, we did our very best.', level: 'B1' }
    ]
  }
];
