import type { VercelRequest, VercelResponse } from '@vercel/node';

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

/**
 * Same-origin Vercel API Proxy for fetching an Academy teacher's cohort roster.
 * Endpoint: GET /api/entitlements/cohort-roster?deviceId=...
 * Verifies academy_teacher entitlement via service_role RPC and preserves strict CSP.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

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
