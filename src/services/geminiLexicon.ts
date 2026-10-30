import type { UserProfile } from '../hooks/useUserProfile';
import { getStaticDictionaryEntries } from '../data/staticDictionary';

export const SITUATIONS = ['student', 'call-center', 'public-matter'] as const;
export type Situation = (typeof SITUATIONS)[number];
export const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase'] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export const ARABIC_DIALECTS = ['egyptian', 'msa'] as const;
export type ArabicDialect = (typeof ARABIC_DIALECTS)[number];

export interface LexiconEntry {
  arabicWord: string; englishTranslation: string; partOfSpeech: PartOfSpeech;
  situations: Situation[]; exampleSentenceArabic: string; exampleSentenceEnglish: string;
  dialect: ArabicDialect;
  level?: DifficultyLevel;
}

export interface TutorContext {
  profile: UserProfile;
  currentWord?: LexiconEntry;
  history: string[];
}

export type LexiconErrorCode = 'missing-key' | 'empty-input' | 'timeout' | 'rate-limited' | 'network' | 'bad-output' | 'unknown';
export class LexiconError extends Error { constructor(public code: LexiconErrorCode, message: string) { super(message); this.name = 'LexiconError'; } }
export type LexiconResult = { ok: true; entry: LexiconEntry } | { ok: false; error: LexiconError };

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const isSituation = (v: unknown): v is Situation => (SITUATIONS as readonly string[]).includes(v as string);
const isPos = (v: unknown): v is PartOfSpeech => (PARTS_OF_SPEECH as readonly string[]).includes(v as string);
const isDialect = (v: unknown): v is ArabicDialect => (ARABIC_DIALECTS as readonly string[]).includes(v as string);

export function isLexiconEntry(v: unknown): v is LexiconEntry {
  if (!v || typeof v !== 'object') return false; const e = v as Record<string, unknown>;
  return !!str(e.arabicWord) && !!str(e.englishTranslation) && isPos(e.partOfSpeech) && Array.isArray(e.situations) && e.situations.length > 0 && e.situations.every(isSituation) && !!str(e.exampleSentenceArabic) && !!str(e.exampleSentenceEnglish) && isDialect(e.dialect) && (e.level === undefined || (typeof e.level === 'string' && (DIFFICULTY_LEVELS as readonly string[]).includes(e.level)));
}

export function normalizeEntry(raw: unknown): LexiconEntry | null {
  const first = Array.isArray(raw) ? raw[0] : raw; if (!first || typeof first !== 'object') return null; const r = first as Record<string, unknown>;
  const situations = Array.isArray(r.situations) ? [...new Set(r.situations.map((s) => str(s).toLowerCase().replace(/[\s_]+/g, '-')).filter(isSituation))] : [];
  const candidate = { arabicWord: str(r.arabicWord), englishTranslation: str(r.englishTranslation), partOfSpeech: str(r.partOfSpeech).toLowerCase(), situations, exampleSentenceArabic: str(r.exampleSentenceArabic), exampleSentenceEnglish: str(r.exampleSentenceEnglish), dialect: r.dialect === undefined ? 'msa' : str(r.dialect).toLowerCase(), ...(r.level === undefined ? {} : { level: str(r.level).toLowerCase() }) };
  return isLexiconEntry(candidate) ? candidate : null;
}

const TIMEOUT_MS = 20_000;

export async function checkGeminiService(): Promise<boolean> {
  const response = await fetch('/api/gemini', { cache: 'no-store' });
  if (!response.ok) return false;
  const result: unknown = await response.json();
  return !!result && typeof result === 'object' &&
    (result as Record<string, unknown>).configured === true;
}

function toLexiconError(e: unknown): LexiconError {
  if (e instanceof LexiconError) return e; const status = (e as { status?: number })?.status; const msg = e instanceof Error ? e.message : String(e);
  if (status === 429 || /quota|rate/i.test(msg)) return new LexiconError('rate-limited', 'Too many requests.');
  if (status === 400 && /api key/i.test(msg)) return new LexiconError('missing-key', 'Key rejected.');
  if (/fetch|network|failed to load/i.test(msg) || (typeof navigator !== 'undefined' && !navigator.onLine)) return new LexiconError('network', 'Network error.');
  return new LexiconError('unknown', msg || 'Error.');
}

async function requestGemini<T>(
  operation: 'entry' | 'deck' | 'tutor',
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const abortRequest = () => controller.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });
  if (signal?.aborted) controller.abort();

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, operation }),
      signal: controller.signal
    });
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') {
      throw new LexiconError('bad-output', 'The AI service returned an invalid response.');
    }

    const body = result as Record<string, unknown>;
    if (!response.ok) {
      const error = body.error && typeof body.error === 'object'
        ? body.error as Record<string, unknown>
        : {};
      const code = typeof error.code === 'string' &&
        ['missing-key', 'empty-input', 'timeout', 'rate-limited', 'network', 'bad-output', 'unknown'].includes(error.code)
        ? error.code as LexiconErrorCode
        : 'unknown';
      const message = typeof error.message === 'string'
        ? error.message
        : 'The AI service could not complete the request.';
      throw new LexiconError(code, message);
    }
    return body.data as T;
  } catch (error) {
    if (error instanceof LexiconError) throw error;
    if (controller.signal.aborted) {
      throw new LexiconError(signal?.aborted ? 'unknown' : 'timeout', signal?.aborted ? 'Cancelled.' : 'Timed out.');
    }
    throw toLexiconError(error);
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}

