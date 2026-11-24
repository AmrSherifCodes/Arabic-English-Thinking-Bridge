import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ============================================================================
// Shared Helpers
// ============================================================================

type VoucherPlan =
  | 'monthly'
  | '3month'
  | 'quarterly'
  | 'lifetime'
  | 'trial'
  | 'academy_student'
  | 'academy_teacher';

const VALID_PLANS = new Set<VoucherPlan>([
  'monthly',
  '3month',
  'quarterly',
  'lifetime',
  'trial',
  'academy_student',
  'academy_teacher',
]);

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RECOVERY_CODE_REGEX = /^[A-Z0-9]{6,16}$/;
const PIN_REGEX = /^\d{4}$/;
const CERT_CODE_REGEX = /^TB-CERT-[A-Z0-9]{4,20}$/;
const MAX_BACKUP_PAYLOAD_BYTES = 256 * 1024;
const MAX_REPORT_PAYLOAD_BYTES = 32_768;
const MAX_ERRORS_PER_REPORT = 15;
const REPORT_RATE_LIMIT_MAX = 5;
const REPORT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function constantTimeEquals(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyAdminAuth(req: VercelRequest): { ok: true } | { ok: false; status: number; error: string } {
  const expected = process.env.ADMIN_API_SECRET?.trim();
  if (!expected) {
    return { ok: false, status: 503, error: 'ADMIN_SECRET_UNCONFIGURED' };
  }
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization.trim() : '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return { ok: false, status: 401, error: 'UNAUTHORIZED' };
  }
  const provided = authHeader.slice(7).trim();
  if (!provided || !constantTimeEquals(provided, expected)) {
    return { ok: false, status: 401, error: 'UNAUTHORIZED' };
  }
  return { ok: true };
}

function isAdminAuthorized(req: VercelRequest): boolean {
  return verifyAdminAuth(req).ok;
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function getQueryString(req: VercelRequest, key: string): string {
  const val = req.query?.[key];
  if (typeof val === 'string') return val.trim();
  if (Array.isArray(val) && val[0]) return val[0].trim();
  return '';
}

async function callSupabaseRpc<T>(
  rpcName: string,
  body: Record<string, unknown>,
  urlOverride?: string,
  keyOverride?: string
): Promise<T> {
  const url = urlOverride ?? process.env.SUPABASE_URL?.trim();
  const key = keyOverride ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('SERVER_UNCONFIGURED');
  }
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

// ============================================================================
// 1. Admin Vouchers (/api/admin/vouchers)
// ============================================================================

function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

interface CohortRow {
  cohort_code?: string;
  display_name?: string;
  device_id?: string;
  weekly_xp?: number;
  total_xp?: number;
  streak_days?: number;
  completed_lessons?: number;
  updated_at?: string;
}

function buildCohortCsv(rows: CohortRow[]): string {
  const headers = [
    'cohort_code',
    'display_name',
    'device_id',
    'weekly_xp',
    'total_xp',
    'streak_days',
    'completed_lessons',
    'updated_at',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        escapeCsvCell(row.cohort_code),
        escapeCsvCell(row.display_name),
        escapeCsvCell(row.device_id),
        escapeCsvCell(row.weekly_xp ?? 0),
        escapeCsvCell(row.total_xp ?? 0),
        escapeCsvCell(row.streak_days ?? 0),
        escapeCsvCell(row.completed_lessons ?? 0),
        escapeCsvCell(row.updated_at),
      ].join(',')
    );
  }
  return lines.join('\n');
}

