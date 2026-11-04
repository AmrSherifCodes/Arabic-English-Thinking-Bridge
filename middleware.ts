import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = {
  matcher: ['/api/:path*']
};

const RATE_LIMIT_PER_MINUTE = 20;
const RATE_WINDOW_MS = 60_000;

interface MemoryRateRecord {
  count: number;
  resetAt: number;
}

const memoryLimiter = new Map<string, MemoryRateRecord>();

// Initialize Upstash Redis if environment variables are provided
let upstashRatelimit: Ratelimit | null = null;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (upstashUrl && upstashToken) {
  try {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken
    });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_PER_MINUTE, '1 m'),
      analytics: false,
      prefix: 'tb:edge_ratelimit'
    });
  } catch {
    upstashRatelimit = null;
  }
}

const ALLOWED_CORS_ORIGINS = new Set([
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

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (PROJECT_PREVIEW_ORIGIN_RE.test(origin)) return true;
  return false;
}

function checkMemoryRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = memoryLimiter.get(ip);

  // Evict expired entries when map grows large
  if (memoryLimiter.size > 5000) {
    for (const [key, val] of memoryLimiter.entries()) {
      if (val.resetAt <= now) {
        memoryLimiter.delete(key);
      }
    }
    if (memoryLimiter.size > 5000) {
      const oldestKey = memoryLimiter.keys().next().value;
      if (oldestKey) memoryLimiter.delete(oldestKey);
    }
  }

  if (!record || record.resetAt <= now) {
    memoryLimiter.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }

  record.count += 1;
  return true;
}

function getClientIp(request: Request): string {
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp && xRealIp.trim()) {
    return xRealIp.trim();
  }
  const xVercelForwarded = request.headers.get('x-vercel-forwarded-for');
  if (xVercelForwarded && xVercelForwarded.trim()) {
    const parts = xVercelForwarded.split(',');
    return parts[0].trim();
  }
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor && xForwardedFor.trim()) {
    const parts = xForwardedFor.split(',');
    return parts[0].trim();
  }
  return '127.0.0.1';
}

export { getClientIp, checkMemoryRateLimit, memoryLimiter };

export default async function middleware(request: Request): Promise<Response> {
  // Allow preflight OPTIONS requests without consuming rate limit
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'x-middleware-next': '1'
      }
    });
  }

  const ip = getClientIp(request);

  let allowed = true;
  if (upstashRatelimit) {
    try {
      const { success } = await upstashRatelimit.limit(ip);
      allowed = success;
    } catch {
      allowed = checkMemoryRateLimit(ip);
    }
  } else {
    allowed = checkMemoryRateLimit(ip);
  }

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'rate-limit-exceeded',
          message: 'Rate limit exceeded: maximum 20 requests per minute per IP. Please slow down.'
        }
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': '60',
          'Access-Control-Allow-Origin': isAllowedOrigin(request.headers.get('origin')) ? (request.headers.get('origin') as string) : 'https://arabicenglishthinkingbridge.vercel.app',
          'Vary': 'Origin',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }

  return new Response(null, {
    headers: {
      'x-middleware-next': '1'
    }
  });
}

