import { MultiLangDictionaryEntry } from './types';

/**
 * Japanese High-Frequency Dictionary
 * Sources: JMdict Simplified (EDRDG), Tatoeba Project
 * License: CC BY-SA 3.0 / CC0 Public Domain
 */
export const JAPANESE_DICTIONARY: MultiLangDictionaryEntry[] = [
  {
    id: 'ja-mizu',
    term: '水',
    normalizedTerm: '水',
    targetLang: 'ja',
    reading: 'みず',
    romaji: 'mizu',
    furigana: '<ruby>水<rt>みず</rt></ruby>',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'ماء / مياه باردة',
      en: 'water (cold water)'
    },
    frequencyRank: 95,
    category: 'daily',
    examples: [
      {
        targetSentence: '水を一杯飲みます。',
        sourceSentences: {
          ar: 'أنا أشرب كأساً من الماء.',
          en: 'I drink a cup of water.'
        },
        furigana: '<ruby>水<rt>みず</rt></ruby>を<ruby>一杯<rt>いっぱい</rt></ruby><ruby>飲<rt>の</rt></ruby>みます。',
        romaji: 'Mizu o ippai nomimasu.',
        sourceAttribution: 'Tatoeba (CC BY 2.0 FR)'
      }
    ]
  },
  {
    id: 'ja-gakusei',
    term: '学生',
    normalizedTerm: '学生',
    targetLang: 'ja',
    reading: 'がくせい',
    romaji: 'gakusei',
    furigana: '<ruby>学生<rt>がくせい</rt></ruby>',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'طالب / طالبة',
      en: 'student'
    },
    frequencyRank: 120,
    category: 'academic',
    examples: [
      {
        targetSentence: '私は大学の学生です。',
        sourceSentences: {
          ar: 'أنا طالب في الجامعة.',
          en: 'I am a university student.'
        },
        furigana: '<ruby>私<rt>わたし</rt></ruby>は<ruby>大学<rt>だいがく</rt></ruby>の<ruby>学生<rt>がくせい</rt></ruby>です。',
        romaji: 'Watashi wa daigaku no gakusei desu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-sensei',
    term: '先生',
    normalizedTerm: '先生',
    targetLang: 'ja',
    reading: 'せんせい',
    romaji: 'sensei',
    furigana: '<ruby>先生<rt>せんせい</rt></ruby>',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'أستاذ / معلّم / طبيب',
      en: 'teacher / professor / doctor'
    },
    frequencyRank: 88,
    category: 'academic',
    examples: [
      {
        targetSentence: '先生は日本語を教えます。',
        sourceSentences: {
          ar: 'الأستاذ يدرّس اللغة اليابانية.',
          en: 'The teacher teaches Japanese.'
        },
        furigana: '<ruby>先生<rt>せんせい</rt></ruby>は<ruby>日本語<rt>にほんご</rt></ruby>を<ruby>教<rt>おし</rt></ruby>えます。',
        romaji: 'Sensei wa nihongo o oshiemasu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-hon',
    term: '本',
    normalizedTerm: '本',
    targetLang: 'ja',
    reading: 'ほん',
    romaji: 'hon',
    furigana: '<ruby>本<rt>ほん</rt></ruby>',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'كتاب',
      en: 'book'
    },
    frequencyRank: 75,
    category: 'academic',
    examples: [
      {
        targetSentence: '図書館で本を読みます。',
        sourceSentences: {
          ar: 'أنا أقرأ كتاباً في المكتبة.',
          en: 'I read a book at the library.'
        },
        furigana: '<ruby>図書館<rt>としょかん</rt></ruby>で<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます。',
        romaji: 'Toshokan de hon o yomimasu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-taberu',
    term: '食べる',
    normalizedTerm: '食べる',
    targetLang: 'ja',
    reading: 'たべる',
    romaji: 'taberu',
    furigana: '<ruby>食<rt>た</rt></ruby>べる',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يأكل / تناول الطعام (صيغة المهذب: 食べます)',
      en: 'to eat (polite: tabemasu)'
    },
    frequencyRank: 40,
    category: 'daily',
    examples: [
      {
        targetSentence: '毎日朝ごはんを食べます。',
        sourceSentences: {
          ar: 'أتناول وجبة الإفطار كل يوم.',
          en: 'I eat breakfast every day.'
        },
        furigana: '<ruby>毎日<rt>まいにち</rt></ruby><ruby>朝<rt>あさ</rt></ruby>ごはんを<ruby>食<rt>た</rt></ruby>べます。',
        romaji: 'Mainichi asagohan o tabemasu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-nomu',
    term: '飲む',
    normalizedTerm: '飲む',
    targetLang: 'ja',
    reading: 'のむ',
    romaji: 'nomu',
    furigana: '<ruby>飲<rt>の</rt></ruby>む',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يشرب (صيغة المهذب: 飲みます)',
      en: 'to drink (polite: nomimasu)'
    },
    frequencyRank: 45,
    category: 'daily',
    examples: [
      {
        targetSentence: 'お茶を飲みますか。',
        sourceSentences: {
          ar: 'هل تشرب الشاي الأخضر؟',
          en: 'Do you drink tea?'
        },
        furigana: 'お<ruby>茶<rt>ちゃ</rt></ruby>を<ruby>飲<rt>の</rt></ruby>みますか。',
        romaji: 'Ocha o nomimasu ka.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-iku',
    term: '行く',
    normalizedTerm: '行く',
    targetLang: 'ja',
    reading: 'いく',
    romaji: 'iku',
    furigana: '<ruby>行<rt>い</rt></ruby>く',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يذهب (صيغة المهذب: 行きます)',
      en: 'to go (polite: ikimasu)'
    },
    frequencyRank: 25,
    category: 'travel',
    examples: [
      {
        targetSentence: '明日東京に行きます。',
        sourceSentences: {
          ar: 'غداً سأذهب إلى طوكيو.',
          en: 'Tomorrow I will go to Tokyo.'
        },
        furigana: '<ruby>明日<rt>あした</rt></ruby><ruby>東京<rt>とうきょう</rt></ruby>に<ruby>行<rt>い</rt></ruby>きます。',
        romaji: 'Ashita Tokyo ni ikimasu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-arigatou',
    term: 'ありがとう',
    normalizedTerm: 'ありがとう',
    targetLang: 'ja',
    reading: 'ありがとう',
    romaji: 'arigatou',
    partOfSpeech: 'phrase',
    sourceMeanings: {
      ar: 'شكراً جزيلاً',
      en: 'thank you'
    },
    frequencyRank: 10,
    category: 'daily',
    examples: [
      {
        targetSentence: 'どうもありがとうございます。',
        sourceSentences: {
          ar: 'شكراً جزيلاً لحضرتك (بأعلى درجات الأدب).',
          en: 'Thank you very much (formal polite).'
        },
        romaji: 'Doumo arigatou gozaimasu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-nihon',
    term: '日本',
    normalizedTerm: '日本',
    targetLang: 'ja',
    reading: 'にほん',
    romaji: 'nihon',
    furigana: '<ruby>日本<rt>にほん</rt></ruby>',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'اليابان (كوكب اليابان)',
      en: 'Japan'
    },
    frequencyRank: 50,
    category: 'travel',
    examples: [
      {
        targetSentence: '日本はとても美しい国です。',
        sourceSentences: {
          ar: 'اليابان بلد جميل للغاية.',
          en: 'Japan is a very beautiful country.'
        },
        furigana: '<ruby>日本<rt>にほん</rt></ruby>はとても<ruby>美<rt>うつく</rt></ruby>しい<ruby>国<rt>くに</rt></ruby>です。',
        romaji: 'Nihon wa totemo utsukushii kuni desu.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'ja-kyou',
    term: '今日',
    normalizedTerm: '今日',
    targetLang: 'ja',
    reading: 'きょう',
    romaji: 'kyou',
    furigana: '<ruby>今日<rt>きょう</rt></ruby>',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'اليوم / النهار ده',
      en: 'today'
    },
    frequencyRank: 30,
    category: 'daily',
    examples: [
      {
        targetSentence: '今日はいい天気ですね。',
        sourceSentences: {
          ar: 'الطقس جميل اليوم، أليس كذلك؟',
          en: 'The weather is nice today, isn\'t it?'
        },
        furigana: '<ruby>今日<rt>きょう</rt></ruby>はいい<ruby>天気<rt>てんき</rt></ruby>ですね。',
        romaji: 'Kyou wa ii tenki desu ne.',
        sourceAttribution: 'Tatoeba'
      }
    ]
  }
];