async function handleAdminVouchers(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAdminAuth(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ ok: false, error: auth.error });
  }

  try {
    if (req.method === 'GET') {
      const orgSlug = getQueryString(req, 'orgSlug') || null;
      const format = (getQueryString(req, 'format') || 'json').toLowerCase();

      const result = await callSupabaseRpc<{
        ok?: boolean;
        organizations?: unknown[];
        vouchers?: unknown[];
        active_seats?: unknown[];
        cohort_progress?: CohortRow[];
        fetched_at?: string;
        error?: string;
      }>('admin_list_seats', {
        p_org_slug: orgSlug,
        p_limit: 200,
      });

      if (!result?.ok) {
        return res.status(500).json({ ok: false, error: result?.error || 'LIST_FAILED' });
      }

      if (format === 'csv') {
        const csv = buildCohortCsv(Array.isArray(result.cohort_progress) ? result.cohort_progress : []);
        const filename = orgSlug ? `cohort-progress-${orgSlug.replace(/[^a-z0-9-]/gi, '')}.csv` : 'cohort-progress.csv';
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csv);
      }

      return res.status(200).json({
        ok: true,
        organizations: result.organizations ?? [],
        vouchers: result.vouchers ?? [],
        activeSeats: result.active_seats ?? [],
        cohortProgress: result.cohort_progress ?? [],
        fetchedAt: result.fetched_at ?? new Date().toISOString(),
      });
    }

    if (req.method === 'POST') {
      const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
      const action = typeof body.action === 'string' ? body.action.trim().toLowerCase() : 'generate';

      if (action === 'revoke') {
        const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
        if (!code || code.length < 4 || code.length > 32) {
          return res.status(400).json({ ok: false, error: 'INVALID_CODE' });
        }
        const revoked = await callSupabaseRpc<{ ok?: boolean; code?: string; revoked_at?: string; error?: string }>(
          'admin_revoke_voucher',
          { p_code: code }
        );
        if (!revoked?.ok) {
          return res.status(revoked?.error === 'NOT_FOUND' ? 404 : 400).json({
            ok: false,
            error: revoked?.error || 'REVOKE_FAILED',
          });
        }
        return res.status(200).json({
          ok: true,
          code: revoked.code,
          revokedAt: revoked.revoked_at,
        });
      }

      if (action === 'generate') {
        const plan = typeof body.plan === 'string' ? (body.plan.trim().toLowerCase() as VoucherPlan) : 'monthly';
        if (!VALID_PLANS.has(plan)) {
          return res.status(400).json({ ok: false, error: 'INVALID_PLAN' });
        }
        const rawCount = Number(body.count ?? 1);
        const count = Number.isFinite(rawCount) ? Math.max(1, Math.min(50, Math.floor(rawCount))) : 1;
        const rawMaxRedemptions = Number(body.maxRedemptions ?? 1);
        const maxRedemptions = Number.isFinite(rawMaxRedemptions)
          ? Math.max(1, Math.min(1000, Math.floor(rawMaxRedemptions)))
          : 1;
        const orgSlug = typeof body.orgSlug === 'string' && body.orgSlug.trim() ? body.orgSlug.trim().toLowerCase() : null;
        const cohortCode =
          typeof body.cohortCode === 'string' && body.cohortCode.trim() ? body.cohortCode.trim().toUpperCase() : null;
        const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 80) : null;

        let validUntil: string | null = null;
        if (typeof body.validUntil === 'string' && body.validUntil.trim()) {
          const parsed = Date.parse(body.validUntil.trim());
          if (Number.isNaN(parsed) || parsed <= Date.now()) {
            return res.status(400).json({ ok: false, error: 'INVALID_VALID_UNTIL' });
          }
          validUntil = new Date(parsed).toISOString();
        } else if (plan === 'trial') {
          return res.status(400).json({ ok: false, error: 'TRIAL_REQUIRES_VALID_UNTIL' });
        }

        const generated = await callSupabaseRpc<{ ok?: boolean; count?: number; codes?: unknown[]; error?: string }>(
          'admin_generate_vouchers',
          {
            p_plan: plan,
            p_count: count,
            p_org_slug: orgSlug,
            p_cohort_code: cohortCode,
            p_label: label,
            p_valid_until: validUntil,
            p_max_redemptions: maxRedemptions,
          }
        );

        if (!generated?.ok) {
          return res.status(400).json({ ok: false, error: generated?.error || 'GENERATE_FAILED' });
        }

        return res.status(200).json({
          ok: true,
          count: generated.count ?? count,
          codes: generated.codes ?? [],
        });
      }

      return res.status(400).json({ ok: false, error: 'INVALID_ACTION' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR';
    const status = message === 'SERVER_UNCONFIGURED' ? 503 : 500;
    return res.status(status).json({ ok: false, error: message });
  }
}

// ============================================================================
// 2. Cloud Backup (/api/backup/sync & /api/backup/restore)
// ============================================================================

const syncMemoryHits = new Map<string, { count: number; resetAt: number }>();
const restoreMemoryHits = new Map<string, { count: number; resetAt: number }>();
let syncUpstashLimiter: Ratelimit | null = null;
let restoreUpstashLimiter: Ratelimit | null = null;

