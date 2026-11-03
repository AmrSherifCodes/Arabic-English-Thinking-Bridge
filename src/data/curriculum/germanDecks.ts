import { PrebuiltDeck } from '../prebuiltDecks';
import { GERMAN_DICTIONARY } from '../dictionaries/germanDictionary';

export const GERMAN_PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'german-starter-a1',
    name: '🇩🇪 German Thinking Starter · Das Fundament',
    description: 'Essential German sentences built on the V2 rule and Accusative case. Based on FreeDict & Tatoeba public domain corpus.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from FreeDict & Tatoeba.',
    cards: GERMAN_DICTIONARY.flatMap(entry =>
      entry.examples.map(ex => ({
        ar: ex.sourceSentences.ar,
        en: ex.targetSentence
      }))
    )
  },
  {
    id: 'german-genders-vocab',
    name: '🇩🇪 High-Frequency Vocabulary & Genders (der/die/das)',
    description: 'Core daily words with definite articles and plurals. Designed to build effortless gender instincts.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from FreeDict.',
    cards: GERMAN_DICTIONARY.map(entry => ({
      ar: `${entry.sourceMeanings.ar} ${entry.gender ? `[${entry.gender}]` : ''}`,
      en: `${entry.gender ? `${entry.gender} ` : ''}${entry.term}${entry.plural ? ` (${entry.plural})` : ''}`
    }))
  }
];

