/**
 * Pure, deterministic helpers for Sentence Builder word-bank tiles
 * and the Smart Assistant "+ ضيف الكلمة الجاية" (next-word) handler.
 */

export interface WordBankTile {
  id: string;
  word: string;
}

const DISPLAY_EDGE_PUNCT_RE = /^[.,?!،؛؟¿¡。、「」，;:"“”()]+|[.,?!،؛؟¿¡。、「」，;:"“”()]+$/g;
const NORMALIZE_PUNCT_RE = /[.,?!،؛؟¿¡。、「」，;:"'’‘“”()]/g;
const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff]/u;

export function tokenizeTargetSentence(targetSentence: string): string[] {
  return (targetSentence || '')
    .split(/\s+/)
    .map((t) => t.replace(DISPLAY_EDGE_PUNCT_RE, '').trim())
    .filter(Boolean);
}

export function normalizeTileWord(word: string): string {
  return (word || '').replace(NORMALIZE_PUNCT_RE, '').trim().toLowerCase();
}

export function normalizeAnswerForComparison(value: string, isCjk?: boolean): string {
  const cjk = isCjk ?? CJK_RE.test(value || '');
  const normalized = (value || '').toLowerCase().replace(NORMALIZE_PUNCT_RE, '');
  return cjk
    ? normalized.replace(/\s+/g, '')
    : normalized.trim().replace(/\s+/g, ' ');
}

/**
 * Guarantees that every token (and exact multiplicity) required by targetSentence
 * is present in the returned word-bank options, while removing empty/punctuation-only
 * garbage tiles and preserving existing valid distractors.
 */
export function ensureRequiredWordBankTokens(
  rawOptions: string[],
  targetSentence: string
): string[] {
  const cleanOptions = (rawOptions || [])
    .map((opt) => (opt ?? '').trim())
    .filter((opt) => normalizeTileWord(opt).length > 0);

  if (!targetSentence || !targetSentence.trim()) {
    return cleanOptions;
  }

  if (CJK_RE.test(targetSentence)) {
    const reqChars = new Map<string, number>();
    const reqOrder: string[] = [];
    for (const ch of normalizeAnswerForComparison(targetSentence, true)) {
      if (!reqChars.has(ch)) reqOrder.push(ch);
      reqChars.set(ch, (reqChars.get(ch) || 0) + 1);
    }

    const haveChars = new Map<string, number>();
    for (const opt of cleanOptions) {
      for (const ch of normalizeAnswerForComparison(opt, true)) {
        haveChars.set(ch, (haveChars.get(ch) || 0) + 1);
      }
    }

    const result = [...cleanOptions];
    for (const ch of reqOrder) {
      const need = reqChars.get(ch) || 0;
      const have = haveChars.get(ch) || 0;
      for (let i = have; i < need; i++) {
        result.push(ch);
      }
    }
    return result;
  }

  const targetTokens = tokenizeTargetSentence(targetSentence);
  const required = new Map<string, { display: string; count: number }>();
  const requiredOrder: string[] = [];

  for (const tok of targetTokens) {
    const key = normalizeTileWord(tok);
    if (!key) continue;
    const existing = required.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      required.set(key, { display: tok, count: 1 });
      requiredOrder.push(key);
    }
  }

  const presentCounts = new Map<string, number>();
  for (const opt of cleanOptions) {
    // Only single-token chips can satisfy an individual word requirement.
    if (/\s/.test(opt)) continue;
    const key = normalizeTileWord(opt);
    if (!key) continue;
    presentCounts.set(key, (presentCounts.get(key) || 0) + 1);
  }

  const result = [...cleanOptions];
  for (const key of requiredOrder) {
    const req = required.get(key)!;
    const have = presentCounts.get(key) || 0;
    for (let i = have; i < req.count; i++) {
      result.push(req.display);
    }
  }

  return result;
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

export interface SentenceDiffToken {
  word: string;
  status: 'match' | 'missing' | 'wrong';
  userWord?: string;
}

/**
 * Computes a word-by-word (or character-by-character for CJK) diff between
 * the learner's submitted sentence and the target sentence using LCS alignment
 * so a single missing or extra word does not misalign the rest of the sentence.
 */
export function computeSentenceDiff(
  userSentence: string,
  targetSentence: string
): SentenceDiffToken[] {
  const isCjk = CJK_RE.test(targetSentence || '');
  const splitDisplayTokens = (input: string): string[] => {
    if (!input || !input.trim()) return [];
    if (isCjk) {
      return Array.from(input.replace(NORMALIZE_PUNCT_RE, '').replace(/\s+/g, ''));
    }
    return tokenizeTargetSentence(input);
  };

  const targetTokens = splitDisplayTokens(targetSentence);
  if (targetTokens.length === 0) return [];
  const userTokens = splitDisplayTokens(userSentence);

  const normKey = (token: string) =>
    isCjk ? token.toLowerCase() : normalizeTileWord(token) || token.toLowerCase();

  const targetKeys = targetTokens.map(normKey);
  const userKeys = userTokens.map(normKey);
  const m = targetKeys.length;
  const n = userKeys.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      if (targetKeys[i] === userKeys[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const matchedPairs: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (targetKeys[i] === userKeys[j]) {
      matchedPairs.push([i, j]);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  matchedPairs.push([m, n]);

  const diff: SentenceDiffToken[] = [];
  let tCursor = 0;
  let uCursor = 0;

  for (const [matchT, matchU] of matchedPairs) {
    const gapTargets = targetTokens.slice(tCursor, matchT);
    const gapUsers = userTokens.slice(uCursor, matchU);

    gapTargets.forEach((tWord, idx) => {
      const wrongUserWord = gapUsers[idx];
      if (wrongUserWord) {
        diff.push({ word: tWord, status: 'wrong', userWord: wrongUserWord });
      } else {
        diff.push({ word: tWord, status: 'missing' });
      }
    });

    if (matchT < m) {
      diff.push({ word: targetTokens[matchT], status: 'match' });
    }

    tCursor = matchT + 1;
    uCursor = matchU + 1;
  }

  return diff;
}

