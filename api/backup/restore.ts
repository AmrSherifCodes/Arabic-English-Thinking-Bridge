import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const RECOVERY_CODE_REGEX = /^[A-Z0-9]{6,16}$/;
const PIN_REGEX = /^\d{4}$/;

const memoryHits = new Map<string, { count: number; resetAt: number }>();

let upstashLimiter: Ratelimit | null = null;
function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  upstashLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'tb:backup:restore',
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
  const windowMs = 15 * 60 * 1000;
  const current = memoryHits.get(key);
  if (!current || current.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (current.count >= 5) {
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

function verifyPin(pin: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hexHash] = parts;
  if (!salt || !hexHash) return false;
  try {
    const expected = Buffer.from(hexHash, 'hex');
    const derived = crypto.scryptSync(pin, salt, 64);
    if (expected.length !== derived.length) return false;
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

async function callSupabaseRpc<T>(url: string, key: string, rpcName: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`SUPABASE_RPC_${response.status}`);
  }
  return (await response.json()) as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const recoveryCode = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim().toUpperCase() : '';
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  const newDeviceId = typeof body.newDeviceId === 'string' ? body.newDeviceId.trim() : '';

  const ip = getClientIp(req);
  const limit = await checkRateLimit(`restore:${ip}:${recoveryCode || 'any'}`);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds ?? 60));
    return res.status(429).json({
      ok: false,
      error: 'RATE_LIMITED',
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  if (!RECOVERY_CODE_REGEX.test(recoveryCode)) {
    return res.status(400).json({ ok: false, error: 'INVALID_RECOVERY_CODE' });
  }
  if (!PIN_REGEX.test(pin)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PIN' });
  }
  if (newDeviceId.length < 8 || newDeviceId.length > 128) {
    return res.status(400).json({ ok: false, error: 'INVALID_DEVICE' });
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'SERVER_UNCONFIGURED' });
  }

  try {
    const backup = await callSupabaseRpc<{
      ok?: boolean;
      recovery_code?: string;
      pin_hash?: string;
      device_id?: string;
      payload_json?: Record<string, unknown>;
      updated_at?: string;
      error?: string;
    }>(url, key, 'get_cloud_backup', {
      p_recovery_code: recoveryCode,
    });

    if (!backup?.ok || !backup.pin_hash || !backup.device_id) {
      return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });
    }

    if (!verifyPin(pin, backup.pin_hash)) {
      return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });
    }

    // Transfer/authorize the active server-side entitlement onto the new device
    const restoredEnt = await callSupabaseRpc<{
      ok?: boolean;
      tier?: string;
      cohort_code?: string | null;
      label?: string | null;
      activated_at?: string | null;
      expires_at?: string | null;
    }>(url, key, 'restore_entitlement_to_device', {
      p_old_device_id: backup.device_id,
      p_new_device_id: newDeviceId,
    });

    return res.status(200).json({
      ok: true,
      entitlement: restoredEnt?.ok
        ? {
            tier: restoredEnt.tier || 'free',
            cohortCode: restoredEnt.cohort_code ?? null,
            label: restoredEnt.label ?? null,
            activatedAt: restoredEnt.activated_at ?? null,
            expiresAt: restoredEnt.expires_at ?? null,
          }
        : null,
      payload: backup.payload_json ?? {},
      updatedAt: backup.updated_at ?? null,
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
}
