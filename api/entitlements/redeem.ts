import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const CODE_REGEX = /^[A-Z0-9][A-Z0-9-]{3,31}$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

// In-memory sliding window fallback when Upstash Redis is not configured
const memoryAttempts = new Map<string, number[]>();

let upstashLimiter: Ratelimit | null | undefined;
function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashLimiter = null;
    return null;
  }
  try {
    const redis = new Redis({ url, token });
    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_ATTEMPTS, '15 m'),
      prefix: 'tb:voucher:redeem',
    });
  } catch {
    upstashLimiter = null;
  }
  return upstashLimiter;
}

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  if (Array.isArray(fwd) && fwd[0]) {
    return fwd[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    try {
      const result = await limiter.limit(key);
      if (!result.success) {
        const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        return { allowed: false, retryAfterSeconds };
      }
      return { allowed: true };
    } catch {
      // Fall through to memory limiter if Redis is temporarily unavailable
    }
  }

  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (memoryAttempts.get(key) || []).filter((ts) => ts > windowStart);
  if (recent.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    const oldest = recent[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    memoryAttempts.set(key, recent);
    return { allowed: false, retryAfterSeconds };
  }
  recent.push(now);
  memoryAttempts.set(key, recent);
  return { allowed: true };
}

/**
 * Same-origin Vercel API Proxy for atomic single-use voucher redemption.
 * Endpoint: POST /api/entitlements/redeem
 * Keeps browser CSP strict (connect-src 'self') and hides Supabase service credentials.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, errorCode: 'METHOD_NOT_ALLOWED' });
  }

  const { code, deviceId, displayName } = req.body || {};
  const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  const normalizedDeviceId = typeof deviceId === 'string' ? deviceId.trim() : '';
  const normalizedDisplayName =
    typeof displayName === 'string' ? displayName.trim().slice(0, 64) : null;

  if (!CODE_REGEX.test(normalizedCode)) {
    return res.status(400).json({ ok: false, errorCode: 'INVALID_FORMAT' });
  }

  if (normalizedDeviceId.length < 8 || normalizedDeviceId.length > 128) {
    return res.status(400).json({ ok: false, errorCode: 'INVALID_DEVICE' });
  }

  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(`${ip}:${normalizedDeviceId}`);
  if (!rateCheck.allowed) {
    if (rateCheck.retryAfterSeconds) {
      res.setHeader('Retry-After', String(rateCheck.retryAfterSeconds));
    }
    return res.status(429).json({
      ok: false,
      errorCode: 'RATE_LIMITED',
      retryAfterSeconds: rateCheck.retryAfterSeconds || 60,
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({
      ok: false,
      errorCode: 'SERVER_UNCONFIGURED',
    });
  }

  try {
    const rpcUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/redeem_voucher_code`;
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        p_code: normalizedCode,
        p_device_id: normalizedDeviceId,
        p_display_name: normalizedDisplayName,
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, errorCode: 'SERVER_ERROR' });
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      tier?: string;
      cohort_code?: string | null;
      label?: string | null;
      activated_at?: string | null;
      expires_at?: string | null;
    };

    if (!payload?.ok) {
      const errorCode = payload?.error === 'INVALID_FORMAT' ? 'INVALID_FORMAT' : 'INVALID_OR_USED_CODE';
      return res.status(400).json({ ok: false, errorCode });
    }

    return res.status(200).json({
      ok: true,
      entitlement: {
        tier: payload.tier || 'free',
        cohortCode: payload.cohort_code ?? null,
        label: payload.label ?? null,
        activatedAt: payload.activated_at ?? new Date().toISOString(),
        expiresAt: payload.expires_at ?? null,
        lastSyncedAt: new Date().toISOString(),
        source: 'server',
      },
    });
  } catch {
    return res.status(500).json({ ok: false, errorCode: 'SERVER_ERROR' });
  }
}
