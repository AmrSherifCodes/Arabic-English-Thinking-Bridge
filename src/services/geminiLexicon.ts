import { GoogleGenAI, Type } from '@google/genai';
import type { UserProfile } from '../hooks/useUserProfile';
import type { Exercise } from '../types';
import { API_BASE_URL } from '../utils/api';

export const USER_GEMINI_KEY_STORAGE = 'tb.userGeminiKey';
export const LEGACY_GEMINI_KEY_STORAGE = 'user_gemini_key';
export const GEMINI_KEY_CHANGED_EVENT = 'tb:gemini-key-changed';
const API_KEY_OBFUSCATION_PREFIX = 'base64:';
const API_KEY_STORAGE_KEYS = ['tb.userApiKey', USER_GEMINI_KEY_STORAGE, LEGACY_GEMINI_KEY_STORAGE];

export function encodeStoredGeminiKey(key: string): string {
  return `${API_KEY_OBFUSCATION_PREFIX}${btoa(key)}`;
}

export function decodeStoredGeminiKey(value: string): string {
  if (!value.startsWith(API_KEY_OBFUSCATION_PREFIX)) return value;
  try {
    return atob(value.slice(API_KEY_OBFUSCATION_PREFIX.length));
  } catch (error) {
    console.warn('Unable to decode the saved Gemini API key.', error);
    return '';
  }
}

export function getUserGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    for (const storageKey of API_KEY_STORAGE_KEYS) {
      const storedValue = window.localStorage.getItem(storageKey);
      if (storedValue) return decodeStoredGeminiKey(storedValue).trim();
    }
    return '';
  } catch (error) {
    console.error('Unable to read the saved Gemini API key from local storage.', error);
    return '';
  }
}

export function setUserGeminiKey(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const trimmed = key.trim();
  try {
    if (trimmed) {
      const obfuscated = encodeStoredGeminiKey(trimmed);
      API_KEY_STORAGE_KEYS.forEach((storageKey) => window.localStorage.setItem(storageKey, obfuscated));
    } else {
      API_KEY_STORAGE_KEYS.forEach((storageKey) => window.localStorage.removeItem(storageKey));
    }
  } catch (error) {
    console.error('Unable to save the Gemini API key to local storage.', error);
    return false;
  }
  window.dispatchEvent(new CustomEvent(GEMINI_KEY_CHANGED_EVENT, { detail: { active: Boolean(trimmed) } }));
  return true;
}

export function hasUserGeminiKey(): boolean {
  return Boolean(getUserGeminiKey());
}

export const SITUATIONS = ['student', 'call-center', 'public-matter'] as const;
export type Situation = (typeof SITUATIONS)[number];
export const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase'] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export const ARABIC_DIALECTS = ['egyptian', 'msa'] as const;
export type ArabicDialect = (typeof ARABIC_DIALECTS)[number];

export interface LexiconEntry {
  arabicWord: string;
  englishTranslation: string;
  dialect: ArabicDialect;
  partOfSpeech: PartOfSpeech;
  situations: Situation[];
  exampleSentenceArabic: string;
  exampleSentenceEnglish: string;
  level?: DifficultyLevel;
  arabicPronunciation?: string;
}

export interface CustomDeckWord {
  arabicWord: string;
  englishTranslation: string;
}

export type LexiconErrorCode =
  | 'missing-key'
  | 'empty-input'
  | 'timeout'
  | 'rate-limited'
  | 'network'
  | 'bad-output'
  | 'unknown';

export class LexiconError extends Error {
  code: LexiconErrorCode;

  constructor(code: LexiconErrorCode, message: string) {
    super(message);
    this.name = 'LexiconError';
    this.code = code;
  }
}

const TIMEOUT_MS = 10_000;
const DIRECT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
] as const;

const directEntryProperties = {
  arabicWord: { type: Type.STRING },
  englishTranslation: { type: Type.STRING },
  dialect: { type: Type.STRING, enum: [...ARABIC_DIALECTS] },
  partOfSpeech: { type: Type.STRING, enum: [...PARTS_OF_SPEECH] },
  situations: { type: Type.ARRAY, items: { type: Type.STRING, enum: [...SITUATIONS] } },
  exampleSentenceArabic: { type: Type.STRING },
  exampleSentenceEnglish: { type: Type.STRING },
};

const directEntrySchema = {
  type: Type.OBJECT,
  properties: directEntryProperties,
  required: Object.keys(directEntryProperties),
};

const directWordSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      arabicWord: { type: Type.STRING },
      englishTranslation: { type: Type.STRING },
    },
    required: ['arabicWord', 'englishTranslation'],
  },
};

const directChunkSchema = {
  type: Type.OBJECT,
  properties: {
    arabicText: { type: Type.STRING },
    englishText: { type: Type.STRING },
    role: {
      type: Type.STRING,
      enum: ['subject', 'verb', 'object', 'connector', 'modifier', 'auxiliary'],
    },
    explanation: { type: Type.STRING },
  },
  required: ['arabicText', 'englishText', 'role', 'explanation'],
};

const directExerciseSchema = {
  type: Type.OBJECT,
  properties: {
    arabicThought: { type: Type.STRING },
    englishTarget: { type: Type.STRING },
    acceptableAlternatives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    wordChips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    breakdownChunks: {
      type: Type.ARRAY,
      items: directChunkSchema,
    },
    habitHint: { type: Type.STRING },
  },
  required: [
    'arabicThought',
    'englishTarget',
    'acceptableAlternatives',
    'wordChips',
    'breakdownChunks',
    'habitHint',
  ],
};

function parseDirectJson(text: string | undefined): unknown {
  if (!text || !text.trim()) throw new Error('Empty model response.');
  return JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
}

async function generateWithDirectFallback(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  let lastError: unknown;
  for (const model of DIRECT_MODELS) {
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  throw lastError;
}

async function requestGeminiWithUserKey<T>(
  userKey: string,
  operation: 'entry' | 'deck' | 'tutor' | 'generate-exercise' | 'conversation' | 'explain-error',
  payload: Record<string, unknown>
): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: userKey });

  if (operation === 'explain-error') {
    const conceptId = String(payload.conceptId || 'syntax');
    const errorType = String(payload.errorType || 'syntax_error');
    const submitted = String(payload.submitted || '');
    const target = String(payload.target || '');
    const response = await generateWithDirectFallback(ai, {
      contents: `Concept: ${conceptId}\nError Type: ${errorType}\nSubmitted: "${submitted}"\nTarget: "${target}"`,
      config: {
        systemInstruction:
          'You are an Arabic->English structural tutor. Explain the specific L1 interference for this error in exactly 2 sentences. Do not generate new exercises. Do not teach vocabulary. Focus strictly on syntax.',
        maxOutputTokens: 200,
        temperature: 0.3,
      },
    });
    return (response.text?.trim() || '') as unknown as T;
  }

  if (operation === 'generate-exercise') {
    const profile = (payload.profile || {}) as UserProfile;
    const level = profile.level || 'intermediate';
    const goal = profile.goal || 'general';
    const dialect = profile.dialect || 'msa';
    const focusArea = profile.focusArea || '';
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';

    let domainGuidance = '';
    const focusLower = String(focusArea).toLowerCase();
    if (focusLower.includes('chem') || focusLower.includes('science')) {
      domainGuidance = ' The learner specializes in chemistry / STEM. Focus the exercise on chemistry topics, lab work, scientific discoveries, molecular observations, or experimental results.';
    } else if (goal === 'travel') {
      domainGuidance = ' The learner is traveling. Focus the exercise on airport transit, hotel bookings, directions, dining, or practical travel conversation.';
    } else if (goal === 'business' || goal === 'work') {
      domainGuidance = ' The learner is working in a corporate / business environment. Focus on email hedging, customer service, meetings, project updates, or professional English.';
    }

    const prompt =
      `Generate 1 intermediate/advanced Arabic->English translation exercise.${domainGuidance}\n` +
      `Target level: ${level}. Practical context: ${goal}.\n` +
      `The source sentence MUST be in natural ${dialectName}.\n` +
      `Breakdown chunks MUST explain the structural differences (e.g. copula omission, zero article, VSO order).\n` +
      `Return JSON matching the schema.`;

    const response = await generateWithDirectFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: directExerciseSchema,
        temperature: 0.7,
      },
    });

    const parsed = parseDirectJson(response.text);
    return parsed as T;
  }

  if (operation === 'conversation') {
    const promptText = String(payload.prompt || '');
    const context = (payload.context || {}) as Record<string, unknown>;
    const profile = (context.profile || {}) as UserProfile;
    const level = profile.level || 'intermediate';
    const goal = profile.goal || 'general';
    const dialect = profile.dialect || 'msa';
    const focusArea = profile.focusArea || '';
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';

    let domainHint = '';
    const focus = String(focusArea || '').toLowerCase();
    if (focus.includes('chem') || focus.includes('science')) {
      domainHint = ' The user specializes in chemistry / STEM. You can use chemistry analogies (e.g. covalent bonding as subject-verb agreement) to explain structure when helpful.';
    }

    const systemInstruction =
      `You are Amr, an empathetic, encouraging Arabic-English structural language coach.\n` +
      `The learner speaks ${dialectName} and is learning English (Level: ${level}, Goal: ${goal}).${domainHint}\n` +
      `Your role:\n` +
      `1. Respond warmly and conversationally in simple, natural English (with brief Arabic explanations when addressing grammar misconceptions).\n` +
      `2. Gently point out L1 transfer errors (like omitting "is/are", using "I am agree", or literal prepositions).\n` +
      `3. Keep responses concise (2-4 sentences max).\n` +
      `4. If the user asks how to say something in Egyptian Arabic or English, guide them using the thinking method.`;

    const response = await generateWithDirectFallback(ai, {
      contents: promptText,
      config: {
        systemInstruction,
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    return (response.text?.trim() || '') as unknown as T;
  }

  if (operation === 'tutor') {
    const promptText = String(payload.prompt || '');
    const context = (payload.context || {}) as Record<string, unknown>;
    const profile = (context.profile || {}) as UserProfile;
    const dialectName = profile.dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';

    const systemInstruction =
      `You are an expert Arabic-English structural tutor.\n` +
      `The user speaks ${dialectName}.\n` +
      `Explain English grammar, syntax, or vocabulary in clear, friendly Arabic (Egyptian style).\n` +
      `Break down sentences into structural chunks (Subject, Verb, Object, Auxiliary) and explain WHY the rule exists.\n` +
      `Keep explanations concise, encouraging, and clear.`;

    const response = await generateWithDirectFallback(ai, {
      contents: promptText,
      config: {
        systemInstruction,
        maxOutputTokens: 300,
        temperature: 0.5,
      },
    });

    return (response.text?.trim() || '') as unknown as T;
  }

  if (operation === 'entry') {
    const word = String(payload.word || '');
    const dialect = String(payload.dialect || 'egyptian');
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';

    const prompt =
      `Define the Arabic word/phrase "${word}" in ${dialectName} for an English learner.\n` +
      `Provide the English translation, part of speech, an authentic example sentence in ${dialectName}, and its English translation.\n` +
      `Return JSON matching the schema.`;

    const response = await generateWithDirectFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: directEntrySchema,
        temperature: 0.3,
      },
    });

    return parseDirectJson(response.text) as T;
  }

  if (operation === 'deck') {
    const profile = (payload.profile || {}) as UserProfile;
    const dialect = profile.dialect || 'egyptian';
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';
    const situation = String(payload.situation || 'student');

    const prompt =
      `Generate 10 practical vocabulary words/phrases in ${dialectName} for the situation "${situation}".\n` +
      `Return a JSON array of objects with "arabicWord" and "englishTranslation".`;

    const response = await generateWithDirectFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: directWordSchema,
        temperature: 0.7,
      },
    });

    return parseDirectJson(response.text) as T;
  }

  throw new Error(`Unsupported operation: ${operation}`);
}

