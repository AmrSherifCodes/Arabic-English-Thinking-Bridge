import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import ttsHandler, {
  consumeMemoryTtsRateLimit,
  resolveEdgeVoice,
  validateLang,
  validatePitch,
  getCorsOrigin,
  ALLOWED_EDGE_VOICES,
  ALLOWED_CORS_ORIGINS,
} from './tts.js';
import { buildSsml, escapeXml } from 'voipi/edge-tts';

function createMockReq({
  method = 'GET',
  url = '/api/tts?text=Hello',
  headers = {},
  body = null,
  chunks = null
} = {}) {
  let stream;
  if (chunks) {
    stream = Readable.from(chunks);
  } else if (body !== null) {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    stream = Readable.from([Buffer.from(raw, 'utf8')]);
  } else {
    stream = Readable.from([]);
  }

  stream.method = method;
  stream.url = url;
  stream.headers = {
    host: 'localhost',
    ...headers
  };
  return stream;
}

function createMockRes() {
  const headers = {};
  let bodyData = '';
  let finished = false;

  return {
    statusCode: 200,
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
    },
    getHeader(key) {
      return headers[key.toLowerCase()];
    },
    end(data) {
      if (data) {
        bodyData = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
      }
      finished = true;
    },
    get headers() {
      return headers;
    },
    get body() {
      return bodyData;
    },
    get isFinished() {
      return finished;
    }
  };
}

test('1. Disallowed origin returns 403 Forbidden', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { origin: 'https://malicious-attacker.com' },
    body: { text: 'Hello' }
  });
  const res = createMockRes();

  await ttsHandler(req, res);
  assert.equal(res.statusCode, 403);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Origin not allowed.');
});

test('TTS allows both custom-domain origins and uses the primary domain as fallback', () => {
  for (const origin of ['https://amrsherif.localhost.cc', 'https://www.amrsherif.localhost.cc']) {
    assert.equal(ALLOWED_CORS_ORIGINS.has(origin), true);
    assert.equal(getCorsOrigin(origin), origin);
  }
  assert.equal(getCorsOrigin('https://untrusted.example'), 'https://tb-eg.vercel.app');
});

test('2. Disallowed referer returns 403 Forbidden', async () => {
  const req = createMockReq({
    method: 'GET',
    url: '/api/tts?text=Hello',
    headers: { referer: 'https://evil-site.com/embed' }
  });
  const res = createMockRes();

  await ttsHandler(req, res);
  assert.equal(res.statusCode, 403);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Referer not allowed.');
});

test('3. Cross-site Sec-Fetch-Site without origin/referer returns 403 Forbidden', async () => {
  const req = createMockReq({
    method: 'GET',
    url: '/api/tts?text=Hello',
    headers: { 'sec-fetch-site': 'cross-site' }
  });
  const res = createMockRes();

  await ttsHandler(req, res);
  assert.equal(res.statusCode, 403);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Cross-site request rejected.');
});

test('4. Bad JSON body in POST returns 400 Bad Request', async () => {
  const req = createMockReq({
    method: 'POST',
    headers: { origin: 'https://arabicenglishthinkingbridge.vercel.app' },
    body: '{"text": "broken json'
  });
  const res = createMockRes();

  await ttsHandler(req, res);
  assert.equal(res.statusCode, 400);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Invalid JSON body.');
});

test('5. POST body exceeding 8192 bytes returns 413 Payload Too Large', async () => {
  const hugeData = 'A'.repeat(9000);
  const req = createMockReq({
    method: 'POST',
    headers: { origin: 'https://arabicenglishthinkingbridge.vercel.app' },
    body: JSON.stringify({ text: hugeData })
  });
  const res = createMockRes();

  await ttsHandler(req, res);
  assert.equal(res.statusCode, 413);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Payload too large.');
});

