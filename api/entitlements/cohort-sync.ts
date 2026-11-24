import type { VercelRequest, VercelResponse } from '@vercel/node';

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

/**
 * Same-origin Vercel API Proxy for opt-in Academy student cohort progress sync.
 * Endpoint: POST /api/entitlements/cohort-sync
 * Verifies academy_student entitlement via service_role RPC and preserves strict CSP.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

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
