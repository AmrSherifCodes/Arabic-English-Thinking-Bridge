/**
 * CEFR Progression Sorter & Frequency Level Assigner
 * Maps dictionary entries to CEFR levels (A0, A1, A2, B1, B2, C1, C2)
 * using frequency ranks, survival word overrides, and cognate promotion.
 */

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

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

function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
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
  if (idx > 0) return CEFR_BANDS[idx - 1];
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

export function assignCEFRLevels<
  T extends {
    word?: string;
    term?: string;
    germanWord?: string;
    kanji?: string;
    englishTranslation?: string;
    frequencyRank?: number;
    cefrLevel?: string;
  }
>(entries: T[]): Array<T & { cefrLevel: CEFRLevel }> {
  return entries.map((entry, idx) => {
    const term = (entry.word || entry.term || entry.germanWord || entry.kanji || '').trim();
    const rank = entry.frequencyRank && entry.frequencyRank > 0 ? entry.frequencyRank : idx + 1;
    let level = assignCEFRLevelByRank(rank);

    // 1. Survival Word Override
    if (SURVIVAL_WORDS.has(term.toLowerCase())) {
      level = 'A0';
    }

    // 2. Cognate Promotion
    if (entry.englishTranslation) {
      const similarity = calculateLevenshteinSimilarity(term, entry.englishTranslation);
      if (similarity >= 0.72 && level !== 'A0') {
        level = promoteCEFRBand(level);
      }
    }

    return {
      ...entry,
      cefrLevel: level,
    };
  });
}