function getBackupUpstashLimiter(kind: 'sync' | 'restore'): Ratelimit | null {
  const existing = kind === 'sync' ? syncUpstashLimiter : restoreUpstashLimiter;
  if (existing) return existing;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter:
      kind === 'sync'
        ? Ratelimit.slidingWindow(10, '10 m')
        : Ratelimit.slidingWindow(5, '15 m'),
    prefix: kind === 'sync' ? 'tb:backup:sync' : 'tb:backup:restore',
  });
  if (kind === 'sync') syncUpstashLimiter = limiter;
  else restoreUpstashLimiter = limiter;
  return limiter;
}

async function checkBackupRateLimit(
  kind: 'sync' | 'restore',
  key: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const limiter = getBackupUpstashLimiter(kind);
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
  const windowMs = kind === 'sync' ? 10 * 60 * 1000 : 15 * 60 * 1000;
  const maxHits = kind === 'sync' ? 10 : 5;
  const store = kind === 'sync' ? syncMemoryHits : restoreMemoryHits;
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (current.count >= maxHits) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { allowed: true };
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

async function handleBackupSync(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const ip = getClientIp(req);
  const limit = await checkBackupRateLimit('sync', `sync:${ip}`);
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
  if (serializedBytes > MAX_BACKUP_PAYLOAD_BYTES) {
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

async function handleBackupRestore(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const recoveryCode = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim().toUpperCase() : '';
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  const newDeviceId = typeof body.newDeviceId === 'string' ? body.newDeviceId.trim() : '';

  const ip = getClientIp(req);
  const limit = await checkBackupRateLimit('restore', `restore:${ip}:${recoveryCode || 'any'}`);
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
    }>('get_cloud_backup', { p_recovery_code: recoveryCode }, url, key);

    if (!backup?.ok || !backup.pin_hash || !backup.device_id) {
      return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });
    }

    if (!verifyPin(pin, backup.pin_hash)) {
      return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });
    }

    const restoredEnt = await callSupabaseRpc<{
      ok?: boolean;
      tier?: string;
      cohort_code?: string | null;
      label?: string | null;
      activated_at?: string | null;
      expires_at?: string | null;
    }>('restore_entitlement_to_device', {
      p_old_device_id: backup.device_id,
      p_new_device_id: newDeviceId,
    }, url, key);

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

// ============================================================================
// 3. Certificates (/api/certificates/issue & /api/certificates/verify)
// ============================================================================