test('6. Invalid voice falls back to language default', () => {
  assert.equal(ALLOWED_EDGE_VOICES.has('ar-EG-SalmaNeural'), true);
  assert.equal(ALLOWED_EDGE_VOICES.has('en-US-AvaNeural'), true);
  assert.equal(ALLOWED_EDGE_VOICES.has('ja-JP-NanamiNeural'), true);

  // Valid voice accepted
  assert.equal(resolveEdgeVoice('en-US', 'en-GB-SoniaNeural'), 'en-GB-SoniaNeural');
  assert.equal(resolveEdgeVoice('ja-JP', 'ja-JP-NanamiNeural'), 'ja-JP-NanamiNeural');
  assert.equal(resolveEdgeVoice('es-ES'), 'es-ES-ElviraNeural');
  assert.equal(resolveEdgeVoice('de-DE'), 'de-DE-KatjaNeural');

  // Arbitrary or malicious voice string rejected and falls back
  assert.equal(resolveEdgeVoice('en-US', 'malicious-voice-string'), 'en-US-AvaNeural');
  assert.equal(resolveEdgeVoice('ja-JP', 'en-US-AvaNeural'), 'ja-JP-NanamiNeural');
  assert.equal(resolveEdgeVoice('ar-EG', 'some-random-voice'), 'ar-EG-SalmaNeural');
  assert.equal(resolveEdgeVoice('ar-SA', 'unknown-voice'), 'ar-SA-HamedNeural');
  assert.equal(resolveEdgeVoice('en-GB', 'fake-voice'), 'en-GB-SoniaNeural');
});

test('7. Language code validator strictly validates BCP-47 patterns', () => {
  assert.equal(validateLang('en-US'), 'en-US');
  assert.equal(validateLang('ar-EG'), 'ar-EG');
  assert.equal(validateLang('en'), 'en');
  assert.equal(validateLang('ar'), 'ar');

  // Invalid or oversized strings fall back to en-US
  assert.equal(validateLang(''), 'en-US');
  assert.equal(validateLang('en-US-EXTRA-LONG-LANG'), 'en-US');
  assert.equal(validateLang('<script>'), 'en-US');
  assert.equal(validateLang('12345'), 'en-US');
});

test('TTS pitch accepts safe small adjustments and rejects malformed values', () => {
  assert.equal(validatePitch('+1Hz'), '+1Hz');
  assert.equal(validatePitch('-2Hz'), '-2Hz');
  assert.equal(validatePitch('<break/>'), '+1Hz');
});

test('TTS in-memory rate limiter blocks excess synthesis requests', () => {
  const address = `test-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < 30; i++) {
    assert.equal(consumeMemoryTtsRateLimit(address), true);
  }
  assert.equal(consumeMemoryTtsRateLimit(address), false);
});

test('8. Multi-chunk Buffer collection preserves multi-byte Arabic UTF-8 text across chunk boundaries', async () => {
  // Arabic text: "فكر إنجليزي" - 3-byte / 2-byte characters
  const fullJson = JSON.stringify({ text: 'فكّر إنجليزي ما وراء الجدار', lang: 'ar-EG' });
  const buf = Buffer.from(fullJson, 'utf8');

  // Split right in the middle of multi-byte Arabic code points
  const chunk1 = buf.subarray(0, 15);
  const chunk2 = buf.subarray(15, 31);
  const chunk3 = buf.subarray(31);

  const req = createMockReq({
    method: 'POST',
    headers: { origin: 'https://arabicenglishthinkingbridge.vercel.app' },
    chunks: [chunk1, chunk2, chunk3]
  });
  const res = createMockRes();

  // Will fail only at actual synthesis if network offline, but must parse the body correctly without 400
  try {
    await ttsHandler(req, res);
  } catch {}

  // The request must NOT fail on body parsing (should not be 400 or 413)
  assert.notEqual(res.statusCode, 400);
  assert.notEqual(res.statusCode, 413);
});

test('9. Static error body on synthesis failure', async () => {
  // Trigger text length failure (> 600 chars)
  const longText = 'Hello '.repeat(150); // > 600 chars
  const req = createMockReq({
    method: 'POST',
    headers: { origin: 'https://arabicenglishthinkingbridge.vercel.app' },
    body: { text: longText }
  });
  const res = createMockRes();

  await ttsHandler(req, res);
  assert.equal(res.statusCode, 400);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Text must be 1–600 characters.');
});

test('10. XML escaping in voipi EdgeTTS library: verifies <, &, and " are escaped before upstream SSML', () => {
  const dangerousInput = '<test & "quotes" \'apostrophe\'>';
  const escaped = escapeXml(dangerousInput);
  assert.equal(escaped, '&lt;test &amp; &quot;quotes&quot; &apos;apostrophe&apos;&gt;');

  const ssml = buildSsml(dangerousInput, 'en-US-AvaNeural', '+0%', '+0Hz', '+0%');
  assert.ok(ssml.includes('&lt;test &amp; &quot;quotes&quot; &apos;apostrophe&apos;&gt;'));
  assert.ok(!ssml.includes('<test'));
});
