import { EdgeTTS } from 'voipi/edge-tts';
import { GoogleTTS } from 'voipi/google-tts';

const MAX_TEXT_LENGTH = 600;

export const ALLOWED_EDGE_VOICES = new Set([
  'ar-EG-SalmaNeural',
  'ar-SA-HamedNeural',
  'en-US-AvaNeural',
  'en-GB-SoniaNeural'
]);

export function resolveEdgeVoice(lang = 'en-US', requestedVoice = '') {
  if (typeof requestedVoice === 'string' && ALLOWED_EDGE_VOICES.has(requestedVoice)) {
    return requestedVoice;
  }
  const norm = String(lang || 'en-US').trim().toLowerCase().replace('_', '-');
  if (norm === 'ar-sa') return 'ar-SA-HamedNeural';
  if (norm.startsWith('ar')) return 'ar-EG-SalmaNeural';
  if (norm === 'en-gb') return 'en-GB-SoniaNeural';
  return 'en-US-AvaNeural';
}

export function validateLang(lang) {
  if (typeof lang === 'string' && lang.trim().length <= 10 && /^[a-z]{2,3}([-_][A-Za-z]{2,4})?$/.test(lang.trim())) {
    return lang.trim();
  }
  return 'en-US';
}

function resolveGoogleLang(lang = 'en-US') {
  const norm = String(lang || 'en-US').trim().toLowerCase().replace('_', '-');
  if (norm.startsWith('ar')) return 'ar';
  return 'en';
}

export const ALLOWED_CORS_ORIGINS = new Set([
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost'
]);

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

export function getCorsOrigin(origin) {
  if (isAllowedOrigin(origin)) {
    return origin;
  }
  return 'https://arabicenglishthinkingbridge.vercel.app';
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

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let text = url.searchParams.get('text') || '';
    let lang = url.searchParams.get('lang') || 'en-US';
    let voice = url.searchParams.get('voice') || '';
    let rate = Number(url.searchParams.get('rate') || '1');

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
    const selectedVoice = resolveEdgeVoice(safeLang, voice);

    let audio;
    let provider = 'edge-tts';
    try {
      const edgeTts = new EdgeTTS({ voice: selectedVoice });
      audio = await edgeTts.synthesize(cleanText, {
        voice: selectedVoice,
        lang: safeLang,
        rate: safeRate,
      });
    } catch {
      provider = 'google-tts';
      const googleLang = resolveGoogleLang(safeLang);
      const googleTts = new GoogleTTS({
        voice: googleLang,
        slow: safeRate < 0.78,
      });
      audio = await googleTts.synthesize(cleanText, {
        lang: googleLang,
        rate: safeRate,
      });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-TTS-Provider', provider);
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
