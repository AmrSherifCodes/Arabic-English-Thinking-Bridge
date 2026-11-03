import { MultiLangDictionaryEntry } from './types';

/**
 * German High-Frequency Dictionary
 * Sources: FreeDict German-English, Wiktionary, Tatoeba Corpus
 * License: CC BY-SA 4.0 / CC0 Public Domain
 */
export const GERMAN_DICTIONARY: MultiLangDictionaryEntry[] = [
  {
    id: 'de-kaffee',
    term: 'Kaffee',
    normalizedTerm: 'kaffee',
    targetLang: 'de',
    gender: 'der',
    plural: 'die Kaffees',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'قهوة (مذكر: der Kaffee)',
      en: 'coffee (masculine: der Kaffee)'
    },
    frequencyRank: 105,
    category: 'daily',
    examples: [
      {
        targetSentence: 'Heute trinke ich einen heißen Kaffee.',
        sourceSentences: {
          ar: 'اليوم أشرب قهوة ساخنة.',
          en: 'Today I am drinking a hot coffee.'
        },
        sourceAttribution: 'Tatoeba (CC BY 2.0 FR)'
      },
      {
        targetSentence: 'Möchten Sie einen Kaffee?',
        sourceSentences: {
          ar: 'هل تود فنجان قهوة؟',
          en: 'Would you like a coffee?'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-wasser',
    term: 'Wasser',
    normalizedTerm: 'wasser',
    targetLang: 'de',
    gender: 'das',
    plural: 'die Wässer',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'ماء (محايد: das Wasser)',
      en: 'water (neuter: das Wasser)'
    },
    frequencyRank: 78,
    category: 'daily',
    examples: [
      {
        targetSentence: 'Ich trinke jeden Tag frisches Wasser.',
        sourceSentences: {
          ar: 'أنا أشرب ماءً عذباً كل يوم.',
          en: 'I drink fresh water every day.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-hund',
    term: 'Hund',
    normalizedTerm: 'hund',
    targetLang: 'de',
    gender: 'der',
    plural: 'die Hunde',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'كلب (مذكر: der Hund)',
      en: 'dog (masculine: der Hund)'
    },
    frequencyRank: 180,
    category: 'daily',
    examples: [
      {
        targetSentence: 'Sie sieht den großen Hund im Garten.',
        sourceSentences: {
          ar: 'هي ترى الكلب الكبير في الحديقة.',
          en: 'She sees the big dog in the garden.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-zeit',
    term: 'Zeit',
    normalizedTerm: 'zeit',
    targetLang: 'de',
    gender: 'die',
    plural: 'die Zeiten',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'وقت / زمن (مؤنث: die Zeit)',
      en: 'time (feminine: die Zeit)'
    },
    frequencyRank: 42,
    category: 'core',
    examples: [
      {
        targetSentence: 'Ich habe jetzt leider keine Zeit.',
        sourceSentences: {
          ar: 'للأسف ليس لدي وقت الآن.',
          en: 'Unfortunately I have no time right now.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-buch',
    term: 'Buch',
    normalizedTerm: 'buch',
    targetLang: 'de',
    gender: 'das',
    plural: 'die Bücher',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'كتاب (محايد: das Buch)',
      en: 'book (neuter: das Buch)'
    },
    frequencyRank: 110,
    category: 'academic',
    examples: [
      {
        targetSentence: 'Er liest ein interessantes Buch über Geschichte.',
        sourceSentences: {
          ar: 'هو يقرأ كتاباً ممتعاً عن التاريخ.',
          en: 'He is reading an interesting book about history.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-stadt',
    term: 'Stadt',
    normalizedTerm: 'stadt',
    targetLang: 'de',
    gender: 'die',
    plural: 'die Städte',
    partOfSpeech: 'noun',
    sourceMeanings: {
      ar: 'مدينة (مؤنث: die Stadt)',
      en: 'city (feminine: die Stadt)'
    },
    frequencyRank: 95,
    category: 'travel',
    examples: [
      {
        targetSentence: 'Berlin ist eine lebendige Stadt.',
        sourceSentences: {
          ar: 'برلين مدينة نابضة بالحياة.',
          en: 'Berlin is a vibrant city.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-arbeiten',
    term: 'arbeiten',
    normalizedTerm: 'arbeiten',
    targetLang: 'de',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يعمل / يشتغل',
      en: 'to work'
    },
    frequencyRank: 55,
    category: 'work',
    examples: [
      {
        targetSentence: 'Ich arbeite von Montag bis Freitag im Büro.',
        sourceSentences: {
          ar: 'أنا أعمل من الاثنين إلى الجمعة في المكتب.',
          en: 'I work from Monday to Friday in the office.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-lernen',
    term: 'lernen',
    normalizedTerm: 'lernen',
    targetLang: 'de',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يتعلم / يدرس',
      en: 'to learn / study'
    },
    frequencyRank: 62,
    category: 'academic',
    examples: [
      {
        targetSentence: 'Jetzt lernen wir Deutsch mit Begeisterung.',
        sourceSentences: {
          ar: 'الآن نتعلم الألمانية بحماس.',
          en: 'Now we are learning German with enthusiasm.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-anrufen',
    term: 'anrufen',
    normalizedTerm: 'anrufen',
    targetLang: 'de',
    separablePrefix: 'an',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يتصل هاتفياً (فعل منفصل: an + rufen)',
      en: 'to call by phone (separable: an + rufen)'
    },
    frequencyRank: 130,
    category: 'daily',
    examples: [
      {
        targetSentence: 'Morgen rufe ich dich um zehn Uhr an.',
        sourceSentences: {
          ar: 'غداً سأتصل بك في العاشرة صباحاً.',
          en: 'Tomorrow I will call you at ten o\'clock.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-verstehen',
    term: 'verstehen',
    normalizedTerm: 'verstehen',
    targetLang: 'de',
    partOfSpeech: 'verb',
    sourceMeanings: {
      ar: 'يفهم / يستوعب',
      en: 'to understand'
    },
    frequencyRank: 70,
    category: 'core',
    examples: [
      {
        targetSentence: 'Ich verstehe diesen Satz ganz genau.',
        sourceSentences: {
          ar: 'أنا أفهم هذه الجملة بدقة.',
          en: 'I understand this sentence completely.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-heute',
    term: 'heute',
    normalizedTerm: 'heute',
    targetLang: 'de',
    partOfSpeech: 'adverb',
    sourceMeanings: {
      ar: 'اليوم',
      en: 'today'
    },
    frequencyRank: 35,
    category: 'core',
    examples: [
      {
        targetSentence: 'Heute beginnt ein neuer Tag.',
        sourceSentences: {
          ar: 'اليوم يبدأ يوم جديد.',
          en: 'Today a new day begins.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  },
  {
    id: 'de-schnell',
    term: 'schnell',
    normalizedTerm: 'schnell',
    targetLang: 'de',
    partOfSpeech: 'adjective',
    sourceMeanings: {
      ar: 'سريع / بسرعة',
      en: 'fast / quick / quickly'
    },
    frequencyRank: 115,
    category: 'daily',
    examples: [
      {
        targetSentence: 'Der Zug fährt sehr schnell nach München.',
        sourceSentences: {
          ar: 'القطار يسير بسرعة فائقة إلى ميونيخ.',
          en: 'The train travels very fast to Munich.'
        },
        sourceAttribution: 'Tatoeba'
      }
    ]
  }
];