async function handleCertificateIssue(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'SERVER_UNCONFIGURED' });
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  let authorized = isAdminAuthorized(req);

  if (!authorized) {
    const teacherDeviceId = typeof body.teacherDeviceId === 'string' ? body.teacherDeviceId.trim() : '';
    if (teacherDeviceId.length >= 8 && teacherDeviceId.length <= 128) {
      try {
        const ent = await callSupabaseRpc<{ ok?: boolean; tier?: string }>(
          'get_device_entitlement',
          { p_device_id: teacherDeviceId },
          url,
          key
        );
        if (ent?.ok && ent.tier === 'academy_teacher') {
          authorized = true;
        }
      } catch {
        // Fall through to 401
      }
    }
  }

  if (!authorized) {
    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
  }

  const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
  const trackTitle = typeof body.trackTitle === 'string' ? body.trackTitle.trim() : '';
  const orgSlug = typeof body.orgSlug === 'string' && body.orgSlug.trim() ? body.orgSlug.trim().toLowerCase() : null;

  if (studentName.length < 2 || studentName.length > 120) {
    return res.status(400).json({ ok: false, error: 'INVALID_STUDENT_NAME' });
  }
  if (trackTitle.length < 2 || trackTitle.length > 160) {
    return res.status(400).json({ ok: false, error: 'INVALID_TRACK_TITLE' });
  }

  try {
    const issued = await callSupabaseRpc<{
      ok?: boolean;
      certificate?: Record<string, unknown>;
      error?: string;
    }>('issue_certificate', {
      p_student_name: studentName,
      p_track_title: trackTitle,
      p_org_slug: orgSlug,
    }, url, key);

    if (!issued?.ok || !issued.certificate) {
      return res.status(400).json({ ok: false, error: issued?.error || 'ISSUE_FAILED' });
    }

    return res.status(200).json({
      ok: true,
      certificate: issued.certificate,
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
}

async function handleCertificateVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const rawCode = getQueryString(req, 'code').toUpperCase();
  if (!CERT_CODE_REGEX.test(rawCode)) {
    return res.status(400).json({ ok: false, error: 'INVALID_FORMAT' });
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'SERVER_UNCONFIGURED' });
  }

  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/verify_certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_cert_code: rawCode }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: 'VERIFY_FAILED' });
    }

    const data = (await response.json()) as {
      ok?: boolean;
      valid?: boolean;
      certificate?: Record<string, unknown>;
      error?: string;
    };

    if (!data?.ok) {
      const status = data?.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(status).json({ ok: false, error: data?.error || 'NOT_FOUND' });
    }

    return res.status(200).json({
      ok: true,
      valid: Boolean(data.valid),
      certificate: data.certificate,
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
}

// ============================================================================
// 4. Diagnostic Error Reporter (/api/report-error)
// ============================================================================

interface IncomingErrorEntry {
  source?: unknown;
  message?: unknown;
  stack?: unknown;
  route?: unknown;
  timestamp?: unknown;
}

interface IncomingReportBody {
  appVersion?: unknown;
  platform?: unknown;
  viewportWidth?: unknown;
  route?: unknown;
  theme?: unknown;
  perfMode?: unknown;
  errors?: unknown;
}

const reportMemoryBuckets = new Map<string, number[]>();
let cachedReportRatelimit: Ratelimit | null | undefined;

function getReportUpstashRatelimit(): Ratelimit | null {
  if (cachedReportRatelimit !== undefined) return cachedReportRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cachedReportRatelimit = null;
    return null;
  }
  try {
    const redis = new Redis({ url, token });
    cachedReportRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(REPORT_RATE_LIMIT_MAX, '15 m'),
      prefix: 'tb:ratelimit:report-error',
    });
  } catch {
    cachedReportRatelimit = null;
  }
  return cachedReportRatelimit;
}

