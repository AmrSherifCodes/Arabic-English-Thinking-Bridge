import { Redis } from '@upstash/redis';

const ALLOWED_CORS_ORIGINS = new Set([
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost'
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn('Redis not configured for presence.');
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin = isAllowedOrigin(origin) ? origin : 'https://arabicenglishthinkingbridge.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Zen of Python: Simple is better than complex.
  // Fallback gracefully if Redis is not configured instead of crashing.
  if (!redis) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ count: 1 }));
  }

  try {
    let body = {};
    if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        if (chunks.length) body = JSON.parse(Buffer.concat(chunks).toString());
    }

    // Explicit is better than implicit. Ensure we have a string ID.
    const clientId = (typeof body.clientId === 'string' && body.clientId.length > 5)
        ? body.clientId
        : 'anonymous';

    const now = Date.now();
    const thirtySecondsAgo = now - 35 * 1000;

    if (clientId !== 'anonymous') {
        await redis.zadd('live_visitors', { score: now, member: clientId });
    }

    await redis.zremrangebyscore('live_visitors', 0, thirtySecondsAgo);
    const count = await redis.zcard('live_visitors');

    res.statusCode = 200;
    return res.end(JSON.stringify({ count: Math.max(1, count) }));
  } catch (e) {
    // Errors should never pass silently.
    console.error('Presence API error:', e);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal error', count: 1 }));
  }
}