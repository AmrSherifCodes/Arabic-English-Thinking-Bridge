import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Same-origin Vercel API Proxy for checking a device's active entitlement status.
 * Endpoint: GET /api/entitlements/status?deviceId=...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

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