const CACHE_PREFIX = 'tb.lexicon.v2:';
const memory = new Map<string, LexiconEntry>();
const cacheKey = (word: string, dialect: ArabicDialect) =>
  `${CACHE_PREFIX}${dialect}:${word.trim().toLowerCase()}`;
function cacheGet(word: string, dialect: ArabicDialect): LexiconEntry | null {
  const key = cacheKey(word, dialect);
  const hit = memory.get(key);
  if (hit) return hit;
  try {
    const raw = window.localStorage.getItem(key);
    const entry = raw ? normalizeEntry(JSON.parse(raw)) : null;
    if (entry?.dialect === dialect) memory.set(key, entry);
    return entry?.dialect === dialect ? entry : null;
  } catch {
    return null;
  }
}
function cacheSet(word: string, entry: LexiconEntry) {
  const key = cacheKey(word, entry.dialect);
  memory.set(key, entry);
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

export interface GenerateOptions {
  situations?: Situation[];
  forceRefresh?: boolean;
  signal?: AbortSignal;
  dialect?: ArabicDialect;
}

export interface CustomDeckWord {
  arabicWord: string;
  englishTranslation: string;
}

export async function generateLexiconEntry(
  word: string,
  opts: GenerateOptions = {}
): Promise<LexiconEntry> {
  const input = word.trim(); if (!input || input.length > 64 || /[\r\n]/.test(input)) throw new LexiconError('empty-input', 'Invalid input.');
  const dialect = opts.dialect ?? 'msa';
  if (!opts.forceRefresh) { const cached = cacheGet(input, dialect); if (cached) return cached; }
  const rawEntry = await requestGemini<unknown>(
    'entry',
    { word: input, situations: opts.situations ?? [], dialect },
    opts.signal
  );
  const entry = normalizeEntry(rawEntry);
  if (!entry || entry.dialect !== dialect) {
    throw new LexiconError('bad-output', 'Incomplete response for the selected dialect.');
  }
  cacheSet(input, entry); return entry;
}

export async function generateCustomDeck(
  profile: UserProfile,
  isStruggling: boolean,
  situation: Situation
): Promise<CustomDeckWord[]> {
  const getStaticDeck = (): CustomDeckWord[] => {
    const entries = getStaticDictionaryEntries(situation)
      .filter(entry => (entry.dialect ?? 'msa') === profile.dialect);
    for (let index = entries.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [entries[index], entries[swapIndex]] = [entries[swapIndex], entries[index]];
    }
    return entries.slice(0, 10).map(entry => ({
      arabicWord: entry.arabicWord,
      englishTranslation: entry.englishTranslation
    }));
  };

  if (typeof navigator !== 'undefined' && !navigator.onLine) return getStaticDeck();

  try {
    const expectedCount = isStruggling ? 3 : 10;
    const parsed = await requestGemini<unknown[]>(
      'deck',
      { profile, isStruggling, situation }
    );
    if (!Array.isArray(parsed) || parsed.length !== expectedCount) {
      throw new LexiconError('bad-output', 'The tutor returned an incomplete vocabulary deck.');
    }
  
    const cards: CustomDeckWord[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') {
        throw new LexiconError('bad-output', 'The tutor returned an incomplete vocabulary card.');
      }
      const record = item as Record<string, unknown>;
      const arabicWord = str(record.arabicWord);
      const englishTranslation = str(record.englishTranslation);
      if (!arabicWord || !englishTranslation) {
        throw new LexiconError('bad-output', 'The tutor returned an incomplete vocabulary card.');
      }
      cards.push({ arabicWord, englishTranslation });
    }
    return cards;
  } catch {
    return getStaticDeck();
  }
}

export async function generateTutorResponse(
  prompt: string,
  context: TutorContext
): Promise<string> {
  const question = prompt.trim();
  if (!question || question.length > 2000) {
    throw new LexiconError('empty-input', 'Enter a question of 1–2000 characters.');
  }
  const { profile, currentWord } = context;
  const recentHistory = context.history.slice(-4);
  const wordContext = currentWord
    ? `The learner is currently studying: ${currentWord.arabicWord} = ${currentWord.englishTranslation}. ` +
      `Example: ${currentWord.exampleSentenceArabic} (${currentWord.exampleSentenceEnglish}).`
    : 'No specific vocabulary card is currently selected.';
  const conversationContext = recentHistory.length
    ? `\nRecent conversation:\n${recentHistory.join('\n')}`
    : '';

  const answer = await requestGemini<string>('tutor', {
    prompt: `${conversationContext}\n${wordContext}\nLearner's question: ${question}`,
    context: { ...context, profile, currentWord, history: recentHistory }
  });
  if (typeof answer !== 'string' || !answer.trim()) {
    throw new LexiconError('bad-output', 'The tutor returned an empty answer.');
  }
  return answer.trim();
}

export async function safeGenerateLexiconEntry(word: string, opts: GenerateOptions = {}): Promise<LexiconResult> {
  try { return { ok: true, entry: await generateLexiconEntry(word, opts) }; } catch (e) { return { ok: false, error: toLexiconError(e) }; }
}
