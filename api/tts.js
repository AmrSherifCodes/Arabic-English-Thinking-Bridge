import { EdgeTTS } from 'voipi/edge-tts';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MAX_TEXT_LENGTH = 600;
const TTS_RATE_LIMIT_PER_MINUTE = 30;
const TTS_RATE_WINDOW_MS = 60_000;
const memoryRateLimits = new Map();
let upstashTtsLimiter;

export const ALLOWED_EDGE_VOICES = new Set([
  'ar-EG-SalmaNeural',
  'ar-SA-HamedNeural',
  'en-US-AvaNeural',
  'en-GB-SoniaNeural',
  'de-DE-KatjaNeural',
  'ja-JP-NanamiNeural',
  'es-ES-ElviraNeural',
  'fr-FR-DeniseNeural',
  'zh-CN-XiaoxiaoNeural',
  'hi-IN-SwaraNeural',
  'ru-RU-SvetlanaNeural',
  'pt-BR-FranciscaNeural',
  'it-IT-IsabellaNeural'
]);

const EDGE_VOICES_BY_LANGUAGE = {
  ar: 'ar-EG-SalmaNeural',
  de: 'de-DE-KatjaNeural',
  ja: 'ja-JP-NanamiNeural',
  es: 'es-ES-ElviraNeural',
  fr: 'fr-FR-DeniseNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  hi: 'hi-IN-SwaraNeural',
  ru: 'ru-RU-SvetlanaNeural',
  pt: 'pt-BR-FranciscaNeural',
  it: 'it-IT-IsabellaNeural',
};

export function resolveEdgeVoice(lang = 'en-US', requestedVoice = '') {
  const norm = String(lang || 'en-US').trim().toLowerCase().replace('_', '-');
  const languageCode = norm.split('-')[0];
  if (
    typeof requestedVoice === 'string' &&
    ALLOWED_EDGE_VOICES.has(requestedVoice) &&
    requestedVoice.slice(0, 2).toLowerCase() === languageCode
  ) {
    return requestedVoice;
  }
  if (languageCode === 'en' && norm === 'en-gb') return 'en-GB-SoniaNeural';
  if (norm === 'ar-sa') return 'ar-SA-HamedNeural';
  if (EDGE_VOICES_BY_LANGUAGE[languageCode]) return EDGE_VOICES_BY_LANGUAGE[languageCode];
  return 'en-US-AvaNeural';
}

export function validateLang(lang) {
  if (typeof lang === 'string' && lang.trim().length <= 10 && /^[a-z]{2,3}([-_][A-Za-z]{2,4})?$/.test(lang.trim())) {
    return lang.trim();
  }
  return 'en-US';
}

export function validatePitch(pitch) {
  return typeof pitch === 'string' && /^([+-][12]?Hz|default)$/.test(pitch.trim())
    ? pitch.trim()
    : '+1Hz';
}

export function consumeMemoryTtsRateLimit(address, now = Date.now()) {
  let record = memoryRateLimits.get(address);
  if (!record || record.resetAt <= now) {
    if (memoryRateLimits.size > 5000) {
      for (const [key, value] of memoryRateLimits) {
        if (value.resetAt <= now) memoryRateLimits.delete(key);
      }
    }
    record = { count: 0, resetAt: now + TTS_RATE_WINDOW_MS };
    memoryRateLimits.set(address, record);
  }
  if (record.count >= TTS_RATE_LIMIT_PER_MINUTE) return false;
  record.count += 1;
  return true;
}

function getClientIp(req) {
  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) return forwardedFor.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function getUpstashTtsLimiter() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  if (!url || !token) return null;
  if (!upstashTtsLimiter) {
    try {
      const redis = new Redis({ url, token });
      upstashTtsLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(TTS_RATE_LIMIT_PER_MINUTE, '1 m'),
        analytics: false,
        prefix: 'tb:tts:rl',
      });
    } catch (error) {
      console.error('Unable to initialize the Upstash TTS rate limiter.', error);
      return null;
    }
  }
  return upstashTtsLimiter;
}

async function checkTtsRateLimit(address) {
  const limiter = getUpstashTtsLimiter();
  if (limiter) {
    try {
      const { success, reset } = await limiter.limit(address);
      return { success, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
    } catch (error) {
      console.error('Upstash TTS rate limiter failed; using per-instance rate limit.', error);
    }
  }
  return {
    success: consumeMemoryTtsRateLimit(address),
    retryAfter: Math.ceil(TTS_RATE_WINDOW_MS / 1000),
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

export function getCorsOrigin(origin) {
  if (isAllowedOrigin(origin)) {
    return origin;
  }
  return 'https://amrsherif.localhost.cc';
}

function isAllowedUrlOrigin(urlStr) {
  if (!urlStr) return false;
  try {
    const u = new URL(urlStr);
    const originOnly = `${u.protocol}//${u.host}`;
    return isAllowedOrigin(originOnly);
  } catch {
    return false;
  }
}

export default async function ttsHandler(req, res) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  res.setHeader('Access-Control-Allow-Origin', getCorsOrigin(origin));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite === 'cross-site' && !origin && !referer) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Cross-site request rejected.' }));
    return;
  }

  if (origin) {
    if (!isAllowedOrigin(origin)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Origin not allowed.' }));
      return;
    }
  } else if (referer) {
    if (!isAllowedUrlOrigin(referer)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Referer not allowed.' }));
      return;
    }
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  const rateLimit = await checkTtsRateLimit(getClientIp(req));
  if (!rateLimit.success) {
    res.statusCode = 429;
    res.setHeader('Retry-After', String(rateLimit.retryAfter));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Too many TTS requests. Please retry later.' }));
    return;
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let text = url.searchParams.get('text') || '';
    let lang = url.searchParams.get('lang') || 'en-US';
    let voice = url.searchParams.get('voice') || '';
    let rate = Number(url.searchParams.get('rate') || '1');
    let pitch = url.searchParams.get('pitch') || '+1Hz';

    if (req.method === 'POST') {
      const chunks = [];
      let totalBytes = 0;
      for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buf.length;
        if (totalBytes > 8192) {
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Payload too large.' }));
          return;
        }
        chunks.push(buf);
      }
      if (chunks.length > 0) {
        const raw = Buffer.concat(chunks).toString('utf8');
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
          return;
        }
        if (body && typeof body === 'object') {
          if (typeof body.text === 'string') text = body.text;
          if (typeof body.lang === 'string') lang = body.lang;
          if (typeof body.voice === 'string') voice = body.voice;
          if (typeof body.rate === 'number') rate = body.rate;
          if (typeof body.pitch === 'string') pitch = body.pitch;
        }
      }
    }

    const cleanText = text.trim();
    if (!cleanText || cleanText.length > MAX_TEXT_LENGTH) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Text must be 1–600 characters.' }));
      return;
    }

    const safeLang = validateLang(lang);
    const safeRate = Number.isFinite(rate) ? Math.min(2, Math.max(0.5, rate)) : 1;
    const conversationalRate = safeRate === 1 ? 1.03 : safeRate;
    const safePitch = validatePitch(pitch);
    const selectedVoice = resolveEdgeVoice(safeLang, voice);

    const edgeTts = new EdgeTTS({ voice: selectedVoice, pitch: safePitch });
    const audio = await edgeTts.synthesize(cleanText, {
      voice: selectedVoice,
      lang: safeLang,
      rate: conversationalRate,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-TTS-Provider', 'edge-tts');
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, immutable');
    res.end(audio.data);
  } catch (error) {
    console.error('TTS error:', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: 'TTS synthesis failed.',
      })
    );
  }
}
