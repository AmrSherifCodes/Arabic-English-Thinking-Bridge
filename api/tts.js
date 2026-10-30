import { EdgeTTS } from 'voipi/edge-tts';

const MAX_TEXT_LENGTH = 600;

function resolveEdgeVoice(lang = 'en-US', requestedVoice = '') {
  if (typeof requestedVoice === 'string' && /^[a-z]{2,3}(-[A-Z][A-Za-z]+)+-.+Neural$/.test(requestedVoice)) {
    return requestedVoice;
  }
  const norm = String(lang || 'en-US').trim().toLowerCase().replace('_', '-');
  if (norm === 'ar-sa') return 'ar-SA-HamedNeural';
  if (norm.startsWith('ar')) return 'ar-EG-SalmaNeural';
  if (norm === 'en-gb') return 'en-GB-SoniaNeural';
  return 'en-US-AvaNeural';
}

export default async function ttsHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST');
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
      let raw = '';
      for await (const chunk of req) {
        raw += chunk.toString();
        if (raw.length > 8192) break;
      }
      if (raw) {
        const body = JSON.parse(raw);
        if (typeof body.text === 'string') text = body.text;
        if (typeof body.lang === 'string') lang = body.lang;
        if (typeof body.voice === 'string') voice = body.voice;
        if (typeof body.rate === 'number') rate = body.rate;
      }
    }

    const cleanText = text.trim();
    if (!cleanText || cleanText.length > MAX_TEXT_LENGTH) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Text must be 1–600 characters.' }));
      return;
    }

    const safeRate = Number.isFinite(rate) ? Math.min(2, Math.max(0.5, rate)) : 1;
    const selectedVoice = resolveEdgeVoice(lang, voice);
    const tts = new EdgeTTS({ voice: selectedVoice });
    const audio = await tts.synthesize(cleanText, {
      voice: selectedVoice,
      lang,
      rate: safeRate,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(audio.data);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Edge TTS synthesis failed.',
      })
    );
  }
}

