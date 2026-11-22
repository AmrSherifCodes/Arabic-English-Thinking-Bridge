/**
 * Pure, deterministic helpers for Sentence Builder word-bank tiles
 * and the Smart Assistant "+ ضيف الكلمة الجاية" (next-word) handler.
 */

export interface WordBankTile {
  id: string;
  word: string;
}

const TOKEN_PUNCTUATION_RE = /[.,?!。、「」]/g;

export function tokenizeTargetSentence(targetSentence: string): string[] {
  return (targetSentence || '')
    .replace(TOKEN_PUNCTUATION_RE, '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function normalizeTileWord(word: string): string {
  return (word || '').replace(TOKEN_PUNCTUATION_RE, '').trim().toLowerCase();
}

/**
 * Builds unique-ID tile objects from an array of word strings.
 */
export function createWordBankTiles(exerciseId: string, words: string[]): WordBankTile[] {
  return words.map((word, index) => ({
    id: `${exerciseId}-tile-${index}`,
    word,
  }));
}

/**
 * Selects the next unused tile matching targetTokens[placedTileIds.length].
 *
 * Guarantees:
 * 1. Aborts immediately (returns null) if placedTileIds.length >= targetTokens.length.
 * 2. Determines expectedWord = targetTokens[placedTileIds.length].
 * 3. Finds an unused tile from wordBankTiles by unique tile.id (!usedIds.has(tile.id))
 *    matching expectedWord (case-insensitive, trimmed).
 * 4. Never synthesizes duplicate tiles or re-selects an already placed tile.id.
 */
export function selectNextHintTile(
  targetSentence: string,
  placedTileIds: string[],
  wordBankTiles: WordBankTile[]
): WordBankTile | null {
  const targetTokens = tokenizeTargetSentence(targetSentence);
  if (placedTileIds.length >= targetTokens.length) {
    return null;
  }

  const expectedWord = normalizeTileWord(targetTokens[placedTileIds.length]);
  if (!expectedWord) {
    return null;
  }

  const usedIds = new Set(placedTileIds);
  const matchingTile = wordBankTiles.find(
    (tile) => !usedIds.has(tile.id) && normalizeTileWord(tile.word) === expectedWord
  );

  return matchingTile ?? null;
}

/**
 * Pure state-updater helper that prevents duplicate tile.id insertion
 * and enforces the targetTokens.length upper bound.
 */
export function appendPlacedTileId(
  prevIds: string[],
  tileId: string,
  maxTokens: number
): string[] {
  if (prevIds.length >= maxTokens) return prevIds;
  if (prevIds.includes(tileId)) return prevIds;
  return [...prevIds, tileId];
}
