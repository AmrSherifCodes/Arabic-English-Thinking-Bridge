export interface PrebuiltDeck {
  id: string;
  name: string;
  description: string;
  author: string;
  license: 'CC0 1.0 Public Domain' | 'CC BY 4.0' | 'CC BY-SA 4.0';
  disclaimer: string;
  cards: { ar: string; en: string }[];
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
    cards: [
      {
        ar: 'أنا جاهز الآن',
        en: 'I am ready now.'
      },
      {
        ar: 'أنا هنا اليوم',
        en: 'I am here today.'
      },
      {
        ar: 'هو مشغول جداً',
        en: 'He is very busy.'
      },
      {
        ar: 'هي سعيدة اليوم',
        en: 'She is happy today.'
      },
      {
        ar: 'نحن في البيت',
        en: 'We are at home.'
      },
      {
        ar: 'الجو جميل اليوم',
        en: 'It is nice today.'
      },
      {
        ar: 'عندي فكرة جيدة',
        en: 'I have a good idea.'
      },
      {
        ar: 'عندي سؤال بسيط',
        en: 'I have a simple question.'
      },
      {
        ar: 'هذا سهل جداً',
        en: 'This is very easy.'
      },
      {
        ar: 'القهوة جاهزة الآن',
        en: 'The coffee is ready now.'
      },
      {
        ar: 'أنا متأكد تماماً',
        en: 'I am completely sure.'
      },
      {
        ar: 'هم أصدقائي',
        en: 'They are my friends.'
      },
      {
        ar: 'المحل مفتوح الآن',
        en: 'The shop is open now.'
      },
      {
        ar: 'أريد كوب ماء',
        en: 'I want a glass of water.'
      },
      {
        ar: 'شكراً على مساعدتك',
        en: 'Thank you for your help.'
      }
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
    cards: [
      {
        ar: 'أنا في طريقي إلى الاجتماع الآن',
        en: 'I am on my way to the meeting right now.'
      },
      {
        ar: 'الأمر يعتمد على الظروف',
        en: 'It depends on the circumstances.'
      },
      {
        ar: 'لم أقصد مقاطعتك',
        en: 'I did not mean to interrupt you.'
      },
      {
        ar: 'هل يمكنك إرسال التفاصيل لي عبر البريد الإلكتروني؟',
        en: 'Could you send me the details by email?'
      },
      {
        ar: 'استغرق المشروع وقتاً أطول مما توقعنا',
        en: 'The project took longer than we expected.'
      },
      {
        ar: 'أفضل العمل في الصباح الباكر',
        en: 'I prefer working in the early morning.'
      },
      {
        ar: 'هذا القرار منطقي تماماً',
        en: 'This decision makes complete sense.'
      },
      {
        ar: 'دعنا نبقى على تواصل هذا الأسبوع',
        en: 'Let us stay in touch this week.'
      },
      {
        ar: 'لدي خبرة خمس سنوات في هذا المجال',
        en: 'I have five years of experience in this field.'
      },
      {
        ar: 'من الضروري أن نصل في الموعد المحدد',
        en: 'It is essential that we arrive on time.'
      }
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
    cards: [
      {
        ar: 'منذ متى وأنت تنتظر هنا؟',
        en: 'How long have you been waiting here?'
      },
      {
        ar: 'أتطلع إلى سماع رأيك قريباً',
        en: 'I look forward to hearing your opinion soon.'
      },
      {
        ar: 'لو كنت مكانك، لقبلت العرض فوراً',
        en: 'If I were you, I would accept the offer immediately.'
      },
      {
        ar: 'لا علاقة لهذا الأمر بالميزانية',
        en: 'This has nothing to do with the budget.'
      },
      {
        ar: 'هل تمانع في فتح النافذة قليلاً؟',
        en: 'Would you mind opening the window a little?'
      },
      {
        ar: 'من الصعب التنبؤ بالنتيجة النهائية',
        en: 'It is hard to predict the final outcome.'
      },
      {
        ar: 'اعتدت على الاستيقاظ مبكراً كل يوم',
        en: 'I am used to waking up early every day.'
      },
      {
        ar: 'كلما تدربت أكثر، أصبحت أكثر ثقة',
        en: 'The more you practice, the more confident you become.'
      },
      {
        ar: 'كان ينبغي لنا أن نتحقق من الجدول مسبقاً',
        en: 'We should have checked the schedule in advance.'
      },
      {
        ar: 'بغض النظر عن النتيجة، لقد بذلنا قصارى جهدنا',
        en: 'Regardless of the result, we did our very best.'
      }
    ]
  }
];
