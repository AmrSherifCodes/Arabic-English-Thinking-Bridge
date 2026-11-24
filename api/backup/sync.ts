import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RECOVERY_CODE_REGEX = /^[A-Z0-9]{6,16}$/;
const PIN_REGEX = /^\d{4}$/;
const MAX_PAYLOAD_BYTES = 256 * 1024;

// In-memory fallback limiter when Upstash Redis is not configured
const memoryHits = new Map<string, { count: number; resetAt: number }>();

let upstashLimiter: Ratelimit | null = null;
function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  upstashLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    prefix: 'tb:backup:sync',
  });
  return upstashLimiter;
}

async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    const res = await limiter.limit(key);
    if (!res.success) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
      };
    }
    return { allowed: true };
  }

  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const current = memoryHits.get(key);
  if (!current || current.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (current.count >= 10) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { allowed: true };
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function generateRecoveryCode(): string {
  const bytes = crypto.randomBytes(6);
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const ip = getClientIp(req);
  const limit = await checkRateLimit(`sync:${ip}`);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds ?? 60));
    return res.status(429).json({
      ok: false,
      error: 'RATE_LIMITED',
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : '';
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  const requestedCode = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim().toUpperCase() : '';
  const payload = body.payload;

  if (deviceId.length < 8 || deviceId.length > 128) {
    return res.status(400).json({ ok: false, error: 'INVALID_DEVICE' });
  }
  if (!PIN_REGEX.test(pin)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PIN' });
  }
  if (requestedCode && !RECOVERY_CODE_REGEX.test(requestedCode)) {
    return res.status(400).json({ ok: false, error: 'INVALID_RECOVERY_CODE' });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PAYLOAD' });
  }

  const serializedBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  if (serializedBytes > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ ok: false, error: 'PAYLOAD_TOO_LARGE' });
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'SERVER_UNCONFIGURED' });
  }

  const recoveryCode = requestedCode || generateRecoveryCode();
  const pinHash = hashPin(pin);

  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/upsert_cloud_backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        p_recovery_code: recoveryCode,
        p_pin_hash: pinHash,
        p_device_id: deviceId,
        p_payload_json: payload,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: 'BACKUP_SYNC_FAILED' });
    }

    const result = (await response.json()) as {
      ok?: boolean;
      recovery_code?: string;
      updated_at?: string;
      error?: string;
    };

    if (!result?.ok) {
      const status =
        result?.error === 'PRO_REQUIRED'
          ? 403
          : result?.error === 'CODE_COLLISION'
          ? 409
          : 400;
      return res.status(status).json({ ok: false, error: result?.error || 'BACKUP_SYNC_FAILED' });
    }

    return res.status(200).json({
      ok: true,
      recoveryCode: result.recovery_code || recoveryCode,
      updatedAt: result.updated_at || new Date().toISOString(),
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
}
