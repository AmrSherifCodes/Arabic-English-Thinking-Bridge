import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const CODE_REGEX = /^[A-Z0-9][A-Z0-9-]{3,31}$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

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

function getAction(req: VercelRequest): string {
  const q = req.query?.action;
  if (typeof q === 'string' && q.trim()) return q.trim().toLowerCase();
  if (Array.isArray(q) && q[0]) return q[0].trim().toLowerCase();
  const pathname = (req.url || '').split('?')[0];
  const parts = pathname.split('/').filter(Boolean);
  return (parts[parts.length - 1] || '').toLowerCase();
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

function sanitizeInt(value: unknown, max: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.min(max, Math.floor(num));
}

function sanitizeMistakes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim().slice(0, 48);
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    cleaned.push(trimmed);
    if (cleaned.length >= 6) break;
  }
  return cleaned;
}

interface RawRosterRow {
  device_id?: string;
  display_name?: string;
  cohort_code?: string;
  weekly_xp?: number;
  total_xp?: number;
  streak_days?: number;
  completed_lessons?: number;
  top_l1_mistakes?: unknown;
  updated_at?: string;
}

async function handleRedeem(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
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
    return res.status(503).json({ ok: false, errorCode: 'SERVER_UNCONFIGURED' });
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

async function handleStatus(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, errorCode: 'METHOD_NOT_ALLOWED' });
  }

  const rawDeviceId =
    req.method === 'GET'
      ? (Array.isArray(req.query.deviceId) ? req.query.deviceId[0] : req.query.deviceId)
      : req.body?.deviceId;

  const deviceId = typeof rawDeviceId === 'string' ? rawDeviceId.trim() : '';
  if (deviceId.length < 8 || deviceId.length > 128) {
    return res.status(400).json({ ok: false, errorCode: 'INVALID_DEVICE' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ ok: false, errorCode: 'SERVER_UNCONFIGURED' });
  }

  try {
    const rpcUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/get_device_entitlement`;
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ p_device_id: deviceId }),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, errorCode: 'SERVER_ERROR' });
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      tier?: string;
      cohort_code?: string | null;
      label?: string | null;
      activated_at?: string | null;
      expires_at?: string | null;
    };

    if (!payload?.ok) {
      return res.status(400).json({ ok: false, errorCode: 'INVALID_DEVICE' });
    }

    return res.status(200).json({
      ok: true,
      entitlement: {
        tier: payload.tier || 'free',
        cohortCode: payload.cohort_code ?? null,
        label: payload.label ?? null,
        activatedAt: payload.activated_at ?? null,
        expiresAt: payload.expires_at ?? null,
        lastSyncedAt: new Date().toISOString(),
        source: 'server',
      },
    });
  } catch {
    return res.status(500).json({ ok: false, errorCode: 'SERVER_ERROR' });
  }
}

async function handleCohortSync(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, errorCode: 'METHOD_NOT_ALLOWED' });
  }

  const body = req.body || {};
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : '';
  if (deviceId.length < 8 || deviceId.length > 128) {
    return res.status(400).json({ ok: false, errorCode: 'INVALID_DEVICE' });
  }

  const displayName =
    typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 64) : '';
  const weeklyXp = sanitizeInt(body.weeklyXp, 1_000_000);
  const totalXp = sanitizeInt(body.totalXp, 10_000_000);
  const streakDays = sanitizeInt(body.streakDays, 3_650);
  const completedLessons = sanitizeInt(body.completedLessons, 10_000);
  const topL1Mistakes = sanitizeMistakes(body.topL1Mistakes);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ ok: false, errorCode: 'SERVER_UNCONFIGURED' });
  }

  try {
    const rpcUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/upsert_cohort_progress`;
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        p_device_id: deviceId,
        p_display_name: displayName,
        p_weekly_xp: weeklyXp,
        p_total_xp: totalXp,
        p_streak_days: streakDays,
        p_completed_lessons: completedLessons,
        p_top_l1_mistakes: topL1Mistakes,
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, errorCode: 'SERVER_ERROR' });
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      cohort_code?: string;
      updated_at?: string;
    };

    if (!payload?.ok) {
      const status = payload?.error === 'UNAUTHORIZED_TIER' ? 403 : 400;
      return res.status(status).json({
        ok: false,
        errorCode: payload?.error || 'INVALID_REQUEST',
      });
    }

    return res.status(200).json({
      ok: true,
      cohortCode: payload.cohort_code ?? null,
      updatedAt: payload.updated_at ?? new Date().toISOString(),
    });
  } catch {
    return res.status(500).json({ ok: false, errorCode: 'SERVER_ERROR' });
  }
}

async function handleCohortRoster(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, errorCode: 'METHOD_NOT_ALLOWED' });
  }

  const rawDeviceId = Array.isArray(req.query.deviceId)
    ? req.query.deviceId[0]
    : req.query.deviceId;
  const deviceId = typeof rawDeviceId === 'string' ? rawDeviceId.trim() : '';

  if (deviceId.length < 8 || deviceId.length > 128) {
    return res.status(400).json({ ok: false, errorCode: 'INVALID_DEVICE' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ ok: false, errorCode: 'SERVER_UNCONFIGURED' });
  }

  try {
    const rpcUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/get_cohort_roster`;
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ p_device_id: deviceId }),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, errorCode: 'SERVER_ERROR' });
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      cohort_code?: string | null;
      label?: string | null;
      students?: RawRosterRow[];
      fetched_at?: string;
    };

    if (!payload?.ok) {
      const status = payload?.error === 'UNAUTHORIZED_TIER' ? 403 : 400;
      return res.status(status).json({
        ok: false,
        errorCode: payload?.error || 'INVALID_REQUEST',
      });
    }

    const students = Array.isArray(payload.students)
      ? payload.students.map((row) => ({
          deviceId: String(row.device_id || ''),
          displayName: String(row.display_name || 'Student'),
          cohortCode: String(row.cohort_code || payload.cohort_code || ''),
          weeklyXp: Number(row.weekly_xp || 0),
          totalXp: Number(row.total_xp || 0),
          streakDays: Number(row.streak_days || 0),
          completedLessons: Number(row.completed_lessons || 0),
          topL1Mistakes: Array.isArray(row.top_l1_mistakes)
            ? row.top_l1_mistakes.filter((m): m is string => typeof m === 'string')
            : [],
          updatedAt: String(row.updated_at || new Date().toISOString()),
        }))
      : [];

    return res.status(200).json({
      ok: true,
      cohortCode: payload.cohort_code ?? null,
      label: payload.label ?? null,
      students,
      fetchedAt: payload.fetched_at ?? new Date().toISOString(),
    });
  } catch {
    return res.status(500).json({ ok: false, errorCode: 'SERVER_ERROR' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  const action = getAction(req);
  if (action === 'redeem') return handleRedeem(req, res);
  if (action === 'status') return handleStatus(req, res);
  if (action === 'cohort-sync') return handleCohortSync(req, res);
  if (action === 'cohort-roster') return handleCohortRoster(req, res);
  return res.status(404).json({ ok: false, errorCode: 'NOT_FOUND' });
}