async function isWithinReportRateLimit(ip: string): Promise<boolean> {
  const limiter = getReportUpstashRatelimit();
  if (limiter) {
    try {
      const result = await limiter.limit(ip);
      return result.success;
    } catch {
      // Fallback below
    }
  }
  const now = Date.now();
  const cutoff = now - REPORT_RATE_LIMIT_WINDOW_MS;
  const recent = (reportMemoryBuckets.get(ip) || []).filter((ts) => ts > cutoff);
  if (recent.length >= REPORT_RATE_LIMIT_MAX) {
    reportMemoryBuckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  reportMemoryBuckets.set(ip, recent);
  return true;
}

function scrubText(input: unknown, maxLen: number): string {
  const raw = typeof input === 'string' ? input : input == null ? '' : String(input);
  let clean = raw
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/[^\s"'`]+/gi, '[REDACTED_WEBHOOK]')
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{5,}/g, '[REDACTED_JWT]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_KEY]')
    .replace(/\b(?:sk|pk|rk|ghp|gho|xox[baprs])_[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_TOKEN]')
    .replace(/([?&](?:token|key|api_key|apikey|secret|password|pin|auth|code|email)=)[^&\s"'`]+/gi, '$1[REDACTED]')
    .replace(
      /(\b(?:pin|password|passwd|secret|token|apikey|api_key|authorization|recoveryCode|recovery_code|voucher)\b\s*[:=]\s*["']?)[^\s"',;}\]]+/gi,
      '$1[REDACTED]'
    )
    .replace(/```/g, "'''")
    .trim();

  if (clean.length > maxLen) {
    clean = `${clean.slice(0, Math.max(0, maxLen - 1))}…`;
  }
  return clean;
}

async function handleReportError(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const clientIp = getClientIp(req);
  const allowed = await isWithinReportRateLimit(clientIp);
  if (!allowed) {
    return res.status(429).json({ ok: false, error: 'RATE_LIMITED' });
  }

  const body = req.body as IncomingReportBody | undefined;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PAYLOAD' });
  }

  const rawSize = Buffer.byteLength(JSON.stringify(body), 'utf8');
  if (rawSize > MAX_REPORT_PAYLOAD_BYTES) {
    return res.status(413).json({ ok: false, error: 'PAYLOAD_TOO_LARGE' });
  }

  if (!Array.isArray(body.errors) || body.errors.length === 0 || body.errors.length > MAX_ERRORS_PER_REPORT) {
    return res.status(400).json({ ok: false, error: 'INVALID_ERRORS_ARRAY' });
  }

  const sanitizedErrors = (body.errors as IncomingErrorEntry[]).slice(0, MAX_ERRORS_PER_REPORT).map((err) => ({
    source: scrubText(err?.source || 'unknown', 32),
    message: scrubText(err?.message || 'Unknown error', 240),
    stack: scrubText(err?.stack || '', 750),
    route: scrubText(err?.route || '/', 100),
    timestamp: scrubText(err?.timestamp || new Date().toISOString(), 40),
  }));

  const appVersion = scrubText(body.appVersion || '8.0.0', 24) || '8.0.0';
  const platform = scrubText(body.platform || 'web', 32) || 'web';
  const viewportWidth =
    typeof body.viewportWidth === 'number' && Number.isFinite(body.viewportWidth)
      ? Math.max(0, Math.min(10000, Math.round(body.viewportWidth)))
      : 0;
  const route = scrubText(body.route || sanitizedErrors[sanitizedErrors.length - 1]?.route || '/', 100) || '/';
  const theme = scrubText(body.theme || 'default', 32) || 'default';
  const perfMode = scrubText(body.perfMode || 'unknown', 24) || 'unknown';

  const latestError = sanitizedErrors[sanitizedErrors.length - 1];
  const isManualOnly = sanitizedErrors.every((e) => e.source === 'manual');

  const summaryLines = sanitizedErrors
    .slice(-5)
    .map((e, idx) => `${idx + 1}. [${e.source}] ${e.message}`)
    .join('\n');

  const stackSnippet = latestError?.stack ? `\`\`\`\n${latestError.stack.slice(0, 850)}\n\`\`\`` : '_No stack trace_';

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return res.status(200).json({ ok: true, forwarded: false, reason: 'WEBHOOK_NOT_CONFIGURED' });
  }

  const isDiscordWebhook = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(
    webhookUrl
  );
  if (!isDiscordWebhook) {
    return res.status(200).json({ ok: true, forwarded: false, reason: 'INVALID_WEBHOOK_CONFIG' });
  }

  const embed = {
    title: isManualOnly
      ? `🩺 Thinking Bridge v${appVersion} — Diagnostic Log`
      : `🚨 Thinking Bridge v${appVersion} — Error Report`,
    color: isManualOnly ? 0x14b8a6 : 0xef4444,
    fields: [
      { name: 'Version', value: `\`${appVersion}\``, inline: true },
      { name: 'Platform / Viewport', value: `${platform} · ${viewportWidth}px`, inline: true },
      { name: 'Route', value: `\`${route}\``, inline: true },
      { name: 'Theme / Perf', value: `${theme} / ${perfMode}`, inline: true },
      { name: `Error Summary (${sanitizedErrors.length})`, value: summaryLines.slice(0, 1000) || 'No summary', inline: false },
      { name: 'Stack Snippet', value: stackSnippet.slice(0, 1000), inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'Arabic-English Thinking Bridge · Zero-PII User-Approved Diagnostic' },
  };

  try {
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Thinking Bridge Diagnostics',
        embeds: [embed],
      }),
    });
    if (!discordRes.ok) {
      return res.status(502).json({ ok: false, error: 'UPSTREAM_WEBHOOK_FAILED' });
    }
    return res.status(200).json({ ok: true, forwarded: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'UPSTREAM_NETWORK_ERROR' });
  }
}

// ============================================================================
// Unified Router
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const route = getQueryString(req, '__route').toLowerCase();
  const action = getQueryString(req, 'action').toLowerCase();

  if (route === 'admin/vouchers') return handleAdminVouchers(req, res);
  if (route === 'report-error') return handleReportError(req, res);
  if (route === 'backup') {
    if (action === 'sync') return handleBackupSync(req, res);
    if (action === 'restore') return handleBackupRestore(req, res);
  }
  if (route === 'certificates') {
    if (action === 'issue') return handleCertificateIssue(req, res);
    if (action === 'verify') return handleCertificateVerify(req, res);
  }

  return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
}
