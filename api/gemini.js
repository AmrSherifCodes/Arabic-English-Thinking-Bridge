import { GoogleGenAI, Type } from '@google/genai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const FALLBACK_MODELS = process.env.GEMINI_FALLBACK_MODELS
  ? process.env.GEMINI_FALLBACK_MODELS.split(',').map((model) => model.trim()).filter(Boolean)
  : [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
  ];
const MAX_BODY_BYTES = 512 * 1024;
const GEMINI_TIMEOUT_MS = 7_000;

// Strict BYOK Rate limit thresholds: Max 3 requests/day per IP without personal API key
const STRICT_FREE_LIMIT_PER_DAY = 3;
const RATE_LIMIT_PER_MINUTE = 10;
const RATE_WINDOW_MINUTE_MS = 60_000;
const RATE_WINDOW_DAY_MS = 24 * 60 * 60 * 1000;
const rateLimits = new Map();

// Response cache (in-memory + optional Upstash Redis)
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_TTL_SECONDS = 30 * 60;
const MAX_MEMORY_CACHE_ENTRIES = 500;
const responseCache = new Map();

const HIGH_TRAFFIC_MESSAGE =
  'Daily AI limit reached. Add your own free API key in Settings for unlimited access.';

const situations = ['student', 'call-center', 'public-matter'];
const levels = ['beginner', 'intermediate', 'advanced'];
const languages = ['english', 'arabic'];
const goals = ['travel', 'work', 'academic', 'business', 'general'];
const dialects = ['egyptian', 'msa'];
const TARGET_LANGUAGE_NAMES = {
  en: 'English',
  de: 'German',
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
  zh: 'Chinese',
  hi: 'Hindi',
  ru: 'Russian',
  pt: 'Portuguese',
  it: 'Italian',
};
const SPEECH_LANGUAGE_NAMES = {
  en: 'English',
  de: 'German',
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
  zh: 'Chinese',
  hi: 'Hindi',
  ru: 'Russian',
  pt: 'Portuguese',
  it: 'Italian',
};

const entryProperties = {
  arabicWord: { type: Type.STRING },
  englishTranslation: { type: Type.STRING },
  dialect: { type: Type.STRING, enum: dialects },
  partOfSpeech: {
    type: Type.STRING,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase'],
  },
  situations: { type: Type.ARRAY, items: { type: Type.STRING, enum: situations } },
  exampleSentenceArabic: { type: Type.STRING },
  exampleSentenceEnglish: { type: Type.STRING },
};
const entrySchema = {
  type: Type.OBJECT,
  properties: entryProperties,
  required: Object.keys(entryProperties),
};
const wordSchema = {
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

const chunkSchema = {
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

const exerciseSchema = {
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
      items: chunkSchema,
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

let client;
let upstashRedis = null;
let upstashRatelimitMinute = null;

function getUpstash() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  if (!url || !token) return null;
  if (!upstashRedis) {
    try {
      upstashRedis = new Redis({ url, token });
      upstashRatelimitMinute = new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_PER_MINUTE, '1 m'),
        analytics: false,
        prefix: 'tb:rl:min',
      });
    } catch {
      upstashRedis = null;
      upstashRatelimitMinute = null;
    }
  }
  return upstashRedis ? { redis: upstashRedis, ratelimit: upstashRatelimitMinute } : null;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isMember(value, values) {
  return typeof value === 'string' && values.includes(value);
}

function validProfile(profile) {
  return isRecord(profile) &&
    (profile.language === undefined || isMember(profile.language, languages)) &&
    (profile.dialect === undefined || isMember(profile.dialect, dialects)) &&
    (profile.level === undefined || isMember(profile.level, levels)) &&
    (profile.goal === undefined || isMember(profile.goal, goals));
}

function sendJson(res, status, value, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders)) {
    res.setHeader(k, v);
  }
  res.end(JSON.stringify(value));
}

