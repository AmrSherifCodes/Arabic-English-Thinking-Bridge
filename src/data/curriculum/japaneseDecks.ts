import { PrebuiltDeck } from '../prebuiltDecks';
import { JAPANESE_DICTIONARY } from '../dictionaries/japaneseDictionary';

export const JAPANESE_PREBUILT_DECKS: PrebuiltDeck[] = [
  {
    id: 'japanese-starter-n5',
    name: '🇯🇵 Japanese Thinking Starter · 基礎 Immersion',
    description: 'Real contextual thinking sentences with SOV sentence order, topic marker は, and object marker を. Sourced from JMdict & Tatoeba.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from JMdict simplified & Tatoeba.',
    cards: JAPANESE_DICTIONARY.flatMap(entry =>
      entry.examples.map(ex => ({
        ar: `${ex.sourceSentences.ar}${ex.romaji ? ` [${ex.romaji}]` : ''}`,
        en: ex.targetSentence
      }))
    )
  },
  {
    id: 'japanese-core-vocab',
    name: '🇯🇵 Core Japanese Vocabulary & Kanji (JMdict)',
    description: 'High-frequency core words with Kanji, Kana readings, and Romaji for natural mental acquisition.',
    author: 'Thinking Bridge Open Commons',
    license: 'CC0 1.0 Public Domain',
    disclaimer: '100% Free & Open Source. Sourced from JMdict (EDRDG).',
    cards: JAPANESE_DICTIONARY.map(entry => ({
      ar: `${entry.sourceMeanings.ar} [${entry.reading || entry.term}]`,
      en: `${entry.term} (${entry.romaji || entry.reading})`
    }))
  }
];

