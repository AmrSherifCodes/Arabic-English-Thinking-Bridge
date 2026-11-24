import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

async function callSupabaseRpc<T>(rpcName: string, body: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
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

function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  // Neutralize spreadsheet formula injection
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const auth = verifyAdminAuth(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ ok: false, error: auth.error });
  }

  try {
    if (req.method === 'GET') {
      const orgSlug = typeof req.query.orgSlug === 'string' && req.query.orgSlug.trim() ? req.query.orgSlug.trim() : null;
      const format = typeof req.query.format === 'string' ? req.query.format.trim().toLowerCase() : 'json';

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
