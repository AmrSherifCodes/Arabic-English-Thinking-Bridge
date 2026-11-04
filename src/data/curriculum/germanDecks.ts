import { PrebuiltDeck } from '../prebuiltDecks';

export const GERMAN_PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'german-starter-a1',
    name: '🇩🇪 German Thinking Starter · Das Fundament',
    description: 'Essential German sentences built on the V2 rule and Accusative case.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source.',
    cards: [
      { ar: 'أنا أتعلم الألمانية', en: 'Ich lerne Deutsch' },
      { ar: 'صباح الخير', en: 'Guten Morgen' },
      { ar: 'كيف حالك؟', en: 'Wie geht es dir?' },
      { ar: 'شكراً جزيلاً', en: 'Vielen Dank' },
      { ar: 'نعم، أفهم ذلك', en: 'Ja, ich verstehe das' },
    ],
  },
  {
    id: 'german-genders-vocab',
    name: '🇩🇪 High-Frequency Vocabulary & Genders (der/die/das)',
    description: 'Core daily words with definite articles and plurals.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source.',
    cards: [
      { ar: 'الرجل', en: 'der Mann' },
      { ar: 'المرأة', en: 'die Frau' },
      { ar: 'الطفل', en: 'das Kind' },
      { ar: 'البيت', en: 'das Haus' },
      { ar: 'السيارة', en: 'das Auto' },
    ],
  },
];