async function readBody(req) {
  if (isRecord(req.body)) {
    if (JSON.stringify(req.body).length > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    return req.body;
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk.toString();
    if (raw.length > MAX_BODY_BYTES) throw new Error('Request body is too large.');
  }
  const parsed = JSON.parse(raw);
  if (!isRecord(parsed)) throw new Error('Request body must be an object.');
  return parsed;
}

function getClientIp(req) {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  const vercelForwarded = req.headers['x-vercel-forwarded-for'];
  if (typeof vercelForwarded === 'string' && vercelForwarded.trim()) {
    const parts = vercelForwarded.split(',');
    return parts[0].trim();
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    const parts = forwardedFor.split(',');
    return parts[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function getProvidedUserKey(req) {
  const headers = req.headers || {};
  const k1 = headers['x-user-api-key'];
  if (typeof k1 === 'string' && k1.trim()) return k1.trim();
  return '';
}

function checkMemoryRateLimit(address, hasCustomKey = false) {
  if (hasCustomKey) return 'OK';

  const now = Date.now();
  let record = rateLimits.get(address);
  if (!record) {
    if (rateLimits.size > 5000) {
      for (const [key, rec] of rateLimits.entries()) {
        if (rec.dayResetAt <= now) {
          rateLimits.delete(key);
        }
      }
      if (rateLimits.size > 5000) {
        const oldestKey = rateLimits.keys().next().value;
        if (oldestKey) rateLimits.delete(oldestKey);
      }
    }
    record = {
      minuteCount: 0,
      minuteResetAt: now + RATE_WINDOW_MINUTE_MS,
      dayCount: 0,
      dayResetAt: now + RATE_WINDOW_DAY_MS,
    };
    rateLimits.set(address, record);
  }

  if (record.dayResetAt <= now) {
    record.dayCount = 0;
    record.dayResetAt = now + RATE_WINDOW_DAY_MS;
  }

  if (record.dayCount >= STRICT_FREE_LIMIT_PER_DAY) {
    return 'FREE_LIMIT_REACHED';
  }

  record.dayCount += 1;
  return 'OK';
}

function buildCacheKey(operation, body) {
  if (!isRecord(body)) return null;
  if (operation === 'transcribe') return null;
  if (operation === 'corporate-bridge') {
    const t = typeof body.thought === 'string' ? body.thought.trim().toLowerCase().slice(0, 150) : '';
    return t ? `tb:cache:corporate:${t}` : null;
  }
  if (operation === 'entry') {
    const w = typeof body.word === 'string' ? body.word.trim().toLowerCase() : '';
    const d = typeof body.dialect === 'string' ? body.dialect.trim().toLowerCase() : 'egyptian';
    return w ? `tb:cache:entry:${d}:${w}` : null;
  }
  if (operation === 'explain-error') {
    const c = typeof body.conceptId === 'string' ? body.conceptId : '';
    const s = typeof body.submitted === 'string' ? body.submitted.trim().toLowerCase() : '';
    return c && s ? `tb:cache:explain:${c}:${s}` : null;
  }
  return null;
}

async function getCachedResponse(cacheKey) {
  if (!cacheKey) return null;
  const memoryItem = responseCache.get(cacheKey);
  if (memoryItem) {
    if (memoryItem.expiresAt > Date.now()) {
      return memoryItem.data;
    }
    responseCache.delete(cacheKey);
  }
  const upstash = getUpstash();
  if (upstash?.redis) {
    try {
      const cachedStr = await upstash.redis.get(cacheKey);
      if (cachedStr) {
        const parsed = typeof cachedStr === 'string' ? JSON.parse(cachedStr) : cachedStr;
        responseCache.set(cacheKey, { data: parsed, expiresAt: Date.now() + CACHE_TTL_MS });
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
}

async function setCachedResponse(cacheKey, data) {
  if (!cacheKey || !data) return;
  if (responseCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });

  const upstash = getUpstash();
  if (upstash?.redis) {
    try {
      await upstash.redis.set(cacheKey, JSON.stringify(data), { ex: CACHE_TTL_SECONDS });
    } catch {
      /* noop */
    }
  }
}

function getClient(customKey = '') {
  if (!customKey) {
    throw new Error('A user-provided Gemini API key is required.');
  }
  return new GoogleGenAI({ apiKey: customKey });
}

async function generateContentWithFallback(activeClient, params) {
  let lastError;
  const boundedParams = {
    ...params,
    config: {
      ...(params.config || {}),
      maxOutputTokens: 250,
      temperature: 0.7,
    },
  };
  for (const modelName of FALLBACK_MODELS) {
    try {
      const response = await activeClient.models.generateContent({
        ...boundedParams,
        model: modelName,
      });
      return response;
    } catch (err) {
      lastError = err;
      const status = Number(err?.status || err?.statusCode || 0);
      const msg = err instanceof Error ? err.message : String(err || '');
      if (
        status === 404 ||
        status === 503 ||
        status === 429 ||
        /404|503|429|NOT_FOUND|no longer available|UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED/i.test(msg)
      ) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function generateContentStreamWithFallback(activeClient, params) {
  let lastError;
  const boundedParams = {
    ...params,
    config: {
      ...(params.config || {}),
      maxOutputTokens: 250,
      temperature: 0.7,
    },
  };
  for (const modelName of FALLBACK_MODELS) {
    try {
      const response = await activeClient.models.generateContentStream({
        ...boundedParams,
        model: modelName,
      });
      return response;
    } catch (err) {
      lastError = err;
      const status = Number(err?.status || err?.statusCode || 0);
      const msg = err instanceof Error ? err.message : String(err || '');
      if (
        status === 404 ||
        status === 503 ||
        status === 429 ||
        /404|503|429|NOT_FOUND|no longer available|UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED/i.test(msg)
      ) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function generateStream(operation, body, customKey) {
  const activeClient = getClient(customKey);

  if (operation === 'conversation') {
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const history = Array.isArray(body.history) ? body.history : [];
    const profile = isRecord(body.profile) ? body.profile : {};
    const dialectName = profile.dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';
    const targetCode = typeof profile.targetLang === 'string'
      ? profile.targetLang
      : typeof profile.targetLanguage === 'string' ? profile.targetLanguage : '';
    const targetLang = TARGET_LANGUAGE_NAMES[targetCode] || 'English';
    const rawLevel = typeof profile.cefrLevel === 'string' ? profile.cefrLevel : profile.level;
    const level = ['A0', 'A1', 'A2'].includes(rawLevel)
      ? rawLevel
      : 'A0';
    const goal = typeof profile.goal === 'string' &&
      ['tech', 'corporate', 'travel', 'academic', 'study', 'business', 'general'].includes(profile.goal)
      ? profile.goal
      : 'general';
    const domainFocus = profile.domainFocus === 'tech' || goal === 'tech' || goal === 'corporate'
      ? 'software engineering and tech vocabulary'
      : profile.domainFocus === 'travel' || goal === 'travel'
        ? 'travel and everyday-life vocabulary'
        : 'daily life';
    const isArabicTranslationRequest = /translate this sentence into natural arabic/i.test(prompt);

    const systemInstruction =
      `You are Amr, an empathetic language coach.\n` +
      `You are teaching ${targetLang}. The user's goal is ${goal}. Provide examples strictly related to ${domainFocus}.\n` +
      `The user is an Arabic speaker learning ${targetLang} at level ${level}.\n` +
      `${isArabicTranslationRequest ? 'For this explicit Arabic translation request, return only the natural Arabic translation. This instruction takes precedence over the usual target-language response preference.\n' : ''}` +
      `Use ${targetLang} as the primary language for all instruction and encouragement. Never respond in English unless the learner explicitly asks for an English translation or is clearly confused; in that case, use only a brief explanation in the language that resolves the confusion.\n` +
      `Gently identify transfer errors from Arabic, and keep explanations appropriate to level ${level}.\n` +
      `${targetCode === 'ja'
        ? 'Teach Japanese grammar using Japanese-specific rules: topic and case particles, context, and verb-final SOV order. Never explain Japanese by imposing English word order or English sentence structures.'
        : `Explain ${targetLang} grammar using its own structure and rules, not by forcing English sentence patterns.`}\n` +
      `Keep responses under 3 sentences.`;

    const contents = [
      ...history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(h.text || '') }],
      })),
      { role: 'user', parts: [{ text: prompt }] },
    ];

    return await generateContentStreamWithFallback(activeClient, {
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });
  }

  throw new Error(`Unsupported stream operation: ${operation}`);
}

async function generate(operation, body, customKey) {
  const activeClient = getClient(customKey);

  if (operation === 'test-key') {
    const response = await generateContentWithFallback(activeClient, {
      contents: 'Respond with OK if API key is working.',
      config: { maxOutputTokens: 250, temperature: 0.7 },
    });
    return { status: 200, data: { status: 'verified', message: (response.text || 'OK').trim() } };
  }

  if (operation === 'transcribe') {
    const audioData = typeof body.audioData === 'string' ? body.audioData : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'audio/webm';
    const requestedLanguage = typeof body.language === 'string' ? body.language.split(/[-_]/)[0].toLowerCase() : 'en';
    const transcriptionLanguage = Object.hasOwn(SPEECH_LANGUAGE_NAMES, requestedLanguage)
      ? SPEECH_LANGUAGE_NAMES[requestedLanguage]
      : 'English';
    if (!audioData) {
      return { status: 400, error: { code: 'empty-input', message: 'Audio data is missing.' } };
    }

    const base64Clean = audioData.replace(/^data:[^;]+;base64,/, '');

    const response = await generateContentWithFallback(activeClient, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Clean,
                mimeType,
              },
            },
            {
              text: `Transcribe the spoken audio accurately in ${transcriptionLanguage}. If the speaker is speaking Arabic, preserve the Arabic speech. Output ONLY the raw transcript text with zero preamble or commentary.`,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    return { status: 200, data: (response.text || '').trim() };
  }

  if (operation === 'explain-error') {
    const conceptId = typeof body.conceptId === 'string' ? body.conceptId.slice(0, 80) : 'syntax';
    const errorType = typeof body.errorType === 'string' ? body.errorType.slice(0, 80) : 'syntax_error';
    const submitted = typeof body.submitted === 'string' ? body.submitted.slice(0, 500) : '';
    const target = typeof body.target === 'string' ? body.target.slice(0, 500) : '';

    const response = await generateContentWithFallback(activeClient, {
      contents: `Concept: ${conceptId}\nError Type: ${errorType}\nSubmitted: "${submitted}"\nTarget: "${target}"`,
      config: {
        systemInstruction:
          'You are an Arabic->English structural tutor. Explain the specific L1 interference for this error in exactly 2 sentences. Focus strictly on syntax.',
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    return { status: 200, data: (response.text || '').trim() };
  }

  if (operation === 'entry') {
    const word = typeof body.word === 'string' ? body.word.trim() : '';
    const dialect = isMember(body.dialect, dialects) ? body.dialect : 'egyptian';
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';
    if (!word) return { status: 400, error: { code: 'empty-input', message: 'Word parameter is required.' } };

    const prompt =
      `Define the Arabic word/phrase "${word}" in ${dialectName} for an English learner.\n` +
      `Provide the English translation, part of speech, an authentic example sentence in ${dialectName}, and its English translation.\n` +
      `Return JSON matching the schema.`;

    const response = await generateContentWithFallback(activeClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: entrySchema,
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    try {
      const parsed = JSON.parse((response.text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
      return { status: 200, data: parsed };
    } catch {
      return { status: 502, error: { code: 'bad-output', message: 'Invalid JSON response from model.' } };
    }
  }

  if (operation === 'deck') {
    const profile = isRecord(body.profile) ? body.profile : {};
    const dialect = isMember(profile.dialect, dialects) ? profile.dialect : 'egyptian';
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';
    const situation = isMember(body.situation, situations) ? body.situation : 'student';

    const prompt =
      `Generate 10 practical vocabulary words/phrases in ${dialectName} for the situation "${situation}".\n` +
      `Return a JSON array of objects with "arabicWord" and "englishTranslation".`;

    const response = await generateContentWithFallback(activeClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: wordSchema,
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    try {
      const parsed = JSON.parse((response.text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
      return { status: 200, data: parsed };
    } catch {
      return { status: 502, error: { code: 'bad-output', message: 'Invalid JSON response from model.' } };
    }
  }

  if (operation === 'tutor') {
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const context = isRecord(body.context) ? body.context : {};
    const profile = isRecord(context.profile) ? context.profile : {};
    const dialectName = profile.dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';
    if (!prompt) return { status: 400, error: { code: 'empty-input', message: 'Prompt parameter is required.' } };

    const systemInstruction =
      `You are an expert Arabic-English structural tutor.\n` +
      `The user speaks ${dialectName}.\n` +
      `Explain English grammar, syntax, or vocabulary in clear, friendly Arabic (Egyptian style).\n` +
      `Break down sentences into structural chunks (Subject, Verb, Object, Auxiliary) and explain WHY the rule exists.`;

    const response = await generateContentWithFallback(activeClient, {
      contents: prompt,
      config: {
        systemInstruction,
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    return { status: 200, data: (response.text || '').trim() };
  }

  if (operation === 'generate-exercise') {
    const profile = isRecord(body.profile) ? body.profile : {};
    const level = profile.level || 'intermediate';
    const goal = profile.goal || 'general';
    const dialect = profile.dialect || 'msa';
    const focusArea = typeof body.topicOrFocus === 'string' ? body.topicOrFocus : '';
    const dialectName = dialect === 'egyptian' ? 'Egyptian Arabic (Ammiya)' : 'Modern Standard Arabic (MSA/Fusha)';

    let domainGuidance = '';
    const focusLower = String(focusArea).toLowerCase();
    if (focusLower.includes('chem') || focusLower.includes('science')) {
      domainGuidance = ' Focus the exercise on chemistry topics, lab work, scientific discoveries, or molecular observations.';
    } else if (goal === 'travel') {
      domainGuidance = ' Focus the exercise on airport transit, hotel bookings, directions, or dining.';
    } else if (goal === 'business' || goal === 'work') {
      domainGuidance = ' Focus on corporate email hedging, meetings, or professional English.';
    }

    const prompt =
      `Generate 1 intermediate/advanced Arabic->English translation exercise.${domainGuidance}\n` +
      `Target level: ${level}. Practical context: ${goal}.\n` +
      `The source sentence MUST be in natural ${dialectName}.\n` +
      `Return JSON matching the schema.`;

    const response = await generateContentWithFallback(activeClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: exerciseSchema,
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    try {
      const parsed = JSON.parse((response.text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
      return { status: 200, data: parsed };
    } catch {
      return { status: 502, error: { code: 'bad-output', message: 'Invalid JSON response from model.' } };
    }
  }

  if (operation === 'corporate-bridge') {
    const thought = typeof body.thought === 'string' ? body.thought.trim() : '';
    if (!thought) return { status: 400, error: { code: 'empty-input', message: 'Thought parameter is required.' } };

    const targetLang = typeof body.targetLang === 'string' ? body.targetLang : 'en';
    const LANG_PROMPT = {
      en: 'professional English',
      de: 'professional German (Businessdeutsch, with proper Höflichkeitsform)',
      ja: 'professional Japanese (丁寧語/敬語 business register)',
    };
    const targetDesc = LANG_PROMPT[targetLang] || LANG_PROMPT.en;

    const prompt =
      `You are a Corporate Translator converting informal thoughts into ${targetDesc}.\n` +
      `Convert this Egyptian Arabic thought into 3 ${targetDesc} tones (Polite, Assertive, Executive):\n` +
      `Thought: "${thought}"\n` +
      `Return JSON matching the schema.`;

    try {
      const response = await _cb.generateContentWithFallback(activeClient, {
        contents: prompt,
        config: {
          maxOutputTokens: 250,
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse((response.text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
      return { status: 200, data: parsed };
    } catch {
      const fallback = getDeterministicCorporateBridge(thought);
      return { status: 200, data: fallback };
    }
  }

  return { status: 400, error: { code: 'bad-output', message: 'Unknown AI operation.' } };
}

function getDeterministicCorporateBridge(thought) {
  const t = thought.toLowerCase();
  return {
    originalThought: thought,
    thinkingShift: 'في الإنجليزية المهنية، نركز على النتيجة المرجوة (Solution-Oriented) والوضوح التام.',
    tones: {
      polite: {
        label: 'Professional Polite (Everyday Workplace)',
        english: `Regarding "${thought}": I would appreciate your guidance on the best way to move this forward smoothly.`,
        context: 'نبرة تعاونية للاستفسار وحل المشاكل بأسلوب لطيف ومحترم.'
      },
      assertive: {
        label: 'Firm & Assertive (Action Oriented)',
        english: `Regarding our action items: We need to finalize the next steps promptly to prevent any schedule impact.`,
        context: 'للحسم وطلب تحرك سريع ومحدد بالوقت.'
      },
      executive: {
        label: 'Executive & Client-Facing',
        english: `We are proactively managing this milestone to ensure alignment with our overarching strategic objectives.`,
        context: 'صياغة استراتيجية رفيعة المستوى تظهر القيادة والمبادرة.'
      }
    }
  };
}

export const ALLOWED_CORS_ORIGINS = new Set([
  'https://tb-eg.vercel.app',
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'https://amrsherif.localhost.cc',
  'https://www.amrsherif.localhost.cc',
  'http://amrsherif.localhost.cc',
  'http://www.amrsherif.localhost.cc',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost'
]);

const PROJECT_PREVIEW_ORIGIN_RE = /^https?:\/\/(?:tb-eg|thinkingbridge|arabic-?english-?thinking-?bridge|amrsherif\.localhost\.cc|www\.amrsherif\.localhost\.cc)(?:-[a-z0-9-]+)?\.(?:vercel\.app|localhost\.cc)$/i;

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (PROJECT_PREVIEW_ORIGIN_RE.test(origin)) return true;
  return false;
}

function getCorsOrigin(origin) {
  if (isAllowedOrigin(origin)) {
    return origin;
  }
  return 'https://tb-eg.vercel.app';
}

export default async function handler(req, res) {
  const headers = req.headers || {};
  const origin = headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    return sendJson(res, 403, {
      error: { code: 'bad-output', message: 'Origin not allowed.' },
    });
  }

  const allowedOrigin = getCorsOrigin(origin);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-user-api-key, X-User-Gemini-Key, X-User-Api-Key');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    return sendJson(res, 200, { configured: false });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return sendJson(res, 405, { error: { code: 'bad-output', message: 'Method not allowed.' } });
  }

  const customUserKey = getProvidedUserKey(req);
  if (!customUserKey) {
    return sendJson(res, 403, {
      error: 'BYOK_REQUIRED',
      message: 'You must provide your own Gemini API key.',
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: { code: 'bad-output', message: 'Invalid request body.' } });
  }

  if (body.operation === 'transcribe' && !(typeof body.audioData === 'string' && body.audioData.trim())) {
    return sendJson(res, 400, {
      error: { code: 'empty-audio', message: 'Audio data is required.' },
    });
  }
  if (body.operation === 'corporate-bridge') {
    const thought = typeof body.thought === 'string' ? body.thought.trim() : '';
    if (!thought || thought.length > 500) {
      return sendJson(res, 400, {
        error: { code: 'empty-input', message: 'Thought is required and cannot exceed 500 characters.' },
      });
    }
  }
  if (body.operation === 'explain-error') {
    const conceptId = typeof body.conceptId === 'string' ? body.conceptId : '';
    const submitted = typeof body.submitted === 'string' ? body.submitted : '';
    const target = typeof body.target === 'string' ? body.target : '';
    if (conceptId.length > 80 || submitted.length > 500 || target.length > 500) {
      return sendJson(res, 400, {
        error: { code: 'bad-output', message: 'Input lengths exceed allowed maximum.' },
      });
    }
  }

  // 1. Check response cache first
  const cacheKey = buildCacheKey(body.operation, body);
  const cachedData = await getCachedResponse(cacheKey);
  if (cachedData !== null) {
    return sendJson(res, 200, { data: cachedData, cached: true }, { 'X-Cache': 'HIT' });
  }

  // 2. Strict BYOK Rate Limit: 3 requests/day per IP without custom API key
  if (!customUserKey) {
    const address = getClientIp(req);
    const limitStatus = checkMemoryRateLimit(address, false);
    if (limitStatus === 'FREE_LIMIT_REACHED') {
      return sendJson(res, 429, {
        error: "FREE_LIMIT_REACHED",
        message: "Daily AI limit reached. Add your own free API key in Settings for unlimited access.",
        code: 'rate-limited',
      });
    }
  }

  // 3. Handle Streaming SSE if requested
  if (body.stream === true || (headers.accept && headers.accept.includes('text/event-stream'))) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    try {
      const stream = await generateStream(body.operation || 'conversation', body, customUserKey);
      for await (const chunk of stream) {
        const text = chunk.text || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (streamErr) {
      console.error('Gemini stream error:', streamErr);
      res.write(`data: ${JSON.stringify({ error: 'Stream error occurred.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
  }

  try {
    const result = await generate(body.operation, body, customUserKey);
    if (result.status === 200 && result.data !== undefined) {
      await setCachedResponse(cacheKey, result.data);
      return sendJson(res, 200, { data: result.data }, { 'X-Cache': 'MISS' });
    }
    return sendJson(res, result.status, { error: result.error });
  } catch (err) {
    console.error('Gemini request failed:', err);
    return sendJson(res, 502, {
      error: {
        code: 'network',
        message: HIGH_TRAFFIC_MESSAGE,
      },
    });
  }
}

export const config = { maxDuration: 60 };
export const _cb = { generateContentWithFallback };

export {
  handler,
  MODEL,
  FALLBACK_MODELS,
  generateContentWithFallback,
  generateContentStreamWithFallback,
  getClientIp,
  checkMemoryRateLimit,
  rateLimits,
  getCorsOrigin,
  STRICT_FREE_LIMIT_PER_DAY,
};
