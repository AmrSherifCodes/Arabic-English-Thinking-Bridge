/**
 * GitHub-based AI Context CDN Fetcher
 * Saves database quotas by fetching system prompts and AI context
 * directly from GitHub raw CDN with 24-hour sessionStorage caching.
 */

export interface AIContextData {
  systemPromptTemplate: string;
  coachPersonality: string;
  updatedAt: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are Amr, an empathetic, top-tier language coach and lead architect of Thinking Bridge.
The learner speaks {dialect} and is learning {targetLanguage} (Level: {level}, Goal: {goal}).
Provide examples strictly related to {domainFocus}. Use {targetLanguage} as the primary language for instruction, and explain its grammar using its own structure rather than English sentence patterns. Gently point out relevant L1 transfer errors. Keep responses under 3 sentences.`;

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/main/ai_context.json';
const CACHE_KEY = 'tb.aiContextData';
const CACHE_TIME_KEY = 'tb.aiContextDataTime';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function fetchAIContext(): Promise<AIContextData> {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const cachedTime = Number(sessionStorage.getItem(CACHE_TIME_KEY) || '0');
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData && Date.now() - cachedTime < TWENTY_FOUR_HOURS_MS) {
        const parsed: unknown = JSON.parse(cachedData);
        if (isAIContextData(parsed)) return parsed;
      }
    } catch (error) {
      console.warn('Unable to read cached AI coaching context.', error);
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(GITHUB_RAW_URL, { signal: controller.signal }).finally(() =>
      clearTimeout(timeoutId)
    );

    if (!res.ok) throw new Error(`AI context request failed with HTTP ${res.status}.`);
    const data: unknown = await res.json();
    if (!isAIContextData(data)) throw new Error('AI context response has an invalid format.');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    }
      return data;
  } catch (error) {
    console.warn('Using built-in AI coaching context after the CDN request failed.', error);
  }

  return {
    systemPromptTemplate: DEFAULT_SYSTEM_PROMPT,
    coachPersonality: 'Amr Sherif (Empathetic AI Language Coach)',
    updatedAt: new Date().toISOString(),
  };
}

function isAIContextData(value: unknown): value is AIContextData {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  return typeof data.systemPromptTemplate === 'string' &&
    data.systemPromptTemplate.trim().length > 0 &&
    typeof data.coachPersonality === 'string' &&
    typeof data.updatedAt === 'string';
}

export function getAICompanionPrompt(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    const companion = localStorage.getItem('tb.aiCompanion');
    if (companion === 'strict') {
      return '\nAI Companion Style: You are a strict teacher. Correct every grammatical error immediately and explain why.';
    }
    if (companion === 'chill') {
      return '\nAI Companion Style: You are a chill friend. Focus on conversational flow, do not interrupt to correct minor grammar unless it breaks understanding.';
    }
    if (companion === 'analyst') {
      return '\nAI Companion Style: You are a smart analyst. Break down the sentence structure and explain the logic behind the syntax.';
    }
  } catch {
    /* noop */
  }
  return '';
}
