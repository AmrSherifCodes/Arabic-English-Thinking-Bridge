/**
 * CEFR Progression Sorter & Frequency Level Assigner
 * Maps dictionary entries to CEFR levels (A0, A1, A2, B1, B2, C1, C2)
 * using frequency ranks, survival word overrides, and cognate promotion.
 */

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CEFREntry {
  word: string;
  translation: string;
  cefr?: CEFRLevel;
  cefrLevel?: CEFRLevel;
  frequencyRank?: number;
}

// Essential survival/function words promoted to A0/A1
const SURVIVAL_WORDS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'be', 'am', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their',
  'yes', 'no', 'not', 'and', 'but', 'or', 'so', 'because', 'if', 'when', 'where', 'who', 'what',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'der', 'die', 'das', 'ein', 'eine', 'sein', 'bin', 'ist',
  'watashi', 'desu', 'wa', 'o', 'ni', 'de', 'ga', 'ka', 'je', 'suis', 'est', 'yo', 'soy', 'es',
]);

function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const s1 = stripDiacritics(str1);
  const s2 = stripDiacritics(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  return 1 - distance / maxLength;
}

const CEFR_BANDS: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function promoteCEFRBand(level: CEFRLevel): CEFRLevel {
  const idx = CEFR_BANDS.indexOf(level);
  if (idx > 1) return CEFR_BANDS[idx - 1]; // floor A1
  if (idx === 1) return 'A1';
  return level;
}

export function assignCEFRLevelByRank(rank: number): CEFRLevel {
  if (rank <= 500) return 'A0';
  if (rank <= 1500) return 'A1';
  if (rank <= 3000) return 'A2';
  if (rank <= 5500) return 'B1';
  if (rank <= 9000) return 'B2';
  if (rank <= 15000) return 'C1';
  return 'C2';
}

const memoMap = new WeakMap<object, Array<any>>();

export function assignCEFRLevels<
  T extends {
    word?: string;
    term?: string;
    translation?: string;
    englishTranslation?: string;
    frequencyRank?: number;
    cefr?: CEFRLevel;
    cefrLevel?: CEFRLevel;
  }
>(entries: T[]): Array<T & { cefr: CEFRLevel; cefrLevel: CEFRLevel }> {
  if (memoMap.has(entries)) {
    return memoMap.get(entries)!;
  }

  const sorted = entries.map((entry, idx) => {
    const word = (entry.word || entry.term || '').trim();
    const translation = (entry.translation || entry.englishTranslation || '').trim();
    const rank = entry.frequencyRank && entry.frequencyRank > 0 ? entry.frequencyRank : idx + 1;

    let level = assignCEFRLevelByRank(rank);

    // 1. Survival Word Override
    if (SURVIVAL_WORDS.has(word.toLowerCase())) {
      level = rank <= 2500 ? 'A0' : 'A1';
    }

    // 2. Cognate Override
    if (word.length >= 4 && translation.length >= 4) {
      const sim = calculateLevenshteinSimilarity(word, translation);
      if (sim >= 0.72) {
        level = promoteCEFRBand(level);
      }
    }

    return {
      ...entry,
      word,
      translation,
      cefr: level,
      cefrLevel: level,
    };
  });

  memoMap.set(entries, sorted);
  return sorted;
}