function toLexiconError(err: unknown): LexiconError {
  if (err instanceof LexiconError) return err;
  const msg = err instanceof Error ? err.message : String(err || '');
  if (/rate|limit|429|quota/i.test(msg)) return new LexiconError('rate-limited', msg);
  if (/timeout/i.test(msg)) return new LexiconError('timeout', msg);
  if (/fetch|network|failed to load/i.test(msg) || (typeof navigator !== 'undefined' && !navigator.onLine)) return new LexiconError('network', 'Network error.');
  return new LexiconError('unknown', msg || 'Error.');
}

async function requestGemini<T>(
  operation: 'entry' | 'deck' | 'tutor' | 'generate-exercise' | 'conversation' | 'explain-error',
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const userKey = getUserGeminiKey();
  if (userKey) {
    try {
      return await requestGeminiWithUserKey<T>(userKey, operation, payload);
    } catch (err) {
      console.warn('Direct user key request failed, falling back to server route:', err);
    }
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const abortRequest = () => controller.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });
  if (signal?.aborted) controller.abort();

  const userCustomKey = getUserGeminiKey();
  const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userCustomKey) {
    reqHeaders['X-User-Gemini-Key'] = userCustomKey.trim();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/gemini`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({ ...payload, operation, userKey: userCustomKey || undefined }),
      signal: controller.signal
    });
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') {
      throw new LexiconError('bad-output', 'The AI service returned an invalid response.');
    }

    const body = result as Record<string, unknown>;
    if (!response.ok) {
      let code: LexiconErrorCode = response.status === 429 ? 'rate-limited' : 'unknown';
      let rawMessage = 'The AI service could not complete the request.';

      if (typeof body.error === 'string') {
        rawMessage = body.error;
      } else if (body.error && typeof body.error === 'object') {
        const errObj = body.error as Record<string, unknown>;
        if (
          typeof errObj.code === 'string' &&
          ['missing-key', 'empty-input', 'timeout', 'rate-limited', 'network', 'bad-output', 'unknown'].includes(errObj.code)
        ) {
          code = errObj.code as LexiconErrorCode;
        }
        if (typeof errObj.message === 'string') {
          rawMessage = errObj.message;
        }
      }

      throw new LexiconError(code, rawMessage);
    }

    if (!('data' in body)) {
      throw new LexiconError('bad-output', 'The AI service response was missing data.');
    }

    return body.data as T;
  } catch (err) {
    if (err instanceof LexiconError) throw err;
    if (err && typeof err === 'object' && (err as Error).name === 'AbortError') {
      throw new LexiconError('timeout', 'The AI service timed out.');
    }
    throw toLexiconError(err);
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}

export function fetchArabicEntry(word: string, dialect: ArabicDialect = 'egyptian'): Promise<LexiconEntry> {
  return requestGemini<LexiconEntry>('entry', { word, dialect });
}

export function fetchDynamicDeck(situation: Situation, profile: UserProfile): Promise<CustomDeckWord[]> {
  return requestGemini<CustomDeckWord[]>('deck', { situation, profile });
}

export function fetchTutorAnswer(prompt: string, context: Record<string, unknown>): Promise<string> {
  return requestGemini<string>('tutor', { prompt, context });
}

export function generateExerciseWithGemini(profile: UserProfile, topicOrFocus?: string): Promise<Exercise> {
  return requestGemini<Exercise>('generate-exercise', { profile, topicOrFocus });
}

export function generateConversationReplyWithGemini(
  prompt: string,
  context: Record<string, unknown>
): Promise<string> {
  return requestGemini<string>('conversation', { prompt, context });
}

export function explainErrorWithGemini(
  conceptId: string,
  errorType: string,
  submitted: string,
  target: string
): Promise<string> {
  return requestGemini<string>('explain-error', { conceptId, errorType, submitted, target });
}

// Backward Compatibility Exports
export type TutorContext = Record<string, unknown>;
export type ConversationHistoryItem = { role: 'user' | 'assistant' | 'model'; text: string };

export async function checkGeminiService(): Promise<boolean> {
  return true;
}

export function generateCustomDeck(
  situationOrProfile: Situation | UserProfile,
  profileOrStruggling?: UserProfile | boolean,
  situation?: Situation
): Promise<CustomDeckWord[]> {
  const profile = (typeof situationOrProfile === 'object' ? situationOrProfile : profileOrStruggling) as UserProfile;
  const sit = (typeof situationOrProfile === 'string' ? situationOrProfile : situation) as Situation || 'student';
  return fetchDynamicDeck(sit, profile || { goal: 'general', language: 'arabic', dialect: 'egyptian', level: 'beginner' });
}

export function generateAIPracticeExercise(profile: UserProfile, topicOrFocus?: string): Promise<Exercise> {
  return generateExerciseWithGemini(profile, topicOrFocus);
}

export function sendConversationMessage(
  prompt: string,
  contextOrHistory: Record<string, unknown> | ConversationHistoryItem[],
  profile?: UserProfile
): Promise<string> {
  const ctx = Array.isArray(contextOrHistory) ? { history: contextOrHistory, profile } : contextOrHistory;
  return generateConversationReplyWithGemini(prompt, ctx);
}

export function explainStructuralError(conceptId: string, errorType: string, submitted: string, target: string): Promise<string> {
  return explainErrorWithGemini(conceptId, errorType, submitted, target);
}

export function generateTutorResponse(prompt: string, context: Record<string, unknown>): Promise<string> {
  return fetchTutorAnswer(prompt, context);
}
